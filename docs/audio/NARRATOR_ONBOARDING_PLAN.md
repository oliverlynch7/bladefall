# Bladefall narrator and first player experience

## Status and scope

Voice B selected by Oliver and integrated in v2.287.0-voiced-onboarding. The final authored source is `scripts/build-onboarding-script.py`; exact recorded captions are in `docs/audio/onboarding-script-20261018.json`. Tables below preserve earlier proposals and are not the shipped transcript. 71 recorded variants cover tutorial practice/HUD tips, five lore cards, the hub tour and eight pause-menu buttons. Existing NPC recordings and preferred sound effects remain separate.

Grounding: `public/3d/guided-tutorial.js`, `hub-tour.js`, `index.html` (`STORY.origin`, `playOpening`, audio settings), `voice-content.js`, `docs/STORY_CANON.md`, current requirements and Voice Studio implementation. The tutorial currently has 18 regular lessons and one inserted first-skill lesson. The hub tour builds stops from actual hub objects, so its coverage must be checked against that generated list rather than a fixed count.

## Voice direction

An original mature British storyteller: warm, articulate, observant and lightly amused. Conversational authority rather than a booming fantasy trailer. The Stanley Parable is a reference for clear delivery and dry timing, not a request to reproduce its performer's voice or recognizable lines. Avoid constant sarcasm, jokes at the player's expense, and commentary over every action. Lore stays sincere. Instructions use one thought per sentence.

Audition direction: natural pace around 140–155 words per minute; slower for unfamiliar names; short pauses after instructions; restrained theatricality. Treat this as a target for listening, not a guaranteed provider control. Establish pronunciations of Aerth, Ian, Duskmoor and Waystation before recording the batch.

## New player sequence to freeze

1. Character creation remains playable without a narrator. Do not read every class description or customization control aloud.
2. Optional tutorial: introduce menu navigation and basic controls in safe practice. Let input complete an action lesson immediately. Combat remains active during later HUD tips unless an existing protected choice/menu opens.
3. First class rank: clear announcement, then required choice, then a short skill practice prompt. Avoid narration colliding with the celebration or repeating it when returning from the choice.
4. After the tutorial exit, play the five illustrated story cards. Skipping the tutorial must still lead to the story on a first playthrough. Returning saves do not repeat it automatically.
5. First hub visit: safe home base, Waystone, Briar Town, campaign progression, then services and optional modes. Keep Back, Next and Skip available. Finishing a spoken line must never advance a page automatically.
6. First campaign steps and first Rift Shard should reinforce what the player needs now. Do not expand this recording batch into all campaign dialogue.

Preserve: five story images; Ian's natural death; mortal lord's original search for immortality; one Eternal Gate at Duskmoor; changed travelers and recruitment preceding conquest; Thomas as the player's father. Do not reveal the soul prison, precise player ancestry or Bladeborn identity in the opening.

## Proposed tutorial voice script

These are draft spoken lines. The final approved line must also appear as its subtitle; do not play a shorter paraphrase over a different long caption. Live control badges and supplementary labels can show details separately.

| Stable ID | Spoken line |
|---|---|
| tutorial.welcome | Welcome. Let's try the controls somewhere safe. The enemies can wait. |
| tutorial.menu-keys | Press E to choose or continue, and Q to go back. Tab opens the main menu. Press E to continue. |
| tutorial.bag-practice | Press B to open your bag. Press B again, or Q, to close it. |
| tutorial.pause-practice | Press Tab to open the main menu. Settings lets you change controls and set up an Xbox or PlayStation controller. Press Q to return. |
| tutorial.move | Use W, A, S and D to move in different directions. |
| tutorial.jump | Tap Space for a short hop. Hold it briefly to jump higher. |
| tutorial.attack | Red health bars mark enemies. Face one and left-click to attack. You can also press J. |
| tutorial.dodge | Press left Shift or right-click to dodge an attack. In the air, the same control makes you dash. |
| tutorial.charge.available | This weapon can charge. Hold the left mouse button until it's ready, then release for a stronger hit. |
| tutorial.charge.unavailable | Some weapons have a charged attack. Yours doesn't, so there's nothing to practice here. |
| tutorial.vitals | Health keeps you alive. Mana fuels your skills. Basic hits restore a little mana; a break from skills helps it recover. |
| tutorial.objective | Defeat six enemies. After three, you'll choose your first skill. After six, find the exit portal. |
| tutorial.progress | Your character level gives you points to spend on stats. Your class rank unlocks skills and automatic bonuses. |
| tutorial.skills | Skills give you powerful attacks and other ways to fight. Watch their mana cost and recharge time. |
| tutorial.skill-use | Your first skill is ready. Face an enemy and press the number 1 to try it. |
| tutorial.bag | Chests give equipment. If your bag is full and Auto-sell is off, the chest stays closed. |
| tutorial.autosell | Auto-sell turns new equipment into gold, even when your bag has space. Leave it off to keep your finds. |
| tutorial.journal | Press N to open the journal for your clues and quest information. |
| tutorial.navigation | Gold marks your next objective. Blue marks friends, cyan marks pings, and red marks enemies. |
| tutorial.finish | You're ready to explore. Press Tab for the main menu. Settings and Help are there if you need them. |

