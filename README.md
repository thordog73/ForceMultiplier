# Force Multiplier 22.10.0

Offline iOS/Capacitor maintenance-management simulator. Version 22.10.0 builds on the verified 22.9.3 source and retains all five original disciplines and the 24-aircraft, 90-day Scheduling Capstone.

## New: Revenge of the Nonner / Block Academy

- New Home screen and seven visual missions: 3 Scheduling, Documentation, Analysis, Data Integrity, and Database & Systems.
- **90 progressive repetitions per mission** (630 total) with fundamentals, guided practice, applied work, and independent practice. Repetition number and skill progress are saved locally offline; model-assisted demonstrations do not count as completed independent rounds.
- Larger high-contrast multi-colored blocks. Tap-then-drop or true Pointer Events drag-and-drop; a fixed compact mobile block rack keeps source blocks accessible while looking at the target slots.
- Aircraft selected for a valid departure animate one at a time through the flight-line doorway.
- Visible Home navigation on every screen and Flashcards on the main menu and top navigation. Cards cover Scheduling, Analysis, Documentation, Data Integrity, and DBM.
- No timer and no network requirement for exercises.

## Original simulator preserved

- Advanced Scheduling, Analysis, Documentation, Data Integrity, and Database & Systems lessons remain accessible from the Home screen and top navigation.
- The original 90-day 24-aircraft Scheduling Capstone continues unchanged.
- `codemagic.yaml` retains the signed TestFlight workflow, with app bundle identifier `com.fredesser.forcemultiplier`.

## Quality checks

Run `npm test && npm run check` in the project root. `tests/block-academy-22100.cjs` verifies 630 deterministic exercises, model validity, rejected mistakes, all seven learning routes, independent-progress gating, flashcards, and legacy navigation. Build an iOS app on macOS/Codemagic using `npm ci && npm run ios:prepare && npm run ios:verify`.
