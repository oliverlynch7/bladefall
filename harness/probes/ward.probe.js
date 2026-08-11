/* DOES STORM WARD DO ANYTHING?

   Stormcaller r5b, `st_ward`: "Casting a skill grants a shield equal to 4% max HP."
   docs/SKILL_TRIAGE.md section E lists it among the 46 passives that are offered, described and
   then never consulted - `harness/audit-passives.js` finds no line in public/ outside CLASS2 and
   the PASSIVE_ART icon table that mentions the id at all.

   The audit is STATIC and only proves WIRED, never CORRECT, so it cannot be the whole proof of a
   fix: adding the string `st_ward` anywhere in the file would turn it green. This drives the
   game's own useSkill() and asks the player's own shield pool what happened.

   THE BAR IS AN A/B INSIDE ONE LAUNCH, which is the part that matters. `p.shieldHp` is touched by
   Arcane Ward, Bone Armor, Barrier, Guardian Bond and the skylancer's Sky Guard, and a single
   "shield went up" reading cannot tell Storm Ward from any of them - or from a bench that happened
   to arrive with a shield already up. So the same class casts the same skill twice, the only
   difference being which rank-5 option is chosen: `st_momentum` (the sibling, path A) must leave
   the pool at zero and `st_ward` must fill it. A fix that grants every stormcaller a shield
   regardless of the choice fails this probe exactly as loudly as no fix at all.

   Known-bad: watched to fail against the unfixed game - both halves report shield 0, i.e.
   `wardShield:0, siblingShield:0, discriminates:false`. */
(function(){
  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every skill in the class. Knock on the
     game's own resume door - the same idiom test-skills.js and headlong.probe.js use. */
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

  const G = __BF3.G, p = G.p;
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'stormcaller';
  const cs = __BF3.classState('stormcaller');

  /* Read from the list useSkill CASTS from (c2CurSkills), never from curSkills() - the two lists
     disagree at the same index, and that mismatch invalidated every verdict test-skills.js ever
     made before faf52c3. Found by fx id so a rank retune cannot silently repoint it. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'st_bolt'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'st_bolt is not in the rank-10 build', casts:skills.map(s=>s&&s.fx) });

  /* One trial: pick the rank-5 option, clear the shield pool, give the bolt something to hit so it
     never takes useSkill's refund path, cast, and read the pool back. */
  function trial(choice){
    cs.ch[5] = choice;
    G.enemies.length = 0;
    const dummy = __BF3.spawnEnemy('dummy', p.x, p.z - 90);
    if(dummy){ dummy.dummy = true; dummy.active = true; dummy.hp = dummy.maxHp = 100000; }
    p.shieldHp = 0; p.shieldT = 0;
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[idx] = 0;
    let threw = null;
    try { __BF3.useSkill(idx); } catch(e){ threw = String(e && e.message || e); }
    return { choice: choice, shield: Math.round(p.shieldHp || 0), shieldT: Math.round((p.shieldT||0)*100)/100,
             onCd: !!(p.skillCd && p.skillCd[idx] > 0), threw: threw };
  }

  const sibling = trial('st_momentum');   // path A, the option Storm Ward is chosen INSTEAD of
  const ward    = trial('st_ward');

  /* 4% of max HP, computed the way the game does (effMaxHp is closure-local; maxHp plus the armour
     mod is what it reduces to for a bench hero with no skin and no endless modifier). Reported, not
     asserted on: the verdict is the A/B, and pinning the exact integer here would make the probe
     fail on an armour roll rather than on the passive. */
  const maxHp = Math.round((p.maxHp || 0) + ((p.armorMods && p.armorMods.hp) || 0));
  const expect = Math.round(maxHp * 0.04);

  const discriminates = ward.shield > 0 && sibling.shield === 0;
  return JSON.stringify({
    ok: discriminates && !ward.threw && !sibling.threw,
    discriminates: discriminates,
    wardShield: ward.shield, wardShieldT: ward.shieldT,
    siblingShield: sibling.shield,
    expectAbout: expect, maxHp: maxHp,
    castFired: { ward: ward.onCd, sibling: sibling.onCd },
    threw: ward.threw || sibling.threw || null,
  });
})()
