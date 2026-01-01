# eMark PDF Signer - macOS Build Instructions

This directory contains scripts and resources for building macOS installers.

## Prerequisites

### 1. Java Development Kit (for building the JAR)
```bash
# Check if Java 8 is installed
java -version

# If not installed, download from:
# https://adoptium.net/temurin/releases/?version=8
```

### 2. Built JAR file
```bash
# From the project root, build the JAR
cd ../..
mvn clean package -DskipTests

# Verify the JAR exists
ls -lh target/eMark-PDF-Signer.jar
```

### 3. Download macOS JRE (REQUIRED)

The macOS installer bundles Java 8 JRE. You **must** download it before building:

```bash
# Download JRE 8 x64 for macOS
curl -L -o jre8-x64.tar.gz https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u432-b06/OpenJDK8U-jre_x64_mac_hotspot_8u432b06.tar.gz

# Extract it
tar -xzf jre8-x64.tar.gz

# Rename to expected directory name
mv jdk8u432-b06-jre jre8-x64

# Verify the structure
ls -la jre8-x64/Contents/Home/bin/java

# Clean up
rm jre8-x64.tar.gz
```

**Important**: The build script will fail if `jre8-x64/` is not found!

## Build Process

### Step 1: Build App Bundle

```bash
./build-app.sh
```

This creates a single `.app` bundle in `output/`:
- `eMark PDF Signer.app` - 4GB max memory

The bundle is self-contained with:
- The eMark PDF Signer JAR file
- Bundled Java 8 JRE
- Launch script with 4GB memory configuration
- Application icons

### Step 2: Build DMG Installer

```bash
./build-dmg.sh
```

This creates `output/emark-pdf-signer-x64-macos.dmg` containing:
- eMark PDF Signer.app (4GB max memory)
- Installation script with version checking
- README with instructions
- Applications folder symlink

## Directory Structure

```
distributions/macos/
├── build-app.sh           # Builds .app bundles
├── build-dmg.sh           # Builds DMG installer
├── diagnose-app.sh        # Diagnostic tool for users
├── emark.icns             # App icon
├── Info.plist             # App bundle metadata template
├── jre8-x64/              # Bundled JRE (you must download this)
│   └── Contents/
│       └── Home/
│           └── bin/
│               └── java   # Java executable
├── output/                # Build output (created by scripts)
│   ├── eMark PDF Signer.app
│   └── emark-pdf-signer-x64-macos.dmg
└── README.md              # This file
```

## JRE Structure (macOS Specific)

macOS JRE has a special structure:
```
jre8-x64/
└── Contents/
    └── Home/
        ├── bin/
        │   └── java          # Java executable
        ├── lib/
        └── ...
```

This differs from Windows/Linux which use:
```
jre8-x64/
└── bin/
    └── java
```

The launcher script (`run-emark`) handles both structures automatically.

## Troubleshooting

### Build fails with "JRE not found"

```bash
# Check if JRE directory exists
ls -la jre8-x64/

# If missing, download it (see Prerequisites section above)
```

### "Java Runtime Not Found" when opening app

The app was built without the JRE. This shouldn't happen if you followed the build process.

Run the diagnostic script to check:
```bash
./diagnose-app.sh "eMark.app"
```

### macOS blocks the app (quarantine)

```bash
# Remove quarantine attribute
sudo xattr -dr com.apple.quarantine "/Applications/eMark PDF Signer.app"
```

Or use the Install script from the DMG which does this automatically.

## GitHub Actions Workflow

The automated build process (`.github/workflows/build-installers.yml`) does:

1. Downloads the JAR artifact
2. Downloads JRE 8 x64 for macOS
3. Verifies JRE structure and Java executable
4. Runs `build-app.sh`
5. Runs `build-dmg.sh`
6. Verifies JRE is bundled in the final apps
7. Uploads the DMG as an artifact

## Memory Configuration

### eMark PDF Signer.app
- Initial heap: 512MB
- Maximum heap: 4GB
- Best for: PDFs up to 200MB
- Requires: Mac with 8GB+ RAM recommended

## Resources

- Adoptium JRE Downloads: https://adoptium.net/temurin/releases/?version=8
- eMark PDF Signer Repository: https://github.com/trexolab-dev/emark-pdf-signer
- Report Issues: https://github.com/trexolab-dev/emark-pdf-signer/issues
