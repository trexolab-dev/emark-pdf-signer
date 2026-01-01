package com.trexolab.gui;

import java.io.FileNotFoundException;
import java.net.ConnectException;
import java.net.UnknownHostException;
import java.security.cert.CertificateException;

/**
 * Converts technical exceptions to user-friendly error messages.
 */
public class ErrorMessageHelper {

    /**
     * Gets a user-friendly message for an exception.
     */
    public static String getUserFriendlyMessage(Throwable e) {
        if (e == null) {
            return "An unexpected error occurred.";
        }

        String message = e.getMessage();

        // File errors
        if (e instanceof FileNotFoundException) {
            return "File not found: " + (message != null ? message : "Unknown file");
        }

        // Network errors
        if (e instanceof ConnectException || e instanceof UnknownHostException) {
            return "Network error: Unable to connect. Please check your internet connection.";
        }

        // Certificate errors
        if (e instanceof CertificateException) {
            return "Certificate not found or invalid. Please check your keystore settings.";
        }

        // Password errors
        if (message != null) {
            String lowerMsg = message.toLowerCase();
            if (lowerMsg.contains("password") || lowerMsg.contains("encrypted")) {
                if (lowerMsg.contains("invalid") || lowerMsg.contains("incorrect") || lowerMsg.contains("wrong")) {
                    return "Invalid password. Please try again.";
                }
                return "Password required. Please enter the password.";
            }

            // PDF errors
            if (lowerMsg.contains("pdf") && (lowerMsg.contains("invalid") || lowerMsg.contains("corrupt"))) {
                return "Invalid or corrupted PDF file.";
            }

            // Signing errors
            if (lowerMsg.contains("sign")) {
                return "Signing failed. Please check your certificate and try again.";
            }

            // Token/PKCS11 errors
            if (lowerMsg.contains("pkcs") || lowerMsg.contains("token")) {
                return "Token error: " + simplifyMessage(message);
            }
        }

        // Generic with simplified message
        if (message != null && !message.isEmpty()) {
            return simplifyMessage(message);
        }

        return "An unexpected error occurred.";
    }

    /**
     * Simplifies a technical error message.
     */
    private static String simplifyMessage(String message) {
        if (message == null) {
            return "An unexpected error occurred.";
        }

        // Remove package names
        message = message.replaceAll("[a-z]+\\.[a-z]+\\.[a-zA-Z]+:", "");

        // Remove stack trace indicators
        message = message.replaceAll("\\s+at\\s+.*", "");

        // Trim and limit length
        message = message.trim();
        if (message.length() > 150) {
            message = message.substring(0, 147) + "...";
        }

        return message;
    }

    /**
     * Shows a user-friendly error dialog.
     */
    public static void showError(java.awt.Component parent, String title, Throwable e) {
        String message = getUserFriendlyMessage(e);
        DialogUtils.showError(parent, title, message);
    }

    /**
     * Shows a user-friendly error dialog with custom message prefix.
     */
    public static void showError(java.awt.Component parent, String title, String prefix, Throwable e) {
        String message = prefix + "\n\n" + getUserFriendlyMessage(e);
        DialogUtils.showError(parent, title, message);
    }
}
