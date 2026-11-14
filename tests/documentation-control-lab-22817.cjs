const fs=require('node:fs');
const src=fs.readFileSync('dist/index.html','utf8');
function need(x){if(!src.includes(x))throw new Error('Missing 22.8.17 marker: '+x)}
[
 'Documentation Control Lab',
 'Compliance Category',
 'Compliance Period',
 'Ground / Stop-Use Date',
 'Rescission Date',
 'Expiration Date',
 'Applicability',
 'Evidence of Completion',
 'Extension / Exception',
 'Build the Phase Flow',
 'Documentation creates the future maintenance-demand picture',
 'Scheduling accepts the current flow as an input',
 'available from every Documentation exercise'
].forEach(need);
if(!/state\.docControl22817/.test(src))throw new Error('Documentation Control Lab is not persistent in saved state');
if(!/state\.scenario===1\?renderDocPhase22817\(\)/.test(src))throw new Error('Documentation Phase Flow exercise is not routed');
console.log('PASS 22.8.17 Documentation Control Lab, terms, persistent reference board, and Documentation-built Phase Flow present.');
