const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function run(){
 let now=1000,calls=0,reply={ok:true,json:async()=>({lines:{
  good:{text:'A safe road.',audio:'/voice-api/published/good.wav',revision:2},
  old:{text:'An old line.',audio:'/voice-api/published/old.wav',revision:1},
  unsafe:{text:'A safe road.',audio:'https://other.example/unsafe.wav',revision:1}
 }})};
 const window={};
 const context={window,Date:{now:()=>now},AbortSignal:{timeout:()=>({})},fetch:async()=>{calls++;return reply}};
 vm.runInNewContext(fs.readFileSync('public/3d/voice-content.js','utf8'),context);
 const make=()=>({nodes:{good:{text:'A safe road.'},old:{text:'A revised line.'},unsafe:{text:'A safe road.'}}});
 const books=Array.from({length:20},make);
 await Promise.all(books.map(book=>window.BFVoiceContent.apply(book)));
 assert.equal(calls,1,'parallel dialogue books share one request');
 assert.equal(books[0].nodes.good.recordedAudio,'/voice-api/published/good.wav');
 assert.equal(books[0].nodes.old.recordedAudio,undefined,'outdated take is not attached');
 assert.equal(books[0].nodes.unsafe.recordedAudio,undefined,'unpublished URL is rejected');
 await window.BFVoiceContent.apply(make());assert.equal(calls,1,'successful manifest is reused');
 now+=30001;reply={ok:false};
 await window.BFVoiceContent.apply(make());assert.equal(calls,2,'success cache expires');
 await window.BFVoiceContent.apply(make());assert.equal(calls,2,'failed endpoint is not hammered');
 now+=5001;reply={ok:true,json:async()=>({lines:{}})};
 await window.BFVoiceContent.apply(make());assert.equal(calls,3,'failed endpoint is retried after cooldown');
 console.log('Voice manifest: shared fetch, current-text filtering and failure recovery passed.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
