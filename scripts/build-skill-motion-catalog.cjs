const fs=require('fs'),vm=require('vm'),api=require('../public/3d/skill-motion.js');
const html=fs.readFileSync('public/3d/index.html','utf8'),start=html.indexOf('const CLASS2='),end=html.indexOf('const PASSIVE_ART',start),box={classIcon:()=>'',skillIcon:()=>''};
if(start<0||end<0)throw Error('Class definitions not found');vm.createContext(box);vm.runInContext(html.slice(start,end)+';this.classes=CLASS2;',box);api.configure(box.classes);
fs.writeFileSync('public/3d/skill-motion-catalog.json',JSON.stringify(Object.values(api.profiles),null,2)+'\n');
console.log(Object.keys(api.profiles).length+' current skill choices exported.');
