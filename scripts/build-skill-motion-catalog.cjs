const fs=require('fs'),vm=require('vm'),api=require('../public/3d/skill-motion.js');
const html=fs.readFileSync('public/3d/index.html','utf8'),start=html.indexOf('const CLASS2='),end=html.indexOf('const PASSIVE_ART',start),box={classIcon:()=>'',skillIcon:()=>''};
if(start<0||end<0)throw Error('Class definitions not found');vm.createContext(box);vm.runInContext(html.slice(start,end)+';this.classes=CLASS2;',box);api.configure(box.classes);
const fxBox={window:{}};vm.runInNewContext(fs.readFileSync('public/3d/combat-art.js','utf8'),fxBox);fxBox.window.BF_COMBAT_ART.configure(box.classes);
const rows=Object.values(api.profiles).map(p=>{const {form,slot,side}=fxBox.window.BF_COMBAT_ART.profiles[p.id];return {...p,form,slot,side};});
fs.writeFileSync('public/3d/skill-motion-catalog.json',JSON.stringify(rows,null,2)+'\n');
console.log(Object.keys(api.profiles).length+' current skill choices exported.');
