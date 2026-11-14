const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
 'fm-mobile-stress-hardening-2289',
 'minimum-scale=1,maximum-scale=5,user-scalable=yes',
 '1× Reset View',
 '↻ Reload to reset zoom',
 'font-size:16px!important',
 'repeat(28,44px)',
 'width:44px!important;height:44px!important',
 'window.renderS100Foundation()',
 'window.renderS100Lineup(false)',
 'window.renderS100Phase(l<5)',
 'Object.assign(window,{s100Local',
 'Object.assign(window,{a100Progress',
 'Object.assign(window,{improveRail2285'
]) assert(s.includes(marker),'missing mobile stress-hardening marker: '+marker);
assert(!/user-scalable=no[^\n]*<\/head>/.test(s),'top-level viewport must not disable user zoom');
console.log('PASS 22.8.9 mobile zoom, touch-target, startup-order, and helper-scope hardening markers.');
