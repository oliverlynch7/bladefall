// Visual state only: claims and reward records stay untouched. Scaling an actor
// avoids fading shared template materials (which would also fade unopened chests).
export function chestExit(rec,opened,dt){
 if(!rec.exitScale){rec.exitScale=rec.root.scale.clone();rec.openAge=opened?Infinity:0;}
 const step=Number.isFinite(dt)?Math.min(.1,Math.max(0,dt)):0;
 rec.openAge=opened?rec.openAge+step:0;
 const t=opened?Math.min(1,Math.max(0,(rec.openAge-.9)/.4)):0;
 const scale=1-t*t*(3-2*t);
 rec.root.scale.copy(rec.exitScale).multiplyScalar(scale);
 rec.root.visible=t<1;
 return rec.root.visible;
}
