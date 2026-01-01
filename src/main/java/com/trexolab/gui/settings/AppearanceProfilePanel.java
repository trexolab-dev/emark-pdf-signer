package com.trexolab.gui.settings;

import com.trexolab.gui.SignatureAppearanceDialog;
import com.trexolab.service.AppearanceProfileManager;
import com.trexolab.service.AppearanceProfileManager.AppearanceProfile;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.util.List;

/**
 * Panel for managing appearance profiles in Settings.
 * Allows viewing and deleting profiles.
 */
public class AppearanceProfilePanel extends JPanel {

    private static final Font SECTION_FONT = new Font("SansSerif", Font.BOLD, 13);
    private static final Color HOVER_COLOR = new Color(60, 90, 140);

    private final AppearanceProfileManager profileManager;
    private JPanel profilesGrid;

    public AppearanceProfilePanel() {
        this.profileManager = AppearanceProfileManager.getInstance();

        setLayout(new BorderLayout(10, 15));
        setBorder(new EmptyBorder(15, 15, 15, 15));

        // Top panel with info and New Profile button
        JPanel topPanel = createTopPanel();
        add(topPanel, BorderLayout.NORTH);

        // Center section - Profiles list with scroll
        JPanel centerPanel = createProfilesSection();
        add(centerPanel, BorderLayout.CENTER);

        // Load existing profiles
        refreshProfilesList();
    }

