package com.trexolab.gui.pdfHandler;

import com.trexolab.service.RecentFilesManager;
import com.trexolab.service.VersionManager;
import com.formdev.flatlaf.ui.FlatUIUtils;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.io.File;
import java.util.List;
import java.util.function.Consumer;

/**
 * Top bar panel with:
 * - Open PDF button
 * - Settings button
 * - Begin/Cancel Sign button
 * - Page info label
 * - Version status label (auto-check on startup, hides if up-to-date)
 */
public class TopBarPanel extends JPanel {
    private static final String OPEN_PDF_TEXT = "Open PDF";
    private static final String BEGIN_SIGN_TEXT = "Begin Sign";
    private static final String CANCEL_SIGN_TEXT = "Cancel Signing (ESC)";
    private static final String CERTIFIED_TEXT = "\ud83d\udd0f Certified";

    private final JButton openBtn;
    private final JButton recentBtn;
    private final JButton signBtn;
    private final JButton settingsBtn;
    private final JLabel pageInfoLabel;
    private final JTextField pageInputField;
    private final JLabel totalPagesLabel;
    private final JLabel versionStatusLabel;
    private final JPanel centerPanel;

    private boolean signMode = false;
    private boolean isCertified = false;
    private int totalPages = 0;
    private Consumer<File> onOpenFile;
    private Consumer<Integer> onGoToPage;

