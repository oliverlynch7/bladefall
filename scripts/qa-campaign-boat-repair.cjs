async page => {
  const errors = [], results = [];
  page.on('pageerror', e => errors.push(e.message));
  async function load() {
    await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2151');
    await page.waitForFunction(() => window.__BF3 && HERO3D?.ready);
    await page.evaluate(async () => {
      const b = __BF3;
      await b.briarReady;
      b.loadMode('rl'); b.meta.run = null; b.meta.bank = null;
      b.meta.introSeen = true; b.meta.classId = 'warrior';
      b.meta.riftShards = []; b.meta.autoAttack = false;
      b.openHub(); b.enterZone(5);
      b.meta.tutOff = true; b.G.p.invuln = 999;
      for (const e of b.G.enemies) e.stunT = 999;
    });
    await page.waitForFunction(() => !BF_LOADING.active && !!__BF3.G.shore);
  }
  await load();
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (name, value) => { if (!value) throw Error(name); checks.push(name); };
    const act = key => { const o = G.storyObjects.find(x => x.key === key); if (!o) throw Error(key); Object.assign(p, {x:o.x,y:o.y,z:o.z,vy:0}); b.briarRequest('world', {key}); };
    const nav = () => BFPartyNavigation.target(G)?.key;
    ok('initial arrow leads to Otto', nav() === undefined || BFPartyNavigation.target(G)?.id === 'otto');
    ok('workbench hidden without carried parts', !b.briarObjects().some(o => o.key === 'sc.fit'));
    act('sc.board'); ok('cannot board unfinished boat', !G.storyState.flags['sc.depart']);
    Object.assign(p, {x:170,y:30,z:-300});
    b.briarRequest('open', {npc:'otto'});
    for (const choice of ['palace','work']) b.briarRequest('choose', {line:G.storyState.conversation.node,choice});
    b.briarRequest('close');
    ok('Otto starts boat quest', !!G.storyState.flags['sc.met']);
    act('sc.rudder');
    ok('carried rudder points to workbench', nav() === 'sc.fit' && b.briarObjects().some(o => o.key === 'sc.fit'));
    act('sc.fit');
    ok('rudder appears on boat', !!G.storyState.flags['sc.installed.rudder'] && !!G.shore.parts[0] && G.storyState.items['sc.rudder'] === 0);
    ok('workbench hides when hands empty', !b.briarObjects().some(o => o.key === 'sc.fit'));
    act('sc.rope'); ok('dry rope blocked before draining', !G.storyState.items['sc.rope']);
    act('sc.drain'); act('sc.latch'); act('sc.rope'); act('sc.fit');
    ok('cave rope installs independently', !!G.shore.parts[2] && !G.storyState.flags['sc.boat.ready']);
    for (const e of G.enemies) { e.dead = true; e.hp = 0; }
    act('sc.sail'); act('sc.fit');
    ok('last part makes boat ready without dialogue', !!G.storyState.flags['sc.boat.ready'] && G.storyState.quests['sc.boat'] === 'complete' && G.shore.parts.every(Boolean));
    ok('objective arrow leads to boat', nav() === 'sc.board');
    ok('workbench hidden after completion', !b.briarObjects().some(o => o.key === 'sc.fit'));
    act('sc.board'); ok('boarding starts the voyage', !!G.storyState.flags['sc.depart'] && !!G.voyage);
    return {path:'workbench · rudder, rope, sail',checks};
  }));
  await load();
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (name, value) => { if (!value) throw Error(name); checks.push(name); };
    const act = key => { const o = G.storyObjects.find(x => x.key === key); Object.assign(p,{x:o.x,y:o.y,z:o.z}); b.briarRequest('world',{key}); };
    Object.assign(p,{x:170,y:30,z:-300}); b.briarRequest('open',{npc:'otto'});
    for (const choice of ['palace','work']) b.briarRequest('choose',{line:G.storyState.conversation.node,choice});
    b.briarRequest('close');
    for (const e of G.enemies) { e.dead = true; e.hp = 0; }
    for (const key of ['sc.rudder','sc.sail','sc.drain','sc.latch','sc.rope']) act(key);
    Object.assign(p,{x:170,y:30,z:-300}); b.briarRequest('open',{npc:'otto'});
    for (const choice of ['deliver.sail','more','deliver.rudder','more','deliver.rope']) b.briarRequest('choose',{line:G.storyState.conversation.node,choice});
    b.briarRequest('close');
    ok('Otto still fits the parts', G.shore.parts.every(Boolean));
    ok('Otto route auto-completes after last part', !!G.storyState.flags['sc.boat.ready'] && G.storyState.quests['sc.boat'] === 'complete');
    return {path:'Otto dialogue · sail, rudder, rope',checks};
  }));
  await load();
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (name, value) => { if (!value) throw Error(name); checks.push(name); };
    Object.assign(G.storyState.flags, {'sc.met':true,'sc.installed.rudder':true,'sc.installed.sail':true});
    G.storyState.items['sc.rope'] = 1;
    b.briarSync();
    const bench = G.storyObjects.find(o => o.key === 'sc.fit'); Object.assign(p,{x:bench.x,y:bench.y,z:bench.z});
    ok('prior flags expose remaining workbench action', b.briarObjects().some(o => o.key === 'sc.fit'));
    b.briarRequest('world',{key:'sc.fit'});
    ok('previous two-part state finishes safely', !!G.storyState.flags['sc.boat.ready'] && G.storyState.items['sc.rope'] === 0 && G.shore.parts.every(Boolean));
    return {path:'older partial flags',checks};
  }));
  if (errors.length) throw Error(JSON.stringify(errors));
  return {results,pageErrors:errors};
}
