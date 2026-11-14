const fs=require('fs'),assert=require('assert');const s=fs.readFileSync('dist/index.html','utf8');
for(const x of ['Force Multiplier 22.8.8 · universal happy/sad feedback','😀','☹️','Sound on','Next Exercise →','fm-lineup-counter2288','first-go','turns','spare','Run one jet into Phase','reached 0 Phase hours','PHASE · UNAVAILABLE','FM_feedback2288'])assert(s.includes(x),'missing 22.8.8 marker: '+x);
assert((s.match(/\[\[523/g)||[]).length>=1,'happy sound bank missing');assert(s.includes('const sad=['),'sad sound bank missing');
console.log('PASS 22.8.8 universal feedback, sounds, skip-ahead, lineup counters, and Phase run-in markers.');
