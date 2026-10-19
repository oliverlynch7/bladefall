/* Q shares each modal's Escape handler instead of duplicating its cleanup. */
(function(root){'use strict';
function typing(target){
 if(!target)return false;
 if(target.isContentEditable||target.closest?.('textarea,[contenteditable="true"]'))return true;
 return target.tagName==='INPUT'&&!['button','submit','reset','checkbox','radio','range','color','file'].includes(target.type);
}
function backButton(container){
 const buttons=[...(container?.querySelectorAll('button')||[])].filter(b=>!b.disabled&&b.getClientRects().length);
 const explicit=buttons.find(b=>b.hasAttribute('data-menu-back')||['backBtn','ccBack','kbDone','riseBtn','resBtn','prback','journalClose','statBack','delNo','skipNo','npcLeave','wsBack','hubBtn','ocOk','sealGo'].includes(b.id)||/back$/i.test(b.id));
 return explicit||buttons.find(b=>/^(back(?:\s+to\b.*)?|close|cancel|done|not now|choose later(?:\s*·.*)?|return to (?:practice instructions|hub|the hub|the hall))$/i.test(b.textContent.trim()));
}
function onKey(e){
 const game=root.__BF3;
 if(root.BFController?.active&&(e.code==='Escape'||e.code==='KeyQ'&&!typing(e.target))){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)root.BFController.back();return;}
 if(e.code==='Escape'&&game?.mode==='pause'&&!game.rebinding&&!root.document?.querySelector('#ovcard .pausecard')){const b=backButton(root.document?.getElementById('ovcard'));if(b){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)b.click();return;}}
 if(game?.keyAction?.(e.code)==='interact'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing(e.target)&&!game.rebinding&&!root.__bfEd?.EDITOR?.on)game.hudDevice?.('keyboard');
 const narrationButton=e.target?.closest?.('.narration-controls button');
 if(narrationButton&&game?.keyAction?.(e.code)==='interact'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing&&!game.rebinding&&!root.__bfEd?.EDITOR?.on&&!narrationButton.disabled&&narrationButton.getClientRects().length){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)narrationButton.click();return;}
 if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing(e.target)&&root.BFMenuTour?.key(e))return;
 if(game&&['menu','pause','title'].includes(game.mode)&&game.keyAction?.(e.code)==='interact'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing&&!typing(e.target)&&!game.rebinding&&!root.__bfEd?.EDITOR?.on){
  const button=e.target?.closest?.('button,summary,[role=button],a[href],input[type=checkbox],input[type=radio]');
  if(button&&!button.disabled&&button.getClientRects().length&&!button.closest?.('[inert]')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)button.click();return;}
 }
 if(e.code!=='KeyQ'||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||typing(e.target)||!root.__BF3||root.__bfEd?.EDITOR?.on)return;
 e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 if(root.BFGuidedTutorial?.back?.()||root.BFHubTour?.back?.())return;
 if(root.BFChestReveal?.active){root.BFChestReveal.skip();return;}
 // Back never opens a menu or skips a lesson during live play. Tab/Esc opens the menu.
 if(game?.mode==='play'&&!root.document?.getElementById('emoteWheel')&&!root.BFSocial?.camera?.())return;
 // Dispatch on the same target: document- and window-level modal handlers both run.
 (e.target?.dispatchEvent?e.target:root).dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true,cancelable:true}));
}
root.BFMenuKeys={typing,backButton};root.addEventListener?.('keydown',onKey,true);
if(typeof module!=='undefined')module.exports={typing,backButton,onKey};
})(typeof window!=='undefined'?window:globalThis);
