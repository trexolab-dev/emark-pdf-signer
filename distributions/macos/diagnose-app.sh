#!/bin/bash
# ============================================================================
# eMark PDF Signer - macOS Diagnostic Script
# TrexoLab - https://trexolab.com
# ============================================================================
#
# This script diagnoses issues with the eMark PDF Signer macOS app installation.
# Run this if you get "Java Runtime Not Found" errors.
#
# Usage:
#   ./diagnose-app.sh [app-name]
#
# Example:
#   ./diagnose-app.sh "eMark PDF Signer.app"
#
# ============================================================================

set -e

APP_NAME="${1:-eMark PDF Signer.app}"
APP_PATH="/Applications/$APP_NAME"

echo "============================================================================"
echo " eMark PDF Signer Diagnostic Tool"
echo "============================================================================"
echo " App: $APP_NAME"
echo "============================================================================"
echo ""

# Check if app exists
echo "1. Checking if app exists..."
if [ ! -d "$APP_PATH" ]; then
    echo "   ✗ ERROR: App not found at $APP_PATH"
    echo ""
    echo "   Available eMark PDF Signer apps in /Applications:"
    ls -1 /Applications/ | grep -i "emark" || echo "   (none found)"
    exit 1
fi
echo "   ✓ App found at $APP_PATH"
echo ""

# Check app structure
echo "2. Checking app bundle structure..."
if [ ! -d "$APP_PATH/Contents" ]; then
    echo "   ✗ ERROR: Invalid app bundle (missing Contents directory)"
    exit 1
fi
echo "   ✓ Valid app bundle structure"
echo ""

# Check Resources directory
echo "3. Checking Resources directory..."
RESOURCES_DIR="$APP_PATH/Contents/Resources"
if [ ! -d "$RESOURCES_DIR" ]; then
    echo "   ✗ ERROR: Resources directory not found"
    exit 1
fi
echo "   ✓ Resources directory exists"
echo ""
echo "   Contents of Resources:"
ls -lh "$RESOURCES_DIR" | awk '{print "     " $0}'
echo ""

# Check for JAR file
echo "4. Checking for eMark-PDF-Signer.jar..."
JAR_FILE="$RESOURCES_DIR/eMark-PDF-Signer.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "   ✗ ERROR: eMark-PDF-Signer.jar not found"
    exit 1
fi
JAR_SIZE=$(du -h "$JAR_FILE" | cut -f1)
echo "   ✓ eMark-PDF-Signer.jar found (size: $JAR_SIZE)"
echo ""

# Check for JRE
echo "5. Checking for bundled JRE..."
JRE_DIR="$RESOURCES_DIR/jre8-x64"
if [ ! -d "$JRE_DIR" ]; then
    echo "   ✗ ERROR: JRE directory not found at $JRE_DIR"
    echo ""
    echo "   This is the problem! The JRE is missing from your app bundle."
    echo ""
    echo "   SOLUTION:"
    echo "   1. Download a fresh copy from:"
    echo "      https://github.com/trexolab-dev/emark-pdf-signer/releases/latest"
    echo ""
    echo "   2. If you built this yourself, ensure you downloaded the JRE first:"
    echo "      See: distributions/macos/README.md"
    echo ""
    exit 1
fi
echo "   ✓ JRE directory found"
echo ""

# Check JRE structure
echo "6. Checking JRE structure..."
JAVA_EXE_MACOS="$JRE_DIR/Contents/Home/bin/java"
JAVA_EXE_STANDARD="$JRE_DIR/bin/java"

if [ -f "$JAVA_EXE_MACOS" ]; then
    echo "   ✓ Found macOS JRE structure: $JAVA_EXE_MACOS"
    JAVA_EXE="$JAVA_EXE_MACOS"
elif [ -f "$JAVA_EXE_STANDARD" ]; then
    echo "   ✓ Found standard JRE structure: $JAVA_EXE_STANDARD"
    JAVA_EXE="$JAVA_EXE_STANDARD"
else
    echo "   ✗ ERROR: Java executable not found in JRE"
    echo ""
    echo "   Searched for:"
    echo "     - $JAVA_EXE_MACOS"
    echo "     - $JAVA_EXE_STANDARD"
    echo ""
    echo "   JRE directory contents:"
    ls -la "$JRE_DIR" | awk '{print "     " $0}'
    exit 1
fi
echo ""

# Check if Java is executable
echo "7. Checking Java executable permissions..."
if [ ! -x "$JAVA_EXE" ]; then
    echo "   ✗ ERROR: Java executable is not executable"
    echo ""
    echo "   Permissions:"
    ls -la "$JAVA_EXE" | awk '{print "     " $0}'
    echo ""
    echo "   SOLUTION: Try fixing permissions with:"
    echo "     chmod +x \"$JAVA_EXE\""
    echo "     sudo xattr -dr com.apple.quarantine \"$APP_PATH\""
    echo ""
    exit 1
fi
echo "   ✓ Java executable has correct permissions"
echo ""

# Test Java
echo "8. Testing Java executable..."
if ! "$JAVA_EXE" -version 2>&1 | head -3; then
    echo "   ✗ ERROR: Java executable failed to run"
    exit 1
fi
echo ""

# Check quarantine attribute
echo "9. Checking macOS quarantine attributes..."
QUARANTINE=$(xattr "$APP_PATH" 2>/dev/null | grep com.apple.quarantine || echo "")
if [ -n "$QUARANTINE" ]; then
    echo "   ⚠ WARNING: App has quarantine attribute"
    echo ""
    echo "   This may cause security prompts. To remove:"
    echo "     sudo xattr -dr com.apple.quarantine \"$APP_PATH\""
    echo ""
else
    echo "   ✓ No quarantine attributes found"
fi
echo ""

# Check launcher script
echo "10. Checking launcher script..."
LAUNCHER="$APP_PATH/Contents/MacOS/run-emark"
if [ ! -f "$LAUNCHER" ]; then
    echo "   ✗ ERROR: Launcher script not found"
    exit 1
fi
if [ ! -x "$LAUNCHER" ]; then
    echo "   ✗ ERROR: Launcher script is not executable"
    echo ""
    echo "   SOLUTION: Try fixing permissions with:"
    echo "     chmod +x \"$LAUNCHER\""
    echo ""
    exit 1
fi
echo "   ✓ Launcher script exists and is executable"
echo ""

# Success!
echo "============================================================================"
echo " ✓ All checks passed!"
echo "============================================================================"
echo ""
echo " Your $APP_NAME appears to be correctly installed."
echo ""
echo " If you're still experiencing issues:"
echo "   1. Try removing quarantine: sudo xattr -dr com.apple.quarantine \"$APP_PATH\""
echo "   2. Check Console.app for error messages"
echo "   3. Report the issue at: https://github.com/trexolab-dev/emark-pdf-signer/issues"
echo ""
echo "============================================================================"
