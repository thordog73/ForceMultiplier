# Force Multiplier 22.9.7

Offline maintenance-management learning simulator for Scheduling, Analysis, Documentation, Data Integrity, and Database & Systems Management.

## 22.9.7 · Improvement Laboratory — Which Test and Why?

**Retains every existing v22.9.6 game, statistic calculator, Analysis investigation, and 90-day capstone.** Adds a dedicated offline, phone-first Improvement Laboratory accessible from Block Academy home and the original Analysis home. The existing trainers are unchanged; the new laboratory is an optional instructional layer.

- 15 progressively guided hypothetical cases: trends, Pearson/Spearman correlation, independent pooled/Welch and paired t-tests, one-mean Z-test, two-proportion Z-test, ANOVA, Mann–Whitney U, Kruskal–Wallis H, both chi-square tests, variance F-test, and Cochran's C.
- For each case, select a test block, identify a population-level H₀, interpret an explicitly *illustrative* p-value at prespecified α = 0.05, then read what the result does and does not establish.
- Field guide supplies question, use case, null hypothesis, assumptions and cautions for every test. Wrong answers explain the issue; no timer or lives. Finishing exercises never grants official certification.
- These new sample p-values are **fictional examples, not calculated from actual input records**. For real numerical calculations and investigations, use the unchanged original Analysis interface, which still includes trends, correlation, differences, Fishbone, and the improvement cycle. No external service is used.
- Local practice progress has its own storage key, separate from the original trainer and Block Academy.

## 22.9.6 · Revenge of the Nonner — Block Academy (PLAYABLE)

A fully offline, phone-first puzzle campaign now opens from the original Scheduling home screen, the five-discipline header, and the 90-day capstone header. **No timer**. Large draggable blocks, touch-friendly slots, and one-tap placement allow practice on small iPhones without a horizontal spreadsheet. The original simulator and its 90-day engine remain intact.

Seven playable missions cover all five core disciplines:

1. **6-Turn-4:** move six fictional FMC aircraft into the departure door; assign four turns from those six.
2. **Work Around NMC:** distinguish FMC, aging-green FMC, inspected hangar queen, NMCM, NMCS, NMCB, Phase, Depot and PFR/MOD blocks; avoid unavailable aircraft.
3. **Fix the Phase Flow:** route three suitable aircraft to fly, a due aircraft to Phase, and two unavailable/near-due aircraft to Hold.
4. **Recover Flying Days:** compare the original two-cure modification plan, then drag R1/R2 (PFR), G1/G2 (PBG), and one passive 24-hour cure into a two-week board. Validation uses the unchanged v22.9.4 approved-combined-cure model; a Saturday cure saves 3–4 modeled flying weekdays.
5. **Analysis Rate Builder:** drag actual numerator/denominator definitions and choose calculated answers for all **19** metrics already defined in the simulator, with multiple synthetic variations.
6. **Data Integrity — Find the Bad Record:** side-by-side source/record comparison, flag three mismatches, then choose an evidence-based corrective action.
7. **Database & Systems — Permission Patrol:** side-by-side authorized/actual permissions, flag three mismatches, then verify authorization and select a controlled remediation.

Includes five discipline-specific flashcard decks drawn from the existing Scheduling, Documentation, Analysis and Data Integrity dictionaries, plus Database Management terminology, offline persisted practice progress, hints, assisted solutions (no proficiency credit), repeat variations, optional sounds, and the running **NON-NONNER / NONNER STATUS PENDING** joke. A game completion is practice credit, **not a real occupational qualification**. Legacy training and 90-day capstone links are one tap away.

All data, records and characters in the new puzzles are synthetic. No network API or copyrighted game artwork is used. No changes have been pushed to GitHub or Codemagic.

## 22.9.5 · Revenge of the Nonner mobile capstone

- Replaces the default 90-day Scheduling Capstone screen with a phone-first playable scheduler: flying door, 12 first-wave slots, 10 turn slots, 24 synthetic aircraft tiles, touchscreen drag and drop, visible bottom drop tray, and tap-to-place fallback. Existing capstone engine still runs 90 days and scores Phase Flow, utilization, hangar-queen decisions, and shortfalls.
- Officer challenge “ADD MORE JETS TO THE SCHEDULE!” appears at eight simulated campaign checkpoints. The player can accept two extra departures when 14 aircraft are available, or defend the 12-Turn-10 baseline. Accepting changes requirements to 14-Turn-10 and charges six additional modeled flying hours; the aircraft accrue hours and can enter Phase earlier. A history-based Maintenance Death Spiral watch indicator models increased risk, not a guaranteed failure.
- Color tile legend: FMC green (lightens with idle days), HQ white with green border after 30 simulated idle days, NMCM red, NMCS yellow, NMCB orange, DEPOT black, PHASE purple, modification PFR/PBG/CURE white with dark outline. Readiness events are fabricated and the types of NMC are pedagogical labels; they do not encode real-world unit data.
- Starts as NON-NONNER. Graduation remains separate from the joke: NONNER STATUS is still locked. Practice lives provide feedback but do not block progression. Reduced-motion CSS is respected, and audio can be disabled.
- Preserves a Classic Board toggle and the entire legacy Scheduling, Documentation, Analysis, Data Integrity and Database & Systems simulator. No external runtime libraries were added to the offline game.

## 22.9.4

Documentation now includes **Recover Flying Days**, a separate learner-edited two-week modification-repair challenge. The original 24-aircraft sandbox remains unchanged. A bad plan contains RED → cure → idle gap → GREEN → cure; users combine the work under the scenario's approved single-cure assumption and move the 24-hour cure to Saturday. The app checks weekends, task order, cure timing, earliest return to flying, and modeled weekday downtime savings. Three flawed starting plans rotate with New Variation.

## 22.9.3

Scheduling now ends with a **90-Day Fleet Scheduling Capstone**. The learner inherits 24 aircraft and executes a 12-Turn-10 every day for 90 days while managing Phase Flow, NMC aircraft, hangar-queen/utilization risk, flying-hour output, and generic planned UNAVAILABLE periods. Scheduling intentionally does not explain every planned unavailable reason; Documentation later teaches the underlying controlled work.

The capstone records daily decisions, Phase entries, utilization mistakes, clustered Phase entries, shortfalls, modeled flying hours, and an overall fleet-management score.

The clean 22.9.x single-router/single-render architecture is preserved.
