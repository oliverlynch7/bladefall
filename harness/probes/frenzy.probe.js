/* PICKING FRENZY MAKES THE GAME UNPLAYABLE — measured, not read.

   `hurtPlayer` (index.html:11205) carries this line:

     if(meta.classId==='berserker'&&c2def('berserker')){ if(c2Passive('bsk_frenzy')){ … v*=1+(1-fr); }}

   There is no `v` in hurtPlayer. It is an ATTACK-SPEED line pasted into the damage-TAKEN function —
   the identical clause appears three more times in the file (3740, 3754, 3760) where a local `v` is
   the stat being scaled, and 3754 is `effAtkSpeed`, where Frenzy is already correctly implemented.
   The file is strict (`index.html:1019`), so the copy in hurtPlayer throws.

   Found as a free diagnostic while wiring Thick Hide (harness/probes/thickhide.probe.js) — a direct
   `hurtPlayer` call with `bsk_frenzy` chosen returned `threw: "v is not defined"` and left HP exactly
   where it started. This probe measures the two consequences that matters to a player, because the
   throw itself is only the mechanism:

   1. THE FREEZE. `frame()` (18794) has no try/catch and calls `requestAnimationFrame(frame)` on its
      LAST line, after `update(DT)`. An exception out of update therefore never reaches the
      reschedule, so the loop is not just interrupted — it is never re-armed. Measured by letting the
      game's OWN loop run in real time with attackers on the player and sampling its frame counter
      (`voxMetrics().frame`) once a second: a live game keeps counting, a hard-locked one stops dead.
      Not read off the source, because "the loop stops" is a claim about what happens, and four
      sessions of this project have been spent on changes that read correctly and did not land.

   2. INVULNERABILITY, until it locks. The throw happens BEFORE `p.hp-=dmg` (11226), so the hit that
      triggers it is swallowed whole.

   A/B on the same rank in the same launch: `bsk_rage` is r7's a-side and must behave normally.
   Rank 7 is reachable by any berserker who plays to it, and Frenzy is one of exactly two choices
   there — so this is not an edge case, it is half of a rank. */
(async function(){
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
  if(G.hub) return JSON.stringify({ ok:false, why:'in the hub — nothing there can hit you' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[5] = 'bsk_blood';                    // NOT bsk_thick: a death save would hide a swallowed hit

  /* Three grunts within melee reach, kept unkillable so the fight cannot end early. The player never
     swings on its own, so nothing here depends on the bench's weapon. */
  const arm = () => {
    G.enemies.length = 0;
    p.dead = false; p.downed = false; p.invuln = 0; p.dodgeTimer = 0;
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0; p._stillnessT = 0;
    p._thickUsed = false; p._thickHitT = -99;
    p.hp = Math.round(__BF3.effMaxHp(p));
    let n = 0;
    for(let k = 0; k < 3; k++){
      const e = __BF3.spawnEnemy('grunt', p.x + (k - 1) * 40, p.z + 46);
      if(e){ e.active = true; e.hp = e.maxHp = 100000; n++; }
    }
    return n;
  };

  /* PHASE 1 — the freeze, through the game's own requestAnimationFrame loop, in real time.

     TWELVE seconds, and the first version's FOUR proved nothing at all: headless SwiftShader runs
     this scene at about five frames a second and `frame()` clamps dt to 0.05, so four real seconds
     buy under ONE second of simulation and no grunt had swung yet. Both halves came back
     `tookDamage:false` — a green-looking pair of samples measuring a fight that had not started.
     Hand-driven, the first hit lands at tick 72 (1.2s of sim), so the control half must be seen to
     TAKE DAMAGE for the duration to be long enough to mean anything; that is asserted, not assumed.

     The control runs FIRST on purpose. If the frenzy half locks the loop, a control measured
     afterwards would report a dead loop and be read as "the control froze too". */
  const freeze = async (pick) => {
    cs.ch[7] = pick;
    const foes = arm();
    const hp0 = p.hp, f0 = __BF3.voxMetrics().frame;
    const samples = [];
    for(let s = 0; s < 12; s++){
      await new Promise(r => setTimeout(r, 1000));
      samples.push(__BF3.voxMetrics().frame - f0);
    }
    return { pick: pick, foes: foes, frames: samples,
             lastSecond: samples[11] - samples[10],        // 0 means the loop is not coming back
             hp0: hp0, hp: Math.round(p.hp), tookDamage: p.hp < hp0 };
  };

  /* PHASE 2 — the throw itself, hand-driven so the tick count is fixed and the verdict is not a race
     with how fast headless renders. */
  const ticks = (pick) => {
    cs.ch[7] = pick;
    const foes = arm();
    const hp0 = p.hp;
    let threw = 0, first = null, atTick = -1;
    for(let i = 0; i < 900; i++){
      try { __BF3.update(1/60); }
      catch(e){ threw++; if(!first){ first = String(e && e.message || e); atTick = i; } }
    }
    return { pick: pick, foes: foes, threw: threw, first: first, atTick: atTick,
             hp0: hp0, hp: Math.round(p.hp), tookDamage: p.hp < hp0 };
  };

  const fControl = await freeze('bsk_rage');
  const fFrenzy  = await freeze('bsk_frenzy');
  const tControl = ticks('bsk_rage');
  const tFrenzy  = ticks('bsk_frenzy');

  return JSON.stringify({
    /* `durationHonest` is a precondition, not a result: if the control half never got hit, the freeze
       half proves nothing either way and `ok` must not be able to go green off it. */
    ok: fControl.tookDamage
        && fControl.lastSecond > 0
        && fFrenzy.lastSecond > 0 && fFrenzy.tookDamage
        && tControl.threw === 0 && tControl.tookDamage
        && tFrenzy.threw === 0 && tFrenzy.tookDamage,
    durationHonest: fControl.tookDamage,
    freezeFrenzy: fFrenzy, freezeControl: fControl,
    ticksControl: tControl, ticksFrenzy: tFrenzy,
    maxHp: Math.round(__BF3.effMaxHp(p)), arena: !!G.arena,
  });
})()
