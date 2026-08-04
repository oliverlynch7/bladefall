/* MOB DISTRIBUTION — where the enemies actually ARE, which is not where I assumed.
 *
 * Oliver: "mobs scattered all throughout the level. not evenly so, and not at every moment, but
 * not only just around spawners."
 *
 * Three things in that sentence are separate measurements, so this reports three numbers:
 *   OPEN%     share of enemies standing OUTSIDE any room. Rooms are where the generator and my
 *             encounter pass both put things, so a low number means the space BETWEEN rooms is
 *             empty and the level plays as a series of arenas joined by safe walking.
 *   GROUND%   share of the level's AREA that is open non-room ground - i.e. how much room-free
 *             footing the level even has. Read OPEN% against this, never on its own: Emberdeep is
 *             65% void and only 5% open ground, so 6% of its mobs standing in the open is FULL
 *             coverage, not a failure. The Abyss is 1% open ground. Flagging those zones against an
 *             absolute threshold reported a defect that was actually the level's architecture -
 *             platforms over a chasm - and would have pushed me to force enemies onto ledges to
 *             satisfy a number.
 *   NEAR-DEN% share within 400 units of a spawner den. High means "only around spawners".
 *   CLUMP     mean nearest-neighbour distance divided by what it would be if the same count were
 *             spread uniformly over the level's area. 1.0 is a grid - the "evenly so" Oliver does
 *             not want. Below ~0.7 is genuinely clumpy: packs with quiet between them.
 *
 * Run: node tools/mobdist.js [zone...]
 */
const { execFileSync } = require('child_process');
const path = require('path');

const PROBE = `(()=>{const G=__BF3.G,B=__BF3;
const E=(G.enemies||[]).filter(e=>e&&!e.boss&&e.hp>0);
const R=(G.rooms||[]).filter(r=>r&&r.w);
if(!E.length||!R.length) return JSON.stringify({id:B.curZone().id,mobs:E.length});
const inRoom=e=>R.some(r=>Math.abs(e.x-r.x)<r.w/2 && Math.abs(e.z-r.z)<(r.d||r.w)/2);
/* How much open non-room GROUND exists at all - sampled, because a chasm zone's answer is "almost
   none" and OPEN% is meaningless without it. */
const xs0=R.map(r=>r.x),zs0=R.map(r=>r.z);
const gx0=Math.min(...xs0)-300,gx1=Math.max(...xs0)+300,gz0=Math.min(...zs0)-300,gz1=Math.max(...zs0)+300;
let gOpen=0,gTot=0;
for(let x=gx0;x<gx1;x+=70)for(let z=gz0;z<gz1;z+=70){gTot++;
 /* THE GAME'S OWN GROUND TEST, not a copy of it. The first version asked "is there a segment or a
    plat here" and reported the Outskirts - open grassland - as 2% ground, because that is not how
    this game decides what you can stand on. */
 if(B.surfaceHeightAt(x,z,20) < -1e8) continue;
 if(!R.some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<(r.d||r.w)/2)) gOpen++;}
const ground=Math.round(gOpen/Math.max(1,gTot)*100);
const dens=(G.dens||[]);
const nearDen=e=>dens.some(d=>Math.hypot(e.x-d.x,e.z-d.z)<400);
const open=E.filter(e=>!inRoom(e)).length;
const den=dens.length?E.filter(nearDen).length:0;
/* nearest-neighbour, normalised against a uniform spread of the same count over the same area */
let sum=0;
for(const a of E){let best=1e9;for(const b of E){if(a===b)continue;const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<best)best=d;}sum+=best;}
const nn=sum/E.length;
const xs=R.map(r=>r.x),zs=R.map(r=>r.z);
const area=(Math.max(...xs)-Math.min(...xs)+400)*(Math.max(...zs)-Math.min(...zs)+400);
const uniform=0.5*Math.sqrt(area/E.length);
return JSON.stringify({id:B.curZone().id,mobs:E.length,rooms:R.length,dens:dens.length,
 open:Math.round(open/E.length*100),den:Math.round(den/E.length*100),ground,
 clump:+(nn/uniform).toFixed(2),nn:Math.round(nn)});})()`;

const zones = process.argv.slice(2).length ? process.argv.slice(2) : ['0','1','2','3','4','5','6','7'];
const shot = path.join(__dirname, '..', '_shot', 'shot.js');
console.log('zone        mobs  rooms  dens  open%  ground%  nearDen%  clump  nn    reads as');
for(const z of zones){
  let r;
  try{
    const out = execFileSync('node', [shot,'--scene',z,'--wait','12000','--eval',PROBE],
                             {encoding:'utf8', timeout:90000});
    const m = out.match(/"value":\s*"(.*?)"\n/s);
    r = m ? JSON.parse(m[1].replace(/\\"/g,'"')) : {id:'z'+z, err:'no read'};
  }catch(e){ r = {id:'z'+z, err:'probe failed'}; }
  if(r.err || r.rooms==null){ console.log(String(r.id).padEnd(11), r.err||('mobs '+r.mobs)); continue; }
  const says=[];
  /* Judged against the open ground the level HAS, not against a flat 15%.
     Measured with the game's own surfaceHeightAt: EVERY zone has scarce open ground (4-9%), not
     just the chasm ones - these levels are chains of rooms with little standable connective tissue
     and a lot of off-path void. So the useful reading is the RATIO: what share of the open ground
     carries enemies, relative to its share of the level. Below 1 means the open space is emptier
     than the rooms; above 1 means the scatter has populated it. */
  const ratio = r.ground > 0 ? r.open / r.ground : 0;
  if(ratio < 1) says.push('ARENAS-ONLY (open space under-used)');
  else says.push('populated x' + ratio.toFixed(1));
  if(r.den  > 60) says.push('SPAWNER-BOUND');
  if(r.clump > 0.85) says.push('EVEN');
  console.log(String(r.id).padEnd(11), String(r.mobs).padEnd(5), String(r.rooms).padEnd(6),
    String(r.dens).padEnd(5), String(r.open).padEnd(6), String(r.ground).padEnd(8), String(r.den).padEnd(9),
    String(r.clump).padEnd(6), String(r.nn).padEnd(5), says.join(' '));
}
