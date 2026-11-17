# Force Multiplier 22.3.8 Codemagic esbuild launcher fix

The 22.3.7 Codemagic release failed during `npm run ios:prepare` because `prepare-ios.cjs` launched `node_modules/esbuild/bin/esbuild` through `node`. On macOS/Linux, that path is a native executable rather than JavaScript, so Node attempted to parse machine code.

22.3.8 calls esbuild through its supported JavaScript API (`require('esbuild').buildSync(...)`) and then runs the Capacitor CLI to synchronize the generated web bundle into the iOS project.

The package also aligns the npm package version, package lock, Xcode marketing version, uploader labels, and release checker at 22.3.8.

Release flow remains:

1. `npm ci`
2. `npm test && npm run check`
3. `npm run ios:prepare && npm run ios:verify`
4. apply signing profiles
5. assign the next TestFlight build number
6. create the signed IPA
7. submit to TestFlight

Public App Store review submission remains disabled.
