'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,plan,area=0,selected=null,viewBox,fullBox,drag=null;
const svg=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const pretty=s=>s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').replace(/^./,c=>c.toUpperCase());
const el=(target,tag,attrs,text)=>{const n=svg(tag,attrs,text);target.append(n);return n;};
function band(){const key=$('height').value;if(key==='all')return [-Infinity,Infinity];const step=Math.ceil(Math.max(plan.heightMax,300)/3/50)*50,index=Number(key);return [index*step,index===2?Infinity:(index+1)*step];}
function levelOpacity(y,top=y){const [lo,hi]=band();return top>=lo&&y<hi?1:.055;}
function applyBox(){const min=550,max=Math.max(fullBox[2],fullBox[3])*1.7;viewBox[2]=Math.max(min,Math.min(max,viewBox[2]));viewBox[3]=viewBox[2]*($('map').clientHeight/Math.max(1,$('map').clientWidth));$('map').setAttribute('viewBox',viewBox.join(' '));draw();}
function fit(){const b=plan.bounds,w=b.maxX-b.minX+500,h=b.maxZ-b.minZ+500,aspect=$('map').clientWidth/Math.max(1,$('map').clientHeight),vw=Math.max(w,h*aspect),vh=vw/aspect;fullBox=[(b.minX+b.maxX-vw)/2,(b.minZ+b.maxZ-vh)/2,vw,vh];viewBox=[...fullBox];applyBox();}
function zoom(factor,center){const [x,y,w,h]=viewBox,c=center||[x+w/2,y+h/2];viewBox=[c[0]-(c[0]-x)*factor,c[1]-(c[1]-y)*factor,w*factor,h*factor];applyBox();}
function toWorld(event){const rect=$('map').getBoundingClientRect();return [viewBox[0]+(event.clientX-rect.left)/rect.width*viewBox[2],viewBox[1]+(event.clientY-rect.top)/rect.height*viewBox[3]];}
function draw(){
 if(!plan)return;const root=$('map'),mode=$('view').value,unit=viewBox[2]/Math.max(1,root.clientWidth);root.replaceChildren();
 const defs=el(root,'defs'),grid=el(defs,'pattern',{id:'grid',width:1000,height:1000,patternUnits:'userSpaceOnUse'});el(grid,'path',{d:'M1000 0H0V1000',fill:'none',stroke:'#243e51','stroke-width':1,'vector-effect':'non-scaling-stroke'});
 const hatch=el(defs,'pattern',{id:'hatch',width:100,height:100,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'});el(hatch,'rect',{width:100,height:100,fill:'#853838',opacity:.09});el(hatch,'path',{d:'M0 0V100',stroke:'#c26f6f','stroke-width':18,opacity:.3});
 el(root,'rect',{x:viewBox[0],y:viewBox[1],width:viewBox[2],height:viewBox[3],fill:'url(#grid)'});
 const geo=plan[mode==='before'?'before':'after'];
 // Floors first, sorted by height. A height slice fades other storeys.
 for(const b of [...geo.floors].sort((a,b)=>a[4]-b[4])){
  const [x,z,w,d,y,,id]=b;if(w<=0||d<=0)continue;
  const added=mode==='changes'&&id,opacity=levelOpacity(y)*(mode==='changes'&&!id? .15:1);
  const tint=added?'#507963':`hsl(207 25% ${24+Math.min(16,y/65)}%)`;
  el(root,'rect',{x:x-w/2,y:z-d/2,width:w,height:d,fill:tint,opacity,stroke:'#73929e','stroke-opacity':.22,'stroke-width':.6,'vector-effect':'non-scaling-stroke'});
 }
 for(const h of plan.hazards){const n=el(root,'rect',{x:h.x-h.w/2,y:h.z-h.d/2,width:h.w,height:h.d,fill:'url(#hatch)',stroke:'#dc9393','stroke-width':1.1,'stroke-dasharray':'5 4','vector-effect':'non-scaling-stroke'});el(n,'title',{},pretty(h.id)+' — preserve this hazard or mechanical gap.');}
 for(const b of [...geo.blocks,...geo.walls]){
  const [x,z,w,d,y,h,id]=b;if(w<=0||d<=0||h<5)continue;
  const opacity=levelOpacity(y,y+h)*(mode==='changes'&&!id? .2:.95);
  el(root,'rect',{x:x-w/2,y:z-d/2,width:w,height:d,fill:id?'#a6b8c1':'#627686',opacity});
 }
 if($('rooms').checked)for(const room of plan.rooms){const n=el(root,'rect',{class:'room',x:room.x-room.w/2,y:room.z-room.d/2,width:room.w,height:room.d,opacity:levelOpacity(room.y||0)});el(n,'title',{},room.name+' · height '+(room.y||0));}
 if($('routes').checked&&mode!=='before')for(const p of plan.paths){
  // Draw segments separately so stacked portions can be inspected by height.
  for(let i=1;i<p.points.length;i++){
   const a=p.points[i-1],b=p.points[i],n=el(root,'path',{class:'route',d:`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`,stroke:p.main?'#ffd282':'#76ddd1','stroke-width':p.main?2.4:1.6,'stroke-dasharray':p.main?'none':'6 5',opacity:levelOpacity(Math.min(a[2],b[2]),Math.max(a[2],b[2]))});el(n,'title',{},pretty(p.id)+' · height '+a[2]+' → '+b[2]);
  }
 }
 if($('encounters').checked)for(const e of plan.enemies){const size=3.5*unit,g=el(root,'path',{d:`M${e.x} ${e.z-size}L${e.x+size} ${e.z+size}L${e.x-size} ${e.z+size}Z`,fill:'#ef8d86',opacity:levelOpacity(e.y||0)});el(g,'title',{},pretty(e.type)+' · starting position');}
 const bounds=plan.bounds;el(root,'rect',{x:bounds.minX,y:bounds.minZ,width:bounds.maxX-bounds.minX,height:bounds.maxZ-bounds.minZ,fill:'none',stroke:'#657f93','stroke-dasharray':'9 7','stroke-width':1,'vector-effect':'non-scaling-stroke'});
 for(const p of [...plan.points].sort((a,b)=>(a.group==='steps')-(b.group==='steps'))){
  const opacity=levelOpacity(p.y);if(opacity<.1)continue;
  const g=el(root,'g',{class:'point','data-id':p.id,tabindex:0,role:'button','aria-label':p.number+'. '+p.label,transform:`translate(${p.x} ${p.z})`}),active=selected===p.id;
  el(g,'circle',{r:(active?15:12)*unit,fill:p.group==='steps'?'#ffd282':'#76ddd1',stroke:active?'#fff':'#101e29','stroke-width':active?3:2,'vector-effect':'non-scaling-stroke'});
  el(g,'text',{'text-anchor':'middle','dominant-baseline':'central','font-size':12*unit,fill:'#0e2735'},p.number);
  el(g,'title',{},p.label+' · height '+p.y);
 }
 $('mapcaption').textContent=(mode==='before'?'Previous geometry · current destination markers':mode==='changes'?'Green = new floors · pale = new boundaries':'Updated floors and solid boundaries')+($('height').value==='all'?' · all heights':' · '+$('height').selectedOptions[0].text);
}
function showPoint(id){
 const p=plan.points.find(p=>p.id===id);if(!p)return;selected=id;
 $('selection').innerHTML=`<strong>${esc(p.number+'. '+p.label)}</strong><br>${esc(p.note)}<br><small>Height ${p.y} · ${p.group==='steps'?'Main journey':'Optional / alternate destination'}</small><br><button id="focusPoint">Focus this location</button>`;
 $('focusPoint').onclick=()=>{const w=Math.min(2000,fullBox[2]),h=w*$('map').clientHeight/$('map').clientWidth;viewBox=[p.x-w/2,p.z-h/2,w,h];$('height').value='all';applyBox();};
 document.querySelectorAll('.stop').forEach(b=>b.classList.toggle('selected',b.dataset.id===id));draw();
}
function profile(){const p=plan.paths.find(p=>p.id===$('profileRoute').value),root=$('profile');root.replaceChildren();if(!p)return;let distance=0;const points=p.points.map((v,i)=>{if(i)distance+=Math.hypot(v[0]-p.points[i-1][0],v[1]-p.points[i-1][1]);return [distance,v[2]];});const max=Math.max(100,...points.map(p=>p[1])),min=Math.min(0,...points.map(p=>p[1])),range=max-min;
 el(root,'path',{d:'M65 16V142H775',fill:'none',stroke:'#7693a3'});el(root,'text',{x:5,y:24,fill:'#bdd1da','font-size':12},Math.round(max));el(root,'text',{x:5,y:142,fill:'#bdd1da','font-size':12},min);el(root,'text',{x:650,y:165,fill:'#bdd1da','font-size':12},Math.round(distance)+' units');
 el(root,'polyline',{points:points.map(p=>`${65+p[0]/Math.max(1,distance)*710},${140-(p[1]-min)/range*120}`).join(' '),fill:'none',stroke:'#ffd282','stroke-width':2.5});
}
function load(){
 const zone=Number($('region').value);plan=data.maps.find(p=>p.zone===zone&&p.area===area);selected=null;
 history.replaceState(null,'','#'+plan.id);$('title').textContent=plan.title;$('idea').textContent=plan.idea;$('part').textContent=`${zone+1} / 8 regions · Part ${area+1}`;
 const b=plan.bounds;$('scale').innerHTML=`${(b.maxX-b.minX).toLocaleString()} × ${(b.maxZ-b.minZ).toLocaleString()} units<small>Original map bounds retained</small>`;
 $('protect').textContent=plan.protect;$('review').textContent=plan.review;$('pathnote').textContent=plan.pathNote;
 $('source').textContent='Source: '+plan.source.file+' · previous footprint: '+data.beforeCommit+' · initial quest state · '+data.date;
 for(const group of ['steps','branches']){$(group).replaceChildren();for(const p of plan.points.filter(p=>p.group===group)){const button=document.createElement('button');button.className='stop'+(group==='branches'?' side':'');button.dataset.id=p.id;button.innerHTML=`<span class="badge">${esc(p.number)}</span><span><strong>${esc(p.label)}</strong><span class="desc">${esc(p.note)}</span></span>`;button.onclick=()=>showPoint(p.id);$(group).append(button);}}
 for(let a=0;a<2;a++)$('half'+a).setAttribute('aria-pressed',String(a===area));
 const step=Math.ceil(Math.max(plan.heightMax,300)/3/50)*50;$('height').innerHTML='<option value="all">All elevations</option>'+[0,1,2].map(i=>`<option value="${i}">${['Lower','Middle','Upper'][i]} · ${i*step}${i===2?'+':'–'+((i+1)*step-1)}</option>`).join('');
 $('profileRoute').innerHTML=plan.paths.map(p=>`<option value="${esc(p.id)}">${esc(pretty(p.id))}</option>`).join('');$('profilePanel').hidden=!plan.paths.length;
 $('profileRoute').value=plan.paths.find(p=>p.main)?.id||plan.paths[0]?.id||'';profile();$('selection').textContent='Select a stop to inspect its purpose.';fit();
}
function bind(){
 [...$('region').options].forEach((o,i)=>o.value=String(i));$('region').onchange=load;
 for(let a=0;a<2;a++)$('half'+a).onclick=()=>{area=a;load();};
 for(const id of ['height','view','routes','rooms','encounters'])$(id).onchange=draw;
 $('fit').onclick=fit;$('zoomIn').onclick=()=>zoom(.75);$('zoomOut').onclick=()=>zoom(1/.75);$('profileRoute').onchange=profile;
 $('map').addEventListener('click',event=>{if(drag?.moved)return;const point=event.target.closest('.point');if(point)showPoint(point.dataset.id);});
 $('map').addEventListener('wheel',event=>{event.preventDefault();zoom(event.deltaY>0?1.12:.89,toWorld(event));},{passive:false});
 $('map').addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('.point'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,box:[...viewBox],moved:false};$('map').setPointerCapture(event.pointerId);$('map').classList.add('dragging');});
 $('map').addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag.moved ||= Math.hypot(dx,dy)>4;viewBox=[drag.box[0]-dx*drag.box[2]/$('map').clientWidth,drag.box[1]-dy*drag.box[3]/$('map').clientHeight,drag.box[2],drag.box[3]];applyBox();});
 const end=()=>{$('map').classList.remove('dragging');drag=null;};$('map').addEventListener('pointerup',end);$('map').addEventListener('pointercancel',end);
 $('map').addEventListener('keydown',event=>{const point=event.target.closest('.point');if(point&&['Enter',' '].includes(event.key)){event.preventDefault();showPoint(point.dataset.id);return;}if(['+','=','-','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();if(['+','='].includes(event.key))zoom(.8);else if(event.key==='-')zoom(1.25);else{const dx=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0,dz=event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0;viewBox[0]+=dx*viewBox[2]*.12;viewBox[1]+=dz*viewBox[3]*.12;applyBox();}}});
 let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(fit,100);});
 const match=location.hash.match(/^#([0-7])-([01])$/);if(match){$('region').value=match[1];area=Number(match[2]);}load();
}
fetch('layout-data.json?v=2188').then(r=>{if(!r.ok)throw Error('Could not load the plans.');return r.json();}).then(value=>{data=value;bind();}).catch(error=>{$('error').hidden=false;$('error').textContent=error.message+' Please refresh or return to Bladefall.';});
