(function(root){
  'use strict';
  const copy=x=>JSON.parse(JSON.stringify(x));
  const uniq=a=>[...new Set(a)];
  const levels=[
    {id:1,title:'Find the finished',chapter:'Count what happened'},
    {id:2,title:'Choose the whole',chapter:'Count what happened'},
    {id:3,title:'Build a rate',chapter:'Parts and totals'},
    {id:4,title:'Make it fair',chapter:'Parts and totals'},
    {id:5,title:'Pool the groups',chapter:'Parts and totals'},
    {id:6,title:'Find the balance',chapter:'Meet the middle'},
    {id:7,title:'The middle one',chapter:'Meet the middle'},
    {id:8,title:'Fill the gap',chapter:'Trust the evidence'},
    {id:9,title:'Trace the trend',chapter:'See the pattern'},
    {id:10,title:'Same average?',chapter:'See the pattern'},
    {id:11,title:'Together, not cause',chapter:'See the pattern'},
    {id:12,title:'Your first report',chapter:'Put it together'}
  ];
  const rng=seed=>{let a=Number(seed)>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const shuffle=(r,items)=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=int(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
  const choice=(r,a)=>a[int(r,0,a.length-1)];
  const numberBank=(r,items)=>shuffle(r,uniq(items.filter(Number.isFinite)));
  const fmt=n=>Number.isFinite(n)?String(Math.round(n*10)/10):'—';
  const sameSet=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));
  const equal=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8;
  const validId=(items,id)=>items.some(x=>x.id===id);
  function make(id,seed=1,revision=2){
    id=Number(id);
    const meta=levels.find(l=>l.id===Number(id));if(!meta)throw new Error('Unknown analysis level.');
    revision=Number(revision)===1?1:2;
    const r=rng(seed),s={...meta,seed:Number(seed)>>>0,revision,checkLabel:'Check it',initial:{},hint:'',reveal:''};
    if(id===1){
      const n=int(r,6,9),done=int(r,3,n-2),flags=shuffle(r,Array.from({length:n},(_,i)=>i<done));
      s.jobs=flags.map((finished,i)=>({id:'j'+i,label:String(i+1).padStart(2,'0'),finished}));
      s.target=s.jobs.filter(x=>x.finished).map(x=>x.id);s.prompt='Pick the completed jobs.';
      s.initial={picked:[]};s.hint='The checkmark means completed. The clock means still waiting.';
      s.reveal='Count completed work first. Planned work and completed work are different.';
    }
    if(id===2){
      const n=int(r,5,7);
      s.jobs=shuffle(r,[...Array.from({length:n},(_,i)=>({id:'j'+i,label:String(i+1).padStart(2,'0'),period:'Today',finished:i<3})),...Array.from({length:2},(_,i)=>({id:'other'+i,label:String(n+i+1).padStart(2,'0'),period:'Tomorrow',finished:false}))]);
      s.target=s.jobs.filter(x=>x.period==='Today').map(x=>x.id);s.prompt='Pick today’s whole set.';
      s.initial={picked:[]};s.hint='Include today’s finished and unfinished jobs. Leave tomorrow out.';
      s.reveal='The denominator is the whole eligible set for the same time window.';
    }
    if(id===3){
      const n=choice(r,[8,10,12]),done=int(r,2,n-2);
      s.jobs=shuffle(r,Array.from({length:n},(_,i)=>({id:'j'+i,label:String(i+1).padStart(2,'0'),finished:i<done})));
      s.count=done;s.total=n;s.bank=numberBank(r,[done,n,n-done,100]);s.prompt='Build the completion rate.';
      s.initial={slots:{part:null,whole:null},active:'part'};s.hint='Completed goes on top. All planned jobs go below.';
      s.reveal='Completion rate = completed jobs ÷ planned jobs × 100.';
    }
    if(id===4){
      const rates=shuffle(r,[choice(r,[50,55,60,65]),choice(r,[75,80,85,90])]);
      const totals=shuffle(r,[20,40]);
      s.groups=['A','B'].map((id,i)=>({id,total:totals[i],done:totals[i]*rates[i]/100,rate:rates[i]}));
      s.winner=s.groups[0].rate>s.groups[1].rate?'A':'B';s.bank=numberBank(r,[...rates,100,Math.abs(rates[0]-rates[1])]);
      s.prompt='Put both on the same scale.';s.initial={rates:{A:null,B:null},winner:null};
      s.hint='Convert each group to a percentage. Then select the higher completion rate.';
      s.reveal='A common denominator makes different-sized groups comparable.';
    }
    if(id===5){
      const totalA=choice(r,revision===1?[20,40]:[20,40,60]),totalB=revision===1?100-totalA:choice(r,[20,40,60,80].filter(n=>n!==totalA)),rateA=choice(r,[70,80,90]),rateB=choice(r,[35,45,55]);
      s.groups=shuffle(r,[{id:'A',done:totalA*rateA/100,total:totalA},{id:'B',done:totalB*rateB/100,total:totalB}]);
      s.count=s.groups.reduce((n,g)=>n+g.done,0);s.total=totalA+totalB;
      s.bank=numberBank(r,[s.count,s.total,100,...s.groups.flatMap(g=>[g.done,g.total]),(rateA+rateB)/2]);
      s.prompt='Combine the two groups.';s.initial={slots:{part:null,whole:null},active:'part'};
      s.hint='Add completed counts together. Add planned counts together.';
      s.reveal='Pool the counts, then divide. Averaging percentages can give unequal groups the wrong weight.';
    }
    if(id===6){
      const middle=int(r,5,8);s.values=shuffle(r,[middle-3,middle-1,middle+1,middle+3]);s.mean=middle;
      s.prompt='Make the four stacks equal.';s.initial={heights:s.values.slice(),source:null,moves:0};
      s.hint='Tap a taller stack, then a shorter stack. One token moves.';
      s.reveal='The mean is the fair share: all tokens ÷ the number of stacks.';
      s.checkLabel='Check balance';
    }
    if(id===7){
      const values=shuffle(r,Array.from({length:18},(_,i)=>i+2)).slice(0,5);
      s.cards=shuffle(r,values.map((value,i)=>({id:'v'+i,value})));s.sorted=s.cards.slice().sort((a,b)=>a.value-b.value).map(x=>x.id);
      s.prompt='Sort. Then tap the middle.';
      s.initial={order:[],middle:null};s.hint='Tap values from smallest to largest. Then pick the central value.';
      s.reveal='The median is the middle value after sorting. A very large extreme does not pull it upward.';
      s.checkLabel='Check order';
    }
    if(id===8){
      const days=['Mon','Tue','Wed','Thu','Fri'];s.values=Array.from({length:5},()=>int(r,4,12));s.missing=int(r,1,3);s.days=days;
      const target=s.values[s.missing];s.sources=shuffle(r,[{id:'matching',day:days[s.missing],unit:'minutes',value:target},{id:'wrong-day',day:days[(s.missing+1)%5],unit:'minutes',value:target+3},{id:'wrong-unit',day:days[s.missing],unit:'jobs',value:int(r,15,21)}]);
      s.prompt='Restore the missing observation.';s.initial={source:null,filled:null,evidence:null};
      s.hint='Match the day and the unit. Pick that source, then tap the empty tile.';
      s.reveal='Missing means unknown, not zero. Restore a value from matching evidence.';
      s.checkLabel='Verify record';
    }
    if(id===9){
      const direction=choice(r,revision===1?['up','down']:['up','down','flat']),base=int(r,28,40),step=int(r,5,8);
      s.values=Array.from({length:6},(_,i)=>direction==='flat'?base:base+i*step+(i%2?int(r,-2,2):0));if(direction==='down')s.values.reverse();
      s.direction=direction;s.days=['Mon','Tue','Wed','Thu','Fri','Sat'];
      s.prompt='Trace the trend.';s.initial={anchors:[],direction:null};
      s.hint='Mark the first and last days, then choose the overall direction.';
      s.reveal='A trend describes change across the chosen window. It does not guarantee the next result.';
    }
    if(id===10){
      const middle=int(r,8,13),spreadA=[-1,0,0,1],spreadB=[-5,-2,2,5],narrow=choice(r,['A','B']);
      s.groups=['A','B'].map(id=>({id,values:shuffle(r,(id===narrow?spreadA:spreadB).map(x=>x+middle))}));
      s.winner=narrow;s.mean=middle;s.extremes={};
      s.groups.forEach(g=>{s.extremes[g.id+'min']=Math.min(...g.values);s.extremes[g.id+'max']=Math.max(...g.values);});
      s.bank=numberBank(r,s.groups.flatMap(g=>g.values));s.prompt='Find the steadier group.';
      s.initial={slots:{Amin:null,Amax:null,Bmin:null,Bmax:null},active:'Amin',winner:null};
      s.hint='Find each group’s smallest and largest values. Compare the ranges.';
      s.reveal='The means match, but the spreads differ. A smaller range means less variation in this sample.';
    }
    if(id===11){
      s.direction=choice(r,revision===1?['up','down']:['up','down','flat']);
      // Counterbalanced scatter has a very weak linear association (|r| < .04).
      // Reflection/reversal varies the neutral cases without implying independence.
      const neutral=[5,9,3,7,8,2,10,4],reverse=revision===1?false:choice(r,[false,true]),reflect=revision===1?false:choice(r,[false,true]);
      const neutralValues=(reverse?neutral.slice().reverse():neutral).map(y=>reflect?12-y:y);
      s.points=Array.from({length:8},(_,i)=>({x:i+1,y:s.direction==='flat'?neutralValues[i]:s.direction==='up'?i+2+int(r,0,2):11-i-int(r,0,2)}));
      s.expectedClaim=s.direction==='flat'?'no-linear':'association';
      s.prompt='Fit the pattern.';s.initial={direction:null,claim:null};
      s.hint=revision===1?'Fit the direction of the dots. These observations show association, not proof of cause.':'Look for an upward, downward, or level fit. A pattern alone never proves cause.';
      s.reveal=s.direction==='flat'?'No clear linear trend in this sample. That does not rule out other relationships.':'A relationship in observed data does not, by itself, establish cause.';
      s.checkLabel='Send finding';
    }
    if(id===12){
      const a=choice(r,revision===1?[20,40]:[20,40,60]),b=revision===1?100-a:choice(r,[20,40,60,80].filter(n=>n!==a)),ra=choice(r,[60,70,80,90]),rb=choice(r,[35,45,55,65]);
      s.rows=shuffle(r,[{id:'north',label:'North',period:'Today',done:a*ra/100,total:a},{id:'south',label:'South',period:'Today',done:b*rb/100,total:b},{id:'archive',label:'North',period:'Yesterday',done:int(r,21,29),total:30}]);
      s.count=s.rows.filter(x=>x.period==='Today').reduce((n,x)=>n+x.done,0);s.total=a+b;s.target=['north','south'];
      s.bank=numberBank(r,[s.count,s.total,100,(ra+rb)/2,s.count+s.rows.find(x=>x.id==='archive').done,s.total+30,...s.rows.map(x=>x.done)]);
      s.prompt='Build today’s report.';s.initial={picked:[],slots:{part:null,whole:null},active:'part',scope:null};
      s.hint='Include today only. Pool its completed and planned counts. Keep the claim in scope.';
      s.reveal='A sound report uses the right records, a matching denominator, and a claim the evidence supports.';
      s.checkLabel='Send report';
    }
    return s;
  }
  function blank(s){return copy(s.initial);}
  function sane(s,st){return st&&typeof st==='object'&&!Array.isArray(st)?st:blank(s);}
  function chosenSlot(s,st,value){
    const slots={...st.slots};if(!Object.prototype.hasOwnProperty.call(slots,st.active)||!s.bank.includes(value))return st;
    slots[st.active]=value;const keys=Object.keys(slots),next=keys.find(k=>slots[k]===null);
    return {...st,slots,active:next || st.active};
  }
  function act(s,state,event){
    const st=copy(sane(s,state)),a=event?.action,id=String(event?.id??''),value=Number(event?.value);
    const result=(next=st,message,error=false)=>({state:next,...(message?{message}:{}),...(error?{error:true}:{})});
    if(a==='pick-job'&&(s.id===1||s.id===2)&&validId(s.jobs,id)){
      const picked=Array.isArray(st.picked)?st.picked:[];return result({...st,picked:picked.includes(id)?picked.filter(x=>x!==id):[...picked,id]});
    }
    if(a==='slot'&&st.slots&&Object.prototype.hasOwnProperty.call(st.slots,id))return result({...st,active:id});
    if(a==='number'&&s.bank&&Number.isFinite(value))return result(chosenSlot(s,st,value));
    if(a==='rate'&&s.id===4&&['A','B'].includes(id)&&s.bank.includes(value))return result({...st,rates:{...st.rates,[id]:value}});
    if(a==='winner'&&[4,10].includes(s.id)&&['A','B'].includes(id))return result({...st,winner:id});
    if(a==='move-token'&&s.id===6){
      const index=Number(id);if(!Number.isInteger(index)||index<0||index>3)return result();
      if(!Array.isArray(st.heights)||st.heights.length!==4)return result(blank(s),'Start with the four original stacks.',true);
      if(st.source==null){if(st.heights[index]<=0)return result(st,'That stack is empty.',true);return result({...st,source:index});}
      if(st.source===index)return result({...st,source:null});
      if(!Number.isInteger(st.source)||st.source<0||st.source>3||st.heights[st.source]<=0)return result({...st,source:null},'Choose a stack with a token.',true);
      const heights=st.heights.slice();heights[st.source]--;heights[index]++;
      return result({...st,heights,source:null,moves:(st.moves||0)+1});
    }
    if(a==='median-add'&&s.id===7&&validId(s.cards,id)){
      if(st.order.includes(id)||st.order.length>=5)return result();
      return result({...st,order:[...st.order,id],middle:null});
    }
    if(a==='median-position'&&s.id===7){
      const at=Number(id);if(!Number.isInteger(at)||at<0||at>=st.order.length)return result();
      if(st.order.length===5)return result({...st,middle:at});
      return result({...st,order:st.order.filter((_,i)=>i!==at),middle:null});
    }
    if(a==='clear-order'&&s.id===7)return result(blank(s));
    if(a==='source'&&s.id===8&&validId(s.sources,id))return result({...st,source:id});
    if(a==='restore'&&s.id===8){
      const source=s.sources.find(x=>x.id===st.source);if(!source)return result(st,'Pick a source first.',true);
      return result({...st,filled:source.value,evidence:source.id});
    }
    if(a==='trend-point'&&s.id===9){
      const at=Number(id);if(!Number.isInteger(at)||at<0||at>=s.values.length)return result();
      const anchors=st.anchors.includes(at)?st.anchors.filter(x=>x!==at):st.anchors.length<2?[...st.anchors,at]:[st.anchors[1],at];
      return result({...st,anchors});
    }
    if(a==='direction'&&[9,11].includes(s.id)&&['up','down','flat'].includes(id))return result({...st,direction:id});
    if(a==='claim'&&s.id===11&&['association','no-linear','cause'].includes(id))return result({...st,claim:id});
    if(a==='report-row'&&s.id===12&&validId(s.rows,id))return result({...st,picked:st.picked.includes(id)?st.picked.filter(x=>x!==id):[...st.picked,id]});
    if(a==='scope'&&s.id===12&&['today','forever'].includes(id))return result({...st,scope:id});
    return result();
  }
  function check(s,state){
    const st=sane(s,state),fail=message=>({ok:false,message}),pass=message=>({ok:true,message:message||'The evidence fits.'});
    if(s.id===1||s.id===2){
      if(!sameSet(st.picked,s.target))return fail(s.id===1?'Pick every completed job, and only completed jobs.':'Include all today’s jobs. Leave tomorrow out.');
      return pass(s.id===1?'Completed work counted.':'The full eligible set is ready.');
    }
    if(s.id===3||s.id===5){
      if(!equal(st.slots?.part,s.count))return fail(s.id===3?'Top: count the completed jobs.':'Top: add the completed counts.');
      if(!equal(st.slots?.whole,s.total))return fail(s.id===3?'Bottom: include every planned job.':'Bottom: add the planned counts.');
      return pass('The rate uses matching counts.');
    }
    if(s.id===4){
      for(const g of s.groups)if(!equal(st.rates?.[g.id],g.rate))return fail('Group '+g.id+': completed ÷ planned × 100.');
      if(st.winner!==s.winner)return fail('Select the group with the higher completion rate.');
      return pass('Different group sizes. A fair comparison.');
    }
    if(s.id===6){
      if(!Array.isArray(st.heights)||st.heights.length!==4||st.heights.some(x=>!Number.isInteger(x)||x<0))return fail('Use four whole-token stacks.');
      if(st.heights.reduce((n,x)=>n+x,0)!==s.values.reduce((n,x)=>n+x,0))return fail('Keep the original number of tokens.');
      if(st.heights.some(x=>x!==s.mean))return fail('Keep moving tokens until all four stacks match.');
      return pass('The fair share is '+s.mean+'.');
    }
    if(s.id===7){
      if(!sameSet(st.order,s.cards.map(x=>x.id)))return fail('Place all five values.');
      const values=st.order.map(id=>s.cards.find(x=>x.id===id).value);
      if(values.some((x,i)=>i>0&&x<values[i-1]))return fail('Sort from smallest to largest.');
      if(st.middle!==2)return fail('Tap the middle value of the sorted row.');
      return pass('The middle value is '+values[2]+'.');
    }
    if(s.id===8){
      if(st.evidence!=='matching')return fail('Match the missing day and the minutes unit.');
      if(!equal(st.filled,s.values[s.missing]))return fail('Copy the value from the matching source.');
      return pass('The gap has a verified value.');
    }
    if(s.id===9){
      if(!sameSet(st.anchors,[0,s.values.length-1]))return fail('Mark the first and last days of this window.');
      if(st.direction!==s.direction)return fail('Compare where the window starts and ends.');
      return pass(s.direction==='flat'?'The observed trend is level.':'The observed trend points '+s.direction+'.');
    }
    if(s.id===10){
      for(const key of Object.keys(s.extremes))if(!equal(st.slots?.[key],s.extremes[key]))return fail('Find each group’s smallest and largest values.');
      if(st.winner!==s.winner)return fail('Choose the smaller range.');
      return pass('Group '+s.winner+' varies less in this sample.');
    }
    if(s.id===11){
      if(st.direction!==s.direction)return fail('Fit the overall direction of the dots.');
      if(st.claim==='cause')return fail('A pattern alone does not prove cause.');
      if(st.claim!==s.expectedClaim)return fail(s.direction==='flat'?'Keep the claim to the weak linear pattern shown.':'The points show a directional association.');
      return pass(s.direction==='flat'?'No clear linear trend in this sample.':'A relationship, with the right limitation.');
    }
    if(s.id===12){
      if(!sameSet(st.picked,s.target))return fail('Keep the report to today’s records.');
      if(!equal(st.slots?.part,s.count)||!equal(st.slots?.whole,s.total))return fail('Pool today’s completed and planned counts.');
      if(st.scope!=='today')return fail('Keep the conclusion within the observed period.');
      return pass('Today’s report is ready.');
    }
    return fail('Choose a level.');
  }
  function solve(s){
    if(s.id===1||s.id===2)return{picked:s.target.slice()};
    if(s.id===3||s.id===5)return{slots:{part:s.count,whole:s.total},active:'whole'};
    if(s.id===4)return{rates:Object.fromEntries(s.groups.map(g=>[g.id,g.rate])),winner:s.winner};
    if(s.id===6)return{heights:Array(4).fill(s.mean),source:null,moves:1};
    if(s.id===7)return{order:s.sorted.slice(),middle:2};
    if(s.id===8)return{source:'matching',filled:s.values[s.missing],evidence:'matching'};
    if(s.id===9)return{anchors:[0,s.values.length-1],direction:s.direction};
    if(s.id===10)return{slots:{...s.extremes},active:'Bmax',winner:s.winner};
    if(s.id===11)return{direction:s.direction,claim:s.expectedClaim};
    if(s.id===12)return{picked:s.target.slice(),slots:{part:s.count,whole:s.total},active:'whole',scope:'today'};
    return blank(s);
  }
  function meter(s,state){
    const st=sane(s,state);
    if(s.id===1||s.id===2)return{done:st.picked?.length||0,total:s.target.length,label:'jobs selected'};
    if(s.id===3||s.id===5)return{done:Object.values(st.slots||{}).filter(Number.isFinite).length,total:2,label:'counts placed'};
    if(s.id===4)return{done:Object.values(st.rates||{}).filter(Number.isFinite).length+(st.winner?1:0),total:3,label:'choices placed'};
    if(s.id===6){const groups={};(st.heights||[]).forEach(x=>groups[x]=(groups[x]||0)+1);return{done:Math.max(0,...Object.values(groups)),total:4,label:'matching stacks'};}
    if(s.id===7)return{done:(st.order?.length||0)+(st.middle!=null?1:0),total:6,label:'steps placed'};
    if(s.id===8)return{done:(st.source?1:0)+(Number.isFinite(st.filled)?1:0),total:2,label:'evidence linked'};
    if(s.id===9)return{done:(st.anchors?.length||0)+(st.direction?1:0),total:3,label:'marks placed'};
    if(s.id===10)return{done:Object.values(st.slots||{}).filter(Number.isFinite).length+(st.winner?1:0),total:5,label:'report fields'};
    if(s.id===11)return{done:(st.direction?1:0)+(st.claim?1:0),total:2,label:'finding assembled'};
    return{done:(st.picked?.length||0)+Object.values(st.slots||{}).filter(Number.isFinite).length+(st.scope?1:0),total:5,label:'report fields'};
  }
  function render(s,state,ui){
    const st=sane(s,state),E=ui.esc,I=ui.icon;
    const jobs=ui.world?.jobPlural||'jobs';
    const button=(action,id,label,cls='',pressed=false,value)=>'<button class="'+cls+'" data-skill-action="'+action+'" data-id="'+E(id)+'" '+(value!==undefined?'data-value="'+E(value)+'" value="'+E(value)+'"':'')+' data-focus="an-'+action+'-'+E(id)+'-'+E(value??'')+'" aria-pressed="'+pressed+'">'+label+'</button>';
    const chip=(text,cls='')=>'<span class="sg-chip '+cls+'">'+E(text)+'</span>';
    const note=text=>'<div class="sg-note">'+E(text)+'</div>';
    const slot=(key,label)=>button('slot',key,'<span class="sg-label">'+E(label)+'</span><strong>'+E(st.slots?.[key]??'?')+'</strong>','sg-slot '+(Number.isFinite(st.slots?.[key])?'filled ':'')+(st.active===key?'active':''),st.active===key);
    const bank=()=>'<div class="sg-choice-row" aria-label="Number tiles">'+s.bank.map(n=>button('number',String(n),'<strong>'+E(n)+'</strong>','sg-choice',false,n)).join('')+'</div>';
    const equation=()=>{
      const a=st.slots?.part,b=st.slots?.whole,rate=Number.isFinite(a)&&Number.isFinite(b)&&b>0?a/b*100:null;
      return '<div class="sg-equation">'+slot('part','Completed')+'<span class="sg-big-number">÷</span>'+slot('whole','Planned')+'<span>× 100</span><span class="sg-big-number">= '+(rate==null?'?':fmt(rate))+'<small class="sg-unit">%</small></span></div>';
    };
    const jobTokens=(selectable=false,scope=false)=>'<div class="sg-token-grid">'+s.jobs.map(j=>{
      const inside='<span class="sg-card-icon">'+(ui.asset?ui.asset():I('plane'))+'</span><strong>'+E(j.label)+'</strong><span class="sg-chip '+(j.finished?'good':'warn')+'">'+I(j.finished?'check':'clock')+(scope?E(j.period):j.finished?'Done':'Waiting')+'</span>';
      return selectable?button('pick-job',j.id,inside,'sg-token '+(st.picked?.includes(j.id)?'selected ':''),!!st.picked?.includes(j.id)):'<div class="sg-token '+(j.finished?'good':'muted')+'">'+inside+'</div>';
    }).join('')+'</div>';
    const groupsTable=()=>'<div class="sg-card-grid">'+s.groups.map(g=>'<div class="sg-source-card"><span class="sg-label">Group '+E(g.id)+'</span><div class="sg-big-number">'+g.done+' <small class="sg-unit">/ '+g.total+'</small></div><span class="sg-note">Completed / planned</span></div>').join('')+'</div>';
    const arrows=()=>'<div class="sg-choice-row" aria-label="Direction">'+[['up','↗','Up'],['down','↘','Down'],['flat','→','Level']].map(([id,symbol,label])=>button('direction',id,'<strong style="font-size:28px">'+symbol+'</strong><span>'+label+'</span>','sg-choice '+(st.direction===id?'selected':''),st.direction===id)).join('')+'</div>';
    let content='';
    if(s.id===1||s.id===2){
      content='<div class="sg-row"><span class="sg-label">'+E(jobs)+' · '+(s.id===2?'TODAY':'LIVE BOARD')+'</span>'+chip(s.id===1?'✓ Completed':'Today’s whole set','good')+'</div>'+jobTokens(true,s.id===2);
    }
    if(s.id===3)content='<div class="sg-label">'+E(jobs)+' · TODAY</div>'+jobTokens()+equation()+note('Tap a slot. Pick its count.')+bank();
    if(s.id===4){
      content='<div class="sg-two-column">'+s.groups.map(g=>{
        const rate=st.rates?.[g.id],filled=Number.isFinite(rate);
        return '<section class="sg-panel"><div class="sg-row"><strong>Group '+g.id+'</strong>'+chip(g.done+' / '+g.total)+'</div>'+percentGrid(filled?rate:null,I,E)+'<div class="sg-big-number">'+(filled?rate:'?')+'<small class="sg-unit">%</small></div><div class="sg-choice-row">'+s.bank.map(n=>button('rate',g.id,E(n)+'%','sg-choice '+(rate===n?'selected':''),rate===n,n)).join('')+'</div>'+button('winner',g.id,I('flag')+' Higher rate','sg-action '+(st.winner===g.id?'selected':''),st.winner===g.id)+'</section>';
      }).join('')+'</div>'+note('Completed ÷ planned × 100. Compare on the same scale.');
    }
    if(s.id===5)content=groupsTable()+equation()+note('Tap a slot. Add the groups.')+bank();
    if(s.id===6){
      content='<div class="sg-row">'+chip('Total '+s.values.reduce((n,x)=>n+x,0))+chip('4 stacks')+'</div><div class="sg-card-grid">'+st.heights.map((n,i)=>{
        const max=Math.max(...st.heights,s.mean),blocks=Array.from({length:n},(_,j)=>'<rect x="18" y="'+(134-(j+1)*Math.min(10,120/max))+'" width="64" height="'+Math.max(3,Math.min(10,120/max)-2)+'" rx="2" fill="currentColor"/>').join('');
        return button('move-token',i,'<span class="sg-label">Stack '+String.fromCharCode(65+i)+'</span><svg style="width:100%;height:150px;color:var(--skill-accent,#58a991)" viewBox="0 0 100 150" aria-hidden="true">'+blocks+'</svg><strong class="sg-card-value">'+n+'</strong>','sg-card '+(st.source===i?'selected':''),st.source===i);
      }).join('')+'</div>'+note(st.source==null?'Tap a stack to take one token.':'Tap another stack to give it one token.');
    }
    if(s.id===7){
      content='<div class="sg-label">MINUTES PER JOB</div><div class="sg-choice-row">'+s.cards.map(c=>button('median-add',c.id,'<strong>'+c.value+'</strong>','sg-choice '+(st.order.includes(c.id)?'muted selected':''),st.order.includes(c.id))).join('')+'</div><div class="sg-equation">'+Array.from({length:5},(_,i)=>{
        const c=s.cards.find(x=>x.id===st.order[i]);return c?button('median-position',i,'<strong>'+c.value+'</strong>'+(st.middle===i?I('flag'):''),'sg-slot filled '+(st.middle===i?'active':''),st.middle===i):'<div class="sg-slot"><span class="sg-label">'+(i+1)+'</span>?</div>';
      }).join('')+'</div><div class="sg-row">'+note(st.order.length===5?'Tap the middle value.':'Tap the values from smallest to largest.')+button('clear-order','all',I('reset')+' Clear row','sg-action')+'</div>';
    }
    if(s.id===8){
      content='<div class="sg-label">MINUTES PER JOB</div><div class="sg-card-grid">'+s.values.map((n,i)=>i===s.missing?button('restore','gap','<span class="sg-card-title">'+s.days[i]+'</span><strong class="sg-card-value">'+E(st.filled??'?')+'</strong><span class="sg-card-meta">'+I('link')+' Add evidence</span>','sg-card '+(Number.isFinite(st.filled)?'selected':'warn'),Number.isFinite(st.filled)):'<div class="sg-card"><span class="sg-card-title">'+s.days[i]+'</span><strong class="sg-card-value">'+n+'</strong><span class="sg-card-meta">minutes</span></div>').join('')+'</div><div class="sg-label" style="margin-top:24px">SOURCE RECORDS</div><div class="sg-card-grid">'+s.sources.map(rec=>button('source',rec.id,'<span class="sg-card-title">'+rec.day+'</span><strong class="sg-card-value">'+rec.value+'</strong><span class="sg-card-meta">'+E(rec.unit)+'</span>','sg-card sg-source-card '+(st.source===rec.id?'selected':''),st.source===rec.id)).join('')+'</div>'+note('Pick a matching source. Tap the gap.');
    }
    if(s.id===9){
      content=lineChart(s.values,s.days,E,'Completion rate (%)',st.anchors)+'<div class="sg-choice-row" aria-label="Window markers">'+s.days.map((d,i)=>button('trend-point',i,E(d)+'<strong>'+s.values[i]+'%</strong>','sg-choice '+(st.anchors.includes(i)?'selected':''),st.anchors.includes(i))).join('')+'</div>'+arrows()+note('Mark the first and last days.');
    }
    if(s.id===10){
      content='<div class="sg-two-column">'+s.groups.map(g=>'<section class="sg-panel"><div class="sg-row"><strong>Group '+g.id+'</strong>'+chip('Mean '+s.mean)+'</div>'+dotPlot(g.values,s.mean,E)+'<div class="sg-choice-row">'+g.values.map(n=>chip(n+' min')).join('')+'</div><div class="sg-equation">'+slot(g.id+'min','Smallest')+'<span>→</span>'+slot(g.id+'max','Largest')+'</div>'+button('winner',g.id,I('flag')+' Steadier group','sg-action '+(st.winner===g.id?'selected':''),st.winner===g.id)+'</section>').join('')+'</div>'+bank();
    }
    if(s.id===11){
      content=scatterChart(s.points,st.direction,E)+arrows()+'<div class="sg-choice-row" aria-label="Report claim">'+button('claim','association',I('link')+' Associated','sg-choice '+(st.claim==='association'?'selected':''),st.claim==='association')+button('claim','no-linear',I('chart')+' No linear trend','sg-choice '+(st.claim==='no-linear'?'selected':''),st.claim==='no-linear')+button('claim','cause',I('bolt')+' Proven cause','sg-choice '+(st.claim==='cause'?'selected':''),st.claim==='cause')+'</div>';
    }
    if(s.id===12){
      content='<div class="sg-row"><span class="sg-label">'+E(jobs)+' · REPORT WINDOW</span>'+chip('Today','good')+'</div><div class="sg-card-grid">'+s.rows.map(row=>button('report-row',row.id,'<span class="sg-card-title">'+E(row.label)+'</span><span class="sg-card-meta">'+E(row.period)+'</span><strong class="sg-card-value">'+row.done+' / '+row.total+'</strong><span class="sg-card-meta">Completed / planned</span>','sg-card '+(st.picked.includes(row.id)?'selected':''),st.picked.includes(row.id))).join('')+'</div>'+equation()+bank()+'<div class="sg-choice-row" aria-label="Report scope">'+button('scope','today',I('calendar')+' Today’s result','sg-choice '+(st.scope==='today'?'selected':''),st.scope==='today')+button('scope','forever',I('calendar')+' Guaranteed every day','sg-choice '+(st.scope==='forever'?'selected':''),st.scope==='forever')+'</div>';
    }
    return '<section class="sg-workbench" aria-label="Analysis workbench">'+content+'</section>';
  }
  function percentGrid(rate,I,E){
    const safe=Math.max(0,Math.min(100,Number(rate)||0));
    return '<svg viewBox="0 0 220 100" role="img" aria-label="'+(rate==null?'No rate selected':E(safe)+' of 100')+'" style="width:100%;height:112px;margin:12px 0">'+Array.from({length:100},(_,i)=>'<rect x="'+(i%20*11)+'" y="'+(Math.floor(i/20)*18+4)+'" width="8" height="13" rx="2" fill="'+(i<safe?'#4a9b81':'#e2ebee')+'"/>').join('')+'</svg>';
  }
  function lineChart(values,labels,E,label,anchors=[]){
    const w=500,h=225,x=i=>44+i*(426/(values.length-1)),y=v=>180-v*1.5;
    const dots=values.map((v,i)=>'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="'+(anchors.includes(i)?8:5)+'" fill="'+(anchors.includes(i)?'#e1ad38':'#438d76')+'"/><text x="'+x(i)+'" y="'+(y(v)-12)+'" text-anchor="middle" fill="#284c62" font-size="11">'+v+'</text><text x="'+x(i)+'" y="201" text-anchor="middle" fill="#607d8f" font-size="11">'+E(labels[i])+'</text>').join('');
    return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+E(label+': '+labels.map((d,i)=>d+' '+values[i]).join(', '))+'" style="display:block;width:100%;max-height:270px"><text x="44" y="16" fill="#607d8f" font-size="11">'+E(label)+'</text>'+[0,50,100].map(v=>'<path d="M40 '+y(v)+'H475" stroke="#dde7eb"/><text x="33" y="'+(y(v)+4)+'" text-anchor="end" fill="#607d8f" font-size="10">'+v+'</text>').join('')+'<polyline points="'+values.map((v,i)=>x(i)+','+y(v)).join(' ')+'" fill="none" stroke="#438d76" stroke-width="3" stroke-linejoin="round"/>'+dots+'</svg>';
  }
  function dotPlot(values,middle,E){
    const min=middle-6,max=middle+6,x=v=>30+(v-min)/(max-min)*300;
    return '<svg viewBox="0 0 360 105" role="img" aria-label="'+E('Values: '+values.join(', '))+'" style="width:100%;height:112px"><path d="M28 66H333" stroke="#bed1dc"/>'+[min,middle,max].map(v=>'<path d="M'+x(v)+' 63v6" stroke="#bed1dc"/><text x="'+x(v)+'" y="88" fill="#607d8f" text-anchor="middle" font-size="11">'+v+'</text>').join('')+values.map((v,i)=>'<circle cx="'+x(v)+'" cy="'+(49-(values.slice(0,i).filter(a=>a===v).length*16))+'" r="7" fill="#4a9b81"/>').join('')+'</svg>';
  }
  function scatterChart(points,direction,E){
    const x=v=>44+(v-1)*56,y=v=>207-v*15;
    const fits={up:[{x:1,y:2},{x:8,y:10}],down:[{x:1,y:10},{x:8,y:2}],flat:[{x:1,y:6},{x:8,y:6}]},fit=fits[direction];
    return '<svg viewBox="0 0 500 255" role="img" aria-label="'+E('Paired observations: '+points.map(p=>p.x+', '+p.y).join('; '))+'" style="display:block;width:100%;max-height:285px"><text x="40" y="17" fill="#607d8f" font-size="11">OUTPUT</text>'+[0,5,10].map(v=>'<path d="M40 '+y(v)+'H450" stroke="#dde7eb"/><text x="31" y="'+(y(v)+4)+'" text-anchor="end" fill="#607d8f" font-size="10">'+v+'</text>').join('')+'<path d="M40 23V207H450" fill="none" stroke="#bed1dc"/>'+points.map(p=>'<circle cx="'+x(p.x)+'" cy="'+y(p.y)+'" r="6" fill="#4a9b81"/><text x="'+x(p.x)+'" y="224" fill="#607d8f" text-anchor="middle" font-size="10">'+p.x+'</text>').join('')+(fit?'<path d="M'+x(fit[0].x)+' '+y(fit[0].y)+'L'+x(fit[1].x)+' '+y(fit[1].y)+'" stroke="#d99538" stroke-width="3" stroke-dasharray="7 4" fill="none"/>':'')+'<text x="245" y="245" fill="#607d8f" text-anchor="middle" font-size="11">RESOURCES</text></svg>';
  }
  const pack={id:'analysis',name:'Analysis',icon:'chart',levels,make,render,act,check,solve,meter};
  if(root)(root.FM_GAME_PACKS ||= {}).analysis=pack;
  if(typeof module!=='undefined'&&module.exports)module.exports=pack;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this);
