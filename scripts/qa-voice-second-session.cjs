async page=>{
 const ctx=await page.context().browser().newContext();const other=await ctx.newPage();
 try{await other.goto('http://127.0.0.1:4333/3d/voice-studio/');await other.waitForFunction(()=>document.getElementById('status').textContent.length>0);await other.locator('#ownerKey').fill('local-voice-test-key-012345678901234567890');await other.getByRole('button',{name:'Open studio',exact:true}).click();await other.locator('#text').waitFor({state:'visible'});
 const first=await other.locator('#takes').inputValue();if(!first)throw Error('No cross-session take');const bytes=await other.evaluate(async id=>{const r=await fetch('/voice-api/audio/'+id);return (await r.arrayBuffer()).byteLength},first);if(bytes<32)throw Error('Missing recorded audio');
 await other.locator('#approve').click();await other.waitForFunction(()=>document.getElementById('status').textContent.includes('Official take approved'));
 await other.goto('http://127.0.0.1:4333/3d/story/preview.html');await other.waitForFunction(()=>window.__storyPreview);const merged=await other.evaluate(()=>({audio:__storyPreview.book.nodes['briar.thomas.first'].recordedAudio,text:__storyPreview.book.nodes['briar.thomas.first'].text}));if(!merged.audio||!merged.text.includes('wording check'))throw Error('Approved dialogue not consumed');return {secondSession:'saved take and wording loaded',audioBytes:bytes,previewApprovedTextAndAudio:true};
 }finally{await ctx.close()}
}
