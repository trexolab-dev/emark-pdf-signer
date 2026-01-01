; ============================================================================
; eMark PDF Signer - Windows x64 Installer Script
; Inno Setup 6.x Script
; TrexoLab - https://trexolab.com
; ============================================================================
;
; This installer packages:
; - eMark-PDF-Signer.jar (the main application)
; - Bundled JRE 8 x64 (no system Java required)
; - Memory-profile launchers for different PDF sizes
;
; Features:
; - Per-user or per-machine installation choice
; - Clean uninstall with option to remove user data
; - Silent launch without CMD window flickering
;
; Build command (from repository root):
;   iscc distributions\windows\emark-x64.iss
;
; ============================================================================

#define MyAppID "5F02AAC0-854D-4073-B662-488ADFEA0938"
#define MyAppName "eMark PDF Signer"
; Version is read from VERSION file - update VERSION file to change version
#define MyAppVersion Trim(FileRead(FileOpen("..\..\VERSION")))
#define MyAppPublisher "TrexoLab"
#define MyAppURL "https://github.com/trexolab-dev/emark-pdf-signer"
#define MyAppPublisherURL "https://trexolab.com"
#define MyAppExeName "run-emark-installed.bat"
#define MyAppLauncher "emark-launcher.vbs"
#define MyAppCopyright "Copyright (C) 2024-2025 TrexoLab"

; File association settings removed
; #define MyAppAssocName "eMark"
; #define MyAppAssocExt ".pdf"
; #define MyAppAssocKey StringChange(MyAppAssocName, " ", "") + MyAppAssocExt
; #define MyAppAssocIcon "association.ico"

