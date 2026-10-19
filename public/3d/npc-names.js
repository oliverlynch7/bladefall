/* Identity stays above the NPC; actions live in the stable interaction dock. */
(function(root){'use strict';
function entries(g){
 if(!g||g.hub)return [];
 const list=g.devKeep?[...(g.devKeep.actors||[])]:g.storyNpcs?.length?[...g.storyNpcs,...g.canyonPrisoners||[],...g.keepPrisoners||[],...g.ironWorkers||[],...(g.ascentWorkers||[]).map(n=>n.name?n:{...n,name:'Worker'})]:g.npc&&!g.npc.dummy?[{...g.npc,id:'shade',name:g.npc.name||'The Shade'}]:[];
 if(g.riftSpirit)list.push(g.riftSpirit);
 return list.filter(n=>n&&n.id&&n.name&&!n.hidden&&!n.dead&&!['sunspire_orb','abyss_king'].includes(n.id)&&(n.id!=='thomas'||!root.BFNpcRoster||root.BFNpcRoster.thomasScene(g,!!root.__BF3?.isCampaignAdventure?.())));
}
function occluded(g,eye,a,intersects){
 if(!eye||!intersects)return false;
 const body={x:a.x,y:a.y-15,z:a.z};
 for(const [list,relative]of [[g.walls,true],[g.obstacles,false],[g.doors,false]])for(const o of list||[])if(intersects(eye,body,o,relative&&!!o.courtWall))return true;
 return false;
}
let world=null,box=null;const pool=new Map();
function clear(){for(const r of pool.values())r.el.remove();pool.clear();if(box)box.hidden=true;}
function update(api){
 const {g,mode,project,anchor}=api;box=document.getElementById('npcNames');if(!box)return;
 if(g!==world){clear();world=g;}
 if(!g||mode!=='play'||g.hub||root.BF_LOADING?.active){box.hidden=true;return;}box.hidden=false;
 const focus=g.interact?.anchorNpc?.id,now=performance.now(),seen=new Set(),placed=[];
 const sorted=entries(g).map(n=>({n,d:Math.hypot(n.x-g.p.x,n.z-g.p.z)})).filter(v=>v.d<650).sort((a,b)=>(b.n.id===focus)-(a.n.id===focus)||a.d-b.d);
 for(const {n,d}of sorted){const id=n.id;seen.add(id);let r=pool.get(id);if(!r){const el=document.createElement('div');el.className='npc-nameplate';el.setAttribute('aria-hidden','true');box.append(el);r={el,next:0};pool.set(id,r);}const a=anchor(n);if(!a){r.el.hidden=true;continue;}
  const hunt=root.BFCampaignHunts?.marker(g,g.storyState||{},id),label=hunt?'! '+n.name+(hunt==='ready'?' · Turn in':' · Hunt'):n.name;const p=project(a.x,a.y,a.z),width=Math.min(240,label.length*7+28),height=26;
  if(!p||p[0]<width/2+8||p[0]>api.width-width/2-8||p[1]<height+8||p[1]>api.height-70){r.el.hidden=true;continue;}
  const eye=g.eye,signature=eye?[eye.x,eye.y,eye.z,a.x,a.y,a.z].map(v=>Math.round(v/12)).join(','):'';
  if(now>=r.next||signature!==r.signature){r.blocked=occluded(g,eye,a,api.intersects);r.next=now+180;r.signature=signature;}
  if(r.blocked){r.el.hidden=true;continue;}
  const rect={x:p[0]-width/2,y:p[1]-height,w:width,h:height};if(placed.some(q=>rect.x<q.x+q.w+6&&rect.x+rect.w+6>q.x&&rect.y<q.y+q.h+4&&rect.y+rect.h+4>q.y)){r.el.hidden=true;continue;}placed.push(rect);
  if(r.el.textContent!==label)r.el.textContent=label;r.el.style.color=hunt==='ready'?'#b8f4a0':hunt?'#ffdf80':'';r.el.hidden=false;r.el.classList.toggle('focused',id===focus);r.el.style.transform='translate('+p[0]+'px,'+p[1]+'px) translate(-50%,-100%)';
 }
 for(const [id,r]of pool)if(!seen.has(id)){r.el.remove();pool.delete(id);}
}
root.BFNpcNames={update,clear,entries,occluded};if(typeof module!=='undefined')module.exports={entries,occluded};
})(typeof window!=='undefined'?window:globalThis);
