const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const urls=[];for(const file of fs.readdirSync('public/3d').filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(path.join('public/3d',file),'utf8');for(const m of s.matchAll(/from\s+['"](.\/mob3d\.js[^'"]*)['"]/g))urls.push([file,m[1]]);}
assert(urls.length===5);assert.equal(new Set(urls.map(x=>x[1])).size,1,JSON.stringify(urls));console.log('All five enemy renderer consumers share one module URL/cache and fallback identity.');
