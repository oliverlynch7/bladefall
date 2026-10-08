async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = [];
  async function load(zone, area = 1) {
    await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2150');
    await page.waitForFunction(() => window.__BF3 && HERO3D?.ready);
    await page.evaluate(async ({zi, next}) => {
      const b = __BF3;
      await b.briarReady;
      b.loadMode('rl');
      b.meta.run = null;
      b.meta.bank = null;
      b.meta.introSeen = true;
      b.meta.classId = 'warrior';
      b.meta.riftShards = [];
      b.meta.autoAttack = false;
      b.meta.petActive = null;
      b.openHub();
      b.enterZone(zi);
      if (next) b.nextArea();
      b.meta.tutOff = true;
      b.meta.camMode = 'far';
      b.G.p.invuln = 999;
      for (const enemy of b.G.enemies) enemy.stunT = 999;
    }, {zi: zone, next: area});
    await page.waitForFunction(() => !BF_LOADING.active && !!__BF3.G.storyState);
  }
  await load(2);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const act = key => {
      const object = G.storyObjects.find(o => o.key === key);
      if (!object) throw Error('Missing ' + key);
      Object.assign(p, {x: object.x, y: object.y, z: object.z, vy: 0});
      b.briarRequest('world', {key});
    };
    const tick = count => { for (let i = 0; i < count; i++) b.update(.016); };
    ok('old service stair removed', !('service' in BFPrison.paths) && !('service' in G.prison.walks));
    act('kd.roster'); act('kd.marks'); act('kd.hidden');
    for (const enemy of G.enemies) { enemy.hp = 0; enemy.dead = true; }
    act('kd.free'); act('kd.papers');
    act('kd.lift.0'); act('kd.lift.2');
    ok('lift restored', !!G.storyState.flags['kd.lift.open']);
    tick(1550);
    ok('prisoners reach upper shelter', !!G.storyState.flags['kd.transfer'] && !!G.portal);
    ok('lift initially at upper station', G.movers.find(m => m.prisonLift).h > 355);
    const lift = G.movers.find(m => m.prisonLift);
    for (let i = 0; i < 900 && lift.h > 180.01; i++) tick(1);
    ok('lift returns to lower station', lift.h < 180.01);
    Object.assign(p, {x: 0, z: -2500, y: 180, vy: 0, onGround: true});
    for (let i = 0; i < 900 && lift.h < 320; i++) tick(1);
    if (!(p.y > 300 && Math.abs(p.y - lift.h) < 5)) throw Error('late player rides second ascent ' + JSON.stringify({player: [p.x,p.z,p.y], lift: lift.h, onGround:p.onGround, time:G.prison.rescueT}));
    checks.push('late player rides second ascent');
    return {level: 'Ruined Keep · The Dungeons', checks};
  }));
  await load(5);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const act = key => {
      const object = G.storyObjects.find(o => o.key === 'tc.' + key);
      if (!object) throw Error('Missing tc.' + key);
      Object.assign(p, {x: object.x, y: object.y, z: object.z, vy: 0});
      b.briarRequest('world', {key: object.key});
    };
    act('approach');
    ok('shackle still guards the barrier', !G.portal);
    ok('main arrow skips optional lift', BFPartyNavigation.target(G)?.key === 'tc.shackle');
    act('shackle'); act('approach');
    ok('main ascent works without lift', !!G.portal && !G.storyState.flags['tc.lift']);
    act('brake'); act('lift');
    ok('optional cargo lift remains repairable', !!G.thunder.lift);
    return {level: 'Thunder Cliffs', checks};
  }));
  await load(3);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const act = key => {
      const object = G.storyObjects.find(o => o.key === key);
      if (!object) throw Error('Missing ' + key);
      Object.assign(p, {x: object.x, y: object.y, z: object.z, vy: 0});
      b.briarRequest('world', {key});
    };
    const talk = (npc, choices) => {
      const character = G.storyNpcs.find(o => o.id === npc);
      Object.assign(p, {x: character.x, y: character.y, z: character.z});
      b.briarRequest('open', {npc});
      for (const choice of choices) b.briarRequest('choose', {line: G.storyState.conversation.node, choice});
      b.briarRequest('close');
    };
    act('ic.pages');
    for (const enemy of G.enemies) { enemy.hp = 0; enemy.dead = true; }
    act('ic.free'); talk('ellis', ['press', 'firm']); act('ic.notes');
    ok('pack provides lead on pickup', !!G.storyState.flags['ic.ellis.lead'] && !!G.storyState.notes['ic.emberdeep']);
    ok('main arrow continues to waterworks', BFPartyNavigation.target(G)?.key === 'ic.lock.clue');
    ok('return conversation remains optional', !G.storyState.flags['ic.ellis.returned']);
    act('ic.lock.clue');
    act('ic.lock.3');
    ok('wrong water control does not open exit', !G.storyState.flags['ic.lock.open']);
    for (const n of [1, 1, 2, 3]) act('ic.lock.' + n);
    ok('crossing works without returning to Ellis', !!G.portal && !G.storyState.flags['ic.ellis.returned']);
    talk('ellis', ['return', 'judge', 'useful']);
    ok('optional Ellis exchange still works', !!G.storyState.flags['ic.ellis.returned']);
    return {level: 'Deep Ice Caves', checks};
  }));
  await load(3, 0);
  results.push(await page.evaluate(async () => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const act = key => {
      const object = G.storyObjects.find(o => o.key === key);
      if (!object) throw Error('Missing ' + key);
      Object.assign(p, {x: object.x, y: object.y, z: object.z, vy: 0});
      b.briarRequest('world', {key});
    };
    act('ff.trail'); act('ff.heater');
    ok('empty winch needs coil', !G.storyState.flags['ff.heater']);
    ok('main arrow leads to loose coil', BFPartyNavigation.target(G)?.key === 'ff.part');
    const coil = G.storyObjects.find(o => o.key === 'ff.part');
    Object.assign(p, {x: 0, z: -1960, y: 380, vy: 0, onGround: true});
    for (let i = 0; i < 450; i++) {
      const dx = coil.x - p.x, dz = coil.z - p.z, distance = Math.hypot(dx, dz);
      if (distance < 20) break;
      b.input.jx = dx / distance; b.input.jz = dz / distance;
      b.update(.016);
    }
    b.input.jx = b.input.jz = 0;
    ok('coil reachable from Heath before crossing', coil.z > -2210 && Math.hypot(coil.x - p.x, coil.z - p.z) < 25 && !G.storyState.flags['ff.heater']);
    act('ff.part');
    ok('coil recovered on forward route', !!G.storyState.flags['ff.part'] && G.storyObjects.find(o => o.key === 'ff.part').z < -2000);
    ok('main arrow leads to crossing winch', BFPartyNavigation.target(G)?.key === 'ff.heater');
    act('ff.heater');
    if (!(!!G.storyState.flags['ff.heater'] && G.peaks.crossing && !G.storyState.flags['ff.heath'])) throw Error('player installs coil without NPC return ' + JSON.stringify({flags:G.storyState.flags,crossing:G.peaks.crossing,quest:BFSnowbound.quest(G.storyState),object:G.storyObjects.find(o=>o.key==='ff.heater'),event:(await b.briarReady)?.events?.['ff.heater'],conversation:G.storyState.conversation}));
    checks.push('player installs coil without NPC return');
    act('ff.reflect.clue'); act('ff.reflect.1');
    ok('wrong signal still fails safely', !G.storyState.flags['ff.reflect.open']);
    act('ff.reflect.3'); act('ff.cave');
    ok('cave route opens after crossing', !!G.portal);
    act('ff.lift');
    ok('western return shortcut remains', !!G.peaks.lift && G.peaks.walks.liftHouse.length > 0);
    return {level: 'Snowbound Peaks · direct repair', checks};
  }));
  await load(3, 0);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const part = G.storyObjects.find(o => o.key === 'ff.part');
    Object.assign(p, {x: part.x, y: part.y, z: part.z});
    b.briarRequest('world', {key: 'ff.part'});
    const heath = G.storyNpcs.find(n => n.id === 'heath');
    Object.assign(p, {x: heath.x, y: heath.y, z: heath.z});
    b.briarRequest('open', {npc: 'heath'});
    for (const choice of ['help', 'return']) b.briarRequest('choose', {line: G.storyState.conversation.node, choice});
    b.briarRequest('close');
    ok('old part flag still supports Heath repair', !!G.storyState.flags['ff.heater'] && !!G.peaks.crossing);
    return {level: 'Snowbound Peaks · prior flag route', checks};
  }));
  await load(4, 0);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const act = key => {
      const object = G.storyObjects.find(o => o.key === key);
      if (!object) throw Error('Missing ' + key);
      Object.assign(p, {x: object.x, y: object.y, z: object.z, vy: 0});
      b.briarRequest('world', {key});
    };
    const flint = G.storyNpcs.find(n => n.id === 'flint');
    Object.assign(p, {x: flint.x, y: flint.y, z: flint.z});
    b.briarRequest('open', {npc: 'flint'});
    for (const choice of ['smash', 'agree', 'ready']) b.briarRequest('choose', {line: G.storyState.conversation.node, choice});
    b.briarRequest('close');
    for (const enemy of G.enemies) { enemy.hp = 0; enemy.dead = true; }
    act('ih.workers');
    ok('workers still rescued first', !!G.storyState.flags['ih.workers.safe']);
    ok('main arrow skips optional Jack introduction', BFPartyNavigation.target(G)?.key === 'ih.handles');
    act('ih.cart');
    ok('cart cannot bridge without handles', !G.iron.cart);
    act('ih.handles');
    ok('main arrow leads to cart installation', BFPartyNavigation.target(G)?.key === 'ih.cart');
    const cartPost=G.storyObjects.find(o=>o.key==='ih.cart');
    ok('cart brake post is beside parked cart', Math.hypot(cartPost.x,cartPost.z+3590)<220);
    act('ih.cart');
    ok('player repairs cart without Jack dialogue', !!G.storyState.flags['ih.cart'] && G.iron.cart && !G.storyState.flags['ih.jack.met']);
    ok('cart deck has collision', b.highestSurfaceAt(0, -4750, 0) >= 95);
    for(let i=0;i<100;i++)b.update(.016);
    ok('cart rolls into crossing position', G.iron.cartVisual===1);
    ok('shutdown remains required', !G.portal);
    act('ih.plate'); act('ih.line.1');
    G.iron.clock = 3.5;
    act('ih.line.2'); act('ih.brace'); act('ih.line.3');
    ok('weapon line shutdown opens exit', !!G.portal);
    return {level: 'Iron Halls · direct repair', checks};
  }));
  await load(4, 0);
  results.push(await page.evaluate(() => {
    const b = __BF3, G = b.G, p = G.p, checks = [];
    const ok = (label, value) => { if (!value) throw Error(label); checks.push(label); };
    const handles = G.storyObjects.find(o => o.key === 'ih.handles');
    Object.assign(p, {x: handles.x, y: handles.y, z: handles.z});
    b.briarRequest('world', {key: 'ih.handles'});
    const jack = G.storyNpcs.find(n => n.id === 'jack');
    Object.assign(p, {x: jack.x, y: jack.y, z: jack.z});
    b.briarRequest('open', {npc: 'jack'});
    for (const choice of ['help', 'return']) b.briarRequest('choose', {line: G.storyState.conversation.node, choice});
    b.briarRequest('close');
    ok('old handles flag still supports Jack repair', !!G.storyState.flags['ih.cart'] && G.iron.cart);
    return {level: 'Iron Halls · prior flag route', checks};
  }));
  if (errors.length) throw Error(JSON.stringify(errors));
  return {results, pageErrors: errors};
}
