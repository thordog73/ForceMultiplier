@echo off
setlocal
if "%~1"=="" (
  echo Usage: UPLOAD.cmd "https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git"
  exit /b 1
)
node "%~dp0tools\upload-source.mjs" "%~1"
exit /b %errorlevel%