There are 20 candidate tutorial clips for 19 prompts because charge has mutually exclusive weapon variants. Do not play both. The current attack prompt already mentions charging; remove that duplication only when the new text is integrated. The current stat lesson should also highlight the new remappable Stats shortcut, rather than relying only on the points button. Latest user direction: speak the default keys explicitly. Default keyboard takes say E to select/continue, Q to go back, Tab for the main menu and B for the bag; movement uses W/A/S/D, jump Space, attack left click (J alternative), dodge left Shift or right click, Skill 1 the number 1, and journal N. Teach rebinding and Xbox/PlayStation controller support in Settings → Controls & camera. Generate explicit controller variants and a custom-binding-safe alternative; never play default-key instructions when the active binding differs. Keep exact current bindings onscreen. These replace the earlier action-name-only proposal.

## Proposed five card lore script

Keep the current pictures and causal order. This draft is 153 words, about 60–70 seconds at the target pace before optional reading time.

| Stable ID | Spoken line |
|---|---|
| lore.opening.protector | For generations, Ian protected Aerth. He was a Bladeborn, able to face dangers that ordinary armies could not. |
| lore.opening.loss | Ian died of old age, and no new protector appeared. A wealthy lord feared that same end. He hired mages and scholars to find a way to stop aging and death. |
| lore.opening.promise | Together, they built the Eternal Gate at Castle Duskmoor. The lord promised that anyone who passed through would never grow old. Families came, hoping to save the people they loved. |
| lore.opening.conquest | The travelers returned ageless, but changed. The lord discovered they could not refuse his orders. He sent them to recruit more families, then turned his growing army against Aerth. He became the Abyss King. His army became the Hollowed Legion. |
| lore.opening.home | Now the Legion is coming for Briar Town, your home. Your father, Thomas, helps the neighbors build barricades. You choose to help them. First, the Waystation: a safe place to prepare for the journey. |

Do not name the unnamed lord, imply Ian was defeated, or explain late revelations. Next remains available during speech; final card has Enter the Waystation as the main action and no visible Skip Story button. Advancing stops the previous card's voice.

## Proposed hub script

| Stable ID | Spoken line |
|---|---|
| hub.overview | This is the Waystation, your safe home base. Prepare here, then take a portal into the adventure. |
| hub.waystone | The Waystone is your travel menu. Use it to return to places you've opened along the story. |
| hub.campaign | Start with Briar Town. This doorway leads to the first part of your adventure. |
| hub.campaign-route | Finish each story region to open the next. You can return here between adventures. |
| hub.quartermaster | Buy equipment here, or sell what you don't need. |
| hub.chest | Your bag holds your equipment. Open it to compare items and choose what to wear. |
| hub.anvil | The smith combines spare equipment into stronger gear. The forge shows what you can make and use. |
| hub.keeper | Visit the stylist to change your character's look. Outfits and other cosmetics don't change your strength. |
| hub.drillmaster | Change your fighting class here, or change the skills and bonuses you've chosen. |
| hub.beastkeeper | Companions travel and fight beside you. Rescue the dogs in the Black Woods to start buying and training companions here. |
| hub.mirror | Use the mirror for a closer look at your outfit and equipment. |
| hub.sparring | Practice fighting here. Inside, the bestiary explains the enemies you'll meet. |
| hub.bestiary | The bestiary shows each enemy, where it lives, and how it fights. |
| hub.abyss | Fight waves of enemies to earn gold, experience and equipment when you want to grow stronger. |
| hub.delve | Try to escape a prison dungeon. Between attempts, spend earned gold on permanent upgrades. This mode has separate saves from your story adventure. |
| hub.arena | Set up a practice battle against computer opponents or friends. Your adventure equipment stays safe. |
| hub.gauntlet | Fight powerful bosses one after another. Come here when you want a harder challenge. |
| hub.sprint | Race through a jumping course against the clock. This activity rewards fast times, not equipment. |
| hub.rifthall | Each story region hides five Rift Shards. Find all five to open its challenge here. Beat that challenge to unlock another fighting class. |
| hub.arcade | Take a break from the adventure with a small arcade game. |

Candidate coverage includes optional bestiary and arcade entries; record only actual stops that survive the flow review. The generated tour may include an object such as Thomas without a dedicated description. Enumerate its actual IDs and add intentional text or exclude it explicitly; never record its generic fallback. Lock notices are separate conditional text, not part of every recording.

