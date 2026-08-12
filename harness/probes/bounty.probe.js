/* DOES BOUNTY HUNTER (THE PASSIVE) DO ANYTHING AT ALL?

   Ranger rank-9 option b (index.html:2064) reads: "Marked enemies deal −8% to you; killing one
   heals 4% HP and gives +10% gold." `harness/audit-passives.js` says the id `r_bounty` appears
   exactly twice in the whole of public/ — in CLASS2 where it is defined and in PASSIVE_ART where
   its icon is named — and nowhere else. It is one of the 38 in docs/SKILL_TRIAGE.md section E, and
   that document already singles this row out as "fully stated, nothing blocked".

   EVERY NUMBER IS ON THE CARD — 8%, 4%, 10% — and every mechanism already exists. "Marked" means
   exactly one thing in this file: `e.markT`, set by Hunter's Mark (SKILL_FX.mark, 9860) and Death
   Mark (9951), already read for +40% damage dealt (10616, 10646) and by the reaper capstone
   (10097). Nothing is invented and there is no balance number to put to Oliver.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `r_elem` (Elemental Archer), AND IT IS ITSELF
   DEAD — the same situation ambush.probe.js had at rank 5, and stated rather than hidden. It is
   still the right control and arguably a stricter one: a passive PROVEN to affect nothing, so any
   difference between the halves is the passive under test.

   BUT THE HALVES ARE NOT THE ONLY CONTROL, AND THAT IS THE POINT OF THIS PROBE'S SHAPE. Every
   clause is also measured MARKED against UNMARKED inside the same half, against two foes of the
   same type spawned in the same launch. So a fix that made every enemy hit for 8% less, or every
   kill heal, would pass a two-half A/B and fails here — which is a different and worse bug than
   the dead one, exactly as ambush.probe.js's third strike guards "once per 6s".

   THE MARK IS PUT ON BY THE GAME, NEVER BY THE PROBE. `useSkill(3)` casts the ranger's rank-8
   a-side, Hunter's Mark, through the game's own dispatcher, and the probe asserts the target came
   back marked before it measures anything. Setting `markT` here would be imitating the mechanism
   under test, which is the fault sub-project A Task 5 records at length.

   THREE ISOLATIONS, each of which invented a bug in an earlier shape of this probe if left out:
     1. `p.xpNext` is pinned enormous. A kill grants XP, and every LEVEL-UP heals 20 HP (10967) and
        raises max HP (autoLevelGrow) — so the heal clause would read a level-up as a bounty, and
        the two halves would not even share a max HP.
     2. `p.invuln` and `p.dodgeTimer` are cleared before every hit. hurtPlayer returns early on
        either (11250) and it sets `invuln=0.7` itself on the way out, so the second hit of any pair
        is free unless it is cleared.
     3. `p.hp` is parked far above max for the damage clauses so no hit can kill, and reset to half
        of max for the kill clauses so a 4% heal has somewhere to go.

   Known-bad: watched to fail against the shipped game. */
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

  /* The Arena hands out its own loadout, which is usually off-class, and useSkill passes
     classFamilyOk(p.weapon) into every handler. Equip through the game's own starter table. */
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

  const MARK_SLOT = 3;          // rank 8 is slot 3; cheatRank10All takes a-sides, so that is Hunter's Mark
  const HIT = 300;              // big enough that an 8% cut clears hurtPlayer's rounding by a mile
  const XP  = 200;              // big enough that a 10% gold cut clears awardGold's rounding too
  const markName = () => { const s = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : [])[MARK_SLOT]; return s && s.n; };

  const freshFoe = (dz) => {
    const f = __BF3.spawnEnemy('grunt', p.x, p.z - dz);
    if(f){ f.active = true; f.immobile = true; f.hp = f.maxHp = 100000; f.xp = XP; }
    return f;
  };

  const hurtBy = (foe) => {
    p.invuln = 0; p.dodgeTimer = 0; p.shieldHp = 0; p.guardT = 0;
    p.dead = false; p.downed = false;
    p.hp = 1e6;                                   // parked above max: no clause here is about dying
    const b = p.hp;
    try { __BF3.hurtPlayer(HIT, foe.x, foe.z, foe); } catch(e){ return { err: String(e && e.message || e) }; }
    return { took: b - p.hp };
  };

  const killFor = (foe) => {
    const maxHp = __BF3.effMaxHp(p);
    p.dead = false; p.downed = false; p.invuln = 0;
    p.hp = Math.round(maxHp * 0.5);
    p.xp = 0; p.xpNext = 1e9;                     // see isolation 1 — a level-up heals 20 and moves max HP
    const hp0 = p.hp, gold0 = __BF3.meta.gold || 0;
    let err = null;
    try { foe.hp = 0; __BF3.killEnemy(foe, true); } catch(e){ err = String(e && e.message || e); }
    return { maxHp: maxHp, healed: p.hp - hp0, gold: (__BF3.meta.gold || 0) - gold0,
             expectHeal: Math.max(1, Math.round(maxHp * 0.04)), err: err };
  };

  const trial = (pick) => {
    cs.ch[9] = pick;
    G.enemies.length = 0;
    p.mana = p.maxMana || 100;
    if(p.skillCd) p.skillCd[MARK_SLOT] = 0;

    /* MARKED FOE FIRST, alone, so the game's own aim pick cannot choose the wrong body. */
    const marked = freshFoe(240);
    if(!marked) return { pick: pick, why: 'no target could be spawned' };
    p.yaw = Math.atan2(marked.x - p.x, marked.z - p.z);
    let threw = null, cast = false;
    try { __BF3.useSkill(MARK_SLOT); cast = !!(p.skillCd && p.skillCd[MARK_SLOT] > 0); }
    catch(e){ threw = String(e && e.message || e); }
    const markT = marked.markT || 0;

    const plain = freshFoe(300);                  // spawned AFTER the cast, so it can never be the one marked
    if(!plain) return { pick: pick, why: 'no control target could be spawned' };

    const tookPlain  = hurtBy(plain);
    const tookMarked = hurtBy(marked);

    const killPlain  = killFor(plain);
    const killMarked = killFor(marked);

    return { pick: pick, skill: markName(), cast: cast, markT: Math.round(markT * 100) / 100,
             plainMarkT: plain.markT || 0, threw: threw,
             tookPlain: tookPlain, tookMarked: tookMarked,
             killPlain: killPlain, killMarked: killMarked };
  };

  const control = trial('r_elem');                // the a-side of the same rank — itself dead, so provably inert
  const bounty  = trial('r_bounty');

  const ratio = (a, b) => (b ? Math.round((a / b) * 1000) / 1000 : null);
  const rTakeC = control.tookPlain && control.tookMarked ? ratio(control.tookMarked.took, control.tookPlain.took) : null;
  const rTakeB = bounty.tookPlain  && bounty.tookMarked  ? ratio(bounty.tookMarked.took,  bounty.tookPlain.took)  : null;
  const rGoldC = control.killPlain ? ratio(control.killMarked.gold, control.killPlain.gold) : null;
  const rGoldB = bounty.killPlain  ? ratio(bounty.killMarked.gold,  bounty.killPlain.gold)  : null;

  const near = (v, want) => v != null && Math.abs(v - want) < 0.02;

  const ok = !!(
    /* the bench worked at all: both halves marked one body and only that body */
    control.cast && bounty.cast && control.markT > 0 && bounty.markT > 0 &&
    !control.plainMarkT && !bounty.plainMarkT && !control.threw && !bounty.threw &&
    !control.killPlain.err && !control.killMarked.err && !bounty.killPlain.err && !bounty.killMarked.err &&
    control.tookPlain.took > 0 && bounty.tookPlain.took > 0 &&
    control.killPlain.gold > 0 && bounty.killPlain.gold > 0 &&
    /* the control half: the mark changes NOTHING, on any of the three axes */
    near(rTakeC, 1) && near(rGoldC, 1) &&
    control.killPlain.healed === 0 && control.killMarked.healed === 0 &&
    /* the bounty half: marked hits for 8% less, a marked kill heals 4% of max, and pays 10% more */
    near(rTakeB, 0.92) && near(rGoldB, 1.1) &&
    bounty.killPlain.healed === 0 &&
    bounty.killMarked.healed === bounty.killMarked.expectHeal
  );

  return JSON.stringify({
    ok: ok, hit: HIT, xp: XP,
    control: control, bounty: bounty,
    takeRatioControl: rTakeC, takeRatioBounty: rTakeB,
    goldRatioControl: rGoldC, goldRatioBounty: rGoldB,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
