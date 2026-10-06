import './chess-pieces.js?v=2119';
import {ChessOpponent} from './chess-opponent.mjs?v=2119';
import {ChessClock} from './chess-clock.mjs';
import {createChessTable} from './chess-table.js?v=2119';
import {Chess} from './vendor/chess-1.4.0.mjs';
const A=window.__BF_SOCIAL_API,table={x:300,z:390},cost=1000;
let game=new Chess(),rev=0,seats={w:null,b:null},result='',remote=null,opened=false,selected=null,pendingTalk=null,talks={},lastTalk='',origin=null,positions=new Map(),drawOffer=null;
let clock=new ChessClock({},performance.now()),motion=null,moveSerial=0,remoteAt=0;
const botId='chess-thomas',opponent=new ChessOpponent();let difficulty='medium',botError='',botPending=false,botTicket=0,wasCoop=false,soloPaused=0;
const cancelBot=()=>{botTicket++;botPending=false;opponent.cancel();};
const id=()=>A.mp().active?A.mp().myId:'solo',host=()=>!A.mp().active||A.mp().isHost;
const isHub=()=>A.g()?.hub&&!A.g().riftHall&&!A.g().sparringRoom;
const owned=()=>host()?!!A.meta().hubUpgrades?.chess:!!remote?.owned;
const current=()=>host()?snapshot():remote;
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function positionKey(){return game.fen().split(' ').slice(0,4).join(' ')}
function recordPosition(){const k=positionKey();positions.set(k,(positions.get(k)||0)+1)}
recordPosition();
function snapshot(){return {solo:!A.mp().active,difficulty,botError,owned:!!A.meta().hubUpgrades?.chess,fen:game.fen(),rev,seats:{...seats},result,drawOffer,clock:clock.view(performance.now()),motion:motion?{...motion,elapsed:Math.min(motion.duration,(soloPaused||performance.now())-motion.at)}:null,talks:structuredClone(talks),claim:game.isThreefoldRepetition()||game.isDrawByFiftyMoves()};}
function reset(){soloPaused=0;window.BFChessPieces?.hide();cancelBot();botError='';close();soloPaused=0;clock=new ChessClock({},performance.now());motion=null;moveSerial=0;game=new Chess();positions.clear();recordPosition();drawOffer=null;rev=0;seats={w:null,b:null};result='';remote=null;talks={};pendingTalk=null;lastTalk='';}
function apply(packet){if(!packet||typeof packet.fen!=='string')return;const changed=!remote||packet.rev!==remote.rev||packet.fen!==remote.fen;remote=packet;remoteAt=performance.now();if(changed&&opened){selected=null;render();}followTalk();}
function send(cmd){if(host())receive(id(),cmd);else A.mp().hostConn?.send({t:'socialRequest',command:cmd});}
function actor(pid){return pid===botId&&!A.mp().active?{...table,hp:100}:pid===id()?A.g()?.p:A.mp().peers[pid];}
function valid(pid,point){const p=actor(pid);return isHub()&&p&&!p.dead&&!p.downed&&p.hp>0&&(pid===id()||pid===botId&&!A.mp().active||p.zone===A.mp().zone&&!p.hall)&&Math.hypot(p.x-point.x,p.z-point.z)<170;}
function receive(pid,c){syncMode();if(!host()||!c||typeof c.type!=='string')return false;
 if(c.type.startsWith('talk')){
  const n=A.g()?.hubNpcs?.find(n=>n.id===c.npc);if(!n||!valid(pid,n))return false;const t=talks[c.npc];
  if(c.type==='talkStart'){if(!t)talks[c.npc]={owner:pid,line:null};}
  else if(t?.owner===pid){if(c.type==='talkEnd')delete talks[c.npc];else if(c.type==='talkLine'&&(c.line===null||typeof c.line==='string'&&c.line.length<120))t.line=c.line;}
  rev++;followTalk();return true;
 }
 advance();if(!owned()||!valid(pid,table))return false;
 if(c.type==='difficulty'&&!A.mp().active&&pid===id()&&game.history().length===0&&!motion&&['easy','medium','hard'].includes(c.value)){cancelBot();difficulty=c.value;botError='';rev++;}
 else if(c.type==='retryBot'&&!A.mp().active&&pid===id()){cancelBot();botError='';if(clock.enabled&&clock.started)clock.running=game.turn();clock.anchor=performance.now();rev++;}
 else if(c.type==='sit'){if(!Object.values(seats).includes(pid)){if(!seats.w)seats.w=pid;else if(!seats.b)seats.b=pid;}if(!A.mp().active&&!seats.b)seats.b=botId;rev++;}
 else if(c.type==='configure'&&pid===id()&&game.history().length===0&&!motion&&!result&&!(clock.enabled&&clock.started)){try{clock.configure(c.config,performance.now());if(!A.mp().active)clock.confirm('b',game.turn(),performance.now());}catch{return false;}rev++;}
 else if(c.type==='ready'&&!result&&clock.enabled&&!clock.started&&Object.values(seats).includes(pid)){clock.confirm(seats.w===pid?'w':'b',game.turn(),performance.now());rev++;}
 else if(c.type==='move'){if(c.rev!==rev||result||seats[game.turn()]!==pid||!clock.started||motion&&!motion.done)return false;const before=game.fen();let move;try{move=game.move({from:c.from,to:c.to,promotion:c.promotion||'q'});}catch{return false;}clock.stop(performance.now());motion={id:++moveSerial,by:pid,color:move.color,from:move.from,to:move.to,piece:move.piece,captured:move.captured,promotion:move.promotion,flags:move.flags,before,at:performance.now(),timed:clock.enabled,duration:(move.flags.includes('k')||move.flags.includes('q')?950:0)+(clock.enabled?1900:1400),done:false};recordPosition();drawOffer=null;if(game.isCheckmate())result=(game.turn()==='w'?'Black':'White')+' wins by checkmate';else if(game.isStalemate())result='Draw · stalemate';else if(game.isInsufficientMaterial())result='Draw · insufficient material';else if(positions.get(positionKey())>=5)result='Draw · fivefold repetition';else if(+game.fen().split(' ')[4]>=150)result='Draw · 75 moves without a capture or pawn move';rev++;}
 else if(c.type==='claim'&&!result&&seats[game.turn()]===pid&&(game.isThreefoldRepetition()||game.isDrawByFiftyMoves())){result='Draw claimed';rev++;}
 else if(c.type==='draw'&&!result&&Object.values(seats).includes(pid)){if(drawOffer&&drawOffer!==pid){result='Draw by agreement';drawOffer=null;}else if(!A.mp().active){result='Draw by agreement';drawOffer=null;}else drawOffer=pid;rev++;}
 else if(c.type==='resign'&&!result&&Object.values(seats).includes(pid)){result=(seats.w===pid?'Black':'White')+' wins by resignation';rev++;}
 else if(c.type==='new'&&result&&Object.values(seats).includes(pid)){cancelBot();botError='';game=new Chess();clock=new ChessClock(clock,performance.now());if(!A.mp().active)clock.confirm('b',game.turn(),performance.now());motion=null;positions.clear();recordPosition();drawOffer=null;result='';rev++;}
 else return false;
 if(result)clock.stop(performance.now());if(opened)render();return true;
}
function advance(){if(!host()||soloPaused&&!A.mp().active)return;const now=performance.now();let changed=false;
 if(motion&&!motion.done&&now-motion.at>=motion.duration){motion.done=true;clock.finishMove(motion.color,game.turn(),motion.at+motion.duration,!!result||!clock.started);changed=true;}
 if(!result){const flag=clock.settle(now);if(flag){const winner=flag==='w'?'b':'w',pieces=game.board().flat().filter(p=>p?.color===winner&&p.type!=='k');result=game.isInsufficientMaterial()||!pieces.length?'Draw · no mating material':(winner==='w'?'White':'Black')+' wins on time';clock.stop(now);changed=true;}}
 if(changed){rev++;if(opened)render();}}
