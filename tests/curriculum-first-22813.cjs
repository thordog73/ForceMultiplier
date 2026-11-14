const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
assert(s.includes('fm-curriculum-first-22813'),'curriculum-first module missing');
for(const term of ['What you will learn','20 core skills','Learn More','Sample / Practice','SKILL BEING PRACTICED','Objective:','6-Turn-4 / 12-Turn-10','Phase Flow','Big Boss # Report','Big Boss Charts Report','Find the Controlling Requirement','Which Source Is Authoritative?','Who Should Have Access?'])assert(s.includes(term),`missing curriculum surface: ${term}`);
const ids=['S01','S20','A01','A20','D01','D20','I01','I20','B01','B20'];for(const id of ids)assert(s.includes(`'${id}'`)||s.includes(`\"${id}\"`),`missing curriculum id ${id}`);
assert(s.includes('position:sticky;top:68px'),'sticky objective banner missing');
console.log('PASS 22.8.13 curriculum-first maps, direct samples, and sticky objectives.');
