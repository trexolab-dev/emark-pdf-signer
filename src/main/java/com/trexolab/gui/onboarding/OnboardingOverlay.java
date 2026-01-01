package com.trexolab.gui.onboarding;


import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Area;
import java.awt.geom.RoundRectangle2D;
import java.util.ArrayList;
import java.util.List;
import java.util.prefs.Preferences;

/**
 * Driver.js-style onboarding overlay that highlights UI elements
 * with spotlight effect and step-by-step tooltips.
 */
public class OnboardingOverlay extends JComponent {
    private static final String PREF_ONBOARDING_SHOWN = "onboarding.completed.v2";
    private static final Preferences prefs = Preferences.userNodeForPackage(OnboardingOverlay.class);

    private final JFrame parentFrame;
    private final List<OnboardingStep> steps;
    private int currentStepIndex = 0;
    private Component highlightedComponent;
    private Rectangle highlightBounds;
    private TooltipPanel tooltipPanel;
    private Runnable onComplete;
    private Runnable onStepChange;

    // Animation
    private float overlayOpacity = 0f;
    private Timer fadeInTimer;

    // For dialog support
    private JRootPane dialogRootPane;

    /**
     * Represents a single onboarding step.
     */
    public static class OnboardingStep {
        public final Component target;
        public final String title;
        public final String description;
        public final TooltipPosition position;
        public final Runnable beforeShow;

        public OnboardingStep(Component target, String title, String description, TooltipPosition position) {
            this(target, title, description, position, null);
        }

        public OnboardingStep(Component target, String title, String description, TooltipPosition position, Runnable beforeShow) {
            this.target = target;
            this.title = title;
            this.description = description;
            this.position = position;
            this.beforeShow = beforeShow;
        }
    }

    public enum TooltipPosition {
        TOP, BOTTOM, LEFT, RIGHT
    }

