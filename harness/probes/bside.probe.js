/* HALF THE GAME'S SKILLS HAVE NEVER BEEN CAST BY ANYTHING. WHICH HALF, AND ARE THEY ALIVE?

   Every class presents a 1-of-2 choice at ranks 2/4/6/8, so CLASS2 holds 16 x 4 x 2 = 128 active
   skills. `cheatRank10All` (index.html:15646) fills a valid build with `cs.ch[r] = def['r'+r].a.id`
   - the A SIDE, every time - and test-skills.js casts `c2CurSkills()`, which reads that build. So
   the suite has only ever cast 64 of the 128, and the other 64 have never been cast by the harness,
   by a probe, or by anything else that reports.

   That is the same blind spot audit-passives.js was written for and one level up: a passive nothing
   reads is inert, and a SKILL whose fx resolves to undefined spends its cooldown and its mana and
   does nothing at all (useSkill: `const fx = SKILL_FX[s.fx], r = fx ? fx(...) : null`). Nine skills
   were exactly that until 5339f48, found because they happened to sit on the A side. Nothing has
   ever asked the question of the B side.

   THIS PROBE ASKS THE CHEAP HALF OF IT, IN ONE LAUNCH AND WITH NO GAME CHANGE:
     - enumerate all 128 options straight out of the game's own CLASS2, both sides;
     - report `typeof SKILL_FX[fx]` for each, which is the exact test test-skills.js calls
       `dead handler` and the one that found the nine;
     - confirm from the game rather than from reading cheatRank10All that the default build IS the
       A side (`c2CurSkills()` after the cheat, per class), because "the bench only casts A" is the
       premise everything above rests on;
     - and confirm a B-side build is REACHABLE - flip `classState(cls).ch[r]` to the b id and check
       `c2CurSkills()` actually changes - because a sweep that cannot be steered is not worth
       building.

   What it deliberately does NOT do is cast anything. A dead handler is a static fact about the
   game's own tables and costs no ticks; whether a live handler keeps its promise is the expensive
   question and belongs in the bench, where the drift control, the pose restore and the claim parser
   already live. Answering the cheap one first is what says whether the expensive one is worth a
   run. */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();

  const C2 = __BF3.CLASS2 || {};
  const FX = __BF3.SKILL_FX || {};
  const RANKS = [2, 4, 6, 8];

  const rows = [];
  for(const cls of Object.keys(C2)){
    const def = C2[cls];
    for(const r of RANKS){
      const R = def['r' + r];
      if(!R || R.kind !== 'skill') continue;
      for(const side of ['a', 'b']){
        const o = R[side];
        if(!o) continue;
        rows.push({ cls: cls, rank: r, side: side, id: o.id, n: o.n, fx: o.fx || null,
                    typ: o.fx ? (typeof FX[o.fx]) : 'no fx field',
                    live: o.fx ? (typeof FX[o.fx] === 'function') : false,
                    d: o.d || '' });
      }
    }
  }

  /* WHICH SIDE DOES THE DEFAULT BUILD ACTUALLY CAST? Read out of the game, not out of the cheat's
     source - the point of the whole probe is that a premise nobody measured was carrying a blind
     spot, so measuring this one costs nothing and closes the loop. */
  const defaults = [];
  for(const cls of Object.keys(C2)){
    __BF3.meta.classId = cls;
    const got = (__BF3.c2CurSkills() || []).map(s => s && s.id);
    const wantA = RANKS.map(r => (C2[cls]['r' + r] || {}).a && C2[cls]['r' + r].a.id);
    defaults.push({ cls: cls, cast: got,
                    allA: JSON.stringify(got) === JSON.stringify(wantA) });
  }

  /* IS THE OTHER HALF EVEN REACHABLE? Flip one class's four picks to the b ids through the game's
     own classState/ch store - the same store openClassChoice writes - and read the cast list back. */
  const probeCls = Object.keys(C2)[0];
  __BF3.meta.classId = probeCls;
  const cs = __BF3.classState(probeCls);
  const wantB = [];
  for(const r of RANKS){ const o = C2[probeCls]['r' + r].b; cs.ch[r] = o.id; wantB.push(o.id); }
  const gotB = (__BF3.c2CurSkills() || []).map(s => s && s.id);

  const dead = rows.filter(r => !r.live);
  return JSON.stringify({
    total: rows.length,
    aSide: rows.filter(r => r.side === 'a').length,
    bSide: rows.filter(r => r.side === 'b').length,
    deadCount: dead.length,
    dead: dead.map(r => ({ cls: r.cls, rank: r.rank, side: r.side, id: r.id, n: r.n,
                           fx: r.fx, typ: r.typ, d: r.d })),
    defaultsAllA: defaults.every(d => d.allA),
    defaultsOdd: defaults.filter(d => !d.allA),
    switchable: { cls: probeCls, want: wantB, got: gotB,
                  ok: JSON.stringify(gotB) === JSON.stringify(wantB) },
  });
})()
