# Force Multiplier · iOS TestFlight candidate 22.3.3

This package is the current Force Multiplier iOS source candidate for the existing app:

- GitHub repository: `https://github.com/thordog73/ForceMultiplier.git`
- Bundle ID: `com.fredesser.forcemultiplier`
- App Store Connect Apple ID: `6833361372`
- Codemagic Apple integration: `ten-minute-wins-apple`
- Guided designations: 4-hour Graduate, 12-hour Advanced Graduate, 24-hour Expert
- App Store public-review submission: **not automatic**

## Windows: use this file

Fully extract the ZIP, then **double-click `UPLOAD.cmd`**.

Do not run it from inside the ZIP preview.

`UPLOAD.cmd` stays open if something fails. It checks Node.js and Git, runs all local tests, prepares the iOS assets, pushes a unique TestFlight branch to the established Force Multiplier repository, and leaves the window open with the result.

The upload path no longer asks for a repository URL and no longer launches the previous PowerShell uploader.

## What happens after the GitHub push

The pushed branch is named:

`testflight/force-multiplier-22.3.3-...`

The `ios-release` workflow in `codemagic.yaml` watches those branches. It:

1. installs locked dependencies;
2. reruns all tests and release checks;
3. prepares the native iOS assets;
4. applies the authorized App Store signing profile;
5. reads the latest TestFlight build number for Apple app `6833361372` and chooses the next number;
6. builds a signed App Store IPA;
7. uploads the IPA to App Store Connect using the existing `ten-minute-wins-apple` integration.

After Apple processes the binary, it should appear under **App Store Connect → ForceMultiplierSimulator → TestFlight**.

`submit_to_testflight: false` means Codemagic does not automatically send the build to external beta review/tester groups. The IPA is still uploaded to App Store Connect. `submit_to_app_store: false` prevents automatic public App Store review submission.

## Windows prerequisites

The computer needs:

- Node.js 22 or newer;
- Git for Windows;
- Git configured with a name and email;
- GitHub authentication that can push to `thordog73/ForceMultiplier`.

The script checks these before modifying anything. If a check fails, the Command Prompt window remains open and tells you exactly what stopped.

## Codemagic prerequisites

The existing Force Multiplier repository must remain connected to Codemagic with its webhook enabled. Codemagic must have:

- the `ten-minute-wins-apple` App Store Connect integration;
- a valid Apple Distribution certificate;
- the matching App Store provisioning profile for `com.fredesser.forcemultiplier`.

## Local developer checks

From a Command Prompt opened in this extracted folder:

`npm ci`

`npm test`

`npm run check`

`npm run ios:prepare`

This Linux packaging environment reran the JavaScript/regression/release checks. A fresh npm dependency download timed out here before `esbuild` completed, so the final native synchronization/Xcode build remains part of the Windows/Codemagic path.

See `docs/WINDOWS_TESTFLIGHT_UPLOAD_22.3.3.md` for the concise upload flow and `docs/STRESS_TEST_22.3.1.md` for the prior stress-test findings.
