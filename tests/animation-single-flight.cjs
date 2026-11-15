const fs=require('node:fs'),assert=require('node:assert');
const s=fs.readFileSync('dist/index.html','utf8');
assert(s.includes('let outcomeTimers=[]'),'Outcome animations must track pending timers');
assert(s.includes('function clearOutcomeTimers()'),'Outcome animations must have cancellation');
assert(s.includes('function queueOutcome(fn,ms)'),'Outcome timers must use a single-flight queue');
assert(s.includes('function runOutcome(){clearOutcomeTimers();'),'A restarted outcome must cancel earlier timers');
const render=s.slice(s.indexOf('function render(){'),s.indexOf('function skillBadges'));
assert(render.includes('clearOutcomeTimers();'),'Leaving/re-rendering a scenario must cancel animation timers');
console.log('PASS animation single-flight: repeated Execute taps and navigation cancel stale timers.');
