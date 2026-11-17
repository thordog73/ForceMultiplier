# Source notes — Force Multiplier 22.10.0

The single-root/single-click-router architecture from 22.9.x is preserved. `dist/index.html` loads `fm2290-model.js`, then offline Academy model/controller, then `fm2290.js`.

New logic is isolated in `dist/block-academy-model.js` (deterministic challenge generation/validation), `dist/block-academy.js` (render, keyboard/tap/pointer drag interaction, progress/flashcards, launch animation orchestration), and `dist/block-academy.css` (mobile responsive game visuals).

The original five trainer implementations in `dist/fm2290.js` are preserved and `fm2290.js` routes to the Academy and Flashcards. User progress uses the existing localStorage key so existing application progress stays available after updating the app. A new installation lands on Academy Home.

Scheduling capstone in `dist/fm2290.js` and primitive models in `dist/fm2290-model.js` are unchanged except for the initial routing default. The 24-aircraft, 90-day, 12-Turn-10 execution, changing Phase Flow, deterministic NMC/planned downtime, risk scoring and FHP output remain available.

`dist` and `ios/App/App/public` must contain identical app assets for direct local inspection; Codemagic `ios:prepare` runs the authoritative Capacitor sync.
