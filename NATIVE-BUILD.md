# Force Multiplier — native iPhone and iPad build

This source package builds the version 22 game as an offline Capacitor iOS app. It includes the actual Xcode project, custom Swift bridge, app icon, launch screen, shared scheme, privacy manifest, lockfile, and two Codemagic workflows. **A signed IPA has not been produced or tested on a Mac in this preparation session.** The Linux checks below validate the game, persistence logic and configuration; they do not establish native runtime or App Store acceptance.

## Project identity

| Setting | Prepared value |
|---|---|
| Display name | Force Multiplier |
| Marketing version | 22.0.0 |
| Bundle identifier | `com.fredesser.forcemultiplier` — provisional; confirm against the actual Apple App ID |
| Devices | iPhone and iPad |
| Deployment target | iOS / iPadOS 15.4 or later |
| Build SDK | iOS 26 SDK or later; CI checks this explicitly |
| Workspace / scheme | `ios/App/App.xcworkspace` / `App` |
| Web entry | Bundled `www/index.html` |
| Runtime | Capacitor core / iOS 8.6.0 |
| Plugins | Preferences 8.0.1; Haptics 8.0.2; local `FMFilesPlugin` |
| CocoaPods | 1.16.2 in Codemagic |

The 15.4 minimum is deliberate: the game uses the browser's native dialog element. WebKit added that functionality in Safari 15.4. Capacitor's own lower minimum does not establish that every game feature works on older minor releases.

## What is bundled and what is generated

`www/` contains all game code, scenarios, styles, icons, public information pages and `native-bridge.js`. There is no remote live-code URL, runtime content server, account, analytics SDK or advertising SDK. Normal play does not need a network connection. Web service-worker registration is skipped inside the native app; the installed app's own resources provide the offline content.

`native/bridge.mjs` and `native/progress-store.mjs` are the editable bridge sources. `npm run build` bundles them with the locked Capacitor JavaScript dependencies and embeds the full applicable MIT notices in `www/native-bridge.js`. The same notices are retained in `native/THIRD-PARTY-NOTICES.txt`. The original code-drawn F× mark is rendered as an opaque 1024-pixel RGB icon; iOS supplies its own corner mask.

The committed `ios/` project is real source, not a placeholder. `npm run ios:sync` copies `www/` into the app's generated `public/` directory, updates Capacitor plugin registration, installs CocoaPods on a Mac and applies our custom source/resources. The generated `public/`, generated Capacitor configuration, installed `node_modules/` and `Pods/` are excluded from source upload. They are recreated from the source and `package-lock.json`. Every pod uses local code from the exact npm package versions; there are no separately floating third-party native pod dependencies. CI retains the resulting `Podfile.lock` artifact. Commit that generated lockfile after the first successful Mac build.

## Verify the source on Windows, Linux or Mac

Use Node 22 or newer. From the project folder:

```sh
npm ci
npm run build
npm test
npm run verify
```

`npm test` runs every `tests/*.cjs` game suite and the native storage/build-number tests. `npm run verify` parses the Xcode project and plists; checks source/resource/scheme wiring, version, privacy declaration and opaque icon; and checks that HTML assets are local and available. It rejects temporary `__qa_` pages. It does not invoke a compiler.

After changing web files or native bridge source, run:

```sh
npm run ios:sync
```

On Linux the Capacitor command can copy/configure source, but reports skipped CocoaPods/Xcode operations. That is not an iOS build. On a Mac it requires CocoaPods and Xcode. The `ios:simulator` and `ios:archive` scripts explicitly stop on a non-Mac host.

## Codemagic without a local Mac

Upload this complete source folder to a repository you control and add that repository in Codemagic. Keep credentials in Codemagic's integration and encrypted environment-variable settings. Do not place `.p8`, `.p12`, provisioning profiles, passwords or exported signing options in the repository. The source uploader provided in `tools/` handles a normal source commit; it does not provide Apple credentials.

### 1. `ios-simulator`

**Force Multiplier - iPhone and iPad simulator check** uses `mac_mini_m2`, Xcode `latest`, Node 22 and CocoaPods 1.16.2. It checks the installed SDK, installs locked dependencies, synchronizes the app, runs tests and source validation, and builds an unsigned simulator app.

`scripts/simulator-smoke.py` then creates two fresh disposable simulators using available iPhone/iPad models and an installed iOS runtime. It boots, installs and launches the compiled app, checks that the process remains present, and captures real screenshots with `xcrun simctl io screenshot`. It removes only the simulators it created. Existing simulator data is not reset.

Artifacts appear under `artifacts/simulator/`: the build log, `iphone-initial-game.png`, `ipad-initial-game.png`, and `smoke-results.json` recording the actual device/runtime/build. Those files do not exist until the Mac job succeeds. Inspect the screenshots to confirm the opening six-aircraft game and safe-area layout. The smoke script checks launch and liveness; it does not automatically judge visual correctness or prove every native system sheet works. Screenshot sizes depend on the actual installed models; choose App Store screenshot slots that match those real dimensions.

