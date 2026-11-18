# Force Multiplier 22.15.0 — Fundamentals and Task-Specific Visuals

Complete offline iOS/Capacitor project for GitHub → Codemagic → TestFlight. Version 22.15.0 is based on the complete 22.14.0 project and preserves the five-specialty learning paths, 100 mapped observable skills, 72 task entries, 630 Block Academy models, 90 sliding puzzles, simulation exercises and advanced capstones.

## Main improvements

1. **References UI removed.** The References tab, MAJCOM PDF browser, download actions, and external source calls have been removed from the learner shell. Authoritative-source verification remains a *concept taught by lessons*, not a broken download workflow.
2. **Task-matched instruction.** The 35 fundamentals and 72 task entries each have an explicitly assigned visual. Wrong, Right and Constraint examples now show work products appropriate to the actual task. For example, FGS Scheduling → Document Reviews now uses a controlled-source / system-record comparison rather than an aircraft checkerboard; CAD/PAD, 120-day TCTO, 9302 data collection, AGE daily, AVDO, Phase Flow, engine records, JML, access control and interface recovery have dedicated representations.
3. **Scroll restoration.** The task-dialog scroll offset and the page scroll are retained across switching concepts, grading answers, and updating the modal. Opening a genuinely new screen starts at the top as expected.
4. **Task-specific questions.** Each source-task modal now asks for evidence that matches its original task description and expected demonstration. The user’s old answers for those rewritten questions are cleared once; Academy and lesson progress, proof records, and independent assessments remain intact.
5. **Five-stage training retained.** Show Me → Help Me → Let Me Try → Challenge Me → Prove I Can Do It remains connected to the original advanced trainers and games.

## How to preview

Open `ForceMultiplier_22_15_0_Offline_Preview.html` in a desktop browser. It is a complete self-contained HTML file with CSS, models, and JavaScript embedded. Or serve the `dist/` folder from a local static web server. Both paths are offline, excluding app-store publishing itself.

## How to publish

Extract this complete ZIP. Run `UPLOAD.cmd` from the extracted directory. The uploader uses the existing GitHub/Codemagic workflow. The signed iOS IPA and TestFlight delivery must complete in Codemagic; this archive is not a signed IPA.

## Quality checks and scope

- `npm test` — retained regression suite plus semantic diagram coverage.
- `npm run check` — source, offline assets, iOS configuration and release contract.
- `npm run ios:prepare` / `npm run ios:verify` — iOS synchronization and generated asset verification on a machine with locked dependencies installed.
- Chromium mobile tests included test-case switching, source vs system Record Review, engine systems, checkerboard, quiz scroll retention, and all 72 task dialogs opening their three example views. All passed.
- Task illustrations are fictional instructional models. They do not reproduce technical manuals, establish official skill qualification or supersede approved maintenance procedures. Actual SME and technical-school validation is still needed.

See `VISUAL_QA_22_15_0.md` for the complete 107-item mapping and QC approach.
