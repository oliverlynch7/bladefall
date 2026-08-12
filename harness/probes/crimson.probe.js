/* DOES CRIMSON HARVEST DO ANYTHING AT ALL?

   Reaper rank-7 option a (index.html:2086) reads: "Below half health, every soul you collect heals
   you outright." `harness/audit-passives.js` says the id `x_crimson` appears exactly twice in the
   whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named - and
   nowhere else, so nothing in the game ever consults it. It is one of the 34 in
   docs/SKILL_TRIAGE.md section E.

   NOTHING IS INVENTED. A "soul" is a KILL in this block's own words - the Reaper's innate is "slain
   enemies restore 2 mana" and Soul Armor one line down calls the same event "collecting a kill" - so
   the trigger already existed. The AMOUNT is the Void Scythe harvest's, verbatim from killEnemy
   (10893): `Math.max(3, round(effMaxHp*0.05))`, under a comment reading "every soul reaped restores
   HP". That is the only other line in the file answering this card's sentence, and it belongs to the
   Reaper's own signature weapon.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `x_chill` (Grave
   Chill) is the control: the b-side of this very rank, wired, and about enemy fleeing - it can heal
   nothing.

   TWO KILLS PER HALF, one BELOW half health and one ABOVE, because "below half health" is half the
   sentence. A wiring that healed on every kill regardless would satisfy a naive one-kill bar and
   would be a different card from the one the menu shows - a strictly better one, which is the kind of
   bug that never gets reported. The above-half kill must heal exactly nothing, in both halves.

   THE STARTER SCYTHE IS NOT THE VOID SCYTHE, and this probe would be worthless if it were. The
   killEnemy harvest at 10893 is gated on `w.reaper`, a flag carried by the legendary Void Scythe and
   not by CLASSSTART's `Notched Scythe`, so the control's zero is a real zero rather than a heal that
   happened to be equal in both halves. `weaponHarvests` is reported so that can never be assumed.

   PERMANENT KNOWN-BAD, carried in the probe rather than produced by breaking the repo: a third half
   puts `mon_iron` - a passive from docs/SKILL_TRIAGE.md section E that is still dead, and belongs to
   another class - into the same rank slot. c2Passive (9987) is a plain id lookup over ranks 3/5/7/9,
   so any id nothing reads reproduces exactly the state the shipped game was in here.
   `okAgainstInert` is therefore what this probe would report against it, and it must be false while
   `ok` is true. */
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
  __BF3.meta.classId = 'reaper';

  let weaponNote = 'none';
  (function(){
    const tries = ['reaper'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('reaper');
  cs.ch = cs.ch || {};
  /* The other three ranks are pinned to wired options that cannot heal, so the only thing that can
     move the player's health is the rank under test. x_favor (r9 b) is the one that could - "elite
     kills restore 8% HP" - and it is pinned away deliberately. */
  cs.ch[3] = 'x_doom';
  cs.ch[5] = 'x_wraithwalk';
  cs.ch[9] = 'x_corrupt';

  const MAXHP = Math.round(__BF3.effMaxHp(p));
  const EXPECT = Math.max(3, Math.round(MAXHP * 0.05));   // the Void Scythe harvest's own amount

  /* One kill, measured on the player's health. The kill goes through the game's own killEnemy, which
     is what calls c2OnKill (10886) - the probe never calls the rider directly. */
  const kill = (frac) => {
    G.enemies.length = 0;
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    if(!foe) return { frac: frac, why: 'no target could be spawned' };
    foe.active = true; foe.elite = false; foe.exposed = 0;

    p.dead = false; p.downed = false;
    p.hp = Math.max(1, Math.round(MAXHP * frac));
    G._radHeal = G.time;                 // the Holy Radiance mote (10888) has a 1s global lockout - hold it shut

    const hp0 = p.hp;
    foe.hp = 0;
    let threw = null;
    try { __BF3.killEnemy(foe); } catch(e){ threw = String(e && e.message || e); }
    return { frac: frac, hp0: hp0, healed: Math.round(p.hp) - hp0, dead: !!foe.dead, threw: threw };
  };

  const half = (pick) => {
    cs.ch[7] = pick;
    return { pick: pick, low: kill(0.35), high: kill(0.90) };   // below half, then above it
  };

  const control = half('x_chill');      // b-side of the same rank: wired, and heals nothing
  const crimson = half('x_crimson');
  const inert   = half('mon_iron');     // an id nothing reads — the permanent known-bad

  const clean = (h) => !h.low.threw && !h.high.threw && h.low.dead && h.high.dead;
  const allClean = [control, crimson, inert].every(clean);

  /* The bar, one clause per clause of the card.
     - below half + the passive: healed, and by the Void Scythe harvest's own amount
     - above half + the passive: healed nothing ("below half health" is half the sentence)
     - the control: healed nothing at either health, or the heal is not the passive's */
  const controlHeld = control.low.healed === 0 && control.high.healed === 0;
  const bar = (h) => h.low.healed > 0 && h.high.healed === 0;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(crimson)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    matchesScytheHarvest: crimson.low.healed === EXPECT,
    expected: EXPECT, maxHp: MAXHP, allClean: allClean, controlHeld: controlHeld,
    control: control, crimson: crimson, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
    weaponHarvests: !!(p.weapon && p.weapon.reaper),
  });
})()
