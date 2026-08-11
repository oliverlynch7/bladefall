/* The fixtures below are REAL, copied out of one run of harness/probes/riposte.probe.js against
   --scene arena:flat. The whole point of this rule is that it separates the two bladedancer cases,
   so the two bladedancer cases are what it is tested on. */
import { test } from 'node:test';
import assert from 'node:assert';
import { displacedPastTarget, MIN_MOVE } from '../geometry.js';

const YAW = Math.PI;                         // the bench faces the dummy, which sits at p.z - 60

/* uncharged Riposte: lunged 55 and stopped 5 units SHORT. Dealt 200. */
const UNCHARGED_PRE  = { px: 0, pz: 340, yaw: YAW, tx: 0, tz: 280 };
const UNCHARGED_POST = { px: 0, pz: 285, yaw: YAW, tx: 0, tz: 280 };

/* charged Riposte: lunged 95 and ended 35 units PAST it. Dealt 0. */
const CHARGED_PRE  = { px: 0, pz: 241, yaw: YAW, tx: 0, tz: 181 };
const CHARGED_POST = { px: 0, pz: 146, yaw: YAW, tx: 0, tz: 181 };

test('a lunge that stops short of the target is NOT a bench-geometry excuse', () => {
  const r = displacedPastTarget(UNCHARGED_PRE, UNCHARGED_POST);
  assert.strictEqual(r.displaced, false);
  assert.strictEqual(Math.round(r.moved), 55);
  assert.ok(r.dotAfter > 0, 'the target is still in front: dot ' + r.dotAfter);
});

test('a lunge that ends past the target IS one', () => {
  const r = displacedPastTarget(CHARGED_PRE, CHARGED_POST);
  assert.strictEqual(r.displaced, true);
  assert.strictEqual(Math.round(r.moved), 95);
  assert.ok(r.dotBefore > 0 && r.dotAfter < 0,
            'in front before and behind after: ' + r.dotBefore + ' -> ' + r.dotAfter);
});

test('a skill that never moved the body is never excused, however it failed', () => {
  const pre  = { px: 0, pz: 0, yaw: YAW, tx: 0, tz: -60 };
  const post = { px: 0, pz: 0, yaw: YAW, tx: 0, tz: -60 };
  assert.strictEqual(displacedPastTarget(pre, post).displaced, false);
});

/* The guard that keeps this from excusing a skill whose target was never in front to begin with -
   that is a bench that aimed wrong, and it must stay visible rather than be absorbed here. */
test('a target that was already behind before the cast is not excused', () => {
  const pre  = { px: 0, pz: 0,   yaw: YAW, tx: 0, tz: 60 };
  const post = { px: 0, pz: -95, yaw: YAW, tx: 0, tz: 60 };
  assert.strictEqual(displacedPastTarget(pre, post).displaced, false);
});

test('a displacement under the noise threshold is not a lunge', () => {
  const pre  = { px: 0, pz: 0, yaw: YAW, tx: 0, tz: -5 };
  const post = { px: 0, pz: -(MIN_MOVE - 1), yaw: YAW, tx: 0, tz: -5 };
  assert.strictEqual(displacedPastTarget(pre, post).displaced, false);
});

test('a turn counts as well as a move - the post snapshot uses its own yaw', () => {
  /* Dance Step turns the body to face where it came from. Same positions, opposite facing. */
  const pre  = { px: 0, pz: 0,    yaw: YAW, tx: 0, tz: -60 };
  const post = { px: 0, pz: -120, yaw: 0,   tx: 0, tz: -60 };
  const r = displacedPastTarget(pre, post);
  assert.strictEqual(r.displaced, false, 'it turned to face the target again, so it can still see it');
  assert.ok(r.dotAfter > 0);
});

test('no target means no excuse', () => {
  const pre  = { px: 0, pz: 0,   yaw: YAW, tx: null, tz: null };
  const post = { px: 0, pz: -95, yaw: YAW, tx: null, tz: null };
  assert.strictEqual(displacedPastTarget(pre, post).displaced, false);
});
