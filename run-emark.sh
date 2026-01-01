#!/bin/bash
# ============================================================================
# eMark PDF Signer Launcher Script for Linux/macOS
# Advanced PDF Signing Application
# ============================================================================
#
# JAVA REQUIREMENTS:
#   - Java 8 (1.8.x) is REQUIRED - other versions are NOT supported
#   - 64-bit Java 8: RECOMMENDED for large memory profiles
#
# SYSTEM REQUIREMENTS:
#   - Minimum 4GB RAM for normal use
#   - Minimum 8-16GB RAM for large/xlarge profiles
#
# MEMORY PROFILES:
#   - Normal (default): 512MB-2GB heap
#   - Large:            512MB-4GB heap
#   - Extra Large:      1GB-8GB heap
#
# Usage:
#   ./run-emark.sh           # Normal profile
#   ./run-emark.sh large     # Large profile (requires 64-bit Java 8)
#   ./run-emark.sh xlarge    # Extra Large profile (requires 64-bit Java 8)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo -e "${RED}ERROR: Java is not installed or not in PATH.${NC}"
    echo ""
    echo "eMark PDF Signer requires Java 8 (1.8.x). Please install from:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-8-jdk"
    echo "  macOS:         brew install openjdk@8"
    echo "  Or download:   https://adoptium.net/temurin/releases/?version=8"
    echo ""
    echo "For large memory profiles, install 64-bit Java 8."
    exit 1
fi

# Get Java version
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
JAVA_MAJOR=$(echo "$JAVA_VERSION" | cut -d'.' -f1)
JAVA_MINOR=$(echo "$JAVA_VERSION" | cut -d'.' -f2)

# Check if Java 8 (version 1.8.x)
if [ "$JAVA_MAJOR" = "1" ]; then
    JAVA_MAJOR_ACTUAL=$JAVA_MINOR
else
    JAVA_MAJOR_ACTUAL=$JAVA_MAJOR
fi

if [ "$JAVA_MAJOR_ACTUAL" != "8" ]; then
    echo -e "${YELLOW}WARNING: Java $JAVA_VERSION detected. eMark PDF Signer requires Java 8 (1.8.x).${NC}"
    echo ""
    echo "Please install Java 8 from:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-8-jdk"
    echo "  macOS:         brew install openjdk@8"
    echo "  Or download:   https://adoptium.net/temurin/releases/?version=8"
    echo ""
    echo "Attempting to run anyway, but errors may occur..."
    echo ""
fi

# Detect Java architecture (32-bit or 64-bit)
JAVA_64BIT=false
if java -version 2>&1 | grep -q "64-Bit"; then
    JAVA_64BIT=true
fi

# Set memory profile based on argument or default
PROFILE="${1:-normal}"

case "$PROFILE" in
    normal)
        JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC"
        PROFILE_DESC="Normal (512MB-2GB)"
        ;;
    large)
        JAVA_OPTS="-Xms512m -Xmx4g -XX:+UseG1GC"
        PROFILE_DESC="Large (512MB-4GB)"
        ;;
    xlarge)
        JAVA_OPTS="-Xms1g -Xmx8g -XX:+UseG1GC"
        PROFILE_DESC="Extra Large (1GB-8GB)"
        ;;
    *)
        echo -e "${YELLOW}Unknown profile: $PROFILE${NC}"
        echo "Available profiles: normal, large, xlarge"
        exit 1
        ;;
esac

# Warn if using 32-bit Java with large profile
if [ "$JAVA_64BIT" = false ] && [ "$PROFILE" != "normal" ]; then
    echo -e "${YELLOW}WARNING: 32-bit Java 8 detected. Large memory profiles may not work.${NC}"
    echo "Please install 64-bit Java 8 for large PDF support:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-8-jdk"
    echo "  macOS:         brew install openjdk@8"
    echo "  Or download:   https://adoptium.net/temurin/releases/?version=8&arch=x64"
    echo
    JAVA_OPTS="-Xms256m -Xmx1g -XX:+UseG1GC"
    PROFILE_DESC="Limited (256MB-1GB) - 32-bit Java 8 limitation"
fi

# Find the JAR file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAR_FILE=""

# Try target directory first (development)
JAR_FILE=$(ls "$SCRIPT_DIR/target/eMark-PDF-Signer"*.jar 2>/dev/null | head -1)

# Try current directory (distribution)
if [ -z "$JAR_FILE" ]; then
    JAR_FILE=$(ls "$SCRIPT_DIR/eMark-PDF-Signer"*.jar 2>/dev/null | head -1)
fi

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}ERROR: JAR file not found.${NC}"
    echo "Please run 'mvn package' first or place the JAR in the current directory."
    exit 1
fi

echo "============================================================================"
echo " eMark PDF Signer - Advanced PDF Signing Application"
echo "============================================================================"
echo " Memory Profile: $PROFILE_DESC"
echo " JAR File: $JAR_FILE"
echo " Java Version: $JAVA_VERSION"
if [ "$JAVA_64BIT" = true ]; then
    echo -e " Java Architecture: ${GREEN}64-bit${NC}"
else
    echo -e " Java Architecture: ${YELLOW}32-bit (64-bit recommended for large memory profiles)${NC}"
fi
echo "============================================================================"
echo

exec java $JAVA_OPTS -jar "$JAR_FILE"