### 2. `ios-app-store`

**Force Multiplier - signed App Store IPA** produces a distribution-signed `.ipa` artifact. It currently names the existing user convention `ten-minute-wins-apple`; its access to this particular app has not been verified. Before running this workflow, select the actual Apple developer team, register/confirm the bundle identifier, create/select the Force Multiplier record in App Store Connect and connect the authorized distribution signing credentials in Codemagic.

Set **`APP_STORE_APPLE_ID`** to the actual numeric App Store Connect ID. This is different from the bundle identifier and is not invented in this package. Ensure the `ios_signing.bundle_identifier` in `codemagic.yaml` matches the real record. The workflow obtains the current maximum build values from App Store Connect/TestFlight, applies the provisioned profiles, and runs the archive script.

| Variable | Requirement / purpose |
|---|---|
| `APP_STORE_APPLE_ID` | Required in the signed workflow; actual numeric Apple app ID. |
| `APPLE_TEAM_ID` | Optional; ten-character team ID if not supplied by profile selection. |
| `APP_BUNDLE_ID` | Optional override. Update the YAML signing selector and Apple record consistently. |
| `APP_VERSION` | Defaults to `22.0.0`. Change package version and store metadata together for a later release. |
| `IOS_BUILD_NUMBER` | Optional explicit new build value. Checked against any retrieved Apple build values. |
| `CM_BUILD_NUMBER`, `CM_ENV` | Supplied by Codemagic, used for versioning and propagation between steps. |

Builds use a UTC-derived three-component number (`days since 2020 + 1`.`UTC hour`.`UTC minute`), raised above the maximum returned by Apple when necessary. Codemagic's increasing run count is also considered. Authentication or lookup failures stop the signed workflow instead of being mistaken for an app with no builds. Run one signed upload workflow at a time: two concurrent jobs cannot reserve the same next Apple build number. A new release must always use a new build number, including when rebuilding the same version.

Find the IPA under `ios/App/build/ios/ipa/` in Codemagic artifacts. The workflows have **no publishing block**: they do not upload the IPA, distribute TestFlight builds, send notifications or submit an App Store review. Upload the resulting IPA using Transporter or an authorized App Store Connect publishing step once the actual app and signing are confirmed. App Store review submission remains a separate action after the binary, metadata and screenshots are reviewed.

### Optional upload from Windows using Codemagic

You do not need a personal Mac to upload the binary. After a successful simulator check and signed build, confirm the real bundle ID, `APP_STORE_APPLE_ID`, team and integration. To enable binary upload on the next manually started signed job, append this block **inside `ios-app-store`**, at the same indentation as its existing `artifacts` key:

```yaml
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: false
        submit_to_app_store: false
```

Commit/upload that edited `codemagic.yaml` using your normal source workflow, then manually start **`ios-app-store`** for that commit in Codemagic. It builds a fresh numbered IPA and uploads it from Codemagic's Mac to App Store Connect. These flags do not request beta review or App Store review. Existing internal-testing settings in your Apple account can still apply to an uploaded build. Wait for Apple's processing, then use App Store Connect in your Windows browser to complete the app record and select the build. You still choose when to submit the completed app for review.

The integration needs authorized App Manager access and a valid distribution signature, as described in Codemagic's [App Store Connect publishing documentation](https://docs.codemagic.io/yaml-publishing/app-store-connect/). Keep this block absent when you want artifact-only builds. This optional snippet is documented here; it is **not enabled** in the supplied workflow and no upload has been performed.

## Building on your own Mac

Install Xcode with an iOS 26 or newer SDK, its command-line tools, an iOS simulator runtime, Node 22+ and CocoaPods 1.16.2. Then:

```sh
npm ci
npm run ios:sync
npm test
npm run verify
npm run ios:simulator
npm run ios:open
```

In Xcode select the App target and your actual development team. Use Product → Archive for a distribution archive and Organizer to validate/export/upload with your authorized account. `npm run ios:archive` is the Codemagic CLI route; it requires `xcode-project` and already configured distribution profiles. It does not automatically create or revoke certificates.

## Native API contract

Load `native-bridge.js` with `defer` before the game scripts. It defines `window.FMNative` synchronously. Native startup waits for `FMNative.ready` before reading game state; ordinary browser startup remains synchronous.

