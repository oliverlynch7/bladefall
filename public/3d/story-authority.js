/* Shared authored story actions: the host supplies actor identity and world positions. */
(function(root){
 'use strict';
 function apply(state,book,request,context){
  const fail=()=>({state,changed:false});
  if(!request||request.epoch!==context.epoch||!context.actor||!context.alive)return fail();
  const event=request.event;if(!event)return fail();
  if(event.type==='choose'&&state.conversation?.owner!==context.actor)return fail();
  if(event.type==='open'||event.type==='world'){
   if(state.conversation||!context.canInteract)return fail();
   const target=event.type==='open'?context.npcs.find(n=>n.id===event.npc):context.objects.find(o=>o.key===event.key);
   if(!target||target.available===false)return fail();
   if(target.bounds){const b=target.bounds,p=context.position;if(!p||p.x<b.minX||p.x>b.maxX||p.z<b.minZ||p.z>b.maxZ)return fail();}
   const p=context.position;if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.hypot(p.x-target.x,p.z-target.z)>(target.range||115)||Math.abs((p.y||0)-(target.y||0))>65)return fail();
  }
  const result=root.BFStoryState.transact(state,book,event);if(!result.changed)return result;
  if(event.type==='open'){result.state.conversation.owner=context.actor;result.state.conversation.origin={x:context.position.x,y:context.position.y||0,z:context.position.z};}
  for(const [id,reward]of Object.entries(result.state.rewards))if(!state.rewards[id])reward.recipients=[...new Set(context.party)];
  return result;
 }
 root.BFStoryAuthority={apply};if(typeof module!=='undefined'&&module.exports)module.exports=root.BFStoryAuthority;
})(typeof window!=='undefined'?window:globalThis);
