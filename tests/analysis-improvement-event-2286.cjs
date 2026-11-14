const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['1–3–5 is easy to say','The hard work is 2 · break it down, 4 · prove root cause, 6 · implement, 7 · verify, 8 · standardize/share','Write the problem statement','What','Where','When','How much','Go & See observations','Worked 5 Whys','Worked Pareto','Implementation plan','Big Boss # Report','Big Boss Charts Report','Step 8 · Standardize & Share','Big Boss questions']) assert(s.includes(marker),`missing worked improvement marker: ${marker}`);
assert(!/commander/i.test(s),'visible/source Commander terminology should be removed from distributed index');
assert(s.includes('SIPOC')&&s.includes('Gemba')&&s.includes('Fishbone')&&s.includes('Action Plan / POAM'),'CPI tools should remain integrated');
console.log('PASS Analysis 22.8.6: worked improvement event, Big Boss naming, problem statement, root cause, implementation, verification, and standardize/share flow present.');
