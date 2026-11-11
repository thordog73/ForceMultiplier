# Force Multiplier — iPhone and iPad

Version **22.0.0** packages the complete Force Multiplier game as an offline iOS app. It keeps the short, hands-on challenges, five specialties, four worlds, and separate practice workspace.

## Start here

This folder is the **app source and build package**. The uploadable Apple file is the signed `.ipa` produced by the `ios-app-store` Codemagic workflow. A Mac is not required on your desk when Codemagic performs the build.

The game and configuration checks were run while preparing this package. No Xcode compilation, signed archive, TestFlight upload, App Store submission, or Apple approval is represented by this source folder. See `VALIDATION.md` for the precise checks completed.

### Route from Windows to the App Store

1. Extract the ZIP into a normal folder. Install current Node.js 22 or later and Git if they are not already installed. Use your normal GitHub sign-in through Git; do not put a password or token in a command or repository URL.
2. Create a new empty repository in your GitHub account. Keep this source private if you prefer. Copy that repository's ordinary HTTPS URL.
3. Open a terminal in the extracted folder and run:

   ```bat
   UPLOAD.cmd https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
   ```

   The helper initializes `main`, commits the source, and pushes it to the repository you specify. It never force-pushes or replaces a different existing remote. macOS/Linux users can run `sh UPLOAD.sh` with the same URL. You can also use GitHub Desktop or your usual Git workflow.

4. Add that repository to Codemagic and choose its `codemagic.yaml` configuration. Start **Force Multiplier - iPhone and iPad simulator check** (`ios-simulator`). It installs the locked dependencies, checks the game, builds the app, launches fresh simulators, and captures genuine iPhone/iPad images. Inspect the build artifacts and simulator results before proceeding.
5. In your Apple Developer account and App Store Connect, select or create the Force Multiplier app. The current bundle identifier is **`com.fredesser.forcemultiplier`**. Its availability and ownership have not been checked in your Apple account. The App Store app record, signing profile, YAML signing selector, and app configuration must all use the same identifier.
6. In Codemagic, connect the authorized distribution signing profile and set **`APP_STORE_APPLE_ID`** to this app's **numeric Apple ID**. The YAML refers to the existing integration name **`ten-minute-wins-apple`**; verify that it is the correct integration for your Apple team or replace that name. It contains no signing secrets.
7. Start **Force Multiplier - signed App Store IPA** (`ios-app-store`). Download the `.ipa` from the successful build's artifacts. Upload it to App Store Connect using your normal authorized workflow or the optional upload-only Codemagic block in `NATIVE-BUILD.md` (works from Windows), test the processed build in TestFlight, and use the material in `store/` to prepare the store listing.

The build workflows do not upload automatically, submit a review, or release the app. They make the build and its results available for you to inspect. The detailed commands and native test checklist are in `NATIVE-BUILD.md`.

## What is included

| Area | Included experience |
| --- | --- |
| Scheduling | 13 progressive levels, from six aircraft followed by four to inspections, modifications, curing, and a checkerboard |
| Analysis | 12 levels covering eligible sets, rates, comparisons, averages, missing values, trends, spread, and interpretation |
| Documentation | 10 levels about matching requirements, applicability, revision control, due dates, dependencies, and evidence |
| Database Management | 10 levels about appropriate access, identity, account changes, troubleshooting, controlled changes, and recovery |
| Data Integrity | 10 levels about source reconciliation, missing values, units, duplicates, links, time windows, and audit trails |
| Worlds | Airline, Bus Company, Cat Hugs, and Acorn Ops; switch freely and retain separate progress |
| Practice workspace | Longer exercises, statistics tools, work products, review notes, and separate backup/export/import |
| iOS integration | Bundled offline content, durable local progress backup, optional haptics, native file sharing/import, copy, and print |

The squirrel world's internal identifier remains `squirrel` so existing progress can be carried over. Its displayed name is **Acorn Ops**.

The app uses fictional practice data and general concepts. It does not contain an uploaded military handbook, connect to operational systems, issue a job qualification, or claim a measured learning improvement. No account, advertising service, analytics SDK, or remote AI service is required to play.

## Build locally

Node.js **22+** is required. Native compilation requires macOS with **Xcode 26+**, the iOS 26 SDK or later, and CocoaPods. The deployment target is **iOS/iPadOS 15.4+**; that is separate from the build SDK.

```sh
npm ci
npm run build
npm test
npm run ios:sync
npm run verify
npm run ios:open
```

`ios:sync` rebuilds the bundled JavaScript bridge, copies `www/` into the native project, applies deterministic Xcode settings, and installs native dependencies on macOS. Generated web copies, CocoaPods dependencies, and build products are intentionally excluded from version control. The complete editable web source and lockfile are included.

For a browser-only preview, serve `www/` with a local static server. Use a server rather than opening `index.html` as a file. Native iOS behavior must be checked in the built app; a browser preview cannot validate Apple's share sheet, signing, haptics, or app lifecycle.

## Files you will use

| Path | Purpose |
| --- | --- |
| `codemagic.yaml` | Simulator and signed IPA workflows |
| `capacitor.config.json` | Display name, bundle identifier, and local web directory |
| `ios/` | Xcode project and native app shell |
| `native/` | Swift bridge, progress backup logic, launch screen, and privacy manifest sources |
| `www/` | Complete playable game and bundled Help, Privacy, and About pages |
| `scripts/` | Build, configuration, versioning, simulator, and verification automation |
| `tests/` | Curriculum, persistence, backup validation, and native configuration checks |
| `store/` | Store copy, metadata, privacy/age-rating worksheet, review notes, and screenshot plan |
| `SOURCE-PROVENANCE.json` | Starting website revision and accurate preparation/submission status |
| `UPLOAD.cmd`, `UPLOAD.sh` | Source-upload helpers for your own GitHub repository |

## Progress and privacy

The main game saves the current case, selected world/specialty, stars, and settings. The practice workspace stores its own work products and optional notes. On iOS, Preferences provides a local durable backup in addition to the web storage used by the game. Apple's device backup behavior depends on the user's settings.

Use **Menu → Saved data** for game backups and **Settings** inside the practice workspace for its separate backups. The reset action explains that it clears both areas. A backup file can contain user-entered work; the user chooses whether and where to share it. There is no automatic cloud sync.

## Release material

Use `store/submission-guide.md` as the release worksheet and `store/app-store-metadata.json` as the source for listing fields. The proposed listing name is **Force Multiplier: Skills**; the device icon label is **Force Multiplier**. Name availability, price, countries, private review contact, and account declarations are selected in App Store Connect.

Actual screenshots must come from the compiled native app. The simulator workflow produces real captures once it runs successfully. Browser layout checks supplied during preparation are not App Store screenshots.

Public Help, Privacy, and About pages are also bundled locally so they open without a connection. Keep the public pages and the shipped app consistent when making future changes.

Public pages verified for this release: [Help](https://force-multiplier-v22.fredesser.chatgpt.site/support), [Privacy](https://force-multiplier-v22.fredesser.chatgpt.site/privacy), and [About](https://force-multiplier-v22.fredesser.chatgpt.site/about).
