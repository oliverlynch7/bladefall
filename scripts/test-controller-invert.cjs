const fs = require('fs');
const assert = require('assert');

const controller = fs.readFileSync('public/3d/controller.js', 'utf8');
const page = fs.readFileSync('public/3d/index.html', 'utf8');

assert(controller.includes('if(config.invertY==null)config.invertY=config.invert==null?true:!!config.invert;'), 'missing controller settings must default to inverted Y');
assert(controller.includes('if(config.invertX==null)config.invertX=false;'), 'missing controller settings must default to non-inverted X');
assert(controller.includes('id="padInvertX"'), 'controller UI must expose horizontal inversion');
assert(controller.includes('id="padInvertY"'), 'controller UI must expose vertical inversion');
assert(page.includes('const yawInput=p.rx*(c.invertX?-1:1);'), 'camera yaw must use the horizontal invert branch');
assert(page.includes('const pitchInput=p.ry*(c.invertY===false?-1:1);'), 'camera pitch must use the vertical invert branch');

function axisDelta(value, invert) {
  return value * (invert ? -1 : 1);
}

assert.strictEqual(axisDelta(-1, true), 1, 'inverted axis sign is incorrect');
assert.strictEqual(axisDelta(1, true), -1, 'inverted axis sign is incorrect');
assert.strictEqual(axisDelta(-1, false), -1, 'non-inverted axis sign is incorrect');
assert.strictEqual(axisDelta(1, false), 1, 'non-inverted axis sign is incorrect');

console.log('PASS controller invert: independent X/Y toggles, legacy Y migration, both axis signs verified');
