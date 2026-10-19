import {Chess} from './vendor/chess-1.4.0.mjs';
// Candidates include occupied friendly squares for a recapture after that piece is taken.
// Occupied squares still stop sliding rays; the real position is validated on execution.
export function premoveTargets(fen,from,side){
 const c=new Chess(fen),p=c.get(from);if(!p||p.color!==side)return [];
 const x=from.charCodeAt(0)-97,y=+from[1]-1,out=[],at=(a,b)=>a>=0&&a<8&&b>=0&&b<8?'abcdefgh'[a]+(b+1):null;
 const add=(a,b)=>{const sq=at(a,b);if(!sq)return false;const hit=c.get(sq);out.push(sq);return !hit;};
 if(p.type==='p'){const d=side==='w'?1:-1;if(!c.get(at(x,y+d))&&add(x,y+d)&&(y===(side==='w'?1:6))&&!c.get(at(x,y+2*d)))add(x,y+2*d);for(const dx of [-1,1])add(x+dx,y+d);}
 else if(p.type==='n'){for(const [a,b]of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]])add(x+a,y+b);}
 else if(p.type==='k'){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(a||b)add(x+a,y+b);const rank=side==='w'?'1':'8',rights=fen.split(' ')[2];if(from==='e'+rank){for(const [right,to,path]of [[side==='w'?'K':'k','g',['f','g']],[side==='w'?'Q':'q','c',['d','c','b']]])if(rights.includes(right)&&path.every(f=>!c.get(f+rank)))out.push(to+rank);}}
 else {const dirs=p.type==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:p.type==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];for(const [a,b]of dirs)for(let n=1;n<8;n++)if(!add(x+a*n,y+b*n))break;}
 return out;
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
