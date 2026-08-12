/* DOES BOUNTY HUNTER DO ANY OF THE THREE THINGS ITS CARD PROMISES?

   Ranger rank-9 option b (index.html:2064): "Marked enemies deal -8% to you; killing one heals 4% HP
   and gives +10% gold." `r_bounty` is one of the passives in docs/SKILL_TRIAGE.md section E that
   nothing in the game reads - it appears exactly twice in public/, in CLASS2 and in the PASSIVE_ART
   icon table, and neither is a reader.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `r_elem` (Elemental Archer), picked in the SAME
   game - so the only difference between the two halves is which passive is chosen. It is itself dead,
   which makes it a perfect null: it cannot move any of the three numbers in either direction.

   AND EACH HALF CARRIES ITS OWN MARKED/UNMARKED PAIR, which is the assertion that matters. Every
   clause is conditional on the target being MARKED, so a fix that healed on every kill, or shaved 8%
   off every hit, would satisfy a marked-only test while being a much worse bug than the dead passive
   it replaced. The unmarked readings are what stop that.

   THREE CLAUSES, THREE MEASUREMENTS, all read off the game's own state:
     1. damage taken   - hurtPlayer() with the marked enemy passed as `by`, HP delta
     2. heal on kill   - killEnemy() on a marked corpse, HP delta from a half-health start
     3. gold on kill   - meta.gold delta across the same kill

   THINGS THAT HAD TO BE STEERED AROUND, each of them read out of the function under test:
   - `hurtPlayer` returns early on `p.invuln>0||p.dodgeTimer>0` (11263) and SETS `p.invuln=0.7` on
     every landed hit, so a second reading in the same launch would silently be a no-op and report a
     took of 0 - which reads exactly like a 100% damage reduction. Cleared before every hit.
   - A shield, a brace or a reflect all sit between the multiplier chain and `p.hp`, so all three are
     zeroed; otherwise the delta measures the shield, not the passive.
   - The enemy type is chosen as the highest-xp non-boss in the game's own ENEMY table, because the
     gold clause is +10% of a number the game rounds to an integer - on a 6-xp grunt the whole
     promised difference rounds away and the test would report the fix as absent.

   No update() is ever run, so no game time passes: nothing regenerates, no mark decays and no
   enemy acts between readings. */
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

  /* Off-class is not a neutral state - useSkill and a great many riders gate on classFamilyOk, and
     the game itself hard-blocks the combination (index.html:13220). Equip through the game's own
     starter table, exactly as the other probes in this directory do. */
  let weaponNote = 'none';
  (function(){
    const tries = ['ranger'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('ranger');
  cs.ch = cs.ch || {};

  /* The fattest non-boss in the table: see the header - a 10% gold clause on a 6-xp grunt rounds to
     nothing and the measurement would be of the rounding, not of the passive.
     Goblins, mimics and slimes are excluded by name as well: killEnemy has a special branch for each
     (10879, 10887, 10902) that pays its own purse, drops its own hoard or splits into two more
     enemies, and any of those would put something in the gold delta that is not the passive. */
  let TYPE = null, bestXp = -1;
  const TBL = __BF3.ENEMY || {};
  for(const k of Object.keys(TBL)){
    const a = TBL[k];
    if(!a || a.boss || k === 'dummy' || /goblin|mimic|slime/i.test(k)) continue;
    if(a.look === 'slime') continue;
    if((a.xp || 0) > bestXp){ bestXp = a.xp || 0; TYPE = k; }
  }

  const maxHp = () => __BF3.effMaxHp(p);

  const foe = (marked) => {
    G.enemies.length = 0;
    const e = __BF3.spawnEnemy(TYPE, p.x + 40, p.z - 90);
    if(e){ e.active = true; e.dropT = 0; e.markT = marked ? 8 : 0; }
    return e;
  };

  /* Every early return and every soak in hurtPlayer, cleared - see the header. */
  const clean = () => {
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0;
    p._stillnessT = 0; p._tarmT = 0;
    p.hp = maxHp();
  };

  const takeHit = (marked) => {
    const e = foe(marked);
    clean();
    const before = p.hp;
    let threw = null;
    try { __BF3.hurtPlayer(200, e.x, e.z, e); } catch(err){ threw = String(err && err.message || err); }
    return { marked: !!marked, mark: Math.round((e && e.markT) || 0),
             took: Math.round(before - p.hp), threw: threw };
  };

  const killOne = (marked) => {
    const e = foe(marked);
    clean();
    p.hp = Math.max(1, Math.round(maxHp() * 0.5));
    const hp0 = p.hp, gold0 = __BF3.meta.gold || 0;
    let threw = null;
    e.hp = 0;
    try { __BF3.killEnemy(e, true); } catch(err){ threw = String(err && err.message || err); }
    return { marked: !!marked, mark: Math.round((e && e.markT) || 0),
             healed: Math.round(p.hp - hp0), gold: (__BF3.meta.gold || 0) - gold0, threw: threw };
  };

  const half = (pick) => {
    cs.ch[9] = pick;
    return { pick: pick,
             hitPlain:  takeHit(false), hitMarked:  takeHit(true),
             killPlain: killOne(false), killMarked: killOne(true),
             maxHp: Math.round(maxHp()) };
  };

  const control = half('r_elem');
  const bounty  = half('r_bounty');

  const near = (got, want, tol) => Math.abs(got - want) <= (tol == null ? 2 : tol);
  const threw = (h) => !!(h.hitPlain.threw || h.hitMarked.threw || h.killPlain.threw || h.killMarked.threw);

  /* Preconditions. Without these a green run could be a bench that measured nothing: a hit that
     landed for 0, or a kill that paid no gold, satisfies "marked and unmarked agree" perfectly. */
  const canMeasure = !!(control.hitPlain.took > 20 && control.killPlain.gold > 0 &&
                        control.hitMarked.mark > 0 && bounty.hitMarked.mark > 0 && TYPE);

  const wantHeal = Math.round(bounty.maxHp * 0.04);
  const wantTook = Math.round(bounty.hitPlain.took * 0.92);
  const wantGold = Math.round(bounty.killPlain.gold * 1.10);

  const ok = !!(
    canMeasure && !threw(control) && !threw(bounty) &&
    /* the control moves NOTHING: a mark is inert without the passive */
    control.hitMarked.took === control.hitPlain.took &&
    control.killMarked.healed === 0 && control.killPlain.healed === 0 &&
    control.killMarked.gold === control.killPlain.gold &&
    /* the passive, marked: all three clauses */
    near(bounty.hitMarked.took, wantTook) &&
    near(bounty.killMarked.healed, wantHeal) &&
    near(bounty.killMarked.gold, wantGold, Math.max(1, Math.round(bounty.killPlain.gold * 0.02))) &&
    /* the passive, UNMARKED: nothing may leak onto an ordinary enemy */
    bounty.hitPlain.took === control.hitPlain.took &&
    bounty.killPlain.healed === 0 &&
    bounty.killPlain.gold === control.killPlain.gold
  );

  return JSON.stringify({ ok: ok, canMeasure: canMeasure, type: TYPE, xp: bestXp,
                          want: { took: wantTook, heal: wantHeal, gold: wantGold },
                          control: control, bounty: bounty,
                          weapon: p.weapon && p.weapon.name, weaponNote: weaponNote });
})()