    private JPanel createTopPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 0));
        panel.setOpaque(false);
        panel.setBorder(new EmptyBorder(0, 0, 10, 0));

        // Info label on left
        JLabel infoLabel = new JLabel("<html>Manage your saved appearance profiles here.</html>");
        infoLabel.setForeground(new Color(180, 180, 180));
        panel.add(infoLabel, BorderLayout.CENTER);

        // New Profile button on right
        JButton newProfileBtn = createStyledButton("New Profile");
        newProfileBtn.addActionListener(e -> showNewProfileDialog());
        panel.add(newProfileBtn, BorderLayout.EAST);

        return panel;
    }

    private JButton createStyledButton(String text) {
        JButton button = new JButton(text);
        button.setPreferredSize(new Dimension(100, 30));
        button.setFocusPainted(false);
        button.setBorder(new EmptyBorder(5, 10, 5, 10));
        button.setOpaque(true);

        Color defaultBg = button.getBackground();

        button.addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseEntered(java.awt.event.MouseEvent e) {
                button.setBackground(HOVER_COLOR);
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent e) {
                button.setBackground(defaultBg);
            }
        });

        return button;
    }

    private void showNewProfileDialog() {
        String name = JOptionPane.showInputDialog(this,
                "Enter a name for the new profile:",
                "New Profile",
                JOptionPane.PLAIN_MESSAGE);

        if (name == null || name.trim().isEmpty()) {
            return;
        }

        name = name.trim();

        // Check if profile exists
        if (profileManager.profileExists(name)) {
            JOptionPane.showMessageDialog(this,
                    "Profile '" + name + "' already exists.",
                    "Profile Exists",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        // Create a new profile with default values
        AppearanceProfile profile = new AppearanceProfile(name);
        profile.setRenderingMode("Name and Graphic");
        profile.setCertificationLevel("Open");
        profile.setTimestampEnabled(true);
        profile.setLtvEnabled(true);

        profileManager.saveProfile(profile);
        refreshProfilesList();

        // Open the appearance dialog with the new profile selected
        openAppearanceDialogForProfile(name);
    }

    private void openAppearanceDialogForProfile(String profileName) {
        // Find the parent frame
        Window window = SwingUtilities.getWindowAncestor(this);
        Frame parentFrame = null;
        if (window instanceof Frame) {
            parentFrame = (Frame) window;
        } else if (window instanceof Dialog) {
            Window owner = ((Dialog) window).getOwner();
            if (owner instanceof Frame) {
                parentFrame = (Frame) owner;
            }
        }

        if (parentFrame == null) {
            return;
        }

        // Open the SignatureAppearanceDialog in profile edit mode
        SignatureAppearanceDialog dialog = new SignatureAppearanceDialog(parentFrame);
        dialog.setProfileEditMode(true); // Hide profile selector when editing from Settings
        dialog.setEditingProfileName(profileName); // Set profile name BEFORE showing dialog
        dialog.showAppearanceConfigPrompt(); // This blocks until dialog closes

        // Refresh the list after dialog closes (profile may have been updated)
        refreshProfilesList();
    }

    private JPanel createProfilesSection() {
        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setOpaque(false);
        wrapper.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(100, 100, 100)),
                "Saved Profiles",
                TitledBorder.LEFT,
                TitledBorder.TOP,
                SECTION_FONT,
                Color.LIGHT_GRAY));

        profilesGrid = new JPanel();
        profilesGrid.setLayout(new BoxLayout(profilesGrid, BoxLayout.Y_AXIS));
        profilesGrid.setOpaque(false);
        profilesGrid.setBorder(new EmptyBorder(10, 10, 10, 10));

        JScrollPane scrollPane = new JScrollPane(profilesGrid);
        scrollPane.setBorder(null);
        scrollPane.setOpaque(false);
        scrollPane.getViewport().setOpaque(false);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scrollPane.getVerticalScrollBar().setUnitIncrement(16);

        wrapper.add(scrollPane, BorderLayout.CENTER);

        return wrapper;
    }

    private void refreshProfilesList() {
        profilesGrid.removeAll();

        List<AppearanceProfile> profiles = profileManager.getProfiles();

        if (profiles.isEmpty()) {
            JPanel emptyPanel = new JPanel(new GridBagLayout());
            emptyPanel.setOpaque(false);
            JLabel emptyLabel = new JLabel("No profiles saved. Create profiles from the Signature Appearance dialog.");
            emptyLabel.setForeground(new Color(150, 150, 150));
            emptyLabel.setFont(new Font("SansSerif", Font.ITALIC, 12));
            emptyPanel.add(emptyLabel);
            profilesGrid.add(emptyPanel);
        } else {
            for (AppearanceProfile profile : profiles) {
                JPanel card = createProfileCard(profile);
                profilesGrid.add(card);
                profilesGrid.add(Box.createVerticalStrut(10));
            }
            // Add glue at the end to push cards to top
            profilesGrid.add(Box.createVerticalGlue());
        }

        profilesGrid.revalidate();
        profilesGrid.repaint();
    }

    private JPanel createProfileCard(AppearanceProfile profile) {
        JPanel card = new JPanel(new GridBagLayout());
        card.setOpaque(false);
        card.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(new Color(70, 70, 70), 1),
                new EmptyBorder(10, 12, 10, 12)));
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 90));
        card.setPreferredSize(new Dimension(400, 80));

        GridBagConstraints gbc = new GridBagConstraints();

        // Profile icon/indicator
        JLabel iconLabel = new JLabel("\u2699"); // Gear icon
        iconLabel.setFont(new Font("SansSerif", Font.PLAIN, 24));
        iconLabel.setForeground(new Color(100, 140, 200));
        iconLabel.setPreferredSize(new Dimension(40, 40));
        iconLabel.setHorizontalAlignment(SwingConstants.CENTER);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridheight = 2;
        gbc.insets = new Insets(0, 0, 0, 15);
        gbc.anchor = GridBagConstraints.WEST;
        card.add(iconLabel, gbc);

        // Profile name
        JLabel nameLabel = new JLabel(profile.getName());
        nameLabel.setFont(new Font("SansSerif", Font.BOLD, 13));
        nameLabel.setForeground(Color.WHITE);

        gbc.gridx = 1;
        gbc.gridy = 0;
        gbc.gridheight = 1;
        gbc.weightx = 1.0;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(0, 0, 2, 10);
        gbc.anchor = GridBagConstraints.SOUTHWEST;
        card.add(nameLabel, gbc);

        // Profile summary
        String summary = buildProfileSummary(profile);
        JLabel summaryLabel = new JLabel(summary);
        summaryLabel.setFont(new Font("SansSerif", Font.PLAIN, 11));
        summaryLabel.setForeground(new Color(140, 140, 140));

        gbc.gridx = 1;
        gbc.gridy = 1;
        gbc.insets = new Insets(2, 0, 0, 10);
        gbc.anchor = GridBagConstraints.NORTHWEST;
        card.add(summaryLabel, gbc);

        // Delete button
        JButton deleteBtn = createDeleteButton();
        deleteBtn.addActionListener(e -> {
            int confirm = JOptionPane.showConfirmDialog(this,
                    "Delete profile '" + profile.getName() + "'?",
                    "Confirm Delete",
                    JOptionPane.YES_NO_OPTION,
                    JOptionPane.WARNING_MESSAGE);

            if (confirm == JOptionPane.YES_OPTION) {
                profileManager.deleteProfile(profile.getName());
                refreshProfilesList();
            }
        });

        gbc.gridx = 2;
        gbc.gridy = 0;
        gbc.gridheight = 2;
        gbc.weightx = 0;
        gbc.fill = GridBagConstraints.NONE;
        gbc.insets = new Insets(0, 0, 0, 0);
        gbc.anchor = GridBagConstraints.CENTER;
        card.add(deleteBtn, gbc);

        return card;
    }

    private String buildProfileSummary(AppearanceProfile profile) {
        StringBuilder sb = new StringBuilder();

        if (profile.getRenderingMode() != null) {
            sb.append(profile.getRenderingMode());
        }

        if (profile.isTimestampEnabled()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Timestamp");
        }

        if (profile.isGreenTickEnabled()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Green Tick");
        }

        if (profile.getReason() != null && !profile.getReason().isEmpty()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Reason: ").append(truncate(profile.getReason(), 15));
        }

        return sb.length() > 0 ? sb.toString() : "No details";
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen - 3) + "...";
    }

    /**
     * Creates a delete button with red hover styling.
     */
    private JButton createDeleteButton() {
        JButton button = new JButton("Delete");
        button.setPreferredSize(new Dimension(75, 30));
        button.setFocusPainted(false);
        button.setBorder(new EmptyBorder(5, 10, 5, 10));
        button.setOpaque(true);

        Color defaultBg = button.getBackground();
        Color deleteHoverColor = new Color(140, 60, 60);

        button.addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseEntered(java.awt.event.MouseEvent e) {
                button.setBackground(deleteHoverColor);
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent e) {
                button.setBackground(defaultBg);
            }
        });

        return button;
    }
}
