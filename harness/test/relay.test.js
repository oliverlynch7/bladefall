/* A CO-OP GUEST'S DAMAGE IS ONLY AS REAL AS THE RELAY IT GOES THROUGH.

   ⚠ THIS FILE IS PARKED IN `harness/live/` AND BELONGS IN `harness/test/`. It is not slow and it
   needs no Chrome — `harness/live/` is simply the one directory `run-all.js` does not discover into
   its fast stage. It sits here because **one of its four assertions is WATCHED TO FAIL against the
   shipped game**, which is the point of it, and a failing test in the fast stage would turn every
   scheduled run's gate red and stash that run's work. **Move it to `harness/test/` in the same
   commit as the one-line fix it describes** (docs/MP_AUDIT.md, "The patch"), at which point all
   four pass and it becomes the ratchet.
   Today: `node --test harness/live/relay.test.js` → 3 pass, 1 fail, and the failure names the bug.


   The host owns enemy HP in co-op. A guest that hits a mob must SEND the hit and must not apply it,
   because `applyEnemies` (index.html) overwrites the guest's local HP with the host's value on the
   next snapshot — so damage that is applied instead of sent is not merely unsent, it is visibly
   undone a few frames later. The game's own comment at the relay says exactly that, in the past
   tense, about pets: they "appear to attack locally, then the host snapshot restores the mob's HP
   and makes Necromancer summons (and pets) effectively deal zero shared damage."

   The relay decides on `src` — the third argument of `hitEnemy` — and that is the whole hazard.
   `src===G.p` is true for a melee swing (`resolveSwing` passes the player) and false for everything
   that resolves damage from somewhere other than the caster's feet. Pets were caught once and given
   `{x,z,pet:true}`. PLAYER PROJECTILES HAVE THE SAME SHAPE AND WERE NOT: their `src` is the SHOT's
   position, because knockback is thrown from the bolt rather than from the caster. Nine of the
   sixteen classes attack at range, so that is nine classes' basic attack plus every projectile skill
   in the game. docs/MP_AUDIT.md.

   THIS IS A SHAPE TEST, NOT A TRANSCRIPTION. It does not re-implement the guard. It reads which
   marker fields the guard accepts and which fields each damage source actually puts on its `src`,
   and asserts the two agree — so renaming the marker, or adding a third damage source, is caught by
   the same assertion rather than by nobody. Static, so it runs in run-all.js's fast stage before any
   GPU time is spent, and it is the guard that a launch cannot be: what a launch proves is that it
   works today. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameSource } from '../audit-skills.js';

const SRC = gameSource();

/* The guard itself: anchored on the RELAY CALL and read backwards to the `if(` that owns it.
   Anchoring forwards on `if(MP.active` finds the run-seed line 700 lines earlier instead, which is
   the sort of near-miss that makes a test fail against correct code. */
function relayGuard(src = SRC){
  const call = src.indexOf('MP.sendHit(e.mid');
  assert.ok(call > 0, 'the co-op guest relay call should still be findable');
  const i = src.lastIndexOf('if(MP.active', call);
  assert.ok(i > 0 && call - i < 400, 'the relay call should still sit inside an if(MP.active …) guard');
  const j = src.indexOf('){', i);
  assert.ok(j > i && j < call, 'the guard should still open a block before the call');
  return src.slice(i, j + 2);
}

/* Which `src.<field>` markers does the guard accept? A bare `src===G.p` is NOT one of these — that
   is the identity test, asserted separately, and it is what a melee swing satisfies. */
const acceptedMarkers = (guard) => [...guard.matchAll(/src\s*\.\s*([A-Za-z_$][\w$]*)/g)]
  .map(m => m[1]).filter(k => k !== 'x' && k !== 'z');

