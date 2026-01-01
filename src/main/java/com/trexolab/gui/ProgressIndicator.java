package com.trexolab.gui;

import javax.swing.*;
import java.awt.*;

/**
 * A step-by-step progress indicator component.
 * Shows the current step in a multi-step process.
 */
public class ProgressIndicator extends JPanel {
    private final JLabel statusLabel;
    private final JProgressBar progressBar;
    private final String[] steps;
    private int currentStep = 0;

    public ProgressIndicator(String[] steps) {
        this.steps = steps;
        setLayout(new BorderLayout(10, 5));
        setOpaque(false);

        statusLabel = new JLabel();
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        statusLabel.setForeground(new Color(180, 185, 195));

        progressBar = new JProgressBar(0, steps.length);
        progressBar.setStringPainted(false);
        progressBar.setPreferredSize(new Dimension(200, 4));
        progressBar.setBackground(new Color(45, 50, 60));
        progressBar.setForeground(new Color(66, 133, 244));
        progressBar.setBorderPainted(false);

        add(statusLabel, BorderLayout.NORTH);
        add(progressBar, BorderLayout.CENTER);

        updateDisplay();
    }

    /**
     * Moves to the next step.
     */
    public void nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateDisplay();
        }
    }

    /**
     * Sets the current step index.
     */
    public void setStep(int step) {
        if (step >= 0 && step < steps.length) {
            currentStep = step;
            updateDisplay();
        }
    }

    /**
     * Resets to the first step.
     */
    public void reset() {
        currentStep = 0;
        updateDisplay();
    }

    /**
     * Marks all steps as complete.
     */
    public void complete() {
        currentStep = steps.length;
        progressBar.setValue(steps.length);
        statusLabel.setText("Complete");
    }

    /**
     * Sets a custom status message.
     */
    public void setStatus(String message) {
        statusLabel.setText(message);
    }

    private void updateDisplay() {
        progressBar.setValue(currentStep);
        if (currentStep < steps.length) {
            statusLabel.setText(steps[currentStep]);
        }
    }

    /**
     * Creates a simple indeterminate progress indicator.
     */
    public static ProgressIndicator createIndeterminate(String message) {
        ProgressIndicator indicator = new ProgressIndicator(new String[]{message});
        indicator.progressBar.setIndeterminate(true);
        return indicator;
    }
}
