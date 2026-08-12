/* DOES CHARGED MAKE THE CHAIN JUMP FURTHER?

   Stormcaller rank-7 option a (index.html:2182) reads: "Your chain jumps twice as far between
   targets." `st_charged` is one of docs/SKILL_TRIAGE.md section E's dead passives, and it was filed
   under the same stale blocker Overcharge was: "There is no chain in the game." There is —
   `CLASS_BASIC.stormcaller` (index.html:11315) has been it since 96cd511 on 2026-08-03 — and its
   jump distance is a single literal, 260.

   So the number is the card's own: TWICE as far is 520, and 260 is already in the file.

   THE BAR IS A BODY THAT IS OUT OF REACH AND MUST COME INTO REACH — one neighbour at 400 units from
   the target, which is past the shipped 260 and inside a doubled 520. A probe that only counted arcs
   would go green on any wiring that widened the radius by any amount at all, so a SECOND neighbour
   stands at 700: past 520 as well, and it must stay untouched in every half. Between them they pin
   the new reach from both sides rather than asserting it is merely bigger.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game. `st_amped` (Amped) is
   the control: the b-side of this very rank, and dead - so a control half reproduces the shipped
   reach exactly.

   PERMANENT KNOWN-BAD: a third half puts `mon_iron` - a still-dead passive belonging to another
   class - in the same slot, so `okAgainstInert` is what this probe would report against the unfixed
   game. It must be false while `ok` is true.

   RANK 3 IS PINNED TO `st_conductor`, NOT to Overcharge, on purpose: Overcharge (wired 2026-08-12,
   pass 37) takes the two nearest bodies, which would put a second arc in flight and make "which body
   did the reach reach" a harder question than it needs to be. One arc, one distance. */
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
  __BF3.meta.classId = 'stormcaller';

  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('stormcaller');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'st_conductor';   // NOT Overcharge — see the header: one arc, one distance
  cs.ch[5] = 'st_ward';        // wired, and a shield on cast: it cannot reach an enemy
  cs.ch[9] = 'st_master';      // dead today (stun on a chained body)

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };
  const dist = (a, b) => Math.round(Math.hypot(a.x - b.x, a.z - b.z));

  /* One trial. Three neighbours: one inside the shipped reach so every half has an arc to make and
     a half that produced none can be told from a half that produced the wrong one; one at 400,
     which is the body the card is about; one at 700, which no honest wiring may reach. */
  const trial = () => {
    G.enemies.length = 0;
    const tgt  = __BF3.spawnEnemy('grunt', p.x,       p.z - 240);
    const mid  = __BF3.spawnEnemy('grunt', p.x + 400, p.z - 240);
    const out  = __BF3.spawnEnemy('grunt', p.x + 700, p.z - 240);
    const all  = [tgt, mid, out];
    if(all.some(e => !e)) return { why:'bodies could not be spawned' };
    for(const e of all){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
    }
    tick(2);

    const before = all.map(e => e.hp);
    let threw = null;
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 60, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const lost = all.map((e, i) => Math.round(before[i] - e.hp));

    return {
      threw: threw, tgtLost: lost[0], midLost: lost[1], outLost: lost[2],
      arcs: [lost[1], lost[2]].filter(v => v > 0).length,
      dMid: dist(mid, tgt), dOut: dist(out, tgt),
      chaining: p._chaining || 0,
    };
  };

  /* A near trial, run once per half as a floor: a body at 80 units is inside the reach whatever the
     passive does, so a half whose arc simply stopped working is distinguishable from one whose reach
     did not grow. */
  const nearTrial = () => {
    G.enemies.length = 0;
    const tgt  = __BF3.spawnEnemy('grunt', p.x,      p.z - 240);
    const near = __BF3.spawnEnemy('grunt', p.x + 80, p.z - 240);
    if(!tgt || !near) return { why:'bodies could not be spawned' };
    for(const e of [tgt, near]){
      e.active = true; e.dummy = false; e.elite = false; e.boss = false;
      e.speed = 0; e.hp = e.maxHp = 100000; e.stunT = 0;
    }
    tick(2);
    const h0 = near.hp;
    G._desig = false;
    try { __BF3.hitEnemy(tgt, 60, p, 0, 0, null); } catch(e){}
    return { nearLost: Math.round(h0 - near.hp) };
  };

  const half = (pick) => { cs.ch[7] = pick; return { pick: pick, t: trial(), n: nearTrial() }; };

  const control = half('st_amped');      // b-side of the same rank: dead, and changes no distance
  const charged = half('st_charged');
  const inert   = half('mon_iron');      // an id nothing reads - the permanent known-bad

  const clean = (h) => !h.t.threw && h.t.tgtLost > 0 && h.n.nearLost > 0
                    && h.t.dMid > 260 && h.t.dMid < 520 && h.t.dOut > 520;
  const allClean = [control, charged, inert].every(clean);

  /* The bar: the 400 body is struck and the 700 body is not — "twice as far", not "everywhere". */
  const bar  = (h) => h.t.midLost > 0 && h.t.outLost === 0;
  /* What every other half must still do: nothing at 400, because 400 is past the shipped 260. */
  const short = (h) => h.t.arcs === 0 && h.t.midLost === 0 && h.t.outLost === 0;

  return JSON.stringify({
    ok: !!(allClean && bar(charged) && short(control) && short(inert)),
    okAgainstInert: !!(allClean && bar(inert)),
    allClean: allClean, controlShort: short(control), inertShort: short(inert),
    control: control, charged: charged, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote,
  });
})()
