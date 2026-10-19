import {Chess} from './vendor/chess-1.4.0.mjs';
// Consistent readable hierarchy for carved pieces, fallback pieces and the moving hand.
export const CHESS_PIECE_HEIGHTS={p:2.5,r:2.85,n:3.25,b:3.5,q:4.3,k:4.8};
// Shared world coordinates keep chairs, both players and companions out of the table.
export const CHESS_SEAT_DISTANCE=34;
export function chessSeat(table,color,npc=false){return {x:table.x+(color==='w'?-CHESS_SEAT_DISTANCE:CHESS_SEAT_DISTANCE),y:npc?-4:0,z:table.z,yaw:color==='w'?Math.PI/2:-Math.PI/2};}
export function chessCompanion(table,color){const x=table.x+(color==='w'?-58:58),z=table.z+46;return {x,y:0,z,yaw:Math.atan2(table.x-x,table.z-z),sitting:true,bob:0};}
export function chessHistoryView(state,cursor){const history=state.history||[],ply=cursor==null?history.length:Math.max(0,Math.min(history.length,cursor));return {history,ply,review:cursor!=null,fen:cursor==null?state.fen:ply?history[ply-1].fen:state.initialFen||state.fen};}
export function chessLastMove(state,cursor,side){const h=state.history||[];if(cursor!=null)return h[Math.max(0,cursor)-1]||null;for(let i=h.length-1;i>=0;i--)if(!side||h[i].color!==side)return h[i];return null;}

export function chessHistoryFromSAN(moves,initialFen){const c=new Chess(initialFen),history=[];for(const san of moves){const m=c.move(san);history.push({from:m.from,to:m.to,san:m.san,color:m.color,before:m.before,fen:c.fen()});}return history;}

// Fade only a chair back lying on a sight line to the board, never the far chair.
export function chessChairBlocksBoard(camera,table,side){
 const o=camera.eye,cx=table.x+side*(CHESS_SEAT_DISTANCE+8);
 for(const [dx,dz]of [[0,0],[-6,-6],[-6,6],[6,-6],[6,6]]){
  const end={x:table.x+dx,y:23.2,z:table.z+dz};let lo=0,hi=1;
  for(const [axis,min,max]of [['x',cx-1.5,cx+1.5],['y',10,38],['z',table.z-10,table.z+10]]){
   const d=end[axis]-o[axis];if(Math.abs(d)<1e-8){if(o[axis]<min||o[axis]>max){hi=-1;break;}}else{const a=(min-o[axis])/d,b=(max-o[axis])/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)break;}
  }
  if(lo<=hi&&hi>0&&lo<.995)return true;
 }
 return false;
}
