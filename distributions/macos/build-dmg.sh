#!/bin/bash
# ============================================================================
# eMark PDF Signer - macOS DMG Builder
# TrexoLab - https://trexolab.com
# ============================================================================
#
# This script creates a .dmg installer for macOS containing:
#   - eMark PDF Signer.app (4GB max memory)
#
# Prerequisites:
#   - Run build-app.sh first to create the .app bundle
#   - hdiutil (built into macOS)
#
# Usage:
#   ./build-dmg.sh
#
# Output:
#   ./output/emark-pdf-signer-x64-macos.dmg
# ============================================================================

set -e

# Directories (defined first so VERSION file can be read)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
DMG_NAME="emark-pdf-signer-x64-macos"
VOLUME_NAME="eMark PDF Signer"
# Read version from VERSION file
APP_VERSION=$(cat "$ROOT_DIR/VERSION" 2>/dev/null | tr -d '[:space:]' || echo "1.0.0")
OUTPUT_DIR="$SCRIPT_DIR/output"
DMG_DIR="$SCRIPT_DIR/dmg-staging"

# App path
APP_PATH="$OUTPUT_DIR/eMark PDF Signer.app"

echo "============================================================================"
echo " Building eMark PDF Signer macOS DMG Installer"
echo "============================================================================"
echo " Version: $APP_VERSION"
echo "============================================================================"

# Check if app bundle exists
if [ ! -d "$APP_PATH" ]; then
    echo "ERROR: eMark PDF Signer.app not found at $APP_PATH"
    echo ""
    echo "Please run build-app.sh first to create the app bundle."
    exit 1
fi

# Clean previous DMG staging
rm -rf "$DMG_DIR"
rm -f "$OUTPUT_DIR/$DMG_NAME.dmg"
mkdir -p "$DMG_DIR"

echo "Preparing DMG contents..."

# Copy app to staging
echo "  Copying eMark PDF Signer.app..."
cp -r "$APP_PATH" "$DMG_DIR/"

# Create Applications symlink
ln -s /Applications "$DMG_DIR/Applications"

# Create install script with version checking
cat > "$DMG_DIR/Install eMark PDF Signer.command" << INSTALLSCRIPT
#!/bin/bash
# ============================================================================
# eMark PDF Signer - macOS Installation Script with Version Checking
# TrexoLab - https://trexolab.com
# ============================================================================

set -e

# Get the directory where this script is located (the mounted DMG)
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
APPLICATIONS_DIR="/Applications"
NEW_VERSION="$APP_VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo ""
echo -e "\${BLUE}============================================================================\${NC}"
echo -e "\${BLUE} eMark PDF Signer Installation Script - Version \$NEW_VERSION\${NC}"
echo -e "\${BLUE}============================================================================\${NC}"
echo ""

