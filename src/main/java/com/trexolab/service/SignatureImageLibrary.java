package com.trexolab.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Manages a library of saved signature images.
 * Stores signature images in the user's home directory.
 */
public class SignatureImageLibrary {
    private static final Log log = LogFactory.getLog(SignatureImageLibrary.class);
    private static final String LIBRARY_DIR = ".eMark/signature-images";

    private static SignatureImageLibrary instance;
    private final File libraryDir;

    private SignatureImageLibrary() {
        String userHome = System.getProperty("user.home");
        libraryDir = new File(userHome, LIBRARY_DIR);
        if (!libraryDir.exists()) {
            libraryDir.mkdirs();
        }
    }

    public static synchronized SignatureImageLibrary getInstance() {
        if (instance == null) {
            instance = new SignatureImageLibrary();
        }
        return instance;
    }

    /**
     * Saves a signature image to the library.
     */
    public File saveSignature(BufferedImage image, String name) throws IOException {
        if (image == null || name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Image and name are required");
        }

        // Sanitize filename
        String safeName = name.replaceAll("[^a-zA-Z0-9-_]", "_");
        File file = new File(libraryDir, safeName + ".png");

        // Ensure unique filename
        int counter = 1;
        while (file.exists()) {
            file = new File(libraryDir, safeName + "_" + counter + ".png");
            counter++;
        }

        ImageIO.write(image, "PNG", file);
        log.info("Saved signature image: " + file.getName());
        return file;
    }

    /**
     * Gets all saved signature images.
     */
    public List<SignatureImage> getSignatures() {
        List<SignatureImage> signatures = new ArrayList<>();

        File[] files = libraryDir.listFiles((dir, name) ->
                name.toLowerCase().endsWith(".png") ||
                name.toLowerCase().endsWith(".jpg") ||
                name.toLowerCase().endsWith(".jpeg"));

        if (files != null) {
            for (File file : files) {
                try {
                    BufferedImage image = ImageIO.read(file);
                    if (image != null) {
                        signatures.add(new SignatureImage(file, image));
                    }
                } catch (IOException e) {
                    log.warn("Failed to load signature image: " + file.getName());
                }
            }
        }

        return signatures;
    }

    /**
     * Deletes a signature image from the library.
     */
    public boolean deleteSignature(File file) {
        if (file != null && file.exists() && file.getParentFile().equals(libraryDir)) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("Deleted signature image: " + file.getName());
            }
            return deleted;
        }
        return false;
    }

    /**
     * Gets the library directory path.
     */
    public File getLibraryDir() {
        return libraryDir;
    }

    /**
     * Represents a saved signature image.
     */
    public static class SignatureImage {
        private final File file;
        private final BufferedImage image;

        public SignatureImage(File file, BufferedImage image) {
            this.file = file;
            this.image = image;
        }

        public File getFile() {
            return file;
        }

        public BufferedImage getImage() {
            return image;
        }

        public String getName() {
            String name = file.getName();
            int dotIndex = name.lastIndexOf('.');
            return dotIndex > 0 ? name.substring(0, dotIndex) : name;
        }
    }
}
