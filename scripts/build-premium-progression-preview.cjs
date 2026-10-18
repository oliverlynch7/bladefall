const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('public/3d/index.html','utf8');
function read(name,context={}){const a=html.indexOf('const '+name+'={'),b=html.indexOf('\n};',a)+3;if(a<0||b<3)throw Error(name);const c={...context};vm.createContext(c);vm.runInContext(html.slice(a,b)+';this.data='+name,c);return c.data;}
const artFiles=new Map([...html.matchAll(/\.ico-([a-zA-Z0-9_-]+)\s*\{\s*background-image:\s*url\(['"]?([^'"\)]+)['"]?\)/g)].map(m=>[m[1],m[2]]));
function art(key){const file=artFiles.get(key);if(!file||!fs.existsSync('public/3d/'+file))throw Error('Missing real icon: '+key);return '<img src="'+file+'" alt="">';}
const classes=read('CLASS2',{classIcon:id=>art('class-'+id)}),icons=read('C2_ICON',{skillIcon:id=>art('skill-'+id)}),passive=read('PASSIVE_ART');
for(const cls of Object.values(classes))for(const r of [2,3,4,5,6,7,8,9])for(const path of ['a','b']){const o=cls['r'+r][path];o.art=cls['r'+r].kind==='skill'?(icons[o.fx]||'✦'):(passive[o.id]?'<img src="icons/passives/passive-'+passive[o.id]+'.png" alt="">':'✦');}
fs.writeFileSync('public/3d/progression-preview-data.json',JSON.stringify({source:'Current CLASS2/C2_ICON/PASSIVE_ART. Illustrations do not simulate damage.',classes},null,2)+'\n');
console.log(Object.keys(classes).length+' current class kits exported for save-free preview.');
