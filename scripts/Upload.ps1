$ErrorActionPreference = 'Stop'
$RepositoryUrl = 'https://github.com/thordog73/ForceMultiplier.git'
$WorkflowId = 'ios-release'
$Root = Split-Path -Parent $PSScriptRoot
$StateDir = Join-Path $env:LOCALAPPDATA 'ForceMultiplierUploader'
$TokenFile = Join-Path $StateDir 'codemagic-token.txt'
$AppIdFile = Join-Path $StateDir 'codemagic-app-id.txt'

$GitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
if (-not $GitCommand) { $GitCommand = Get-Command git -ErrorAction SilentlyContinue }
if (-not $GitCommand) { throw 'Git for Windows was not found. Install Git, then run UPLOAD.cmd again.' }
$GitExe = $GitCommand.Source
if (-not $GitExe) { $GitExe = $GitCommand.Path }
if (-not $GitExe) { $GitExe = 'git.exe' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js was not found. Install Node.js 22 or later, then run UPLOAD.cmd again.' }

function Invoke-GitExe([string[]]$Arguments) {
  & $script:GitExe @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Git failed: $($Arguments -join ' '). No force push was attempted." }
}

function Convert-SecureStringToPlain([Security.SecureString]$Secure) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Get-CodemagicToken {
  if ($env:CODEMAGIC_API_TOKEN) { Write-Host 'Using Codemagic API token from CODEMAGIC_API_TOKEN.' -ForegroundColor DarkGray; return $env:CODEMAGIC_API_TOKEN.Trim() }
  if (Test-Path $TokenFile) {
    try {
      $encrypted = (Get-Content -LiteralPath $TokenFile -Raw).Trim()
      if ($encrypted) {
        $secure = ConvertTo-SecureString $encrypted
        $plain = Convert-SecureStringToPlain $secure
        if ($plain) { Write-Host 'Using saved Codemagic API token from Windows encrypted storage.' -ForegroundColor DarkGray; return $plain.Trim() }
      }
    } catch {
      Write-Host 'The saved Codemagic token could not be read; a new one is needed.' -ForegroundColor Yellow
    }
  }
  Write-Host ''
  Write-Host 'ONE-TIME SETUP: Codemagic API token required.' -ForegroundColor Yellow
  Write-Host 'In Codemagic, open Account settings > API token, copy the token, then paste it here.' -ForegroundColor Yellow
  $secure = Read-Host 'Codemagic API token' -AsSecureString
  $plain = Convert-SecureStringToPlain $secure
  if (-not $plain) { throw 'No Codemagic API token was entered.' }
  New-Item -ItemType Directory -Path $StateDir -Force | Out-Null
  ($secure | ConvertFrom-SecureString) | Set-Content -LiteralPath $TokenFile -Encoding UTF8
  return $plain.Trim()
}

function Invoke-Codemagic([string]$Method, [string]$Url, [string]$Token, $Body = $null) {
  if (-not $Url.StartsWith('https://api.codemagic.io/')) { throw 'Unexpected Codemagic API destination.' }
  $headers = @{ 'x-auth-token' = $Token; 'Content-Type' = 'application/json' }
  try {
    if ($null -eq $Body) {
      return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -TimeoutSec 60
    }
    $json = $Body | ConvertTo-Json -Depth 12 -Compress
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body $json -TimeoutSec 60
  } catch {
    $status = $null
    try { $status = [int]$_.Exception.Response.StatusCode } catch {}
    if ($status -eq 401) { throw 'Codemagic rejected the API token. Delete the saved token from %LOCALAPPDATA%\ForceMultiplierUploader and run UPLOAD.cmd again.' }
    if ($status -eq 403) { throw 'The Codemagic API token does not have permission to start this build.' }
    if ($status -eq 402) { throw 'Codemagic reports a build allowance/billing issue.' }
    throw "Codemagic API request failed. $($_.Exception.Message)"
  }
}

function Get-AppId([string]$Token) {
  if (Test-Path $AppIdFile) {
    $saved = (Get-Content -LiteralPath $AppIdFile -Raw).Trim()
    if ($saved) { return $saved }
  }
  Write-Host 'Finding the Force Multiplier app in Codemagic...' -ForegroundColor Cyan
  $response = Invoke-Codemagic 'GET' 'https://api.codemagic.io/apps' $Token
  $apps = @()
  if ($response.applications) { $apps = @($response.applications) }
  elseif ($response.data) { $apps = @($response.data) }
  else { throw 'Codemagic did not return an application list.' }

  $matchedApps = @()
  foreach ($app in $apps) {
    $name = ''
    if ($app.appName) { $name = [string]$app.appName }
    elseif ($app.name) { $name = [string]$app.name }
    $all = ($app | ConvertTo-Json -Depth 10 -Compress)
    if ($name -match '(?i)force[ _-]*multiplier' -or $all -match '(?i)thordog73[/\\]ForceMultiplier|com\.fredesser\.forcemultiplier') {
      $matchedApps += $app
    }
  }

  if ($matchedApps.Count -eq 0) {
    Write-Host 'Codemagic apps visible to this token:' -ForegroundColor Yellow
    for ($i=0; $i -lt $apps.Count; $i++) {
      $n = if ($apps[$i].appName) { $apps[$i].appName } elseif ($apps[$i].name) { $apps[$i].name } else { '(unnamed app)' }
      $id = if ($apps[$i]._id) { $apps[$i]._id } else { $apps[$i].id }
      Write-Host "  [$($i+1)] $n  $id"
    }
    throw 'Could not uniquely identify the Force Multiplier Codemagic app. Open Codemagic and confirm this GitHub repository is added as an application.'
  }

  $chosen = $null
  if ($matchedApps.Count -eq 1) { $chosen = $matchedApps[0] }
  else {
    $exact = @($matchedApps | Where-Object {
      (($_.appName -as [string]) -match '^(?i)Force[ _-]*Multiplier$') -or (($_.name -as [string]) -match '^(?i)Force[ _-]*Multiplier$')
    })
    if ($exact.Count -eq 1) { $chosen = $exact[0] }
  }
  if ($null -eq $chosen) {
    Write-Host 'More than one Force Multiplier-like Codemagic app was found:' -ForegroundColor Yellow
    for ($i=0; $i -lt $matchedApps.Count; $i++) {
      $n = if ($matchedApps[$i].appName) { $matchedApps[$i].appName } elseif ($matchedApps[$i].name) { $matchedApps[$i].name } else { '(unnamed app)' }
      $id = if ($matchedApps[$i]._id) { $matchedApps[$i]._id } else { $matchedApps[$i].id }
      Write-Host "  [$($i+1)] $n  $id"
    }
    $selection = Read-Host 'Enter the number for the Force Multiplier app (one-time setup)'
    $index = 0
    if (-not [int]::TryParse($selection, [ref]$index) -or $index -lt 1 -or $index -gt $matchedApps.Count) { throw 'Invalid Codemagic app selection.' }
    $chosen = $matchedApps[$index-1]
  }

  $appId = if ($chosen._id) { [string]$chosen._id } else { [string]$chosen.id }
  if (-not $appId) { throw 'Codemagic app identifier was missing.' }
  New-Item -ItemType Directory -Path $StateDir -Force | Out-Null
  Set-Content -LiteralPath $AppIdFile -Value $appId -Encoding ASCII
  return $appId
}

Write-Host ''
Write-Host 'Force Multiplier 22.4.0 one-button TestFlight uploader' -ForegroundColor Cyan
Write-Host "Repository: $RepositoryUrl"
Write-Host ''

Push-Location $Root
try {
  Write-Host '[1/5] Installing locked dependencies...' -ForegroundColor Cyan
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. Nothing was uploaded.' }

  Write-Host '[2/5] Running regression and release checks...' -ForegroundColor Cyan
  & npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw 'Tests failed. Nothing was uploaded.' }
  & npm.cmd run check
  if ($LASTEXITCODE -ne 0) { throw 'Package checks failed. Nothing was uploaded.' }

  Write-Host '[3/5] Preparing the iOS project...' -ForegroundColor Cyan
  & npm.cmd run ios:prepare
  if ($LASTEXITCODE -ne 0) { throw 'iOS preparation failed. Nothing was uploaded.' }
  & npm.cmd run ios:verify
  if ($LASTEXITCODE -ne 0) { throw 'Generated iOS asset verification failed. Nothing was uploaded.' }
} finally { Pop-Location }

