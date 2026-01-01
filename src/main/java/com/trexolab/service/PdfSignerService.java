package com.trexolab.service;

import com.trexolab.config.ConfigManager;
import com.trexolab.core.exception.SigningProcessException;
import com.trexolab.core.exception.TSAConfigurationException;
import com.trexolab.core.exception.UserCancelledPasswordEntryException;
import com.trexolab.core.keyStoresProvider.KeyStoreProvider;
import com.trexolab.core.keyStoresProvider.PKCS11KeyStoreProvider;
import com.trexolab.core.signer.AppearanceOptions;
import com.trexolab.core.signer.CustomTSAClientBouncyCastle;
import com.trexolab.core.signer.Signer;
import com.trexolab.gui.DialogUtils;
import com.trexolab.gui.pdfHandler.PdfViewerMain;
import com.trexolab.utils.AppConstants;
import com.trexolab.utils.CursorStateManager;
import com.itextpdf.text.pdf.PdfReader;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Map;


public class PdfSignerService {


    private static final Log log = LogFactory.getLog(PdfSignerService.class);
    private File selectedFile;
    private String pdfPassword;
    private KeyStoreProvider provider;
    private Runnable onSaveCancelled;

    public PdfSignerService() {
    }

    private static Timer reRenderSignedPdfTimer(File saveFile) {
        Timer timer = new Timer(1000, evt -> {
            SwingUtilities.invokeLater(() -> {
                PdfViewerMain.INSTANCE.renderPdfFromPath(saveFile.getAbsolutePath());
                PdfViewerMain.INSTANCE.setWindowTitle(saveFile.getAbsolutePath());
                PdfViewerMain.INSTANCE.requestFocusInWindow();
                PdfViewerMain.INSTANCE.repaint();
            });
        });
        timer.setRepeats(false);
        return timer;
    }

    public void setProvider(KeyStoreProvider provider) {
        this.provider = provider;
    }

    public void setPdfPassword(String pdfPassword) {
        this.pdfPassword = pdfPassword;
    }

    public void setSelectedFile(File selectedFile) {
        this.selectedFile = selectedFile;
    }

    public void setOnSaveCancelled(Runnable onSaveCancelled) {
        this.onSaveCancelled = onSaveCancelled;
    }

    public void launchSigningFlow(AppearanceOptions appearanceOptions) {
        // CRITICAL: Release PDFBox document from memory before signing
        // This frees up heap space for iText's signing operations on large PDFs
        PdfViewerMain.INSTANCE.releaseDocumentForSigning();

        PdfReader reader = openPdfReader(selectedFile, pdfPassword);
        signPdfDocument(reader, provider, appearanceOptions);
    }

    private PdfReader openPdfReader(File file, String password) {
        try {
            // Use PdfReader with partial=true for memory-efficient reading
            // This is CRITICAL for large PDFs - only loads xref, not entire content
            byte[] ownerPassword = (password == null || password.isEmpty()) ? null : password.getBytes();
            return new PdfReader(file.getAbsolutePath(), ownerPassword, true);
        } catch (IOException e) {
            log.error("Failed to open PDF file: " + e.getMessage(), e);
            return null;
        }
    }

