#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]] || ! command -v xcodebuild >/dev/null 2>&1; then
  echo "A Mac with Xcode is required to compile the iOS app. Linux checks validate source/configuration only." >&2
  exit 1
fi
xcodebuild -version
sdk_version="$(xcrun --sdk iphoneos --show-sdk-version)"
sdk_major="${sdk_version%%.*}"
if [[ "$sdk_major" -lt 26 ]]; then
  echo "Use Xcode with the iOS 26 SDK or newer; found $sdk_version." >&2
  exit 1
fi
echo "Apple build tools ready; iOS SDK $sdk_version."
