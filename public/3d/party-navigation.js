/* Main-story destinations only: never reveal optional shards or puzzle answers. */
(function(root){'use strict';
function target(g){
 if(!g||g.hub||g.trial||g.side||g.voyage)return null;
 const s=g.storyState||{},f=s.flags||{},i=s.items||{},q=s.quests||{};
 const obj=k=>(g.storyObjects||[]).find(o=>o.key===k),npc=k=>(g.storyNpcs||[]).find(o=>o.id===k);
 const nearest=a=>a.filter(Boolean).sort((a,b)=>Math.hypot(a.x-g.p.x,a.z-g.p.z)-Math.hypot(b.x-g.p.x,b.z-g.p.z))[0];
 const exit=()=>g.portal||g.goalPos;
 const first=rows=>{for(const [done,key]of rows)if(!f[done])return key[0]==='@'?npc(key.slice(1)):obj(key);return exit();};
 let t;
 if(g.area<0){t=g.marbleArena&&f['mc.defeated']&&!f['mc.answer']?npc('sunspire_orb'):g.boss&&!g.boss.dead?g.boss:exit();}
 else switch(g.zone+':'+g.area){
 case '0:0':t=!f['thomas.ready']?npc('thomas'):!f['mara.healing']?(q['briar.supplies']!=='active'?npc('mara'):(i.tangle_root||0)<3||(i.dressings||0)<1?nearest((g.storyObjects||[]).filter(o=>!f['event.'+o.key]&&(/root/.test(o.key)&&(i.tangle_root||0)<3||/dressing/.test(o.key)&&(i.dressings||0)<1))):npc('mara')):q['briar.escape']!=='active'&&!f['briar.depart']?npc('mara'):first([['briar.water','briar.water'],['briar.jam','briar.jam'],['briar.bridge','briar.bridge'],['briar.depart','briar.depart']]);break;
 case '0:1':t=!f['woods.ready']?npc('lewis'):!f['woods.signal']?nearest([obj('woods.signal.crank'),obj('woods.signal.cable')]):exit();break;
 case '1:0':t=first([['hp.trail','@caleb'],['hp.orders','hp.orders'],['hp.bridge','hp.bridge.clue'],['hp.descent','hp.lift']]);break;
 case '1:1':t=!f['lc.entry']?obj('lc.gate'):!f['lc.rescue']?npc('ruth'):!f['lc.south']||!f['lc.north']?nearest(['south','north'].filter(k=>!f['lc.'+k]).map(k=>obj('lc.cage.'+k))):first([['lc.alarm','lc.alarm'],['lc.escape','lc.escape']]);break;
 case '2:0':t=first([['rk.help','@grant'],['rk.arrow','rk.arrow'],['rk.gate','rk.gate'],['rk.breach.start','rk.breach'],['rk.breach.done','rk.breach'],['rk.cells','rk.wheel']]);break;
 case '2:1':t=first([['kd.roster','kd.roster'],['kd.hidden','kd.hidden'],['kd.free','kd.free'],['kd.papers','kd.papers'],['kd.lift.open','kd.lift.note'],['kd.transfer','kd.lift.note']]);break;
 case '3:0':t=first([['ff.trail','ff.trail'],['ff.heath','@heath'],['ff.part','ff.part'],['ff.heater','@heath'],['ff.reflect.open','ff.reflect.clue'],['ff.cave','ff.cave']]);break;
 case '3:1':t=first([['ic.pages','ic.pages'],['ic.free','ic.free'],['ic.ellis.met','@ellis'],['ic.notes','ic.notes'],['ic.ellis.lead','@ellis'],['ic.lock.open','ic.lock.clue']]);break;
 case '4:0':t=first([['ih.flint.met','@flint'],['ih.workers.safe','ih.workers'],['ih.jack.met','@jack'],['ih.handles','ih.handles'],['ih.cart','@jack'],['ih.line.open','ih.plate']]);break;
 case '4:1':t=!f['gf.access']?(f['gf.alarm']?obj('gf.gate'):npc('pike')):!f['gf.martin.met']?npc('martin'):!f['gf.evacuated']?(!f['gf.passage']?obj('gf.passage'):f['gf.quiet']&&!f['gf.transport']?obj('gf.transport'):nearest([obj('gf.workbell'),obj('gf.shelterbell')].filter(o=>o&&!f['event.'+o.key]))):first([['gf.cool.open','gf.pipes'],['gf.writings','gf.writings'],['gf.route','@martin']]);break;
 case '5:0':t=!f['sc.met']?npc('otto'):!f['sc.boat.ready']?nearest(['rudder','sail','rope'].filter(k=>!f['sc.installed.'+k]).map(k=>i['sc.'+k]>0?npc('otto'):k==='rope'&&!f['sc.drain']?obj('sc.drain'):k==='rope'&&!f['sc.latch']?obj('sc.latch'):obj('sc.'+k))):obj('sc.board');break;
 case '5:1':t=first([['tc.brake','tc.brake'],['tc.lift','tc.lift'],['tc.shackle','tc.shackle'],['tc.approach','tc.approach']]);break;
 case '6:0':t=!f['pc.met']?npc('grace'):!f['pc.clamp']?obj('pc.clamp'):!f['pc.court']?obj('pc.water'):!f['pc.west']||!f['pc.east']?nearest(['west','east'].filter(k=>!f['pc.'+k]).map(k=>obj('pc.'+k+(f['pc.'+k+'.lower']?'.upper':'.lower')))):first([['pc.light.open','pc.mirror.note'],['pc.ready','pc.enter']]);break;
 case '6:1':t=first([['sl.access','@hugh'],['sl.orders','sl.orders'],['sl.ready','sl.release']]);break;
 case '7:0':t=f['cg.entry']?exit():f['cg.alarm']?obj('cg.release'):!f['cg.met']?npc('roland'):!f['cg.bridge.open']?nearest(['catch.west','catch.east','bridge'].filter(k=>!f['cg.'+k]).map(k=>obj('cg.'+k))):!f['cg.disguise']?nearest(['coat','helmet','papers'].filter(k=>!(i['cg.'+k]>0)).map(k=>obj('cg.'+k)))||npc('roland'):first([['cg.orders','cg.orders'],['cg.bells','cg.bells']])||npc('cross');if(f['cg.disguise']&&f['cg.orders']&&f['cg.bells']&&!f['cg.entry']&&!f['cg.alarm'])t=npc('cross');break;
 case '7:1':t=first([['la.lower','la.lower'],['la.upper','la.upper'],['la.summit','la.summit']]);break;
 }
 return t&&Number.isFinite(t.x)&&Number.isFinite(t.z)?t:null;
}
function keyCode(e){if(e.code&&e.code!=='Unidentified')return e.code;const k=e.key||'';return /^[a-z]$/i.test(k)?'Key'+k.toUpperCase():/^\d$/.test(k)?'Digit'+k:k===' '?'Space':k;}
root.BFPartyNavigation={target,keyCode};
})(window);
