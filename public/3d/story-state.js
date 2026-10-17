/* Authored story transactions. Runtime events carry IDs, never caller-supplied effects. */
(function(root){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v));
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  function create(){return {version:1,revision:0,flags:{},items:{},quests:{},notes:{},cursors:{},rewards:{},events:{},conversation:null};}
  function restore(value){
    const s=create();if(!value||value.version!==1)return s;
    for(const k of ['flags','items','quests','notes','cursors','rewards','events']){
      if(value[k]&&typeof value[k]==='object'&&!Array.isArray(value[k])){
        for(const [id,v] of Object.entries(value[k]))if(!['__proto__','constructor','prototype'].includes(id))s[k][id]=copy(v);
      }
    }
    s.revision=Number.isSafeInteger(value.revision)&&value.revision>=0?value.revision:0;
    // Opening a saved snapshot must never trap a player in a stale modal.
    return s;
  }
  function matches(s,conditions){return (conditions||[]).every(c=>{
    if(c.item)return (s.items[c.item]||0)>=(c.count||1);
    if(c.quest)return s.quests[c.quest]===c.is;
    if(c.flag)return !!s.flags[c.flag]===!!c.is;
    return false;
  });}
  function effects(s,list){
    for(const e of list||[]){
      if(!e.id||['__proto__','constructor','prototype'].includes(e.id))throw Error('Invalid effect key');
      switch(e.type){
        case 'conditional':if(matches(s,e.when))effects(s,e.effects);break;
        case 'flag':s.flags[e.id]=e.value!==false;break;
        case 'item':{
          if(!Number.isSafeInteger(e.amount))throw Error('Invalid item amount');
          const count=(s.items[e.id]||0)+e.amount;if(count<0)throw Error('Missing quest items');s.items[e.id]=count;break;
        }
        case 'counterweight':{
          if(!Array.isArray(e.weights)||!e.weights.every(n=>Number.isSafeInteger(n)&&n>0)||!Number.isInteger(e.index)||e.index<0||e.index>=e.weights.length||e.weights.length>8||!Number.isSafeInteger(e.target))throw Error('Invalid counterweight');
          if(s.flags[e.id+'.open'])break;
          const mask=(Number(s.items[e.id+'.mask'])||0)^(1<<e.index);
          s.items[e.id+'.mask']=mask;
          s.items[e.id]=e.weights.reduce((sum,w,i)=>sum+((mask&(1<<i))?w:0),0);
          if(s.items[e.id]===e.target)s.flags[e.id+'.open']=true;
          break;
        }
        case 'rotatePuzzle':{
          if(!Array.isArray(e.target)||!e.target.length||e.target.length>8||!e.target.every(n=>Number.isInteger(n)&&n>=0&&n<4)||!Number.isInteger(e.index)||e.index<0||e.index>=e.target.length)throw Error('Invalid rotating puzzle');
          if(s.flags[e.id+'.open'])break;
          const key=e.id+'.'+e.index;s.items[key]=((s.items[key]||0)+1)%4;
          s.items[e.id+'.turns']=(s.items[e.id+'.turns']||0)+1;
          if(e.target.every((n,i)=>(s.items[e.id+'.'+i]||0)===n))s.flags[e.id+'.open']=true;
          break;
        }
        case 'balanceBeam':{
          if(!Array.isArray(e.weights)||e.weights.length!==3||!e.weights.every(n=>Number.isSafeInteger(n)&&n>0)||!Number.isInteger(e.index)||e.index<0||e.index>2)throw Error('Invalid balance beam');
          if(s.flags[e.id+'.open'])break;
          const key=e.id+'.side.'+e.index;s.items[key]=((Number(s.items[key])||0)+1)%3;
          let left=0,right=0,hanging=0;
          e.weights.forEach((w,i)=>{const side=s.items[e.id+'.side.'+i]||0;if(side===1){left+=w;hanging++;}if(side===2){right+=w;hanging++;}});
          s.items[e.id+'.left']=left;s.items[e.id+'.right']=right;
          if(hanging===3&&left===right)s.flags[e.id+'.open']=true;
          break;
        }
        case 'waterworks':{
          if(!['fill','freeze','drain'].includes(e.action)||!Number.isInteger(e.target)||e.target<1||e.target>3)throw Error('Invalid waterworks');
          if(s.flags[e.id+'.open'])break;
          let level=Math.max(0,Math.min(3,Number(s.items[e.id+'.level'])||0)),ice=!!s.flags[e.id+'.frozen'];
          if(e.action==='fill'&&!ice)level=Math.min(3,level+1);
          if(e.action==='freeze'&&level>0)ice=true;
          if(e.action==='drain'){
            if(ice&&level===e.target)s.flags[e.id+'.open']=true;
            level=0;ice=false;
          }
          s.items[e.id+'.level']=level;s.flags[e.id+'.frozen']=ice;s.items[e.id]=level;
          break;
        }
        case 'flowSwitch':{
          if(!Number.isInteger(e.index)||e.index<0||e.index>2)throw Error('Invalid flow switch');
          if(s.flags[e.id+'.open'])break;
          const mask=((Number(s.items[e.id+'.mask'])||0)&7)^(1<<e.index);
          s.items[e.id+'.mask']=mask;
          // Spring and chiller connected, spill outlet shut. No dependence on input order.
          if(mask===5)s.flags[e.id+'.open']=true;
          break;
        }
        case 'linkedRotate':{
          if(!Array.isArray(e.target)||e.target.length!==3||!e.target.every(n=>Number.isInteger(n)&&n>=0&&n<4)||!Number.isInteger(e.index)||e.index< -1||e.index>2)throw Error('Invalid linked gears');
          if(s.flags[e.id+'.open'])break;
          if(e.index===-1){for(let i=0;i<3;i++)s.items[e.id+'.'+i]=0;}
          else for(const i of [e.index,(e.index+1)%3])s.items[e.id+'.'+i]=((Number(s.items[e.id+'.'+i])||0)+1)%4;
          s.items[e.id+'.turns']=(s.items[e.id+'.turns']||0)+1;
          if(e.target.every((n,i)=>(s.items[e.id+'.'+i]||0)===n))s.flags[e.id+'.open']=true;
          break;
        }
        case 'resetPuzzle':s.items[e.id]=0;s.items[e.id+'.mask']=0;s.flags[e.id+'.open']=false;break;
        case 'sequence':{
          if(!Array.isArray(e.solution)||!e.solution.length||typeof e.value!==typeof e.solution[0])throw Error('Invalid sequence');
          if(s.flags[e.id+'.open'])break;
          const at=Number(s.items[e.id]||0);
          s.items[e.id]=e.value===e.solution[at]?at+1:(e.value===e.solution[0]?1:0);
          if(s.items[e.id]===e.solution.length)s.flags[e.id+'.open']=true;
          break;
        }
        case 'quest':if(!['active','complete','closed'].includes(e.value))throw Error('Invalid quest state');s.quests[e.id]=e.value;break;
        case 'note':s.notes[e.id]={region:e.region,title:e.title,text:e.text};break;
        case 'reward':if(!own(s.rewards,e.id))s.rewards[e.id]={kind:e.kind,amount:e.amount,claimed:false};break;
        default:throw Error('Unknown story effect');
      }
    }
  }
  function node(book,id){return own(book.nodes,id)?book.nodes[id]:null;}
  // Recover topic access from old saved cursors, without replaying any choice effects.
  function topicHistory(book,npc,saved,start){
    const known=[...(saved?.topics||[]),...(saved?.trail||[]),start].filter(id=>node(book,id)?.topicMenu);
    if(known.length)return [...new Set(known)];
    const first=book.npcs[npc].start,queue=[[first]],seen=new Set();
    while(queue.length){const path=queue.shift(),id=path.at(-1);if(seen.has(id))continue;seen.add(id);
      if(id===start)return path.filter(k=>node(book,k)?.topicMenu);
      for(const c of node(book,id)?.choices||[])if(!seen.has(c.next))queue.push([...path,c.next]);
    }
    return [];
  }
  function seenNodes(c){return [...new Set([...(c.trail||[]),...(c.topics||[]),c.node])];}
  function returnsToReadLine(s,option){return !option.repeatable&&seenNodes(s.conversation).includes(option.next);}
  // A repeated flag/note is not new quest progress. Never replay rewards to decide this.
  function addsProgress(s,option){
    if(!(option.effects||[]).length)return false;
    const probe=copy({flags:s.flags,items:s.items,quests:s.quests,rewards:s.rewards,notes:s.notes});try{effects(probe,option.effects);}catch(_){return true;}
    const progress=v=>JSON.stringify([v.flags,v.items,v.quests,v.rewards,Object.fromEntries(Object.entries(v.notes).map(([id,n])=>[id,{region:n.region,title:n.title,text:n.text}]))]);
    return progress(probe)!==progress(s);
  }
  function informationOnly(list){return (list||[]).every(e=>e.type==='note'||e.type==='conditional'&&informationOnly(e.effects));}
  function turnInChoices(s,n){return (n?.choices||[]).filter(c=>c.turnIn===true&&matches(s,c.when)&&addsProgress(s,c));}
  function navigationOnly(s,c){
    const probe=copy({flags:s.flags,items:s.items,quests:s.quests,rewards:s.rewards,notes:s.notes});
    try{effects(probe,c.effects);}catch(_){return false;}
    return JSON.stringify([probe.flags,probe.items,probe.quests,probe.rewards])===JSON.stringify([s.flags,s.items,s.quests,s.rewards]);
  }
  function readyNode(s,book,start){
    const queue=[start],seen=new Set();
    while(queue.length){const id=queue.shift();if(seen.has(id))continue;seen.add(id);const n=node(book,id);if(!n)continue;
      if(turnInChoices(s,n).length)return id;
      for(const c of n.choices||[])if(matches(s,c.when)&&node(book,c.next)&&navigationOnly(s,c))queue.push(c.next);
    }
    return start;
  }
  function topicTarget(s,book){const c=s.conversation;if(!c||turnInChoices(s,node(book,c.node)).length)return null;
    const direct=new Set((node(book,c.node)?.choices||[]).filter(x=>matches(s,x.when)).map(x=>x.next));
    return [...(c.topics||[])].reverse().find(id=>id!==c.node&&node(book,id)?.topicMenu&&(node(book,id).choices||[]).some(x=>matches(s,x.when)&&!direct.has(x.next)&&(!seenNodes(c).includes(x.next)||addsProgress(s,x))))||null;
  }
  function view(s,book){
    const c=s.conversation,n=c&&node(book,c.node);if(!n)return null;
    let endShown=false;const choices=[],handIns=turnInChoices(s,n);
    for(const x of (handIns.length?handIns:(n.choices||[]).filter(x=>matches(s,x.when)))){
      const end=returnsToReadLine(s,x)&&(informationOnly(x.effects)||!addsProgress(s,x));
      if(end&&endShown)continue;if(end)endShown=true;
      choices.push({id:x.id,text:end?'Leave conversation':x.text,optional:handIns.length?false:end?false:!!x.optional,...(end?{end:true}:{})});
    }
    if(!handIns.length&&!endShown&&(c.browsingTopics||!choices.some(x=>!x.optional)))choices.unshift({id:'__leave',text:'Leave conversation',end:true});
    if(topicTarget(s,book))choices.push({id:'__topics',text:'Other questions / quests',optional:true});
    return {npc:c.npc,lineId:c.node,text:n.text,lastChoice:c.lastChoice||'',choices};
  }
  function transact(original,book,event){
    // Return the original on invalid/stale input. All effects commit together.
    if(!event||typeof event.id!=='string'||!event.id||event.id.length>160||['__proto__','constructor','prototype'].includes(event.id))return {state:original,changed:false};
    if(own(original.events,event.id))return {state:original,changed:false};
    if(event.revision!=null&&event.revision!==original.revision)return {state:original,changed:false};
    const s=copy(original);
    try{
      if(event.type==='open'){
        if(s.conversation||!own(book.npcs,event.npc))return {state:original,changed:false};
        const def=book.npcs[event.npc],saved=s.cursors[event.npc];
        const start=readyNode(s,book,saved?.node||def.start);if(!node(book,start))return {state:original,changed:false};
        if(!matches(s,def.when))return {state:original,changed:false};
        s.conversation={npc:event.npc,node:start,lastChoice:saved?.lastChoice||'',trail:[start],topics:topicHistory(book,event.npc,saved,start)};
      }else if(event.type==='close'){
        if(!s.conversation)return {state:original,changed:false};
        s.cursors[s.conversation.npc]=copy(s.conversation);s.conversation=null;
      }else if(event.type==='choose'){
        const c=s.conversation,n=c&&node(book,c.node);
        if(!n||event.line!==c.node)return {state:original,changed:false};
        const target=event.choice==='__topics'&&topicTarget(s,book);
        if(event.choice==='__leave'){
          if(!view(s,book)?.choices.some(x=>x.id==='__leave'))return {state:original,changed:false};
          s.cursors[c.npc]=copy(c);s.conversation=null;
        }else if(event.choice==='__topics'){
          if(!target)return {state:original,changed:false};
          c.trail=[...new Set([...(c.trail||[]),c.node,target])];c.node=target;c.browsingTopics=true;c.lastChoice='Other questions / quests';s.cursors[c.npc]=copy(c);
        }else{
        const option=n.choices?.find(x=>x.id===event.choice&&matches(s,x.when));
        if(!option||!node(book,option.next))return {state:original,changed:false};
        const handIns=turnInChoices(s,n);if(handIns.length&&!handIns.some(c=>c.id===option.id))return {state:original,changed:false};
        const ending=returnsToReadLine(s,option);if(addsProgress(s,option))effects(s,option.effects);c.trail=[...new Set([...(c.trail||[]),c.node,option.next])];c.node=option.next;if(node(book,c.node)?.topicMenu)c.topics=[...new Set([...(c.topics||[]),c.node])];c.lastChoice=option.text;s.cursors[c.npc]=copy(c);if(ending)s.conversation=null;
        }
      }else if(event.type==='world'){
        const e=own(book.events,event.key)&&book.events[event.key];
        if(!e||!matches(s,e.when)||(e.once&&s.flags['event.'+event.key]))return {state:original,changed:false};
        effects(s,e.effects);if(e.once)s.flags['event.'+event.key]=true;
      }else return {state:original,changed:false};
    }catch(_){return {state:original,changed:false};}
    s.events[event.id]=true;s.revision++;return {state:s,changed:true};
  }
  const api={create,restore,view,transact,matches};root.BFStoryState=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