$Checkout = Join-Path ([System.IO.Path]::GetTempPath()) ('force-multiplier-upload-' + [guid]::NewGuid().ToString('N'))
Write-Host '[4/5] Uploading a new release branch to GitHub...' -ForegroundColor Cyan
Invoke-GitExe -Arguments @('clone', $RepositoryUrl, $Checkout)

$Branch = $null
Push-Location $Checkout
try {
  Invoke-GitExe -Arguments @('config','user.name','Force Multiplier Release Uploader')
  Invoke-GitExe -Arguments @('config','user.email','force-multiplier-uploader@users.noreply.github.com')
  $Branch = 'release/force-multiplier-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0,6))
  Invoke-GitExe -Arguments @('checkout','-b',$Branch)
  $Paths = @('dist','ios','native-src','scripts','tests','docs','reviews','package.json','package-lock.json','capacitor.config.json','codemagic.yaml','UPLOAD.cmd','RESET-CODEMAGIC-SETUP.cmd','README.md','SOURCE_README.md','.gitignore','.gitattributes','FORCE_MULTIPLIER_PACKAGE.json')
  foreach ($Path in $Paths) {
    $Source = Join-Path $Root $Path
    if (Test-Path $Source) { Copy-Item -LiteralPath $Source -Destination $Checkout -Recurse -Force }
  }
  Invoke-GitExe -Arguments @('add','--all')
  $Status = & $GitExe status --porcelain
  if ($LASTEXITCODE -ne 0) { throw 'Could not read Git status.' }
  if (-not $Status) { Invoke-GitExe -Arguments @('commit','--allow-empty','-m','Trigger Force Multiplier 22.4.0 TestFlight release') }
  else { Invoke-GitExe -Arguments @('commit','-m','Force Multiplier 22.4.0 TestFlight release') }
  Invoke-GitExe -Arguments @('push','--set-upstream','origin',$Branch)
} finally { Pop-Location }

Write-Host '[5/5] Starting Codemagic ios-release directly...' -ForegroundColor Cyan
$token = Get-CodemagicToken
$appId = Get-AppId $token
$payload = @{ appId = $appId; workflowId = $WorkflowId; branch = $Branch; instanceType = 'mac_mini_m2'; labels = @('ForceMultiplier','22.4.0','one-button') }
$result = Invoke-Codemagic 'POST' 'https://api.codemagic.io/builds' $token $payload
$buildId = [string]$result.buildId
if (-not $buildId) { throw 'Codemagic did not return a build ID, so the build start is not confirmed.' }

Write-Host ''
Write-Host "SUCCESS: Codemagic accepted build $buildId" -ForegroundColor Green
Write-Host "Branch: $Branch" -ForegroundColor Green
Write-Host 'Workflow: ios-release' -ForegroundColor Green
Write-Host 'Codemagic Builds: https://codemagic.io/builds' -ForegroundColor Green
Write-Host 'The workflow signs and uploads to TestFlight; public App Review submission remains disabled.' -ForegroundColor Yellow
try { Start-Process 'https://codemagic.io/builds' } catch {}
