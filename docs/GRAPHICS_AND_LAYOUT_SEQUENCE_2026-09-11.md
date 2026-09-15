# Oliver's graphics and layout sequence

## [Codex | 2026-09-11]

Oliver's latest direction: finish graphics for the base campaign levels first. He will then request the secondary portal modes, including Abyssal Descent. After the graphics work is complete, redesign the main level layouts substantially; the current layouts are not the desired final design.

1. Complete the campaign graphics review. All eight campaign worlds and the Waystation have their first custom scenery pass deployed. Review the actual player camera, route visibility, environmental consistency and browser cost; do not equate a Blender render with a completed gameplay review.
2. Secondary modes follow when Oliver asks. The unfinished Endless Dungeon adaptation is saved locally on `codex/endless-dungeon-art`, commit `5a5b424`, and has not been deployed. It will need rebasing, an updated version number and fresh checks before any future release.
3. Once the graphics phase is complete, redesign campaign layouts. This is a substantive level-design phase: route topology, landmark visibility, exploration rewards, shortcuts, elevation, encounter spaces and pacing. Preserve save compatibility, progression requirements and achievable traversal with the intended base movement. The existing geometry is not a constraint for that future phase.

The iconographic art direction and browser performance requirement remain in force. During the current graphics phase, keep gameplay geometry and difficulty unchanged. Continue using `autopilot-merged` for authorized preview deployments and provide phone-accessible Blender previews.

## [Codex | 2026-09-15] Remaining levels, then combat animation identity

Oliver playtested the redesigned levels: their concepts look and play great, with refinements still needed. Finish the remaining campaign level identities and playability before beginning the next frontier. Follow docs/CAMPAIGN_IDENTITIES_2026-09-14.md; Hollow Pass and Dry Wash are the first completed pair in that differentiation pass, following the Outskirts adventure. Other worlds still need implementation and testing.

The next authorized phase is a complete combat-animation and effects review:
- Skills 1 through 4 for every class, including attacking, defensive and utility abilities.
- Basic and charged attacks for every weapon type.
- Every enemy and boss attack, including projectiles, area attacks and defensive effects.

Every action needs a distinct, satisfying identity grounded in its actual description and gameplay. Communicate what it does, where it acts, its timing and relevant protection or movement. Replace repeated generic area effects, cube-like shields and weak projectiles with readable custom movement and effects. Preserve the preferred character and weapon designs and their fitted attachments while improving attack animation where needed. Keep browser performance, combat readability, save compatibility and multiplayer presentation in scope.

Before implementing combat changes, inventory actual definitions and runtime attack paths so every action is accounted for, including shared and inherited variants. For each, record description, gameplay timing/area, current animation, proposed anticipation/action/impact/recovery, and validation status. Match the visuals to real hit windows and collision areas. Review in motion in a real browser, check high/low settings, and verify clarity in crowded combat. Screenshots alone cannot validate animation quality. This is authorized future work after the remaining level redesigns; it has not been implemented yet.
