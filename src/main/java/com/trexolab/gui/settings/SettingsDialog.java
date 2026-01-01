package com.trexolab.gui.settings;

import com.trexolab.gui.onboarding.OnboardingOverlay;

import javax.swing.*;
import java.awt.*;
import java.util.prefs.Preferences;

import static com.trexolab.utils.AppConstants.APP_NAME;

public class SettingsDialog extends JDialog {
    private static final int DIALOG_WIDTH = 500;
    private static final int DIALOG_HEIGHT = 650;
    private static final String PREF_SETTINGS_ONBOARDING = "settings.onboarding.completed";
    private static final Preferences prefs = Preferences.userNodeForPackage(SettingsDialog.class);

    private JTabbedPane tabbedPane;
    private JButton trustManagerBtn;
    private JButton closeBtn;

    public SettingsDialog(JFrame parent) {
        super(parent, APP_NAME + " - Settings", true);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setSize(DIALOG_WIDTH, DIALOG_HEIGHT);
        setLocationRelativeTo(parent);
        setLayout(new BorderLayout());
        setResizable(true);

        tabbedPane = new JTabbedPane();
        tabbedPane.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        add(tabbedPane, BorderLayout.CENTER);

        // Keystore Tab
        KeystoreSettingsPanel keystorePanel = new KeystoreSettingsPanel(parent);
        tabbedPane.addTab("Keystore", keystorePanel);

        // Security Tab
        tabbedPane.addTab("Security", new SecuritySettingsPanel());

        // Signature Library Tab
        tabbedPane.addTab("Signatures", new SignatureLibraryPanel(parent));

        // Appearance Profiles Tab
        tabbedPane.addTab("Profiles", new AppearanceProfilePanel());

        // About Tab
        tabbedPane.addTab("About", new AboutPanel());

        // Bottom panel with Trust Manager button
        JPanel bottomPanel = createBottomPanel(parent);
        add(bottomPanel, BorderLayout.SOUTH);

        // Show settings onboarding for first-time users
        if (shouldShowSettingsOnboarding()) {
            SwingUtilities.invokeLater(this::showSettingsOnboarding);
        }
    }

    private JPanel createBottomPanel(final JFrame parent) {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));

        // Trust Manager button on left
        trustManagerBtn = new JButton("Trust Manager");
        trustManagerBtn.setFont(new Font("SansSerif", Font.BOLD, 12));
        trustManagerBtn.setToolTipText("Manage trusted CA certificates");
        trustManagerBtn.setFocusPainted(false);
        trustManagerBtn.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent e) {
                TrustManagerDialog.showTrustManager(parent);
            }
        });

        // Close button on right
        closeBtn = new JButton("Close");
        closeBtn.setFont(new Font("SansSerif", Font.PLAIN, 12));
        closeBtn.setFocusPainted(false);
        closeBtn.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent e) {
                dispose();
            }
        });

        panel.add(trustManagerBtn, BorderLayout.WEST);
        panel.add(closeBtn, BorderLayout.EAST);

        return panel;
    }

    /**
     * Checks if settings onboarding should be shown.
     */
    private static boolean shouldShowSettingsOnboarding() {
        return !prefs.getBoolean(PREF_SETTINGS_ONBOARDING, false);
    }

    /**
     * Resets settings onboarding state (for testing).
     */
    public static void resetSettingsOnboarding() {
        prefs.putBoolean(PREF_SETTINGS_ONBOARDING, false);
    }

    /**
     * Shows the Driver.js-style onboarding for settings dialog.
     */
    private void showSettingsOnboarding() {
        // Get the parent JFrame for the overlay
        Window window = SwingUtilities.getWindowAncestor(this);
        if (!(window instanceof JFrame)) {
            return;
        }

        JFrame parentFrame = (JFrame) window;
        SettingsDialog dialog = this;

        OnboardingOverlay onboarding = new OnboardingOverlay(parentFrame) {
            @Override
            public void start() {
                // Override to use dialog's glass pane instead of frame's
                if (getSteps().isEmpty())
                    return;

                JRootPane rootPane = dialog.getRootPane();
                JPanel dialogGlassPane = new JPanel(null);
                dialogGlassPane.setOpaque(false);
                dialogGlassPane.add(this);
                setBounds(0, 0, rootPane.getWidth(), rootPane.getHeight());
                rootPane.setGlassPane(dialogGlassPane);
                dialogGlassPane.setVisible(true);

                // Set dialog root pane for proper close handling
                setDialogRootPane(rootPane);

                // Handle resize
                dialog.addComponentListener(new java.awt.event.ComponentAdapter() {
                    @Override
                    public void componentResized(java.awt.event.ComponentEvent e) {
                        setBounds(0, 0, dialog.getRootPane().getWidth(),
                                dialog.getRootPane().getHeight());
                        if (getCurrentStepIndex() < getSteps().size()) {
                            refreshCurrentStep();
                        }
                    }
                });

                startFadeIn();
                showFirstStep();
            }

            @Override
            public void complete() {
                prefs.putBoolean(PREF_SETTINGS_ONBOARDING, true);
                super.complete();
            }
        };

        // Step 1: Keystore Tab (with tab switching)
        onboarding.addStep(
                tabbedPane,
                "Keystore Settings",
                "Configure your digital certificate (keystore) here. This is required for signing PDF documents. You can use .p12, .pfx, or .jks keystore files.",
                OnboardingOverlay.TooltipPosition.BOTTOM,
                () -> tabbedPane.setSelectedIndex(0));

        // Step 2: Security Tab (with tab switching)
        onboarding.addStep(
                tabbedPane,
                "Security Settings",
                "Configure timestamp server (TSA) and proxy settings for your digital signatures.",
                OnboardingOverlay.TooltipPosition.BOTTOM,
                () -> tabbedPane.setSelectedIndex(1));

        // Step 3: Signatures Tab (with tab switching)
        onboarding.addStep(
                tabbedPane,
                "Signature Library",
                "Manage your signature images here. Upload existing images or draw new signatures with your mouse. These can be used when signing PDFs.",
                OnboardingOverlay.TooltipPosition.BOTTOM,
                () -> tabbedPane.setSelectedIndex(2));

        // Step 4: Profiles Tab (with tab switching)
        onboarding.addStep(
                tabbedPane,
                "Appearance Profiles",
                "Manage your saved appearance profiles here. Profiles let you quickly apply your preferred signature settings.",
                OnboardingOverlay.TooltipPosition.BOTTOM,
                () -> tabbedPane.setSelectedIndex(3));

        // Step 5: About Tab (with tab switching)
        onboarding.addStep(
                tabbedPane,
                "About",
                "View application information, version details, and useful links.",
                OnboardingOverlay.TooltipPosition.BOTTOM,
                () -> tabbedPane.setSelectedIndex(4));

        // Step 6: Trust Manager button (switch back to first tab)
        onboarding.addStep(
                trustManagerBtn,
                "Trust Manager",
                "Open the Trust Manager to import and manage trusted CA certificates. This helps verify signatures from different certificate authorities.",
                OnboardingOverlay.TooltipPosition.TOP,
                () -> tabbedPane.setSelectedIndex(0));

        onboarding.setOnComplete(() -> {
            // Reset to first tab when done
            tabbedPane.setSelectedIndex(0);
        });

        onboarding.start();
    }
}
