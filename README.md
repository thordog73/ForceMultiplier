# Force Multiplier 22.17.0 — Block Academy learning update

## What to upload
This is the complete source project for the existing UPLOAD.cmd → GitHub → Codemagic → TestFlight workflow. Extract the ZIP first. Use UPLOAD.cmd from this extracted folder. The shareable HTML and web-sharing ZIP are separate browser deliverables; they do not replace this source project for a native build.

## What changed
- Phase Flow is now the default board view in mission 3. The chart shows every aircraft's actual current and projected hours from the live exercise. First-wave and turn assignments both consume hours. Select an aircraft, then use the First wave / Turn / Spare buttons below the chart; use Assignments to inspect or clear cells. Expand Phase Flow shows exact paired bars, aircraft status, sortie consumption and exercise limits.
- The Analysis rate mission now teaches one question at a time: numerator, denominator, calculation and interpretation. Tap one block to place it directly into the active slot, check the answer, read why, then continue. The first case uses 2 qualifying fixes / 10 eligible breaks = 20%, with a complete eight-hour follow-up window. Eight rate families cycle through subsequent cases.
- MAJCOM reports replaces the former numeric report label in current learner assets, embedded task previews and included historical text. The new reporting track practices requirement, routing, authorized source, reporting window, validation, calculation, explanation, review, submission, retention and correction. Command-specific definitions, deadlines and routing remain requirements supplied by the applicable instruction; the simulator does not invent universal command rules.
- The Improvement Laboratory is inside Block Academy. Trend, Correlation, Difference, Fishbone and Test a change each use their own evidence and block decisions. Line charts, scatter plots, independent-sample observations and a fishbone are visible during the exercise. Exact data and a larger view are available without leaving the case.
- Changed populations and missing records are disclosed beside the improvement charts before the learner chooses an interpretation.
- Independent and coached completions are tracked separately. Examples remain blocked in Challenge / Prove mode; Help Me is accessible from the exercise menu. There is no life penalty in the new guided Analysis exercises.
- Existing Academy progress and the forceMultiplier2292 storage key are preserved. A saved old rate-game route migrates to the guided exercise. Work in each Analysis track resumes after changing tracks or reloading.
- Analysis home and the Academy campaign both provide direct entries to the new tracks. Existing advanced trainers and the scheduling capstone remain accessible.

## Where to try the changes
1. Block Academy → Fix the Phase Flow: the actual chart appears immediately. Tap an aircraft and add it to the first wave, then turn it. Watch its projected remaining hours change.
2. Block Academy → Build the Right Rate, or Analysis → Rates: work through the four decisions.
3. Block Academy → MAJCOM reports: build the reporting process.
4. Block Academy → Improvement Laboratory: choose Trend, Correlation, Difference, Fishbone or Test a change.

The new Analysis section has 34 concept families across seven tracks, with repeatable variations. These are practice activities, not official training qualification or proof that a learner is job-ready after a specified number of hours.

## Browser edition
Open ForceMultiplier_Shareable_Web_Simulator_22_17_0.html in a browser, choose Start interactive training, then Block Academy. The web-sharing ZIP contains the same file as index.html. No external scripts, account, email collection or installation are required.

A hosted HTTPS page is generally easier to open on a phone than an attachment preview. Replace index.html at the same hosted address for updates. Downloaded HTML files remain snapshots. This simulator does not send update emails. Progress is local to the browser/origin or native app that stores it; these versions do not automatically synchronize with one another.

## Validation
- Retained source regression suite and release checks.
- 102 independent content/numeric cases across all 34 concept families, including denominators, units, complete follow-up, report-step coverage, Pearson, group means and Welch statistics.
- 21 full rate/report/laboratory cases through the actual application dispatch, plus answer gates, assisted credit, retries, track switching, storage reload and persistent teaching modes.
- All five trend choices reachable through four viewport-dependent paging branches. This is a handler test, not a measurement of rendered viewport fit.
- Phase Flow interaction checks plus 40 generated challenge/projection cases, covering first-wave/turn usage, invalid plans, full fleet coverage, fixed ordering and preservation of assignments.
- Existing one-screen Academy, undo, sliding, task-map, documentation, data-integrity, database and scheduling regressions.
- Standalone HTML inline JavaScript syntax and package integrity checks. Source and generated iOS web assets synchronized.

This environment did not permit a rendered local browser test. Physical phone layout, drag feel, signed iOS installation and TestFlight processing remain unverified for this release. No upload to GitHub, Codemagic or TestFlight was performed while creating these files.

The compact game keeps controls within a viewport-sized surface and uses tabs/pages for larger sets. Very short windows or enlarged text retain a safe scroll fallback. Expanded explanations and full data sheets may scroll inside their dialogs.

## Earlier laboratory material
The earlier primary simulator's trend, comparison, guided fishbone, correlation, controlled pilot and six-month profiles were found and used as the basis for the new block exercises. The historical 13-test Fishbone Test Builder is documented in the repository but is not the same as the new guided Fishbone activity; its complete former interface was not restored.

## Content basis
The scenarios are fictional and define their populations and windows explicitly. The report requirement is an input to the training process. Statistical calculations and interpretation were checked against NIST primary guidance:
- https://www.itl.nist.gov/div898/handbook/eda/section3/eda353.htm
- https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm
Official AETC reporting guidance was used to check rate scope and the repeat-rate denominator:
- https://static.e-publishing.af.mil/production/1/aetc/publication/aetci21-105/aetci21-105.pdf

The learner reference browser remains removed. These URLs document developer provenance; learners are taught through the exercises.
