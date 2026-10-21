import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {chessApproach} from '../public/3d/chess-approach.js';

const table={x:300,z:390},thomas={id:'thomas',x:300,z:350,y:0};
let checks=0;
function check(value,expected,label){assert.equal(value,expected,label);checks++;}
for(const [x,z,want,label]of [
 [300,300,false,'behind bench'],[300,350,false,'beside Thomas'],
 [255,365,false,'bench left approach'],[345,365,false,'bench right approach'],
 [250,390,false,'table left flank'],[350,390,false,'table right flank'],
 [300,397,false,'near center remains conversation'],[300,398,true,'far side begins'],
 [300,435,true,'far side'],[245,440,true,'far left diagonal'],
 [355,440,true,'far right diagonal'],[300,499,true,'far reach'],[300,500,false,'beyond reach']
])check(chessApproach({x,z},table,thomas),want,label);
check(chessApproach({x:300,z:435,y:65},table,thomas),false,'no chess through another floor');
check(chessApproach({x:300,z:435,y:64},table,thomas),true,'normal jump tolerance');
check(chessApproach({x:300,z:435},table),true,'board usable before Thomas quest appears');
check(chessApproach({x:350,z:390},table,{x:260,z:390}),true,'rotated placement far side');
check(chessApproach({x:250,z:390},table,{x:260,z:390}),false,'rotated placement bench side');

// Exercise the actual prompt selector, including co-op and ownership branches.
const social=readFileSync(new URL('../public/3d/social-hub.js',import.meta.url),'utf8');
const selector=social.match(/function interaction\(\)\{[^\n]+/)[0];
const g={p:{x:300,z:435},hubNpcs:[thomas]};
const context={chessApproach,table,A:{g:()=>g,mp:()=>({active:context.coop})},
 opened:false,isHub:()=>context.hub,owned:()=>context.hasBoard,tableState:()=>context.state,
 id:()=> 'local',name:()=> 'Friend',open:()=>{},hub:true,hasBoard:true,coop:false,state:null};
vm.createContext(context);vm.runInContext(selector,context);
const prompt=()=>context.interaction()?.label??null;
check(prompt(),'Play chess with Thomas','solo far side');
context.hasBoard=false;check(prompt(),null,'not purchased');context.hasBoard=true;
context.hub=false;check(prompt(),null,'not in Waystation');context.hub=true;
context.opened=true;check(prompt(),null,'already seated');context.opened=false;
context.coop=true;check(prompt(),'Sit down · Play a friend','co-op default');
context.state={kind:'thomas',owner:'friend'};check(prompt(),'Watch Friend vs Thomas','co-op spectator');
context.state={kind:'thomas',owner:'local'};check(prompt(),'Resume chess with Thomas','resume');
for(const state of [null,{kind:'thomas',owner:'friend'},{kind:'thomas',owner:'local'}]){
 context.state=state;g.p.z=350;check(prompt(),null,'bench never stolen by chess, including watch/resume');
}
console.log(`${checks} chess approach and prompt checks passed.`);
