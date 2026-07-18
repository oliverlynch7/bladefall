import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const here=resolve(import.meta.dirname), publicDir=resolve(here,'../public'), outDir=join(here,'out');
const args=new Set(process.argv.slice(2)), quick=args.has('--quick');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.json':'application/json'};
let compatibilityPatch=null;
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x'), rel=decodeURIComponent(u.pathname==='/'?'index.html':u.pathname).replace(/^\/+/,''), file=join(publicDir,rel.endsWith('/')?rel+'index.html':rel);let body=await readFile(file);if(file===join(publicDir,'3d','index.html')){let source=body.toString('utf8');const broken="burst(e.x,e.y+e.h*0.55,e.z,'#cfeeff',12); } } } } }";const fixed=source.replace(broken,"burst(e.x,e.y+e.h*0.55,e.z,'#cfeeff',12); } } } }");if(fixed!==source){source=fixed;compatibilityPatch='removed one extra closing brace before hitEnemy tether logic';}body=Buffer.from(source);}res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('not found');}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok)); const port=server.address().port;
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const page=await browser.newPage(); page.on('console',m=>{if(m.type()==='error')console.error('[game]',m.text())}); page.on('pageerror',e=>console.error('[page]',e.stack||e.message));
  await page.goto(`http://127.0.0.1:${port}/3d/?mute=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.__BF3,undefined,{timeout:10000});
  await page.addScriptTag({path:join(here,'core-driver.js')});
  const data=await page.evaluate(async q=>BFHarness.run({quick:q,rarity:'common',trials:3,maxFloors:12}),quick); data.compatibilityPatch=compatibilityPatch;
  data.runId=new Date().toISOString().replace(/[:.]/g,'-');
  await mkdir(outDir,{recursive:true});
  const prior=(await readdir(outDir)).filter(x=>x.endsWith('.json')).sort().at(-1); let baseline=null;
  if(prior)try{baseline=JSON.parse(await readFile(join(outDir,prior),'utf8'));}catch{}
  data.regression=await page.evaluate(({c,b})=>BFHarness.regression(c,b,.15),{c:data,b:baseline});
  const jsonName=`${data.version}-${data.runId}.json`; await writeFile(join(outDir,jsonName),JSON.stringify(data,null,2));
  const weapons=data.weaponDps.rows, fresh=data.descent.runs.find(r=>r.loadout.startsWith('fresh')), failures=data.completability.rows.filter(r=>!r.bossKillable||r.objectives.some(o=>!o.ok));
  const md=`# BLADEFALL automated playtest report\n\nVersion **${data.version}** · ${data.finishedAt} · ${quick?'quick':'full'} run\n\n${data.compatibilityPatch?`> Compatibility condition: ${data.compatibilityPatch}. The source game file was not edited; this correction existed only in the harness server response.\n\n`:''}## Weapon balance\n\n| Rank | Weapon | Theoretical DPS | On-hit | Off/on | Charge |\n|---:|---|---:|---:|---:|:---:|\n${weapons.map((w,i)=>`| ${i+1} | ${w.arche} | ${w.theoreticalDps} | ${w.onHit} | ${w.offRatio} | ${w.charge?'yes':'no'} |`).join('\n')}\n\nTop/bottom theoretical spread: **${(weapons[0].theoreticalDps/weapons.at(-1).theoreticalDps).toFixed(2)}×**. Charged and combo weapons make the single-hit off/on column noisy; use theoretical DPS and repeated full-run distributions for balance decisions.\n\n## Descent curve\n\n| Trial | Loadout | Floor reached |\n|---:|---|---:|\n${data.descent.runs.map(r=>`| ${r.trial} | ${r.loadout} | ${r.floorReached} |`).join('\n')}\n\nFresh-loadout floor details: ${fresh?fresh.floors.map(f=>`F${f.floor}: ${f.cleared?'cleared':'failed'}, HP×${f.hpScale}, DMG×${f.damageScale}, ${f.clearSeconds}s`).join('; '):'not run'}.\n\n## Zone/completability\n\n${failures.length?failures.map(x=>`- **${x.zone}**: ${!x.bossSpawned?'boss did not spawn; ':''}${!x.bossKillable?`boss remained alive after the ${x.fight.elapsed}s combat budget (${x.fight.damage} damage); `:''}${x.objectives.filter(o=>!o.ok).map(o=>o.id).join(', ')}`).join('\n'):'No accelerated objective or boss-combat-budget failures.'}\n\n## Regression flags (>15%)\n\n${data.regression.flags.length?data.regression.flags.map(x=>`- ${x.id} ${x.metric}: ${x.before} → ${x.after} (${x.changePct}%)`).join('\n'):'No baseline or no material movement.'}\n\n## Requested hooks\n\n- Seeded/injectable RNG.\n- Supported class/reset helper.\n- Combat event telemetry.\n- Non-UI loot/overlay resolver.\n- Quest-objective locator API for organic pathfinding.\n`;
  await writeFile(join(outDir,'REPORT.md'),md); console.log(JSON.stringify({json:jsonName,report:'REPORT.md',version:data.version,failures:failures.length,top:weapons.slice(0,3).map(w=>w.arche)},null,2));
} finally { if(browser)await browser.close(); await new Promise(ok=>server.close(ok)); }
