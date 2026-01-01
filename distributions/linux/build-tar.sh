#!/bin/bash
# ============================================================================
# eMark PDF Signer - Portable TAR.GZ Package Builder
# TrexoLab - https://trexolab.com
# ============================================================================
#
# This script creates a portable .tar.gz package for any Linux distribution.
#
# Prerequisites:
#   - The JAR file at ../../target/eMark-PDF-Signer.jar
#   - The JRE at ./jre8-x64/
#
# Usage:
#   ./build-tar.sh
#
# Output:
#   ./output/emark-pdf-signer-x64-linux.tar.gz
# ============================================================================

set -e

# Directories (defined first so VERSION file can be read)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
APP_NAME="emark-pdf-signer"
# Read version from VERSION file
APP_VERSION=$(cat "$ROOT_DIR/VERSION" 2>/dev/null | tr -d '[:space:]' || echo "1.0.0")
BUILD_DIR="$SCRIPT_DIR/build"
OUTPUT_DIR="$SCRIPT_DIR/output"
PACKAGE_DIR="$BUILD_DIR/${APP_NAME}-${APP_VERSION}"

# Clean previous build (only the build dir, preserve output dir for DEB)
rm -rf "$BUILD_DIR"
mkdir -p "$PACKAGE_DIR"
mkdir -p "$OUTPUT_DIR"

echo "============================================================================"
echo " Building eMark PDF Signer Portable Package (tar.gz)"
echo "============================================================================"
echo " Version: $APP_VERSION"
echo "============================================================================"

# Copy application files
echo "Copying application files..."
cp "$ROOT_DIR/target/eMark-PDF-Signer.jar" "$PACKAGE_DIR/"
cp "$SCRIPT_DIR/emark" "$PACKAGE_DIR/"
chmod +x "$PACKAGE_DIR/emark"

# Copy JRE
echo "Copying bundled JRE..."
cp -r "$SCRIPT_DIR/jre8-x64" "$PACKAGE_DIR/"
chmod +x "$PACKAGE_DIR/jre8-x64/bin/"*

# Copy desktop entries for manual installation
echo "Copying desktop entries..."
mkdir -p "$PACKAGE_DIR/desktop"
cp "$SCRIPT_DIR/emark.desktop" "$PACKAGE_DIR/desktop/"
cp "$SCRIPT_DIR/emark-large.desktop" "$PACKAGE_DIR/desktop/"
cp "$SCRIPT_DIR/emark-xlarge.desktop" "$PACKAGE_DIR/desktop/"

# Copy icon (if exists)
if [ -f "$SCRIPT_DIR/emark.png" ]; then
    cp "$SCRIPT_DIR/emark.png" "$PACKAGE_DIR/"
fi

# Create version file
echo "$APP_VERSION" > "$PACKAGE_DIR/version.txt"

