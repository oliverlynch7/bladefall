/* Explain an accepted puzzle action without revealing its next answer. */
(function(root){'use strict';
const outcomes={
 'sc.rudder':'Rudder recovered. Bring it to Otto at the boatbuilding site.',
 'sc.sail':'Sail recovered. Otto needs it to prepare your crossing.',
 'sc.rope':'Rope recovered. Bring it to Otto with the sail and rudder.',
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
 if(event?.effects?.some(e=>e.id==='ih.braces'))return {id,replaceKey:'puzzle:ih.line',kind:'Machine safety',title:'Safety cable pulled',text:'Eight lights are counting down. Reach the hammer lock before they go out. You can pull this cable again if you miss it.'};
 const e=event?.effects?.find(e=>['counterweight','rotatePuzzle','sequence','resetPuzzle','balanceBeam','waterworks','flowSwitch','linkedRotate'].includes(e.type));
 if(!e)return null;
 const solved=!!after.flags[e.id+'.open'],wasSolved=!!before.flags[e.id+'.open'];
 if(wasSolved&&solved)return null;
 let title='Puzzle updated',text;
 if(e.id==='ih.line'){const step=after.items[e.id]||0;title=solved?'Weapon line stopped':step===1?'Metal feed stopped':'Pressure released';text=solved?'The machinery is safe. The repaired cart leads onward.':step===1?'Watch the pressure gauge. Vent the tank while the needle is inside its pale band.':'Pull the safety cable, then hurry to the hammer lock before its eight lights go out.';}
 else if(e.id==='gf.cool'){const step=after.items[e.id]||0;title=solved?'Crossing cooled':step===2?'Cooling water flowing':step===1?'Round tank filled':'Cooling system drained';text=solved?'The crossing rises. Jump across its two broken sections.':step===2?'Watch the heat gauge beside the triangle drain. Release it when the needle reaches the pale lower band.':step===1?'The tank is full. Open the square channel to cool the crossing.':'The safety drain cleared the system. Refill the round tank to try again.';}
 else if(e.id==='pc.light'){title=solved?'Library seal lit':'Mirror turned';text=solved?'The sunbeam reaches the receiver. The library door is unlocked.':'Follow the sunbeam across the terrace. If it misses the next mirror, turn the mirror where the light stops following the route.';}
 else if(solved){title='Puzzle solved';text=e.type==='counterweight'?'The weights are balanced. The mechanism is ready.':'The mechanism locks into place. Check what has changed nearby.';}
 else if(e.type==='balanceBeam'){title='Balance beam moved';text='Weight '+e.weights[e.index]+': '+['on the rack','on the left pan','on the right pan'][after.items[e.id+'.side.'+e.index]||0]+'. Left load: '+(after.items[e.id+'.left']||0)+'. Right load: '+(after.items[e.id+'.right']||0)+'. All three weights must hang before the lock can release.';}
 else if(e.type==='waterworks'){const depth=after.items[e.id+'.level']||0;title=after.flags[e.id+'.frozen']?'Water frozen':e.action==='drain'?'Basin drained':'Water level';text=depth?'Water stands at notch '+depth+' of 3. '+(after.flags[e.id+'.frozen']?'The ice holds this height. Drain beneath it to test the crossing.':'Compare the surface with the banks before freezing.'):'The basin is empty. Fill it to build a new sheet of ice.';}
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
