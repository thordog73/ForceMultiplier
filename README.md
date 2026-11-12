# Force Multiplier · iOS source candidate 22.7.0

## 22.7.0 Scheduling, Analysis & Documentation workflow upgrade

- Scheduling now teaches the planning chain explicitly: **FHP → 90-day long-range plan → monthly schedule → weekly schedule → Phase flow**, before returning to parts, recovery, capacity, disruption, approval and execution review.
- Aircraft readiness words are larger and visually differentiated: READY, LIMITED CONFIGURATION, UNAVAILABLE, PRIORITY USE, and UNDERUSED / SCHEDULE IF FEASIBLE.
- A selected spare can be removed by tapping it again. Incorrect checks do not lock the learner's selections; the learner can revise and recheck.
- Weekly scheduling explains where maintenance work came from. Modification examples show a front-half RED modification and rear-half GREEN modification, each with **two workdays + one 24-hour cure**; a supplied compatible-work case combines both work packages before one authorized shared final cure.
- Analysis now exposes all 20 rates as direct-entry cards. Each answer box has an on-demand Calculator button, and explanatory text/buttons are larger on phones.
- A directly visible **Statistical Analysis Lab** starts with Trend / Correlation / Difference, then Nominal / Ordinal / Interval / Ratio, and routes the learner to a suitable existing Fishbone test builder path.
- Documentation opens with a tangible aircraft modification rollout (A/C 001 → 021 → 014 → 033) using visible red/green aircraft changes. A later fictional “Lamborghini Diablo” exception reinforces that an incomplete modification remains open and requires an authorized documented exception/approval path before release if accepted.
- Existing 22.6.1 single-flight animation timer hardening is retained. This build was additionally browser-stress-tested for repeated execute/re-simulate/navigation cycles and wrong-answer correction paths.

## 22.6.5 Show Me + Unlimited Practice

- Every focused exercise now exposes **Show Me the Right Answer** and **Re-simulate Question**.
- Show Me fills the current generated case and explains the model answer; assisted completion unlocks continuation but does not add independent skill coverage.
- Re-simulate keeps the same skill while generating fresh numbers, conditions, answer order, or organization context for unlimited practice.
- The same wording is used in the optional Worlds / earlier practice surfaces.
- Advanced Scheduling model answers were hardened so flow and bottleneck examples preserve all required work while resolving capacity conflicts.
- 22.6.4 commander questions, inline Analysis calculator, Actual Data Fishbone, and all 13 statistical tests remain included.

- Gold Rat multiple-choice answers are deterministically shuffled; answer length is not a correctness cue.
- Fishbone Test Builder restores 13 statistical tests from the earlier Analysis Statistical Lab.
- Learners construct question family, measurement/data structure, H0, and test selection before seeing simulated output.
- Includes Kendall/Mann–Kendall, F variance, Cochran C, two-sample t, Z mean, Z proportions, ANOVA, Mann–Whitney, Kruskal–Wallis, two chi-square tests, Pearson, and Spearman.
- Gold Rat cases require a context-appropriate constructed test, while all 13 remain open for practice.

- All 20 Analysis metrics can be opened in any order.
- Each metric has an embedded calculator; raw facts can be tapped into it and results sent to either company.
- Supervisor Assist fills and explains a model solution without implying independent proficiency.
- Acquisition Decision and Gold Rat Lab are visible direct-entry paths from the Analysis map.
- 22.6.1 single-flight animation hardening remains in place.

This candidate keeps the existing Worlds practice and makes the default iOS experience a visual 20-level game in each of five functions. The learner completes one focused level, unlocks the next, and can replay completed levels with new variations up to 10 tracked successes. The original 100-skill map remains underneath as the curriculum and scoring framework. Scheduling begins with a 6-turn-4, then adds a spare, availability, utilization and demand before moving into a weekly checkerboard that progressively adds timing, opportunities, shared downtime, modifications, inspections, parts, prerequisites, recovery, capacity, disruptions, decision meetings, change control and execution review. Successful Scheduling levels include an outcome animation so the learner sees the lineup launch or the simulated week execute. Successful Analysis levels now build a 20-metric acquisition dashboard from raw company data; after the acquisition decision, the learner takes over the weaker organization and works a Gold Rat laboratory through Trend, Difference, Correlation, Fishbone, constraint identification, intervention and verification.

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


## Focused Scenario Mode

When a learner enters a simulation, the app hides global navigation and shows only the active work product, its scenario controls, feedback, and a small Exit Scenario control.
