// Catch syntax errors in the large inline game script before opening a browser.
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const file=path.join(__dirname,'../public/3d/index.html');
const html=fs.readFileSync(file,'utf8');
let checked=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=|\btype\s*=\s*["'](?:application\/json|importmap|module)/i.test(match[1])||!match[2].trim())continue;
  const lineOffset=html.slice(0,match.index).split('\n').length-1;
  new vm.Script(match[2],{filename:file,lineOffset});
  checked++;
}
if(!checked)throw Error('No inline game scripts found');
console.log('Parsed '+checked+' inline game script'+(checked===1?'':'s')+'.');
