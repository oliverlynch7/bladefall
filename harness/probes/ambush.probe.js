/* DOES AMBUSHER (THE PASSIVE) DO ANYTHING AT ALL?

   Ranger rank-5 option b (index.html:2056) reads: "After Tumble/Shadowstrike: next click within 3s
   +20% (once per 6s)." `harness/audit-passives.js` says the id `r_ambush` appears exactly twice in
   the whole of public/ — in CLASS2 where it is defined and in PASSIVE_ART where its icon is named —
   and nowhere else. It is one of the 40 in docs/SKILL_TRIAGE.md section E.

   EVERY NUMBER IS ON THE CARD — +20%, a 3s window, once per 6s — and every mechanism already exists:
   `CLASS_BASIC.ranger` (11029) is where a ranger's basic attack already gets a multiplier, and
   `SKILL_FX.r_tumble`/`r_shadow` (10090) are the two skills the card names. Nothing is invented and
   there is no balance number to put to Oliver.

   THE CONTROL IS THE OTHER OPTION AT THE SAME RANK, `r_escape`, AND IT IS ITSELF DEAD — which is
   unusual for these probes and is stated rather than hidden. Both of the ranger's rank-5 options are
   in section E, so the a-side cannot be a "wired sibling" control the way st_momentum and pal_heal
   were. It is still the right control, and arguably a stricter one: it is a passive PROVEN to do
   nothing on the damage axis, so any difference between the halves is the passive under test.

   THE DISTANCE TRAP, and it is specific to this class. `CLASS_BASIC.ranger` returns
   `dmg * clamp(0.75 + d/520*0.6)` — the multiplier IS the range to the target. Tumble is a movement
   skill: it rolls the hero backwards. So a strike taken after a tumble is at a different distance
   from one taken before, and comparing them measures the roll, not the passive. The target is
   therefore spawned AFTER the cast, at a fixed offset from wherever the hero ended up, so every
   strike in every half is taken at the identical range.

   `G.combo` IS PINNED before every strike. `hitEnemy` increments it on each hit (10631) and
   multiplies damage by up to 1.2 (10632), so no two strikes in a sequence share a multiplier unless
   it is reset — measured on harness/probes/monkiller.probe.js, whose first run drifted 112/113/113/114.

   THREE STRIKES IN THE AMBUSH HALF, because the sentence has three clauses:
     1. the first click after the skill      → +20%
     2. the next click                       → back to 1x, because the card says "next click"
     3. a click after re-casting the skill   → still 1x, because the card says "once per 6s" and no
                                               game time passes between them (G.time only advances
                                               through update(), and none is run here)
   A passive that armed on every cast would pass clauses 1 and 2 and fail 3, and would be a different,
   worse bug than the dead one.

   Driven through the game's own systems throughout: the skill is cast with `useSkill`, not by setting
   the flag the passive reads, and the strike goes through `hitEnemy`, which is where CLASS_BASIC is
   dispatched from. Both halves assert the cast really happened, off the game's own cooldown moving.

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

  const BASE = 100, SLOT = 1;          // rank 4 is slot 1; cheatRank10All takes a-sides, so that is Tumble
  const skillName = () => { const s = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : [])[SLOT]; return s && s.n; };

  const trial = (pick) => {
    cs.ch[5] = pick;
    G.enemies.length = 0;
    p.hp = __BF3.effMaxHp(p);
    p.dead = false; p.downed = false;
    p.mana = p.maxMana || 100;
    if(p.skillCd) p.skillCd[SLOT] = 0;

    /* Cast the movement skill through the game's own dispatcher. */
    let threw = null, cast1 = false;
    try { __BF3.useSkill(SLOT); cast1 = !!(p.skillCd && p.skillCd[SLOT] > 0); }
    catch(e){ threw = String(e && e.message || e); }

    /* Spawned AFTER the cast, relative to where the roll left the hero, so range is identical in
       every half and on every strike. */
    const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 240);
    if(!foe) return { pick: pick, cast1: cast1, why: 'no target could be spawned', threw: threw };
    foe.active = true; foe.hp = foe.maxHp = 100000; foe.immobile = true;

    const strike = () => {
      G.combo = 0; G.comboT = 0;
      const b = foe.hp;
      try { __BF3.hitEnemy(foe, BASE, p, 0, 0, null); } catch(e){ threw = threw || String(e && e.message || e); }
      return b - foe.hp;
    };

    const first  = strike();
    const second = strike();

    /* Re-cast with no game time elapsed, then strike again: the "once per 6s" clause. */
    if(p.skillCd) p.skillCd[SLOT] = 0;
    p.mana = p.maxMana || 100;
    let cast2 = false;
    try { __BF3.useSkill(SLOT); cast2 = !!(p.skillCd && p.skillCd[SLOT] > 0); }
    catch(e){ threw = threw || String(e && e.message || e); }
    /* The roll moved the hero again, so the target is moved with it — same range, third time. */
    foe.x = p.x; foe.z = p.z - 240;
    const third = strike();

    return { pick: pick, skill: skillName(), cast1: cast1, cast2: cast2,
             first: first, second: second, third: third, threw: threw };
  };

  const control = trial('r_escape');          // the a-side of the same rank — itself dead, so provably inert on damage
  const ambush  = trial('r_ambush');

  const rFirst  = control.first  ? ambush.first  / control.first  : null;
  const rSecond = control.second ? ambush.second / control.second : null;
  const rThird  = control.third  ? ambush.third  / control.third  : null;

  return JSON.stringify({
    ok: !!(control.cast1 && control.cast2 && ambush.cast1 && ambush.cast2
           && control.first > 0 && control.second > 0 && control.third > 0
           && control.first === control.second && control.second === control.third   // the control never spikes
           && rFirst  != null && Math.abs(rFirst  - 1.2) < 0.02                      // +20%, as the card says
           && rSecond != null && Math.abs(rSecond - 1)   < 0.02                      // only the NEXT click
           && rThird  != null && Math.abs(rThird  - 1)   < 0.02                      // and only once per 6s
           && !control.threw && !ambush.threw),
    base: BASE, control: control, ambush: ambush,
    ratioFirst: rFirst == null ? null : Math.round(rFirst * 1000) / 1000,
    ratioSecond: rSecond == null ? null : Math.round(rSecond * 1000) / 1000,
    ratioThird: rThird == null ? null : Math.round(rThird * 1000) / 1000,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
