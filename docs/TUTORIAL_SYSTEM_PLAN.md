# BLADEFALL — Robust Tutorial & Onboarding System (plan)

> A design plan for teaching a new player every core system, contextually, without a wall of
> text. Follows `AGENTS.md` when built. Current state: a controls card before the first trial
> (`showTutorial`), a hub card after it (`hubTutorial`), per-trial `tips[]`, and a press-E
> `#interactprompt`. Good bones — but front-loaded and it never teaches the deep systems.

## PRINCIPLES (from top-rated tutorials — what's transferable)
1. **Show, don't tell.** Teach through PLAY, not text walls. Half-Life 2 / Portal only show
   text for raw button controls; every system is learned by doing it in the level. Mario 1-1
   teaches the whole game with zero words. → Text only for controls; systems taught by action.
2. **Just-in-time, not front-loaded.** Teach each system the MOMENT it first matters, not all
   at the start (front-loaded tips are forgotten). Every deep system gets a one-time trigger.
3. **One concept at a time, in a SAFE context.** Isolate each mechanic in a no-fail moment
   before stakes. HL2's Barnacle first eats a bird so you learn the danger WITHOUT being in
   danger. → Introduce each verb/system in a controlled, low-risk beat.
4. **Progressive disclosure.** Reveal complexity as the player is ready — rank 2 → teach the
   skill choice; first rare drop → teach rarity; first forge → teach fusing.
5. **Diegetic where possible.** Let NPCs and the world teach (Hades' characters, Souls'
   ground messages) instead of a disembodied UI voice. Our keepers are perfect for this.
6. **Respect the player.** Everything skippable, non-intrusive, never traps them. Experienced
   players opt out; a "Reset tutorials" toggle re-enables.
7. **Teach → practice → apply.** Introduce, let them try it safely, then use it for real.
8. **A persistent reference.** A Help/Codex the player can revisit, so nothing is lost if a
   tip was skipped or forgotten.
9. **Signpost clearly.** Highlight the exact thing being taught (glow/arrow/pulse on the UI
   element or world object).

## THE INFRASTRUCTURE (build this first — everything else rides on it)
- **`teachOnce(id, {title, body, highlight, anchor})`** — a reusable one-time teach trigger.
  Fires once per `id`, tracked in `meta.tutSeen[id]` (persists). Shows a small, NON-BLOCKING
  card or a pointer near `anchor`, dismissable with one tap, and auto-logs the entry to Help.
  This single primitive powers all just-in-time teaching below.
- **A persistent HELP / CODEX menu** (Pause → "❔ Help"): every teach entry as a reference,
  grouped (Controls / Combat / Gear & Forge / Classes & Skills / The Hub / Systems). So the
  tutorial is never the only source of truth.
- **Signpost helper** — highlight/arrow a UI element or world object while a tip is up.
- **Settings:** "Show tutorials" on/off + "Reset tutorials" (clears `meta.tutSeen`).