## Recording and playback contract

- Author one approved caption/transcript per stable semantic ID, with explicit conditional variants. Store a SHA-256 of normalized approved text, voice ID, model/settings, pronunciation revision, take ID, duration and audio-file hash. A take is valid only for that text and voice revision. Preserve prior takes; never silently replace the original.
- Existing `BFVoiceContent` already checks exact dialogue text before applying approved Voice Studio audio. Extend the same principle to narration through a separate onboarding adapter. It currently applies dialogue book nodes; it does not already narrate these lessons or slides.
- One foreground speech channel. A new lesson, page, scene, skip, conversation or exit cancels the old voice and any pending fetch/decode. Use a generation token so a late load cannot start a departed line. No queue of obsolete tutorials. Co-op playback stays local; a friend advancing their own tutorial must not start or cancel your narrator.
- Let players read, act, skip and continue at any time. No extra invulnerability, freezes, mandatory listening time, or waiting for voice completion. Resume from menus without repeating already-heard prompts by accident; provide explicit Replay for a line.
- Independent narration enable/volume, visible matching captions, Replay and immediate mute/stop. Honor master mute and browser autoplay restrictions. If playback is unavailable, continue with text and controls normally. Do not speak every changing HUD number. Duck music modestly during speech; preserve combat warnings and important effects.
- Keep recorded narration separate from optional NPC device TTS. Do not launch device speech and recorded speech for the same line. Cache and preload only a small upcoming set, avoiding a large startup download on already-sensitive first-level loads.

## Next work and acceptance

1. Integrate and test concise text without recordings: first-time and returning saves, skip/replay routes, three starter classes, chargeable/non-chargeable weapons, rebinding, controller labels, protected rank choice, co-op independence and a normal uncut onboarding run. This audit is source inspection, not proof of that full runtime experience.
2. Freeze the script and pronunciation guide. Use three candidate voices reading the same three short samples: welcome, menu navigation and the Gate promise. Compare intelligibility, warmth and pacing. Choose one before bulk generation. Do not spend on three complete scripts.
3. Produce approved clips with generation records and exact transcript mapping. Review acoustic quality by listening before replacing any audio; automated checks establish decoding/hashes/coverage, not good acting.
4. Verify slow network, audio failure, rapid Next/Back, skip during loading, mute while speaking, background tab, replay, and co-op players on different screens. Fail stale mappings closed to text, not outdated speech. Only then publish narration.

No provider pricing, credit estimate or exact voice/model availability is assumed here. Check current ElevenLabs documentation and account balance when scheduling the audition.

## October 18 control and pacing clarification

Tab opens the main menu; B toggles the bag; Q is Back/Close, E selects or continues. Escape remains a menu fallback. Preserve deliberate custom bindings and migrate known former Tab/Bag defaults. After a practice action succeeds, show success for two seconds of active play before advancing; do not lock movement or count menu/background time. The first menu opening explains Gear, Bag, Classes, Achievements, Settings, Multiplayer, Quit to Hub and Title Screen with a replay option. Skipping tutorial lessons is an explicit visible action, separate from opening or closing the menu. No narration audio has been generated or wired yet.

The eight menu explanations now live in `public/3d/menu-tour.js`; use those entries as the source when preparing their spoken transcript rather than maintaining a second independent menu script. The published playback adapter and audio are still future work.

## Narrator audition ready

Three original Voice Design candidates A/B/C read the same279-character control, jumping and lore sample. Their stable voice identities are saved in the ElevenLabs library; no existing voice was removed. The public comparison page supports one active player, Stop, volume, a page-only personal pick and MP3 downloads. This is not narration integration or approval of the full script. Generation records and original takes: audio-source/voice/narrator-audition-20261018/. Settled balance changed36564→36285 (279 credits).


## [Codex | 2026-10-18] Narrator B selected

Oliver chose audition B: "B is best." Lock the already saved ElevenLabs identity Bladefall Narrator B for tutorial and lore narration; do not regenerate a substitute voice. Exact voice ID is preserved in audio-source/voice/narrator-audition-20261018/manifest.json under selection. This approves the voice, not every draft line. Full-script recording/integration remains pending finalized wording. No new credits spent or game audio changed.


## [Codex | 2026-10-18] Production integration

Voice B uses the saved approved voice identity. Recorded defaults explicitly teach controls; changed bindings and controllers select matching adapted recordings while live badges show the actual inputs. Every take is bound to an exact text hash. Pages never wait for audio or advance because audio ended. Replay, narrator mute and independent volume are available. Late playback/loading promises cannot revive abandoned lines; loading defers the current valid line only. Backgrounding, menus, advancing or skipping stop speech; music ducks during narration. Batch cost settled at 3,045 credits, leaving 33,240. All 71 MP3s decoded in muted Chrome. Hardware-controller and two-human co-op listening remain untested.
