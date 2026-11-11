# Force Multiplier 22.3.1 — stress-test report

Date: 11 November 2026

## Scope

Stress test of the iOS/TestFlight source candidate derived from 22.3.0. This is source-level and model-level testing in Linux. It is not a signed IPA, Xcode device build, TestFlight installation, or physical-iPhone test.

## Passed regression coverage

- Scheduling: 13 levels, 1,300 seeded models, 32,052 assertions.
- Analysis: 12 levels × 20 seeds, 6,670 assertions and action paths.
- Documentation: 10 levels × 20 seeds, 6,040 assertions.
- Database Management: 10 levels × 20 seeds, 4,301 assertions.
- Data Integrity: 10 levels × 20 seeds, 2,021 assertions.
- Worlds shell: migration, independent progress, routing/reload, all packs, undo, assistance, demonstration status, revisions and carry-over.
- Malformed-save recovery: 168 cases / 897 shell assertions.
- Native backup contracts: share/cache cleanup, schema and size guards, cancellation, restore and scoped deletion using mocked native plugins.
- Guided path: 40 packets, 100 unique fundamentals, exactly 40 planned minutes per function, 4/12/24-hour designation structure, integrated challenges and native bridge.
- High-volume guided stress: 100,000 duplicate-credit attempts cannot unlock Advanced or Expert.

## Release-blocking defects found and fixed

1. **Independent-credit farming.** Recognition alone previously awarded case credit. Credit is now awarded only after the learner completes the Integrate step, adapts to the changed condition, and supplies the handover.
2. **Weak transfer gate.** A learner could satisfy the global world-count rule without demonstrating cross-world performance on every skill. The 12-hour gate now requires each fundamental to have three successful integrated cases spanning at least two worlds. The 24-hour gate requires five successful integrated cases spanning at least three worlds.
3. **Unbounded case credit.** Success and credit logs could grow indefinitely. They are now capped at five qualifying credits per fundamental.
4. **Answer-position cue.** Correct choices were disproportionately in the first position in several stages. Option order is now deterministically shuffled by attempt/world while preserving scoring IDs.
5. **Stored-feedback HTML injection.** Learner/SME comments were interpolated into HTML without escaping. Stored comments are now escaped on render and bounded to 800 characters per field.
6. **Storage-pressure risk.** With bounded feedback, a deliberately maximized guided state is approximately 2.22 MiB in JSON form, leaving headroom compared with common WebView local-storage limits.
7. **Malformed guided save.** Invalid or partial localStorage state could crash the guided entry point. The loader now normalizes invalid world, role, packet, phase, view and collection fields.
8. **Missing performance evidence.** Integrated handovers and designation-challenge results were not retained. The app now stores a bounded handover log and latest challenge record and includes them in feedback export.
9. **Stale release metadata.** About text still reported 22.1.0 / four worlds. It now identifies the 22.3.1 stress-tested candidate and the 14 guided worlds.

## Important remaining limitation

The guided path now resists answer-position memorization and requires integrated, cross-world success. However, the current guided packet data are still largely fixed instructional situations: changing the attempt seed does not yet generate a deeply different underlying problem for every one of the 100 fundamentals. World changes provide different context vocabulary, not independently validated occupational scenarios. Therefore the 24-hour **Expert** designation is an in-app training designation and should not be represented as validated real-world expertise until unseen-case and human-SME testing is added.

## Native-build limitation in this environment

`npm test` and `npm run check` pass. A fresh `npm ci` attempt timed out in this Linux environment before installing the esbuild binary, so `npm run ios:prepare` could not be rerun from freshly installed dependencies here. The packaged `dist/` and `ios/App/App/public/` guided assets were kept byte-identical after the fixes. Codemagic remains configured to run `npm ci`, tests/checks, `ios:prepare`, then Xcode on macOS. A successful Codemagic/Xcode build and physical TestFlight smoke test remain release gates.

## TestFlight smoke-test priorities

1. Upgrade from the prior TestFlight build and verify saved Worlds progress remains.
2. Complete one guided packet through Teach → Recognize → Integrate; confirm only Integrate increments independent-case credit.
3. Repeat attempts in one world and verify they cannot satisfy cross-world designation gates.
4. Complete qualifying cases across multiple worlds and verify the 12-hour/24-hour counters.
5. Enter HTML-like characters in learner/SME feedback, leave/reopen the packet, and verify the text renders literally.
6. Export all progress, delete local progress, restore the JSON, and verify guided credits, handover evidence and challenge records return.
7. Force-close and relaunch at each graduation-path screen.
8. Test VoiceOver, Dynamic Type, small-screen layout, safe areas, keyboard entry and rotation as applicable.
9. Run the signed IPA with airplane mode enabled to confirm offline cold launch.
