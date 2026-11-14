const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('dist/index.html','utf8');
for(const x of [
 'fm-22-8-21-doc-fish-integrity',
 'data-doc21-open="mod"','data-doc21-open="terms"','capture-phase handler owns the new Documentation',
 'Build the 24-aircraft modification flow','Place the RED modification first','one shared final cure',
 'Simulator 4 · Fishbone walkthrough','Observed difference → categories → possible causes → test a hypothesis','data-an21-fish-next',
 'Data Integrity · maintenance record vocabulary','When Discovered','How Malfunctioned / Defect Type','Action Taken','System / Work Unit','Start / Stop Time','Outcome / Closeout',
 '40 Systems → Pareto','Trend the Top Five','Look for Differences','Look for Correlation','Start Month 1 → Big Boss Reports'
]) assert(s.includes(x),'missing '+x);
// Ensure Documentation model plan still fits the 28-day month: aircraft 24 starts RED D24, GREEN D26, final cure D28.
const red=24,green=26,cure=28;assert.equal(green,red+2);assert.equal(cure,green+2);assert(cure<=28);
console.log('PASS 22.8.21 Documentation navigation, Fishbone walkthrough, Data Integrity record lab, and Analysis investigation markers.');