    public OnboardingOverlay(JFrame parentFrame) {
        this.parentFrame = parentFrame;
        this.steps = new ArrayList<>();
        setOpaque(false);
        setLayout(null);

        // Create tooltip panel
        tooltipPanel = new TooltipPanel();
        add(tooltipPanel);

        // Handle click to advance or close
        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                // Click on overlay - do nothing, user must use buttons
            }
        });

        // Block all mouse events on overlay
        addMouseMotionListener(new MouseMotionAdapter() {});
    }

    /**
     * Adds a step to the onboarding tour.
     */
    public void addStep(Component target, String title, String description, TooltipPosition position) {
        steps.add(new OnboardingStep(target, title, description, position));
    }

    /**
     * Adds a step with a callback to run before showing (e.g., to switch tabs).
     */
    public void addStep(Component target, String title, String description, TooltipPosition position, Runnable beforeShow) {
        steps.add(new OnboardingStep(target, title, description, position, beforeShow));
    }

    /**
     * Sets the callback when onboarding completes.
     */
    public void setOnComplete(Runnable onComplete) {
        this.onComplete = onComplete;
    }

    /**
     * Sets a callback for step changes.
     */
    public void setOnStepChange(Runnable onStepChange) {
        this.onStepChange = onStepChange;
    }

    /**
     * Sets the dialog root pane for dialog-based onboarding.
     */
    public void setDialogRootPane(JRootPane rootPane) {
        this.dialogRootPane = rootPane;
    }

    /**
     * Starts the onboarding tour.
     */
    public void start() {
        if (steps.isEmpty()) return;

        currentStepIndex = 0;

        // Add overlay to glass pane
        JRootPane rootPane = parentFrame.getRootPane();
        JPanel glassPane = new JPanel(null);
        glassPane.setOpaque(false);
        glassPane.add(this);
        setBounds(0, 0, rootPane.getWidth(), rootPane.getHeight());
        rootPane.setGlassPane(glassPane);
        glassPane.setVisible(true);

        // Handle resize
        parentFrame.addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                setBounds(0, 0, parentFrame.getRootPane().getWidth(), parentFrame.getRootPane().getHeight());
                if (currentStepIndex < steps.size()) {
                    showStep(currentStepIndex);
                }
            }
        });

        // Fade in animation
        overlayOpacity = 0f;
        fadeInTimer = new Timer(16, e -> {
            overlayOpacity += 0.1f;
            if (overlayOpacity >= 1f) {
                overlayOpacity = 1f;
                fadeInTimer.stop();
            }
            repaint();
        });
        fadeInTimer.start();

        showStep(0);
    }

    /**
     * Shows a specific step.
     */
    protected void showStep(int index) {
        if (index < 0 || index >= steps.size()) return;

        currentStepIndex = index;
        OnboardingStep step = steps.get(index);

        // Run beforeShow callback if present (e.g., switch tabs)
        if (step.beforeShow != null) {
            step.beforeShow.run();
        }

        highlightedComponent = step.target;

        // Calculate highlight bounds relative to overlay
        SwingUtilities.invokeLater(() -> {
            if (highlightedComponent != null && highlightedComponent.isShowing()) {
                try {
                    Point compLocation = highlightedComponent.getLocationOnScreen();
                    Point overlayLocation = getLocationOnScreen();
                    highlightBounds = new Rectangle(
                        compLocation.x - overlayLocation.x - 8,
                        compLocation.y - overlayLocation.y - 8,
                        highlightedComponent.getWidth() + 16,
                        highlightedComponent.getHeight() + 16
                    );
                } catch (Exception e) {
                    // Fallback if component location can't be determined
                    highlightBounds = new Rectangle(getWidth() / 2 - 100, getHeight() / 2 - 50, 200, 100);
                }
            } else {
                // Fallback: center of screen
                highlightBounds = new Rectangle(getWidth() / 2 - 100, getHeight() / 2 - 50, 200, 100);
            }

            // Update tooltip
            tooltipPanel.setStep(step.title, step.description, index + 1, steps.size());
            positionTooltip(step.position);

            if (onStepChange != null) {
                onStepChange.run();
            }

            repaint();
        });
    }

    /**
     * Positions the tooltip relative to the highlighted element.
     */
    private void positionTooltip(TooltipPosition position) {
        Dimension tooltipSize = tooltipPanel.getPreferredSize();
        int padding = 15;
        int x, y;

        switch (position) {
            case TOP:
                x = highlightBounds.x + (highlightBounds.width - tooltipSize.width) / 2;
                y = highlightBounds.y - tooltipSize.height - padding;
                break;
            case BOTTOM:
                x = highlightBounds.x + (highlightBounds.width - tooltipSize.width) / 2;
                y = highlightBounds.y + highlightBounds.height + padding;
                break;
            case LEFT:
                x = highlightBounds.x - tooltipSize.width - padding;
                y = highlightBounds.y + (highlightBounds.height - tooltipSize.height) / 2;
                break;
            case RIGHT:
            default:
                x = highlightBounds.x + highlightBounds.width + padding;
                y = highlightBounds.y + (highlightBounds.height - tooltipSize.height) / 2;
                break;
        }

        // Keep tooltip within bounds with more margin
        int margin = 20;
        x = Math.max(margin, Math.min(x, getWidth() - tooltipSize.width - margin));
        y = Math.max(margin, Math.min(y, getHeight() - tooltipSize.height - margin));

        tooltipPanel.setBounds(x, y, tooltipSize.width, tooltipSize.height);
    }

    /**
     * Advances to the next step.
     */
    public void nextStep() {
        if (currentStepIndex < steps.size() - 1) {
            showStep(currentStepIndex + 1);
        } else {
            complete();
        }
    }

    /**
     * Goes back to the previous step.
     */
    public void previousStep() {
        if (currentStepIndex > 0) {
            showStep(currentStepIndex - 1);
        }
    }

    /**
     * Completes/skips the onboarding.
     */
    public void complete() {
        prefs.putBoolean(PREF_ONBOARDING_SHOWN, true);

        // Get the correct root pane (dialog or frame)
        JRootPane rootPane = dialogRootPane != null ? dialogRootPane : parentFrame.getRootPane();

        // Fade out and remove
        Timer fadeOutTimer = new Timer(16, null);
        fadeOutTimer.addActionListener(e -> {
            overlayOpacity -= 0.15f;
            if (overlayOpacity <= 0f) {
                overlayOpacity = 0f;
                fadeOutTimer.stop();
                rootPane.getGlassPane().setVisible(false);
                if (onComplete != null) {
                    onComplete.run();
                }
            }
            repaint();
        });
        fadeOutTimer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Draw semi-transparent overlay with spotlight cutout
        int alpha = (int) (180 * overlayOpacity);
        g2.setColor(new Color(0, 0, 0, alpha));

        // Create spotlight effect using Area subtraction
        Area overlay = new Area(new Rectangle(0, 0, getWidth(), getHeight()));
        if (highlightBounds != null) {
            // Create rounded rectangle for spotlight
            RoundRectangle2D spotlight = new RoundRectangle2D.Float(
                highlightBounds.x, highlightBounds.y,
                highlightBounds.width, highlightBounds.height,
                12, 12
            );
            overlay.subtract(new Area(spotlight));
        }
        g2.fill(overlay);

        // Draw highlight border with glow effect
        if (highlightBounds != null && overlayOpacity > 0.5f) {
            // Outer glow
            g2.setColor(new Color(66, 133, 244, (int)(100 * overlayOpacity)));
            g2.setStroke(new BasicStroke(6));
            g2.draw(new RoundRectangle2D.Float(
                highlightBounds.x, highlightBounds.y,
                highlightBounds.width, highlightBounds.height,
                12, 12
            ));

            // Inner border
            g2.setColor(new Color(66, 133, 244, (int)(255 * overlayOpacity)));
            g2.setStroke(new BasicStroke(2));
            g2.draw(new RoundRectangle2D.Float(
                highlightBounds.x, highlightBounds.y,
                highlightBounds.width, highlightBounds.height,
                12, 12
            ));
        }

        g2.dispose();
    }

    /**
     * Checks if onboarding should be shown.
     */
    public static boolean shouldShowOnboarding() {
        return !prefs.getBoolean(PREF_ONBOARDING_SHOWN, false);
    }

    /**
     * Resets onboarding state (for testing).
     */
    public static void resetOnboarding() {
        prefs.putBoolean(PREF_ONBOARDING_SHOWN, false);
    }

    // -------------------- Protected methods for subclass extensions --------------------

    /**
     * Returns the list of steps (for subclasses).
     */
    protected List<OnboardingStep> getSteps() {
        return steps;
    }

    /**
     * Returns current step index (for subclasses).
     */
    protected int getCurrentStepIndex() {
        return currentStepIndex;
    }

    /**
     * Starts the fade-in animation (for subclasses).
     */
    protected void startFadeIn() {
        overlayOpacity = 0f;
        fadeInTimer = new Timer(16, e -> {
            overlayOpacity += 0.1f;
            if (overlayOpacity >= 1f) {
                overlayOpacity = 1f;
                fadeInTimer.stop();
            }
            repaint();
        });
        fadeInTimer.start();
    }

    /**
     * Shows the first step (for subclasses).
     */
    protected void showFirstStep() {
        showStep(0);
    }

    /**
     * Refreshes the current step (for subclasses).
     */
    protected void refreshCurrentStep() {
        showStep(currentStepIndex);
    }

    /**
     * Gets the parent frame.
     */
    protected JFrame getParentFrame() {
        return parentFrame;
    }

    /**
     * Tooltip panel that displays step information.
     */
    private class TooltipPanel extends JPanel {
        private static final int TOOLTIP_WIDTH = 380;

        private final JLabel titleLabel;
        private final JTextArea descArea;
        private final JLabel stepLabel;
        private final JButton prevBtn;
        private final JButton nextBtn;
        private final JButton skipBtn;

        public TooltipPanel() {
            setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
            setBackground(new Color(35, 39, 48));
            setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(66, 133, 244), 2),
                BorderFactory.createEmptyBorder(18, 22, 18, 22)
            ));

            // Title panel
            JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
            titlePanel.setOpaque(false);
            titlePanel.setAlignmentX(LEFT_ALIGNMENT);

            titleLabel = new JLabel();
            titleLabel.setFont(new Font("SansSerif", Font.BOLD, 16));
            titleLabel.setForeground(Color.WHITE);
            titlePanel.add(titleLabel);

            // Description area
            descArea = new JTextArea();
            descArea.setFont(new Font("SansSerif", Font.PLAIN, 13));
            descArea.setForeground(new Color(200, 205, 215));
            descArea.setBackground(new Color(35, 39, 48));
            descArea.setLineWrap(true);
            descArea.setWrapStyleWord(true);
            descArea.setEditable(false);
            descArea.setFocusable(false);
            descArea.setBorder(BorderFactory.createEmptyBorder(10, 0, 15, 0));
            descArea.setAlignmentX(LEFT_ALIGNMENT);
            descArea.setMaximumSize(new Dimension(TOOLTIP_WIDTH - 44, Integer.MAX_VALUE));

            // Bottom panel with step indicator and buttons in a single row
            JPanel bottomPanel = new JPanel();
            bottomPanel.setLayout(new BoxLayout(bottomPanel, BoxLayout.X_AXIS));
            bottomPanel.setOpaque(false);
            bottomPanel.setAlignmentX(LEFT_ALIGNMENT);
            bottomPanel.setMaximumSize(new Dimension(TOOLTIP_WIDTH - 44, 40));

            // Step indicator
            stepLabel = new JLabel();
            stepLabel.setFont(new Font("SansSerif", Font.PLAIN, 12));
            stepLabel.setForeground(new Color(150, 155, 165));

            // Create buttons
            skipBtn = createButton("Skip", false);
            skipBtn.addActionListener(e -> complete());

            prevBtn = createButton("Previous", false);
            prevBtn.addActionListener(e -> previousStep());

            nextBtn = createButton("Next", true);
            nextBtn.addActionListener(e -> nextStep());

            // Add components to bottom panel
            bottomPanel.add(stepLabel);
            bottomPanel.add(Box.createHorizontalGlue()); // Push buttons to the right
            bottomPanel.add(skipBtn);
            bottomPanel.add(Box.createHorizontalStrut(8));
            bottomPanel.add(prevBtn);
            bottomPanel.add(Box.createHorizontalStrut(8));
            bottomPanel.add(nextBtn);

            // Add all to main panel
            add(titlePanel);
            add(descArea);
            add(bottomPanel);
        }

        private JButton createButton(String text, boolean isPrimary) {
            JButton btn = new JButton(text);
            btn.setFont(new Font("SansSerif", Font.PLAIN, 12));
            btn.setFocusPainted(false);
            btn.setBorderPainted(false);
            btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

            Dimension btnSize = new Dimension(85, 30);
            btn.setPreferredSize(btnSize);
            btn.setMinimumSize(btnSize);
            btn.setMaximumSize(btnSize);

            if (isPrimary) {
                btn.setBackground(new Color(66, 133, 244));
                btn.setForeground(Color.WHITE);
            } else {
                btn.setBackground(new Color(55, 60, 70));
                btn.setForeground(new Color(200, 205, 215));
            }

            return btn;
        }

        public void setStep(String title, String description, int current, int total) {
            titleLabel.setText(title);
            descArea.setText(description);
            stepLabel.setText("Step " + current + " of " + total);

            prevBtn.setVisible(current > 1);
            nextBtn.setText(current == total ? "Finish" : "Next");

            revalidate();
            repaint();
        }

        @Override
        public Dimension getPreferredSize() {
            // Calculate height based on description text length
            int descLength = descArea.getText().length();
            int lines = Math.max(2, (int) Math.ceil(descLength / 45.0));
            int descHeight = lines * 18;

            int height = 18 + 28 + descHeight + 15 + 30 + 36; // padding + title + desc + gap + buttons + padding
            return new Dimension(TOOLTIP_WIDTH, Math.min(height, 220));
        }
    }
}
