/* Does every skill do what its own text says?

   Oliver, after a PvP match: "there was a bunch of skills that didn't do what they said. Some of
   them said they would do damage and then didn't, or some of them said they would heal you and
   then didn't."

   The bar is EFFECT, not number: a skill claiming damage must make a target's HP go down. That
   catches every failure he described across all 16 classes with nothing hand-authored, and it
   deliberately will not catch a skill that hits for the wrong amount. Numbers are a later phase.

   FIELD NAMES ARE READ FROM THE GAME, NOT GUESSED. The first draft of this used p.hpm, p.manam,
   p.shield and p.speed; every one of them is undefined. The real names are maxHp, maxMana and
   shieldHp, there is no speed field at all (effSpeed is a function), and G.minions does not exist
   in the arena because the arena's own reset does not create it. A probe that reads undefined and
   compares it to undefined reports every skill as passing. */
import { runScenario } from './drive.js';
import { claimsOf } from './claims.js';

/* THE RIG MUST PROVE ITSELF FIRST.

   A damage assertion is only worth believing if the harness can land a hit AT ALL. Measured while
   building this: a basic attack on a spawned dummy did nothing, and Charge on a grunt did nothing,
   which looked exactly like two broken skills and was actually a broken test bench - enemies spawn
   with `active:false` and a ~1.2s `dropT` drop-in timer, and the geometry of "in front of you" is
   not simply p.z-90.

   So: swing a plain attack at a known target first. If that cannot draw blood, the bench is broken,
   and every damage claim this run is reported UNPROVEN rather than FAILED. Reporting them as
   failures would bury the real bugs Oliver found under a hundred false ones - which is how a
   harness stops being read. */
const BASELINE = `(function(){
  const G = __BF3.G, p = G.p;
  G.enemies.length = 0;
  const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
  if(!foe) return JSON.stringify({ ok:false, why:'spawnEnemy returned nothing' });
  foe.maxHp = 100000; foe.hp = 100000; foe.active = true; foe.dropT = 0;
  const h0 = foe.hp;
  for(let k = 0; k < 240; k++){                       // 4s of swinging, four seconds of chances
    try { if(__BF3.playerAttack) __BF3.playerAttack(); } catch(e){}
    try { __BF3.update(1/60); } catch(e){}
    if(foe.hp < h0) return JSON.stringify({ ok:true, dealt:h0 - foe.hp, ticks:k });
  }
  return JSON.stringify({ ok:false, why:'a plain attack drew no blood in 4s', foeAt:{x:Math.round(foe.x),z:Math.round(foe.z)}, playerAt:{x:Math.round(p.x),z:Math.round(p.z)} });
})()`;

const PROBE = (classId) => `(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = ${JSON.stringify(classId)};
  const G = __BF3.G, p = G.p;
  const skills = __BF3.curSkills() || [];
  const R = [];
  for(let i = 0; i < skills.length; i++){
    const s = skills[i]; if(!s) continue;
    /* A fresh dummy per skill, at a fixed distance in front, so one skill's kill cannot mask the
       next skill's no-op. Huge HP so nothing dies and disappears mid-measurement. */
    G.enemies.length = 0;
    let dummy = null;
    try {
      /* EXACTLY the rig the baseline proved: a grunt at 60 units, awake, drop-in timer cleared.
         The first version used a 'dummy' at 90 units and reported skills as dealing no damage
         while a plain attack could not hurt it either - two variables at once, and the harness
         blamed the game for both. Never diverge this from BASELINE without re-proving BASELINE. */
      dummy = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
      if(dummy){ dummy.active = true; dummy.dropT = 0; dummy.maxHp = 100000; dummy.hp = 100000; }
    } catch(e){}
    p.hp = Math.round((p.maxHp || 100) * 0.5);      // damaged, so a heal has room to show
    p.mana = p.maxMana || 999;
    if(p.skillCd) p.skillCd[i] = 0;
    p.yaw = Math.PI; G.camYaw = Math.PI;             // face the dummy for aimed skills
    const before = { tgt: dummy ? dummy.hp : null, hp: p.hp,
                     minions: (G.minions || []).length, shield: p.shieldHp || 0 };
    let threw = null;
    try { __BF3.useSkill(i); } catch(e){ threw = String((e && e.message) || e); }
    let peakHp = p.hp, peakShield = p.shieldHp || 0, peakMinions = (G.minions || []).length;
    let minTgt = dummy ? dummy.hp : null;
    for(let k = 0; k < 120; k++){                    // 2s: travel time, dots, buff windows
      try { __BF3.update(1/60); } catch(e){}
      if(p.hp > peakHp) peakHp = p.hp;
      if((p.shieldHp || 0) > peakShield) peakShield = p.shieldHp || 0;
      if((G.minions || []).length > peakMinions) peakMinions = (G.minions || []).length;
      if(dummy && dummy.hp < minTgt) minTgt = dummy.hp;
    }
    R.push({ n: s.n, d: s.d || '', threw: threw, hadTarget: !!dummy,
             before: before,
             after: { tgt: minTgt, hp: peakHp, minions: peakMinions, shield: peakShield },
             onCd: !!(p.skillCd && p.skillCd[i] > 0) });
  }
  return JSON.stringify({ cls: ${JSON.stringify(classId)}, results: R });
})()`;