# Function to compare version strings
# Returns: 0 if equal, 1 if v1 > v2, 2 if v1 < v2
compare_versions() {
    if [ "\$1" = "\$2" ]; then
        return 0
    fi

    local IFS=.
    local i v1=(\$1) v2=(\$2)

    # Fill empty positions with zeros
    for ((i=\${#v1[@]}; i<\${#v2[@]}; i++)); do
        v1[i]=0
    done
    for ((i=\${#v2[@]}; i<\${#v1[@]}; i++)); do
        v2[i]=0
    done

    for ((i=0; i<\${#v1[@]}; i++)); do
        if ((10#\${v1[i]} > 10#\${v2[i]})); then
            return 1
        fi
        if ((10#\${v1[i]} < 10#\${v2[i]})); then
            return 2
        fi
    done
    return 0
}

# Function to get version from an installed app
get_app_version() {
    local app_path="\$1"
    if [ -d "\$app_path" ]; then
        /usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "\$app_path/Contents/Info.plist" 2>/dev/null || echo ""
    fi
}

# Function to install an app with version checking
install_app() {
    local app_name="\$1"
    local source_app="\$SCRIPT_DIR/\$app_name"
    local dest_app="\$APPLICATIONS_DIR/\$app_name"

    if [ ! -d "\$source_app" ]; then
        echo -e "\${YELLOW}  Skipping \$app_name (not found in DMG)\${NC}"
        return
    fi

    echo ""
    echo -e "\${BLUE}Processing \$app_name...\${NC}"

    local installed_version=\$(get_app_version "\$dest_app")

    if [ -n "\$installed_version" ]; then
        echo "  Installed version: \$installed_version"
        echo "  New version:       \$NEW_VERSION"

        compare_versions "\$installed_version" "\$NEW_VERSION"
        local result=\$?

        if [ \$result -eq 1 ]; then
            # Installed version is newer
            echo -e "\${RED}  WARNING: A newer version (\$installed_version) is already installed!\${NC}"
            echo "  Skipping to protect your newer installation."
            echo "  To downgrade, manually delete the app from Applications first."
            return
        elif [ \$result -eq 0 ]; then
            # Same version
            echo -e "\${YELLOW}  Same version is already installed.\${NC}"
            read -p "  Do you want to reinstall? [y/N] " -n 1 -r
            echo ""
            if [[ ! \$REPLY =~ ^[Yy]\$ ]]; then
                echo "  Skipped."
                return
            fi
        else
            # Older version - upgrade
            echo -e "\${GREEN}  Upgrading from \$installed_version to \$NEW_VERSION...\${NC}"
        fi

        # Remove existing app
        echo "  Removing previous version..."
        rm -rf "\$dest_app"
    else
        echo "  Installing new..."
    fi

    # Copy the app
    echo "  Copying \$app_name to Applications..."
    cp -R "\$source_app" "\$APPLICATIONS_DIR/"

    # Remove quarantine attribute
    xattr -dr com.apple.quarantine "\$dest_app" 2>/dev/null || true

    echo -e "\${GREEN}  ✓ \$app_name installed successfully!\${NC}"
}

# Main installation
echo "This script will install eMark PDF Signer to your Applications folder."
echo "It will check for existing versions and handle upgrades safely."
echo ""
echo "App to install:"
echo "  - eMark PDF Signer.app (4GB max memory)"
echo ""
read -p "Do you want to continue? [Y/n] " -n 1 -r
echo ""

if [[ \$REPLY =~ ^[Nn]\$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

# Install app
install_app "eMark PDF Signer.app"

echo ""
echo -e "\${GREEN}============================================================================\${NC}"
echo -e "\${GREEN} Installation Complete!\${NC}"
echo -e "\${GREEN}============================================================================\${NC}"
echo ""
echo " You can now launch eMark PDF Signer from your Applications folder."
echo ""
echo " On first launch, you may need to:"
echo "   Right-click the app → Select 'Open' → Click 'Open' in the dialog"
echo ""
echo " Memory Configuration:"
echo "   - Initial heap: 512MB"
echo "   - Maximum heap: 4GB"
echo "   - Suitable for PDFs up to 200MB"
echo ""
echo -e "\${GREEN}============================================================================\${NC}"
echo ""
read -p "Press Enter to close this window..."
INSTALLSCRIPT
chmod +x "$DMG_DIR/Install eMark PDF Signer.command"

# Create README
cat > "$DMG_DIR/README.txt" << EOF
============================================================================
 eMark PDF Signer $APP_VERSION - Installation Instructions
============================================================================

This DMG contains eMark PDF Signer with 4GB maximum memory allocation.

INSTALLATION:

Option 1: Using the Install Script (Recommended)
   Double-click "Install eMark PDF Signer.command" to run the installer.
   This will:
   - Check for existing installations
   - Upgrade older versions automatically
   - Prevent accidental downgrades
   - Remove quarantine attributes

Option 2: Manual Drag and Drop
   1. Drag eMark PDF Signer.app to the "Applications" folder
   2. Eject this disk image
   3. Open eMark PDF Signer from your Applications folder

   On first launch:
   Right-click the app → Select "Open" → Click "Open" in the dialog

IMPORTANT:
   - Do NOT run eMark PDF Signer directly from this disk image
   - Always copy to Applications first, then eject the disk image
   - Running from the DMG will not persist after ejecting

MEMORY CONFIGURATION:

- Initial heap: 512MB
- Maximum heap: 4GB
- Suitable for PDFs up to 200MB
- Requires at least 8GB system RAM

SUPPORT:

- Website: https://trexolab-dev.github.io/emark-pdf-signer/
- GitHub: https://github.com/trexolab-dev/emark-pdf-signer

============================================================================
EOF

# Calculate size needed (all apps + 100MB padding)
TOTAL_SIZE=$(du -sm "$DMG_DIR" | cut -f1)
DMG_SIZE=$((TOTAL_SIZE + 100))

echo "Creating DMG image (${DMG_SIZE}MB)..."

# Create temporary DMG
TEMP_DMG="$OUTPUT_DIR/temp.dmg"
hdiutil create -srcfolder "$DMG_DIR" -volname "$VOLUME_NAME" -fs HFS+ \
    -fsargs "-c c=64,a=16,e=16" -format UDRW -size ${DMG_SIZE}m "$TEMP_DMG"

# Mount the temporary DMG
echo "Mounting DMG for customization..."
MOUNT_DIR="/Volumes/$VOLUME_NAME"
hdiutil attach "$TEMP_DMG" -readwrite -noverify -noautoopen

# Wait for mount
sleep 2

# Set custom icon positions using AppleScript (if running on macOS)
if [ -d "$MOUNT_DIR" ]; then
    echo "Setting up DMG appearance..."

    # Create .DS_Store with icon positions
    osascript << APPLESCRIPT || true
tell application "Finder"
    tell disk "$VOLUME_NAME"
        open
        set current view of container window to icon view
        set toolbar visible of container window to false
        set statusbar visible of container window to false
        set bounds of container window to {100, 100, 800, 600}
        set theViewOptions to the icon view options of container window
        set arrangement of theViewOptions to not arranged
        set icon size of theViewOptions to 72
        -- Position app and Applications link
        set position of item "eMark PDF Signer.app" of container window to {150, 150}
        set position of item "Applications" of container window to {450, 150}
        -- Position install script and README below
        set position of item "Install eMark PDF Signer.command" of container window to {200, 350}
        set position of item "README.txt" of container window to {400, 350}
        close
        open
        update without registering applications
        close
    end tell
end tell
APPLESCRIPT
fi

# Unmount
echo "Finalizing DMG..."
sync
hdiutil detach "$MOUNT_DIR" -quiet || true
sleep 2

# Convert to compressed DMG
hdiutil convert "$TEMP_DMG" -format UDZO -imagekey zlib-level=9 \
    -o "$OUTPUT_DIR/$DMG_NAME.dmg"

# Clean up
rm -f "$TEMP_DMG"
rm -rf "$DMG_DIR"

echo ""
echo "============================================================================"
echo " DMG built successfully!"
echo "============================================================================"
echo " Output: $OUTPUT_DIR/$DMG_NAME.dmg"
echo " Size: $(du -h "$OUTPUT_DIR/$DMG_NAME.dmg" | cut -f1)"
echo ""
echo " Contents:"
echo "   - eMark PDF Signer.app (4GB max memory)"
echo "   - Install eMark PDF Signer.command (installer with version checking)"
echo "   - README.txt (installation instructions)"
echo ""
echo " Memory Configuration:"
echo "   - Initial heap: 512MB"
echo "   - Maximum heap: 4GB"
echo "   - Suitable for PDFs up to 200MB"
echo ""
echo " To install:"
echo "   Option 1: Double-click 'Install eMark PDF Signer.command' (recommended)"
echo "             - Checks for existing versions"
echo "             - Handles upgrades automatically"
echo "             - Prevents accidental downgrades"
echo ""
echo "   Option 2: Drag eMark PDF Signer.app to Applications folder"
echo "============================================================================"