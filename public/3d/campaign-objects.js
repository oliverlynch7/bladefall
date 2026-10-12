/* Explicit art assignments: a book-shaped trigger is not necessarily a book. */
(function(root){
 'use strict';
 const props={};
 const set=(keys,model,extra={})=>keys.split(' ').forEach(key=>props[key]={model,...extra});
 set('home.orchard.clue home.grain.clue hp.orders ff.trail cg.orders cg.bells cg.store.note cg.balcony.note la.notice la.orders','notice');
 set('hp.bridge.clue hp.code.clue kd.lift.note kd.depth.note ic.lock.clue ic.channel.clue ih.plate gf.schedule gf.pipes gf.cache','diagram');
 set('home.bell.clue woods.tracks.clue kd.marks kd.drain.note pc.memorial tc.tide.note la.memorial.note','stone');
 set('pc.mirror.note','sunstone');
 set('lc.orders kd.roster kd.papers ic.pages cg.papers sl.orders','papers');
 set('ff.camp gf.writings sc.record sc.hull.note sl.display.clue la.vault.note sl.history sl.shelf.clue','book');
 set('ff.reflect.clue tc.wind.note','trail');
 set('briar.root.1 briar.root.2 briar.root.3','herbs',{pickup:true});
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
 function spec(o){return o&&props[o.key]||null;}
 function taken(o,state){const d=spec(o),f=state?.flags||{};return !!(d?.pickup&&(f['event.'+o.key]||f[d.taken||o.key]));}
 function drawn(o){return !!(root.HERO3D?.on&&root.__campaignObjectDrawn?.has(o));}
 function anchor(o){const d=spec(o);return d?({notice:94,diagram:94,trail:94,stone:82,sunstone:82,book:72,papers:72}[d.model]||62):62;}
 root.BFCampaignObjects={props,spec,taken,drawn,anchor};
 if(typeof module!=='undefined')module.exports=root.BFCampaignObjects;
})(typeof window!=='undefined'?window:globalThis);
