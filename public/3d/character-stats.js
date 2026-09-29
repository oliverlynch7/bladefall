/* Allocation is carried by character snapshots; class foundations follow the equipped class. */
window.BFCharacterStats=(()=>{
 const keys=['health','attack','defense','speed','mana'];
 const labels=['Health','Attack','Defense','Speed','Mana'];
 const descriptions=['+2% maximum health per point','+1.5% all damage per point','+0.5% damage reduction; shared cap 50%','+0.5% movement speed per point','+3 maximum mana per point'];
 const blank=()=>Object.fromEntries(keys.map(k=>[k,0]));
 const budget=p=>Math.min(100,10+Math.max(0,Math.floor(Number(p.level)||1)-1));
 function normalize(value,level=1){const a=blank();let left=10+Math.max(0,Math.floor(Number(level)||1)-1);for(const k of keys){a[k]=Math.min(20,left,Math.max(0,Math.floor(Number(value?.[k])||0)));left-=a[k];}return a;}
 const used=a=>keys.reduce((n,k)=>n+(a[k]||0),0);
 const available=p=>Math.max(0,budget(p)-used(normalize(p.allocation,p.level)));
 function roll(cls){const a=blank(),bias=cls==='warrior'?['health','defense']:cls==='ranger'?['speed','attack']:['mana','attack'];for(let n=0;n<10;n++){const pool=[...keys,...bias,...bias].filter(k=>a[k]<4);a[pool[Math.floor(Math.random()*pool.length)]]++;}return a;}
 const value=(p,k)=>normalize(p?.allocation,p?.level)[k];
 function foundation(cls){return cls==='warrior'?'Warrior foundation: +10 health and 2% damage reduction.':cls==='ranger'?'Ranger foundation: +4% movement speed.':cls==='mage'?'Mage foundation: +10 mana, on top of the class mana pool.':'Your equipped class keeps its own abilities and mana pool.';}
 function markup(a,limit,cap=20){const left=Math.max(0,limit-used(a));return `<style>[data-stat]{min-width:36px;min-height:36px;background:#292c36;color:#ffe1a5;border:1px solid #776448;border-radius:7px;font-size:18px}[data-stat]:disabled{opacity:.35}</style><p>${BFUIIcons.html('action-allocate-stats')}<b>${left} point${left===1?'':'s'} available</b> · ${limit===10?'10 starting points':'1 point per player level'}</p>${keys.map((k,i)=>`<div style="display:flex;align-items:center;gap:10px;margin:10px 0"><div style="flex:1"><b>${labels[i]}</b><div style="font-size:12px;color:#c8c0b5">${descriptions[i]}</div></div><button type="button" data-stat="${k}" data-delta="-1" ${!a[k]?'disabled':''} aria-label="Decrease ${labels[i]}">−</button><b style="min-width:24px;text-align:center">${a[k]}</b><button type="button" data-stat="${k}" data-delta="1" ${!left||a[k]>=cap?'disabled':''} aria-label="Increase ${labels[i]}">+</button></div>`).join('')}`;}
 function wire(root,a,limit,cap,rerender){root.querySelectorAll('[data-stat]').forEach(b=>b.onclick=()=>{const k=b.dataset.stat,d=+b.dataset.delta;if(d>0&&(used(a)>=limit||a[k]>=cap)||d<0&&!a[k])return;a[k]+=d;rerender();});}
 return {keys,blank,normalize,budget,used,available,roll,value,foundation,markup,wire};
})();
