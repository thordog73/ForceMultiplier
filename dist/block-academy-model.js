/* Force Multiplier Block Academy 22.10.0 — deterministic, offline exercise models. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FMBlockModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MAX_ROUNDS=90;
const MISSIONS=[
 {id:1,discipline:'Scheduling',title:'Build a 6-Turn-4',subtitle:'Six flyers. Four turns. Launch the wave.',kind:'launch'},
 {id:2,discipline:'Scheduling',title:'Work Around NMC',subtitle:'Protect the flying mission around grounded aircraft.',kind:'launch'},
 {id:3,discipline:'Scheduling',title:'Fix the Phase Flow',subtitle:'Balance utilization without driving aircraft into Phase together.',kind:'launch'},
 {id:4,discipline:'Documentation',title:'Control the Work',subtitle:'Place each requirement, action, and verification in order.',kind:'sequence'},
 {id:5,discipline:'Analysis',title:'Build the Right Rate',subtitle:'Select the valid numerator, denominator, and interpretation.',kind:'sequence'},
 {id:6,discipline:'Data Integrity',title:'Compare Records',subtitle:'Find the true mismatch and choose an auditable correction.',kind:'sequence'},
 {id:7,discipline:'Database & Systems',title:'Restore the System',subtitle:'Apply minimum access, the right scope, and independent checks.',kind:'sequence'}
];
const COLORS=[['#01c9a3','#007a67'],['#f8b440','#d96b16'],['#ed6d7c','#ad295b'],['#609eff','#315ab8'],['#c084ee','#804aba'],['#f8d64b','#c38b1f'],['#1cdbca','#118aab'],['#ff8c61','#bf4c26'],['#a9d873','#4a9a4a'],['#e994db','#a04ba9'],['#7fd6fa','#2580ad'],['#d7b87a','#94723b'],['#a7b3ff','#6261ba'],['#fd9eaa','#d45489'],['#80e9b5','#168573'],['#b6b0ff','#6759bf']];
function color(index){const i=Math.abs(index);if(i<COLORS.length)return COLORS[i];const hue=Math.round((i*137.508)%360);return [`hsl(${hue} 86% 58%)`,`hsl(${hue} 68% 35%)`]}
function tier(round){return round<=15?{name:'Fundamentals',hint:'Learn how to move the blocks. Every action explains a principle.',level:1}:round<=35?{name:'Guided practice',hint:'More constraints. Identify the governing requirement before moving blocks.',level:2}:round<=60?{name:'Applied decisions',hint:'Evaluate competing choices and protect the mission.',level:3}:{name:'Independent proficiency',hint:'Solve a mixed, realistic case before checking the model.',level:4}}
function random(seed){let s=(seed>>>0)||41;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function shuffle(items,rnd){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function seedFor(id,round,variation){return ((id*1103515245)+(round*2654435761)+(variation*7919))>>>0}
function block(id,title,detail,colorIndex,group='steps'){return {id,title,detail,color:color(colorIndex),group}}
function makeLaunch(id,round,variation,rnd){
 const stage=tier(round).level;
 const needFirst=id===1||stage<3?6:stage===3?8:12;
 const needTurn=id===1||stage<3?4:stage===3?6:10;
 const spareRequired=id!==1&&stage>=3;
 const availableCount=needFirst+(id===1?(stage===1?0:Math.min(stage+1,4)):(stage===1?2:stage+3))+(spareRequired?1:0);
 const blockedCount=id===1?0:stage===1?2:stage===2?3:stage===3?4:5;
 const count=availableCount+blockedCount;
 const shuffled=shuffle(Array.from({length:count},(_,i)=>i+1),rnd);
 const blocked=new Set(shuffled.slice(0,blockedCount));
 const statusNames=['NMCM','NMCS','NMCB','PHASE','DEPOT','PFR / MOD'];
 const aircraft=Array.from({length:count},(_,i)=>{
  const n=i+1,blockedAircraft=blocked.has(n),daysIdle=1+Math.floor(rnd()*24),phase=25+Math.floor(rnd()*180);
  return {id:`A${String(n).padStart(2,'0')}`,status:blockedAircraft?statusNames[i%statusNames.length]:'FMC',daysIdle,phaseHours:phase,color:color(i+round+id*3)};
 });
 const available=aircraft.filter(a=>a.status==='FMC');
 let priority=null,limitNearPhase=null;
 if(id===1&&stage>=2||id===2||id===3&&stage>=2){
  const selected=available[Math.floor(rnd()*available.length)];selected.daysIdle=29+Math.floor(rnd()*13);priority=selected.id;
 }
 if(id===3){
  const atRiskCount=Math.min(stage+1,available.length-needFirst);
  const safePool=available.filter(x=>x.id!==priority);
  shuffle(safePool,rnd).slice(0,atRiskCount).forEach((a,i)=>{a.phaseHours=2+Math.floor(rnd()*10)+i});
  limitNearPhase=1;
 }
 const prompt=id===1?'Build a 6-Turn-4. Line up six FMC aircraft and assign four of those aircraft to fly again.':id===2?'Use only available aircraft. Protect your prioritized aircraft and assign the required turns without using grounded assets.':'Keep the Phase Flow healthy. Choose aircraft with adequate hours remaining, include the priority aircraft, and avoid clustering aircraft near Phase.';
 const requirement=priority?`Priority: include ${priority} (${available.find(x=>x.id===priority).daysIdle} idle days).`:id===1?'All selected aircraft must be FMC.':'No NMC, depot, Phase, or planned-down aircraft may fly.';
 return {id,kind:'launch',round,variation,needFirst,needTurn,spareRequired,priority,limitNearPhase,nearPhaseAt:16,aircraft,available,prompt,requirement,slots:[{id:'first',title:'First wave',count:needFirst},{id:'turn',title:'Turn aircraft',count:needTurn},...(spareRequired?[{id:'spare',title:'Protected spare',count:1}]:[])]};
}
const DOC_CASES=[
 {name:'Modification and cure',lead:'The same asset needs PFR and PBB. Plan one controlled cure where the instructions permit.',steps:['Read the controlled work requirements','Confirm asset applicability','Verify parts, tools, skills, and available window','Schedule both work periods in the authorized order','Protect the common 24-hour cure period','Verify completion evidence and close out'],wrong:['Start work before verifying applicability','Treat the cure as flying time','Close out because the aircraft is visible in the hangar']},
 {name:'Recurring inspection',lead:'A recurring inspection is approaching its documented due point.',steps:['Identify the active inspection requirement','Confirm which asset and configuration apply','Compute the due point from approved records','Reserve labor, tools, and a maintenance window','Complete the required inspection','Verify the record and update the next forecast'],wrong:['Reset the due clock without proof','Defer because another aircraft is available','Declare completion before inspection']},
 {name:'Requirement control',lead:'A controlled technical requirement is due for the affected assets.',steps:['Identify the controlling requirement and revision','Determine applicability by asset and configuration','Identify the compliance window and stop-use threshold','Plan the work and resources before the due point','Execute the work against the approved instructions','Verify completion evidence, authorization, and closeout'],wrong:['Assume all fleet assets are affected','Change the compliance due date locally','Ignore the controlling revision']}
];
const METRIC_BANK=[
 ['8-hour fix rate','Breaks fixed within 8 hours','All qualifying breaks','Higher means more breaks fixed quickly'],
 ['Break rate','Qualifying breaks','Flights','Higher means more breaks per flight'],
 ['Repeat rate','Repeat discrepancies','Pilot-reported discrepancies','Higher means more repeat discrepancies per report'],
 ['CANN rate','Cannibalization actions','Flights','Higher means more cannibalizations per flight'],
 ['Mission-capable rate','Mission-capable hours','Possessed hours','Higher means more mission-capable time'],
 ['Ground-abort rate','Ground aborts','Ground attempts','Higher means more aborted ground attempts'],
 ['Air-abort rate','Air aborts','Flights','Higher means more aborted flights'],
 ['Total maintenance NMC rate','Maintenance-only NMC hours + both-status NMC hours','Possessed hours','Higher means more maintenance-driven downtime']
];
const DI_FIELDS=[
 ['Event ID','EV-204','EV-204','EV-240'],
 ['Action taken','Replaced valve','Inspected valve','Repaired wiring'],
 ['Labor hours','2.5','2.5','5.2'],
 ['Start / stop','09:10–10:40','10:40–09:10','09:10–11:40'],
 ['Work unit','Hydraulics','Electrical','Avionics'],
 ['Fault description','Hydraulic leak','Fuel leak','Electrical fault'],
 ['Part number','PN-1042','PN-1402','PN-2041']
];
const DB_CASES=[
 {task:'Read readiness reports for one squadron',role:'Read only',scope:'Squadron reports'},
 {task:'Correct approved maintenance records in one squadron',role:'Record editor',scope:'Squadron records'},
 {task:'Review access logs across the enterprise',role:'Read only',scope:'Enterprise audit'},
 {task:'Repair a failed import mapping for a designated system',role:'System maintainer',scope:'Approved interface'},
 {task:'Disable a departed employee’s former access',role:'Access administrator',scope:'Former user account'}
];
function makeSequence(id,round,variation,rnd){
 const stage=tier(round).level;const seed=seedFor(id,round,variation);let name,prompt,slots=[],pieces=[],detail='';
 if(id===4){const c=DOC_CASES[(round+variation-1)%DOC_CASES.length],asset=`A${String(1+Math.floor(rnd()*24)).padStart(3,'0')}`;name=c.name;detail=`${asset} · Work package ${Math.floor(seed%99)+1}`;prompt=c.lead+' Move each work block into its correct sequence.';
 const length=stage===1?4:stage===2?5:6;
 slots=Array.from({length},(_,i)=>({id:'step'+i,title:`Step ${i+1}`,correct:`step-${i}`}));
 pieces=c.steps.slice(0,length).map((s,i)=>block(`step-${i}`,s,asset,i+round));
 pieces.push(...c.wrong.slice(0,stage-1).map((s,i)=>block(`wrong-${i}`,s,'Not required',i+7+round)));
 }
 if(id===5){const m=METRIC_BANK[(round+variation-1)%METRIC_BANK.length],flights=100+Math.floor(rnd()*400),breaks=5+Math.floor(rnd()*50);name=m[0];detail=`Sample: ${breaks} observed events; ${flights} recorded flights (other time bases may apply).`;prompt=`Which inputs define ${m[0]}? Drag the correct blocks to the three decisions. Numbers alone do not establish the correct denominator.`;
 slots=[{id:'numerator',title:'Numerator',correct:'numerator'},{id:'denominator',title:'Denominator',correct:'denominator'},{id:'meaning',title:'Interpretation',correct:'meaning'}];
 pieces=[block('numerator',m[1],'Count the stated events',round+1),block('denominator',m[2],'Use the proper population/time base',round+2),block('meaning',m[3],'Directional meaning',round+3)];
 const wrongPool=['Flights','Possessed hours','Total active inventory hours','Pilot-reported discrepancies','All breaks','Ground attempts','Completed inspections','Scheduled sorties','All aircraft','Higher means lower unavailability'];
 pieces.push(...shuffle(wrongPool.filter(x=>!pieces.some(p=>p.title===x)),rnd).slice(0,stage===1?1:stage===2?2:3).map((s,i)=>block('wrong-'+i,s,'Plausible but not correct here',round+i+7)));
 }
 if(id===6){const idx=(round+variation-1)%DI_FIELDS.length,f=DI_FIELDS[idx],matching=DI_FIELDS[(idx+3)%DI_FIELDS.length];name='Record reconciliation';detail=`Approved source: ${f[0]} = ${f[1]}. System record: ${f[2]===f[1]?f[3]:f[2]}.`;prompt='Identify the disagreement that the evidence supports; then choose an auditable correction and a downstream check.';
 const mismatchText=`${f[0]} — source ${f[1]} / system ${f[2]===f[1]?f[3]:f[2]}`;
 slots=[{id:'difference',title:'Disagreement',correct:'difference'},{id:'correction',title:'Correction',correct:'correction'},{id:'verify',title:'Verification',correct:'verify'}];
 pieces=[block('difference',mismatchText,'Compare approved source to stored field',round),block('correction','Preserve the original; correct from approved evidence','Controlled record change',round+1),block('verify','Recheck the changed record and downstream reports','Prove the fix propagated',round+2),block('wrong0',`${matching[0]} — equal on both sides`,'Matching evidence is not an error',round+5)];
 if(stage>=2)pieces.push(block('wrong1','Replace evidence with your best guess','Uncontrolled change',round+8));if(stage>=3)pieces.push(block('wrong2','Delete the original record and recreate it','Destroys audit history',round+9));
 }
 if(id===7){const c=DB_CASES[(round+variation-1)%DB_CASES.length];name='Least privilege and verification';detail=`User request: ${c.task}.`;prompt='Assign only the needed role, scope, and post-change verification.';
 slots=[{id:'role',title:'Permission',correct:'role'},{id:'scope',title:'Scope',correct:'scope'},{id:'verify',title:'Verification',correct:'verify'}];
 pieces=[block('role',c.role,'Least authority required by this task',round),block('scope',c.scope,'Do not broaden system or unit reach',round+1),block('verify','Verify the requested workflow and audit log','Independent check of intended effect',round+2)];
 const wrong=['Global administrator','All enterprise records','Skip verification after granting access','Delete access history','Copy an existing employee’s entire profile'];
 pieces.push(...wrong.slice(0,stage===1?1:stage===2?2:stage===3?3:4).map((s,i)=>block('wrong'+i,s,'Exceeds or bypasses the stated control',round+i+5)));
 }
 return {id,kind:'sequence',name,detail,prompt,slots,pieces:shuffle(pieces,rnd),round,variation};
}
function makeChallenge(id,round=1,variation=0){if(!MISSIONS.some(m=>m.id===id))throw Error('Unknown Academy mission');if(!Number.isInteger(round)||round<1||round>MAX_ROUNDS)throw Error('Academy round out of range');const rnd=random(seedFor(id,round,variation));return id<=3?makeLaunch(id,round,variation,rnd):makeSequence(id,round,variation,rnd)}
function emptyPlacements(challenge){return Object.fromEntries(challenge.slots.map(s=>[s.id,Array(s.count||1).fill(null)]))}
function place(challenge,placements,pieceId,slotId,index){const slot=challenge.slots.find(s=>s.id===slotId);if(!slot) return {ok:false,message:'Choose a valid destination.'};const allowed=challenge.kind==='launch'?challenge.aircraft.some(a=>a.id===pieceId):challenge.pieces.some(p=>p.id===pieceId);if(!allowed)return {ok:false,message:'Unknown block.'};if(!Number.isInteger(index)||index<0||index>=(slot.count||1))return{ok:false,message:'Choose an empty slot.'};if(challenge.kind==='launch'){
 const a=challenge.aircraft.find(a=>a.id===pieceId);if(a.status!=='FMC')return{ok:false,message:`${a.id} is ${a.status} and cannot be assigned to fly.`};
 if(slotId==='turn'&&!(placements.first||[]).includes(pieceId))return{ok:false,message:'A turn aircraft must first be in the departure wave.'};
 if(slotId==='spare'&&(placements.first||[]).includes(pieceId))return{ok:false,message:'The protected spare cannot also be scheduled to fly.'};
 if(slotId==='first'&&(placements.spare||[]).includes(pieceId))return{ok:false,message:'Release the aircraft from spare duty before placing it in the first wave.'};
 }
 const out=Object.fromEntries(Object.entries(placements).map(([k,v])=>[k,v.slice()]));
 // Each block is unique per bank; a first-wave aircraft can also occupy one turn slot.
 for(const [k,arr] of Object.entries(out))if(!(challenge.kind==='launch'&&((k==='first'&&slotId==='turn')||(k==='turn'&&slotId==='first'))))for(let i=0;i<arr.length;i++)if(arr[i]===pieceId)arr[i]=null;
 // If removing a first-wave plane, remove the invalidated turn assignment too.
 if(challenge.kind==='launch'&&slotId==='first'){const old=out.first[index];if(old&&old!==pieceId&&out.turn)out.turn=out.turn.map(x=>x===old?null:x)}
 const old=out[slotId]?.[index];if(challenge.kind==='launch'&&slotId==='first'&&old&&out.turn)out.turn=out.turn.map(x=>x===old?null:x);
 out[slotId][index]=pieceId;
 return {ok:true,placements:out};
}
function remove(placements,slotId,index){const out=Object.fromEntries(Object.entries(placements).map(([k,v])=>[k,v.slice()]));if(!out[slotId]||index<0||index>=out[slotId].length)return out;const old=out[slotId][index];out[slotId][index]=null;if(slotId==='first'&&out.turn)out.turn=out.turn.map(x=>x===old?null:x);return out}
function validate(challenge,placements){for(const slot of challenge.slots){const ids=placements[slot.id]||[];if(ids.length!==(slot.count||1)||ids.some(x=>!x))return {ok:false,message:`Fill every ${slot.title.toLowerCase()} slot before checking.`};if(new Set(ids).size!==ids.length)return {ok:false,message:`${slot.title}: the same block cannot be used twice.`};}
 if(challenge.kind==='sequence'){
  for(const slot of challenge.slots){const actual=(placements[slot.id]||[])[0];if(actual!==slot.correct)return{ok:false,message:`Review ${slot.title.toLowerCase()}. The selected block is not supported by the case.`};}return{ok:true,message:'All decisions are supported by the case evidence.'};
 }
 const first=placements.first,turn=placements.turn,spare=(placements.spare||[])[0];
 for(const id of [...first,...turn,...(spare?[spare]:[])]){const a=challenge.aircraft.find(x=>x.id===id);if(!a||a.status!=='FMC')return{ok:false,message:`${id} is not available.`}}
 if(turn.some(id=>!first.includes(id)))return{ok:false,message:'Every turn aircraft must be in the first wave.'};
 if(challenge.spareRequired&&(first.includes(spare)||turn.includes(spare)))return{ok:false,message:'Protect a spare outside the flying lineup.'};
 if(challenge.priority&&!first.includes(challenge.priority))return{ok:false,message:`Include priority aircraft ${challenge.priority} in the first wave.`};
 if(challenge.limitNearPhase!==null){const near=first.filter(id=>challenge.aircraft.find(x=>x.id===id).phaseHours<=challenge.nearPhaseAt).length;if(near>challenge.limitNearPhase)return{ok:false,message:`Too many aircraft would approach Phase together (${near}). Choose aircraft with more hours remaining.`};}
 return{ok:true,message:`Valid ${challenge.needFirst}-Turn-${challenge.needTurn}. Your wave is ready to launch.`};
}
function modelPlacements(challenge){let out=emptyPlacements(challenge);if(challenge.kind==='sequence'){
  for(const s of challenge.slots)out[s.id][0]=s.correct;return out;
 }
 const avail=challenge.available.filter(a=>challenge.limitNearPhase===null||a.phaseHours>challenge.nearPhaseAt).slice().sort((a,b)=>b.daysIdle-a.daysIdle);
 const first=avail.slice(0,challenge.needFirst);if(challenge.priority&&!first.some(x=>x.id===challenge.priority)){const prior=challenge.available.find(x=>x.id===challenge.priority);if(prior&&first.length)first[first.length-1]=prior}
 out.first=first.map(x=>x.id);out.turn=first.slice(0,challenge.needTurn).map(x=>x.id);if(challenge.spareRequired){out.spare=[challenge.available.find(a=>!out.first.includes(a.id))?.id||null]}
 if(!validate(challenge,out).ok)throw Error('No valid model lineup for mission '+challenge.id+' round '+challenge.round);
 return out;
}
return {MAX_ROUNDS,MISSIONS,COLORS,color,tier,makeChallenge,emptyPlacements,place,remove,validate,modelPlacements};
});
