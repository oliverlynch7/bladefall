/* HOW LONG IS AN ENDLESS DUNGEON FLOOR? — the measurement docs/superpowers/plans/2026-08-11-
   endless-dungeon.md Task 2 Step 1 asks for, and its Step 2 is explicitly conditional on the
   answer ("if a floor already takes two minutes, skip the task and record why").

   WHY THIS IS NOT THE LEVEL WALKER. `harness/probes/level.probe.js` drives the real body and
   returns ticks-to-exit, which is the number the plan names, and it CANNOT be pointed at a delve
   floor as it stands: it plans over surfaceHeightAt(), which does not report a maze wall at all
   (index.html:8104 only considers a wall with `stand`, and the grid-graph maze's h:96 walls have
   no such flag), while the body collides with every one of them (8749 concats G.walls into the
   solid list). So the planner routes straight through the walls, the body is stopped by the first
   one, the takeoff cell is struck off, and after fourteen re-plans the floor is reported as one
   the body could not follow. That is a limit of the navigator and not a fact about the level —
   the same distinction test-levels.js makes when it routes a failed walk to `unproven`.
   Reproduced 2026-08-13: stock probe on delve:1 stalls at (294,156), 15 re-plans, 1186 short.

   AND THE OBVIOUS FIX HAS BEEN TRIED AND DOES NOT HOLD ITS CONTROL — recorded here so the next
   run does not spend a session rediscovering it. Teaching the planner about walls (strike non-
   `stand` walls out of the height field, forbid an edge whose line crosses one, treat non-`plat`
   obstacles as solid since index.html:13471 calls resolveObstacles with no climbMax) does get a
   body through a maze, but only together with a nearest-cost search; and that search FAILS THE
   CAMPAIGN CONTROL, stopping on The Outskirts 544 units short, stuck at y=240 on top of a prop.
   That is the identical failure level.probe.js's own OFF comment already records from when the
   same idea was tried there ("552 units short"). Keep the stock scan-order BFS and the delve floor
   fails instead (899 short). So there is currently NO single configuration that both walks a delve
   floor and still walks the level the walker was proven on, and a delve tick-count taken from the
   cost search while the control is taken from BFS is a comparison across two instruments — which
   is exactly the thing the note at the bottom of this file exists to forbid.

   So this measures DISTANCE rather than time, over the same walkable surface the walker plans on,
   with the walls subtracted. Two things follow, and both are stated rather than glossed:

     - it is a LOWER BOUND on the route. It knows nothing about combat, locked doors, dead ends
       taken and backed out of, or the difference between a corridor and a parkour bridge you have
       to jump. A real floor is longer than this, never shorter. Only WALLS are treated as solid;
       an obstacle is left as the raised floor surfaceHeightAt() reports it, held down by the same
       94-unit step-up limit the level walker uses, so a route may cross a low platform a player
       would walk around. That errs short too.
     - it converts to seconds with a speed MEASURED IN THE SAME LAUNCH rather than a constant read
       off the source. That was originally justified by the delve handing out a fresh level-1 body
       with a starter weapon, on the assumption such a body is slower. Measured, it is not: the
       delve body sustains 3.12 units/tick against the campaign hero's 3.13. The measurement is
       kept anyway — a measured constant that agrees with the campaign is worth more than an
       assumed one that does not, and it is what caught the error. See the speed block below.

   Reported per floor so the plan's question can be answered at the depth a player reaches rather
   than only at floor 1: the maze grid GROWS with depth on purpose (index.html:7346-7352, GX 6->9,
   GZ 5->8, and TSCALE 1.2 on top), so a floor-1 answer says nothing about floor 20.

   Run:  node _shot/shot.js --scene delve:1 --eval @harness/probes/delve-size.probe.js  */
