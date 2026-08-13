/* WHAT TAKES mp-drift's BENCH OUT OF PLAY MODE, AND WHEN?

   A diagnostic, not an assertion. `harness/probes/mp-drift.probe.js` walks the player a 30-second lap
   and then runs three correction trials, and every trial has been reading `moved: 0` - including the
   one that MUST move. Two causes have already been excluded by measurement rather than by reading:
   the update does not throw (`tickThrew: null` on all three) and the observer is not dead
   (`player: {dead:false, hp:100}`).

   The third reading is what sent this probe: **every trial reports `mode: "menu"`.** `update()`
   returns at its third line unless `mode === 'play'` (index.html:13038), so the trials were ticking a
   game that had stopped - which reads exactly like a working guard and is the failure shape this
   whole sub-project exists to catch.

   `mode` has ~50 assignment sites in the file and `__BF3` exports it as a getter with no setter, so
   this asks the game WHEN it left and WHAT screen it went to, rather than guessing which site did it.
   It reports the first departure, every transition after it, and the overlay that was up at the
   moment - because the overlay is what names the door to knock on (the skill bench knocks on the
   PAUSE card's own Resume button, and a 'menu' is not that card). */
(function(){
  const B = __BF3, G = B.G;
  const live = () => (G.enemies || []).filter(e => e && !e.dead && !e.practice && !e.dummy);

  /* What is on screen right now, in the terms that identify a door: the overlay's visibility, the
     ids of every button inside it, and the first line of its text. A screen with a #resBtn is the
     pause card; one with #tutGo is a briefing; one with neither is something else again. */
  const screenNow = () => {
    const out = { overlayHidden: null, buttons: [], text: null, cards: [] };
    try {
      const ov = document.getElementById('overlay');
      if(ov){
        out.overlayHidden = ov.classList.contains('hide');
        out.buttons = Array.from(ov.querySelectorAll('button, .btn, [onclick]'))
                           .map(b => b.id || ('.' + (b.className || '').split(' ')[0]))
                           .filter(Boolean).slice(0, 12);
        out.text = (ov.innerText || '').trim().split('\n').filter(Boolean).slice(0, 4);
        out.cards = Array.from(ov.children).map(c => c.id || ('.' + (c.className || '').split(' ')[0]))
                         .slice(0, 8);
      }
    } catch(e){ out.err = String(e && e.message || e); }
    return out;
  };

  for(const e of live()){ e.active = true; e.dropT = 0; }
  const IN = B.input, meta = B.meta;
  const camWas = meta.camMode; meta.camMode = 'far';

  const TICKS = 1800;
  const transitions = [];
  let prevMode = B.mode;
  let firstLeave = null;

  const startMode = B.mode;
  for(let k = 0; k < TICKS; k++){
    const a = (k / 60) * 0.5;
    IN.jx = Math.cos(a); IN.jz = Math.sin(a);
    let threw = null;
    try { B.update(1 / 60); } catch(e){ threw = String(e && e.message || e); }
    const m = B.mode;
    if(m !== prevMode){
      const row = { tick:k, sec:Math.round(k / 60 * 10) / 10, from:prevMode, to:m, threw:threw,
                    hp:Math.round(G.p.hp), dead:!!G.p.dead, downed:!!G.p.downed,
                    x:Math.round(G.p.x), z:Math.round(G.p.z),
                    area:G.areaName, enemiesAlive:live().length };
      if(transitions.length < 12) row.screen = screenNow();
      transitions.push(row);
      if(firstLeave === null && m !== 'play') firstLeave = transitions.length - 1;
      prevMode = m;
    }
    /* The same life support mp-drift's lap uses, so this measures the SAME bench rather than a
       friendlier one. If the departure survives this, it is not attrition. */
    G.p.hp = G.p.maxHp || 100; G.p.invuln = 999;
  }
  IN.jx = 0; IN.jz = 0; meta.camMode = camWas;

  return JSON.stringify({
    ok: true, at: G.areaName, startMode: startMode, endMode: B.mode,
    ticks: TICKS,
    transitionCount: transitions.length,
    firstLeaveIndex: firstLeave,
    transitions: transitions.slice(0, 12),
    screenAtEnd: screenNow(),
    player: { hp: Math.round(G.p.hp), dead: !!G.p.dead, downed: !!G.p.downed,
              x: Math.round(G.p.x), z: Math.round(G.p.z) },
    enemiesAlive: live().length,
  });
})()
