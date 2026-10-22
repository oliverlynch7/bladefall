# Skill identity review - 2.362.1

The user's friend found too much repetition within Ninja and Ranger, while liking Mage, Stormcaller and Chronomancer. This review uses actual action descriptions, hand/body paths, effect silhouette, trajectory and cadence. Different names, colors and geometry hashes do not establish perceptual variety.

## Changes

31 presentation poses and 22 effect compositions changed across nine classes. All 136 skill definitions, combat costs, damage, cooldowns, targeting, unlocks and presentation durations are preserved. Colored effects remain on by default.

| Class | Finding and disposition |
| --- | --- |
| Ranger | All eight actions revised. Broad volley vs held precision draw; low retreat shot vs stowed shadow slip; low trap placement vs canister toss; single sight brackets vs several burning death brands. Shadowstrike no longer incorrectly fires a bow. |
| Ninja | All eight actions revised. Diagonal draw-cut; three successive small-star waves; low shadow run; physical low smoke bomb; fixed crimson seal; one large upright piercing star; blade-ready empowerment; tall folding shadow veil. Small stars now use proportions appropriate to their size. |
| Bladedancer | Four defenses previously shared one pose. Counter Stance holds an angled blade; Mirror Guard opens the hands between paired reflective facets; Perfect Guard braces steel at contact; Perfect Counter coils into a high guard. Distinct effect silhouettes accompany them. |
| Reaper | Soul Cleave projects its wave with a forward cast, rather than replaying a local reap. Soul Siphon uses a wider turning harvest. Existing draining soul effects retained. |
| Necromancer | Pack raise, one-body resurrection, forward bone wall and wide army call now use different hand paths. Existing distinct bones/army effects retained. |
| Paladin | Last Stand braces low, unlike Taunt; Sky Hammer joins and raises both hands, unlike Smite's call. Existing holy effects retained. |
| Monk | Stunning Palm uses a two-palm pressure release and radial daze, unlike the forward Palm Strike. |
| Skylancer | Thunder Dive has an overhead-to-ground plunge, distinct from the forward Dive Strike. |
| Beastmaster | Stampede sweeps the call across its herd lane instead of repeating the Sic 'Em pointing command. |
| Mage | Praised reference; pose and effect compositions preserved. Bolt, beam, ice nova, gravity, barrier and tempest occupy distinct spaces. |
| Stormcaller | Praised reference; preserved. Branches, discharge lane, local field, electric orb, barrier and links remain distinct. |
| Chronomancer | Praised reference; preserved. Time face, freeze, travel echo, projectile and collapse remain distinct. |
| Warrior | Retained. Blade sweep, bash, charge wake, spin, planted shield, ground cracks, roar and execution have different physical roles and silhouettes. |
| Berserker | Retained. Heavy cut, headbutt, rush, ground impact, spin, overhead finisher, rage and guard already use appropriate distinct poses/effects. |
| Pirate | Retained. Pistol, broadside, boarding saber, retreat shot, powder smoke, coins, marked target and keg remain recognizable. |
| Warlock | Retained. Void orb, blood lance, ground curse, drain, paired rifts, implosion, sacrifice and condemnation occupy different spaces. |
| Pyromancer | Retained. Palm bolt, flame fan, radial backdraft, ember shell, lance, floor ring, inferno and falling sun already communicate different shapes/areas. |

## Verification

- Native Chrome/WebGL: all 136 actual character actions, 5,712 idle/running pose samples, 136 recovery checks and 816 low/high colored-effect checks pass. No warnings or errors.
- Preview correction: moving skill previews now actually sample the running clip. Previously their moving flag changed blend handling while their base carrier remained Idle.
- Visual review: anticipation/release/recovery sheets for all Ranger, Ninja and the four Bladedancer defenses; additional moving side views for the other changed actions and selected Ranger/Ninja actions. See the JPEG sheets. These are inspected poses, not a human fun assessment.
- Native actual game: isolated pre-change level-4 Warrior save loads in the hub with 1,145 gold; reload preserves it. Debug-staged class choices exercise 72 real casts: 71 accepted casts dispatch the expected semantic pose/effect. Unchanged Paladin Smite correctly refunds because the training dummy is not an eligible toughest enemy. Every changed action is accepted. This is not a fresh progression playthrough.
- All current skill presentation durations and the entire CLASS2 definition are checked against pre-change commit 4b8307e5. Praised class pose samples and effect compositions are unchanged.
- Regression suites: skill motion, semantic identity, distinct effects, surface budgets, preview, weapon actions, Reaper combo and inline syntax pass. Full compositions fit the existing 300/900 low/high cost limits; no extra draw-call layer or persistent effects added.
- Existing presentation packet/receiver and real MP pose sanitizer tests cover all 136 IDs. No new network fields. A live two-client session was not repeated for this cosmetic pass.

## Limits

This addresses visible sameness found in the current source and native previews. Similar defensive mechanics can still share some visual vocabulary. Player feedback is still needed on readability and appeal during busy combat; tests and an author's visual judgment cannot certify that every skill feels unique to a new player.

Final front-camera correction: the large Piercing Star disc had been rotated edge-on along its flight axis. Its outer cant is now slight, so its broad blade face reads from normal player views. Added a real transformed-surface regression at three phases; width/height stays approximately0.99 instead of collapsing to zero. Native frontal screenshots and Ninja comparison sheet refreshed.
