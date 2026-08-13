/* WHICH COPY OF AN ENEMY ACTUALLY HITS A GUEST - the one the guest SEES, or the one the host has?

   docs/MP_AUDIT.md and docs/BACKLOG.md item 1 both state the consequence of the position desync as
   "a guest can be hit by an enemy that is visibly somewhere else on their screen", and BACKLOG puts
   it first on that basis. Every OTHER number in that audit is a measurement. That sentence is not:
   it is an inference from "position is never reconciled", and it only follows if a host's copy is
   what decides a guest's damage.

   Enumerating the code says it is not. hurtPlayer has thirteen call sites (hazards 8841-8945, the
   arena bot 12902, boss telegraphs 13327/13332/13335, melee contact 13471, a projectile 13504, a
   beam 13806) and every one of them tests the LOCAL G.p against a LOCAL body. The host->guest
   message set is hello/place/arena/teams/state/revive/wipe/pdmg/petdmg/score/cfx/mark/ping/pong
   (onGuestData, 12232-12268) and the only one that damages the receiver is pdmg, which is PvP.

   An enumeration is still a reading, so this measures it instead, in the one arrangement that can
   only come out one way:

     TRIAL A - the enemy is ON the guest locally, and every host snapshot says it is 500 units away.
               Damage here means the LOCAL copy hits, and the audit's sentence is wrong.
     TRIAL B - the mirror image: locally 500 units away, every snapshot says it is on top of the
               guest. Damage here means the HOST's copy hits, and the audit's sentence is right.
     TRIAL C - control: far in both pictures. Any damage here means the bench is measuring something
               other than this enemy, and A and B mean nothing.

   Snapshots are applied through MP.applyEnemies - the real receive path - once per frame, which is
   four times the rate a real host sends at, so the host's picture cannot be said to have gone stale. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  const p = G.p;
  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);

  let stamped = 0;
  for(const e of live()){ if(e.mid == null) e.mid = 900000 + (stamped++); }
  if(!live().length) return JSON.stringify({ ok:false, why:'no live enemies here to measure' });

  /* One subject. Every other enemy is put to sleep and parked far away so nothing else can reach the
     player - otherwise a wandering neighbour's blow lands in the damage counter as this one's. */
  const all = live();
  const subject = all[0];
  const parked = [];
  for(const e of all){
    if(e === subject) continue;
    parked.push(e);
    e.active = false; e.dropT = 9999; e.x = p.x + 12000; e.z = p.z + 12000;
  }
  subject.active = true; subject.dropT = 0; subject.hp = subject.maxHp = 1e6;   // it must not die mid-trial

  const wasActive = MP.active, wasHost = MP.isHost, wasGot = MP._gotEn, wasKilled = MP._killed;
  const FAR = 500, TICKS = 180;   // 3s at the game's own step

  /* THE FAR SPOT HAS TO HAVE A FLOOR UNDER IT, and the first run of this probe did not check.
     index.html:13463 is an edge guard - an enemy standing where highestSurfaceAt returns nothing is
     put back at e.sx/e.sz, its last safe position - so a subject teleported onto a hazard silently
     RETURNED to where trial A had left it, which was on top of the player. Every trial then read
     gap 0 and the control lost HP. Pick a bearing that has ground on it instead of assuming +500,+500
     does, and report which one, so a future reader can see the staging rather than trust it. */
  let far = null;
  for(let i = 0; i < 16 && !far; i++){
    const a = (i / 16) * Math.PI * 2, x = p.x + Math.cos(a) * FAR, z = p.z + Math.sin(a) * FAR;
    let s = -1e9; try { s = B.highestSurfaceAt(x, z); } catch(err){}
    if(s > -1e8) far = { x:x, z:z, y:s, bearing:Math.round(a * 57.3) };
  }
  if(!far) return JSON.stringify({ ok:false, why:'no floored spot ' + FAR + ' units from the player' });

  function trial(localOnTop, snapOnTop){
    // stage the local copy
    if(localOnTop){ subject.x = p.x; subject.z = p.z; subject.y = p.y; }
    else { subject.x = far.x; subject.z = far.z; subject.y = far.y; }
    subject.sx = subject.x; subject.sz = subject.z;   // the edge guard's own memory, or it snaps back
    subject.vx = subject.vz = 0; subject.hurtKbX = subject.hurtKbZ = 0;
    subject.speed = 0;                       // it must not walk between the two pictures mid-trial
    subject.hp = subject.maxHp = 1e6;
    p.hp = p.maxHp = 1e6; p.invuln = 0; p.dodgeTimer = 0; p.downed = false;

    MP.active = true; MP.isHost = false; MP._gotEn = false; MP._killed = {};
    let lost = 0, applyThrew = null, contactFrames = 0;
    const trace = [];
    for(let k = 0; k < TICKS; k++){
      const sx = snapOnTop ? p.x : far.x, sz = snapOnTop ? p.z : far.z;
      try { MP.applyEnemies([[subject.mid, MP.typeIdx(subject.type), Math.round(sx), Math.round(sz),
                              1e6, 1e6]], null); }
      catch(err){ if(!applyThrew) applyThrew = String(err && err.message || err); }
      const hp0 = p.hp;
      try { B.update(1 / 60); } catch(err){}
      if(p.hp < hp0) lost += hp0 - p.hp;
      p.hp = p.maxHp; p.invuln = 0; p.dodgeTimer = 0;   // keep the observer alive and hittable
      if(Math.hypot(subject.x - p.x, subject.z - p.z) < (subject.r + p.r)) contactFrames++;
      /* REPORT THE SUBJECT, do not guess at it. The first run of this probe came back with the
         subject on the player in all three trials including the both-far control, which says the
         staging failed and says nothing about which copy hits. Same lesson as the Dead Aim row: a
         bar that fails tells you THAT something is wrong and never WHAT. */
      if(k % 45 === 0) trace.push({ k:k, gap:Math.round(Math.hypot(subject.x - p.x, subject.z - p.z)),
                                    ex:Math.round(subject.x), ez:Math.round(subject.z),
                                    px:Math.round(p.x), pz:Math.round(p.z),
                                    spd:Math.round(subject.speed||0), lost:Math.round(lost) });
    }
    MP.active = wasActive; MP.isHost = wasHost; MP._gotEn = wasGot; MP._killed = wasKilled;
    return { hpLost: Math.round(lost), localContactFrames: contactFrames,
             localEndDist: Math.round(Math.hypot(subject.x - p.x, subject.z - p.z)),
             threw: applyThrew, trace: trace };
  }

  const A = trial(true,  false);   // local: on top.  host says: far.
  const B_ = trial(false, true);   // local: far.     host says: on top.
  const C = trial(false, false);   // both far.

  const verdict = (A.hpLost > 0 && B_.hpLost === 0 && C.hpLost === 0) ? 'LOCAL copy hits the guest'
                : (B_.hpLost > 0 && A.hpLost === 0 && C.hpLost === 0) ? 'HOST copy hits the guest'
                : 'inconclusive - read the trials';

  return JSON.stringify({
    ok: true, at: G.areaName,
    subject: { type: subject.type, r: subject.r, dmg: subject.dmg, spec: subject.spec || null },
    farSpot: far, parkedOut: parked.length, seconds: TICKS / 60,
    trials: { A_localOnTop_hostFar: A, B_localFar_hostOnTop: B_, C_bothFar: C },
    verdict: verdict,
  });
})()
