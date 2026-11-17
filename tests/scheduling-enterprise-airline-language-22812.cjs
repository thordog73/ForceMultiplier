const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
const a=s.indexOf('<script id="fm-sched-100">'),b=s.indexOf('</script>',a);
assert(a>=0&&b>a,'Scheduling 100-rep module missing');
const block=s.slice(a,b);
// Guard learner-facing strings, not internal variable names retained for compatibility.
for(const term of ['24-aircraft AMU','first-go','first go','Annual sorties','This month’s sorties','Average sorties','sorties over','h/sortie','daily flyer','today’s flyer']){
  assert(!block.toLowerCase().includes(term.toLowerCase()),`Scheduling still exposes military-leaning learner text: ${term}`);
}
for(const term of ['24-aircraft fleet','first-departure','Annual flights','This month’s flights','Average flights','daily fleet plan','operating rhythm']){
  assert(block.toLowerCase().includes(term.toLowerCase()),`Expected enterprise/airline learner text missing: ${term}`);
}
console.log('PASS 22.8.12 Scheduling enterprise/airline learner language guard.');
