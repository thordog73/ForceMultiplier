@echo off
setlocal
cd /d "%~dp0"
title Force Multiplier 22.3.5 - One Button TestFlight Upload

echo.
echo ============================================================
echo   FORCE MULTIPLIER - ONE BUTTON TESTFLIGHT UPLOAD
echo ============================================================
echo.
echo Repository: https://github.com/thordog73/ForceMultiplier.git
echo.
echo This will:
echo   1. test and prepare the iOS source
echo   2. push a new release branch to GitHub
echo   3. START the Codemagic ios-release build directly
echo   4. Codemagic signs and uploads the IPA to TestFlight
echo.
echo The first run may ask for your Codemagic API token once.
echo It is stored encrypted for your Windows user only.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Upload.ps1"
if errorlevel 1 (
  echo.
  echo ============================================================
  echo   UPLOAD STOPPED
echo ============================================================
  echo Read the error above, then press any key to close.
  pause >nul
  exit /b 1
)
echo.
echo ============================================================
echo   CODEMAGIC BUILD STARTED
echo ============================================================
echo The source was pushed and Codemagic accepted the build request.
echo Open Codemagic to watch the signed TestFlight build.
echo.
pause
