const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const approved=require('../docs/audio/npc-voice-approved-20261019.json'),auditions=require('../public/3d/npc-voice-preview/auditions.json'),catalog=require('../public/3d/npc-voices/manifest.json');
const nodes={};for(const name of fs.readdirSync('public/3d/story').filter(f=>f.endsWith('.json')))Object.assign(nodes,JSON.parse(fs.readFileSync('public/3d/story/'+name)).nodes);
const hash=raw=>crypto.createHash('sha256').update(raw).digest('hex');
assert.equal(Object.keys(approved.characters).length,50);
for(const c of auditions.characters){const choice=approved.characters[c.id],greens=Object.entries(choice.votes).filter(([,v])=>v.decision==='yes');assert.equal(greens.length,1,c.id);assert.equal(greens[0][0],choice.selected);assert.equal(greens[0][1].sha256,c.options.find(p=>p.option===choice.selected).sha256);}
for(const [id,line]of Object.entries(catalog.lines)){
 assert.equal(line.text,nodes[id].text.trim(),id+' current script');assert.equal(line.speaker,nodes[id].voice.speaker,id+' speaker');assert.equal(line.option,approved.characters[line.speaker].selected,id+' approved cast');assert.equal(line.sha256,hash(line.text),id+' text hash');
 assert.match(line.audio,/^\.\/npc-voices\/[\w.-]+\.mp3$/);const raw=fs.readFileSync('public/3d/'+line.audio.slice(2));assert.equal(hash(raw),line.audio_sha256,id+' file integrity');assert(raw.length>500);
}
assert.equal(catalog.totalLines,Object.keys(nodes).length);assert.equal(catalog.recordedLines,Object.keys(catalog.lines).length);
for(const c of catalog.characters){assert.equal(c.recorded,Object.values(catalog.lines).filter(l=>l.speaker===c.id).length);assert.equal(c.total,Object.values(nodes).filter(n=>n.voice.speaker===c.id).length);}
assert(!/generated_voice_id|xi-api-key|voice_id/.test(JSON.stringify(catalog)),'provider identifiers stay out of public catalog');
console.log(JSON.stringify({casting:50,recorded:catalog.recordedLines,total:catalog.totalLines,complete:catalog.characters.filter(c=>c.total&&c.recorded===c.total).length,sourceAndAudioHashes:'pass'}));
