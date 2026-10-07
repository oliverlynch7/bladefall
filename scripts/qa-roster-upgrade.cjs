const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'public/3d/enemy-assets/upgraded');
const roster=Object.keys(JSON.parse(fs.readFileSync(path.join(root,'tools/art/enemy-roster.json'))));
const expected=new Set(roster.filter(x=>!['colossus','marblecolossus'].includes(x)).concat(['officer-shield','officer-spear']));
const list=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json')));
assert.equal(list.length,expected.size,'Every active roster appearance must have one upgraded model');
const required=['Idle','Move','Windup','Attack','Hit','Death'];let total=0,max=0;
for(const row of list){
 assert(expected.delete(row.type),'Missing or duplicate roster type: '+row.type);
 const file=path.join(folder,row.file),buf=fs.readFileSync(file),jsonLen=buf.readUInt32LE(12),json=JSON.parse(buf.subarray(20,20+jsonLen));
 assert(json.skins?.length,'No rig: '+row.type);
 assert(json.meshes?.length,'No visible mesh: '+row.type);
 assert(row.triangles>=300,'Geometry suspiciously small: '+row.type);
 assert(row.triangles<=10000,'Common-enemy triangle budget exceeded: '+row.type);
 for(const name of required)assert(json.animations?.some(a=>a.name===name),'Missing '+name+' on '+row.type);
 assert(buf.length===row.bytes,'Manifest byte size mismatch: '+row.type);
 total+=buf.length;max=Math.max(max,row.triangles);
}
assert.equal(expected.size,0,'Unbuilt roster types: '+[...expected]);
assert(total<24_000_000,'Roster download budget exceeded');
const mob=fs.readFileSync(path.join(root,'public/3d/mob3d.js'),'utf8');
assert(mob.includes("file:'enemy-assets/upgraded/'+type+'-v2128',fitHeight"),'Renderer does not select upgraded models');
assert(mob.includes('forge-colossus-v2125')&&mob.includes('marblecolossus-v2126'),'Bespoke Colossi missing');
console.log(JSON.stringify({appearances:list.length,totalBytes:total,maxTriangles:max,clips:required,officers:2,existingColossi:2}));
