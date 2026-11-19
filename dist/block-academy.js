/* Block Academy 22.11.0: status-colored vertical launch lanes, Phase Flow and sliding puzzles. */
(function(){'use strict';
const B=window.FMBlockModel,M=window.FMModel;
if(!B||!M)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DB_CARDS={
 'Least privilege':'Give a person only the permissions needed for an approved task and scope.',
 'Role-based access':'Authorize capabilities through approved roles rather than copying another person’s privileges.',
 'Access lifecycle':'Grant, periodically review, modify, and revoke access when duties change.',
 'Interface mapping':'Rules that move and translate source data into its destination system.',
 'Failed import':'A data transfer or transformation that must be diagnosed, corrected, and selectively replayed.',
 'Audit trail':'A verifiable history of who changed records or access, and why.',
 'Rollback':'Return a system to an approved known state after an unsafe or failed change.',
 'Recovery verification':'Re-run the original affected user task and check evidence that the service is restored.',
 'Separation of duties':'Split approval, execution, and verification where practical to prevent undetected misuse.',
 'Scope':'The unit, system, or records that a specific access authorization covers.'
};
let callbacks=null,animationToken=0,playingAnimation=false,ignoreClickUntil=0,drag=null;
function ensure(state){
 if(!state.academy||typeof state.academy!=='object')state.academy={};const a=state.academy;
 if(!a.progress||typeof a.progress!=='object')a.progress={};if(!Number.isInteger(a.score)||a.score<0)a.score=0;if(!Number.isInteger(a.lives)||a.lives<0||a.lives>3)a.lives=3;
 if(!B.MISSIONS.some(m=>m.id===a.mission))a.mission=1;
 if(!Number.isInteger(a.round)||a.round<1||a.round>90)a.round=Math.min(90,(a.progress[a.mission]||0)+1);
 if(!Number.isInteger(a.variation)||a.variation<0)a.variation=0;
 if(!['play','victory','retry-needed'].includes(a.stage))a.stage='play';
 if(!a.placements||typeof a.placements!=='object')a.placements=B.emptyPlacements(B.makeChallenge(a.mission,a.round,a.variation));
 return a;
}
function ensureCards(state){const f=state.flashcards||(state.flashcards={});if(!['scheduling','analysis','documentation','integrity','dbm'].includes(f.category))f.category='scheduling';if(!Number.isInteger(f.index)||f.index<0)f.index=0;if(!Number.isInteger(f.orderSeed)||f.orderSeed<0)f.orderSeed=0;return f}
function eCard(m){const [a,b]=m.color||B.color(0);return `style="--tile-a:${a};--tile-b:${b};--tile-border:${m.border||'#b4e7ff99'};--tile-text:${m.textColor||'#ffffff'}"`}
function piece(m,context='tray',extra=''){
 const isAircraft=!!m.status,blocked=isAircraft&&m.status!=='FMC';
 const title=m.title||m.id;
 const detail=isAircraft?(m.status==='FMC'?`FMC · ${m.daysIdle}d idle`:m.status==='HQ'?`HQ · ${m.daysIdle}d idle`:m.status):m.detail;
 return `<button type="button" class="academy-piece ${isAircraft?'academy-aircraft':'academy-decision'} ${blocked?'academy-grounded':''} ${context==='slot'?'in-slot':''}" ${eCard(m)} data-academy-tile="${esc(m.id)}" aria-label="${esc((isAircraft?'Aircraft ':'Block ')+title+'; '+detail)}" ${extra}><strong class="academy-piece-id">${esc(title)}</strong><span class="academy-piece-sub">${esc(detail)}</span>${isAircraft&&m.status==='FMC'?`<small class="academy-phase-hint">${m.phaseHours} h to Phase</small>`:''}</button>`;
}
function statusLegend(){const legend=[['FMC','#08bc70','#73e7aa'],['HQ','#ffffff','#11a567'],['NMCM','#f2475d','#ffb7c1'],['NMCS','#ffe268','#ffe68e'],['NMCB','#ffad52','#ffd19a'],['PHASE','#ac54e6','#c990f7'],['DEPOT','#18212c','#77818e'],['PFR / PBG / CURE','#fff','#1a222e']];
 return `<div class="academy-legend">${legend.map(([name,fill,border])=>`<span><i style="background:${fill};border-color:${border}"></i>${name}</span>`).join('')}<span>FMC lightens each idle day; day 30 = HQ.</span></div>`}
function mainHome(state){
 const a=ensure(state),total=B.MISSIONS.reduce((n,m)=>n+Math.min(90,Number(a.progress[m.id]||0)),0),next=B.MISSIONS.find(m=>(a.progress[m.id]||0)<90)||B.MISSIONS[0],allDone=total===630;
 return `<div class="academy-view academy-home"><section class="academy-hero"><div class="academy-kicker">MAINTENANCE MANAGEMENT · BLOCK ACADEMY</div><div class="academy-hero-plane" aria-hidden="true">✈</div><h1>REVENGE OF<br><em>THE NONNER</em></h1><p>Slide the blocks. Solve the maintenance problem. Launch the right aircraft.</p><button class="academy-cta" ${next.id===5&&window.FMAcademyAnalysis?'data-al-track="rates"':'data-academy-mission="'+next.id+'"'}>▶ PLAY NEXT MISSION · ${esc(next.title)}</button><div class="academy-footline">NO TIMER · works offline · drag or slide · progress saved</div>${allDone?'<p class="academy-graduation">Congratulations — you achieved NON-NON STATUS!</p>':''}</section><section class="academy-summary"><div><strong>${total}/630</strong><span>mission repetitions</span></div><div><strong>${B.MISSIONS.filter(m=>a.progress[m.id]>=90).length}/7</strong><span>missions completed</span></div></section>
 <section class="academy-sidequest"><div><span class="academy-kicker">BONUS · 90 SLIDING PUZZLES</span><h2>Clear the Launch Lane</h2><p>Move tall aircraft and maintenance blocks along their tracks. Free the green aircraft so it can pass through the top door.</p><span>${a.slideProgress||0}/90 sliding puzzles complete · no timer</span></div><button class="academy-outline" data-route="academy:slide">▶ SLIDE BLOCKS</button></section>
 <div class="academy-sectionhead"><div><small>THE SEVEN-MISSION CAMPAIGN</small><h2>Pick a puzzle</h2></div><button class="academy-outline" data-route="flashcards:home">▣ Flashcards</button></div><div class="academy-mission-list">${B.MISSIONS.map(m=>{const done=a.progress[m.id]||0,idx=m.id-1;return `<button class="academy-mission" ${m.id===5&&window.FMAcademyAnalysis?'data-al-track="rates"':'data-academy-mission="'+m.id+'"'}><span class="academy-mission-icon" style="--tile-a:${B.color(idx*2)[0]};--tile-b:${B.color(idx*2)[1]}">${['✈','▦','◩','▤','⌁','✓','⚙'][idx]}</span><span class="academy-mission-details"><small>${m.id} · ${esc(m.discipline.toUpperCase())}</small><strong>${esc(m.title)}</strong><span>${esc(m.subtitle)}</span><span class="academy-progress-track"><i style="width:${Math.floor(done/90*100)}%"></i></span></span><span class="academy-count">${done}/90</span></button>`}).join('')}</div>${window.FMAcademyAnalysis?window.FMAcademyAnalysis.homeCards(state):''}<section class="academy-deeper"><h2>Advanced simulators</h2><p>All existing skill trainers and the 90-day Scheduling Capstone remain available.</p><div class="academy-deeper-links">${[['scheduling','Scheduling'],['analysis','Analysis'],['doc','Documentation'],['integrity','Data Integrity'],['dbm','Database & Systems']].map(([k,v])=>`<button data-route="${k}:home">${esc(v)} →</button>`).join('')}</div></section></div>`;
}
function slotView(s,p,ch){const ids=p[s.id]||[],count=s.count||1;return `<section class="academy-blockbank"><header class="academy-blockbank-head"><h3>${esc(s.title)}</h3><span>${ids.filter(Boolean).length}/${count}</span></header><div class="academy-slots ${ch.kind==='launch'?'academy-wave-slots academy-'+s.id+'-slots':'academy-task-slots'}">${Array.from({length:count},(_,i)=>{const id=ids[i],m=ch.kind==='launch'?ch.aircraft.find(x=>x.id===id):ch.pieces.find(x=>x.id===id);return `<div class="academy-slot ${m?'occupied':''}" data-academy-slot="${s.id}:${i}" role="button" tabindex="0" aria-label="${esc(s.title)}, slot ${i+1}, ${m?m.title||m.id:'empty'}">${m?piece(m,'slot')+`<button class="academy-slot-remove" data-academy-remove="${s.id}:${i}" aria-label="Remove ${esc(m.title||m.id)}">×</button>`:`<span class="academy-placeholder">${i+1}<small>＋</small></span>`}</div>`}).join('')}</div></section>`}
function runway(ch,p){const first=p.first||[],day=ch.day||'Monday';return `<div class="academy-runway" aria-label="${esc(day)} launch door; aircraft launch upward and pass through it"><div class="academy-door-frame"><div class="academy-door-sign">${esc(day.toUpperCase())} DOOR</div><div class="academy-doorway"><span aria-hidden="true">✈</span></div></div><div class="academy-runway-stripes" aria-hidden="true"></div>${playingAnimation?first.map((id,i)=>{const m=ch.aircraft.find(x=>x.id===id);return `<div class="academy-taxi" style="--taxi-index:${i};--tile-a:${m.color[0]};--tile-b:${m.color[1]};--tile-text:${m.textColor}"><strong>${esc(id)}</strong><span>✈</span></div>`}).join(''):`<div class="academy-waiting">${first.filter(Boolean).length} aircraft queued · launch through door ↑</div>`}</div>`}
function currentChallenge(a){return B.makeChallenge(a.mission,a.round,a.variation)}
function phaseFlow(ch,placed,a){
 if(ch.id!==3)return '';
 const selected=new Set([...(placed.first||[]),...(placed.turn||[]),...(placed.spare||[])]),ordered=ch.aircraft.slice().sort((a,b)=>a.phaseHours-b.phaseHours);
 const display=a.phaseExpanded?ordered:[...ordered.filter(x=>selected.has(x.id)),...ordered.filter(x=>!selected.has(x.id))].slice(0,12);
 const longest=Math.max(100,...ordered.map(x=>x.phaseHours));
 return `<section class="academy-phase-flow" aria-label="Phase Flow: current hours remaining for every aircraft"><header><div><h2>Phase Flow</h2><p>Shorter bar = closer to Phase. Tap a bar to select an aircraft; bars update with scheduled sorties.</p></div><button type="button" class="academy-outline" data-academy-action="phase-toggle">${a.phaseExpanded?'Show fewer':'Show all'} (${ch.aircraft.length})</button></header><div class="academy-phase-rows">${display.map(m=>{const plannedFlights=(placed.first||[]).includes(m.id)?1+((placed.turn||[]).includes(m.id)?1:0):0,projected=Math.max(0,m.phaseHours-plannedFlights*(ch.flightHoursPerSortie||2)),width=Math.max(2,Math.min(100,projected/longest*100));return `<button class="academy-phase-row ${selected.has(m.id)?'picked':''}" data-academy-focus-aircraft="${esc(m.id)}" aria-label="${esc(m.id)}, ${m.phaseHours} hours remaining now${plannedFlights?`, ${projected} hours projected after the planned sorties`:``}"><b>${esc(m.id)}</b><span class="academy-phase-track"><i style="width:${width.toFixed(1)}%"></i></span><strong title="${m.phaseHours} h current">${projected} h</strong></button>`}).join('')}</div><div class="academy-phase-foot">${selected.size} aircraft selected · Plan uses ${ch.flightHoursPerSortie} h per sortie · max 1 flyer at ${ch.nearPhaseAt} h or less</div></section>`;
}
function modFlow(ch){if(!ch.paintFlow)return '';
 const day=(cells)=>`<div class="academy-mod-days">${cells.map(([label,block])=>`<div><small>${label}</small><strong class="${block==='PFR'||block==='PBG'||block==='CURE'?'academy-mod-white':''}">${block}</strong></div>`).join('')}</div>`;
 return `<section class="academy-mod-panel"><div class="academy-kicker">WORK SEQUENCING · 2 WORKDAYS EACH + 24-HOUR CURE</div><h2>Save Downtime</h2><p>Combine Paint From Red (PFR) and Paint Back Green (PBG) when the controlling instructions allow. One cure after both periods instead of two separate cures. A cure can run through a weekend if authorized.</p><div class="academy-mod-example bad"><b>✕ Separate cure periods</b>${day([['Mon','PFR'],['Tue','PFR'],['Wed','CURE'],['Thu','PBG'],['Fri','PBG'],['Sat','CURE'],['Sun','—']])}</div><div class="academy-mod-example good"><b>✓ Combined plan · one cure</b>${day([['Mon','PFR'],['Tue','PFR'],['Wed','PBG'],['Thu','PBG'],['Fri','CURE'],['Sat','—'],['Sun','—']])}</div><div class="academy-happiness">The H in Documentation stands for Happiness.</div></section>`;
}
// One-screen Academy presentation. All decisions still use FMBlockModel.
function focusSize(){
 const w=window.innerWidth||390,h=window.innerHeight||844,landscape=w>h&&h<520;
 const tiny=w<780&&!landscape&&h<620;return {w,h,tiny,small:h<700,aircraft:tiny?2:h<740?3:6,decisions:h<700?1:2,slots:tiny?1:h<700?2:3,launchSlots:w<780&&!landscape?(tiny?4:h<740?6:12):12,landscape};
}
function ensureFocus(a){
 if(!Array.isArray(a.undo))a.undo=[];
 if(!Number.isInteger(a.bankPage)||a.bankPage<0)a.bankPage=0;
 if(!Number.isInteger(a.slotPage)||a.slotPage<0)a.slotPage=0;if(!Number.isInteger(a.wavePage)||a.wavePage<0)a.wavePage=0;
 if(!['first','turn','spare'].includes(a.wave))a.wave='first';
 return a;
}
function rememberPlan(a){a.undo.push(M.clone(a.placements));a.undo=a.undo.slice(-40)}
function focusHeader(title,round,state,isSlide=false){
 const c=state.teaching||{},stage=window.FMTeaching?.labels?.[c.stage||0]||'Show Me';
 return `<header class="af-topbar"><button type="button" data-route="academy:home" aria-label="Return to the Block Academy campaign">← Campaign</button><div class="af-round-label"><strong>${esc(title)}</strong><span>${isSlide?'SLIDE PUZZLE':'REPETITION'} ${round}/90 · <span class="af-mode-label">${esc(stage)}</span></span></div><button type="button" data-af-help="rules" aria-label="Open game help and options">Help / menu</button></header>`;
}
function focusGoal(ch){
 if(ch.kind==='launch')return `${ch.day}: ${ch.needFirst} FMC flyers · ${ch.needTurn} turns${ch.spareRequired?' · 1 separate spare':''}.`;
 if(ch.id===4)return ch.paintFlow?'Check the requirement → PFR → PBG → one cure. Build the authorized work sequence.':ch.prompt.replace(' Move each work block into its correct sequence.','');
 if(ch.id===5)return `Build ${ch.name}: choose its numerator, denominator and interpretation.`;
 if(ch.id===6)return 'Compare → correct from evidence → verify.';
 return 'Set minimum permission → scope → verify.';
}
function focusEvidence(ch){
 if(ch.kind!=='launch')return ch.detail;
 return `${ch.priority?'Priority '+ch.priority+' (29d idle). ':''}${ch.id===3?'Max 1 flyer at ≤16h Phase; 2h/sortie.':'Turns reuse first-wave aircraft.'}`;
}
function focusHint(ch){return ch.kind==='launch'?`Only FMC aircraft may fly. Every turned aircraft must be in the first wave. ${ch.requirement||''}${ch.limitNearPhase!==null?' Schedule at most one aircraft with 16 or fewer hours to Phase, and preserve enough hours for each assigned sortie.':''}`:ch.paintFlow?'Place PFR and PBG before ONE 24-hour cure, only where the controlling instructions allow. Close out after the required cure.':ch.id===5?'Use the correct population for this metric. The denominator is not always flights.':ch.id===6?'Compare the stored value to the approved source, preserve the original and retain an audit trail.':ch.id===7?'Choose minimum permissions and scope, then verify the requested workflow.':'Follow the controlling requirement and verify closeout.'}
function focusDetail(m,ch,a){
 if(!m)return 'Tap a block, then tap a destination. Dragging also works.';
 if(ch.kind!=='launch')return `${m.title}. ${m.detail||''}`;
 const flights=(a.placements.first||[]).includes(m.id)?1+((a.placements.turn||[]).includes(m.id)?1:0):0;
 return `${m.id} · ${m.status} · idle ${m.daysIdle}d · Phase ${m.phaseHours}${flights?'→'+Math.max(0,m.phaseHours-flights*(ch.flightHoursPerSortie||2)):''}h${ch.priority===m.id?' · PRIORITY':''}.`;
}
function focusCandidate(m,ch,a){
 const flights=(a.placements.first||[]).includes(m.id)?1+((a.placements.turn||[]).includes(m.id)?1:0):0;const aircraft=ch.kind==='launch',chosen=a.selectedPiece===m.id,assigned=Object.values(a.placements).some(ids=>ids.includes(m.id));
 return `<button type="button" class="af-candidate ${aircraft?'af-aircraft':'af-decision'} ${chosen?'selected':''} ${assigned?'assigned':''}" ${eCard(m)} data-academy-tile="${esc(m.id)}" aria-pressed="${chosen}" aria-label="${esc(focusDetail(m,ch,a))}"><strong>${esc(aircraft?m.id:m.title)}</strong>${aircraft?`<span>${esc(m.status)}${ch.priority===m.id?' · PRIORITY':''}</span><small>${m.daysIdle}d idle · ${m.phaseHours}${flights?'→'+Math.max(0,m.phaseHours-flights*(ch.flightHoursPerSortie||2)):''}h Phase</small>`:`<small>${esc(m.detail)}</small>`}${assigned?'<span class="af-used">In plan</span>':''}</button>`;
}
function focusSlot(s,i,ch,a,sequence=false){
 const id=a.placements[s.id]?.[i],items=ch.kind==='launch'?ch.aircraft:ch.pieces,m=items.find(p=>p.id===id),key=s.id+':'+i,legal=!!a.selectedPiece&&B.place(ch,a.placements,a.selectedPiece,s.id,i).ok;
 return `<button type="button" class="af-slot ${sequence?'af-sequence-slot':''} ${m?'filled':''} ${a.focusSlot===key?'selected':''} ${legal?'legal':''}" data-academy-slot="${key}" aria-label="${esc(s.title+' '+(i+1)+(m?': '+(m.title||m.id):': empty')+(a.selectedPiece?'. Place selected block here.':'. Select this cell.'))}"${m?eCard(m):''}><small>${sequence?esc(s.title):i+1}</small><strong>${esc(m?(m.title||m.id):sequence?'Tap a block, then here':'＋')}</strong>${m&&ch.kind==='launch'?`<span>${esc(m.status)}</span>`:''}</button>`;
}
function focusPager(attr,page,pages,label){return `<div class="af-pager" role="group" aria-label="${esc(label)}"><button type="button" data-${attr}="-1" ${page<=0?'disabled':''} aria-label="Previous ${esc(label)}">‹</button><span>${page+1}/${pages}</span><button type="button" data-${attr}="1" ${page>=pages-1?'disabled':''} aria-label="Next ${esc(label)}">›</button></div>`}
function focusPhaseBoard(ch,a,size){
 if(ch.id!==3||!window.FMAcademyPhase)return focusBoard(ch,a,size);
 const view=a.phaseView==='assignments'?'assignments':'chart',parts=a.focusSlot?.split(':'),selected=a.selectedPiece||(parts?a.placements[parts[0]]?.[Number(parts[1])]:null);
 const tabs=`<nav class="af-phase-tabs" aria-label="Phase Flow workspace"><button type="button" data-af-phase-view="chart" class="${view==='chart'?'active':''}" aria-pressed="${view==='chart'}">Phase Flow</button><button type="button" data-af-phase-view="assignments" class="${view==='assignments'?'active':''}" aria-pressed="${view==='assignments'}">Assignments</button></nav>`;
 const quick=`<div class="af-phase-quick" role="group" aria-label="Add the selected aircraft to a wave">${ch.slots.map(s=>`<button type="button" data-af-phase-place="${s.id}" ${!a.selectedPiece||playingAnimation?'disabled':''} aria-label="Add selected aircraft to ${esc(s.title)}; ${(a.placements[s.id]||[]).filter(Boolean).length} of ${s.count} assigned"><span>＋ ${esc(s.title)}</span><strong>${(a.placements[s.id]||[]).filter(Boolean).length}/${s.count}</strong></button>`).join('')}</div><p class="af-phase-instruction">${a.selectedPiece?`Add ${esc(a.selectedPiece)} to a wave. Hours update with your plan.`:'Choose an aircraft below, then add it to a wave.'}</p>`;
 return `<section class="af-phase-work" data-phase-view="${view}" aria-label="Live Phase Flow and assignments">${tabs}${view==='assignments'?focusBoard(ch,a,size):`<div class="af-phase-chart">${window.FMAcademyPhase.render(ch,a.placements,{selected})}${quick}${playingAnimation?'<div class="af-launching" role="status">✈ Wave checked. Launching…</div>':''}</div>`}</section>`;
}
function focusBoard(ch,a,size){
 if(ch.kind==='launch'){
  if(!ch.slots.some(s=>s.id===a.wave))a.wave='first';const slot=ch.slots.find(s=>s.id===a.wave),pages=Math.ceil(slot.count/size.launchSlots);a.wavePage=Math.max(0,Math.min(pages-1,a.wavePage));const start=a.wavePage*size.launchSlots;
  return `<section class="af-board academy-board" aria-label="Aircraft assignments"><nav class="af-wave-tabs" aria-label="Assignment group">${ch.slots.map(s=>`<button type="button" data-af-wave="${s.id}" class="${a.wave===s.id?'active':''}" aria-pressed="${a.wave===s.id}"><span>${esc(s.title)}</span><strong>${(a.placements[s.id]||[]).filter(Boolean).length}/${s.count}</strong></button>`).join('')}</nav><div class="af-board-note"><span>${esc(ch.day.toUpperCase())} DOOR ↑</span><span>${a.wave==='turn'?'Reuse first-wave aircraft':a.wave==='spare'?'Keep outside both flying waves':'Tap a block → a square'}</span>${pages>1?focusPager('af-wave-page',a.wavePage,pages,'assignment cells'):''}</div><div class="af-slotgrid" aria-label="${esc(slot.title)}">${Array.from({length:Math.min(size.launchSlots,slot.count-start)},(_,i)=>focusSlot(slot,start+i,ch,a)).join('')}</div>${playingAnimation?'<div class="af-launching" role="status">✈ Wave checked. Launching…</div>':''}</section>`;
 }
 const pages=Math.ceil(ch.slots.length/size.slots);a.slotPage=Math.max(0,Math.min(pages-1,a.slotPage));const start=a.slotPage*size.slots;
 return `<section class="af-board academy-board" aria-label="Work plan destinations"><div class="af-sequence-head"><div><strong>Build your plan</strong><span>${Object.values(a.placements).flat().filter(Boolean).length}/${ch.slots.length} filled · ${ch.paintFlow?'Save Downtime':esc(ch.name)}</span></div>${focusPager('af-slot-page',a.slotPage,pages,'destinations')}</div><div class="af-sequence-list">${ch.slots.slice(start,start+size.slots).map(s=>focusSlot(s,0,ch,a,true)).join('')}</div><div class="af-board-note">Tap a block → tap a destination. Tap a filled cell to inspect or clear it.</div></section>`;
}
function focusBankCount(ch,size){return ch.kind==='launch'?(ch.id===3&&size.w<780&&!size.landscape?Math.min(3,size.aircraft):size.aircraft):size.decisions;}
function focusBank(ch,a,size){
 const items=ch.kind==='launch'?ch.aircraft:ch.pieces,count=focusBankCount(ch,size),pages=Math.ceil(items.length/count);a.bankPage=Math.max(0,Math.min(pages-1,a.bankPage));
 const focusId=a.selectedPiece||(a.focusSlot?a.placements[a.focusSlot.split(':')[0]]?.[Number(a.focusSlot.split(':')[1])]:null),selected=items.find(m=>m.id===focusId);
 return `<section class="af-bank academy-bank" aria-label="Available blocks"><header class="af-bank-head"><div><strong>${ch.kind==='launch'?'Choose an aircraft':'Choose a decision'}</strong><span>${a.bankPage*count+1}–${Math.min(items.length,(a.bankPage+1)*count)} of ${items.length}</span></div>${focusPager('af-bank-page',a.bankPage,pages,'blocks')}</header><div class="af-candidates ${ch.kind} ${count<=3?'compact':''}">${items.slice(a.bankPage*count,(a.bankPage+1)*count).map(m=>focusCandidate(m,ch,a)).join('')}</div></section>`;
}
function focusHelp(state,ch,isSlide=false){
 const a=ensureFocus(ensure(state)),panel=a.focusPanel||'rules',open=!!a.focusPanel;
 const isPhase=panel==='phase-live'||panel==='phase',phaseLive=!isSlide&&ch.id===3&&window.FMAcademyPhase?window.FMAcademyPhase.render(ch,a.placements,{expanded:true,selected:a.selectedPiece}):'';
 const coach=window.FMTeaching?window.FMTeaching.renderCoach(state):'<p>Open a fundamentals lesson from the campaign to review this skill.</p>';
 const rules=isSlide?`<p>Tap a block, then use the large arrows. You can also drag along its track. Clear a path for the green FMC aircraft to the top door.</p><p>Undo reverses your last move. There is no timer.</p>`:`<p>${esc(ch.prompt)}</p><p><b>${esc(ch.detail||ch.requirement||'')}</b></p><ol><li>Select a block. Its full details appear below the choices.</li><li>Tap a destination. A highlighted outline shows where the selected block can be placed.</li><li>Use the group tabs or page arrows to view other choices without scrolling.</li><li>To replace a filled cell, select a new block and tap that cell. To remove a block, select its cell and use Clear.</li><li>Undo reverses placements and removals, including dependent turn assignments.</li></ol>${ch.kind==='launch'?'<p>The idle-day / HQ thresholds and sortie durations here are simplified game rules.</p>':''}`;
 const coachNotice=state.teaching?.notice||'';
 return `<div class="af-overlay" ${open?'':'hidden'}><section class="af-dialog" role="dialog" aria-modal="true" aria-labelledby="af-help-title"><header><h2 id="af-help-title">${panel==='coach'?'Training coach':isPhase?'Phase Flow':panel==='feedback'?'Decision feedback':'Help & options'}</h2><button type="button" data-af-help="close" aria-label="Close help and return to the game">✕ Back to game</button></header><nav class="af-help-tabs" aria-label="Help topic"><button type="button" data-af-help="rules" aria-pressed="${panel==='rules'}">How to play</button><button type="button" data-af-help="coach" aria-pressed="${panel==='coach'}">Teach this skill</button>${!isSlide&&ch.id===3?`<button type="button" data-af-help="phase-live" aria-pressed="${isPhase}">Phase Flow</button>`:''}</nav><div class="af-dialog-body"><div ${panel==='rules'?'':'hidden'}>${rules}${statusLegend()}${!isSlide?modFlow(ch):''}<div class="af-help-actions">${isSlide?'<button type="button" data-slide-action="hint">Hint</button><button type="button" data-slide-action="reset">Reset puzzle</button>':'<button type="button" data-academy-action="hint">Hint</button><button type="button" data-academy-action="model">Show model</button><button type="button" data-academy-action="reset">Reset repetition</button><button type="button" data-academy-action="variation">New variation</button>'}<button type="button" data-route="flashcards:home">Flashcards</button><button type="button" data-action="sound">${state.sound?'Sound on':'Sound off'}</button></div>${a.hint&&!isSlide?`<div class="academy-help"><strong>Hint</strong><p>${esc(focusHint(ch))}</p></div>`:''}<p>${isSlide?esc(a.slide?.message||''):a.assisted?'A model was shown. Reset or retry before earning independent completion credit.':''}</p></div><div ${panel==='coach'?'':'hidden'}>${coach}</div><div ${isPhase?'':'hidden'}>${phaseLive}<div ${phaseLive?'hidden aria-hidden="true"':''}>${!isSlide?phaseFlow(ch,a.placements,a):''}</div></div><div ${panel==='feedback'?'':'hidden'}><p>${esc(coachNotice||(isSlide?a.slide?.message:a.message)||(!isSlide&&a.selectedPiece?focusDetail((ch.kind==='launch'?ch.aircraft:ch.pieces).find(m=>m.id===a.selectedPiece),ch,a):'No feedback yet.'))}</p></div>${coachNotice&&panel!=='coach'?`<p class="teach-coach-notice" role="status">${esc(coachNotice)}</p>`:''}</div><footer><button type="button" class="af-primary" data-af-help="close">Return to the game</button></footer></section></div>`;
}
function focusStatus(message,good=false,hasDetails=false){
 const text=message||'Select a block, then tap a destination.';
 return `<div class="af-status ${good?'good':''}" role="status" aria-live="polite"><span>${esc(text)}</span>${hasDetails?'<button type="button" data-af-help="feedback" aria-label="Read full decision feedback">Details</button>':''}</div>`;
}
function focusResult(state,a,ch,mission){
 const won=a.stage==='victory',complete=a.progress[a.mission]||0;
 return `<div class="academy-view af-shell af-result">${focusHeader(mission.title,a.round,state)}<section class="academy-result"><div class="academy-result-icon">${won?'✓':'↻'}</div><h1>${won?(ch.kind==='launch'?ch.day.toUpperCase()+' WAVE LAUNCHED':'MISSION COMPLETE'):'TRY AGAIN'}</h1><p>${won?(a.assisted?'Model demonstration complete. Repeat independently for completion credit.':`Repetition ${a.round} complete. Progress saved: ${complete}/90.`):esc(a.message||'Review your plan and try again.')}</p><button class="academy-cta" data-academy-action="${won&&!a.assisted?'continue':'retry'}">${won&&!a.assisted?'Next repetition →':'Try independently →'}</button><button class="academy-outline" data-route="academy:home">Return to campaign</button></section>${focusHelp(state,ch)}</div>`;
}
function playView(state){
 const a=ensureFocus(ensure(state)),mission=B.MISSIONS.find(m=>m.id===a.mission),ch=currentChallenge(a),size=focusSize();
 if(a.stage!=='play')return focusResult(state,a,ch,mission);
 const selectedBlock=(ch.kind==='launch'?ch.aircraft:ch.pieces).find(m=>m.id===a.selectedPiece);const focusParts=a.focusSlot?.split(':'),canClear=focusParts&&a.placements[focusParts[0]]?.[Number(focusParts[1])],fullMessage=state.teaching?.notice||a.message|| (selectedBlock?'Selected: '+focusDetail(selectedBlock,ch,a):'Select a block, then tap a destination.'),limit=size.w<350?50:size.w<780?76:140,summary=fullMessage.length>limit?fullMessage.slice(0,limit-3)+'…':fullMessage;
 return `<div class="academy-view academy-play af-shell af-play ${size.small?'af-small':''}" data-kind="${ch.kind}">${focusHeader(mission.title,a.round,state)}<section class="af-objective"><div class="af-meta"><h1>${esc(ch.kind==='launch'?ch.needFirst+'-Turn-'+ch.needTurn:mission.discipline)}</h1><span aria-label="${a.lives} lives remaining">LIVES ${'♥'.repeat(a.lives)} · ${a.score} pts</span></div><p>${esc(focusGoal(ch))}</p><div class="af-case">${esc(focusEvidence(ch))}</div></section><div class="af-workspace">${focusPhaseBoard(ch,a,size)}${focusBank(ch,a,size)}</div><footer class="af-dock">${focusStatus(summary,!!a.messageGood,fullMessage.length>limit)}<div class="af-actions academy-game-actions"><button type="button" data-academy-action="undo" ${!a.undo.length||playingAnimation?'disabled':''}>↶ Undo</button><button type="button" class="af-primary" data-academy-action="check" ${playingAnimation?'disabled':''}>${playingAnimation?'Launching…':ch.kind==='launch'?'✈ Check & launch':'✓ Check plan'}</button><button type="button" data-academy-action="clear" ${!canClear||playingAnimation?'disabled':''} aria-label="Clear the selected destination">Clear</button></div></footer>${focusHelp(state,ch)}</div>`;
}
function slideView(state){
 const a=ensureFocus(ensure(state)),slide=ensureSlide(a),ch=B.makeSlideChallenge(slide.round),selected=ch.pieces.find(p=>p.id===slide.selected)||ch.pieces[0],size=focusSize(),msg=state.teaching?.notice||slide.message||'Tap a block, then use the arrows to move it.',brief=msg.length>120?msg.slice(0,117)+'…':msg;
 return `<div class="academy-view academy-slide-view af-shell af-slide ${size.small?'af-small':''}">${focusHeader('Clear the Launch Lane',slide.round,state,true)}<section class="af-objective"><div class="af-meta"><h1>Clear the Launch Lane</h1><span>${slide.moves} moves · NO TIMER</span></div><p>Move the green FMC aircraft to the top door. Slide blockers sideways.</p></section><div class="af-workspace"><section class="af-slide-board"><div class="academy-slide-door">↑ FMC LAUNCH DOOR ↑</div><div class="academy-slide-grid" role="group" aria-label="Six by six sliding block puzzle">${ch.pieces.map(p=>{const xy=slide.positions[p.id],style=`left:${xy.x/6*100}%;top:${xy.y/6*100}%;width:${(p.axis==='h'?p.length:1)/6*100}%;height:${(p.axis==='v'?p.length:1)/6*100}%;--tile-a:${p.color[0]};--tile-b:${p.color[1]};--tile-border:${p.border};--tile-text:${p.textColor}`;return `<button type="button" class="academy-slide-piece ${p.axis==='v'?'vertical':'horizontal'} ${p.goal?'goal':''} ${slide.selected===p.id?'selected':''}" style="${style}" data-slide-piece="${p.id}" aria-label="${p.aircraft} ${p.status}. Move ${p.axis==='v'?'up or down':'left or right'}." aria-pressed="${slide.selected===p.id}"><strong>${p.aircraft}</strong><span>${p.status}</span><small>${p.axis==='v'?'↕':'↔'}</small></button>`}).join('')}</div></section><section class="af-slide-side"><div class="af-selected"><span>SELECTED BLOCK</span><p><b>${esc(selected.aircraft)} · ${esc(selected.status)}</b> · ${selected.axis==='h'?'Move left or right':'Move up or down'}</p></div><div class="academy-slide-controls"><div class="academy-slide-arrows" role="group" aria-label="Move the selected block"><button type="button" ${selected.axis==='h'&&!slide.solved?'':'disabled'} data-slide-nudge="-1" aria-label="Slide left">←</button><button type="button" ${selected.axis==='v'&&!slide.solved?'':'disabled'} data-slide-nudge="-1" aria-label="Slide up">↑</button><button type="button" ${selected.axis==='v'&&!slide.solved?'':'disabled'} data-slide-nudge="1" aria-label="Slide down">↓</button><button type="button" ${selected.axis==='h'&&!slide.solved?'':'disabled'} data-slide-nudge="1" aria-label="Slide right">→</button></div></div>${focusStatus(slide.solved?'✓ FMC AIRCRAFT CLEARED THE DOOR!':brief,slide.solved,msg.length>120)}<div class="af-actions academy-slide-actions"><button type="button" data-slide-action="undo" ${!slide.undo?.length||slide.solved?'disabled':''}>↶ Undo</button>${slide.solved?`<button type="button" class="af-primary" data-slide-action="next">${slide.round===90?'Campaign':'Next puzzle →'}</button>`:'<button type="button" data-slide-action="reset">Reset</button><button type="button" data-slide-action="hint">Hint</button>'}</div><p class="af-slide-tip">Tap + arrows or drag along the track. Your progress saves on this device.</p></section></div>${focusHelp(state,ch,true)}</div>`;
}

function focusClick(dataset,state,ui){
 if(state.module!=='academy')return false;
 const a=ensureFocus(ensure(state)),size=focusSize();
 if(dataset.afHelp!==undefined){
  a.focusPanel=dataset.afHelp==='close'?null:dataset.afHelp;
  if(a.focusPanel==='coach'&&window.FMTeaching){const c=window.FMTeaching.ensure(state);c.open=true;c.academyModeActive=true;}
  ui.save();ui.render();return true;
 }
 if(dataset.afPhaseView!==undefined){
  if(a.mission===3&&['chart','assignments'].includes(dataset.afPhaseView))a.phaseView=dataset.afPhaseView;
  ui.save();ui.render();return true;
 }
 if(dataset.afPhasePlace!==undefined){
  const ch=currentChallenge(a),slot=ch.slots.find(s=>s.id===dataset.afPhasePlace);
  if(ch.id!==3||!slot||a.stage!=='play'||playingAnimation)return true;
  const id=a.selectedPiece,assigned=a.placements[slot.id]||[];
  if(!id){a.message='Choose an aircraft below, then add it to a wave.';a.messageGood=false;ui.save();ui.render();return true;}
  const existing=assigned.indexOf(id);
  if(existing!==-1){a.focusSlot=slot.id+':'+existing;a.message=id+' is already in '+slot.title+'. Its assignment is unchanged.';a.messageGood=true;ui.save();ui.render();return true;}
  const index=Array.from({length:slot.count},(_,i)=>i).find(i=>!assigned[i]);
  if(index===undefined){a.message=slot.title+' is full. Open Assignments and clear a cell before adding another aircraft.';a.messageGood=false;ui.save();ui.render();return true;}
  a.wave=slot.id;a.wavePage=Math.floor(index/size.launchSlots);placeAt(state,id,slot.id,index,ui);return true;
 }
 if(dataset.afWave){
  const ch=currentChallenge(a);if(ch.slots.some(s=>s.id===dataset.afWave)){a.wave=dataset.afWave;a.wavePage=0;a.focusSlot=null;if(ch.id===3)a.phaseView='assignments';}
  ui.save();ui.render();return true;
 }
 if(dataset.afWavePage!==undefined){const ch=currentChallenge(a),slot=ch.slots.find(s=>s.id===a.wave)||ch.slots[0],pages=Math.ceil(slot.count/size.launchSlots);a.wavePage=Math.max(0,Math.min(pages-1,a.wavePage+Number(dataset.afWavePage)));ui.save();ui.render();return true;}
 if(dataset.afBankPage!==undefined){
  const ch=currentChallenge(a),items=ch.kind==='launch'?ch.aircraft:ch.pieces,count=focusBankCount(ch,size),pages=Math.ceil(items.length/count);
  a.bankPage=Math.max(0,Math.min(pages-1,a.bankPage+Number(dataset.afBankPage)));ui.save();ui.render();return true;
 }
 if(dataset.afSlotPage!==undefined){
  const ch=currentChallenge(a),pages=Math.ceil(ch.slots.length/size.slots);
  a.slotPage=Math.max(0,Math.min(pages-1,a.slotPage+Number(dataset.afSlotPage)));ui.save();ui.render();return true;
 }
 return false;
}
function focusKeydown(e,root,ui){
 if(ui.state().module!=='academy')return;
 const a=ensure(ui.state());
 if(a.focusPanel){
  if(e.key==='Escape'){e.preventDefault();a.focusPanel=null;ui.save();ui.render();return;}
  if(e.key==='Tab'){
   const modal=root.querySelector?.('.af-overlay:not([hidden])');
   const stops=Array.from(modal?.querySelectorAll?.('button:not(:disabled), textarea, input, a[href], [tabindex="0"]')||[]).filter(x=>x.getClientRects?.().length);
   if(stops.length){const first=stops[0],last=stops[stops.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  }
  return;
 }
 if(ui.state().screen==='slide'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
  const sl=ensureSlide(a),ch=B.makeSlideChallenge(sl.round),p=ch.pieces.find(x=>x.id===sl.selected);
  const horizontal=['ArrowLeft','ArrowRight'].includes(e.key);if(p&&horizontal===(p.axis==='h')){e.preventDefault();moveSlide(ui.state(),p.id,['ArrowLeft','ArrowUp'].includes(e.key)?-1:1,ui);}
 }
}
function focusAfterRender(root,state,previous){
 const active=state.module==='academy'&&['play','slide'].includes(state.screen);
 document.documentElement?.classList?.toggle('af-active',active);
 document.body?.classList?.toggle('af-active',active);
 if(!active)return;
 const a=ensureFocus(ensure(state)),overlay=root.querySelector?.('.af-overlay:not([hidden])');
 const shell=root.querySelector?.('.af-shell');
 if(shell&&overlay)for(const child of shell.children||[])if(!child.classList?.contains('af-overlay'))child.inert=true;
 let target=null;
 if(previous?.attr){
  const value=String(previous.value).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  const parent=overlay||root;target=parent.querySelector?.('['+previous.attr+'="'+value+'"]:not(:disabled)');
 }
 if(overlay&&(!target||!target.getClientRects?.().length))target=overlay.querySelector?.('[data-af-help="close"]');
 if(!overlay&&previous?.inOverlay)target=root.querySelector?.('.af-topbar [data-af-help]');
 if(target&&target.getClientRects?.().length){target.focus?.({preventScroll:true});if(typeof previous?.selectionStart==='number'&&target.setSelectionRange)target.setSelectionRange(previous.selectionStart,previous.selectionEnd);}
}

function cardsFor(category){if(category==='scheduling')return Object.entries(M.SCHED_VOCAB).map(([term,meaning])=>({term,meaning}));if(category==='documentation')return Object.entries(M.DOC_TERMS).map(([term,meaning])=>({term,meaning}));if(category==='integrity')return Object.entries(M.INTEGRITY_FIELDS).map(([term,meaning])=>({term,meaning}));if(category==='analysis')return M.METRICS.map(m=>({term:m.name,meaning:`${m.meaning} Numerator: ${m.num}. Denominator: ${m.den}.` }));return Object.entries(DB_CARDS).map(([term,meaning])=>({term,meaning}))}
function orderedCards(f){const cards=cardsFor(f.category);if(!f.orderSeed)return cards;let x=1+f.orderSeed*17+f.category.length*29;for(let i=cards.length-1;i>0;i--){x=(x*1664525+1013904223)>>>0;const j=x%(i+1);[cards[i],cards[j]]=[cards[j],cards[i]]}return cards}
function flashcardsView(state){const f=ensureCards(state),cards=orderedCards(f),index=f.index%cards.length,c=cards[index];return `<div class="academy-view academy-flashcards"><div class="academy-subnav"><button data-route="academy:home">⌂ Home</button><span>STUDY TERMS</span><button data-route="scheduling:home">Advanced practice →</button></div><section class="academy-titlepanel"><div class="academy-kicker">OFFLINE FLASHCARDS · FIVE DISCIPLINES</div><h1>Learn the language</h1><p>Select a discipline. Tap the card to flip it and reveal the explanation.</p></section><div class="academy-flash-tabs">${[['scheduling','Scheduling'],['analysis','Analysis'],['documentation','Documentation'],['integrity','Data Integrity'],['dbm','Database & Systems']].map(([k,v])=>`<button class="${f.category===k?'active':''}" data-flash-category="${k}">${esc(v)}</button>`).join('')}</div><div class="academy-flash-count">${index+1} / ${cards.length} · ${esc(f.category.toUpperCase())}</div><button class="academy-flashcard ${f.flipped?'flipped':''}" data-flash-action="flip"><span class="academy-flash-side">${f.flipped?'DEFINITION':'TERM'}</span><strong>${esc(f.flipped?c.meaning:c.term)}</strong><span class="academy-flash-side">Tap to ${f.flipped?'see the term':'reveal the answer'}</span></button><div class="academy-flash-actions"><button data-flash-action="prev">← Previous</button><button data-flash-action="flip">Flip card</button><button data-flash-action="next">Next →</button><button data-flash-action="shuffle">Shuffle</button></div><div class="academy-flash-footer"><button class="academy-outline" data-route="academy:home">Back to Block Academy</button></div></div>`}
function newRound(a){a.undo=[];a.bankPage=0;a.slotPage=0;a.wavePage=0;a.wave='first';a.phaseView='chart';a.focusSlot=null;a.focusPanel=null;a.stage='play';a.placements=B.emptyPlacements(currentChallenge(a));a.selectedPiece=null;a.message=null;a.messageGood=false;a.hint=false;a.assisted=false;a.lives=3;a.phaseExpanded=false;playingAnimation=false;animationToken++}
function startMission(state,id,ui){const a=ensure(state);a.mission=id;a.round=Math.min(90,Math.max(1,(a.progress[id]||0)+1));a.variation=0;newRound(a);ui.setRoute('academy','play')}
function placeAt(state,id,slot,index,ui){const a=ensure(state);if(a.stage!=='play'||playingAnimation)return;if(a.placements[slot]?.[index]===id){a.selectedPiece=null;a.focusSlot=slot+':'+index;a.message='This block is already in that cell. Use Clear to remove it.';a.messageGood=true;ui.save();ui.render();return;}const ch=currentChallenge(a),r=B.place(ch,a.placements,id,slot,index);if(r.ok){ensureFocus(a);rememberPlan(a);a.placements=r.placements;a.focusSlot=slot+':'+index;const m=(ch.kind==='launch'?ch.aircraft:ch.pieces).find(p=>p.id===id);a.message=(m?.title||id)+' placed in '+ch.slots.find(s=>s.id===slot)?.title+'.';a.messageGood=true;a.selectedPiece=null;a.hint=false;ui.save();ui.render()}else{a.message=r.message;a.messageGood=false;ui.save();ui.render()}}
function launch(state,ui){
 const a=ensure(state);if(playingAnimation||a.stage!=='play')return;
 const ch=currentChallenge(a),result=B.validate(ch,a.placements);
 if(!result.ok){a.lives=Math.max(0,a.lives-1);a.message=result.message+(a.lives===0?' All three attempts used. Reset and try this repetition again.':` ${a.lives} ${a.lives===1?'life':'lives'} left.`);a.messageGood=false;ui.tone(false);if(a.lives===0){a.stage='retry-needed'}ui.save();ui.render();return}
 a.message=result.message;a.messageGood=true;
 const mission=a.mission,round=a.round,variation=a.variation;
 if(!a.assisted&&round===Math.min(90,(a.progress[mission]||0)+1)){a.progress[mission]=Math.min(90,round);a.score=(a.score||0)+100+25*a.lives;}
 ui.tone(true);ui.save();playingAnimation=ch.kind==='launch';const token=++animationToken;ui.render();
 if(ch.kind!=='launch'){a.stage='victory';ui.save();ui.render();return}
 const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;
 window.setTimeout(()=>{if(token!==animationToken)return;playingAnimation=false;if(a.mission===mission&&a.round===round&&a.variation===variation){a.stage='victory';ui.save();if(state.module==='academy')ui.render()}},reducedMotion?250:1550+(ch.needFirst-1)*350+250);
}
function ensureSlide(a){
 if(!Number.isInteger(a.slideProgress)||a.slideProgress<0||a.slideProgress>90)a.slideProgress=0;
 if(!a.slide||typeof a.slide!=='object'||!Number.isInteger(a.slide.round)||a.slide.round<1||a.slide.round>90){const round=Math.min(90,a.slideProgress+1);a.slide={round,positions:B.slidePositions(B.makeSlideChallenge(round)),moves:0,solved:false,selected:'target',message:null};}
 return a.slide;
}
function moveSlide(state,id,steps,ui){const a=ensure(state),slide=ensureSlide(a),ch=B.makeSlideChallenge(slide.round);if(slide.solved)return;const result=B.slideMove(ch,slide.positions,id,steps);slide.message=result.message;if(result.ok){if(!Array.isArray(slide.undo))slide.undo=[];slide.undo.push({positions:M.clone(slide.positions),moves:slide.moves,selected:slide.selected});slide.undo=slide.undo.slice(-60);slide.positions=result.positions;slide.moves++;slide.selected=id;if(B.slideSolved(ch,slide.positions)){slide.solved=true;slide.message='Good decision — the FMC aircraft reached the launch door.';a.slideProgress=Math.max(a.slideProgress,slide.round);ui.tone(true)}}else ui.tone(false);ui.save();ui.render()}
function slideClick(dataset,state,ui){const a=ensure(state),slide=ensureSlide(a),ch=B.makeSlideChallenge(slide.round);
 if(dataset.slidePiece){if(Date.now()<ignoreClickUntil)return true;slide.selected=dataset.slidePiece;slide.message=null;ui.save();ui.render();return true}
 if(dataset.slideNudge){moveSlide(state,slide.selected,Number(dataset.slideNudge),ui);return true}
 if(dataset.slideAction){if(dataset.slideAction==='undo'){if(!slide.solved&&slide.undo?.length){const prev=slide.undo.pop();slide.positions=prev.positions;slide.moves=prev.moves;slide.selected=prev.selected;slide.message='Last move undone.'}}
 else if(dataset.slideAction==='reset'){a.slide={round:slide.round,positions:B.slidePositions(ch),moves:0,solved:false,selected:'target',message:null}}
 else if(dataset.slideAction==='hint'){slide.message='Slide the red, yellow, orange or purple blockers sideways until the green FMC aircraft has a clear vertical path. Then slide FMC up to row 1.'}
 else if(dataset.slideAction==='next'){if(slide.solved){if(slide.round<90){const round=slide.round+1;a.slide={round,positions:B.slidePositions(B.makeSlideChallenge(round)),moves:0,solved:false,selected:'target',message:null}}else{ui.setRoute('academy','home');return true}}}ui.save();ui.render();return true}
 return false;
}
function handleClick(dataset,state,ui){if(window.FMAcademyAnalysis?.handleClick(dataset,state,ui))return true;if(focusClick(dataset,state,ui))return true;if(state.module==='academy'&&state.screen==='slide'&&slideClick(dataset,state,ui))return true;if(dataset.academyFocusAircraft){const a=ensure(state);a.selectedPiece=dataset.academyFocusAircraft;a.focusPanel=null;ui.save();ui.render();return true}if(dataset.academyRackscroll){const rack=document.querySelector?.('.academy-rack-items');rack?.scrollBy?.({left:dataset.academyRackscroll==='left'?-240:240,behavior:'smooth'});return true}if(dataset.academyMission){const id=Number(dataset.academyMission);if(B.MISSIONS.some(m=>m.id===id))startMission(state,id,ui);return true}
 if(dataset.academyAction){const a=ensure(state);switch(dataset.academyAction){
 case 'check':if(state.teaching)state.teaching.notice='';launch(state,ui);break;
 case 'undo':if(a.stage==='play'&&!playingAnimation&&a.undo?.length){a.placements=a.undo.pop();a.selectedPiece=null;a.focusSlot=null;a.message='Last placement undone.';a.messageGood=true;ui.save();ui.render()}break;
 case 'clear':if(a.focusSlot)handleClick({academyRemove:a.focusSlot},state,ui);break;
 case 'reset':newRound(a);ui.save();ui.render();break;
 case 'variation':a.variation++;newRound(a);ui.save();ui.render();break;
 case 'hint':a.hint=!a.hint;a.focusPanel='rules';ui.save();ui.render();break;
 case 'phase-toggle':a.phaseExpanded=!a.phaseExpanded;ui.save();ui.render();break;
 case 'model':ensureFocus(a);rememberPlan(a);a.placements=B.modelPlacements(currentChallenge(a));a.focusPanel=null;a.assisted=true;a.message='Model shown. Practice it, then reset to complete independently.';a.messageGood=true;ui.save();ui.render();break;
 case 'retry':newRound(a);ui.save();ui.render();break;
 case 'continue':if(a.round>=90){const m=B.MISSIONS.find(x=>(a.progress[x.id]||0)<90);if(m){startMission(state,m.id,ui)}else{ui.setRoute('academy','home')}break}a.round++;a.variation=0;newRound(a);ui.save();ui.render();break;
 }return true}
 if(dataset.academyRemove){const a=ensure(state);if(a.stage==='play'&&!playingAnimation){const [s,i]=dataset.academyRemove.split(':');ensureFocus(a);if(a.placements[s]?.[Number(i)])rememberPlan(a);a.placements=B.remove(a.placements,s,Number(i));a.selectedPiece=null;a.focusSlot=null;a.message='Cell cleared. Undo can restore it.';a.messageGood=true;ui.save();ui.render()}return true}
 if(dataset.academyTile){if(Date.now()<ignoreClickUntil)return true;const a=ensure(state);if(a.stage!=='play'||playingAnimation)return true;const id=dataset.academyTile;a.selectedPiece=a.selectedPiece===id?null:id;a.focusSlot=null;a.message=null;a.messageGood=false;if(state.teaching)state.teaching.notice='';ui.save();ui.render();return true}
 if(dataset.academySlot){const a=ensure(state);if(a.stage!=='play'||playingAnimation)return true;const [s,i]=dataset.academySlot.split(':');if(a.selectedPiece){placeAt(state,a.selectedPiece,s,Number(i),ui)}else{a.focusSlot=dataset.academySlot;a.selectedPiece=a.placements[s]?.[Number(i)]||null;a.message=a.selectedPiece?null:'Empty destination. Choose a block first.';a.messageGood=false;ui.save();ui.render()}return true}
 if(dataset.flashCategory){const f=ensureCards(state);f.category=dataset.flashCategory;f.index=0;f.flipped=false;f.orderSeed=0;ui.save();ui.render();return true}
 if(dataset.flashAction){const f=ensureCards(state),total=cardsFor(f.category).length;switch(dataset.flashAction){case 'flip':f.flipped=!f.flipped;break;case 'next':f.index=(f.index+1)%total;f.flipped=false;break;case 'prev':f.index=(f.index+total-1)%total;f.flipped=false;break;case 'shuffle':f.orderSeed++;f.index=0;f.flipped=false;break}ui.save();ui.render();return true}
 return false}
function attach(root,ui){callbacks=ui;
 root.addEventListener('keydown',e=>focusKeydown(e,root,ui));
 window.addEventListener?.('resize',()=>{if(ui.state().module==='academy'&&['play','slide','analysis-lab'].includes(ui.state().screen))ui.render()});
 let slideDrag=null;
 root.addEventListener('pointerdown',e=>{if(ui.state().module!=='academy'||ui.state().screen!=='slide')return;const tile=e.target.closest?.('[data-slide-piece]');if(!tile)return;slideDrag={id:tile.dataset.slidePiece,x:e.clientX,y:e.clientY};try{tile.setPointerCapture(e.pointerId)}catch{}});
 root.addEventListener('pointerup',e=>{if(!slideDrag)return;const start=slideDrag;slideDrag=null;if(ui.state().module!=='academy'||ui.state().screen!=='slide')return;const ch=B.makeSlideChallenge(ensureSlide(ensure(ui.state())).round),p=ch.pieces.find(x=>x.id===start.id);if(!p)return;const grid=document.querySelector?.('.academy-slide-grid'),square=(grid?.getBoundingClientRect?.().width||360)/6;const delta=p.axis==='h'?e.clientX-start.x:e.clientY-start.y,steps=Math.round(delta/square);if(Math.abs(delta)>square*.38&&steps){ignoreClickUntil=Date.now()+350;moveSlide(ui.state(),p.id,steps,ui);if(e.cancelable)e.preventDefault()}});
 root.addEventListener('pointercancel',()=>{slideDrag=null});

 root.addEventListener('pointerdown',e=>{if(ui.state().module!=='academy'||ui.state().screen!=='play'||playingAnimation)return;const tile=e.target.closest?.('[data-academy-tile]');if(!tile)return;drag={id:tile.dataset.academyTile,x:e.clientX,y:e.clientY,moved:false,ghost:null};try{tile.setPointerCapture(e.pointerId)}catch{}});
 root.addEventListener('pointermove',e=>{if(!drag)return;const distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);if(distance<9&&!drag.moved)return;if(!drag.moved){drag.moved=true;const copy=e.target.closest?.('[data-academy-tile]');if(copy&&document.body){drag.ghost=copy.cloneNode(true);drag.ghost.classList.add('academy-ghost');drag.ghost.removeAttribute('data-academy-tile');document.body.appendChild(drag.ghost)}}if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px'}if(e.cancelable)e.preventDefault()});
 root.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(d.ghost)d.ghost.remove();if(!d.moved)return;ignoreClickUntil=Date.now()+500;const target=document.elementFromPoint?.(e.clientX,e.clientY);const slot=target?.closest?.('[data-academy-slot]');if(slot){const [s,i]=slot.dataset.academySlot.split(':');placeAt(ui.state(),d.id,s,Number(i),ui)}else{const a=ensure(ui.state());a.selectedPiece=d.id;ui.save();ui.render()}});
 root.addEventListener('pointercancel',()=>{if(drag?.ghost)drag.ghost.remove();drag=null});
 root.addEventListener('keydown',e=>{if(ui.state().module!=='academy'||(e.key!=='Enter'&&e.key!==' '))return;const slot=e.target.closest?.('[data-academy-slot]');if(slot&&e.target===slot&&e.target.tagName!=='BUTTON'){e.preventDefault();const a=ensure(ui.state());if(a.selectedPiece){const [s,i]=slot.dataset.academySlot.split(':');placeAt(ui.state(),a.selectedPiece,s,Number(i),ui)}}});
}
window.FMBlockAcademy={renderAcademy:state=>{if(state.screen==='play'&&ensure(state).mission===5&&window.FMAcademyAnalysis)window.FMAcademyAnalysis.resumeRate(state);return state.screen==='analysis-lab'&&window.FMAcademyAnalysis?window.FMAcademyAnalysis.render(state):state.screen==='play'?playView(state):state.screen==='slide'?slideView(state):mainHome(state);},renderFlashcards:flashcardsView,handleClick,attach,ensure,afterRender:focusAfterRender,model:B};
})();
