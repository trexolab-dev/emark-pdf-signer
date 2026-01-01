package com.trexolab.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Manages signature appearance profiles.
 * Profiles are stored as JSON in ~/.eMark/appearance-profiles.json
 */
public class AppearanceProfileManager {

    private static final Log log = LogFactory.getLog(AppearanceProfileManager.class);
    private static final String PROFILES_FILE = "appearance-profiles.json";
    private static AppearanceProfileManager instance;

    private final Path profilesPath;
    private final ObjectMapper objectMapper;
    private Map<String, AppearanceProfile> profiles;

    private AppearanceProfileManager() {
        Path emarkDir = Paths.get(System.getProperty("user.home"), ".eMark");
        this.profilesPath = emarkDir.resolve(PROFILES_FILE);
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        this.profiles = new LinkedHashMap<>();

        // Ensure directory exists
        try {
            Files.createDirectories(emarkDir);
        } catch (IOException e) {
            log.error("Failed to create .eMark directory", e);
        }

        loadProfiles();
    }

    public static synchronized AppearanceProfileManager getInstance() {
        if (instance == null) {
            instance = new AppearanceProfileManager();
        }
        return instance;
    }

    /**
     * Loads profiles from disk.
     */
    private void loadProfiles() {
        if (!Files.exists(profilesPath)) {
            profiles = new LinkedHashMap<>();
            return;
        }

        try {
            Map<String, AppearanceProfile> loaded = objectMapper.readValue(
                    profilesPath.toFile(),
                    new TypeReference<LinkedHashMap<String, AppearanceProfile>>() {}
            );
            profiles = loaded != null ? loaded : new LinkedHashMap<>();
        } catch (Exception e) {
            log.error("Failed to load appearance profiles", e);
            profiles = new LinkedHashMap<>();
        }
    }

    /**
     * Saves profiles to disk.
     */
    private void saveProfiles() {
        try {
            objectMapper.writeValue(profilesPath.toFile(), profiles);
        } catch (IOException e) {
            log.error("Failed to save appearance profiles", e);
        }
    }

    /**
     * Returns all profile names.
     */
    public List<String> getProfileNames() {
        return new ArrayList<>(profiles.keySet());
    }

    /**
     * Returns all profiles.
     */
    public List<AppearanceProfile> getProfiles() {
        return new ArrayList<>(profiles.values());
    }

    /**
     * Gets a profile by name.
     */
    public AppearanceProfile getProfile(String name) {
        return profiles.get(name);
    }

    /**
     * Saves or updates a profile.
     */
    public void saveProfile(AppearanceProfile profile) {
        profiles.put(profile.getName(), profile);
        saveProfiles();
    }

    /**
     * Deletes a profile by name.
     */
    public boolean deleteProfile(String name) {
        if (profiles.remove(name) != null) {
            saveProfiles();
            return true;
        }
        return false;
    }

    /**
     * Checks if a profile exists.
     */
    public boolean profileExists(String name) {
        return profiles.containsKey(name);
    }

    /**
     * Represents a saved appearance profile.
     */
    public static class AppearanceProfile {
        private String name;
        private String renderingMode;
        private String certificationLevel;
        private String reason;
        private String location;
        private String customText;
        private boolean ltvEnabled;
        private boolean timestampEnabled;
        private boolean greenTickEnabled;
        private boolean includeCompany;
        private boolean includeEntireSubject;
        private String dateFormat;
        private String signatureImagePath;

        public AppearanceProfile() {
        }

        public AppearanceProfile(String name) {
            this.name = name;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRenderingMode() {
            return renderingMode;
        }

        public void setRenderingMode(String renderingMode) {
            this.renderingMode = renderingMode;
        }

        public String getCertificationLevel() {
            return certificationLevel;
        }

        public void setCertificationLevel(String certificationLevel) {
            this.certificationLevel = certificationLevel;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getCustomText() {
            return customText;
        }

        public void setCustomText(String customText) {
            this.customText = customText;
        }

        public boolean isLtvEnabled() {
            return ltvEnabled;
        }

        public void setLtvEnabled(boolean ltvEnabled) {
            this.ltvEnabled = ltvEnabled;
        }

        public boolean isTimestampEnabled() {
            return timestampEnabled;
        }

        public void setTimestampEnabled(boolean timestampEnabled) {
            this.timestampEnabled = timestampEnabled;
        }

        public boolean isGreenTickEnabled() {
            return greenTickEnabled;
        }

        public void setGreenTickEnabled(boolean greenTickEnabled) {
            this.greenTickEnabled = greenTickEnabled;
        }

        public boolean isIncludeCompany() {
            return includeCompany;
        }

        public void setIncludeCompany(boolean includeCompany) {
            this.includeCompany = includeCompany;
        }

        public boolean isIncludeEntireSubject() {
            return includeEntireSubject;
        }

        public void setIncludeEntireSubject(boolean includeEntireSubject) {
            this.includeEntireSubject = includeEntireSubject;
        }

        public String getDateFormat() {
            return dateFormat;
        }

        public void setDateFormat(String dateFormat) {
            this.dateFormat = dateFormat;
        }

        public String getSignatureImagePath() {
            return signatureImagePath;
        }

        public void setSignatureImagePath(String signatureImagePath) {
            this.signatureImagePath = signatureImagePath;
        }

        @Override
        public String toString() {
            return name;
        }
    }
}
