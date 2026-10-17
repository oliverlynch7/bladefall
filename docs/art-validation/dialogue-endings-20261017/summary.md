# Dialogue endings — v2.235

## [Codex | 2026-10-17] U-DIALOGUE-ENDINGS-20261017

User wants the main click-through path to end in Leave conversation, never endlessly return through the same lines. Reopening the NPC may repeat information. Genuine optional quests/lore remain available separately.

Changes:
- Campaign transaction engine retains every visited line for the current conversation, including explicit topic navigation. Returning to an already-read line ends that conversation instead of clearing history and restarting it.
- Normal terminal lines have one primary Leave conversation action. Informational return responses use that same label. Required quest/encounter effects still commit atomically before an action ends the conversation; already-applied effects cannot republish a note or reward.
- Remaining questions/quests appear in the optional section. Menus with nothing unread or newly available are not offered, nor are duplicate routes to a question already linked from the current line. Selecting optional topics does not reset the main-loop protection. Reopening starts a new path history and preserves normal saved-cursor progression.
- Service NPC explanations end by closing, rather than automatically returning to services or opening a shop. Explicit service buttons remain available. Cursor/news acknowledgement persists normally.
- Duplicate main/footer Leave buttons removed for the speaker. A listening co-op player keeps one enabled local exit, without control of the speaker's choices. Generation guard prevents a superseded choice timer from focusing/enabling an obsolete response.
- Dash's actual race retry is explicitly repeatable; final encounter triggers, turn-ins, rewards, and declined-quest gates remain intact. No story text, quest objectives or reward values rewritten.

Verification:
- 103 offline suites pass. New regression covers94 ordinary NPC/preset primary paths reaching an ending, old saved cursors, repeat-on-reopen, optional Simon dragon quest after main information, legitimate race retries, final encounter start, metadata-preserving note dedupe, forged close rejection, and speaker-only close/replay.
- Updated five existing tests to the requested ending contract: dead ends display Leave, fresh interaction may replay reminders, and another question after a completed response requires reopening the NPC. Reward/gate/progression assertions remain in place.
- Actual local browser, disposable Map-backed pre-change level100 save: Caleb main path ends with primary Leave, unread question stays under More questions, reading it leaves exactly one Leave button, clicking closes to play, talking again can repeat the reminder. Quartermaster guide closes directly to play. Listener presentation has a working local exit and no clickable speaker action. No production save storage changed and no two-device network claim.
- Inline parser, changed module syntax and primary-checkout focused checks. Production pending.
