/* Measured HUD callouts. No game state, transforms or layout changes to HUD targets. */
(function(){'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n));
 const area=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 const grow=(r,n)=>({x:r.x-n,y:r.y-n,w:r.w+n*2,h:r.h+n*2});
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};};
 function visible(e){if(!e)return false;const r=rect(e);if(!r.w||!r.h||r.x+r.w<=0||r.y+r.h<=0||r.x>=innerWidth||r.y>=innerHeight)return false;for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;}return true;}
 function leader(c,t){
  if(!t||area(grow(c,5),grow(t,5)))return null;
  const cx=c.x+c.w/2,cy=c.y+c.h/2,tx=t.x+t.w/2,ty=t.y+t.h/2;
  let s,e,horizontal;
  if(c.x+c.w+10<=t.x||t.x+t.w+10<=c.x){
   const sign=cx<tx?1:-1;horizontal=true;
   s={x:sign>0?c.x+c.w+3:c.x-3,y:clamp(ty,c.y+18,c.y+c.h-18)};
   e={x:sign>0?t.x-7:t.x+t.w+7,y:clamp(cy,t.y+Math.min(10,t.h/2),t.y+t.h-Math.min(10,t.h/2))};
  }else{
   const sign=cy<ty?1:-1;
   s={x:clamp(tx,c.x+18,c.x+c.w-18),y:sign>0?c.y+c.h+3:c.y-3};
   e={x:clamp(cx,t.x+Math.min(10,t.w/2),t.x+t.w-Math.min(10,t.w/2)),y:sign>0?t.y-7:t.y+t.h+7};
  }
  const a=horizontal?{x:(s.x+e.x)/2,y:s.y}:{x:s.x,y:(s.y+e.y)/2};
  const b=horizontal?{x:a.x,y:e.y}:{x:e.x,y:a.y};
  return {s,e,a,b,d:`M${s.x},${s.y} C${a.x},${a.y} ${b.x},${b.y} ${e.x},${e.y}`};
 }
 function route(c,t,obstacles,width,height){
  if(!t||area(grow(c,5),grow(t,5)))return null;
  const ports=(r,t,pad)=>[
   {x:r.x-pad,y:clamp(t.y+t.h/2,r.y+Math.min(14,r.h/2),r.y+r.h-Math.min(14,r.h/2)),nx:-1,ny:0},
   {x:r.x+r.w+pad,y:clamp(t.y+t.h/2,r.y+Math.min(14,r.h/2),r.y+r.h-Math.min(14,r.h/2)),nx:1,ny:0},
   {x:clamp(t.x+t.w/2,r.x+Math.min(14,r.w/2),r.x+r.w-Math.min(14,r.w/2)),y:r.y-pad,nx:0,ny:-1},
   {x:clamp(t.x+t.w/2,r.x+Math.min(14,r.w/2),r.x+r.w-Math.min(14,r.w/2)),y:r.y+r.h+pad,nx:0,ny:1}
  ];
  let best;
  for(const s of ports(c,t,3))for(const e of ports(t,c,7)){
   const a={x:s.x+s.nx*10,y:s.y+s.ny*10},b={x:e.x+e.nx*10,y:e.y+e.ny*10};
   const paths=[[a,{x:a.x,y:b.y},b],[a,{x:b.x,y:a.y},b]];
   for(const x of [6,width-6,Math.min(c.x,t.x)-12,Math.max(c.x+c.w,t.x+t.w)+12])paths.push([a,{x,y:a.y},{x,y:b.y},b]);
   for(const y of [6,height-6,Math.min(c.y,t.y)-12,Math.max(c.y+c.h,t.y+t.h)+12])paths.push([a,{x:a.x,y},{x:b.x,y},b]);
   for(const mid of paths){const points=[s,...mid,e].filter((p,i,arr)=>!i||Math.hypot(p.x-arr[i-1].x,p.y-arr[i-1].y)>.1);let score=0,invalid=false;
    for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],d=Math.hypot(q.x-p.x,q.y-p.y);score+=d;const n=Math.max(1,Math.ceil(d/8));for(let j=0;j<=n;j++){const r={x:p.x+(q.x-p.x)*j/n,y:p.y+(q.y-p.y)*j/n,w:1,h:1};if(r.x<2||r.y<2||r.x>width-2||r.y>height-2||area(r,c)||area(r,t)){invalid=true;break;}for(const o of obstacles)if(area(r,o))score+=800;}if(invalid)break;}
    if(!invalid&&(!best||score<best.score))best={s,e,points,score};
   }
  }
  if(!best)return leader(c,t);
  const pts=best.points;let d=`M${pts[0].x},${pts[0].y}`;
  for(let i=1;i<pts.length-1;i++){const p=pts[i],a=pts[i-1],b=pts[i+1],la=Math.hypot(p.x-a.x,p.y-a.y),lb=Math.hypot(b.x-p.x,b.y-p.y),r=Math.min(8,la/2,lb/2);d+=` L${p.x+(a.x-p.x)*r/la},${p.y+(a.y-p.y)*r/la} Q${p.x},${p.y} ${p.x+(b.x-p.x)*r/lb},${p.y+(b.y-p.y)*r/lb}`;}
  best.d=d+` L${best.e.x},${best.e.y}`;return best;
 }
 function layout({width,height,card,target,anchor=target,obstacles=[]}){
  const m=12,w=Math.min(card.w,width-2*m),h=Math.min(card.h,height-2*m),gap=30;
  const candidates=[[width/2-w/2,18],[m,18],[width-w-m,18],[m,height-h-m],[width-w-m,height-h-m]];
  if(anchor){const t=anchor;for(const y of [t.y,t.y+t.h/2-h/2,t.y+t.h-h,t.y-h-gap,t.y+t.h+gap])candidates.push([t.x-w-gap,y],[t.x+t.w+gap,y],[m,y],[width-w-m,y]);for(const x of [t.x,t.x+t.w/2-w/2,t.x+t.w-w])candidates.push([x,t.y-h-gap],[x,t.y+t.h+gap]);}
  const action={x:width*.36,y:height*.38,w:width*.28,h:height*.32};
  let best;
  for(const [x,y]of candidates){
   const c={x:clamp(x,m,width-w-m),y:clamp(y,m,height-h-m),w,h};
   const l=leader(c,target);let score=area(c,action)*2+c.y*.12;
   for(const o of obstacles)score+=area(grow(c,6),o)*8;
   if(target){score+=area(grow(c,12),target)*100+area(grow(c,6),anchor)*8;score+=Math.hypot(c.x+w/2-target.x-target.w/2,c.y+h/2-target.y-target.h/2)*2;
    if(!l)score+=2000;
   }
   if(!best||score<best.score)best={...c,score,leader:l};
  }
  best.leader=route(best,target,obstacles,width,height);return best;
 }
 let svg=null;
 function hide(){if(svg)svg.hidden=true;}
 function clear(){svg?.remove();svg=null;}
 function place(panel,selectors,anchorSelector){
  if(!panel||panel.hidden){hide();return null;}
  const target=(selectors||[]).map(s=>document.querySelector(s)).find(visible);
  // joyzone is an invisible input hit area, not a HUD panel. Only its visible stick is an obstacle.
  const obstacles=[...document.querySelectorAll('#hud,#pethud,#questbox,#localMap,#mapCaption,#hudprogress,#adventureSkills,#bLMB,#bSpace,#bSk0,#bSk1,#bSk2,#bSk3,#inventoryDock,#hudbag,#hudAutoSell,#hudJournal,#hudLootHistory,#equipmentFeed,#journalNotice,#partyTravel,#joy,#bAttack,#bDodge,#bJump,#pausebtn')].filter(e=>visible(e)&&!(target&&(e===target||e.contains(target)||target.contains(e)))).map(rect);
  const anchor=anchorSelector&&document.querySelector(anchorSelector);
  const t=target?rect(target):null,result=layout({width:innerWidth,height:innerHeight,card:{w:panel.offsetWidth,h:panel.offsetHeight},target:t,anchor:visible(anchor)?rect(anchor):t,obstacles});
  panel.style.left=result.x+'px';panel.style.top=result.y+'px';panel.dataset.target=target?.id||selectors?.[0]||'';
  if(!target){hide();return result;}
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='lessonArrow';svg.setAttribute('aria-hidden','true');svg.innerHTML='<defs><marker id="lessonHead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L7,3.5 L0,7 Z" fill="#f4d492"/></marker></defs><rect class="lesson-ring-shadow"/><rect class="lesson-ring"/><path class="lesson-line-shadow"/><path class="lesson-line" marker-end="url(#lessonHead)"/><circle r="3" class="lesson-dot"/>';document.body.append(svg);}
  svg.hidden=false;svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
  const halo=grow(t,4);
  for(const e of svg.querySelectorAll('rect')){for(const [k,v]of Object.entries({x:halo.x,y:halo.y,width:halo.w,height:halo.h,rx:target.id==='localMap'?14:7}))e.setAttribute(k,v);}
  for(const e of svg.querySelectorAll('path[class]')){e.setAttribute('d',result.leader?.d||'');}
  const dot=svg.querySelector('circle');dot.style.display=result.leader?'':'none';if(result.leader){dot.setAttribute('cx',result.leader.s.x);dot.setAttribute('cy',result.leader.s.y);}
  return result;
 }
 window.BFTutorialCallout={place,hide,clear,layout,visible};
})();