(function(){
  const B = window.__BF3, G0 = B.G, P = G0.p;

  /* ---- the body's own top speed, measured, not read ---------------------------------------
     Driven with the input the game itself reads, through the game's own update(). */
  const IN = B.input;
  /* `far` is the one camera mode whose steering is world-space — level.probe.js sets it for the
     same reason. */
  B.meta.camMode = 'far';

  /* THE BAR IS THE BEST SUSTAINED RATE, AND THE TWO METRICS THIS REPLACES WERE BOTH WRONG.
     Watched failing, 2026-08-13, before this was rewritten:

       - AN AVERAGE OVER THE WINDOW reads 0. The delve's entry nook is walled, so a body driven in
         one direction for two seconds is pinned long before the window closes. That is why this
         probe originally moved to a maximum.
       - THE FASTEST SINGLE TICK IS NOT LOCOMOTION EITHER, which is what the maximum missed. A
         collision ejection moves the body a long way in one tick and cannot be told from running
         by a one-tick metric. Two measurements make that concrete: driven -x on delve:1 the body
         records a fastest tick of 1.11 while its NET displacement over the whole 90 ticks is 2
         UNITS — it never travelled, it was pushed out of a box and pushed back — and on The
         Outskirts, driving +z returns a fastest tick of 40.12 against a real running speed of
         3.13. A "top speed" of forty units a tick is a fall, not a stride.
       - AND ±z ALONE DECIDES THE ANSWER IN THE DELVE. The entry nook is walled on both z faces:
         +z and -z each move the body 0 units, while +x moves it 187. The direction was doing the
         measuring.

     So: drive all FOUR directions, and score each on the largest displacement across any 30-tick
     window. An ejection spike cannot carry thirty ticks; running can. The delve floor is reloaded
     between directions rather than the body teleported — writing P.x/P.z can wedge it inside a
     wall box and pin every later run at zero, which is how an earlier version of this diagnostic
     lied to itself.

     THE NUMBER THIS CHANGES, AND IT IS THE ONE THE PLAN QUOTED: the delve read 1.62 against the
     campaign's 3.13, and Task 2's closure drew a conclusion from it ("the delve hands out a fresh
     level-1 body, so it walks at half the campaign hero's pace"). Measured this way the delve
     body sustains 3.12 and the campaign hero 3.13. They are the SAME BODY SPEED, the halving was
     the walled nook, and every delve `sec` below was inflated ~1.9x by it. The campaign control is
     unmoved (all four directions agree there at 3.13), which is what makes this a fix to the ruler
     rather than a new ruler.

     IN THE DELVE THIS IS A LOWER BOUND ON SPEED, HENCE AN UPPER BOUND ON `sec`, and the bound is
     the maze rather than the body: a 30-tick window only fills if the seed gave the nook a long
     enough clear run to hold top speed for half a second. Three launches read 3.13, 2.83 and (with
     the mobs left in) 2.79 — the ceiling is the campaign's own 3.13 and the shortfalls are
     corridors, not legs. The campaign control never moves off 3.13 because it is measured in the
     open. Erring toward "slower, therefore longer" is the safe direction for the question this
     probe exists to answer, so it is left alone rather than tuned to the answer. */
  const isDelve0 = !!G0.delve, floor0 = G0.floor;
  const DIRS = [[1,0], [-1,0], [0,1], [0,-1]];
  let speed = 0;
  for(const [ax, az] of DIRS){
    if(isDelve0) B.loadDelveFloor(floor0);            // fresh floor, never a teleport
    const Gs = B.G, P2 = Gs.p;
    /* THE MOBS COME OUT FOR THE SPEED RUN, because the route this converts is traversal-only and a
       speed measured while something is body-blocking you is not the same quantity. Measured on
       delve:1: with the floor's own 16-44 enemies alive the best sustained rate read 2.79; with
       them out, 3.13 and 2.83 on two seeds, and a standalone diagnostic that also empties them
       read 3.12. How much a live mob costs you depends on where that launch happened to spawn it,
       which is a property of the seed and not of the floor's size. The campaign branch puts them
       back immediately, because the row it reports counts them. */
    const held = (Gs.enemies || []).splice(0);
    const xs = [P2.x], zs = [P2.z];
    for(let t = 0; t < 90; t++){
      IN.jx = ax; IN.jz = az;
      B.update(1/60);
      xs.push(P2.x); zs.push(P2.z);
    }
    IN.jx = 0; IN.jz = 0;
    for(let k = 0; k + 30 < xs.length; k++){
      const r = Math.hypot(xs[k+30]-xs[k], zs[k+30]-zs[k]) / 30;
      if(r > speed) speed = r;
    }
    /* The delve rebuilds its population on the next loadDelveFloor, so only the campaign row needs
       its level handed back — and it is handed back EXACTLY, not appended to. The dens keep
       spawning into the emptied array while the body drives (index.html:12330 tops a den's mob up
       every 2s), so a plain push-back returns the originals PLUS everything that arrived while
       they were gone: the control's mob count read 41 before this block existed and 50 after, a
       fake +9 on the one row that exists to be compared against. */
    if(!isDelve0){ Gs.enemies.length = 0; Array.prototype.push.apply(Gs.enemies, held); }
  }                                                   // world units per tick, sustained

  /* ---- the walkable surface, with the walls taken out --------------------------------------
     STEP 60 is the level walker's own grid pitch, so the two agree about what a step is. A maze
     doorway is GW=104 wide (index.html:7289) and a maze wall is 14 thick, so a 60-unit lattice
     resolves the gaps without the walls closing over them. */
  const STEP = 60, UP = 94, DOWN = 420;
  function measure(){
    const G = B.G, SH = B.surfaceHeightAt;
    const start = G.startPos || { x: P.x, z: P.z };
    const goal  = G.goalPos || G.portalPos;
    if(!goal) return { why: 'no goal' };

    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    const grow = (a) => { for(const o of (a || [])){ const w = (o.w||0)/2, d = (o.d||0)/2;
      if(o.x-w < x0) x0 = o.x-w; if(o.x+w > x1) x1 = o.x+w;
      if(o.z-d < z0) z0 = o.z-d; if(o.z+d > z1) z1 = o.z+d; } };
    grow(G.segments); grow(G.movers); grow(G.crumbles);
    x0 -= 120; x1 += 120; z0 -= 120; z1 += 120;
    const NX = Math.ceil((x1-x0)/STEP)+1, NZ = Math.ceil((z1-z0)/STEP)+1;

    /* A wall the body cannot walk through is not floor, whatever the height field says. `stand`
       walls are the exception the game itself makes — those are walkable tops (index.html:5166,
       the Keep's crenellations) — and they are left in. */
    const blockers = (G.walls || []).filter(w => !w.stand);
    const blocked = (x, z) => {
      for(let i = 0; i < blockers.length; i++){ const w = blockers[i];
        if(Math.abs(x-w.x) < w.w/2 + 14 && Math.abs(z-w.z) < w.d/2 + 14) return true; }
      return false;
    };

    const H = new Float32Array(NX*NZ);
    let cells = 0;
    for(let i = 0; i < NX; i++) for(let j = 0; j < NZ; j++){
      const wx = x0+i*STEP, wz = z0+j*STEP;
      const f = SH(wx, wz, 20);
      const ok = f > -1e8 && !blocked(wx, wz);
      H[i*NZ+j] = ok ? f : NaN;
      if(ok) cells++;
    }
    const near = (px, pz) => { let bi = -1, bd = 1e9;
      const ci = Math.round((px-x0)/STEP), cj = Math.round((pz-z0)/STEP);
      for(let i = Math.max(0,ci-8); i < Math.min(NX,ci+9); i++)
        for(let j = Math.max(0,cj-8); j < Math.min(NZ,cj+9); j++){
          if(isNaN(H[i*NZ+j])) continue;
          const dd = (x0+i*STEP-px)**2 + (z0+j*STEP-pz)**2; if(dd < bd){ bd = dd; bi = i*NZ+j; } }
      return bi; };

    const s = near(start.x, start.z), g = near(goal.x, goal.z);
    if(s < 0 || g < 0) return { why: s < 0 ? 'start has no floor' : 'goal has no floor', cells };

    /* EDGES UP TO 260 UNITS, THE LEVEL WALKER'S OWN REACH, and the first version of this probe
       had only the eight neighbours — which reported NO ROUTE AT ALL on floors 10, 15 and 20.
       That was the probe and not the level: about 60% of this maze's corridors are built as
       parkour bridges (index.html:7426, `bridgeSpan`), stepping stones with real GAPS between
       them, so a measure that can only step one cell at a time cannot leave the entry room of a
       floor whose corridors all rolled parkour. The body jumps them; so must this.
       A long edge is NOT free: the cost is its true length, because jumping a 200-unit gap does
       carry you 200 units. And a long edge may not pass THROUGH a wall — without the sample test
       below, a 260-unit reach hops the maze's 14-thick walls and measures a route no player can
       take, which is the same "geometric answer to a kinematic question" that shipped Castle
       Duskmoor unclimbable. */
    const REACH = 260, RC = Math.ceil(REACH/STEP);
    const OFF = [];
    for(let di = -RC; di <= RC; di++) for(let dj = -RC; dj <= RC; dj++){
      if(!di && !dj) continue;
      const L = Math.hypot(di, dj)*STEP; if(L > REACH) continue;
      OFF.push([di, dj, L]);
    }
    const clearLine = (ax, az, bx, bz) => {
      const L = Math.hypot(bx-ax, bz-az), n = Math.ceil(L/12);
      for(let k = 1; k < n; k++){
        const t = k/n;
        if(blocked(ax + (bx-ax)*t, az + (bz-az)*t)) return false;
      }
      return true;
    };
    /* Dijkstra rather than BFS: the edges are weighted now, and a plain queue would return the
       route with the FEWEST hops, which on a 260-unit reach is a straight line of long jumps. */
    const dist = new Float32Array(NX*NZ).fill(Infinity);
    const done = new Uint8Array(NX*NZ);
    dist[s] = 0;
    for(;;){
      let c = -1, bd = Infinity;
      for(let k = 0; k < NX*NZ; k++) if(!done[k] && dist[k] < bd){ bd = dist[k]; c = k; }
      if(c < 0 || c === g) break;
      done[c] = 1;
      const i = (c/NZ)|0, j = c%NZ, h = H[c], cxw = x0+i*STEP, czw = z0+j*STEP;
      for(let k = 0; k < OFF.length; k++){
        const ni = i+OFF[k][0], nj = j+OFF[k][1];
        if(ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue;
        const n = ni*NZ+nj; if(done[n]) continue;
        const nh = H[n]; if(isNaN(nh)) continue;
        if(nh-h > UP || h-nh > DOWN) continue;
        const nd = dist[c] + OFF[k][2];
        if(nd >= dist[n]) continue;
        if(!clearLine(cxw, czw, x0+ni*STEP, z0+nj*STEP)) continue;
        dist[n] = nd;
      }
    }
    const rooms = (G.rooms || []).length;
    const doors = (G.doors || []).length;
    return {
      route: isFinite(dist[g]) ? Math.round(dist[g]) : -1,  // -1 = no route this measure can see
      line:  Math.round(Math.hypot(goal.x-start.x, goal.z-start.z)),
      spanX: Math.round(x1-x0), spanZ: Math.round(z1-z0),
      rooms, doors,
      shut:  (G.doors || []).filter(d => !d.open).length,
      mobs:  (G.enemies || []).filter(e => !e.dead).length,
      cells
    };
  }

  const stamp = (m, floor) => {
    m.floor = floor; m.stage = B.G.stageIndex;
    m.sec = (speed > 0 && m.route > 0) ? Math.round(m.route / (speed*60)) : null;
    return m;
  };

  /* IT IS ITS OWN CONTROL. Pointed at anything that is not a delve floor it measures THAT level
     once and returns a single row, so the campaign area this plan compares the delve against is
     measured by the same ruler in the same units rather than by a second probe that would have to
     be trusted to agree:
       node _shot/shot.js --scene 0 --eval @harness/probes/delve-size.probe.js
     Task 2's whole argument is a comparison, and a comparison across two instruments is not one. */
  if(!G0.delve) return JSON.stringify({ speed: Math.round(speed*100)/100,
    floors: [stamp(measure(), B.G.areaName || 'campaign')] });

  const out = [];
  for(const n of [1, 3, 5, 10, 15, 20]){
    B.loadDelveFloor(n);
    out.push(stamp(measure(), n));
  }
  return JSON.stringify({ speed: Math.round(speed*100)/100, floors: out });
})()