function displayState(){const st=current();if(!st)return null;if(host())return st;const elapsed=Math.max(0,performance.now()-remoteAt);const c=st.clock?{...st.clock,left:{...st.clock.left}}:null;if(c?.running)c.left[c.running]=Math.max(0,c.left[c.running]-elapsed/1000);return {...st,clock:c,motion:st.motion?{...st.motion,elapsed:Math.min(st.motion.duration,st.motion.elapsed+elapsed)}:null};}
function requestTalk(n){pendingTalk=n.id;send({type:'talkStart',npc:n.id});followTalk();return true;}
function followTalk(){const all=host()?talks:remote?.talks||{};
 if(pendingTalk&&all[pendingTalk]&&window.BFHubDialogue?.known(pendingTalk)){const npc=pendingTalk;pendingTalk=null;const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(n){if(all[npc].owner===id())A.openTalk(n);else A.listen(n,all[npc].line);}}
 const active=window.BFHubDialogue?.active;if(active?.spectator){const t=all[active.n.id];if(!t)BFHubDialogue.close(false,true);else A.listen(active.n,t.line);}
}
function syncMode(){ if(A.mp().active!==wasCoop){cancelBot();botError='';wasCoop=A.mp().active;soloPaused=0;if(host()){game=new Chess();clock=new ChessClock({},performance.now());motion=null;seats={w:null,b:null};result='';drawOffer=null;positions.clear();recordPosition();rev++;}return true;}return false;}
function tick(){
 if(syncMode()&&opened)send({type:'sit'});
 advance();tableView.tick();
 if(!A.mp().active&&opened&&isHub()&&owned()&&!botPending&&!botError&&!result&&clock.started&&(!motion||motion.done)&&seats[game.turn()]===botId){
  const ticket=++botTicket,fen=game.fen();botPending=true;opponent.move(fen,difficulty).then(move=>{if(ticket!==botTicket)return;botPending=false;if(A.mp().active||!opened||!isHub()||result||game.fen()!==fen)return;advance();if(!result&&move)receive(botId,{type:'move',...move,rev});}).catch(e=>{if(ticket!==botTicket||e.message==='cancelled')return;botPending=false;botError=e.message;clock.stop(performance.now());rev++;render();});
 }

 if(host()&&A.mp().active)for(const side of ['w','b'])if(seats[side]&&seats[side]!==id()&&!A.mp().peers[seats[side]]){clock.suspend(performance.now());seats[side]=null;drawOffer=null;rev++;if(opened)render();}
 const g=A.g();if(isHub()&&owned()&&!g._chessCollision){g._chessCollision=true;g.obstacles.push({kind:'col',x:table.x,z:table.z,w:36,d:40,h:22,socialChess:true,invisible:true});}

 if(host())for(const [npc,t]of Object.entries(talks)){const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(!n||!valid(t.owner,n)){delete talks[npc];rev++;}}
 followTalk();const active=window.BFHubDialogue?.active,all=host()?talks:remote?.talks||{};
 for(const [npc,t]of Object.entries(all))if(t.owner===id()){
  const line=active&&!active.external&&!active.spectator&&active.n.id===npc?active.lineId:null;
  if(!active||active.n.id!==npc){send({type:'talkEnd',npc});lastTalk='';}
  else if(lastTalk!==npc+':'+line){lastTalk=npc+':'+line;send({type:'talkLine',npc,line});}
 }
 if(opened&&(!isHub()||!owned()||A.g()?.p?.dead))close();
}
function open(){if(!isHub()||!owned()||opened)return;opened=true;if(soloPaused){const now=performance.now();if(motion)motion.at+=now-soloPaused;clock.anchor=now;if(clock.enabled&&clock.started&&!result&&(!motion||motion.done))clock.running=game.turn();soloPaused=0;}document.body.classList.add('chess-view');origin={g:A.g(),x:A.g().p.x,z:A.g().p.z,y:A.g().p.y};send({type:'sit'});A.enter('chess');render();}
function close(){cancelBot();if(!opened)return;if(!A.mp().active){soloPaused=performance.now();clock.stop(soloPaused);}opened=false;document.body.classList.remove('chess-view');selected=null;tableView.close();if(A.g()?.p){A.g().p.sitting=false;if(origin?.g===A.g())Object.assign(A.g().p,{x:origin.x,y:origin.y,z:origin.z});}origin=null;A.resume();}
function render(){if(opened)tableView.render();}
function interaction(){return isHub()&&owned()&&Math.hypot(A.g().p.x-table.x,A.g().p.z-table.z)<135?{...table,y:105,label:'Sit at the chess table',act:open}:null;}
function draw(){if(isHub()&&owned())tableView.draw();else window.BFChessPieces?.hide();}

