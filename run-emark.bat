@echo off
REM ============================================================================
REM eMark PDF Signer Launcher Script for Windows
REM Advanced PDF Signing Application
REM ============================================================================
REM
REM JAVA REQUIREMENTS:
REM   - Java 8 (1.8.x) is REQUIRED - other versions are NOT supported
REM   - 64-bit Java 8: RECOMMENDED for large memory profiles
REM
REM SYSTEM REQUIREMENTS:
REM   - Minimum 4GB RAM for normal use
REM   - Minimum 8-16GB RAM for large/xlarge profiles
REM
REM MEMORY PROFILES:
REM   - Normal (default): 512MB-2GB heap
REM   - Large:            512MB-4GB heap
REM   - Extra Large:      1GB-8GB heap
REM
REM Usage:
REM   run-emark.bat           # Normal profile
REM   run-emark.bat large     # Large profile (requires 64-bit Java 8)
REM   run-emark.bat xlarge    # Extra Large profile (requires 64-bit Java 8)
REM ============================================================================

setlocal enabledelayedexpansion

REM Check if Java is available
where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java is not installed or not in PATH.
    echo.
    echo eMark PDF Signer requires Java 8 ^(1.8.x^). Please install from:
    echo   https://adoptium.net/temurin/releases/?version=8
    echo.
    echo For large memory profiles, install 64-bit Java 8.
    pause
    exit /b 1
)

REM Check Java version (must be Java 8)
set JAVA_VERSION=
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
set JAVA_VERSION=%JAVA_VERSION:"=%

REM Extract major version
set JAVA_MAJOR=
for /f "tokens=1,2 delims=." %%a in ("%JAVA_VERSION%") do (
    if "%%a"=="1" (
        set JAVA_MAJOR=%%b
    ) else (
        set JAVA_MAJOR=%%a
    )
)

if not "%JAVA_MAJOR%"=="8" (
    echo WARNING: Java %JAVA_VERSION% detected. eMark PDF Signer requires Java 8 ^(1.8.x^).
    echo.
    echo Please install Java 8 from: https://adoptium.net/temurin/releases/?version=8
    echo.
    echo Attempting to run anyway, but errors may occur...
    echo.
)

REM Detect Java architecture (32-bit or 64-bit)
set JAVA_64BIT=
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr "64-Bit"') do set JAVA_64BIT=true

REM Set memory profile based on argument or default
set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=normal

if /i "%PROFILE%"=="normal" (
    set JAVA_OPTS=-Xms512m -Xmx2g -XX:+UseG1GC
    set "PROFILE_DESC=Normal (512MB-2GB)"
)
if /i "%PROFILE%"=="large" (
    set JAVA_OPTS=-Xms512m -Xmx4g -XX:+UseG1GC
    set "PROFILE_DESC=Large (512MB-4GB)"
)
if /i "%PROFILE%"=="xlarge" (
    set JAVA_OPTS=-Xms1g -Xmx8g -XX:+UseG1GC
    set "PROFILE_DESC=Extra Large (1GB-8GB)"
)

REM Warn if using 32-bit Java with large profile
if not defined JAVA_64BIT (
    if /i not "%PROFILE%"=="normal" (
        echo WARNING: 32-bit Java 8 detected. Large memory profiles may not work.
        echo Please install 64-bit Java 8 for large PDF support:
        echo   https://adoptium.net/temurin/releases/?version=8^&arch=x64
        echo.
        set JAVA_OPTS=-Xms256m -Xmx1g -XX:+UseG1GC
        set "PROFILE_DESC=Limited (256MB-1GB) - 32-bit Java 8 limitation"
    )
)

REM Find the JAR file
set JAR_FILE=
for %%f in (target\eMark-PDF-Signer*.jar) do set JAR_FILE=%%f

if not defined JAR_FILE (
    REM Try current directory
    for %%f in (eMark-PDF-Signer*.jar) do set JAR_FILE=%%f
)

if not defined JAR_FILE (
    echo ERROR: JAR file not found.
    echo Please run 'mvn package' first or place the JAR in the current directory.
    pause
    exit /b 1
)

echo ============================================================================
echo  eMark PDF Signer - Advanced PDF Signing Application
echo ============================================================================
echo  Memory Profile: %PROFILE_DESC%
echo  JAR File: %JAR_FILE%
echo  Java Version: %JAVA_VERSION%
if defined JAVA_64BIT (
    echo  Java Architecture: 64-bit
) else (
    echo  Java Architecture: 32-bit (64-bit recommended for large memory profiles)
)
echo ============================================================================
echo.

java %JAVA_OPTS% -jar %JAR_FILE%

if %ERRORLEVEL% neq 0 (
    echo.
    echo Application exited with error code: %ERRORLEVEL%
    if %ERRORLEVEL%==1 (
        echo TIP: If you encountered OutOfMemoryError, try running with 'large' or 'xlarge' profile:
        echo      run-emark.bat large
        echo      run-emark.bat xlarge
    )
    pause
)

endlocal
