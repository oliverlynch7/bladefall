const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={addEventListener(){}},document={readyState:'loading',addEventListener(){}};const ctx={window:root,document};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/3d/menu-shortcuts.js','utf8'),ctx);vm.runInContext(fs.readFileSync('public/3d/menu-close.js','utf8'),ctx);
let checks=0;const button=(id,text,{hidden=false,disabled=false}={})=>({id,textContent:text,disabled,getClientRects:()=>hidden?[]:[{}],closest:()=>hidden?{}:null,hasAttribute:()=>false});
function test(name,buttons,expected){assert.equal(root.BFMenuClose.target({querySelectorAll:()=>buttons}),expected,name);checks++;}
let resume=button('resBtn','Resume Return to the fight');test('Pause resumes, never quits to hub',[button('qmenu','Quit to Hub'),resume],resume);
let no=button('delNo','Keep it');test('Delete confirmation cancels, never deletes',[button('delYes','Delete'),no],no);
let cancel=button('classChoiceBack','Cancel · Q / Esc');test('Review cancels without applying choice',[button('classChoiceConfirm','Confirm'),cancel],cancel);
test('Required skill choice cannot be bypassed',[button('choiceA','Take skill A'),button('choiceB','Take skill B')],undefined);
test('Hidden cancel is not a back door',[button('classChoiceBack','Cancel',{hidden:true})],undefined);
let back=button('settingsBack','Back to Pause Menu');test('Nested settings returns one level',[button('reset','Reset all bindings'),back],back);
let journal=button('journalClose','Close journal');test('Journal preserves cleanup',[journal],journal);
let chest=button('stashBtn','Keep in bag');test('Loot close never sells',[button('sellBtn','Sell'),chest],chest);
test('No automatic purchase, restart or destructive leave',[button('buy','Buy'),button('again','Retry'),button('partyLeave','Leave room')],undefined);
let leave=button('hubLeave','Leave conversation');test('Conversation leaves normally',[button('hubService','Open shop'),leave],leave);
console.log(`${checks} safe menu exit routing checks passed.`);
