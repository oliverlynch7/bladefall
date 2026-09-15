async(page)=>{
 await page.getByRole('button',{name:'Outskirts',exact:true}).dispatchEvent('click');await page.waitForTimeout(500);
 const results=[];
 const ids=await page.evaluate(()=>Object.keys(__BF3.ARCHES));
 for(const id of ids){
  const initial=await page.evaluate(id=>{const a=__BF3,g=a.G,p=g.p;g.enemies=[];g.combatArt=[];p.combatPose=null;p.chargeAmt=0;p.atkCd=0;p.atkTimer=0;p.dead=false;p.invuln=99999;p.onGround=true;p.weapon=a.makeWeapon(id,'common');
   for(const cls of Object.keys(a.CLASS2)){a.meta.classId=cls;if(a.classFamilyOk(p.weapon))break;}
   a.playerAttack();return {id,art:p.weapon.art,swing:p.swingId,events:g.combatArt.length};},id);
  await page.waitForTimeout(40);
  const first=await page.evaluate(()=>({...HERO3D.playback}));
  await page.evaluate(()=>{const a=__BF3,p=a.G.p;p.atkCd=0;a.playerAttack();});await page.waitForTimeout(40);
  const second=await page.evaluate(()=>({...HERO3D.playback}));
  const charged=await page.evaluate(()=>{const a=__BF3,g=a.G,p=g.p;if(!p.weapon.chg)return null;g.combatArt=[];a.chargeRelease(p,p.weapon,1);return {events:g.combatArt.length,form:g.combatArt.at(-1)?.profile.form};});
  results.push({...initial,first,second,charged});
 }
 const lifecycle=await page.evaluate(()=>{const a=__BF3,g=a.G;g.enemies=[];g.combatArt=[];const p=g.p;const result=a.SKILL_FX.war_final(p,true,1);const refundNoArt=result==='refund'&&g.combatArt.length===0;for(let i=0;i<100;i++)BF_COMBAT_ART.emit(g,'w_whirl',p);const cap=g.combatArt.length;BF_COMBAT_ART.tick(g,2);return {refundNoArt,cap,expired:g.combatArt.length};});
 return {results,lifecycle,world:await page.evaluate(()=>({world:__world3d().err,hero:HERO3D.err,art:__combatArtStats}))};
}
