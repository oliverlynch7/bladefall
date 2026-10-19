import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../public/3d/three.module.js';
import {Chess} from '../public/3d/vendor/chess-1.4.0.mjs';
import {PremoveQueue,premoveTargets} from '../public/3d/chess-premove.js';
import {chessGestureValid,chessFlatBounds} from '../public/3d/chess-table.js';
import {CHESS_PIECE_HEIGHTS as heights} from '../public/3d/chess-presentation.js';
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
// Occupied enemy squares, plus a future pawn capture before the opponent arrives there.
for(const [fen,from,to,reply]of [
 ['4k3/8/8/3p4/4P3/8/8/4K3 b - - 0 1','e4','d5','Kf7'],
 ['4k3/8/8/8/8/8/r7/R3K3 b - - 0 1','a1','a2','Kf7'],
 ['4k3/8/8/8/8/8/3r4/1N2K3 b - - 0 1','b1','d2','Kf7'],
 ['4k3/8/3p4/8/4P3/8/8/4K3 b - - 0 1','e4','d5','d5']]){
 const c=new Chess(fen),q=new PremoveQueue(),st=()=>({fen:c.fen(),round:1,rev:5,history:c.history(),clock:{started:true}});
 ok(premoveTargets(fen,from,'w').includes(to),'capture candidate '+from+to);ok(q.set(st(),'w',from,to),'capture queues');c.move(reply);const s={...st(),motion:{done:false}};ok(q.take(s,'w')===null,'waits for animation');s.motion.done=true;const cmd=q.take(s,'w');ok(cmd?.to===to,'capture resolves at latest position');ok(!!c.move(cmd),'engine accepts capture');
}
// Recapture a square occupied by our own pawn before the opponent takes it.
{const c=new Chess('4k3/8/8/4p3/3P4/5N2/8/4K3 b - - 0 1'),q=new PremoveQueue(),st=()=>({fen:c.fen(),round:1,rev:8,history:c.history(),clock:{started:true}});ok(q.set(st(),'w','f3','d4'),'recapture can target own occupied square');c.move('exd4');const cmd=q.take(st(),'w');ok(cmd?.to==='d4'&&c.move(cmd).captured==='p','recapture executes only once target becomes enemy');}
{const c=new Chess('4k3/8/8/4p3/3P4/5N2/8/4K3 b - - 0 1'),q=new PremoveQueue(),st=()=>({fen:c.fen(),round:1,rev:8,history:c.history(),clock:{started:true}});q.set(st(),'w','f3','d4');c.move('Kf7');ok(q.take(st(),'w').cancelled,'friendly occupied destination cancels if no capture occurred');}
const c=new Chess();c.move('e4');const p={sq:'e4',side:'w',piece:'p',gameId:'duel',round:1};let st={fen:c.fen(),gameId:'duel',round:1,rev:2};ok(chessGestureValid(st,p,'w'),'held piece valid');c.move('d5');st={...st,fen:c.fen(),rev:3,motion:{done:false}};ok(chessGestureValid(st,p,'w'),'opponent move start retains drag');ok(chessGestureValid({...st,rev:4,motion:{done:true}},p,'w'),'animation finish retains drag');
for(const changed of [{...st,round:2},{...st,gameId:'another'},{...st,result:'mate'},{...st,waitingFriend:true}])ok(!chessGestureValid(changed,p,'w'),'lifecycle invalidates drag');ok(!chessGestureValid(st,p,'b'),'seat change cancels');
c.move('exd5');ok(!chessGestureValid({...st,fen:c.fen()},p,'w'),'source moved cancels');
for(const [w,h]of [[1920,1080],[800,600],[375,667],[320,240]])for(const rect of [{x:-500,y:-500,width:40},{x:5000,y:5000,width:9000},{x:20,y:30,width:300}]){const r=chessFlatBounds(rect,w,h);ok(r.x>=8&&r.y>=8,'window stays accessible');ok(r.x+r.width<=w-8&&r.y+r.width+52<=h,'board stays in viewport');}
let modelSource=fs.readFileSync('public/3d/chess-pieces.js','utf8').replace(/^import .*;\r?\n/gm,'');modelSource=modelSource.slice(0,modelSource.indexOf('window.BFChessPieces='));const build=new Function('T','CHESS_PIECE_HEIGHTS',modelSource+';return model;')(T,heights);
for(const side of ['w','b']){const sizes={};for(const type of ['p','r','n','b','q','k']){const root=build(type,side);root.updateMatrixWorld(true);sizes[type]=new T.Box3().setFromObject(root).max.y;ok(Math.abs(sizes[type]-heights[type])<.001,'actual carved height '+side+type);}ok(sizes.p<sizes.r&&sizes.r<sizes.n&&sizes.n<sizes.b&&sizes.b<sizes.q&&sizes.q<sizes.k,'clear silhouette hierarchy');ok(sizes.r/sizes.q<.7,'rook visibly shorter than queen');}
console.log(JSON.stringify({checks,passed:true}));
