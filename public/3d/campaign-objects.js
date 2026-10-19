/* Explicit art assignments: a book-shaped trigger is not necessarily a book. */
(function(root){
 'use strict';
 const props={};
 const set=(keys,model,extra={})=>keys.split(' ').forEach(key=>props[key]={model,...extra});
 set('home.orchard.clue home.grain.clue hp.orders ff.trail cg.orders cg.bells cg.store.note cg.balcony.note la.notice la.orders','notice');
 set('briar.mill.note hp.bridge.clue hp.code.clue kd.lift.note kd.depth.note ic.lock.clue ic.channel.clue ih.plate gf.schedule gf.pipes gf.cache','diagram');
 set('home.bell.clue woods.tracks.clue kd.marks kd.drain.note pc.memorial tc.tide.note la.memorial.note','stone');
 set('pc.mirror.note','sunstone');
 set('lc.orders kd.roster kd.papers ic.pages cg.papers sl.orders','papers');
 set('ff.camp gf.writings sc.record sc.hull.note sl.display.clue la.vault.note sl.history sl.shelf.clue','book');
 set('ff.reflect.clue tc.wind.note','trail');
 set('briar.root.1 briar.root.2 briar.root.3','herbs',{pickup:true});
 set('home.bell.cache home.grain.cache home.orchard.cache','coin-coffer',{currencyOnly:true});
 // Authored containers reflect their actual contents, not an inferred rarity from their name.
 set('lc.cache','coin-coffer',{currencyOnly:true,size:1.55});
 const chest=(keys,rarity,extra={})=>set(keys,'treasure-chest',{chest:true,rarity,size:3,...extra});
 chest('hp.code.claim','uncommon',{size:2});
 chest('kd.cache','rare',{size:2,owner:'prison-cache'});
 chest('ff.cache','common',{contents:'Winter Cloak'});
 chest('gf.cache.release','common',{contents:'Rift Shard',size:3.5,offsetX:'boxX'});
 chest('sc.code.note sc.code.claim','rare',{visualKey:'stormshot-chest',openKey:'sc.code.claim',size:2.5});
 chest('rv.pattern.take','common',{contents:'Smith’s pattern'});
 set('briar.dressings','bandages',{pickup:true});
 set('briar.gus.tools','tools',{pickup:true});
 set('rk.tools','tools',{pickup:true,support:'crate',taken:'rk.tools'});
 set('hp.rope ic.rope sc.rope','rope',{pickup:true});
 set('ff.part','coil',{pickup:true,support:'crate',taken:'ff.part'});
 set('ic.notes','pack',{pickup:true,taken:'ic.notes'});
 set('ih.handles','handles',{pickup:true,support:'crate',taken:'ih.handles'});
 set('ih.blank','blade',{pickup:true,support:'bench',taken:'ih.blank'});
 set('sc.rudder','rudder',{pickup:true});
 set('sc.sail','sail',{pickup:true});
 set('sc.bell','bell',{pickup:true});
 set('tc.sail','cape',{pickup:true,support:'crate',taken:'tc.sail'});
 set('pc.seeds','seeds',{pickup:true});
 // Semantic assignments, reviewed against actual quest actions; never infer art from "lever".
 const mechanism=(keys,model,extra={})=>set(keys,'mechanism-'+model,{mechanism:true,...extra});
 mechanism('hp.cart.push','cart-grip');
 mechanism('kd.return','keepsake');
 mechanism('hp.windbreak hp.quiet lc.side ic.hugo.rope','rope-cleat');
 mechanism('lc.gate rk.gate rk.wall kd.hidden kd.free ic.free ih.workers gf.gate gf.passage gf.pet.release sc.latch tc.approach sl.maintenance','latch');
 mechanism('lc.force lc.escape','chain');
 mechanism('woods.signal.crank woods.rescue.release home.orchard.wheel hp.lift ff.lift ih.return tc.brake tc.lift tc.cave.help cg.release la.lower la.upper la.cells','winch');
 mechanism('hp.code.release lc.rail.release kd.press.brake ff.camp.release gf.transport la.vault.brake pc.west.upper pc.east.upper','brake');
 mechanism('rv.pattern.clamp','clamp');
 mechanism('pc.clamp','clamp',{pickup:true});
 mechanism('pc.water pc.west.lower pc.east.lower pc.garden.water rv.pattern.cool','sluice');
 mechanism('gf.pressure gf.pet.feed sc.drain','valve');
 mechanism('gf.fault','pipe-fault');
 mechanism('ic.hugo.brace tc.brace','brace');
 mechanism('ic.hugo.find','rescue-horn');
 mechanism('ff.reflect.3 ic.channel.plug','anchor');
 mechanism('tc.shackle','shackle');
 mechanism('pc.enter sl.release la.summit','sun-seal');
 mechanism('pc.enter','sun-seal',{owner:'sun-receiver'});
 mechanism('sl.shelf.0 sl.shelf.1','shelf-crank');
 mechanism('sl.vow.0 sl.vow.1 sl.vow.2','archive');
 set('rk.key','mechanism-key',{mechanism:true,pickup:true,taken:'rk.key'});
 set('sl.records','papers');
 set('dr.clue rv.pattern.note rv.supplies.note','diagram');
 mechanism('rv.supplies.release','brake');
 function spec(o){return o&&props[o.key]||null;}
 function taken(o,state){const d=spec(o),f=state?.flags||{};return !!(d?.pickup&&(f['event.'+o.key]||f[d.taken||o.key]));}
 function drawn(o){return !!(root.HERO3D?.on&&root.__campaignObjectDrawn?.has(o));}
 function anchor(o){const d=spec(o);return d?({notice:94,diagram:94,trail:94,stone:82,sunstone:82,book:72,papers:72}[d.model]||62):62;}
 root.BFCampaignObjects={props,spec,taken,drawn,anchor};
 if(typeof module!=='undefined')module.exports=root.BFCampaignObjects;
})(typeof window!=='undefined'?window:globalThis);
