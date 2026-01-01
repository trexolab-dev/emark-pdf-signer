package com.trexolab.gui.settings;

import com.trexolab.gui.DialogUtils;
import com.trexolab.service.SignatureImageLibrary;
import com.trexolab.service.SignatureImageLibrary.SignatureImage;

import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.border.TitledBorder;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Panel for managing signature images in Settings.
 * Allows uploading images and drawing signatures with mouse.
 */
public class SignatureLibraryPanel extends JPanel {

    private static final Font SECTION_FONT = new Font("SansSerif", Font.BOLD, 13);
    private static final Color HOVER_COLOR = new Color(60, 90, 140);

    private final SignatureImageLibrary library;
    private JPanel signaturesGrid;
    private final JFrame parentFrame;

    public SignatureLibraryPanel(JFrame parent) {
        this.parentFrame = parent;
        this.library = SignatureImageLibrary.getInstance();

        setLayout(new BorderLayout(10, 15));
        setBorder(new EmptyBorder(15, 15, 15, 15));

        // Top section - Add signature buttons
        JPanel topPanel = createTopPanel();
        add(topPanel, BorderLayout.NORTH);

        // Center section - Signatures grid with scroll
        JPanel centerPanel = createSignaturesSection();
        add(centerPanel, BorderLayout.CENTER);

        // Load existing signatures
        refreshSignaturesList();
    }

    private JPanel createTopPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        panel.setOpaque(false);

        JButton uploadBtn = createButton("Upload Image", new Dimension(140, 32));
        uploadBtn.setToolTipText("Import a signature image from file");
        uploadBtn.addActionListener(e -> uploadSignatureImage());

        JButton drawBtn = createButton("Draw Signature", new Dimension(140, 32));
        drawBtn.setToolTipText("Draw a new signature with mouse/pen");
        drawBtn.addActionListener(e -> openDrawingDialog());

        panel.add(uploadBtn);
        panel.add(drawBtn);

