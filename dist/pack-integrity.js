(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const rand=seed=>{let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
  const shuffle=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const unique=a=>[...new Set(a)];
  const levels=[
    {id:1,title:'One wrong number',chapter:'Trust the evidence'},
    {id:2,title:'Unknown is not zero',chapter:'Trust the evidence'},
    {id:3,title:'Mind the unit',chapter:'Trust the evidence'},
    {id:4,title:'One event, one record',chapter:'Keep the identity'},
    {id:5,title:'Connect the right record',chapter:'Keep the identity'},
    {id:6,title:'Count the right window',chapter:'Reconcile the picture'},
    {id:7,title:'Find the trusted source',chapter:'Reconcile the picture'},
    {id:8,title:'Leave a clear trail',chapter:'Make corrections traceable'},
    {id:9,title:'Stop it returning',chapter:'Make corrections traceable'},
    {id:10,title:'Clean the whole batch',chapter:'Put it together'}
  ];
  const valueLabel=v=>v===null?'Unknown':String(v);
  const fields=['eventId','asset','value','unit'];
  const plain=r=>Object.fromEntries(fields.map(k=>[k,r[k]]));
  function make(levelId,seed=1){
    const meta=levels.find(l=>l.id===Number(levelId));if(!meta)throw Error('Unknown integrity level.');
    const r=rand(seed),n=4+Math.floor(r()*16),base=100+Math.floor(r()*700),assets=shuffle(r,['01','02','03']);
    const s={...meta,seed:Number(seed)>>>0,type:'records',prompt:'Match the record to the source.',hint:'Compare the record with the source. Copy only verified information.',reveal:'A correct record agrees with its source, including the units and identity.',checkLabel:'Verify records',rows:[],sources:{},initial:{records:{},removed:[],reviewed:[],audit:[],reason:null}};
    function add(id,eventId,asset,value,unit,stored){
      const source={eventId,asset,value,unit};s.sources[eventId]=source;
      const row={id,...source,...(stored||{})};s.rows.push(row);s.initial.records[id]=plain(row);
    }
    if(meta.id===1){add('a','E-'+base,assets[0],n,'jobs',{value:n+3});s.hint='The source says '+n+'. The record should agree.';}
    if(meta.id===2){s.prompt='Keep unknown separate from zero.';add('a','E-'+base,assets[0],null,'jobs',{value:0});add('b','E-'+(base+1),assets[1],0,'jobs',{value:null});s.reveal='Zero is a measured result. Unknown means the result is missing.';s.hint='One result is known to be zero. The other has not been reported.';}
    if(meta.id===3){s.type='units';s.prompt='Store the time in minutes.';s.hours=(2+Math.floor(r()*7))/2;s.target=s.hours*60;s.options=shuffle(r,unique([s.target,s.hours,s.hours*10,s.hours*100]));s.initial={value:null,unit:null};s.hint='One hour contains 60 minutes. The number and the unit must agree.';s.reveal='A value without the right unit can be wrong by a large factor.';s.checkLabel='Save value';}
    if(meta.id===4){s.type='duplicates';s.prompt='Keep one copy of each event.';s.rows=[{id:'a',eventId:'E-'+base,asset:assets[0],value:n,unit:'jobs',time:'09:00'},{id:'b',eventId:'E-'+(base+1),asset:assets[0],value:n,unit:'jobs',time:'10:00'},{id:'c',eventId:'E-'+base,asset:assets[0],value:n,unit:'jobs',time:'09:00'},{id:'d',eventId:'E-'+(base+2),asset:assets[1],value:n+2,unit:'jobs',time:'11:00'}];s.rows=shuffle(r,s.rows);s.initial={removed:[]};s.hint='A repeated event ID is a duplicate. The same asset can have different events.';s.reveal='Deduplicate by event identity. Repeated names or values alone are not duplicates.';s.checkLabel='Keep clean set';}
    if(meta.id===5){s.type='links';s.prompt='Link each job to its asset.';s.parents=assets.map(id=>({id}));s.children=[{id:'a',job:'E-'+base,asset:assets[0]},{id:'b',job:'E-'+(base+1),asset:assets[2]}];s.initial={selected:'a',links:{a:null,b:null}};s.hint='Select a job card, then the asset ID named on its source.';s.reveal='A valid link connects the record to the right existing parent identity.';s.checkLabel='Verify links';}
    if(meta.id===6){s.type='window';s.prompt='Keep today’s records.';s.day=10+Math.floor(r()*12);s.rows=shuffle(r,[{id:'a',eventId:'E-'+base,day:s.day,value:n},{id:'b',eventId:'E-'+(base+1),day:s.day,value:n+2},{id:'c',eventId:'E-'+(base+2),day:s.day-1,value:n+1},{id:'d',eventId:'E-'+(base+3),day:s.day,value:0},{id:'e',eventId:'E-'+(base+4),day:s.day+1,value:n+3}]);s.expected=s.rows.filter(x=>x.day===s.day).map(x=>x.id);s.total=s.rows.filter(x=>x.day===s.day).reduce((a,x)=>a+x.value,0);s.initial={selected:[]};s.hint='Match the date first. A zero result is still a record.';s.reveal='Totals are meaningful only when the period and the records match.';s.checkLabel='Reconcile';}
    if(meta.id===7){s.type='sources';s.prompt='Use the current approved source.';s.sourcesList=shuffle(r,[{id:'old',rev:1,status:'Superseded',value:n},{id:'current',rev:2,status:'Approved',value:n+4},{id:'draft',rev:3,status:'Draft',value:n+7}]);s.initial={selected:null,sourceId:null,value:n,audit:[]};s.hint='A newer draft is not approved. Use the current approved revision.';s.reveal='A reliable source is authoritative and current, not merely the newest file.';s.checkLabel='Verify source';}
    if(meta.id===8){s.prompt='Correct it and leave a trail.';add('a','E-'+base,assets[0],n,'jobs',{value:n+6});s.requireAudit=true;s.requireReason=true;s.reasons=shuffle(r,[{id:'source',label:'Source mismatch'},{id:'estimate',label:'Estimate'},{id:'new',label:'New event'}]);s.hint='Copy the verified value and record why you changed it.';s.reveal='A traceable correction keeps the old value, new value, source, and reason.';}
    if(meta.id===9){s.type='gate';s.prompt='Let good records through.';s.parents=['01','02'];s.rules=shuffle(r,[{id:'unique',label:'Unique event ID',icon:'key'},{id:'known',label:'Known asset ID',icon:'link'},{id:'nonnegative',label:'Value ≥ 0',icon:'chart'},{id:'nonzero',label:'Reject every zero',icon:'close'}]);s.incoming=[{id:'a',eventId:'E-'+base,asset:'01',value:n},{id:'b',eventId:'E-'+(base+1),asset:'02',value:0},{id:'c',eventId:'E-'+(base+2),asset:'01',value:-n},{id:'d',eventId:'E-'+(base+3),asset:'99',value:n+1},{id:'e',eventId:'E-'+base,asset:'01',value:n}];s.initial={rules:[],tested:false,routes:{}};s.hint='Hold duplicates, unknown asset IDs, and negative counts. Keep valid zeroes.';s.reveal='Repair today’s data, then prevent the same error without rejecting valid records.';s.checkLabel='Verify gate';}
    if(meta.id===10){s.prompt='Make this batch trustworthy.';add('a','E-'+base,assets[0],n,'jobs',{value:n+2});add('b','E-'+(base+1),assets[1],null,'jobs',{value:0});add('c','E-'+(base+2),assets[2],n+3,'jobs',{asset:assets[0]});add('d','E-'+base,assets[0],n,'jobs');s.allowRemove=true;s.requireAudit=true;s.hint='Compare sources, repair mismatches, and keep exactly one record per event.';s.reveal='Trustworthy data has correct values, units, identities, unique events, and a correction trail.';}
    return s;
  }
  function gate(s,rules){
    const seen=new Set(),routes={};
    for(const x of s.incoming){
      let ok=true;
      if(rules.includes('unique')&&seen.has(x.eventId))ok=false;
      if(rules.includes('known')&&!s.parents.includes(x.asset))ok=false;
      if(rules.includes('nonnegative')&&x.value<0)ok=false;
      if(rules.includes('nonzero')&&x.value===0)ok=false;
      routes[x.id]=ok?'keep':'hold';if(ok)seen.add(x.eventId);
    }
    return routes;
  }
  function check(s,p){
    p=p||{};const fail=message=>({ok:false,message});
    if(s.type==='records'){
      if(!p.records||!Array.isArray(p.removed)||!Array.isArray(p.audit)||!Array.isArray(p.reviewed))return fail('Match each record to its source.');
      if(Object.keys(p.records).some(id=>!s.rows.some(row=>row.id===id)))return fail('Use only records on this board.');
      if(p.removed.some(id=>!s.rows.some(row=>row.id===id))||new Set(p.removed).size!==p.removed.length)return fail('Check which records are removed.');
      if(!s.allowRemove&&p.removed.length)return fail('Keep every distinct record.');
      const kept=s.rows.filter(row=>!p.removed.includes(row.id));
      if(kept.some(row=>!p.reviewed.includes(row.id)))return fail('Verify each retained record against its source.');
      const events=kept.map(row=>p.records[row.id]?.eventId);
      if(events.length!==Object.keys(s.sources).length||new Set(events).size!==events.length||Object.keys(s.sources).some(id=>!events.includes(id)))return fail('Keep exactly one record for every event.');
      for(const row of kept){
        const truth=s.sources[row.eventId],actual=p.records[row.id];
        if(!actual||!fields.every(k=>actual[k]===truth[k]))return fail('Record '+row.eventId+' still differs from its source.');
        if(s.requireAudit&&!fields.every(k=>row[k]===truth[k])){
          const a=p.audit.find(a=>a.row===row.id&&a.source===row.eventId&&eq(a.before,plain(row))&&eq(a.after,truth));
          if(!a)return fail('Keep a before-and-after trail for '+row.eventId+'.');
        }
      }
      if(s.requireReason&&p.reason!=='source')return fail('Record the reason supported by the evidence.');
    }else if(s.type==='units'){
      if(typeof p.value!=='number'||!Number.isFinite(p.value)||Math.abs(p.value-s.target)>1e-9||p.unit!=='min')return fail('Make the number and the minutes agree.');
    }else if(s.type==='duplicates'){
      if(!Array.isArray(p.removed)||p.removed.some(id=>!s.rows.some(r=>r.id===id))||new Set(p.removed).size!==p.removed.length)return fail('Choose duplicate records on this board.');
      const kept=s.rows.filter(r=>!p.removed.includes(r.id)),wanted=unique(s.rows.map(r=>r.eventId));
      if(kept.length!==wanted.length||wanted.some(id=>kept.filter(r=>r.eventId===id).length!==1))return fail('Keep each distinct event exactly once.');
    }else if(s.type==='links'){
      if(!p.links||s.children.some(x=>p.links[x.id]!==x.asset)||Object.keys(p.links).some(id=>!s.children.some(x=>x.id===id)))return fail('Match every job to the asset named in its source.');
    }else if(s.type==='window'){
      if(!Array.isArray(p.selected)||new Set(p.selected).size!==p.selected.length||!eq(p.selected.slice().sort(),s.expected.slice().sort()))return fail('Keep every record from day '+s.day+', including zeroes.');
    }else if(s.type==='sources'){
      const truth=s.sourcesList.find(x=>x.id==='current');
      if(p.sourceId!=='current'||p.value!==truth.value||!Array.isArray(p.audit)||!p.audit.length)return fail('Update from the current approved source.');
      let previous=s.initial.value;
      for(const a of p.audit){const source=s.sourcesList.find(x=>x.id===a.source);if(!source||a.before!==previous||a.after!==source.value)return fail('Keep the source history intact.');previous=a.after;}
      if(previous!==truth.value||p.audit[p.audit.length-1].source!=='current')return fail('Finish with the current approved source.');
    }else if(s.type==='gate'){
      if(!Array.isArray(p.rules)||new Set(p.rules).size!==p.rules.length||p.rules.some(id=>!s.rules.some(x=>x.id===id)))return fail('Choose checks shown on this board.');
      if(!p.tested)return fail('Run the incoming records through your gate.');
      if(!eq(p.routes,gate(s,p.rules)))return fail('Run the gate again after changing its rules.');
      if(!eq(p.routes,gate(s,['unique','known','nonnegative'])))return fail('Hold the errors and keep all valid records, including zeroes.');
    }
    return{ok:true,message:'The records and evidence agree.'};
  }
  function act(s,play,event){
    const p=clone(play),a=event.action,id=String(event.id??'');
    const reject=message=>({state:p,message,error:true});
    if(a==='copy'&&s.type==='records'){
      const row=s.rows.find(x=>x.id===id);if(!row)return reject('Choose a record on this board.');
      if(p.removed.includes(id))return reject('Restore the record before changing it.');
      const truth=clone(s.sources[row.eventId]),before=clone(p.records[id]);
      p.reviewed=unique([...(p.reviewed||[]),id]);
      if(eq(before,truth))return{state:p,message:'Record verified. No change needed.'};
      p.records[id]=truth;p.audit.push({row:id,source:row.eventId,before,after:clone(truth)});
      return{state:p,message:'Verified value copied. The old value stays in the trail.'};
    }else if(a==='remove'&&(s.type==='duplicates'||s.allowRemove)){
      if(!s.rows.some(x=>x.id===id))return reject('Choose a record on this board.');
      p.removed=p.removed.includes(id)?p.removed.filter(x=>x!==id):[...p.removed,id];
    }else if(a==='unit'&&s.type==='units'){
      if(!['h','min'].includes(id))return reject('Choose a unit shown here.');p.unit=id;
    }else if(a==='number'&&s.type==='units'){
      const number=Number(id);if(!s.options.includes(number))return reject('Choose a number tile shown here.');p.value=number;
    }else if(a==='job'&&s.type==='links'){
      if(!s.children.some(x=>x.id===id))return reject('Choose a job on this board.');p.selected=id;
    }else if(a==='parent'&&s.type==='links'){
      if(!s.parents.some(x=>x.id===id)||!s.children.some(x=>x.id===p.selected))return reject('Choose a job, then an existing asset.');
      p.links[p.selected]=id;p.selected=s.children.find(x=>p.links[x.id]===null)?.id||p.selected;
    }else if(a==='row'&&s.type==='window'){
      if(!s.rows.some(x=>x.id===id))return reject('Choose a record on this board.');
      p.selected=p.selected.includes(id)?p.selected.filter(x=>x!==id):[...p.selected,id];
    }else if(a==='source'&&s.type==='sources'){
      if(!s.sourcesList.some(x=>x.id===id))return reject('Choose a source shown here.');p.selected=id;
    }else if(a==='apply-source'&&s.type==='sources'){
      const src=s.sourcesList.find(x=>x.id===p.selected);if(!src)return reject('Choose a source first.');
      p.audit.push({source:src.id,before:p.value,after:src.value});p.value=src.value;p.sourceId=src.id;
    }else if(a==='reason'&&s.requireReason){
      if(!s.reasons.some(x=>x.id===id))return reject('Choose a reason shown here.');p.reason=id;
    }else if(a==='rule'&&s.type==='gate'){
      if(!s.rules.some(x=>x.id===id))return reject('Choose a check shown here.');
      p.rules=p.rules.includes(id)?p.rules.filter(x=>x!==id):[...p.rules,id];p.tested=false;p.routes={};
    }else if(a==='run-gate'&&s.type==='gate'){
      p.routes=gate(s,p.rules);p.tested=true;return{state:p,message:'Incoming records checked.'};
    }else return reject('Choose an action on this board.');
    return{state:p};
  }
  function solve(s){
    const p=clone(s.initial);
    if(s.type==='records'){
      const seen=new Set();
      for(const row of s.rows){
        if(seen.has(row.eventId)){p.removed.push(row.id);continue;}seen.add(row.eventId);
        const truth=clone(s.sources[row.eventId]);
        p.reviewed.push(row.id);
        if(!eq(p.records[row.id],truth))p.audit.push({row:row.id,source:row.eventId,before:clone(p.records[row.id]),after:clone(truth)});
        p.records[row.id]=truth;
      }
      if(s.requireReason)p.reason='source';
    }
    if(s.type==='units'){p.value=s.target;p.unit='min';}
    if(s.type==='duplicates'){const seen=new Set();for(const row of s.rows){if(seen.has(row.eventId))p.removed.push(row.id);else seen.add(row.eventId);}}
    if(s.type==='links')for(const child of s.children)p.links[child.id]=child.asset;
    if(s.type==='window')p.selected=s.expected.slice();
    if(s.type==='sources'){const src=s.sourcesList.find(x=>x.id==='current');p.selected=src.id;p.sourceId=src.id;p.value=src.value;p.audit=[{source:src.id,before:s.initial.value,after:src.value}];}
    if(s.type==='gate'){p.rules=['unique','known','nonnegative'];p.routes=gate(s,p.rules);p.tested=true;}
    return p;
  }
  function meter(s,p){
    if(s.type==='records')return{done:unique([...(p.reviewed||[]),...(p.removed||[])]).length+Number(!!(s.requireReason&&p.reason!==null)),total:s.rows.length+Number(!!s.requireReason),label:'checks completed'};
    if(s.type==='units')return{done:Number(p.value!==null)+Number(p.unit!==null),total:2,label:'value and unit'};
    if(s.type==='duplicates')return{done:p.removed?.length||0,total:s.rows.length-unique(s.rows.map(r=>r.eventId)).length,label:'copies removed'};
    if(s.type==='links')return{done:Object.values(p.links||{}).filter(x=>x!==null).length,total:s.children.length,label:'links made'};
    if(s.type==='window')return{done:p.selected?.length||0,total:s.expected.length,label:'records selected'};
    if(s.type==='sources')return{done:Number(p.sourceId!==null),total:1,label:'source applied'};
    if(s.type==='gate')return{done:p.tested?s.incoming.length:0,total:s.incoming.length,label:'records tested'};
    return{done:0,total:1,label:'records'};
  }
  function render(s,p,u){
    const e=u.esc,I=u.icon,unit=x=>x==='jobs'?u.world.jobPlural:x;
    const btn=(action,id,label,body,selected=false,cls='')=>'<button class="sg-choice '+(selected?'selected ':'')+cls+'" data-skill-action="'+action+'" data-id="'+e(id)+'" data-focus="di-'+action+'-'+e(id)+'" aria-label="'+e(label)+'" aria-pressed="'+selected+'">'+body+'</button>';
    const detail=row=>'<div class="sg-chips"><span class="sg-chip">'+e(row.eventId)+'</span><span class="sg-chip">'+I(u.world.icon)+' '+e(row.asset)+'</span></div><strong class="sg-big-number">'+e(valueLabel(row.value))+'</strong><span class="sg-unit">'+e(unit(row.unit))+'</span>';
    let html='';
    if(s.type==='records'){
      html='<div class="sg-stack">'+s.rows.map(row=>{
        const removed=p.removed.includes(row.id),reviewed=(p.reviewed||[]).includes(row.id),truth=s.sources[row.eventId],actual=p.records[row.id];
        return'<div class="sg-compare"><div class="sg-source-card"><span class="sg-label">SOURCE</span>'+detail(truth)+'</div><div class="sg-record-card '+(removed?'muted':'')+'"><span class="sg-label">'+(removed?'REMOVED':'RECORD')+'</span>'+detail(actual)+'<div class="sg-choice-row">'+(!removed?btn('copy',row.id,reviewed?'Record '+row.eventId+' reviewed':'Copy source to record '+row.id,I(reviewed?'check':'arrow')+(reviewed?'Reviewed':'Match source'),reviewed,'sg-action'):'')+(s.allowRemove?btn('remove',row.id,(removed?'Restore':'Remove')+' copy '+row.id,I(removed?'undo':'close')+(removed?'Restore':'Remove'),removed):'')+'</div></div></div>';
      }).join('')+'</div>';
      if(s.requireReason)html+='<div class="sg-panel"><span class="sg-label">CORRECTION REASON</span><div class="sg-choice-row">'+s.reasons.map(x=>btn('reason',x.id,x.label,e(x.label),p.reason===x.id)).join('')+'</div></div>';
      if(s.requireAudit)html+='<section class="sg-panel"><span class="sg-label">CORRECTION TRAIL</span><div class="sg-audit">'+(p.audit.length?p.audit.map(a=>'<div>'+I('file')+'<strong>'+e(a.source)+'</strong><span>'+e(valueLabel(a.before.value))+' → '+e(valueLabel(a.after.value))+'</span><small>'+e(a.before.asset)+' → '+e(a.after.asset)+'</small></div>').join(''):'<span class="sg-empty">Your verified changes appear here.</span>')+'</div></section>';
    }
    if(s.type==='units')html='<div class="sg-compare"><div class="sg-source-card"><span class="sg-label">SOURCE</span><strong class="sg-big-number">'+s.hours+'</strong><span class="sg-unit">hours</span></div><div class="sg-record-card"><span class="sg-label">RECORD</span><strong class="sg-big-number">'+(p.value===null?'?':p.value)+'</strong><span class="sg-unit">'+(p.unit||'?')+'</span></div></div><div class="sg-choice-row">'+s.options.map(n=>btn('number',n,'Set value '+n,'<strong>'+n+'</strong>',p.value===n)).join('')+'</div><div class="sg-choice-row">'+['h','min'].map(x=>btn('unit',x,'Set unit '+x,I('clock')+x,p.unit===x)).join('')+'</div>';
    if(s.type==='duplicates')html='<div class="sg-card-grid">'+s.rows.map(row=>'<section class="sg-panel '+(p.removed.includes(row.id)?'muted':'')+'"><div class="sg-panel-title">'+I('file')+'<strong>'+e(row.eventId)+'</strong></div><div class="sg-chips"><span class="sg-chip">'+I(u.world.icon)+' '+row.asset+'</span><span class="sg-chip">'+row.time+'</span></div><div class="sg-row"><strong class="sg-big-number">'+row.value+'</strong><span>'+e(u.world.jobPlural)+'</span></div>'+btn('remove',row.id,(p.removed.includes(row.id)?'Restore':'Remove')+' record '+row.id,I(p.removed.includes(row.id)?'undo':'close')+(p.removed.includes(row.id)?'Restore':'Remove duplicate'),p.removed.includes(row.id))+'</section>').join('')+'</div>';
    if(s.type==='links')html='<div class="sg-two-column"><section class="sg-panel"><span class="sg-label">JOBS · SELECT ONE</span><div class="sg-stack">'+s.children.map(c=>'<button class="sg-card '+(p.selected===c.id?'selected':'')+'" data-skill-action="job" data-id="'+c.id+'" data-focus="di-job-'+c.id+'" aria-label="Job '+e(c.job)+', source asset '+c.asset+'" aria-pressed="'+(p.selected===c.id)+'">'+I('file')+'<strong>'+e(c.job)+'</strong><span class="sg-card-meta">Source: '+e(u.world.assetSingular)+' '+c.asset+'</span><span class="sg-chip">'+I('link')+' '+(p.links[c.id]||'?')+'</span></button>').join('')+'</div></section><section class="sg-panel"><span class="sg-label">'+e(u.world.assetPlural.toUpperCase())+' · LINK ONE</span><div class="sg-card-grid">'+s.parents.map(x=>'<button class="sg-card" data-skill-action="parent" data-id="'+x.id+'" data-focus="di-parent-'+x.id+'" aria-label="Link to '+e(u.world.assetSingular)+' '+x.id+'"><span class="sg-card-icon">'+u.asset()+'</span><strong>'+x.id+'</strong></button>').join('')+'</div></section></div>';
    if(s.type==='window'){
      const selected=s.rows.filter(x=>p.selected.includes(x.id)),sum=selected.reduce((a,x)=>a+x.value,0);
      html='<div class="sg-chips"><span class="sg-chip">'+I('calendar')+'Day '+s.day+'</span><span class="sg-chip">Manifest: '+s.expected.length+' records · '+s.total+' '+e(u.world.jobPlural)+'</span></div><div class="sg-card-grid">'+s.rows.map(x=>'<button class="sg-card '+(p.selected.includes(x.id)?'selected':'')+'" data-skill-action="row" data-id="'+x.id+'" data-focus="di-row-'+x.id+'" aria-label="'+e(x.eventId)+', day '+x.day+', '+x.value+' '+e(u.world.jobPlural)+'" aria-pressed="'+p.selected.includes(x.id)+'"><span class="sg-chip">Day '+x.day+'</span><strong>'+e(x.eventId)+'</strong><span class="sg-card-value">'+x.value+'</span></button>').join('')+'</div><div class="sg-equation"><span>'+selected.length+' records</span>'+I('arrow')+'<strong>'+sum+'</strong><span>'+e(u.world.jobPlural)+'</span></div>';
    }
    if(s.type==='sources')html='<div class="sg-card-grid">'+s.sourcesList.map(src=>'<button class="sg-card '+(p.selected===src.id?'selected':'')+'" data-skill-action="source" data-id="'+src.id+'" data-focus="di-source-'+src.id+'" aria-label="Revision '+src.rev+', '+src.status+', '+src.value+'" aria-pressed="'+(p.selected===src.id)+'">'+I('file')+'<strong>Revision '+src.rev+'</strong><span class="sg-chip '+(src.status==='Approved'?'good':src.status==='Draft'?'warn':'')+'">'+src.status+'</span><span class="sg-card-value">'+src.value+'</span></button>').join('')+'</div><div class="sg-equation"><span>Record</span><strong>'+p.value+'</strong>'+btn('apply-source','apply','Update from selected source',I('arrow')+'Update record')+'</div>';
    if(s.type==='gate')html='<div class="sg-chips"><span class="sg-chip">Known '+e(u.world.assetPlural)+': 01 · 02</span></div><div class="sg-choice-row">'+s.rules.map(rule=>btn('rule',rule.id,rule.label,I(rule.icon)+e(rule.label),p.rules.includes(rule.id))).join('')+'</div><div class="sg-board-scroll"><table class="sg-table"><thead><tr><th>Event</th><th>'+e(u.world.assetSingular)+'</th><th>Count</th><th>Gate</th></tr></thead><tbody>'+s.incoming.map(x=>'<tr><td>'+e(x.eventId)+'</td><td>'+x.asset+'</td><td>'+x.value+'</td><td><span class="sg-chip '+(p.routes[x.id]==='keep'?'good':p.routes[x.id]==='hold'?'warn':'')+'">'+(p.routes[x.id]||'Waiting')+'</span></td></tr>').join('')+'</tbody></table></div><div class="sg-choice-row">'+btn('run-gate','run','Test incoming records',I('play')+'Test incoming')+'</div>';
    return'<section class="sg-workbench" aria-label="Data integrity workbench"><div class="sg-chips"><span class="sg-chip">'+I(u.world.icon)+' '+e(u.world.label)+'</span><span class="sg-chip">'+I('shield')+'Evidence desk</span></div>'+html+'</section>';
  }
  const pack={id:'integrity',name:'Data Integrity',icon:'shield',levels,make,render,act,check,solve,meter};
  (root.FM_GAME_PACKS ||= {}).integrity=pack;
  if(typeof module!=='undefined'&&module.exports)module.exports=pack;
})(typeof window!=='undefined'?window:globalThis);
