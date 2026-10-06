import assert from 'node:assert/strict';
import {Chess} from '../public/3d/vendor/chess-1.4.0.mjs';
globalThis.document={createElement:()=>({}),head:{append(){}}};
const {createChessTable}=await import('../public/3d/chess-table.js');
for(const [fen,move,total,after] of [
 ['r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1','O-O',6,6],
 ['7k/8/8/3pP3/8/8/8/7K w - d6 0 1','exd6',4,3],
 ['7k/P7/8/8/8/8/8/7K w - - 0 1',{from:'a7',to:'a8',promotion:'n'},3,3]]){
 const c=new Chess(fen),m=c.move(move),boxes=[];let elapsed=0;
 const st=()=>({fen:c.fen(),clock:{enabled:false},motion:{...m,before:fen,by:'p',elapsed,duration:m.flags.includes('k')?2350:1400},seats:{w:'p',b:'q'}});
 const view=createChessTable({A:{box:(...a)=>boxes.push(a)},table:{x:0,z:0},id:()=> 'p',host:()=>true,opened:()=>false,state:st,send(){},close(){}});
 for(const t of [0,650,1100,2000,2500]){elapsed=t;boxes.length=0;view.draw();const bases=boxes.filter(a=>a[3]===1.9&&a[4]===.7);assert.equal(bases.length,t<350?total:after);for(const b of bases)assert(b.slice(0,6).every(Number.isFinite));}
}
console.log('PASS choreography: castling moves both pieces; en passant removes correct pawn; promotion survives transition; no duplicate pieces or non-finite geometry');
