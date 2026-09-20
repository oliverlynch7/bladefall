# Bladefall — custom sound-effects production guide

Prepared September 20, 2026. Based on game build **1.986**, its actual class/weapon/enemy registries, and the reconciled campaign plan. This is a production plan, not a claim that the new sounds are already generated or installed.

Open the [searchable prompt catalog](../../public/3d/audio-planning/index.html) for individual copy-ready prompts. The companion JSON and full Markdown list preserve every entry. The page contains campaign-ending spoilers.

## What the catalog covers

Each entry identifies the sound, where it plays, a complete ElevenLabs prompt, suggested generation length, loop setting, number of usable variations to keep, priority, filename, and whether it belongs to current systems, the planned expansion, or an unresolved design. A current-system brief means its underlying system exists; it does **not** mean that exact audio event is already wired into the game.

The list includes every current selectable skill choice: **16 classes × four slots × two choices = 128 skills**. It also covers weapon handling/basic attacks/real supported charges, projectile motion, hit materials, elemental layers, 31 ordinary enemy body identities, boss attacks and arena devices, companions, UI, movement, quests, puzzles, all eight regions and both halves, Rift Hall, sailing, co-op, secondary modes, and the ending.

Pyromancer's name and unlock location are approved, but its final skill kit is not. Its entries are texture auditions, not invented skill commitments. The Legion Commander replacement needs its final encounter design; its rows are also marked to wait. Old generic boss wards, mirrors and reinforcements are marked **legacy** so we do not spend money preserving discarded mechanics.

## Bladefall's sound identity

Aim for **clear, weighty, tactile fantasy**. Steel should have an edge; wood should have grain; stone should feel heavy; magic should have an identifiable shape. Stylized low-poly graphics do not require thin arcade sound. We want polished sound that remains legible through laptop speakers.

Keep ordinary actions short. Save long, wide, spectacular effects for major skills, boss transitions, rare rewards and story moments. Avoid putting a trailer boom under every sword swing. A good weapon should remain satisfying after its hundredth hit.

| Sound family | Its identity | Avoid |
|---|---|---|
| Warrior | Solid steel, boots, shield plates, grounded force | Generic magical explosions |
| Ranger | Bow fiber, precise air cuts, light leather, practical traps | Giving every shot a cannon boom |
| Mage | Rounded glass energy, clear runes, chosen weapon element | The same dark whoosh on every spell |
| Reaper | Long curved blade air, hollow pulls, spectral tension | Constant screaming or zombie sounds |
| Paladin | Warm bronze, clean golden lightning, protective resonance | Cold blue electricity or evil choir |
| Necromancer | Dry bone assembly, disturbed soil, grave air | Making necromancy sound identical to Hollowing |
| Ninja | Tiny fast steel, tight smoke snaps, cloth, controlled silence | Loud extended effects that defeat its precision |
| Berserker | Rough chopping air, body weight, raw pressure | Merely lowering Warrior's pitch |
| Pirate | Flint clicks, black powder, dense ball shots, saber edge, wood | Modern firearms or cartoon sea-shanty stings |
| Chronomancer | Ticks, stretched glass, reversed gestures, suspended pulses | Electronic computer glitches |
| Monk | Cloth, breath, bare-hand pressure, disciplined rhythm | Metallic sword impacts on bare fists |
| Stormcaller | Branching cracks, electrical chatter, compact thunder | Fireball sounds tinted differently |
| Warlock | Uneven pulses, tense dark threads, rough spatial tears | Reaper's long sweeping blade motif |
| Skylancer | Rising wind, falling spear air, sharp landing force | Constant electric effects on every wind move |
| Bladedancer | Fine steel, controlled paired rhythms, parry rings | Berserker weight and roughness |
| Beastmaster | Living breath, paw/hoof force, warm earth, clear commands | Making friendly companions sound like enemy alarms |
| Pyromancer, future | Dry ignition, hot airflow, clear ember snaps | Final skill names or slots before the kit is settled |

**Secret Rifts:** bright crystalline frames, curious and inviting. **The Hollow Gate:** one huge, black, inward-pulling presence at Castle Duskmoor. **Waystone travel:** grounded stone and a neutral travel shimmer. These must be recognizable without looking at the screen. Do not put Hollow Gate ambience at every travel portal.

Hollowed people are living human bodies under control, not a race of zombies. Use restrained human effort and equipment sounds. Independent undead and beasts get their own sounds. The hydra's resolution is relief and retreat into the sea, not a death scream. The King's defeat breaks control; the triumphant restoration sound belongs after the final cut.

## How to generate a sound in ElevenLabs

1. Open **Sound Effects** and copy a catalog prompt. Generate **one cue per request**, not a whole bank or battle scene.
2. Set the listed duration and loop option. Begin with **30% prompt influence**, then adjust after listening. This is a starting point, not a guaranteed optimum.
3. Listen to the returned options. Keep only takes that match the action and are comfortable in repetition. “Keep 4 variations” means four approved separate files, not four attacks baked into one clip.
4. For tiny clicks, generate at least **0.5 seconds**, then trim the useful sound. For changing-length actions, use separate start, loop and end files. Do not ask the AI to guess how long a player will hold a button.
5. Download the highest-quality original offered. Prefer WAV for editable masters when available; retain original MP3 if that is what the service supplies. Converting MP3 to WAV does not restore lost detail.
6. Rename using the catalog filename, changing `v01` to `v02`, etc. Retain the prompt, settings, date, generation ID and original file.

