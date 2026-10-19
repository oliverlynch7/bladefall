const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n');let checks=0;
const ok=(x,m)=>{assert(x,m);checks++;};
// Exercise the actual pause wrapper with a minimal world, not a reimplemented policy.
const part=src.slice(src.indexOf('let liveMenuWorld=null'),src.indexOf('function updateWorld(dt)'));
const ctx={G:{p:{hp:100,x:1,y:2,z:3,yaw:0,vx:4,vy:5,vz:6,onGround:true},time:0},mode:'play',MP:{active:false,pvp:false,tick(){ctx.network++;}},meta:{autoAttack:true},input:{},network:0,social:0,polls:0,document:{body:{classList:{contains:()=>false}},getElementById:()=>null},window:{BFSocial:{tick(){ctx.social++;}}},BFGuidedTutorial:{suspend(){}},partyHud(){},BFShipwreckShore:{aiming:()=>false},releaseKeyboard(){},pollGamepad(){ctx.polls++;},updateWorld(dt){ctx.G.time+=dt;ctx.G.p.x+=50;ctx.hurtPlayer(9);},briarBook:null};
vm.createContext(ctx);vm.runInContext(part+`\nmenuDamageWarning=()=>{}; function hurtPlayer(){if(pauseDamageBlocked())return;G.p.hp-=9;} function lavaHit(){if(pauseDamageBlocked())return;G.p.hp-=22;} function pause(){beginPause();mode='pause';}`,ctx);
const run=s=>vm.runInContext(s,ctx);
// Execute the real bag entry until inventory rendering; no menu policy duplicate.
const bagEntry=src.slice(src.indexOf('function openBag(back,keepOpen=false){'),src.indexOf('  const active=document.activeElement',src.indexOf('function openBag(back,keepOpen=false){')));
vm.runInContext(bagEntry+"mode='menu';}",ctx);
run('openBag()');ok(run('pauseState().frozen'),'direct bag entry freezes solo world');let bagTime=ctx.G.time,bagHp=ctx.G.p.hp;run('update(.25);hurtPlayer();lavaHit()');ok(ctx.G.time===bagTime&&ctx.G.p.hp===bagHp,'bag blocks simulation and damage');ctx.mode='mirror';run('update(.25)');ok(ctx.G.time===bagTime,'bag inspection stays frozen');ctx.mode='play';run('update(.01)');ctx.MP.active=true;run('openBag()');bagTime=ctx.G.time;bagHp=ctx.G.p.hp;run('update(.1)');ok(ctx.G.time>bagTime&&ctx.G.p.hp===bagHp&&run('playerActivity()')==='Paused','direct co-op bag protects player with paused presence');ctx.mode='play';run('update(.01)');ok(!run('pauseState().active'),'closing bag clears protection');ctx.MP.active=false;ctx.social=0;

