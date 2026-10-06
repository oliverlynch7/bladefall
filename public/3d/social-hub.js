import {Chess} from './vendor/chess-1.4.0.mjs';
const A=window.__BF_SOCIAL_API,table={x:300,z:390},cost=1000;
let game=new Chess(),rev=0,seats={w:null,b:null},result='',remote=null,opened=false,selected=null,pendingTalk=null,talks={},lastTalk='',origin=null,positions=new Map(),drawOffer=null;
const id=()=>A.mp().active?A.mp().myId:'solo',host=()=>!A.mp().active||A.mp().isHost;
const isHub=()=>A.g()?.hub&&!A.g().riftHall&&!A.g().sparringRoom;
const owned=()=>host()?!!A.meta().hubUpgrades?.chess:!!remote?.owned;
const current=()=>host()?snapshot():remote;
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function positionKey(){return game.fen().split(' ').slice(0,4).join(' ')}
function recordPosition(){const k=positionKey();positions.set(k,(positions.get(k)||0)+1)}
recordPosition();
function snapshot(){return {owned:!!A.meta().hubUpgrades?.chess,fen:game.fen(),rev,seats:{...seats},result,drawOffer,talks:structuredClone(talks),claim:game.isThreefoldRepetition()||game.isDrawByFiftyMoves()};}
function reset(){close();game=new Chess();positions.clear();recordPosition();drawOffer=null;rev=0;seats={w:null,b:null};result='';remote=null;talks={};pendingTalk=null;lastTalk='';}
function apply(packet){if(!packet||typeof packet.fen!=='string')return;const changed=!remote||packet.rev!==remote.rev||packet.fen!==remote.fen;remote=packet;if(changed&&opened){selected=null;render();}followTalk();}
function send(cmd){if(host())receive(id(),cmd);else A.mp().hostConn?.send({t:'socialRequest',command:cmd});}
function actor(pid){return pid===id()?A.g()?.p:A.mp().peers[pid];}
function valid(pid,point){const p=actor(pid);return isHub()&&p&&!p.dead&&!p.downed&&p.hp>0&&(pid===id()||p.zone===A.mp().zone&&!p.hall)&&Math.hypot(p.x-point.x,p.z-point.z)<170;}
function receive(pid,c){if(!host()||!c||typeof c.type!=='string')return false;
 if(c.type.startsWith('talk')){
  const n=A.g()?.hubNpcs?.find(n=>n.id===c.npc);if(!n||!valid(pid,n))return false;const t=talks[c.npc];
  if(c.type==='talkStart'){if(!t)talks[c.npc]={owner:pid,line:null};}
  else if(t?.owner===pid){if(c.type==='talkEnd')delete talks[c.npc];else if(c.type==='talkLine'&&(c.line===null||typeof c.line==='string'&&c.line.length<120))t.line=c.line;}
  rev++;followTalk();return true;
 }
 if(!owned()||!valid(pid,table))return false;
 if(c.type==='sit'){if(!Object.values(seats).includes(pid)){if(!seats.w)seats.w=pid;else if(!seats.b)seats.b=pid;}rev++;}
 else if(c.type==='move'){if(c.rev!==rev||result||seats[game.turn()]!==pid)return false;try{game.move({from:c.from,to:c.to,promotion:c.promotion||'q'});}catch{return false;}recordPosition();drawOffer=null;if(game.isCheckmate())result=(game.turn()==='w'?'Black':'White')+' wins by checkmate';else if(game.isStalemate())result='Draw · stalemate';else if(game.isInsufficientMaterial())result='Draw · insufficient material';else if(positions.get(positionKey())>=5)result='Draw · fivefold repetition';else if(+game.fen().split(' ')[4]>=150)result='Draw · 75 moves without a capture or pawn move';rev++;}
 else if(c.type==='claim'&&!result&&seats[game.turn()]===pid&&(game.isThreefoldRepetition()||game.isDrawByFiftyMoves())){result='Draw claimed';rev++;}
 else if(c.type==='draw'&&!result&&Object.values(seats).includes(pid)){if(drawOffer&&drawOffer!==pid){result='Draw by agreement';drawOffer=null;}else drawOffer=pid;rev++;}
 else if(c.type==='resign'&&Object.values(seats).includes(pid)){result=(seats.w===pid?'Black':'White')+' wins by resignation';rev++;}
 else if(c.type==='new'&&result&&Object.values(seats).includes(pid)){game=new Chess();positions.clear();recordPosition();drawOffer=null;result='';rev++;}
 else return false;
 if(opened)render();return true;
}
function requestTalk(n){pendingTalk=n.id;send({type:'talkStart',npc:n.id});followTalk();return true;}
function followTalk(){const all=host()?talks:remote?.talks||{};
 if(pendingTalk&&all[pendingTalk]&&window.BFHubDialogue?.known(pendingTalk)){const npc=pendingTalk;pendingTalk=null;const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(n){if(all[npc].owner===id())A.openTalk(n);else A.listen(n,all[npc].line);}}
 const active=window.BFHubDialogue?.active;if(active?.spectator){const t=all[active.n.id];if(!t)BFHubDialogue.close(false,true);else A.listen(active.n,t.line);}
}
function tick(){
 if(host()&&A.mp().active)for(const side of ['w','b'])if(seats[side]&&seats[side]!==id()&&!A.mp().peers[seats[side]]){seats[side]=null;drawOffer=null;rev++;if(opened)render();}
 const g=A.g();if(isHub()&&owned()&&!g._chessCollision){g._chessCollision=true;g.obstacles.push({kind:'col',x:table.x,z:table.z,w:84,d:84,h:27,socialChess:true,invisible:true});}

 if(host())for(const [npc,t]of Object.entries(talks)){const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(!n||!valid(t.owner,n)){delete talks[npc];rev++;}}
 followTalk();const active=window.BFHubDialogue?.active,all=host()?talks:remote?.talks||{};
 for(const [npc,t]of Object.entries(all))if(t.owner===id()){
  const line=active&&!active.external&&!active.spectator&&active.n.id===npc?active.lineId:null;
  if(!active||active.n.id!==npc){send({type:'talkEnd',npc});lastTalk='';}
  else if(lastTalk!==npc+':'+line){lastTalk=npc+':'+line;send({type:'talkLine',npc,line});}
 }
 if(opened&&(!isHub()||!owned()||A.g()?.p?.dead))close();
}
function open(){if(!isHub()||!owned())return;opened=true;origin={g:A.g(),x:A.g().p.x,z:A.g().p.z,y:A.g().p.y};send({type:'sit'});A.enter('chess');render();}
function close(){if(!opened)return;opened=false;selected=null;document.getElementById('socialBoard')?.remove();if(A.g()?.p){A.g().p.sitting=false;if(origin?.g===A.g())Object.assign(A.g().p,{x:origin.x,y:origin.y,z:origin.z});}origin=null;A.resume();}
const glyph={wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
function render(){if(!opened)return;const st=current();if(!st)return;let c;try{c=new Chess(st.fen);}catch{return;}const mine=st.seats.w===id()?'w':st.seats.b===id()?'b':null;
 if(mine){const p=A.g().p;p.sitting=true;Object.assign(p,{x:table.x+(mine==='w'?-58:58),z:table.z,y:0,yaw:mine==='w'?Math.PI/2:-Math.PI/2,vx:0,vz:0});}
 let root=document.getElementById('socialBoard');if(!root){root=document.createElement('section');root.id='socialBoard';root.className='social-panel';document.body.append(root);}
 const legal=selected?c.moves({square:selected,verbose:true}).map(m=>m.to):[];
 const squares=Array.from({length:64},(_,i)=>{const rank=mine==='b'?1+Math.floor(i/8):8-Math.floor(i/8),file=mine==='b'?7-i%8:i%8,sq='abcdefgh'[file]+rank,p=c.get(sq);return `<button class="chess-square ${(rank+file)%2?'light':'dark'} ${sq===selected?'selected':''} ${legal.includes(sq)?'legal':''}" data-square="${sq}" aria-label="${sq}${p?' '+p.color+' '+p.type:''}">${p?'<span style="color:'+(p.color==='w'?'#fff4d8':'#161f27')+';text-shadow:0 1px 1px '+(p.color==='w'?'#303630':'#eee2c0')+'">'+glyph['b'+p.type]+'</span>':''}</button>`;}).join('');
 root.innerHTML=`<h2>Waystation chess</h2><p>${esc(st.result||((c.turn()==='w'?'White':'Black')+' to move'+(c.isCheck()?' · Check':'')))} · ${mine?'You play '+(mine==='w'?'White':'Black'):'Watching'}</p><div class="chess-grid">${squares}</div><p>Choose a piece, then a highlighted square.${!st.seats.b?' Invite a friend to play Black.':''}</p><label>Promote to <select id="chessPromotion"><option value="q">Queen</option><option value="r">Rook</option><option value="b">Bishop</option><option value="n">Knight</option></select></label><div><button id="chessLeave">Leave table · Esc</button>${mine&&!st.result?'<button id="chessResign">Resign</button><button id="chessDraw">'+(st.drawOffer&&st.drawOffer!==id()?'Accept draw':'Offer draw')+'</button>':''}${mine&&mine===c.turn()&&st.claim&&!st.result?'<button id="chessClaim">Claim draw</button>':''}${mine&&st.result?'<button id="chessNew">New game</button>':''}</div><small>The position stays for this session. The host owns this table.</small>`;
 root.querySelectorAll('[data-square]').forEach(b=>b.onclick=()=>{if(!mine||c.turn()!==mine||st.result)return;const sq=b.dataset.square;if(selected&&legal.includes(sq)){const promotion=root.querySelector('#chessPromotion').value;send({type:'move',from:selected,to:sq,promotion,rev:st.rev});selected=null;}else{selected=c.get(sq)?.color===mine?sq:null;render();}});
 root.querySelector('#chessLeave').onclick=close;for(const [key,type]of [['chessDraw','draw'],['chessResign','resign'],['chessClaim','claim'],['chessNew','new']]){const b=root.querySelector('#'+key);if(b)b.onclick=()=>send({type});}
}
function interaction(){return isHub()&&owned()&&Math.hypot(A.g().p.x-table.x,A.g().p.z-table.z)<135?{...table,y:105,label:'Sit at the chess table',act:open}:null;}
function draw(){if(!isHub()||!owned())return;const b=A.box,{x,z}=table;b(x,24,z,84,6,84,'#825d38');for(const dx of [-32,32])for(const dz of [-32,32])b(x+dx,11,z+dz,6,22,6,'#59432f');for(const side of [-1,1]){b(x+side*58,12,z,30,4,30,'#907347');b(x+side*72,26,z,4,32,30,'#765633');for(const dx of [-10,10])for(const dz of [-10,10])b(x+side*58+dx,5,z+dz,4,10,4,'#59432f');}
 for(let r=0;r<8;r++)for(let f=0;f<8;f++)b(x-31.5+f*9,28,z-31.5+r*9,9,1,9,(r+f)%2?'#4c584c':'#d8c8a2');
 const st=current();if(!st)return;const rows=st.fen.split(' ')[0].split('/');for(let r=0;r<8;r++){let f=0;for(const v of rows[r]){if(/\d/.test(v)){f+=+v;continue;}const px=x+31.5-r*9,pz=z-31.5+f*9,col=v===v.toUpperCase()?'#eee0bd':'#343540',h={p:5,r:7,n:8,b:9,q:11,k:12}[v.toLowerCase()];b(px,29+h/2,pz,3,h,3,col);b(px,30,pz,6,2,6,col);if('kq'.includes(v.toLowerCase()))b(px,29+h,pz,6,2,3,col);if(v.toLowerCase()==='n')b(px+1,28+h,pz,5,3,3,col);f++;}}
}
const style=document.createElement('style');style.textContent='.social-panel{position:fixed;z-index:110;inset:3% auto auto 50%;transform:translateX(-50%);width:min(480px,94vw);max-height:92vh;overflow:auto;background:#18242df5;border:1px solid #b89c61;border-radius:14px;padding:16px;box-sizing:border-box;color:#f2e4c2;font:14px/1.4 system-ui}.social-panel h2,.social-panel p{margin:6px 0}.social-panel button,.social-panel select{padding:9px;background:#394b50;color:#fff;border:1px solid #82908a;border-radius:5px;margin:4px}.chess-grid{display:grid;grid-template-columns:repeat(8,1fr);aspect-ratio:1}.chess-grid .chess-square{margin:0;padding:0;border:0;border-radius:0;font-size:clamp(23px,5vw,40px);line-height:1;text-shadow:0 1px 2px #000}.chess-square.light{background:#c9b68e}.chess-square.dark{background:#526350}.chess-square.selected{outline:3px solid #ffd55c;outline-offset:-3px}.chess-square.legal{box-shadow:inset 0 0 0 4px #72c89d}';document.head.append(style);
window.addEventListener('keydown',e=>{if(opened&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
window.BFSocial={snapshot,apply,receive,reset,tick,open,close,interaction,draw,requestTalk,get owned(){return owned()},get cost(){return cost}};
