/* STAND A PARTY IN FRONT OF THE CAMERA, so "allies look like themselves" can be LOOKED AT.

   harness/test-mp.js proves the rig pool in numbers - two rigs, two class bodies, two weapons - and
   numbers are what stop a wrong answer being plausible. They are still not a picture, and this
   file's whole subject is what a party looks like. AUTOPILOT.md's rule applies: reading source is
   not proof, and neither is a passing assertion about a renderer.

   It has to PUMP rather than queue once. window.__hero3dPending is emptied by every flush, so a
   single call from an --eval is drawn on the next frame and gone by the time the shutter opens. The
   rAF loop re-queues both allies every frame, which is exactly what MP.drawPeers does in a real
   session, and it registers after the game's own callback so the allies are already in the queue
   when the local hero unshifts himself to the front of it.

   The two allies are given DELIBERATELY DIFFERENT states as well as different classes, because
   three bodies in three identical poses is the picture the old shared rig produced and the one this
   change exists to stop. The mage is mid-cast, the ranger is running, you are standing still.

     node _shot/shot.js --scene 0 --wait 6000 --out _shot/out/party.png \
          --eval @harness/probes/party.probe.js
     node _shot/shot.js --scene 0 --wait 6000 --out _shot/out/party-onerig.png \
          --url "/3d/index.html?hero3d=1&world3d=1&nobloom&heroonerig=1" \
          --eval @harness/probes/party.probe.js      <- the same frame, one shared rig */
(function(){
  const B = __BF3, G = B.G;
  if(typeof B.drawHero3 !== 'function') return JSON.stringify({ ok:false, why:'drawHero3 not exported' });

  const ally = (o) => Object.assign({}, G.p, o, {
    weapon: Object.assign({}, G.p.weapon || {}, { art: o.art, rarity: 'common' }),
  });
  /* BOTH ALLIES STAND TO THE RIGHT, and that is framing rather than fussiness: the hero's left is
     occupied at both destinations this is used at - a mesa in The Outskirts, the Arena Master's
     board in the arena - and an ally rendering perfectly behind a hill proves nothing to a reader
     looking at the picture. */
  const mk = () => [
    /* Separated in DEPTH, not across the screen. The follow camera's horizontal spread is much
       narrower than it looks - an ally 290 units to the side is already outside the frame, measured
       - so the second one stands nearer the camera instead and lands lower and larger. */
    ally({ peerId:'shot-mage', cid:'mage', art:'staff',
           x:G.p.x + 150, z:G.p.z + 90, vx:0, vz:0, onGround:true, atkTimer:0.6, swingId:1 }),
    ally({ peerId:'shot-ranger', cid:'ranger', art:'bow',
           x:G.p.x + 150, z:G.p.z - 80, vx:200, vz:0, onGround:true, atkTimer:0 }),
  ];

  /* IT RESOLVES LATE AND KEEPS PUMPING, and both halves are load-bearing. shot.js opens the shutter
     as soon as the eval settles, so a probe that returns immediately photographs the instant the
     level was entered: the first attempt did exactly that and came back with the arena's welcome
     toast, full HP and NO 3D hero at all - the layer had simply not drawn its first frame yet, which
     reads exactly like the renderer being broken. Resolving after ~180 real frames waits that out.
     The rAF is never cancelled, so the allies are still being queued when the frame is captured. */
  let n = 0;
  return new Promise(function(resolve){
    (function pump(){
      n++;
      try { for(const a of mk()) B.drawHero3(a, n / 60, false); } catch(e){}
      requestAnimationFrame(pump);
      if(n === 180) resolve(JSON.stringify({
        ok:true, frames:n, local:{ x:Math.round(G.p.x), z:Math.round(G.p.z) },
        rigs: (typeof window.__hero3dRigs === 'function') ? window.__hero3dRigs() : null,
      }));
    })();
  });
})()
