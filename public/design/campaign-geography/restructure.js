'use strict';
Promise.all(['restructure-plan.json','layout-data.json'].map(u=>fetch(u+'?v=2357').then(r=>{if(!r.ok)throw Error(u);return r.json();}))).then(([plan,layout])=>{
 const $=id=>document.getElementById(id),select=$('section');
 for(const p of plan.maps){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;select.append(o);}
 function draw(){
  const p=plan.maps.find(p=>p.id===select.value),m=layout.maps.find(m=>m.zone===p.zone&&m.area===p.area),b=m.bounds;
  $('title').textContent=p.title;$('intent').textContent=p.intent;$('status').textContent=p.status;
  $('structures').replaceChildren(...(p.blocks.length?p.blocks:[{name:p.boundaries?.length?'New terrain boundaries shape the existing routes.':'Existing district geometry retained.'}]).map(v=>{const el=document.createElement('p');el.textContent=v.name;return el;}));
  const c=p.climb||p.search;$('shard').textContent=c?c.name+' · '+c.id+' — '+c.intent:'Keep the existing quest, puzzle and exploration rewards. No shard moved here.';
  $('routesummary').textContent=p.climb?p.climb.steps.map((q,i)=>`${i+1}. landing ${q[3]} × ${q[4]}, height ${q[2]}`).join('\n'):p.search?'A turning inspection corridor conceals the final recess.':'';
  $('protected').textContent=`${p.protected.objects.length} authored interactions · ${p.protected.npcs.length} NPCs · ${p.protected.shards.length} world pickups, plus all existing quest reward gates.`;
  $('verification').textContent=p.verification||'Authored plan based on captured game geometry. Implementation and physical verification pending.';
  const svg=$('map'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();svg.setAttribute('viewBox',`${b.minX-150} ${b.minZ-150} ${b.maxX-b.minX+300} ${b.maxZ-b.minZ+300}`);
  const node=(tag,attrs,label)=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(label){const t=document.createElementNS(ns,'title');t.textContent=label;el.append(t);}svg.append(el);return el;};
  const rect=(x,z,w,d,fill,stroke='none')=>node('rect',{x:x-w/2,y:z-d/2,width:w,height:d,fill,stroke,'stroke-width':12});
  for(const o of m.after.floors)rect(...o.slice(0,4),'#345356');
  for(const o of m.after.walls)rect(...o.slice(0,4),'#8a7d77');
  for(const r of m.paths)node('polyline',{points:r.points.map(q=>q.slice(0,2).join(',')).join(' '),fill:'none',stroke:r.main?'#70b6a7':'#517f79','stroke-width':r.main?19:11},r.id);
  for(const b of p.boundaries||[]){const last=b.closed===false?b.points.length-1:b.points.length;for(let i=0;i<last;i++)if(!b.openEdges?.includes(i))node('line',{x1:b.points[i][0],y1:b.points[i][1],x2:b.points[(i+1)%b.points.length][0],y2:b.points[(i+1)%b.points.length][1],stroke:'#e8bf72','stroke-width':28},b.id);}
  for(const v of p.blocks)node('rect',{x:v.x-v.w/2,y:v.z-v.d/2,width:v.w,height:v.d,fill:'#a4873b66',stroke:'#e8bf72','stroke-width':15},v.name);
  if(c){const ps=c.steps?[c.start,...c.steps]:c.path;node('polyline',{points:ps.map(q=>q.slice(0,2).join(',')).join(' '),fill:'none',stroke:'#d49bff','stroke-width':18},c.name);for(const q of c.steps||[])rect(q[0],q[1],q[3],q[4],'#ab75cc','#edceff');const q=c.end||c.steps.at(-1);node('circle',{cx:q[0],cy:q[1],r:52,fill:'#edcbff'},c.id);}
  for(const q of m.points)node('circle',{cx:q.x,cy:q.z,r:23,fill:q.group==='steps'?'#f4dc93':'#9accd0'},q.label);
 }
 select.onchange=draw;draw();
}).catch(e=>{document.getElementById('status').textContent='Plan could not load: '+e.message;});
