/* WEAPON MASTER PROMISES TWO THINGS AND THE FILE IMPLEMENTS ONE

   Warrior rank-9 option a (index.html:2044): "Warrior-family weapons deal +10% damage and skills
   cost 10% less mana."

   `w_master` has exactly four mentions in public/3d/index.html: the card, the PASSIVE_ART icon
   table, `skillManaCost` (10534, `v*=.9` — the SECOND clause, correct), and `CLASS_BASIC.warrior`
   (11319, the Momentum stagger firing at 2 hits instead of 3 — which is on no card at all).
   **The +10% damage has no implementation anywhere.** Found by the undocumented-rider sweep,
   docs/SKILL_TRIAGE.md section X.

   Takeable rather than Oliver's by this document's standing test: the number is the card's own
   (+10%), and the mechanism already exists — `classFamilyOk(w)` (2348) is the file's own definition
   of "in family", the one `offclassMul` uses to decide the −40% penalty. Nothing is invented, and
   the shape is the bladedancer's (3735) and the skylancer's (3732) one line up: a weapon-conditional
   multiplier inside the class's own `effPower` block.

   MEASURED THROUGH `effPower`, NOT THROUGH A SWING, and that is deliberate. A basic attack's damage
   passes through `hitEnemy`, which applies `CLASS_BASIC.warrior` — whose stagger branch this same
   passive changes (11319) — and through `G.combo`, `p._mom` and the combo multiplier. Reading
   `__BF3.effPower(p)` isolates the clause under test from the rider on the same card. `effPower` is
   what every warrior damage number in the game is built from (`playerAttack`, every `SKILL_FX`
   handler's `w.dmg*effPower(p)*…`), so it is the multiplier and not a proxy for one.

   FOUR CELLS, one launch: {w_master, control} × {in-family weapon, off-family weapon}. The card
   scopes its promise to warrior-family weapons, so a fix that ignores the weapon would pass a
   one-cell probe and hand a warrior +10% for carrying a staff.

   CONTROL is `w_juggernaut`, the b-side of the SAME rank — so exactly one thing differs between the
   halves. Its own effect (+8% damage reduction while moving, 11664) is in `hurtPlayer` and cannot
   touch `effPower`, which is what makes it a clean control rather than merely a different pick.

   KNOWN-BAD is `w_heavy`, rank 3 a — proven NOT inert on this axis (3706, `v*=1.12` when not
   charging). It is here as a positive control on the instrument: if the probe cannot see the
   multiplier that IS wired, a flat reading in the other halves says nothing.

   PINNED, because effPower reads all of them: `p.bloodlustT` (3706, +12%), `p.berserkT` (3704,
   +35%), `G.endDmgMul`, and the armour/skin multipliers — the same p and the same weapon object are
   used in every cell, so anything not named here is common to all four and divides out of the ratio. */
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
  __BF3.meta.classId = 'warrior';

  const cs = __BF3.classState('warrior');
  cs.ch = cs.ch || {}; cs.rank = 10;

  /* Two weapons, found by ASKING the game which side of the family line each falls on rather than by
     naming an art and hoping. `classFamilyOk` is the same predicate the fix is gated on, so a probe
     that disagreed with it would be measuring its own guess. */
  const ids = ['warrior'].concat(Object.keys(__BF3.CLASSES || {}));
  let wIn = null, wOut = null;
  for(const cid of ids){
    let w = null; try { w = __BF3.classStartWeapon(cid); } catch(e){}
    if(!w) continue;
    if(!wIn  &&  __BF3.classFamilyOk(w)) wIn  = w;
    if(!wOut && !__BF3.classFamilyOk(w) && w.art !== 'fist') wOut = w;   // fists take offclassMul's 0.20 branch, a different rule
  }
  if(!wIn || !wOut) return JSON.stringify({ ok:false, why:'could not find both an in-family and an off-family weapon',
                                            wIn: wIn && wIn.name, wOut: wOut && wOut.name });

  /* RANK 3 IS SET EXPLICITLY IN EVERY CELL AND THE FIRST RUN IS WHY. `cheatRank10All` fills every
     rank with its A-side, and the warrior's rank-3 A-side IS `w_heavy` — whose `v*=1.12` (3706) was
     therefore already on in the CONTROL, so the known-bad cell read 1.000 and the probe's own
     clean-check refused the whole run. Exactly the shape of bounceby.probe.js's Thick Armor trap,
     one class over. `w_swift` is the b-side of that rank and is inert on this axis: its readers are
     `effAtkSpeed` and `hitEnemy`, never `effPower`. */
  const cell = (r3, r9, w) => {
    cs.ch[3] = r3; cs.ch[9] = r9;
    p.weapon = w;
    p.bloodlustT = 0; p.berserkT = 0; p.hp = __BF3.effMaxHp(p);
    return __BF3.effPower(p);
  };

  const ctrlIn   = cell('w_swift', 'w_juggernaut', wIn);
  const ctrlOut  = cell('w_swift', 'w_juggernaut', wOut);
  const mastIn   = cell('w_swift', 'w_master',     wIn);
  const mastOut  = cell('w_swift', 'w_master',     wOut);
  /* The instrument's own positive control: a passive that DOES move effPower today, switched on at
     the rank it actually lives at while rank 9 is held at the control's pick. */
  const badIn    = cell('w_heavy', 'w_juggernaut', wIn);

  const rIn  = ctrlIn  ? mastIn  / ctrlIn  : null;
  const rOut = ctrlOut ? mastOut / ctrlOut : null;
  const rBad = ctrlIn  ? badIn   / ctrlIn  : null;

  const round = (x) => x == null ? null : Math.round(x * 10000) / 10000;

  return JSON.stringify({
    weaponIn: wIn.name + ' (' + wIn.art + ')', weaponOut: wOut.name + ' (' + wOut.art + ')',
    effPower: { ctrlIn: round(ctrlIn), ctrlOut: round(ctrlOut),
                masterIn: round(mastIn), masterOut: round(mastOut), knownBadIn: round(badIn) },
    ratioInFamily: round(rIn), ratioOffFamily: round(rOut), ratioKnownBad: round(rBad),
    /* CLEAN-CHECK: every reading is a real number, and the instrument can see a multiplier that is
       wired — w_heavy's 1.12. A run where the known-bad also read 1.000 proves nothing about the
       other two cells. */
    ok: !!(ctrlIn > 0 && ctrlOut > 0 && rBad != null && Math.abs(rBad - 1.12) < 0.005),
    /* THE TWO BARS THE ROW TURNS ON. Both false against the shipped game. */
    inFamilyGetsTheCardsTenPercent: rIn != null && Math.abs(rIn - 1.10) < 0.005,
    offFamilyIsUntouched:           rOut != null && Math.abs(rOut - 1.00) < 0.005,
  });
})()
