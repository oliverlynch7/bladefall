import {Chess} from './vendor/chess-1.4.0.mjs';
import {ChessClock} from './chess-clock.mjs';
export const THOMAS_ID='chess-thomas';
// Each match owns its rules, clock and engine request; views never mutate another match.
export class ChessSession{
 constructor(key,owner=null,{now=()=>performance.now(),opponent=null}={}){
  this.key=key;this.owner=owner;this.controller=owner;this.kind=owner?'thomas':'duel';this.now=now;this.opponent=opponent;this.ticket=0;this.pending=false;this.botError='';this.difficulty='medium';this.preferred='w';this.round=1;this.rev=0;this.serial=0;this.seats=owner?{w:owner,b:THOMAS_ID}:{w:null,b:null};this.game=new Chess();this.history=[];this.positions=new Map();this.recordPosition();this.clock=new ChessClock({},now());this.motion=null;this.result='';this.drawOffer=null;this.pausedAt=null;
 }
 recordPosition(){const k=this.game.fen().split(' ').slice(0,4).join(' ');this.positions.set(k,(this.positions.get(k)||0)+1);return this.positions.get(k);}
 cancel(){this.ticket++;this.pending=false;this.opponent?.cancel();}
 snapshot(network=false){const now=this.pausedAt??this.now();return {gameId:this.key,kind:this.kind,owner:this.owner,controller:this.controller,solo:this.kind==='thomas',...(network?{moves:this.history.map(m=>m.san)}:{history:this.history}),initialFen:this.history[0]?.before||new Chess().fen(),round:this.round,rev:this.rev,fen:this.game.fen(),seats:{...this.seats},preferred:this.preferred,difficulty:this.difficulty,botError:this.botError,result:this.result,drawOffer:this.drawOffer,paused:this.pausedAt!=null,clock:this.clock.view(now),claim:this.game.isThreefoldRepetition()||this.game.isDrawByFiftyMoves(),motion:this.motion?{...this.motion,elapsed:Math.min(this.motion.duration,now-this.motion.at)}:null};}
 pause(){if(this.pausedAt!=null)return;this.pausedAt=this.now();this.clock.stop(this.pausedAt);this.cancel();this.rev++;}
 resume(){if(this.pausedAt==null)return;const now=this.now();if(this.motion)this.motion.at+=now-this.pausedAt;this.pausedAt=null;this.clock.anchor=now;if(this.clock.enabled&&this.clock.started&&!this.result&&(!this.motion||this.motion.done))this.clock.running=this.game.turn();this.rev++;}
 command(pid,c){
  if(!c||typeof c.type!=='string')return false;
  const side=this.seats.w===pid?'w':this.seats.b===pid?'b':null,player=side&&pid!==THOMAS_ID,admin=player&&(this.kind==='thomas'?pid===this.owner:pid===(this.controller||this.seats.w)),fresh=!this.history.length&&!this.motion&&!this.result&&(!this.clock.enabled||!this.clock.started);
  if(c.type==='difficulty'&&this.kind==='thomas'&&admin&&fresh&&['easy','medium','hard'].includes(c.value)){this.cancel();this.difficulty=c.value;this.botError='';}
  else if(c.type==='retryBot'&&this.kind==='thomas'&&admin){this.cancel();this.botError='';this.clock.anchor=this.now();if(this.clock.enabled&&this.clock.started&&!this.result&&(!this.motion||this.motion.done))this.clock.running=this.game.turn();}
  else if(c.type==='color'&&admin&&fresh&&['w','b'].includes(c.value)){this.preferred=c.value;const other=this.seats[side==='w'?'b':'w'];this.seats={w:c.value==='w'?pid:other,b:c.value==='b'?pid:other};this.clock.ready={w:false,b:false};this.confirmBot();}
  else if(c.type==='configure'&&admin&&fresh){try{this.clock.configure(c.config,this.now());}catch{return false;}this.confirmBot();}
  else if(c.type==='ready'&&player&&!this.result&&this.clock.enabled&&!this.clock.started)this.clock.confirm(side,this.game.turn(),this.now());
  else if(c.type==='move'){
   if(!side||this.pausedAt!=null||c.rev!==this.rev||this.result||this.seats[this.game.turn()]!==pid||!this.clock.started||this.motion&&!this.motion.done)return false;
   const before=this.game.fen();let m;try{m=this.game.move({from:c.from,to:c.to,promotion:c.promotion||'q'});}catch{return false;}
   this.history.push({from:m.from,to:m.to,san:m.san,color:m.color,before,fen:this.game.fen()});this.clock.stop(this.now());this.motion={id:++this.serial,by:pid,color:m.color,from:m.from,to:m.to,piece:m.piece,captured:m.captured,promotion:m.promotion,flags:m.flags,before,at:this.now(),timed:this.clock.enabled,duration:(m.flags.includes('k')||m.flags.includes('q')?950:0)+(this.clock.enabled?1900:1400),done:false};this.drawOffer=null;const repeats=this.recordPosition();
   if(this.game.isCheckmate())this.result=(this.game.turn()==='w'?'Black':'White')+' wins by checkmate';else if(this.game.isStalemate())this.result='Draw · stalemate';else if(this.game.isInsufficientMaterial())this.result='Draw · insufficient material';else if(repeats>=5)this.result='Draw · fivefold repetition';else if(+this.game.fen().split(' ')[4]>=150)this.result='Draw · 75 moves without a capture or pawn move';
  }
  else if(c.type==='claim'&&player&&!this.result&&side===this.game.turn()&&(this.game.isThreefoldRepetition()||this.game.isDrawByFiftyMoves()))this.result='Draw claimed';
  else if(c.type==='draw'&&player&&!this.result){if(this.kind==='thomas'||this.drawOffer&&this.drawOffer!==pid){this.result='Draw by agreement';this.drawOffer=null;}else this.drawOffer=pid;}
  else if(c.type==='resign'&&player&&!this.result)this.result=(side==='w'?'Black':'White')+' wins by resignation';
  else if(c.type==='new'&&player&&this.result){this.cancel();this.game=new Chess();this.history=[];this.positions.clear();this.recordPosition();this.round++;this.clock=new ChessClock(this.clock,this.now());this.confirmBot();this.motion=null;this.result='';this.drawOffer=null;this.botError='';}
  else return false;
  if(this.result){this.clock.stop(this.now());this.cancel();}this.rev++;return true;
 }
 confirmBot(){if(this.kind==='thomas'&&this.clock.enabled)this.clock.confirm(this.seats.w===THOMAS_ID?'w':'b',this.game.turn(),this.now());}
 tick(active=true){
  if(this.kind==='thomas'){if(!active){this.pause();return;}this.resume();}
  if(this.pausedAt!=null)return;
  const now=this.now();if(this.motion&&!this.motion.done&&now-this.motion.at>=this.motion.duration){this.motion.done=true;this.clock.finishMove(this.motion.color,this.game.turn(),this.motion.at+this.motion.duration,!!this.result||!this.clock.started);this.rev++;}
  if(!this.result){const flag=this.clock.settle(now);if(flag){const winner=flag==='w'?'b':'w',pieces=this.game.board().flat().filter(p=>p?.color===winner&&p.type!=='k');this.result=this.game.isInsufficientMaterial()||!pieces.length?'Draw · no mating material':(winner==='w'?'White':'Black')+' wins on time';this.clock.stop(now);this.cancel();this.rev++;}}
  if(this.kind==='thomas'&&this.opponent&&active&&!this.pending&&!this.botError&&!this.result&&this.clock.started&&(!this.motion||this.motion.done)&&this.seats[this.game.turn()]===THOMAS_ID){
   const ticket=++this.ticket,fen=this.game.fen();this.pending=true;
   this.opponent.move(fen,this.difficulty).then(move=>{if(ticket!==this.ticket)return;this.pending=false;if(this.pausedAt!=null||this.result||this.game.fen()!==fen)return;this.tickClock();if(!this.result&&move)this.command(THOMAS_ID,{type:'move',...move,rev:this.rev});}).catch(e=>{if(ticket!==this.ticket||e.message==='cancelled')return;this.pending=false;this.botError=e.message;this.clock.stop(this.now());this.rev++;});
  }
 }
 tickClock(){const flag=this.clock.settle(this.now());if(flag){const winner=flag==='w'?'b':'w',pieces=this.game.board().flat().filter(p=>p?.color===winner&&p.type!=='k');this.result=this.game.isInsufficientMaterial()||!pieces.length?'Draw · no mating material':(winner==='w'?'White':'Black')+' wins on time';this.clock.stop(this.now());this.rev++;}}
 dispose(){this.cancel();}
}
