@echo off
setlocal
set "DIR=%LOCALAPPDATA%\ForceMultiplierUploader"
echo.
echo This clears only the locally saved Force Multiplier Codemagic token/app selection.
echo It does NOT delete GitHub, Codemagic, TestFlight, or app data.
echo.
if exist "%DIR%" (
  rmdir /s /q "%DIR%"
  echo Saved Codemagic setup cleared.
) else (
  echo No saved Codemagic setup was found.
)
echo.
pause
