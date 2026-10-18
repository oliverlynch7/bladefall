const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync('public/3d/index.html','utf8');const imports=JSON.parse(html.match(/<script type="importmap">([^<]+)/)[1]).imports;
const canonical=url=>imports[url]||url;
const urls=[];for(const file of fs.readdirSync('public/3d').filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(path.join('public/3d',file),'utf8');for(const m of s.matchAll(/from\s+['"](.\/mob3d\.js[^'"]*)['"]/g))urls.push([file,canonical(m[1])]);}
assert(urls.some(([f])=>f==='hero3d.js')&&urls.some(([f])=>f==='world3d.js'));assert.equal(new Set(urls.map(x=>x[1])).size,1,JSON.stringify(urls));
assert.equal(canonical('./companion3d.js?v=2073'),'./companion3d.js?v=2259');
console.log('All game enemy loaders, renderers and teardown use one canonical module and asset cache.');
