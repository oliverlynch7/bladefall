/* Choose from discovered notes only. Never manufacture or reveal a hidden clue. */
(function(root){'use strict';
const puzzles=[
 ['woods.signal','woods.signal'],['woods.rescue','woods.rescue'],['lc.rail','lc.rail'],['lc.water','lc.water'],['lc.wagon','lc.wagon'],
 ['rk.wheel','rk.cells'],['rk.key','rk.cells'],['kd.hidden','kd.marks'],['gf.pressure','gf.pressure'],['gf.passage','gf.passage'],
 ['sc.hull','sc.hull'],['sc.code','sc.code'],['sc.memorial','sc.record'],['tc.wind','tc.wind'],['tc.cave','tc.cave'],['tc.shackle','tc.hydra'],
 ['sl.vow.0','sl.stand.0'],['sl.vow.1','sl.stand.1'],['sl.vow.2','sl.stand.2'],['cg.catch.east','cg.catch.east'],
 ['cg.bridge','cg.catch.west'],['cg.catch','cg.catch.west'],['la.lower','la.notice'],['la.upper','la.notice'],['dr.winch','dr.beam'],['dr.brace','dr.frame'],
 ['home.bell','home.bells'],['home.grain','home.grain'],['home.orchard','home.orchard'],['woods.track','woods.tracks'],
 ['hp.weight','hp.bridge'],['hp.brake','hp.bridge'],['hp.code','hp.code'],
 ['kd.lift','kd.lift'],['kd.depth','kd.depth'],['kd.drain','kd.drain'],
 ['ff.reflect','ff.reflect'],['ff.marker','ff.camp'],['ic.lock','ic.lock'],['ic.channel','ic.channel'],
 ['ih.line','ih.order'],['ih.brace','ih.order'],['gf.cool','gf.pipes'],['gf.cache','gf.cache'],['gf.pet','gf.cage'],
 ['pc.mirror','pc.mirrors'],['sl.shelf','sl.shelf.guide'],['sl.display','sl.display'],['la.vault','la.vault'],['tc.tide','tc.tide']
];
function related(g,target){
 const notes=g?.storyState?.notes||{},p=g?.p;if(!p)return null;
 const candidates=[];for(const o of g.storyObjects||[]){const pair=puzzles.find(([prefix])=>o.key===prefix||o.key.startsWith(prefix+'.'));const id=pair?.[1]||[o.key,o.key.replace(/\.(?:note|clue)$/,'')].find(k=>notes[k]);if(!id||!notes[id])continue;const distance=Math.hypot(o.x-p.x,o.z-p.z),height=Math.abs((o.y||0)-p.y);if(distance<400&&height<90)candidates.push({id,distance});}
 if(candidates.length)return candidates.sort((a,b)=>a.distance-b.distance)[0].id;
 const clue=target?.clueId;if(clue&&notes[clue])return clue;
 const pair=puzzles.find(([prefix])=>target?.key===prefix||target?.key?.startsWith(prefix+'.'));return pair&&notes[pair[1]]?pair[1]:null;
}
function search(notes,query){const words=String(query||'').toLowerCase().trim().split(/\s+/).filter(Boolean);return notes.filter(n=>words.every(word=>(n.title+' '+n.text).toLowerCase().includes(word)));}
const api={related,search};root.BFJournalClues=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