## PHASE 1 — THE CLASS TRIAL (the core verbs, contextual, one at a time)
Replace the single upfront tips-card with SEQUENCED, just-in-time prompts, each isolated:
1. **Move** — a marker to walk to, before any enemy appears.
2. **Look/Camera** — brief, how to turn the view.
3. **Attack** — ONE weak, non-threatening foe appears; prompt attack; confirm on the kill.
4. **Dodge** — a foe winds up a telegraphed hit; prompt DODGE; teach the i-frame ("roll
   THROUGH it"). A safe, single, readable threat (the Barnacle principle).
5. **Skill ①** — a small cluster appears; prompt the class's rank-1 skill; teach cooldowns.
6. **Goal & Portal** — clear the foes → the portal opens → teach "take the portal to
   continue." Keep the whole trial fully skippable for returning players.

## PHASE 2 — THE HUB (progressive station intros + a guided first loop)
On first hub entry, do NOT dump everything. Guide the first loop and teach each station only
when the player first walks up to it (`teachOnce` per station):
7. **Arrival** — "This is the Waystation — your home between battles." Point to the Waystone.
8. **The Waystone** — press E to HEAL + BANK your progress (the return-loop anchor).
9. **First-approach intros** (one-time each, triggered on approach): Quartermaster (shop &
   gold), Your Pack (bag), Postings (quests), Drillmaster (classes & skills), The Smith
   (forge), Beastkeeper (pets), Sparring Post (practice), The Mirror (inspect yourself),
   Abyssal Descent (endless — teased/locked).
10. **The Gates** — "Each gate is a zone. Walk up and press E to descend." Point to the first
    gate; teach that clearing zones opens the next.

## PHASE 3 — THE FIRST LEVEL (Outskirts), taught just-in-time as each first occurs
11. **First combat** — reinforced (no new text unless needed).
12. **First loot drop** — "Something dropped — walk over it to grab it."
13. **The loot card** — Equip / Compare (the green▲/red▼ arrows) / Stash / Sell. Teach reading
    the compare before equipping.
14. **Rarity** — on the first uncommon/rare: what the colors mean + the level-lock (🔒 "requires
    level X").
15. **Quest tracker** — on the first objective: point to the HUD tracker; "clear it to progress."
16. **Affinity & status** — on the first elemental enemy or applied status: the weakness idea
    (fire↔frost, etc.) + what a status does (Burn ticks, Chill slows…). Keep it light.
17. **Chests & mimics** — on the first chest: how to open — and that SOME chests bite back
    (the mimic risk). Teach the risk in a safe framing.
18. **Hazard** — on the first zone hazard (gusts/lava): what it does, how to avoid it.
19. **Secrets** — a light nudge on the first purple-secret hint: exploration is rewarded.
20. **Level-up** — first level: the auto-growth. At **rank 2**, the **skill choice** fires —
    teach the mix-and-match build decision here (progressive disclosure).
21. **Portal / zone clear** — clearing the area, taking the portal, "the boss awaits."

## PHASE 4 — DEEP SYSTEMS (one-time, on FIRST use of each)
22. **Forge** (first open) — fuse two same-category, same-rarity pieces → a random next-tier
    piece; the slot-machine reel.
23. **Skill Master / Drillmaster** (first skill-slot pick) — the mix-and-match system: choose
    each of skills 2/3/4 from EITHER discipline, independently.
24. **Respec** (first available) — re-pick your skill slots; the gold cost.
25. **New class / class switch** (when a 2nd class unlocks) — how classes and their families work.
26. **Pets** (first Beastkeeper) — buy → equip (one active) → train; attacker vs the passive healer.
27. **Bag management** — sort, Auto-sell / Auto-bag, buying bag slots.
28. **Trinkets** — first amulet/ring: how trinkets differ from armor.
29. **Shrine / boon-bane** (first endless shrine) — the run-modifier risk/reward choice.
30. **Difficulty ladder** (after the first Normal clear) — THE retention pitch: "Hardcore
    unlocked — same journey, deadlier stakes." Sell the re-run.
31. **Daily challenge** (when it exists) — the seeded daily + streak.
32. **Endless Descent** (first unlock) — the infinite mode.
33. **Cosmetics / hub upgrades** — spending gold on skins and the hub.

## BUILD ORDER (when implemented)
1. The `teachOnce` primitive + `meta.tutSeen` + the Help/Codex menu + settings toggles.
2. Retrofit Phase 1 (trial) to sequenced JIT prompts.
3. Phase 2 (hub station intros + guided first loop).
4. Phase 3 (first-level JIT triggers).
5. Phase 4 (deep-system triggers), added as each system is touched.
Every entry also becomes a Help/Codex page, so the reference is complete even for skippers.

## VERIFY
A brand-new save walks the full path (trial → hub → Outskirts) and every core system fires
its one-time teach in context, each skippable, each logged to Help; a returning save (all
`tutSeen`) sees NONE of them; "Reset tutorials" re-arms them. No tip blocks input for long.
