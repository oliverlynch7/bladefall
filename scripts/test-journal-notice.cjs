const assert=require('node:assert/strict');const {createQueue,readingTime}=require('../public/3d/journal-notice.js');
const q=createQueue(),a={a:{region:'keep',title:'Cell list',text:'Find the service marks behind the west cells.'}};
q.observe('keep',a,'keep');assert.equal(q.pending,0,'loaded notes are not replayed');
const b={...a,b:{region:'keep',title:'Lift weights',text:'The marks show a total of four.'}};
q.observe('keep',b,'keep');assert.equal(q.pending,1);q.observe('keep',b,'keep');assert.equal(q.pending,1,'duplicate snapshot');
q.tick(100,false);assert.equal(q.current,null,'conversation defers showing');q.tick(0,true);assert.equal(q.current.title,'Lift weights');const left=q.remaining;q.tick(100,false);assert.equal(q.remaining,left,'menus pause reading');q.tick(100,true,true);assert.equal(q.remaining,left,'hover and focus hold');q.tick(left-1,true);assert.ok(q.current);q.tick(2,true);assert.equal(q.current,null);
q.observe('keep',b,'keep');assert.equal(q.pending,0,'expired notes never replay');
q.observe('keep',{...b,b:{...b.b,text:'The lift is balanced. Lead the group to shelter.'}},'keep');assert.equal(q.pending,1,'changed note is announced');
q.observe('frost',b,'frost');assert.equal(q.pending,0,'scene clears queue');
q.push({id:'x',title:'Old',text:'First'});q.push({id:'x',title:'New',text:'Latest'});assert.equal(q.pending,1);q.tick(0,true);assert.equal(q.current.title,'New');q.dismiss();assert.equal(q.current,null);
q.push({id:'cage',title:'Cage',text:'Read the feed.'});q.push({id:'other',title:'Other',text:'Another clue.'});q.dismiss('cage');q.tick(0,true);assert.equal(q.current.id,'other','targeted dismissal preserves other clues');q.dismiss();
q.push({id:'other',title:'Other',text:'Another clue.'});q.push({id:'cage',title:'Cage',text:'Read the feed.'});q.tick(0,true);q.dismiss('cage');assert.equal(q.current.id,'other','targeted dismissal removes a queued clue without hiding the current one');q.dismiss();
assert.ok(readingTime('word '.repeat(100))>45,'long notes get reading time');assert.ok(readingTime('One word')>=10);q.reset('frost',{});q.observe('frost',{a:a.a},'frost');assert.equal(q.pending,0,'other region not shown');
console.log('Journal notice passed: restore, dedupe, queued changes, scene reset, dialogue/menu pause, hover hold, dismissal, length-based reading.');

// A pinned card must show the new version immediately, not leave it behind itself.
const live=createQueue();live.reset('woods');live.push({id:'signal',title:'Silence the horn',text:'Reach the crank.'});live.tick(0,true);
live.push({id:'unrelated',title:'Hidden grove',text:'Follow the tracks.'});
live.push({id:'signal',title:'The horn is silent',text:'Reach the shelter.'});
assert.equal(live.current.title,'The horn is silent');assert.equal(live.pending,1);
live.tick(100,true,true);assert.equal(live.current.text,'Reach the shelter.');
live.dismiss();live.tick(0,true);assert.equal(live.current.id,'unrelated');

const recent=createQueue({preferLatest:true});recent.reset('briar');
recent.push({id:'clue',title:'Clue',text:'Read the wheel marks.'});
recent.push({id:'task',title:'Task',text:'Collect roots.'});
assert.equal(recent.current.id,'task');assert.equal(recent.pending,1);
recent.push({id:'clue',title:'Updated clue',text:'Turn the wheel toward the stream.'});
assert.equal(recent.current.title,'Updated clue');assert.equal(recent.pending,1,'queued revision replaces its older copy');
recent.push({id:'clue',title:'Updated clue',text:'Turn the wheel toward the stream.'});assert.equal(recent.pending,1,'repeated packets do not multiply unread cards');
recent.dismiss();recent.tick(0,true);assert.equal(recent.current.id,'task','interrupted unread note remains accessible');
recent.push({id:'task',title:'Return to Mara',text:'Collect roots.'});assert.equal(recent.current.title,'Return to Mara','title-only changes are visible');
recent.reset('woods',{signal:{region:'outskirts',title:'Horn',text:'Old saved note'}});recent.observe('woods',{signal:{region:'outskirts',title:'Horn',text:'Old saved note'}},'outskirts');assert.equal(recent.current,null,'restored history stays silent in latest-first mode');
console.log('Pinned revisions, latest arrivals, unread recovery, queued replacement, title changes and repeated snapshots passed.');
