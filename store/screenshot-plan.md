# App Store screenshots

Capture real gameplay from the final native build. Browser QA captures and generated marketing mockups are not substitutes for screenshots of the installed iPhone/iPad app.

## Formats and device slots

Checked November 11, 2026 against Apple's live [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications). The page now identifies a medium Dynamic Island iPhone display as required; older 6.9-inch-only checklists are insufficient.

| Set | Accepted portrait pixels | Landscape pixels |
| --- | --- | --- |
| Required: iPhone, Dynamic Island, medium | 1179 × 2556 or 1206 × 2622 | Reverse portrait dimensions |
| Required when supporting iPad: 13-inch iPad | 2064 × 2752 or 2048 × 2732 | Reverse portrait dimensions |
| Useful additional set: large Dynamic Island iPhone | 1320 × 2868, 1290 × 2796, or 1260 × 2736 | Reverse portrait dimensions |

Supply 1–10 images per device size, as PNG or JPEG, with no transparency. Recheck the live App Store Connect slots at upload because device requirements can change. Use a matching simulator/device instead of stretching a browser image.

## Suggested five-screen story

| Order | Actual screen to capture | Optional short caption |
| --- | --- | --- |
| 1 | Airline / Scheduling first level, six aircraft selected | Start with one decision |
| 2 | Later Scheduling checkerboard with work and flights visible | Build a plan that works |
| 3 | Analysis level with a chart and an answer to choose | Find meaning in the numbers |
| 4 | Data Integrity challenge with a visible record discrepancy | Spot it. Trace it. Fix it. |
| 5 | World or specialty chooser | Five skills. Four worlds. |

Use the real UI and fictional data. Avoid reviewer names, personal notes, debug messages, developer-console overlays, device notifications, or draft text. Do not add unsupported claims about qualification or learning speed. Keep the first image focused on gameplay, not a splash screen.

## Capture on a Mac

1. Build and install the current project using the repository's simulator workflow.
2. Choose a simulator whose pixel dimensions match the desired slot. Open the app and reach each screen normally through the level picker.
3. Save a native screenshot from Simulator, or use `xcrun simctl io booted screenshot path/to/screenshot.png` when the intended simulator is the only booted target. With more than one booted device, pass the selected simulator's actual identifier instead of `booted`.
4. Inspect the full-resolution result for clipped controls, unreadable text, incorrect orientation, and transparent pixels. Keep an unedited original.
5. Repeat for the required iPad display and any additional iPhone set. Review both portrait and landscape gameplay even if only one orientation is used in the listing.

No native screenshots have been claimed as completed by this preparation document.
