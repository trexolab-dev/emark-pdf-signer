package com.trexolab.gui;

import com.trexolab.App;
import com.trexolab.core.keyStoresProvider.X509SubjectUtils;
import com.trexolab.core.signer.AppearanceOptions;
import com.trexolab.core.signer.SignatureDateFormats;
import com.trexolab.model.CertificationLevel;
import com.trexolab.model.RenderingMode;
import com.itextpdf.text.pdf.PdfSignatureAppearance;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.trexolab.service.AppearanceProfileManager;
import com.trexolab.service.AppearanceProfileManager.AppearanceProfile;
import com.trexolab.service.SignatureImageLibrary;
import com.trexolab.service.SignatureImageLibrary.SignatureImage;

import javax.swing.*;
import javax.swing.border.TitledBorder;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.swing.text.AbstractDocument;
import javax.swing.text.DocumentFilter;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.File;
import java.security.cert.X509Certificate;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.prefs.Preferences;

import static com.trexolab.core.keyStoresProvider.X509SubjectUtils.getCommonName;
import static com.trexolab.core.keyStoresProvider.X509SubjectUtils.getOrganization;

public class SignatureAppearanceDialog extends JDialog {

    private static final Log log = LogFactory.getLog(SignatureAppearanceDialog.class);
    private final Frame parent;
    // Preferences node
    private final Preferences prefs = Preferences.userNodeForPackage(SignatureAppearanceDialog.class);
    private X509Certificate certificate;
    private JTextField reasonField;
    private JTextField locationField;
    private JTextField customTextField;
    private JCheckBox ltvCheckbox, timestampCheckbox, greenTickCheckbox, includeCompanyCheckbox, includeEntireSubjectDNCheckbox;
    private JComboBox<String> renderingModeCombo, certLevelCombo;
    private JComboBox<SignatureDateFormats.FormatterType> dateFormatOptions;
    private JComboBox<SignatureImageItem> signatureLibraryCombo;
    private JComboBox<ProfileItem> profileCombo;
    private File selectedImageFile;
    private List<SignatureImage> savedSignatures;
    private JPanel previewPanel;
    private AppearanceOptions appearanceOptions;
    private boolean isInitializing = false; // Flag to prevent recursive updates during initialization
    private boolean isProfileEditMode = false; // True when opened from Settings for profile editing
    private String editingProfileName = null; // Profile name being edited (for profile edit mode)
    private final AppearanceProfileManager profileManager = AppearanceProfileManager.getInstance();

    public SignatureAppearanceDialog(Frame parent) {
        super(parent, "Signature Appearance Settings", true);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setResizable(true);
        this.parent = parent;
    }

    public void setCertificate(X509Certificate certificate) {
        this.certificate = certificate;
    }

    /**
     * Sets whether the dialog is in profile edit mode (opened from Settings).
     * In profile edit mode, the profile selector is hidden.
     */
    public void setProfileEditMode(boolean profileEditMode) {
        this.isProfileEditMode = profileEditMode;
    }

    /**
     * Sets the profile name being edited.
     * Must be called before showAppearanceConfigPrompt() for profile edit mode.
     */
    public void setEditingProfileName(String profileName) {
        this.editingProfileName = profileName;
    }

