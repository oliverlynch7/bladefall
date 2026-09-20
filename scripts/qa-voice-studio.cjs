async page=>{
 if(!page.url().startsWith('http://127.0.0.1:4333/'))throw Error('Local Voice Studio only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 await page.goto('http://127.0.0.1:4333/3d/voice-studio/');await page.waitForFunction(()=>document.getElementById('status').textContent.length>0);
 if(await page.locator('#login').isVisible()){await page.locator('#ownerKey').fill('local-voice-test-key-012345678901234567890');await page.getByRole('button',{name:'Open studio',exact:true}).click()}
 await page.locator('#text').waitFor({state:'visible'});ok('42 shared-script lines',await page.locator('#lines button').count()===42);
 await page.evaluate(()=>{
  navigator.mediaDevices.getUserMedia=async()=>{const ctx=new AudioContext(),osc=ctx.createOscillator(),dest=ctx.createMediaStreamDestination();osc.frequency.value=180;osc.connect(dest);osc.start();await ctx.resume();return dest.stream};
 });
 await page.locator('#record').click();await page.waitForTimeout(1400);ok('recording locks script navigation',await page.locator('#text').isDisabled());await page.locator('#stop').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Take saved online'));
 ok('browser-generated recording saved',await page.locator('#takes option').count()>0);
 await page.locator('#player').evaluate(async a=>{a.muted=true;await a.play()});await page.waitForFunction(()=>document.getElementById('player').currentTime>0);ok('saved audio plays',true);
 const selected=await page.locator('#takes').inputValue();await page.locator('#approve').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Official take approved'));
 ok('exact selected take approved',await page.locator('#takes').inputValue()===selected);
 const id=await page.locator('#identity').innerText(),text=await page.locator('#text').inputValue();
 const downloadWait=page.waitForEvent('download');await page.locator('#backup').click();const download=await downloadWait;await download.saveAs('C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/work/bladefall-queue/tmp/voice-line-backup.json');ok('backup download',download.suggestedFilename().endsWith('voice-backup.json'));
 await page.locator('#text').fill(text+' A wording check.');await page.locator('#saveText').click();await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Wording saved'));
 ok('text edit preserves but disables older take',await page.locator('#approve').isDisabled()&&await page.locator('#takes option').count()>0);
 await page.reload();await page.locator('#text').waitFor({state:'visible'});ok('wording survives reload',(await page.locator('#text').inputValue()).endsWith('A wording check.'));
 await page.locator('#restore').setInputFiles('C:/Users/Oliver/Documents/Codex/2026-09-08/o-2/work/bladefall-queue/tmp/voice-line-backup.json');await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Backup takes restored'));
 ok('backup restore preserves current wording',(await page.locator('#text').inputValue()).endsWith('A wording check.'));
 await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{const c=new AudioContext(),o=c.createOscillator(),d=c.createMediaStreamDestination();o.connect(d);o.start();await c.resume();return d.stream}});
 await page.route('**/voice-api/take',r=>r.abort());await page.locator('#record').click();await page.waitForTimeout(1200);await page.locator('#stop').click();await page.locator('#recovery').waitFor({state:'visible'});
 ok('failed upload kept for recovery',await page.getByRole('button',{name:'Retry upload',exact:true}).count()>0);await page.unroute('**/voice-api/take');
 await page.reload();await page.locator('#text').waitFor({state:'visible'});await page.getByRole('button',{name:'Retry upload',exact:true}).first().click();await page.waitForFunction(()=>document.getElementById('status').textContent==='Recording saved online.');ok('pending take survives reload and retry',await page.locator('#recovery').isHidden());
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/voice-studio-mobile.png'});ok('phone layout no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:'output/playwright/voice-studio-desktop.png'});
 await page.locator('#logout').click();await page.locator('#login').waitFor({state:'visible'});ok('logout hides private library',await page.locator('#studio').isHidden());
 return checks;
}
