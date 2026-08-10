/* THE LEVEL PROBE. One expression, evaluated in the page by shot.js --eval.

   It lives in its own file rather than as a template literal inside test-levels.js so that the
   suite and a hand-run `node _shot/shot.js --scene 3.1 --eval @harness/probes/level.probe.js`
   are provably the SAME probe. A probe that exists twice is a probe that will be edited once.

   Returns {quests, walk}. Both halves come out of one browser launch, and quests are read FIRST,
   because the walk empties G.enemies and a kill quest read after that reports every level as
   providing no mobs at all. */
(function(){
  const G = __BF3.G, P = G.p, IN = __BF3.input, meta = __BF3.meta;

  /* ---- completability -------------------------------------------------------------------
     Each verb is checked against the thing the GAME uses to satisfy it, read from index.html:
       kill    live mobs of that type, OR a den of that type - dens respawn the kill-quest mob
               every 2s while fewer than 5 are alive (index.html:12330), so one den is an
               infinite supply and counting the mobs standing there now would fail every level
               that uses a spawner.
       fetch   'placed' quests put their items in the world (scapeFetch); the rest drop off any
               non-boss kill at 62% (index.html:10671), so the supply is the mob population.
       find    scapeFind sets G.waystone, tagged with the quest id.
       everything else (reach/hunt/purge/kindle/survive) is a G.qmarks entry per unit of
               progress, and questMarks() can silently make FEWER than asked - the reach loop's
               `i < want && i < plats.length` is exactly how a reach-2 quest ends up with one
               vantage in the level and no way to finish. */
  const quests = [];
  const alive = {}, dens = {};
  for(const e of (G.enemies || [])) if(!e.dead) alive[e.type] = (alive[e.type] || 0) + 1;
  for(const d of (G.dens || [])) dens[d.type] = (dens[d.type] || 0) + 1;
  const mobs = (G.enemies || []).filter(e => !e.dead && !e.boss).length;
  const marksFor = (id) => (G.qmarks || []).filter(m => m.q === id).length;
  for(const q of (__BF3.areaQuests() || [])){
    const need = q.n || 1;
    let have = 0, how = q.k;
    if(q.k === 'kill'){ have = (dens[q.mob] ? need : 0) + (alive[q.mob] || 0); how = 'kill:' + q.mob; }
    else if(q.k === 'fetch'){
      if(q.placed){ have = (G.pickups || []).filter(u => u.questItem && u.questItem.id === q.id).length; how = 'fetch:placed'; }
      else { have = mobs; how = 'fetch:drops'; }
    }
    else if(q.k === 'find'){ have = (G.waystone && G.waystone.q === q.id) ? 1 : 0; how = 'find'; }
    else have = marksFor(q.id);
    quests.push({ id: q.id, k: how, need: need, have: have, d: q.d || '' });
  }

  /* ---- traversal ------------------------------------------------------------------------

     THE STRAIGHT-LINE WALKER IN THE PLAN CANNOT PASS A LEVEL THIS GAME ACTUALLY SHIPS, and it
     took a known-good case to find that out. Steering at the goal and jumping when stuck walks
     The Outskirts - the zone Oliver has playtested for weeks - into the first void and reports it
     unwalkable. Two things are wrong with it, and both are the level design working as intended:

       - MAIN LEVELS BRANCH. At z -1000 the Outskirts' centre is empty and the route is a corridor
         at |x| ~ 500 that rejoins 1000 units later. Any steering that measures liveness as
         "distance to the goal fell" gives up while walking the correct way round.
       - EVERY MAIN LEVEL ENDS ON AN ISLAND YOU MUST JUMP AND DASH TO. `dashGate()` (index.html
         :4665) is called from finishScape for every campaign area: it moves the exit onto a pad
         across a ~195-unit void on purpose. Measured on the real body: a running jump carries 138
         units, a jump plus an air dash carries 216. So a walker that never dashes reports EVERY
         zone in the game as ending in an impassable gap - sixteen confident false failures, and
         the report becomes noise.

     So: plan a route over the level's own walkable surface, then prove it with the real body.
     The plan is GENEROUS on purpose (edges up to 260 units, comfortably past what the body can
     do) because the planner must never be the thing that says "impossible" - only the physics
     may say that. When the body cannot make a step, that cell is struck off and the route is
     planned again; the level is only called impassable once there is no route left, or the body
     has failed to follow fourteen of them. */
  meta.camMode = 'far';                       // the one camera mode whose steering is world-space
  G.enemies.length = 0;                       // traversal only - combat is the skill tester's job
  const goal = G.goalPos || G.portalPos;
  if(!goal) return JSON.stringify({ quests: quests, walk: { ok:false, why:'level has no goal' } });

  const SH = __BF3.surfaceHeightAt;           // exported for measurement tools; the game's own answer
  const STEP = 60, UP = 94, DOWN = 420, REACH = 260, RC = Math.ceil(REACH/STEP);

  /* ---- THE SELF-TEST HOOK -----------------------------------------------------------------
     `?breakgap=<n>` pushes the exit island n units further out, widening the dash gate's void.
     It is here, permanently, because a walker nobody has seen FAIL is a walker nobody should
     believe: this one passed the plan's straight-line version too, by never being asked a
     question it could get wrong. Add 60 and the crossing needs 255 units against a measured
     jump-plus-dash of 216 - the planner still offers the route (it reaches 260 on purpose) and
     the body has to be the thing that says no.
        node _shot/shot.js --scene 0.0 --url "/3d/index.html?hero3d=1&world3d=1&nobloom&breakgap=60" \
             --eval @harness/probes/level.probe.js
     Reproduces as "the body could not follow any route". Nothing reads it in a normal run. */
  const _brk = /[?&]breakgap=(\d+)/.exec(location.search);
  if(_brk){
    const n = +_brk[1];
    const hw = (s) => (s.w||0)/2, hd = (s) => (s.d||0)/2;
    for(const ob of (G.obstacles||[])){
      if(goal.x >= ob.x-hw(ob)-30 && goal.x <= ob.x+hw(ob)+30 &&
         goal.z >= ob.z-hd(ob)-30 && goal.z <= ob.z+hd(ob)+30){ ob.z -= n; }
    }
    goal.z -= n; if(G.portalPos) G.portalPos.z = goal.z; if(G.goalPos) G.goalPos.z = goal.z;
  }

  let x0=1e9, x1=-1e9, z0=1e9, z1=-1e9;
  const grow = (a) => { for(const o of (a||[])){ const w=(o.w||0)/2, d=(o.d||0)/2;
    if(o.x-w<x0)x0=o.x-w; if(o.x+w>x1)x1=o.x+w; if(o.z-d<z0)z0=o.z-d; if(o.z+d>z1)z1=o.z+d; } };
  grow(G.segments); grow(G.obstacles); grow(G.movers); grow(G.crumbles);
  x0=Math.min(x0,P.x,goal.x)-120; x1=Math.max(x1,P.x,goal.x)+120;
  z0=Math.min(z0,P.z,goal.z)-120; z1=Math.max(z1,P.z,goal.z)+120;
  const NX = Math.ceil((x1-x0)/STEP)+1, NZ = Math.ceil((z1-z0)/STEP)+1;
  const H = new Float32Array(NX*NZ);
  let cells = 0;
  for(let i=0;i<NX;i++) for(let j=0;j<NZ;j++){
    const f = SH(x0+i*STEP, z0+j*STEP, 20);
    H[i*NZ+j] = f > -1e8 ? f : NaN;
    if(f > -1e8) cells++;
  }
  const CX = (c) => x0 + (((c/NZ)|0))*STEP, CZ = (c) => z0 + (c%NZ)*STEP;
  const near = (px,pz) => { let bi=-1, bd=1e9;
    const ci=Math.round((px-x0)/STEP), cj=Math.round((pz-z0)/STEP);
    for(let i=Math.max(0,ci-8);i<Math.min(NX,ci+9);i++) for(let j=Math.max(0,cj-8);j<Math.min(NZ,cj+9);j++){
      if(isNaN(H[i*NZ+j])) continue;
      const dd=(x0+i*STEP-px)**2+(z0+j*STEP-pz)**2; if(dd<bd){ bd=dd; bi=i*NZ+j; } }
    return bi; };

  const g = near(goal.x, goal.z);
  if(g < 0) return JSON.stringify({ quests: quests, walk: { ok:false, why:'the goal has no floor under it',
    goal:{x:Math.round(goal.x), z:Math.round(goal.z)}, cells:cells } });

  /* Neighbour offsets. BFS marks a cell the first time it is reached, so the order these are
     walked in IS the route it prefers.
     DELIBERATELY NOT SORTED NEAREST-FIRST, and that is a measurement, not an oversight. Sorting
     them looks obviously right - prefer short hops, cross the exit void straight instead of on a
     260-unit diagonal - and it was built, run, and rejected: on The Outskirts it re-routed the
     whole approach up onto a 153-high prop the body then could not get down from the far side of,
     turning a level that walked end to end into a stuck-on-a-rock failure 552 units short. Scan
     order happens to prefer axis-aligned steps, which is what the levels are built out of. If this
     is ever revisited, the answer is a cost search (distance PLUS a climb penalty), not a sort. */
  const OFF = [];
  for(let di=-RC; di<=RC; di++) for(let dj=-RC; dj<=RC; dj++){
    if(!di && !dj) continue;
    if((di*di + dj*dj)*STEP*STEP > REACH*REACH) continue;
    OFF.push([di, dj]);
  }

  function plan(){
    const s = near(P.x, P.z); if(s < 0) return null;
    const prev = new Int32Array(NX*NZ).fill(-1);
    const q = [s]; prev[s] = s;
    for(let qi=0; qi<q.length; qi++){
      const c = q[qi]; if(c === g) break;
      const i=(c/NZ)|0, j=c%NZ, h=H[c];
      for(let oi=0; oi<OFF.length; oi++){
        const ni=i+OFF[oi][0], nj=j+OFF[oi][1]; if(ni<0||nj<0||ni>=NX||nj>=NZ) continue;
        const n = ni*NZ+nj; if(prev[n] !== -1) continue;
        const nh = H[n]; if(isNaN(nh)) continue;
        if(nh-h > UP || h-nh > DOWN) continue;
        prev[n] = c; q.push(n);
      }
    }
    if(prev[g] === -1) return { none:true, visited:q.length };
    const path = []; for(let c=g; c!==s; c=prev[c]) path.push(c); path.reverse();
    /* Mark which steps are JUMPS. The planner knows - it is the one that took an edge longer than
       a cell - and the body needs telling, because "is there a hole in front of me" cannot be
       asked of the floor alone: the Black Woods puts two 22-wide pillars IN its exit void, so a
       probe 70 units ahead finds their tops, reports solid ground, and walks the hero off the
       cliff between them. Every crossing after that is a fall, a rescue, and a struck-off cell. */
    const jump = path.map((c,k) => {
      const p2 = k ? path[k-1] : s;
      return Math.hypot(CX(c)-CX(p2), CZ(c)-CZ(p2)) > 90;
    });
    return { path: path, jump: jump };
  }

  const dg = () => Math.hypot(goal.x-P.x, goal.z-P.z);
  let ticks = 0, jumps = 0, dashes = 0, replans = 0, struck = 0;
  let pl = plan();
  if(!pl) return JSON.stringify({ quests: quests, walk: { ok:false, why:'the player has no floor under it', cells:cells } });
  if(pl.none) return JSON.stringify({ quests: quests, walk: { ok:false, why:'no route to the goal exists',
    cells:cells, reached:pl.visited, start:{x:Math.round(P.x), z:Math.round(P.z)},
    goal:{x:Math.round(goal.x), z:Math.round(goal.z)} } });

  while(ticks < 16000){
    let dead = false;
    for(let k = 0; k < pl.path.length; k++){
      const c = pl.path[k], wx = CX(c), wz = CZ(c), wy = H[c], isJump = pl.jump[k];
      let since = 0, airT = -1;
      while(ticks < 16000){
        if(dg() < 90) return JSON.stringify({ quests: quests, walk: { ok:true, ticks:ticks,
          jumps:jumps, dashes:dashes, replans:replans } });
        const dx = wx-P.x, dz = wz-P.z, d = Math.hypot(dx,dz);
        if(d < 55){ break; }
        IN.jx = dx/d; IN.jz = dz/d;
        /* Jump for a gap the PLANNER declared, for a step up, or because we have stopped moving.
           "Walkable ahead" is a height test as well as a floor test: a pillar top 150 units up is
           floor, and is not somewhere the next stride lands.
           The dash comes two ticks after the jump. That is the crossing dashGate() builds into
           every campaign level, and without it a running jump falls 57 units short of every exit
           island in the game (measured: jump 138, jump+dash 216, gap ~195). */
        const ahead = SH(P.x + IN.jx*60, P.z + IN.jz*60, 20);
        const gapAhead = !(ahead > -1e8) || (ahead - (P.y||0)) > UP;
        /* A RUN-UP WAS BUILT HERE AND REMOVED, and it is worth saying why so it is not built
           again: backing off 50 ticks to take the gap at top speed sounds right (the gate leaves
           only ~11 units of margin) and it measured WORSE - the body retreats, re-approaches
           still turning, retreats again, and burns the step's whole tick budget without ever
           taking off. The Outskirts went from walking end to end to stalling 3695 units short. */
        if(P.onGround && (gapAhead || (wy-(P.y||0)) > 25 || since > 30)){
          IN.jumpEdge = true; IN.jump = true; jumps++; airT = 0;
        } else IN.jump = (airT >= 0 && airT < 12);
        if(airT >= 0){ airT++; if(airT === 2 && P.dodgeCdT <= 0){ IN.dodgeEdge = true; dashes++; } }
        if(P.onGround && airT > 6) airT = -1;
        P.hp = P.maxHp || P.hp;               // isolate traversal from hazard and fall damage
        __BF3.update(1/60); ticks++; since++;
        /* WHAT GETS STRUCK OFF IS THE TAKEOFF, NOT THE DESTINATION, and that is the difference
           between a walker that finds a way round and one that talks itself out of the level.
           The failure is "I could not make this step FROM HERE" - in the Black Woods that is two
           22-wide pillars standing in the exit void, which the body jumps straight into from the
           left of the ledge and clears from anywhere else along it. Striking the DESTINATION
           deletes the exit island, which is reached by exactly one crossing, so the level is then
           declared routeless on the strength of one bad run-up. Striking the takeoff makes the
           next plan pick a different one, which is what a player does.
           Struck on the FIRST failure, deliberately: a counter keyed on the step was tried and
           measured useless, because each re-plan reaches a slightly different cell of the island,
           so no single step ever failed three times and nothing was ever struck at all (struck:0
           after fifteen identical re-plans). Ledge cells are plentiful; the island is protected by
           the distance test below, and the whole loop is bounded by the re-plan limit.
           k === 0 is the common case rather than an edge case: after a re-plan the body is already
           standing at the ledge, so the crossing is the first step of the new route and there is
           no previous path cell to blame - the takeoff is then wherever the body is standing. */
        if(since > 240){
          const bad = k ? pl.path[k-1] : near(P.x, P.z);
          if(bad >= 0 && Math.hypot(CX(bad)-goal.x, CZ(bad)-goal.z) > 250){ H[bad] = NaN; struck++; }
          dead = true; break;
        }
      }
      if(dead) break;
    }
    if(dg() < 90) return JSON.stringify({ quests: quests, walk: { ok:true, ticks:ticks,
      jumps:jumps, dashes:dashes, replans:replans } });
    if(++replans > 14) return JSON.stringify({ quests: quests, walk: { ok:false, why:'the body could not follow any route',
      ticks:ticks, replans:replans, struck:struck, at:{x:Math.round(P.x), z:Math.round(P.z), y:Math.round(P.y)},
      goal:{x:Math.round(goal.x), z:Math.round(goal.z)}, remaining:Math.round(dg()) } });
    pl = plan();
    if(!pl || pl.none) return JSON.stringify({ quests: quests, walk: { ok:false,
      why:'no route left after ' + struck + ' unreachable steps', ticks:ticks, replans:replans,
      at:{x:Math.round(P.x), z:Math.round(P.z), y:Math.round(P.y)}, remaining:Math.round(dg()) } });
  }
  return JSON.stringify({ quests: quests, walk: { ok:false, why:'ran out of ticks', ticks:ticks,
    replans:replans, at:{x:Math.round(P.x), z:Math.round(P.z), y:Math.round(P.y)},
    remaining:Math.round(dg()) } });
})()
