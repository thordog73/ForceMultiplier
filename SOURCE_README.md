# Source notes — 22.9.4 Documentation downtime recovery

22.9.4 adds the standalone learner-edited "Recover Flying Days" Documentation exercise. It uses `dist/fm2290-model.js` for the two-week scenario data, validation and downtime arithmetic, `dist/fm2290.js` for the UI and navigation, and `dist/fm2290.css` for the responsive board. Existing free-form sandbox behavior is unchanged.

## Earlier source: 22.9.3 Scheduling capstone

22.9.3 preserves the clean single-router/single-render architecture introduced in 22.9.0. No legacy stacked render layers are loaded by `dist/index.html`.

The new Scheduling capstone is implemented in `dist/fm2290.js` with pure fleet/status primitives in `dist/fm2290-model.js`. It uses 24 aircraft, 90 operating days, a daily 12-Turn-10 requirement, dynamic Phase hours, recurring Phase downtime/recovery, deterministic NMC events, generic planned UNAVAILABLE periods, days-since-last-flight utilization risk, and campaign scoring.

Tests: `tests/scheduling-capstone-2293.cjs` runs the model solution through all 90 days. `tests/capstone-ten-users-2293.cjs` runs ten different synthetic scheduling strategies through all 90 days to verify good and poor decisions both complete without breaking the campaign.
