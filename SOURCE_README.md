# Source notes — 22.9.7 Improvement Laboratory

- New `dist/improvement-lab.html`, `.js`, `.css`, `improvement-lab-model.js` create an optional, fully offline, small-screen statistical test tutorial with 15 scenario families, three guided decisions per case, explanatory assumption and limitations cards, and a browsable test library.
- `dist/block-academy.js` and `dist/fm2290.js` add navigation links only; the original calculators, investigation sequence, seven block missions and 90-day capstone are not rewritten.
- The tutorial's p-values are labeled illustrative; not computed from input. This is a learning workflow, not a substitute for the existing statistics calculator.
- `tests/improvement-tests-2297.cjs` exercises all 45 correct paths, incorrect feedback, test-library navigation, progress isolation and link preservation.
- Service worker now precaches the new offline assets. iOS `webDir` includes the same files.
- No GitHub push or Codemagic build performed.

---

# Source notes — 22.9.6 Block Academy

- `dist/block-academy.html` is a standalone offline entry point, linked from `dist/index.html`/`dist/fm2290.js` and included in the Capacitor `webDir` asset bundle.
- `dist/block-academy-model.js` provides testable rule data and evaluation. The original `dist/fm2290-model.js` remains authoritative for the 19 Analysis metric definitions and 22.9.4 two-week documentation downtime evaluation.
- `dist/block-academy.js` renders a seven-mission mobile game with shared pointer/tap block movement, flashcards, feedback, assistance, and locally persisted practice state. It does not mutate the original training save.
- `dist/block-academy.css` contains original, accessible colored block UI, calendar, comparison and flashcard layouts.
- `tests/block-academy-2296.cjs` validates all seven rule paths, the 19 metrics, synthetic variations, assisted scoring, navigation and preservation of original trainers. `tests/generated-ios.cjs` now checks bundled game assets.
- `dist/fm2290.js` adds the game entry link and a deep-link bridge back to classic trainers or the 90-day capstone. Existing game logic remains unchanged.
- iOS build: `npm ci && npm test && npm run check && npm run ios:prepare && npm run ios:verify`. Codemagic already runs this; no new paid service or plugin is required.

## Limits

This is the first unified block-game prototype, **not** a full first-person 3-D environment and **not** a 90-day block replacement for the existing capstone. The 90-day schedule, original Documentation sandbox, statistical Analysis and all other legacy training screens remain available. Puzzle accuracy is evaluated against synthetic teaching scenarios; real curing requirements and aircraft authorization depend on approved technical data. No signed iOS build or device test has been performed locally.

---

# Source notes — 22.9.5 Documentation downtime recovery

22.9.5 adds the standalone learner-edited "Recover Flying Days" Documentation exercise. It uses `dist/fm2290-model.js` for the two-week scenario data, validation and downtime arithmetic, `dist/fm2290.js` for the UI and navigation, and `dist/fm2290.css` for the responsive board. Existing free-form sandbox behavior is unchanged.

## Earlier source: 22.9.3 Scheduling capstone

22.9.3 preserves the clean single-router/single-render architecture introduced in 22.9.0. No legacy stacked render layers are loaded by `dist/index.html`.

The new Scheduling capstone is implemented in `dist/fm2290.js` with pure fleet/status primitives in `dist/fm2290-model.js`. It uses 24 aircraft, 90 operating days, a daily 12-Turn-10 requirement, dynamic Phase hours, recurring Phase downtime/recovery, deterministic NMC events, generic planned UNAVAILABLE periods, days-since-last-flight utilization risk, and campaign scoring.

Tests: `tests/scheduling-capstone-2293.cjs` runs the model solution through all 90 days. `tests/capstone-ten-users-2293.cjs` runs ten different synthetic scheduling strategies through all 90 days to verify good and poor decisions both complete without breaking the campaign.
