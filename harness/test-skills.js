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
   compares it to undefined reports every skill as passing.

   ── AND THE SKILL IT READ WAS NOT THE SKILL IT CAST. Read this before trusting any verdict. ──
   This suite spent its whole life checking each promise against a DIFFERENT skill's effect. It read
   names and descriptions from curSkills() - the legacy CLASSES kit (index.html:2353) - and then
   cast by the same index through useSkill(i), which branches on c2def() and, because all SIXTEEN
   classes now have a CLASS2 tree, ALWAYS casts c2CurSkills()[i] (10311, 9948).
   The lists disagree. Warrior index 2 reads "Charge" and casts rank-6 "Iron Guard/Shockwave Stomp",
   because Charge is rank 4 and therefore slot 1. Measured, not inferred: casting index 2 left
   p.chargeDash at 0, p._chDmg at 0, and the hero standing still for all 120 ticks while the dummy
   walked to it - Charge's own first statement is `p.chargeDash=0.32`, so it plainly never ran.
   It produced four confident accusations - warrior/Charge, mage/Nova, reaper/Soul Harvest,
   paladin/Taunt - every one of them naming a skill the bench had not cast. The 62 passes were no
   better founded; both lists are full of damage skills, so a damage claim was usually satisfied by
   whatever did fire. THE FIX IS ONE LINE - read from the list that gets cast - and it is the reason
   the baseline had to be re-taken rather than compared.

   ── AND THEN IT CAST THE RIGHT SKILL IN A STATE THE GAME DOES NOT ALLOW. ──
   useSkill calls fx(p, classFamilyOk(p.weapon), am), and a great many SKILL_FX bodies gate their
   defining half on that second argument - harvest's heal is `if(hit && ok)`. The bench swapped
   meta.classId and left the weapon alone. The Arena hands you a Keen Legendary SWORD, so, measured
   in one launch across all sixteen classes, ELEVEN of them were casting off-class: ranger, mage,
   reaper, necromancer, berserker, chronomancer, monk, stormcaller, warlock, skylancer, beastmaster.
   Every `if(ok)` branch in eleven kits was skipped, and the suite called the result a bug.
   It is not even a state a player can reach: index.html:13220 HARD BLOCKS equipping off-class
   ("C1: hard block, not a damage penalty"), so the bench was the only thing in the world that could
   stand there. The fix equips the class's own starter through the game's own classStartWeapon().

   ── AND EVERY SKILL INHERITED THE PREVIOUS SKILL'S SIDE EFFECTS. ──
   A fresh dummy per skill was only half the isolation; the player was never reset. bladedancer
   Riposte is cast one slot after bd_counter, which opens a parry window, and a parry that happens
   to land turns the next Riposte from a 55-unit lunge into a 95-unit one - past a dummy standing
   at 60, where its cone misses. Same code, `5 pass, 0 fail` and `4 pass, 1 fail` on consecutive
   runs. See reset() below; the pose is now restored before every cast.

   Three classes have no in-family starter to equip, which is a GAME bug this found rather than a
   harness one - berserker (family great/axe/hammer, starter 'sword'), pirate (family
   sword/cross/javelin/axe, starter 'flintlock') and beastmaster (family bow/javelin, absent from
   CLASSSTART entirely so it falls back to the warrior's sword). Each is reported in the result's
   `weapon.note` so a reader can see which classes were measured on a borrowed or forced weapon. */
import { runScenario } from './drive.js';
import { claimsOf, isIndirectDamage } from './claims.js';

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
/* HOW FAR IN FRONT THE TARGET STANDS — ONE number, for the rig test and for every skill probe.

   It was written twice, as a bare `60` in each of the two page expressions below, and the pair is
   load-bearing: the rig test's whole job is to prove the geometry the skill probe then measures in,
   so a run that changed one and not the other would be certifying a bench it is not using. Nothing
   caught that, because both halves would still run and both would still report numbers.

   THE VALUE IS DELIBERATELY UNCHANGED AT 60, and that is a measurement, not caution. The harness-
   hardening plan (docs/superpowers/plans/2026-08-11-harness-hardening.md, Task 1) proposed
   shortening this to sit under the shortest lunge in the game, because bladedancer/Riposte flapped
   at 60. That flap was fixed at its real source on 2026-08-11 (`a724d69`) — the pose restore in
   reset() below — and it does not reproduce: ten consecutive `--classes bladedancer` runs on
   2026-08-12 returned `5 pass, 0 fail, 0 unproven`, ten times. The plan's own Step 1 says to stop
   rather than change geometry on a guess if it comes back stable, and moving this number re-
   baselines all sixteen classes. So it moves when a measurement asks for it and not before.

   `harness/probes/riposte.probe.js` carries its own copy of 60 on purpose: a probe is a frozen
   record of one measurement, run through `--eval`, and it cannot import from here. */
const TARGET_DIST = 60;

const BASELINE = `(function(){
  const G = __BF3.G, p = G.p;
  G.enemies.length = 0;
  const foe = __BF3.spawnEnemy('grunt', p.x, p.z - ${TARGET_DIST});
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

  /* EQUIP ON-CLASS, through the game's own classStartWeapon(). See the header: with the Arena's
     sword still in hand, eleven of sixteen classes cast with ok=false and every "if(ok)" half of
     their kit was skipped. Preference order is deliberate - the class's OWN starter first, then any
     other class's starter that happens to land in this family, and only then the anyClass override,
     because each fallback is a weaker claim about what a player would actually be holding. */
  let weaponNote = 'none';
  (function(){
    const tries = [${JSON.stringify(classId)}].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
    let w = null; try { w = __BF3.classStartWeapon(${JSON.stringify(classId)}); } catch(e){}
    if(w){ w.anyClass = true; p.weapon = w;
           weaponNote = 'FORCED anyClass - no starter in the game lands in this class family'; }
  })();
  const onClass = __BF3.classFamilyOk(p.weapon);

  /* 5s, not 2s. Three skills in the game promise a four-second window in their own text - mage
     Attunement "a 4s storm", reaper Soul Siphon "drain ... for 4s", beastmaster Guardian Bond
     "for 4s" - and a tick loop that ends before the effect does cannot see it. */
  const TICKS = 300;

  const mkDummy = () => {
    /* A fresh dummy per skill, at a fixed distance in front, so one skill's kill cannot mask the
       next skill's no-op. Huge HP so nothing dies and disappears mid-measurement.
       EXACTLY the rig the baseline proved: a grunt at TARGET_DIST units, awake, drop-in timer
       cleared - the same constant the baseline spawns at, so the two can never drift apart. */
    G.enemies.length = 0;
    let d = null;
    try {
      d = __BF3.spawnEnemy('grunt', p.x, p.z - ${TARGET_DIST});
      if(d){ d.active = true; d.dropT = 0; d.maxHp = 100000; d.hp = 100000; }
    } catch(e){}
    return d;
  };
  /* EVERY CAST STARTS FROM THE SAME BODY, and until 2026-08-11 none of them did.

     A fresh dummy per skill was only half the isolation. The PLAYER carried whatever the previous
     skill left on it - stances, charges, dash flags, i-frames, and its position - into the next
     skill's verdict, so skill i's result was a function of skill i-1's side effects.

     Measured, on bladedancer/Riposte, which is why this is here (docs/SKILL_TRIAGE.md section F):
     the skill before it in the list is bd_counter, which opens a 0.65s PARRY window; if the grunt's
     swing happens to land inside that window, hurtPlayer stores a Riposte, and a stored Riposte
     lunges 95 units instead of 55. The dummy is 60 away. So the charged cast lands 35 units PAST
     the target, bdArc's cone gets dot -1 against a needed 0.81, and the skill deals zero - while an
     uncharged cast lands at 5 units, inside the dummy's own 15-unit radius, where bdArc skips the
     cone test entirely and always hits. Whether a grunt lands a hit inside a 0.65s window is a
     race, so the same code produced "5 pass, 0 fail" and "4 pass, 1 fail" from consecutive runs.
     That is not a mis-report the way a flapping pass/unproven split is: a NEW hard failure is what
     run-all.js calls a REGRESSION, and autopilot.ps1 answers a red gate with "git checkout -- .".
     The flap could delete a run's verified work.

     Restoring the pose is deliberately GENERAL rather than a list of bladedancer fields. Any class
     with a stance, a charge or a dash has the same shape of contamination, and a denylist would
     have to be rediscovered once per class. Only numbers and booleans are restored - the weapon,
     skillCd and any other object stay as they are - and a key the skill INVENTED is zeroed rather
     than deleted, because the game reads every one of these as "p.foo||0". */
  let POSE = null;
  const takePose = () => {
    POSE = {};
    for(const k in p){ const v = p[k]; if(typeof v === 'number' || typeof v === 'boolean') POSE[k] = v; }
  };
  const reset = () => {
    if(POSE){
      for(const k in p){
        const v = p[k];
        if(typeof v !== 'number' && typeof v !== 'boolean') continue;
        p[k] = (k in POSE) ? POSE[k] : (typeof v === 'number' ? 0 : false);
      }
    }
    p.hp = Math.round((p.maxHp || 100) * 0.5);       // damaged, so a heal has room to show
    p.mana = p.maxMana || 999;
    p.yaw = Math.PI; G.camYaw = Math.PI;             // face the dummy for aimed skills
  };
  /* PROTECTION IS THREE FIELDS AND TWO BODIES, and reading one of them was a bug of its own.
     p.shieldHp is an absorb pool; p.guardT is the BRACE (index.html:11155, "if(p.guardT>0)
     dmg*=0.4") and is what "brace behind your shield" compiles to; and beastmaster Guardian Bond
     shields the COMPANION - pet.shieldHp (10111), not the player's. The old probe read
     p.shieldHp only, so it failed paladin Shield Bash, paladin Taunt and Guardian Bond for not
     doing something none of them ever claimed to do to that field. */
  const petShield = () => {
    let s = 0;
    const pet = G.pet;
    if(pet && !pet.dead) s = Math.max(s, pet.shieldHp || 0);
    for(const m of (G.minions || [])) s = Math.max(s, (m && m.shieldHp) || 0);
    return s;
  };
  /* guardT is clamped at 0 because it decays PAST zero (-0.0166 was read live), and a "before" of
     -0.0166 makes a plain 0 afterwards look like protection was gained. */
  const guardOf = () => Math.max(0, p.guardT || 0);
  const snap = (d) => ({ tgt: d ? d.hp : null, hp: p.hp, minions: (G.minions || []).length,
                         shield: p.shieldHp || 0, guard: guardOf(), petShield: petShield() });
  const watch = (d, before) => {
    const a = { tgt: before.tgt, hp: before.hp, minions: before.minions,
                shield: before.shield, guard: before.guard, petShield: before.petShield };
    for(let k = 0; k < TICKS; k++){
      try { __BF3.update(1/60); } catch(e){}
      if(p.hp > a.hp) a.hp = p.hp;
      if((p.shieldHp || 0) > a.shield) a.shield = p.shieldHp || 0;
      if(guardOf() > a.guard) a.guard = guardOf();
      const ps = petShield(); if(ps > a.petShield) a.petShield = ps;
      const mn = (G.minions || []).length; if(mn > a.minions) a.minions = mn;
      if(d && d.hp < a.tgt) a.tgt = d.hp;
    }
    return a;
  };

  /* WHERE WAS THE GAME STANDING? useSkill's first guard is "if(mode!=='play'||!G) return;" and its
     second is "if(p.dead||p.downed) return;", and NEITHER spends a cooldown - so a bench that has
     wandered out of play reports every skill as "fired and did nothing", which is indistinguishable
     from a real bug and is how this probe lied about the whole paladin kit once. Logged per phase,
     so the next reader is told rather than left to reproduce it. */
  const phases = [];
  const mark = (tag) => phases.push({ at: tag, mode: __BF3.mode, dead: !!p.dead,
                                      downed: !!p.downed, hp: Math.round(p.hp) });
  /* Measured: one launch in six came up in mode 'pause' before the probe had done anything, and
     every skill in that class then reported "fired and changed nothing". Escape is the game's own
     resume door (index.html:7765, "else if(mode==='pause'){ resumeGameAudio(true); resumePlay(); }")
     and resumePlay is not exported, so knock on the door rather than reach through the wall. */
  if(__BF3.mode !== 'play'){
    mark('arrived not in play');
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    /* A synthetic keydown did NOT resolve it on the one run it was tried against, so also press the
       card's own Resume button - openPause renders navCard('resBtn', ...). Both are the game's own
       doors; neither reaches past them. */
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  mark('start');
  /* Taken here, before the drift control, so the control measures the same body every skill is
     cast from - otherwise the noise floor is a different starting state from the thing it is the
     floor under. */
  takePose();

  /* DRIFT CONTROL: the identical window with no cast at all. Measured, and it matters - the player
     regenerates about 1 HP a second, so over a 5s window a skill that heals nothing still shows
     +5 HP. Every threshold below is "beat the drift", not "beat zero".
     IT RUNS FIRST, BEFORE ANY SWING, and that ordering is the whole point of it being a control.
     The first version ran the rig test above it and the numbers came back nonsense - drift.hp 238
     (the player healed from half to FULL during a window in which nothing was cast) and drift.tgt
     77 (the dummy lost 77 HP with no skill used). playerAttack leaves the swing chain running, so
     the "control" was measuring a player mid-combo with lifesteal, and every real heal in the game
     was then judged against a bar no heal could clear. */
  let drift;
  /* RESET BEFORE SPAWNING, always. mkDummy places the dummy at p.z-60, so it has to be told where
     the player IS, and reset() now restores the pose - including position. Spawning first put the
     dummy 60 units in front of wherever the last skill left the body and then teleported the body
     back to the start, which is a rig with the target hundreds of units off to one side. */
  { reset(); const d = mkDummy();
    const sw0 = p.swingId;
    const b = snap(d), a = watch(d, b);
    drift = { hp: a.hp - b.hp, shield: a.shield - b.shield, guard: a.guard - b.guard,
              petShield: a.petShield - b.petShield, minions: a.minions - b.minions,
              tgt: b.tgt != null ? (b.tgt - a.tgt) : 0,
              /* WHO HURT THE DUMMY WITH NOTHING CAST? Measured: 506 HP for the paladin, 218 for
                 the beastmaster. These three name the suspects - the player swung anyway, the pet
                 fought on its own, or something else is in the room. */
              swung: p.swingId !== sw0, pet: !!(G.pet && !G.pet.dead),
              enemies: (G.enemies || []).length };
  }
  mark('after drift control');

  /* READ FROM THE LIST useSkill CASTS FROM, which is not curSkills(). See the header. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  const FX = __BF3.SKILL_FX || {};
  const R = [];
  for(let i = 0; i < skills.length; i++){
    const s = skills[i]; if(!s) continue;
    reset();                                         // pose first, then place the target on it
    const dummy = mkDummy();
    mark('before ' + (s.n || i));
    if(p.skillCd) p.skillCd[i] = 0;
    const before = snap(dummy);
    let threw = null;
    try { __BF3.useSkill(i); } catch(e){ threw = String((e && e.message) || e); }
    /* READ THE COOLDOWN NOW, not after the window. "Did the cast take" is a question about the
       moment of casting, and once the window grew to 5s every skill with a cooldown of 5s or less
       had already come back off it - beastmaster Sic 'Em and chronomancer Slow Field both reported
       onCd:false while plainly having fired, which fails every control and buff claim they make. */
    const onCd = !!(p.skillCd && p.skillCd[i] > 0);
    const after = watch(dummy, before);
    R.push({ n: s.n, d: s.d || '', fx: s.fx || null,
             live: s.fx ? (typeof FX[s.fx] === 'function') : null,
             threw: threw, hadTarget: !!dummy, before: before, after: after, onCd: onCd });
  }
  mark('after skills');

  /* CAN THIS CLASS'S WEAPON DRAW BLOOD AT ALL? The global BASELINE proves the spawn geometry with
     the Arena's legendary sword; this asks the same question of the battered starter each class is
     now measured with, because a damage verdict is only worth having if a plain swing lands.
     DEAD LAST, for the reason written on the drift control: it leaves the player swinging. */
  let canHit = false;
  { reset(); const d = mkDummy();
    const h0 = d ? d.hp : 0;
    for(let k = 0; k < 240 && d; k++){
      try { if(__BF3.playerAttack) __BF3.playerAttack(); } catch(e){}
      try { __BF3.update(1/60); } catch(e){}
      if(d.hp < h0){ canHit = true; break; }
    } }
  mark('after rig test');

  return JSON.stringify({ cls: ${JSON.stringify(classId)}, onClass: onClass, canHit: canHit,
                          weapon: { name: p.weapon && p.weapon.name, art: p.weapon && p.weapon.art,
                                    note: weaponNote },
                          drift: drift, phases: phases, results: R });
})()`;

/* control and buff are checked as "the cast actually happened" because their effect is not one
   field - a stun lives on the target's state machine, a buff on a timer. That check is WEAK on its
   own: useSkill spends the cooldown before it looks up the handler, so a skill with no handler at
   all still comes back onCd. The separate `live` assertion below is what covers that hole.

   TWO BARS, NOT ONE, AND THE DRIFT IS THE SECOND ONE - never the first.
   MET asks "did the promised thing happen at all", which is the original bar and the one that
   decides FAIL. CLEARS_NOISE asks "by more than the same window with nothing cast", and it decides
   only whether a pass is believable. The drift is real and it is large: measured live, the
   beastmaster's companion fights on its own and takes 165 HP off the dummy with no skill used, and
   the warrior heals 238 unprompted in five seconds.
   The first version of this subtracted the drift inside the FAIL bar, and it immediately invented
   two bugs - reaper/Reap and paladin/Last Stand, both of which visibly heal - because it demanded
   a heal beat a noise floor made of the class's own passive healing. Per VISION.md, missing data
   is not a negative finding: noise makes an answer inconclusive, never wrong. */
const MET = {
  damage:  (b, a) => a.tgt != null && a.tgt < b.tgt,
  heal:    (b, a) => a.hp > b.hp,
  /* Any of the game's three protections, on either body it can land on. See petShield() above. */
  shield:  (b, a) => a.shield > b.shield || a.guard > b.guard || a.petShield > b.petShield,
  summon:  (b, a) => a.minions > b.minions,
  control: (b, a, r) => r.onCd,
  buff:    (b, a, r) => r.onCd,
};
const CLEARS_NOISE = {
  damage:  (b, a, dr) => a.tgt < b.tgt - (dr.tgt || 0),
  heal:    (b, a, dr) => a.hp > b.hp + (dr.hp || 0),
  shield:  (b, a, dr) => a.shield > b.shield + (dr.shield || 0)
                      || a.guard > b.guard + (dr.guard || 0)
                      || a.petShield > b.petShield + (dr.petShield || 0),
  summon:  (b, a, dr) => a.minions > b.minions + (dr.minions || 0),
  /* onCd is a yes/no, not a magnitude, so it has no noise floor to clear. */
  control: () => true,
  buff:    () => true,
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
  const benches = [];      // what each class was actually measured holding - published, not implied
  let pass = 0;
  /* 'arrived not in play' is excluded from the stray test: that mark is taken BEFORE the probe
     knocks on the game's own resume door, and the next mark says whether it opened. */
  const strayedIn = (got) => (got.phases || [])
    .filter(x => x.at !== 'arrived not in play')
    .filter(x => x.mode !== 'play' || x.dead || x.downed);

  for(const cls of classes){
    let got;
    try { got = await runScenario({ scene: 'arena:flat', waitMs: 12000, js: PROBE(cls) }); }
    catch(e){ failures.push({ cls, skill: '(class)', claim: 'load', text: '', detail: e.message.slice(0, 200) }); continue; }
    /* ONE RETRY, and only for a bench that is KNOWN to have measured nothing. Measured: roughly one
       launch in six comes up in mode 'pause' before the probe has done anything, and useSkill's
       first guard returns without spending a cooldown - so the class reports four skills that
       "fired and changed nothing", which is indistinguishable from four real bugs. A retry here is
       not papering over a flaky assertion; the assertion is that the game was in play, it failed,
       and the run it guarded is void. */
    if(strayedIn(got).length){
      try { got = await runScenario({ scene: 'arena:flat', waitMs: 12000, js: PROBE(cls) }); }
      catch(e){ failures.push({ cls, skill: '(class)', claim: 'load', text: '', detail: e.message.slice(0, 200) }); continue; }
    }
    benches.push({ cls, onClass: got.onClass, canHit: got.canHit,
                   weapon: got.weapon, drift: got.drift, phases: got.phases });
    const strayed = strayedIn(got);
    if(strayed.length){
      failures.push({ cls, skill: '(class)', claim: 'bench left play', text: '',
                      detail: JSON.stringify(strayed[0]) + ' (twice, so not a flake)' });
      continue;
    }
    for(const r of got.results){
      if(r.threw){ failures.push({ cls, skill: r.n, claim: 'throw', text: r.d, detail: r.threw }); continue; }
      /* DOES THIS SKILL HAVE A HANDLER AT ALL? SKILL_FX is built by aliasing, and an alias written
         above the definition it copies - `SKILL_FX.chr_gravity = SKILL_FX.m_gravity` at 10129 when
         m_gravity is defined at 10148 - silently stores undefined. useSkill does
         `const fx = SKILL_FX[s.fx], r = fx ? fx(...) : null`, so the cast spends the cooldown and
         the mana and does nothing whatsoever. No claim check can catch it: the damage ones report
         it as a damage bug, and the control/buff ones PASS it, because onCd is true.
         This assertion has been watched to fail nine times, which is why it is believed. */
      if(r.live === false){
        failures.push({ cls, skill: r.n, claim: 'dead handler', text: r.d,
                        detail: `SKILL_FX.${r.fx} is not a function - the cast spends its cooldown and does nothing` });
        continue;
      }
      const claims = claimsOf(r.d);
      if(!claims.length){ pass++; continue; }          // promises nothing, so nothing to check
      for(const c of claims){
        if(c === 'damage' && (!r.hadTarget || !canMeasureDamage || got.canHit === false)){
          unproven.push({ cls, skill: r.n, claim: c, text: r.d, why: 'bench cannot measure damage' });
          continue;                                    // the bench cannot see damage; do not accuse
        }
        /* Damage owed by another source ("your spells hit them harder") or owed on a condition the
           bench never meets ("explode on death" - the dummy has 100000 HP and never dies) is not
           damage this rig can observe. Inconclusive, not broken. See claims.js:INDIRECT. */
        if(c === 'damage' && isIndirectDamage(r.d)){
          unproven.push({ cls, skill: r.n, claim: c, text: r.d, why: 'indirect or conditional promise' });
          continue;
        }
        const met = MET[c] ? MET[c](r.before, r.after, r) : true;
        if(!met){
          failures.push({ cls, skill: r.n, claim: c, text: r.d,
                          detail: JSON.stringify({ before: r.before, after: r.after,
                                                   drift: got.drift, onCd: r.onCd,
                                                   weapon: got.weapon }) });
          continue;
        }
        const clear = CLEARS_NOISE[c] ? CLEARS_NOISE[c](r.before, r.after, got.drift || {}) : true;
        if(clear) pass++;
        else unproven.push({ cls, skill: r.n, claim: c, text: r.d,
                             why: 'happened, but inside the bench noise floor ' + JSON.stringify(got.drift) });
      }
    }
  }
  return { pass, fail: failures.length, failures, unproven, baseline, benches };
}

if(import.meta.filename === process.argv[1]){
  const only = process.argv[3] ? process.argv.slice(3) : null;
  runSkillTests(only ? { classes: only } : undefined).then(r => {
    for(const b of r.benches){
      const d = b.drift || {};
      if(!b.onClass || b.canHit === false || (b.weapon && b.weapon.note !== 'own starter') || d.tgt || d.hp)
        console.log(`BENCH ${b.cls}: ${b.weapon && b.weapon.name} (${b.weapon && b.weapon.art}) — ${b.weapon && b.weapon.note}, onClass ${b.onClass}, canHit ${b.canHit}, drift ${JSON.stringify(d)}`);
    }
    for(const f of r.failures) console.log(`FAIL ${f.cls}/${f.skill} claims ${f.claim}: "${f.text}" ${f.detail}`);
    if(!r.baseline.ok) console.log(`BENCH: cannot measure damage (${r.baseline.why}) — ${r.unproven.length} damage claims UNPROVEN, not failed`);
    console.log(`skills: ${r.pass} pass, ${r.fail} fail, ${r.unproven.length} unproven`);
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
