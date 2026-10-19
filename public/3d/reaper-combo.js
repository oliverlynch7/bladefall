/* Reaper basic attacks only. Metres, +Z forward; no combat/stat mutations. */
(function(root){'use strict';
 const frames=new Map();
 function publish(id,hit,offset,origin={}){frames.set(id,{hit,offset,...origin,at:Date.now()});if(frames.size>16)frames.delete(frames.keys().next().value);}
 function frame(id,hit){const f=frames.get(id);return f&&f.hit===hit&&Date.now()-f.at<200?f:null;}
 const durations=[.46,.48,.62],active=[.26,.26,.34];
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function curve(q,keys){for(let i=1;i<keys.length;i++){const a=keys[i-1],b=keys[i];if(q<=b[0]){const t=smooth((q-a[0])/(b[0]-a[0]));return a.slice(1).map((n,k)=>n+(b[k+1]-n)*t);}}return keys.at(-1).slice(1);}
 const poses=[
 [[0,-.22,1.16,.30,-.72,.64,.28,-.32,.02],[.12,-.28,1.25,.27,-.80,.53,.28,-.40,.03],[.38,.08,1.12,.49,.30,.25,.92,.20,.10],[.66,.22,1.05,.40,.86,.28,.42,.38,.08],[1,-.10,1.15,.22,0,-.28,.96,0,0]],
 [[0,.20,1.05,.35,.85,.32,.42,.32,.04],[.12,.25,1.10,.33,.91,.25,.33,.39,.02],[.40,-.13,1.34,.48,-.43,.37,.82,-.22,-.04],[.67,-.27,1.44,.33,-.80,.55,.25,-.38,-.05],[1,-.10,1.15,.22,0,-.28,.96,0,0]],
 [[0,-.18,1.25,.30,-.52,.80,.30,-.20,-.03],[.18,-.27,1.64,.24,-.46,.84,.28,-.34,-.13],[.40,-.10,.99,.56,.25,-.18,.95,.25,.30],[.59,.08,.94,.48,.63,-.13,.76,.32,.20],[1,-.10,1.15,.22,0,-.28,.96,0,0]]
 ];
 function sample(hit,q){hit=Math.max(0,Math.min(2,hit|0));q=Math.max(0,Math.min(1,q));const k=curve(q,poses[hit]),axis=k.slice(3,6),l=Math.hypot(...axis);for(let i=0;i<3;i++)axis[i]/=l;
  // Blade extends along local +X, perpendicular to the shaft. Orient it outward,
  // away from the body, rather than letting the hooked edge spin through the face.
  let x=[axis[2],0,-axis[0]],xl=Math.hypot(...x);x=x.map(n=>n/xl);const z=[x[1]*axis[2]-x[2]*axis[1],x[2]*axis[0]-x[0]*axis[2],x[0]*axis[1]-x[1]*axis[0]];
  const grip=k.slice(0,3),point=(shaft,blade)=>grip.map((v,i)=>v+axis[i]*shaft+x[i]*blade);
  return {hit,q,weight:smooth(q/.065)*(1-smooth((q-.73)/.27)),grip,axis,x,z,torso:[k[7],k[6],hit===2?.025:0],head:[-k[7]*.35,-k[6]*.32,0],tip:point(.866585,1.037542),heel:point(1.19,.10),duration:durations[hit],active:active[hit]};
 }
 function render(hit,q,d){const {trail,glow,arc,line,col,hot,a,detail=48}=d,offset=d.frame?.offset||d.offset||[0,0,0],event=d.event||{},frame=d.frame,angle=frame?(frame.yaw||0)-(event.yaw||0):0,c=Math.cos(angle),sn=Math.sin(angle),ey=event.yaw||0,dx=frame?(frame.x||0)-(event.x||0):0,dz=frame?(frame.z||0)-(event.z||0):0,move=[dx*Math.cos(ey)-dz*Math.sin(ey),frame?(frame.y||0)-(event.y||0):0,dx*Math.sin(ey)+dz*Math.cos(ey)],follow=p=>[p[0]*c+p[2]*sn+move[0],p[1]+move[1],p[2]*c-p[0]*sn+move[2]];if(q<.10||q>=1)return;const tail=hit===2?.25:.22,start=Math.max(.10,q-tail),end=Math.min(q,hit===2?.61:.69);const count=detail>=40?32:18;
  if(end>start){for(let layer=0;layer<3;layer++){const points=[],widths=[];for(let i=0;i<=count;i++){const t=i/count,s=sample(hit,start+(end-start)*t),p=s.tip.map((v,j)=>20*(v+offset[j])+(s.heel[j]-s.tip[j])*layer*1.8);points.push(follow(p));widths.push((.45+2.5*Math.sin(Math.PI*t)**.6)*(1-layer*.22));}trail(points,widths,layer===0?hot:col,a*(layer===0?.86:.38));}
  // Sparse little soul embers peel off the edge, not three unrelated orbiting rings.
  for(let j=0;j<(detail>=40?7:4);j++){const t=(j+.4)/7,s=sample(hit,start+(end-start)*t),p=s.tip.map((v,i)=>20*(v+offset[i])+(i===1?(q-start)*j*7:0));glow(follow(p),.75+(j%3)*.2,j%2?col:hot,a*.38);}}
  if(hit===2&&q>.36){const t=(q-.36)/.64,alpha=Math.sin(Math.PI*t)*(1-t)*.64;arc(16+130*t,0,-Math.PI,Math.PI,col,alpha,2.1,detail>=40?64:36);arc(13+124*t,.4,-Math.PI,Math.PI,hot,alpha*.4,.7,detail>=40?48:28);for(let j=0;j<8;j++){const th=j*Math.PI/4,r=17+130*t;line([Math.sin(th)*r,0,Math.cos(th)*r],[Math.sin(th)*(r+4),2,Math.cos(th)*(r+4)],.8,col,alpha*.45);}}
 }
 const api={sample,render,durations,active,publish,frame,clear:id=>frames.delete(id)};root.BFReaperCombo=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
