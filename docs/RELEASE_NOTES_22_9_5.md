# Force Multiplier 22.9.5 — Revenge of the Nonner (phone-first capstone)

## Gameplay

The **90-Day Fleet Scheduling Capstone** now opens in a touch-first game shell. Build daily flying and turn sorties by dragging or tapping aircraft blocks into a departure-door grid. A floating finger-reachable dock allows dropping blocks while scrolled to the aircraft bank. Sound can be switched off. The game works offline on iPhone and desktop browsers.

An officer periodically requests **“ADD MORE JETS TO THE SCHEDULE!”**. Accepting a two-jet increase changes the requirement to a 14-ship initial wave plus ten turns only when 14 aircraft are available; 72 rather than 66 modeled flying hours are recorded. The increased flight hours alter future Phase forecasts. An alternate **DEFEND THE PLAN** response retains the baseline requirement, encouraging defensible fleet management. Maintenance Death Spiral is a simplified training risk index derived from recent additional sorties, clustered Phase entries, and missed lineups.

## Status blocks

FMC bright green; gradually lighter FMC at 18+ idle days; HQ white with green outline at 30+ idle days; NMCM red, NMCS yellow, NMCB orange; depot black; Phase purple; PFR / PBG / Cure white and dark outline. Manned aircraft readiness, names and metrics are fictional. A synthetic six-month depot event is modeled for A20, starting on simulated flying day 35.

## Preservation and limitations

- The 90-day capstone scoring engine, original classic display, 7 Scheduling fundamental exercises, and other four functional sections remain in place.
- Existing 22.9.4 Documentation Modification sandbox and Recover Flying Days exercise are unchanged.
- The game is a touch-first 2D front-of-hangar scheduler, not a 3D first-person game. All interface visuals are built offline in CSS.
- NMC subtype colors are illustrative assignment by synthetic ID, not computed from an underlying maintenance database. The depot event and PFR/PBG/Cure sequence are synthetic scenarios.
- iOS signing, device-specific testing, and TestFlight distribution require the external Codemagic/Apple pipeline.

## QA

The original automated regression suite and new touch/logic test pass. Manual browser simulation covered iPhone-width screenshots, tap entry/removal, touch-mode mouse pointer drag to an on-screen dock, extra-jets challenge, and saved progression.
