const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/camera-occlusion.js','utf8'),c);
const C=c.window.BFCameraOcclusion;let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
// Actual mill-body bounds and on-foot position from the normal campaign run.
const world={obstacles:[{x:300,z:-1825,w:110,d:90,h:135}]},target={x:288.8,y:34,z:-1898.87},desired={x:288.8,y:296,z:-1568.87};
const old=C.constrain(world,target,desired),fixed=C.overview(world,target,desired);
ok(old.y<50,'reproduces lens inside the hero beside the mill');
ok(fixed.steep&&fixed.y-target.y>=76,'steeper overview keeps lens above the head');
ok(C.constrain(world,target,fixed).fraction===1,'new lens remains on player side of solid geometry');
for(let x=210;x<=390;x+=10)for(let z=-1980;z<=-1880;z+=10){
 const t={x,y:34,z},d={x,y:296,z:z+330},v=C.overview(world,t,d);
 ok([v.x,v.y,v.z,v.fraction].every(Number.isFinite),'finite lens around wheel');
 ok(v.fraction>=0&&v.fraction<=1,'bounded camera fraction');
 if(v.steep)ok(v.look.x===v.x&&v.look.z<v.z,'steep fallback keeps north-up heading even while follow point lags');
}
const open=C.overview({},target,desired);ok(!open.steep&&open.fraction===1,'ordinary open-field framing unchanged');
const roof={cameraSolids:[{x:0,z:0,w:800,d:800,y0:90,h:110}]},t={x:0,y:34,z:0},d={x:0,y:296,z:330},under=C.overview(roof,t,d);
ok(under.y<83,'fallback cannot move above a solid ceiling');
ok(C.constrain(roof,t,under).fraction===1,'ceiling fallback stays on the original side');
const floor={obstacles:[{x:0,z:0,w:800,d:800,y0:-20,h:0}]};ok(C.overview(floor,t,d).fraction===1,'support floor does not retract camera');
ok(!C.blocks({p:{x:0,z:0,y:20},eye:{x:0,y:296,z:330}},floor.obstacles[0],-20,20,'far'),'standing platforms remain solid');
const src=fs.readFileSync('public/3d/index.html','utf8');
const card={textContent:'A lesson from the old room',classList:{remove(k){this.removed=k;}}},notice={document:{getElementById:()=>card},clearTimeout(t){notice.cancelled=t;},storyToast:{_t:19}};vm.createContext(notice);
vm.runInContext(src.slice(src.indexOf('function clearStoryNotice(){'),src.indexOf('function storyToast(line,icon){')),notice);notice.clearStoryNotice();
ok(notice.cancelled===19&&notice.storyToast._t===null,'departing notice timer cancelled');
ok(card.classList.removed==='show'&&card.textContent==='','faded notice no longer survives in accessibility content');
const pauseStart=src.indexOf('function beginPause(){'),pauseEnd=src.indexOf('\nfunction pauseCaption',pauseStart);
let suspended=0,cleared=0;const pctx={window:{BFAdventureHud:{shards(){cleared++;}},BFNarration:{stop(){}}},BFGuidedTutorial:{suspend(){suspended++;}},G:{p:{attackHeld:true,holdT:1}},input:{jumpEdge:true,dodgeEdge:true},releaseKeyboard(){},document:{getElementById(){return null;}}};vm.createContext(pctx);vm.runInContext(src.slice(pauseStart,pauseEnd),pctx);pctx.beginPause();
ok(suspended===1&&cleared===1,'menu entry hides tutorial/callout synchronously');
ok(!pctx.G.p.attackHeld&&!pctx.input.jumpEdge,'pause preserves input-release behavior');
for(const fn of ['trialComplete','openHub']){
 const at=src.indexOf('function '+fn+'('),end=src.indexOf('\nfunction ',at+1),code=src.slice(at,end);
 ok(code.includes('BFGuidedTutorial.stop();'),'tutorial retired at '+fn+' handoff');
}
const hpLine=src.split('\n').find(l=>l.includes("getElementById('hpnum').textContent="));
const hp={document:{getElementById:()=>hp.out},out:{},p:{hp:157.3},maxHp:157.3};vm.createContext(hp);vm.runInContext(hpLine,hp);ok(hp.out.textContent==='158 / 158','fractional full HP never exceeds displayed maximum');
hp.p.hp=999;vm.runInContext(hpLine,hp);ok(hp.out.textContent==='158 / 158','HUD bounds invalid over-max values without mutating the hero');
for(const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(checks+' journey camera, ceiling/floor, tutorial handoff and HP-display checks passed.');
