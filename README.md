# Force Multiplier 22.11.0 — Revenge of the Nonner

**Upload this complete ZIP as the repository contents, not as a standalone HTML file.** This update starts from the previous 22.10.0 Codemagic-ready package and preserves the five original training disciplines and the 24-aircraft, 90-day Scheduling Capstone.

## New in 22.11.0

- **Portrait-first Block Academy:** aircraft are taller upright cards, with larger IDs and readable statuses. On phones the quick-drag rack stays near the bottom; tapping a block and then a lineup slot remains an alternative to pointer/touch drag.
- **Correct readiness colors:** FMC is solid green after flying and grows continuously paler as idle days increase; at day 30 the aircraft becomes HQ (white with green border). NMCM red, NMCS yellow, NMCB orange, Depot black, Phase purple. PFR/PBG/CURE are white with black borders. Colors encode maintenance status, not random aircraft identity.
- **Day-labelled launch:** Monday through Friday door names; correct lineups taxi/launch UP through the exit in sequence. Invalid lineups show a frowny, explanatory feedback and decrement a three-life practice counter. No timer.
- **Phase Flow visible in the game:** the "Fix the Phase Flow" challenge shows a sticky, tappable bar panel before the lineup, highlights selected aircraft, and updates projected hours using a clearly stated 2-hour sortie assumption for that practice case.
- **Documentation paint/cure exercise:** compare separate versus combined work periods; drag PFR (Paint From Red), PBG (Paint Back Green), and one 24-hour CURE into the correct order. The joke "The H in Documentation stands for Happiness" is retained.
- **NEW bonus sliding game:** "Clear the Launch Lane" with 90 deterministic, solvable 6×6 sliding-block puzzles. Vertical FMC target and axis-constrained maintenance blocks are controlled by swipe/drag or accessible arrow buttons. No timer. Progress saved.
- **Seven original Academy missions unchanged in count:** 90 progressive independent repetitions each, 630 total, across Scheduling (3), Documentation, Analysis, Data Integrity, and Database & Systems. Flashcards, Home navigation, and offline progress preserved.

## Build and QA

`npm ci && npm test && npm run check && npm run ios:prepare && npm run ios:verify`

The included `codemagic.yaml` retains the unsigned `ios-validate` and signed `ios-release` workflows, signing integration, and TestFlight publication configuration. **This archive is source-ready for GitHub/Codemagic; it is not itself a signed IPA and has not yet been installed on an iPhone.** The source and included `ios/App/App/public` have been synchronized for inspection. Do not use any screenshots in the working directory as app assets.
