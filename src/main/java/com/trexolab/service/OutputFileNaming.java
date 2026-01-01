package com.trexolab.service;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.prefs.Preferences;

/**
 * Manages output file naming patterns for signed PDFs.
 */
public class OutputFileNaming {
    private static final String PREF_PATTERN = "output.naming.pattern";
    private static final Preferences prefs = Preferences.userNodeForPackage(OutputFileNaming.class);

    // Available patterns
    public static final String PATTERN_ORIGINAL = "{name}";
    public static final String PATTERN_SIGNED = "{name}_signed";
    public static final String PATTERN_DATE = "{name}_{date}";
    public static final String PATTERN_DATETIME = "{name}_{datetime}";

    public static final String[][] PATTERNS = {
        {PATTERN_ORIGINAL, "Original filename (file.pdf)"},
        {PATTERN_SIGNED, "With _signed suffix (file_signed.pdf)"},
        {PATTERN_DATE, "With date (file_2024-01-15.pdf)"},
        {PATTERN_DATETIME, "With date and time (file_2024-01-15_143052.pdf)"}
    };

    private static OutputFileNaming instance;

    private OutputFileNaming() {}

    public static synchronized OutputFileNaming getInstance() {
        if (instance == null) {
            instance = new OutputFileNaming();
        }
        return instance;
    }

    /**
     * Gets the current naming pattern.
     */
    public String getPattern() {
        return prefs.get(PREF_PATTERN, PATTERN_SIGNED);
    }

    /**
     * Sets the naming pattern.
     */
    public void setPattern(String pattern) {
        prefs.put(PREF_PATTERN, pattern);
    }

    /**
     * Generates an output filename based on the current pattern.
     */
    public File generateOutputFile(File inputFile) {
        if (inputFile == null) {
            return null;
        }

        String pattern = getPattern();
        String baseName = getBaseName(inputFile);
        String dir = inputFile.getParent();

        String newName = applyPattern(baseName, pattern);
        return new File(dir, newName + ".pdf");
    }

    /**
     * Generates a preview of the output filename.
     */
    public String previewOutputName(String inputName, String pattern) {
        String baseName = inputName;
        if (baseName.toLowerCase().endsWith(".pdf")) {
            baseName = baseName.substring(0, baseName.length() - 4);
        }
        return applyPattern(baseName, pattern) + ".pdf";
    }

    /**
     * Applies the naming pattern to a base filename.
     */
    private String applyPattern(String baseName, String pattern) {
        String result = pattern;

        // Replace {name} placeholder
        result = result.replace("{name}", baseName);

        // Replace {date} placeholder
        if (result.contains("{date}")) {
            String date = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
            result = result.replace("{date}", date);
        }

        // Replace {datetime} placeholder
        if (result.contains("{datetime}")) {
            String datetime = new SimpleDateFormat("yyyy-MM-dd_HHmmss").format(new Date());
            result = result.replace("{datetime}", datetime);
        }

        return result;
    }

    /**
     * Gets the base name of a file (without extension).
     */
    private String getBaseName(File file) {
        String name = file.getName();
        int dotIndex = name.lastIndexOf('.');
        return dotIndex > 0 ? name.substring(0, dotIndex) : name;
    }

    /**
     * Gets all available patterns.
     */
    public static String[][] getAvailablePatterns() {
        return PATTERNS;
    }
}