const style=document.createElement('style');style.textContent='.social-panel{position:fixed;z-index:110;inset:3% auto auto 50%;transform:translateX(-50%);width:min(480px,94vw);max-height:92vh;overflow:auto;background:#18242df5;border:1px solid #b89c61;border-radius:14px;padding:16px;box-sizing:border-box;color:#f2e4c2;font:14px/1.4 system-ui}.social-panel h2,.social-panel p{margin:6px 0}.social-panel button,.social-panel select{padding:9px;background:#394b50;color:#fff;border:1px solid #82908a;border-radius:5px;margin:4px}.chess-grid{display:grid;grid-template-columns:repeat(8,1fr);aspect-ratio:1}.chess-grid .chess-square{margin:0;padding:0;border:0;border-radius:0;font-size:clamp(23px,5vw,40px);line-height:1;text-shadow:0 1px 2px #000}.chess-square.light{background:#c9b68e}.chess-square.dark{background:#526350}.chess-square.selected{outline:3px solid #ffd55c;outline-offset:-3px}.chess-square.legal{box-shadow:inset 0 0 0 4px #72c89d}';document.head.append(style);
window.addEventListener('keydown',e=>{if(opened&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
const tableView=createChessTable({A,table,id,host,opened:()=>opened,state:displayState,send,close});
window.BFSocial={npcPose:n=>n==='thomas'&&!A.mp().active&&opened&&seats.b===botId?{peerId:botId,sitting:true,x:table.x+21,z:table.z,y:-4,yaw:-Math.PI/2}:null,camera:()=>opened?tableView.camera():null,poseFor:p=>tableView.poseFor(p),snapshot,apply,receive,reset,tick,open,close,interaction,draw,requestTalk,get owned(){return owned()},get cost(){return cost}};
