# Force Multiplier: release and legal readiness review

Reviewed 11 November 2026. Preparation checklist, not legal advice or a representation of Apple approval.

## Evidence and scope

Reviewed restored Site version 4, source commit `ac6d3c1c1ca634afefb9096498a42d430bb4323c`, including `dist/` and README. This is the 55-level game with Scheduling, Analysis, Documentation, Database Management and Data Integrity across four fictional worlds. Earlier v22 monolith was also inspected but is not the release baseline. No signed iOS binary or developer-account settings were available for this review.

Static inspection found localStorage persistence and a same-origin service-worker cache/network fallback. No external analytics URLs or fetch/XHR/WebSocket calls for third-party collection were found in application source. This is not a complete runtime privacy/security audit. Native wrapper dependencies and final runtime traffic must be checked separately. Hosted websites may process server logs independently of the bundled app.

README explicitly identifies fictional data, generic aircraft, exercise-only timing assumptions, original plain-language content and game scores that are not professional certification. The 100-perspective review is labeled simulated, not human testing. Source statements do not independently establish provenance or ownership.

## Release gates

1. **Apple completion and rights.** Apple's review rules require a complete, stable app, working URLs and accurate metadata. Maintain substantial offline interactive utility, rather than a website shell. Provide accessible in-app privacy information and an App Store privacy-policy URL. Supply functioning support contact information, accurate privacy disclosures and rights to every included asset. Conduct actual device testing before describing the app as release-ready. Apple alone decides acceptance. [1]
2. **Owner/public-release authority.** Establish whether the code/content were developed independently, under official duties, under contract or using restricted materials. Where applicable, obtain the appropriate organizational security/public-release and ethics review before commercial release. A disclaimer, synthetic scenario, or absence of a classification marking does not establish clearance. Do not include real operational readiness, personnel, credentials, controlled technical references or export-controlled information. DOPSR describes review obligations for material potentially derived from protected information acquired through government service. [2]
3. **IP and marks.** Keep an asset and dependency license inventory. Confirm authority over code, text, diagrams, sounds and branding. Section 105's government-work copyright rule does not make every government-hosted or contractor-authored item free to reuse, and copyright status does not resolve release restrictions. [3] Do not use military seals or protected insignia to imply affiliation; Air Force trademark guidance restricts implied commercial endorsement. [4] No military insignia was identified by the text/source scan; visual review of all final assets remains necessary.
4. **Training accuracy and safety.** Use a persistent route to this notice: “Independent educational simulator. Scenarios and data are fictional. Not operational maintenance instructions, an authorization system, or professional certification. Not affiliated with or endorsed by a military service or government agency.” Actual aircraft maintenance follows approved procedures and qualified supervision. Obtain subject-matter review before claiming occupational validity.
5. **Privacy and local data.** Add plain-language explanation of saved progress, preferences and free-text notes; storage location; reset/deletion; backup exports/imports; and lack of cross-device sync. Explain that exported files leave app storage and must be managed by the user. Warn against entering real personnel, sensitive or operational information. Do not claim that no data are collected until the final native build and its dependencies are assessed. Confirm backup/restore and reset actually work on iOS.
6. **Honest testing and marketing.** Describe automated checks, simulated users and actual recruited users separately. Do not claim measured learning improvements, certification, official approval or superior outcomes from simulated evaluations. Website review files containing development criticisms are not a substitute for device QA and need not ship inside the consumer bundle.
7. **Submission prerequisites.** Verify seller identity, bundle ID, signing/provisioning, App Store Connect access, Codemagic configuration, privacy/support URLs, age rating, content rights, export-compliance answers and truthful screenshots. A configured build/upload button still depends on authorized credentials and successful signing/build. Upload is distinct from Apple review and public release. Do not accept agreements or submit on behalf of the owner without the required authorization.

## Outstanding owner facts

- Is this independent personal work, official-duty work, contract work, or a mixture? Have any required release reviews already been completed?
- Which person/company owns the app and will be the App Store seller? Are all rights and licenses documented?
- What verified support contact and public privacy-policy URL should be used?
- Which Apple developer account and Codemagic team are authorized for signing and upload?

These questions need not prevent preparation of the unsigned package, code tests and documentation. They do prevent an unconditional claim that the app is legally cleared and ready for public distribution.

## Sources

[1] Apple App Review Guidelines, sections 1.5, 2.1, 2.3, 4.2, 5.1.1 and 5.2: https://developer.apple.com/app-store/review/guidelines/

[2] Defense Office of Prepublication and Security Review, Prepublication and Manuscripts (official search-indexed guidance; direct page returned HTTP 403 during review): https://www.esd.whs.mil/Records-Declass/Security-Review/PrePublication-and-Manuscripts/ ; related official submission guidance: https://www.esd.whs.mil/DOPSR/Defense/

[3] 17 U.S.C. 105, Government Publishing Office: https://www.govinfo.gov/content/pkg/USCODE-2024-title17/html/USCODE-2024-title17-chap1-sec105.htm

[4] Department of the Air Force trademark program, Air Force Symbol and branding guidance (official search-indexed guidance; direct symbol page returned HTTP 403): https://www.trademark.af.mil/Air-Force/The-Air-Force-Symbol/ ; https://www.trademark.af.mil/Branding/

## Native-package source follow-up

The release candidate now includes accessible About/privacy/training notices, a full saved-progress backup, restore and deletion controls, and a privacy manifest declaring file timestamps (C617.1) and app-scoped UserDefaults (CA92.1), no tracking and no declared data collection. Listed runtime dependencies are Capacitor Core/iOS, Filesystem and Share, with no analytics SDK listed. Temporary exported cache-file cleanup is attempted after sharing; failures may leave cache files. These source changes address the identified disclosure gaps, but do not replace runtime inspection of the resolved Swift packages and final signed binary. Public support/privacy URLs, ownership/public-release authority, actual device testing and Apple acceptance remain gates.
