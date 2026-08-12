/* DOES THE ENDLESS DUNGEON REALLY SWITCH ITS HAZARDS OFF?

   docs/superpowers/plans/2026-08-11-endless-dungeon.md opens on that claim and builds its whole
   first task out of it: *"`G.haz = null` on every floor (14309) — the signature hazards are the
   single thing that makes zones play differently. Switched off, every floor is the same fight in a
   different palette. This is the big one."* Task 1 Step 1 then says to confirm that the delve *"sets
   `G.haz = null` immediately after `loadArea()`, discarding whatever the borrowed zone set."*

   Read the function and the ORDER is the other way round (`loadDelveFloor`, index.html:14345):

       G.haz = null;      // 14349
       …
       loadArea();        // 14355

   and `loadArea()` reaches `hazSetup()`, whose first statement is
   `G.haz = (G.side||G.trial) ? null : (Z.haz || null)`. So the null is written BEFORE the thing that
   would overwrite it, on a code path that then overwrites it. Which means the plan's headline may
   describe a bug that is not there — or `hazSetup` may not be reached on a delve floor at all, in
   which case it IS there and the line number is simply the wrong evidence for it.

   That question decides whether Task 1 is work or is a no-op, and this repo's rule is that reading
   source is not proof. So: MEASURE it, and measure it across the rotation rather than on one floor,
   because `endlessStageFor` moves the stage every two floors and only some stages carry a hazard.

   ONE LAUNCH, TWELVE FLOORS. `loadDelveFloor(n)` is exported and is what `delveDescend()` calls, so
   walking the rotation costs no browser starts. For each floor it reports the floor's stage and zone,
   the hazard the game ended up with, the hazard that zone DECLARES (`ZONES[G.zone].haz`), and
   whether the hazard's furniture actually got placed — a gloom floor with no lamps is unwinnable,
   which is the failure this measurement exists to see before anyone turns anything on.

   The furniture counts are the half that cannot be inferred from `G.haz`: `hazSetup` places phasers,
   vents, thorns, lights and a rubble clock, and a hazard with none of its furniture is a hazard in
   name only. */
(function(){
  const G0 = window.__BF3 && __BF3.G;
  if(!G0) return JSON.stringify({ ok:false, why:'no __BF3.G' });

  /* The delve escrows the profile on the way in (bankNow) and hands it back on death, so starting
     one here is the game's own supported entry rather than a poke at state. */
  try { __BF3.cheatUnlockClasses(); } catch(e){}
  try { __BF3.startDelve('warrior'); } catch(e){ return JSON.stringify({ ok:false, why:'startDelve threw: ' + e.message }); }

  const G = __BF3.G;
  if(!G.delve) return JSON.stringify({ ok:false, why:'startDelve did not produce a delve', keys:Object.keys(G).length });

  const ZONES = __BF3.ZONES || [];
  const rows = [];
  for(let n = 1; n <= 12; n++){
    try { __BF3.loadDelveFloor(n); } catch(e){ rows.push({ floor:n, threw:String(e && e.message || e) }); continue; }
    const g = __BF3.G, Z = ZONES[g.zone] || {};
    rows.push({
      floor: n, zone: g.zone, zoneName: Z.name || null, stage: g.stageIndex,
      haz: g.haz || null,                       // what the floor ACTUALLY ended up with
      zoneDeclares: Z.haz || null,              // what the borrowed zone says its weather is
      tier: g.zoneTier,
      /* hazSetup's own furniture, per hazard. Empty lists next to a live haz is the unwinnable case. */
      furniture: { phasers:(g.phasers||[]).length, vents:(g.vents||[]).length,
                   thorns:(g.thorns||[]).length, lights:(g.lights||[]).length,
                   rubbleClock: g.rubT || 0 },
      rooms: (g.rooms||[]).length, segments: (g.segments||[]).length,
      hasPortal: !!g.portalPos,
    });
  }

  /* The CAMPAIGN control, from the same launch: the same zones entered the ordinary way. Without it
     a floor reporting `haz:null` cannot be told apart from a zone that simply has no weather. */
  const campaign = [];
  for(const idx of [...new Set(rows.map(r => r.zone))]){
    try {
      __BF3.enterZone(idx);
      campaign.push({ zone: idx, name: (ZONES[idx]||{}).name || null, haz: __BF3.G.haz || null,
                      declares: (ZONES[idx]||{}).haz || null });
    } catch(e){ campaign.push({ zone: idx, threw: String(e && e.message || e) }); }
  }

  return JSON.stringify({ ok:true, floors: rows, campaign: campaign,
                          hazardsSeen: [...new Set(rows.map(r => r.haz).filter(Boolean))] });
})()
