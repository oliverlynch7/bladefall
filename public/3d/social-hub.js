import {waystationScene} from './npc-roster.js?v=2309';
import {thomasHardVictory} from './chess-rewards.js?v=2227a';
import {chessSeat,chessCompanion,chessHistoryFromSAN} from './chess-presentation.js?v=2226e';
import './chess-pieces.js?v=2322';
import {ChessOpponent} from './chess-opponent.mjs?v=2119';
import {ChessRoom} from './chess-room.mjs?v=2305';
import {createChessTable} from './chess-table.js?v=2322';
const A=window.__BF_SOCIAL_API,table={x:300,z:390},cost=1000,botId='chess-thomas';
let opened=false,origin=null,parkedPet=null,remote=null,remoteAt=0,talks={},pendingTalk=null,lastTalk='',talkRev=0,wasCoop=false,lastView='',lastDisplay='',lastLobby='',ambientGame='duel',nextRewardAttempt=0;
const id=()=>A.mp().active?A.mp().myId:'solo',host=()=>!A.mp().active||A.mp().isHost;
const isHub=()=>waystationScene(A.g());
const owned=()=>host()?!!A.meta().hubUpgrades?.chess:!!remote?.owned;
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=pid=>pid===id()?'You':A.mp().peers[pid]?.name||'Friend';
function actor(pid){return pid===id()?A.g()?.p:A.mp().peers[pid];}
function valid(pid,point=table){const p=actor(pid);return isHub()&&p&&!p.dead&&!p.downed&&p.hp>0&&(pid===id()||A.mp().active&&p.zone===A.mp().zone&&!p.hall)&&Math.hypot(p.x-point.x,p.z-point.z)<170;}
const makeRoom=()=>new ChessRoom({valid,opponent:()=>new ChessOpponent()});let room=makeRoom();
const view=()=>host()?room.views[id()]:remote?.views?.[id()];
function games(){return host()?Object.fromEntries([...room.sessions].map(([k,s])=>[k,s.snapshot()])):remote?.games||{};}
function current(){const v=view(),all=games();return v?all[v.gameId]||null:null;}
function tableState(){const key=host()?room.tableGame()?.key:remote?.tableGameId;return key?games()[key]:null;}
function arrival(){const a=host()?room.thomasArrival:remote?.thomasArrival;if(!a)return null;return {...a,elapsed:host()?Math.max(0,performance.now()-a.at):a.elapsed+Math.max(0,performance.now()-remoteAt)};}
function atSeat(pid,st){const v=host()?room.views[pid]:remote?.views?.[pid];return !!pid&&valid(pid)&&v?.gameId===st.gameId&&!v.watching;}
function canThomas(){if(A.g()?.storyState?.conversation?.npc==='thomas')return false;const st=tableState();return !st||st.kind==='thomas'?(!st||st.owner===id()):!st.history?.length&&!st.moves?.length&&!Object.values(st.seats).some(p=>p&&p!==id()&&atSeat(p,st));}
function displayState(){const st=current();if(!st)return null;const v=view(),elapsed=host()||st.paused?0:Math.max(0,performance.now()-remoteAt),clock=st.clock?{...st.clock,left:{...st.clock.left}}:null;if(clock?.running)clock.left[clock.running]=Math.max(0,clock.left[clock.running]-elapsed/1000);const side=st.seats.w===(st.owner||id())?'w':'b';return {...st,coop:A.mp().active,waitingFriend:st.kind==='duel'&&!Object.values(st.seats).every(p=>atSeat(p,st)),arriving:st.kind==='thomas'&&arrival()?.gameId===st.gameId&&arrival().elapsed<arrival().duration,canThomas:canThomas(),playerNames:Object.fromEntries(Object.entries(st.seats).map(([c,p])=>[c,p===botId?'Thomas':p?name(p):'Empty seat'])),invitationFrom:name((host()?room.invites:remote?.invites||{})[id()]),hasInvitation:!!(host()?room.invites:remote?.invites||{})[id()],watching:!!v?.watching,viewSide:v?.watching?side:null,canConfigure:!v?.watching&&(st.owner||st.controller||st.seats.w)===id(),capeUnlocked:!!A.meta().cosmetics?.['cape:checkmate'],clock,motion:st.motion?{...st.motion,elapsed:Math.min(st.motion.duration,st.motion.elapsed+elapsed)}:null};}
function snapshot(network=false){if(network&&!host())return remote;const all=games(),base=current()||all.duel;if(!network)return {...base,tableGameId:tableState()?.gameId||null,owned:owned(),talks:structuredClone(host()?talks:remote?.talks||{})};const packet=room.snapshot();return {...packet.games.duel,...packet,owned:!!A.meta().hubUpgrades?.chess,talks:structuredClone(talks),talkRev};}
function apply(packet){if(!packet||!packet.games||host()||remote&&packet.serial<remote.serial)return;
 const decoded={};try{for(const [key,st]of Object.entries(packet.games)){if(!st||typeof st.fen!=='string'||!Array.isArray(st.moves))continue;const cache=st.round+':'+st.moves.join('|'),prior=remote?.games?.[key];decoded[key]={...st,history:prior?._historyKey===cache?prior.history:chessHistoryFromSAN(st.moves,st.initialFen),_historyKey:cache};}}catch{return;}
 remote={...packet,games:decoded};remoteAt=performance.now();syncView();claimReward();followTalk();
}
function send(cmd){const c={...cmd,round:cmd.round??current()?.round,gameId:cmd.gameId||view()?.gameId};if(host())receive(id(),c);else A.mp().hostConn?.send({t:'socialRequest',command:c});}
function receive(pid,c){syncMode();if(!host()||!c||typeof c.type!=='string')return false;
 if(c.type.startsWith('talk')){const n=A.g()?.hubNpcs?.find(n=>n.id===c.npc);if(!n||!valid(pid,n))return false;const t=talks[c.npc];if(c.type==='talkStart'){if(!t)talks[c.npc]={owner:pid,line:null};}else if(t?.owner===pid){if(c.type==='talkEnd')delete talks[c.npc];else if(c.type==='talkLine'&&(c.line===null||typeof c.line==='string'&&c.line.length<120))t.line=c.line;}talkRev++;followTalk();return true;}
 if(!owned()||c.type==='thomas'&&A.g()?.storyState?.conversation?.npc==='thomas')return false;const accepted=room.command(pid,c);if(accepted){room.tick();syncView();claimReward();}return accepted;
}
function claimReward(){if(A.meta().cosmetics?.['cape:checkmate']||performance.now()<nextRewardAttempt)return;for(const s of Object.values(games()))if(s.kind==='thomas'&&s.owner===id()&&thomasHardVictory({solo:true,difficulty:s.difficulty,seats:s.seats,result:s.result,playerId:id()})){nextRewardAttempt=performance.now()+5000;A.awardChessCape?.();break;}}
function requestTalk(n){pendingTalk=n.id;send({type:'talkStart',npc:n.id});followTalk();return true;}
function followTalk(){const all=host()?talks:remote?.talks||{};
 if(pendingTalk&&all[pendingTalk]&&window.BFHubDialogue?.known(pendingTalk)){const npc=pendingTalk;pendingTalk=null;const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(n){if(all[npc].owner===id())A.openTalk(n);else A.listen(n,all[npc].line);}}
 const active=window.BFHubDialogue?.active;if(active?.spectator){const t=all[active.n.id];if(!t)BFHubDialogue.close(false,true);else A.listen(active.n,t.line);}
}

