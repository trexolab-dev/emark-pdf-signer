#!/bin/bash
# ============================================================================
# eMark PDF Signer - DEB Package Builder Script (x86/i386)
# TrexoLab - https://trexolab.com
# ============================================================================
#
# This script creates a .deb package for Debian/Ubuntu 32-bit systems.
#
# Prerequisites:
#   - dpkg-deb (usually pre-installed on Debian/Ubuntu)
#   - The JAR file at ../../target/eMark-PDF-Signer.jar
#   - The JRE at ./jre8-x86/
#
# Usage:
#   ./build-deb-x86.sh
#
# Output:
#   ./output/emark-pdf-signer-x86.deb
# ============================================================================

set -e

# Directories (defined first so VERSION file can be read)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
APP_NAME="emark-pdf-signer"
# Read version from VERSION file
APP_VERSION=$(cat "$ROOT_DIR/VERSION" 2>/dev/null | tr -d '[:space:]' || echo "1.0.0")
MAINTAINER="TrexoLab <contact@trexolab.com>"
DESCRIPTION="Advanced PDF Signing Application (32-bit)"
ARCHITECTURE="i386"
BUILD_DIR="$SCRIPT_DIR/build-x86"
OUTPUT_DIR="$SCRIPT_DIR/output"
PACKAGE_DIR="$BUILD_DIR/${APP_NAME}_${APP_VERSION}_${ARCHITECTURE}"

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$PACKAGE_DIR"

echo "============================================================================"
echo " Building eMark PDF Signer DEB Package (x86/i386)"
echo "============================================================================"
echo " Version: $APP_VERSION"
echo " Architecture: $ARCHITECTURE"
echo "============================================================================"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$PACKAGE_DIR/DEBIAN"
mkdir -p "$PACKAGE_DIR/opt/emark-pdf-signer"
mkdir -p "$PACKAGE_DIR/usr/share/applications"
mkdir -p "$PACKAGE_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$PACKAGE_DIR/usr/share/icons/hicolor/48x48/apps"
mkdir -p "$PACKAGE_DIR/usr/bin"

# Copy application files
echo "Copying application files..."
cp "$ROOT_DIR/target/eMark-PDF-Signer.jar" "$PACKAGE_DIR/opt/emark-pdf-signer/"
cp "$SCRIPT_DIR/emark-x86" "$PACKAGE_DIR/opt/emark-pdf-signer/emark"
chmod +x "$PACKAGE_DIR/opt/emark-pdf-signer/emark"

# Copy JRE (x86 version)
echo "Copying bundled JRE (x86)..."
cp -r "$SCRIPT_DIR/jre8-x86" "$PACKAGE_DIR/opt/emark-pdf-signer/"
chmod +x "$PACKAGE_DIR/opt/emark-pdf-signer/jre8-x86/bin/"*

# Copy desktop entries
echo "Copying desktop entries..."
cp "$SCRIPT_DIR/emark.desktop" "$PACKAGE_DIR/usr/share/applications/"
cp "$SCRIPT_DIR/emark-large.desktop" "$PACKAGE_DIR/usr/share/applications/"
cp "$SCRIPT_DIR/emark-xlarge.desktop" "$PACKAGE_DIR/usr/share/applications/"

# Copy branding images
if [ -f "$SCRIPT_DIR/emark.png" ]; then
    echo "Copying app icon..."
    cp "$SCRIPT_DIR/emark.png" "$PACKAGE_DIR/opt/emark-pdf-signer/emark.png"
    cp "$SCRIPT_DIR/emark.png" "$PACKAGE_DIR/usr/share/icons/hicolor/256x256/apps/emark.png"
else
    echo "WARNING: No icon found at $SCRIPT_DIR/emark.png, skipping icon installation..."
fi

# Create symlink script
cat > "$PACKAGE_DIR/usr/bin/emark" << 'EOF'
#!/bin/bash
exec /opt/emark-pdf-signer/emark "$@"
EOF
chmod +x "$PACKAGE_DIR/usr/bin/emark"

# Create large profile symlink
cat > "$PACKAGE_DIR/usr/bin/emark-large" << 'EOF'
#!/bin/bash
exec /opt/emark-pdf-signer/emark large "$@"
EOF
chmod +x "$PACKAGE_DIR/usr/bin/emark-large"

# Create xlarge profile symlink
cat > "$PACKAGE_DIR/usr/bin/emark-xlarge" << 'EOF'
#!/bin/bash
exec /opt/emark-pdf-signer/emark xlarge "$@"
EOF
chmod +x "$PACKAGE_DIR/usr/bin/emark-xlarge"

# Calculate installed size (in KB)
INSTALLED_SIZE=$(du -sk "$PACKAGE_DIR" | cut -f1)

