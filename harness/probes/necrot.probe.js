/* CAN A NECROMANCER MAKE ANYTHING ROT, USING ONLY ITS OWN KIT?

   All three of the Necromancer's dead passives (docs/SKILL_TRIAGE.md section E) are written about
   one state:
     - `necro_wither`  r3 b - "Enemies standing on a corpse cannot heal and ROT slowly."
     - `necro_plague`  r5 b - "An enemy that dies while ROTTING infects everything near it."
     - `necro_pest`    r9 b - "Your minions leave a ROTTING trail wherever they walk."
   Wiring any of them means first answering what "rotting" IS. The game has exactly one decay status,
   `venom` (EL_STAT, 9507), applied through `applyElement` - and `applyElement` is only ever reached
   from a WEAPON'S element (hitEnemy 10875, the swing at 11384, the sweep at 13107) or from Burning
   Light's splash (10197). Read statically, the class's own kit cannot reach it: `necro_bolt` IS
   `SKILL_FX.m_bolt` and `necro_storm` IS `SKILL_FX.m_tempest` (10279), so "Plague Bolt" and "a storm
   of decay" are the mage's plain bolt and tempest wearing necromancer names.

   THIS PROBE IS WHETHER THAT READING SURVIVES CONTACT. It casts every skill the class actually casts
   - c2CurSkills(), the list useSkill dispatches from, never the legacy kit - at a fresh dummy, lands
   a real swing with the class's own starter weapon, and reads the dummy's own status object back.
   If the reading is right, every one of the six status fields is 0 after all of it, and the three
   passives are blocked on a MECHANIC rather than on a number - the same shape as the Stormcaller's
   six, which are blocked on a lightning chain that does not exist.

   It reports the starter weapon's element too, because that is the one honest way a Necromancer can
   currently rot anything: by happening to hold a poison weapon. A passive whose trigger comes only
   from loot, and never from the class, is a different (and much weaker) card than the one printed.

   BOTH SIDES OF EVERY SKILL RANK ARE CAST, and the first run of this probe is why. `cheatRank10All`
   picks the a-side at every rank, so the first pass cast Summon Skeletons / Raise the Dead / Bone
   Wall / Army of the Dead and reported "the kit rots nothing" WITHOUT EVER CASTING PLAGUE BOLT OR
   DEATH STORM - the two skills whose names promise the exact thing under test. That is this
   sub-project's two-list trap in a new costume: a bench that names the kit and casts a quarter of
   it. The choice table `classState('necromancer').ch` is re-pinned and the whole thing re-cast.

   VENOM IS COUNTED SEPARATELY FROM "any status", because the first run's swing DID rot the dummy -
   `burn 1.35`, off the class's own Cracked Bonestaff, which is a FIRE staff. Answering "does a
   Necromancer rot things" with a burn stack would be the wrong yes. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'necromancer';
  __BF3.meta.camMode = 'far';

  let weaponNote = 'none';
  (function(){
    const tries = ['necromancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const FIELDS = ['burn','chill','venom','rune','radiance','corrupt'];
  const readStat = (e) => {
    let s = {}; try { s = __BF3.estat(e) || {}; } catch(err){}
    const out = {};
    for(const f of FIELDS) out[f] = Math.round((s[f] || 0) * 100) / 100;
    return out;
  };
  const anyStat = (s) => FIELDS.some(f => (s[f] || 0) > 0);

  const dummy = () => {
    G.enemies.length = 0; G._desig = false;
    const e = __BF3.spawnEnemy('grunt', p.x, p.z + 70);
    if(!e) return null;
    e.active = true; e.immobile = true; e.dead = false; e.hp = e.maxHp = 100000;
    return e;
  };
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){} } };

  const cs = __BF3.classState('necromancer');
  cs.ch = cs.ch || {};

  const castAll = (side) => {
    /* The four skill ranks, re-pinned. CLASS2.necromancer: r2 summon|bolt, r4 raise|nova,
       r6 wall|grip, r8 army|storm. */
    const PICKS = { a: { 2:'necro_summon', 4:'necro_raise', 6:'necro_wall',  8:'necro_army' },
                    b: { 2:'necro_bolt',   4:'necro_nova',  6:'necro_grip',  8:'necro_storm' } };
    for(const r of [2,4,6,8]) cs.ch[r] = PICKS[side][r];
    const skills = (function(){ try { return __BF3.c2CurSkills() || []; } catch(e){ return []; } })();
    const out = [];
    for(let i = 0; i < skills.length; i++){
      const s = skills[i]; if(!s) continue;
      const e = dummy(); if(!e){ out.push({ side:side, i:i, n:s.n, why:'no dummy' }); continue; }
      p.hp = __BF3.effMaxHp(p); p.mana = p.manam || p.maxMana || 999;
      if(p.skillCd) p.skillCd[i] = 0;
      p.yaw = Math.atan2(e.x - p.x, e.z - p.z);
      let threw = null;
      try { __BF3.useSkill(i); } catch(err){ threw = String(err && err.message || err); }
      tick(120);                                 // 2s: travel, dots and any lingering storm
      const st = readStat(e);
      out.push({ side:side, i:i, n:s.n, d:s.d || '', threw:threw,
                 hpLost:Math.round(100000 - e.hp), st:st,
                 rotted:anyStat(st), venom:st.venom });
    }
    return out;
  };

  const trials = castAll('a').concat(castAll('b'));

  /* A REAL SWING, through the game's own attack, because the weapon's element is the one path that
     can rot anything and it is not a skill. */
  let swing = null;
  {
    const e = dummy();
    if(e){
      p.yaw = Math.atan2(e.x - p.x, e.z - p.z);
      p.atkCd = 0; p.atkTimer = 0;
      let threw = null;
      try { __BF3.playerAttack(); } catch(err){ threw = String(err && err.message || err); }
      tick(90);
      const st = readStat(e);
      swing = { threw:threw, hpLost:Math.round(100000 - e.hp), st:st,
                rotted:anyStat(st), venom:st.venom };
    }
  }

  const w = p.weapon || {};
  const anyStatus = trials.some(t => t.rotted) || !!(swing && swing.rotted);
  const anyVenom  = trials.some(t => (t.venom || 0) > 0) || !!(swing && (swing.venom || 0) > 0);

  return JSON.stringify({
    /* ok means the STATIC READING HELD: nothing the class casts, on either side of any rank, and
       nothing it swings, ever produces the decay status its three dead passives are written about. */
    ok: !anyVenom && trials.length >= 8 && !!swing && swing.hpLost > 0,
    anyVenom: anyVenom, anyStatus: anyStatus,
    benchCanHit: !!(swing && swing.hpLost > 0),
    weapon: { name: w.name, cls: w.cls, el: w.el || null, note: weaponNote },
    casts: trials.map(t => t.side + ':' + t.n),
    trials: trials, swing: swing,
  });
})()