The current product guide describes duration, looping, a 30% default prompt influence, multiple generated options and downloads. It also recommends separate effects over complicated combined sequences. [ElevenLabs product guide](https://elevenlabs.io/docs/eleven-creative/playground/sound-effects)

The API currently accepts 0.5–30 seconds and supports looping with its v2 SFX model. Its overview lists a different minimum, so these briefs use the API's conservative 0.5-second floor. All prompts are below the product guide's 450-character limit. [API reference](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)

Download formats can differ by mode or plan; the overview specifically distinguishes non-looping WAV availability. Check the offered download rather than assuming every loop will be WAV. [Capabilities](https://elevenlabs.io/docs/overview/capabilities/sound-effects)

For commercial game use, generate under an eligible paid plan and keep the generation/license records. ElevenLabs describes paid-plan commercial rights; that is not a guarantee of exclusive copyright ownership. [Commercial-use guidance](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)

## Prompt recipe

**Source + action → material/texture → weight and shape → isolated event or steady loop → exclusions.**

Do not paste the full lore brief into the sound generator. A name such as “Smite” does not tell the model what the listener should hear. Describe golden lightning dropping from above, its sharp opening crack, warm thunder body and clean ending.

Example, Paladin Smite:

> A single golden lightning bolt drops from high above, sharp radiant crack followed by a compact warm thunder body. One isolated event, immediate onset, clean short tail. Fantasy game SFX. No music or intelligible speech; only the described source.

Example, javelin basic attack:

> A forward two-handed thrust with a tight linear air rush. One isolated event, immediate onset, clean short tail. Fantasy game SFX. No music or intelligible speech; only the described source.

Example, Hollow Gate loop:

> An immense black doorway with impossible depth, low inward air pressure, fine light-like particles pulled inward, unsettling and nonmusical. Seamless steady loop, no opening hit or ending fade. Fantasy game SFX. No music or intelligible speech; only the described source.

For variants, keep the same material and identity. Ask for a slightly different performance, not a different instrument. Start with 4–6 accepted footfalls, 3–4 common attacks/hurts, 2–3 rare abilities, and one or two ambient loops. You can begin with **one good take per cue** and add alternatives after in-game testing.

## Reuse intelligently

A sound event is not necessarily a new file. Build attacks from a small number of useful layers:

- **Weapon action:** sword air cut, javelin thrust, string release, pistol report.
- **Surface contact:** flesh/cloth, leather, plate, bone, stone, wood, ice or slime.
- **Optional element:** fire, ice, poison, arcane, void, holy or lightning.
- **Occasional outcome accent:** critical hit, parry, shield break, execution.

A fire sword hitting plate should use a sword action, plate contact and a restrained fire accent. It should not play five complete explosions. An enemy miss plays its attack sound but no flesh-impact sound. An arrow hitting a wall plays the wall contact, not a pain cry.

Use the same material footstep bank for player, NPCs and teammates with appropriate weight and volume. Trigger each foot contact from motion, not a fixed repeating walk loop that continues during jumps or stops. Avoid playing the same variation twice consecutively. Audiokinetic documents randomized containers and surface switching as established approaches; these principles can be implemented in Bladefall's existing browser audio system without adding Wwise. [Variation](https://www.audiokinetic.com/en/public-library/2024.1.4_8780/?id=creating_random_container&source=Help) · [Surface switching](https://www.audiokinetic.com/en/public-library/2024.1.8_8893/?id=defining_contents_and_behavior_of_switch_containers&source=Help)

Chest lid sounds are reusable. Add one rarity reveal for the best item in the reward group. Class rank and player level each have a fixed recognizable celebration. Do not randomize important warning identities until they become hard to recognize.

## Attacks must remain fair

A warning must begin when the visible wind-up begins, before damage. The release and impact are separate events. Do not rely on the generated clip to time the attack or stretch the game to fit the recording.

For Sporeback: death body reaction → readable pressure warning → delayed spore release → quiet active cloud → stop. No instant damaging burst hidden inside a death file. This catalog does not itself change the current hitbox code; implementation must enforce that sequence.

Give enemy attacks their own material signature. Use an additional universal danger accent only where needed for an offscreen threat. Avoid one identical alarm on every enemy attack. Do not disguise harmless ambient ice creaks as the urgent cracking pattern of a collapsing floor.

Warnings should have a clear midrange component audible on a laptop. Low bass alone is not enough. Pair all important warnings with visible cues. A puzzle must never require hearing a sound to solve it. Audio can support a clue without announcing every hidden shard from across the map.

## Voice and NPC policy

The catalog contains 37 named/role-based NPC prop directions plus optional reaction performance briefs. Actual speech belongs to the separate voice studio and approved dialogue scripts. Prefer Oliver and his wife's recordings for human NPCs, player effort sets and important named boss lines, so voices stay consistent.

Do not put speech into a chest, spell or ambient bed. Do not generate “background chatter” with accidental understandable words. Do not play a sound for every text character by default; the optional text tick is very quiet and should be suppressed during recorded/TTS speech.

Dialogue camera entry/exit, option commitment and co-op voting get tiny clear cues. Quest reward and world changes get physical feedback. Trust changes should be readable through performance and consequences, not a loud “you chose correctly” sound that spoils ambiguity. Mouth movement stops when the voice stops.

## A sensible production order

**First: the 30-cue audition batch in the catalog.** It samples UI, footsteps, damage, parry, healing, sword, javelin, Pirate, Reaper, elements, three contrasting classes, spore warning/burst, Brute slam, both level-ups, shard pickup and the Hollow Gate. One accepted take each is enough to choose the shared direction.

**Next: core repetition.** Finish footsteps, weapon basics, impacts, player pain, pickup, UI and charge loops. These sounds will be heard constantly, so fix them before rare cutscenes.

**Then: skills and enemies.** Finish all 128 skill signatures and their needed phases, normal-enemy tells, attacks, damage and deaths. Start with classes you and your friend use most. Prioritize distinctions players can actually hear; a subtle buff may need only its start/end, not a perpetual loop.

**Then: campaign regions and bosses.** Produce each region as a pack: both ambient beds, local sources, interactions, enemies, boss and arena devices. Planned boss mechanics should be generated only when their implementation is settled.

**Then: rare moments and later modes.** Rift Hall, trials, sailing, story scenes, mounts, secret companions, NG+, Descent, Arena, Boss Rush and Treasure Sprint. Dialogue is a separate recording schedule. Music remains in the existing soundtrack plan.

P0 means core combat/readability/progression priority. P1 means world identity and supporting detail. P2 means lower-frequency, optional, conditional or later-mode work. **Status wins over priority:** do not generate an unresolved design just because a future attack would be important.

## Browser-friendly integration plan

The current game combines file-based samples with procedural Web Audio. It fetches/decodes the existing sample registry eagerly and applies an automatic RMS adjustment. Replacing that with a much larger bank requires an audio pass, not just dropping 1,000 files into the existing loader.

- Load a small global/UI/player bank, then only the selected class, equipped weapon, current region and nearby enemy banks. Preload the next boss/region during safe traversal. Keep a fallback until each replacement works.
- Retain lossless masters outside the web-served folder, inside the Git repository; use Git LFS if file sizes require it and verify the actual content is pushed. Keep web-ready derivatives under `public/sfx/custom/`. Never deploy all editing masters to the browser.
- Suggested masters: `audio-source/sfx/<category>/<cue>_v01.wav` or its real original format. Suggested runtime: `public/sfx/custom/<bank>/<cue>_v01.<supported-codec>`. Do not merely rename file extensions.
- Use mono for positioned small sources; stereo for environmental beds. Add appropriate room response in-game so a sword does not carry a giant cathedral echo into a meadow.
- Stop loops on death, pause, conversation, equipment change, scene exit and disconnect. A loop's sound length is not the gameplay timer.
- Give music, dialogue, ambience, combat, UI and warnings separate volume control groups. Briefly lower music/ambience for speech and essential tells. Preserve attack clarity without making everything loud.
- Cap overlapping sounds by family and distance. Near player feedback and dangerous boss tells outrank distant mob pain, pet chatter and rubble. Start with conservative simultaneous-voice limits and profile on the actual target laptop. [Voice-limit principles](https://www.audiokinetic.com/en/public-library/2024.1.8_8893/?id=optimizing_cpu&source=Help)
- Do not normalize every source to identical average loudness. A quiet magical bed and sharp sword impact need different dynamics. Set sensible headroom, inspect peaks, and test the busiest real battle for clipping.
- Compressed download size is not decoded memory size. For example, 20 seconds of stereo 48 kHz float audio occupies roughly 7.3 MiB decoded. Loading every ambient loop at once is wasteful.
- Co-op events need IDs and ownership: hear a remote strike once, not once from prediction and again from the host. Keep local UI/reward sounds local. Shared conversation audio follows the synchronized scene, without duplicate TTS or looping cues.

## Approval checklist for each take

Listen alone, then in a real fight with music and voices. Check clear onset, sensible weight, no hiss/click/clipped ending, no accidental words or music, and no painful bright tone. Trim dead air. Test a loop over several repetitions and its stop transition. Test common effects quickly repeated; test warning sounds while several enemies attack. Check headphones, laptop speakers and low volume.

Keep a cue only if it communicates its action, fits its class/material, and still leaves room for other important sounds. Save the raw generation and the edited approved take separately. The catalog's progress tracker is browser-local; export progress to move it between devices. It is not the future private voice studio and uploads nothing.

## What this does not claim

No generated audio has been auditioned in this task because no generation was requested. No current sample has been overwritten. The list is comprehensive against inspected registries and approved plans, but future mechanics can add needs. Re-run coverage checks when skills, enemies or bosses change. New prompts are creative recommendations; they do not silently approve new game mechanics, rename levels, or settle open lore questions.