function syncMode(){if(A.mp().active===wasCoop)return false;wasCoop=A.mp().active;room.dispose();room=makeRoom();remote=null;lastView='';lastDisplay='';lastLobby='';talks={};talkRev++;if(opened){tableView.close();A.g().p.sitting=false;if(!A.mp().active)room.command(id(),{type:'thomas'});}return true;}
function restorePet(){if(parkedPet){if(A.g()===parkedPet.g&&A.g()?.pet===parkedPet.pet)Object.assign(parkedPet.pet,parkedPet.pose);parkedPet=null;}}
function companionPose(p){if(!opened||p!==A.g()?.p)return null;const st=current(),v=view(),color=st&&!v?.watching?(st.seats.w===id()?'w':st.seats.b===id()?'b':null):null;return color?chessCompanion(table,color):v?.watching?{x:table.x+100,y:0,z:table.z+65,yaw:Math.PI,sitting:true,bob:0}:null;}
function parkPet(){const g=A.g(),pet=g?.pet,pose=companionPose(g?.p);if(!pet||!pose){restorePet();return;}if(parkedPet?.pet!==pet){restorePet();parkedPet={g,pet,pose:{x:pet.x,y:pet.y,z:pet.z,yaw:pet.yaw,sitting:!!pet.sitting}};}Object.assign(pet,pose);pet.breathT=0;pet.atkT=Math.max(.5,pet.atkT||0);}
function lobbyHTML(){
 const st=tableState(),own=games()['thomas:'+id()],watch=st&&st.owner!==id()&&!Object.values(st.seats).includes(id());
 return `<header class="chess-lobby-head"><span class="chess-eyebrow">THE WAYSTATION · CHESS</span><h2>A seat at the table</h2><p>${st?.kind==='thomas'?(st.owner===id()?'Your match with Thomas is waiting.':'Your friend is playing Thomas. Watch until their game ends.'):st?'Your friend is at the board. Join them for a match.':'Sit down for a match with your friend.'}</p></header><section class="chess-lobby-main">${watch?`<button class="chess-primary" data-watch="${esc(st.gameId)}">Watch this game</button>`:st?.kind==='thomas'?'<button class="chess-primary" id="chessResumeThomas">Resume your match</button>':'<button class="chess-primary" id="chessJoin">Sit down · Play a friend</button>'}</section>${canThomas()&&st?.kind!=='thomas'?`<section class="chess-lobby-option"><h3>Play against Thomas</h3><p>Invite him over while the other chair is free.</p><button id="chessThomas">${own?.history?.length&&!own.result?'Resume with':'Invite'} Thomas</button><small>Easy, Medium or Hard · Choose after sitting down.</small></section>`:''}<footer><button id="chessLobbyLeave">Leave table · Q</button><small>W / S or ↑ / ↓ · ${esc(window.__BF3?.controlKey?.('interact')||'E')} select</small></footer>`;
}
function renderLobby(){if(!opened||current())return;let root=document.getElementById('chessLobby');const first=!root;if(!root){root=document.createElement('section');root.id='chessLobby';root.className='social-panel';root.setAttribute('aria-label','Chess lobby');root.setAttribute('data-dialogue-menu','');document.body.append(root);}const html=lobbyHTML();if(html===lastLobby)return;lastLobby=html;root.innerHTML=html;
 root.querySelector('#chessThomas')?.addEventListener('click',()=>send({type:'thomas'}));root.querySelector('#chessResumeThomas')?.addEventListener('click',()=>send({type:'thomas'}));root.querySelector('#chessJoin')?.addEventListener('click',()=>send({type:'join'}));root.querySelectorAll('[data-watch]').forEach(b=>b.onclick=()=>send({type:'watch',gameId:b.dataset.watch}));root.querySelector('#chessLobbyLeave').onclick=close;window.BFMenuClose?.mount(root,()=>root.querySelector('#chessLobbyLeave'));if(first)window.BFHubDialogue?.selectFirst(root);
}
function syncView(){if(!opened)return;const v=view(),st=current(),key=st?v.gameId+':'+!!v.watching:'lobby';if(key!==lastView){lastView=key;lastDisplay='';lastLobby='';tableView.close();document.getElementById('chessLobby')?.remove();restorePet();A.g().p.sitting=false;if(origin?.g===A.g())Object.assign(A.g().p,{x:origin.x,y:origin.y,z:origin.z});if(v?.watching)Object.assign(A.g().p,{x:table.x+76,z:table.z+42});}
 if(!st){renderLobby();return;}ambientGame=v.gameId;const stamp=key+':'+st.round+':'+st.rev+':'+((host()?room.invites:remote?.invites||{})[id()]||'');if(stamp!==lastDisplay){lastDisplay=stamp;render();}}
