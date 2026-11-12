# Force Multiplier · iOS source candidate 22.8.1

## 22.8.1 Scheduling · authentic opening reps + progressive Phase Flow reveal

The 100-repetition Scheduling campaign no longer starts with deliberately mechanical cell-copying. Reps 1–10 begin with the established 6-turn-4 scheduling pattern: prioritize required aircraft, accept unavailable/limited aircraft, work an underused aircraft when feasible, assign turns, and protect a separate spare. Phase consequences are progressively exposed behind those same decisions: first the learner makes the scheduling call, then individual hours remaining appear, then a mini hours-remaining flow appears, and later the full tracker is revealed.

The full Phase Flow view follows the later 400-hour workbench model: aircraft are sorted by hours remaining, shortest bars are closest to Phase, and planned utilization changes the projected inspection workload. The older 500-hour teaching prototype is not used for the current 22.8.1 Scheduling campaign.


## 22.8.0 Scheduling · 100-repetition battle rhythm

Scheduling no longer ends at a 20-level progression. It now presents 100 sequential repetitions in ten blocks of ten. The first block is deliberately mechanical checkerboard plotting. The next blocks accept the approved Flying Hour Program (FHP) and aircraft limitations as inputs, then progressively teach the learner to translate the annual FHP into an executable plan, build the 90-day/month/week/day products, forecast and control Phase flow, recover disrupted schedules, and complete integrated scheduling repetitions. The underlying 20 Scheduling skill definitions remain the proficiency map; the 100 repetitions provide the practice volume.

The FHP-source teaching note distinguishes upstream requirement/allocation from wing execution planning and references AFI 11-102 and AFMAN 11-101. Existing 22.7 Analysis, Documentation, RED/GREEN modification, calculator/statistical-lab, and lockup-hardening changes are retained.


## 22.7.1 Monthly modification → daily scheduling flow

- Scheduling keeps the planning chain **FHP → 90-day long-range plan → monthly schedule → weekly schedule → Phase flow**, then carries the RED/GREEN modification lesson into a new **whole-month modification schedule → daily flying/spare schedule** handoff.
- Aircraft readiness words are larger and visually differentiated: READY, LIMITED CONFIGURATION, UNAVAILABLE, PRIORITY USE, and UNDERUSED / SCHEDULE IF FEASIBLE.
- A selected spare can be removed by tapping it again. Incorrect checks do not lock the learner's selections; the learner can revise and recheck.
- Weekly scheduling explains where maintenance work came from. Modification examples show a front-half RED modification and rear-half GREEN modification, each with **two workdays + one 24-hour cure**; a supplied compatible-work case combines both work packages before one authorized shared final cure. The next exercise schedules eight RED/GREEN packages across four weeks, then zooms into Week 2 and builds the daily schedule around inherited modification downtime.
- Analysis now exposes all 20 rates as direct-entry cards. Each answer box has an on-demand Calculator button, and explanatory text/buttons are larger on phones.
- A directly visible **Statistical Analysis Lab** starts with Trend / Correlation / Difference, then Nominal / Ordinal / Interval / Ratio, and routes the learner to a suitable existing Fishbone test builder path.
- Documentation opens with a tangible aircraft modification rollout (A/C 001 → 021 → 014 → 033) using visible red/green aircraft changes. A later fictional “Lamborghini Diablo” exception reinforces that an incomplete modification remains open and requires an authorized documented exception/approval path before release if accepted.
- Existing 22.6.1 single-flight animation timer hardening is retained. The full Node regression suite, timer-cancellation tests, inline-script parse checks, generated-iOS asset verification, and release checks pass for 22.7.1. Browser automation was attempted for the new month-to-daily screens, but navigation is blocked by administrator policy in this execution environment; no 22.7.1 browser-render claim is made.

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
