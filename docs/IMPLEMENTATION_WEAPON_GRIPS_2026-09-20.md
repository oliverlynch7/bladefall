# Weapon grips - September 20, 2026

Candidate release: 1.986.0-anatomical-weapon-grips. Implements VISUAL-REVIEW-03/04/05.

## Changes

Active weapon assets now have measured handle centers, consistent physical dimensions and explicit palm positions for each shared body. Shaft axes follow the closed fist. Large axes, hammers, claymores, scythes and javelins use a reachable support-hand grip. Procedural bone changes are restored before the next animation sample. Existing saved fit data remains intact as reference; active assets use the corrected profiles.

Javelin basic attack is a forward two-handed thrust. Charge release hides the in-hand model while the projectile is away. Bow string and draw hand move together. Pirate grips use the closed fist; its procedural firing and the javelin thrust use a looping idle carrier instead of clamping Idle as an attack clip. Co-op render snapshots carry charge, throw and swing state.

## Verification

- Real browser: 64 distinct active asset/body combinations, seven sampled poses each (448 checks), zero failures before final bow string addition.
- Dynamic bow follow-up: all 12 bow/body variants, 84 pose checks, zero failures.
- All 16 current classes: seven poses, 112 skinned right-hand containment checks, zero failures.
- Actual charged javelin projectile/release on Ranger, Ninja and Pirate: all pass; packet roundtrip preserves throw state and swing serial.
- Rendered Ranger peer: support contact error below 0.000001 rig meters; in-hand javelin hidden on release; no renderer error. This is controlled rendering, not live network play.
- Pirate and javelin procedural attack carrier remains looping at timeScale 1 after moving attack and stop.
- In-game screenshots reviewed: all asset/body ready-pose sheets, javelin ready/thrust/charge/release, Pirate aim/saber motion.
- Phone-width gallery (390px): 67 images, no horizontal overflow.
- JavaScript syntax: hero module, grip module and main inline script pass.

Regression scripts: scripts/qa-all-weapon-grips.cjs, scripts/qa-class-hand-containment.cjs, scripts/qa-javelin-twohand-release.cjs, existing scripts/qa-pirate-palm-grips.cjs. These mutate a dedicated local test save only.

These are sampled pose/contact tests, not a guarantee that every mesh surface avoids every intersection at every animation time. Combat balance and campaign content are unchanged by this release. Paladin gold and other class palettes from 1.985 remain.

## Previews

/3d/art-previews/weapons/ - weapon fits and javelin pose sheets.
/3d/art-previews/classes/ - class palettes and refreshed Pirate motion sheet.

Next main implementation remains canonical NPC dialogue/quest/journal, followed by Thomas/Mara and the expanded Briar campaign slice. The overall campaign overhaul is not complete.


## Production verification - September 20

50340a3 pushed to main. Cloudflare Pages deployment 476b3758-d7e6-417f-88d7-ba21577223eb succeeded. Production browser confirmed 1.986.0-anatomical-weapon-grips, renderer ready, no renderer error; weapon gallery returns HTTP 200 with Build 1.986. Private decision archive decision-archive/2026-09-20-weapon-grips contains 123 user-role messages, zero unparsed lines and valid source references.