    public TopBarPanel(Runnable onOpen, Runnable onSettings, Runnable onToggleSign) {
        super(new BorderLayout());
        setBorder(new EmptyBorder(12, 15, 12, 15));
        setBackground(FlatUIUtils.getUIColor("Panel.background", Color.WHITE));

        // Add subtle bottom border for visual separation
        setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(0, 0, 0, 20)),
                new EmptyBorder(12, 15, 12, 15)
        ));

        // -------------------- Buttons --------------------
        openBtn = UiFactory.createButton(OPEN_PDF_TEXT, new Color(0x007BFF));
        openBtn.addActionListener(e -> onOpen.run());

        // Recent files dropdown button
        recentBtn = new JButton("\u25BC");
        recentBtn.setFont(new Font("SansSerif", Font.PLAIN, 10));
        recentBtn.setPreferredSize(new Dimension(24, 32));
        recentBtn.setToolTipText("Recent Files");
        recentBtn.addActionListener(e -> showRecentFilesMenu());

        signBtn = UiFactory.createButton(BEGIN_SIGN_TEXT, new Color(0x28A745));
        signBtn.setVisible(false);
        signBtn.addActionListener(e -> {
            signMode = !signMode;
            updateSignButtonText();
            onToggleSign.run();
        });

        settingsBtn = UiFactory.createButton("Settings", new Color(0x6C757D));
        settingsBtn.addActionListener(e -> onSettings.run());

        // -------------------- Version Status Label --------------------
        versionStatusLabel = new JLabel("Checking for updates...");
        versionStatusLabel.setFont(new Font("SansSerif", Font.PLAIN, 13));
        versionStatusLabel.setForeground(Color.LIGHT_GRAY);
        versionStatusLabel.setCursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));

        pageInfoLabel = new JLabel("");
        pageInfoLabel.setFont(new Font("SansSerif", Font.PLAIN, 14));
        pageInfoLabel.setVisible(false); // Hidden - using page input instead

        // -------------------- Page Navigation --------------------
        pageInputField = new JTextField(3);
        pageInputField.setHorizontalAlignment(JTextField.CENTER);
        pageInputField.setFont(new Font("SansSerif", Font.PLAIN, 13));
        pageInputField.setPreferredSize(new Dimension(45, 28));
        pageInputField.setToolTipText("Enter page number");
        pageInputField.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER) {
                    goToEnteredPage();
                }
            }
        });

        totalPagesLabel = new JLabel("/ 0");
        totalPagesLabel.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JPanel pageNavPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 3, 0));
        pageNavPanel.setOpaque(false);
        pageNavPanel.add(new JLabel("Page "));
        pageNavPanel.add(pageInputField);
        pageNavPanel.add(totalPagesLabel);
        pageNavPanel.setVisible(false); // Hidden until PDF is loaded

        // -------------------- Layout --------------------
        JPanel leftPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 2, 0));
        leftPanel.setOpaque(false);
        leftPanel.add(openBtn);
        leftPanel.add(recentBtn);

        centerPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 0));
        centerPanel.setOpaque(false);
        centerPanel.add(pageNavPanel);
        centerPanel.add(signBtn);

        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 5, 0));
        rightPanel.setOpaque(false);
        rightPanel.add(versionStatusLabel);
        rightPanel.add(settingsBtn);

        add(leftPanel, BorderLayout.WEST);
        add(centerPanel, BorderLayout.CENTER);
        add(rightPanel, BorderLayout.EAST);

        // -------------------- Auto Startup Version Check --------------------
        VersionManager.checkUpdateWithInfoAsync(new VersionManager.UpdateInfoCallback() {
            @Override
            public void onResult(final VersionManager.UpdateInfo info) {
                SwingUtilities.invokeLater(new Runnable() {
                    @Override
                    public void run() {
                        if (info.updateAvailable && info.latestVersion != null) {
                            // Make label clickable with async dialog showing
                            VersionManager.makeLabelClickable(versionStatusLabel, TopBarPanel.this, info.latestVersion);
                        } else {
                            // Hide label if no update
                            versionStatusLabel.setVisible(false);
                        }
                    }
                });
            }
        });

    }

    // -------------------- Helper Methods --------------------
    public void setPageInfoText(String text) {
        pageInfoLabel.setText(text);
    }

    public void setSignButtonVisible(boolean visible) {
        signBtn.setVisible(visible);
    }

    /**
     * Sets the button to certified mode - disabled with "Document Certified" label
     */
    public void setSignButtonCertified(boolean certified) {
        this.isCertified = certified;
        if (certified) {
            signBtn.setText(CERTIFIED_TEXT);
            signBtn.setEnabled(false);
            signBtn.setVisible(true);
            // Default tooltip - can be overridden by setSignButtonTooltip()
            if (signBtn.getToolTipText() == null || signBtn.getToolTipText().isEmpty()) {
                signBtn.setToolTipText("This document is certified. You cannot add more signatures.");
            }
        } else {
            signBtn.setEnabled(true);
            signBtn.setToolTipText(null);
            updateSignButtonText();
        }
    }

    /**
     * Sets tooltip for the sign button (PDF viewer style)
     */
    public void setSignButtonTooltip(String tooltip) {
        if (tooltip != null && !tooltip.isEmpty()) {
            signBtn.setToolTipText(tooltip);
        } else {
            signBtn.setToolTipText(null);
        }
    }

    public void setInteractiveEnabled(boolean enabled) {
        openBtn.setEnabled(enabled);
        settingsBtn.setEnabled(enabled);
        if (!isCertified) {
            signBtn.setEnabled(enabled);
        }
        setSignMode(!enabled);
    }

    public void setLoading(boolean loading) {
        openBtn.setText(loading ? "Opening PDF..." : OPEN_PDF_TEXT);
        setInteractiveEnabled(!loading);
    }

    public void setSignMode(boolean enabled) {
        this.signMode = enabled;
        updateSignButtonText();
    }

    private void updateSignButtonText() {
        if (isCertified) {
            signBtn.setText(CERTIFIED_TEXT);
        } else {
            signBtn.setText(signMode ? CANCEL_SIGN_TEXT : BEGIN_SIGN_TEXT);
        }
    }

    public boolean isSignModeEnabled() {
        return signMode;
    }

    // -------------------- Getters for Onboarding --------------------

    public JButton getOpenButton() {
        return openBtn;
    }

    public JButton getRecentButton() {
        return recentBtn;
    }

    public JButton getSignButton() {
        return signBtn;
    }

    public JButton getSettingsButton() {
        return settingsBtn;
    }

    public JTextField getPageInputField() {
        return pageInputField;
    }

    public JPanel getCenterPanel() {
        return centerPanel;
    }

    // -------------------- Page Navigation --------------------

    /**
     * Sets the callback for opening a file from recent files.
     */
    public void setOnOpenFile(Consumer<File> callback) {
        this.onOpenFile = callback;
    }

    /**
     * Sets the callback for navigating to a page.
     */
    public void setOnGoToPage(Consumer<Integer> callback) {
        this.onGoToPage = callback;
    }

    /**
     * Updates the page display with current page and total pages.
     */
    public void updatePageDisplay(int currentPage, int total) {
        this.totalPages = total;
        if (total > 0) {
            pageInputField.setText(String.valueOf(currentPage));
            totalPagesLabel.setText("/ " + total);
            pageInputField.getParent().setVisible(true);
        } else {
            pageInputField.getParent().setVisible(false);
        }
    }

    /**
     * Navigates to the page number entered in the input field.
     */
    private void goToEnteredPage() {
        try {
            int page = Integer.parseInt(pageInputField.getText().trim());
            if (page >= 1 && page <= totalPages && onGoToPage != null) {
                onGoToPage.accept(page - 1); // Convert to 0-based index
            } else {
                // Reset to valid range
                pageInputField.setText(String.valueOf(Math.max(1, Math.min(page, totalPages))));
            }
        } catch (NumberFormatException e) {
            // Reset field on invalid input
            pageInputField.setText("1");
        }
    }

    /**
     * Shows the recent files dropdown menu.
     */
    private void showRecentFilesMenu() {
        JPopupMenu menu = new JPopupMenu();
        List<File> recentFiles = RecentFilesManager.getInstance().getRecentFiles();

        if (recentFiles.isEmpty()) {
            JMenuItem noFilesItem = new JMenuItem("No recent files");
            noFilesItem.setEnabled(false);
            menu.add(noFilesItem);
        } else {
            for (File file : recentFiles) {
                JMenuItem item = new JMenuItem(file.getName());
                item.setToolTipText(file.getAbsolutePath());
                item.addActionListener(e -> {
                    if (onOpenFile != null && file.exists()) {
                        onOpenFile.accept(file);
                    }
                });
                menu.add(item);
            }

            menu.addSeparator();

            JMenuItem clearItem = new JMenuItem("Clear Recent Files");
            clearItem.addActionListener(e -> RecentFilesManager.getInstance().clearRecentFiles());
            menu.add(clearItem);
        }

        menu.show(recentBtn, 0, recentBtn.getHeight());
    }
}
