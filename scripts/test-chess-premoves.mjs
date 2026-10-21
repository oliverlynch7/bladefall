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
ok(premoveTargets(new Chess().fen(),'a1','w').includes('a3'),'blocked rook intention may be queued');ok(!q.set(st(),null,'g1','f3'),'spectator cannot queue');
const castle='r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1';ok(premoveTargets(castle,'e1','w').includes('g1'),'castling candidate supported');ok(premoveTargets(new Chess().fen(),'e1','w').includes('g1'),'blocked castling can be planned');
// Every piece accepts every other square, with legal validation deferred until execution.
for(const [side,from]of [['w','a1'],['w','b1'],['w','c1'],['w','d1'],['w','e1'],['w','e2'],['b','a8'],['b','b8'],['b','c8'],['b','d8'],['b','e8'],['b','e7']]){
 const initial=new Chess().fen(),targets=premoveTargets(initial,from,side);
 ok(targets.length===63&&!targets.includes(from),'all other squares for '+side+from);
 for(const to of targets)ok(q.set({fen:initial,round:1,clock:{started:true}},side,from,to),'accept intention '+from+to);
}
ok(!q.set(st(),'w','a3','a4'),'empty source cannot queue');ok(!q.set(st(),'w','e7','e5'),'opponent source cannot queue');ok(!q.set(st(),'w','e2','z9'),'off-board destination rejected');ok(!q.set(st(),'w','e2','e2'),'same square is not a move');
for(const [label,fen,from,to,reply,want]of [
 ['blocked ray clears','4k3/8/8/8/8/8/r7/R3K3 b - - 0 1','a1','a8','Rh2',true],
 ['own blocker remains',new Chess().fen().replace(' w ',' b '),'a1','a3','Nf6',false],
 ['impossible knight move',new Chess().fen().replace(' w ',' b '),'b1','b4','Nf6',false],
 ['king stays in check','k3r3/8/8/8/8/8/4R3/4K3 b - - 0 1','e2','f2','Kb8',false],
 ['blocked castle remains',new Chess().fen().replace(' w ',' b '),'e1','g1','Nf6',false],
 ['future en passant','4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1','e5','d6','d5',true],
 ['future friendly-square recapture','4k3/8/8/4p3/3P4/5N2/8/4K3 b - - 0 1','f3','d4','exd4',true],
 ['valid castle',castle,'e1','g1','Kf7',true]
]){
 const game=new Chess(fen),queue=new PremoveQueue(),state=()=>({fen:game.fen(),history:game.history(),round:1,rev:21,clock:{started:true}});
 ok(queue.set(state(),'w',from,to),'queues '+label);ok(queue.take(state(),'w')===null,'does not execute before turn '+label);game.move(reply);
 const before=game.fen(),command=queue.take(state(),'w');ok(want?!command?.cancelled:command?.cancelled,'final legality '+label);
 if(want)ok(!!game.move(command),'authoritative rules accept '+label);else ok(game.fen()===before,'illegal intention changes no position '+label);
 ok(!queue.move&&queue.take(state(),'w')===null,'consumed once '+label);
}
console.log(n+' premove candidate, legality, promotion and lifecycle checks passed.');
