(function(root){
  'use strict';
  const levels=[
    {id:1,title:'Six, then four',kind:'waves',chapter:'Pick your aircraft'},
    {id:2,title:'Back in action',kind:'waves',chapter:'Pick your aircraft'},
    {id:3,title:'A bigger day',kind:'waves',chapter:'Pick your aircraft'},
    {id:4,title:'Two are down',kind:'waves',chapter:'Pick your aircraft'},
    {id:5,title:'For this pilot',kind:'waves',chapter:'Pick your aircraft'},
    {id:6,title:'First inspection',kind:'board',chapter:'Build your checkerboard'},
    {id:7,title:'Keep them flying',kind:'board',chapter:'Build your checkerboard'},
    {id:8,title:'Paint, then wait',kind:'board',chapter:'Work and recovery'},
    {id:9,title:'Two upgrades',kind:'board',chapter:'Work and recovery'},
    {id:10,title:'Ready for Monday',kind:'board',chapter:'Work and recovery'},
    {id:11,title:'A busy week',kind:'board',chapter:'Put it together'},
    {id:12,title:'Your checkerboard',kind:'board',chapter:'Put it together'},
    {id:13,title:'Change of plans',kind:'board',chapter:'Put it together'}
  ];
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
  const unique=a=>[...new Set(a)];
  const seedRandom=seed=>{let a=Number(seed)>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const shuffle=(r,list)=>{const a=list.slice();for(let i=a.length-1;i>0;i--){const j=int(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
  const dayName=(s,d)=>s.days?.[d]?.label||'Day '+(d+1);
  const dayKey=(p,d)=>p+'|'+d;
  const nextWorkday=(s,d)=>{for(let i=d+1;i<s.days.length;i++)if(!s.days[i].weekend)return i;return null;};
  const days=n=>Array.from({length:n},(_,i)=>({id:['mon','tue','wed','thu','fri','sat','sun'][i%7]+'-'+Math.floor(i/7),label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i%7],weekend:i%7>4,week:Math.floor(i/7)+1}));

  function checkWave(s,waveId,selectedIds){
    const wave=s.waves?.find(w=>w.id===waveId);
    if(!wave)return{ok:false,message:'Choose a flight wave.',badIds:[],missingIds:[]};
    if(!Array.isArray(selectedIds))return{ok:false,message:'Pick aircraft for this wave.',badIds:[],missingIds:[]};
    const known=new Set(s.planes.map(p=>p.id)),badUnknown=unique(selectedIds.filter(x=>!known.has(x)));
    if(badUnknown.length)return{ok:false,message:'That aircraft is not on this board.',badIds:badUnknown,missingIds:[]};
    const duplicates=unique(selectedIds.filter((x,i)=>selectedIds.indexOf(x)!==i));
    if(duplicates.length)return{ok:false,message:'Each aircraft can fly once in this wave.',badIds:duplicates,missingIds:[]};
    const bad=selectedIds.filter(x=>(wave.blocked||[]).includes(x));
    if(bad.length)return{ok:false,message:'Aircraft '+bad.join(', ')+' cannot fly now.',badIds:bad,missingIds:[]};
    const required=unique([...(wave.required||[]),...(wave.pilots||[]).map(p=>p.plane)]),missing=required.filter(x=>!selectedIds.includes(x));
    if(missing.length){const pilot=(wave.pilots||[]).find(p=>missing.includes(p.plane));return{ok:false,message:pilot?pilot.name+' needs aircraft '+pilot.plane+'.':'Include aircraft '+missing.join(', ')+'.',badIds:[],missingIds:missing};}
    if(selectedIds.length!==wave.count)return{ok:false,message:'Pick '+wave.count+' aircraft. You have '+selectedIds.length+'.',badIds:[],missingIds:[]};
    return{ok:true,message:wave.count+' ready to fly.',badIds:[],missingIds:[]};
  }

  function timeline(s,placements){
    const cells={},errors=[],release={},taskDays={},plannedGround=new Set(),workKeys=new Set(),cureKeys=new Set();
    const source=placements&&typeof placements==='object'&&!Array.isArray(placements)?placements:{};
    const knownPlanes=new Set((s.planes||[]).map(p=>p.id));
    const n=s.days?.length||0;
    const addError=(taskId,message,cell)=>{if(!errors.some(e=>e.taskId===taskId&&e.message===message&&e.cell===cell))errors.push({taskId,message,...(cell?{cell}:{} )});};
    (s.blockedCells||[]).forEach(b=>{if(knownPlanes.has(b.plane)&&Number.isInteger(b.day)&&b.day>=0&&b.day<n)cells[dayKey(b.plane,b.day)]={kind:'blocked',label:b.reason||'Unavailable',taskIds:[],external:true};});
    const records=[];
    Object.keys(source).filter(k=>!(s.tasks||[]).some(t=>t.id===k)).forEach(k=>addError(k,'Unknown work tile.'));
    for(const t of s.tasks||[]){
      if(!own(source,t.id)||source[t.id]===null||source[t.id]==='')continue;
      const start=source[t.id];
      if(!Number.isInteger(start)||start<0||start>=n){addError(t.id,'Place '+t.label+' on a day.');continue;}
      if(s.days[start].weekend){addError(t.id,'No active work on '+dayName(s,start)+'.',dayKey(t.plane,start));continue;}
      const active=[];
      for(let d=start;d<n&&active.length<t.workDays;d++)if(!s.days[d].weekend)active.push(d);
      if(active.length!==t.workDays){addError(t.id,t.label+' needs '+t.workDays+' workdays.');continue;}
      const end=active[active.length-1];
      if(start<t.window[0]||end>t.window[1])addError(t.id,t.label+' must fit '+dayName(s,t.window[0])+'–'+dayName(s,t.window[1])+'.',dayKey(t.plane,start));
      const rec={task:t,start,end,active};records.push(rec);taskDays[t.id]=active.slice();
      for(let d=start;d<=end;d++){
        const key=dayKey(t.plane,d),isWork=active.includes(d),existing=cells[key];plannedGround.add(key);if(isWork)workKeys.add(key);
        if(existing&&((existing.external&&isWork)||existing.taskIds.length)){
          addError(t.id,'Aircraft '+t.plane+' is already busy on '+dayName(s,d)+'.',key);
          cells[key]={kind:'blocked',label:'Clash',taskIds:unique([...(existing.taskIds||[]),t.id]),conflict:true,external:!!existing.external};
        }else if(existing?.external){cells[key]={...existing,taskIds:[t.id]};}
        else cells[key]={kind:isWork?t.kind:'blocked',label:isWork?t.short:'Work paused',taskIds:[t.id],waiting:!isWork};
      }
    }
    const groups=[];
    for(const plane of s.planes||[]){
      const recs=records.filter(r=>r.task.plane===plane.id).sort((a,b)=>a.start-b.start||a.task.id.localeCompare(b.task.id));
      for(const rec of recs){
        const previous=groups[groups.length-1],last=previous?.[previous.length-1];
        const compatible=last&&last.task.plane===rec.task.plane&&last.task.sharedHold&&last.task.sharedHold===rec.task.sharedHold&&last.task.holdHours===rec.task.holdHours&&['modA','modB'].includes(last.task.kind)&&['modA','modB'].includes(rec.task.kind)&&nextWorkday(s,last.end)===rec.start;
        if(compatible)previous.push(rec);else groups.push([rec]);
      }
    }
    for(const group of groups){
      const first=group[0],last=group[group.length-1],holdHours=last.task.holdHours||0;
      const holdCount=Math.ceil(holdHours/24),ids=group.map(r=>r.task.id);
      if(group.length>1){
        for(let d=first.start;d<=last.end;d++){
          const key=dayKey(last.task.plane,d);plannedGround.add(key);
          if(!cells[key])cells[key]={kind:'blocked',label:'Between mods',taskIds:ids.slice(),waiting:true};
          else if(cells[key].external&&!(cells[key].taskIds||[]).length)cells[key]={...cells[key],taskIds:ids.slice(),waiting:true};
        }
      }
      for(const rec of group)release[rec.task.id]=last.end+holdCount+1;
      if(holdCount&&last.end+holdCount>=n)addError(last.task.id,'The cure runs beyond this board.');
      for(let offset=1;offset<=holdCount&&last.end+offset<n;offset++){
        const d=last.end+offset,key=dayKey(last.task.plane,d),existing=cells[key];plannedGround.add(key);cureKeys.add(key);
        if(existing?.taskIds?.length){addError(last.task.id,'Aircraft '+last.task.plane+' is curing on '+dayName(s,d)+'.',key);cells[key]={kind:'blocked',label:'Cure clash',taskIds:unique([...existing.taskIds,...ids]),conflict:true};}
        else if(existing?.external)cells[key]={...existing,taskIds:ids.slice(),curing:true};
        else cells[key]={kind:'cure',label:holdHours+'h cure',taskIds:ids.slice()};
      }
    }
    return{cells,errors,release,taskDays,workDaysUsed:workKeys.size,holdDaysUsed:cureKeys.size,groundDays:plannedGround.size};
  }

  function available(s,state,day){
    if(!Number.isInteger(day)||day<0||day>=(s.days?.length||0))return[];
    const t=timeline(s,state?.placements||{});
    return s.planes.filter(p=>!t.cells[dayKey(p.id,day)]).map(p=>p.id);
  }

  function checkBoard(s,state){
    const st=state&&typeof state==='object'?state:{},placements=st.placements||{},flights=st.flights||{};
    const tl=timeline(s,placements),tasksMissing=(s.tasks||[]).filter(t=>!own(placements,t.id)||placements[t.id]===null||placements[t.id]==='').map(t=>t.id);
    const errors=tl.errors.map(e=>e.message),badCells=tl.errors.map(e=>e.cell).filter(Boolean),checks=[];
    if(tasksMissing.length)errors.unshift('Place '+tasksMissing.length+' work tile'+(tasksMissing.length===1?'':'s')+'.');
    const budgetOK=s.maxGroundDays==null||tl.groundDays<=s.maxGroundDays;
    if(!budgetOK)errors.push('Grounded '+tl.groundDays+' days. Your limit is '+s.maxGroundDays+'.');
    const workOK=!tasksMissing.length&&!tl.errors.length&&budgetOK;
    checks.push({id:'work',label:'Work fits',ok:workOK});
    let count=0,target=0,flightOK=true;
    for(const key of Object.keys(flights)){if(!/^(0|[1-9]\d*)$/.test(key)||Number(key)<0||Number(key)>=s.days.length){errors.push('Choose a day on this board.');flightOK=false;}}
    for(let day=0;day<s.days.length;day++){
      const goal=(s.flightGoals||[]).find(g=>g.day===day)||{day,am:0,pm:0};
      const blocked=s.planes.filter(p=>tl.cells[dayKey(p.id,day)]).map(p=>p.id);
      for(const wave of ['am','pm']){
        const assigned=own(flights[day]||{},wave)?flights[day][wave]:[];
        const expected=goal[wave]||0;
        target+=expected;if(Array.isArray(assigned))count+=assigned.length;
        const required=goal[wave==='am'?'requiredAM':'requiredPM']||[];
        const pilots=(goal.pilots||[]).filter(p=>(p.wave||'am')===wave);
        const check=checkWave({planes:s.planes,waves:[{id:wave,count:expected,required,blocked,pilots}]},wave,assigned);
        checks.push({id:day+'-'+wave,label:dayName(s,day)+' '+wave.toUpperCase(),ok:check.ok});
        if(!check.ok){flightOK=false;errors.push(dayName(s,day)+' '+wave.toUpperCase()+': '+check.message);for(const p of [...check.badIds,...check.missingIds])badCells.push(dayKey(p,day));}
      }
    }
    const cleanErrors=unique(errors);
    return{ok:cleanErrors.length===0,message:cleanErrors[0]||'All work. All flights. Ready.',errors:cleanErrors,badCells:unique(badCells),tasksMissing,workOK,flightOK,score:{flights:count,target,groundDays:tl.groundDays,workDays:tl.workDaysUsed,cureDays:tl.holdDaysUsed,groundTarget:s.maxGroundDays??null},checks};
  }

  const wave=(id,count,required=[],blocked=[],pilots=[])=>({id,label:id==='am'?'First wave':'Second wave',count,required,blocked,pilots});
  const inspection=(id,plane,workDays,window)=>({id,label:'Inspect '+plane,short:'INSP',plane,kind:'inspection',workDays,window});
  const modification=(id,plane,kind,workDays,window,sharedHold)=>({id,label:(kind==='modA'?'Mod A · ':'Mod B · ')+plane,short:kind==='modA'?'MOD A':'MOD B',plane,kind,workDays,holdHours:24,window,...(sharedHold?{sharedHold}:{})});
  const goal=(day,am,pm,extra={})=>({day,am,pm,...extra});
  function chosen(r,eligible,required,count){const req=unique(required);return [...req,...shuffle(r,eligible.filter(x=>!req.includes(x))).slice(0,count-req.length)];}
  function boardModel(s,placements,r){
    const state={placements:{...placements},flights:{}};
    for(const g of s.flightGoals){const ready=available(s,state,g.day);state.flights[g.day]={};for(const w of ['am','pm']){const req=[...(g[w==='am'?'requiredAM':'requiredPM']||[]),...(g.pilots||[]).filter(p=>(p.wave||'am')===w).map(p=>p.plane)];state.flights[g.day][w]=chosen(r,ready,req,g[w]||0);}}
    return state;
  }

  function make(levelId,seed=1){
    const meta=levels.find(l=>l.id===Number(levelId));if(!meta)throw new Error('Unknown flightline level.');
    const r=seedRandom(seed),n=meta.id<=5?(meta.id===1?6:meta.id===2?8:14):({6:4,7:6,8:4,9:5,10:5,11:6,12:8,13:8}[meta.id]);
    const planes=Array.from({length:n},(_,i)=>({id:String(i+1).padStart(2,'0'),label:String(i+1).padStart(2,'0')}));
    const roles=shuffle(r,planes.map(p=>p.id));
    const [a,b,c,d,e,f,g]=roles;
    const s={...meta,seed:Number(seed)>>>0,planes,objective:'',tip:'',reveal:''};
    let placements={};
    if(meta.id===1){s.objective='Pick 6 aircraft. Then pick 4.';s.tip='An aircraft can fly in both waves.';s.reveal='Six first. Four second. Ten flights.';s.waves=[wave('am',6),wave('pm',4)];}
    if(meta.id===2){planes.find(p=>p.id===a).idle=29;s.objective='Aircraft '+a+' has waited 29 days. Fly it first.';s.tip='The amber aircraft needs a flight today.';s.reveal='A usable aircraft can become the priority because it has waited.';s.waves=[wave('am',6,[a]),wave('pm',4)];}
    if(meta.id===3){s.objective='Fourteen aircraft. Fly 12, then 10.';s.tip='The second wave can reuse aircraft from the first.';s.reveal='Two waves can deliver more flights than the number of aircraft.';s.waves=[wave('am',12),wave('pm',10)];}
    if(meta.id===4){s.objective='Two aircraft are down. Fly 12, then 10.';s.tip='Striped aircraft are unavailable for both waves.';s.reveal='Count usable aircraft before you promise the flights.';s.waves=[wave('am',12,[],[a,b]),wave('pm',10,[],[a,b])];s.grounded=[{plane:a,reason:'Repair'},{plane:b,reason:'Waiting for parts'}];}
    if(meta.id===5){s.objective='Maya needs '+a+'. Leo needs '+b+'.';s.tip='Match each pilot’s aircraft to the correct wave.';s.reveal='The total is only part of the plan. The right aircraft matters too.';s.waves=[wave('am',12,[],[c],[{name:'Maya',plane:a}]),wave('pm',10,[],[c],[{name:'Leo',plane:b}])];s.grounded=[{plane:c,reason:'Repair'}];}
    if(meta.kind==='waves'){
      s.model={};for(const w of s.waves)s.model[w.id]=chosen(r,planes.map(p=>p.id).filter(x=>!w.blocked.includes(x)),[...w.required,...w.pilots.map(p=>p.plane)],w.count);
      return s;
    }
    s.tasks=[];s.blockedCells=[];s.flightGoals=[];
    if(meta.id===6){
      s.days=days(3);s.objective='Inspect '+a+'. Fly it on Wednesday.';s.tip='Pick the inspection tile. Put it on a free day.';s.reveal='Work occupies a cell. Flights need a free cell.';
      s.tasks=[inspection('inspect',a,1,[0,1])];placements={inspect:int(r,0,1)};
      s.flightGoals=[goal(2,3,2,{requiredAM:[a]})];
    }
    if(meta.id===7){
      s.days=days(5);s.objective='Two inspections. Keep the week flying.';s.tip='Move work into the gaps between flying commitments.';s.reveal='A workable week leaves enough aircraft available every day.';
      s.tasks=[inspection('inspect-a',a,1,[0,2]),inspection('inspect-b',b,1,[1,3])];placements={'inspect-a':0,'inspect-b':2};
      s.flightGoals=Array.from({length:5},(_,day)=>goal(day,4,3,day===3?{requiredAM:[a]}:day===4?{requiredPM:[b]}:{}));
    }
    if(meta.id===8){
      s.days=days(5);s.objective='Modify '+a+'. Have it ready for Wednesday.';s.tip='Cure starts after work. The next day is still grounded.';s.reveal='Work Monday, cure Tuesday, fly Wednesday: allow the whole 24 hours.';
      s.tasks=[modification('mod-a',a,'modA',1,[0,2])];placements={'mod-a':0};
      s.flightGoals=[goal(0,2,2),goal(1,2,2),goal(2,3,2,{requiredAM:[a]}),goal(4,3,2)];
    }
    if(meta.id===9){
      s.days=days(8);s.objective='Two upgrades. Ground '+a+' for no more than 5 days.';s.tip='Move either tile. Watch the total grounded days.';s.reveal='Back-to-back compatible mods share one cure. Five grounded days instead of six.';s.maxGroundDays=5;
      s.tasks=[modification('mod-a',a,'modA',2,[0,4],'shared-finish'),modification('mod-b',a,'modB',2,[0,4],'shared-finish')];placements={'mod-a':0,'mod-b':2};
      s.flightGoals=Array.from({length:5},(_,day)=>goal(day,3,2));s.flightGoals.push(goal(7,4,3,{requiredAM:[a]}));
    }
    if(meta.id===10){
      s.days=days(8);s.objective='Start Tuesday. Two upgrades. Fly everyone Monday.';s.tip='Gray days stop active work. The cure clock keeps running.';s.reveal='Work Tuesday–Friday, cure Saturday, and keep Monday clear for flying.';s.maxGroundDays=5;
      s.tasks=[modification('mod-a',a,'modA',2,[1,4],'shared-finish'),modification('mod-b',a,'modB',2,[1,4],'shared-finish')];placements={'mod-a':1,'mod-b':3};
      s.flightGoals=[goal(0,4,3),goal(4,3,2),goal(7,5,4)];
    }
    if(meta.id===11){
      s.days=days(7);planes.find(p=>p.id===d).idle=30;s.objective='One busy week. Keep every promise.';s.tip='Check work, the outage, the waiting aircraft, and the pilot tags.';s.reveal='A checkerboard makes competing commitments visible in one place.';
      s.tasks=[modification('mod-a',a,'modA',1,[0,2]),inspection('inspect',b,1,[1,3])];placements={'mod-a':0,inspect:2};
      s.blockedCells=[{plane:c,day:1,reason:'Parts'},{plane:c,day:2,reason:'Parts'}];
      s.flightGoals=Array.from({length:5},(_,day)=>goal(day,4,3,day===0?{requiredAM:[d]}:day===2?{pilots:[{name:'Maya',plane:e,wave:'pm'}]}:day===4?{pilots:[{name:'Leo',plane:a,wave:'am'}]}:{}));
    }
    if(meta.id===12||meta.id===13){
      s.days=days(14);planes.find(p=>p.id===e).idle=29;
      s.objective=meta.id===12?'Build your two-week checkerboard.':'A new outage. Extra flights. Save the plan.';
      s.tip=meta.id===12?'Place the work. Keep room for every flight.':'Check the new Tuesday outage and Thursday’s extra flight.';
      s.reveal=meta.id===12?'You built the whole plan: flights, work, curing, people, and availability.':'A strong plan can change without losing the commitments.';
      s.maxGroundDays=8;
      s.tasks=[modification('mod-a',a,'modA',2,[0,4],'shared-finish'),modification('mod-b',a,'modB',2,[0,4],'shared-finish'),inspection('inspect-a',b,1,[0,4]),inspection('inspect-b',c,2,[7,11])];
      placements={'mod-a':0,'mod-b':2,'inspect-a':1,'inspect-b':7};
      s.blockedCells=[2,3,4].map(day=>({plane:d,day,reason:'Parts'}));
      s.flightGoals=s.days.map((x,day)=>x.weekend?null:goal(day,6,5,day===0?{requiredAM:[e]}:day===4?{pilots:[{name:'Maya',plane:f,wave:'pm'}]}:day===7?{pilots:[{name:'Leo',plane:a,wave:'am'}]}:{})).filter(Boolean);
      if(meta.id===13){
        s.blockedCells.push({plane:f,day:8,reason:'New outage'});
        const extra=s.flightGoals.find(x=>x.day===10);extra.am=7;extra.pm=6;extra.pilots=[{name:'Ari',plane:g,wave:'pm'}];
        s.change={plane:f,day:8,label:'New outage',addedDay:10,extraAM:1,extraPM:1};
      }
    }
    s.model=boardModel(s,placements,r);
    return s;
  }
  const api={levels,make,checkWave,timeline,available,checkBoard};
  if(root)root.FLIGHT_GAME=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this);
