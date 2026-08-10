import { test } from 'node:test';
import assert from 'node:assert';
import { parseEval } from '../drive.js';

test('parseEval pulls a JSON string value out of shot.js output', () => {
  const out = 'boot\nEVAL → {\n  "value": "{\\"ok\\":true,\\"n\\":3}"\n}\nshot -> x.png';
  assert.deepStrictEqual(parseEval(out), { ok: true, n: 3 });
});

test('parseEval returns a plain value unchanged when it is not JSON', () => {
  const out = 'EVAL → {\n  "value": "hello"\n}';
  assert.strictEqual(parseEval(out), 'hello');
});

test('parseEval throws when the page threw', () => {
  const out = 'EVAL → {\n  "error": "ReferenceError: x is not defined"\n}';
  assert.throws(() => parseEval(out), /ReferenceError/);
});

test('parseEval throws when there is no EVAL line at all', () => {
  assert.throws(() => parseEval('boot\nshot -> x.png'), /no EVAL/);
});