/* control and buff are checked as "the cast actually happened" because their effect is not one
   field - a stun lives on the target's state machine, a buff on a timer. A skill that never fires
   also never goes on cooldown, which is the failure Oliver actually saw. */
const SATISFIED = {
  damage:  (b, a) => a.tgt != null && a.tgt < b.tgt,
  heal:    (b, a) => a.hp > b.hp,
  shield:  (b, a) => a.shield > b.shield,
  summon:  (b, a) => a.minions > b.minions,
  control: (b, a, r) => r.onCd,
  buff:    (b, a, r) => r.onCd,
};

export async function runSkillTests(opts){
  const only = (opts && opts.classes) || null;
  const classes = only || await runScenario({
    scene: 'arena:flat', waitMs: 12000,
    js: '(function(){ return JSON.stringify(Object.keys(__BF3.CLASSES||{})); })()',
  });
  /* Can this bench measure damage at all? Everything downstream depends on the answer. */
  let baseline = { ok: false, why: 'not run' };
  try { baseline = await runScenario({ scene: 'arena:flat', waitMs: 12000, js: BASELINE }); }
  catch(e){ baseline = { ok: false, why: e.message.slice(0, 200) }; }
  const canMeasureDamage = !!baseline.ok;

  const failures = [];
  const unproven = [];
  let pass = 0;
  for(const cls of classes){
    let got;
    try { got = await runScenario({ scene: 'arena:flat', waitMs: 12000, js: PROBE(cls) }); }
    catch(e){ failures.push({ cls, skill: '(class)', claim: 'load', text: '', detail: e.message.slice(0, 200) }); continue; }
    for(const r of got.results){
      if(r.threw){ failures.push({ cls, skill: r.n, claim: 'throw', text: r.d, detail: r.threw }); continue; }
      const claims = claimsOf(r.d);
      if(!claims.length){ pass++; continue; }          // promises nothing, so nothing to check
      for(const c of claims){
        if(c === 'damage' && (!r.hadTarget || !canMeasureDamage)){
          unproven.push({ cls, skill: r.n, claim: c, text: r.d });
          continue;                                    // the bench cannot see damage; do not accuse
        }
        const ok = SATISFIED[c] ? SATISFIED[c](r.before, r.after, r) : true;
        if(ok) pass++;
        else failures.push({ cls, skill: r.n, claim: c, text: r.d,
                             detail: JSON.stringify({ before: r.before, after: r.after, onCd: r.onCd }) });
      }
    }
  }
  return { pass, fail: failures.length, failures, unproven, baseline };
}

if(import.meta.filename === process.argv[1]){
  const only = process.argv[3] ? process.argv.slice(3) : null;
  runSkillTests(only ? { classes: only } : undefined).then(r => {
    for(const f of r.failures) console.log(`FAIL ${f.cls}/${f.skill} claims ${f.claim}: "${f.text}" ${f.detail}`);
    if(!r.baseline.ok) console.log(`BENCH: cannot measure damage (${r.baseline.why}) — ${r.unproven.length} damage claims UNPROVEN, not failed`);
    console.log(`skills: ${r.pass} pass, ${r.fail} fail, ${r.unproven.length} unproven`);
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
