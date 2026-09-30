const fs = require('fs');
const assert = require('assert');

const controller = fs.readFileSync('public/3d/controller.js', 'utf8');
const page = fs.readFileSync('public/3d/index.html', 'utf8');

assert(controller.includes('if(config.invert==null)config.invert=true;'), 'missing controller settings must default to invert=true');
assert(controller.includes("config.invert!==false?'checked':''"), 'controller UI must show the effective default');
assert(page.includes('const pitchInput=p.ry*(c.invert===false?-1:1);'), 'camera pitch must use the explicit invert branch');

function pitchDelta(rightStickY, invert) {
  return rightStickY * (invert === false ? -1 : 1);
}

assert.strictEqual(pitchDelta(-1, true), -1, 'default inverted camera sign is incorrect');
assert.strictEqual(pitchDelta(1, true), 1, 'default inverted camera sign is incorrect');
assert.strictEqual(pitchDelta(-1, false), 1, 'explicit non-inverted camera sign is incorrect');
assert.strictEqual(pitchDelta(1, false), -1, 'explicit non-inverted camera sign is incorrect');

console.log('PASS controller invert: default true, explicit false preserved, both right-stick signs verified');
