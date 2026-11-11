# 22.2 guided-program integration

The default iOS entry point now opens the guided 4/12/24-hour learning path. The previous Worlds game is retained at `worlds.html`.

# Force Multiplier — Worlds

The main app is a visual game for five practical specialties. It opens directly at “Pick 6 aircraft,” follows with “Now pick 4,” and introduces one complication at a time. Players can switch specialties or worlds at any point. No lesson dashboard or preliminary reading is required.

## Five specialties, four worlds

There are 55 levels: Scheduling (13), Analysis (12), Documentation (10), Database Management (10), and Data Integrity (10). Each path begins with one small action and builds toward a combined work product. Short prompts, direct manipulation, immediate feedback and optional hints replace long instruction pages.

- Analysis begins by selecting completed jobs, then introduces denominators, rates, fair comparisons, pooled groups, mean, median, missing values, trends, spread, cautious interpretation of association, and a short report.
- Documentation begins by attaching a requirement to an asset, then adds applicability, approved revisions, due forecasts, prerequisites, evidence, register repair and a complete work pack.
- Database Management begins by issuing one useful access key, then adds least privilege, scope, expiry, offboarding, unique identity, broken dependencies, controlled changes, recovery and a service-opening challenge.
- Data Integrity begins by reconciling one value to its source, then adds unknowns, units, duplicate events, parent links, reconciliation, current approved sources, correction history, preventive validation and batch verification.

The world selector offers Airline, Bus Company, Cat Hugs, and Secret Squirrel. Worlds change the vehicles, job vocabulary, visual identity and case seeds while teaching the same underlying fundamentals. Cat Hugs schedules care vans and visits; Secret Squirrel schedules rovers and missions. These are four contextual versions of the same curriculum, not four separately validated occupational courses.

Progress is stored by world and specialty. Switching away preserves the current case and unfinished work; switching back resumes it. Existing Flightline scheduling progress migrates into Airline Scheduling. Stars, sound settings and the scheduling capstone carry-over are retained. The old progress key is preserved. Progress remains local to the current browser and does not sync across devices.

Restart clears the work while retaining hints, demonstration exposure and failed checks for that same case. New case supplies a new seed. A demonstrated case does not earn independent-performance stars. These game scores are feedback, not evidence of occupational certification or validated learning effectiveness.

## Simulated MXMGR review — 11 November 2026

`dist/review.html` contains a clearly labeled review through 100 constructed MXMGR perspectives: five specialties × five experience groups × four play contexts/worlds. These are AI-generated evaluation lenses, not recruited participants, survey responses, completion times, or measured learning gains. The review distinguishes verified software behavior from hypotheses to test with people. The complete structured review is retained under `reviews/`.

Focused changes following the review preserve the simple game: varied pooled denominators and neutral chart cases in Analysis; more varied combined Database Management cases; neutral identity-matching labels; stage-specific keyboard focus in Documentation; visible Reviewed markers in Data Integrity; persistent focus after failed checks; and distinct example-viewed progress markers. Example-only levels no longer count as completed.

Analysis and Database Management case generators now carry a revision. Existing saved cases without a revision use their original generation, and Restart retains it. New case uses the current revision. This prevents an update from changing the facts underneath unfinished learner work.

## Scheduling game

Thirteen levels progress through 6/4 flying, an idle-aircraft priority, 14 aircraft flying 12/10, unavailable aircraft, pilot reservations, inspections, modifications, full cure time, combining compatible modifications, weekend curing, mixed commitments, a two-week checkerboard, and adapting a previously prepared plan.

Tap aircraft to select them. For checkerboards, tap a work tile and a start day in its aircraft row. Work and cure cells fill automatically. Then select aircraft for each day's two flight waves. All feasible schedules are accepted; a single canonical answer is not required.

All case data are fictional. Game assumptions include 08:00–16:00 weekday work, a full 24-hour cure after applicable work, flying the next morning after cure completion, and defined compatible modifications sharing a cure when scheduled consecutively. These rules teach timing and resource constraints; they are not maintenance instructions or claims about any real aircraft or modification.

Progress saves locally on the current browser. Stars express game performance, not certification: three for no failed checks, two for a corrected plan, one when a hint is used, zero when a working example is supplied. Changing a case preserves earned progress. The final scenario carries the prior two-week plan forward when available, then adds an outage and additional demand.

The scheduling game uses original plain-language content and generic aircraft. It does not quote military publications, use real unit information, or include ranks, commanders, or military course content.

### Game source and checks

