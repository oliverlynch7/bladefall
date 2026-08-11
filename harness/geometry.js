/* DID THE CAST ITSELF CARRY THE PLAYER PAST THE ONLY TARGET?

   The bench spawns one grunt at p.z - 60 and leaves it there. That distance is load-bearing: it is
   what all sixteen classes are measured at, and moving it re-measures every damage row in the game
   and forces a full re-baseline. So it does not move. What it needs instead is to know when it has
   put itself somewhere the effect cannot be observed from.

   Measured, six casts in one launch (harness/probes/riposte.probe.js), which is where the numbers
   in the tests come from:

     bladedancer/Riposte, uncharged - lunges 55, stops 5 short of the dummy, dot +1, deals 200
     bladedancer/Riposte, CHARGED   - lunges 95, ends 35 PAST the dummy, dot -1, deals 0

   bdArc (index.html:10231) skips anything behind the facing - `if(d > e.r && (dx*fx+dz*fz)/d < cos)
   continue` - so the charged cast cannot hit a target it has just run past, and the bench reported
   that as `bladedancer/Riposte claims damage` FAILED. It is not a verdict about the skill. It is the
   bench standing in the wrong place, and per docs/VISION.md missing data is not a negative finding.

   Why this matters more than one flaky row: p.bdRiposte is charged when hurtPlayer consumes a parry
   window, and the bladedancer's own Counter Stance opens one five seconds and one skill earlier with
   a live grunt in the room. Whether that grunt connects is a coin toss, so the row alternated between
   PASS and a hard FAIL - and a hard FAIL that is new is what run-all.js calls a REGRESSION, which
   autopilot.ps1 answers with `git checkout -- .`. An unstable assertion here does not just mis-report;
   it can delete a run's verified work (docs/SKILL_TRIAGE.md section F).

   Deliberately narrow. It only downgrades a damage claim that has ALREADY failed, and only when all
   three of these hold, so it cannot quietly excuse a skill that simply does nothing:
     - the cast moved the body at least MIN_MOVE units,
     - the target was in front of the facing before the cast,
     - and behind it immediately after.
   A skill that displaces the player over TIME (a dash timer, a knockback) is not covered: the
   snapshot is taken the instant useSkill returns, so a deferred move reads as no move and the row
   stays a failure. That is the safe direction - it under-excuses rather than over-excuses. */

/* Below this the "displacement" is settle noise rather than a lunge. The smallest real lunge
   measured in the game is Riposte's uncharged 55; the largest incidental drift in a single frame
   with nothing cast is a couple of units. */
export const MIN_MOVE = 20;

function dot(px, pz, yaw, tx, tz){
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  const dx = tx - px, dz = tz - pz, len = Math.hypot(dx, dz);
  if(!len) return 1;                       // standing inside the target counts as on top of it
  return (dx * fx + dz * fz) / len;
}

/* pre/post are {px, pz, yaw, tx, tz}; tx/tz null when the bench had no target at all.
   Each snapshot uses its OWN yaw, because a lunge may turn the body as well as move it. */
export function displacedPastTarget(pre, post){
  const out = { displaced: false, moved: 0, dotBefore: null, dotAfter: null };
  if(!pre || !post) return out;
  if(pre.tx == null || pre.tz == null || post.tx == null || post.tz == null) return out;
  out.moved = Math.hypot(post.px - pre.px, post.pz - pre.pz);
  out.dotBefore = dot(pre.px, pre.pz, pre.yaw, pre.tx, pre.tz);
  out.dotAfter = dot(post.px, post.pz, post.yaw, post.tx, post.tz);
  out.displaced = out.moved >= MIN_MOVE && out.dotBefore >= 0 && out.dotAfter < 0;
  return out;
}
