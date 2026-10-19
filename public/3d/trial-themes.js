/* Presentation only: never changes enemy tables, trial seeds, stats or authored routes. */
(function(root){'use strict';
const row=(id,name,ground,wall,trim,accent,cloth,pattern,wallPattern,sky)=>Object.freeze({id,name,ground,wall,trim,accent,cloth,pattern,wallPattern,sky:Object.freeze(sky),void:'#202631',version:1});
const themes=Object.freeze({
 warrior:row('warrior','Hall of the Blade','#a99476','#b5ac96','#5f6c79','#eec574','#a83f3b','flagstone','stone',[.29,.35,.42]),
 ranger:row('ranger','The Archer’s Lodge','#a58d64','#9caa86','#594936','#a9cf73','#487951','planks','timber',[.28,.39,.35]),
 mage:row('mage','The Arcane Academy','#8b9cba','#bec9df','#526796','#8ac7ff','#394f91','rune','arcane',[.22,.30,.46]),
 berserker:row('berserker','The Crimson War Hall','#877369','#8e8983','#493e3d','#f4a15e','#a52c32','basalt','iron',[.32,.25,.24]),
 ninja:row('ninja','The Scarlet Dojo','#ae926d','#b9b0a0','#343e5a','#ef7c74','#a72e46','planks','shoji',[.26,.29,.40]),
 reaper:row('reaper','The Veiled Sepulchre','#8a7d9b','#a59caf','#484251','#c193f7','#5b367d','slate','crypt',[.27,.24,.36]),
 pyromancer:row('pyromancer','The Ember Crucible','#9a7660','#ad9980','#79412c','#ffba69','#b94427','basalt','furnace',[.38,.27,.23]),
 paladin:row('paladin','The Dawn Sanctuary','#d4ccb0','#e0d9c3','#aa8240','#ffe4a0','#3c7395','marble','sanctuary',[.48,.52,.58]),
 pirate:row('pirate','The Brasswake Quarters','#b69160','#a78963','#63482f','#edc86b','#397d8c','deck','timber',[.29,.42,.49]),
 chronomancer:row('chronomancer','The Hourglass Vault','#abac92','#b9c7bb','#987e45','#76dfcf','#326e73','clock','clockwork',[.29,.40,.42]),
 necromancer:row('necromancer','The Bone Archive','#979b90','#b1b4a5','#56645d','#83d3b1','#3e665f','ossuary','crypt',[.26,.35,.34])
});
function get(id){return themes[id]||null;}
function stage(base,id){const t=get(id);return t?{...base,theme:'trial',ground:t.ground,sky:t.sky}:base;}
const api={themes,get,stage};root.BFTrialThemes=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
