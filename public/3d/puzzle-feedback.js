/* Explain an accepted puzzle action without revealing its next answer. */
(function(root){'use strict';
const outcomes={
 'kd.hidden':'The service door swings open. The missing prisoners are in the holding room beyond it.',
 'rk.gate':'Grant’s gate is open. Ring the bell beside the breach when you are ready to protect the prisoners.',
 'rk.timing':'The workshop gate is open. Felix’s tools are on the crate inside.',
 'rk.tools':'Tools secured. Return them to Felix beside the breach court.',
 'rv.supplies.take':'The food is secured. Return to the Quartermaster in the Waystation.',
 'home.grain.clue':'The basket is tied to the store-room door. Find where the loft hopper sends its grain.',
 'home.grain.spout':'The trough now points at the hanging basket. Release the grain from the loft hopper.',
 'home.grain.hopper':'The hopper gate is open. If the grain misses the basket, swing the trough toward it below.',
 'hp.code.release':'The hoist lifted its cargo clear of the chest below. Drop to the lower trail and open it.',
 'hp.code.claim':'The cliff chest is open. Its reward is yours.',
 'sc.code.fire':'The iron clasp breaks. Return to the Lantern Wreck to claim Stormshot.',
 'sc.code.claim':'Stormshot taken from the opened chest.',
 'sc.rudder':'Rudder recovered. Fit it at Otto’s workbench beside the boat.',
 'sc.sail':'Sailcloth recovered. Fit it at Otto’s workbench beside the boat.',
 'sc.rope':'Dry rope recovered. Fit it at Otto’s workbench beside the boat.',
 'sc.bell':'Ship bell recovered. Keep it for the shore memorial.',
 'cg.coat':'Legion coat collected. Your disguise also needs a helmet and travel papers.',
 'cg.helmet':'Legion helmet collected. Your disguise also needs a coat and travel papers.',
 'cg.papers':'Travel papers collected. Read the orders and bell signals before speaking to the gate guard.',
 'cg.personal':'Personal belongings recovered. Return them to their owner.',
 'pc.seeds':'Seeds recovered. Bring them back to the palace gardener.',
 'fc.valve.0':'Cooling valve opened. Watch the furnace and its pressure.',
 'fc.valve.1':'Cooling valve opened. Watch the furnace and its pressure.',
 'fc.valve.2':'Cooling valve opened. Watch the furnace and its pressure.'
};
function outcome(key){return outcomes[key]||null;}
function notice(event,before,after,object,id){
 const keepOpen={'rk.gate':['rk.gate','Outer gate opened'],'rk.timing':['rk.workshop','Workshop gate opened']}[object?.key];
 if(keepOpen&&!before.flags[keepOpen[0]]&&after.flags[keepOpen[0]])return {id,replaceKey:'puzzle:'+object.key,kind:'Path opened',title:keepOpen[1],text:outcomes[object.key]};
 if(event?.effects?.some(e=>e.id==='rv.supplies.balance.open')&&after.flags['rv.supplies.balance.open'])return {id,replaceKey:'puzzle:rv.supplies',kind:'Supplies lowered',title:'Hoist brake freed',text:'The counterweight rises and the food basket descends. Return to the floor and collect the supplies.'};
 if(['home.grain.spout','home.grain.hopper'].some(key=>event?.effects?.some(e=>e.id===key))){
  const solved=!!after.flags['home.grain.open'];
  return {id,replaceKey:'puzzle:home.grain',kind:solved?'Path opened':'Granary machinery',title:solved?'Store door lifted':event.effects[0].id==='home.grain.spout'?'Trough aimed':'Grain released',text:solved?'Grain fills the basket. It descends and lifts the store-room door. The chest is inside.':event.effects[0].id==='home.grain.spout'?'The trough now points at the basket. Climb to the loft and open the hopper.':'Grain misses the hanging basket. Swing the trough toward it from the barn floor.'};
 }
 if(event?.effects?.some(e=>e.id==='ic.channel.open')&&after.flags['ic.channel.open'])return {id,replaceKey:'puzzle:ic.channel',kind:'Path opened',title:'Spring diverted',text:'The stone plug blocks the spill. Water reaches the chiller, and a frozen path leads to the sealed side chamber.'};
 if(event?.effects?.some(e=>e.id==='sc.hull.open')&&after.flags['sc.hull.open'])return {id,replaceKey:'puzzle:sc.hull',kind:'Path opened',title:'Lower hatch lifted',text:'The cargo struck the brace. Its line lifted the lower hatch. Follow the crawlspace beneath the wreck to reach the Rift Shard.'};
 if(event?.effects?.some(e=>e.id==='gf.cool.open')&&after.flags['gf.cool.open'])return {id,replaceKey:'puzzle:gf.cool',kind:'Path opened',title:'Furnace crossing cooled',text:'The water raised the crossing. Jump its two broken sections to reach the Colossus.'};
 if(event?.effects?.some(e=>e.id==='sl.shelf.stage1')&&after.flags['sl.shelf.stage1'])return {id,replaceKey:'puzzle:sl.shelf',kind:'Path opened',title:'First shelves unfolded',text:'Two shelves now span the gap. Cross them to reach the second crank.'};
 if(event?.effects?.some(e=>e.id==='sl.shelf.open')&&after.flags['sl.shelf.open'])return {id,replaceKey:'puzzle:sl.shelf',kind:'Path opened',title:'Far shelves unfolded',text:'The remaining shelves lead into the restricted archive. Follow their gold edges to the Rift Shard.'};
 if(event?.effects?.some(e=>e.id==='sc.fit.rudder')){
  const fitted=['rudder','sail','rope'].filter(k=>!before.flags['sc.installed.'+k]&&after.flags['sc.installed.'+k]);
  if(fitted.length)return {id,replaceKey:'boat:assembly',kind:after.flags['sc.boat.ready']?'Boat ready':'Boat repair',title:after.flags['sc.boat.ready']?'The boat is ready':fitted.map(k=>k[0].toUpperCase()+k.slice(1)).join(' and ')+' fitted',text:after.flags['sc.boat.ready']?'All three parts are fitted. Board beside Otto when you are ready to cross.':'The '+fitted.join(' and ')+' '+(fitted.length===1?'is':'are')+' now fitted to the boat. Find the remaining supplies or ask Otto for help.'};
 }
 const e=event?.effects?.find(e=>['counterweight','rotatePuzzle','sequence','resetPuzzle','balanceBeam','waterworks','flowSwitch','linkedRotate'].includes(e.type));
 if(!e)return null;
 const solved=!!after.flags[e.id+'.open'],wasSolved=!!before.flags[e.id+'.open'];
 if(wasSolved&&solved)return null;
 let title='Puzzle updated',text;
 if(e.id==='la.vault'){title=solved?'Service vault unlocked':'Service wheel turned';text=solved?'Both bolts withdraw. The service vault is open.':'The gold pointer moved. Compare it with the pale repair mark above this wheel; its bolt withdraws when aligned.';}
 else if(e.id==='pc.light'){
  const path=root.BFPalaceCourtyard?.lightPath(after.items['pc.light.mask']||0),last=path?.hits[path.hits.length-1];
  title=solved?'Library seal lit':'Mirror turned';
  text=solved?'The sunbeam reaches the receiver. The library door is unlocked.':last==null?'Watch where the sunbeam stops.':`The sunbeam reaches the ${['left','middle','right'][last]} mirror, then misses its next target. Watch its reflection.`;
 }
 else if(solved){title='Puzzle solved';text=e.type==='counterweight'?'The weights are balanced. The mechanism is ready.':'The mechanism locks into place. Check what has changed nearby.';}
 else if(e.type==='balanceBeam'){title='Balance beam moved';text='Weight '+e.weights[e.index]+': '+['on the rack','on the left pan','on the right pan'][after.items[e.id+'.side.'+e.index]||0]+'. Left load: '+(after.items[e.id+'.left']||0)+'. Right load: '+(after.items[e.id+'.right']||0)+'. All three weights must hang before the lock can release.';}
 else if(e.type==='waterworks'){const depth=after.items[e.id+'.level']||0;title=after.flags[e.id+'.frozen']?'Water frozen':e.action==='drain'?'Basin drained':'Water level';text=e.id==='ic.lock'?(after.flags['ic.lock.open']?'The ice bridge holds. Cross to the north cavern.':e.action==='drain'?'The sheet broke away. Pump the float up and try again.':depth>=3?'The float is above the bank. Release excess water at the near sluice.':after.flags['ic.lock.frozen']?'Cross the ice to the far bank and open its drain.':depth<2?'The float rises toward the middle marks. Pull the pump again.':'The float meets the banks. Jump aboard and reach the freeze valve.'):depth?'Water stands at notch '+depth+' of 3. '+(after.flags[e.id+'.frozen']?'The ice holds this height. Drain beneath it to test the crossing.':'Compare the surface with the banks before freezing.'):'The basin is empty. Fill it to build a new sheet of ice.';}
 else if(e.type==='flowSwitch'){const mask=after.items[e.id+'.mask']||0;text=['Spring inlet: '+(mask&1?'open':'closed'),'Spill outlet: '+(mask&2?'open':'closed'),'Chiller feed: '+(mask&4?'open':'closed')].join('. ')+'. Follow the lit pipes to see where water flows.';}
 else if(e.type==='linkedRotate'){title=e.index===-1?'Shelf gears reset':'Linked shelves turned';text=e.index===-1?'All three pointers return to their starting marks. Try another combination.':'This handle turns two shelves together. Compare all three gold pointers with their pale marks.';}
 else if(e.type==='counterweight')text='Attached weight: '+(after.items[e.id]||0)+'. Compare the total with the load plate.';
 else if(e.type==='rotatePuzzle')text='The '+(object?.label||'mirror').replace(/^Turn\s+/i,'')+' turns to position '+((after.items[e.id+'.'+e.index]||0)+1)+' of 4. Match the marks in the nearby clue.';
 else if(e.type==='resetPuzzle'){title='Weights released';text='The weights have dropped back. Check which brake connects to the bridge.';}
 else {const step=after.items[e.id]||0;if(step){text='The mechanism responds: '+step+' of '+e.solution.length+' steps in place.';}else{title='Pattern reset';text='That order did not match. The mechanism has reset; you can try again.';}}
 return {id,replaceKey:'puzzle:'+e.id,kind:solved?'Puzzle solved':'Puzzle progress',title,text};
}
const api={notice,outcome};root.BFPuzzleFeedback=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
