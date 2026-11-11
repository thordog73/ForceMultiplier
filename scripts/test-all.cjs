const {spawnSync}=require('node:child_process');const fs=require('node:fs');
for(const test of fs.readdirSync('tests').filter(f=>f.endsWith('.cjs')).sort()){const r=spawnSync(process.execPath,['tests/'+test],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
