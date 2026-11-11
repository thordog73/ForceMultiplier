# Privacy and content declarations

Prepared November 11, 2026. These are evidence-based answers for the current source. Reconcile them with the final archive and any account-side services before saving the App Store declarations.

## Recommended app privacy answer

**Candidate answer: Data Not Collected for the bundled iOS app.** This is supported by the inspected app and plugin code, rather than inferred from the absence of a sign-in screen. Apple treats data confined to device processing differently from data transmitted for developer or partner access. Its [App Privacy Details guidance](https://developer.apple.com/app-store/app-privacy-details/) defines collection and exceptions; the final developer response must cover integrated partners too.

This answer does not mean the app stores nothing, that user-directed sharing never leaves the device, or that the separate public website receives no technical requests.

## Inspected implementation

| Component | Actual use | Collection implication |
| --- | --- | --- |
| Bundled HTML/CSS/JavaScript | Fictional exercises, scoring, generated cases, settings | No gameplay upload or live model call |
| Browser localStorage | Game progress plus earlier-workspace entries | On-device storage; the web version uses its own browser storage |
| Capacitor Preferences 8.0.1 | Mirrored local progress in UserDefaults | Local persistence; device backups may include it |
| Capacitor Haptics 8.0.2 | Device feedback after actions | No remote service |
| Capacitor core / iOS 8.6.0 | Native bridge and bundled WebKit presentation | Generic networking capabilities are present in the framework; application code does not invoke a remote game service |
| Custom FMFiles plugin | User-selected file import, temporary export, system share sheet, clipboard, and printing | User chooses destination; no automatic developer copy |
| Help mail links | Opens user's mail workflow | Sending is optional and under user control; support correspondence is disclosed in the policy |

Primary inspected files: `package.json`, `capacitor.config.json`, `native/bridge.mjs`, `native/progress-store.mjs`, `native/ios/FMFilesPlugin.swift`, `native/ios/PrivacyInfo.xcprivacy`, and game/workspace storage code. The final release should be checked after native sync, not assumed identical to this source inventory.

The native clipboard action sets `localOnly` to avoid automatic Universal Clipboard handoff. The document picker may display a user's cloud file providers. AirPrint and other sharing destinations can transmit the selected work. Those facts are explained to users; do not market the app as one where data can never leave a device.

## Locally stored user content

The older practice workspace allows notes, explanations, work products, reviewer names, and reviewer comments. They are self-entered local entries, not authenticated employer records or a remote reviewer account. A saved workspace or evidence export may include them. Their existence alone is not proof of off-device collection.

Main-game backup exports and the older workspace's backup exports are separate. The main backup includes stars, settings, and unfinished challenges; the workspace backup includes its exercise entries and work products. **Menu → Saved data → Reset all progress** clears the current game key, legacy game migration key, and practice-workspace key, including mirrored native copies. The workspace's **Settings → Reset this workspace** affects only its own entries. Reset does not delete exported files, sent copies, printouts, or OS backups.

## Privacy manifest

The app manifest declares no tracking and no collected data types. It declares UserDefaults access with required reason **CA92.1** for the app's own local persistence. A privacy manifest is separate from the App Store privacy questionnaire and cannot replace it. The native dependency manifests must remain present in the archive.

No location, camera, microphone, contact-list, advertising-ID, photo-library, or broad storage permission is requested for the present feature set. Choosing a file through the system picker is scoped user access.

## Distinctions to preserve when publishing

- **Installed offline app:** Bundled pages and exercises do not need a host connection. No analytics, ads, remote crash SDK, cloud learner service, account service, or live AI model is integrated.
- **Hosted website:** Hosting services necessarily handle delivery/security information such as an IP address and page request. The app privacy recommendation does not certify the host's entire data practice.
- **Optional support email:** The developer receives what the user sends. If a future support form, automatic diagnostics, or in-app transmission is added, reassess the label. Do not assume every optional support feature meets Apple's optional-disclosure criteria.
- **Apple services:** Store downloads, device backups, and Apple-controlled diagnostics have their own handling. Any separate developer use of data obtained from Apple services must also be considered. No developer ingestion of Apple user-level diagnostics or analytics was verified here.

Before saving the label, verify the final archive has no added telemetry or remote content and that actual support/diagnostics practices match this document. Use [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) to enter the result. Keep the public policy and declaration current if practices change.

## Age-rating worksheet

The live App Store Connect questionnaire determines the actual regional rating; none has been issued for this app. [Apple's age-rating workflow](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating)

The inspected content is general educational puzzle play. Expected answers for this implementation are no violence, sexual content, drugs, gambling or loot boxes, advertising, public messaging, unrestricted web browsing, or medical-treatment advice. User-entered local notes and the operating-system share sheet do not create an in-app public community. There are no prizes of value and no competitive multiplayer service. Answer the precise current questionnaire wording from the final feature set.

Recommendation: general audience education, without selecting **Made for Kids** merely because one world features cats. Do not put a guessed Apple age badge on the website or claim that a content rating validates professional suitability.

## Accessibility declarations

The source includes touch controls, keyboard focus treatment, semantic labels, and reduced-motion handling. Public App Store accessibility claims should be based on checking the installed app with the relevant device features. Do not mark every accessibility option supported based solely on HTML attributes or browser tests.
