/* DOES THE STORMCALLER'S CAPSTONE REDUCE ANY COOLDOWN AT ALL?

   Stormcaller rank-10 capstone, Storm Lord (index.html:2176):
       "+12% damage, +10% cooldown reduction, and your lightning arcs to more enemies."

   `effCdr` (3766) is the ONE function that turns cooldown reduction into a shorter cooldown — it is
   read at 10665 (`let cd=s.cd*(1-effCdr(p))`), which is the only place a c2 skill's cooldown is
   armed. Its whole body is two class branches, mage and chronomancer. **There is no stormcaller
   branch**, so the +10% on that card has never existed.

   What the class DOES get at rank 10 is `effAtkSpeed` ×1.10 (3754) — attack speed, which the card
   does not mention anywhere. That line sits inside the stormcaller branch that carries the Static
   stacks bonus, directly under the identical rank-10 lines for the warrior, ninja and monk, so it
   reads as the melee pattern copied into a caster branch while the caster clause the card promises
   was never added next door. The attack-speed rider is NOT touched by this fix: removing a bonus a
   stormcaller has been playing with is a balance change and belongs to Oliver.

   FOUND BY A SWEEP NOTHING IN THIS HARNESS HAD RUN — the sixteen rank-10 CAPSTONE cards.
   `harness/audit-passives.js` parses `kind:'passive'` entries out of CLASS2; a capstone is a `cap:`
   field with a name and a description and no id at all, so all sixteen sit outside the audit, outside
   the KNOWN_DEAD ratchet, and outside every sweep this sub-project has run. See
   docs/SKILL_TRIAGE.md section S.

   THE BAR IS THE COOLDOWN THE GAME ARMS, NOT `effCdr`'s RETURN VALUE. This sub-project has been
   burned twice reading the field instead of the effect (pass 15 lit exactly the right enemy and
   burned nothing; pass 23 measured distance covered rather than an effSpeed reading). So each trial
   CASTS the skill through `useSkill` and reads `p.skillCd[0]` — the number the player waits out —
   against the skill's own `s.cd`. The reduction is `1 - armed/base`, which is the game's own
   arithmetic and never the probe's.

   THREE CLASSES IN ONE LAUNCH, and the known-bad is carried by the design rather than by a flag:

     - stormcaller  the subject. rank 9 against rank 10.
     - mage         the POSITIVE control. "Archmage: +12% magic damage, +10% cooldown reduction …"
                    is the same promise and IS implemented (3766), so a mage that does not move
                    between rank 9 and rank 10 means the meter is broken and the subject's zero
                    proves nothing. This is what makes a green after-run believable.
     - ninja        the NEGATIVE control. "Phantom" promises no cooldown reduction and the class has
                    no effCdr branch, so it must read 0.00 at both ranks in BOTH runs — otherwise
                    the measurement is merely rank-sensitive and would go green for any change at
                    all.

   Against the shipped game this probe reports stormcaller 0.00 and mage 0.10; that IS the failing
   case, reproducible in one command with no edit to the repo, so `okAgainstShipped` is not needed
   here the way chrhaste.probe.js needed it — the before-run is the known-bad. */
(function(){
  const G = __BF3.G, p = G.p;

  /* ~1 launch in 6 arrives paused, and `useSkill` returns on that guard without spending a
     cooldown — four skills that "fired and changed nothing", indistinguishable from four real bugs.
     This plan's Task 1 Step 1, fault 4. Knock on the game's own resume door. */
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

  /* The Arena hands out its own loadout, which is usually off-class, and eleven of sixteen classes
     were being benched that way until it was measured (this plan's Task 1 Step 1, fault 1). Equip
     through the game's own starter table so the bench stands where the game would let you stand.
     It matters here for a second reason: `effCdr` opens with `if(p.weapon&&p.weapon.ians) v+=0.12`,
     so an Ian's weapon would put a constant on both halves of every class. */
  const equip = (cls) => {
    const tries = [cls].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        return (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
      }
    }
    return 'none';
  };

  const trial = (cls, rank) => {
    __BF3.meta.classId = cls;
    const weaponNote = equip(cls);
    const cs = __BF3.classState(cls);
    cs.rank = rank;

    /* Everything that could put cooldown reduction on the player for a reason this trial did not
       intend. `m_temporal` is the mage's OTHER +15%, gated on standing still for 1.5s, and the
       arena bench arrives having stood still — so a mage half could read 0.25 and be scored as a
       capstone that over-delivers. */
    p._stillT = 0;
    p.armorMods = p.armorMods || {};
    p.stats.cdr = 0;
    p.dead = false; p.downed = false;
    p.hp = __BF3.effMaxHp(p);
    p.mana = p.maxMana = p.maxMana || 100;
    for(let i = 0; i < 4; i++){ p.skillCd[i] = 0; p.skillCdMax[i] = 0; }

    /* A cast that finds nothing RETURNS 'refund' and never goes on cooldown (10639), which would
       read as a cooldown of zero and score as infinite reduction. Give every trial the same body to
       aim at, at the same distance, and rebuild it per trial so one skill's kill cannot starve the
       next. */
    G.enemies.length = 0;
    let dummy = null;
    try { dummy = __BF3.spawnEnemy('grunt', p.x, p.z - 90); } catch(e){}
    if(dummy){ dummy.dummy = true; dummy.active = true; dummy.dropT = 0; dummy.hp = dummy.maxHp = 100000; }

    const s = (__BF3.c2CurSkills() || [])[0];
    let threw = null;
    try { __BF3.useSkill(0); } catch(e){ threw = String(e && e.message || e); }

    const base  = s ? s.cd : null;
    const armed = Math.round(((p.skillCd && p.skillCd[0]) || 0) * 1000) / 1000;
    /* The game's own arithmetic read backwards. Never effCdr(p) — the card promises the player a
       shorter wait, not a larger number in a stat panel. */
    const cut = (base && armed > 0) ? Math.round((1 - armed / base) * 1000) / 1000 : null;

    return { cls, rank, skill: s ? s.n : null, base, armed, cut, threw, weaponNote,
             picks: Object.assign({}, cs.ch) };
  };

  const out = {};
  for(const cls of ['stormcaller', 'mage', 'ninja']){
    const r9  = trial(cls, 9);
    const r10 = trial(cls, 10);
    out[cls] = {
      r9, r10,
      /* Rounded to three places because the two halves divide by the same base; anything that
         survives that is a real step and not float noise. */
      gain: (r9.cut != null && r10.cut != null) ? Math.round((r10.cut - r9.cut) * 1000) / 1000 : null,
      armedBoth: r9.armed > 0 && r10.armed > 0,
    };
  }

  const near = (v, want) => v != null && Math.abs(v - want) < 0.005;

  const ok = !!(out.stormcaller.armedBoth && out.mage.armedBoth && out.ninja.armedBoth
                && near(out.stormcaller.gain, 0.10)    // the card's own number, delivered
                && near(out.mage.gain, 0.10)           // positive control: the meter can see a capstone CDR
                && near(out.ninja.gain, 0)             // negative control: rank alone moves nothing
                && !out.stormcaller.r9.threw && !out.stormcaller.r10.threw);

  return JSON.stringify({
    ok,
    stormcallerGain: out.stormcaller.gain,
    mageGain: out.mage.gain,
    ninjaGain: out.ninja.gain,
    detail: out,
  });
})()
