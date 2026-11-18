# Version 22.13.0 · MXMGR Learner Task Map
This build adds a front-facing five-column task map, 72 individually explorable original task entries, 12 marked working-group proposals, and direct links to the original 35 lessons, Academy, and advanced trainers. Earlier package documentation follows; consult BUILD_QC_22_13_0.txt for latest changes.

# Force Multiplier 22.12.0 — Fundamentals → Block Academy

This package is a complete GitHub/Codemagic source project, based on the working 22.11.0 app. `dist/index.html` now opens on an interactive **Fundamentals** dashboard instead of a technical requirements register. Each specialty provides seven sequenced lessons grounded in the 100 Skills Working Draft (20 original observable tasks per specialty). A guided lesson includes why the skill matters, process steps, a worked maintenance-management example, a decision check, and real links to existing practice.

To run a local browser preview, open `ForceMultiplier_Fundamentals_Offline.html` from the companion download; for development serve `dist/index.html` from a static web server. The project continues to use the `codemagic.yaml` iOS pipeline.

## Release smoke tests

`npm ci && npm test && npm run check && npm run ios:prepare && npm run ios:verify`

This is Codemagic-ready source, **not a signed iOS application**. Learner progress is stored locally and does not certify proficiency. The 100-skill document and FLUX notes are working inputs; see `docs/RELEASE_NOTES_22_12_0.md`.
