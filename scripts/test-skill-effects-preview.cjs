const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('public/3d/index.html','utf8'),start=source.indexOf('const CLASS2='),end=source.indexOf('const PASSIVE_ART',start),ctx={classIcon:()=>'',skillIcon:()=>''};
vm.createContext(ctx);vm.runInContext(source.slice(start,end)+';this.classes=CLASS2;',ctx);
const box={window:{}};for(const f of ['combat-art.js','skill-identity.js'])vm.runInNewContext(fs.readFileSync('public/3d/'+f,'utf8'),box);
const api=box.window.BF_COMBAT_ART;api.configure(ctx.classes);const rows=JSON.parse(fs.readFileSync('public/3d/skill-motion-catalog.json','utf8'));let strokes=0;
const draw={pushM(){},popM(){},mv(){},rotY(){},rotX(){},ribbon(a,b,w,c,alpha){assert([...a,...b,w,alpha].every(Number.isFinite));assert(w>0);strokes++;},quality:'high',particles:true};
for(const row of rows){const p=api.profiles[row.id];for(const key of ['form','slot','side'])assert.equal(row[key],p[key],row.id+' '+key);let before=strokes;draw.classId=row.cls;const life=p.slot===3?1.05:.65;api.render({p:{x:0,y:0,z:0,yaw:0},projectiles:[],combatArt:[{profile:p,x:0,y:0,z:0,yaw:0,t:life*.4,life,serial:1,origin:{x:0,y:0,z:0}}]},draw);assert(strokes>before,row.id);}
let before=strokes;api.render({p:{},projectiles:[],combatArt:[]},draw);assert.equal(strokes,before);
const page=fs.readFileSync('public/3d/skill-motion-preview.html','utf8'),renderer=fs.readFileSync('public/3d/combat-art-three.js','utf8');assert(page.includes('id="effects" type="checkbox" checked'));assert(renderer.includes('width*=widthScale'));assert(renderer.includes('context?.unitsPerMeter||1'));
console.log(JSON.stringify({passed:true,skills:rows.length,finiteStrokes:strokes,emptyEffects:0}));
