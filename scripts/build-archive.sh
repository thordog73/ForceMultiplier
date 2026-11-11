#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"
bash scripts/check-apple-tools.sh
if ! command -v xcode-project >/dev/null 2>&1; then
  echo "This script uses Codemagic CLI tools. On another Mac, open the workspace in Xcode and choose Product > Archive, or install the documented CLI tools." >&2
  exit 1
fi
# Codemagic's prior use-profiles step supplies real distribution credentials.
# This produces an IPA artifact. It does not upload or submit an app for review.
cd ios/App
xcode-project build-ipa --workspace App.xcworkspace --scheme App