| API | Behavior |
|---|---|
| `isNative` | True in the Capacitor app; false in an ordinary browser. |
| `ready` | Promise resolving to `{ available, native }` after progress hydration. `pending: true` signals preserved changes whose native retry still failed. |
| `storageAvailable` | Read-only hydration health flag. A failed read blocks subsequent native writes. |
| `saveProgress(key, jsonString)` | Serializes a valid progress JSON object into Preferences. The UI also updates its localStorage cache. |
| `removeProgress(key)` | Removes only an approved progress key, ordered with pending writes. The UI removes its corresponding cache. |
| `flush()` | Waits for queued native writes, rejecting if a read or write failure remains unresolved. Errors also trigger the storage-warning event. |
| `haptic(kind)` | Optional selection/success/error feedback; devices without support continue normally. |
| `shareFile({ name, mimeType, data })` | Native share sheet with a temporary UTF-8 text/JSON file; browser download fallback. |
| `importFile()` | User-selected JSON from Files; returns `{ name, data }` or null on cancel. UI validates schema and confirms replacement. |
| `copyText(text)` | iOS clipboard using `localOnly`; browser clipboard fallback. |
| `printHTML(html, title)` | System printing for a standalone escaped HTML document; browser print fallback. |

Approved progress keys are `force-multiplier-worlds-22`, `force-multiplier-flightline-22`, and `force-multiplier-universal-v22`. Native entries are prefixed `fm.progress.`. Local `fm.progress.pending.` snapshots record intentional writes until the native mirror acknowledges the matching data. After a failed write, launch preserves and retries that newer local snapshot; an older native mirror cannot silently replace it. A continued failure keeps both copies, displays the retry/export banner and blocks navigation that would discard the session.

All native reads and JSON validation finish before hydration applies a backup. A read failure never turns default state into a replacement for an unread backup. An explicitly confirmed reset can still delete corrupt or unreadable app progress, including its pending markers; it cannot delete unrelated preferences. Ordinary write failures surface in the persistent UI banner and can be retried. Export useful current work before relaunching after a read failure. Exports/imports are limited to 8 MB; Preferences is intended for lightweight progress, not arbitrarily large external databases.

The custom Swift plugin is explicitly registered in `ForceMultiplierViewController.capacitorDidLoad()`. Both the main storyboard and `SceneDelegate` use that controller. This second assignment matters in the Capacitor 8.6 template, where a scene can create the controller directly.

## Privacy and required-reason API audit

The runtime packages and local Swift source were inspected for required-reason API calls. Preferences uses `UserDefaults` to store the learner's own local progress; `PrivacyInfo.xcprivacy` declares `NSPrivacyAccessedAPICategoryUserDefaults` with reason `CA92.1`. No file-timestamp, disk-space, system-uptime or active-keyboard API use was found in these app/runtime sources. File-size checks for user-selected imports and bundled media are not file timestamp reads. Capacitor core and its internal Cordova compatibility target contain their own empty-access/no-tracking manifests; no Cordova third-party plugins are installed.

The app declares no tracking domains and no collected data types. There are no network calls in the local Swift plugin. Share/export, Files import and printing invoke system UI at the user's request; the chosen provider/printer may handle that data. Clipboard writes use the local-only option. Device-managed backup may include app preferences. These source findings support the privacy draft in `store/`; verify the actual release archive and behavior before final App Store declarations. No broad camera, photo-library, microphone, contact or location permissions are requested.

## First native run: meaningful checks still required

Run the unsigned job and inspect the real iPhone/iPad screenshots. Then install a signed test build and check launch in airplane mode; play and switch among worlds/disciplines; force-quit/relaunch to verify progress; export a JSON backup; cancel and complete Files import; validate malformed-backup handling; cancel/complete the share sheet; check printing on iPad; and confirm the reset dialog deletes only the app's own saved data. Test larger text, VoiceOver, rotation and background/foreground transitions on actual supported devices. App Store acceptance and training effectiveness are not established by a passing source test.

## Official references used for this implementation

- Capacitor environment and CocoaPods alternative: https://capacitorjs.com/docs/getting-started/environment-setup
- Custom iOS plugin registration: https://capacitorjs.com/docs/ios/custom-code
- Preferences, UserDefaults and the required reason: https://capacitorjs.com/docs/apis/preferences
- WebKit dialog support in Safari 15.4: https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/
- Codemagic Capacitor builds: https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/
- Codemagic signed native workflow: https://docs.codemagic.io/yaml-quick-start/first-signed-build/
- Codemagic build versioning: https://docs.codemagic.io/knowledge-codemagic/build-versioning/
- CLI maximum TestFlight build across versions: https://github.com/codemagic-ci-cd/cli-tools/blob/master/docs/app-store-connect/get-latest-testflight-build-number.md
- Apple bundle build-number format: https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleversion
- Apple printing completion API: https://developer.apple.com/documentation/uikit/uiprintinteractioncontroller/completionhandler

Dependencies were retrieved and source checks were run on November 11, 2026. See the root provenance record for the source lineage and final verification status.
