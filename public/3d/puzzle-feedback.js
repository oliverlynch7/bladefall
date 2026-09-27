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
 const e=event?.effects?.find(e=>['counterweight','rotatePuzzle','sequence','resetPuzzle'].includes(e.type));
 if(!e)return null;
 const solved=!!after.flags[e.id+'.open'],wasSolved=!!before.flags[e.id+'.open'];
 if(wasSolved&&solved)return null;
 let title='Puzzle updated',text;
 if(e.id==='ih.line'){const step=after.items[e.id]||0;title=solved?'Weapon line stopped':step===1?'Metal feed stopped':'Pressure released';text=solved?'The machinery is safe. The repaired cart leads onward.':step===1?'Watch the pressure gauge. Vent the tank while the needle is inside its pale band.':'Pull the safety cable, then hurry to the hammer lock before its eight lights go out.';}
 else if(solved){title='Puzzle solved';text=e.type==='counterweight'?'The weights are balanced. The mechanism is ready.':'The mechanism locks into place. Check what has changed nearby.';}
 else if(e.type==='counterweight')text='Attached weight: '+(after.items[e.id]||0)+'. Compare the total with the load plate.';
 else if(e.type==='rotatePuzzle')text='The '+(object?.label||'mirror').replace(/^Turn\s+/i,'')+' turns to position '+((after.items[e.id+'.'+e.index]||0)+1)+' of 4. Match the marks in the nearby clue.';
 else if(e.type==='resetPuzzle'){title='Weights released';text='The weights have dropped back. Check which brake connects to the bridge.';}
 else {const step=after.items[e.id]||0;if(step){text='The mechanism responds: '+step+' of '+e.solution.length+' steps in place.';}else{title='Pattern reset';text='That order did not match. The mechanism has reset; you can try again.';}}
 return {id,replaceKey:'puzzle:'+e.id,kind:solved?'Puzzle solved':'Puzzle progress',title,text};
}
const api={notice,outcome};root.BFPuzzleFeedback=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
