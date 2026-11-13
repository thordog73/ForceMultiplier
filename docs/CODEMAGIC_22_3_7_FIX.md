# Force Multiplier 22.3.7 Codemagic generated-asset verification fix

The previous ios:verify test required byte-for-byte equality between source web assets and Capacitor-generated iOS assets. That can create false failures after native synchronization.

22.3.7 verifies the generated iOS bundle functionally instead:
- required public assets exist and are non-empty;
- generated index.html contains the Force Multiplier Guided Program entry point and 4/12/24-hour progression;
- Worlds practice link is present;
- the generated native bridge bundle is present.

The Codemagic order remains: npm ci -> source tests/checks -> ios:prepare -> ios:verify -> sign -> build IPA -> upload to TestFlight.
