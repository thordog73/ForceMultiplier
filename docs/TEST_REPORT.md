# Packaging validation report · 11 November 2026

## Actual automated checks

The latest Site source v4 was recovered at commit ac6d3c1c1ca634afefb9096498a42d430bb4323c. The original game and workspace test suites were run independently and rerun against the native package.

- Scheduling: 13 levels, 1,300 seeded models, 32,052 assertions.
- Analysis: 12 levels × 20 seeds, 6,670 assertions and real reducer action paths.
- Database: 10 levels × 20 seeds, 100 varied capstones, legacy/current restore, 4,301 assertions.
- Documentation: 10 levels × 20 seeds, four worlds, 6,040 assertions.
- Data integrity: 10 levels × 20 seeds, 2,021 assertions.
- Shell: migration, saved work, route/reload, specialty/world changes, Undo, help/demo behavior, revisions and scheduling carry-over, 897 assertions after recovery regressions (225 baseline).
- Earlier workspace: all five tracks, 43 lessons, model solutions, blank-answer guards, backup round-trip and malformed-backup guards, statistics references and offline asset presence.
- New native integration contracts: backup share payload, temporary-cache cleanup, file-size/schema guards, cancellation, restore and scoped deletion. These tests mock iOS plugins; they do not demonstrate native plugin behavior on a device.
- JavaScript parsing for all bundled browser scripts.
- Codemagic YAML parsing, plist parsing, project privacy-resource reference, offline asset references, non-submission gate.
- Capacitor `sync ios` completed with Filesystem and Share registered through Swift Package Manager.
- Original F× icon rasterized as a 1024 × 1024 RGB PNG with no transparency.
- npm production dependency audit returned zero reported advisories. This is not a security certification and does not audit resolved native Swift packages.

## Newly addressed defects

The packaging pass added visible save-failure warnings rather than silently promising persistence; full saved game/workspace export and restore; app-scoped data deletion; native share-sheet export handling; visible privacy and training boundaries; and larger coarse-pointer controls/labels. Malformed saved pack states now recover only the affected current case, retain other tracks, preserve the exact original profile in a recovery envelope, and display a notice. If the recovery copy cannot be saved, writes are blocked to avoid overwriting the original. Regressions cover 168 malformed cases across all 42 pack levels; see the independent QA report.

## Not verified

No Xcode is available in this Linux workspace. No iOS simulator compilation, signed IPA, physical-device run, VoiceOver inspection, native filesystem/share-sheet interaction, App Store validation, TestFlight, or App Review has occurred. The configured cloud workflow must be run in the owner's Codemagic account.

Browser UI automation was blocked by environment restrictions: Chromium failed to launch with `socket() Operation not permitted`. Therefore visual rendering and touch-layout changes remain unverified. The Windows PowerShell uploader was reviewed statically, not executed on Windows, and no repository was pushed from this task.

The existing 100-perspective review is explicitly simulated. It is not 100 people, a controlled study, measured learning gains, measured completion times, or proof of occupational competence. Real learner/pilot testing is still needed.

## Required acceptance run before release

1. Build simulator and signed-device versions in Codemagic/Xcode; resolve all compiler/signing warnings.
2. Cold launch in airplane mode. Complete, quit and resume each specialty. Test iPhone and iPad portrait/landscape.
3. Export and restore both game and earlier workspace progress through Files/Share; cancel each flow; simulate full/blocked storage; verify local deletion scope and recovery notices.
4. Test VoiceOver, keyboard, zoom/text sizes, reduced motion and sound-off settings.
5. Check navigation to About, notices, review, earlier workspace, all level maps and return paths.
6. Verify Swift resolved package versions, licenses and privacy report, App Store metadata, seller/support URLs and legal authorization.


## 22.2 guided path integration (11 Nov 2026)
- Added native default guided program and retained Worlds at `worlds.html`.
- Added 4/8/12/20-hour learning milestones and five-success automation link.
- `npm test`: passed, including guided-path structural test.
- `npm run check`: passed.
- `npm run ios:prepare`: not run in this container because npm dependencies are not installed and internet is disabled. The already-reviewed `dist/native.js` bundle was patched only to add the new storage key, and `dist/` was mirrored into `ios/App/App/public/`. Codemagic still runs `npm ci` and `npm run ios:prepare` before any build.
- No signed IPA/TestFlight/App Store submission was produced.


## 22.3 graduation ladder integration (11 Nov 2026)
- Replaced the 4/8/12/20 milestone ladder with 4-hour Graduate, 12-hour Advanced Graduate, and 24-hour Expert designations.
- Rebalanced core packets to about 40 minutes per function (8 packets × 5 minutes), plus a 40-minute integrated graduation challenge = 240-minute core target.
- Added progressively harder integrated challenges at 4, 12, and 24 hours.
- 12-hour designation requires three independent cases per fundamental, at least two worlds, and the advanced challenge.
- 24-hour Expert requires five independent cases per fundamental, at least three worlds, and the expert cross-function challenge.
- Expert is explicitly labeled as a Force Multiplier program designation, not official Air Force qualification or AMMOS equivalency.
