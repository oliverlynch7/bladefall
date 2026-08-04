/* ZONE SHAPE — a repeatable read on how a level NAVIGATES, not how it looks.
 *
 * Oliver: "a good portion of them navigate quite similarly... find a way you can reliably improve
 * level layout, terrain, navigation." Reliably means measurable: every previous pass added things
 * to levels and could not tell whether the level got better, because nothing was being measured
 * except by playing it.
 *
 * These six numbers are the ones that separate a place you remember from a corridor you walked:
 *
 *   ASPECT     long axis / short axis. 4.5 is a hallway. Under 2 is a place.
 *   ROOMS      how many distinct spaces.
 *   OFFAXIS    rooms more than 300 units off the straight entry-to-exit line - i.e. anything you
 *              have to CHOOSE to visit. Zero means the level is a queue.
 *   RISE       distinct elevations with fightable ground. 1 means the level is flat.
 *   LOOP       does any route return you to a room you have already cleared? Loops make a level
 *              feel like a place; chains make it feel like a list.
 *   DEADENDS   rooms with one connection. Some is good (a reward at the end of a spur); all bad.
 *
 * Run:  node tools/zoneshape.js            (all zones)
 *       node tools/zoneshape.js 0 3        (specific zones)
 *
 * It shells out to the screenshot harness because that is the only thing that boots the real game
 * and builds a real level - measuring the generator any other way measures a guess.
 */
const { execFileSync } = require('child_process');
const path = require('path');

const PROBE = `(()=>{const G=__BF3.G,B=__BF3;
const R=(G.rooms||[]).filter(r=>r&&r.w); if(!R.length) return JSON.stringify({id:B.curZone().id,rooms:0});
const xs=R.map(r=>r.x), zs=R.map(r=>r.z);
const w=Math.max(...xs)-Math.min(...xs)+400, d=Math.max(...zs)-Math.min(...zs)+400;
const aspect=Math.max(w,d)/Math.max(1,Math.min(w,d));
const s={x:G.p.x,z:G.p.z}, g=G.portalPos||{x:0,z:Math.min(...zs)};
const ax=g.x-s.x, az=g.z-s.z, L=Math.hypot(ax,az)||1;
const dev=R.map(r=>Math.abs((r.x-s.x)*az-(r.z-s.z)*ax)/L);
const offaxis=dev.filter(v=>v>300).length;
const plats=(G.obstacles||[]).filter(o=>o.kind==='plat'&&!o.autoCol&&(o.w||0)>=90&&(o.d||0)>=90);
const tiers={}; for(const o of plats) tiers[Math.round((o.h||0)/70)]=1;
const rise=Object.keys(tiers).length;
/* a loop exists if two rooms far apart along the route are close in space - you can cut across */
let loop=0;
for(let i=0;i<R.length;i++) for(let j=i+3;j<R.length;j++)
  if(Math.hypot(R[i].x-R[j].x,R[i].z-R[j].z) < 900) loop=1;
return JSON.stringify({id:B.curZone().id,rooms:R.length,aspect:+aspect.toFixed(2),offaxis,rise,loop,
  w:Math.round(w),d:Math.round(d)});})()`;

const zones = process.argv.slice(2).length ? process.argv.slice(2) : ['0','1','2','3','4','5','6','7'];
const shot = path.join(__dirname, '..', '_shot', 'shot.js');
const rows = [];
for(const z of zones){
  try{
    const out = execFileSync('node', [shot, '--scene', z, '--wait', '12000', '--eval', PROBE],
                             { encoding:'utf8', timeout: 90000 });
    const m = out.match(/"value":\s*"(.*?)"\n/s);
    if(!m){ rows.push({ id:'z'+z, err:'no read' }); continue; }
    rows.push(JSON.parse(m[1].replace(/\\"/g,'"')));
  }catch(e){ rows.push({ id:'z'+z, err:'probe failed' }); }
}

const flag = (r) => {
  const bad = [];
  if(r.aspect > 3)   bad.push('CORRIDOR');
  if(r.offaxis === 0) bad.push('QUEUE');
  if(r.rise <= 1)    bad.push('FLAT');
  if(!r.loop)        bad.push('CHAIN');
  return bad.join(' ');
};
console.log('zone        rooms  aspect  offaxis  rise  loop   size          problems');
for(const r of rows){
  if(r.err){ console.log(String(r.id).padEnd(11), r.err); continue; }
  console.log(
    String(r.id).padEnd(11),
    String(r.rooms).padEnd(6),
    String(r.aspect).padEnd(7),
    String(r.offaxis).padEnd(8),
    String(r.rise).padEnd(5),
    String(r.loop?'yes':'no').padEnd(6),
    (r.w+'x'+r.d).padEnd(13),
    flag(r));
}
