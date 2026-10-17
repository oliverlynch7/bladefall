import assert from 'node:assert/strict';
import {Chess} from '../public/3d/vendor/chess-1.4.0.mjs';
import {PremoveQueue,premoveTargets} from '../public/3d/chess-premove.js';
let n=0;const ok=(v,m)=>{assert(v,m);n++;};
const q=new PremoveQueue(),c=new Chess();const st=()=>({fen:c.fen(),history:c.history(),round:1,rev:9,clock:{started:true},motion:null,result:''});
ok(q.set(st(),'b','e7','e5'),'black queues before white first move');ok(!q.take(st(),'b'),'waits for opponent');c.move('e4');let s=st();s.motion={done:false,elapsed:1400,duration:1400};ok(!q.take(s,'b'),'guest waits authoritative animation completion despite elapsed end');s.motion.done=true;const cmd=q.take(s,'b');ok(cmd.from==='e7'&&cmd.to==='e5'&&cmd.rev===9,'queued move uses latest host revision');ok(!q.take(s,'b'),'sends exactly once');c.move(cmd);
ok(q.set(st(),'b','g8','f6'),'can queue next move');q.clear();c.move('Nf3');ok(!q.take(st(),'b'),'cancel prevents automatic move');
q.set(st(),'w','f1','b5');ok(q.set(st(),'w','b1','c3'),'new premove replaces old');ok(q.move.from==='b1','replacement stored');q.clear();
const pawnFen='4k3/8/8/8/3p4/8/4P3/4K3 b - - 0 1';ok(premoveTargets(pawnFen,'e2','w').includes('d3'),'empty pawn diagonal can be queued for future capture');
let p=new Chess(pawnFen),ps=()=>({fen:p.fen(),round:2,rev:10,history:p.history(),clock:{started:true}});q.set(ps(),'w','e2','d3');p.move('d3');ok(q.take(ps(),'w').to==='d3','pawn capture becomes legal after opponent reply');
p=new Chess(pawnFen);q.set(ps(),'w','e2','d3');p.move('Kf7');ok(q.take(ps(),'w').cancelled&&!q.move,'illegal empty capture discarded');
p=new Chess('4k3/8/8/8/8/3r4/3N4/4K3 b - - 0 1');q.set(ps(),'w','d2','f3');p.move('Rxd2');ok(q.take(ps(),'w').cancelled,'captured queued piece discarded');
p=new Chess('4k3/P7/8/8/8/8/8/4K3 b - - 0 1');q.set(ps(),'w','a7','a8','n');p.move('Kf7');ok(q.take(ps(),'w').promotion==='n','underpromotion preserved');
for(const [name,change,side]of [['result',{result:'mate'},'w'],['round',{round:99},'w'],['seat',{},'b'],['clock',{clock:{started:false}},'w'],['skipped position',{history:[1,2,3,4]},'w']]){p=new Chess();p.move('e4');q.set(ps(),'w','g1','f3');ok(q.take({...ps(),...change},side).cancelled&&!q.move,name+' clears queue');}
ok(!premoveTargets(new Chess().fen(),'a1','w').length,'rook cannot cross own pawns');ok(!q.set(st(),null,'g1','f3'),'spectator cannot queue');
const castle='r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1';ok(premoveTargets(castle,'e1','w').includes('g1'),'castling candidate supported');ok(!premoveTargets(new Chess().fen(),'e1','w').includes('g1'),'blocked castling excluded');
console.log(n+' premove candidate, legality, promotion and lifecycle checks passed.');
