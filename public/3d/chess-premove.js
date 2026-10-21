import {Chess} from './vendor/chess-1.4.0.mjs';
// A premove is an intention, not a move in the current position. Any other square
// is allowed, including blocked paths and occupied squares. Only take() checks legality.
export function premoveTargets(fen,from,side){
 const c=new Chess(fen),p=c.get(from);if(!p||p.color!==side)return [];
 return Array.from({length:64},(_,i)=>'abcdefgh'[i%8]+(1+Math.floor(i/8))).filter(sq=>sq!==from);
}
export class PremoveQueue{
 constructor(){this.move=null;}
 clear(){this.move=null;}
 set(st,side,from,to,promotion='q'){
  if(!side||st.result||!st.clock?.started||!premoveTargets(st.fen,from,side).includes(to))return false;
  this.move={from,to,promotion:['q','r','b','n'].includes(promotion)?promotion:'q',side,round:st.round,ply:st.history?.length??st.moves?.length??0};return true;
 }
 take(st,side){
  const q=this.move;if(!q)return null;
  const ply=st.history?.length??st.moves?.length??0;
  if(!side||q.side!==side||q.round!==st.round||st.result||!st.clock?.started||ply<q.ply||ply>q.ply+1){this.clear();return {cancelled:true};}
  if(st.motion&&!st.motion.done)return null; // Wait for host acknowledgement, including on guests.
  const c=new Chess(st.fen);if(c.turn()!==side)return null;
  this.clear();const legal=c.moves({square:q.from,verbose:true}).find(m=>m.to===q.to&&(!m.promotion||m.promotion===q.promotion));
  return legal?{type:'move',from:q.from,to:q.to,promotion:q.promotion,rev:st.rev}:{cancelled:true};
 }
}