# Create control file
echo "Creating DEBIAN/control..."
cat > "$PACKAGE_DIR/DEBIAN/control" << EOF
Package: $APP_NAME
Version: $APP_VERSION
Section: utils
Priority: optional
Architecture: $ARCHITECTURE
Installed-Size: $INSTALLED_SIZE
Maintainer: $MAINTAINER
Homepage: https://trexolab.com
Description: $DESCRIPTION
 eMark PDF Signer is an advanced PDF signing application that supports
 digital certificates, PKCS#11 tokens, and various signature types.
 This is the 32-bit (i386) version.
 .
 Features:
  - Sign PDFs with digital certificates
  - Support for USB tokens (PKCS#11)
  - Multiple memory profiles for large PDFs
  - Bundled Java 8 runtime (no system Java required)
EOF

# Create preinst script (version checking)
echo "Creating DEBIAN/preinst..."
cat > "$PACKAGE_DIR/DEBIAN/preinst" << EOF
#!/bin/bash
set -e

NEW_VERSION="$APP_VERSION"

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

# Check if eMark PDF Signer is already installed
INSTALLED_VERSION=""

# Check dpkg for installed version
if dpkg -l emark-pdf-signer 2>/dev/null | grep -q "^ii"; then
    INSTALLED_VERSION=\$(dpkg-query -W -f='\${Version}' emark-pdf-signer 2>/dev/null || echo "")
fi

# Also check for manual installation in /opt/emark-pdf-signer
if [ -z "\$INSTALLED_VERSION" ] && [ -f "/opt/emark-pdf-signer/version.txt" ]; then
    INSTALLED_VERSION=\$(cat /opt/emark-pdf-signer/version.txt 2>/dev/null | tr -d '[:space:]')
fi

if [ -n "\$INSTALLED_VERSION" ]; then
    echo ""
    echo "============================================================================"
    echo " eMark PDF Signer Installation Check (x86/i386)"
    echo "============================================================================"
    echo " Installed version: \$INSTALLED_VERSION"
    echo " New version:       \$NEW_VERSION"
    echo "============================================================================"

    compare_versions "\$INSTALLED_VERSION" "\$NEW_VERSION"
    result=\$?

    if [ \$result -eq 1 ]; then
        # Installed version is newer
        echo ""
        echo " WARNING: A newer version (\$INSTALLED_VERSION) is already installed!"
        echo ""
        echo " You are trying to install an older version (\$NEW_VERSION)."
        echo " Installation will be aborted to protect your newer installation."
        echo ""
        echo " If you want to downgrade, please uninstall the current version first:"
        echo "   sudo apt remove emark-pdf-signer"
        echo ""
        echo "============================================================================"
        exit 1
    elif [ \$result -eq 0 ]; then
        # Same version
        echo ""
        echo " The same version (\$INSTALLED_VERSION) is already installed."
        echo " Proceeding with reinstallation..."
        echo ""
        echo "============================================================================"
    else
        # Installed version is older
        echo ""
        echo " Upgrading from version \$INSTALLED_VERSION to \$NEW_VERSION..."
        echo " Your user data and settings will be preserved."
        echo ""
        echo "============================================================================"
    fi
fi

exit 0
EOF
chmod +x "$PACKAGE_DIR/DEBIAN/preinst"

# Create postinst script
echo "Creating DEBIAN/postinst..."
cat > "$PACKAGE_DIR/DEBIAN/postinst" << EOF
#!/bin/bash
set -e

# Save version info for future checks
echo "$APP_VERSION" > /opt/emark-pdf-signer/version.txt

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database -q /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi

echo ""
echo "============================================================================"
echo " eMark PDF Signer $APP_VERSION (x86/i386) has been installed successfully!"
echo "============================================================================"
echo ""
echo " Launch from:"
echo "   - Applications menu: eMark PDF Signer"
echo "   - Terminal: emark"
echo ""
echo " Memory profiles:"
echo "   - Normal (2GB):  emark"
echo "   - Large (4GB):   emark-large"
echo "   - XLarge (8GB):  emark-xlarge"
echo ""
echo "============================================================================"
EOF
chmod +x "$PACKAGE_DIR/DEBIAN/postinst"

# Create postrm script
echo "Creating DEBIAN/postrm..."
cat > "$PACKAGE_DIR/DEBIAN/postrm" << 'EOF'
#!/bin/bash
set -e

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database -q /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi

# Remove user config on purge
if [ "$1" = "purge" ]; then
    rm -rf /home/*/.eMark 2>/dev/null || true
fi
EOF
chmod +x "$PACKAGE_DIR/DEBIAN/postrm"

# Build the package
echo "Building DEB package..."
mkdir -p "$OUTPUT_DIR"
dpkg-deb --build --root-owner-group "$PACKAGE_DIR" "$OUTPUT_DIR/emark-x86.deb"

# Verify the package
echo ""
echo "============================================================================"
echo " Package built successfully!"
echo "============================================================================"
echo " Output: $OUTPUT_DIR/emark-x86.deb"
echo ""
echo " Package info:"
dpkg-deb --info "$OUTPUT_DIR/emark-x86.deb"
echo ""
echo " To install: sudo dpkg -i $OUTPUT_DIR/emark-x86.deb"
echo "============================================================================"
