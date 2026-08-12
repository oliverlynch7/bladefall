/* DOES RAGE DO WHAT ITS CARD SAYS?

   Berserker rank-7 option a (index.html:2134) reads: "Below a quarter health you cannot be healed,
   and your damage doubles."

   SECTION Q'S TWELFTH ROW, and the first one where the reader is not a stat multiplier but a
   HALF of the card. `harness/audit-passives.js` reports `bsk_rage` WIRED and is right: it is read,
   once, in `CLASS_BASIC.berserker` (11390), where `frac < 0.25` doubles the damage exactly as
   printed. The heal lock had no implementation anywhere in the file — `healCut` is an ENEMY field
   (heavy Venom choking a healer's mend) and there is no player-side heal cut at all.

   WHY THAT IS A BUG AND NOT A BALANCE CHANGE: Rage is offered against Frenzy at the same rank, and
   what shipped is Rage's upside with its downside missing — pass 20's rule, "a card with a drawback
   has to be wired on BOTH sides or picking it is a strict upgrade". Nothing here invents a number:
   the quarter is the card's own, and it is the same quarter the damage half already tests.

   THE BAR IS A REAL HEAL THAT REALLY LANDS ON THE CONTROL, and two independent ones, because a lock
   wired into one heal path and not the others would be a hole rather than a mechanic:
   - THE ARENA HEAL ORB. Pushed onto `G.arenaPk` and collected by the game's own `arenaPickupTick`
     (12603) — the probe never calls `applyArenaPickup`, it walks the pickup into the hero. Worth
     40% of max HP, so it is unmissable and it is not a rounding argument.
   - LIFESTEAL ON A REAL SWING. `input.attack` pressed for one frame, so `playerAttack` computes
     `effLifesteal` itself and `hitEnemy` (10953) pays it. The probe never passes a lifesteal figure
     to `hitEnemy`, because that number is half of what is under test. A rank-10 Berserker has +8%
     from Undying Rage, which is the game's own source and not a bench grant.

   TWO TRIALS PER HALF, and the second is the one the triage list asked for by name:
   - MID, at 40% health: ABOVE the quarter, so both heals must LAND in every half including the
     locked one. A passive that simply stopped a Berserker healing would satisfy a low-health-only
     bar and would be a far bigger card than the one printed.
   - LOW, at 15% health: below the quarter, so both heals must be REFUSED in the locked half and
     must still land in the other two.

   MID RUNS BEFORE LOW, AND THE HALVES ARE ORDERED WITH THE LIVE ONE LAST, on purpose and not for
   tidiness. The fix compares the health at the end of a frame against the health at the start, so
   every set-up assignment this probe makes has to be a DROP or it would be measuring its own bench
   being clamped: full → 40% → (heals) → 15%. The locked half runs last because the two inert halves
   clear the mark every frame, so it starts from a clean one.

   THREE HALVES IN ONE LAUNCH: the control is `bsk_frenzy`, the b-side of this very rank, so the only
   difference between the halves is the pick. It is a live control rather than an inert one — and it
   is deliberately the awkward one, because Frenzy multiplies lifesteal as health falls (3760), so the
   control heals MORE at low health than at mid. A bar of "did the number move" survives that; a bar
   of "how much" would not. The known-bad is `mon_iron`, a dead id from another class fed to the
   identical bar, so `okAgainstInert` is what this probe would say against the shipped game. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';

  /* THE ARENA'S ORBS ARE AN OPT-IN VARIANT. `arenaPickupTick` returns immediately unless
     `ARENA_LOADOUT.powerups` is set (12597), which is a checkbox in the game's own arena setup and
     is off by default — the first run of this probe measured `orbTaken:false` in all six trials and
     was, correctly, proving nothing. Turned on here rather than worked around, so the heal still
     arrives through the game's own pickup path. */
  __BF3.ARENA_LOADOUT.powerups = true;

  /* The Berserker is one of the three classes that cannot equip its own starter (SKILL_TRIAGE
     section D), and its family is great/axe/hammer, so no other class's starter fits either —
     measured, the first run of this probe found none of the sixteen and swung the Arena's loaner
     SWORD off-class. Fall back to the game's own item factory and take the first archetype that
     `classFamilyOk` accepts. */
  let weaponNote = 'none';
  (function(){
    const tries = ['berserker'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
    for(const a of (__BF3.ARCHEIDS || [])){
      let w = null; try { w = __BF3.makeWeapon(a, 'common'); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = 'made in-family: ' + a; return; }
    }
  })();

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'bsk_heavy';    // r3: NOT Reckless — "every swing costs you a sliver of health" would
                             // spend health inside the very window a heal is being counted in
  cs.ch[5] = 'bsk_thick';    // r5: the death save, so nothing here can end on a hidden revive
  cs.ch[9] = 'bsk_tough';    // r9: NOT Brutal — an execute would kill the dummy under the swing
  __BF3.meta.camMode = 'far';

  let threw = null;
  const home = { x: p.x, z: p.z };
  const maxHp = () => __BF3.effMaxHp(p);
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  const run = (frac) => {
    G.enemies.length = 0;
    G.arenaPk = []; G._pkT = 999;            // the arena seeds its own orbs every 5–9s; a stray one
                                             // landing mid-window is a heal nobody asked for
    p.x = home.x; p.z = home.z; p.vx = 0; p.vz = 0;
    IN.jx = 0; IN.jz = 0; IN.attack = false;
    p.dead = false; p.downed = false;
    p.atkCd = 0; p.atkTimer = 0; p.attackHeld = false; p.charging = false; p.holdT = 0;
    p.mana = p.manam || p.maxMana || 999;

    /* Health is SET DOWN, never up — see the header. Invulnerable so nothing in the arena can put a
       hit inside a window whose whole content is a health delta; hurtPlayer returns on it and no
       heal path reads it. */
    p.hp = Math.max(1, Math.round(maxHp() * frac));
    p.invuln = 999;
    tick(6);                                  // let the frame mark settle before anything heals

    const startHp = p.hp;

    /* HEAL ONE: the arena orb, collected by the game. */
    G.arenaPk.push({ x: p.x, z: p.z, y: p.y, kind: 'heal', bob: 0 });
    const orbBefore = p.hp;
    let orbAt = -1;
    for(let k = 0; k < 30 && orbAt < 0; k++){ tick(1); if(G.arenaPk.length === 0) orbAt = k; }
    tick(4);                                  // the clamp is an end-of-frame test; read it after one
    const orbAfter = p.hp;

    /* HEAL TWO: lifesteal off a real swing. 60 units, because a blade's REACH is not its aim range:
       `aimTarget` looks out to `(w.range+40)*1.6` and will happily face a foe the swing then cannot
       touch — measured, a foe at 120 was aimed at and took nothing in all six trials. The foe cannot
       hit back regardless, because the hero is invulnerable for the whole window. */
    const e = __BF3.spawnEnemy('grunt', home.x, home.z - 60);
    let eHp0 = null, lsBefore = p.hp, lsAfter = p.hp, swung = false, atkCd = 0;
    if(e){
      e.active = true; e.dropT = 0; e.immobile = true; e.hp = e.maxHp = 100000;
      p.yaw = Math.atan2(e.x - p.x, e.z - p.z);   // forward is (sin yaw, cos yaw) — the pet spawn at
                                                  // 11743 is the game's own statement of that
      tick(2);
      eHp0 = e.hp; lsBefore = p.hp;
      for(let s = 0; s < 3; s++){            // three swings: one hit is a rounding argument
        IN.attack = true; tick(1); IN.attack = false; p.attackHeld = false; p.charging = false;
        atkCd = Math.max(atkCd, p.atkCd || 0);   // proof the press really swung, hit or miss
        tick(14);
      }
      tick(4);
      lsAfter = p.hp; swung = e.hp < eHp0;
    }

    return {
      frac: frac, startHp: startHp, maxHp: Math.round(maxHp()),
      orbTaken: orbAt >= 0, orbHeal: orbAfter - orbBefore,
      swung: swung, dealt: eHp0 == null ? null : Math.round(eHp0 - e.hp), atkCd: Math.round(atkCd * 100) / 100,
      lsHeal: lsAfter - lsBefore,
      endHp: p.hp,
    };
  };

  const half = (pick) => {
    cs.ch[7] = pick;
    p.hp = maxHp();                            // a fresh half starts whole; the mark is cleared every
    tick(2);                                   // frame by the two inert halves, and this one is last
    return { pick: pick, ch: JSON.stringify(cs.ch), mid: run(0.40), low: run(0.15) };
  };

  const control = half('bsk_frenzy');
  const inert   = half('mon_iron');
  const rage    = half('bsk_rage');

  /* A half says nothing unless both heals really happened where they were supposed to: the orb was
     really collected, the swing really drew blood, and the mid-health window really healed. */
  const staged = (h) => !!(h && h.mid && h.low
                           && h.mid.orbTaken && h.low.orbTaken
                           && h.mid.swung && h.low.swung
                           && h.mid.orbHeal > 0);
  /* Lifesteal is asserted only where it was SHOWN to pay: at 8% of a starter weapon's damage it can
     round to nothing, and an assertion on a heal nobody has watched land is the fault this
     sub-project's plan names in its Correction 5. */
  const lsLive = (control.mid.lsHeal > 0 && inert.mid.lsHeal > 0 && control.low.lsHeal > 0 && inert.low.lsHeal > 0);

  const locked = (h) => h.low.orbHeal === 0 && (!lsLive || h.low.lsHeal === 0);
  const open   = (h) => h.mid.orbHeal > 0 && (!lsLive || h.mid.lsHeal > 0)
                        && h.low.orbHeal > 0 && (!lsLive || h.low.lsHeal > 0);

  const ok = !!(staged(control) && staged(inert) && staged(rage) && !threw
                && locked(rage)          // the card's own sentence: below a quarter, nothing heals
                && rage.mid.orbHeal > 0  // and ONLY below a quarter
                && (!lsLive || rage.mid.lsHeal > 0)
                && open(control)         // nothing without the pick
                && open(inert));         // nor for a dead id fed the same bar

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(staged(inert) && locked(inert) && inert.mid.orbHeal > 0 && open(control)),
    lsLive: lsLive,
    control: control, inert: inert, rage: rage,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
