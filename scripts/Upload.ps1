param([string]$RepositoryUrl)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git for Windows from git-scm.com and sign in to your chosen Git provider first.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22 or later from nodejs.org, then retry.' }
if (-not $RepositoryUrl) { $RepositoryUrl = Read-Host 'Existing private repository HTTPS URL (you must own or be authorized to update it)' }
if ($RepositoryUrl -notmatch '^https://(github\.com|gitlab\.com|bitbucket\.org)/[A-Za-z0-9_.\-/]+(?:\.git)?$') { throw 'Use an HTTPS repository URL at GitHub, GitLab or Bitbucket, without credentials or query strings.' }
function Git([string[]]$Arguments) { & git @Arguments; if ($LASTEXITCODE -ne 0) { throw "Git failed. No force push was attempted." } }
Push-Location $Root
try {
  & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  & npm.cmd test; if ($LASTEXITCODE -ne 0) { throw 'Tests failed. Nothing uploaded.' }
  & npm.cmd run check; if ($LASTEXITCODE -ne 0) { throw 'Package checks failed. Nothing uploaded.' }
  & npm.cmd run ios:prepare; if ($LASTEXITCODE -ne 0) { throw 'iOS preparation failed. Nothing uploaded.' }
} finally { Pop-Location }
$Checkout = Join-Path ([System.IO.Path]::GetTempPath()) ('force-multiplier-upload-' + [guid]::NewGuid().ToString('N'))
Git -Arguments @('clone', '--', $RepositoryUrl, $Checkout)
Push-Location $Checkout
try {
  $Existing = Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' }
  if ($Existing -and -not (Test-Path 'FORCE_MULTIPLIER_PACKAGE.json')) { throw 'Repository is not empty and lacks the Force Multiplier package marker. Use a new empty repository; existing files were not modified.' }
  $Branch = 'release/force-multiplier-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0,6))
  Git -Arguments @('checkout','-b',$Branch)
  $Paths = @('dist','ios','native-src','scripts','tests','docs','reviews','package.json','package-lock.json','capacitor.config.json','codemagic.yaml','UPLOAD.cmd','README.md','SOURCE_README.md','.gitignore','.gitattributes','FORCE_MULTIPLIER_PACKAGE.json')
  foreach ($Path in $Paths) { Copy-Item -LiteralPath (Join-Path $Root $Path) -Destination $Checkout -Recurse -Force }
  Git -Arguments @('add','--all')
  Git -Arguments @('commit','-m','Prepare Force Multiplier offline iOS release candidate')
  Git -Arguments @('push','--set-upstream','origin',$Branch)
  Write-Host "Uploaded source to $Branch. Your default branch was not changed."
  Write-Host 'If this repository is connected in Codemagic, the ios-validate workflow starts on this push. Check Codemagic for its actual result.'
  Write-Host 'Signed IPA workflow is manual after Apple signing setup. No App Store submission was performed.'
} finally { Pop-Location }
Write-Host "Local upload checkout kept at $Checkout for inspection."
