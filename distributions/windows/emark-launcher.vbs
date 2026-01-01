' ============================================================================
' eMark PDF Signer - Silent Launcher (VBScript)
' TrexoLab - https://trexolab.com
' ============================================================================
'
' This script launches eMark PDF Signer without showing a command window.
' It is used for file associations and shortcuts to display "eMark PDF Signer"
' in the Open With menu instead of "Windows Command Processor".
'
' Usage:
'   wscript.exe emark-launcher.vbs [profile] [pdf_file]
'   wscript.exe emark-launcher.vbs "C:\path\to\file.pdf"
'   wscript.exe emark-launcher.vbs large "C:\path\to\file.pdf"
'
' ============================================================================

Option Explicit

Dim objShell, objFSO
Dim strScriptDir, strBatchFile, strArgs, strCommand
Dim i

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Path to the batch launcher
strBatchFile = strScriptDir & "\run-emark-installed.bat"

' Build arguments string from command line arguments
strArgs = ""
For i = 0 To WScript.Arguments.Count - 1
    If InStr(WScript.Arguments(i), " ") > 0 Then
        ' Quote arguments with spaces
        strArgs = strArgs & " """ & WScript.Arguments(i) & """"
    Else
        strArgs = strArgs & " " & WScript.Arguments(i)
    End If
Next

' Build the command - use cmd /c to run batch file
strCommand = "cmd /c """ & strBatchFile & """" & strArgs

' Run the command hidden (0 = hidden window, False = don't wait)
objShell.Run strCommand, 0, False

' Clean up
Set objShell = Nothing
Set objFSO = Nothing
