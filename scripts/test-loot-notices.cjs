/* Presentation queue behavior with a minimal DOM; no rendering claim. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function element(id){if(elements.has(id))return elements.get(id);const e={hidden:true,textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},toggle(){},contains(){return false;}},append(){},after(){},addEventListener(){},setAttribute(){},getBoundingClientRect:()=>({left:0,right:250,top:400,bottom:700,height:100}),matches:()=>false,contains:()=>false,querySelector:s=>element(id+' '+s)};elements.set(id,e);return e;}
const ctx={window:{addEventListener(){}},document:{getElementById:element,createElement:()=>element('created-'+elements.size),body:{classList:{add(){}},style:{setProperty(){}}}},ResizeObserver:class{observe(){}},innerWidth:1280,innerHeight:720};
element('lvlbadge').parentElement=element('identityClassRow');ctx.document.body.append=()=>{};
vm.runInNewContext(fs.readFileSync('public/3d/adventure-hud.js','utf8'),ctx);const hud=ctx.window.BFAdventureHud,g={},panel=element('equipmentFeed');hud.mount({bag(){},toggleSell(){},journal(){},hint:()=> 'I'});
const a={name:'Sword',rarity:'rare',dmg:40,cd:.5},b={name:'Shield',rarity:'rare',defense:8};
const notice=(item,extra={})=>({item,kind:item===a?'weapon':'armor',equipped:{dmg:20,cd:.6},rarity:{name:'Rare'},type:'Equipment',...extra});
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
check('Blocked item shows its identity and truthful outcome',()=>{hud.show(notice(a,{blocked:true}),g);hud.tick(.1,true,g);assert.equal(panel.querySelector('.loot-name').textContent,'Sword');assert.equal(panel.querySelector('.loot-outcome').textContent,'Bag full · still on the ground');});
check('Collecting the same item immediately replaces the blocked outcome',()=>{hud.show(notice(a),g);assert.equal(panel.querySelector('.loot-outcome').textContent,'Added to bag');});
check('Repeated notices for a queued item collapse into its latest outcome',()=>{hud.show(notice(b,{blocked:true}),g);hud.show(notice(b,{sold:true,gold:80}),g);hud.tick(11,true,g);hud.tick(.1,true,g);assert.equal(panel.querySelector('.loot-name').textContent,'Shield');assert.equal(panel.querySelector('.loot-outcome').textContent,'Auto-sold · +80 gold');assert.equal(panel.querySelector('.loot-waiting').textContent,'');});
check('Journal retains priority on a short screen without consuming the pending notice',()=>{element('journalNotice').hidden=false;hud.tick(20,true,g);assert(panel.hidden);element('journalNotice').hidden=true;hud.tick(.1,true,g);assert(!panel.hidden);assert.equal(panel.querySelector('.loot-name').textContent,'Shield');});
check('Current rebound bag key is reflected in the notice',()=>assert.equal(panel.querySelector('[data-loot-bag]').textContent,'I · Bag'));
check('Changing scenes clears prior loot and queued outcomes',()=>{hud.tick(.1,true,{});assert(panel.hidden);});
console.log(JSON.stringify({checks,passed:true,scope:'Presentation logic only; visual and live browser checks required.'}));
