/* Live Phase Flow view: values come from the current exercise and its plan. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.FMAcademyPhase=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=value=>Number.isFinite(Number(value))&&value!==null&&value!==''?Number(value):null;
  const fmt=value=>value===null?'unknown':Number.isInteger(value)?String(value):String(Math.round(value*10)/10);
  const ids=value=>new Set(Array.isArray(value)?value.filter(Boolean).map(String):[]);

  function snapshot(challenge,placements){
    const ch=challenge||{},plan=placements||{};
    const first=ids(plan.first),turn=ids(plan.turn),spare=ids(plan.spare);
    const suppliedHours=number(ch.flightHoursPerSortie),suppliedThreshold=number(ch.nearPhaseAt);
    const sortieHours=suppliedHours!==null&&suppliedHours>0?suppliedHours:2;
    const threshold=suppliedThreshold!==null&&suppliedThreshold>=0?suppliedThreshold:16;
    const rows=(Array.isArray(ch.aircraft)?ch.aircraft:[]).map(a=>{
      const id=String(a.id),status=String(a.status||'Unknown'),current=number(a.phaseHours);
      const inFirst=first.has(id),inTurn=turn.has(id),sorties=Number(inFirst)+Number(inTurn),canFly=status==='FMC';
      // Keep a negative forecast as evidence of an invalid plan. Only the drawing
      // is clamped to zero; the value and warning remain visible to the learner.
      const after=current===null?null:current-sorties*sortieHours;
      const errors=[];
      if(inTurn&&!inFirst)errors.push('A turn was assigned without a first-wave sortie.');
      if(sorties&&!canFly)errors.push(status+' aircraft cannot be assigned to fly.');
      if(spare.has(id)&&sorties)errors.push('The protected spare also has flying assignments.');
      if(after!==null&&after<0)errors.push('Planned sorties exceed the remaining Phase hours by '+fmt(-after)+'h.');
      if(current===null)errors.push('No valid current Phase-hour value is available.');
      return {id,status,current,after,sorties,first:inFirst,turn:inTurn,spare:spare.has(id),canFly,
        priority:String(ch.priority||'')===id,
        nearBefore:canFly&&current!==null&&current<=threshold,
        nearAfter:canFly&&after!==null&&after<=threshold,
        errors};
    }).sort((a,b)=>(a.current===null?Infinity:a.current)-(b.current===null?Infinity:b.current)||a.id.localeCompare(b.id));
    const invalid=rows.filter(r=>r.errors.length).map(r=>({id:r.id,reasons:r.errors.slice()}));
    const maxCurrent=Math.max(0,...rows.filter(r=>r.current!==null).map(r=>r.current));
    return {rows,total:rows.length,sortieHours,threshold,maxHours:Math.max(50,Math.ceil(maxCurrent/50)*50),
      firstCount:rows.filter(r=>r.first).length,turnCount:rows.filter(r=>r.turn).length,
      plannedSorties:rows.reduce((n,r)=>n+r.sorties,0),unavailableCount:rows.filter(r=>!r.canFly).length,
      nearBefore:rows.filter(r=>r.nearBefore).length,nearAfter:rows.filter(r=>r.nearAfter).length,
      selectedNearBefore:rows.filter(r=>r.first&&r.nearBefore).length,
      limitNearPhase:number(ch.limitNearPhase),invalid};
  }

  function rowText(row){
    return row.id+', '+row.status+', '+fmt(row.current)+' hours now, '+fmt(row.after)+' hours after the plan, '+row.sorties+' planned sortie'+(row.sorties===1?'':'s')+(row.priority?', priority aircraft':'')+(row.errors.length?'. '+row.errors.join(' '):'');
  }
  function styleFor(row){return row.errors.length?'ap-invalid':!row.canFly?'ap-unavailable':row.nearAfter?'ap-near':'ap-ready';}
  function summary(data){
    return data.firstCount+' first-wave + '+data.turnCount+' turns · '+data.sortieHours+'h per sortie';
  }
  function compactChart(data,selected){
    const W=360,H=98,left=23,right=5,top=19,bottom=73,width=W-left-right,plot=bottom-top;
    const step=width/Math.max(1,data.rows.length),bar=Math.min(17,step*.66),scale=value=>Math.max(0,Math.min(data.maxHours,value===null?0:value))/data.maxHours*plot;
    const thresholdY=bottom-scale(data.threshold);
    const bars=data.rows.map((row,i)=>{
      const x=left+i*step+step/2,now=scale(row.current),after=scale(row.after);
      return `<g class="ap-column ${styleFor(row)} ${selected===row.id?'ap-selected-tail':''}"><title>${E(rowText(row))}</title>${selected===row.id?`<rect class="ap-column-selected" fill="#ffe26b" fill-opacity=".09" stroke="#ffe26b" stroke-width=".8" x="${(x-step/2+1).toFixed(2)}" y="${top-2}" width="${Math.max(2,step-2).toFixed(2)}" height="${plot+5}" rx="2"/>`:''}<rect class="ap-svg-now" fill="#adcde5" fill-opacity=".12" stroke="#b6d5e9" stroke-width=".7" x="${(x-bar/2).toFixed(2)}" y="${(bottom-now).toFixed(2)}" width="${bar.toFixed(2)}" height="${Math.max(1,now).toFixed(2)}" rx="1"/><rect class="ap-svg-after" fill="${row.errors.length?'#ff8a9b':!row.canFly?'#8399aa':row.nearAfter?'#ffd064':'#4bdcb0'}" x="${(x-bar*.27).toFixed(2)}" y="${(bottom-after).toFixed(2)}" width="${(bar*.54).toFixed(2)}" height="${Math.max(1,after).toFixed(2)}" rx="1"/>${row.errors.length?`<text class="ap-svg-warning" fill="#ff9aaa" font-size="10" font-weight="900" x="${x.toFixed(2)}" y="${Math.max(top+8,bottom-after-3).toFixed(2)}" text-anchor="middle">!</text>`:''}<text class="ap-tail-label" fill="#d8ecfa" font-size="8" font-weight="650" x="${x.toFixed(2)}" y="${bottom+7}" transform="rotate(-55 ${x.toFixed(2)} ${bottom+7})" text-anchor="end">${E(row.id)}</text></g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" class="ap-mini-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Live Phase Flow: current and projected hours for every aircraft"><title>Live Phase Flow from this flying plan</title><desc>${E(summary(data)+'. Ordered by current hours, lowest first. '+data.rows.map(rowText).join('. '))}</desc><text class="ap-axis-label" fill="#d5eaf6" font-size="9" x="1" y="11">Hours to Phase</text><rect class="ap-svg-now" fill="#adcde5" fill-opacity=".12" stroke="#b6d5e9" stroke-width=".7" x="150" y="4" width="9" height="8"/><text class="ap-legend-label" fill="#d5eaf6" font-size="9" x="163" y="11">Now</text><rect class="ap-svg-after ap-ready" fill="#4bdcb0" x="202" y="4" width="9" height="8"/><text class="ap-legend-label" fill="#d5eaf6" font-size="9" x="215" y="11">After plan</text><rect class="ap-svg-after ap-unavailable" fill="#8399aa" x="284" y="4" width="9" height="8"/><text class="ap-legend-label" fill="#d5eaf6" font-size="9" x="297" y="11">Not FMC</text><line class="ap-axis" stroke="#7599b2" stroke-width=".65" x1="${left}" y1="${top}" x2="${left}" y2="${bottom}"/><line class="ap-axis" stroke="#7599b2" stroke-width=".65" x1="${left}" y1="${bottom}" x2="${W-right}" y2="${bottom}"/><text class="ap-tick" fill="#b8d6e8" font-size="8" x="${left-4}" y="${top+3}" text-anchor="end">${data.maxHours}</text><text class="ap-tick" fill="#b8d6e8" font-size="8" x="${left-4}" y="${bottom+3}" text-anchor="end">0</text><line class="ap-threshold" stroke="#efc45b" stroke-width=".8" stroke-dasharray="3 2" x1="${left}" y1="${thresholdY.toFixed(2)}" x2="${W-right}" y2="${thresholdY.toFixed(2)}"/>${bars}</svg>`;
  }
  function expandedRows(data,selected){
    const width=value=>(Math.max(0,Math.min(data.maxHours,value===null?0:value))/data.maxHours*100).toFixed(3);
    return `<div class="ap-wide-legend"><span><i class="ap-key-current"></i>Hours now</span><span><i class="ap-key-after"></i>Hours after plan</span><span><i class="ap-key-unavailable"></i>Not available to fly</span><span><i class="ap-key-near"></i>Near exercise threshold</span></div><div class="ap-full-axis"><span>Aircraft</span><div><span>0h</span><span>${fmt(data.maxHours/2)}h</span><span>${data.maxHours}h</span></div><span>Now → after</span></div><div class="ap-rows" style="--ap-threshold:${width(data.threshold)}%">${data.rows.map(row=>`<button type="button" class="ap-row ${styleFor(row)} ${selected===row.id?'ap-selected-tail':''}" data-academy-focus-aircraft="${E(row.id)}" aria-label="${E(rowText(row))}" aria-pressed="${selected===row.id}"><span class="ap-row-tail"><strong>${E(row.id)}</strong><small>${E(row.status)}${row.priority?' · priority':''}</small></span><span class="ap-bar-track" aria-hidden="true"><i class="ap-bar-now" style="width:${width(row.current)}%"></i><i class="ap-bar-after" style="width:${width(row.after)}%"></i></span><span class="ap-row-value"><strong>${fmt(row.current)} → ${fmt(row.after)}h</strong><small>${row.errors.length?'⚠ Invalid plan':row.sorties?row.sorties+' sortie'+(row.sorties===1?'':'s'):row.spare?'Protected spare':'No flying assigned'}</small></span></button>`).join('')}</div>`;
  }
  function render(challenge,placements,options){
    const opts=options||{},data=snapshot(challenge,placements),selected=opts.selected==null?null:String(opts.selected),expanded=!!opts.expanded;
    if(!data.total)return '<section class="academy-phase-live"><h2>Phase Flow</h2><p>No aircraft are available in this exercise.</p></section>';
    const selectedRow=data.rows.find(row=>row.id===selected);
    const limit=data.limitNearPhase;
    const rule=limit===null?'':` At most ${limit} selected first-wave aircraft may start at ${data.threshold}h or less.`;
    const errors=data.invalid.length?`<p class="ap-error" role="status">${data.invalid.length} aircraft ${data.invalid.length===1?'has':'have'} an invalid plan. ${data.invalid.map(r=>E(r.id+': '+r.reasons.join(' '))).join(' ')}</p>`:'';
    const header=`<header class="ap-head"><div><h2>Phase Flow</h2><span>${expanded?E(summary(data)):data.total+' aircraft · now → after plan'}</span></div>${expanded?'':`<button type="button" data-af-help="phase-live" aria-label="Expand the actual Phase Flow chart">Expand Phase Flow ↗</button>`}</header>`;
    if(!expanded)return `<section class="academy-phase-live ap-compact" aria-label="Live Phase Flow overview">${header}${compactChart(data,selected)}${selectedRow?`<p class="ap-compact-readout"><b>${E(selectedRow.id)}</b> · ${E(selectedRow.status)} · ${fmt(selectedRow.current)} → ${fmt(selectedRow.after)}h · ${selectedRow.sorties} planned sortie${selectedRow.sorties===1?'':'s'}</p>`:''}${data.invalid.length?'<span class="ap-compact-warning" role="status">⚠ Invalid forecast — expand for the affected aircraft.</span>':''}</section>`;
    return `<section class="academy-phase-live ap-expanded" aria-label="Detailed live Phase Flow">${header}<p class="ap-intro">Shorter bars mean fewer hours remaining before Phase. The outline shows the current value; the filled bar shows the value after your planned sorties. The order stays fixed while you make changes.</p>${expandedRows(data,selected)}<div class="ap-summary"><span><b>${data.nearBefore} → ${data.nearAfter}</b> FMC aircraft at or below ${data.threshold}h</span><span><b>${data.plannedSorties}</b> planned sorties</span><span><b>${data.unavailableCount}</b> aircraft not FMC</span></div><p class="ap-rule">Exercise threshold: ${data.threshold}h. Each planned sortie uses ${data.sortieHours}h.${rule} Aircraft status still controls whether an aircraft can fly. These are exercise rules.</p>${selectedRow?`<p class="ap-readout"><b>Selected aircraft:</b> ${E(rowText(selectedRow))}.</p>`:''}${errors}<p class="ap-use">Tap an aircraft row to select its block and return to the plan.</p></section>`;
  }
  return {snapshot,render};
});
