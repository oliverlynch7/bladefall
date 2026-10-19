// Visual actors belong to one authored scene; chess must never mutate its roster.
export function waystationScene(g){return !!(g?.hub&&!g.riftHall&&!g.sparringRoom&&!g.arena&&!g.devKeep&&!g.trial&&!g.delve&&!g.endless&&!g.side&&!g.bossRush);}
export function thomasScene(g,campaign=false){return !!(waystationScene(g)||g?.devBriar?.part===0||campaign&&g?.zone===0&&g.area===0&&!g.hub&&!g.devKeep&&!g.trial&&!g.side&&!g.arena&&!g.delve&&!g.endless&&!g.bossRush&&!g.bonusActive);}
export function npcSceneKey(g){return g?[g.zone,g.area,g.stageIndex,g.areaSeed,g.hub,g.riftHall,g.sparringRoom,g.trial,g.side,g.arena,g.delve,g.floor,g.devKeep?.id].join('|'):'';}
export function npcEntries(g,{campaign=false,thomasPose=null}={}){
 if(!g)return [];
 const hub=waystationScene(g);
 const source=g.devKeep?[...(g.devKeep.actors||[])]:g.hub?[...(g.hubNpcs||[])]:g.storyNpcs?.length?[...g.storyNpcs,...(g.canyonPrisoners||[]),...(g.keepPrisoners||[]),...(g.ironWorkers||[]),...(g.ascentWorkers||[])]:g.npc?[{...g.npc,id:'shade'}]:[];
 if(hub&&thomasPose&&!source.some(n=>n.id==='thomas'))source.push({id:'thomas',x:thomasPose.x,y:thomasPose.y||0,z:thomasPose.z});
 if(g.riftSpirit&&!source.some(n=>n.id==='riftkeeper'))source.push(g.riftSpirit);
 const seen=new Set();return source.filter(n=>{
  if(!n?.id||n.hidden||n.dead||!Number.isFinite(n.x)||!Number.isFinite(n.z)||seen.has(n.id)||['sunspire_orb','abyss_king'].includes(n.id))return false;
  if(n.id==='thomas'&&!thomasScene(g,campaign))return false;
  seen.add(n.id);return true;
 });
}

if(typeof window!=='undefined')window.BFNpcRoster={thomasScene};