- `dist/index.html`, `dist/game.js`, `dist/game.css`, `dist/skill-games.css`: playable shell, navigation, persistence, accessibility and responsive UI.
- `dist/game-rules.js`: pure seeded scenarios, timeline and validators.
- `dist/game-worlds.js`: world identities, original vehicle icons and visible terminology.
- `dist/pack-analysis.js`, `dist/pack-documentation.js`, `dist/pack-database.js`, `dist/pack-integrity.js`: seeded game packs with pure reducers and objective checks.
- `tests/game-rules.cjs`: tests across all 13 levels, feasible alternatives, conflicts, shared cure, weekends, priority assignments and changed demand.
- `tests/pack-*.cjs`: seeded pack checks that exercise real game actions, valid solutions, wrong work and alternative accepted paths.
- `tests/worlds-shell.cjs`: migration, unfinished-work preservation, deep links, controls, assistance, restart, all packs in all worlds and scheduling carry-over.
- `dist/courses.html`: the earlier specialty workspace, accessible through the game menu.

Run each named test with Node for model and shell verification. Static hosting has no build step or external runtime dependency. All case data and game rules are fictional; the application does not connect to production scheduling or database systems.

## Preserved specialty workspace

The earlier five-specialty interface remains at `courses.html`. The main app now supplies the five game paths above; this earlier workspace retains its longer lessons, evidence workflow and statistics lab. Its separate scope is documented below.

An installable, browser-local learning app for five practical workplace specialties. The supplied background paper is the design brief: independently produce usable work, adapt to unfamiliar conditions, and explain the evidence and decisions.

## What is implemented

- Scheduling: 9 lessons, from one task/resource to a 90-day plan with parts downtime, service windows, reserve, changed demand and cumulative commitments.
- Analysis: 10 lessons covering rates, scope, overlap, pooled denominators, source reconciliation, descriptive statistics, trends, correlation, group differences and statistical evidence.
- Documentation: 8 lessons covering approved requirements, applicability, due forecasts, register reconciliation, prerequisites and verified closeout.
- Database management: 8 lessons covering least privilege, role matrices, lifecycle reviews, approval, troubleshooting, controlled changes and verified recovery.
- Data integrity: 8 lessons covering source checks, units, unknowns, duplicates, validity, correction history, reconciliation and prevention.
- A working statistics lab with descriptive statistics, Pearson correlation, descriptive slope, Welch comparisons, two-sided probabilities and confidence intervals.
- Three practice contexts: equipment services, delivery operations and production operations.
- Practice, independent checks and coach preview have separate case state. Hints and supplied calculations mark practice assisted. Coach demonstrations never count toward independent evidence.
- Work-product snapshots preserve source facts/tables, inputs, checks, case seed, time and review history. The proposed pilot rule is two first-attempt independent capstones in different contexts, correct objective artifacts and peer ratings of at least 3/4 in every dimension.
- Local progress, feedback sounds, calculator, direct lesson navigation, full-screen workspace, portable JSON backup and reviewed restore, print/copy work products, and progressive-web-app assets.

## Deliberate scope

This is a new universal curriculum derived from the goals and progression of v22. It does not embed the earlier trainer or its domain-specific language. The 90-day capstone is a weekly allocation model, with individual-resource assignments taught earlier. It is not a 72-resource daily operational scheduling system.

The app is a training simulation. All case data are fictional. Objective checks do not certify real-world job competence. Explanations and judgment remain human-reviewed. The proposed review thresholds and lesson-time estimates require calibration. Four-hour proficiency and tenfold training efficiency are research targets, not established outcomes. Full-path estimated practice time exceeds four hours; timed pilot results should determine future revisions.

Progress and notes remain in the browser. There are no analytics scripts, learner accounts, cloud score database or live database connections in the app. A public deployment serves the static application; it does not upload local learner records. Export a backup before clearing browser data or changing devices. Preview history is capped separately at 50 entries; learner submissions are retained up to 500 with an explicit stop instead of silent deletion at the limit. Review names are self-entered, not authenticated.

## Development and checks

Serve `dist/` as a static site. No build step or external dependencies are required.

Run `node tests/verify.cjs` for the reproducible integration checks. Development also exercised thousands of generated cases, invalid values, alternative feasible schedules, and statistical comparisons against SciPy. These checks establish software consistency within the model, not training effectiveness.

Browser QA covered valid/invalid submission, independent/preview separation, the statistics lab, capstone work, source snapshots, review entry, persisted state, responsive layout and navigation. Native phone installation and real-world proficiency validation are separate from browser QA.

## Source layout

- `dist/core.js`: seeded helpers and module registry.
- `dist/scheduling.js`, `dist/analysis.js`, `dist/records.js`: curriculum and objective validators.
- `dist/app.js`: UI, workflow state, evidence, review, statistics UI and backup validation.
- `dist/styles.css`: responsive interface.
- `dist/sw.js`, `dist/manifest.webmanifest`: offline assets and install metadata.
- `.openai/hosting.json`: hosting configuration.

Every new independent attempt generates a case. Correct schedules are checked against modeled constraints, allowing feasible alternatives rather than requiring only the worked example.
