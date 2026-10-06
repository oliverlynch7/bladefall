import {Chess} from './vendor/chess-1.4.0.mjs';
// Engine work is lazy and off the render thread. Strength labels are targets, not ratings.
export class ChessOpponent {
 constructor(){this.worker=null;this.pending=null;this.serial=0;}
 cancel(){this.serial++;this.worker?.terminate();this.worker=null;if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(new Error('cancelled'));this.pending=null;}}
 move(fen,difficulty){this.cancel();const serial=this.serial,game=new Chess(fen),legal=game.moves({verbose:true});if(!legal.length)return Promise.resolve(null);
 return new Promise((resolve,reject)=>{let started=false;const finish=(move,error)=>{if(serial!==this.serial)return;clearTimeout(this.pending?.timer);this.pending=null;this.worker?.terminate();this.worker=null;error?reject(error):resolve(move);};
 this.pending={reject,timer:setTimeout(()=>finish(null,new Error('Chess engine timed out')),15000)};
 try{this.worker=new Worker(new URL('./vendor/stockfish/stockfish-18-lite-single.js',import.meta.url));}catch(e){finish(null,e);return;}
 const post=s=>this.worker?.postMessage(s);this.worker.onerror=()=>finish(null,new Error('Chess engine unavailable'));
 this.worker.onmessage=e=>{const line=String(e.data);if(line==='uciok'){post('setoption name Hash value 16');post('setoption name Threads value 1');post('setoption name UCI_LimitStrength value '+(difficulty==='hard'?'true':'false'));post('setoption name UCI_Elo value 1900');post('setoption name Skill Level value '+(difficulty==='easy'?0:3));post('isready');}
 else if(line==='readyok'&&!started){started=true;post('position fen '+fen);post('go movetime '+(difficulty==='hard'?900:250));}
 else if(line.startsWith('bestmove ')){const uci=line.split(' ')[1];let chosen=legal.find(m=>m.from+m.to+(m.promotion||'')===uci);if(!chosen){finish(null,new Error('Invalid engine move'));return;}
 // Beginner modes deliberately overlook tactics; all candidates remain legal.
 const chance=difficulty==='easy'?.55:difficulty==='medium'?.10:0;if(Math.random()<chance)chosen=legal[Math.floor(Math.random()*legal.length)];finish({from:chosen.from,to:chosen.to,promotion:chosen.promotion||'q'});}};
 post('uci');});}
}
