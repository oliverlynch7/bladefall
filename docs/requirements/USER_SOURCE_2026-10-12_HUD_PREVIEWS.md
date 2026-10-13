# HUD design choices — October 12, 2026

## Exact user requests

“I’d also like for us to look at our HUD and see if there are any ways to make it smarter or less busy without making the player experience worse. Any ideas?”

“Can you design me a preview or a few variations of new ones that I can choose between before applying”

## Scope

Create accessible visual previews for comparison. Do not apply a replacement gameplay HUD until the user chooses a direction. Current campaign work remains open; this is a requested design-review detour. Use actual Bladefall scenery and existing icon artwork, with clearly identified sample HUD values. No save, gameplay, class, quest, or input changes.

## Grounded design plan

The current desktop HUD reserves a 680px player panel, a separate wide pair of XP panels, a 636px skill frame, a 300px quest frame, and independent note, loot, companion and navigation overlays. In the inspected mill scene, instructions are repeated in several locations. Preserve readable health, mana, cooldowns, progression and guidance while reducing framing and duplicate text.

Build three layouts at the same reference viewport and scenario state:

1. **Classic Compact** — familiar corner positions, smaller player panel, paired thin XP tracks near the hotbar; most conservative transition.
2. **Adventure Focus** — group minimap and the next objective together, small horizontal vitals, lighter hotbar and a reserved reading lane; prioritize seeing and navigating the world.
3. **Combat Focus** — group vitals, resources and skills at the bottom center, leave identity and party in the upper left, and map/objective on the right; prioritize combat scanning.

Provide exploration, combat, clue-reading and co-op samples, each with the same data across all three layouts. Show a compact companion, a pinned optional objective, distinct character/class XP, cooldowns, a low-health state, and shared progress without overwhelming the default view. Include quiet locked skill placeholders in a beginner sample. Keep scene transitions user-controlled and avoid moving combat-critical information between modes. Comparison controls, a full-size view, and phone panning help the user inspect the real size of text. Mock interactions must be explicitly labeled; they never write game preferences or saved characters.

Validate actual browser rendering, readable control contrast, no overlapping primary HUD panels at supported preview sizes, keyboard access and mobile review. Add a title > Dev Previews link, leaving live HUD code/styles unchanged. Save screenshots and a short verification record. Aesthetic preference is still the user's decision.


## [Codex | 2026-10-12] User review of the three HUD previews

Exact user feedback:

> I like the idea of the minimal being in the top corner makes more sense. These new HUDs seem to neglect the feature of showing recently picked up equipment and the stats and how they compare, so we think it’s better to not show all of that? 
>
> Or better to keep
>
> Also I can’t tell if I like the hp and mana next to the skills or up in the top right. Aqw has hp and mana in top right I believe and skills below. 
>
> The notes look way better now and more like actual pages which adds realism and understandability. That’s great
>
> Most everything else looks great, I do wonder if having the navigation feature be more like skyrims. Maybe we can have multiple options that can be toggled between in the settings. 
>
> I still wonder what other improvements or genius changes we could make as well. Any other ideas?

### Preferences and unresolved decisions

- Interpret “minimal” in context as minimap: user prefers an upper corner. Upper-right is the proposed location, not an explicitly selected side.
- Paper/page treatment for readable notes is positively accepted.
- Equipment pickup/stat comparisons were inadequately represented by the previews. User asks whether to keep them; recommendation is to keep them, not remove useful RPG feedback to reduce HUD density.
- HP/mana location is unresolved. User is considering a corner versus beside skills. No entire A/B/C variant has been selected for gameplay.
- User is interested in Skyrim-like navigation and switchable settings; exact defaults and combinations remain proposals.
- Overall positive feedback is not authorization to silently choose the remaining layout decisions. The live HUD remains unchanged.

### Inspected behavior and proposed next preview

Source inspection: ordinary equipment pickups call offerWeapon/offerArmor/offerTrinket -> bagGroundEquipment, immediately stash the item (or sell overflow), then show a brief toast. Older renderLootCard/queueLoot comparison code remains, but no ordinary pickup caller queues it. Preserve immediate collection and restore presentation independently; do not reintroduce timed inventory decisions or accidentally grant/sell an item twice.

Proposed next preview: upper-right minimap, paper clues, a real equipment-comparison example (stat gains AND losses, changed effects, level/class usability, already in bag status), independently selectable corner/above-skills vitals, and a top-center compass option. Show compass, minimap, both, or off without confusing that choice with how much quest guidance is enabled. Keep health/skills stable during combat and reserve non-overlapping areas for clues and loot. A compass conveys bearing, not proof of a safe path; preserve authored gate/stair waypoints and above/below cues. Undiscovered secrets must stay hidden.