        return panel;
    }

    private JPanel createSignaturesSection() {
        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setOpaque(false);
        wrapper.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(100, 100, 100)),
                "Saved Signatures",
                TitledBorder.LEFT,
                TitledBorder.TOP,
                SECTION_FONT,
                Color.LIGHT_GRAY));

        signaturesGrid = new JPanel();
        signaturesGrid.setLayout(new BoxLayout(signaturesGrid, BoxLayout.Y_AXIS));
        signaturesGrid.setOpaque(false);
        signaturesGrid.setBorder(new EmptyBorder(10, 10, 10, 10));

        JScrollPane scrollPane = new JScrollPane(signaturesGrid);
        scrollPane.setBorder(null);
        scrollPane.setOpaque(false);
        scrollPane.getViewport().setOpaque(false);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scrollPane.getVerticalScrollBar().setUnitIncrement(16);

        wrapper.add(scrollPane, BorderLayout.CENTER);

        return wrapper;
    }

    /**
     * Creates a styled button matching the app theme.
     */
    private JButton createButton(String text, Dimension size) {
        JButton button = new JButton(text);
        button.setPreferredSize(size);
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

    /**
     * Creates a delete button with red styling.
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

    private void uploadSignatureImage() {
        JFileChooser chooser = new JFileChooser();
        chooser.setDialogTitle("Select Signature Image");
        chooser.setFileFilter(new FileNameExtensionFilter("Image Files (PNG, JPG)", "png", "jpg", "jpeg"));

        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            File selectedFile = chooser.getSelectedFile();

            // Ask for a name
            String name = JOptionPane.showInputDialog(this,
                    "Enter a name for this signature:",
                    "Signature Name",
                    JOptionPane.PLAIN_MESSAGE);

            if (name != null && !name.trim().isEmpty()) {
                try {
                    BufferedImage image = ImageIO.read(selectedFile);
                    if (image != null) {
                        library.saveSignature(image, name.trim());
                        refreshSignaturesList();
                        DialogUtils.showInfo(this, "Success", "Signature image saved successfully.");
                    } else {
                        DialogUtils.showError(this, "Error", "Could not read the image file.");
                    }
                } catch (IOException ex) {
                    DialogUtils.showError(this, "Error", "Failed to save signature: " + ex.getMessage());
                }
            }
        }
    }

    private void openDrawingDialog() {
        JDialog dialog = new JDialog(parentFrame, "Draw Signature", true);
        dialog.setLayout(new BorderLayout(10, 10));
        dialog.setSize(450, 280);
        dialog.setLocationRelativeTo(this);

        // Drawing panel
        SignatureDrawingPanel drawingPanel = new SignatureDrawingPanel();
        drawingPanel.setBorder(new EmptyBorder(10, 10, 5, 10));

        // Buttons panel
        JPanel buttonsPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 10));

        JButton clearBtn = createButton("Clear", new Dimension(80, 28));
        clearBtn.addActionListener(e -> drawingPanel.clear());

        JButton cancelBtn = createButton("Cancel", new Dimension(80, 28));
        cancelBtn.addActionListener(e -> dialog.dispose());

        JButton saveBtn = createButton("Save", new Dimension(80, 28));
        saveBtn.addActionListener(e -> {
            if (!drawingPanel.hasSignature()) {
                DialogUtils.showWarning(dialog, "No Signature", "Please draw a signature first.");
                return;
            }

            String name = JOptionPane.showInputDialog(dialog,
                    "Enter a name for this signature:",
                    "Signature Name",
                    JOptionPane.PLAIN_MESSAGE);

            if (name != null && !name.trim().isEmpty()) {
                try {
                    BufferedImage image = drawingPanel.exportSignatureWithBackground();
                    if (image != null) {
                        library.saveSignature(image, name.trim());
                        refreshSignaturesList();
                        dialog.dispose();
                        DialogUtils.showInfo(this, "Success", "Signature saved successfully.");
                    }
                } catch (IOException ex) {
                    DialogUtils.showError(dialog, "Error", "Failed to save signature: " + ex.getMessage());
                }
            }
        });

        buttonsPanel.add(clearBtn);
        buttonsPanel.add(cancelBtn);
        buttonsPanel.add(saveBtn);

        // Instructions label
        JLabel instructionLabel = new JLabel("Use your mouse or pen to draw your signature below:");
        instructionLabel.setBorder(new EmptyBorder(10, 10, 5, 10));
        instructionLabel.setForeground(Color.LIGHT_GRAY);

        dialog.add(instructionLabel, BorderLayout.NORTH);
        dialog.add(drawingPanel, BorderLayout.CENTER);
        dialog.add(buttonsPanel, BorderLayout.SOUTH);

        dialog.setVisible(true);
    }

    private void refreshSignaturesList() {
        signaturesGrid.removeAll();

        List<SignatureImage> signatures = library.getSignatures();

        if (signatures.isEmpty()) {
            JPanel emptyPanel = new JPanel(new GridBagLayout());
            emptyPanel.setOpaque(false);
            JLabel emptyLabel = new JLabel("No signatures saved. Upload an image or draw a signature.");
            emptyLabel.setForeground(new Color(150, 150, 150));
            emptyLabel.setFont(new Font("SansSerif", Font.ITALIC, 12));
            emptyPanel.add(emptyLabel);
            signaturesGrid.add(emptyPanel);
        } else {
            for (SignatureImage sig : signatures) {
                JPanel card = createSignatureCard(sig);
                signaturesGrid.add(card);
                signaturesGrid.add(Box.createVerticalStrut(10));
            }
            // Add glue at the end to push cards to top
            signaturesGrid.add(Box.createVerticalGlue());
        }

        signaturesGrid.revalidate();
        signaturesGrid.repaint();
    }

    private JPanel createSignatureCard(SignatureImage signature) {
        JPanel card = new JPanel(new GridBagLayout());
        card.setOpaque(false);
        card.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(new Color(70, 70, 70), 1),
                new EmptyBorder(10, 12, 10, 12)));
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 80));
        card.setPreferredSize(new Dimension(400, 70));

        GridBagConstraints gbc = new GridBagConstraints();

        // Thumbnail
        Image scaled = signature.getImage().getScaledInstance(80, 45, Image.SCALE_SMOOTH);
        JLabel thumbnail = new JLabel(new ImageIcon(scaled));
        thumbnail.setPreferredSize(new Dimension(80, 45));
        thumbnail.setMinimumSize(new Dimension(80, 45));
        thumbnail.setBorder(new LineBorder(new Color(100, 100, 100)));
        thumbnail.setBackground(Color.WHITE);
        thumbnail.setOpaque(true);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridheight = 2;
        gbc.insets = new Insets(0, 0, 0, 15);
        gbc.anchor = GridBagConstraints.WEST;
        card.add(thumbnail, gbc);

        // Name label
        JLabel nameLabel = new JLabel(signature.getName());
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

        // File name label
        String fileName = signature.getFile().getName();
        JLabel pathLabel = new JLabel(fileName);
        pathLabel.setFont(new Font("SansSerif", Font.PLAIN, 11));
        pathLabel.setForeground(new Color(140, 140, 140));

        gbc.gridx = 1;
        gbc.gridy = 1;
        gbc.insets = new Insets(2, 0, 0, 10);
        gbc.anchor = GridBagConstraints.NORTHWEST;
        card.add(pathLabel, gbc);

        // Delete button (theme-matching with red hover)
        JButton deleteBtn = createDeleteButton();
        deleteBtn.addActionListener(e -> {
            int confirm = JOptionPane.showConfirmDialog(this,
                    "Delete signature '" + signature.getName() + "'?",
                    "Confirm Delete",
                    JOptionPane.YES_NO_OPTION,
                    JOptionPane.WARNING_MESSAGE);

            if (confirm == JOptionPane.YES_OPTION) {
                library.deleteSignature(signature.getFile());
                refreshSignaturesList();
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
}
