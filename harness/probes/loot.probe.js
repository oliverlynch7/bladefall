/* IS LOOT SHARED, OR IS IT ALREADY EACH PLAYER'S OWN?

   docs/superpowers/plans/2026-08-11-multiplayer-experience.md Task 4 says personal loot is
   "missing", from a research table row that read "No per-player loot ownership". Before building an
   ownership system, this asks the game.

   What the code says, so the measurement below has something to disagree with: nothing about a
   pickup is ever transmitted. The host's packet is `{en, ek}` — an enemy snapshot of
   `[mid,type,x,z,hp,maxHp]` and a kill list of `[mid,type,elite,boss,xp]` (11573, 11625). A guest
   that receives a kill runs its OWN `killEnemy` under `_authKill` (11775), or `creditKill` (11776)
   when it never saw the body, and both paths reach `rollDrop` with the guest's own `Math.random()`.
   So each client would already roll its own item from the same corpse, and `G.pickups` would never
   be shared at all.

   That is a reading, and reading source is not proof. This drives MP's own `applyEnemies` — the
   real receive path, not an imitation of it — and counts what lands in the guest's own pickup list.

   THE ASSERTION THAT MATTERS is the one a shared-loot game would fail: a guest that never lands a
   hit, and in the credit path never even sees the body, still earns its own drops. If loot were the
   host's to hand out, both numbers below would be zero.

   NO GAME FLAG IS ADDED FOR A KNOWN-BAD HERE, and that is a deliberate departure from ?breakgap /
   ?heroslot / ?heroonerig / ?noparty. Those four each disable a behaviour this repo WROTE. Personal
   loot here is not a feature that was written; it is a property of the packet never carrying an
   item, so the only way to fake its absence would be to add a code path to the game that exists
   solely to be wrong. Trial 4 is the negative control instead: the identical call with the guest
   flag off reads 0 drops from 200 kill events, which is exactly the shape the regression would take
   (a guest earning nothing from the host's kills) and proves the counter is not simply reading
   pickups that were already lying on the floor. */
(function(){
  const G = __BF3.G, MP = __BF3.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!G || !G.p) return JSON.stringify({ ok:false, why:'no live run to kill into' });

  const SAVED = { active:MP.active, isHost:MP.isHost, pvp:MP.pvp, zone:MP.zone,
                  peers:MP.peers, killed:MP._killed, gotEn:MP._gotEn };
  const loot = () => (G.pickups || []).filter(pk => pk.weapon || pk.armor || pk.trinket).length;
  const clear = () => { G.pickups.length = 0; MP._killed = {}; };
  const guest = (on) => { MP.active = !!on; MP.isHost = false; MP.pvp = false; MP.peers = {}; };

  /* xp 0 on purpose: creditKill calls gainXp, and levelling the hero hundreds of times mid-probe
     changes rarityCap and therefore the very roll being counted. */
  const killEvents = (n, from, elite) => {
    const ek = [];
    for(let i = 0; i < n; i++) ek.push([from + i, 0, elite ? 1 : 0, 0, 0]);
    return ek;
  };

  let out;
  try {
    /* ── 1. CREDITED KILLS: the guest never even saw the body ─────────────────────────────────
       600 trials against a ~5.3% non-elite drop chance. A shared-loot game gives exactly 0. */
    guest(true); clear();
    MP.applyEnemies([], killEvents(600, 100000, false));
    const credited = loot();

    /* ── 2. MIRRORED KILLS: the guest holds the body and runs its own death path ───────────────
       Elite, so the drop chance is ~33% and 60 bodies is a decisive sample rather than a hopeful
       one. These are spawned by the probe and given mids, which is what byMid() looks them up by. */
    guest(true); clear();
    G.enemies.length = 0;
    const MID = 200000;
    let spawned = 0;
    for(let i = 0; i < 60; i++){
      let e = null;
      try { e = __BF3.spawnEnemy('grunt', G.p.x + 300 + i * 6, G.p.z - 300); } catch(err){}
      if(e){ e.mid = MID + i; e.active = true; e.dropT = 0; e.mirror = true; e.elite = true; spawned++; }
    }
    MP.applyEnemies([], killEvents(spawned, MID, true));
    const mirrored = loot();
    const stillAlive = (G.enemies || []).filter(e => e.mid >= MID && !e.dead).length;

    /* ── 3. THE SNAPSHOT HALF CARRIES NO LOOT ─────────────────────────────────────────────────
       An enemy snapshot with no kill list must not produce a single pickup. If a future packet ever
       started carrying items, this is the assertion that would go red. */
    guest(true); clear();
    G.enemies.length = 0;
    const en = [];
    for(let i = 0; i < 30; i++) en.push([300000 + i, 0, G.p.x + 200, G.p.z - 200, 50, 50]);
    MP.applyEnemies(en, null);
    const fromSnapshot = loot();

    /* ── 4. CONTROL: not a guest, so the receive path must do nothing at all ───────────────────
       Without this, "0 pickups" in trial 3 could just mean applyEnemies never ran. */
    guest(false); clear();
    MP.applyEnemies([], killEvents(200, 400000, true));
    const whenNotAGuest = loot();

    out = {
      creditedKills: { of: 600, drops: credited },
      mirroredKills: { of: spawned, drops: mirrored, leftAlive: stillAlive },
      snapshotOnly: { of: 30, drops: fromSnapshot },
      notAGuest: { of: 200, drops: whenNotAGuest },
    };
  } finally {
    MP.active = SAVED.active; MP.isHost = SAVED.isHost; MP.pvp = SAVED.pvp;
    MP.zone = SAVED.zone; MP.peers = SAVED.peers;
    MP._killed = SAVED.killed; MP._gotEn = SAVED.gotEn;
    G.pickups.length = 0; G.enemies.length = 0;
  }
  return JSON.stringify(out);
})()
