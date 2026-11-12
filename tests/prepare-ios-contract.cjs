'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('scripts/prepare-ios.cjs','utf8');
assert(src.includes("require('esbuild')"),'prepare-ios must load esbuild through the JavaScript API');
assert(src.includes('esbuild.buildSync'),'prepare-ios must invoke esbuild through buildSync');
assert(!src.includes("node_modules/esbuild/bin/esbuild"),'prepare-ios must not ask Node to parse the native esbuild executable');
assert(src.includes("node_modules/@capacitor/cli/bin/capacitor"),'prepare-ios must still sync Capacitor iOS assets');
console.log('PASS prepare-ios contract: cross-platform esbuild JS API and Capacitor iOS sync.');
