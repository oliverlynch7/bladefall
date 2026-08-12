/* THE PICTURE for Rage — the frame `rage.probe.js` measures.

   Run:
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/rage-blocked.png \
          --eval @harness/probes/rage-shot.probe.js

   Holds the game a few frames after a Berserker at 15% health walks over the Arena's heal orb: the
   orb's own green "+191 ♥" is still in the air, the RAGE — NO HEALING floater is under it, and the
   health bar still reads what it read before. All three in one frame is the card's sentence — "below
   a quarter health you cannot be healed" — and it is the one thing the numbers cannot show.
   The measurements are the other probe's job; this only has to be looked at. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';
  for(const a of (__BF3.ARCHEIDS || [])){
    let w = null; try { w = __BF3.makeWeapon(a, 'common'); } catch(e){}
    if(w && __BF3.classFamilyOk(w)){ p.weapon = w; break; }
  }

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'bsk_heavy'; cs.ch[5] = 'bsk_thick'; cs.ch[9] = 'bsk_tough';
  cs.ch[7] = 'bsk_rage';

  __BF3.ARENA_LOADOUT.powerups = true;      // the orbs are an opt-in Arena variant (12597)
  G.enemies.length = 0;
  G.arenaPk = []; G._pkT = 999;

  /* NO invuln here, unlike the measuring probe: the hero is not DRAWN on alternating i-frames
     (17362), so a bench that makes itself untouchable photographs an empty arena — measured, the
     first attempt at this picture came back as bare floor with a correct HUD. Nothing needs it here
     because nothing is spawned to swing at us. */
  p.hp = Math.max(1, Math.round(__BF3.effMaxHp(p) * 0.15));
  p.invuln = 0;
  const before = p.hp;
  for(let f = 0; f < 8; f++) __BF3.update(1/60);   // let the frame mark settle

  G.arenaPk.push({ x: p.x, z: p.z, y: p.y, kind: 'heal', bob: 0 });
  let taken = false;
  for(let k = 0; k < 30 && !taken; k++){ __BF3.update(1/60); taken = G.arenaPk.length === 0; }
  for(let f = 0; f < 4; f++) __BF3.update(1/60);   // both floaters alive, the clamp already applied

  try { __BF3.hudUpdate(); } catch(e){}
  return JSON.stringify({ taken: taken, before: before, after: p.hp, maxHp: Math.round(__BF3.effMaxHp(p)) });
})()
