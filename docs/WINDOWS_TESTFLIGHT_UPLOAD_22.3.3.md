# Force Multiplier 22.3.3 — Windows to TestFlight

## What changed

The previous `UPLOAD.cmd` launched PowerShell, asked for a repository URL, and only triggered unsigned validation. This revision removes that path.

`UPLOAD.cmd` now:
1. stays open on errors;
2. checks for Node.js 22+ and Git for Windows;
3. uses the established repository `https://github.com/thordog73/ForceMultiplier.git`;
4. runs the locked dependency install, tests, release checks, and iOS preparation;
5. pushes a unique `testflight/force-multiplier-22.3.3-*` branch;
6. relies on the existing Codemagic webhook to start `ios-release`;
7. uses bundle ID `com.fredesser.forcemultiplier`, Apple app ID `6833361372`, and Codemagic Apple integration `ten-minute-wins-apple`;
8. selects the next unused TestFlight build number;
9. signs the IPA and uploads it to App Store Connect.

The Codemagic publishing block uses `auth: integration`. `submit_to_testflight: false` means the IPA is uploaded to App Store Connect/TestFlight but is not automatically submitted to external beta review. `submit_to_app_store: false` prevents automatic public App Store review submission.

## Run it

Extract the ZIP completely, then double-click `UPLOAD.cmd`.

If it stops, the window remains open and shows the exact missing prerequisite or failed command. Send that visible message back for diagnosis.

## External prerequisites

The GitHub repository must remain connected to Codemagic with a webhook. Codemagic must have the existing App Store Connect integration and matching Apple Distribution signing materials/profile for `com.fredesser.forcemultiplier`. The app record must remain Apple ID `6833361372`.
