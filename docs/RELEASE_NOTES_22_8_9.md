# Force Multiplier 22.8.9 — Mobile Zoom + Stress Hardening

- Pinch zoom remains enabled (1×–5×).
- Added 1× Reset View in Practice Controls and a contextual Reset Zoom control when the viewport is enlarged.
- Added fallback reload prompt if a WebView refuses the first programmatic reset.
- Set mobile inputs/selects/textareas to 16px to prevent iOS focus auto-zoom.
- Fixed runtime startup-order/module-scope defects exposed by headless Chromium.
- Enlarged dense phone touch targets, including Scheduling mode buttons and Documentation calendar cells.
- Preserved local horizontal scrolling for wide boards with zero document-level overflow in tested phone widths.
- Browser torture pass: 320/375/390/430/768 px; 100 Scheduling Next actions; 125 Analysis transitions; repeated Show Me/check/sound actions; Phase 23→15→7→0; Documentation, Data Integrity and DBM navigation; no JavaScript page errors.
