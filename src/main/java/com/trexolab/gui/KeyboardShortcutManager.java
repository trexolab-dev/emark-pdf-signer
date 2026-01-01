package com.trexolab.gui;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;

/**
 * Manages keyboard shortcuts for the application.
 * Provides centralized shortcut registration.
 */
public class KeyboardShortcutManager {
    private static final Log log = LogFactory.getLog(KeyboardShortcutManager.class);
    private final JRootPane rootPane;

    public KeyboardShortcutManager(JRootPane rootPane) {
        this.rootPane = rootPane;
    }

    /**
     * Registers a keyboard shortcut.
     */
    public void registerShortcut(String id, KeyStroke keyStroke, Runnable action) {
        InputMap inputMap = rootPane.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        ActionMap actionMap = rootPane.getActionMap();

        inputMap.put(keyStroke, id);
        actionMap.put(id, new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                action.run();
            }
        });

        log.debug("Registered shortcut: " + id);
    }

    /**
     * Sets up default shortcuts for the PDF viewer.
     */
    public static void setupDefaultShortcuts(KeyboardShortcutManager manager,
                                             Runnable openPdf,
                                             Runnable openSettings,
                                             Runnable verifyAll,
                                             Runnable escape) {
        // Ctrl+O - Open PDF
        if (openPdf != null) {
            manager.registerShortcut("openPdf",
                    KeyStroke.getKeyStroke(KeyEvent.VK_O, KeyEvent.CTRL_DOWN_MASK),
                    openPdf);
        }

        // Ctrl+, - Open Settings
        if (openSettings != null) {
            manager.registerShortcut("settings",
                    KeyStroke.getKeyStroke(KeyEvent.VK_COMMA, KeyEvent.CTRL_DOWN_MASK),
                    openSettings);
        }

        // Ctrl+Shift+V - Verify All Signatures
        if (verifyAll != null) {
            manager.registerShortcut("verifyAll",
                    KeyStroke.getKeyStroke(KeyEvent.VK_V, KeyEvent.CTRL_DOWN_MASK | KeyEvent.SHIFT_DOWN_MASK),
                    verifyAll);
        }

        // Escape - Cancel
        if (escape != null) {
            manager.registerShortcut("escape",
                    KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0),
                    escape);
        }
    }
}