/* The keys an object literal actually carries. */
const keysOf = (lit) => [...lit.matchAll(/[{,]\s*([A-Za-z_$][\w$]*)\s*:/g)].map(m => m[1]);

/* The `src` literal a player projectile's hit is given. Anchored on `pr.dmg`, which is the payload
   rather than the position, so it survives the offsets being retuned. */
function playerShotSrc(src = SRC){
  const m = src.match(/hitEnemy\(\s*e\s*,\s*pr\.dmg\s*,\s*(\{[^}]*\})/);
  assert.ok(m, "the player projectile's hitEnemy call should still be findable");
  return m[1];
}

test('the guest relay still exists and still accepts a plain melee swing', () => {
  const g = relayGuard();
  assert.match(g, /src\s*===\s*G\.p/,
    'a melee swing passes the player itself; without this clause a guest cannot hit anything at all');
  assert.match(g, /!\s*this\.isHost|!MP\.isHost/,
    'only a GUEST relays — a host applies its own damage');
  assert.match(g, /e\.mid\s*!=\s*null/,
    'a body the host has never named cannot be relayed to it');
});

/* THE ROW. The pet clause is the control: it is the same bug, found once and fixed, so it proves
   the marker mechanism works and that this assertion is not asking for something impossible. */
test('every damage source whose src is NOT the player carries a marker the relay accepts', () => {
  const markers = acceptedMarkers(relayGuard());
  assert.ok(markers.length >= 2,
    `the relay should accept at least the pet marker and the projectile marker; it accepts [${markers}]`);

  const petSites = [...SRC.matchAll(/\{\s*x\s*:\s*(?:pet|p|m)\.x[^}]*pet\s*:\s*true[^}]*\}/g)].map(m => m[0]);
  assert.ok(petSites.length >= 3,
    `expected the pet/minion damage sources; found ${petSites.length}`);
  for(const lit of petSites){
    assert.ok(keysOf(lit).some(k => markers.includes(k)),
      `a pet damage source must carry a marker the relay accepts: ${lit}`);
  }

  const shot = playerShotSrc();
  assert.ok(keysOf(shot).some(k => markers.includes(k)),
    'A PLAYER PROJECTILE MUST CARRY ONE TOO — without it a co-op guest playing any of the nine ' +
    'ranged classes applies its basic attack locally and the host never hears about it. ' +
    `The call passes ${shot}; the relay accepts [${markers}]. docs/MP_AUDIT.md`);
});

/* A GUARD NOTHING CAN TELL APART FROM ITS ABSENCE IS NOT A GUARD. The shipped shape is transcribed
   — a HISTORICAL literal, which cannot go stale the way a copy of live code does — and the
   assertion above is asserted to reject it. Without this the file is green ticks that would have
   stayed green through the entire life of the bug. */
const SHIPPED_BUG = String.raw`
    if(MP.active && !MP.isHost && e && e.mid!=null && !e.dummy && !e.practice && (src===G.p||(src&&src.pet))){
      MP.sendHit(e.mid, dmg, kb||0, el||null, src.x, src.z);
      return;
    }
          pr.hitSet.push(e); hitEnemy(e,pr.dmg,{x:pr.x-pr.vx*0.01,z:pr.z-pr.vz*0.01},pr.kb,effLifesteal(G.p),pr.el);
`;

test('the shipped bug, transcribed, fails the assertion above', () => {
  const markers = acceptedMarkers(relayGuard(SHIPPED_BUG));
  assert.deepEqual(markers, ['pet'],
    'the old guard accepted the pet marker and nothing else');
  const shot = playerShotSrc(SHIPPED_BUG);
  assert.deepEqual(keysOf(shot), ['x', 'z'],
    'and the projectile passed a bare position, which is why the hit was applied locally');
  assert.ok(!keysOf(shot).some(k => markers.includes(k)),
    'the two did not agree — that IS the bug, and this is the assertion that now catches it');
});

/* The other half of the failure, kept separate because it is what makes the bug WORSE than a
   dropped packet: the guest applies the damage, sees the number, and the next snapshot takes it
   back. If applyEnemies ever stopped adopting the host's hp this bug would be merely invisible
   rather than actively misleading — so the overwrite is asserted, not assumed. */
test("the host's snapshot really does overwrite a guest's local enemy HP", () => {
  const i = SRC.indexOf('applyEnemies(en,ek)');
  assert.ok(i > 0, 'applyEnemies should still be findable');
  const body = SRC.slice(i, i + 1400);
  assert.match(body, /e\.hp\s*=\s*Math\.max\(\s*0\s*,\s*Math\.min\(/,
    "a guest's enemy HP is the host's number, clamped — so damage applied locally is undone");
});