[Setup]
; Unique application ID - DO NOT change after release
AppId={#MyAppID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppPublisherURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
AppCopyright={#MyAppCopyright}

; Installation directory - changes based on install mode
; Per-user: C:\Users\<user>\AppData\Local\Programs\TrexoLab\eMark PDF Signer
; Per-machine: C:\Program Files\TrexoLab\eMark PDF Signer
DefaultDirName={autopf}\TrexoLab\eMark PDF Signer
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; File associations disabled
; ChangesAssociations=yes

; Installer output settings
OutputDir=Output
OutputBaseFilename=emark-x64-setup
SetupIconFile=logo.ico
UninstallDisplayIcon={app}\logo.ico

; Branding images
WizardImageFile=eMark-inno.bmp
WizardSmallImageFile=wizard.bmp

; Compression settings
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes
LZMADictionarySize=65536
LZMANumFastBytes=64

; Architecture settings - 64-bit only
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

; UI settings
WizardStyle=modern
WizardSizePercent=100
DisableWelcomePage=no
DisableDirPage=no
DisableReadyPage=no
ShowLanguageDialog=no

; Privilege settings - allow user to choose per-user or per-machine install
; PrivilegesRequired=lowest means per-user by default
; PrivilegesRequiredOverridesAllowed=dialog shows the choice dialog
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog commandline

; Misc settings
AllowNoIcons=yes
CloseApplications=yes
RestartApplications=yes
UninstallDisplayName={#MyAppName}

; Version info embedded in installer
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppName} Setup
VersionInfoTextVersion={#MyAppVersion}
VersionInfoCopyright={#MyAppCopyright}
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel1=Welcome to {#MyAppName} Setup
WelcomeLabel2=This will install {#MyAppName} {#MyAppVersion} on your computer.%n%n{#MyAppName} includes a bundled Java 8 runtime - no separate Java installation is required.%n%nIt is recommended that you close all other applications before continuing.

[Types]
Name: "full"; Description: "Full installation (recommended)"
Name: "compact"; Description: "Compact installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Components]
Name: "main"; Description: "eMark PDF Signer Application"; Types: full compact custom; Flags: fixed
Name: "jre"; Description: "Bundled Java 8 Runtime (x64)"; Types: full custom; Flags: fixed

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "desktopicon\normal"; Description: "Normal (2GB)"; GroupDescription: "Desktop icon profile:"; Flags: exclusive
Name: "desktopicon\large"; Description: "Large (4GB)"; GroupDescription: "Desktop icon profile:"; Flags: exclusive unchecked
Name: "desktopicon\xlarge"; Description: "Extra Large (8GB)"; GroupDescription: "Desktop icon profile:"; Flags: exclusive unchecked

[Files]
; Main application JAR (from Maven target directory)
Source: "..\..\target\eMark-PDF-Signer.jar"; DestDir: "{app}"; Flags: ignoreversion; Components: main

; Launcher scripts
Source: "run-emark-installed.bat"; DestDir: "{app}"; Flags: ignoreversion; Components: main
Source: "emark-launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion; Components: main

; Bundled JRE 8 x64
Source: "jre8-x64\*"; DestDir: "{app}\jre8-x64"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: jre

; Branding assets
Source: "logo.ico"; DestDir: "{app}"; Flags: ignoreversion
; File association icon removed
; Source: "association.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Start Menu - Normal profile (default) - uses wscript to launch silently without CMD window
Name: "{group}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"""; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Comment: "Launch eMark PDF Signer (Normal - 2GB)"

; Start Menu - Large profile
Name: "{group}\{#MyAppName} (Large)"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"" large"; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Comment: "Launch eMark PDF Signer (Large - 4GB)"

; Start Menu - Extra Large profile
Name: "{group}\{#MyAppName} (Extra Large)"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"" xlarge"; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Comment: "Launch eMark PDF Signer (Extra Large - 8GB)"

; Start Menu - Uninstall shortcut
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"; Comment: "Uninstall eMark PDF Signer"

; Desktop icons (based on task selection) - uses wscript to launch silently without CMD window
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"""; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Tasks: desktopicon\normal
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"" large"; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Tasks: desktopicon\large
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"" xlarge"; WorkingDir: "{app}"; IconFilename: "{app}\logo.ico"; Tasks: desktopicon\xlarge

; [Registry] section removed - file association disabled

[Run]
; Launch after installation - uses wscript to launch silently without CMD window
Filename: "wscript.exe"; Parameters: """{app}\{#MyAppLauncher}"""; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent; WorkingDir: "{app}"

[UninstallDelete]
; Clean up any generated files in app directory
Type: filesandordirs; Name: "{app}\logs"
Type: filesandordirs; Name: "{app}\temp"
Type: dirifempty; Name: "{app}"
; Note: User data cleanup is handled in [Code] section with user confirmation

[Code]
var
  RemoveUserDataCheckbox: TNewCheckBox;

//********** Check if application is already installed
function MyAppInstalled: Boolean;
begin
  Result := RegKeyExists(HKEY_LOCAL_MACHINE,
    'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{' + '{#MyAppID}' + '}_is1')
    or RegKeyExists(HKEY_CURRENT_USER,
    'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{' + '{#MyAppID}' + '}_is1');
end;

//********** Check if running on 64-bit Windows
function Is64BitInstallMode: Boolean;
begin
  Result := IsWin64;
end;

//********** Delete a directory recursively
procedure DelTreeSafe(const Path: String);
begin
  if DirExists(Path) then
  begin
    Log('Removing directory: ' + Path);
    DelTree(Path, True, True, True);
  end;
end;

//********** Get user home directory
function GetUserHomeDir: String;
begin
  Result := GetEnv('USERPROFILE');
  if Result = '' then
    Result := ExpandConstant('{%HOMEDRIVE}{%HOMEPATH}');
end;

//********** Compare version strings (returns: -1 if v1<v2, 0 if v1=v2, 1 if v1>v2)
function CompareVersions(v1, v2: String): Integer;
var
  v1Parts, v2Parts: array of Integer;
  v1Temp, v2Temp: String;
  dotPos: Integer;
  i, maxLen: Integer;
  v1Part, v2Part: Integer;
begin
  // Parse v1 into parts
  SetArrayLength(v1Parts, 0);
  v1Temp := v1;
  while Length(v1Temp) > 0 do
  begin
    dotPos := Pos('.', v1Temp);
    if dotPos = 0 then
    begin
      SetArrayLength(v1Parts, GetArrayLength(v1Parts) + 1);
      v1Parts[GetArrayLength(v1Parts) - 1] := StrToIntDef(v1Temp, 0);
      v1Temp := '';
    end
    else
    begin
      SetArrayLength(v1Parts, GetArrayLength(v1Parts) + 1);
      v1Parts[GetArrayLength(v1Parts) - 1] := StrToIntDef(Copy(v1Temp, 1, dotPos - 1), 0);
      v1Temp := Copy(v1Temp, dotPos + 1, Length(v1Temp));
    end;
  end;

  // Parse v2 into parts
  SetArrayLength(v2Parts, 0);
  v2Temp := v2;
  while Length(v2Temp) > 0 do
  begin
    dotPos := Pos('.', v2Temp);
    if dotPos = 0 then
    begin
      SetArrayLength(v2Parts, GetArrayLength(v2Parts) + 1);
      v2Parts[GetArrayLength(v2Parts) - 1] := StrToIntDef(v2Temp, 0);
      v2Temp := '';
    end
    else
    begin
      SetArrayLength(v2Parts, GetArrayLength(v2Parts) + 1);
      v2Parts[GetArrayLength(v2Parts) - 1] := StrToIntDef(Copy(v2Temp, 1, dotPos - 1), 0);
      v2Temp := Copy(v2Temp, dotPos + 1, Length(v2Temp));
    end;
  end;

  // Compare parts
  maxLen := GetArrayLength(v1Parts);
  if GetArrayLength(v2Parts) > maxLen then
    maxLen := GetArrayLength(v2Parts);

  for i := 0 to maxLen - 1 do
  begin
    if i < GetArrayLength(v1Parts) then
      v1Part := v1Parts[i]
    else
      v1Part := 0;

    if i < GetArrayLength(v2Parts) then
      v2Part := v2Parts[i]
    else
      v2Part := 0;

    if v1Part < v2Part then
    begin
      Result := -1;
      Exit;
    end
    else if v1Part > v2Part then
    begin
      Result := 1;
      Exit;
    end;
  end;

  Result := 0;
end;

//********** Get installed version from registry
function GetInstalledVersion: String;
var
  keyPath: String;
  installedVersion: String;
begin
  keyPath := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{' + '{#MyAppID}' + '}_is1';
  installedVersion := '';

  // Try HKLM first
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE, keyPath, 'DisplayVersion', installedVersion) then
    // Then try HKCU
    RegQueryStringValue(HKEY_CURRENT_USER, keyPath, 'DisplayVersion', installedVersion);

  Result := installedVersion;
end;

//********** If app already installed, check version and handle accordingly
function InitializeSetup(): Boolean;
var
  uninstaller: String;
  installedVersion: String;
  currentVersion: String;
  versionCompare: Integer;
  ErrorCode: Integer;
  keyPath: String;
begin
  // Check if running on 64-bit Windows
  if not IsWin64 then
  begin
    MsgBox('{#MyAppName} requires a 64-bit version of Windows.' + #13#10 +
           'Please install on a 64-bit Windows system.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // Check if already installed
  if not MyAppInstalled then begin
    Result := True;
    Exit;
  end;

  keyPath := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{' + '{#MyAppID}' + '}_is1';
  currentVersion := '{#MyAppVersion}';
  installedVersion := GetInstalledVersion();

  // If we couldn't get the installed version, treat as older
  if installedVersion = '' then
    installedVersion := '0.0.0';

  versionCompare := CompareVersions(installedVersion, currentVersion);
  Log('Installed version: ' + installedVersion);
  Log('Current version: ' + currentVersion);
  Log('Version comparison result: ' + IntToStr(versionCompare));

  // Case 1: Newer version is already installed
  if versionCompare > 0 then
  begin
    MsgBox('{#MyAppName} version ' + installedVersion + ' is already installed.' + #13#10#13#10 +
           'This is a newer version than ' + currentVersion + ' that you are trying to install.' + #13#10#13#10 +
           'Installation will be aborted to protect your newer installation.' + #13#10 +
           'If you want to downgrade, please uninstall the current version first.',
           mbInformation, MB_OK);
    Result := False;
    Exit;
  end;

  // Case 2: Same version is already installed
  if versionCompare = 0 then
  begin
    if MsgBox('{#MyAppName} version ' + installedVersion + ' is already installed.' + #13#10#13#10 +
              'Do you want to reinstall this version?' + #13#10#13#10 +
              'Click "Yes" to reinstall (will uninstall current version first).' + #13#10 +
              'Click "No" to cancel installation.',
              mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
      Exit;
    end;
  end
  // Case 3: Older version is installed
  else
  begin
    if MsgBox('{#MyAppName} version ' + installedVersion + ' is currently installed.' + #13#10#13#10 +
              'This installer will upgrade to version ' + currentVersion + '.' + #13#10#13#10 +
              'The previous version will be uninstalled automatically.' + #13#10 +
              'Your user data and settings will be preserved.' + #13#10#13#10 +
              'Do you want to continue with the upgrade?',
              mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
      Exit;
    end;
  end;

  // Proceed with uninstallation of existing version
  RegQueryStringValue(HKEY_LOCAL_MACHINE, keyPath, 'QuietUninstallString', uninstaller);
  if uninstaller = '' then
    RegQueryStringValue(HKEY_CURRENT_USER, keyPath, 'QuietUninstallString', uninstaller);

  if uninstaller <> '' then begin
    Log('Running uninstaller: ' + uninstaller);

    if not Exec(ExpandConstant('{cmd}'), '/C ' + uninstaller, '', SW_SHOW, ewWaitUntilTerminated, ErrorCode) then begin
      MsgBox('Failed to start uninstaller. Error code: ' + IntToStr(ErrorCode) + #13#10#13#10 +
        'Please uninstall {#MyAppName} manually from Windows Settings and try again.',
        mbError, MB_OK);
      Result := False;
      Exit;
    end;

    if (ErrorCode <> 0) then begin
      MsgBox('Uninstallation failed with error code: ' + IntToStr(ErrorCode) + #13#10#13#10 +
        'Please uninstall {#MyAppName} manually from Windows Settings and try again.',
        mbError, MB_OK);
      Result := False;
      Exit;
    end;

    // Give Windows time to complete the uninstallation
    Sleep(1000);
    Log('Previous version uninstalled successfully.');
  end;

  Result := True;
end;

// Show a message after successful installation
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    Log('eMark PDF Signer installation completed successfully.');
    if IsAdminInstallMode then
      Log('Installation mode: Per-machine (all users)')
    else
      Log('Installation mode: Per-user (current user only)');
  end;
end;

//********** Initialize Uninstall - Ask user about data removal
function InitializeUninstall(): Boolean;
begin
  Result := True;
end;

//********** Custom uninstall page with checkbox for user data
procedure InitializeUninstallProgressForm();
var
  UserDataLabel: TNewStaticText;
  UserDataPath: String;
begin
  UserDataPath := GetUserHomeDir + '\.eMark';

  // Only show option if user data exists
  if DirExists(UserDataPath) or DirExists(ExpandConstant('{localappdata}\.eMark')) then
  begin
    UserDataLabel := TNewStaticText.Create(UninstallProgressForm);
    UserDataLabel.Parent := UninstallProgressForm;
    UserDataLabel.Left := ScaleX(20);
    UserDataLabel.Top := UninstallProgressForm.StatusLabel.Top + UninstallProgressForm.StatusLabel.Height + ScaleY(40);
    UserDataLabel.Width := UninstallProgressForm.ClientWidth - ScaleX(40);
    UserDataLabel.Height := ScaleY(40);
    UserDataLabel.AutoSize := False;
    UserDataLabel.WordWrap := True;
    UserDataLabel.Caption := 'User data includes your signature profiles, certificate settings, and preferences stored in: ' + UserDataPath;

    RemoveUserDataCheckbox := TNewCheckBox.Create(UninstallProgressForm);
    RemoveUserDataCheckbox.Parent := UninstallProgressForm;
    RemoveUserDataCheckbox.Left := ScaleX(20);
    RemoveUserDataCheckbox.Top := UserDataLabel.Top + UserDataLabel.Height + ScaleY(10);
    RemoveUserDataCheckbox.Width := UninstallProgressForm.ClientWidth - ScaleX(40);
    RemoveUserDataCheckbox.Height := ScaleY(20);
    RemoveUserDataCheckbox.Caption := 'Also remove my user data and settings (signature profiles, preferences)';
    RemoveUserDataCheckbox.Checked := False;
  end;
end;

// Clean up on uninstall - handle user data based on checkbox
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  UserDataPath: String;
  LocalAppDataPath: String;
  UserAppDataPath: String;
begin
  if CurUninstallStep = usUninstall then
  begin
    Log('Uninstalling eMark PDF Signer...');
  end;

  if CurUninstallStep = usPostUninstall then
  begin
    // Check if user opted to remove data
    if (RemoveUserDataCheckbox <> nil) and RemoveUserDataCheckbox.Checked then
    begin
      Log('User opted to remove user data...');

      // Remove user data from home directory (~/.eMark)
      UserDataPath := GetUserHomeDir + '\.eMark';
      DelTreeSafe(UserDataPath);

      // Remove from LocalAppData
      LocalAppDataPath := ExpandConstant('{localappdata}\.eMark');
      DelTreeSafe(LocalAppDataPath);

      // Remove from AppData/Roaming
      UserAppDataPath := ExpandConstant('{userappdata}\.eMark');
      DelTreeSafe(UserAppDataPath);

      Log('User data removed successfully.');
    end
    else
    begin
      Log('User data preserved as requested.');
    end;
  end;
end;

//********** Show installation summary
function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo,
  MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
var
  InstallMode: String;
begin
  if IsAdminInstallMode then
    InstallMode := 'Per-machine (all users - requires Administrator)'
  else
    InstallMode := 'Per-user (current user only)';

  Result := '';

  // Installation mode
  Result := Result + 'Installation Mode:' + NewLine;
  Result := Result + Space + InstallMode + NewLine + NewLine;

  // Directory
  if MemoDirInfo <> '' then
    Result := Result + MemoDirInfo + NewLine + NewLine;

  // Components
  if MemoComponentsInfo <> '' then
    Result := Result + MemoComponentsInfo + NewLine + NewLine;

  // Tasks
  if MemoTasksInfo <> '' then
    Result := Result + MemoTasksInfo + NewLine + NewLine;

  // User data location
  Result := Result + 'User Data Location:' + NewLine;
  Result := Result + Space + GetUserHomeDir + '\.eMark' + NewLine;
end;
