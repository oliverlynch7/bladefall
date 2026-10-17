from pathlib import Path
root=Path(__file__).resolve().parent.parent
s=(root/'public/3d/index.html').read_text(encoding='utf8')
isolation="""<base href='/3d/'><script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:s});Object.defineProperty(window,'sessionStorage',{value:s});})();</script>"""
s=s.replace('<head>','<head>'+isolation,1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
s=s.replace('window.__BF3={','window.__BF3={openBag,openJournal,openPauseSettingsV2,openClassChoice,c2NextChoice,',1)
payload="""<pre id="shortcutResult" style="position:fixed;top:0;left:0;z-index:200001;max-height:34vh;overflow:auto;background:#102331;color:white;font:12px system-ui">Loading</pre><script>
(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)),out=document.getElementById('shortcutResult'),rows=[];
const check=(v,label)=>{rows.push({label,pass:!!v});if(!v)throw Error(label);},press=(code,target=window,repeat=false)=>target.dispatchEvent(new KeyboardEvent('keydown',{code,key:code==='Tab'?'Tab':code==='Escape'?'Escape':code.slice(-1).toLowerCase(),repeat,bubbles:true,cancelable:true}));
while(!window.__BF3||!window.HERO3D?.ready)await wait(50);const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,{hero:null,run:null,bank:null,classes:{},perks:{},classId:'warrior',classUnlocked:{warrior:true},originSeen:true,introSeen:true,hubTutDone:true,tutOff:true,petActive:null});b.openHub();
try{
 press('Tab');check(b.mode==='menu'&&!!document.querySelector('.bagmenu'),'Tab opens bag');press('Tab',window,true);check(!!document.querySelector('.bagmenu'),'held Tab does not close immediately');press('Tab',document.getElementById('bagAutoSell'));check(b.mode==='play','Tab closes bag from checkbox focus');press('Tab');press('KeyQ');check(b.mode==='play','Q closes bag');
 b.openPause();document.getElementById('bagBtnP').click();press('Tab');check(b.mode==='pause','Tab returns pause-opened bag to pause');press('KeyQ');check(b.mode==='play','Q resumes from pause');press('KeyQ',window,true);check(b.mode==='play','held Q does not reopen pause');
 b.openPause();b.openPauseSettingsV2();press('KeyQ');check(b.mode==='pause','Q returns settings to pause');b.openKeybinds(()=>b.openPause());press('KeyQ');check(b.mode==='pause','Q closes controls');
 b.openKeybinds(()=>b.openPause());document.querySelector('[data-a="attack"][data-s="0"]').click();press('KeyQ');check(!b.rebinding&&!!document.getElementById('kbDone'),'Q cancels rebind without binding Q');press('KeyQ');check(b.mode==='pause','second Q closes controls');press('KeyQ');
 b.openJournal();press('KeyQ');check(b.mode==='play','Q closes journal');
 b.openCharCreate();press('KeyQ');check(!document.getElementById('ccNext'),'Q exits first creator step');
 b.openCharCreate();document.getElementById('ccNext').click();press('KeyQ');check(window.__creatorWizardState().step===0,'Q goes back one creator step');document.getElementById('ccNext').click();document.getElementById('ccNext').click();document.getElementById('ccNext').click();const field=document.querySelector('.ccwizard input[type="text"],.ccwizard input:not([type])');check(!!field,'name field found');field.focus();field.value='Quinn';check(press('KeyQ',field),'Q remains available for text input');check(field.value==='Quinn'&&window.__creatorWizardState().step===3,'Q in name field does not leave creator');press('Escape',field);check(window.__creatorWizardState().step===2,'Escape still exits focused name field');
 press('KeyQ',document.body);press('KeyQ',document.body);press('KeyQ',document.body);b.openHub();
 b.openNpcTalk(b.G.hubNpcs.find(n=>n.id==='quartermaster'));await wait(150);check(!!BFHubDialogue.active,'NPC dialogue opened');press('KeyQ',document.body);check(!BFHubDialogue.active&&b.mode==='play','Q closes NPC conversation');
 BFInspection.open('painting');press('KeyQ',document.body);check(!BFInspection.active,'Q closes inspection');
 press('KeyM',document.body);check(!!document.getElementById('emoteWheel'),'emote wheel opened');press('KeyQ',document.body);check(!document.getElementById('emoteWheel'),'Q closes emote wheel');
 b.classState('warrior').rank=2;b.openClassChoice(2);await wait(400);document.querySelector('.c2opt').click();press('KeyQ',document.body);check(document.getElementById('choiceReview').hidden&&b.mode==='upgrade','Q cancels skill confirmation first');press('KeyQ',document.body);check(b.mode==='play'&&b.c2NextChoice()===2,'second Q defers choice without losing rank unlock');
 press('Tab',document.body);check(!!document.querySelector('.bagmenu'),'bag still opens after other interactions');
 out.textContent=JSON.stringify({done:true,rows,keys:b.meta.keybinds},null,2);
}catch(e){out.textContent=JSON.stringify({error:String(e.stack),rows},null,2);}
})().catch(e=>document.getElementById('shortcutResult').textContent=String(e.stack));</script>"""
(root/'public/3d/.qa-menu-shortcuts.html').write_text(s.replace('</body>',payload+'</body>'),encoding='utf8')
print('Built isolated real-DOM shortcut propagation fixture.')
