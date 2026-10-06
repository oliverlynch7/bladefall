async page=>{
 await page.route('**/*',r=>r.continue());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});
 const report=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.enterArena();
  const g=b.G,a=b.classAudit,m=b.MP,base=JSON.stringify(g.p),rows=[];
  const check=(name,ok,data)=>rows.push({name,ok:!!ok,data});const near=(a,b)=>Math.abs(a-b)<.00001;
  function setup(cls,picks={},rank=9){
   m.active=m.pvp=false;m.peers={};b.meta.classId=cls;const cs=b.classState(cls);cs.rank=rank;cs.ch={};
   for(let r=2;r<=9;r++)cs.ch[r]=b.CLASS2[cls]['r'+r].a.id;Object.assign(cs.ch,picks);
   g.p=JSON.parse(base);const p=g.p;p.weapon=b.classStartWeapon(cls);p.hp=20;p.maxMana=p.mana=1000;p.x=p.y=p.z=0;p.yaw=0;p.invuln=p.dodgeTimer=0;p.skillCd=[0,0,0,0];p.skillCdMax=[0,0,0,0];p.shieldHp=p.shieldT=0;
   g.enemies=[];g.projectiles=[];g.minions=[];g.pet=null;g.petLost=false;g._desig=false;g.camYaw=0;return p;
  }
  function foe(){b.spawnEnemy('grunt',0,60,false);const e=g.enemies.at(-1);e.hp=e.maxHp=100000;e.active=true;return e;}
  let p=setup('warrior',{8:'w_execute'},10),hp=p.hp,mana=p.mana;b.useSkill(3);
  check('Warrior no-target cast gives no free capstone healing',p.hp===hp&&p.mana===mana&&p.skillCd[3]===0,{hp:p.hp,mana:p.mana});
  p=setup('beastmaster');a.tick(p,0);foe();g.pet.atkT=7;p.skillCd[0]=2;b.useSkill(0);
  check('Cooldown press cannot order a free companion attack',g.pet.atkT===7,g.pet.atkT);
  p.skillCd[0]=0;p.mana=0;b.useSkill(0);check('Empty mana cannot order a free companion attack',g.pet.atkT===7,g.pet.atkT);
  p=setup('mage',{5:'m_ward',9:'m_echo'},10);p._mageCasts=3;p._attuneT=5;p._attuneI=0;
  p.skillCd[0]=1;const element=p.weapon.el;b.useSkill(0);check('Cooldown press cannot change weapon element',p.weapon.el===element&&p._attuneI===0);
  p.skillCd[0]=0;const skill=b.c2CurSkills()[0],real=b.SKILL_FX[skill.fx];b.SKILL_FX[skill.fx]=()=> 'refund';
  try{mana=p.mana;b.useSkill(0);check('Refund grants no shield, cast credit or mana profit',p.shieldHp===0&&p._mageCasts===3&&p.mana===mana&&p._attuneI===0&&p.weapon.el===element);}
  finally{b.SKILL_FX[skill.fx]=real;}
  p._attuneT=0;p._mageCasts=3;foe();b.useSkill(0);const shots=g.projectiles.filter(x=>x.owner==='player');
  check('Mage echo damage is 35% of original scaled skill',shots.length===2&&near(shots[1].dmg/shots[0].dmg,.35),shots.map(x=>x.dmg));
  check('Original and echo projectiles are designated skill hits',shots.length===2&&shots.every(x=>x.desig));
  check('Successful mage cast still grants shield and cast count',p.shieldHp>0&&p._mageCasts===4);
  p=setup('mage');foe();p._attuneT=10;p._attuneI=0;const original=p.weapon,originalEl=p.weapon.el;b.useSkill(0);
  check('Attunement changes spell element without altering equipped item',p.weapon===original&&p.weapon.el===originalEl&&g.projectiles.some(x=>x.el==='frost'));
  a.tick(p,10.1);check('Attunement ends after its stated duration',p._attuneT===0&&p.weapon.el===originalEl);
  p=setup('chronomancer',{9:'chr_echo'});foe();b.useSkill(0);g.projectiles=[];a.tick(p,3.1);
  check('Chronomancer delayed projectile retains skill-hit effects',g.projectiles.length>0&&g.projectiles.every(x=>x.desig),g.projectiles.map(x=>x.desig));
  // Peer simulation exercises the actual network receipt and countdown handlers.
  p=setup('warlock');m.active=m.pvp=true;m.isHost=true;m.myId='A';m.teams=false;m.conns=[];m._sendT=0;
  const q=m.mkPeer({...m.selfState(),id:'B',x:0,z:60,hp:100,maxHp:100});q.id='B';q.zone=m.zone;q.markT=q.warCurseT=3;q.last=0;m.peers={B:q};m.tick(.25);
  check('PvP marks and curses tick once per frame',near(q.markT,2.75)&&near(q.warCurseT,2.75),{mark:q.markT,curse:q.warCurseT});m.active=m.pvp=false;
  p=setup('beastmaster');m.active=m.pvp=true;m.isHost=true;m.peers={B:q};q.last=0;q.beastMarkT=3;a.tick(p,.25);m.tick(.25);check('Beastmaster PvP mark ticks once',near(q.beastMarkT,2.75),q.beastMarkT);
  p=setup('paladin',{5:'pal_burn'});m.active=m.pvp=true;m.isHost=true;m.peers={B:q};q.last=0;delete q.st;q.stFresh={};const killed=foe();p._oath=killed;killed.stDmg=100;a.onKill(p,killed);check('Burning Light reaches nearby hostile players',q.st.burn>=1,q.st.burn);m.active=m.pvp=false;
  // Healing must follow actual damage, including PvP receipts and shielded foes.
  for(const cls of ['warlock','paladin']){
   p=setup(cls,{},10);if(cls==='paladin')p.weapon.el='holy';let e=foe();e.boss=true;e.shielded=true;hp=p.hp;
   const attack=()=>{g._desig=true;try{return cls==='warlock'?b.SKILL_FX.war_drain(p,true,1):b.hitEnemy(e,100,p,0,0,'holy');}finally{g._desig=false;}};
   attack();check(cls+' blocked enemy hit gives no healing',p.hp===hp);
   e.shielded=false;const old=e.hp;attack();check(cls+' heals fraction of actual enemy damage',near(p.hp-hp,(old-e.hp)*(cls==='warlock'?.22:.03)),{healed:p.hp-hp,damage:old-e.hp});
   g.enemies=[];p.hp=20;m.active=m.pvp=true;m.isHost=true;m.myId='A';m.teams=false;m._pendingHits=new Map();const packets=[];
   e=m.mkPeer({...m.selfState(),id:'B',x:0,y:0,z:60,hp:100,maxHp:100});e.id='B';e.zone=m.zone;e.active=true;e._peer=true;e._peerId='B';m.peers={B:e};m.conns=[{_pid:'B',send:q=>packets.push(q)}];
   attack();let hit=packets.find(q=>q.t==='pdmg');check(cls+' PvP healing waits for damage receipt',p.hp===20&&!!hit);
   m.takePvpResult({token:hit?.token,by:'B',dealt:0});check(cls+' blocked PvP hit cannot heal',p.hp===20);
   packets.length=0;attack();hit=packets.find(q=>q.t==='pdmg');m.takePvpResult({token:hit?.token,by:'B',dealt:10});const healed=p.hp;
   check(cls+' confirmed PvP drain amount',near(p.hp-20,10*(cls==='warlock'?.22:.03)*.5),p.hp-20);
   m.takePvpResult({token:hit?.token,by:'B',dealt:10});check(cls+' duplicate drain receipt ignored',p.hp===healed);m.active=m.pvp=false;
  }
  // Quantitative healing promises, without health-cap interference.
  for(const [cls,rank,id,ratio] of [['pyromancer',7,'py_heal',.03],['berserker',5,'bsk_blood',.04],['reaper',7,'x_crimson',.05],['warlock',9,'war_feast',.05]]){
   p=setup(cls,{[rank]:id});const e=foe();e.warCurseT=5;hp=p.hp;a.onKill(p,e);const expected=['reaper','warlock'].includes(cls)?Math.round(b.effMaxHp(p)*ratio):b.effMaxHp(p)*ratio;
   check(cls+' kill healing amount',near(p.hp-hp,expected),{gained:p.hp-hp,expected});
  }
  p=setup('paladin',{3:'pal_thick',7:'pal_heal'});hp=p.hp;b.useSkill(2);check('Paladin skill heals 4% max HP',near(p.hp-hp,b.effMaxHp(p)*.04),p.hp-hp);
  p=setup('monk',{7:'mon_med',9:'mon_still'});p._stillT=3;hp=p.hp;a.tick(p,.5);check('Monk two healing passives stack correctly',near(p.hp-hp,b.effMaxHp(p)*.032*.5));
  p=setup('beastmaster',{5:'bst_rhythm'});a.tick(p,0);g.pet.hp=1;p.hp=1;hp=b.effMaxHp(p);const petMax=g.pet.maxHp;b.SKILL_FX.bst_mend(p);for(let i=0;i<10;i++)a.tick(p,.5);
  check('Mend restores 10% player and 30% companion HP over 5s',near(p.hp,1+hp*.1)&&near(g.pet.hp,1+petMax*.3),{hp:p.hp,pet:g.pet.hp});
  p=setup('warrior');p.dead=true;hp=p.hp;a.heal(p,100);check('Central healing cannot revive a dead player',p.hp===hp);
  p=setup('necromancer');delete b.classState('necromancer').ch[3];delete b.classState('necromancer').ch[9];p.weapon.dmg=10000;b.SKILL_FX.necro_summon(p,true,1);const ordinary=g.minions[0].dmg,ordinaryCount=g.minions.length;g.minions=[];b.classState('necromancer').ch[3]='necro_legion';b.SKILL_FX.necro_summon(p,true,1);
  check('Bone Legion gives one extra summon and advertised 20% damage',ordinaryCount===3&&g.minions.length===4&&Math.abs(g.minions[0].dmg-ordinary*1.2)<=1,{ordinary,legion:g.minions[0].dmg});
  // Compare unconditional scalar passives with exactly the same gear and class.
  for(const [cls,rank,id,metric,ratio] of [['pyromancer',3,'py_power','power',1.1],['pyromancer',9,'py_finish','power',1.12],['ninja',7,'nin_bleed','power',1.1],['ninja',9,'nin_assassin','power',1.12],['necromancer',3,'necro_wither','power',1.12],['warlock',3,'war_frail','power',1.15],['pirate',9,'pir_greed','power',1.12],['pyromancer',3,'py_quick','speed',1.12],['bladedancer',5,'bd_fast','speed',1.12],['pirate',3,'pir_swift','speed',1.15]]){
   p=setup(cls);delete b.classState(cls).ch[rank];const read=()=>metric==='power'?b.effPower(p):a.attackSpeed(p),before=read();b.classState(cls).ch[rank]=id;check(id+' scalar matches card',near(read()/before,ratio),read()/before);
  }
  return {checks:rows.length,failures:rows.filter(r=>!r.ok),rows};
 });return {...report,pageErrors:errors};
}
