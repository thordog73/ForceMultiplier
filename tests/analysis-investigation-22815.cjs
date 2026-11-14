const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
 'Force Multiplier 22.8.15 · Analysis investigation flow',
 'Break the asset into 40 work units',
 'Top five drivers of non-mission-capable time',
 'Now trend the five drivers for 12 months',
 '1 · Difference','2 · Fishbone','3 · Correlation',
 'Core Analysis path:',
 'Advanced statistics · optional',
 'Reveal & use answer',
 'Calculator ·',
 'You are responsible for the flying program.'
]) assert(s.includes(marker),`missing 22.8.15 marker: ${marker}`);
assert(!s.includes('There is no higher headquarters reference to quote.'),'negative higher-headquarters framing should be removed');
assert(s.includes("related-heading22815"),'related metric explanation should be explicitly labeled');
console.log('PASS Analysis 22.8.15: metric/calculator flow and end-to-end Improvement Laboratory investigation path present.');
