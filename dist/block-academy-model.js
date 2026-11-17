/* Force Multiplier · Block Academy 22.9.6
   Synthetic, offline, testable game rules. The original training model remains the
   source of maintenance metrics and approved downtime-case assumptions. */
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.FMBlockModel=value;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LEVELS=[
 {id:'wave',label:'Scheduling',title:'Build a 6-Turn-4',short:'Six flyers. Four turns. Snap the blocks into the door.',theme:'green',points:100},
 {id:'status',label:'Scheduling',title:'Work Around NMC',short:'Protect the hangar queen. Avoid grounded aircraft.',theme:'green',points:100},
 {id:'phase',label:'Scheduling',title:'Fix the Phase Flow',short:'Move the right aircraft to Fly, Hold, or Phase.',theme:'purple',points:100},
 {id:'doc',label:'Documentation',title:'Recover Flying Days',short:'RED → GREEN → one cure, across a weekend.',theme:'white',points:100},
 {id:'analysis',label:'Analysis',title:'Build the Rate',short:'Match numerator, denominator, then calculate.',theme:'blue',points:100},
 {id:'integrity',label:'Data Integrity',title:'Find the Bad Record',short:'Compare two columns. Investigate the differences.',theme:'yellow',points:100},
 {id:'dbm',label:'Database & Systems',title:'Permission Patrol',short:'Compare authorized access against actual access.',theme:'orange',points:100}
];
const TERMS={
 dbm:[
 ['Authorization','Documented permission to use a system or information for an approved role.'],
 ['Least privilege','Grant only the permissions required for approved duties.'],
 ['Access review','Compare actual permissions with approved access and current duty.'],
 ['Role-based access','Permission assigned through a defined job function or role.'],
 ['Separation of duties','Divide incompatible actions so one person cannot control every step.'],
 ['Account lifecycle','Provision, review, modify, and remove access as duties change.'],
 ['Interface failure','Information is not passed between systems as intended.'],
 ['Audit trail','A traceable history of who changed what, and when.']
 ],
 integrity:[
 ['Source of truth','The approved primary evidence or record used to verify a particular value.'],
 ['Reconciliation','Identify and resolve mismatches between systems or extracts.'],
 ['Record identity','Stable identifiers needed to avoid joining unrelated events.'],
 ['Correction history','Keep original information and the supported correction traceable.'],
 ['Validation','Test values against defined data-quality controls.']
 ]
};
const STATUSES={
 FMC:{label:'FMC',css:'fmc',name:'Fully mission capable'},
 HQ:{label:'HQ',css:'hq',name:'Hangar queen (30 days without flying; condition verified in this scenario)'},
 NMCM:{label:'NMCM',css:'nmcm',name:'Not mission capable — maintenance'},
 NMCS:{label:'NMCS',css:'nmcs',name:'Not mission capable — supply'},
 NMCB:{label:'NMCB',css:'nmcb',name:'Not mission capable — maintenance and supply'},
 PHASE:{label:'PHASE',css:'phase',name:'Scheduled inspection'},
 DEPOT:{label:'DEPOT',css:'depot',name:'Depot maintenance'},
 MOD:{label:'PFR',css:'mod',name:'Modification work'},
 HOLD:{label:'HOLD',css:'hold',name:'Manage future phase risk'}
};
const ids=(a,n,offset=0)=>Array.from({length:n},(_,i)=>'A'+String(a+i+offset).padStart(2,'0'));
const aircraft=(id,status='FMC',idle=0,hours=120)=>({id,status,idle,hours});
const withLabel=(rows,variation)=>rows.map((r,i)=>({...r,id:'A'+String(i+1+(Math.max(0,variation)%4)*20).padStart(2,'0')}));
function makeMission(id,variation=0,metricIndex=0,library){
 const shift=Math.max(0,Math.trunc(Number(variation)||0));
 if(id==='wave')return {id,title:'Monday · 6-Turn-4',requirement:'Schedule all six ready aircraft, then assign four of your six flyers to turn.',aircraft:withLabel(Array.from({length:6},(_,i)=>aircraft('', 'FMC', i*3, 90+i*22)),shift),groups:[['wave',6,'First wave'],['turn',4,'Turn aircraft']]};
 if(id==='status')return {id,title:'Tuesday · Fleet Status',requirement:'Build a 6-Turn-4 without using NMC, Depot, Phase, or MOD aircraft. Include the inspected, available 30-day hangar queen.',aircraft:withLabel([
  aircraft('','FMC',0,110),aircraft('','FMC',6,145),aircraft('','FMC',15,134),aircraft('','FMC',24,180),aircraft('','FMC',4,70),aircraft('','FMC',8,58),
  aircraft('','NMCM'),aircraft('','NMCS'),aircraft('','HQ',30,128),aircraft('','NMCB'),aircraft('','DEPOT'),aircraft('','PHASE',0,0),aircraft('','MOD')
 ],shift),groups:[['wave',6,'First wave'],['turn',4,'Turn aircraft']]};
 if(id==='phase')return {id,title:'Wednesday · Phase Control',requirement:'Fill three flying slots using aircraft with adequate hours remaining. Send the due aircraft to Phase and keep the NMC and near-due aircraft off the flying lineup.',aircraft:withLabel([
  aircraft('','FMC',1,12),aircraft('','FMC',4,120),aircraft('','FMC',8,92),aircraft('','PHASE',0,0),aircraft('','NMCS',0,65),aircraft('','FMC',7,170)
 ],shift),groups:[['fly',3,'Fly today'],['phase',1,'Phase dock'],['hold',2,'Hold / unavailable']]};
 if(id==='doc')return {id,title:'Documentation · One Cure',requirement:'Build four consecutive workdays ending Friday, then place the one approved 24-hour cure on Saturday. RED before GREEN. No active work on weekends.',pieces:[['r1','R1','PFR · RED 1'],['r2','R2','PFR · RED 2'],['g1','G1','PBG · GREEN 1'],['g2','G2','PBG · GREEN 2'],['c','CURE','24h passive']],groups:[['day',14,'Two-week board']],variation:shift%3};
 if(id==='analysis'){
  const defs=(library&&library.METRICS)||[];
  const metric=defs[((metricIndex%Math.max(1,defs.length))+defs.length)%Math.max(1,defs.length)]||{id:'mc',name:'MC Rate',num:'Mission-capable hours',den:'Possessed hours',mult:100,meaning:'Percentage of possessed hours that are mission capable.'};
  const pairs={mc:[192,288],aa:[180,300],nmcm:[24,240],nmcs:[36,240],nmcb:[12,240],tnmcm:[36,240],tnmcs:[48,240],break:[10,200],fix8:[2,10],repeat:[3,30],recur:[2,30],reprecur:[5,30],cann:[5,100],gabort:[4,80],aabort:[3,100],sse:[18,20],mse:[23,25],defer:[12,24],asd:[195,100],util:[100,25]};
  const pair=pairs[metric.id]||[12,96],numerator=pair[0]+(shift%3)*(metric.mult===1?2:3),denominator=pair[1];
  const result=numerator/denominator*(metric.mult||1),correct=metric.mult===100?Number(result.toFixed(1)):Number(result.toFixed(2));
  const distractors=[correct+5,Math.max(0,Number((correct/2).toFixed(1))),Number((correct+10).toFixed(1))].filter(x=>x!==correct);
  const choices=[correct,...distractors].slice(0,4);
  // Deterministic rotations make each practice a fresh ordering without network access.
  choices.push(choices.shift());
  const extra=['Flights','Possessed hours','Ground attempts','Pilot-reported discrepancies','Scheduled events','Assets','Mission-capable hours','Maintenance events'];
  const formulaTokens=Array.from(new Set([metric.num,metric.den,...extra.filter(x=>x!==metric.num&&x!==metric.den)])).slice(0,6);
  if(!formulaTokens.includes(metric.den))formulaTokens[5]=metric.den;
  return {id,title:'Analysis · '+metric.name,requirement:'Arrange the numerator and denominator, then pick the calculated result.',metric,numerator,denominator,correct,choices,formulaTokens,groups:[['num',1,'Numerator'],['den',1,'Denominator']]};
 }
 if(id==='integrity'){
  const n=shift%3;
  const records=[
   {id:'R101',field:'Event ID',source:'EV-204',actual:'EV-204'},
   {id:'R102',field:'Action Taken',source:n===1?'Replaced valve':'Replaced seal',actual:n===1?'Inspected valve':'Inspected seal'},
   {id:'R103',field:'Labor hours',source:'2.5',actual:'2.5'},
   {id:'R104',field:'Start / Stop',source:'09:10–10:40',actual:'10:40–09:10'},
   {id:'R105',field:'Closeout',source:n===2?'OPEN':'COMPLETE',actual:n===2?'COMPLETE':'OPEN'},
   {id:'R106',field:'System',source:'HYD',actual:'HYD'}
  ];
  return {id,title:'Data Integrity · Compare Records',requirement:'Tap every row where the approved source and system record disagree. Then select an evidence-based correction.',records,discrepancies:records.filter(r=>r.source!==r.actual).map(r=>r.id),choices:[
    {id:'correct',label:'Verify source evidence, preserve history, make authorized correction, then check downstream systems.',correct:true},
    {id:'overwrite',label:'Overwrite the database so the columns match; no further check.',correct:false},
    {id:'delete',label:'Delete the mismatched records and recreate them from memory.',correct:false}
  ]};
 }
 if(id==='dbm'){
  const n=shift%3;
  const records=[
   {id:'U101',user:'Analyst',authorized:'READ',actual:'READ'},
   {id:'U102',user:'Transferred',authorized:'NONE',actual:'ADMIN'},
   {id:'U103',user:'Scheduler',authorized:'READ',actual:n===1?'ADMIN':'EDIT'},
   {id:'U104',user:'Controller',authorized:'EDIT',actual:'EDIT'},
   {id:'U105',user:'Contract ended',authorized:'NONE',actual:'READ'},
   {id:'U106',user:'Auditor',authorized:'READ',actual:'READ'}
  ];
  return {id,title:'Database · Access Audit',requirement:'Tap accounts where actual access differs from current authorization. Then decide how to handle an unauthorized account.',records,discrepancies:records.filter(r=>r.authorized!==r.actual).map(r=>r.id),choices:[
    {id:'confirm',label:'Verify authorization and identity; revoke unauthorized access through the approved process and audit the change.',correct:true},
    {id:'assume',label:'Leave access in place because the account was probably approved previously.',correct:false},
    {id:'erase',label:'Delete the audit trail so the discrepancy no longer appears.',correct:false}
  ]};
 }
 throw new Error('Unknown level '+id);
}
function placed(board,key){return (board?.slots||{})[key]||null}
function checkGroup(board,prefix,count){const found=Array.from({length:count},(_,i)=>placed(board,prefix+':'+i));return found.every(Boolean)&&new Set(found).size===count?found:null}
function evaluate(level,mission,board,library){
 if(level==='wave'||level==='status'){
  const flyers=checkGroup(board,'wave',6),turns=checkGroup(board,'turn',4);
  if(!flyers)return {ok:false,message:'Place six different aircraft into the first wave.'};
  const byID=Object.fromEntries(mission.aircraft.map(x=>[x.id,x]));
  for(const id of flyers){if(!byID[id])return {ok:false,message:'The lineup includes an unrecognized aircraft.'};const s=byID[id].status;if(!['FMC','HQ'].includes(s))return {ok:false,message:id+' is '+s+'. This aircraft cannot fly in this scenario. Replace that block.'};}
  if(level==='status'&&!flyers.some(id=>byID[id].status==='HQ'))return {ok:false,message:'The inspected hangar queen has gone 30 days without flying. Include it in the mission to address utilization.'};
  if(!turns)return {ok:false,message:'Choose four different aircraft for the second wave.'};
  if(turns.some(x=>!flyers.includes(x)))return {ok:false,message:'A turn must come from the aircraft you scheduled to fly first. Fix the turn slots.'};
  return {ok:true,message:level==='wave'?'Six flyers and four valid turns. Monday launches.':'Readiness respected, the 30-day aircraft used, and all four turns come from the flying lineup.'};
 }
 if(level==='phase'){
  const fly=checkGroup(board,'fly',3),phase=checkGroup(board,'phase',1),hold=checkGroup(board,'hold',2);
  if(!fly||!phase||!hold)return {ok:false,message:'Fill all three flying slots, one Phase dock, and two Hold slots with different aircraft.'};
  const all=[...fly,...phase,...hold];if(new Set(all).size!==mission.aircraft.length)return {ok:false,message:'Use each aircraft exactly once.'};
  const byID=Object.fromEntries(mission.aircraft.map(x=>[x.id,x]));
  if(fly.some(id=>byID[id]?.status!=='FMC'||byID[id].hours<24))return {ok:false,message:'One flyer is NMC, due for Phase, or dangerously close to Phase. Use the three aircraft with adequate hours.'};
  if(byID[phase[0]]?.status!=='PHASE')return {ok:false,message:'The aircraft at 0 hours remaining belongs in the Phase dock.'};
  if(hold.some(id=>!['NMCS'].includes(byID[id]?.status)&&byID[id]?.hours>=24))return {ok:false,message:'Hold the supply-NMC aircraft and the FMC aircraft only 12 hours from Phase.'};
  return {ok:true,message:'Phase is protected and the scheduled flyers have adequate hours. You prevented avoidable Phase clustering.'};
 }
 if(level==='doc'){
  const cells={};for(let i=0;i<14;i++){const v=placed(board,'day:'+i);if(v)cells[i+1]=v;}
  const M=library; if(!M?.docDowntimeEvaluate)return {ok:false,message:'Documentation model unavailable.'};
  return M.docDowntimeEvaluate(M.docDowntimeCase(mission.variation),cells);
 }
 if(level==='analysis'){
  const n=placed(board,'num:0'),d=placed(board,'den:0');
  if(n!==mission.metric.num||d!==mission.metric.den)return {ok:false,message:'Check the formula. Identify the required numerator and denominator before calculating.'};
  if(board.resultChoice===null||board.resultChoice===undefined)return {ok:false,message:'Formula correct. Now choose the calculated result from the answer tiles.'};
  if(Math.abs(Number(board.resultChoice)-mission.correct)>0.001)return {ok:false,message:'The formula is correct, but your calculation is not. Use '+mission.numerator+' ÷ '+mission.denominator+(mission.metric.mult===100?' × 100':'')+'.'};
  return {ok:true,message:'Correct. '+mission.metric.name+' = '+mission.numerator+' ÷ '+mission.denominator+(mission.metric.mult===100?' × 100':'')+' = '+mission.correct+(mission.metric.mult===100?'%':'')+'.'};
 }
 if(level==='integrity'||level==='dbm'){
  const marks=new Set(board.marked||[]),correct=new Set(mission.discrepancies);
  if(marks.size!==correct.size||[...marks].some(id=>!correct.has(id)))return {ok:false,message:`Review the two columns again. There are ${correct.size} mismatched records; select only those rows.`};
  if(!board.choice)return {ok:false,needDecision:true,message:level==='integrity'?'All discrepancies located. How will you correct them?':'Unauthorized access found. What is your next controlled action?'};
  if(!mission.choices.find(c=>c.id===board.choice)?.correct)return {ok:false,message:level==='integrity'?'Corrections require source evidence, audit history, authorization, and downstream verification.':'Review approved access and use the controlled access-change process. Preserve an audit trail.'};
  return {ok:true,message:level==='integrity'?'Discrepancies identified. Evidence-based correction and downstream validation selected.':'Unauthorized access identified and controlled investigation selected.'};
 }
 return {ok:false,message:'Choose a mission first.'};
}
return {LEVELS,TERMS,STATUSES,makeMission,evaluate,checkGroup,placed};
});
