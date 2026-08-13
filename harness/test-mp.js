/* Multiplayer render correctness.

   Oliver, joining a PvP match: "I turned invisible on my screen, but I could see him, and the same
   happened for him." Cause: the 3D layer kept a single pending SLOT, so the local hero was queued
   first and every ally overwrote it. This asserts the queue draws everyone, draws YOU first, and
   drops allies rather than you when the frame budget runs out.

   SCOPE, stated so nobody mistakes it for more than it is: this proves the RENDER path draws every
   queued hero. It does not prove connection behaviour - no session is held, no peer is real. Two
   real machines remain the final check for anything about the network.

   ── WHAT THE PLAN GOT WRONG AND EXECUTION CORRECTED ──
   The plan's probe assigned `window.__hero3dPending` itself and then asserted that it was an array
   of length 3 whose head was G.p. That is a test of the probe, not of the game: it passes just as
   happily against the single-slot version whose bug is the entire reason the queue exists, because
   nothing in it ever calls the game's queueing code. The plan reached for that shape because it had
   correctly noticed MP is closure-local - and stopped one step short. Measured rather than assumed:
   EVERYTHING from index.html:1019 down is inside one `(function(){ "use strict"; ... })()`, so
   drawHero3, flushHero3D and HERO3D_MAX are closure-local too, and a probe sees only what is
   explicitly hung on window. Three names are now exported on __BF3 next to the other
   exported-for-the-harness entries, and the probe drives the game's own queueing and its own flush.

   The known-bad is `?heroslot=1`, carried permanently by the probe the way level.probe.js carries
   `?breakgap` - see its header for why a bug you must break the repo to reproduce is one nobody
   re-runs. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runScenario } from './drive.js';

const PROBE = readFileSync(join(import.meta.dirname, 'probes', 'mp.probe.js'), 'utf8');
const PARTY = readFileSync(join(import.meta.dirname, 'probes', 'party-scale.probe.js'), 'utf8');
const LOOT = readFileSync(join(import.meta.dirname, 'probes', 'loot.probe.js'), 'utf8');
const PING = readFileSync(join(import.meta.dirname, 'probes', 'ping.probe.js'), 'utf8');
const PINGTGT = readFileSync(join(import.meta.dirname, 'probes', 'pingtgt.probe.js'), 'utf8');
const POSSYNC = readFileSync(join(import.meta.dirname, 'probes', 'possync.probe.js'), 'utf8');

/* What a party of n must multiply enemy HP by. Stated here as well as in the game because the
   assertion has to be able to disagree with the code - reading the multiplier out of __BF3 and
   then checking the game against it would pass whatever the game happened to do. */
const HP_PER_ALLY = 0.60;

/* Zone 0, The Outskirts - a ZONE index, not a stage index, and the one destination whose readiness
   wait is documented and quick. Nothing here is zone-specific; it needs a live 3D hero layer and
   somewhere to stand. */
const SCENE = 0;

