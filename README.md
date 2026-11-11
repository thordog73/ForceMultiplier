# Force Multiplier · iOS source candidate 22.4.0

This candidate keeps the existing Worlds practice and replaces the default iOS guided screen with a visual-first simulation experience. The learner works a smaller set of major products repeatedly with meaningful variation: checkerboards and capacity plans, analysis dashboards, requirement/evidence packets, two-system reconciliations, and troubleshooting cases. The 100-skill map remains underneath the simulations as a coverage and scoring framework rather than appearing as 100 separate lessons. Scheduling begins with a 6-turn-4, expands to 12-turn-10, and then progressively adds constraints, weekly checkerboards, modifications, parts, cure time, inspection flow, recovery, disruptions, decision meetings, and execution review.

## What is ready

- All web assets bundled locally in a Capacitor 8.6 iOS project. No network is required to play after installation.
- Native share-sheet backup/export, complete game + workspace backup/restore, and scoped local-data deletion.
- Visible privacy, fictional-training/no-endorsement/non-certification notices.
- Original F× app icon, launch assets, iOS privacy manifest, no analytics/advertising SDK added.
- Codemagic unsigned simulator-validation workflow and signed IPA/TestFlight workflow.
- One-button Windows uploader already configured for `https://github.com/thordog73/ForceMultiplier.git`. It tests locally, prepares iOS, pushes a new release branch, and triggers the signed Codemagic/TestFlight workflow without force-pushing or changing the default branch.

## The command

Extract the ZIP fully, open the extracted `ForceMultiplier-iOS` folder, and **double-click `UPLOAD.cmd`**.

That is the only command required. The uploader is already configured for:

`https://github.com/thordog73/ForceMultiplier.git`

It runs local dependency installation/tests/release checks/iOS preparation, pushes a unique `release/force-multiplier-...` branch, then starts the signed `ios-release` workflow directly through the Codemagic API. This does not depend on a GitHub webhook. When the configured Apple signing assets and the **ten-minute-wins-apple** App Store Connect integration are valid, Codemagic uploads the signed IPA to App Store Connect; after Apple processing it appears in TestFlight. Public App Review submission stays disabled.

## One-time setup

1. Install Node.js 22+ and Git for Windows from their official sites. Configure Git name/email and authenticate using Git's credential manager. No secrets belong in this ZIP or chat.
2. Create an empty private repository at GitHub, GitLab or Bitbucket. Do not initialize it with a README. Alternatively use a repository already containing this package's marker. The uploader refuses an unrelated nonempty repository.
3. Connect that repository in Codemagic and choose the YAML configuration workflow. The Windows uploader starts `ios-release` directly through Codemagic's API, so a repository webhook is not required. On the first run only, paste your Codemagic API token when prompted; it is encrypted for your Windows user. Builds can consume paid minutes; check your account limits before running.
4. Run the command. Check Codemagic's actual result. A successful local push is not proof of a successful cloud build.
5. For the `ios-release` workflow, provide your Apple Developer membership, App Store Connect app record, and Codemagic integration named **Force Multiplier App Store Connect**. Authorize signing/certificates/profiles in your own account. Provisional bundle ID is `com.fredesser.forcemultiplier`; confirm it belongs to you and is available before signing. Changing it requires updating both native project configurations, capacitor.config.json, and codemagic.yaml.
6. Set build numbering above any previously uploaded build. The supplied workflow uses Codemagic's build number, which must be reconciled with an existing App Store record.
7. The uploader starts `ios-release` automatically. That workflow creates the IPA and uploads it to TestFlight when signing and App Store Connect integration are valid. It does **not** submit the app for public App Store Review.

PowerShell policy is respected; this launcher does not bypass execution policy. On a managed machine where scripts are blocked, ask your administrator or use the documented npm/Git steps manually. A failed upload clone is preserved for inspection; no force pushes are used.

## Release gates that remain

- Xcode compilation, physical iPhone/iPad testing, VoiceOver, landscape/safe-area screenshots, native share/restore, offline cold launch, storage pressure and reinstall behavior have not been verified in this Linux environment.
- No signed IPA, TestFlight build, App Store submission or Apple approval has been produced here.
- Confirm personal/official-duty ownership and public-release authority. Resolve naming/marks, including the Secret Squirrel world. See `docs/LEGAL_AND_STORE_READINESS.md`.
- Supply the seller's verified support contact/URL and public privacy-policy URL. The in-app candidate notice explicitly identifies these missing release items; replace that release-status paragraph with real publisher/support details before submission.
- Verify App Store privacy answers and required-reason API declarations against the **resolved signed build**. Native Swift packages are resolved on macOS; retain their license notices and resolved versions. The included file-timestamp declaration follows Filesystem's guidance. Encryption declaration assumes only platform/standard transport encryption; revisit if encryption features change.
- Review age rating, screenshots, metadata, export compliance and Apple minimum-functionality rules. Interactivity is substantial but approval is Apple's decision.

## Local checks and source editing

`npm ci`

`npm test`

`npm run check`

`npm run ios:prepare`

Edit the actual app under `dist/`, and native export/backup logic under `native-src/native.js`. `ios:prepare` bundles that bridge and copies current assets into the native project. Do not edit the generated `ios/App/App/public` copy. Keep source and lockfile together. Open `ios/App/App.xcodeproj` on a Mac for device work. Minimum iOS is 15; Capacitor 8 requires a compatible current Xcode/macOS toolchain (Codemagic uses latest).

## Progress and portability

Browser and native app storage are separate. In a version containing this new About page, use **About, privacy & backups → Export all saved progress**, transfer the JSON, then restore it in the other installation. Existing live website users cannot export game tracks with the old workspace-only backup. No automatic migration from the unchanged live site is claimed. Uninstalling can erase local progress. Export files can contain reviewer names or notes you entered; share deliberately.

`SOURCE_README.md` preserves the original app's detailed behavior and limitations. `reviews/` contains the prior explicitly simulated panel, not human trial evidence. `docs/TEST_REPORT.md` records what was actually tested in this packaging pass.