    public void showAppearanceConfigPrompt() {
        // Create main content panel (will be scrollable)
        JPanel mainContentPanel = new JPanel(new BorderLayout(15, 10));
        mainContentPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 10, 20));

        // Profile selection at top (only show in signing flow, not in profile edit mode)
        if (!isProfileEditMode) {
            JPanel profilePanel = createProfileSelectionPanel();
            mainContentPanel.add(profilePanel, BorderLayout.NORTH);
        }

        JPanel formPanel = createFormPanel();
        mainContentPanel.add(formPanel, BorderLayout.CENTER);

        previewPanel = new JPanel(new BorderLayout());
        TitledBorder titledBorder = BorderFactory.createTitledBorder("Live Preview");
        titledBorder.setTitleColor(Color.LIGHT_GRAY);
        titledBorder.setTitleFont(new Font("SansSerif", Font.PLAIN, 12));
        previewPanel.setBorder(titledBorder);
        previewPanel.setBackground(new Color(106, 106, 106));
        previewPanel.setPreferredSize(new Dimension(400, 210)); // Set minimum size for preview

        JPanel southPanel = new JPanel(new BorderLayout());
        southPanel.add(previewPanel, BorderLayout.CENTER);
        mainContentPanel.add(southPanel, BorderLayout.SOUTH);

        // Create scroll pane for main content
        JScrollPane scrollPane = new JScrollPane(mainContentPanel);
        scrollPane.setBorder(null);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scrollPane.getVerticalScrollBar().setUnitIncrement(16); // Smooth scrolling

        // Button panel (non-scrollable, always visible at bottom)
        JPanel buttonPanel = new JPanel(new BorderLayout());
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(5, 10, 10, 10));

        JPanel rightButtons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 5, 0));
        JButton cancelButton = new JButton("Cancel");
        cancelButton.addActionListener(e -> dispose());

        if (isProfileEditMode) {
            // Profile edit mode: Show Save and Cancel buttons only
            JButton saveButton = new JButton("Save");
            getRootPane().setDefaultButton(saveButton);
            saveButton.addActionListener(e -> saveProfileAndClose());
            rightButtons.add(saveButton);
            rightButtons.add(cancelButton);
        } else {
            // Normal signing flow: Show Save as Profile, Sign, and Cancel
            JButton saveProfileButton = new JButton("Save as Profile");
            saveProfileButton.addActionListener(e -> saveCurrentAsProfile());

            JPanel leftButtons = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
            leftButtons.add(saveProfileButton);
            buttonPanel.add(leftButtons, BorderLayout.WEST);

            JButton signButton = new JButton("Sign");
            getRootPane().setDefaultButton(signButton);
            signButton.addActionListener(this::onSubmit);
            rightButtons.add(signButton);
            rightButtons.add(cancelButton);
        }

        buttonPanel.add(rightButtons, BorderLayout.EAST);

        // Main container with scroll pane and fixed button panel
        JPanel containerPanel = new JPanel(new BorderLayout());
        containerPanel.add(scrollPane, BorderLayout.CENTER);
        containerPanel.add(buttonPanel, BorderLayout.SOUTH);

        add(containerPanel);

        isInitializing = true;
        setupListeners();
        loadPreferences(); // <-- Load saved settings

        // If in profile edit mode, load the profile settings (overrides preferences)
        if (isProfileEditMode && editingProfileName != null) {
            AppearanceProfile profile = profileManager.getProfile(editingProfileName);
            if (profile != null) {
                loadProfile(profile);
            }
        }

        isInitializing = false;

        // Force initial preview update
        SwingUtilities.invokeLater(this::updatePreview);

        pack();

        // Set initial size based on content, with max height constraint
        Dimension preferredSize = getPreferredSize();
        int maxHeight = (int) (Toolkit.getDefaultToolkit().getScreenSize().height * 0.85); // 85% of screen height

        if (preferredSize.height > maxHeight) {
            setSize(preferredSize.width, maxHeight);
        } else {
            setSize(preferredSize);
        }

        // Set minimum size to prevent dialog from being too small
        setMinimumSize(new Dimension(Math.min(700, preferredSize.width), 400));

        setLocationRelativeTo(parent);
        setVisible(true);
    }

    private JPanel createFormPanel() {
        JPanel formPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(6, 6, 6, 6);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;

        // Filters
        DocumentFilter reasonFilter = TextFieldValidators.createAlphanumericFilter(25);
        DocumentFilter locationFilter = TextFieldValidators.createAlphanumericFilter(25);
        DocumentFilter customTextFilter = TextFieldValidators.createAlphanumericFilter(60);

        // Rendering Mode
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(new JLabel("Rendering Mode:"), gbc);
        gbc.gridy++;
        renderingModeCombo = new JComboBox<>(
                Arrays.stream(RenderingMode.values()).map(RenderingMode::getLabel).toArray(String[]::new)
        );
        formPanel.add(renderingModeCombo, gbc);

        // Certification Level
        gbc.gridx = 1;
        gbc.gridy = 0;
        formPanel.add(new JLabel("Signature Permissions:"), gbc);
        gbc.gridy++;
        certLevelCombo = new JComboBox<>(
                Arrays.stream(CertificationLevel.values()).map(CertificationLevel::getLabel).toArray(String[]::new)
        );
        formPanel.add(certLevelCombo, gbc);

        // Reason
        gbc.gridx = 0;
        gbc.gridy++;
        formPanel.add(new JLabel("Reason (max 25 chars):"), gbc);
        gbc.gridy++;
        reasonField = new JTextField(15);
        ((AbstractDocument) reasonField.getDocument()).setDocumentFilter(reasonFilter);
        formPanel.add(reasonField, gbc);

        // Location
        gbc.gridx = 1;
        gbc.gridy -= 1;
        formPanel.add(new JLabel("Location (max 25 chars):"), gbc);
        gbc.gridy++;
        locationField = new JTextField(15);
        ((AbstractDocument) locationField.getDocument()).setDocumentFilter(locationFilter);
        formPanel.add(locationField, gbc);

        // Custom Text
        gbc.gridx = 0;
        gbc.gridy++;
        gbc.gridwidth = 2;
        formPanel.add(new JLabel("Custom Text (max 60 chars):"), gbc);
        gbc.gridy++;
        customTextField = new JTextField(30);
        ((AbstractDocument) customTextField.getDocument()).setDocumentFilter(customTextFilter);
        formPanel.add(customTextField, gbc);
        gbc.gridwidth = 1;

        // Options Section
        gbc.gridx = 0;
        gbc.gridy++;
        gbc.gridwidth = 2;
        JPanel checkboxPanel = new JPanel(new GridLayout(0, 2, 5, 5));
        checkboxPanel.setBorder(BorderFactory.createTitledBorder("Options"));

        ltvCheckbox = new JCheckBox("LTV");
        timestampCheckbox = new JCheckBox("Timestamp");
        greenTickCheckbox = new JCheckBox("Green Tick");
        includeCompanyCheckbox = new JCheckBox("Include Org Name");
        includeEntireSubjectDNCheckbox = new JCheckBox("Include Subject DN");

        String orgName = certificate != null ? getOrganization(certificate) : null;
        boolean isPersonalCert = orgName != null && orgName.equalsIgnoreCase("Personal");
        includeCompanyCheckbox.setEnabled(!isPersonalCert);
        includeCompanyCheckbox.setToolTipText(isPersonalCert
                ? "Organization name not available for personal certificates."
                : "Include organization name from certificate.");
        includeEntireSubjectDNCheckbox.setToolTipText("Include full Subject Distinguished Name (DN).");

        checkboxPanel.add(ltvCheckbox);
        checkboxPanel.add(timestampCheckbox);
        checkboxPanel.add(includeCompanyCheckbox);
        checkboxPanel.add(includeEntireSubjectDNCheckbox);
        checkboxPanel.add(greenTickCheckbox);

        formPanel.add(checkboxPanel, gbc);
        gbc.gridwidth = 1;

        // Date Format
        gbc.gridx = 0;
        gbc.gridy++;
        formPanel.add(new JLabel("Date Format:"), gbc);

        gbc.gridx = 1;
        dateFormatOptions = new JComboBox<>(SignatureDateFormats.FormatterType.values());
        dateFormatOptions.setSelectedItem(SignatureDateFormats.FormatterType.COMPACT);
        dateFormatOptions.setToolTipText("Select date format");
        formPanel.add(dateFormatOptions, gbc);

        // Signature Image Selection (from library or browse)
        gbc.gridx = 0;
        gbc.gridy++;
        formPanel.add(new JLabel("Signature Image:"), gbc);

        gbc.gridx = 1;
        signatureLibraryCombo = new JComboBox<>();
        signatureLibraryCombo.setEnabled(false);
        populateSignatureLibraryCombo();
        formPanel.add(signatureLibraryCombo, gbc);

        return formPanel;
    }

    /**
     * Opens a file chooser to browse for an image file.
     */
    private void browseForImage() {
        JFileChooser chooser = new JFileChooser();
        chooser.setDialogTitle("Select Signature Image");
        chooser.setFileFilter(new FileNameExtensionFilter("Image Files (PNG, JPG)", "png", "jpg", "jpeg"));

        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            selectedImageFile = chooser.getSelectedFile();
            // Reset combo to placeholder since we're using a custom file
            signatureLibraryCombo.setSelectedIndex(0);
            updatePreviewAndSave();
        }
    }

    /**
     * Populates the signature library combo box with saved signatures.
     */
    private void populateSignatureLibraryCombo() {
        signatureLibraryCombo.removeAllItems();

        // Add placeholder
        signatureLibraryCombo.addItem(new SignatureImageItem());

        // Load saved signatures from library
        savedSignatures = SignatureImageLibrary.getInstance().getSignatures();

        for (SignatureImage sig : savedSignatures) {
            signatureLibraryCombo.addItem(new SignatureImageItem(sig));
        }

        // Add browse option at the end
        signatureLibraryCombo.addItem(new SignatureImageItem(true));
    }

    private void setupListeners() {
        // Profile combo listener - only add if profile combo exists (not in edit mode)
        if (profileCombo != null) {
            profileCombo.addActionListener(e -> {
                if (isInitializing) return;

                ProfileItem selected = (ProfileItem) profileCombo.getSelectedItem();
                if (selected != null && selected.getProfile() != null) {
                    loadProfile(selected.getProfile());
                }
            });
        }

        // Signature library combo listener
        signatureLibraryCombo.addActionListener(e -> {
            if (isInitializing) return;

            SignatureImageItem selected = (SignatureImageItem) signatureLibraryCombo.getSelectedItem();
            if (selected == null) return;

            if (selected.isBrowseOption()) {
                // Open file chooser
                browseForImage();
                // Reset to placeholder if no file was selected
                if (selectedImageFile == null) {
                    signatureLibraryCombo.setSelectedIndex(0);
                }
            } else if (!selected.isPlaceholder() && selected.getFile() != null) {
                // Use selected signature from library
                selectedImageFile = selected.getFile();
                updatePreviewAndSave();
            } else {
                // Placeholder selected - clear image if not manually browsed
                // Keep the manually selected file if any
            }
        });

        renderingModeCombo.addItemListener(e -> {
            boolean isGraphic = "Name and Graphic".equals(renderingModeCombo.getSelectedItem());
            signatureLibraryCombo.setEnabled(isGraphic);
            greenTickCheckbox.setEnabled(!isGraphic); // disable green tick for graphic rendering
            updatePreviewAndSave();
        });

        // Add listener for certification level combo
        certLevelCombo.addItemListener(e -> updatePreviewAndSave());

        // Checkbox listeners with auto-save
        ltvCheckbox.addActionListener(e -> updatePreviewAndSave());
        timestampCheckbox.addActionListener(e -> updatePreviewAndSave());
        greenTickCheckbox.addActionListener(e -> updatePreviewAndSave());
        includeCompanyCheckbox.addActionListener(e -> updatePreviewAndSave());

        includeEntireSubjectDNCheckbox.addActionListener(e -> {
            boolean selected = includeEntireSubjectDNCheckbox.isSelected();
            String org = certificate != null ? getOrganization(certificate) : null;
            boolean isPersonal = org != null && org.equalsIgnoreCase("Personal");
            includeCompanyCheckbox.setEnabled(!selected && !isPersonal);
            updatePreviewAndSave();
        });

        // Text field listeners with auto-save
        DocumentListener autoSaveListener = new DocumentListener() {
            public void insertUpdate(DocumentEvent e) {
                updatePreviewAndSave();
            }

            public void removeUpdate(DocumentEvent e) {
                updatePreviewAndSave();
            }

            public void changedUpdate(DocumentEvent e) {
                updatePreviewAndSave();
            }
        };
        reasonField.getDocument().addDocumentListener(autoSaveListener);
        locationField.getDocument().addDocumentListener(autoSaveListener);
        customTextField.getDocument().addDocumentListener(autoSaveListener);

        // Date format
        dateFormatOptions.addActionListener(e -> updatePreviewAndSave());
    }

    /**
     * Helper method to update preview and save preferences in one call
     */
    private void updatePreviewAndSave() {
        updatePreview();
        if (!isInitializing) {
            savePreferences();
        }
    }

    private void loadPreferences() {
        // Load Rendering Mode
        String savedRendering = prefs.get("renderingMode", RenderingMode.NAME_AND_DESCRIPTION.getLabel());
        renderingModeCombo.setSelectedItem(savedRendering);

        // Load Certification Level
        String savedCertLevel = prefs.get("certLevel", CertificationLevel.NO_CHANGES_ALLOWED.getLabel());
        certLevelCombo.setSelectedItem(savedCertLevel);

        // Load text fields
        reasonField.setText(prefs.get("reason", ""));
        locationField.setText(prefs.get("location", ""));
        customTextField.setText(prefs.get("customText", ""));

        // Load checkboxes
        ltvCheckbox.setSelected(prefs.getBoolean("ltv", false));
        timestampCheckbox.setSelected(prefs.getBoolean("timestamp", true)); // default true
        greenTickCheckbox.setSelected(prefs.getBoolean("greenTick", false));
        includeCompanyCheckbox.setSelected(prefs.getBoolean("includeCompany", true));
        includeEntireSubjectDNCheckbox.setSelected(prefs.getBoolean("includeEntireSubject", false));

        // Load date format
        try {
            String fmtName = prefs.get("dateFormat", SignatureDateFormats.FormatterType.COMPACT.name());
            SignatureDateFormats.FormatterType fmt = SignatureDateFormats.FormatterType.valueOf(fmtName);
            dateFormatOptions.setSelectedItem(fmt);
        } catch (Exception ex) {
            log.warn("Invalid date format in prefs, using default", ex);
            dateFormatOptions.setSelectedItem(SignatureDateFormats.FormatterType.COMPACT);
        }

        // Update UI state based on loaded values
        boolean isGraphic = "Name and Graphic".equals(renderingModeCombo.getSelectedItem());
        signatureLibraryCombo.setEnabled(isGraphic);

        String org = certificate != null ? getOrganization(certificate) : null;
        boolean isPersonalCert = org != null && org.equalsIgnoreCase("Personal");
        includeCompanyCheckbox.setEnabled(!isPersonalCert && !includeEntireSubjectDNCheckbox.isSelected());
    }

    private void savePreferences() {
        try {
            prefs.put("renderingMode", (String) renderingModeCombo.getSelectedItem());
            prefs.put("certLevel", (String) certLevelCombo.getSelectedItem());
            prefs.put("reason", reasonField.getText().trim());
            prefs.put("location", locationField.getText().trim());
            prefs.put("customText", customTextField.getText().trim());

            prefs.putBoolean("ltv", ltvCheckbox.isSelected());
            prefs.putBoolean("timestamp", timestampCheckbox.isSelected());
            prefs.putBoolean("greenTick", greenTickCheckbox.isSelected());
            prefs.putBoolean("includeCompany", includeCompanyCheckbox.isSelected());
            prefs.putBoolean("includeEntireSubject", includeEntireSubjectDNCheckbox.isSelected());

            SignatureDateFormats.FormatterType fmt = (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem();
            prefs.put("dateFormat", fmt.name());

            // Flush to disk (optional, but ensures immediate write)
            prefs.flush();
        } catch (Exception ex) {
            log.error("Failed to save preferences", ex);
        }
    }

    private void updatePreview() {
        if (previewPanel == null) {
            return; // Not yet initialized
        }

        previewPanel.removeAll();

        String previewText = buildPreviewText();
        SignatureDateFormats.FormatterType fmtType = (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem();
        String time = ZonedDateTime.now().format(SignatureDateFormats.getFormatter(fmtType));

        JPanel overlayContainer = createOverlayContainer(previewText, time);

        if (greenTickCheckbox.isSelected()) {
            applyGreenTickOverlay(overlayContainer);
        }

        JPanel centerWrapper = wrapInCenterPanel(overlayContainer);
        previewPanel.setLayout(new BorderLayout());
        previewPanel.add(centerWrapper, BorderLayout.CENTER);
        previewPanel.revalidate();
        previewPanel.repaint();
    }

    /**
     * ========================== Extracted helper methods ==========================
     **/

    private String buildPreviewText() {
        StringBuilder sb = new StringBuilder();

        if (certificate != null) {
            if (includeEntireSubjectDNCheckbox.isSelected()) {
                sb.append(X509SubjectUtils.getFullSubjectDN(certificate)).append("\n");
            } else {
                sb.append("Signed by: ").append(getCommonName(certificate)).append("\n");
                String org = getOrganization(certificate);
                if (includeCompanyCheckbox.isSelected() && org != null && !org.trim().isEmpty()) {
                    sb.append("ORG: ").append(org).append("\n");
                }
            }
        } else {
            // No certificate - show placeholder text for profile editing
            sb.append("Signed by: [Certificate Name]\n");
            if (includeCompanyCheckbox.isSelected()) {
                sb.append("ORG: [Organization]\n");
            }
        }

        sb.append("Date: ").append(ZonedDateTime.now().format(SignatureDateFormats.getFormatter(
                (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem()))).append("\n");

        if (!reasonField.getText().trim().isEmpty())
            sb.append("Reason: ").append(reasonField.getText().trim()).append("\n");
        if (!locationField.getText().trim().isEmpty())
            sb.append("Location: ").append(locationField.getText().trim()).append("\n");
        if (!customTextField.getText().trim().isEmpty()) sb.append(customTextField.getText().trim()).append("\n");

        return sb.toString();
    }

    private JPanel createOverlayContainer(String previewText, String time) {
        JPanel overlayContainer = new JPanel();
        overlayContainer.setLayout(new OverlayLayout(overlayContainer));
        overlayContainer.setPreferredSize(new Dimension(400, 200));
        overlayContainer.setOpaque(false);

        JPanel contentPanel = new JPanel();
        contentPanel.setLayout(new BoxLayout(contentPanel, BoxLayout.X_AXIS));
        contentPanel.setOpaque(false);

        JLabel leftLabel = createLeftLabel();
        JLabel rightLabel = createRightLabel(previewText);

        contentPanel.add(leftLabel);
        contentPanel.add(rightLabel);
        contentPanel.add(Box.createHorizontalGlue());

        overlayContainer.add(contentPanel);
        return overlayContainer;
    }

    private JLabel createLeftLabel() {
        String renderingMode = (String) renderingModeCombo.getSelectedItem();
        String certLevelLabel = (String) certLevelCombo.getSelectedItem();

        // Check if we should hide the left label
        boolean isNameAndDescription = "Name and Description".equals(renderingMode);
        boolean isGreenTickEnabled = greenTickCheckbox.isSelected();
        // Check if NOT_CERTIFIED (which allows editing/additional signatures)
        boolean isNotEditable = !CertificationLevel.NOT_CERTIFIED.getLabel().equals(certLevelLabel);

        if (isNameAndDescription && isGreenTickEnabled && isNotEditable) {
            // Return an empty, invisible label
            JLabel emptyLabel = new JLabel();
            emptyLabel.setPreferredSize(new Dimension(0, 0));
            emptyLabel.setMaximumSize(new Dimension(0, 0));
            emptyLabel.setMinimumSize(new Dimension(0, 0));
            emptyLabel.setOpaque(false);
            return emptyLabel;
        }

        JLabel leftLabel = new JLabel();
        leftLabel.setVerticalAlignment(SwingConstants.TOP);
        leftLabel.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));

        if ("Name and Description".equals(renderingMode)) {
            leftLabel.setFont(new Font("SansSerif", Font.BOLD, 18));
            String commonName = certificate != null ? getCommonName(certificate) : "[Certificate Name]";
            leftLabel.setText("<html><div style='font-weight:bold; color: black;'>" +
                    commonName.replace(" ", "<br>") + "</div></html>");
        } else if ("Name and Graphic".equals(renderingMode)) {
            if (selectedImageFile != null && selectedImageFile.exists()) {
                // Show the selected image
                ImageIcon icon = new ImageIcon(selectedImageFile.getAbsolutePath());
                Image scaled = icon.getImage().getScaledInstance(80, 50, Image.SCALE_SMOOTH);
                leftLabel.setIcon(new ImageIcon(scaled));
            } else {
                // Show placeholder when no image is selected
                leftLabel.setPreferredSize(new Dimension(80, 50));
                leftLabel.setHorizontalAlignment(SwingConstants.CENTER);
                leftLabel.setVerticalAlignment(SwingConstants.CENTER);
                leftLabel.setText("<html><div style='text-align:center; color:#999; font-size:10px;'>" +
                        "<b>Image<br/>Required</b></div></html>");
                leftLabel.setBorder(BorderFactory.createCompoundBorder(
                        BorderFactory.createDashedBorder(new Color(255, 150, 0), 2, 4, 2, true),
                        BorderFactory.createEmptyBorder(5, 5, 5, 5)
                ));
                leftLabel.setOpaque(true);
                leftLabel.setBackground(new Color(255, 245, 230));
            }
        }

        return leftLabel;
    }


    private JLabel createRightLabel(String previewText) {
        int fontSize = computeFontSizeForPreview(previewText, previewPanel.getWidth());

        StringBuilder rightHtml = new StringBuilder("<html><div style='font-family:sans-serif;color:black;text-align:left;'>");
        for (String line : previewText.split("\n")) {
            rightHtml.append("<div style='font-size:").append(fontSize).append("px;text-align:left;'>")
                    .append(line).append("</div>");
        }
        rightHtml.append("</div></html>");

        JLabel rightLabel = new JLabel(rightHtml.toString());
        rightLabel.setFont(new Font("SansSerif", Font.PLAIN, fontSize));
        rightLabel.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        rightLabel.setVerticalAlignment(SwingConstants.TOP);
        rightLabel.setHorizontalAlignment(SwingConstants.LEFT);

        return rightLabel;
    }

    private void applyGreenTickOverlay(JPanel overlayContainer) {
        try {
            ImageIcon tickIcon = new ImageIcon(Objects.requireNonNull(App.class.getResource("/images/green_tick.png")));
            Image scaledTick = tickIcon.getImage().getScaledInstance(140, 120, Image.SCALE_SMOOTH);
            JLabel tickLabel = new JLabel(new ImageIcon(scaledTick));
            tickLabel.setAlignmentX(0.5f);
            tickLabel.setAlignmentY(0.5f);
            overlayContainer.add(tickLabel);
        } catch (Exception ex) {
            log.error("Failed to load green tick icon", ex);
        }
    }

    private JPanel wrapInCenterPanel(JPanel overlayContainer) {
        JPanel centerWrapper = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 10));
        centerWrapper.setBackground(new Color(240, 240, 240));
        centerWrapper.setBorder(BorderFactory.createEmptyBorder(6, 6, 6, 6));
        centerWrapper.add(overlayContainer);
        return centerWrapper;
    }

    private int computeFontSizeForPreview(String text, int panelWidth) {
        int maxFontSize = 16;
        int minFontSize = 10;
        int length = text.length();
        int size = maxFontSize - (length / 20);
        return Math.max(minFontSize, size);
    }


    private void onSubmit(ActionEvent e) {
        if ("Name and Graphic".equals(renderingModeCombo.getSelectedItem()) && selectedImageFile == null) {
            JOptionPane.showMessageDialog(this, "Please select a graphic image for the signature.", "Missing Image", JOptionPane.WARNING_MESSAGE);
            return;
        }

        // Final save (redundant but safe)
        savePreferences();

        // If a profile is selected, update it with current settings
        updateSelectedProfileIfNeeded();

        String renderingLabel = (String) renderingModeCombo.getSelectedItem();
        String certLabel = (String) certLevelCombo.getSelectedItem();
        RenderingMode selectedRendering = RenderingMode.fromLabel(renderingLabel);
        CertificationLevel selectedCertLevel = CertificationLevel.fromLabel(certLabel);

        appearanceOptions = new AppearanceOptions();
        boolean isGraphicRendering = selectedRendering == RenderingMode.NAME_AND_GRAPHIC;
        appearanceOptions.setGraphicRendering(isGraphicRendering);

        int certLevel = PdfSignatureAppearance.NOT_CERTIFIED;
        switch (Objects.requireNonNull(selectedCertLevel)) {
            case NO_CHANGES_ALLOWED:
                certLevel = PdfSignatureAppearance.CERTIFIED_NO_CHANGES_ALLOWED;
                break;
            case FORM_FILLING_CERTIFIED:
                certLevel = PdfSignatureAppearance.CERTIFIED_FORM_FILLING;
                break;
            case FORM_FILLING_AND_ANNOTATION_CERTIFIED:
                certLevel = PdfSignatureAppearance.CERTIFIED_FORM_FILLING_AND_ANNOTATIONS;
                break;
        }

        appearanceOptions.setIncludeCompany(includeCompanyCheckbox.isSelected());
        appearanceOptions.setIncludeEntireSubject(includeEntireSubjectDNCheckbox.isSelected());
        appearanceOptions.setCertificationLevel(certLevel);
        appearanceOptions.setReason(reasonField.getText().trim());
        appearanceOptions.setLocation(locationField.getText().trim());
        appearanceOptions.setCustomText(customTextField.getText().trim());
        appearanceOptions.setLtvEnabled(ltvCheckbox.isSelected());
        appearanceOptions.setTimestampEnabled(timestampCheckbox.isSelected());
        appearanceOptions.setGreenTickEnabled(!isGraphicRendering &&  greenTickCheckbox.isSelected()); // Only enable green tick for text rendering not with graphic rendering
        appearanceOptions.setDateFormat((SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem());
        appearanceOptions.setGraphicImagePath(
                selectedRendering == RenderingMode.NAME_AND_GRAPHIC && selectedImageFile != null
                        ? selectedImageFile.getAbsolutePath()
                        : null
        );

        dispose();
    }

    public AppearanceOptions getAppearanceOptions() {
        return appearanceOptions;
    }

    /**
     * Selects and loads a profile by name.
     * Call this after showAppearanceConfigPrompt() to pre-select a profile.
     */
    public void selectProfile(String profileName) {
        if (profileName == null) return;

        // Store for profile edit mode
        this.editingProfileName = profileName;

        // Load the profile settings
        AppearanceProfile profile = profileManager.getProfile(profileName);
        if (profile != null) {
            loadProfile(profile);
        }

        // Also select in combo if available (normal signing flow)
        if (profileCombo != null) {
            for (int i = 0; i < profileCombo.getItemCount(); i++) {
                ProfileItem item = profileCombo.getItemAt(i);
                if (item.getProfile() != null && item.getProfile().getName().equals(profileName)) {
                    profileCombo.setSelectedIndex(i);
                    break;
                }
            }
        }
    }

    /**
     * Saves the current settings to the profile being edited and closes the dialog.
     * Used in profile edit mode from Settings.
     */
    private void saveProfileAndClose() {
        if (editingProfileName == null) {
            dispose();
            return;
        }

        // Create/update profile from current settings
        AppearanceProfile profile = new AppearanceProfile(editingProfileName);
        profile.setRenderingMode((String) renderingModeCombo.getSelectedItem());
        profile.setCertificationLevel((String) certLevelCombo.getSelectedItem());
        profile.setReason(reasonField.getText().trim());
        profile.setLocation(locationField.getText().trim());
        profile.setCustomText(customTextField.getText().trim());
        profile.setLtvEnabled(ltvCheckbox.isSelected());
        profile.setTimestampEnabled(timestampCheckbox.isSelected());
        profile.setGreenTickEnabled(greenTickCheckbox.isSelected());
        profile.setIncludeCompany(includeCompanyCheckbox.isSelected());
        profile.setIncludeEntireSubject(includeEntireSubjectDNCheckbox.isSelected());

        SignatureDateFormats.FormatterType fmt = (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem();
        profile.setDateFormat(fmt != null ? fmt.name() : null);

        if (selectedImageFile != null) {
            profile.setSignatureImagePath(selectedImageFile.getAbsolutePath());
        }

        // Save profile
        profileManager.saveProfile(profile);

        dispose();
    }

    /**
     * Updates the currently selected profile with current form settings.
     * Called when user clicks Sign with a profile selected.
     */
    private void updateSelectedProfileIfNeeded() {
        if (profileCombo == null) return;

        ProfileItem selected = (ProfileItem) profileCombo.getSelectedItem();
        if (selected == null || selected.isDefault() || selected.getProfile() == null) {
            return; // No profile selected or default selected
        }

        // Update the selected profile with current settings
        AppearanceProfile profile = selected.getProfile();
        profile.setRenderingMode((String) renderingModeCombo.getSelectedItem());
        profile.setCertificationLevel((String) certLevelCombo.getSelectedItem());
        profile.setReason(reasonField.getText().trim());
        profile.setLocation(locationField.getText().trim());
        profile.setCustomText(customTextField.getText().trim());
        profile.setLtvEnabled(ltvCheckbox.isSelected());
        profile.setTimestampEnabled(timestampCheckbox.isSelected());
        profile.setGreenTickEnabled(greenTickCheckbox.isSelected());
        profile.setIncludeCompany(includeCompanyCheckbox.isSelected());
        profile.setIncludeEntireSubject(includeEntireSubjectDNCheckbox.isSelected());

        SignatureDateFormats.FormatterType fmt = (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem();
        profile.setDateFormat(fmt != null ? fmt.name() : null);

        if (selectedImageFile != null) {
            profile.setSignatureImagePath(selectedImageFile.getAbsolutePath());
        }

        // Save updated profile
        profileManager.saveProfile(profile);
    }

    /**
     * Creates the profile selection panel at the top of the dialog.
     */
    private JPanel createProfileSelectionPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(0, 0, 5, 0));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(6, 6, 6, 6);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;

        // Profile label (gridx=0, same as Date Format label)
        gbc.gridx = 0;
        gbc.gridy = 0;
        panel.add(new JLabel("Signature Profile:"), gbc);

        // Profile combo (gridx=1, same as Date Format combo)
        gbc.gridx = 1;
        profileCombo = new JComboBox<>();
        populateProfileCombo();
        panel.add(profileCombo, gbc);

        return panel;
    }

    /**
     * Populates the profile combo box with saved profiles.
     */
    private void populateProfileCombo() {
        if (profileCombo == null) return;

        profileCombo.removeAllItems();

        // Add "Default" placeholder
        profileCombo.addItem(new ProfileItem());

        // Add saved profiles
        for (AppearanceProfile profile : profileManager.getProfiles()) {
            profileCombo.addItem(new ProfileItem(profile));
        }
    }

    /**
     * Loads settings from a profile into the form.
     */
    private void loadProfile(AppearanceProfile profile) {
        if (profile == null) return;

        isInitializing = true;

        // Load rendering mode
        if (profile.getRenderingMode() != null) {
            renderingModeCombo.setSelectedItem(profile.getRenderingMode());
        }

        // Load certification level
        if (profile.getCertificationLevel() != null) {
            certLevelCombo.setSelectedItem(profile.getCertificationLevel());
        }

        // Load text fields
        reasonField.setText(profile.getReason() != null ? profile.getReason() : "");
        locationField.setText(profile.getLocation() != null ? profile.getLocation() : "");
        customTextField.setText(profile.getCustomText() != null ? profile.getCustomText() : "");

        // Load checkboxes
        ltvCheckbox.setSelected(profile.isLtvEnabled());
        timestampCheckbox.setSelected(profile.isTimestampEnabled());
        greenTickCheckbox.setSelected(profile.isGreenTickEnabled());
        includeCompanyCheckbox.setSelected(profile.isIncludeCompany());
        includeEntireSubjectDNCheckbox.setSelected(profile.isIncludeEntireSubject());

        // Load date format
        if (profile.getDateFormat() != null) {
            try {
                SignatureDateFormats.FormatterType fmt = SignatureDateFormats.FormatterType.valueOf(profile.getDateFormat());
                dateFormatOptions.setSelectedItem(fmt);
            } catch (Exception ignored) {
            }
        }

        // Load signature image
        if (profile.getSignatureImagePath() != null && !profile.getSignatureImagePath().isEmpty()) {
            File imageFile = new File(profile.getSignatureImagePath());
            if (imageFile.exists()) {
                selectedImageFile = imageFile;
                // Try to select from library if it matches
                selectSignatureImageInCombo(profile.getSignatureImagePath());
            }
        }

        // Update UI state
        boolean isGraphic = "Name and Graphic".equals(renderingModeCombo.getSelectedItem());
        signatureLibraryCombo.setEnabled(isGraphic);
        greenTickCheckbox.setEnabled(!isGraphic);

        String org = certificate != null ? getOrganization(certificate) : null;
        boolean isPersonalCert = org != null && org.equalsIgnoreCase("Personal");
        includeCompanyCheckbox.setEnabled(!isPersonalCert && !includeEntireSubjectDNCheckbox.isSelected());

        isInitializing = false;
        updatePreview();
    }

    /**
     * Tries to select a signature image in the combo by path.
     */
    private void selectSignatureImageInCombo(String path) {
        for (int i = 0; i < signatureLibraryCombo.getItemCount(); i++) {
            SignatureImageItem item = signatureLibraryCombo.getItemAt(i);
            if (item.getFile() != null && item.getFile().getAbsolutePath().equals(path)) {
                signatureLibraryCombo.setSelectedIndex(i);
                return;
            }
        }
        // Not found in library, keep placeholder selected
        signatureLibraryCombo.setSelectedIndex(0);
    }

    /**
     * Saves the current form settings as a new profile.
     */
    private void saveCurrentAsProfile() {
        String name = JOptionPane.showInputDialog(this,
                "Enter a name for this profile:",
                "Save Profile",
                JOptionPane.PLAIN_MESSAGE);

        if (name == null || name.trim().isEmpty()) {
            return;
        }

        name = name.trim();

        // Check if profile exists
        if (profileManager.profileExists(name)) {
            int result = JOptionPane.showConfirmDialog(this,
                    "Profile '" + name + "' already exists. Overwrite?",
                    "Profile Exists",
                    JOptionPane.YES_NO_OPTION,
                    JOptionPane.WARNING_MESSAGE);
            if (result != JOptionPane.YES_OPTION) {
                return;
            }
        }

        // Create profile from current settings
        AppearanceProfile profile = new AppearanceProfile(name);
        profile.setRenderingMode((String) renderingModeCombo.getSelectedItem());
        profile.setCertificationLevel((String) certLevelCombo.getSelectedItem());
        profile.setReason(reasonField.getText().trim());
        profile.setLocation(locationField.getText().trim());
        profile.setCustomText(customTextField.getText().trim());
        profile.setLtvEnabled(ltvCheckbox.isSelected());
        profile.setTimestampEnabled(timestampCheckbox.isSelected());
        profile.setGreenTickEnabled(greenTickCheckbox.isSelected());
        profile.setIncludeCompany(includeCompanyCheckbox.isSelected());
        profile.setIncludeEntireSubject(includeEntireSubjectDNCheckbox.isSelected());

        SignatureDateFormats.FormatterType fmt = (SignatureDateFormats.FormatterType) dateFormatOptions.getSelectedItem();
        profile.setDateFormat(fmt != null ? fmt.name() : null);

        if (selectedImageFile != null) {
            profile.setSignatureImagePath(selectedImageFile.getAbsolutePath());
        }

        // Save profile
        profileManager.saveProfile(profile);

        // Refresh combo and select the new profile (only if combo exists)
        populateProfileCombo();
        if (profileCombo != null) {
            for (int i = 0; i < profileCombo.getItemCount(); i++) {
                ProfileItem item = profileCombo.getItemAt(i);
                if (item.getProfile() != null && item.getProfile().getName().equals(name)) {
                    profileCombo.setSelectedIndex(i);
                    break;
                }
            }
        }

        JOptionPane.showMessageDialog(this,
                "Profile '" + name + "' saved successfully.",
                "Profile Saved",
                JOptionPane.INFORMATION_MESSAGE);
    }

    /**
     * Wrapper class for profile items in the combo box.
     */
    private static class ProfileItem {
        private final AppearanceProfile profile;
        private final String displayName;
        private final boolean isDefault;

        // Default item
        public ProfileItem() {
            this.profile = null;
            this.displayName = "-- Default --";
            this.isDefault = true;
        }

        // Actual profile item
        public ProfileItem(AppearanceProfile profile) {
            this.profile = profile;
            this.displayName = profile.getName();
            this.isDefault = false;
        }

        public AppearanceProfile getProfile() {
            return profile;
        }

        public boolean isDefault() {
            return isDefault;
        }

        @Override
        public String toString() {
            return displayName;
        }
    }

    /**
     * Wrapper class for signature library items in the combo box.
     */
    private static class SignatureImageItem {
        private final SignatureImage signature;
        private final String displayName;
        private final boolean isPlaceholder;
        private final boolean isBrowseOption;

        // Placeholder item
        public SignatureImageItem() {
            this.signature = null;
            this.displayName = "-- Select from library --";
            this.isPlaceholder = true;
            this.isBrowseOption = false;
        }

        // Browse option
        public SignatureImageItem(boolean isBrowse) {
            this.signature = null;
            this.displayName = "Browse for image...";
            this.isPlaceholder = false;
            this.isBrowseOption = true;
        }

        // Actual signature item
        public SignatureImageItem(SignatureImage signature) {
            this.signature = signature;
            this.displayName = signature.getName();
            this.isPlaceholder = false;
            this.isBrowseOption = false;
        }

        public SignatureImage getSignature() {
            return signature;
        }

        public boolean isPlaceholder() {
            return isPlaceholder;
        }

        public boolean isBrowseOption() {
            return isBrowseOption;
        }

        public File getFile() {
            return signature != null ? signature.getFile() : null;
        }

        @Override
        public String toString() {
            return displayName;
        }
    }
}