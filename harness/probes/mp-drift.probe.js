/* CAN A GUEST BE HIT BY AN ENEMY THAT IS SOMEWHERE ELSE ON THEIR SCREEN?

   Sub-project D Task 2. The documented co-op failure is that the host plays a lag-free game while a
   guest plays a delayed one, so the host is simply better at it. The plan expected to find drift and
   to weigh it against enemy reach.

   The measurement below is deliberately in three parts, because the first thing this found is that
   the plan's question had a simpler answer than it assumed:

   1. IS POSITION RECONCILED AT ALL? Asked by DOING it, not by reading applyEnemies. A snapshot is
      built from the live enemies with every x and z moved a long way, the game is put into guest
      mode for exactly the length of that one call, and the enemies are measured afterwards. If the
      guest adopts the host's positions they will have moved; if it does not, drift is not damped by
      anything and grows for as long as the two simulations disagree.

   2. HOW FAR DOES AN ENEMY GO? Path length and net displacement over 30 simulated seconds. This is
      the SCALE of the disagreement that is available to accumulate - an upper bound on drift, and
      the honest one to compare against reach, because nothing is correcting it.

   3. WHAT IS REACH? The game's melee contact test is a radius sum, so reach is read off the enemies
      themselves (e.r) rather than named here.

   WHAT THIS IS NOT: a network measurement. No session is held and no packet crosses a wire. It
   measures what the guest's own code does with a host snapshot, which is the half that lives in this
   repo. Two real machines remain the final check for latency and jitter. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && e.mid != null && !e.practice && !e.dummy);

  /* The campaign spawns with mid == null (mids are assigned by the host when a session starts), and
     applyEnemies is keyed entirely on mid - so without one there is nothing for a snapshot to
     reconcile TO and part 1 would measure an empty list and call it "no sync". Stamp them the way a
     host would. */
  let stamped = 0;
  for(const e of (G.enemies || [])){
    if(e && !e.dead && !e.practice && !e.dummy && e.mid == null){ e.mid = 900000 + (stamped++); }
  }
  const before = live().map(e => ({ mid:e.mid, type:e.type, x:e.x, z:e.z, r:e.r }));
  if(!before.length) return JSON.stringify({ ok:false, why:'no live enemies here to measure' });

  /* ---- 1. does a host snapshot move a guest's enemies? ---------------------------------------- */
  const SHIFT = 500;
  const snap = before.map(e => [e.mid, MP.typeIdx(e.type), Math.round(e.x + SHIFT), Math.round(e.z + SHIFT),
                                9999, 9999]);
  const wasActive = MP.active, wasHost = MP.isHost, wasKilled = MP._killed, wasGot = MP._gotEn;
  let applyThrew = null;
  MP._killed = {};                       // a fresh kill ledger, so nothing here is credited twice
  MP.active = true; MP.isHost = false;   // applyEnemies returns immediately unless guest() is true
  try { MP.applyEnemies(snap, null); } catch(e){ applyThrew = String(e && e.message || e); }
  MP.active = wasActive; MP.isHost = wasHost; MP._killed = wasKilled; MP._gotEn = wasGot;

  const byMid = {}; for(const e of live()) byMid[e.mid] = e;
  let moved = 0, hpTook = 0;
  for(const b of before){
    const e = byMid[b.mid]; if(!e) continue;
    if(Math.hypot(e.x - b.x, e.z - b.z) > 1) moved++;
    if(e.maxHp === 9999 || e.hp === 9999) hpTook++;
  }

  /* ---- 2. how far does an enemy travel while nothing corrects it? ------------------------------
     TWO THINGS HAD TO BE SET UP, and the first version of this measured neither, reported every mob
     as having travelled 0 units, and would have been read as "there is nothing to drift".
     - ENEMIES SPAWN ASLEEP. active:false and a ~1.2s dropT drop-in timer; the game wakes them when a
       player comes near. A probe that stands at the entrance for thirty seconds watches a level in
       which nothing happens. They are woken here through the game's own two fields, not moved.
     - AND THE PLAYER HAS TO BE WORTH CHASING. A stationary observer is converged on once and then
       stood next to, which measures the distance to the entrance rather than the distance a mob
       covers in a fight. The player walks a wide circle through the game's own input channel, which
       is the shape of a real engagement - and it is exactly the disagreement two clients can have,
       because on the other screen this mob is chasing somebody else entirely. */
  for(const e of live()){ e.active = true; e.dropT = 0; }
  const IN = B.input, meta = B.meta;
  const camWas = meta.camMode; meta.camMode = 'far';    // world-space steering; camera-relative spins
  const start = live().map(e => ({ mid:e.mid, type:e.type, x:e.x, z:e.z, r:e.r, path:0, px:e.x, pz:e.z }));
  const track = {}; for(const s of start) track[s.mid] = s;
  const TICKS = 1800;                    // 30 seconds at the game's own step
  for(let k = 0; k < TICKS; k++){
    const a = (k / 60) * 0.5;            // one slow lap, so the mobs are led rather than parked on
    IN.jx = Math.cos(a); IN.jz = Math.sin(a);
    try { B.update(1 / 60); } catch(e){}
    G.p.hp = G.p.maxHp || 100;           // the fight must not end early by killing the observer
    for(const e of live()){
      const s = track[e.mid]; if(!s) continue;
      s.path += Math.hypot(e.x - s.px, e.z - s.pz);
      s.px = e.x; s.pz = e.z;
    }
  }
  IN.jx = 0; IN.jz = 0; meta.camMode = camWas;
  const rows = [];
  for(const e of live()){
    const s = track[e.mid]; if(!s) continue;
    rows.push({ type:s.type, r:Math.round(s.r),
                travelled:Math.round(s.path),
                net:Math.round(Math.hypot(e.x - s.x, e.z - s.z)) });
  }
  rows.sort((a, b) => b.travelled - a.travelled);

  return JSON.stringify({
    ok: true, at: G.areaName, seconds: TICKS / 60,
    reconcile: { enemies: before.length, movedBySnapshot: moved, hpAdoptedFromSnapshot: hpTook,
                 shiftAsked: SHIFT, threw: applyThrew },
    travel: rows.slice(0, 12),
    survivors: rows.length,
  });
})()
