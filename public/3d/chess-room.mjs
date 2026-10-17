import {ChessSession} from './chess-session.mjs?v=2252';
export class ChessRoom{
 constructor({valid=()=>true,now=()=>performance.now(),opponent=()=>null}={}){this.valid=valid;this.now=now;this.opponent=opponent;this.sessions=new Map();this.views={};this.invites={};this.sequence=0;this.sessions.set('duel',new ChessSession('duel',null,{now}));}
 thomas(pid){const key='thomas:'+pid;if(!this.sessions.has(key))this.sessions.set(key,new ChessSession(key,pid,{now:this.now,opponent:this.opponent()}));return this.sessions.get(key);}
 command(pid,c){
  if(!c||typeof c.type!=='string'||typeof pid!=='string')return false;
  if(c.type==='leave'||c.type==='lobby'){delete this.views[pid];if(c.type==='leave')for(const [target,from]of Object.entries(this.invites))if(target===pid||from===pid)delete this.invites[target];return true;}
  if(!this.valid(pid))return false;
  if(c.type==='thomas'){const s=this.thomas(pid);this.views[pid]={gameId:s.key,watching:false};return true;}
  if(c.type==='watch'){const s=this.sessions.get(c.gameId);if(!s||s.owner===pid||!Object.values(s.seats).some(p=>p&&p!=='chess-thomas'&&p!==pid))return false;this.views[pid]={gameId:s.key,watching:true};return true;}
  if(c.type==='challenge'){if(c.target===pid||!this.valid(c.target))return false;this.invites[c.target]=pid;return true;}
  if(c.type==='decline'){delete this.invites[pid];return true;}
  if(c.type==='accept'){
   const from=this.invites[pid];if(!from||!this.valid(from))return false;
   let s=this.sessions.get('duel');const occupied=Object.values(s.seats).filter(Boolean),same=occupied.includes(pid)&&occupied.includes(from);
   if(!same&&occupied.some(p=>p!==pid&&p!==from&&this.valid(p)))return false;
   if(!same||s.result){s.dispose();s=new ChessSession('duel',null,{now:this.now});s.seats={w:from,b:pid};s.controller=from;this.sessions.set('duel',s);}
   this.views[from]={gameId:'duel',watching:false};this.views[pid]={gameId:'duel',watching:false};delete this.invites[pid];delete this.invites[from];return true;
  }
  if(c.type==='resume'){const s=this.sessions.get(c.gameId);if(!s||!Object.values(s.seats).includes(pid))return false;this.views[pid]={gameId:s.key,watching:false};return true;}
  const view=this.views[pid],s=this.sessions.get(c.gameId);if(!view||view.watching||view.gameId!==c.gameId||!s)return false;
  if(s.kind==='duel'&&c.type==='move'&&!Object.values(s.seats).every(p=>p&&this.valid(p)))return false;
  return s.command(pid,c);
 }
 tick(){for(const s of this.sessions.values()){if(s.kind==='thomas'){const v=this.views[s.owner];s.tick(this.valid(s.owner)&&v?.gameId===s.key&&!v.watching);}else {const present=Object.values(s.seats).every(p=>p&&this.valid(p));s.tick();if(!present&&(s.clock.running||s.clock.enabled&&s.clock.started)){s.clock.suspend(this.now());s.rev++;}}}for(const [to,from]of Object.entries(this.invites))if(!this.valid(to)||!this.valid(from))delete this.invites[to];}
 snapshot(){return {serial:++this.sequence,games:Object.fromEntries([...this.sessions].map(([key,s])=>[key,s.snapshot(true)])),views:structuredClone(this.views),invites:{...this.invites}};}
 dispose(){for(const s of this.sessions.values())s.dispose();this.sessions.clear();this.views={};this.invites={};}
}
