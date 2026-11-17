# Source notes — Force Multiplier 22.11.0

The 22.9.x single-app-root/single-router architecture and all advanced trainers remain. New Academy mechanics live in `dist/block-academy-model.js` (status-based palettes, deterministic scheduling cases, 90 solvable sliding boards), `dist/block-academy.js` (weekday launch/Phase Flow/Documentation visualizations, touch + tap interactions, saved sliding progress), and `dist/block-academy.css` (upright blocks and vertical doorway). `dist/fm2290.js` retains the original advanced trainers and now removes duplicated top menu tabs while Academy screens are open.

The game keeps the existing `forceMultiplier2292` localStorage key, so existing app records are retained when updating. Academy mission repetitions still require independent correct decisions; showing the model does not grant credit. The bonus sliding-board progress is stored in the same local state under `academy.slideProgress`, independent of the 630 core repetitions.

All airplane statuses use authentic maintenance palettes. FMC idle color interpolation spans days 0–29, and 30+ days are HQ. The Phase Flow panel uses a scenario-specific illustrative 2 h/flight assumption to show projected hours for scheduled sorties; the legacy 90-day capstone retains its own flying-hour model.

This release's source and embedded `ios/App/App/public` assets are synchronized. Codemagic runs the authoritative `npm ci`, test suite, release check, `ios:prepare` Capacitor sync, and iOS build, then publishes TestFlight if signing/App Store Connect succeeds.