function tick(){
 syncMode();if(host())room.tick();syncView();claimReward();if(current())tableView.tick();parkPet();
 const g=A.g();if(isHub()&&owned()&&!g._chessCollision){g._chessCollision=true;g.obstacles.push({kind:'col',x:table.x,z:table.z,w:36,d:40,h:22,socialChess:true,invisible:true});}
 if(host())for(const [npc,t]of Object.entries(talks)){const n=A.g()?.hubNpcs?.find(n=>n.id===npc);if(!n||!valid(t.owner,n)){delete talks[npc];talkRev++;}}
 followTalk();const active=window.BFHubDialogue?.active,all=host()?talks:remote?.talks||{};
 for(const [npc,t]of Object.entries(all))if(t.owner===id()){const line=active&&!active.external&&!active.spectator&&active.n.id===npc?active.lineId:null;if(!active||active.n.id!==npc){send({type:'talkEnd',npc});lastTalk='';}else if(lastTalk!==npc+':'+line){lastTalk=npc+':'+line;send({type:'talkLine',npc,line});}}
 if(opened&&(!isHub()||!owned()||A.g()?.p?.dead))close();
}
function open(){if(!isHub()||!owned()||opened)return;syncMode();opened=true;document.body.classList.add('chess-view');origin={g:A.g(),x:A.g().p.x,y:A.g().p.y,z:A.g().p.z};A.enter('chess');if(!A.mp().active)send({type:'thomas'});else send({type:'join'});syncView();}
function lobby(){if(!opened)return;send({type:'lobby'});syncView();}
function close(){if(!opened)return;send({type:'leave'});opened=false;lastView='';lastDisplay='';lastLobby='';document.getElementById('chessLobby')?.remove();document.body.classList.remove('chess-view');restorePet();tableView.close();if(A.g()?.p){A.g().p.sitting=false;if(origin?.g===A.g())Object.assign(A.g().p,{x:origin.x,y:origin.y,z:origin.z});}origin=null;A.resume();}
function reset(){close();visitor=null;room.dispose();room=makeRoom();remote=null;talks={};pendingTalk=null;lastTalk='';talkRev=0;nextRewardAttempt=0;lastView='';lastDisplay='';lastLobby='';window.BFChessPieces?.hide();}
function render(){if(opened&&current()){tableView.render();parkPet();}}
function interaction(){const st=tableState(),watch=st?.kind==='thomas'&&st.owner!==id();return !opened&&isHub()&&owned()&&Math.hypot(A.g().p.x-table.x,A.g().p.z-table.z)<135?{...table,y:105,label:watch?'Watch '+name(st.owner)+' vs Thomas':st?.owner===id()?'Resume chess with Thomas':A.mp().active?'Sit down · Play a friend':'Play chess with Thomas',act:open}:null;}
function draw(){if(isHub()&&owned())tableView.draw();else window.BFChessPieces?.hide();}
function ambientState(){const all=games(),st=tableState();return st?(current()?.gameId===st.gameId?displayState():st):displayState()||all[ambientGame]||all.duel;}
function peerVisible(q){const st=current();return !opened||!st||!q.sitting||Object.values(st.seats).includes(q.id);}
function peerPose(q){const st=current();if(!opened||!st||!q.sitting||!Object.values(st.seats).includes(q.id))return null;return {...chessSeat(table,st.seats.w===q.id?'w':'b'),sitting:true,vx:0,vy:0,vz:0};}
let visitor=null;
function thomasPose(n){
 if(n!=='thomas')return null;if(!isHub()||!owned()){visitor=null;return null;}if(visitor?.world&&visitor.world!==A.g())visitor=null;
 const st=tableState(),homeNpc=A.g().hubNpcs?.find(n=>n.id==='thomas'),home={x:(homeNpc?.x??300)+13,y:homeNpc?.y||0,z:homeNpc?.z??350},now=performance.now();
 const key=st?.kind==='thomas'?st.gameId+':'+st.round:null;
 if(key){const seat=chessSeat(table,st.seats.w===botId?'w':'b',true),a=arrival(),t=Math.min(1,(a?.gameId===st.gameId?a.elapsed/a.duration:1));visitor={key,home,seat,world:A.g(),last:walkPose(home,seat,t)};return {...visitor.last,peerId:botId};}
 if(!visitor)return null;
 if(!visitor.leaving){visitor.leaving=now;visitor.from={...visitor.last};visitor.duration=Math.max(400,Math.hypot(visitor.from.x-home.x,visitor.from.z-home.z)/40*1000);}
 const t=(now-visitor.leaving)/visitor.duration;if(t>=1){visitor=null;return null;}return {...walkPose(visitor.from,home,t),peerId:botId,sitting:false,walking:true};
}
function walkPose(from,to,t){
 const path=[from,{x:to.x,y:0,z:Math.min(from.z,to.z)-18},to],lengths=[Math.hypot(path[1].x-from.x,path[1].z-from.z),Math.hypot(to.x-path[1].x,to.z-path[1].z)];let distance=Math.max(0,Math.min(1,t))*(lengths[0]+lengths[1]),i=distance>lengths[0]?1:0;if(i)distance-=lengths[0];const a=path[i],b=path[i+1],f=lengths[i]?Math.min(1,distance/lengths[i]):1;
 const seatBlend=Math.max(0,Math.min(1,(t-.88)/.12)),yaw=Math.atan2(b.x-a.x,b.z-a.z),turn=Math.atan2(Math.sin((to.yaw||0)-yaw),Math.cos((to.yaw||0)-yaw));return {x:a.x+(b.x-a.x)*f,y:(to.y||0)*seatBlend,z:a.z+(b.z-a.z)*f,yaw:yaw+turn*seatBlend,sitting:t>=.88,seatBlend,walking:t<.88,vx:0,vz:0};
}
const style=document.createElement('style');style.textContent='.social-panel{position:fixed;z-index:112;inset:4% auto auto 50%;transform:translateX(-50%);width:min(480px,94vw);max-height:90vh;overflow:auto;background:#18242df5;border:1px solid #b89c61;border-radius:14px;padding:20px;box-sizing:border-box;color:#f2e4c2;font:14px/1.4 system-ui}.social-panel h2,.social-panel p{margin:8px 0}.social-panel button{display:block;width:100%;padding:12px;background:#394b50;color:#fff;border:1px solid #82908a;border-radius:6px;margin:9px 0;cursor:pointer}.social-panel .chess-primary{background:#d7a452;color:#151b21;font-weight:800;min-height:52px}.social-panel #chessThomas{background:#354a51;color:#fff6dc;font-weight:700}.social-panel small{display:block;color:#c6c8bd}.chess-invite{border:2px solid #e6bd5f;padding:10px;border-radius:8px}.chess-eyebrow{font-size:10px;letter-spacing:.15em;color:#d9b66f}.chess-lobby-option{margin:18px 0;padding:14px;border:1px solid #576d75;border-radius:10px;background:#11212a}.social-panel h3{font-size:15px;margin:0 0 5px}.social-panel button:focus-visible{outline:3px solid #ffd570;outline-offset:2px}.social-panel footer{border-top:1px solid #576d75;padding-top:10px}';document.head.append(style);
window.addEventListener('keydown',e=>{if(opened&&['Escape','KeyQ'].includes(e.code)&&!e.target?.matches?.('input,textarea,select,[contenteditable=true]')){e.preventDefault();e.stopImmediatePropagation();close();}},true);
const tableView=createChessTable({A,table,id:()=>view()?.watching?'spectator:'+id():id(),host,opened:()=>opened&&!!current(),state:()=>ambientState(),send,close,lobby});
window.BFSocial={table,companionPose,seatHeight:14,npcPose:thomasPose,camera:()=>opened&&current()?tableView.camera():null,poseFor:p=>tableView.poseFor(p),peerVisible,peerPose,snapshot,apply,receive,reset,tick,open,close,lobby,interaction,draw,requestTalk,get owned(){return owned()},get cost(){return cost}};
