/* DOES QUICK HANDS DO WHAT ITS CARD SAYS?

   Pirate rank-3 option b (index.html:2142) reads: "Opening a chest reloads your pistol."

   THIS ROW IS NOT SECTION E'S SHAPE AND THAT IS THE POINT. `harness/audit-passives.js` has always
   reported `pir_swift` as WIRED, because it is: it has one reader, `effAtkSpeed` (3754), where it
   grants +10% attack speed. The audit asks "does anything read this id" and the answer is yes. It
   cannot ask whether the reader honours the card, and the card says nothing about attack speed.
   The promise the card DOES make had no implementation at all: `_loaded` has three writers in the
   whole file — spent on a shot (11306), reloaded on a KILL (10979), and arrive-loaded (12938) — and
   no chest anywhere near any of them. Same shape as sections H, N and O: counted wired for its whole
   life, doing something other than what the player was told.

   NOTHING IS INVENTED. The card is a boolean, and the fix is the kill rider's own four lines
   verbatim, floater and colour included.

   THE GAME OPENS THE CHEST, NOT THE PROBE. `__BF3.openChest` is exported, and calling it would be
   the same mistake sub-project A's Task 5 records: a probe that drives the door it is testing proves
   the door swings, not that anything opens it. This pushes an ordinary chest — `{x,z,y,opened:false,
   bob:0}`, exactly what every scape builder pushes — into `G.chests` at the hero's feet and ticks,
   so the game's own interact step (13347) decides a chest was opened.

   AND THE PISTOL IS SPENT BY THE GAME TOO. `CLASS_BASIC.pirate` (11301) is what fires it and clears
   `_loaded`, dispatched from inside `hitEnemy`. The probe never assigns `_loaded`: that flag is both
   the input and the output of the thing under test, and writing it would be Task 5's "assert on what
   you just assigned" in a new costume.

   TWO TRIALS PER HALF, one per direction of the claim:
   - CHEST: the pistol is spent, a chest is opened, and it must come back — but only in the half that
     holds the passive.
   - NO CHEST: the pistol is spent and the same number of ticks pass with no chest anywhere. It must
     stay spent in EVERY half. A passive that reloaded on a timer, or on any interact, would satisfy
     a chest-only bar and be a different and worse bug.

   A THIRD READING PER TRIAL, because a wiring can be right and still break its host: the chest must
   still pay out. The purse is read either side of every open, in every half, so a fix that reloaded
   the pistol and swallowed the payout cannot pass.

   THE LOOT ITSELF IS NOT READ HERE, and saying so is better than reporting a zero as a verdict. The
   drops land at `ch.x ± 28, ch.z + 20` and the pickup step (13369) collects anything within 40 units
   in the SAME frame the chest loop created it, so a hero standing on the chest it just opened reads
   `G.pickups.length` unchanged whether two items dropped or none. Measured, not assumed: 0 in all
   three halves on the first run of this probe. Offsetting the chest does not rescue it either — one
   of the two drop positions stays inside the 40, and the drop COUNT is `1 + (rand < 0.4)`, so the
   bar would flap. What the purse reading does prove is that `openChest` ran its body past the four
   inserted lines; the drops loop is three lines below the gold line and is untouched by this fix.

   THREE HALVES IN ONE LAUNCH: the control is `pir_deadly`, the a-side of this very rank (so the only
   difference between the halves is the pick), and the known-bad is `mon_iron` — a dead id from
   another class fed to the identical bar, so `okAgainstInert` is what this probe would have said
   against the shipped game.

   ONE THING IT REPORTS AND DOES NOT FAIL ON: `weaponNote`. `classStartWeapon('pirate')` does not
   pass the game's own `classFamilyOk`, so the bench falls back to an in-family starter borrowed from
   another class and says which. That is docs/SKILL_TRIAGE.md section D — three classes cannot equip
   their own starting weapon — a known game bug that is Oliver's, and it does not touch this row: the
   pistol is `CLASS_BASIC.pirate`, which fires off the class id and not off the weapon, and the
   `spentBefore*` readings prove it fired. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'pirate';
  __BF3.meta.pirateSlot = 'basic';

  /* Off-class casting is sub-project B Task 1 Step 1's fault 1: a great many handlers gate their
     defining half on `classFamilyOk(p.weapon)`, and the bench is the only thing in the world that can
     stand in a state the game hard-blocks. Equip through the game's own starter. */
  let weaponNote = 'none';
  (function(){
    const tries = ['pirate'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  const cs = __BF3.classState('pirate');
  cs.ch = cs.ch || {};
  __BF3.meta.camMode = 'far';
  G.chests = G.chests || [];

  let threw = null;
  const home = { x: p.x, z: p.z };
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };
  const gold = () => (__BF3.meta && __BF3.meta.gold) || 0;

  /* Spend the pistol the way the game does: land one ordinary hit while loaded and let
     CLASS_BASIC.pirate decide a shot happened. Returns whether it actually got spent, so a trial
     that failed to stage itself is reported as unstaged rather than silently counted. */
  const spend = () => {
    G.enemies.length = 0;
    p.x = home.x; p.z = home.z; p.vx = 0; p.vz = 0; IN.jx = 0; IN.jz = 0;
    p._slipT = 0;
    const e = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
    if(!e) return null;
    p.yaw = Math.atan2(e.x - p.x, e.z - p.z);
    e.active = true; e.immobile = true; e.hp = e.maxHp = 100000;
    try { __BF3.hitEnemy(e, 100, p, 0, 0, null); } catch(err){ threw = threw || String(err && err.message || err); }
    G.enemies.length = 0;
    p.x = home.x; p.z = home.z; p.vx = 0; p.vz = 0;
    return p._loaded;
  };

  /* A plain chest at the hero's feet — not a mimic, and built exactly as every scape builder builds
     one. `G.chests` is left holding only this one so the interact step cannot open a stray. */
  const openOne = () => {
    G.chests.length = 0;
    const ch = { x: p.x, z: p.z, y: p.y || 0, opened:false, bob:0 };
    G.chests.push(ch);
    const pk0 = (G.pickups || []).length, g0 = gold();
    tick(12);
    return { opened: !!ch.opened, loaded: !!p._loaded,
             pickupsGained: (G.pickups || []).length - pk0, goldGained: gold() - g0 };
  };

  const idle = () => {
    G.chests.length = 0;
    const pk0 = (G.pickups || []).length, g0 = gold();
    tick(12);
    return { opened:false, loaded: !!p._loaded,
             pickupsGained: (G.pickups || []).length - pk0, goldGained: gold() - g0 };
  };

  const trial = (pick) => {
    cs.ch[3] = pick;
    p.hp = __BF3.effMaxHp(p); p.dead = false; p.downed = false;
    (G.pickups || []).length = 0;

    const spent1 = spend();
    const chest = (spent1 === false) ? openOne() : null;

    const spent2 = spend();
    const nochest = (spent2 === false) ? idle() : null;

    return { pick: pick, spentBeforeChest: spent1, spentBeforeIdle: spent2,
             chest: chest, nochest: nochest };
  };

  const control = trial('pir_deadly');
  const quick   = trial('pir_swift');
  const inert   = trial('mon_iron');

  /* Both halves of a trial have to have been staged or none of its numbers mean anything: the pistol
     must have been spent before each of the two windows, and the chest window must really have opened
     a chest. */
  const staged = (t) => !!(t && t.spentBeforeChest === false && t.spentBeforeIdle === false
                           && t.chest && t.nochest && t.chest.opened);
  /* The chest still pays out, in every half — a reload that ate the payout is not a fix. Gold only;
     see the header for why the drops cannot be counted from where the hero has to stand. */
  const paid = (t) => !!(t && t.chest && t.chest.goldGained > 0 && t.nochest.goldGained === 0);

  const ok = !!(staged(control) && staged(quick) && staged(inert) && !threw
                && paid(control) && paid(quick) && paid(inert)
                && quick.chest.loaded === true            // the card's own sentence
                && quick.nochest.loaded === false         // and only for a chest
                && control.chest.loaded === false         // nothing without the pick
                && control.nochest.loaded === false
                && inert.chest.loaded === false           // nor for a dead id fed the same bar
                && inert.nochest.loaded === false);

  return JSON.stringify({
    ok: ok,
    okAgainstInert: !!(staged(inert) && inert.chest.loaded === true && inert.nochest.loaded === false),
    control: control, quick: quick, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, threw: threw,
  });
})()
