# Force Multiplier 22.6.1 — Lockup stress test

Release hardening after 22.6.0. The 20-metric Analysis acquisition + Gold Rat loop was exercised for 20 complete resets on desktop and 20 complete resets at phone viewport size (2,383 screen renders per run) with no page errors or stuck state.

A reproducible lockup risk was found in outcome animations: repeated Execute/Show Outcome taps started overlapping timer groups. 100 rapid Scheduling Execute taps created 300 pending timers. 22.6.1 makes outcome animation timers single-flight: a restart cancels the prior sequence, and any render/navigation cancels stale timers.
