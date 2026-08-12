/* DOES DEAD AIM DO ANYTHING AT ALL?

   Pirate rank-3 option a (index.html:2142) reads: "The pistol pierces every enemy in a line."
   `harness/audit-passives.js` says the id `pir_deadly` appears exactly twice in the whole of public/
   - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and nowhere else, so
   nothing in the game ever consults it. It is one of the 30 in docs/SKILL_TRIAGE.md section E, and
   one of the SIX the Pirate has, which is the worst-hit class left.

   NOTHING IS INVENTED. Pierce is already a projectile field (`fireProjectile` 9827), already spent
   one enemy at a time (13174: `if(pr.pierce>0) pr.pierce--; else pr.life=0`), and the flintlock
   already ships with `pierce:2` (ARCHES 1821). The card asks for one value change and states the
   value itself - "every" - and this file already has a constant for that: **99**, used verbatim by
   the thrown scythe (9748), the hurled axe (9771) and the longbow's power arrow (9783), each of
   which the source calls "pierces everything". So the wiring is that constant, not a new one.

   FIVE ENEMIES IN A LINE, which is the only arrangement that can tell the answer from the question.
   The shipped flintlock's `pierce:2` carries the shot through exactly THREE bodies, so a probe with
   three or four targets cannot distinguish "pierces every enemy" from "pierces the ones it already
   pierced". Five makes the control's ceiling visible: 3 of 5 without the passive, 5 of 5 with it.

   THE LINE POINTS BACKWARD ON PURPOSE. The arena floor is 1560 across and the hero stands at
   z 340, so a line laid out ahead of it runs off the map before the shot runs out of range. Facing
   yaw PI puts all five inside the floor with room to spare.

   BOLTED DOWN, and that is not tidiness. The flintlock's knockback is 360 - the heaviest in the
   game - so the first body hit would be blasted out of the line and into the second, and the count
   would then be measuring a collision rather than a pierce. `dummy` is the game's own flag for
   "takes damage, never moves" (hitEnemy 10834 zeroes knockback for it).

   THE LINE STARTS 400 UNITS OUT, AND THAT IS THE WHOLE REASON THIS PROBE WORKS. Measured, after two
   runs of the wired passive returned **4 of 5** and a third was spent finding out why.
   `fireProjectile` solves the launch onto the AIM TARGET's mid-height (9822), and the muzzle sits at
   `p.y+26` while a grunt's chest is at 19 - so the shot always leaves going DOWN, at
   `(19-26)/t` where t is the flight time to the NEAREST body. With the line beginning close, t is
   clamped to its 0.12 floor and that seven-unit drop becomes **-58 units a second**: from y 26 the
   shot is under the bodies' feet after 380 units and sails beneath the last of them. The diagnostic
   settled it beyond argument - the shot still had `pierce: 96` left when it stopped connecting, so
   it ran out of ALTITUDE, not of pierce.
   Starting the line far out fixes it physically rather than by posing the bench: at 400 units
   t is 0.444 and the drop falls to about -16 a second, which over the shot's whole 0.889s life
   costs it 12 units of height against a vertical hit window of 26. Every body stays in the window
   and the last is reached at 0.74s, inside the life. Nothing about the A/B moves - `pierce:2` carries
   exactly three bodies at any range - and the miss this replaced was ballistics, not the passive, so
   a bar that failed on it was a bar measuring the wrong thing.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `pir_swift` (Quick
   Hands, "opening a chest reloads your pistol") is the control: the b-side of this very rank, wired,
   and about chests - it cannot change a projectile.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `mon_iron` - a dead passive belonging to another class - into the same rank slot. c2Passive
   (9987) is a plain id lookup over ranks 3/5/7/9, so any id nothing reads reproduces exactly the
   state the shipped game was in here. `okAgainstInert` is what this probe would report against the
   unfixed game, and it must be false while `ok` is true. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'pirate';
  __BF3.meta.camMode = 'far';

  /* The pistol IS the subject, so it is equipped by name rather than by the bench's usual
     in-family search: docs/SKILL_TRIAGE.md section D records that the Pirate cannot equip its own
     starter in family, and an off-family flintlock still fires the same projectile through the same
     `fireProjectile` - only its damage is reduced, which nothing here reads. Reported either way. */
  let weaponNote = 'none';
  try {
    const w = __BF3.classStartWeapon('pirate');
    if(w){ p.weapon = w; weaponNote = 'pirate starter: ' + w.name; }
  } catch(e){ weaponNote = 'classStartWeapon threw: ' + String(e && e.message || e); }
  const W = p.weapon || {};

  const cs = __BF3.classState('pirate');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned to options that cannot touch a projectile. pir_brutal is the
     only wired one of the three and it speaks to SWORD damage while reloading, which no shot reads. */
  cs.ch[5] = 'pir_tough';
  cs.ch[7] = 'pir_luck';
  cs.ch[9] = 'pir_brutal';

  const N = 5, START = 400, GAP = 70, HP = 100000;

  /* One shot down a line of five. Nothing here reimplements the shot: playerAttack picks the aim,
     fireProjectile makes the projectile and update() flies it. */
  const volley = () => {
    G.enemies.length = 0;
    if(G.projectiles) G.projectiles.length = 0;
    p.dead = false; p.downed = false; p.invuln = 0; p.atkCd = 0; p.atkTimer = 0;
    p.vx = 0; p.vy = 0; p.vz = 0; p.onGround = true;
    p.yaw = Math.PI; G.camYaw = Math.PI;          // forward is -z: the line runs INTO the arena
    p._loaded = undefined; delete p._loaded;

    const line = [];
    for(let k = 0; k < N; k++){
      const at = START + GAP * k;
      const foe = __BF3.spawnEnemy('grunt', p.x, p.z - at);
      if(!foe) return { why: 'target ' + k + ' could not be spawned' };
      foe.x = p.x; foe.z = p.z - at;                // exactly on the line, whatever the spawner chose
      foe.active = true; foe.dead = false; foe.dummy = true;
      foe.hp = foe.maxHp = HP;
      line.push(foe);
    }

    const before = line.map(f => ({ z: Math.round(f.z), y: Math.round(f.y), h: Math.round(f.h), r: Math.round(f.r) }));

    let threw = null, shot = null, path = [];
    try {
      __BF3.playerAttack();
      const pj = (G.projectiles || [])[0];
      if(pj) shot = { pierce: pj.pierce, vy: Math.round(pj.vy), vz: Math.round(pj.vz),
                      life: +pj.life.toFixed(3), y: Math.round(pj.y), z: Math.round(pj.z), size: pj.size };
      for(let i = 0; i < 60; i++){
        __BF3.update(1/60);
        const q = (G.projectiles || [])[0];
        /* Sampled every 6th frame: WHERE the shot got to and what its pierce had left is the only
           thing that can separate "the passive did not raise pierce" from "the shot never reached
           the last body". Guessing between those two cost a launch already. */
        if(q && i % 6 === 0) path.push({ t: i, z: Math.round(q.z), y: Math.round(q.y), pierce: q.pierce, hit: q.hitSet.length });
      }
    } catch(e){ threw = String(e && e.message || e); }

    const lost = line.map(f => HP - Math.round(f.hp));
    return {
      hits: lost.filter(v => v > 0).length, lost: lost,
      before: before, after: line.map(f => Math.round(f.z)),
      shot: shot, path: path,
      left: (G.projectiles || []).length, threw: threw,
    };
  };

  const half = (pick) => { cs.ch[3] = pick; return { pick: pick, shot: volley() }; };

  const control = half('pir_swift');     // b-side of the same rank: wired, and about chests
  const deadaim = half('pir_deadly');
  const inert   = half('mon_iron');      // an id nothing reads, from another class

  const clean = (h) => !h.shot.threw && h.shot.hits > 0;   // the bench can land a shot at all
  const allClean = [control, deadaim, inert].every(clean);

  /* The bar, from the card's own word.
     - the control stops short of the line's end (the shipped pierce:2 carries exactly three bodies)
     - the passive half reaches EVERY one of the five */
  const controlHeld = control.shot.hits < N;
  const bar = (h) => h.shot.hits === N;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(deadaim)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld, targets: N,
    control: control, deadaim: deadaim, inert: inert,
    weapon: W.name, arche: W.arche, cls: W.cls,
    shipPierce: W.proj && W.proj.pierce, inFamily: (function(){ try { return !!__BF3.classFamilyOk(W); } catch(e){ return null; } })(),
    weaponNote: weaponNote,
  });
})()
