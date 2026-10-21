// The bench side belongs to Thomas's conversations; the far side belongs to chess.
// Use the actual home position so the boundary follows the table if the hub moves.
export function chessApproach(player,table,thomas){
 if(!player||!table)return false;
 const home=thomas||{x:table.x,z:table.z-40,y:0};
 const dx=player.x-table.x,dz=player.z-table.z;
 const ax=table.x-home.x,az=table.z-home.z,length=Math.hypot(ax,az);
 const farSide=length>0?(dx*ax+dz*az)/length:dz;
 return farSide>=8&&Math.hypot(dx,dz)<110&&Math.abs((player.y||0)-(home.y||0))<65;
}
