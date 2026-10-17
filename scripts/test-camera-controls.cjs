const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const C=require('../public/3d/camera-controls.js');let checks=0;
const ok=(v,m)=>{assert(v,m);checks++;};
for(const mode of ['fps','shoulder','far']){
 const meta={camMode:mode};ok(C.fov(meta)===92&&C.zoom(meta)===1,'old profiles use default framing');
 C.wheel(meta,-100);ok(mode==='fps'?C.fov(meta)<92:C.zoom(meta)>1,'scroll up zooms in');
 for(let i=0;i<200;i++)C.wheel(meta,-100);ok(mode==='fps'?C.fov(meta)===70:C.zoom(meta)===(mode==='far'?1.5:1.4),'inward bound');
 for(let i=0;i<200;i++)C.wheel(meta,100);ok(mode==='fps'?C.fov(meta)===115:C.zoom(meta)===(mode==='far'?.7:.75),'outward bound');
 ok(!C.wheel(meta,NaN),'invalid wheel delta ignored');
}
const meta={camMode:'shoulder'};C.wheel(meta,-100);const shoulder=meta.shoulderZoom;meta.camMode='far';C.wheel(meta,100);ok(meta.shoulderZoom===shoulder,'view zoom values independent');
const x={camMode:'fps'},y={camMode:'fps'};C.wheel(x,16);C.wheel(y,1,1);ok(x.fpsFov===y.fpsFov,'line/pixel wheel units normalized');
(async()=>{
 const code=fs.readFileSync('public/3d/first-person-appearance3d.js','utf8'),{weaponOnly}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const root={children:[]},node=(parent,extra={})=>{const n={parent,children:[],visible:true,userData:{},...extra};parent.children.push(n);return n;};
 const body=node(root,{isMesh:true}),hidden=node(root,{isMesh:true,visible:false}),bone=node(root,{isBone:true,name:'WeaponR'}),stock=node(bone,{isMesh:true}),attachment=node(root,{userData:{_weap:true}}),weapon=node(attachment,{isMesh:true}),aura=node(root,{isPoints:true}),peer={visible:true};
 root.traverse=fn=>{const walk=n=>{fn(n);n.children.forEach(walk);};walk(root);};
 const restore=weaponOnly(root);ok(!body.visible&&!aura.visible,'body and cosmetic renderables hidden');ok(stock.visible&&weapon.visible&&bone.visible,'stock and equipped weapons preserve bone transforms');ok(peer.visible,'other actor untouched');restore();ok(body.visible&&aura.visible&&!hidden.visible,'authored visibility restored exactly');
 const game=fs.readFileSync('public/3d/index.html','utf8');for(const m of game.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
 ok(game.includes("'shoulderZoom','overheadZoom'"),'zoom saved in global preferences');ok(game.includes("e.target!==canvas&&document.pointerLockElement!==canvas"),'wheel leaves menu scrolling alone');
 console.log(`${checks} camera and local appearance regression checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
