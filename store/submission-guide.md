# App Store submission material

Prepared November 11, 2026 for Force Multiplier v22. This directory contains project release material, not evidence that Apple has accepted a build.

## Ready to use

| App Store field | Prepared material |
| --- | --- |
| Name | Force Multiplier: Skills |
| Subtitle | Play. Plan. Solve. |
| Description | `description.txt` |
| Promotional text | `promotional-text.txt` |
| Keywords | `keywords.txt` |
| Review notes | `review-notes.txt` |
| First-release description | `what-is-new.txt` (use only if a field is offered) |
| Structured metadata | `app-store-metadata.json` |
| Privacy questionnaire rationale | `privacy-answers.md` |
| Screenshots | Capture plan in `screenshot-plan.md`; actual native captures still needed |

Recommended primary category: **Education**. Recommended secondary category: **Games**, with Puzzle and Simulation where applicable. Choose the category combination offered by App Store Connect that accurately reflects the final app. These recommendations have not been saved in an Apple account.

The source curriculum is v22 and the intended native marketing version is **22.0.0**. Select a new build number for each CI upload and keep the App Store version consistent with the final Xcode archive. Native configuration replaces the generated project's template version before building.

The name, subtitle, promotional text, keywords, and description have been written within Apple's field limits. See the official [app information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) and [platform-version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) references. Name availability is determined when the record is created.

## Public pages and contact

These same pages are published and bundled in the app. They were opened and verified without signing in on November 11, 2026:

- [Support](https://force-multiplier-v22.fredesser.chatgpt.site/support)
- [Privacy](https://force-multiplier-v22.fredesser.chatgpt.site/privacy)
- [About](https://force-multiplier-v22.fredesser.chatgpt.site/about)

The public support address is **fredesser@yahoo.com**. It is already published on Fred Esser's [1600 Standard developer website](https://1600standard.blogspot.com/2026/10/about-1600-standard.html), reached through that app's official [App Store listing](https://apps.apple.com/ie/app/1600-standard/id6804462278). The pages offer working mail links and local self-service help. They do not contain a fake contact form or an invented address.

Apple's [review guidance](https://developer.apple.com/app-store/review/) calls for functional support and privacy links. A public support email is separate from the private name, email, and telephone fields for Apple's review contact; enter an actual person able to answer review questions.

## Complete the Apple account setup

1. Use the creator's Apple Developer team. No Force Multiplier team identifier or signing credentials were verified while preparing this package.
2. Verify or register the bundle identifier. The source currently uses **com.fredesser.forcemultiplier** as a candidate; it is not evidence of ownership or an existing app record.
3. Create the iOS app record in App Store Connect with the matching bundle ID. The candidate internal SKU is `FM-SKILLS-IOS-2026`. Record the actual numeric Apple app ID; do not substitute the bundle ID for it.
4. Set the price and availability. The app currently contains no payment, subscription, or in-app purchase implementation. No price has been chosen here.
5. Complete App Store Connect's applicable account, content-rights, export-compliance, regional, age-rating, and privacy questions from the actual app and the creator's circumstances. The package does not make those account declarations on the creator's behalf.

## Build, test, and attach the build

Use the repository's build instructions on a Mac or a configured macOS CI runner. Apple currently requires uploads built with **Xcode 26 or later and the iOS/iPadOS 26 SDK**. The app's lower deployment target is a different setting; it does not replace this SDK requirement. [Apple's SDK requirement](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)

The minimum deployment target is **iOS/iPadOS 15.4**, which supports the native HTML dialogs used by the game and workspace. Earlier iOS 15 minor versions do not support those dialogs. [WebKit's Safari 15.4 release details](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/)

Before uploading the archive, check the actual installed app on iPhone and iPad:

- A clean launch starts the first game without internet or login.
- All five specialties and all four worlds work, including a later checkerboard and an Analysis chart.
- Completed levels and unfinished challenges survive closing and reopening. Main-game backup/import/reset controls are under **Menu → Saved data**; practice-workspace backups are separate, under its **Settings**. Confirm each restore changes only the intended scope.
- Native file sharing and import open and cancel correctly. Copy and print work where the device supports them.
- About, Help, and Privacy open locally; their back links return to the game. Email links open the system mail workflow.
- Portrait/landscape layouts, scrolling, safe areas, touch targets, and core accessibility controls remain usable.

Capture screenshots from this actual build using `screenshot-plan.md`. Upload the signed archive through the creator's configured workflow, wait for Apple processing, then select that build in the app version. A generated Xcode project, passing web tests, or browser screenshots do not establish native build success.

Paste the prepared metadata and review notes only after confirming they match the shipped build. Use a manual release option if the creator wants to control when an approved version becomes public.

## Review positioning

The app offers 55 interactive levels, multiple skills and contexts, generated cases, feedback, local progress, and native document actions. Those are its functional reasons to exist as an app. Apple's [guideline 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) expects substantive app functionality; adding a wrapper alone would not establish that. The reviewer decides whether the submitted experience meets the guidelines.

Describe the app as fictional practice. Do not claim occupational certification, official military or airline endorsement, legal clearance, proven four-hour proficiency, a tenfold learning improvement, or testing by 100 human reviewers. The separate simulated-perspectives artifact is AI-generated design feedback. No AI model runs in this app.

This package does not establish ownership of the name, employer-related rights, or rights to any future added material. Keep the store's rights declarations grounded in the actual material included and the creator's knowledge.

## Remaining release facts

At preparation time, these were not verified: the Force Multiplier App Store record, bundle registration, signing team and profile, successful Xcode build/archive, installed-device results, native screenshots, or Apple's approval. The app source, release copy, support contact, and source-linked submission guidance are prepared so those steps can proceed concretely.
