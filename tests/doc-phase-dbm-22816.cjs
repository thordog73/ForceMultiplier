const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const db=fs.readFileSync('dist/pack-database.js','utf8');
for(const marker of [
 'Documentation Flow Lab · 1 of 7','Plan one RED modification','Plan GREEN as a separate visit','Supervisor review: what is wasteful?','Build the improved one-aircraft flow','Build the 24-aircraft modification calendar','Compare the plan to what actually happened','Plan the recurring inspection cycle',
 'Send one aircraft into Phase','Build a <strong>6-turn-4</strong>','A10 reached 0 hours and entered Phase','Fix a bad Phase Flow','400 aircraft-hours/week','Phase Flow fixed',
 'Visual DBM workbench','Grant & control user access','Troubleshoot the data path','Change, recover & verify'
])assert(html.includes(marker),`missing ${marker}`);
for(const marker of ['Grant the minimum user access','Remove excessive access','Match access to the right scope','Control temporary access','Offboard user access','Verify user identity','Troubleshoot the data path','Make a controlled system change','Restore and verify the system','Run the complete DBM control loop'])assert(db.includes(marker),`missing DBM ${marker}`);
console.log('PASS 22.8.16 Documentation flow, isolated Phase exercises, and visual DBM markers present.');
