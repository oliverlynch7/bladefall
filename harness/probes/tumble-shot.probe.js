/* DOES TUMBLE'S PARTING SHOT EXIST, AT THE 0.75x ITS CARD PRINTS, AND ONLY FOR THE RANGER?

   ranger/Tumble's card (index.html:2053): "Roll back ~5m with brief i-frames + a 0.75x parting shot.
   A dodged hit keeps Clear Aim." harness/test-skills.js catches the first half of that sentence
   being absent, and its own header says why it cannot catch the rest - "the bar is EFFECT, not
   number", so a skill hitting for the wrong amount passes it. 0.75 is the ONE number on this card,
   which makes it the one thing worth a probe of its own.

   THREE QUESTIONS, and the middle one is the reason this file exists rather than a line in a commit
   message:

   1. DOES IT LAND. Tumble cast through the game's own useSkill at the bench's own 60 units, pumped,
      dummy HP read. This is the same thing test-skills.js asserts, restated here so the probe is
      self-contained.

   2. IS IT 0.75x. Recovered as a RATIO against the ranger's own Volley, not as an absolute.
      Both bodies compute `(w?w.dmg:8)*effPower(p)*K*am*(ok?1:OFFCLASS_MUL)` off the same weapon in
      the same launch, and neither card carries an `am` (2049, 2053), so tumbleShot / volleyShot is
      K_tumble / K_volley = 0.75 / 1.1 = 0.6818 with the weapon, the power fold, Clear Aim and the
      off-class multiplier all cancelling. An absolute would not survive that: harness/probes/
      charge.probe.js records two launches reading the identical control cell at 4.2973 and 5.0278.
      Read off the PROJECTILE the cast pushes rather than off a damaged dummy, so the number measured
      is the one the skill computed - undamped by armor, difficulty, rounding or a missed shot.
      (Volley's own 1.1 disagrees with its card's "1.4x each". That is docs/SKILL_TRIAGE.md section Y
      and it is Oliver's to call, not this probe's; it is used here only as a same-launch reference
      cell, and if he ever changes it the EXPECTED constant below moves with it.)
      Cast with NO enemy in the room, deliberately: aimTarget then finds nothing and both bodies fire
      straight ahead, so the two casts differ in nothing but their multiplier.

   3. IS IT THE RANGER'S ALONE. SKILL_FX.r_tumble was an alias of SKILL_FX.tumble (10357) and
      ninja/Tumble (10387) and pirate/Roll (10432) alias it in turn. The fix REDEFINES r_tumble past
      those lines instead of editing the shared body, precisely so the other two do not silently gain
      a damage skill - and pirate/Roll's card says "a parting shot" too (2143), so it is the one most
      likely to be handed this by accident and never noticed. Checked twice: by identity (the three
      function objects), and behaviourally (pir_tumble pushes no projectile).

   KNOWN-BAD, WATCHED, NOT ASSUMED. Run against the unfixed index.html (git stash of the file, probe
   unchanged) this reports, verbatim:
       ok false, landsItsShot false, isCardMultiplier false, rangerOnly false,
       identity { rangerIsOwnBody false, ninjaStillShared true, pirateStillShared true },
       tumbleShot { n 0, dmg null }, tumble { shots 0, dealt 0 }, mult null,
       volleyShot { n 7, dmg 47.4516 }, pirateRoll { n 0 }
   Two things in that are worth reading rather than skipping. The VOLLEY reference cell already
   worked, so the ratio arm was proven able to produce a number before the thing it measures existed
   - a probe whose denominator is also broken reports null either way and cannot tell you which half
   failed. And PIRATEROLL WAS ALREADY 0, which is the point: the pirate row cannot go from fail to
   pass here, only from pass to fail, so it is a guard and not an achievement. */
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
  __BF3.meta.classId = 'ranger';

  let weaponNote = 'none';
  (function(){
    const tries = ['ranger'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = (i===0)?'own starter':('borrowed from '+tries[i]); return; }
    }
  })();
  const ok = __BF3.classFamilyOk(p.weapon);

  const HOME = { x:p.x, z:p.z, y:p.y };
  const clean = () => {
    G.enemies.length = 0; G.projectiles.length = 0;
    p.x=HOME.x; p.z=HOME.z; p.y=HOME.y; p.vx=0; p.vz=0; p.yaw=Math.PI; G.camYaw=Math.PI;
    p.hp=p.maxHp||100; p.mana=p.maxMana||999; p.invuln=0; p.dodgeTimer=0;
    if(p.skillCd) for(let i=0;i<4;i++) p.skillCd[i]=0;
  };
  /* The dmg the cast COMPUTED, taken off the projectiles it pushed into an emptied list. All of
     volley's seven arrows carry the same figure, so the first is the whole answer. */
  const shotOf = () => (G.projectiles.length ? { n:G.projectiles.length, dmg:G.projectiles[0].dmg } : { n:0, dmg:null });

  const out = { weaponNote, onClass: ok, weapon: p.weapon && p.weapon.name };

  /* Q3 first, because it costs nothing and it frames the rest: which classes share this body. */
  out.identity = {
    rangerIsOwnBody: __BF3.SKILL_FX.r_tumble !== __BF3.SKILL_FX.tumble,
    ninjaStillShared: __BF3.SKILL_FX.nin_tumble === __BF3.SKILL_FX.tumble,
    pirateStillShared: __BF3.SKILL_FX.pir_tumble === __BF3.SKILL_FX.tumble
  };

  /* Q2: the ratio. Slot 1 is Tumble (CLASS2.ranger.r4 carries slot:1), slot 0 is Volley (r2). */
  clean(); try { __BF3.useSkill(1); } catch(e){}
  const tShot = shotOf();
  clean(); try { __BF3.useSkill(0); } catch(e){}
  const vShot = shotOf();
  out.tumbleShot = tShot; out.volleyShot = vShot;
  out.mult = (tShot.dmg != null && vShot.dmg) ? +(tShot.dmg / vShot.dmg).toFixed(4) : null;
  const EXPECTED = 0.75 / 1.1;                       // both cards carry no `am`; see the header

  /* Q1: does it draw blood, at the bench's own distance, through the game's own cast. */
  clean();
  const d = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
  if(d){ d.active=true; d.dropT=0; d.maxHp=100000; d.hp=100000; }
  const hp0 = d ? d.hp : null;
  try { __BF3.useSkill(1); } catch(e){}
  for(let k=0;k<120;k++){ try { __BF3.update(1/60); } catch(e){} }
  out.tumble = { shots: tShot.n, shotDmg: tShot.dmg, dealt: d ? Math.round(hp0 - d.hp) : null };

  /* Q3 behaviourally: the pirate's Roll must still push nothing. Cast on the handler directly - the
     pirate's Roll is the B-side pick at r4 and flipping a whole build to reach it would measure the
     bench's build machinery rather than this function. */
  clean();
  __BF3.meta.classId = 'pirate';
  try { __BF3.SKILL_FX.pir_tumble(p, true, 1); } catch(e){}
  out.pirateRoll = shotOf();
  __BF3.meta.classId = 'ranger';

  out.landsItsShot      = (out.tumble.shots === 1 && out.tumble.dealt > 0);
  out.isCardMultiplier  = (out.mult != null && Math.abs(out.mult - EXPECTED) < 0.005);
  out.rangerOnly        = (out.identity.rangerIsOwnBody && out.identity.ninjaStillShared
                           && out.identity.pirateStillShared && out.pirateRoll.n === 0);
  out.expectedMult = +EXPECTED.toFixed(4);
  out.ok = out.landsItsShot && out.isCardMultiplier && out.rangerOnly;
  return JSON.stringify(out);
})()