    private void signPdfDocument(PdfReader reader, KeyStoreProvider provider, AppearanceOptions appearanceOptions) {
        File signedTempFile = null;
        try {
            // Show wait cursor during the signing operation
            CursorStateManager.getInstance().pushCursor(Cursor.WAIT_CURSOR, "pdf-signing");

            CustomTSAClientBouncyCastle tsaClient = getTsaClient(appearanceOptions);
            // Sign returns a temp file (memory-efficient for large PDFs)
            signedTempFile = new Signer().sign(reader, provider, "trexolab", AppConstants.APP_NAME, appearanceOptions, tsaClient);

            // Pop wait cursor before showing save dialog (user interaction)
            CursorStateManager.getInstance().popCursor("pdf-signing");

            File saveFile = showSaveFileDialog();
            if (saveFile == null) {
                log.info("User cancelled file saving.");
                // Reset UI state when save is cancelled
                if (onSaveCancelled != null) {
                    onSaveCancelled.run();
                }
                return;
            }

            // Show wait cursor during file copy
            CursorStateManager.getInstance().pushCursor(Cursor.WAIT_CURSOR, "pdf-saving");

            // Copy temp file to final destination (memory-efficient)
            Files.copy(signedTempFile.toPath(), saveFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            // Pop cursor after saving
            CursorStateManager.getInstance().popCursor("pdf-saving");

            // Render the signed PDF after 1 second delay
            if (saveFile.exists() && saveFile.length() > 0) {
                Timer timer = reRenderSignedPdfTimer(saveFile);
                timer.start();
            }

        } catch (Exception e) {
            // Ensure cursor is reset on error - pop any active cursors
            CursorStateManager.getInstance().reset();
            handleSigningException(e, provider);
        } finally {
            reader.close();
            // Cleanup temp file
            if (signedTempFile != null && signedTempFile.exists()) {
                if (!signedTempFile.delete()) {
                    log.warn("Failed to delete temp signed file: " + signedTempFile.getAbsolutePath());
                }
            }
            if (provider instanceof PKCS11KeyStoreProvider) {
                ((PKCS11KeyStoreProvider) provider).reset();
            }
        }
    }

    private void handleSigningException(Exception e, KeyStoreProvider provider) {
        if (provider instanceof PKCS11KeyStoreProvider) {
            ((PKCS11KeyStoreProvider) provider).reset();
        }

        if (e instanceof UserCancelledPasswordEntryException) {
            log.info("User cancelled password entry: " + e.getMessage());
            return;
        }

        if (e instanceof TSAConfigurationException) {
            String htmlMessage = "<html><body>"
                    + "<div style='color:#ff5555; font-weight:bold;'>Timestamp Configuration Required</div>"
                    + "<div style='margin-top:6px; color:#dddddd;'>Timestamp server URL is missing or invalid.</div>"
                    + "<div style='margin-top:6px; color:#cccccc;'>"
                    + "Please check your timestamp server settings and try again."
                    + "</div></body></html>";

            DialogUtils.showError(
                    PdfViewerMain.INSTANCE,
                    "Timestamp Error",
                    htmlMessage
            );
            return;
        }

        DialogUtils.showExceptionDialog(
                PdfViewerMain.INSTANCE,
                e instanceof SigningProcessException ? "Error while signing PDF" : "Unexpected Error Occurred",
                e
        );

        log.error("Error while signing PDF", e);
    }

    private File showSaveFileDialog() {
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Save Signed PDF");
        fileChooser.setAcceptAllFileFilterUsed(false);
        fileChooser.addChoosableFileFilter(new javax.swing.filechooser.FileNameExtensionFilter("PDF Documents (*.pdf)", "pdf"));

        File desktopDir = new File(System.getProperty("user.home"), "Desktop");
        if (desktopDir.exists()) {
            fileChooser.setCurrentDirectory(desktopDir);
        }

        File defaultFile = new File(desktopDir, selectedFile.getName());
        fileChooser.setSelectedFile(defaultFile);

        while (true) {
            int userSelection = fileChooser.showSaveDialog(null);
            if (userSelection != JFileChooser.APPROVE_OPTION) {
                return null;
            }

            File chosenFile = fileChooser.getSelectedFile();
            if (!chosenFile.getName().toLowerCase().endsWith(".pdf")) {
                chosenFile = new File(chosenFile.getAbsolutePath() + ".pdf");
            }

            if (chosenFile.exists()) {
                int overwrite = JOptionPane.showConfirmDialog(
                        null,
                        "The file already exists. Do you want to replace it?",
                        "Confirm Overwrite",
                        JOptionPane.YES_NO_OPTION,
                        JOptionPane.WARNING_MESSAGE
                );
                if (overwrite == JOptionPane.YES_OPTION) {
                    return chosenFile;
                }
            } else {
                return chosenFile;
            }
        }
    }

    private CustomTSAClientBouncyCastle getTsaClient(AppearanceOptions appearanceOptions) {
        if (!appearanceOptions.isTimestampEnabled()) return null;
        Map<String, String> tsaConfig = ConfigManager.getTimestampServer();
        return new CustomTSAClientBouncyCastle(
                tsaConfig.get("url"),
                tsaConfig.getOrDefault("username", null),
                tsaConfig.getOrDefault("password", null),
                8192,
                "SHA-256"
        );
    }
}
