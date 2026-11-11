#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"
bash scripts/check-apple-tools.sh
mkdir -p artifacts/simulator
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build/simulator \
  CODE_SIGNING_ALLOWED=NO \
  build 2>&1 | tee artifacts/simulator/build.log
python3 scripts/simulator-smoke.py build/simulator/Build/Products/Debug-iphonesimulator/App.app
