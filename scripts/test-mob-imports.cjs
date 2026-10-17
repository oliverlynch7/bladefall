const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const urls=[];for(const file of fs.readdirSync('public/3d').filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(path.join('public/3d',file),'utf8');for(const m of s.matchAll(/from\s+['"](.\/mob3d\.js[^'"]*)['"]/g))urls.push([file,m[1]]);}
// Runtime ownership must match: world teardown clears the same pool that hero rendering syncs.
const owners=urls.filter(([f])=>['hero3d.js','world3d.js'].includes(f));
assert.equal(owners.length,2);assert.equal(new Set(owners.map(x=>x[1])).size,1,JSON.stringify(owners));
// Toolkit-only consumers predate the separate culling runtime and share their own asset cache.
const helpers=urls.filter(([f])=>!['hero3d.js','world3d.js'].includes(f));
assert(helpers.length>=4);assert.equal(new Set(helpers.map(x=>x[1])).size,1,JSON.stringify(helpers));
console.log('Enemy sync/teardown share one runtime; toolkit-only consumers share their asset cache.');