export async function runMpTests(opts){
  const url = (opts && opts.url) || undefined;
  const failures = [];
  let pass = 0;

  let r;
  try { r = await runScenario({ scene: SCENE, waitMs: 9000, js: PROBE, url }); }
  catch(e){
    return { pass: 0, fail: 1, failures: [{ check: 'load', detail: e.message.slice(0, 200) }] };
  }

  /* A layer that is off is not a layer that is broken. ?hero3d=0 is a supported way to run the
     game, and reporting it as three failures would be inventing them. */
  if(r.skip) return { pass: 0, fail: 0, failures: [], skipped: r.skip };

  /* The wait is proven by the run reporting it, not by the probe claiming it. `wouldHaveSkipped` is
     what the old one-line guard would have returned from this same launch. */
  const waited = { ms: r.waitedMs || 0, rescued: !!r.wouldHaveSkipped };

  const cap = r.cap;
  const check = (name, ok, detail) => { if(ok) pass++; else failures.push({ check: name, detail }); };

  /* Each trial queues heroes through the game and then flushes. `drawn` counts dispatches to
     window.drawHero3D; `localAt` is where G.p landed in that draw order. */
  const T = [
    ['local queued first', r.localFirst, 3],
    ['local queued last',  r.localLast,  3],
    ['crowd past the cap', r.crowd,      cap + 1],
  ];
  for(const [name, t, expect] of T){
    if(!t){ check(name, false, 'trial missing from probe output'); continue; }
    check(`${name}: every hero drawn`, t.drawn === expect,
          `drew ${t.drawn} of ${expect} (queued ${t.queued})`);
    check(`${name}: local hero drawn first`, t.localAt === 0,
          t.localAt < 0 ? 'the local hero was never drawn — this is the invisibility bug'
                        : `local hero drawn at index ${t.localAt}, not 0`);
    check(`${name}: queue cleared after flush`, t.cleared === true,
          'flush left ' + JSON.stringify(t.queued) + ' behind — heroes would double-draw next frame');
    check(`${name}: nothing threw`, !t.threw && !t.flushThrew,
          JSON.stringify({ queue: t.threw, flush: t.flushThrew }));
    check(`${name}: renderer drew without error`, !(t.renderErrs || []).length,
          JSON.stringify(t.renderErrs));
  }

  /* The cap is a frame-rate guard, so it has to actually bite: 12 allies plus you must not be 13
     renders. Separate from the count above so a cap raised to 99 is reported as the cap changing
     rather than as heroes going missing. */
  check('the cap bites', r.crowd && r.crowd.drawn === cap + 1,
        `cap ${cap}, drew ${r.crowd && r.crowd.drawn}`);

  /* ── ALLIES LOOK LIKE THEMSELVES ─────────────────────────────────────────────────────────────
     Everything above is about whether a body is drawn. This is about WHOSE. The pool gives each
     peer its own SkeletonUtils clone, its own mixer and its own weapon; with one shared rig every
     ally was a copy of the local hero, which draws a perfectly convincing party and is still wrong.
     Its known-bad is ?heroonerig=1, which sends allies back through the shared rig. */
  const rigs = r.rigs;
  if(!rigs){
    check('ally rigs: the pool reports itself', false,
          '__hero3dRigs() is missing — the pool cannot be measured, so nothing here is proven');
  } else {
    const peers = rigs.peers || [];
    const A = peers.find(x => x.id === 'probe-a'), B = peers.find(x => x.id === 'probe-b');
    check('ally rigs: one rig per peer', peers.length === 2,
          `${peers.length} rigs for 2 allies` +
          (peers.length === 0 ? ' — every ally is being drawn with the local hero\'s body' : ''));
    check('ally rigs: keyed to the right peers', !!(A && B),
          'ids present: ' + JSON.stringify(peers.map(x => x.id)));
    if(A && B){
      /* The bodies must differ from EACH OTHER and from yours. Comparing only against the local
         hero would pass a pool that gave every ally the same wrong body. */
      check('ally rigs: each ally wears their own class body',
            A.model !== B.model && A.model !== rigs.local.model,
            `wizard→${A.model}, ranger→${B.model}, local ${rigs.local.model}`);
      /* A weapon LOAD can be slow, so this asks what was requested, not what resolved. */
      check('ally rigs: each ally is armed with their own weapon',
            A.art === 'staff' && B.art === 'bow',
            `wizard holding ${A.art}, ranger holding ${B.art}`);
      /* The pose is the third thing the shared rig destroyed, and the quietest. Both allies were
         given the local hero's state, so this asserts each rig has independently chosen a clip
         rather than that the clips differ - identical input legitimately gives identical output. */
      check('ally rigs: each ally animates on its own mixer',
            !!A.clip && !!B.clip,
            `clips: wizard ${A.clip}, ranger ${B.clip}, local ${rigs.local.clip}`);
      /* One body per render call. Every rig visible at once means each ally is drawn once per hero
         in the party - N² renders in a full group. */
      check('ally rigs: exactly one body visible per render',
            peers.filter(x => x.visible).length + (rigs.local.visible ? 1 : 0) === 1,
            `visible: local ${rigs.local.visible}, ` + JSON.stringify(peers.map(x => [x.id, x.visible])));
    }
    check('ally rigs: the pool is capped', peers.length <= rigs.cap,
          `${peers.length} rigs against a cap of ${rigs.cap}`);
  }
  for(const t of [r.rigTrial, r.rigTrial2]){
    if(!t) continue;
    check('ally rigs: the party still renders without error',
          !t.threw && !t.flushThrew && !(t.renderErrs || []).length,
          JSON.stringify({ queue: t.threw, flush: t.flushThrew, render: t.renderErrs }));
    check('ally rigs: every body in the party is drawn', t.drawn === 3,
          `drew ${t.drawn} of 3`);
  }

  /* ── THE PARTY CHANGES THE FIGHT ─────────────────────────────────────────────────────────────
     Its own launch, because it needs a live zone to spawn into and it faked MP's bookkeeping to get
     there - keeping it out of the render probe means neither can leave state behind for the other.
     Its known-bad is ?noparty=1. */
  let party = null;
  try { party = await runScenario({ scene: SCENE, waitMs: 9000, js: PARTY, url }); }
  catch(e){ failures.push({ check: 'party scaling: load', detail: e.message.slice(0, 200) }); }

  if(party && party.ok === false){
    failures.push({ check: 'party scaling: probe could not run', detail: party.why });
  } else if(party){
    const T = party.trials || [];
    const at = (label) => T.find(x => x.at === label);
    const solo = at('solo');
    /* A ratio is only worth having if the base it is a ratio OF holds still. hpScale multiplies
       DIFFICULTY, ngHp, stageScale, tEnemyHp and dtune together; two identical solo spawns in the
       same run settle whether any of them wobble. */
    check('party scaling: the solo baseline is stable', party.stable === true,
          `two identical solo spawns gave ${party.soloHp} and ${party.soloAgain}`);
    /* Both a trash mob and a boss, because the boss branch multiplies hpScale by four more terms
       and is where a multiplier is most likely to be dropped or applied twice. */
    const scales = (label, n) => {
      const t = at(label); if(!t || !solo) { check(`party scaling: ${label}`, false, 'trial missing'); return; }
      const want = 1 + HP_PER_ALLY * (n - 1);
      for(const kind of ['hp', 'boss']){
        const got = solo[kind] ? t[kind] / solo[kind] : null;
        check(`party scaling: ${label} multiplies ${kind === 'hp' ? 'mob' : 'boss'} health`,
              got != null && Math.abs(got - want) < 0.02,
              `${solo[kind]} → ${t[kind]} is ×${got == null ? '?' : got.toFixed(3)}, wanted ×${want.toFixed(2)}`);
      }
      check(`party scaling: ${label} counts as ${n}`, t.party === n, `party reported as ${t.party}`);
    };
    scales('host + 1 ally', 2);
    scales('host + 2 allies', 3);
    /* The three ways the party must NOT count. Each is a real situation: a duel's difficulty is the
       other player; a friend idling in the hub is not in your fight; and a guest that scaled locally
       would square the multiplier the host already applied and sent. */
    for(const label of ['host + 1 ally, PVP', 'host + 1 ally in another zone', 'GUEST + 1 ally']){
      const t = at(label);
      if(!t){ check(`party scaling: ${label}`, false, 'trial missing'); continue; }
      check(`party scaling: ${label} does not scale`,
            solo && t.hp === solo.hp && t.boss === solo.boss && t.party === 1,
            `party ${t.party}, mob ${t.hp} vs ${solo && solo.hp}, boss ${t.boss} vs ${solo && solo.boss}`);
    }
  }

  /* ── LOOT IS EACH PLAYER'S OWN ───────────────────────────────────────────────────────────────
     This is a REGRESSION guard, not a feature test: the game already gives every client its own
     roll from the same corpse, because nothing about a pickup is ever transmitted and a guest runs
     its own killEnemy/creditKill. Task 4 of the multiplayer plan assumed the opposite and it was
     measured instead — see docs/MP_AUDIT.md. What these assertions defend is that nobody later
     makes loot host-authoritative and quietly turns co-op into a race for one drop.

     Deliberately loose bounds. The drop rates are ~5.3% and ~33%, and a rate is Oliver's to tune;
     asserting a tight interval would turn a balance change into a red gate. The claim is only
     "a guest that never landed a hit still earns its own loot". */
  let lootR = null;
  try { lootR = await runScenario({ scene: SCENE, waitMs: 9000, js: LOOT, url }); }
  catch(e){ failures.push({ check: 'personal loot: load', detail: e.message.slice(0, 200) }); }

  if(lootR && lootR.ok === false){
    failures.push({ check: 'personal loot: probe could not run', detail: lootR.why });
  } else if(lootR){
    const cr = lootR.creditedKills || {}, mi = lootR.mirroredKills || {};
    check('personal loot: a guest earns drops from kills it never saw',
          cr.drops > 0, `${cr.drops} drops from ${cr.of} credited kills — a shared pool gives 0`);
    check('personal loot: a guest earns drops from bodies it mirrors',
          mi.drops > 0, `${mi.drops} drops from ${mi.of} mirrored elite kills`);
    check('personal loot: a mirrored kill actually kills',
          mi.leftAlive === 0, `${mi.leftAlive} of ${mi.of} still alive after the host said they died`);
    /* The other half of "personal": no item may arrive down the wire. The host's packet is an enemy
       snapshot plus a kill list; if a pickup ever started riding along, both clients would show the
       same item and one of them could not have it. */
    check('personal loot: the enemy snapshot carries no items',
          (lootR.snapshotOnly || {}).drops === 0,
          `${(lootR.snapshotOnly || {}).drops} pickups appeared from a snapshot with no kills in it`);
    /* The negative control. Without it, every zero above could mean the receive path never ran. */
    check('personal loot: the counter can read zero',
          (lootR.notAGuest || {}).drops === 0,
          `${(lootR.notAGuest || {}).drops} drops with the guest flag off — the control is not a control`);
  }

  /* ── A PARTY CAN POINT AT SOMETHING ──────────────────────────────────────────────────────────
     Both ends, because they fail separately and the local one is the one that lies: you ping, you
     see your own marker, and your friend sees nothing. Its known-bad is ?noping=1, which drops the
     receive handler and is exactly that failure. */
  let ping = null;
  try { ping = await runScenario({ scene: SCENE, waitMs: 9000, js: PING, url }); }
  catch(e){ failures.push({ check: 'ping: load', detail: e.message.slice(0, 200) }); }

  if(ping && ping.ok === false){
    failures.push({ check: 'ping: probe could not run', detail: ping.why });
  } else if(ping){
    const L = ping.local || {}, C = ping.cooldown || {}, E = ping.expiry || {}, B = ping.button || {};
    check('ping: pressing it puts a marker in the world', L.made === true && !!L.mark,
          JSON.stringify(L));
    /* Ahead of you, not on top of you — a marker at your own feet says "I am here", which the peer
       dot already says. Loose bounds: the exact cast distance is a feel number. */
    check('ping: the marker lands out in front of the hero',
          L.distFromHero > 60 && L.distFromHero < 1200, `${L.distFromHero} units from the hero`);
    check('ping: it has a lifetime at all', !!(L.mark && L.mark.life > 0),
          `life ${L.mark && L.mark.life}`);
    check('ping: it cannot be spammed', C.blockedReturnedNull === true && C.afterBlocked === 1,
          JSON.stringify(C));
    check('ping: and the cooldown lets go', C.allowedReturned === true && C.afterAllowed === 2,
          JSON.stringify(C));
    /* THE HALF THAT MATTERS. Everything above passes with the receive handler deleted. */
    check("ping: an ally's ping draws on my screen", !!ping.fromPeer,
          'MP.recvMark produced nothing — this is the half your friend sees');
    check("ping: an ally's marker is not my colour",
          !!(ping.fromPeer && L.mark && ping.fromPeer.col !== L.mark.col),
          `ally ${ping.fromPeer && ping.fromPeer.col} vs mine ${L.mark && L.mark.col}`);
    check('ping: my own ping relayed back to me is not drawn twice',
          (ping.echo || {}).before === (ping.echo || {}).after, JSON.stringify(ping.echo));
    check('ping: the two teams get two colours',
          (ping.teamCols || []).length === 2 && ping.teamCols[0] !== ping.teamCols[1],
          JSON.stringify(ping.teamCols));
    /* Expiry is driven through the game's own update(), not by calling the ager, so this also
       asserts updateMarks is wired into the loop at all. */
    check('ping: the marker is still up mid-life', E.before === 1 && E.at3s === 1, JSON.stringify(E));
    check('ping: and it expires through the game loop', E.at6s === 0, JSON.stringify(E));
    check('ping: there is a button for it, and it is co-op only',
          B.exists === true && B.hiddenSolo === true && B.shownInParty === true, JSON.stringify(B));
  }

  /* ── A PING NAMES A BODY, AND THE MARKER FOLLOWS IT ──────────────────────────────────────────
     The guest-position plan's Task 4. The task asked whether marking a monster still marked bare
     ground on the other screen, and the answer split in two: the OTHER-SCREEN half was already fixed
     by Tasks 1–2 (the probe measures the marker-to-body gap closing 90 → ~10 with the wake flag,
     against the control's 90 → ~72), and the half left was TIME. A mark was its coordinates and
     nothing else, so of the 25 bodies actually moving in The Outskirts, 20 walked past the 90–125
     melee reach of their own marker inside its 5s life — median 260 units. That is not a multiplayer
     bug; both screens agreed, correctly, about a body no longer under the mark.

     BOTH ARMS, in one launch and through MP's own recvMark, differing in exactly one field. The
     no-mid arm IS the behaviour that shipped before, which is why this needed no new flag: the
     negative control is a message the game still has to handle (a HERE ground ping carries no mid).

     THE BODY'S OWN WALK IS ASSERTED FIRST and it is not decoration — a control that stands still and
     a test that stands still are the same reading twice, and the probe's first run picked a body the
     player then killed, so both arms read a gap of 0 against a corpse. */
  let ptgt = null;
  try { ptgt = await runScenario({ scene: SCENE, waitMs: 9000, js: PINGTGT, url }); }
  catch(e){ failures.push({ check: 'ping target: load', detail: e.message.slice(0, 200) }); }

  if(ptgt && ptgt.ok === false){
    failures.push({ check: 'ping target: probe could not run', detail: ptgt.why });
  } else if(ptgt){
    const R = ptgt.EF_receiver || {}, A = ptgt.A_aim || {}, Bo = ptgt.B_otherScreen || {};
    check('ping target: the ping lands on the body it was aimed at',
          A.onABody === true && A.gapToSubject != null && A.gapToSubject <= 10, JSON.stringify(A));
    /* Without this the two arms below prove nothing, so it is a bar rather than a note. */
    check('ping target: the subject actually walked away from where it was called out',
          R.theBodyActuallyLeft === true, `walked ${R.bodyWalkedIn4p5s}, died ${R.bodyDied}`);
    check('ping target: a mark that names a body follows it',
          R.namedMarkFollowed === true, JSON.stringify(R.withMid));
    check('ping target: and one that names no body is left behind — the known-bad',
          R.unnamedMarkStayedBehind === true, JSON.stringify(R.noMid));
    /* Carried here so a regression in the position sync shows up in the ping row too: the two
       features are now load-bearing for each other on the receiver's screen. */
    check('ping target: the guest still adopts the host position under the mark',
          Bo.posSyncPutsTheBodyUnderTheMark === true,
          JSON.stringify({ awake: Bo.awake && Bo.awake.markToBodyAfter,
                           asleep: Bo.asleep && Bo.asleep.markToBodyAfter }));
    check('ping target: the probe never ticked a stopped world',
          ptgt.playTicks === ptgt.ticksAsked && ptgt.mode === 'play',
          `playTicks ${ptgt.playTicks} of ${ptgt.ticksAsked}, left at ${ptgt.leftPlayAtTick}`);
  }

  /* ── A GUEST LOOKS AT THE SAME MONSTERS THE HOST DOES ────────────────────────────────────────
     The guest-position plan's Tasks 1–2 (`a12b178`, `cb47393`). Before them a guest ran a completely
     independent AI simulation and the two pictures drifted roughly 1000–1700 units apart in thirty
     seconds, against a melee reach of ~90–125 (`docs/MP_AUDIT.md` section 2). A snapshot now carries
     the host's wake flag as slot 6, and a guest lerps each enemy the host has AWAKE toward where the
     host says it is.

     BOTH DIRECTIONS, because they fail separately and the wrong one is the quiet one: a build that
     ignored slot 6 and adopted every position it was sent would pass the awake assertion alone while
     dragging back every monster a guest is fighting on its own. Its known-bad is ?nopossync=1.

     The bar on the awake case is deliberately loose — a fraction of the gap closed, never a position.
     The correction is a lerp at k=0.2 a frame, so it approaches and never arrives; an exact bar would
     flap the way the Riposte row did (see docs/SKILL_TRIAGE.md section F). */
  let pos = null;
  try { pos = await runScenario({ scene: SCENE, waitMs: 9000, js: POSSYNC, url }); }
  catch(e){ failures.push({ check: 'position sync: load', detail: e.message.slice(0, 200) }); }

  if(pos && pos.ok === false){
    failures.push({ check: 'position sync: probe could not run', detail: pos.why });
  } else if(pos){
    const A = pos.awake || {}, S = pos.asleep || {};
    /* AGAINST THE AI, not against zero. The probe's target points at the player, so the mobs that
       are chasing close some of that distance on their own — the asleep trial measures exactly how
       much, on the same level with the same bodies. Requiring the awake trial only to MOVE would be
       a bar that a build with the correction deleted still clears.
       `scored` is asserted on as well as reported: a trial that scored almost nothing because the
       edge guard refused everything would otherwise be a clean pass on an empty set. */
    check('position sync: the host being awake to an enemy pulls the guest\'s copy toward it',
          A.targetsStored > 0 && A.scored >= 3 && A.gapClosed >= 0.7 &&
          A.gapClosed - S.gapClosed >= 0.3,
          `stored ${A.targetsStored}/${A.of}, scored ${A.scored} (${A.skippedOverVoid} over void), ` +
          `gap closed ${A.gapClosed} against the AI-only control's ${S.gapClosed}`);
    /* The other half. Sleeping mobs are still SENT — a guest that has never seen an enemy needs
       slots 2/3 to spawn it — so "nothing arrived" is not what this checks; hpAdopted proves the
       snapshot landed, and targetsStored proves nothing was taken from it as a correction. */
    check('position sync: an enemy the host has not woken is left where the guest has it',
          S.targetsStored === 0 && S.hpAdopted > 0,
          `stored ${S.targetsStored}/${S.of} with the wake flag clear, hp adopted ${S.hpAdopted}`);
    /* Neither assertion above means anything if the trials ticked a stopped game: update() returns
       at its third line unless mode === 'play', and `mode` has no setter, so a probe can keep
       calling update() into a world that has halted and get a run's worth of plausible zeroes. */
    check('position sync: the bench measured a running game',
          A.playTicks === A.framesTicked && S.playTicks === S.framesTicked &&
          !A.threw && !A.tickThrew && !S.threw && !S.tickThrew,
          `awake ${A.playTicks}/${A.framesTicked}, asleep ${S.playTicks}/${S.framesTicked}, ` +
          `threw ${A.threw || S.threw || A.tickThrew || S.tickThrew || 'no'}`);
  }

  return { pass, fail: failures.length, failures, cap, at: r.at, slot: !!r.slot,
           oneRig: !!r.oneRig, rigs: r.rigs, party, loot: lootR, ping, pos, waited,
           noparty: !!(party && party.noparty) };
}

