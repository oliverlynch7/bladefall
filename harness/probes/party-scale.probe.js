/* DOES THE FIGHT NOTICE A SECOND PLAYER?

   docs/superpowers/plans/2026-08-11-multiplayer-experience.md Task 3. The documented pitfall is that
   co-op difficulty is not scaled to party size, so two players meet the enemies one player would and
   co-op is strictly easier than solo - the difficulty Oliver tuned does not survive a friend joining.
   Checked against this codebase rather than assumed: a grep for `peers.length` in any HP or damage
   path returned nothing.

   This drives the game's own spawnEnemy() and reads the maxHp it produced. It does NOT reimplement
   the multiplier: per index.html's own note, "every probe that reimplements one of these tests
   eventually measures something the game does not believe." The party is faked at the only place a
   probe can reach it - MP's own bookkeeping, which is what the game consults - and every field is
   put back afterwards.

   SCOPE: no session is held and no peer is real. This proves the SPAWN path scales; it says nothing
   about whether the packet carrying that HP arrives. Two real machines remain the final check.

   Known-bad: `?noparty=1` turns the scaling off in the game, so the assertions can be watched to
   fail on demand - the same idiom as hero3d.js's `?heroonerig=1`, and in game code for the same
   reason: the multiplier is inside spawnEnemy and a probe cannot undo it from outside. */
(function(){
  const G = __BF3.G, MP = __BF3.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!G || !G.p) return JSON.stringify({ ok:false, why:'no live run to spawn into' });

  const SAVED = { active:MP.active, isHost:MP.isHost, pvp:MP.pvp, zone:MP.zone, peers:MP.peers };
  const ZONE = 7;                       // any value; what matters is peers matching the host's zone

  /* A party of n, as MP itself records one. `guest` flips isHost, `pvp` flips the duel flag, and
     `elsewhere` puts the allies in a different zone - a friend idling in the hub must not harden
     the dungeon you are standing in. */
  const setParty = (n, opts) => {
    const o = opts || {};
    if(n <= 1 && !o.guest && !o.pvp){
      MP.active = false; MP.isHost = false; MP.pvp = false; MP.zone = -1; MP.peers = {}; return;
    }
    MP.active = true; MP.isHost = !o.guest; MP.pvp = !!o.pvp; MP.zone = ZONE; MP.peers = {};
    for(let i = 1; i < n; i++){
      MP.peers['probe' + i] = { id:'probe' + i, zone: o.elsewhere ? ZONE + 1 : ZONE };
    }
  };

  /* Spawned well away from the hero so nothing walks into anything; only maxHp is read, and the
     enemy list is cleared each time so one spawn cannot be counted twice. Deliberately a grunt:
     'dummy' has its own trainingDummyHp() override and would measure a different code path. */
  const spawnHp = (type) => {
    G.enemies.length = 0;
    let e = null;
    try { e = __BF3.spawnEnemy(type || 'grunt', G.p.x + 400, G.p.z - 400); } catch(err){ return null; }
    return e ? e.maxHp : null;
  };
  const size = () => { try { return __BF3.partySize ? __BF3.partySize() : null; } catch(e){ return null; } };
  const trial = (label, n, opts) => {
    setParty(n, opts);
    return { at: label, party: size(), hp: spawnHp(), boss: spawnHp('brute') };
  };

  let out;
  try {
    setParty(1);
    const solo = spawnHp();
    /* THE RATIO IS ONLY WORTH HAVING IF THE BASE IS STABLE. hpScale multiplies DIFFICULTY, ngHp,
       stageScale, tEnemyHp and dtune together; if any of those wobbled between spawns the ratio
       below would be measuring the wobble. Two identical solo spawns settle it in the same run. */
    setParty(1);
    const soloAgain = spawnHp();

    out = {
      soloHp: solo, soloAgain: soloAgain, stable: solo != null && solo === soloAgain,
      trials: [
        trial('solo',                1),
        trial('host + 1 ally',       2),
        trial('host + 2 allies',     3),
        trial('host + 1 ally, PVP',  2, { pvp:true }),
        trial('host + 1 ally in another zone', 2, { elsewhere:true }),
        trial('GUEST + 1 ally',      2, { guest:true }),
      ],
      noparty: /[?&]noparty=1/.test(location.search),
    };
  } finally {
    MP.active = SAVED.active; MP.isHost = SAVED.isHost; MP.pvp = SAVED.pvp;
    MP.zone = SAVED.zone; MP.peers = SAVED.peers;
    G.enemies.length = 0;
  }
  return JSON.stringify(out);
})()
