const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n');let checks=0;
const ok=(v,n)=>{assert(v,n);checks++;};
function fn(n){const a=src.indexOf('function '+n+'('),b=src.indexOf('\nfunction ',a+12);assert(a>=0);return src.slice(a,b);}
function node(){const set=new Set();return {style:{},classList:{add:k=>set.add(k),remove:k=>set.delete(k),contains:k=>set.has(k),toggle:(k,v)=>v?set.add(k):set.delete(k)},setAttribute(){},hidden:false};}
for(const dpr of [.5,.66,1,1.25,1.5,2])for(const guest of [false,true]){
 const prompt=node(),button=node(),quest=node(),tag=node(),box=node(),n={id:'quartermaster',name:'Quartermaster',x:0,z:0,prop:'board'};
 tag.querySelector=s=>s==='.hq'?quest:null;box.children=[tag];box.childElementCount=1;
 let projected;const c={G:{hub:true,hubNpcs:[n],p:{x:0,z:0},interact:{anchorNpc:n,x:0,y:142,z:0,label:'Talk to Quartermaster',service:'Equipment'}},mode:'play',DPR:dpr,MP:{active:true,isHost:!guest},meta:{},HUB_TAG_NEAR:72,HUB_TAG_HEIGHT:{board:92},
  window:{__npc3dAnchor:()=>({x:13,y:80,z:0})},BFHubDialogue:{known:()=>false},returnHubInfo:()=>({fresh:true}),dXZ:()=>10,project:(x,y,z)=>{projected={x,y,z};return [640,360];},controlHint:()=> 'F',htmlSafe:s=>s,
  document:{getElementById:id=>({interactprompt:prompt,bInteract:button,hubtags:box})[id]}};
 vm.createContext(c);for(const name of ['npcLabelAnchor','updateInteractPrompt','hubTagAnchor','updateHubTags'])vm.runInContext(fn(name),c);
 c.updateInteractPrompt();ok(prompt.style.left===undefined&&prompt.style.top===undefined,'action dock is independent of projection at '+dpr+' guest='+guest);ok(prompt.innerHTML.includes('Talk to Quartermaster'),'dock identifies current target');ok(prompt.innerHTML.includes('F'),'rebound interaction key retained');
 c.updateHubTags();ok(tag.style.display==='none'&&prompt.innerHTML.includes('npcquest'),'focused quest badge merges into interaction pill');c.G.interact.anchorNpc=null;c.updateHubTags();ok(tag.style.left==='640px'&&tag.style.top==='346px','quest marker uses same CSS projection');ok(projected.x===13&&projected.y===98&&!quest.hidden,'quest attaches above rendered actor');
 c.G.interact.anchorNpc=n;c.window.__npc3dAnchor=()=>null;c.updateInteractPrompt();ok(prompt.innerHTML.includes('Talk to Quartermaster'),'dock remains available while model loads');
 c.mode='upgrade';c.updateInteractPrompt();ok(prompt.classList.contains('hide'),'prompt hidden in menus');
 c.mode='play';c.project=()=>null;c.updateInteractPrompt();c.updateHubTags();ok(!prompt.classList.contains('hide')&&tag.style.display==='none','behind-camera world marker hides; reachable nearby action stays stable');
}
{
 const c={VW:1280,VH:720,DPR:2,PROJ:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],VIEW:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]};vm.createContext(c);vm.runInContext(fn('mMul')+fn('project'),c);
 for(const d of [.66,1,2]){c.DPR=d;const p=c.project(.5,-.5,0);ok(p[0]===960&&p[1]===540,'actual projection is CSS-sized independent of render density');}
}
{
 const world={},anchor={x:13,y:80,z:22},r={labelWorld:world,labelAnchor:anchor},c={window:{__BF3:{G:world}},records:new Map([['anvil',r]]),visible:new Set(['anvil'])};vm.createContext(c);
 const npc=fs.readFileSync('public/3d/npc3d.js','utf8');vm.runInContext(npc.slice(npc.indexOf('window.__npc3dAnchor=')),c);
 ok(c.window.__npc3dAnchor('smith')===anchor,'renderer anchor supports existing smith alias');c.window.__BF3.G={};ok(c.window.__npc3dAnchor('anvil')===null,'previous world anchor never reused');c.window.__BF3.G=world;c.visible.clear();ok(c.window.__npc3dAnchor('anvil')===null,'hidden/unloaded body falls back');
}
ok(src.includes('updateHubTags();\n  updateInteractPrompt();'),'prompt refreshed beside tags after current camera projection');
ok(src.includes('anchorNpc:(G.storyNpcs||[]).includes(o)?o:null'),'campaign NPC prompts also receive body anchor');
ok(src.includes('x:p[0],y:p[1]'),'chess/social DOM adapter obeys CSS coordinate contract');
for(const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(JSON.stringify({checks,passed:true,renderDpr:[.5,.66,1,1.25,1.5,2],roles:['host','guest']}));
