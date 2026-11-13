# Force Multiplier 22.7.0 — Scheduling, Analysis & Documentation workflow upgrade

## Scheduling

- Refocused the core progression on FHP → long-range planning → monthly scheduling → weekly scheduling → Phase flow.
- Added explicit planning-horizon inheritance so weekly maintenance work explains where it came from.
- Enlarged and color-differentiated aircraft status labels while preserving words as the primary cue.
- Corrected spare behavior so tapping the selected spare removes it; incorrect checks remain editable and can be corrected without resetting.
- Rebuilt modification teaching with visible fictional RED-front and GREEN-rear aircraft changes.
- Each supplied modification uses two workdays plus one 24-hour cure. The compatible-work exercise preserves both work packages and removes only the duplicated final cure when the supplied scenario authorizes a shared cure.

## Analysis

- All 20 metric cards are direct-entry buttons.
- Calculator is now an on-demand button next to each result input and can be closed without leaving the metric.
- Enlarged metric interpretation controls/text for phone use.
- Added a directly accessible Statistical Analysis Lab immediately after Improvement Laboratory on the Analysis hub.
- The guide begins with Trend / Correlation / Difference, then Nominal / Ordinal / Interval / Ratio, and routes into the existing Fishbone Test Builder (for example Trend → Kendall/Mann–Kendall, ordinal correlation → Spearman, continuous correlation → Pearson, categorical association → chi-square).

## Documentation

- Level 1 now begins with a tangible aircraft modification rollout: A/C 001 → 021 → 014 → 033.
- The learner sees the aircraft changes before moving into source, applicability, evidence, status, approval and closeout concepts.
- Level 14 includes a deliberately fictional “Lamborghini Diablo package” exception: installed tires do not make an incomplete modification complete; the requirement remains open and any accepted incomplete condition must follow the organization’s authorized documented exception/approval process.

## Lockup / regression testing

- Retains 22.6.1 single-flight outcome timer cancellation.
- Existing Node regression suite passes.
- Added 22.7 static regression coverage for the new flows and timer guards.
- Performed a headless Chromium mobile-viewport interaction pass covering: all Analysis entry points, calculator open/close, statistics guide → Fishbone return, spare select/remove, wrong-answer correction, all new Scheduling horizon screens, Documentation rollout correction, incomplete-modification scenario, 25 rapid Execute presses, re-simulation timer cancellation, and rapid navigation/re-render cycles.

This remains a fictional training simulation and does not replace governing instructions, technical data, or organizational qualification/authorization processes.
