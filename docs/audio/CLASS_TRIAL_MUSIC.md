# Class trial soundtrack — October 18, 2026

Oliver requested ElevenLabs music for every actual class trial, with one triumphant epic song shared by Warrior, Ranger and Mage. These are original instrumental generations; no existing artist/song reference was requested. Model: music_v2_5, force_instrumental=true. Official endpoint: https://elevenlabs.io/docs/api-reference/music/compose . Existing Starter plan verified active before requests; source request/song IDs and hashes are preserved in audio-source/music/class-trials-20261018/manifest.json. Credentials remain outside the repository.

## Music

| Trial | Track | Length | Direction |
|---|---|---|---|
| Warrior / Ranger / Mage | First Steps, Great Heroes | 120s | Bright heroic orchestral adventure |
| Berserker | Heart of the War Drum | 90s | Primal drums, low brass and fierce fiddle |
| Ninja | Crimson Silence | 90s | Agile plucked strings, flute and precise percussion |
| Pirate | Trial of the Red Wake | 90s | Swashbuckling fiddle, concertina and sea-adventure brass |
| Chronomancer | Between the Seconds | 90s | Interlocking celesta, harp and clockwork motifs |
| Paladin | Oath of the Dawn | 90s | Radiant horns, bells and stately resolve |
| Pyromancer | Dance of the Living Flame | 90s | Whirling strings, hand percussion and rising flame motifs |
| Reaper | Edge of the Veil | 90s | Spectral cello, glass harmonics and sweeping strings |
| Necromancer | The Bone Sovereign | 90s | Bassoon, bone-like wooden percussion and ominous organ |

## Delivery and limits

Full originals retained. Runtime copies: stereo44100Hz128kbps MP3, target-21LUFS/-2dBTP with short25ms/80ms edge fades; measured loudness and peaks recorded in art-validation. Total14minutes, about13.45MB. No startup preload; only the selected scene streams. Native game loop/crossfade, volume, mute, pause and narrator/dialogue ducking retained. Class music continues through mentor dialogue; unknown trial contexts retain the original fallback. Hub/campaign tracks and existing SFX/voices unchanged. Listening preview: /3d/trial-music.html (no autoplay, only one player active).

Fresh account before:33240 credits. Settled API usage:10500; remaining22740. Nine successful generation requests; no re-rolls/retries. Saved sources and exact prompts permit further editing without discarding originals.

## Verification

Source tests: all11 actual TRIALS entries, nine unique soundtrack files, starter sharing, all modes and unknown fallback, source/runtime hashes, duration/stereo/size; original40track soundtrack hashes retained. Narration264, onboardingcontrols26 and co-opaudio52 regressions passed. Real muted Chrome loaded an isolated legacy level100/1145gold save; entered every real class trial; correct track persisted into dialogue with the same audio element. All nine files decoded fully in Chrome. Playback/pause/resume/mute/volume/dialogue duck verified; all test audio forcibly muted. Listening page responsive at390px without horizontal overflow. Evidence under docs/art-validation/trial-music-20261018/.

Muted decoding/inspection is technical verification, not a subjective listening verdict or a two-human co-op audio mix test. Musical loop seams and taste should be evaluated from the listening preview. No gameplay/difficulty/save schema changes.
