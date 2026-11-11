$ErrorActionPreference = 'Stop'
$RepositoryUrl = 'https://github.com/thordog73/ForceMultiplier.git'
$Root = Split-Path -Parent $PSScriptRoot

$GitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
if (-not $GitCommand) { $GitCommand = Get-Command git -ErrorAction SilentlyContinue }
if (-not $GitCommand) {
  throw 'Git for Windows was not found. Install Git from git-scm.com, sign in to GitHub once, then double-click UPLOAD.cmd again.'
}
$GitExe = $GitCommand.Source
if (-not $GitExe) { $GitExe = $GitCommand.Path }
if (-not $GitExe) { $GitExe = 'git.exe' }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js was not found. Install Node.js 22 or later from nodejs.org, then double-click UPLOAD.cmd again.'
}

function Invoke-GitExe([string[]]$Arguments) {
  & $script:GitExe @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Git failed: $($Arguments -join ' '). No force push was attempted." }
}

Write-Host ''
Write-Host 'Force Multiplier one-button release uploader' -ForegroundColor Cyan
Write-Host "Repository: $RepositoryUrl"
Write-Host ''

Push-Location $Root
try {
  Write-Host '[1/4] Installing locked dependencies...' -ForegroundColor Cyan
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. Nothing was uploaded.' }

  Write-Host '[2/4] Running regression and release checks...' -ForegroundColor Cyan
  & npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw 'Tests failed. Nothing was uploaded.' }
  & npm.cmd run check
  if ($LASTEXITCODE -ne 0) { throw 'Package checks failed. Nothing was uploaded.' }

  Write-Host '[3/4] Preparing the iOS project...' -ForegroundColor Cyan
  & npm.cmd run ios:prepare
  if ($LASTEXITCODE -ne 0) { throw 'iOS preparation failed. Nothing was uploaded.' }
} finally {
  Pop-Location
}

$Checkout = Join-Path ([System.IO.Path]::GetTempPath()) ('force-multiplier-upload-' + [guid]::NewGuid().ToString('N'))
Write-Host '[4/4] Uploading a new release branch to GitHub...' -ForegroundColor Cyan
Invoke-GitExe -Arguments @('clone', $RepositoryUrl, $Checkout)

Push-Location $Checkout
try {
  # Use a local identity only inside this temporary release checkout.
  Invoke-GitExe -Arguments @('config','user.name','Force Multiplier Release Uploader')
  Invoke-GitExe -Arguments @('config','user.email','force-multiplier-uploader@users.noreply.github.com')

  $Branch = 'release/force-multiplier-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0,6))
  Invoke-GitExe -Arguments @('checkout','-b',$Branch)

  $Paths = @(
    'dist','ios','native-src','scripts','tests','docs','reviews',
    'package.json','package-lock.json','capacitor.config.json','codemagic.yaml',
    'UPLOAD.cmd','README.md','SOURCE_README.md','.gitignore','.gitattributes',
    'FORCE_MULTIPLIER_PACKAGE.json'
  )
  foreach ($Path in $Paths) {
    $Source = Join-Path $Root $Path
    if (Test-Path $Source) {
      Copy-Item -LiteralPath $Source -Destination $Checkout -Recurse -Force
    }
  }

  Invoke-GitExe -Arguments @('add','--all')
  $Status = & $GitExe status --porcelain
  if ($LASTEXITCODE -ne 0) { throw 'Could not read Git status. Nothing was pushed.' }

  if (-not $Status) {
    Write-Host 'No source changes detected. Creating an empty release commit so Codemagic can run.' -ForegroundColor Yellow
    Invoke-GitExe -Arguments @('commit','--allow-empty','-m','Trigger Force Multiplier TestFlight release')
  } else {
    Invoke-GitExe -Arguments @('commit','-m','Force Multiplier 22.3.2 TestFlight release')
  }
  Invoke-GitExe -Arguments @('push','--set-upstream','origin',$Branch)

  Write-Host ''
  Write-Host "SUCCESS: pushed $Branch" -ForegroundColor Green
  Write-Host 'Codemagic is configured to run the signed iOS release on this release branch.' -ForegroundColor Green
  Write-Host 'If Apple signing and the App Store Connect integration are valid, Codemagic will upload the resulting build to TestFlight.' -ForegroundColor Green
  Write-Host 'This workflow does NOT submit the app for public App Review.' -ForegroundColor Yellow
} finally {
  Pop-Location
}

Write-Host "Temporary upload checkout: $Checkout"
