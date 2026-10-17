export const THOMAS_CAPE='checkmate';
export function thomasHardVictory({solo,difficulty,seats,result,playerId}){
 if(!solo||difficulty!=='hard')return false;
 const winner=/^(White|Black) wins (?:by checkmate|on time)$/.exec(result||'');
 if(!winner)return false;
 const side=winner[1]==='White'?'w':'b';
 return seats?.[side]===playerId&&seats?.[side==='w'?'b':'w']==='chess-thomas';
}
