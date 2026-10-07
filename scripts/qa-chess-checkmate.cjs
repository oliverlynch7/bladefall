async page=>{
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFSocial&&window.HERO3D?.ready,null,{polling:100});
 return page.evaluate(()=>{
  const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.hubUpgrades={chess:true};b.openHub();b.G.p.x=276;b.G.p.z=390;
  const m=b.MP;m.active=true;m.isHost=true;m.myId='solo';m.zone=b.G.zone;m.peers.g={x:324,z:390,y:0,hp:100,zone:m.zone,hall:false};
  window.qaNow=performance.now();performance.now=()=>qaNow;BFSocial.tick();BFSocial.open();BFSocial.receive('g',{type:'sit'});
  const st=()=>BFSocial.snapshot();if(st().seats.w!=='solo'||st().seats.b!=='g')throw Error('Seat fixture failed '+JSON.stringify(st().seats));
  const move=(pid,from,to)=>{const ok=BFSocial.receive(pid,{type:'move',from,to,rev:st().rev});if(!ok)throw Error('Rejected '+from+to);qaNow=st().motion.at+st().motion.duration+1;BFSocial.tick();};
  move('solo','f2','f3');move('g','e7','e5');move('solo','g2','g4');
  const before=st().result;move('g','d8','h4');b.renderFrame();
  const result={before,result:st().result,fen:st().fen,visual:document.getElementById('socialBoard')?.classList.contains('chess-mate'),status:document.getElementById('chessStatus')?.textContent};
  if(!result.result.includes('checkmate')||!result.visual||!result.status.includes('checkmate'))throw Error('Mate feedback missing '+JSON.stringify(result));
  return result;
 });
}
