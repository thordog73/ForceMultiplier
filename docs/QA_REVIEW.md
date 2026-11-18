# Force Multiplier: independent source and simulated-persona review

Baseline: Site version 4, commit ac6d3c1c1ca634afefb9096498a42d430bb4323c. Source: force-multiplier-source/.sites-checkout. Live identity: https://force-multiplier-v22.fredesser.chatgpt.site

This is source-based analysis through hypothetical user perspectives, not interviews or testing by recruited people. No learning-effectiveness, speed, accessibility conformance, or real-world job-competence claim is established.

## Verified execution

Independently reran all seven existing Node suites. All passed: scheduling 32,052 assertions across 1,300 seeded cases; analysis 6,670; database 4,301; documentation 6,040; integrity 2,021; shell 225. Legacy workspace integration passed for 43 lessons, model solutions, blank guards, backup roundtrip/malformed guards, statistical reference checks, and presence of offline assets. These are deterministic model tests, not simultaneous-user server load tests or visual/browser tests.

Added independent malformed-state probe without altering application. Valid saved database and integrity profiles with current.state.play replaced by {} crash startup rendering. Database: Cannot read properties of undefined (reading 'a'). Integrity: Cannot read properties of undefined (reading 'includes'). Reproducer: corrupt.cjs in this review folder.

Actual Chromium rendering was attempted but environment prevents socket creation even in an approved escalated launch. Therefore no screenshots, real mobile rendering, browser action completion, VoiceOver or on-device results are claimed.

## Prioritized findings

1. P1, verified: malformed saved game can prevent startup. Validate pack-specific state before render, recover only the damaged track with an explanatory notice, preserve other progress and original corrupt record, regression-test each pack/level.
2. P1, source: persist() catches all storage failures silently; menu promises the game saves on-device. Show persistent unsaved state and retry/export capability when storage fails. Test blocked storage and quota exhaustion.
3. P1, source: main Worlds game has no portable export/restore controls. Earlier practice workspace has a separate backup system, not a substitute for main-game progress. Provide versioned full-world backup and schema-validated restore. Explicitly explain browser/native-app separation and uninstall risks.
4. P2, source: mobile status text reaches 7px; compact day controls are 25 by 26px and day arrows 29 by 29px. Enlarge touch areas and critical status labels. Validate at 320/390px and with large text before release; this is not a claim that all content currently overflows.
5. P2, curriculum: 55 short levels teach fundamentals, but they do not establish operational proficiency. Four worlds mainly recontextualize the same rules. Use original unseen transfer scenarios and authentic work-product reviews for the first learner pilot.
6. Product scope: main scheduling culminates in a two-week checkerboard. The legacy 90-day model is weekly allocation. Neither is the full 72-aircraft daily military capstone originally discussed. Present this release as generic practical-skills training unless the user chooses the larger operational rebuild.

## Ten hypothetical learner and reviewer lenses

- New scheduling learner: immediate Pick 6 action is a strong low-reading entry. Risk: stars can feel equivalent to proficiency. Explain feedback meaning briefly and retain unassisted transfer check.
- Experienced maintenance scheduler: alternative valid plans are correctly accepted by model tests. Missing true 72-aircraft, three-AMU, resource/ETIC/FHP operational environment means this is foundation practice, not operational qualification.
- Analysis learner with weak numeracy: practical denominators and pooled groups are good progression. Pilot whether the learner can explain the denominator without following hints or memorizing fixed patterns.
- Documentation specialist: prerequisites, revisions and evidence are represented. A real SME must check terminology and authentic end-to-end work-product fidelity before occupational marketing.
- Database administrator: least privilege and recovery fundamentals are useful. This is a game, not execution on a real database; measure ability to transfer to safe sandbox work separately.
- Data-quality analyst: reconcile-to-source and unknowns are appropriate. Corrupt-save launch bug is particularly incongruent with this discipline and should be fixed before release.
- One-handed phone player: tap-to-place avoids requiring drag interaction. Tiny day controls and status text require actual iPhone touch/large-text validation.
- Keyboard/screen-reader user: many explicit labels, focus management and dialogs are present. Do not infer accessibility conformance from markup; run real keyboard flow and VoiceOver checks.
- Interrupted learner returning later: separate world/specialty progress and unfinished-case preservation passed existing tests. Silent save failures and lack of portable backup are the principal risks.
- Instructor comparing performance: demo exposure is separated from independent stars, a meaningful safeguard. Stars and self-entered reviews are not authenticated assessment; collect blinded rubric scores on unseen cases and report assistance separately.

## Suggested human acceptance pilot

Recruit a small varied first group including novices, experienced practitioners, instructors and assistive-technology users. Observe one unassisted level per specialty, a harder unfamiliar case, save/relaunch, world switch, and recovery. Record task completion, hints, errors, abandonment, product correctness and post-task explanations. Do not invent time benchmarks; establish them from actual observations. Have maintenance SMEs review the model assumptions separately from usability. Keep fictional timing/cure assumptions visibly distinct from approved maintenance guidance.

## Native candidate follow-up

The native candidate now validates required nested pack-state structure and attempts render/meter evaluation before accepting a restored case. A damaged current case restarts without discarding other tracks. Its original profile is retained as a JSON recovery envelope in local storage and included in the native backup. If preserving that envelope fails, further writes are blocked to protect the original. A recovery notice is emitted. Added 168 malformed-save cases over all 42 non-scheduling levels; all pass, bringing shell assertions to 897. This addresses finding 1 for the tested malformed states; it does not claim exhaustive fuzz coverage. Native engineering separately added backup and storage-failure controls and larger touch targets; actual iPhone validation remains outstanding.
