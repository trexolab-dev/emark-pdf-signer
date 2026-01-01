@echo off
REM ============================================================================
REM eMark PDF Signer - Launcher Script for Windows (x86/32-bit)
REM TrexoLab - https://trexolab.com
REM ============================================================================
REM
REM This script launches eMark PDF Signer with the bundled JRE 8 x86 (32-bit).
REM It is designed to work reliably under CMD and PowerShell.
REM
REM MEMORY PROFILES:
REM   normal  (default): -Xmx2g
REM   large:             -Xmx4g
REM   xlarge:            -Xmx8g
REM
REM Usage:
REM   run-emark-installed.bat                    # Normal profile
REM   run-emark-installed.bat large              # Large profile
REM   run-emark-installed.bat xlarge             # Extra Large profile
REM   run-emark-installed.bat "C:\path\to\file.pdf"  # Open PDF (normal profile)
REM   run-emark-installed.bat large "C:\path\to\file.pdf"  # Open PDF (large profile)
REM ============================================================================

REM Disable command echoing and enable delayed expansion safely
@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM Determine script directory (handles spaces in paths)
REM ============================================================================
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash if present
if "!SCRIPT_DIR:~-1!"=="\" set "SCRIPT_DIR=!SCRIPT_DIR:~0,-1!"

REM ============================================================================
REM Validate bundled Java runtime exists (x86 version)
REM ============================================================================
set "JAVA_EXE=!SCRIPT_DIR!\jre8-x86\bin\javaw.exe"
if not exist "!JAVA_EXE!" (
    set "JAVA_EXE=!SCRIPT_DIR!\jre8-x86\bin\java.exe"
)
if not exist "!JAVA_EXE!" goto ERROR_NO_JAVA

REM ============================================================================
REM Validate JAR file exists
REM ============================================================================
set "JAR_FILE=!SCRIPT_DIR!\eMark-PDF-Signer.jar"
if not exist "!JAR_FILE!" goto ERROR_NO_JAR

REM ============================================================================
REM Parse arguments - detect profile and/or PDF file path
REM ============================================================================
set "PROFILE=normal"
set "PDF_FILE="
set "ARG1=%~1"
set "ARG2=%~2"

REM Check if first argument is a profile or a file path
if "!ARG1!"=="" goto SET_PROFILE

REM Convert to lowercase for comparison
set "ARG1_LOWER=!ARG1!"
for %%A in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
    set "ARG1_LOWER=!ARG1_LOWER:%%A=%%A!"
)

REM Check if ARG1 is a memory profile
if "!ARG1_LOWER!"=="normal" (
    set "PROFILE=normal"
    if not "!ARG2!"=="" set "PDF_FILE=!ARG2!"
    goto SET_PROFILE
)
if "!ARG1_LOWER!"=="large" (
    set "PROFILE=large"
    if not "!ARG2!"=="" set "PDF_FILE=!ARG2!"
    goto SET_PROFILE
)
if "!ARG1_LOWER!"=="xlarge" (
    set "PROFILE=xlarge"
    if not "!ARG2!"=="" set "PDF_FILE=!ARG2!"
    goto SET_PROFILE
)

REM ARG1 is not a profile, assume it's a file path
set "PDF_FILE=!ARG1!"

:SET_PROFILE
if "!PROFILE!"=="normal" goto SET_NORMAL
if "!PROFILE!"=="large" goto SET_LARGE
if "!PROFILE!"=="xlarge" goto SET_XLARGE
goto SET_NORMAL

:SET_NORMAL
set "JAVA_OPTS=-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
goto RUN_APP

:SET_LARGE
set "JAVA_OPTS=-Xms512m -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
goto RUN_APP

:SET_XLARGE
set "JAVA_OPTS=-Xms1g -Xmx8g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
goto RUN_APP

REM ============================================================================
REM Launch the application
REM ============================================================================
:RUN_APP

REM Launch with javaw (no console window) for GUI application
REM Pass PDF file path if provided
if "!PDF_FILE!"=="" (
    start "" "!JAVA_EXE!" !JAVA_OPTS! -jar "!JAR_FILE!"
) else (
    start "" "!JAVA_EXE!" !JAVA_OPTS! -jar "!JAR_FILE!" "!PDF_FILE!"
)

REM Exit successfully
endlocal
exit /b 0

REM ============================================================================
REM Error Handlers
REM ============================================================================

:ERROR_NO_JAVA
echo.
echo ============================================================================
echo  ERROR: Java Runtime Not Found
echo ============================================================================
echo.
echo  The bundled Java 8 x86 (32-bit) runtime was not found at:
echo    "!SCRIPT_DIR!\jre8-x86\bin\java.exe"
echo.
echo  Please reinstall eMark PDF Signer to restore the Java runtime.
echo.
echo ============================================================================
pause
endlocal
exit /b 1

:ERROR_NO_JAR
echo.
echo ============================================================================
echo  ERROR: Application Not Found
echo ============================================================================
echo.
echo  The application JAR file was not found at:
echo    "!JAR_FILE!"
echo.
echo  Please reinstall eMark PDF Signer.
echo.
echo ============================================================================
pause
endlocal
exit /b 1
