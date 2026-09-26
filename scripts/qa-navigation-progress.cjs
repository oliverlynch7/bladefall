async page=>{await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);return page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.introSeen=true;b.meta.dialogueTTS=false;let checked=0;const rows=[
[1,0,['hp.trail','hp.orders','hp.bridge']],
[1,1,['lc.entry','lc.rescue','lc.south','lc.north','lc.alarm']],
[2,0,['rk.help','rk.arrow','rk.gate','rk.breach.start','rk.breach.done']],
[2,1,['kd.roster','kd.hidden','kd.free','kd.papers','kd.lift.open']],
[3,0,['ff.trail','ff.heath','ff.part','ff.heater','ff.reflect.open']],
[3,1,['ic.pages','ic.free','ic.ellis.met','ic.notes','ic.ellis.lead']],
[4,0,['ih.flint.met','ih.workers.safe','ih.jack.met','ih.handles','ih.cart']],
[4,1,['gf.access','gf.martin.met','gf.passage','gf.evacuated','gf.cool.open','gf.writings']],
[5,1,['tc.brake','tc.lift','tc.shackle']],
[6,0,['pc.met','pc.clamp','pc.court','pc.west','pc.east','pc.light.open']],
[6,1,['sl.access','sl.orders']],
[7,0,['cg.met','cg.catch.west','cg.catch.east','cg.bridge.open','cg.disguise','cg.orders','cg.bells']],
[7,1,['la.lower','la.upper']]];
for(const [zone,area,flags]of rows){b.openHub();b.enterZone(zone);b.G.area=area;b.loadArea();for(const flag of flags){b.G.storyState.flags[flag]=true;const t=BFPartyNavigation.target(b.G);if(!t)throw Error(zone+':'+area+' missing target after '+flag);checked++;}}
b.openHub();b.enterZone(5);const s=b.G.storyState;s.flags['sc.met']=true;s.items['sc.rudder']=1;s.items['sc.sail']=1;s.items['sc.rope']=1;const boat=BFPartyNavigation.target(b.G);if(boat?.id!=='otto')throw Error('boat parts should point to turn-in');checked++;
b.openHub();b.enterZone(7);Object.assign(b.G.storyState.flags,{'cg.met':true,'cg.bridge.open':true});Object.assign(b.G.storyState.items,{'cg.coat':1,'cg.helmet':1,'cg.papers':1});if(BFPartyNavigation.target(b.G)?.id!=='roland')throw Error('disguise should point to tailor');checked++;
return {checked};});}
