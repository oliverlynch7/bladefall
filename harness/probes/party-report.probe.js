/* Pump a party for a few real frames and then say what the 3D layer thinks of it.

   Companion to party.probe.js, which starts the same pump and returns immediately - that is right
   for a screenshot and useless for a diagnosis, because drawHero3D catches its own exceptions,
   sets HERO3D.on = false and degrades to the voxel hero. The failure is therefore SILENT in the
   log and shows up only as a blocky character in a picture. This waits for real frames to go by
   and reports HERO3D.err, so a fallback is read rather than inferred. */
(function(){
  const B = __BF3, G = B.G;
  const ally = (o) => Object.assign({}, G.p, o, {
    weapon: Object.assign({}, G.p.weapon || {}, { art: o.art, rarity: 'common' }),
  });
  const mk = () => [
    ally({ peerId:'shot-mage', cid:'mage', art:'staff',
           x:G.p.x - 130, z:G.p.z - 50, vx:0, vz:0, onGround:true, atkTimer:0.6, swingId:1 }),
    ally({ peerId:'shot-ranger', cid:'ranger', art:'bow',
           x:G.p.x + 130, z:G.p.z - 50, vx:200, vz:0, onGround:true, atkTimer:0 }),
  ];
  const H = window.HERO3D;
  const seen = [];
  let n = 0;
  return new Promise(function(resolve){
    (function pump(){
      n++;
      try { for(const a of mk()) B.drawHero3(a, n / 60, false); } catch(e){ seen.push('queue: ' + e.message); }
      if(H && H.on === false) seen.push('frame ' + n + ': HERO3D.on went false, err=' + H.err);
      if(n < 240 && !(H && H.on === false)){ requestAnimationFrame(pump); return; }
      resolve(JSON.stringify({
        frames: n, on: !!(H && H.on), ready: !!(H && H.ready), err: (H && H.err) || null,
        seen: seen.slice(0, 4),
        rigs: (typeof window.__hero3dRigs === 'function') ? window.__hero3dRigs() : null,
      }));
    })();
  });
})()
