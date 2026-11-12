(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const rand=seed=>{let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
  const shuffle=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const levels=[
    {id:1,title:'One useful key',chapter:'Open the right door'},
    {id:2,title:'Too many keys',chapter:'Open the right door'},
    {id:3,title:'The right room',chapter:'Open the right door'},
    {id:4,title:'A temporary pass',chapter:'Keep access current'},
    {id:5,title:'Close the account',chapter:'Keep access current'},
    {id:6,title:'Same name, different person',chapter:'Keep access current'},
    {id:7,title:'Find the broken link',chapter:'Keep the system running'},
    {id:8,title:'Change it safely',chapter:'Keep the system running'},
    {id:9,title:'Bring it back',chapter:'Keep the system running'},
    {id:10,title:'Open the service',chapter:'Put it together'}
  ];
  const keyNames={read:'View',edit:'Edit',admin:'Admin'};
  const keys=['read','edit','admin'];
  const steps=[
    {id:'backup',label:'Save a backup',icon:'database'},
    {id:'test',label:'Test a copy',icon:'inspect'},
    {id:'apply',label:'Apply change',icon:'wrench'},
    {id:'verify',label:'Verify result',icon:'check'}
  ];
  const orderedSteps=steps.map(x=>x.id);
  function make(levelId,seed=1,revision=2){
    const meta=levels.find(l=>l.id===Number(levelId));if(!meta)throw Error('Unknown database level.');
    const r=rand(seed),name=shuffle(r,['Maya','Leo','Ari','Jules','Sam','Noa']),n=20+Math.floor(r()*30),ticket='U-'+(100+Math.floor(r()*800));
    const s={...meta,seed:Number(seed)>>>0,revision:revision<2?1:2,prompt:'Give the right key.',hint:'Give only the keys needed for the task.',reveal:'Useful access is specific: the right person, task, and scope.',checkLabel:'Open access',type:'permissions',actors:[],scopes:['Schedule','Records','Reports'],keyOrder:shuffle(r,keys),initial:{grants:{},scopes:{}}};
    const actor=(id,label,task,scope,required)=>({id,label,task,scope,required});
    if(meta.id===1){s.actors=[actor('a',name[0],'View the schedule','Schedule',['read'])];s.initial.scopes.a='Schedule';s.initial.grants.a=[];}
    if(meta.id===2){s.prompt='Take back the spare key.';s.actors=[actor('a',name[0],'Update records','Records',['read','edit'])];s.initial.scopes.a='Records';s.initial.grants.a=keys.slice();s.reveal='Editing records does not require control of the whole system.';}
    if(meta.id===3){s.prompt='Give keys to the right rooms.';s.actors=[actor('a',name[0],'View the schedule','Schedule',['read']),actor('b',name[1],'Update records','Records',['read','edit'])];s.initial={grants:{a:[],b:[]},scopes:{a:null,b:null}};s.chooseScope=true;s.hint='Match each task to its room, then choose only its necessary keys.';s.reveal='A permission needs a scope. The same key should not open every room.';}
    if(meta.id===4){s.type='lifecycle';s.prompt='Check the temporary passes.';s.today=n+4;s.actors=[{id:'a',label:name[0],until:n+3,task:'Temporary cover',active:true,want:false},{id:'b',label:name[1],until:n+7,task:'Temporary cover',active:true,want:true}];s.initial={active:{a:true,b:true}};s.hint='A pass is valid through its stated end day, inclusive.';s.reveal='Temporary access ends when its approved time ends.';s.checkLabel='Verify access';}
    if(meta.id===5){s.type='lifecycle';s.prompt='Close the finished account.';s.today=n;s.actors=[{id:'a',label:name[0],task:'Left the team',status:'Left',want:false},{id:'b',label:name[1],task:'Still on the team',status:'Active',want:true},{id:'c',label:name[2],task:'Still on the team',status:'Active',want:true}];s.initial={active:{a:true,b:true,c:true}};s.hint='Remove the departing person’s access. Keep the active team working.';s.reveal='Access follows the job lifecycle, including the end of the job.';s.checkLabel='Verify access';}
    if(meta.id===6){s.prompt='Give the named person access.';const which=r()<.5?'a':'b';s.identityTicket={id:which==='a'?ticket:ticket+'B',label:name[0],task:'View reports'};s.actors=[actor('a',name[0]+' · '+ticket,'View reports','Reports',which==='a'?['read']:[]),actor('b',name[0]+' · '+ticket+'B','View reports','Reports',which==='b'?['read']:[])];s.initial={grants:{a:[],b:[]},scopes:{a:'Reports',b:'Reports'}};s.hint='Names can match. Use the unique ID on the approved request.';s.reveal='A matching name is not enough. Match the account’s unique identity.';}
    if(meta.id===7){s.type='pipeline';s.prompt='Repair the broken connection.';s.nodes=[{id:'source',label:'Source',detail:'New records ready',icon:'box'},{id:'connection',label:'Connection',detail:'Token expired',icon:'link'},{id:'database',label:'Database',detail:'Queue paused',icon:'database'},{id:'report',label:'Report',detail:'Refresh paused',icon:'chart'}];s.broken=shuffle(r,['connection','database','report'])[0];s.initial={nodes:Object.fromEntries(s.nodes.map(x=>[x.id,x.id!==s.broken])),repairs:[]};s.hint='Follow the path. Fix the node showing the actual failure.';s.reveal='Find the failed dependency. A healthy component does not need a restart.';s.checkLabel='Run system';}
    if(meta.id===8){s.type='sequence';s.prompt='Build a safe change.';s.stepBank=shuffle(r,steps);s.initial={order:[]};s.changeLabel='Add a '+(r()<.5?'status':'due-date')+' field';s.hint='Protect today’s data, test away from live work, apply, then verify.';s.reveal='A backup protects recovery; a test reduces risk; verification checks the actual result.';s.checkLabel='Run change';}
    if(meta.id===9){s.type='recovery';s.prompt='Bring the records back.';s.snapshot=30+Math.floor(r()*50);s.pending=2+Math.floor(r()*5);s.target=s.snapshot+s.pending;s.initial={restored:false,replayed:false,verified:false,opened:false,count:0};s.hint='Restore the snapshot, replay approved changes, verify the count, then reopen.';s.reveal='Recovery is complete when the restored records are verified and the service can work.';s.checkLabel='Verify recovery';}
    if(meta.id===10&&revision<2){s.type='control';s.prompt='Get the service ready.';s.actors=[actor('a',name[0],'View the schedule','Schedule',['read']),actor('b',name[1],'Update records','Records',['read','edit'])];s.initial={grants:{a:['read','admin'],b:['read']},scopes:{a:'Schedule',b:'Records'},nodes:{source:true,connection:false,database:true},repairs:[],order:[]};s.nodes=[{id:'source',label:'Source',detail:'New records ready',icon:'box'},{id:'connection',label:'Connection',detail:'Token expired',icon:'link'},{id:'database',label:'Database',detail:'Ready',icon:'database'}];s.broken='connection';s.stepBank=shuffle(r,steps);s.changeLabel='Publish a new reporting field';s.hint='Match access to the requests, repair the failed link, and build the safe change.';s.reveal='Good administration keeps access appropriate, changes recoverable, and the service usable.';s.checkLabel='Open service';}
    else if(meta.id===10){
      s.type='control';s.prompt='Get the service ready.';
      const rooms=shuffle(r,['Schedule','Records','Reports']);
      const requests=shuffle(r,[{verb:'View',scope:rooms[0],required:['read']},{verb:'Update',scope:rooms[1],required:['read','edit']}]);
      s.actors=requests.map((q,i)=>actor(i?'b':'a',name[i],q.verb+' '+(q.scope==='Schedule'?'the schedule':q.scope.toLowerCase()),q.scope,q.required));
      const surplus=shuffle(r,['a','b'])[0];
      s.nodes=[{id:'source',label:'Source',detail:'New records ready',icon:'box'},{id:'connection',label:'Connection',detail:'Token expired',icon:'link'},{id:'database',label:'Database',detail:'Queue paused',icon:'database'},{id:'report',label:'Report',detail:'Refresh paused',icon:'chart'}];
      s.broken=shuffle(r,['connection','database','report'])[0];
      s.initial={grants:Object.fromEntries(s.actors.map(a=>[a.id,a.id===surplus?[...a.required,'admin']:a.required.slice(0,-1)])),scopes:Object.fromEntries(s.actors.map(a=>[a.id,a.scope])),nodes:Object.fromEntries(s.nodes.map(n=>[n.id,n.id!==s.broken])),repairs:[],order:[]};
      s.stepBank=shuffle(r,steps);s.changeLabel=r()<.5?'Publish a new reporting field':'Add a due-date field';s.hint='Match access to the requests, repair the failed link, and build the safe change.';s.reveal='Good administration keeps access appropriate, changes recoverable, and the service usable.';s.checkLabel='Open service';
    }
    return s;
  }
  function permissionErrors(s,p){
    const errors=[];
    if(!p.grants||typeof p.grants!=='object'||!p.scopes||typeof p.scopes!=='object')return['Choose the access keys.'];
    if(Object.keys(p.grants).some(id=>!s.actors.some(a=>a.id===id)))return['Use only the accounts shown.'];
    for(const a of s.actors){
      const selected=p.grants[a.id];
      if(!Array.isArray(selected)||selected.some(k=>!keys.includes(k))||new Set(selected).size!==selected.length){errors.push('Check the keys for '+a.label+'.');continue;}
      if(!eq(selected.slice().sort(),a.required.slice().sort()))errors.push('Give '+a.label+' only the keys needed for this task.');
      if(a.required.length&&p.scopes[a.id]!==a.scope)errors.push('Match '+a.label+' to the requested room.');
    }
    return errors;
  }
  function pipelineErrors(s,p){
    if(!p.nodes||s.nodes.some(n=>p.nodes[n.id]!==true))return['The connection is not ready yet.'];
    if(!Array.isArray(p.repairs)||!p.repairs.includes(s.broken))return['Repair the node that failed.'];
    return[];
  }
  function sequenceErrors(p){return Array.isArray(p.order)&&eq(p.order,orderedSteps)?[]:['Check the order: protect, test, change, verify.'];}
  function check(s,p){
    p=p||{};let errors=[];
    if(s.type==='permissions'||s.type==='control')errors.push(...permissionErrors(s,p));
    if(s.type==='lifecycle'){
      if(!p.active||s.actors.some(a=>typeof p.active[a.id]!=='boolean'||p.active[a.id]!==a.want))errors.push('Keep valid access. Close access that has ended.');
      if(p.active&&Object.keys(p.active).some(id=>!s.actors.some(a=>a.id===id)))errors.push('Use only the accounts shown.');
    }
    if(s.type==='pipeline'||s.type==='control')errors.push(...pipelineErrors(s,p));
    if(s.type==='sequence'||s.type==='control')errors.push(...sequenceErrors(p));
    if(s.type==='recovery'&&!(p.restored===true&&p.replayed===true&&p.verified===true&&p.opened===true&&p.count===s.target))errors.push('Restore, replay, verify, then reopen the service.');
    return{ok:!errors.length,message:errors[0]||'Access fits. The service is ready.'};
  }
  function act(s,play,event){
    const p=clone(play),a=event.action,id=String(event.id??'');
    const reject=message=>({state:p,message,error:true});
    if(a==='key'&&(s.type==='permissions'||s.type==='control')){
      const person=s.actors.find(x=>x.id===id),key=String(event.slot??'');
      if(!person||!keys.includes(key))return reject('Use a key on this board.');
      const cur=p.grants[id]||[];p.grants[id]=cur.includes(key)?cur.filter(x=>x!==key):[...cur,key];
    }else if(a==='scope'&&s.chooseScope){
      if(!s.actors.some(x=>x.id===id)||!s.scopes.includes(event.slot))return reject('Choose a room shown here.');
      p.scopes[id]=event.slot;
    }else if(a==='account'&&s.type==='lifecycle'){
      if(!s.actors.some(x=>x.id===id))return reject('Use an account shown here.');
      p.active[id]=!p.active[id];
    }else if(a==='repair'&&(s.type==='pipeline'||s.type==='control')){
      if(!s.nodes.some(x=>x.id===id))return reject('Use the connection diagram.');
      if(p.nodes[id])return{state:p,message:'That component is already healthy.'};
      if(id!==s.broken)return reject('That is not the failed component.');
      p.nodes[id]=true;p.repairs=[...new Set([...(p.repairs||[]),id])];
      return{state:p,message:'Connection restored.'};
    }else if(a==='step'&&(s.type==='sequence'||s.type==='control')){
      if(!orderedSteps.includes(id))return reject('Use a change tile shown here.');
      if(p.order.includes(id))p.order=p.order.filter(x=>x!==id);
      else p.order.push(id);
    }else if(a==='remove-step'&&(s.type==='sequence'||s.type==='control')){
      const index=Number(event.index);if(!Number.isInteger(index)||index<0||index>=p.order.length)return reject('Choose a placed step.');
      p.order.splice(index,1);
    }else if(a==='restore'&&s.type==='recovery'){
      p.restored=true;p.replayed=false;p.verified=false;p.opened=false;p.count=s.snapshot;
      return{state:p,message:'Snapshot restored: '+s.snapshot+' records.'};
    }else if(a==='replay'&&s.type==='recovery'){
      if(!p.restored)return reject('Restore the snapshot first.');
      if(p.replayed)return{state:p,message:'Approved changes are already replayed.'};
      p.replayed=true;p.verified=false;p.opened=false;p.count=s.target;
      return{state:p,message:s.pending+' approved changes replayed.'};
    }else if(a==='verify'&&s.type==='recovery'){
      if(!p.restored||!p.replayed||p.count!==s.target)return reject('The records do not yet match the expected total.');
      p.verified=true;return{state:p,message:'Count verified: '+s.target+'.'};
    }else if(a==='reopen'&&s.type==='recovery'){
      if(!p.verified)return reject('Verify the restored data before reopening.');
      p.opened=true;return{state:p,message:'Service reopened.'};
    }else return reject('Choose an action on this board.');
    return{state:p};
  }
  function solve(s){
    const p=clone(s.initial);
    if(s.type==='permissions'||s.type==='control')for(const a of s.actors){p.grants[a.id]=a.required.slice();p.scopes[a.id]=a.scope;}
    if(s.type==='lifecycle')for(const a of s.actors)p.active[a.id]=a.want;
    if(s.type==='pipeline'||s.type==='control'){for(const n of s.nodes)p.nodes[n.id]=true;p.repairs=[s.broken];}
    if(s.type==='sequence'||s.type==='control')p.order=orderedSteps.slice();
    if(s.type==='recovery')Object.assign(p,{restored:true,replayed:true,verified:true,opened:true,count:s.target});
    return p;
  }
  function meter(s,p){
    if(s.type==='permissions')return{done:s.actors.reduce((n,a)=>n+(p.grants?.[a.id]?.length||0),0),total:s.actors.reduce((n,a)=>n+a.required.length,0),label:'keys issued'};
    if(s.type==='lifecycle')return{done:s.actors.filter(a=>p.active?.[a.id]===false).length,total:s.actors.filter(a=>!a.want).length,label:'passes closed'};
    if(s.type==='pipeline')return{done:s.nodes.filter(n=>p.nodes?.[n.id]).length,total:s.nodes.length,label:'links ready'};
    if(s.type==='sequence')return{done:Array.isArray(p.order)?p.order.length:0,total:4,label:'steps placed'};
    if(s.type==='recovery')return{done:['restored','replayed','verified','opened'].filter(k=>p[k]).length,total:4,label:'recovery steps'};
    return{done:s.actors.reduce((n,a)=>n+(p.grants?.[a.id]?.length||0),0)+(p.repairs?.length||0)+(p.order?.length||0),total:s.actors.reduce((n,a)=>n+a.required.length,0)+1+4,label:'actions in place'};
  }
  function render(s,p,u){
    const e=u.esc,I=u.icon;
    const button=(action,id,label,html,cls='',extra='')=>'<button class="sg-choice '+cls+'" data-skill-action="'+action+'" data-id="'+e(id)+'" data-focus="db-'+action+'-'+e(id)+(extra.match(/data-slot="([^"]+)/)?.[1]||'')+'" aria-label="'+e(label)+'" '+extra+'>'+html+'</button>';
    function permissions(){
      return(s.identityTicket?'<div class="sg-source-card"><span class="sg-label">APPROVED REQUEST</span><strong>'+e(s.identityTicket.id)+' · '+e(s.identityTicket.label)+'</strong><span>'+e(s.identityTicket.task)+'</span></div>':'')+'<div class="sg-card-grid">'+s.actors.map(a=>'<section class="sg-panel"><div class="sg-panel-title">'+I('person')+'<strong>'+e(a.label)+'</strong></div><div class="sg-chips"><span class="sg-chip">'+e(a.task)+'</span>'+(s.chooseScope?'':'<span class="sg-chip">'+I('database')+e(a.scope)+'</span>')+'</div>'+(s.chooseScope?'<div class="sg-choice-row">'+s.scopes.map(room=>button('scope',a.id,a.label+': '+room,e(room),p.scopes[a.id]===room?'selected':'','data-slot="'+e(room)+'" aria-pressed="'+(p.scopes[a.id]===room)+'"')).join('')+'</div>':'')+'<div class="sg-key-grid sg-choice-row">'+s.keyOrder.map(k=>button('key',a.id,a.label+': '+keyNames[k],I('key')+'<span>'+keyNames[k]+'</span>',p.grants[a.id]?.includes(k)?'selected':'','data-slot="'+k+'" aria-pressed="'+!!p.grants[a.id]?.includes(k)+'"')).join('')+'</div></section>').join('')+'</div>';
    }
    function pipeline(){
      return'<div class="sg-pipeline">'+s.nodes.map(n=>'<button class="sg-step '+(p.nodes[n.id]?'done':'blocked')+'" data-skill-action="repair" data-id="'+n.id+'" data-focus="db-node-'+n.id+'" aria-label="'+e(n.label+': '+(p.nodes[n.id]?'ready':n.detail)+'. '+(p.nodes[n.id]?'Healthy':'Repair'))+'">'+I(n.icon)+'<strong>'+e(n.label)+'</strong><span class="sg-chip '+(p.nodes[n.id]?'good':'bad')+'">'+(p.nodes[n.id]?'Ready':e(n.detail))+'</span>'+(p.nodes[n.id]?I('check'):'<span class="sg-note">Tap to repair</span>')+'</button>').join('')+'</div>';
    }
    function sequence(){
      return'<div class="sg-chips"><span class="sg-chip">'+I('wrench')+e(s.changeLabel)+'</span></div><div class="sg-timeline">'+Array.from({length:4},(_,i)=>{const t=steps.find(t=>t.id===p.order[i]);return'<button class="sg-slot '+(t?'filled':'')+'" data-skill-action="remove-step" data-index="'+i+'" data-focus="db-order-'+i+'" aria-label="Step '+(i+1)+(t?': '+t.label+'. Remove':' empty')+'" '+(!t?'disabled':'')+'><small>'+String(i+1).padStart(2,'0')+'</small>'+(t?I(t.icon)+'<strong>'+e(t.label)+'</strong>':'<span>+</span>')+'</button>';}).join('')+'</div><div class="sg-choice-row">'+s.stepBank.map(t=>button('step',t.id,t.label,I(t.icon)+'<span>'+e(t.label)+'</span>',p.order.includes(t.id)?'selected':'','aria-pressed="'+p.order.includes(t.id)+'"')).join('')+'</div><p class="sg-note">Tap tiles in order. Tap a placed tile to return it.</p>';
    }
    let html='';
    if(s.type==='permissions')html=permissions();
    if(s.type==='lifecycle')html='<div class="sg-chips"><span class="sg-chip">'+I('calendar')+'Today: day '+s.today+'</span></div><div class="sg-card-grid">'+s.actors.map(a=>'<section class="sg-panel"><div class="sg-panel-title">'+I('person')+'<strong>'+e(a.label)+'</strong></div><span class="sg-chip '+(a.status==='Left'?'warn':'')+'">'+(a.until?'Valid through day '+a.until:e(a.task))+'</span><div class="sg-choice-row">'+button('account',a.id,a.label+': '+(p.active[a.id]?'active, close access':'closed, restore access'),I(p.active[a.id]?'key':'lock')+'<span>'+(p.active[a.id]?'Active':'Closed')+'</span>',p.active[a.id]?'selected':'','aria-pressed="'+p.active[a.id]+'"')+'</div></section>').join('')+'</div>';
    if(s.type==='pipeline')html=pipeline();
    if(s.type==='sequence')html=sequence();
    if(s.type==='recovery')html='<div class="sg-three-column"><div class="sg-source-card"><span class="sg-label">SNAPSHOT</span><strong class="sg-big-number">'+s.snapshot+'</strong><span>records</span></div><div class="sg-source-card"><span class="sg-label">APPROVED CHANGES</span><strong class="sg-big-number">+'+s.pending+'</strong><span>records</span></div><div class="sg-record-card"><span class="sg-label">LIVE DATABASE</span><strong class="sg-big-number">'+p.count+'</strong><span class="sg-chip '+(p.opened?'good':'warn')+'">'+(p.opened?'Open':p.verified?'Verified':'Closed')+'</span></div></div><div class="sg-pipeline">'+[{id:'restore',label:'Restore snapshot',icon:'database',done:p.restored},{id:'replay',label:'Replay changes',icon:'refresh',done:p.replayed},{id:'verify',label:'Verify count',icon:'inspect',done:p.verified},{id:'reopen',label:'Reopen service',icon:'key',done:p.opened}].map(t=>'<button class="sg-step '+(t.done?'done':'')+'" data-skill-action="'+t.id+'" data-id="'+t.id+'" data-focus="db-recovery-'+t.id+'" aria-label="'+t.label+'">'+I(t.done?'check':t.icon)+'<strong>'+t.label+'</strong></button>').join('')+'</div>';
    if(s.type==='control')html='<div class="sg-stack"><section><span class="sg-label">ACCESS</span>'+permissions()+'</section><section><span class="sg-label">CONNECTION</span>'+pipeline()+'</section><section><span class="sg-label">CHANGE</span>'+sequence()+'</section></div>';
    return'<section class="sg-workbench" aria-label="Database management workbench"><div class="sg-chips"><span class="sg-chip">'+I(u.world.icon)+' '+e(u.world.label)+'</span><span class="sg-chip">'+I('database')+'Service console</span></div>'+html+'</section>';
  }
  const pack={id:'database',name:'Database Management',icon:'database',levels,make,render,act,check,solve,meter};
  (root.FM_GAME_PACKS ||= {}).database=pack;
  if(typeof module!=='undefined'&&module.exports)module.exports=pack;
})(typeof window!=='undefined'?window:globalThis);
