import {ChessSession} from './chess-session.mjs?v=2252';
// One physical board. Stored games survive leaving; only one may occupy the table.
export class ChessRoom{
 constructor({valid=()=>true,now=()=>performance.now(),opponent=()=>null}={}){Object.assign(this,{valid,now,opponent});this.sessions=new Map();this.views={};this.invites={};this.sequence=0;this.tableGameId=null;this.thomasArrival=null;this.sessions.set('duel',new ChessSession('duel',null,{now}));}
 thomas(pid){const key='thomas:'+pid;if(!this.sessions.has(key))this.sessions.set(key,new ChessSession(key,pid,{now:this.now,opponent:this.opponent()}));return this.sessions.get(key);}
 tableGame(){const s=this.sessions.get(this.tableGameId);if(!s||s.result)return null;if(s.kind==='thomas')return this.valid(s.owner)?s:null;return Object.values(s.seats).some(p=>p&&this.valid(p)&&this.views[p]?.gameId===s.key&&!this.views[p].watching)?s:null;}
 seated(pid,s){return !!pid&&this.valid(pid)&&this.views[pid]?.gameId===s.key&&!this.views[pid].watching;}
 watch(pid,s){if(!s||s.owner===pid||Object.values(s.seats).includes(pid))return false;this.views[pid]={gameId:s.key,watching:true};return true;}
 occupy(s,pid){this.tableGameId=s.key;for(const [other,v]of Object.entries(this.views))if(other!==pid&&v.gameId!==s.key&&(v.watching||this.sessions.get(v.gameId)?.result))this.views[other]={gameId:s.key,watching:true};}
 activateThomas(pid,s){this.occupy(s,pid);this.views[pid]={gameId:s.key,watching:false};this.thomasArrival={gameId:s.key,at:this.now(),duration:2200};s.pause();return true;}
 command(pid,c){
  if(!c||typeof c.type!=='string'||typeof pid!=='string')return false;
  if(c.type==='leave'||c.type==='lobby'){const old=this.sessions.get(this.views[pid]?.gameId);if(old)old.rev++;delete this.views[pid];if(c.type==='leave'){
   // Leaving the table lets Thomas return to his quests without discarding the game.
   // A spectator leaving, or opening the opponents lobby, must not evict the owner.
   if(old?.kind==='thomas'&&old.owner===pid&&this.tableGameId===old.key){old.pause();this.tableGameId=null;this.thomasArrival=null;}
   for(const [to,from]of Object.entries(this.invites))if(to===pid||from===pid)delete this.invites[to];
  }return true;}
  if(!this.valid(pid))return false;const active=this.tableGame();
  if(c.type==='join'||c.type==='sit'){
   if(active?.kind==='thomas'){if(active.owner===pid){this.views[pid]={gameId:active.key,watching:false};return true;}return this.watch(pid,active);}
   let s=this.sessions.get('duel');
   if(s.result||(!active&&!Object.values(s.seats).includes(pid)&&Object.values(s.seats).some(Boolean))){const round=s.round+1;for(const [other,v]of Object.entries(this.views))if(v.gameId===s.key&&other!==pid)this.views[other]={gameId:'duel',watching:true};s.dispose();s=new ChessSession('duel',null,{now:this.now});s.round=round;this.sessions.set('duel',s);}
   if(!Object.values(s.seats).includes(pid)){const side=!s.seats.w?'w':!s.seats.b?'b':null;if(!side)return this.watch(pid,s);s.seats[side]=pid;s.clock.ready[side]=false;s.rev++;}
   if(!s.history.length&&(!s.controller||!this.seated(s.controller,s)))s.controller=pid;this.occupy(s,pid);this.views[pid]={gameId:'duel',watching:false};return true;
  }
  if(c.type==='thomas'){
   if(active&&active.owner!==pid&&(active.kind==='thomas'||Object.values(active.seats).some(p=>p&&p!==pid&&this.seated(p,active))||active.history.length))return false;
   if(active?.kind==='duel'){for(const side of ['w','b'])if(active.seats[side]===pid)active.seats[side]=null;active.rev++;}
   const s=this.thomas(pid);if(s.result){if(!s.command(pid,{type:'new'}))return false;}if(active?.key===s.key){this.views[pid]={gameId:s.key,watching:false};return true;}return this.activateThomas(pid,s);
  }
  if(c.type==='watch'){const s=this.sessions.get(c.gameId);return !!s&&s===active&&this.watch(pid,s);}
  if(c.type==='challenge'){if(active?.kind==='thomas'||c.target===pid||!this.valid(c.target))return false;this.invites[c.target]=pid;return true;}
  if(c.type==='decline'){delete this.invites[pid];return true;}
  if(c.type==='accept'){const from=this.invites[pid];if(!from||!this.valid(from)||active?.kind==='thomas')return false;const joined=this.command(from,{type:'join'})&&this.command(pid,{type:'join'});if(joined){delete this.invites[pid];delete this.invites[from];}return joined;}
  if(c.type==='resume'){const s=this.sessions.get(c.gameId);if(!s||!Object.values(s.seats).includes(pid)||active&&active!==s)return false;return s.kind==='thomas'?this.command(pid,{type:'thomas'}):this.command(pid,{type:'join'});}
  const view=this.views[pid],s=this.sessions.get(c.gameId);if(!view||view.watching||view.gameId!==c.gameId||!s||c.round!==s.round||active&&active!==s)return false;
  if(s.kind==='duel'&&c.type==='move'&&!Object.values(s.seats).every(p=>p&&this.seated(p,s)))return false;
  if(s.kind==='thomas'&&c.type==='move'&&this.thomasArrival?.gameId===s.key&&this.now()-this.thomasArrival.at<this.thomasArrival.duration)return false;
  const accepted=s.command(pid,c);if(accepted&&c.type==='new'){this.tableGameId=s.key;if(s.kind==='thomas')this.activateThomas(pid,s);}return accepted;
 }
 tick(){const active=this.tableGame();if(!active)this.tableGameId=null;
  for(const s of this.sessions.values()){
   if(s.kind==='thomas'){const v=this.views[s.owner],arrived=this.thomasArrival?.gameId!==s.key||this.now()-this.thomasArrival.at>=this.thomasArrival.duration;s.tick(s===active&&arrived&&this.valid(s.owner)&&v?.gameId===s.key&&!v.watching);}
   else {const present=Object.values(s.seats).every(p=>p&&this.seated(p,s));s.tick();if(!present&&(s.clock.running||s.clock.enabled&&s.clock.started)){s.clock.suspend(this.now());s.rev++;}}
  }
  for(const [to,from]of Object.entries(this.invites))if(!this.valid(to)||!this.valid(from))delete this.invites[to];
 }
 snapshot(){const s=this.tableGame();return {serial:++this.sequence,tableGameId:s?.key||null,thomasArrival:s?.kind==='thomas'&&this.thomasArrival?{gameId:s.key,elapsed:Math.min(this.thomasArrival.duration,Math.max(0,this.now()-this.thomasArrival.at)),duration:this.thomasArrival.duration}:null,games:Object.fromEntries([...this.sessions].map(([k,s])=>[k,s.snapshot(true)])),views:structuredClone(this.views),invites:{...this.invites}};}
 dispose(){for(const s of this.sessions.values())s.dispose();this.sessions.clear();this.views={};this.invites={};this.tableGameId=null;this.thomasArrival=null;}
}
