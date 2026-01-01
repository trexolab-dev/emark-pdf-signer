package com.trexolab.gui.pdfHandler;

import com.trexolab.utils.Utils;

import javax.swing.*;
import java.awt.*;


/**
 * Professional centered placeholder shown before a PDF is loaded.
 * Supports opening PDF via button or drag-and-drop.
 */
public class PlaceholderPanel extends JPanel {
    public PlaceholderPanel(Runnable onOpen) {
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setOpaque(true); // respects FlatLaf theme
        setBackground(null); // use default background from FlatLaf

        // PDF Icon - displayed above the title with slight transparency
        ImageIcon pdfIcon = Utils.loadScaledIcon("/images/pdf-icon.png", 96);
        JLabel iconLabel = new JLabel() {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g.create();
                g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.5f));
                super.paintComponent(g2d);
                g2d.dispose();
            }
        };
        if (pdfIcon != null) {
            iconLabel.setIcon(pdfIcon);
        }
        iconLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Title - larger, bold
        JLabel titleLabel = new JLabel("No PDF Loaded");
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 24f));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        titleLabel.setForeground(new Color(78, 78, 78));

        // Subtitle - lighter weight, slightly smaller
        JLabel subtitleLabel = new JLabel("Drag and drop a PDF here or click below to open a file");
        subtitleLabel.setFont(subtitleLabel.getFont().deriveFont(Font.PLAIN, 14f));
        subtitleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        subtitleLabel.setForeground(new Color(120, 120, 120));

        JLabel subtitleLabel2 = new JLabel("Enjoy a secure, reliable, and completely free experience.");
        subtitleLabel2.setFont(subtitleLabel.getFont().deriveFont(Font.BOLD, 16f));
        subtitleLabel2.setAlignmentX(Component.CENTER_ALIGNMENT);
        subtitleLabel2.setForeground(new Color(255, 237, 107, 255)); // subtle yellow for visibility

        // Open PDF button - use FlatLaf default button styling
        JButton openBtn = UiFactory.createButton("Open PDF", null); // null to use FlatLaf default button color
        openBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        openBtn.addActionListener(e -> onOpen.run());

        // Layout spacing with professional proportions
        add(Box.createVerticalGlue());
        add(iconLabel);
        add(Box.createRigidArea(new Dimension(0, 20)));
        add(titleLabel);
        add(Box.createRigidArea(new Dimension(0, 10)));
        add(subtitleLabel);
        add(Box.createRigidArea(new Dimension(0, 30)));
        add(subtitleLabel2);
        add(Box.createRigidArea(new Dimension(0, 40)));
        add(openBtn);
        add(Box.createVerticalGlue());
    }
}

