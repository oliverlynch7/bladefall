const assert=require('node:assert/strict'),fs=require('node:fs');const M=require('../public/3d/render-motion.js');let checks=0;const ok=(b,m)=>{assert(b,m);checks++};
for(const hz of [60,75,120,144,165,240]){
 const p={x:0,y:0,z:0,yaw:Math.PI-.02},w={p};let time=0,acc=0,tick=0,last=-Infinity;
 for(let frame=0;frame<hz;frame++){time+=1/hz;acc+=1/hz;while(acc>=1/60){M.capture(w);tick++;p.x=tick*4;acc-=1/60;}
  const sim={...p},restore=M.begin(w,acc*60);const expected=Math.max(0,(time-1/60)*240);ok(Math.abs(p.x-expected)<1e-6,'constant speed interpolates at '+hz+'Hz');ok(p.x>=last-1e-8,'no reversal '+hz);last=p.x;restore();assert.deepEqual(p,sim);
 }
}
for(const variant of ['disabled','dead','downed','sitting','warp','teleport','world','player']){
 const p={x:0,y:0,z:0,yaw:0},w={p};M.capture(w);p.x=4;
 if(['dead','downed','sitting'].includes(variant))p[variant]=true;if(variant==='warp')p.warpSerial=1;if(variant==='teleport')p.x=500;if(variant==='player')w.p={...p};const target=variant==='world'?{p}:w,before={...target.p};M.begin(target,.5,variant!=='disabled')();assert.deepEqual(target.p,before);checks++;
}
const p={x:0,y:0,z:0,yaw:Math.PI-.02},w={p};M.capture(w);p.x=4;p.yaw=-Math.PI+.02;const saved={...p};try{const restore=M.begin(w,.5);try{ok(Math.abs(p.yaw-Math.PI)<1e-8,'short yaw arc');throw Error('render failed');}finally{restore();}}catch{}assert.deepEqual(p,saved);
for(const hz of [30,60,120,144,240]){let x=0;for(let i=0;i<hz;i++)x+=(1-x)*M.follow(.10,1/hz);ok(Math.abs(x-(1-Math.pow(.9,60)))<1e-9,'refresh-independent follow');}
const html=fs.readFileSync('public/3d/index.html','utf8');ok(html.includes('finally{restoreMotion();}'),'restoration in actual frame');ok(html.includes('gl.disable(gl.SCISSOR_TEST);gl.colorMask(true,true,true,true);gl.depthMask(true);'),'full-frame clear state');console.log(checks+' render interpolation, authority restoration, warp/menu/life exclusions and camera refresh checks passed.');
