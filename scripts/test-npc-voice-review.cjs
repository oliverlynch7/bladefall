const assert=require('node:assert/strict'),fs=require('node:fs'),R=require('../public/3d/npc-voice-preview/review-state.js');
const cast=JSON.parse(fs.readFileSync('docs/audio/npc-voice-casting-20261019.json','utf8')),catalog=JSON.parse(fs.readFileSync('public/3d/npc-voice-preview/auditions.json','utf8'));
assert.equal(cast.characters.length,50);assert.equal(catalog.characters.length,50);assert.equal(new Set(catalog.characters.map(c=>c.id)).size,50);
const sourceSpeakers=new Set();for(const f of fs.readdirSync('public/3d/story').filter(f=>f.endsWith('.json'))){const b=JSON.parse(fs.readFileSync('public/3d/story/'+f,'utf8'));for(const n of Object.values(b.nodes))sourceSpeakers.add(n.voice.speaker);}
assert.equal(sourceSpeakers.size,49);for(const s of sourceSpeakers)assert(catalog.characters.some(c=>c.id===s),s);
let clips=0;for(const c of catalog.characters){assert(c.text.length>=100&&c.text.length<=1000);assert(c.direction.length>80);assert.equal(c.options.length,3);for(const p of c.options){assert(p.duration>2&&p.duration<60);assert(fs.statSync('public/3d/npc-voice-preview/'+p.file).size>1000);assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('public/3d/npc-voice-preview/'+p.file)).digest('hex'),p.sha256);clips++;}for(const l of c.sourceLines){if(!l.sha256)continue;const b=JSON.parse(fs.readFileSync(l.file,'utf8'));assert.equal(b.nodes[l.id].text,l.text);}}
const c=catalog.characters[0],base={schema:1,revision:catalog.revision,characters:{}},a=c.options[0];assert.equal(R.state(null,c),'pending');
base.characters[c.id]={votes:{A:{decision:'yes',sha256:a.sha256}},notes:'Warmer, please.'};let v=R.clean(base,catalog);assert.equal(R.state(v.characters[c.id],c),'approved');assert(R.summary(v,catalog).includes('A GREEN'));
v.characters[c.id].votes.A.sha256='old-audio';assert.deepEqual(R.clean(v,catalog).characters[c.id].votes,{});
assert.throws(()=>R.clean({...base,revision:'old'},catalog));
for(const p of c.options)base.characters[c.id].votes[p.option]={decision:'no',sha256:p.sha256};v=R.clean(base,catalog);assert.equal(R.state(v.characters[c.id],c),'rejected');
delete base.characters[c.id].votes.C;assert.equal(R.state(R.clean(base,catalog).characters[c.id],c),'pending');
base.characters[c.id].votes.B={decision:'evil',sha256:c.options[1].sha256};assert(!R.clean(base,catalog).characters[c.id].votes.B);
base.characters[c.id].notes='x'.repeat(3000);assert.equal(R.clean(base,catalog).characters[c.id].notes.length,2000);
assert(!fs.readFileSync('public/3d/npc-voice-preview/auditions.json','utf8').includes('generated_voice_id'));
console.log(JSON.stringify({characters:50,authoredSpeakers:49,clips,coverage:'all',reviewValidation:'pass',sourceLines:'exact',fullDialogueGenerated:false}));
