/* HOW MANY OF THE GAME'S 128 SKILLS ARE LITERALLY THE SAME FUNCTION?

   `bside.probe.js` asked whether every skill has a handler and answered yes (`deadCount 0`). It
   could not ask the next question, and nothing else has: TWO DIFFERENT CARDS CAN RESOLVE TO ONE
   BODY. `SKILL_FX` is assembled by aliasing across three regions of index.html — `SKILL_FX.mon_roll
   = SKILL_FX.tumble` (10333), `SKILL_FX.st_bolt = SKILL_FX.m_bolt` (10335), and forty more like
   them — so a class's kit can be another class's kit under new names, and a 1-of-2 choice can offer
   the same effect on both sides.

   Pass 42 found one instance of this by accident, from the other end: `monk/Roll` failed the bench
   because `mon_roll` and `r_tumble` are ONE handler, so `ranger/Tumble`'s known row arrived on a
   card nobody had ever cast. That was one alias noticed by hand. Nothing has ever enumerated them.

   IDENTITY IS MEASURED AT RUNTIME, NOT PARSED, and that is the whole reason this is a probe rather
   than a static audit next to audit-skills.js. `audit-skills.js` says so in its own header: which
   body an id ends up at is a RUNTIME fact, because the table is built by aliasing in three places
   plus a block of `x = x || y` fallbacks (10574-10582) plus the rewrite block at 19223 where the
   last definition wins. `SKILL_FX[a] === SKILL_FX[b]` is exact and cannot drift; a regex over the
   alias lines would be a second, weaker copy of the game's own assembly order.

   THREE SHAPES ARE REPORTED, and they are not equally bad:
     - `sameRank`  — both sides of one 1-of-2 choice are the same function. The player is offered a
                     choice that is not a choice. Nothing in the harness can see this: both options
                     have a live handler, both pass the `dead handler` test, and the bench now casts
                     both and gets the same effect twice without noticing.
     - `sameClass` — one class's kit holds the same body under two different cards.
     - `crossClass`— shared between classes. This is NOT automatically a bug: sixteen classes over
                     three cores are built on shared handlers by design, and docs/VISION.md's
                     priority #2 is about how a class FEELS, which is a judgement. It is reported as
                     a count so the size of the sharing is a number rather than an impression.

   WHAT IT DELIBERATELY DOES NOT DO is decide whether sharing is wrong. It casts nothing and changes
   nothing; it reports which cards sit on one body and hands their two descriptions over side by
   side, because "one body, two promises" means at most one of them can be honest and reading them
   is the next step, not this probe's job. */
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
                    d: o.d || '', body: (o.fx ? FX[o.fx] : undefined) });
      }
    }
  }

  /* Group by the function OBJECT. A Map keyed on the body is identity comparison, which is the
     measurement; anything keyed on a name or a source string would be back to guessing. */
  const byBody = new Map();
  for(const r of rows){
    if(typeof r.body !== 'function') continue;          // bside.probe reports 0 of these; still guarded
    if(!byBody.has(r.body)) byBody.set(r.body, []);
    byBody.get(r.body).push(r);
  }

  const shared = [];
  for(const [, members] of byBody){
    if(members.length < 2) continue;
    const classes = Array.from(new Set(members.map(m => m.cls)));
    shared.push({
      n: members.length,
      classes: classes.length,
      fxIds: Array.from(new Set(members.map(m => m.fx))),
      members: members.map(m => ({ cls: m.cls, rank: m.rank, side: m.side, id: m.id, n: m.n, fx: m.fx })),
    });
  }
  shared.sort((a, b) => b.n - a.n);

  /* THE TWO SHAPES THAT ARE FAULTS RATHER THAN FACTS. Descriptions are carried only here, so the
     payload stays readable: one body under two promises is the thing a person has to read. */
  const sameRank = [], sameClass = [];
  for(const [, members] of byBody){
    if(members.length < 2) continue;
    for(let i = 0; i < members.length; i++) for(let k = i + 1; k < members.length; k++){
      const a = members[i], b = members[k];
      if(a.cls !== b.cls) continue;
      const pair = { cls: a.cls,
                     a: { rank: a.rank, side: a.side, id: a.id, n: a.n, fx: a.fx, d: a.d },
                     b: { rank: b.rank, side: b.side, id: b.id, n: b.n, fx: b.fx, d: b.d } };
      if(a.rank === b.rank) sameRank.push(pair); else sameClass.push(pair);
    }
  }

  return JSON.stringify({
    total: rows.length,
    withBody: rows.filter(r => typeof r.body === 'function').length,
    distinctBodies: byBody.size,
    sharedGroups: shared.length,
    /* Every group, with every card, because the reason to run this is to read one body's promises
       side by side. `--eval` returns a string, so this is the whole of what a run gets to see. */
    groups: shared.map(g => ({ n: g.n, classes: g.classes,
                               cards: g.members.map(m => m.cls + '/' + m.n + ' [' + m.fx + '] ' + m.d) })),
    sameRankCount: sameRank.length,
    sameRank: sameRank,
    sameClassCount: sameClass.length,
    sameClass: sameClass,
  });
})()
