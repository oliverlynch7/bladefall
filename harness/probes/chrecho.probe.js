/* DOES ECHO (THE PASSIVE) DO ANYTHING AT ALL?

   Chronomancer rank-9 option a (index.html:2160) reads: "Your last skill fires again, by itself,
   three seconds later." `harness/audit-passives.js` says the id `chr_echo` appears exactly twice in
   the whole of public/ - in CLASS2 where it is defined and in PASSIVE_ART where its icon is named -
   and nowhere else. It is one of the 37 still standing in docs/SKILL_TRIAGE.md section E.

   NOTHING IS INVENTED, which is the bar section E rows have to clear. The three seconds is printed
   on the card, the power is the skill's own because - unlike the mage's Spell Echo, "every fourth
   skill repeats AT 35% POWER" (10438) - this card names no reduction, and the repeat mechanism is
   Spell Echo's: the same SKILL_FX handler called a second time. The only new part is the timer.

   A/B IN ONE LAUNCH between the two options at the SAME rank in the SAME game, so the only
   difference between the halves is which passive is chosen. The control is `chr_freeze` (Deep
   Freeze), the b-side of rank 9. It is itself dead - rank 9 is the one cluster where BOTH options
   are unread - which is exactly what a control has to be here: it must not repeat a skill, and a
   passive nothing reads cannot.

   THE SKILL UNDER TEST IS SINGULARITY (`chr_overload`, rank 8 b) and it is chosen deliberately. It
   is a single instantaneous burst - one `hitEnemy` per target, no lingering field - so a second
   drop in the dummy's HP with no input between cannot be the first cast still resolving. The a-side
   at that rank, Time Storm, is "a 4s storm" and would have made the two windows overlap.

   Three windows per half, and the third is a clause of the card rather than padding:
     1. cast, then 2.0s          - did the skill land at all (a zero later is never a cast that never happened)
     2. +1.5s, so t=3.5s         - did it fire a SECOND time, with no input
     3. +4.0s, so t=7.5s         - and only once. "Fires again" is one repeat; arming from the echo
                                   would be a loop that never stops, so the tail must be silent.

   The weapon's element is stripped before the trials. An elemental hit applies a status that keeps
   ticking damage, and a burn from window 1 landing in window 2 reads exactly like an echo. Stated
   rather than hidden: this is the one thing the bench changes about the loadout beyond equipping it.

   Known-bad carried in the probe rather than produced by breaking the repo, per Task 4's rule: a
   THIRD half runs the inert control again and is fed to the identical bar as if it were the fix, so
   `okAgainstInert` is what this probe would say against the shipped game. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'chronomancer';

  /* The Arena hands out its own loadout, which is usually off-class, and a cast made off-class runs
     the `ok:false` branch of every handler. Equip through the game's own starter table. */
  let weaponNote = 'none';
  (function(){
    const tries = ['chronomancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();
  const elStripped = !!(p.weapon && p.weapon.el);
  if(p.weapon) p.weapon.el = null;          // so a lingering burn cannot be read as a second firing

  const cs = __BF3.classState('chronomancer');
  cs.ch = cs.ch || {};
  cs.ch[8] = 'chr_overload';                // Singularity: one instantaneous burst, nothing lingering

  const cast = (__BF3.c2CurSkills() || [])[3];
  const castName = cast ? cast.n : null, castFx = cast ? cast.fx : null;

  const tick = (n) => { for(let k = 0; k < n; k++) __BF3.update(1/60); };

  const trial = (pick, label) => {
    cs.ch[9] = pick;

    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    p.hp = __BF3.effMaxHp(p);
    p.maxMana = p.maxMana || 100; p.mana = p.maxMana;
    for(let i = 0; i < 4; i++) if(p.skillCd) p.skillCd[i] = 0;

    let dummy = null;
    try { dummy = __BF3.spawnEnemy('dummy', p.x, p.z - 150); } catch(e){}
    if(!dummy) return { label:label, pick:pick, why:'no dummy' };
    dummy.dummy = true; dummy.active = true;
    dummy.hp = dummy.maxHp = 10000000;
    dummy.untargetable = false;

    const hp0 = dummy.hp;
    let threw = null;
    try { __BF3.useSkill(3); } catch(e){ threw = String(e && e.message || e); }

    tick(120); const hp1 = dummy.hp;          // t = 2.0s - the cast has fully resolved
    tick(90);  const hp2 = dummy.hp;          // t = 3.5s - the echo's window
    tick(240); const hp3 = dummy.hp;          // t = 7.5s - and nothing after it

    return {
      label: label, pick: pick,
      dmgCast: Math.round(hp0 - hp1),
      dmgEchoWindow: Math.round(hp1 - hp2),
      dmgTail: Math.round(hp2 - hp3),
      ratio: (hp0 - hp1) > 0 ? Math.round((hp1 - hp2) / (hp0 - hp1) * 1000) / 1000 : null,
      threw: threw,
    };
  };

  /* THE BAR. Both halves must have landed the first cast, the control must be silent in both later
     windows, and the echo half must show a second hit of the skill's OWN size (not the mage's 35%)
     in the second window and nothing at all in the third. */
  const bar = (ctl, ech) =>
    !!(ctl && ech && !ctl.threw && !ech.threw
       && ctl.dmgCast > 0 && ech.dmgCast > 0
       && ctl.dmgEchoWindow === 0 && ctl.dmgTail === 0
       && ech.dmgEchoWindow > 0
       && ech.ratio >= 0.9 && ech.ratio <= 1.1
       && ech.dmgTail === 0);

  const control = trial('chr_freeze', 'control (b-side of the same rank, itself unread)');
  const echo    = trial('chr_echo',   'echo');
  const inert   = trial('chr_freeze', 'known-bad: the inert control fed to the fix\'s own bar');

  return JSON.stringify({
    ok: bar(control, echo),
    okAgainstInert: bar(control, inert),
    castName: castName, castFx: castFx,
    control: control, echo: echo, inert: inert,
    weapon: p.weapon && p.weapon.name, weaponNote: weaponNote, elementStripped: elStripped,
  });
})()