Further proposals, not implemented/approved: a recent-pickups view; concise explanations when a skill cannot fire; legible named buffs with duration; unobtrusive pending-stat/skill indicators; configurable text size and high contrast; interaction labels that state the action/result. Existing related-clue selection in the journal should be surfaced more clearly rather than rebuilt as a duplicate system.

Reference sources inspected: https://www.aq.com/lore/guides/userinterface ; https://www.aq.com/lore/guides/battlebar ; https://help.bethesda.net/app/answers/detail/a_id/2529/~/what-does-the-white-arrow-symbol-on-my-compass-mean . These inform the proposal, not claims that it is already implemented or playtested.

## [Codex | 2026-10-12] U-HUD-BAG-20261012 — capacity and overflow clarity

Exact user message:

> Also I don’t think it’s currently obvious to the player what happens when the bag is full and items are collected. They may accidentally lose loot they want so maybe we need to bro my our bag capciaty with icon to the hud to make that a clear part of the game

User identifies unclear full-bag behavior and proposes visible capacity with an icon. Interpret this within the active preview-before-rollout request. The live game already has a small bag counter; ordinary collected equipment is immediately bagged or auto-sold when capacity is exhausted. This feedback does not revoke the previously approved overflow sale rule or approve a particular new gameplay HUD.

Preview implementation plan: improve the persistent bag icon/count with an explicit Bag label, free-slot status, amber near-full and red full states, and visible “Full — new gear auto-sells” wording. Provide a Bag state control and simulated pickup so the transition and sale result are reviewable in every layout; mark samples as illustrative. Display the sold item's name and gold value, with no implication it is in the bag. The bag button opens a short explanation of current behavior. All interactions remain local to the preview; no game saves, inventory, preferences or sale policy change. Acceptance: readable text beyond color alone, used/capacity counts consistent with pickup notices, keyboard-operable controls, no overlap with notes/map/skills at desktop and laptop sizes, and usable phone review.

## [Codex | 2026-10-12] U-HUD-ADVENTURE-20261012 — selected for implementation

Exact latest user messages:

> I think maybe the item feed and bag feature should be on the bottom left corner. Just a. Feeling.
> We could also just not allow gear to be picked up with a full bag unless auto sell is intentionally set to on.
> We should also include mana cost numbers on the top left of each skill indicator box.
> Also are sure that if buttons ever get rebound that the new assigned button reflects on the screen and hud whenever that action is present. For all buttons.
> And whether gear is set to auto sell or not there should be an sblubtle indicator for that that appears next to the and on the bag “box” on the hud in what will be the bottom left.

> But overall I like the adventure focused hud best go ahead and apply it with these changes added

The user now selects Adventure Focus and authorizes live rollout. This supersedes preview-only scope and mandatory overflow selling. Apply upper-left compact vitals, upper-right map/objective, bottom-center skills and paired progression tracks, paper clue cards, and bottom-left bag/equipment feedback. Retain useful equipment stat comparisons. Auto-sell is an explicit preference, initially OFF even for legacy saves; OFF bags gear while space remains and otherwise leaves it on the ground. ON intentionally sells encountered gear, clearly labeled in HUD/bag and pickup outcomes. Quest pickups remain independent of gear capacity. Mana badges use actual calculated skill cost. Rebinding prompts must reflect current input assignments, including secondary-only/unbound states and controller labels when using a controller. Do not promise universal correctness without evidence.

Grounded implementation: existing monolith handles HUD, bindings and pickup decisions; guided-tutorial.js owns the minimap; journal-notice.js/css own queued reading. Preserve element IDs and mechanics while replacing layout in a dedicated stylesheet. Add a presentation-only recent-loot module; successful collection is resolved once in inventory code. Full bags must not mark a pickup taken or create repeated sale/toast events. Keep quest trackers, navigation, controller/touch actions, saves and dungeon currency contracts intact. Use browser checks for layout at 1440x900, 1280x720 and compact sizes, visible rebinding/mana states, simulated inventory boundary cases, and a pre-change save. Queue major class-skin work after this HUD pass.


## [Codex | 2026-10-12] U-HUD-ADVENTURE-20261012 complete

Adventure Focus is applied in v2.190.0 with bottom-left bag/equipment comparisons, explicit default-OFF auto-sell and full-bag loss protection, paper notes, upper-left mana costs and current binding labels. Local browser, old-save, inventory/chest boundary and all-class mana checks passed. See docs/requirements/CONTINUITY.md and docs/art-validation/adventure-hud-2026-10-12.json (repository paths) for scope and limitations. Earned-skin overhaul remains next; this does not mark that art work complete.
