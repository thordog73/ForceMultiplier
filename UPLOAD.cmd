@echo off
setlocal
cd /d "%~dp0"
title Force Multiplier - Upload to TestFlight
cls
echo ============================================================
echo FORCE MULTIPLIER - TESTFLIGHT UPLOAD
echo ============================================================
echo.
where node.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found.
  echo Install Node.js 22 or newer, then run this file again.
  echo.
  pause
  exit /b 1
)
where git.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git for Windows was not found.
  echo Install Git for Windows and sign in to GitHub, then retry.
  echo.
  pause
  exit /b 1
)
node "%~dp0scripts\upload-testflight.cjs"
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" (
  echo ============================================================
  echo UPLOAD STOPPED - error code %RC%
  echo The useful error is printed above. Take a photo or copy it to ChatGPT.
  echo ============================================================
) else (
  echo ============================================================
  echo SOURCE PUSH COMPLETE - leave this window open until you have read the message above.
  echo ============================================================
)
echo.
pause
exit /b %RC%