# Create install script with version checking
echo "Creating install script..."
cat > "$PACKAGE_DIR/install.sh" << 'INSTALL_EOF'
#!/bin/bash
# ============================================================================
# eMark PDF Signer - Linux Installation Script
# TrexoLab - https://trexolab.com
# ============================================================================

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/opt/emark-pdf-signer"
NEW_VERSION=$(cat "$SCRIPT_DIR/version.txt" 2>/dev/null | tr -d '[:space:]')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE} eMark PDF Signer Installation Script${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (sudo)${NC}"
    echo "Usage: sudo ./install.sh"
    exit 1
fi

# Function to compare version strings
# Returns: 0 if equal, 1 if v1 > v2, 2 if v1 < v2
compare_versions() {
    if [ "$1" = "$2" ]; then
        return 0
    fi

    local IFS=.
    local i v1=($1) v2=($2)

    # Fill empty positions with zeros
    for ((i=${#v1[@]}; i<${#v2[@]}; i++)); do
        v1[i]=0
    done
    for ((i=${#v2[@]}; i<${#v1[@]}; i++)); do
        v2[i]=0
    done

    for ((i=0; i<${#v1[@]}; i++)); do
        if ((10#${v1[i]} > 10#${v2[i]})); then
            return 1
        fi
        if ((10#${v1[i]} < 10#${v2[i]})); then
            return 2
        fi
    done
    return 0
}

# Check for existing installation
INSTALLED_VERSION=""

# Check dpkg first (if DEB package was used)
if command -v dpkg &> /dev/null && dpkg -l emark-pdf-signer 2>/dev/null | grep -q "^ii"; then
    INSTALLED_VERSION=$(dpkg-query -W -f='${Version}' emark-pdf-signer 2>/dev/null || echo "")
    if [ -n "$INSTALLED_VERSION" ]; then
        echo -e "${YELLOW}Warning: eMark PDF Signer was installed via DEB package.${NC}"
        echo "Please use 'sudo apt remove emark-pdf-signer' to uninstall first."
        exit 1
    fi
fi

# Check for manual installation
if [ -f "$INSTALL_DIR/version.txt" ]; then
    INSTALLED_VERSION=$(cat "$INSTALL_DIR/version.txt" 2>/dev/null | tr -d '[:space:]')
fi

if [ -n "$INSTALLED_VERSION" ]; then
    echo -e "${BLUE}============================================================================${NC}"
    echo " Installed version: $INSTALLED_VERSION"
    echo " New version:       $NEW_VERSION"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""

    compare_versions "$INSTALLED_VERSION" "$NEW_VERSION"
    result=$?

    if [ $result -eq 1 ]; then
        # Installed version is newer
        echo -e "${RED}============================================================================${NC}"
        echo -e "${RED} WARNING: A newer version ($INSTALLED_VERSION) is already installed!${NC}"
        echo -e "${RED}============================================================================${NC}"
        echo ""
        echo " You are trying to install an older version ($NEW_VERSION)."
        echo " Installation will be aborted to protect your newer installation."
        echo ""
        echo " If you want to downgrade, please uninstall first:"
        echo "   sudo ./uninstall.sh (from the installed directory)"
        echo "   or: sudo rm -rf /opt/emark-pdf-signer"
        echo ""
        exit 1
    elif [ $result -eq 0 ]; then
        # Same version
        echo -e "${YELLOW} The same version ($INSTALLED_VERSION) is already installed.${NC}"
        echo ""
        read -p " Do you want to reinstall? [y/N] " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo " Installation cancelled."
            exit 0
        fi
        echo ""
        echo " Reinstalling eMark PDF Signer $NEW_VERSION..."
    else
        # Installed version is older
        echo -e "${GREEN} Upgrading from version $INSTALLED_VERSION to $NEW_VERSION...${NC}"
        echo " Your user data and settings will be preserved."
        echo ""
        read -p " Do you want to continue with the upgrade? [Y/n] " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            echo " Installation cancelled."
            exit 0
        fi
        echo ""
        # Remove old installation (preserve user data)
        echo " Removing previous version..."
        rm -rf "$INSTALL_DIR"
    fi
else
    echo " Installing eMark PDF Signer $NEW_VERSION..."
fi

# Create installation directory
echo " Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Copy files
echo " Copying application files..."
cp -r "$SCRIPT_DIR"/* "$INSTALL_DIR/"
rm -f "$INSTALL_DIR/install.sh"  # Remove install script from installation

# Set permissions
chmod +x "$INSTALL_DIR/emark"
chmod +x "$INSTALL_DIR/jre8-x64/bin/"* 2>/dev/null || true

# Create symlinks in /usr/bin
echo " Creating command symlinks..."
ln -sf "$INSTALL_DIR/emark" /usr/bin/emark
ln -sf "$INSTALL_DIR/emark" /usr/bin/emark-large
ln -sf "$INSTALL_DIR/emark" /usr/bin/emark-xlarge

# Install desktop entries (optional)
if [ -d "$INSTALL_DIR/desktop" ]; then
    echo " Installing desktop entries..."
    cp "$INSTALL_DIR/desktop/"*.desktop /usr/share/applications/ 2>/dev/null || true

    # Update desktop database
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database -q /usr/share/applications || true
    fi
fi

# Install icon
if [ -f "$INSTALL_DIR/emark.png" ]; then
    mkdir -p /usr/share/icons/hicolor/256x256/apps
    cp "$INSTALL_DIR/emark.png" /usr/share/icons/hicolor/256x256/apps/

    # Update icon cache
    if command -v gtk-update-icon-cache &> /dev/null; then
        gtk-update-icon-cache -q /usr/share/icons/hicolor || true
    fi
fi

# Create uninstall script
cat > "$INSTALL_DIR/uninstall.sh" << 'UNINSTALL_EOF'
#!/bin/bash
# eMark PDF Signer Uninstall Script

if [ "$EUID" -ne 0 ]; then
    echo "Error: This script must be run as root (sudo)"
    exit 1
fi

echo "Uninstalling eMark PDF Signer..."

# Remove symlinks
rm -f /usr/bin/emark
rm -f /usr/bin/emark-large
rm -f /usr/bin/emark-xlarge

# Remove desktop entries
rm -f /usr/share/applications/emark.desktop
rm -f /usr/share/applications/emark-large.desktop
rm -f /usr/share/applications/emark-xlarge.desktop

# Remove icon
rm -f /usr/share/icons/hicolor/256x256/apps/emark.png

# Remove installation directory
rm -rf /opt/emark-pdf-signer

echo "eMark PDF Signer has been uninstalled."
echo "Note: User data in ~/.eMark has been preserved."
echo "To remove user data: rm -rf ~/.eMark"
UNINSTALL_EOF
chmod +x "$INSTALL_DIR/uninstall.sh"

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN} eMark PDF Signer $NEW_VERSION has been installed successfully!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo " Launch from:"
echo "   - Applications menu: eMark PDF Signer"
echo "   - Terminal: emark"
echo ""
echo " Memory profiles:"
echo "   - Normal (2GB):  emark"
echo "   - Large (4GB):   emark large"
echo "   - XLarge (8GB):  emark xlarge"
echo ""
echo " To uninstall: sudo /opt/emark-pdf-signer/uninstall.sh"
echo ""
echo -e "${GREEN}============================================================================${NC}"
INSTALL_EOF
chmod +x "$PACKAGE_DIR/install.sh"

# Create README
cat > "$PACKAGE_DIR/README.txt" << 'EOF'
============================================================================
 eMark PDF Signer - Portable Linux Package
 TrexoLab - https://trexolab.com
============================================================================

INSTALLATION:

Option 1: Using the install script (recommended)
   tar -xzf emark-pdf-signer-x64-linux.tar.gz
   cd emark-pdf-signer-*
   sudo ./install.sh

Option 2: Manual extraction
   tar -xzf emark-pdf-signer-x64-linux.tar.gz -C /opt/
   /opt/emark-pdf-signer-*/emark

The install script will:
- Check for existing installations
- Handle upgrades from older versions
- Prevent accidental downgrades
- Create desktop shortcuts and menu entries

MEMORY PROFILES:

- Normal (default): ./emark
  2GB max heap - for PDFs up to 50MB

- Large: ./emark large
  4GB max heap - for PDFs 50MB-200MB

- Extra Large: ./emark xlarge
  8GB max heap - for PDFs 200MB+

REQUIREMENTS:

- Linux x64 (64-bit)
- No Java installation required (bundled JRE 8)
- Minimum 4GB RAM (8GB recommended for large PDFs)

UNINSTALLATION:

If installed with install.sh:
   sudo /opt/emark-pdf-signer/uninstall.sh

SUPPORT:

- Website: https://trexolab.com
- GitHub: https://github.com/trexolab-dev/emark-pdf-signer
- Issues: https://github.com/trexolab-dev/emark-pdf-signer/issues

============================================================================
EOF

# Create the archive
echo "Creating tar.gz archive..."
cd "$BUILD_DIR"
tar -czf "$OUTPUT_DIR/${APP_NAME}-x64-linux.tar.gz" "${APP_NAME}-${APP_VERSION}"

# Show result
echo ""
echo "============================================================================"
echo " Package built successfully!"
echo "============================================================================"
echo " Output: $OUTPUT_DIR/${APP_NAME}-x64-linux.tar.gz"
echo " Size: $(du -h "$OUTPUT_DIR/${APP_NAME}-x64-linux.tar.gz" | cut -f1)"
echo "============================================================================"
