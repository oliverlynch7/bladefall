# BLADEFALL — GPT prompt for the full UI / menu icon set

> Paste into GPT. Generates every non-weapon icon the game needs, as ONE cohesive on-brand
> set. Generate the STYLE ANCHOR batch first (below), get the look locked, THEN do the rest
> in the same style — GPT drifts across large sets, so lock before scaling.

```
Generate a COHESIVE SET of dark-fantasy game UI icons for BLADEFALL, a grim voxel
action-roguelite. Every icon must read as one family — same style, same lighting, same
palette, same framing — so they sit together across the game's menus.

## THE BRAND / STYLE (identical for every icon)
- Grim dark-fantasy "dark-artifact" aesthetic: carved bone, black iron, rust, aged gold
  filigree, and soul-fire glow. Ornate but CLEAN and readable at small UI sizes.
- Each icon = a single centered EMBLEM with a crisp silhouette and a soft inner glow, subtle
  top rim-light, faint drop shadow beneath. Think "engraved relic lit from within."
- NO background scene, NO text, NO baked-in frame/border (the game draws frames), NO photo
  realism. Slightly stylized, game-ready.
- Consistent visual weight and padding so they tile evenly in a grid.

## PALETTE (use exactly)
- Base metal/bone: iron #3c4048, bone #d8cdb0, rust #7c4a26, aged gold #8a6f34, leather #453221.
- PRIMARY GLOW (default accent for most icons): amber / ember gold #e8a33d (core highlight
  #ffd07a). This is the brand color — most non-elemental icons glow amber.
- UI neutrals: near-black field #0b0c10, bone-white #f3f1ea, muted grey #8b8f9a.
- ELEMENTAL icons use their affinity color (glow + core):
  Fire #FF7A3A / #FFD07A · Frost #7FD6FF / #E3FAFF · Poison #86E05A / #D9FF9A ·
  Arcane #C47BFF / #E1B9FF · Holy #FFE9A8 / #FFF8D6 · Void #8F52D6 / #D69BFF.
- Stat/status colors where noted: HP red #e8453d, XP blue #3a9dd0, gold #e8a33d,
  defense steel #b8b8b8.

## OUTPUT (every image)
- One icon per image, SQUARE (1:1), high resolution, emblem filling ~78% with even margin.
- Transparent background (alpha PNG) if you can. If NOT, use a flat solid PURE MAGENTA
  (#FF00FF) field edge-to-edge (no part of the icon may use magenta) so it keys out cleanly.
- Name each file after the icon.

================================================================
STYLE ANCHOR — generate these 6 FIRST and lock the look before continuing:
Gold coin · Flame (fire) · Skull (boss) · Shield (defense) · Anvil (forge) · Portal rift.
================================================================

## THE FULL ICON LIST (all in the one style above)

### A) Hub stations / NPCs (ornate, "featured" — a touch more detail)
1. Waystation (the hub — a rune-carved waystone monolith)
2. Quartermaster (merchant — a coin-purse + scale)
3. The Smith / Forge (anvil + ember sparks)
4. Drillmaster / Class Trainer (crossed training blades on a banner)
5. Keeper / Healing Waystone (a glowing restorative rune-stone)
6. Postings / Quests (a nailed parchment quest board)
7. Beastkeeper / Your Pack (a fanged pet collar / paw sigil)
8. The Mirror (an ornate standing mirror, character view)
9. Sparring Post (a straw-and-wood combat pell)
10. Training Dummy (an armored practice dummy — damage test)
11. Abyssal Descent (a downward void spiral / pit portal)
12. Weapon Studio (crossed weapons on a display stand)

### B) System / navigation
13. Continue / Resume (play triangle, engraved)
14. Pause (two bars)
15. Settings (a gear / cog)
16. Sound on / 17. Sound off (speaker + waves / muted)
18. Music note
19. Fullscreen (expand arrows)
20. Back / return (curved arrow)
21. Title / Leave (a door / banner home sigil)
22. Character sheet (an armored bust silhouette)

### C) Item actions
23. Equip (a hand fitting a gauntlet) · 24. Sell (coin + arrow out) ·
25. Bag / Stash (a satchel) · 26. Buy (coin + arrow in) · 27. Forge/Fuse (two items merging) ·
28. Fortune's Bag / Gamble (a mystery sack with a "?" glow / dice) · 29. Respec (looping arrows) ·
30. Compare (up/down arrows) · 31. Auto-sell/Auto-bag toggle · 32. Sort.

### D) Currencies & resources
33. Gold coin · 34. XP / soul essence (a glowing blue soul mote) · 35. Key.

### E) Stats
36. Damage / Power (a fist or burst) · 37. Magic Damage (a violet burst) ·
38. Max HP (a heart, or a bone rib-cage) · 39. Defense / Armor (a shield) ·
40. Attack Speed (a swift blade + motion lines) · 41. Crit (a targeted starburst) ·
42. Dodge / Dodge-CD (a dashing figure / after-image) · 43. Lifesteal (a blade dripping into a heart) ·
44. Move Speed (a winged boot) · 45. Knockback (an impact arrow) · 46. Range (a reticle).

### F) Affinities (elemental — use each affinity color)
47. Fire (flame) · 48. Frost (ice shard / snowflake) · 49. Poison (venom fang + drip) ·
50. Arcane (glowing rune) · 51. Holy (radiant sunburst) · 52. Void (broken eclipse).
53. Physical damage (a steel chevron) · 54. Magic damage (an arcane sigil).

### G) Status effects (elemental color + a "stacking" feel)
55. Burn (fire — smoldering ember stacks) · 56. Chill (frost — creeping ice) ·
57. Venom (poison — dripping toxin) · 58. Rune Mark (arcane — a hovering rune brand) ·
59. Radiance (holy — building light) · 60. Corruption (void — spreading dark rot).

### H) Rarity tiers (as small gem/orb emblems in the tier color)
61. Common (grey #B8B8B8) · 62. Uncommon (green #5fd66a) · 63. Rare (blue #4a7fe0) ·
64. Epic (purple #b06bff) · 65. Legendary (gold #e8a33d, most ornate).

### I) Classes & subclass feel
66. Warrior (a heavy blade + shield sigil) · 67. Ranger (a bow + arrow sigil) ·
68. Mage (a staff + arcane orb sigil) · 69. Reaper (a scythe + skull sigil).

### J) Class skills (glyph-style, class-colored)
Warrior: 70. Cleave (wide arc) · 71. Shockwave Stomp (ground rings) · 72. Charge (forward dash) · 73. Berserk (rage aura).
Ranger: 74. Deadeye (piercing shot) · 75. Volley (arrow rain) · 76. Tumble (roll) · 77. Hunter's Mark (target brand).
Mage: 78. Elemental Bolt · 79. Nova (radial burst) · 80. Blink (teleport) · 81. Arcane Tempest (storm).
Reaper: 82. Reap (soul arc) · 83. (2nd) · 84. (3rd) · 85. (4th) — grim soul/void motifs.

### K) Armor slots
86. Helmet · 87. Chestplate · 88. Leggings · 89. Amulet · 90. Ring.

### L) World / loot / progression
91. Treasure Chest · 92. Mimic (a chest with teeth/eyes) · 93. Secret Rift (violet seam) ·
94. Boss Skull (danger crown) · 95. Trophy (zone-clear relic) · 96. Quest marker (glowing tick) ·
97. Magic Socks / Double-jump (winged socks) · 98. Bag-slots pack · 99. Level-up (rising chevrons) ·
100. Achievement badge (a laurel/medal).

Keep all 100 in ONE consistent style, palette, and framing. Most icons glow amber; only the
elemental/status/rarity/class icons take their own color. Generate in batches, re-showing the
style anchor each batch so the family stays consistent.
```

**Notes for Oliver**
- Generate the **6-icon style anchor first** — GPT drifts badly across 100 icons, so lock the look, then feed the rest in batches (I'd do ~8-12 per message, pasting the anchor each time).
- If GPT can't do clean transparency, let it use the **flat magenta** field and I'll key them out (same as the weapon icons).
- Drop the results in the desktop Bladefall folder (e.g. `Bladefall Theme Options (graphics)/Icons/`) and I'll background-strip + wire them into the menus — replacing the emoji placeholders (🐾 ⚒ 🕳️ 🏰 etc.) the game uses now.
