# Force Multiplier 22.3.6 — Codemagic build-order fix

This candidate fixes the Codemagic failure where `npm test` expected the generated Capacitor path `ios/App/App/public/index.html` before `npm run ios:prepare` had created it.

Build order is now:
1. `npm ci`
2. `npm test && npm run check` against source assets
3. `npm run ios:prepare && npm run ios:verify` to generate/sync and then verify the native iOS public bundle
4. apply signing profiles
5. assign the next TestFlight build number
6. build the signed IPA
7. upload/submit to TestFlight through the configured App Store Connect integration

Public App Store review submission remains disabled.

The Windows uploader also reports when it is reusing the encrypted Codemagic API token saved from an earlier run.
