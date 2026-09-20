# Bladefall Voice Studio

Open https://bladefall.pages.dev/3d/voice-studio/ and sign in with the owner key in your private access file. Do not share that key or commit it to Git. You can use it on your phone and computer. Your wife can record on your setup. No active Codex session is needed.

## Record a scene

1. Choose Thomas or Mara. Read the scene context and performance direction. Player responses are context, not lines you need to record.
2. Read the line once. If you change wording, press **Save wording** before recording.
3. Press **Record a take**, allow microphone access, speak, then **Stop & save**. Wait for **Take saved online**.
4. Play the selected take. Record again if needed; older takes remain in the list.
5. Press **Approve & use this take** when happy. That exact take is official and available to the dialogue preview. Full in-world NPC playback comes with the NPC integration batch.
6. Use **Next line**. Thomas has five lines; Mara has seven. Some lines are alternate responses, so you will not hear all of them in one playthrough.

The microphone is requested only when you press Record. Browser recording format varies (WebM/Opus or MP4 where supported). Original files are preserved; the studio does not pretend these recordings are uncompressed WAV masters. You may upload a recording made elsewhere instead. Maximum upload size is 12 MB per take; recording stops after three minutes.

## Saving and recovery

Saved online means it reached the private server storage. You can then open the same library on your other device. Pending means the browser still has a local copy; keep that browser/device until upload succeeds. If an upload fails, use **Retry upload**, or download the unsynced take before clearing site data. The studio keeps periodic local chunks during capture, but an OS/browser crash may interrupt the last chunk. Listen before approving an interrupted recording.

Use **Back up this line** after finishing a line. It downloads JSON containing all its audio bytes, wording and approval metadata, not just server links. **Restore a line backup** adds missing takes and checks their hashes. It does not overwrite your current wording or current official selection; to restore older wording, copy the recorded wording from the take details, save it and approve that take. Large line backups above the built-in limit require downloading individual originals.

Changing wording retains older takes but removes mismatched audio from game playback until you approve a matching take. Draft recordings remain private. Only explicit approval publishes the selected current-wording take. Library changes on another device can cause a save conflict: refresh and review before overwriting.

## First release limits

The first batch contains twelve Thomas/Mara lines. More hub and campaign scenes will be added using the same IDs and workflow. The in-world NPC models, camera moves, mouth movement and co-op dialogue are not complete in this release. Browser tests used generated test audio; please check your actual microphone and phone before a long recording session. Try one short take, play it back, then open it on your other device.
