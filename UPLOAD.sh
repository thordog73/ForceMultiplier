#!/usr/bin/env sh
set -eu
app_source_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$app_source_directory/tools/upload-source.mjs" "$@"
