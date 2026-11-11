@echo off
setlocal
cd /d "%~dp0"
title Force Multiplier 22.3.2 - One Button TestFlight Upload
echo.
echo ============================================================
echo   FORCE MULTIPLIER - ONE BUTTON TESTFLIGHT UPLOAD
echo ============================================================
echo.
echo Repository: https://github.com/thordog73/ForceMultiplier.git
echo.
echo This will test the app locally, prepare iOS, push a new release
echo branch to GitHub, and let Codemagic build/sign/upload it to
ECHO TestFlight using the repository's Codemagic configuration.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Upload.ps1"
if errorlevel 1 (
  echo.
  echo ============================================================
  echo   UPLOAD STOPPED - NOTHING WAS FORCE-PUSHED
  echo ============================================================
  echo Read the error above, then press any key to close.
  pause >nul
  exit /b 1
)
echo.
echo ============================================================
echo   SOURCE UPLOAD COMPLETE
echo ============================================================
echo Codemagic should now run the signed TestFlight workflow.
echo Open Codemagic to watch the build and confirm Apple's result.
echo.
pause
