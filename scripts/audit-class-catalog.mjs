// Source inventory, not proof that a conditional effect works at runtime.
// Evaluating the trusted local table supports both JSON and JS authoring styles.
import {readFileSync,writeFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {blockOf,readerSource} from '../harness/audit-passives.js';
const source=readFileSync('public/3d/index.html','utf8');
const [start,end]=blockOf(source,'const CLASS2=');
const table=runInNewContext('('+source.slice(source.indexOf('{',start),end)+')',{classIcon:()=>''},{timeout:1000});
const readers=readerSource(source),rows=[];
for(const [cls,def] of Object.entries(table))for(let rank=2;rank<=9;rank++)for(const side of ['a','b']){
 const group=def['r'+rank],option=group[side];
 const sites=readers.split('\n').flatMap((line,i)=>line.includes("c2Passive('"+option.id+"')")?[i+1]:[]);
 rows.push({cls,rank,side,kind:group.kind,id:option.id,name:option.n,description:option.d,fx:option.fx,sites});
}
const skills=rows.filter(r=>r.kind==='skill'),passives=rows.filter(r=>r.kind==='passive');
const missing=passives.filter(r=>!r.sites.length);
console.log(JSON.stringify({classes:Object.keys(table).length,skills:skills.length,passives:passives.length,missing},null,2));
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(rows,null,2));
if(missing.length)process.exitCode=1;
