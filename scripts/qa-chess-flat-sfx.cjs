async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/');
 await page.waitForFunction(()=>window.BFSocial&&window.HERO3D?.ready,null,{polling:100});
 await page.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.hubUpgrades={chess:true};b.openHub();b.G.p.x=276;b.G.p.z=390;b.update(.016);BFSocial.open();});
 await page.locator('#chessFlatToggle').check();
 await page.locator('[data-flat="e2"]').click();
 if(!await page.locator('[data-flat="e4"]').evaluate(e=>e.style.boxShadow.includes('inset')))throw Error('Legal destination not shown on flat board');
 await page.locator('[data-flat="e4"]').click();
 const flat=await page.evaluate(()=>({fen:BFSocial.snapshot().fen,to:BFSocial.snapshot().motion?.to,dark:document.querySelector('[data-flat="a1"]').style.background}));
 if(flat.to!=='e4'||!flat.fen.includes('4P3')||flat.dark!=='rgb(82, 100, 79)')throw Error('Flat move or square color wrong '+JSON.stringify(flat));
 const audio=await page.evaluate(async()=>{
  const old=window.AudioContext,events=[];
  const node=()=>({connect(){return this},start(t){events.push(['start',t])},stop(t){events.push(['stop',t])},setValueAtTime(){},exponentialRampToValueAtTime(){},frequency:{setValueAtTime(){},value:0},gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},getChannelData(){return new Float32Array(100)}});
  window.AudioContext=class{constructor(){this.destination=node();this.sampleRate=1000;this.currentTime=1;this.state='running'}createGain(){return node()}createOscillator(){return node()}createBuffer(){return node()}createBufferSource(){return node()}createBiquadFilter(){return node()}};
  __BF3.meta.soundOn=true;const {chessSfx}=await import('/3d/chess-sfx.js?qa=1');
  const counts={};for(const kind of ['move','capture','check','mate','illegal']){const n=events.length;chessSfx(kind);counts[kind]=events.length-n;}
  window.AudioContext=old;return counts;
 });
 if(Object.values(audio).some(n=>n<=0))throw Error('Missing chess cue '+JSON.stringify(audio));
 if(errors.length)throw Error(errors.join('; '));return {flat,audio,errors};
}
