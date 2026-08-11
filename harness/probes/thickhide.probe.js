/* DOES THICK HIDE CATCH YOU?

   Berserker r5a, `bsk_thick`: "Damage that would drop you below 1 HP leaves you at 1 instead, once
   per fight." docs/SKILL_TRIAGE.md section E lists it among the 46 passives that are offered,
   described and then never consulted — `harness/audit-passives.js` finds no line in public/ outside
   CLASS2 and the PASSIVE_ART icon table that mentions the id at all.

   The audit is STATIC and proves WIRED, never CORRECT: writing `bsk_thick` in a comment turns it
   green. This drives the game's own `hurtPlayer()` and asks the body what happened.

   TWO ARMS, IN TWO LAUNCHES, because one arm KILLS THE BENCH. A death save can only be measured by
   killing the player, `hurtPlayer` answers `p.hp<=0` with `die()`, and `mode` is closure-local with
   only a getter — so there is no way back to 'play' from inside the probe. The arm is therefore
   chosen by a URL flag, which is the idiom this harness already uses for its known-bads
   (`?breakgap` in level.probe.js, `?heroslot` in mp.probe.js):

     (default)            SAVE arm      — Thick Hide chosen. Two lethal blows in the SAME fight:
                                          the first must leave you at 1, the second must NOT.
     ?thickarm=sibling    CONTROL arm   — `bsk_blood` chosen instead. One lethal blow, which must
                                          kill. This is what stops a fix that saves every berserker
                                          regardless of what they picked from reading as a pass.

   Known-bad: the SAVE arm has been watched to fail against the unfixed game — the first lethal blow
   already reports `firstSaved:false, hpAfterFirst:0, dead:true`.

   Deliberately NOT asserted on: `G._bskThick`, the once-per-fight guard. Its value is reported so
   the mechanism has a name when the answer is no, but the verdict is the second blow landing, which
   is the thing a player would feel and the thing a guard that is set and never read cannot fake. */
(function(){
  /* useSkill/hurtPlayer both sit behind mode!=='play'. Knock on the game's own resume door — the
     same idiom test-skills.js, headlong.probe.js and ward.probe.js use. */
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

  if(typeof __BF3.hurtPlayer !== 'function'){
    return JSON.stringify({ ok:false, why:'hurtPlayer is not exported — the probe cannot drive the game and must not imitate it' });
  }

  const arm = (new URLSearchParams(location.search).get('thickarm') || 'save');
  const G = __BF3.G, p = G.p;
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';
  const cs = __BF3.classState('berserker');
  cs.ch[5] = (arm === 'sibling') ? 'bsk_blood' : 'bsk_thick';

  /* Nothing else may touch the player: no enemies to swing, no companion, no lingering timers that
     grant i-frames or soak the blow. `by` is left undefined so Stillness's return-damage branch and
     every other attacker-keyed clause cannot run. */
  G.enemies.length = 0;
  p.dead = false; p.downed = false;
  p.invuln = 0; p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0;
  p._stillnessT = 0; p._headlongT = 0;

  function blow(){
    p.hp = 40;
    let threw = null;
    try { __BF3.hurtPlayer(9999, p.x, p.z + 40); } catch(e){ threw = String(e && e.message || e); }
    return { hp: Math.round(p.hp || 0), dead: !!p.dead, guard: !!G._bskThick, threw: threw };
  }

  const first = blow();
  if(arm === 'sibling'){
    return JSON.stringify({
      arm: 'sibling', ok: first.hp <= 0 && !first.threw,
      siblingSaved: first.hp > 0, hpAfter: first.hp, dead: first.dead,
      guard: first.guard, threw: first.threw,
    });
  }

  /* SAME FIGHT — G is untouched between the two blows, which is what "once per fight" means in the
     only scope this game models it in (see the doc entry: G.beastCapUsed and G._rewUsed both live
     here, and the chronomancer's own toast calls it "once per area"). */
  const second = blow();

  return JSON.stringify({
    arm: 'save',
    ok: first.hp === 1 && !first.dead && second.hp <= 0 && !first.threw && !second.threw,
    firstSaved: first.hp === 1, hpAfterFirst: first.hp, deadAfterFirst: first.dead,
    secondSaved: second.hp > 0, hpAfterSecond: second.hp, deadAfterSecond: second.dead,
    guard: { beforeFirst: false, afterFirst: first.guard, afterSecond: second.guard },
    threw: first.threw || second.threw || null,
  });
})()
