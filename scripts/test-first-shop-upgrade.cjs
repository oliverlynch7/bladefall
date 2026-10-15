/* Actual game factories and archetypes. No substitute damage formulas. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('public/3d/index.html','utf8');
function fn(n){const a=s.indexOf('function '+n+'('),b=s.indexOf('\n}',a+10);assert(a>=0&&b>a,n);return s.slice(a,b+2);}
function line(n){const m=s.match(new RegExp('const '+n+'=[^\\n]+'));assert(m,n);return m[0];}
const ctx={elementColor:()=>null,rollAffixes:()=>{},meta:{classes:{}}};vm.createContext(ctx);
const arch=s.slice(s.indexOf('const ARCHES='),s.indexOf('const ARCHEIDS='));
const rarity=s.slice(s.indexOf('const RARITY='),s.indexOf('const RORDER='));
const cost=s.match(/function shopWeapCost[^\n]+/)[0];
vm.runInContext([rarity,arch,line('CLASSSTART'),line('SHOPWEAP'),line('SHOPPLAIN'),fn('makeWeapon'),fn('classStartWeapon'),fn('shopWeapon'),cost,'this.stock=SHOPWEAP;'].join('\n'),ctx);
const rows=[];
for(const cls of Object.keys(ctx.stock)){
 // Pirate has an intrinsic pistol/saber rather than an equivalent rolled starter.
 const starter=cls==='pirate'?null:ctx.classStartWeapon(cls),shop=ctx.shopWeapon(cls,'common'),loot=ctx.makeWeapon(ctx.stock[cls],'common');
 // Ninja/Paladin stock can be a different weapon type from the class default;
 // don't compare per-hit damage across different speeds, reach and mechanics.
 if(starter?.arche===shop.arche)assert(shop.dmg>starter.dmg,cls+' equivalent paid weapon improves damage');
 assert(shop.dmg<loot.dmg,cls+' ordinary loot stays better');
 assert.equal(shop.cd,loot.cd);assert.equal(shop.lifesteal,0);assert.equal(ctx.shopWeapCost('common'),60);
 for(const rid of ['uncommon','rare','epic']){const base=ctx.makeWeapon(ctx.stock[cls],rid,'No affixes');assert.equal(ctx.shopWeapon(cls,rid).dmg,+(base.dmg*.82).toFixed(1));}
 rows.push({cls,starter:starter?.dmg??null,shop:shop.dmg,loot:loot.dmg});
}
console.log(JSON.stringify({rows,passed:true}));