run('update(.1);pause()');let time=ctx.G.time,hp=ctx.G.p.hp;
run('update(.5);hurtPlayer();lavaHit()');ok(ctx.G.time===time&&ctx.G.p.hp===hp,'solo time and damage frozen');ok(ctx.polls>0,'controller can resume while frozen');ok(ctx.social===1,'social timers do not advance while frozen');
ctx.mode='menu';run('update(.5)');ok(ctx.G.time===time,'nested Settings/Bag remains frozen');
ctx.mode='play';run('update(.1)');ok(ctx.G.time>time&&!run('pauseState().active'),'play clears pause session');
ctx.mode='menu';time=ctx.G.time;run('update(.1)');ok(ctx.G.time>time&&!run('pauseState().active'),'direct panel after resume does not inherit pause');
ctx.MP.active=true;run('liveMenuWorld=null;pause()');time=ctx.G.time;hp=ctx.G.p.hp;const pose={x:ctx.G.p.x,y:ctx.G.p.y,z:ctx.G.p.z,vy:ctx.G.p.vy};run('update(.25)');ok(ctx.G.time>time,'co-op world continues even before first play tick');ok(ctx.G.p.hp===hp,'co-op damage blocked');ok(ctx.G.p.x===pose.x&&ctx.G.p.y===pose.y&&ctx.G.p.z===pose.z&&ctx.G.p.vy===pose.vy,'paused avatar stays put, pre-pause velocity preserved');ok(run('playerActivity()')==='Paused','paused presence sent');
ctx.mode='menu';time=ctx.G.time;run('update(.1)');ok(ctx.G.time>time&&run('pauseState().protected'),'co-op protection persists in submenu');
ctx.mode='play';run('update(.1)');ok(ctx.G.p.hp<hp&&!run('pauseState().protected'),'resume removes protection immediately');
ctx.MP.pvp=true;run('pause()');hp=ctx.G.p.hp;run('update(.1)');ok(ctx.G.p.hp<hp&&!run('pauseState().protected'),'competitive play does not inherit co-op invulnerability');
ctx.MP.pvp=false;ctx.G={p:{hp:90},time:0};ok(!run('pauseState().active'),'world replacement clears protection');
run('beginPause()');ctx.G.p.downed=true;ok(!run('pauseState().protected'),'cannot protect a downed player');ctx.G.p.dead=true;ok(!run('pauseState().active'),'death is not undone');
// Rank choices and their celebration use the same session as a directly opened bag.
ctx.G={p:{hp:100,x:0,y:0,z:0,vx:0,vy:0,vz:0},time:0};ctx.MP.active=false;
run("beginPause();mode='upgrade';update(.2);hurtPlayer();lavaHit()");ok(ctx.G.time===0&&ctx.G.p.hp===100&&run('pauseState().frozen'),'solo upgrade selection freezes and blocks hits/falls');
ctx.MP.active=true;run("beginPause();mode='upgrade';");time=ctx.G.time;hp=ctx.G.p.hp;run('update(.2);hurtPlayer();lavaHit()');ok(ctx.G.time>time&&ctx.G.p.hp===hp,'co-op upgrade world runs without hits/fall damage');ok(ctx.G.p.x===0&&run('playerActivity()')==='Paused','choice holds player and sends grey protected presence');
ctx.mode='menu';run('update(.2)');ok(run('pauseState().protected'),'nested bag retains upgrade protection');ctx.mode='upgrade';run('update(.2)');ok(run('pauseState().protected'),'returning to required choice remains protected');ctx.mode='play';run('update(.2)');ok(!run('pauseState().active')&&ctx.G.p.hp<hp,'confirmed choice resumes normal vulnerability');
for(const name of ['openDashTutorial','openSkillTutorial','openClassChoice','openLevelUp','openSubclassFrom']){const a=src.indexOf('function '+name+'('),b=src.indexOf('\nfunction ',a+12);ok(src.slice(a,b).includes("beginPause();mode='upgrade'"),name+' starts pause before transition');}
ok(src.includes('function hurtPlayer(dmg,sx,sz,by){\n if(pauseDamageBlocked())return;'),'real incoming-hit path guarded before side effects');ok(src.includes('function lavaHit(){\n  if(pauseDamageBlocked())return;'),'real fall damage guarded');ok(src.includes("pausedSafe=q.busy==='Paused'&&!this.pvp"),'peer appearance uses validated presence outside PvP');
// Compile every inline script, including the changed gameplay closure.
for(const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
ok(true,'inline syntax compiles');
(async()=>{const code=fs.readFileSync('public/3d/pause-appearance3d.js','utf8');const {pauseAppearance}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));let disposed=0,listener;const source={opacity:1,transparent:false,onBeforeCompile(){},customProgramCacheKey:()=>'',clone(){return {...this,dispose(){disposed++;}}},addEventListener(t,f){listener=f;}};const a={material:source},b={material:[source]},root={traverse:f=>{f(a);f(b);}};const restore=pauseAppearance(root);ok(a.material!==source&&a.material===b.material[0],'grayscale variants cached for repeated materials');ok(a.material.opacity===1&&!a.material.transparent,'paused body remains opaque');const shader={fragmentShader:'#include <colorspace_fragment>'};a.material.onBeforeCompile(shader);ok(shader.fragmentShader.includes('dot(gl_FragColor.rgb'),'shader desaturates texture as well as tint');restore();ok(a.material===source&&b.material[0]===source,'original materials restored after draw');listener();ok(disposed===1,'cached material disposed with original');console.log(`${checks} pause regression checks passed.`);})().catch(e=>{console.error(e);process.exitCode=1;});




{const a=src.indexOf('function beginProgressChoice('),b=src.indexOf('function openClassChoice(',a);ok(!src.slice(a,b).includes('beginPause()'),'rank announcement plays before the protected choice');}
