/* WHAT SHAPE IS THE STORMCALLER'S CHAIN?

   The Stormcaller's identity is one function: `CLASS_BASIC.stormcaller` (index.html ~11004). Its
   basic attack arcs to the nearest OTHER enemy within 260 units for 34% of the hit. That single arc
   is the whole mechanic, and SIX of the class's eight passives are written about it:

     st_overcharge  r3b  "Your lightning arcs to a third enemy as well as a second."
     st_charged     r7a  "Your chain jumps twice as far between targets."
     st_amped       r7b  "Each jump in a chain hits harder than the last, not weaker."
     st_master      r9a  "A chained enemy is briefly stunned by the jolt."
     st_galvanize   r9b  "Chains that find no second target strike the first one twice."
     st_conductor   r3a  "Wet, frozen or shocked enemies chain to everything near them."

   Every one of them was on the dead list in docs/SKILL_TRIAGE.md section E — offered, described, and
   read by nothing. So this probe measures the ARC ITSELF rather than any one passive: given a rank
   choice, it reports which bodies the arc reached, how much each took, and whether any was stunned.
   Each pass of sub-project B Task 2 that wires one of the six adds its arm below; the earlier arms
   stay as regression checks, which is why this is one instrument and not six probes.

   IT DRIVES THE GAME'S OWN DAMAGE PATH. `hitEnemy(prim, dmg, G.p, …)` with `G._desig` falsy is
   exactly what a basic attack does (10668: `if(src===G.p && !(G&&G._desig))`), so the hook under
   test is reached the way the player reaches it. Nothing here reimplements the arc — a probe that
   did would pass against a game that had none, which is how the multiplayer probe once tested
   itself (plan Task 5).

   THE RIG. One primary at the player's usual bench distance, then three bystanders in a line away
   from it at 120, 200 and 400 units FROM THE PRIMARY — chosen against the numbers in the mechanic
   rather than at random:
     · 120  the nearest, so the base game's single arc must land here and nowhere else
     · 200  inside the 260 search radius, so it is reached only by a SECOND jump (Overcharge)
     · 400  outside 260 and inside 520, so it is reached only by a doubled radius (Charged)
   A base-game arm that hits anything other than the 120 means the rig is wrong, not the game — so
   every arm reports all four bodies and the reader can tell those two cases apart.

   KNOWN-BAD, PERMANENT: the `base` arm IS one. It is the unfixed behaviour, it runs on every
   invocation, and it must show exactly one jump. If a later change makes the base arm chain twice,
   these assertions have stopped discriminating and nothing below means anything.

   THE CONTROL ARM CHOOSES NOTHING, not the sibling option. Storm Ward's probe could use its
   sibling because that sibling is wired and does something unrelated; here every sibling is another
   dead chain passive that a later pass will wire — at which point a control arm holding one would
   quietly stop being a control. `ch[r] = null` is a state every player passes through on the way to
   rank 3. */
(function(){
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
  const G = __BF3.G, p = G.p;

  let weaponNote = 'none';
  (function(){
    const tries = ['stormcaller'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; weaponNote = i === 0 ? 'own starter' : 'borrowed from ' + tries[i]; return; }
    }
  })();

  const ch = __BF3.c2ch('stormcaller');
  const HIT = 100;                              // the damage the primary takes; a jump is 34% of it

  const spawn = (x, z) => {
    const e = __BF3.spawnEnemy('grunt', x, z);
    if(e){ e.active = true; e.dropT = 0; e.maxHp = 1e6; e.hp = 1e6; e.stunT = 0; }
    return e;
  };

  /* Cast one basic-attack hit at the primary under a given rank-choice state, and report every body
     the arc touched. Bodies are rebuilt per arm so one arm's damage cannot leak into the next —
     the same isolation test-skills.js had to learn for the player (SKILL_TRIAGE section F). */
  const arm = (label, choices) => {
    for(const r of [3, 5, 7, 9]) ch[r] = (choices && choices[r]) || null;
    G.enemies.length = 0;
    p.x = 0; p.z = 0; p.y = p.y || 0;
    const prim = spawn(0, -60);
    const near = spawn(120, -60);               // 120 from the primary
    const mid  = spawn(200, -60);               // 200 — inside the base 260 radius, second jump only
    const far  = spawn(400, -60);               // 400 — outside 260, inside a doubled 520
    if(!prim || !near || !mid || !far) return { label, ok:false, why:'spawnEnemy returned nothing' };
    const hp0 = [prim.hp, near.hp, mid.hp, far.hp];
    let threw = null;
    G._desig = false;                           // a BASIC hit: the only kind that reaches CLASS_BASIC
    try { __BF3.hitEnemy(prim, HIT, p, 0, 0, null); } catch(e){ threw = String(e && e.message || e); }
    const took = (e, h0) => Math.round(h0 - e.hp);
    const body = (e, h0) => ({ took: took(e, h0), stunT: Math.round((e.stunT || 0) * 100) / 100 });
    const jumps = [near, mid, far].filter((e, i) => took(e, hp0[i + 1]) > 0).length;
    return { label, chose: { 3: ch[3], 5: ch[5], 7: ch[7], 9: ch[9] }, threw, jumps,
             primary: body(prim, hp0[0]), at120: body(near, hp0[1]),
             at200: body(mid, hp0[2]), at400: body(far, hp0[3]) };
  };

  /* ARMS. `base` is the permanent known-bad; each wired passive adds one below it. */
  const base       = arm('base — no rank choices at all', null);
  const overcharge = arm('st_overcharge — "arcs to a third enemy as well as a second"', { 3: 'st_overcharge' });

  const R = { weapon: weaponNote, hit: HIT, base, overcharge };

  /* THE BARS.
     base: exactly one jump, and it must be the NEAREST body — that is the shipped mechanic, and an
       arm that fails here invalidates every arm under it rather than reporting a fix.
     overcharge: two jumps, the 120 AND the 200, and still nothing at 400 (that is Charged's promise,
       not this one — a fix that reached it would be doing something its card does not say). */
  R.baseOk = !!(base.jumps === 1 && base.at120.took > 0 && base.at200.took === 0 && base.at400.took === 0);
  R.overchargeOk = !!(overcharge.jumps === 2 && overcharge.at120.took > 0 && overcharge.at200.took > 0
                      && overcharge.at400.took === 0);
  R.ok = !!(R.baseOk && R.overchargeOk);
  return JSON.stringify(R);
})()