if(import.meta.filename === process.argv[1]){
  /* Three known-bads, one per thing this suite claims. Each must FAIL; a pass means the assertions
     cannot see the bug they exist for.
       --bad        ?heroslot=1    the historical single pending SLOT: allies overwrite you
       --bad-rigs   ?heroonerig=1  the historical single shared RIG: allies are copies of you
       --bad-party  ?noparty=1     the historical unscaled fight: a friend is an easy mode
       --bad-ping   ?noping=1      the receive handler dropped: your ping is invisible to the party
       --bad-pos    ?nopossync=1   the historical unreconciled guest: two independent simulations

     And ONE self-test of the opposite shape, which must PASS rather than fail:
       --slow-hero  ?heroslow=4000 the hero layer not ready when the shutter opens — the state that
                                   made this whole suite go dark on the 2026-08-11 gate run. The bar
                                   is that it comes back with its measurements anyway. The run prints
                                   `waited Nms (rescued a run that would have skipped)`, and
                                   `rescued` is the probe reporting what the old guard would have
                                   said from the same launch. */
  const bad = process.argv.includes('--bad');
  const badRigs = process.argv.includes('--bad-rigs');
  const badParty = process.argv.includes('--bad-party');
  const badPing = process.argv.includes('--bad-ping');
  const badPos = process.argv.includes('--bad-pos');
  const slowHero = process.argv.includes('--slow-hero');
  const url = bad  ? '/3d/index.html?hero3d=1&world3d=1&nobloom&heroslot=1'
            : badRigs ? '/3d/index.html?hero3d=1&world3d=1&nobloom&heroonerig=1'
            : badParty ? '/3d/index.html?hero3d=1&world3d=1&nobloom&noparty=1'
            : badPing ? '/3d/index.html?hero3d=1&world3d=1&nobloom&noping=1'
            : badPos ? '/3d/index.html?hero3d=1&world3d=1&nobloom&nopossync=1'
            : slowHero ? '/3d/index.html?hero3d=1&world3d=1&nobloom&heroslow=4000'
            : undefined;
  runMpTests({ url }).then(r => {
    for(const f of r.failures) console.log(`FAIL mp ${f.check}: ${f.detail}`);
    console.log(`mp: ${r.pass} pass, ${r.fail} fail` + (r.skipped ? ` (skipped: ${r.skipped})` : '') +
                (r.at ? `  [at ${r.at}, cap ${r.cap}${r.slot ? ', SINGLE-SLOT self-test' : ''}]` : ''));
    if(r.waited) console.log(`waited ${r.waited.ms}ms for the hero layer` +
                             (r.waited.rescued ? '  (rescued a run that would have skipped)' : ''));
    if(slowHero){
      const ok = r.fail === 0 && !r.skipped && r.waited && r.waited.rescued;
      console.log(ok ? 'slow-hero self-test: the wait engaged and the suite still measured ✓'
                     : 'slow-hero self-test: FAILED — ' + (r.skipped ? 'still went dark: ' + r.skipped
                                                         : !r.waited || !r.waited.rescued ? 'the wait never engaged'
                                                         : r.fail + ' assertions failed'));
      process.exit(ok ? 0 : 1);
    }
    if(bad || badRigs || badParty || badPing || badPos){
      const which = bad ? 'single-slot' : badRigs ? 'single-rig'
                  : badParty ? 'unscaled-party' : badPing ? 'no-ping' : 'no-position-sync';
      console.log(r.fail ? `known-bad (${which}): correctly detected ✓`
                         : `known-bad (${which}): NOT DETECTED — assertions are blind ✗`);
      process.exit(r.fail ? 0 : 1);
    }
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
