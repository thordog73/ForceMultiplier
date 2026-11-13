const fs=require('node:fs'),assert=require('node:assert/strict');
const files=['dist/index.html','dist/about.html'];
const forbidden=[/\bAFI\b/i,/\bAFMAN\b/i,/\bMAJCOM\b/i,/\bAir Force\b/i,/\bUSAF\b/i,/\bcommander\b/i,/\bwing\b/i,/\bsquadron\b/i];
for(const f of files){const s=fs.readFileSync(f,'utf8');for(const re of forbidden)assert(!re.test(s),`${f} still contains military-specific training language: ${re}`)}
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['Build your flying program','You own the planning standard','enterprise planning authority','Your annual flying program','Your execution standard','Execute your flying standard']) assert(s.includes(marker),`Missing enterprise-ownership marker: ${marker}`);
assert(!/approved FHP|Flying Hour Program|FHP execution|approved annual program/i.test(s),'Old upstream-authority/FHP wording remains visible in the training surface.');
console.log('PASS 22.8.10 generic enterprise language: learner owns the planning standard and military-specific source language is absent.');
