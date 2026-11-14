# Source notes — 22.9.1 clean rebuild

The 22.9.1 learner surface keeps the clean single-router architecture and adds deeper Analysis/Documentation simulations without reintroducing legacy render overrides.

Primary runtime files:
- `dist/index.html`
- `dist/fm2290-model.js`
- `dist/fm2290.js`
- `dist/fm2290.css`
- `dist/native.js`

Architecture:
- one root render path
- one root click router
- one persisted state model
- no legacy `app.js`, `game.js`, `analysis.js`, or `scheduling.js` loaded by the new index

Legacy packs remain available for model regression coverage and reference.
