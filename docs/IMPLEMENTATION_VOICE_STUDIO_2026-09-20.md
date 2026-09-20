# Voice Studio implementation — September 20

Grounded plan: Cloudflare CLI can access the existing Bladefall Pages project and R2 service. No existing studio/auth was found. Add an isolated private R2 bucket, an authenticated Pages API, and a phone/desktop recording interface. Use an owner-only high-entropy access key delivered in a private local file; store its hash and cookie-signing secret as Pages secrets, never source or browser storage. Signed HttpOnly secure cookies expire; same-origin mutation checks and conditional R2 writes prevent cross-site writes and stale edits. The public app shell contains no private takes. Only explicitly approved, current-revision audio is exposed by the game endpoint.

Takes are immutable audio objects with content hashes, recording text/revision, line ID, duration and MIME. Per-line metadata uses optimistic ETag updates. Uploaded audio is retained if metadata needs retry. Browser IndexedDB retains unsynced recordings; explicit backup includes audio bytes. Retakes do not delete previous takes. Text edits preserve old takes and invalidate current playback approval until reapproved against matching text. Backup restore adds takes without overwriting unrelated current work.

Initial content: existing twelve Thomas/Mara nodes, enriched in the SAME JSON graph with scene/context/direction/readiness. No duplicated script maintained for the studio. Recording-ready refers to the authored scene, not the completion of in-world NPC placement.

Validation: local backend auth/CAS/approval/backup tests, browser recording with a synthetic microphone (clearly not a real human microphone test), two-browser storage checks, mobile layout, deployment verification. Real phone microphone and owner-device acoustic quality remain user checks.

References: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/ (conditional writes and consistency); https://developers.cloudflare.com/pages/functions/bindings/ (Pages storage binding); https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static (format selection).

## Verification and infrastructure

Private bucket bladefall-voice-private created; r2.dev public access disabled and no custom public domain. Wrangler-supported secret commands configured the owner-key hash and signing secret. Private owner instructions are outside the repository. Existing Pages name/output/compatibility date preserved; binding added in wrangler.toml. Existing TURN function left intact, and explicit function routes cover /turn and /voice-api/* only. No existing account service data touched.

Reducer regression and Voice API unit suite passed. Thirteen browser checks passed: shared twelve-line script, recording lock, MediaRecorder capture using synthetic stream, uploaded audio playback, selected take approval, backup, stale-take handling, refresh, import, failed-upload retention/retry, phone overflow and logout. A second isolated browser context loaded the same saved text/audio and approved it; the dialogue preview consumed that approved text/audio. Exported browser audio restored into empty mock storage with identical hashes and take IDs. Screenshots reviewed at 390px and 1280px. This is not proof of actual iPhone/Safari microphone behavior or acoustic quality.

Initial automatic setup command was blocked without a detailed reason. No credential-reading API workaround used; provider configuration proceeded through supported Wrangler commands. No human microphone was captured by automated QA. Test audio lives only in local test storage.
