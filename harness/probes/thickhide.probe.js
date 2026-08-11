/* DOES THICK HIDE DO ANYTHING AT ALL?

   Berserker rank-5 option a (index.html:2132) reads: "Damage that would drop you below 1 HP leaves
   you at 1 instead, once per fight." `harness/audit-passives.js` says the id `bsk_thick` appears
   exactly twice in the whole of public/ — in CLASS2 where it is defined and in PASSIVE_ART where its
   icon is named — and nowhere else, so nothing in the game ever consults it. It is one of the 45 in
   docs/SKILL_TRIAGE.md section E.

   The audit is STATIC and proves WIRED, not CORRECT. This is the other half: it drives the game's
   own `hurtPlayer` with a killing blow and reads what is left of the player. Three death saves
   already exist in the same file and two of them in the same function — necromancer `necro_undying`
   (a killing blow spends a minion, 11244), the chronomancer's Rewind (11252) and the pet's One Pack
   (hurtPet, 11285) — so this is a fourth of an existing shape rather than a new mechanic, and 1 HP
   is written on the card.

   A/B IN ONE LAUNCH, which is the only shape that means anything. The comparison is between the two
   options at the SAME rank in the SAME game: with the b-side `bsk_blood` picked the same blow must
   kill, with `bsk_thick` it must leave 1. Two separate runs could differ for any reason at all; one
   run differing only in which passive is picked cannot.

   FOUR trials, because "once per fight" is half the promise and a save that fires every time is as
   wrong as one that never fires:
     1 control  bsk_blood picked  → dies
     2 thick    bsk_thick picked  → 1 HP
     3 again    same fight, no ticks between → dies, the save is spent
     4 rearm    six seconds untouched, then hit → 1 HP again

   DEATH IS READ FROM THE GAME, not inferred: in the Arena `die()` is `arenaRespawn()`, which
   increments `G.arenaScore.b`. So a trial "died" when the game's own death counter moved — which
   also means every trial is recoverable and all four fit in one launch. Deliberately NOT read off
   `p.dead`, because arenaRespawn clears it in the same synchronous call.

   `ch[7]` is pinned to the a-side on purpose. The b-side is `bsk_frenzy`, and hurtPlayer's line
   11205 does `v*=1+(1-fr)` with no `v` in scope — see the `frenzy` field at the bottom, which
   measures that rather than assuming it, and section G of docs/SKILL_TRIAGE.md.

   Known-bad: watched to fail against the shipped game — thick died exactly like the control. */
(function(){
  const G = __BF3.G, p = G.p;

  /* Arrive in PLAY. Roughly one launch in six lands paused; the game's own resume door is the idiom
     test-skills.js, headlong.probe.js and stward.probe.js all use. hurtPlayer does not read `mode`,
     but `update()` does, and trial 4 needs six seconds of real ticks. */
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

  /* hurtPlayer returns before every death save when G.hub is set — the Waystation is a sanctuary and
     converts a killing blow to half HP (11235). A probe run there would report "saved" for both
     halves of the A/B and prove nothing. */
  if(G.hub) return JSON.stringify({ ok:false, why:'in the hub, where nothing can kill you' });
  if(!G.arena) return JSON.stringify({ ok:false, why:'not in the Arena — death would not be recoverable' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[7] = 'bsk_rage';                     // NOT bsk_frenzy — see the header and the frenzy field

  const score = () => { G.arenaScore = G.arenaScore || { p:0, b:0 }; return G.arenaScore.b | 0; };
  const max = () => Math.round(__BF3.effMaxHp(p));

  /* One killing blow, from a clean body. Protection is zeroed rather than trusted: shieldHp, guardT
     and reflectT each have their own early return in hurtPlayer, so any one of them left over from a
     previous trial would look exactly like the save under test. */
  const lethal = (pid) => {
    if(pid) cs.ch[5] = pid;
    G.enemies.length = 0;
    p.dead = false; p.downed = false;
    p.invuln = 0; p.dodgeTimer = 0;
    p.shieldHp = 0; p.shieldT = 0; p.guardT = 0; p.reflectT = 0; p._stillnessT = 0;
    const m = max();
    p.hp = Math.max(1, Math.round(m * 0.25));
    const hp0 = p.hp, d0 = score();
    const since = Math.round((G.time - (p._thickHitT || 0)) * 100) / 100;
    let threw = null;
    try { __BF3.hurtPlayer(m * 10, p.x, p.z + 120, null); }
    catch(e){ threw = String(e && e.message || e); }
    return { pick: cs.ch[5], hpBefore: hp0, hpAfter: Math.round(p.hp),
             died: score() > d0, used: !!p._thickUsed, sinceLastHit: since, threw: threw };
  };

  /* Six seconds untouched, which is the file's own definition of a fight ending (pal_thick, 11180).
     invuln is held high through the ticks so an Arena bot that wanders in cannot land a hit and
     restart the fight — the stamp is written where damage actually lands, so a blocked hit does not
     count and this is the honest way to hold the window open. */
  const rest = () => {
    G.enemies.length = 0;
    for(let i = 0; i < 380; i++){ p.invuln = 999; G.enemies.length = 0; __BF3.update(1/60); }
    p.invuln = 0;
  };

  const control = lethal('bsk_blood');       // the b-side of the same rank: wired, and not a death save
  const thick   = lethal('bsk_thick');
  const again   = lethal(null);              // same fight, no ticks between: the save is spent
  rest();
  const rearm   = lethal(null);              // new fight: it comes back

  return JSON.stringify({
    ok: control.died && control.hpAfter !== 1
        && !thick.died && thick.hpAfter === 1
        && again.died
        && !rearm.died && rearm.hpAfter === 1
        && !control.threw && !thick.threw && !again.threw && !rearm.threw,
    control: control, thick: thick, again: again, rearm: rearm,
    maxHp: max(), at: G.areaName || null,

    /* DIAGNOSTIC, not part of ok. hurtPlayer:11205 reads `v` — an attack-speed line pasted into the
       damage-taken function, where no `v` is declared. If the file is strict (it is, index.html:1019)
       this throws on every hit a Frenzy berserker takes. Measured here because it is free to measure
       in this launch and because the trials above had to steer around it. Fixed on its own commit. */
    frenzy: (function(){
      cs.ch[7] = 'bsk_frenzy';
      const r = lethal('bsk_blood');
      cs.ch[7] = 'bsk_rage';
      return { threw: r.threw, hpBefore: r.hpBefore, hpAfter: r.hpAfter, died: r.died };
    })(),
  });
})()
