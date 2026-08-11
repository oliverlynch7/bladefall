/* DOES A BERSERKER WHO PICKED FRENZY SURVIVE BEING HIT?

   hurtPlayer's berserker branch (index.html:11199) reads:

     if(meta.classId==='berserker'&&c2def('berserker')){
       if(c2Passive('bsk_frenzy')){ const fr=...; v*=1+(1-fr); }}

   There is no `v` in hurtPlayer. The line is a paste of effPower's Frenzy clause (3740), where `v`
   is the local damage accumulator; here it is a free identifier, so `v*=` reads an undeclared
   binding and throws ReferenceError. Static reading says so; this measures it, because a global
   `v` somewhere in the file would make the whole reading wrong and grep cannot prove a negative
   about scope.

   TWO BARS, and the second is the one that matters:

   1. hurtPlayer itself throws. That already means the damage is never applied - the throw is at
      11199, above the p.hp-=dmg at 11220 - so a Frenzy berserker also takes no damage from the hit
      that breaks it.

   2. update() throws. frame() (18771) calls update(DT) at 18775 and re-arms the loop with
      requestAnimationFrame(frame) at 18784, with no try/catch between them. An exception out of
      update therefore escapes frame BEFORE the re-arm, and the game stops rendering entirely.
      That is why this probe drives the game's own loop and deliberately does NOT swallow the
      error the way headlong.probe.js's tick() does - swallowing it here would measure the probe.

   The control is the OTHER rank-7 option, bsk_rage: same class, same bench, same blow, one field
   different. If both trials threw, the fault would be the bench.

   Known-bad: watched to fail against the shipped game before the fix - see the row this probe
   backs in docs/SKILL_TRIAGE.md. */
(function(){
  const B = __BF3, G = B.G, p = G.p;

  /* useSkill and update both need mode 'play'; ~1 launch in 6 arrives paused, and a paused bench
     reports "nothing happened" for every trial. Knock on the game's own resume door - the idiom
     test-skills.js and headlong.probe.js both use. */
  if(B.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(B.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(B.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:B.mode });

  B.cheatUnlockClasses(); B.cheatRank10All();
  B.meta.classId = 'berserker';
  const ch = B.c2ch('berserker');

  /* Confirm the two ids under test are really this class's rank-7 pair rather than names carried in
     from a doc. A retune that renames them should make this probe say so, not quietly measure
     nothing. */
  const R7 = (B.CLASS2 && B.CLASS2.berserker) ? B.CLASS2.berserker.r7 : null;
  const pair = R7 ? [R7.a && R7.a.id, R7.b && R7.b.id] : [];

  const clear = () => {
    p.invuln = 0; p.dodgeTimer = 0; p.dead = false; p.downed = false;
    p.shieldHp = 0; p.guardT = 0; p.reflectT = 0; p.bdParryT = 0;
    p._stillnessT = 0; p._tarmT = G.time;      // Thick Armor's free first hit is a paladin's; keep it armed-spent anyway
    p.hp = Math.max(40, Math.round(B.effMaxHp(p) * 0.6));
  };

  /* BAR 1 - the call itself. */
  const oneBlow = (pick) => {
    ch[7] = pick;
    clear();
    const hp0 = p.hp;
    let threw = null;
    try { B.hurtPlayer(12, p.x + 60, p.z, { name:'the bench', attack:'a test blow' }); }
    catch(e){ threw = String((e && e.message) || e); }
    return { pick: pick, threw: threw, hp: hp0 + ' -> ' + Math.round(p.hp), took: Math.round(hp0 - p.hp) };
  };

  /* BAR 2 - the game's own loop, with an enemy that will actually swing. The throw is not caught:
     if update() dies, the loop stops here exactly as frame() would stop there. */
  const driveUntilHit = (pick) => {
    ch[7] = pick;
    G.enemies.length = 0;
    clear();
    p.hp = B.effMaxHp(p);
    const e = B.spawnEnemy('grunt', p.x + 70, p.z);
    if(e){ e.active = true; e.dropT = 0; e.hp = e.maxHp = 100000; }
    const hp0 = p.hp;
    let threw = null, frames = 0, hit = false;
    for(let k = 0; k < 900; k++){
      try { B.update(1/60); }
      catch(err){ threw = String((err && err.message) || err); break; }
      frames++;
      if(p.hp < hp0){ hit = true; break; }
    }
    return { pick: pick, threw: threw, frames: frames, tookDamage: hit, hp: Math.round(p.hp) };
  };

  /* Control first, deliberately: the failing trial leaves the game mid-update, and a control taken
     after it would be measuring that wreckage rather than the game. */
  const ctlBlow = oneBlow('bsk_rage');
  const ctlLoop = driveUntilHit('bsk_rage');
  const badBlow = oneBlow('bsk_frenzy');
  const badLoop = driveUntilHit('bsk_frenzy');

  return JSON.stringify({
    ok: !badBlow.threw && !badLoop.threw,
    r7pair: pair,
    frenzy: { hurtPlayer: badBlow, gameLoop: badLoop },
    control: { hurtPlayer: ctlBlow, gameLoop: ctlLoop },
    /* Stated so a green run cannot be read as "the control never fired either". */
    controlTookDamage: ctlLoop.tookDamage,
  });
})()
