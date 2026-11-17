(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FMModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const sum=a=>a.reduce((x,y)=>x+y,0);
const avg=a=>a.length?sum(a)/a.length:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const SCHED_SKILLS=[
 {id:1,title:'Schedule a 6-Turn-4',objective:'Build a six-aircraft first departure wave from six FMC aircraft, then assign four of them to turn.'},
 {id:2,title:'Avoid a Hangar Queen',objective:'Build a 6-Turn-4 that deliberately uses the aircraft that has not flown for 29 days.'},
 {id:3,title:'Schedule Into Phase',objective:'Use repeated 6-Turn-4 schedules to bring A8 from 15 hours remaining to the Phase threshold.'},
 {id:4,title:'Fix the Phase Flow',objective:'Use repeated flying decisions to separate a flat Phase Flow instead of allowing every aircraft to become due together.'},
 {id:5,title:'Schedule Around NMC Aircraft',objective:'Build a 12-Turn-10 plus protected spare while accepting that several aircraft are unavailable.'},
 {id:6,title:'Build the Flying-Hour Program',objective:'Translate the annual flying requirement into monthly targets and reconcile actual flying against plan.'},
 {id:7,title:'Build the Weekly Schedule',objective:'Use the weekly availability picture to identify which aircraft can support each operating day.'},
 {id:8,title:'90-Day Fleet Scheduling Capstone',objective:'Inherit a 24-aircraft fleet and execute a valid 12-Turn-10 every day for 90 days while managing Phase Flow, NMC aircraft, utilization, and other unavailable aircraft.'}
];
const SCHED_VOCAB={
 '6-Turn-4':'Six aircraft in the first departure wave; four of those aircraft are turned for a second flight.',
 '12-Turn-10':'Twelve aircraft in the first departure wave; ten are turned for a second flight.',
 'First departure wave':'The aircraft scheduled to depart in the first wave of the operating day.',
 'Turn':'Prepare an aircraft that already flew for another flight later in the same operating period.',
 'Spare':'An available aircraft protected outside the planned flying lineup as contingency capacity.',
 'FMC':'Fully mission capable: available for the full required mission set in the training case.',
 'NMC':'Not mission capable: unavailable for the current flying requirement.',
 'Hangar queen':'An otherwise usable aircraft that has gone too long without being flown or used.',
 'Utilization':'How much each aircraft is being used over time.',
 'Phase':'A recurring usage-driven inspection in this simulator.',
 'Hours remaining to Phase':'The usable flying hours remaining before an aircraft reaches its Phase threshold.',
 'Phase Flow':'The projected sequence of aircraft reaching the Phase threshold over time.',
 'Flying-hour program':'The annual and monthly flying-output plan the organization intends to execute.',
 'Weekly schedule':'The planned aircraft availability and flying picture for the coming week.',
 'Planned down':'A known period when an aircraft is intentionally unavailable for scheduled work.',
 'Limited configuration':'Available for some work, but not every mission or turn requirement.',
 'Priority use':'An available aircraft that should be scheduled because of a stated fleet-management reason.',
 'Underused':'An available aircraft that should be worked into the schedule when feasible to balance utilization.',
 'CANN / donor aircraft':'An aircraft being used as a controlled source of parts or components in the training scenario.',
 'Depot':'Longer-range maintenance that removes the aircraft from the local planning pool.',
 'MOD':'A scheduled modification/change package that creates planned downtime.',
 'Checkerboard':'A visual calendar showing flying, maintenance, unavailable periods, and other commitments.',
 'Long-range plan':'The future maintenance and flying picture before monthly, weekly, and daily detail is built.'
};
const METRICS=[
 ['mc','MC Rate','Mission-capable hours','Possessed hours',100,'percent','How much possessed time the fleet could perform at least one assigned mission.','high'],
 ['aa','AA','Mission-capable hours','Total active inventory hours',100,'percent','Mission-capable time compared with the broader active-inventory time base.','high'],
 ['nmcm','NMCM-only Rate','Maintenance-only NMC hours','Possessed hours',100,'percent','How much possessed time was unavailable for maintenance only.','low'],
 ['nmcs','NMCS-only Rate','Supply-only NMC hours','Possessed hours',100,'percent','How much possessed time was unavailable for supply only.','low'],
 ['nmcb','NMCB Rate','Both maintenance-and-supply NMC hours','Possessed hours',100,'percent','How much possessed time was unavailable for both maintenance and supply.','low'],
 ['tnmcm','TNMCM','Total maintenance NMC hours','Possessed hours',100,'percent','Total maintenance-driven unavailable time, including overlapping both-status time.','low'],
 ['tnmcs','TNMCS','Total supply NMC hours','Possessed hours',100,'percent','Total supply-driven unavailable time, including overlapping both-status time.','low'],
 ['break','Break Rate','Breaks / severe discrepancies','Flights',100,'percent','How often a flight ends with a qualifying break/discrepancy.','low'],
 ['fix8','8-Hour Fix Rate','Breaks fixed within 8 hours','Breaks',100,'percent','How often qualifying breaks are restored within eight hours.','high'],
 ['repeat','Repeat Rate','Repeat discrepancies','Pilot-reported discrepancies',100,'percent','How often a recent maintenance problem repeats.','low'],
 ['recur','Recur Rate','Recurring discrepancies','Pilot-reported discrepancies',100,'percent','How often a previously seen discrepancy recurs in the defined window.','low'],
 ['reprecur','Repeat/Recur Rate','Repeat + recur discrepancies','Pilot-reported discrepancies',100,'percent','Combined repeat/recur burden relative to reported discrepancies.','low'],
 ['cann','CANN Rate','Cannibalization actions','Flights',100,'per100','Cannibalization actions per 100 flights.','low'],
 ['gabort','Ground Abort Rate','Ground aborts','Ground attempts',100,'percent','How often an attempted departure is aborted before takeoff.','low'],
 ['aabort','Air Abort Rate','Air aborts','Flights',100,'percent','How often a flight is aborted after takeoff.','low'],
 ['sse','SSE','Successful scheduled events','Scheduled events',100,'percent','How often scheduled maintenance events finish successfully as planned.','high'],
 ['mse','MSE','Successful maintenance events','Maintenance events',100,'percent','How often maintenance events reach the defined successful outcome.','high'],
 ['defer','Deferred Discrepancies / Asset','Deferred discrepancies','Assets',1,'ratio','Average deferred discrepancies carried per asset.','low'],
 ['asd','ASD','Flying hours','Flights',1,'ratio','Average flight duration.','context'],
 ['util','Utilization','Flights','Assets',1,'ratio','Average flights generated per asset in the selected period.','context']
].map(x=>({id:x[0],name:x[1],num:x[2],den:x[3],mult:x[4],display:x[5],meaning:x[6],direction:x[7]}));
const DOC_TERMS={
 'Compliance Category':'The urgency or priority assigned to a required change or inspection.',
 'Compliance Period':'The allowed completion window for the required work.',
 'Ground / Stop-Use Date':'The point after which the affected asset cannot continue normal use under the stated rule until the requirement is satisfied.',
 'Rescission Date':'The date the controlling change instruction is withdrawn or no longer active under the supplied rule.',
 'Expiration Date':'The date a specific approval, extension, instruction, or authority expires in the scenario.',
 'Applicability':'Which assets, configurations, or conditions the requirement actually applies to.',
 'Parts / Kits / Tools / Skills':'The resources and specialized capability required before the work can be accomplished correctly.',
 'Evidence of Completion':'The records, signatures, measurements, or other evidence that prove the requirement was completed.',
 'Extension / Exception':'An authorized decision that changes the normal due requirement while preserving scope, conditions, and expiration.',
 'Closeout':'The verified final state showing required work, evidence, status, and remaining obligations are correctly resolved.'
};
const INTEGRITY_FIELDS={
 'Event / Record ID':'The stable identity used to distinguish one maintenance event from another.',
 'System / Work Unit':'The standardized asset system, subsystem, or component associated with the work.',
 'When Discovered':'When or under what condition the discrepancy or requirement was discovered.',
 'How Malfunctioned':'What kind of malfunction or observed defect was documented.',
 'Action Taken':'What corrective or maintenance action was actually performed.',
 'Type of Maintenance':'The category of maintenance activity being recorded.',
 'Condition / Status':'The operational or maintenance status associated with the event.',
 'Start / Stop Time':'When the work began and ended.',
 'Labor / Crew':'The labor effort and crew information recorded for the action.',
 'Outcome / Closeout':'What final state or verified result closed the event.'
};
function defaultState(){return {module:'academy',screen:'home',feedback:null,sound:true,sched:{skill:null,data:{}},analysis:{screen:'home',metric:null,simStage:1,caseSeed:1,acquired:false,monthly:0,outcome:null,monthJudgment:null},doc:{mode:'r1',cells:{},red:{},green:{},termsBuilt:{},inspection:{},phase:{}},integrity:{skill:null},dbm:{skill:null}}}

const CAPSTONE_PLANNED_UNAVAILABLE=[
 {id:'A4',start:5,end:9},{id:'A12',start:8,end:12},{id:'A19',start:16,end:20},{id:'A6',start:24,end:28},
 {id:'A15',start:31,end:35},{id:'A22',start:39,end:44},{id:'A3',start:47,end:51},{id:'A10',start:55,end:60},
 {id:'A18',start:64,end:68},{id:'A8',start:72,end:76},{id:'A21',start:82,end:87}
];
const CAPSTONE_NMC=[
 {id:'A7',start:3,end:4},{id:'A16',start:11,end:13},{id:'A2',start:19,end:21},{id:'A14',start:27,end:29},
 {id:'A23',start:36,end:38},{id:'A5',start:45,end:47},{id:'A17',start:53,end:55},{id:'A1',start:61,end:63},
 {id:'A13',start:70,end:72},{id:'A24',start:79,end:81},{id:'A9',start:87,end:89}
];
function initCapstoneFleet(){const phase=[54,72,90,108,126,144,162,180,198,216,234,252,270,288,306,324,342,360,378,396,66,102,150,210];return Array.from({length:24},(_,i)=>({id:'A'+(i+1),phaseHours:phase[i],lastFlownDay:i===23?-29:-(i%12),phaseDownUntil:null,phaseReturnDay:null,totalHours:0,launches:0,turns:0}));}
function normalizeCapstoneFleet(fleet,day){for(const a of fleet){if(a.phaseReturnDay&&day>=a.phaseReturnDay){a.phaseHours=400;a.phaseDownUntil=null;a.phaseReturnDay=null;}}return fleet;}
function capstoneStatusFor(a,day){if(a.phaseDownUntil&&day<=a.phaseDownUntil)return'PHASE';if(CAPSTONE_NMC.some(e=>e.id===a.id&&day>=e.start&&day<=e.end))return'NMC';if(CAPSTONE_PLANNED_UNAVAILABLE.some(e=>e.id===a.id&&day>=e.start&&day<=e.end))return'UNAVAILABLE';return'AVAILABLE';}
function capstoneDaysSince(a,day){return Math.max(0,day-a.lastFlownDay);}
function capstoneAvailable(fleet,day){normalizeCapstoneFleet(fleet,day);return fleet.filter(a=>capstoneStatusFor(a,day)==='AVAILABLE');}
function capstoneScore(d){const h=d.history||[],hangar=h.reduce((n,x)=>n+(x.hangarMisses||0),0),clusters=h.reduce((n,x)=>n+((x.phaseEntries||[]).length>1?1:0),0),shortfalls=h.filter(x=>x.shortfall).length,score=Math.max(0,100-hangar*2-clusters*3-shortfalls*8);return{score,hangar,clusters,shortfalls,days:h.length,hours:h.reduce((n,x)=>n+(x.hours||0),0)};}

function initPhase10(){return Array.from({length:10},(_,i)=>({id:'A'+(i+1),hours:i===7?15:45+i*18,status:'FMC'}));}
function initFlat20(){return Array.from({length:20},(_,i)=>({id:'A'+(i+1),hours:50,status:'FMC'}));}
function validateLineup({selected,turn,spare,needFirst,needTurn,items,requireId,forbidNmc=true}){const errors=[];if(selected.length!==needFirst)errors.push(`Select exactly ${needFirst} aircraft for the first departure wave.`);if(turn.length!==needTurn)errors.push(`Assign exactly ${needTurn} turns.`);if(turn.some(id=>!selected.includes(id)))errors.push('Every turn aircraft must be in the first departure wave.');if(requireId&&!selected.includes(requireId))errors.push(`Include ${requireId} in the first departure wave.`);if(forbidNmc&&items&&selected.some(id=>items.find(x=>x.id===id)?.status==='NMC'))errors.push('NMC aircraft cannot be placed on the flying schedule.');if(spare!==undefined){if(!spare)errors.push('Protect one spare.');else if(selected.includes(spare))errors.push('The spare must remain outside the flying lineup.');else if(forbidNmc&&items&&items.find(x=>x.id===spare)?.status==='NMC')errors.push('The spare must be available.');}return errors;}
function docStages(redStart,greenStart,day){if(!redStart)return '';if(day===redStart)return'r1';if(day===redStart+1)return'r2';const redCure=redStart+2;if(greenStart){if(day===greenStart)return'g1';if(day===greenStart+1)return'g2';if(greenStart===redStart+2){if(day===greenStart+2)return'c';}else{if(day===redCure)return'c';if(day===greenStart+2)return'c';}}else if(day===redCure)return'c';return'';}
function docModel(){const red={},green={};for(let i=1;i<=24;i++){const id='A'+String(i).padStart(3,'0');red[id]=i;green[id]=i+2;}return{red,green};}
function docValidate(red,green){const errors=[];for(let i=1;i<=24;i++){const id='A'+String(i).padStart(3,'0'),r=Number(red[id]),g=Number(green[id]);if(r!==i)errors.push(`${id}: RED should start Day ${i}.`);if(g!==i+2)errors.push(`${id}: GREEN should start Day ${i+2} to share the final cure.`);}return errors;}
function paretoSystems(seed=1){let x=seed>>>0;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};const names=['Tires','Brakes','Hydraulics','Engine','Electrical','Avionics','Fuel','Cooling','Steering','Suspension','Doors','HVAC','Transmission','Flight controls','Landing gear','Sensors','Pumps','Valves','Wiring','Battery','Generator','Starter','Exhaust','Lubrication','Fire protection','Navigation','Communications','Lighting','Structure','Windows','Seats','Cargo','Actuators','Filters','Lines','Bearings','Gearbox','Control unit','Software','Miscellaneous'];return names.map((name,i)=>({id:i+1,name,hours:Math.round(35+rnd()*160+(i<5?(5-i)*110:0))})).sort((a,b)=>b.hours-a.hours);}
function trendSeries(base,slope,seed){let x=seed>>>0;const rnd=()=>{x=(x*1103515245+12345)>>>0;return x/4294967296};return Array.from({length:12},(_,i)=>Math.max(0,Math.round(base+slope*i+(rnd()-.5)*12)));}
function pearson(x,y){const mx=avg(x),my=avg(y);let num=0,dx=0,dy=0;for(let i=0;i<x.length;i++){const a=x[i]-mx,b=y[i]-my;num+=a*b;dx+=a*a;dy+=b*b;}return dx&&dy?num/Math.sqrt(dx*dy):0;}
function variance(a){if(a.length<2)return 0;const m=avg(a);return a.reduce((t,x)=>t+(x-m)*(x-m),0)/(a.length-1)}
function erf(x){const sign=x<0?-1:1,z=Math.abs(x),t=1/(1+.3275911*z),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+.254829592)*t*Math.exp(-z*z);return sign*y}
function normalCdf(z){return .5*(1+erf(z/Math.SQRT2))}
function logGamma(z){const c=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019571e-6,1.5056327351493116e-7];if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z-=1;let x=.9999999999998099;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+c.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x)}
function betaCf(a,b,x){const MAX=200,EPS=3e-12,FPMIN=1e-30;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FPMIN)d=FPMIN;d=1/d;let h=d;for(let m=1;m<=MAX;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;h*=d*c;aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break}return h}
function ibeta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betaCf(a,b,x)/a:1-bt*betaCf(b,a,1-x)/b}
function studentTCdf(t,df){if(!Number.isFinite(t)||!Number.isFinite(df)||df<=0)return NaN;const x=df/(df+t*t),tail=.5*ibeta(x,df/2,.5);return t>=0?1-tail:tail}
function welchT(a,b){const n1=a.length,n2=b.length,m1=avg(a),m2=avg(b),v1=variance(a),v2=variance(b),se=Math.sqrt(v1/n1+v2/n2),t=se?(m1-m2)/se:0,df=Math.pow(v1/n1+v2/n2,2)/(Math.pow(v1/n1,2)/(n1-1)+Math.pow(v2/n2,2)/(n2-1)),p=2*(1-studentTCdf(Math.abs(t),df));return{mean1:m1,mean2:m2,t,df,p:clamp(p,0,1)}}
function mannWhitney(a,b){const rows=[...a.map(v=>({v,g:0})),...b.map(v=>({v,g:1}))].sort((x,y)=>x.v-y.v);let rank=1,tieSum=0,r1=0;for(let i=0;i<rows.length;){let j=i+1;while(j<rows.length&&rows[j].v===rows[i].v)j++;const n=j-i,ar=(rank+rank+n-1)/2;for(let k=i;k<j;k++)if(rows[k].g===0)r1+=ar;if(n>1)tieSum+=n*n*n-n;rank+=n;i=j}const n1=a.length,n2=b.length,N=n1+n2,u1=r1-n1*(n1+1)/2,u2=n1*n2-u1,U=Math.min(u1,u2),mu=n1*n2/2,varU=n1*n2/12*((N+1)-tieSum/(N*(N-1))),z=varU>0?(U-mu+.5)/Math.sqrt(varU):0,p=2*(1-normalCdf(Math.abs(z)));return{u:U,z,p:clamp(p,0,1),mean1:avg(a),mean2:avg(b)}}
function pearsonTest(x,y){const r=pearson(x,y),df=x.length-2,t=Math.abs(r)>=1?Infinity:r*Math.sqrt(df/(1-r*r)),p=Number.isFinite(t)?2*(1-studentTCdf(Math.abs(t),df)):0;return{r,t,df,p:clamp(p,0,1)}}
const IMPROVEMENT_PROFILES=[
 {type:'better',mc:[67.2,68.0,69.4,71.2,73.0,74.1,74.8],driver:[145,136,122,105,91,79,72],action:'standardize',note:'The targeted driver fell and the lagging indicator improved on the same basis. Sustain and standardize the successful process.'},
 {type:'same',mc:[67.2,67.4,67.0,67.5,67.1,67.3,67.2],driver:[145,142,146,143,145,144,145],action:'reopen',note:'The intervention did not produce a sustained operational change. Reopen the investigation rather than declaring success.'},
 {type:'worse',mc:[67.2,66.5,65.8,64.9,64.2,63.8,63.4],driver:[145,154,163,171,180,188,194],action:'reopen',note:'The lagging indicator worsened while the targeted driver increased. Contain the change and return to root-cause analysis.'},
 {type:'delayed',mc:[67.2,67.1,67.3,67.5,68.4,70.9,73.2],driver:[145,144,142,140,126,104,87],action:'standardize',note:'The effect was delayed, then became sustained. Do not abandon a valid intervention solely because Month 1 was flat.'},
 {type:'type1',mc:[67.2,68.5,70.1,72.4,74.0,75.2,76.0],driver:[145,132,119,101,88,76,69],action:'verify',note:'The report looks excellent, but the comparison population changed midstream. Verify the source data before claiming improvement; this is a false-positive risk.'},
 {type:'type2',mc:[67.2,67.1,67.3,67.0,67.2,67.4,67.3],driver:[145,145,143,144,142,143,141],action:'verify',note:'The report looks flat, but completed work is missing from the reporting feed. Verify the source data before concluding that the intervention failed; this is a false-negative risk.'}
];
function improvementProfile(seed=1){return clone(IMPROVEMENT_PROFILES[(Math.abs(seed)-1)%IMPROVEMENT_PROFILES.length])}
const ANSWER_LENGTH_BANK=[
 {q:'Difference yes',choices:['Evidence supports a difference','Evidence does not show a difference'],correct:0},
 {q:'Difference no',choices:['Evidence supports a difference','Evidence does not show a difference'],correct:1},
 {q:'Correlation yes',choices:['Evidence supports a relationship','Evidence does not show a relationship'],correct:0},
 {q:'Correlation no',choices:['Evidence supports a relationship','Evidence does not show a relationship'],correct:1},
 {q:'Membership',choices:['Report A3 missing; A5 unexpected.','Delete A5 immediately without checking source evidence.','Force both extracts to the same total before reviewing records.'],correct:0},
 {q:'Identity',choices:['Merge records whenever the narratives match exactly.','Investigate identity before merging.','Delete the older record so only one remains.'],correct:1},
 {q:'Repeat',choices:['Treat both as duplicates because the descriptions match.','Legitimate repeated events.','Assume the same root cause without reviewing evidence.'],correct:1},
 {q:'Timeline',choices:['Accept the timestamps if monthly totals still reconcile.','Investigate the impossible sequence.','Change the start time to make the record look logical.'],correct:1},
 {q:'Correction',choices:['Overwrite the original value and keep only the correction.','Preserve original and record the supported correction.','Delete the event and recreate it from memory.'],correct:1},
 {q:'Downstream',choices:['Verify downstream reports and interfaces.','Assume every dependent system updated automatically.','Close the issue once the source record looks correct.'],correct:0},
 {q:'Conflict',choices:['Choose whichever value seems most operationally plausible.','Hold open; get resolving evidence.','Average the values so both sources are represented.'],correct:1},
 {q:'Control',choices:['Keep correcting each record manually every week.','Add a validation control.','Stop collecting the field because it causes errors.'],correct:1},
 {q:'Import',choices:['Fix A102 mapping; replay A102 only.','Replay A101, A102, and A103 from the beginning.'],correct:0},
 {q:'Closure',choices:['Re-run the failed Records task.','Compare database totals and application logs only.'],correct:0}
];
return {clone,sum,avg,clamp,SCHED_SKILLS,SCHED_VOCAB,METRICS,DOC_TERMS,INTEGRITY_FIELDS,ANSWER_LENGTH_BANK,CAPSTONE_PLANNED_UNAVAILABLE,CAPSTONE_NMC,defaultState,initCapstoneFleet,normalizeCapstoneFleet,capstoneStatusFor,capstoneDaysSince,capstoneAvailable,capstoneScore,initPhase10,initFlat20,validateLineup,docStages,docModel,docValidate,paretoSystems,trendSeries,pearson,welchT,mannWhitney,pearsonTest,improvementProfile};
});
