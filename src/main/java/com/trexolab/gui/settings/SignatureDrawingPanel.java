package com.trexolab.gui.settings;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Path2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;

/**
 * A panel that allows users to draw signatures with mouse/pen.
 * Provides smooth drawing with anti-aliasing and exports to BufferedImage.
 */
public class SignatureDrawingPanel extends JPanel {

    private static final Color CANVAS_BG = new Color(255, 255, 255);
    private static final Color PEN_COLOR = new Color(20, 20, 80);
    private static final float PEN_WIDTH = 2.5f;

    private final List<Path2D> paths = new ArrayList<>();
    private Path2D currentPath = null;
    private Point lastPoint = null;

    // For pressure simulation (smoother lines)
    private float currentPressure = 1.0f;

    public SignatureDrawingPanel() {
        setBackground(CANVAS_BG);
        setPreferredSize(new Dimension(400, 150));
        setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(100, 100, 100), 1),
                BorderFactory.createEmptyBorder(5, 5, 5, 5)
        ));
        setCursor(Cursor.getPredefinedCursor(Cursor.CROSSHAIR_CURSOR));

        setupMouseListeners();
    }

    private void setupMouseListeners() {
        addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                currentPath = new Path2D.Float();
                currentPath.moveTo(e.getX(), e.getY());
                lastPoint = e.getPoint();
                currentPressure = 0.5f;
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (currentPath != null) {
                    paths.add(currentPath);
                    currentPath = null;
                    lastPoint = null;
                }
            }
        });

        addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseDragged(MouseEvent e) {
                if (currentPath != null && lastPoint != null) {
                    // Smooth curve using quadratic bezier
                    int midX = (lastPoint.x + e.getX()) / 2;
                    int midY = (lastPoint.y + e.getY()) / 2;
                    currentPath.quadTo(lastPoint.x, lastPoint.y, midX, midY);
                    lastPoint = e.getPoint();

                    // Gradually increase pressure for natural feel
                    currentPressure = Math.min(1.0f, currentPressure + 0.1f);

                    repaint();
                }
            }
        });
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();

        // Enable anti-aliasing for smooth lines
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

        // Draw placeholder text if empty
        if (paths.isEmpty() && currentPath == null) {
            g2.setColor(new Color(180, 180, 180));
            g2.setFont(new Font("SansSerif", Font.ITALIC, 14));
            String hint = "Draw your signature here...";
            FontMetrics fm = g2.getFontMetrics();
            int x = (getWidth() - fm.stringWidth(hint)) / 2;
            int y = (getHeight() + fm.getAscent()) / 2;
            g2.drawString(hint, x, y);
        }

        // Draw all completed paths
        g2.setColor(PEN_COLOR);
        g2.setStroke(new BasicStroke(PEN_WIDTH, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        for (Path2D path : paths) {
            g2.draw(path);
        }

        // Draw current path being drawn
        if (currentPath != null) {
            g2.draw(currentPath);
        }

        g2.dispose();
    }

    /**
     * Clears the drawing canvas.
     */
    public void clear() {
        paths.clear();
        currentPath = null;
        lastPoint = null;
        repaint();
    }

    /**
     * Checks if the canvas has any drawing.
     */
    public boolean hasSignature() {
        return !paths.isEmpty();
    }

    /**
     * Exports the signature as a BufferedImage with transparent background.
     */
    public BufferedImage exportSignature() {
        if (!hasSignature()) {
            return null;
        }

        // Calculate bounding box of all paths
        Rectangle bounds = null;
        for (Path2D path : paths) {
            Rectangle pathBounds = path.getBounds();
            if (bounds == null) {
                bounds = pathBounds;
            } else {
                bounds = bounds.union(pathBounds);
            }
        }

        if (bounds == null || bounds.width == 0 || bounds.height == 0) {
            return null;
        }

        // Add padding
        int padding = 10;
        int width = bounds.width + padding * 2;
        int height = bounds.height + padding * 2;

        // Create image with transparent background
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = image.createGraphics();

        // Enable anti-aliasing
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

        // Translate to account for bounding box offset
        g2.translate(-bounds.x + padding, -bounds.y + padding);

        // Draw paths
        g2.setColor(PEN_COLOR);
        g2.setStroke(new BasicStroke(PEN_WIDTH, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        for (Path2D path : paths) {
            g2.draw(path);
        }

        g2.dispose();
        return image;
    }

    /**
     * Exports the signature with white background (for PDF compatibility).
     */
    public BufferedImage exportSignatureWithBackground() {
        if (!hasSignature()) {
            return null;
        }

        // Get the full panel size for consistent output
        int width = getWidth();
        int height = getHeight();

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();

        // Fill with white background
        g2.setColor(Color.WHITE);
        g2.fillRect(0, 0, width, height);

        // Enable anti-aliasing
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

        // Draw paths
        g2.setColor(PEN_COLOR);
        g2.setStroke(new BasicStroke(PEN_WIDTH, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        for (Path2D path : paths) {
            g2.draw(path);
        }

        g2.dispose();
        return image;
    }
}
