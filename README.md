# Force Multiplier 22.16.0 — One-screen Block Academy

This update rebuilds the active play interface for all seven Block Academy missions and the bonus sliding puzzles. It is based on the complete 22.15.0 source package.

## What changed

- The active round uses a viewport-sized play surface with its own compact mission header, objective, board, block choices, feedback and actions.
- The large decorative runway, duplicated fixed mobile tray and stacked teaching panels no longer push the playing controls down a long page.
- First wave, Turns and Spare tabs retain the live counts. Larger candidate banks and destination sets use Previous / Next pages with readable controls.
- Tap a block, then tap a destination. Selected blocks and structurally legal destinations are visibly marked. Dragging is still supported.
- Tapping an occupied destination accepts the selected new block, matching drag behavior.
- Undo restores the complete prior plan, including turn assignments affected by a first-wave change. Clear removes the selected cell.
- The sliding puzzle keeps the selected aircraft, movement arrows, feedback and action buttons beside or below the board. Undo reverses the last successful move.
- Help, Phase Flow and the teaching coach open in a focused dialog. Long explanations can scroll inside that dialog; closing it returns to the unchanged game.
- Challenge / Prove coaching mode stays active when the dialog closes. A shown model remains recorded as assistance even after Undo.
- Existing game models, source-task maps, fundamental lessons, advanced trainers, progress storage key and independent-credit rules are retained.

## Try it

Open `ForceMultiplier_Shareable_Web_Simulator_22_16_0.html` in a browser. Choose Start interactive training, then Block Academy and a mission or Clear the Launch Lane.

For hosting, the web sharing package includes the same file as `index.html`. Replace the page at the existing hosted address to make an update available there. Downloaded attachments remain fixed snapshots. The simulator does not send update emails or transmit entered feedback.

## Source / iOS build

This is the complete project, not a signed IPA. The existing `UPLOAD.cmd`, GitHub and Codemagic workflow remain included. `npm test` and `npm run check` run before generated iOS asset checks. The generated native web assets in this package are synchronized with `dist/`.

## Validation and limits

- JavaScript syntax, retained source regression suite and release checks passed.
- UI-handler checks cover 35 mission completions: all seven missions at rounds 1, 16, 36, 61 and 90, plus model-credit gates, invalid-aircraft rejection, retries and sliding puzzle tiers.
- Undo checks cover replacement/removal, dependent turns, sequence moves, reset history, assistance persistence and sliding restoration.
- Existing and updated assets were checked for identical source/native bytes, and the generated asset gate passed.
- A rendered phone/browser preview was not completed: this environment blocked local browser testing. The compact layouts were reviewed in source, not measured on a physical device. Please review phone portrait/landscape fit and drag feel before distributing as a tested iOS release.
- The design targets normal phone and desktop viewports. Very short windows, unusually long content and enlarged text have a safe scrolling fallback instead of hiding required content. Help and full lessons may scroll; gameplay uses pages/tabs to reduce scrolling.

The examples remain fictional educational models. Completion is practice evidence, not an official qualification. No real learner study or device test is claimed for this update.
