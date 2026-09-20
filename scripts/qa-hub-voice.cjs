async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local only');
 await page.unroute('**/voice-api/game');
 await page.route('**/voice-api/game',r=>r.fulfill({json:{lines:{'hub.anvil.intro':{text:'This is the approved test wording.',revision:'test',audio:'/voice-api/published/hub.anvil.intro/test'}}}}));
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{
  await BFHubDialogue.ready;window.__voiceQA={played:[],paused:0,tts:0,cancel:0};const NativeAudio=window.Audio;
  window.Audio=function(src){if(!String(src).startsWith('/voice-api/published/'))return new NativeAudio(src);return {duration:5,currentTime:0,play(){__voiceQA.played.push(src);this.onplaying?.();return Promise.resolve()},pause(){__voiceQA.paused++;this.onpause?.()},removeAttribute(){},load(){}}};
  speechSynthesis.speak=u=>{__voiceQA.tts++;u.onstart?.()};speechSynthesis.cancel=()=>{__voiceQA.cancel++};
  const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubDialogue={};b.meta.soundOn=true;b.meta.sfxVol=0;b.meta.dialogueVoice=true;b.meta.dialogueTTS=false;b.meta.hubTutDone=true;b.openHub();b.openNpcTalk(b.G.hubNpcs.find(n=>n.id==='anvil'));
 });
 await page.waitForFunction(()=>BFHubDialogue.speaking);await page.waitForFunction(()=>{const f=window.__npcArtStats?.faces?.anvil;return f?.mouth&&Math.abs(f.scale-f.neutral)>.001});await page.locator('#hubReveal').click();
 if(await page.locator('#hubLine').innerText()!=='This is the approved test wording.')throw Error('Approved wording not applied');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>{const f=window.__npcArtStats?.faces?.anvil;return f?.scale===f?.neutral});
 if(!await page.evaluate(()=>__voiceQA.played.length===1&&__voiceQA.paused===1&&!BFHubDialogue.speaking))throw Error('Recorded voice cleanup failed');
 await page.evaluate(()=>{__BF3.meta.dialogueTTS=true;__BF3.meta.dialogueVoice=false;__BF3.openNpcTalk(__BF3.G.hubNpcs.find(n=>n.id==='keeper'))});await page.waitForFunction(()=>__voiceQA.tts===1);await page.keyboard.press('Escape');
 if(!await page.evaluate(()=>__voiceQA.cancel===1&&!BFHubDialogue.speaking))throw Error('TTS cleanup failed');
 await page.evaluate(()=>{__BF3.meta.soundOn=false;__BF3.openNpcTalk(__BF3.G.hubNpcs.find(n=>n.id==='beastkeeper'))});await page.waitForSelector('#hubReveal');
 if(!await page.evaluate(()=>__voiceQA.tts===1&&__voiceQA.played.length===1))throw Error('Mute ignored');await page.keyboard.press('Escape');
 await page.unroute('**/voice-api/game');await page.reload();
 return ['approved text and published take applied','recorded voice stops on leave','optional TTS starts and cancels','mute prevents recorded and device voices','mouth moves during voice and returns to rest on exit'];
}
