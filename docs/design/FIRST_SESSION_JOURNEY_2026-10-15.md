# Continuous first-session verification

Baseline: 1cfb5534 / v2.200.0. User approval: "OK try that out" for the proposed complete new-player journey and fixes exposed by it.

Use a fresh localhost origin and ordinary UI controls to create one starter character, complete the control lessons and six-enemy tutorial, enter the hub, follow Briar's main journey through both halves and fight the Brute. Keep normal health, issued/earned equipment, enemies, collision, rewards and simulation time. Do not substitute teleports, killed-enemy flags or inflated stats for completion. Document deaths and retries. Read-only local diagnostics may show state and timing; any later staged regression must be labeled separately.

Inspect objective/HUD legibility, instructions, earned skills, bag/equipment, actual puzzle consequences, safe returns and save/continue along the journey. Inspect source when a specific failure occurs, write the fix rationale here before editing, then reproduce the failed path. Preserve story, authored difficulty and full map scale. No custom SFX or unrelated companion/rig changes.

Sample frame timing in the available browser, distinguishing background scheduling, first-load compilation and hardware limits from reproducible code bottlenecks. Focused local co-op checks should cover any shared code changed; earlier local relays are not Internet-session evidence. Source-level checks and automated play do not prove novice comprehension, pacing or fun.

Capture the baseline save before product changes. Verify legacy loading, relevant regressions and rendered interactions before versioning and publishing. Remove only the owned local test resources afterward.

## Observed defects and bounded fixes

The continuous run completed the tutorial, hub tour, genuine reload, Mara's delivery, physical mill crate/sluice/wheel/bridge, bridge guards and ground signal route. Two normal Brute attempts ended in death; retry and return retained level 2, rank 3, both chosen upgrades and 270 gold. Boss victory has not been established. The store return window is traversable using its interior step; the early failed approaches were tester navigation mistakes, not a demonstrated collision defect. Keep geometry and difficulty unchanged.

1. The persistent journal card still displayed "Mara's supplies" after delivery and mill completion, and "Silence the signal" after silencing it. `createQueue.push` only replaced a current card when it had a replaceKey, not when its own saved note ID changed. The adventure HUD holds cards indefinitely. Refresh the same ID in place, show the newest arrival while retaining earlier unread entries, and provide an explicit next-note button. Retire only superseded Briar task instructions from the notification queue; preserve permanent journal notes and discovered clues. Test repeated snapshots, active/queued revisions, focus/menus, unrelated clues and region restoration.
2. Selecting Heavy Hand after a genuine reload repeated the Cleave lesson already completed in the tutorial. `meta.tut.skill` is written by the lesson, but `tut` is absent from both persistence field lists. Save the existing one-time skill/dash lesson flags with global tutorial settings, without changing earned choices or the multi-rank lesson recovery. Verify a real reload and a subsequent passive choice. Keep legacy saves without the field valid.

These changes concern presentation and tutorial persistence only. Use separate, visibly labeled staged fixtures for regression cases; do not present them as continuation of the fresh run.
