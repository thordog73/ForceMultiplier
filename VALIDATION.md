# Version 22 app preparation checks

Checked November 11, 2026. This record describes the source package in this folder. It distinguishes browser/source validation from compilation and testing on Apple platforms.

## Completed

`npm run ios:sync`, `npm test`, and `npm run verify` completed successfully on the preparation host. Capacitor copied/configured the iOS project but correctly reported that CocoaPods and Xcode operations could not run on Linux.

The final root validation reran `npm test` and `npm run verify` successfully after the recovery fixes and native source sync.

| Check | Result |
| --- | --- |
| Scheduling | 13 levels, 1,300 seeded models, 32,052 assertions passed |
| Analysis | 12 levels across 20 seeds, 6,670 assertions and action paths passed |
| Documentation | 10 levels, 6,040 assertions passed |
| Database Management | 10 levels, varied capstones and restore cases, 4,301 assertions passed |
| Data Integrity | 10 levels, 2,021 assertions passed |
| World/skill shell | Migration, independent progress, routing, undo, assistance and carry-over: 225 assertions passed |
| Game backup validation | All 55 levels, four worlds, two generator revisions, initial/solved states, invalid input guards: 893 checks passed |
| Device UI recovery | Save failures, retry, navigation guard, reset and scoped deletion: 38 checks passed |
| App startup | Native hydration gating and browser fallback: 15 checks passed |
| Practice workspace | 43 exercise models, blank guards, backup round-trip, malformed backups, statistical reference and offline assets passed |
| Native adapter/build numbering | 14 focused tests passed |
| Xcode source configuration | Project parsed; custom Swift sources, resources, scene controller, storyboard, scheme and manifests linked |
| Bundled resources | Six HTML pages and 28 referenced local assets verified; temporary QA page removed |
| Native resource copy | Every source web file matched the copied native `public` file after final sync |
| App icon | 1024 × 1024, RGB with no alpha channel |
| Build scripts | Shell syntax, Python compilation, YAML and XML/plist parsing passed |
| Store copy | Name, subtitle, promotional text, description and keywords fit the checked Apple field limits |

The counted game/web suites total 52,255 assertions/checks, plus the uncounted workspace validation and 14 focused native/build-number tests. These counts describe automated cases, not human playtest participants or measured educational effectiveness.

## Browser checks completed

The actual game was inspected using the browser UI. Responsive checks used a temporary iframe at 390 × 844, 844 × 390, and 820 × 1180 CSS pixels. These were browser layout checks, not iOS simulator runs.

- Completed the six-aircraft/four-aircraft scheduling sequence and observed its three-star result.
- Checked scoring/results in Analysis, Documentation, Database Management, and Data Integrity.
- Switched worlds and specialties and verified progress remained after reload.
- Inspected phone portrait, phone landscape and tablet layouts. A measured landscape page had no page-level horizontal overflow; the checkerboard retains its own intentional horizontal scroll.
- Opened the practice workspace and ran the statistics lab's sample comparison, obtaining means 3 and 4 and a mean difference of 1.
- Exported a real game JSON backup through the browser UI; parsed its supported format/version and 10 saved synthetic test tracks.
- The browser file-chooser automation failed with a protocol/node error during import, so an interactive browser import is **not** recorded as passed. Import schema and model restoration checks passed automatically. Native Files picker behavior remains part of device validation.

The test iframe and downloaded test backup are not included in the shipped game/source ZIP. Browser screenshots are not represented as App Store screenshots.

## Published companion pages

The existing public Site was updated to version 5 from commit `c8b2a2045393437942d73563c931f7e692dfe6e3`. Publication succeeded, and these pages were opened and checked without an account prompt:

- https://force-multiplier-v22.fredesser.chatgpt.site/support
- https://force-multiplier-v22.fredesser.chatgpt.site/privacy
- https://force-multiplier-v22.fredesser.chatgpt.site/about

Their `.html` URLs also route to these canonical public URLs. The installed app uses local `.html` copies so these pages remain available offline.

## Still to run with Apple/Codemagic access

Native compilation, simulator execution, actual iPhone/iPad installation, signing, IPA export, App Store upload, TestFlight checks and Apple review have **not** run in this preparation session. No signed `.ipa` or native screenshots are included.

Use the unsigned Codemagic workflow first, inspect its real launch screenshots, then configure the actual app ID/signing and run the signed workflow. Test offline launch, safe areas/rotation, text and accessibility, force-quit/relaunch, file sharing/import/cancel, copy, print and reset in the compiled app. Instructions and an optional upload-only Codemagic configuration are in `NATIVE-BUILD.md`.

The provisional bundle identifier and inherited Apple integration name must be matched to the creator's real Apple account. Their presence in source does not establish registration, access or ownership.
