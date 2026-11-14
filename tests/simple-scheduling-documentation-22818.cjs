const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8');
const must=[
 'Schedule a 6-turn-4',
 'Avoid a hangar queen',
 'Schedule an aircraft into Phase',
 'Fix a flat Phase Flow',
 'Schedule around NMC aircraft',
 'Build and reconcile the flying-hour program',
 'Build the weekly schedule',
 'A8 has 15 hours remaining',
 'Twenty available aircraft all start at 50 hours remaining',
 'Build the fleet modification plan',
 'Place RED start',
 'Place GREEN start',
 'Fleet modification flow complete: RED → GREEN → one final cure across all 24 aircraft.',
 'Build the Documentation terms',
 'Compliance Category',
 'Ground / Stop-Use Date',
 'Rescission Date',
 'Expiration Date'
];
for(const x of must){if(!s.includes(x))throw new Error('Missing 22.8.18 marker: '+x)}
if(!s.includes('const DOC18_FLEET='))throw new Error('Missing 24-aircraft Documentation fleet');
console.log('PASS 22.8.18 simplified Scheduling ladder, fleet-wide modification planner, and Documentation terms cards present.');
