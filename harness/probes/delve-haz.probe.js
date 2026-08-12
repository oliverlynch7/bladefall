/* IS THE ENDLESS DUNGEON ACTUALLY HAZARD-FREE? — the measurement the delve plan's Task 1 Step 1 asks
   for, written as a file rather than a command line because it walks six floors and AUTOPILOT.md's
   `--eval @path` exists for exactly this.

   The plan states the mechanism as "the delve sets G.haz = null immediately AFTER loadArea()". Read
   at index.html:14367 the assignment is BEFORE the loadArea() on 14373, and hazSetup (8949) opens
   with `G.haz = (G.side||G.trial) ? null : (Z.haz||null)` — it ASSIGNS the field rather than reading
   it. So the order decides the answer and the two readings differ. This probe settles it in numbers.

   Reports per floor: the stage and zone the delve borrowed, that zone's declared hazard, the live
   G.haz after the floor is built, and the furniture each hazard needs — because "the hazard is on"
   and "the hazard is survivable" are different claims and gloom without lights is unwinnable.

   Run:  node _shot/shot.js --scene hub --eval @harness/probes/delve-haz.probe.js  */
(function(){
  const B = window.__BF3, out = [];
  B.startDelve('warrior');
  /* Every floor of the stage rotation, not a sample. The rotation advances every two floors through
     seventeen stages, so a sample of six can miss a whole hazard — and GLOOM is the one that must
     not be missed: a dark floor whose rooms got no lights is unwinnable rather than hard, which is
     this plan's own recorded risk. */
  for(let n = 1; n <= 34; n++){
    B.loadDelveFloor(n);
    const G = B.G, Z = (B.ZONES || [])[G.zone] || {};
    /* One row per floor, terse on purpose: 34 verbose rows do not fit in a shot.js EVAL line. */
    out.push([n, G.stageIndex, Z.name || '?', Z.haz || '-', G.haz || '-',
              (G.rooms || []).length,
              (G.lights || []).length + (G.vents || []).length + (G.thorns || []).length +
              (G.phasers || []).length + (G.glareO ? 1 : 0) + (G.rubT ? 1 : 0)].join('|'));
  }
  return JSON.stringify(out);
})()
