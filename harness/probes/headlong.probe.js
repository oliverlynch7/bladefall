/* BERSERKER HEADLONG — does the charge ever STOP?

   `SKILL_FX.bsk_charge` (index.html:18782) is the Berserker's Headlong: it sets `p._headlongT=0.9`
   and update() (12345) reads that timer to drive the body forward at 760 units/second with vx/vz
   pinned to zero. `_headlongT` appears four times in the whole file — set once, read three times —
   and NOTHING decremented it, so the first Headlong of a run was permanent: the hero flew in a
   straight line, unsteerable, until the run ended.

   Recorded in docs/SKILL_TRIAGE.md section B, found by the skill bench rather than by reading:
   the berserker's HP went 239 → 477 during a five-second observation window because the body had
   left the fight entirely.

   THIS DRIVES THE GAME'S OWN CODE ON BOTH SIDES. The cast is the game's own `SKILL_FX.bsk_charge`
   (exported at 18885) and the motion is the game's own `update()` (exported at 18868); the probe
   only samples. Per index.html's own note, "every probe that reimplements one of these tests
   eventually measures something the game does not believe" — and a probe that decremented the
   timer itself would pass against the broken game, which is the whole failure mode this harness
   exists to avoid.

   The known-bad is not a URL flag, unlike level.probe.js's `?breakgap` and mp.probe.js's
   `?heroslot`. Both of those exist because their bug was already fixed when the probe was written,
   so a green run proved nothing on its own. This probe was run against the UNFIXED game first and
   watched to fail: `stops:false` with the timer reading 0.9 at every one of the three samples, the
   body still moving 1482 units in the third second of a 0.9-second dash, and the shot handed back a
   frame with NO HERO IN IT and `Deaths 1` on the HUD (`_shot/out/hl-before.png`). Teaching the live
   game a flag that re-breaks the hero's movement, in the hot path of update(), would cost more than
   the one-line fix it guards.

   Two things the failing run measured that are worth keeping. The late windows report `maxStep`
   164.7 and 253.3 — far above the charge's own 12.7 a tick — because those steps are the game's
   fell-out-of-the-world rescue snapping the body back to `G.lastSafe` so it can be flung out again;
   that is why this samples per-TICK displacement and not net travel. And the class does not matter:
   `bsk_charge` only writes fields on the `p` it is handed, so the arena's default warrior is a
   perfectly good body to cast it on, and the probe says which one it used.

     node _shot/shot.js --scene arena:flat --eval @harness/probes/headlong.probe.js */
(function(){
  const B = window.__BF3;
  if(!B || !B.G || !B.G.p) return JSON.stringify({ skip: 'no game' });
  const G = B.G, p = G.p;
  const fx = B.SKILL_FX && B.SKILL_FX.bsk_charge;
  if(typeof fx !== 'function') return JSON.stringify({ skip: 'SKILL_FX.bsk_charge is not a function' });

  /* useSkill's own first guard is `mode!=='play'`, and roughly one launch in six arrives paused —
     see test-skills.js. update() returns on the same test, so a paused bench would measure a hero
     that never moved and call the bug fixed. Knock on the game's own resume door (7765). */
  const phases = [];
  const mark = (t) => phases.push({ at: t, mode: B.mode });
  mark('arrive');
  if(B.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(B.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
    mark('after resume knock');
  }
  if(B.mode !== 'play') return JSON.stringify({ skip: 'not in play', phases: phases });

  /* Traversal only: an enemy shoving the hero, or the hero being knocked back, is motion this
     probe would have to tell apart from the charge. Cheaper to empty the room. */
  G.enemies.length = 0;
  if(B.input){ B.input.jx = 0; B.input.jz = 0; B.input.jump = false; B.input.jumpEdge = false; }

  const at = () => ({ x: p.x, z: p.z });
  /* Per-TICK displacement, not net travel. Net travel cannot tell a still hero from one the game's
     fell-out-of-the-world rescue has just put back where it started; a tick step can. Under the
     bug every late tick steps 760/60 = 12.7 units. */
  const run = (ticks) => {
    let maxStep = 0, sum = 0;
    for(let k = 0; k < ticks; k++){
      const b4 = at();
      try { B.update(1/60); } catch(e){}
      const d = Math.hypot(p.x - b4.x, p.z - b4.z);
      if(d > maxStep) maxStep = d;
      sum += d;
    }
    return { maxStep: Math.round(maxStep * 10) / 10, travelled: Math.round(sum) };
  };

  const t0 = () => Math.round((p._headlongT || 0) * 100) / 100;
  const before = t0();
  try { fx(p, true, 1); } catch(e){ return JSON.stringify({ skip: 'cast threw: ' + (e && e.message) }); }
  const tCast = t0();
  mark('cast');

  /* 0.9s is the authored duration, so the first window is the dash itself and the rest is after it.
     Sampled in three windows rather than two so a timer that decays at the wrong RATE is visible as
     well as one that never decays at all. */
  const during = run(54);                 // 0.9s — the dash
  const tAfterDash = t0();
  const settle = run(66);                 // to 2.0s — anything still winding down
  const tSettle = t0();
  const late = run(60);                   // 2.0s → 3.0s — the hero must be under its own control
  const tLate = t0();
  mark('done');

  return JSON.stringify({
    at: G.areaName, cls: B.meta && B.meta.classId,
    t: { before: before, atCast: tCast, afterDash: tAfterDash, atSettle: tSettle, late: tLate },
    during: during, settle: settle, late: late,
    /* THE ASSERTION. The timer must reach zero, and once it has, Headlong must not be moving the
       body — 760/60 is 12.7 units a tick, so a late step over 2 units is the charge still running.
       `dashed` is the other half: a fix that simply deleted the charge would zero the timer too. */
    dashed: during.travelled > 300,
    stops: tLate === 0 && late.maxStep < 2,
    phases: phases,
  });
})()
