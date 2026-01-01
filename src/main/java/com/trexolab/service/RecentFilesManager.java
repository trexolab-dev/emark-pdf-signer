package com.trexolab.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.prefs.Preferences;

/**
 * Manages recently opened PDF files.
 * Stores up to 10 recent files in user preferences.
 */
public class RecentFilesManager {
    private static final Log log = LogFactory.getLog(RecentFilesManager.class);
    private static final String PREF_RECENT_FILES = "recent.files";
    private static final String SEPARATOR = "|";
    private static final int MAX_RECENT_FILES = 10;

    private static RecentFilesManager instance;
    private final Preferences prefs;
    private final List<File> recentFiles;

    private RecentFilesManager() {
        prefs = Preferences.userNodeForPackage(RecentFilesManager.class);
        recentFiles = new ArrayList<>();
        loadRecentFiles();
    }

    public static synchronized RecentFilesManager getInstance() {
        if (instance == null) {
            instance = new RecentFilesManager();
        }
        return instance;
    }

    /**
     * Adds a file to recent files list.
     */
    public void addRecentFile(File file) {
        if (file == null || !file.exists()) {
            return;
        }

        // Remove if already exists (will be re-added at top)
        recentFiles.removeIf(f -> f.getAbsolutePath().equals(file.getAbsolutePath()));

        // Add at beginning
        recentFiles.add(0, file);

        // Trim to max size
        while (recentFiles.size() > MAX_RECENT_FILES) {
            recentFiles.remove(recentFiles.size() - 1);
        }

        saveRecentFiles();
        log.debug("Added to recent files: " + file.getName());
    }

    /**
     * Gets the list of recent files.
     */
    public List<File> getRecentFiles() {
        // Clean up non-existent files
        recentFiles.removeIf(f -> !f.exists());
        return new ArrayList<>(recentFiles);
    }

    /**
     * Clears all recent files.
     */
    public void clearRecentFiles() {
        recentFiles.clear();
        saveRecentFiles();
        log.info("Recent files cleared");
    }

    private void loadRecentFiles() {
        String saved = prefs.get(PREF_RECENT_FILES, "");
        if (saved.isEmpty()) {
            return;
        }

        String[] paths = saved.split("\\" + SEPARATOR);
        for (String path : paths) {
            if (!path.isEmpty()) {
                File file = new File(path);
                if (file.exists()) {
                    recentFiles.add(file);
                }
            }
        }

        log.debug("Loaded " + recentFiles.size() + " recent files");
    }

    private void saveRecentFiles() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < recentFiles.size(); i++) {
            if (i > 0) {
                sb.append(SEPARATOR);
            }
            sb.append(recentFiles.get(i).getAbsolutePath());
        }
        prefs.put(PREF_RECENT_FILES, sb.toString());
    }
}
