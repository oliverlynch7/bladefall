import assert from 'node:assert/strict';
import {claimSurface} from '../../public/3d/surface-regions.js';
const ledger=new Map(),input=[{x:0,z:0,w:100,d:100},{x:45,z:20,w:100,d:100},{x:0,z:0,w:100,d:100},{x:-30,z:65,w:90,d:110}],output=input.flatMap(r=>claimSurface(ledger,r));
const contains=(r,x,z)=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2;
for(let x=-100.3;x<150;x+=2.5)for(let z=-100.3;z<150;z+=2.5){const before=input.some(r=>contains(r,x,z)),after=output.filter(r=>contains(r,x,z)).length;assert.equal(after,before?1:0);}
for(let i=0;i<output.length;i++)for(let j=i+1;j<output.length;j++){const a=output[i],b=output[j];assert(!(Math.min(a.x+a.w/2,b.x+b.w/2)>Math.max(a.x-a.w/2,b.x-b.w/2)&&Math.min(a.z+a.d/2,b.z+b.d/2)>Math.max(a.z-a.d/2,b.z-b.d/2)));}
console.log(JSON.stringify({input:input.length,output:output.length,coverage:'preserved',positiveAreaOverlaps:0}));
