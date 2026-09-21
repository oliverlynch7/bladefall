async page=>{
await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
return await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(0);b.meta.tutOff=true;b.G.p.invuln=999;
const boar=b.G.enemies.find(e=>e.homefieldsOrchard),mage=b.G.enemies.find(e=>e.homefieldsWing&&e.type==='caster');for(const e of b.G.enemies)if(e!==boar&&e!==mage)e.stunT=999;
const findings={};Object.assign(b.G.p,{x:boar.x+160,z:boar.z,y:0});let wind=false,charge=false;for(let i=0;i<420;i++){b.update(.016);wind ||= boar.windT>0;charge ||= boar.chargeT>0;}findings.boar={active:boar.active,wind,charge,y:boar.y};
Object.assign(b.G.p,{x:mage.x-150,z:mage.z+50,y:0});let cast=false,shot=false;for(let i=0;i<420;i++){b.update(.016);cast ||= mage.shotW>0;shot ||= b.G.projectiles.some(p=>p.owner==='enemy');}findings.caster={active:mage.active,cast,shot};
if(!wind||!charge||!cast||!shot)throw Error(JSON.stringify(findings));return findings;});
}
