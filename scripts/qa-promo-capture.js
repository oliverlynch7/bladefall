/* Local promotional photographs: genuine shipped geometry/materials, no image generation. */
(()=>{'use strict';
if(!['localhost','127.0.0.1'].includes(location.hostname))return;
const wait=ms=>new Promise(r=>setTimeout(r,ms));let camera=null;
const css=document.createElement('style');css.textContent='body.promo-clean *{visibility:hidden!important}body.promo-clean #gl{visibility:visible!important}';document.head.append(css);
async function ready(){for(let n=0;n<600;n++){if(window.__BF3&&window.HERO3D?.ready&&!window.BF_LOADING?.active)return;await wait(50)}throw Error('Game assets did not load');}
function frame(c){const b=__BF3,g=b.G,p=g.p;if(c.hero)Object.assign(p,{x:c.hero[0],y:c.hero[1],z:c.hero[2],vx:0,vy:0,vz:0,yaw:c.yaw??Math.PI,invuln:99999});const [x,y,z]=c.eye,[tx,ty,tz]=c.target;camera={on:true,x,y,z,yaw:Math.atan2(tx-x,tz-z),pitch:Math.atan2(ty-y,Math.hypot(tx-x,tz-z))};window.__bfEdCam=()=>camera;Object.assign(g.cam,{x:p.x,y:p.y,z:p.z});g.shake=0;return {camera,hero:[p.x,p.y,p.z],zone:g.zone,area:g.area,areaName:g.areaName};}
window.Promo={
async stage(zone,area){await ready();const b=__BF3;await b.briarReady;if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));b.loadMode('rl');Object.assign(b.meta,JSON.parse(JSON.stringify(window.promoBaseline)),{tutOff:true,introSeen:true,hubTutDone:true,camMode:'shoulder',quality:'high',renderDist:2.2,shakeOff:true,autoAttack:false,run:null,bank:null});b.openHub();if(zone>=0){b.enterZone(zone);if(area!==0){b.G.area=area;b.loadArea()}}await ready();for(const e of b.G.enemies||[])e.stunT=99999;b.G.p.invuln=99999;document.body.classList.add('promo-clean');b.resize();await wait(900);return {zone,area,hero:[b.G.p.x,b.G.p.y,b.G.p.z],boss:b.G.boss&&[b.G.boss.x,b.G.boss.y,b.G.boss.z],hub:b.G.hub,npcs:(b.G.hubNpcs||[]).map(n=>({id:n.id,x:n.x,z:n.z}))};},
frame,hud(){document.body.classList.toggle('promo-clean')}
};
})();

