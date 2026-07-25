// GET /turn  →  mint short-lived Cloudflare TURN credentials for multiplayer WebRTC.
//
// Why this exists: every free public TURN relay is dead, so cross-network co-op (friends on
// different networks / mobile data) can't connect on STUN alone. Cloudflare TURN gives real
// relay credentials, but they must be generated from a SECRET token — which must never sit in
// the public game file. This Pages Function holds the secret (Cloudflare env vars) and hands
// the browser only a short-lived username/credential.
//
// Setup (one time, in the Cloudflare dashboard for the bladefall Pages project):
//   Settings → Variables and Secrets → add:
//     TURN_KEY_ID   = your Realtime/TURN key's ID
//     TURN_TOKEN    = that key's API token   (mark as a Secret)
//   (Create the key under: Cloudflare dashboard → Realtime → TURN Keys → Create.)
//
// Responses are always 200 with JSON. If the key isn't configured yet, {error:'...'} comes back
// and the game silently falls back to STUN-only (same-network play still works).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-store',
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const kid = env.TURN_KEY_ID;
  const tok = env.TURN_TOKEN;
  if (!kid || !tok) return json({ error: 'turn-not-configured' });

  try {
    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${kid}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: 86400 }),
      }
    );
    const body = await r.text();
    if (!r.ok) return json({ error: 'cf-turn-' + r.status, detail: body.slice(0, 300) });
    // Cloudflare returns { iceServers: [ { urls:[...], username, credential } ] }
    return new Response(body, { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return json({ error: 'fetch-failed', detail: String(e) });
  }
}
