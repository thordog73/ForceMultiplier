# 22.9.6 — Force Multiplier: Revenge of the Nonner — Block Academy

## User-facing changes

- Seven mobile-first, no-timer block missions across Scheduling, Documentation, Analysis, Data Integrity, and Database & Systems.
- Shared large, colored blocks; drag to a target and tap-to-place fallback; move already placed blocks; clear individual slots.
- Aircraft status learning: aging FMC green, inspected hangar queen white/green, maintenance red, supply yellow, both orange, Depot black, Phase purple, PFR modification white with dark outline.
- Original two-cure documentation model remains intact; block puzzle teaches an approved consolidated 24-hour cure across the weekend.
- Analysis numerator/denominator training uses the original 19 metric definitions, including MC Rate, TNMCM, TNMCS, fix rate, repeat rate, and cannibalization rate.
- Side-by-side mismatch puzzles require verification and a remedial decision, not mere color identification.
- Five discipline vocabulary decks, repeat scenarios, hints, Show Model without graduation credit, practice stars, and optional offline sound.
- Links into the unchanged original multi-discipline curriculum and the 90-day capstone with the existing “ADD MORE JETS TO THE SCHEDULE!” officer request.

## Technical and risk notes

- Separate self-contained `block-academy.html` entry point with model, UI and styles, bundled by Capacitor in `dist` and iOS public assets.
- Synthetic test data. No network calls or additional dependencies. Game save isolated from original trainer save.
- Stable iOS version advanced to 22.9.6; signing and TestFlight upload intentionally not attempted.
- Training-game completion is not an official qualification. Weekend curing allowed **only** under the explicit approved-case assumption.

## Verification

- New Node regression tests: seven mission paths, 19 metric calculations, 84 synthetic variation solutions, and assistance-credit constraints.
- Existing suite: Scheduling, Documentation, Analysis, Data Integrity, DBM, 90-day capstone and backup contract tests passed.
- Headless Chromium simulation at 320, 390, 428 and 768 px; no horizontal overflow; tap-to-place, day repair, pointer drag including wave-to-turn, and data integrity correction completed.
- Capacitor bundled file equivalence and release checks performed; no signed on-device iOS QA.
