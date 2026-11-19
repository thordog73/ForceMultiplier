# 22.16.0 source changes

Active-game renderers and undo / paging controls: `dist/block-academy.js`.
Responsive play layout: `dist/academy-focus.css`.
Full-screen shell integration and focus preservation: `dist/fm2290.js`.
Persistent Academy challenge-mode gate: `dist/teaching.js`.
Cache revision and required style asset: `dist/sw.js`, `dist/index.html`.

The source models are unchanged. Persistent application data still uses `forceMultiplier2292`. Progress stays within the browser/origin that holds it; a downloaded file, a new website origin and TestFlight do not automatically share storage. No account or remote synchronization was added.

Historical release and visual audit documents in this package describe their named older versions. Current validation limitations are in README.md.
