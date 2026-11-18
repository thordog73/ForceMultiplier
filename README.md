# Force Multiplier 22.14.0 — Teaching Inside Every Exercise

This is the complete GitHub / Codemagic source for **Force Multiplier: Revenge of the Nonner**, based on 22.13.1. The five specialties, 35 fundamentals, 100 observable skills, original 72-task work map, Block Academy (630 practice repetitions + 90 sliding puzzles), advanced trainers, 90-day scheduling capstone, and nine-MAJCOM Reference Library remain included.

## New in 22.14.0

The five-step learning loop is now embedded in all 35 fundamentals:
1. **Show Me:** plain-English purpose, outcomes and interactive visual examples—wrong / right / constraint.
2. **Help Me:** the actual underlying task steps and performance habit.
3. **Let Me Try:** learner works the supplied scenario while comparing decision examples.
4. **Challenge Me:** three progressively different knowledge checks, including an unexpected status/source/authorization problem.
5. **Prove I Can Do It:** a changed-condition case linked to the working simulator; learner records the decision, evidence, unresolved risk and briefing for instructor review.

The task map's 72 documented MXMGR tasks also open these visual comparisons. An expandable **Teach this skill** panel is now available inside Block Academy, the sliding puzzles, flashcards, Scheduling, Analysis, Documentation, Data Integrity and Database Management. The panel teaches the corresponding fundamental without abandoning the exercise. Its Challenge / Prove mode temporarily blocks model-answer and hint buttons; help remains available by explicitly switching to Help Me.

### Example: Master the Checkerboard
The lesson displays a seven-day aircraft checkerboard and allows the learner to compare fragmented maintenance, a permitted combined PFR → PBG → CURE sequence, and a case in which work cannot be consolidated. Training assumptions are labeled as illustrative; actual completion, cure timing, maintenance authorization and return-to-service rules must come from current controlling technical data.

### Evidence and limitations
- Work records are saved in local app/browser storage. The new independent-work text is **not automatically graded** and no occupational qualification is conferred.
- The three new checks are scenario-based decision questions, not three validated independent task performances. Advanced simulator exercises still supply the deeper work products.
- Instructor, CFETP/STS, and real-world OJT verification are still required. FLUX workshop materials and the supplied 100 Skills Working Draft are proposals, not an approved training standard.
- The Reference Library is not a live publication feed. Public e-Publishing PDFs require internet; verify current editions, MAJCOM supplements and local applicability.

## How to preview
Open the included `ForceMultiplier_22_14_0_Offline_Preview.html` directly, or serve the `dist/` folder as a local static website. The standalone preview inlines the actual source scripts and style sheets so it works without a server. Its data and gameplay are the same as this project.

## How to upload
1. On Windows, extract this ZIP to a new folder.
2. Run `UPLOAD.cmd`. It pushes the source to a new GitHub branch and starts the configured Codemagic `ios-release` workflow.
3. Watch Codemagic for the signed IPA and TestFlight upload. Retrying an older commit will not include this release.

For local verification: `npm ci && npm test && npm run check && npm run ios:prepare && npm run ios:verify`.

**QA:** Original regression suite plus new 35-lesson / 72-task / coach tests passed; Chromium desktop and 390px phone interaction checks passed with zero page-script errors and no horizontal overflow. The generated iOS asset directory passed its source verification. A Mac Xcode compile, signed IPA, and real TestFlight device evaluation are **not** yet verified.
