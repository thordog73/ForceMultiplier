(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const own=(x,k)=>Object.prototype.hasOwnProperty.call(x||{},k);
  const rng=seed=>{let x=Number(seed)>>>0;return()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};};
  const between=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const shuffle=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=between(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
  const eqSet=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));
  const levels=[
    {id:1,title:'Right record',chapter:'Match the work'},
    {id:2,title:'Does it apply?',chapter:'Match the work'},
    {id:3,title:'Current copy',chapter:'Match the work'},
    {id:4,title:'Next due',chapter:'Keep ahead'},
    {id:5,title:'Whichever comes first',chapter:'Keep ahead'},
    {id:6,title:'Ready to work',chapter:'Build the trail'},
    {id:7,title:'Unlock the work',chapter:'Build the trail'},
    {id:8,title:'Prove it happened',chapter:'Build the trail'},
    {id:9,title:'Repair the register',chapter:'Put it together'},
    {id:10,title:'One complete pack',chapter:'Put it together'}
  ];
  const stages=[
    {id:'rule',label:'Check requirement',icon:'file',needs:[]},
    {id:'match',label:'Match asset',icon:'link',needs:['rule']},
    {id:'parts',label:'Prepare parts',icon:'box',needs:['match']},
    {id:'plan',label:'Book a slot',icon:'calendar',needs:['match']},
    {id:'work',label:'Complete work',icon:'wrench',needs:['parts','plan']},
    {id:'verify',label:'Verify result',icon:'check',needs:['work']}
  ];
  function make(levelId,seed=1){
    const meta=levels.find(x=>x.id===Number(levelId));if(!meta)throw Error('Unknown Documentation level.');
    const r=rng(seed),target=String(between(r,11,79)),family=between(r,0,1)?'A':'B',other=family==='A'?'B':'A';
    const rev=between(r,2,6),job='J-'+between(r,100,799),req='R-'+between(r,100,899);
    const s={...meta,seed:Number(seed)>>>0,target,family,rev,job,req,checkLabel:'File it'};
    if(s.id===1){
      Object.assign(s,{prompt:'Attach the requirement.',hint:'Match the asset number on the requirement.',reveal:'A useful requirement is attached to the right asset.',assets:shuffle(r,[target,String(+target+1),String(+target+2)]),initial:{assignment:null}});
    }else if(s.id===2){
      const start=between(r,30,60),end=start+9;
      Object.assign(s,{prompt:'Tag every matching asset.',hint:'Both the family and the serial range must match.',reveal:'Applicability depends on the whole rule, not one matching detail.',serialRange:[start,end],assets:shuffle(r,[
        {id:'a',number:target,family,serial:start+2},
        {id:'b',number:String(+target+1),family,serial:end},
        {id:'c',number:String(+target+2),family:other,serial:start+3},
        {id:'d',number:String(+target+3),family,serial:start-1},
        {id:'e',number:String(+target+4),family,serial:end+1}
      ]),initial:{tagged:[]}});
    }else if(s.id===3){
      Object.assign(s,{prompt:'File the current instruction.',hint:'Use the approved, effective revision—not a draft or an old copy.',reveal:'A higher revision number does not make a draft usable.',today:20,documents:shuffle(r,[
        {id:'a',revision:rev-1,status:'Superseded',effective:4},
        {id:'b',revision:rev,status:'Approved',effective:12},
        {id:'c',revision:rev+1,status:'Draft',effective:25}
      ]),initial:{document:null}});
    }else if(s.id===4){
      const last=between(r,3,8)*50,interval=between(r,2,5)*25;
      Object.assign(s,{prompt:'Set the next due point.',hint:'Next due = last completed meter + the interval.',reveal:'An interval starts from the documented completion point.',last,interval,due:last+interval,choices:shuffle(r,[last,last+interval,last+interval*2,interval]),initial:{due:null}});
    }else if(s.id===5){
      const now=between(r,30,80)*10,daily=between(r,2,5)*5,today=between(r,1,5),usageDays=between(r,3,6),calendarDays=usageDays+(between(r,0,1)?2:-2);
      Object.assign(s,{prompt:'Mark the first due day.',hint:'Forecast the meter limit, then compare it with the calendar limit.',reveal:'When either limit can trigger work, the earlier limit controls.',now,daily,today,limit:now+daily*usageDays,calendar:today+calendarDays,dueDay:today+Math.min(usageDays,calendarDays),days:Array.from({length:8},(_,i)=>today+i),initial:{day:null}});
    }else if(s.id===6){
      const kit='K-'+between(r,20,80),slot=between(r,3,8);
      Object.assign(s,{prompt:'Build a ready work pack.',hint:'Match the asset, approved instruction, required kit, and an open slot.',reveal:'A scheduled task needs the right information, materials, and opportunity.',kit,slot,tiles:shuffle(r,[
        {id:'a',type:'asset',label:target,detail:'Asset match',icon:'asset',valid:true},
        {id:'b',type:'instruction',label:'Rev '+rev,detail:'Approved',icon:'book',valid:true},
        {id:'c',type:'part',label:kit,detail:'In stock',icon:'box',valid:true},
        {id:'d',type:'slot',label:'Day '+slot,detail:'Open',icon:'calendar',valid:true},
        {id:'e',type:'part',label:kit+'X',detail:'In stock',icon:'box',valid:false},
        {id:'f',type:'instruction',label:'Rev '+(rev-1),detail:'Superseded',icon:'book',valid:false},
        {id:'g',type:'slot',label:'Day '+(slot+1),detail:'Occupied',icon:'calendar',valid:false}
      ]),initial:{items:[]}});
    }else if(s.id===7){
      Object.assign(s,{prompt:'Unlock and complete the work.',hint:'Parts and a slot can be prepared in either order. Both are needed before work.',reveal:'Prerequisites create a reliable path from a requirement to verified work.',stages:shuffle(r,stages),initial:{done:[],trail:[]},checkLabel:'Verify trail'});
    }else if(s.id===8){
      Object.assign(s,{prompt:'Close only verified work.',hint:'Link the matching work record and passed check, then stamp the job closed.',reveal:'A plan or a message is not the same as evidence of completed, verified work.',evidence:shuffle(r,[
        {id:'a',type:'Work record',asset:target,job,result:'Completed',icon:'wrench',valid:true},
        {id:'b',type:'Check record',asset:target,job,result:'Passed',icon:'check',valid:true},
        {id:'c',type:'Work record',asset:String(+target+1),job,result:'Completed',icon:'wrench',valid:false},
        {id:'d',type:'Schedule',asset:target,job,result:'Planned',icon:'calendar',valid:false},
        {id:'e',type:'Check record',asset:target,job,result:'Failed',icon:'flag',valid:false}
      ]),initial:{evidence:[],closed:false},checkLabel:'File closeout'});
    }else if(s.id===9){
      const intervals=shuffle(r,[50,75,100,125,150]).slice(0,3);
      const requirements=[0,1,2].map((_,i)=>({id:'R-'+(+req.slice(2)+i),interval:intervals[i]}));
      Object.assign(s,{prompt:'Repair the requirement register.',hint:'Pick a source card, then its destination. Archive requirements absent from the current source.',reveal:'The register should match the current source, with neither missing nor extra requirements.',requirements,sourceOrder:shuffle(r,requirements.map(x=>x.id)),initial:{picked:null,rows:[clone(requirements[0]),{id:requirements[1].id,interval:requirements[1].interval+25},{id:'R-OLD',interval:25},null],trail:[]},checkLabel:'Verify register'});
    }else if(s.id===10){
      const kit='K-'+between(r,20,80),day=between(r,3,7);
      const options={
        asset:shuffle(r,[{id:'a',value:target,detail:'Family '+family,icon:'asset'},{id:'b',value:String(+target+1),detail:'Family '+family,icon:'asset'},{id:'c',value:String(+target+2),detail:'Family '+other,icon:'asset'}]),
        instruction:shuffle(r,[{id:'a',value:'Rev '+rev,detail:'Approved',icon:'book'},{id:'b',value:'Rev '+(rev-1),detail:'Superseded',icon:'book'},{id:'c',value:'Rev '+(rev+1),detail:'Draft',icon:'book'}]),
        kit:shuffle(r,[{id:'a',value:kit,detail:'In stock',icon:'box'},{id:'b',value:kit+'X',detail:'In stock',icon:'box'},{id:'c',value:kit,detail:'Unavailable',icon:'box'}]),
        day:shuffle(r,[{id:'a',value:'Day '+day,detail:'Open · before due',icon:'calendar'},{id:'b',value:'Day '+(day+2),detail:'After due',icon:'calendar'},{id:'c',value:'Day '+(day-1),detail:'Occupied',icon:'calendar'}]),
        proof:shuffle(r,[{id:'a',value:job,detail:target+' · work + check passed',icon:'check'},{id:'b',value:job,detail:target+' · scheduled only',icon:'calendar'},{id:'c',value:job,detail:String(+target+1)+' · work + check passed',icon:'check'}])
      };
      Object.assign(s,{prompt:'Build one traceable work pack.',hint:'Follow the requirement through all five tabs. Every link must match.',reveal:'A complete trail connects the right asset, current instruction, readiness, timing, and verified result.',kit,day,options,parts:['asset','instruction','kit','day','proof'],initial:{tab:'asset',choices:{}},checkLabel:'Release pack'});
    }
    return s;
  }
  function expected(s){
    if(s.id===2)return s.assets.filter(a=>a.family===s.family&&a.serial>=s.serialRange[0]&&a.serial<=s.serialRange[1]).map(a=>a.id);
    if(s.id===6)return s.tiles.filter(t=>t.valid).map(t=>t.id);
    if(s.id===8)return s.evidence.filter(t=>t.valid).map(t=>t.id);
    return [];
  }
  function assessTrail(s,p){
    if(!Array.isArray(p.done)||!Array.isArray(p.trail)||!eqSet(p.done,stages.map(x=>x.id)))return false;
    const seen=[];
    for(const id of p.trail){const step=stages.find(x=>x.id===id);if(!step||seen.includes(id)||!step.needs.every(x=>seen.includes(x)))return false;seen.push(id);}
    return eqSet(seen,p.done);
  }
  function check(s,p){
    if(!p||typeof p!=='object')return {ok:false,message:'Build the work pack first.'};
    let ok=false,message='Check the linked records.';
    if(s.id===1){ok=p.assignment===s.target;message='Match the number on the requirement.';}
    if(s.id===2){ok=eqSet(p.tagged,expected(s));message='Check both family and serial range.';}
    if(s.id===3){ok=p.document===s.documents.find(d=>d.status==='Approved'&&d.effective<=s.today)?.id;message='Use the current approved instruction.';}
    if(s.id===4){ok=typeof p.due==='number'&&Number.isFinite(p.due)&&p.due===s.due;message='Add the interval to the last completion meter.';}
    if(s.id===5){ok=typeof p.day==='number'&&Number.isFinite(p.day)&&p.day===s.dueDay;message='Compare the calendar and forecast meter deadlines.';}
    if(s.id===6){ok=eqSet(p.items,expected(s));message='One matching asset, instruction, kit, and open slot.';}
    if(s.id===7){ok=assessTrail(s,p);message='Finish every step in a valid prerequisite order.';}
    if(s.id===8){ok=eqSet(p.evidence,expected(s))&&p.closed===true;message=p.closed?'Check the two linked evidence records.':'Link the two matching records, then stamp closed.';}
    if(s.id===9){
      const rows=Array.isArray(p.rows)?p.rows.filter(Boolean):[];
      ok=rows.length===s.requirements.length&&new Set(rows.map(x=>x.id)).size===rows.length&&rows.every(x=>s.requirements.some(y=>x.id===y.id&&x.interval===y.interval));
      message='Match every source row. Remove extras and duplicates.';
    }
    if(s.id===10){
      const labels={asset:'Match the asset number.',instruction:'Use the current approved revision.',kit:'Use the matching kit that is in stock.',day:'Choose an open day before the due point.',proof:'Link completed work and a passed check for this asset.'};
      const failed=s.parts.find(part=>p.choices?.[part]!=='a');
      ok=!failed;message=labels[failed]||'Every link matches.';
    }
    return {ok,message:ok?'Complete and traceable.':message};
  }
  function solve(s){
    if(s.id===1)return{assignment:s.target};
    if(s.id===2)return{tagged:expected(s)};
    if(s.id===3)return{document:s.documents.find(d=>d.status==='Approved'&&d.effective<=s.today).id};
    if(s.id===4)return{due:s.due};
    if(s.id===5)return{day:s.dueDay};
    if(s.id===6)return{items:expected(s)};
    if(s.id===7)return{done:stages.map(x=>x.id),trail:stages.map(x=>x.id)};
    if(s.id===8)return{evidence:expected(s),closed:true};
    if(s.id===9)return{picked:null,rows:[...clone(s.requirements),null],trail:['Corrected interval','Replaced obsolete requirement']};
    return{tab:'proof',choices:Object.fromEntries(s.parts.map(p=>[p,'a']))};
  }
  function act(s,current,event){
    const p=clone(current||s.initial),e=event||{},a=e.action,id=String(e.id??''),value=e.value;
    const fail=message=>({state:p,message,error:true});
    const toggle=(key,allowed)=>{if(!allowed.includes(id))return false;const arr=Array.isArray(p[key])?p[key]:[];p[key]=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];return true;};
    if(a==='attach'&&s.id===1){if(!s.assets.includes(id))return fail('Choose an asset on this board.');p.assignment=p.assignment===id?null:id;}
    else if(a==='tag'&&s.id===2){if(!toggle('tagged',s.assets.map(x=>x.id)))return fail('Choose an asset on this board.');}
    else if(a==='document'&&s.id===3){if(!s.documents.some(x=>x.id===id))return fail('Choose a document card.');p.document=id;}
    else if(a==='due'&&s.id===4){const n=Number(value);if(value==null||value===''||!s.choices.includes(n))return fail('Choose a due-point tile.');p.due=n;}
    else if(a==='day'&&s.id===5){const n=Number(value);if(value==null||value===''||!s.days.includes(n))return fail('Choose a day on the board.');p.day=n;}
    else if(a==='item'&&s.id===6){if(!toggle('items',s.tiles.map(x=>x.id)))return fail('Choose a work-pack tile.');}
    else if(a==='step'&&s.id===7){
      const step=stages.find(x=>x.id===id);if(!step)return fail('Choose a work step.');
      p.done=Array.isArray(p.done)?p.done:[];p.trail=Array.isArray(p.trail)?p.trail:[];
      if(p.done.includes(id))return{state:p,message:'Already recorded.'};
      const missing=step.needs.filter(x=>!p.done.includes(x));
      if(missing.length)return fail('First: '+missing.map(x=>stages.find(y=>y.id===x).label.toLowerCase()).join(' + ')+'.');
      p.done.push(id);p.trail.push(id);
      return{state:p,message:step.label+' · recorded'};
    }else if(a==='evidence'&&s.id===8){if(!toggle('evidence',s.evidence.map(x=>x.id)))return fail('Choose an evidence card.');p.closed=false;}
    else if(a==='stamp'&&s.id===8){
      if(!eqSet(p.evidence,expected(s)))return fail('Use the matching completed work and passed check.');
      p.closed=true;return{state:p,message:'Verified · closed'};
    }else if(a==='source'&&s.id===9){if(!s.requirements.some(x=>x.id===id))return fail('Choose a current source card.');p.picked=id;}
    else if((a==='place'||a==='archive')&&s.id===9){
      const index=Number(e.index);if(e.index==null||e.index===''||!Number.isInteger(index)||index<0||index>3||!Array.isArray(p.rows))return fail('Choose a register slot.');
      p.trail=Array.isArray(p.trail)?p.trail:[];
      if(a==='archive'){if(p.rows[index])p.trail.push('Archived '+p.rows[index].id);p.rows[index]=null;}
      else{const source=s.requirements.find(x=>x.id===p.picked);if(!source)return fail('Pick a source card first.');p.rows[index]=clone(source);p.trail.push('Linked '+source.id);}
    }else if(a==='tab'&&s.id===10){if(!s.parts.includes(id))return fail('Choose a pack tab.');p.tab=id;}
    else if(a==='pack'&&s.id===10){
      const slot=e.slot;if(!s.parts.includes(slot)||!s.options[slot].some(x=>x.id===id))return fail('Choose a card in this pack.');
      p.choices||={};p.choices[slot]=id;
      p.tab=s.parts[Math.min(s.parts.indexOf(slot)+1,s.parts.length-1)];
      return{state:p,focus:'doc-pack-tab-'+p.tab};
    }else return fail('Choose an action on this board.');
    return{state:p};
  }
  function meter(s,p){
    let done=0,total=1,label='linked';
    if(s.id===1)done=p.assignment?1:0;
    if(s.id===2){done=(p.tagged||[]).length;total=expected(s).length;label='tagged';}
    if(s.id===3)done=p.document?1:0;
    if(s.id===4)done=Number.isFinite(p.due)?1:0;
    if(s.id===5)done=Number.isFinite(p.day)?1:0;
    if(s.id===6){done=(p.items||[]).length;total=4;label='packed';}
    if(s.id===7){done=(p.done||[]).length;total=stages.length;label='recorded';}
    if(s.id===8){done=(p.evidence||[]).length+(p.closed?1:0);total=3;label='filed';}
    if(s.id===9){done=Math.min((p.trail||[]).length,2);total=2;label='edits recorded';}
    if(s.id===10){done=s.parts.filter(x=>p.choices?.[x]).length;total=s.parts.length;label='linked';}
    return{done,total,label};
  }
  function render(s,p,ui){
    const E=ui.esc,I=ui.icon,W=ui.world||{},asset=()=>ui.asset?ui.asset():I('plane');
    const icon=type=>type==='asset'?asset():I(type);
    const chip=(text,cls='')=>'<span class="sg-chip '+cls+'">'+E(text)+'</span>';
    const source=(title,content)=>'<div class="sg-source-card"><div class="sg-label">'+I('file')+' '+E(title)+'</div>'+content+'</div>';
    const btn=(action,id,label,body,on=false,extra='',focusKey='doc-'+action+'-'+id)=>'<button class="sg-card'+(on?' selected':'')+'" data-skill-action="'+action+'" data-id="'+E(id)+'" data-focus="'+E(focusKey)+'" aria-pressed="'+!!on+'" aria-label="'+E(label)+'" '+extra+'>'+body+'</button>';
    const card=(ic,title,meta)=>'<span class="sg-card-icon">'+icon(ic)+'</span><strong class="sg-card-title">'+E(title)+'</strong><span class="sg-card-meta">'+E(meta)+'</span>';
    let html='';
    if(s.id===1){
      html=source(s.req,'<div class="sg-row"><span class="sg-card-icon">'+I('inspect')+'</span><strong>Inspect · '+E(s.target)+'</strong></div>')+'<div class="sg-instruction">Tap the matching '+E(W.assetSingular||'asset')+'.</div><div class="sg-card-grid">'+s.assets.map(id=>btn('attach',id,'Attach to '+id,card('asset',id,p.assignment===id?'Requirement attached':'—'),p.assignment===id)).join('')+'</div><div class="sg-slot '+(p.assignment?'filled':'')+'">'+I('link')+E(s.req)+' → '+E(p.assignment||'?')+'</div>';
    }else if(s.id===2){
      html=source('Applies to','<div class="sg-chips">'+chip('Family '+s.family)+chip('Serial '+s.serialRange[0]+'–'+s.serialRange[1])+'</div>')+'<div class="sg-card-grid">'+s.assets.map(a=>btn('tag',a.id,'Tag '+a.number,card('asset',a.number,'Family '+a.family+' · serial '+a.serial),(p.tagged||[]).includes(a.id))).join('')+'</div>';
    }else if(s.id===3){
      html=source('Approved index','<div class="sg-row"><strong>'+E(s.req)+' · revision '+s.rev+'</strong>'+chip('Today: day '+s.today)+'</div>')+'<div class="sg-card-grid">'+s.documents.map(d=>btn('document',d.id,'File revision '+d.revision,card('book','Revision '+d.revision,d.status)+'<span class="sg-card-meta">Effective day '+d.effective+'</span>',p.document===d.id)).join('')+'</div>';
    }else if(s.id===4){
      html='<div class="sg-two-column">'+source('Last completed','<strong class="sg-big-number">'+s.last+'</strong><span class="sg-unit">meter units</span>')+source('Repeat interval','<strong class="sg-big-number">+'+s.interval+'</strong><span class="sg-unit">meter units</span>')+'</div><div class="sg-equation">'+s.last+' + '+s.interval+' = <span class="sg-slot '+(p.due!=null?'filled':'')+'">'+E(p.due??'?')+'</span></div><div class="sg-choice-row">'+s.choices.map(n=>'<button class="sg-choice '+(p.due===n?'selected':'')+'" data-skill-action="due" data-value="'+n+'" data-focus="doc-due-'+n+'" aria-pressed="'+(p.due===n)+'" aria-label="Set next due to '+n+'">'+n+'</button>').join('')+'</div>';
    }else if(s.id===5){
      html='<div class="sg-three-column">'+source('Today','<strong class="sg-big-number">'+s.today+'</strong><span class="sg-unit">day</span>')+source('Meter forecast','<strong>'+s.now+' → '+s.limit+'</strong><div class="sg-note">+'+s.daily+' units per day</div>')+source('Calendar limit','<strong class="sg-big-number">'+s.calendar+'</strong><span class="sg-unit">day</span>')+'</div><div class="sg-label">FIRST DUE DAY</div><div class="sg-timeline">'+s.days.map(d=>'<button class="sg-step '+(p.day===d?'selected':'')+'" data-skill-action="day" data-value="'+d+'" data-focus="doc-day-'+d+'" aria-pressed="'+(p.day===d)+'" aria-label="Mark day '+d+'">Day<strong>'+d+'</strong></button>').join('')+'</div>';
    }else if(s.id===6){
      html=source(s.req,'<div class="sg-chips">'+chip(s.target)+chip('Rev '+s.rev)+chip(s.kit)+chip('Open slot')+'</div>')+'<div class="sg-card-grid">'+s.tiles.map(t=>btn('item',t.id,'Pack '+t.label+', '+t.detail,card(t.icon,t.label,t.detail),(p.items||[]).includes(t.id))).join('')+'</div><div class="sg-slot '+((p.items||[]).length?'filled':'')+'">'+I('box')+' '+(p.items||[]).length+' / 4 packed</div>';
    }else if(s.id===7){
      html=source(s.job,'<div class="sg-chips">'+chip(s.req)+chip(s.target)+chip('Parts + slot before work')+'</div>')+'<div class="sg-card-grid">'+s.stages.map(t=>{
        const done=(p.done||[]).includes(t.id),missing=t.needs.filter(x=>!(p.done||[]).includes(x));
        return '<button class="sg-card '+(done?'good':missing.length?'muted':'')+'" data-skill-action="step" data-id="'+t.id+'" data-focus="doc-step-'+t.id+'" aria-pressed="'+done+'" aria-label="'+E(t.label)+(done?', done':missing.length?', prerequisite needed':'')+'">'+card(done?'check':missing.length?'lock':t.icon,t.label,done?'Recorded':missing.length?'Needs: '+missing.map(x=>stages.find(y=>y.id===x).label).join(' + '):'Ready')+'</button>';
      }).join('')+'</div><div class="sg-chips">'+(p.trail||[]).map((id,i)=>chip((i+1)+'. '+(stages.find(x=>x.id===id)?.label||'?'),'good')).join('')+'</div>';
    }else if(s.id===8){
      html=source('Closeout rule','<div class="sg-chips">'+chip(s.job)+chip(s.target)+chip('Work + passed check')+'</div>')+'<div class="sg-card-grid">'+s.evidence.map(e=>btn('evidence',e.id,'Link '+e.type+', '+e.asset+', '+e.result,card(e.icon,e.type,e.asset+' · '+e.job)+'<span class="sg-chip '+(e.result==='Failed'?'warn':'')+'">'+E(e.result)+'</span>',(p.evidence||[]).includes(e.id))).join('')+'</div><div class="sg-row"><button class="sg-action '+(p.closed?'selected':'')+'" data-skill-action="stamp" data-focus="doc-stamp" aria-pressed="'+!!p.closed+'">'+I(p.closed?'check':'file')+' '+(p.closed?'Verified · closed':'Stamp closed')+'</button>'+chip(p.closed?'Closed':'Open',p.closed?'good':'')+'</div>';
    }else if(s.id===9){
      html='<div class="sg-two-column"><div class="sg-source-card"><div class="sg-label">CURRENT SOURCE · '+E(s.target)+'</div><div class="sg-stack">'+s.sourceOrder.map(id=>{const r=s.requirements.find(x=>x.id===id);return btn('source',id,'Pick source '+id,card('file',id,'Every '+r.interval+' units'),p.picked===id);}).join('')+'</div></div><div class="sg-record-card"><div class="sg-label">REGISTER · '+E(s.target)+'</div><div class="sg-stack">'+(p.rows||[]).map((row,i)=>'<div class="sg-row"><button class="sg-slot '+(row?'filled':'')+'" data-skill-action="place" data-index="'+i+'" data-focus="doc-place-'+i+'" aria-label="Place source in register slot '+(i+1)+'">'+(row?'<strong>'+E(row.id)+'</strong><span>Every '+E(row.interval)+' units</span>':I('upload')+' Empty slot')+'</button>'+(row?'<button class="sg-action" data-skill-action="archive" data-index="'+i+'" data-focus="doc-archive-'+i+'" aria-label="Archive register slot '+(i+1)+'">'+I('close')+'</button>':'')+'</div>').join('')+'</div></div></div><div class="sg-note">Pick a source → tap a register slot. × archives a row.</div>'+(p.trail?.length?'<div class="sg-audit">'+E(p.trail[p.trail.length-1])+'</div>':'');
    }else if(s.id===10){
      const labels={asset:'Asset',instruction:'Instruction',kit:'Parts',day:'Day',proof:'Evidence'},tab=s.parts.includes(p.tab)?p.tab:'asset';
      const details={asset:'Match '+s.target,instruction:'Approved revision '+s.rev,kit:'Required kit '+s.kit,day:'Due day '+(s.day+1)+' · choose an open day',proof:s.job+' · '+s.target+' · completed + verified'};
      html='<div class="sg-pipeline">'+s.parts.map(part=>'<button class="sg-step '+(tab===part?'selected ':'')+(p.choices?.[part]?'done':'')+'" data-skill-action="tab" data-id="'+part+'" data-focus="doc-pack-tab-'+part+'" aria-pressed="'+(tab===part)+'">'+I(p.choices?.[part]?'check':part==='asset'?'link':part==='instruction'?'book':part==='kit'?'box':part==='day'?'calendar':'file')+'<span>'+labels[part]+'</span></button>').join('')+'</div>'+source(s.req,'<strong>'+E(details[tab])+'</strong>')+'<div class="sg-card-grid">'+s.options[tab].map(o=>btn('pack',o.id,'Choose '+o.value+', '+o.detail,card(o.icon,o.value,o.detail),p.choices?.[tab]===o.id,'data-slot="'+tab+'"','doc-pack-'+tab+'-'+o.id)).join('')+'</div><div class="sg-chips">'+s.parts.filter(part=>p.choices?.[part]).map(part=>{const chosen=s.options[part].find(o=>o.id===p.choices[part]);return chip(labels[part]+': '+(chosen?.value||'?'));}).join('')+'</div>';
    }
    return '<section class="sg-workbench" aria-label="Documentation work board">'+html+'</section>';
  }
  const pack={id:'documentation',name:'Documentation',icon:'file',levels,make,render,act,check,solve,meter};
  if(root)(root.FM_GAME_PACKS||=( {} )).documentation=pack;
  if(typeof module!=='undefined'&&module.exports)module.exports=pack;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this);
