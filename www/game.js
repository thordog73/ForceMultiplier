function startForceMultiplierGame() {
  'use strict';
  const Device = window.FMDevice;
  const native = window.FMNative;
  const isNative = !!native?.isNative;
  const Flight = window.FLIGHT_GAME;
  const Packs = window.FM_GAME_PACKS || {};
  const Worlds = window.FM_WORLDS;
  let G = Flight;
  const root = document.getElementById('game');
  const dialog = document.getElementById('game-dialog');
  const dialogBody = document.getElementById('dialog-body');
  const storageKey = 'force-multiplier-worlds-22';
  const legacyStorageKey = 'force-multiplier-flightline-22';
  const skillInfo = [
    {id:'scheduling',name:'Scheduling',short:'Scheduling',icon:'calendar',tag:'Make the plan.'},
    {id:'analysis',name:'Analysis',short:'Analysis',icon:'chart',tag:'Find the signal.'},
    {id:'documentation',name:'Documentation',short:'Documents',icon:'file',tag:'Build the evidence.'},
    {id:'database',name:'Database Management',short:'Database',icon:'database',tag:'Keep the system ready.'},
    {id:'integrity',name:'Data Integrity',short:'Integrity',icon:'shield',tag:'Make the records trustworthy.'}
  ];
  const copy = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    left: '<path d="m14 5-7 7 7 7"/>',
    right: '<path d="m10 5 7 7-7 7"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    star: '<path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    menu: '<path d="M5 6h14M5 12h14M5 18h14"/>',
    sound: '<path d="M11 4 6 8H3v8h3l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 4 6 8H3v8h3l5 4Zm5 5 5 6m-5 0 5-6"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    wrench: '<path d="M14 5a5 5 0 0 0-6 6l-5 5a3 3 0 0 0 4 4l5-5a5 5 0 0 0 7-6l-4 3-3-3 3-4Z"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    undo: '<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/>',
    reset: '<path d="M3 3v6h6M3 9a9 9 0 1 1 0 8"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    inspect: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6m-14-11 2 2 4-4"/>',
    mod: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/>',
    drop: '<path d="M12 3C9 8 5 12 5 16a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M9 17a3 3 0 0 0 3 3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    plane: '<path d="m12 2 2 8 7 4v2l-7-2v5l3 2v1l-5-1-5 1v-1l3-2v-5l-7 2v-2 0l7-4Z"/>',
    book: '<path d="M12 5C8 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1Zm0 0v15"/>',
    play: '<path d="m8 4 13 8-13 8Z"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 0-10 6 6 0 0 1 11 1 4.5 4.5 0 0 1 0 9Z"/>',
    chart: '<path d="M3 3v18h18M7 16v-5m5 5V6m5 10v-8"/>',
    file: '<path d="M14 2H5v20h14V7Zm0 0v5h5M8 11h8m-8 4h8m-8 4h5"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v7c0 4 18 4 18 0V5M3 12v7c0 4 18 4 18 0v-7"/>',
    shield: '<path d="m12 2 9 4v6c0 5-5 9-9 10-4-1-9-5-9-10V6Z"/><path d="m8 12 3 3 5-6"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3"/>',
    bus: '<rect x="4" y="3" width="16" height="17" rx="3"/><path d="M4 11h16M8 20v2m8-2v2M8 15h.01M16 15h.01M8 6h8"/>',
    cat: '<path d="m5 9-1-7 7 4h2l7-4-1 7c5 11-19 17-14 0Z"/><path d="M8 11h.01M16 11h.01m-6 4 2 2 2-2M3 14l-2-1m20 1 2-1"/>',
    squirrel: '<path d="M8 15c-6-1-6-8-2-10 5-3 9 1 6 5-1-7 9-7 8-1-1 5-7 3-7 7v5H6l2-3Z"/><path d="m13 16 5 1-1 4h-4M10 13h.01"/>',
    van: '<path d="M3 8h11l6 5h1v7H3Zm11 0v6h6"/><circle cx="7" cy="20" r="2"/><circle cx="17" cy="20" r="2"/><path d="M6 12h4"/>',
    link: '<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1"/>',
    flag: '<path d="M5 22V3h14l-3 5 3 5H5"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    upload: '<path d="M12 16V2m-5 5 5-5 5 5M3 15v6h18v-6"/>',
    refresh: '<path d="M3 3v6h6M3 9a9 9 0 1 1 0 8"/>',
    bolt: '<path d="m14 2-10 12h7l-1 8L21 9h-8Z"/>',
    box: '<path d="m12 2 10 5v11l-10 5-10-5V7Zm0 10L2 7m10 5L22 7m-10 5v11M7 4l10 6"/>'
  };
  const icon = (name, extra = '') => '<svg class="icon '+extra+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name==='plane'&&worldId!=='airline'?(worldId==='bus'?'bus':'van'):name] || icons.box)+'</svg>';
  const plane = () => worldId!=='airline'?Worlds.vehicle(worldId):'<svg class="plane-svg" viewBox="0 0 120 138" aria-hidden="true"><path d="M55 9q5-13 10 0l3 37 43 29v10L68 70l-2 39 16 12v7l-22-6-22 6v-7l16-12-2-39L9 85V75l43-29Z" fill="currentColor"/><path d="M55 20q5-5 10 0l-1 8h-8Z" fill="#193c52" opacity=".65"/><path d="M60 37v68M23 76l28-19m46 19L69 57" fill="none" stroke="#193c52" stroke-width="1.4" opacity=".22"/><rect x="31" y="66" width="8" height="17" rx="4" fill="currentColor"/><rect x="81" y="66" width="8" height="17" rx="4" fill="currentColor"/></svg>';
  const emptyProfile=()=>({version:1,activeSkill:'scheduling',world:'airline',sound:false,haptics:true,tracks:{}});
  let profile=emptyProfile();
  let pendingGameRestore=null,resetting=false;
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved?.version===1&&saved.tracks&&typeof saved.tracks==='object'&&!Array.isArray(saved.tracks))profile={...profile,...saved};
    else {
      const legacy=JSON.parse(localStorage.getItem(legacyStorageKey));
      if(legacy&&typeof legacy==='object'){profile.tracks['airline:scheduling']=legacy;profile.sound=!!legacy.sound;}
    }
  } catch (_) {}
  const initialRoute=readRoute();
  let skill=skillInfo.some(x=>x.id===initialRoute?.skill)?initialRoute.skill:skillInfo.some(x=>x.id===profile.activeSkill)?profile.activeSkill:'scheduling';
  let worldId=Object.keys(Worlds.worlds).includes(initialRoute?.world)?initialRoute.world:Object.keys(Worlds.worlds).includes(profile.world)?profile.world:'airline';
  let progress;
  let s, state, history = [], busy = false, timer, toastTimer, audioContext;
  const currentPack=()=>Packs[skill];
  const world=()=>Worlds.worlds[worldId];
  const trackKey=()=>worldId+':'+skill;
  const ui=()=>({esc,icon,asset:plane,world:world()});
  function readRoute(){
    const m=location.hash.match(/^#(airline|bus|cats|squirrel)\/(scheduling|analysis|documentation|database|integrity)\/(\d+)$/);
    if(m)return{world:m[1],skill:m[2],id:Number(m[3])};
    const old=location.hash.match(/^#level-(\d+)$/);
    return old?{world:'airline',skill:'scheduling',id:Number(old[1])}:null;
  }
  function selectEngine(){
    if(skill!=='scheduling'&&!Packs[skill])skill='scheduling';
    G=skill==='scheduling'?Flight:{levels:currentPack().levels,make:(id,seed,revision)=>({...currentPack().make(id,seed,revision),kind:'skills'})};
    const saved=profile.tracks[trackKey()];
    progress={best:{},current:null,...(saved&&typeof saved==='object'?copy(saved):{}),sound:!!profile.sound};
    if(!progress.best||typeof progress.best!=='object'||Array.isArray(progress.best))progress.best={};
  }
  function applyWorldLabels(container){
    if(worldId==='airline')return;
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
    texts.forEach(n=>n.nodeValue=Worlds.text(n.nodeValue,worldId));
    container.querySelectorAll('[aria-label],[title]').forEach(el=>['aria-label','title'].forEach(a=>{if(el.hasAttribute(a))el.setAttribute(a,Worlds.text(el.getAttribute(a),worldId));}));
  }
  const randomSeed = () => (Date.now() ^ Math.floor(Math.random()*1000000)) >>> 0;
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o || {},k);
  const goalAt = day => s.flightGoals?.find(g=>g.day===day) || {day,am:0,pm:0};
  const firstFlightDay = () => s.flightGoals?.find(g=>g.am || g.pm)?.day ?? 0;
  const waveForBoard = (day,w) => {
    const g=goalAt(day),tl=G.timeline(s,state.placements);
    return {id:w,count:g[w] || 0,label:w==='am'?'First wave':'Second wave',required:g[w==='am'?'requiredAM':'requiredPM'] || [],blocked:s.planes.filter(p=>tl.cells[p.id+'|'+day]).map(p=>p.id),pilots:(g.pilots || []).filter(p=>(p.wave || 'am')===w)};
  };
  function persist() {
    progress.current = {level:s.id,seed:s.seed,state,...(s.kind==='skills'?{revision:s.revision || 1}:{})};
    profile.tracks[trackKey()]=progress;profile.activeSkill=skill;profile.world=worldId;profile.sound=!!progress.sound;
    if(Device)return Device.save(storageKey,profile);
    try { localStorage.setItem(storageKey,JSON.stringify(profile)); return Promise.resolve(true); } catch (_) { toast('Changes are not saved. Export a backup before closing.',true); return Promise.resolve(false); }
  }
  function fresh(level, seed, revision) {
    if(seed==null)seed=skill==='scheduling'&&level===13&&progress.last12?progress.last12.seed:randomSeed();
    s=G.make(level,seed,revision);
    state={am:[],pm:[],wave:'am',launched:[],phase:'work',placements:{},flights:{},confirmed:[],activeDay:firstFlightDay(),boardWave:'am',selectedTask:s.tasks?.[0]?.id || null,mistakes:0,hints:0,assisted:false,won:false};
    if(s.kind==='skills')state.play=copy(s.initial);
    if(skill==='scheduling'&&level===13) {
      const previous=progress.last12?.seed===seed?progress.last12.state:G.make(12,seed).model;
      state.placements=copy(previous.placements);state.flights=copy(previous.flights);
      state.phase='flights';state.selectedTask=null;state.activeDay=s.change.day;
      state.confirmed=G.checkBoard(s,state).checks.filter(c=>c.id!=='work' && c.ok).map(c=>c.id);
    }
    history=[];busy=false;persist();
  }
  function restore(useRoute=true) {
    const route=useRoute?readRoute():null;
    const hashLevel=route?.skill===skill&&route?.world===worldId?route.id:0;
    const c=progress.current;
    if(hashLevel>=1 && hashLevel<=G.levels.length && hashLevel!==c?.level){fresh(hashLevel);return;}
    try {
      if(!c || !G.levels.some(x=>x.id===c.level) || !c.state || !Number.isFinite(c.seed))throw Error();
      s=G.make(c.level,c.seed,c.revision || 1);state=c.state;
      if(!Array.isArray(state.am)||!Array.isArray(state.pm)||!Array.isArray(state.launched)||!Array.isArray(state.confirmed)||!state.placements||!state.flights)throw Error();
      if(!['am','pm'].includes(state.wave)||!['am','pm'].includes(state.boardWave)||!['work','flights'].includes(state.phase))throw Error();
      if(s.kind==='skills'&&(!state.play||typeof state.play!=='object'))throw Error();
      state.selectedTask=s.tasks?.some(t=>t.id===state.selectedTask)?state.selectedTask:s.tasks?.find(t=>!own(state.placements,t.id))?.id || null;
    } catch (_) { fresh(1); }
  }
  function checkpoint(){history.push(copy(state));if(history.length>50)history.shift();}
  function sound(type='tap') {
    if(isNative&&profile.haptics!==false)native.haptic(type==='win'?'success':type==='error'?'error':'selection').catch(()=>{});
    if(!progress.sound)return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if(audioContext.state==='suspended')audioContext.resume();
      const notes=type==='win'?[523,659,784,1046]:type==='error'?[170,130]:type==='launch'?[330,440,660]:[440];
      notes.forEach((f,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.11;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(audioContext.destination);o.start(t);o.stop(t+.18);});
    }catch(_){}
  }
  function toast(message,error=false) {
    const el=document.getElementById('game-toast');clearTimeout(toastTimer);
    el.textContent=Worlds.text(message,worldId);el.className='visible'+(error?' error':'');
    toastTimer=setTimeout(()=>{el.className='';el.textContent='';},3600);
    if(error)sound('error');
  }
  function clearToast(){clearTimeout(toastTimer);const el=document.getElementById('game-toast');el.className='';el.textContent='';}
  function flash(ids,day) {
    ids.forEach(id=>{const el=day==null?root.querySelector('[data-plane="'+CSS.escape(id)+'"]'):root.querySelector('[data-cell="'+CSS.escape(id+'|'+day)+'"]');el?.classList.add('bad-flash');setTimeout(()=>el?.classList.remove('bad-flash'),750);});
  }
  function failure(result,day) {
    state.mistakes++;persist();toast(result.message,true);flash([...(result.badIds || []),...(result.missingIds || [])],day);
  }
  function header() {
    const stars=Object.values(progress.best).reduce((n,x)=>n+(Number(x)||0),0);
    return '<header class="topbar"><div class="brand"><span class="brandmark">'+icon(world().icon)+'</span><span class="brandcopy">Force Multiplier<small>PLAY. PRACTICE. PROGRESS.</small></span></div><div class="header-right"><button class="world-switch" data-action="worlds" aria-label="Choose world. Current world: '+esc(world().label)+'">'+icon(world().icon)+'<span>'+esc(world().short)+'</span><span class="world-chevron">⌄</span></button><span class="score-pill" aria-label="'+stars+' stars in this specialty">'+icon('star')+stars+'</span><button class="icon-btn" data-action="map" aria-label="Level map" title="Levels">'+icon('grid')+'</button><button class="icon-btn sound-control" data-action="sound" aria-label="'+(progress.sound?'Mute sound':'Turn sound on')+'" aria-pressed="'+progress.sound+'">'+icon(progress.sound?'sound':'mute')+'</button><button class="icon-btn fullscreen-control" data-action="fullscreen" aria-label="'+(isNative?'Toggle focus view':'Full screen')+'">'+icon('expand')+'</button><button class="icon-btn" data-action="menu" aria-label="Game menu">'+icon('menu')+'</button></div></header>';
  }
  function specialtyNav(){
    return '<nav class="specialty-nav" aria-label="Specialties">'+skillInfo.map(k=>'<button class="specialty-tab '+(skill===k.id?'active':'')+'" data-action="switch-skill" data-skill="'+k.id+'" aria-label="'+esc(k.name)+'" '+(skill===k.id?'aria-current="page"':'')+'>'+icon(k.icon)+'<span class="skill-name-wide">'+esc(k.name)+'</span><span class="skill-name-short">'+esc(k.short)+'</span></button>').join('')+'</nav>';
  }
  function levelStatus(id){return Number(progress.best[id])>0?'done':own(progress.best,id)?'demo':'';}
  function track() {
    return '<nav class="level-track" aria-label="Game progress"><span class="chapter-label">'+esc(s.chapter)+'</span><div class="level-dots">'+G.levels.map(l=>{
      const status=levelStatus(l.id),label='Level '+l.id+': '+l.title+(status==='demo'?' · example viewed':'');
      return '<button class="level-dot '+(l.id===s.id?'active ':'')+status+'" data-action="level" data-id="'+l.id+'" aria-label="'+esc(label)+'" '+(l.id===s.id?'aria-current="step"':'')+'>'+((status&&l.id!==s.id)?icon(status==='done'?'check':'play'):l.id)+'</button>';
    }).join('')+'</div><span class="level-count">'+s.id+' / '+G.levels.length+'</span></nav>';
  }
  function requests(w, selected, day) {
    const a=[];
    (w.required || []).forEach(id=>{
      const p=s.planes.find(p=>p.id===id),past=state.launched?.includes('am') && state.am.includes(id);
      a.push('<span class="request '+(selected.includes(id)?'met':'')+'">'+icon(p?.idle?'clock':'plane')+esc(p?.idle&&!past?id+' · '+p.idle+'d waiting':'Include '+id)+'</span>');
    });
    (w.pilots || []).forEach(p=>a.push('<span class="request pilot '+(selected.includes(p.plane)?'met':'')+'">'+icon('person')+esc(p.name)+' → '+esc(p.plane)+'</span>'));
    if(s.change && day===s.change.day)a.push('<span class="request weather">'+icon('wrench')+s.change.plane+' unavailable</span>');
    if(s.change && day===s.change.addedDay)a.push('<span class="request weather">'+icon('plane')+'Extra flights +1 / +1</span>');
    return a.length?'<div class="req-strip">'+a.join('')+'</div>':'';
  }
  function counter(n,target) {
    return '<div class="counter '+(n===target?'complete':'')+'" aria-live="polite" aria-atomic="true" aria-label="'+n+' of '+target+' aircraft selected"><strong>'+n+'</strong><span>/ '+target+'</span></div>';
  }
  function slots(n,target) {
    return '<div class="departure-slots" aria-hidden="true">'+Array.from({length:target},(_,i)=>'<span class="departure-slot '+(i<n?'filled':'')+'">'+icon('plane')+'</span>').join('')+'</div>';
  }
  function waveScene() {
    const w=s.waves.find(w=>w.id===state.wave),selected=state[state.wave];
    const title=state.wave==='am'?'Pick '+w.count+' aircraft.':'Now pick '+w.count+'.';
    return '<main class="game-shell" id="play" tabindex="-1">'+track()+'<div class="mission-head"><div><div class="mission-kicker">LEVEL '+s.id+'<span class="divider">/</span>'+esc(s.title)+'</div><h1>'+title+'</h1></div><div class="goal-mini"><strong>'+s.waves[0].count+' <span>→</span> '+s.waves[1].count+'</strong><span>today’s flying</span></div></div>'+requests(w,selected)+'<div class="game-layout"><section class="apron" aria-label="Choose aircraft"><div class="apron-top"><span class="label">'+s.planes.length+' AIRCRAFT</span><span class="wind">'+icon('cloud')+' Clear skies</span></div><div class="plane-grid '+(s.planes.length>8?'large':'')+'">'+s.planes.map(p=>{
      const blocked=w.blocked.includes(p.id),required=w.required.includes(p.id)||(w.pilots || []).some(x=>x.plane===p.id),on=selected.includes(p.id),flown=state.launched.includes('am')&&state.am.includes(p.id),pilot=w.pilots?.find(x=>x.plane===p.id);
      const reason=s.grounded?.find(x=>x.plane===p.id)?.reason || 'Unavailable';
      return '<button class="plane-card '+(on?'selected ':'')+(blocked?'unavailable ':'')+(required?'required':'')+'" data-action="plane" data-plane="'+p.id+'" data-focus="plane-'+p.id+'" aria-label="Aircraft '+p.id+(blocked?', '+esc(reason):'')+(p.idle&&!flown?', waiting '+p.idle+' days':'')+'" aria-pressed="'+on+'" '+(blocked?'aria-disabled="true"':'')+'><span class="plane-id">'+p.id+'</span><span class="plane-state">'+(blocked?icon('lock'):on?icon('check'):'')+'</span>'+plane()+(p.idle?'<span class="priority-badge '+(flown?'reset':'')+'">'+icon(flown?'check':'clock')+(flown?'Flown':p.idle+'d')+'</span>':'')+(pilot?'<span class="pilot-badge">'+icon('person')+esc(pilot.name)+'</span>':'')+(blocked?'<span class="ground-label">'+esc(reason)+'</span>':'')+'</button>';
    }).join('')+'</div><div class="runway" aria-hidden="true"><b>27</b><i></i><span>READY FOR TAKEOFF</span><i></i><b>09</b></div></section><aside class="flight-panel"><div class="panel-label">TODAY’S FLIGHTS</div><div class="wave-tabs">'+s.waves.map(x=>'<span class="wave-tab '+(x.id===state.wave?'active ':'')+(state.launched.includes(x.id)?'done':'')+'">'+(state.launched.includes(x.id)?icon('check'):icon('plane'))+(x.id==='am'?'First':'Second')+'</span>').join('')+'</div>'+counter(selected.length,w.count)+'<div class="counter-caption">aircraft selected</div>'+slots(selected.length,w.count)+'<button class="go-btn '+(selected.length===w.count?'ready':'')+'" data-action="launch" data-focus="launch">Launch '+icon('arrow')+'</button></aside></div>'+controls()+'</main>';
  }
  function controls() {
    return '<div class="controls-row"><div class="secondary-controls"><button class="text-btn" data-action="undo" data-focus="undo" '+(!history.length?'disabled':'')+'>'+icon('undo')+'Undo</button><button class="text-btn" data-action="reset" data-focus="reset">'+icon('reset')+'Restart</button></div><button class="text-btn" data-action="help">'+icon('help')+'Hint</button></div>';
  }
  const taskIcon=t=>t.kind==='inspection'?'inspect':t.kind==='modB'?'drop':'mod';
  const dayLabel=d=>s.days[d].label+(s.days.length>7?' '+(Math.floor(d/7)+1):'');
  function boardScene() {
    const tl=G.timeline(s,state.placements),check=G.checkBoard(s,state),work=state.phase==='work';
    const selectedTask=s.tasks.find(t=>t.id===state.selectedTask);
    const w=waveForBoard(state.activeDay,state.boardWave),selected=state.flights[state.activeDay]?.[state.boardWave] || [];
    const title=work?(s.tasks.length===1?(s.tasks[0].kind==='inspection'?'Place the inspection.':'Place the modification.'):'Place the work.'):'Pick '+w.count+' aircraft.';
    const taskCount=s.tasks.filter(t=>own(state.placements,t.id)).length;
    const paired=s.tasks.some(t=>t.sharedHold) && taskCount===s.tasks.length && tl.holdDaysUsed===1 && !tl.errors.length;
    return '<main class="game-shell board-page" id="play" tabindex="-1">'+track()+'<div class="mission-head"><div><div class="mission-kicker">LEVEL '+s.id+'<span class="divider">/</span>'+esc(s.title)+'</div><h1>'+title+'</h1></div><div class="board-phase"><button data-action="phase" data-phase="work" class="'+(work?'active':'')+'">'+icon('wrench')+'Work</button><button data-action="phase" data-phase="flights" class="'+(!work?'active':'')+'">'+icon('plane')+'Flights</button></div></div><div class="board-objective">'+esc(s.objective)+'</div>'+(!work?requests(w,selected,state.activeDay):'')+'<div class="board-wrap"><section class="board-shell" aria-label="Aircraft checkerboard"><div class="board-top"><div class="board-title">'+icon('grid')+'<span>CHECKERBOARD</span></div><div class="legend"><span><i class="work"></i>Work</span><span><i class="cure"></i>Cure</span><span>'+icon('plane')+'Flight</span></div></div>'+ (work?'<div class="task-tray" aria-label="Work tiles">'+s.tasks.map(t=>'<button class="task-tile '+t.kind+(state.selectedTask===t.id?' active':'')+(own(state.placements,t.id)?' placed':'')+'" data-action="task" data-task="'+t.id+'" data-focus="task-'+t.id+'" draggable="true" aria-pressed="'+(state.selectedTask===t.id)+'"><span class="task-symbol">'+icon(taskIcon(t))+'</span><span>'+esc(t.label)+'<small>'+t.workDays+'d work'+(t.holdHours?' + '+t.holdHours+'h cure':'')+'</small></span>'+ (own(state.placements,t.id)?icon('check'):'')+'</button>').join('')+'</div>':'')+'<div class="board-scroll" tabindex="0" aria-label="Scrollable aircraft schedule"><div class="checkerboard" style="--days:'+s.days.length+'"><div class="board-corner">'+icon('plane')+'<span>AIRCRAFT</span></div>'+s.days.map((d,i)=>{
      const g=goalAt(i),done=state.confirmed.includes(i+'-am')&&state.confirmed.includes(i+'-pm');
      return '<button class="day-head '+(d.weekend?'weekend ':'')+(!work&&state.activeDay===i?'active ':'')+(done?'finished-day':'')+'" data-action="day" data-day="'+i+'" aria-label="'+dayLabel(i)+', '+(d.weekend?'no active work':g.am+' then '+g.pm+' flights')+'"><span>'+esc(d.label)+(s.days.length>7?'<sup>'+d.week+'</sup>':'')+'</span><small>'+(d.weekend?'—':g.am+' → '+g.pm)+'</small>'+(done?icon('check'):'')+'</button>';
    }).join('')+s.planes.map(p=>{
      const target=work&&selectedTask?.plane===p.id;
      return '<div class="row-head '+(target?'target ':'')+(p.idle?'priority':'')+'">'+icon('plane')+'<strong>'+p.id+'</strong>'+(p.idle?'<small>'+p.idle+'d</small>':'')+'</div>'+s.days.map((d,i)=>{
        const cell=tl.cells[p.id+'|'+i],active=!work&&state.activeDay===i,am=(state.flights[i]?.am || []).includes(p.id),pm=(state.flights[i]?.pm || []).includes(p.id);
        const within=target&&!d.weekend&&i>=selectedTask.window[0]&&i<=selectedTask.window[1]&&!G.timeline(s,{...state.placements,[selectedTask.id]:i}).errors.length;
        let content;
        if(cell) {
          const ic=cell.kind==='inspection'?'inspect':cell.kind==='cure'?'clock':cell.kind==='blocked'?'lock':cell.kind==='modB'?'drop':'mod';
          content='<span class="cell-content">'+icon(ic)+'<span>'+esc(cell.kind==='cure'?'CURE':cell.kind==='blocked'?(cell.waiting?'WAIT':'DOWN'):cell.label)+'</span></span>';
        } else {
          content='<span class="flight-half '+(am?'chosen ':'')+(active&&state.boardWave==='am'?'active-wave':'')+'">'+(am?icon('plane'):'<span>·</span>')+'</span><span class="flight-half '+(pm?'chosen ':'')+(active&&state.boardWave==='pm'?'active-wave':'')+'">'+(pm?icon('plane'):'<span>·</span>')+'</span>';
        }
        const conflict=cell&&(am||pm);
        const label='Aircraft '+p.id+', '+dayLabel(i)+(cell?', '+cell.label:', '+(am?'first wave selected':'first wave free')+', '+(pm?'second wave selected':'second wave free'));
        return '<button class="board-cell '+(d.weekend?'weekend ':'')+(within?'droppable ':'')+(cell?'busy '+cell.kind+' ':'')+(active?'is-current ':'')+(am||pm?'has-flight ':'')+(conflict?'invalid':'')+'" data-action="cell" data-plane="'+p.id+'" data-day="'+i+'" data-cell="'+p.id+'|'+i+'" data-focus="cell-'+p.id+'-'+i+'" aria-label="'+esc(label)+'" title="'+esc(label)+'">'+content+'</button>';
      }).join('');
    }).join('')+'</div></div><div class="board-summary">'+(work?'<span>'+icon('arrow')+(selectedTask?'Tap a day in aircraft '+selectedTask.plane+'’s row.':'Choose a tile to move it.')+'</span>':'<span>'+icon('plane')+'Top = first wave · bottom = second</span>')+(paired?'<span class="insight-pill">'+icon('clock')+'1 cure</span>':'')+'</div></section><aside class="board-side flight-panel">'+(work?'<div class="panel-label">WORK TILES</div><div class="placed-count"><strong>'+taskCount+'</strong> / '+s.tasks.length+'</div><div class="side-job-list">'+s.tasks.map(t=>'<div class="'+(own(state.placements,t.id)?'ready':'')+'">'+icon(own(state.placements,t.id)?'check':taskIcon(t))+'<span>'+esc(t.label)+'</span></div>').join('')+'</div>'+(selectedTask?'<div class="selected-task-info"><strong>'+esc(selectedTask.label)+'</strong><span>'+dayLabel(selectedTask.window[0])+'–'+dayLabel(selectedTask.window[1])+'</span>'+(own(state.placements,selectedTask.id)?'<button class="text-btn task-close" data-action="remove-task" data-focus="remove-task">'+icon('close')+'Remove</button>':'')+'</div>':'')+groundCounter(tl)+'<button class="go-btn '+(check.workOK?'ready':'')+'" data-action="plan-flights" data-focus="plan-flights">Plan flights '+icon('arrow')+'</button>':'<div class="day-controls"><button class="icon-btn" data-action="previous-day" data-focus="previous-day" aria-label="Previous flying day">'+icon('left')+'</button><strong>'+dayLabel(state.activeDay)+'</strong><button class="icon-btn" data-action="next-day" data-focus="next-day" aria-label="Next flying day">'+icon('right')+'</button></div><div class="wave-tabs">'+['am','pm'].map(id=>'<button class="wave-tab '+(id===state.boardWave?'active ':'')+(state.confirmed.includes(state.activeDay+'-'+id)?'done':'')+'" data-action="board-wave" data-wave="'+id+'">'+(state.confirmed.includes(state.activeDay+'-'+id)?icon('check'):icon('plane'))+(id==='am'?'First':'Second')+'</button>').join('')+'</div>'+counter(selected.length,w.count)+'<div class="counter-caption">aircraft selected</div><div class="compact-plan">'+s.flightGoals.filter(g=>g.am||g.pm).map(g=>'<button data-action="day" data-day="'+g.day+'" class="'+(g.day===state.activeDay?'active ':'')+(state.confirmed.includes(g.day+'-am')&&state.confirmed.includes(g.day+'-pm')?'done':'')+'" aria-label="'+dayLabel(g.day)+'">'+s.days[g.day].label.charAt(0)+(s.days.length>7?'<small>'+s.days[g.day].week+'</small>':'')+'</button>').join('')+'</div><button class="go-btn wave-flight-action '+(selected.length===w.count?'ready':'')+'" data-action="set-wave" data-focus="set-wave">Set '+(state.boardWave==='am'?'first':'second')+' wave '+icon('arrow')+'</button><button class="subtle-btn" data-action="check-board" data-focus="check-board">Check whole plan</button>')+'</aside></div>'+controls()+'</main>';
  }
  function groundCounter(tl) {
    if(s.maxGroundDays==null)return '';
    return '<div class="efficiency '+(tl.groundDays>s.maxGroundDays?'over':'')+'"><span>Grounded</span><strong>'+tl.groundDays+' / '+s.maxGroundDays+'d</strong><div class="ground-pips">'+Array.from({length:Math.max(s.maxGroundDays,tl.groundDays)},(_,i)=>'<i class="'+(i>=s.maxGroundDays?'extra':'')+'" style="opacity:'+(i<tl.groundDays?'1':'.18')+'"></i>').join('')+'</div></div>';
  }
  function skillScene(){
    const pack=currentPack(),meter=pack.meter(s,state.play),done=Number(meter.done)||0,total=Math.max(1,Number(meter.total)||1);
    return '<main class="game-shell skill-page" id="play" tabindex="-1">'+track()+'<div class="mission-head"><div><div class="mission-kicker">LEVEL '+s.id+'<span class="divider">/</span>'+esc(s.title)+'</div><h1>'+esc(s.prompt)+'</h1></div><span class="skill-symbol">'+icon(pack.icon)+'</span></div><div class="skill-layout"><section class="skill-board" aria-label="'+esc(pack.name)+' game board">'+pack.render(s,state.play,ui())+'</section><aside class="skill-side flight-panel"><div class="panel-label">'+esc(pack.name)+'</div><div class="skill-meter" aria-live="polite" aria-atomic="true"><strong>'+done+'</strong><span>/ '+total+'</span></div><div class="skill-meter-label">'+esc(meter.label)+'</div><div class="skill-meter-track"><i style="width:'+Math.min(100,Math.max(0,done/total*100))+'%"></i></div><button class="go-btn '+(done>=total?'ready':'')+'" data-action="skill-check" data-focus="skill-check">'+esc(s.checkLabel || 'Check it')+' '+icon('arrow')+'</button><div class="skill-feedback" aria-live="polite">'+esc(state.feedback || '')+'</div></aside></div>'+controls()+'</main>';
  }
  function winMarkup() {
    const count=state.earned || 0,last=s.id===G.levels.length;
    const headline=s.kind==='skills'?(last?'Fundamentals unlocked.':'Nice work.'):(last?'You kept it flying.':s.kind==='waves'?'Cleared for takeoff.':'That’s a working plan.');
    return '<section class="celebration" role="dialog" aria-modal="true" aria-labelledby="win-title"><div class="win-card"><div class="win-plane '+(s.kind==='skills'?'win-symbol':'')+'">'+(s.kind==='skills'?icon(currentPack().icon):plane())+'</div><div class="win-stars" aria-label="'+count+' stars">'+[1,2,3].map(i=>icon('star',i<=count?'earned':'')).join('')+'</div><div class="win-badge">'+(state.assisted?'DEMO COMPLETE':'LEVEL '+s.id+' COMPLETE')+'</div><h2 id="win-title">'+headline+'</h2><p>'+esc(s.reveal)+'</p><button class="go-btn ready" data-action="'+(last?'skills':'next-level')+'">'+(last?'Choose a specialty':'Next level')+' '+icon('arrow')+'</button><div class="btn-row"><button class="text-btn" data-action="replay">'+icon('reset')+'New case</button><button class="text-btn" data-action="review">'+icon('grid')+'Review</button></div></div></section>';
  }
  function render(preferredFocus) {
    const focus=preferredFocus || document.activeElement?.dataset?.focus;
    const pageY=window.scrollY;
    const scroll=root.querySelector('.board-scroll')?.scrollLeft || 0;
    root.innerHTML='<div class="game-stage" '+(state.won?'inert aria-hidden="true"':'')+'>'+header()+specialtyNav()+(s.kind==='waves'?waveScene():s.kind==='skills'?skillScene():boardScene())+'</div>'+(state.won?winMarkup():'');
    applyWorldLabels(root);
    document.body.dataset.world=worldId;document.body.dataset.skill=skill;
    document.body.classList.toggle('is-board',s.kind==='board');
    if(focus)root.querySelector('[data-focus="'+CSS.escape(focus)+'"]')?.focus({preventScroll:true});
    const grid=root.querySelector('.board-scroll');if(grid)grid.scrollLeft=scroll;
    if(pageY)window.scrollTo({top:pageY,behavior:'instant'});
  }
  function startLevel(id,seed,keepAttempt=false) {
    const prior=keepAttempt?{hints:state.hints,assisted:state.assisted,mistakes:state.mistakes}:null;
    const revision=keepAttempt?s.revision:undefined;
    clearTimeout(timer);fresh(Number(id),seed,revision);
    if(prior){Object.assign(state,prior);persist();}
    closeDialog();
    clearToast();
    historyReplace();render();window.scrollTo({top:0,behavior:'instant'});
    root.querySelector('#play')?.focus({preventScroll:true});
  }
  function historyReplace(){try {window.history.replaceState(null,'','#'+worldId+'/'+skill+'/'+s.id);}catch(_){}}
  function switchTrack(nextSkill,nextWorld=worldId,level){
    if(!skillInfo.some(k=>k.id===nextSkill)||!Object.keys(Worlds.worlds).includes(nextWorld))return;
    clearTimeout(timer);busy=false;persist();closeDialog();clearToast();
    skill=nextSkill;worldId=nextWorld;selectEngine();history=[];
    if(level&&G.levels.some(l=>l.id===level))fresh(level);else restore(false);
    persist();historyReplace();render();window.scrollTo({top:0,behavior:'instant'});
    root.querySelector('#play')?.focus({preventScroll:true});
  }
  function skillsMenu(){
    openDialog('Choose a specialty','<div class="specialty-cards">'+skillInfo.map(k=>{
      const p=profile.tracks[worldId+':'+k.id],n=k.id==='scheduling'?Flight.levels.length:Packs[k.id].levels.length,completed=Object.values(p?.best||{}).filter(x=>Number(x)>0).length;
      return '<button class="specialty-card '+(skill===k.id?'active':'')+'" data-action="switch-skill" data-skill="'+k.id+'"><span>'+icon(k.icon)+'</span><strong>'+esc(k.name)+'</strong><small>'+esc(k.tag)+'</small><em>'+completed+' / '+n+'</em></button>';
    }).join('')+'</div>',false);
  }
  function worldsMenu(){
    openDialog('Choose your world','<div class="world-cards">'+Object.values(Worlds.worlds).map(w=>{
      const stars=skillInfo.reduce((sum,k)=>sum+Object.values(profile.tracks[w.id+':'+k.id]?.best||{}).reduce((a,b)=>a+(Number(b)||0),0),0);
      return '<button class="world-card '+(worldId===w.id?'active':'')+'" style="--world-color:'+w.color+'" data-action="switch-world" data-world="'+w.id+'"><span class="world-card-art">'+icon(w.icon)+'</span><strong>'+esc(w.label)+'</strong><small>'+esc(w.description)+'</small><em>'+icon('star')+stars+'</em>'+(worldId===w.id?'<span class="world-current">'+icon('check')+'</span>':'')+'</button>';
    }).join('')+'</div><p class="help-footer">Five specialties in every world. Progress saves separately.</p>',false);
  }
  function packAction(element){
    if(s.kind!=='skills'||state.won||busy)return;
    const event={...element.dataset,action:element.dataset.skillAction,value:['INPUT','SELECT','TEXTAREA'].includes(element.tagName)?element.value:element.dataset.value};
    const result=currentPack().act(s,state.play,event);
    if(!result||!result.state)return;
    const changed=JSON.stringify(state.play)!==JSON.stringify(result.state);
    if(changed){checkpoint();state.play=result.state;state.feedback='';state.won=false;}
    if(result.error)state.mistakes++;
    if(result.message)state.feedback=result.error?result.message:'';
    persist();render(result.focus);if(result.message)toast(result.message,!!result.error);else if(changed)sound();
  }
  function checkSkill(){
    const result=currentPack().check(s,state.play);
    if(result.ok){finish();return;}
    state.mistakes++;state.feedback=result.message;persist();render();toast(result.message,true);
  }
  function selectPlane(id) {
    const w=s.waves.find(w=>w.id===state.wave);
    if(w.blocked.includes(id)){toast('Aircraft '+id+' · '+(s.grounded?.find(p=>p.plane===id)?.reason || 'Unavailable'),true);flash([id]);return;}
    const list=state[state.wave],has=list.includes(id);
    if(!has && list.length>=w.count){toast('Pick '+w.count+' for this wave. Swap one out.');return;}
    checkpoint();state[state.wave]=has?list.filter(x=>x!==id):[...list,id];state.won=false;persist();sound();render();
  }
  function launch() {
    const w=state.wave,result=G.checkWave(s,w,state[w]);
    if(!result.ok){failure(result);return;}
    checkpoint();busy=true;sound('launch');root.querySelector('.apron')?.classList.add('launching');
    timer=setTimeout(()=>{
      busy=false;state.launched=[...new Set([...state.launched,w])];
      if(w==='am'){state.wave='pm';persist();render();if(innerWidth<=680)root.querySelector('.mission-head')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});toast('First wave is back. Pick '+s.waves[1].count+'.');}
      else finish();
    },matchMedia('(prefers-reduced-motion: reduce)').matches?50:750);
  }
  function finish() {
    clearToast();
    state.earned=state.assisted?0:state.hints?1:state.mistakes?2:3;
    state.won=true;
    progress.best[s.id]=Math.max(Number(progress.best[s.id])||0,state.earned);
    if(skill==='scheduling'&&s.id===12)progress.last12={seed:s.seed,state:{placements:copy(state.placements),flights:copy(state.flights)}};
    persist();sound('win');render();
    root.querySelector('.celebration .go-btn')?.focus({preventScroll:true});
  }
  function placeTask(id,day) {
    const task=s.tasks.find(t=>t.id===state.selectedTask);
    if(!task){toast('Pick a work tile first.');return;}
    if(task.plane!==id){toast('Put this tile on aircraft '+task.plane+'.',true);return;}
    const candidate={...state.placements,[task.id]:day},tl=G.timeline(s,candidate);
    if(tl.errors.length){failure({message:tl.errors[0].message,badIds:[id]},day);return;}
    const before=G.timeline(s,state.placements);
    checkpoint();state.placements=candidate;state.confirmed=[];state.won=false;
    state.selectedTask=s.tasks.find(t=>!own(candidate,t.id))?.id || task.id;
    persist();sound();render();
    if(s.tasks.some(t=>t.sharedHold) && Object.keys(candidate).length===s.tasks.length && tl.holdDaysUsed===1 && before.holdDaysUsed>=1)toast('Two mods. One cure.');
  }
  function toggleFlight(id,day) {
    const g=goalAt(day);
    if(!g.am && !g.pm){toast('No flights planned on '+dayLabel(day)+'.');return;}
    if(state.activeDay!==day)state.activeDay=day;
    const w=waveForBoard(day,state.boardWave);
    const list=state.flights[day]?.[state.boardWave] || [],has=list.includes(id),cell=G.timeline(s,state.placements).cells[id+'|'+day];
    // A stale flight must remain removable after its aircraft becomes unavailable.
    if(cell&&!has){toast('Aircraft '+id+' · '+cell.label,true);flash([id],day);render();return;}
    if(!has && list.length>=w.count){toast('Pick '+w.count+' for this wave. Swap one out.');render();return;}
    checkpoint();state.flights[day] ||= {am:[],pm:[]};
    state.flights[day][state.boardWave]=has?list.filter(x=>x!==id):[...list,id];
    state.confirmed=state.confirmed.filter(x=>x!==day+'-'+state.boardWave);state.won=false;
    persist();sound();render();
  }
  function planFlights() {
    const result=G.checkBoard(s,state);
    if(!result.workOK){failure({message:result.tasksMissing.length?'Place every work tile first.':result.errors[0]});return;}
    checkpoint();state.phase='flights';state.activeDay=firstFlightDay();state.boardWave='am';state.selectedTask=null;persist();render();toast('Tap aircraft in the highlighted column.');
  }
  function setWave() {
    const day=state.activeDay,w=state.boardWave,data=waveForBoard(day,w),result=G.checkWave({planes:s.planes,waves:[data]},w,state.flights[day]?.[w] || []);
    if(!result.ok){failure(result,day);return;}
    checkpoint();state.confirmed=[...new Set([...state.confirmed,day+'-'+w])];sound('launch');
    const order=s.flightGoals.filter(g=>g.am||g.pm).flatMap(g=>['am','pm'].map(x=>({day:g.day,w:x})));
    const at=order.findIndex(x=>x.day===day&&x.w===w);
    const next=[...order.slice(at+1),...order.slice(0,at)].find(x=>!state.confirmed.includes(x.day+'-'+x.w));
    if(next){state.activeDay=next.day;state.boardWave=next.w;persist();render();scrollToActiveDay();toast(dayLabel(day)+' '+(w==='am'?'first':'second')+' wave set.');}
    else checkBoard();
  }
  function scrollToActiveDay() {
    const c=root.querySelector('.board-scroll'),head=root.querySelector('.day-head.active');
    if(c&&head){const left=head.offsetLeft-c.offsetLeft;if(left<c.scrollLeft+80||left>c.scrollLeft+c.clientWidth-75)c.scrollTo({left:Math.max(0,left-90),behavior:'smooth'});}
  }
  function checkBoard() {
    const result=G.checkBoard(s,state);
    if(result.ok){finish();return;}
    state.mistakes++;state.won=false;
    if(!result.workOK){state.phase='work';}
    else {
      const failed=result.checks.find(c=>c.id!=='work'&&!c.ok),parts=failed?.id.split('-');
      state.phase='flights';if(parts){state.activeDay=Number(parts[0]);state.boardWave=parts[1];}
    }
    persist();render();toast(result.message,true);
    result.badCells.forEach(key=>root.querySelector('[data-cell="'+CSS.escape(key)+'"]')?.classList.add('bad-flash'));scrollToActiveDay();
  }
  function chooseDay(day) {
    if(state.phase==='work'){toast('Choose a work tile, then tap its aircraft’s row.');return;}
    const g=goalAt(day);if(!g.am&&!g.pm){toast('No flights on '+dayLabel(day)+'.');return;}
    state.activeDay=day;persist();render();scrollToActiveDay();
  }
  function nextDay(direction) {
    const list=s.flightGoals.filter(g=>g.am||g.pm).map(g=>g.day),at=list.indexOf(state.activeDay);
    chooseDay(list[(at+direction+list.length)%list.length]);
  }
  function closeDialog(){if(dialog.open)dialog.close();}
  function openDialog(title,body,translate=true) {
    dialogBody.innerHTML='<div class="dialog-head"><h2>'+esc(title)+'</h2><button class="icon-btn" data-action="close" aria-label="Close">'+icon('close')+'</button></div><div class="dialog-content">'+body+'</div>';
    if(translate)applyWorldLabels(dialogBody);
    if(!dialog.open)dialog.showModal();
  }
  function levelMap() {
    openDialog('Choose your challenge','<div class="level-map">'+G.levels.map(l=>{
      const status=levelStatus(l.id),caption=status==='demo'?'Example viewed':skill==='scheduling'?(l.kind==='waves'?'Aircraft selection':'Checkerboard'):l.chapter;
      return '<button class="map-level '+(s.id===l.id?'current ':'')+status+'" data-action="level" data-id="'+l.id+'"><span class="map-number">'+l.id+'</span><span>'+esc(l.title)+'<small class="map-caption">'+esc(caption)+'</small></span><span class="map-stars">'+[1,2,3].map(i=>icon('star',i<=(progress.best[l.id]||0)?'earned':'')).join('')+'</span></button>';
    }).join('')+'</div>');
  }
  function menu() {
    openDialog('Force Multiplier','<div class="menu-items"><button data-action="worlds">'+icon(world().icon)+'<span>Choose a world</span></button><button data-action="skills">'+icon('grid')+'<span>Choose a specialty</span></button><button data-action="map">'+icon('calendar')+'<span>Choose a level</span></button><button data-action="replay">'+icon('reset')+'<span>New case</span></button><button data-action="solution">'+icon('play')+'<span>Show a working example</span></button><button data-action="sound" aria-pressed="'+progress.sound+'">'+icon(progress.sound?'sound':'mute')+'<span>Sound</span><small>'+(progress.sound?'On':'Off')+'</small></button>'+(isNative?'<button data-action="haptics" aria-pressed="'+(profile.haptics!==false)+'">'+icon('bolt')+'<span>Haptics</span><small>'+(profile.haptics!==false?'On':'Off')+'</small></button>':'')+'<button data-action="fullscreen">'+icon('expand')+'<span>'+(isNative?(document.body.classList.contains('fullscreen')?'Exit focus view':'Focus view'):'Full screen')+'</span></button><button data-action="model">'+icon('help')+'<span>Game rules</span></button><button data-action="saved-data">'+icon('database')+'<span>Saved data</span></button><a href="./courses.html#home">'+icon('book')+'<span>Practice workspace</span></a></div><nav class="menu-links" aria-label="App information"><a href="./about.html">About</a><a href="./privacy.html">Privacy</a><a href="./support.html">Help</a></nav><p class="help-footer">'+(Device?.storageAvailable===false?'Saving needs attention. Export a backup.':'Your game saves on this device.')+'</p>',false);
  }
  function savedData() {
    openDialog('Saved data','<div class="menu-items"><button data-action="export-game">'+icon('upload')+'<span>Export game backup</span></button><button data-action="import-game">'+icon('book')+'<span>Import game backup</span></button><button data-action="reset-all" class="danger">'+icon('reset')+'<span>Reset all progress</span></button></div><p class="help-footer">Game backups include worlds, stars and unfinished challenges. The practice workspace has its own backup.</p>',false);
  }
  async function exportGame() {
    try {
      const result=await Device.shareJSON('force-multiplier-game-'+new Date().toISOString().slice(0,10)+'.json',{format:'force-multiplier-game',version:1,exportedAt:new Date().toISOString(),data:profile});
      toast(result?.completed===false?'Export canceled.':'Backup ready. Keep a copy in Files.');
    } catch (_) { toast('Could not export. Your current game is still open.',true); }
  }
  async function importGame() {
    try {
      const file=await native.importFile();if(!file)return;
      if(file.data.length>8000000)throw Error('This backup is too large. Maximum size is 8 MB.');
      const backup=JSON.parse(file.data);
      if(backup.format!=='force-multiplier-game'||backup.version!==1)throw Error('Choose a Force Multiplier game backup. Practice backups belong in the practice workspace.');
      pendingGameRestore=window.FMGameBackup.validate(backup.data,{Flight,Packs,Worlds});
      const tracks=Object.keys(pendingGameRestore.tracks).length;
      openDialog('Restore game backup?','<p>'+tracks+' saved world / specialty tracks. This replaces your current game progress. Practice workspace data stays as it is.</p><div class="menu-items"><button data-action="export-game">Export current game first</button><button data-action="confirm-game-restore">Restore game backup</button><button data-action="close">Cancel</button></div>',false);
    } catch (error) { pendingGameRestore=null;toast(error instanceof SyntaxError?'This file is not valid JSON.':error.message||'Could not open this backup.',true); }
  }
  async function restoreGame() {
    if(!pendingGameRestore)return;
    profile=pendingGameRestore;pendingGameRestore=null;
    skill=profile.activeSkill;worldId=profile.world;
    clearTimeout(timer);history=[];busy=false;selectEngine();restore(false);
    window.history.replaceState(null,'','#'+worldId+'/'+skill+'/'+s.id);
    closeDialog();render();
    const saved=await persist();toast(saved?'Game restored.':'Backup opened. Export your work if saving stays unavailable.',!saved);
  }
  function confirmResetAll() {
    openDialog('Reset all progress?','<p>This deletes all game progress, practice exercises, submitted work, notes and settings on this device.</p><div class="menu-items"><button data-action="export-game">Export game backup first</button><button data-action="confirm-reset-all" class="danger">Reset all progress</button><button data-action="close">Cancel</button></div><p class="help-footer">Export practice work from the practice workspace before resetting.</p>',false);
  }
  async function resetAll() {
    busy=true;resetting=true;
    try {
      await Device.remove([storageKey,legacyStorageKey,'force-multiplier-universal-v22']);
      clearTimeout(timer);profile=emptyProfile();skill='scheduling';worldId='airline';selectEngine();fresh(1);
      window.history.replaceState(null,'','#airline/scheduling/1');closeDialog();render();toast('All progress reset.');
    } catch (_) { toast('Could not finish the reset. Reopen the app and try again.',true); }
    finally { busy=false;resetting=false; }
  }
  function showHelp() {
    state.hints++;persist();
    let visual='';
    if(s.kind==='skills')visual='<div class="tip-image">'+icon(currentPack().icon)+' → '+icon('check')+'</div>';
    else if(s.kind==='waves')visual='<div class="tip-image">'+icon('plane')+' → '+icon('check')+' → '+icon('plane')+'</div>';
    else if(s.tasks.some(t=>t.holdHours)&&s.id!==9)visual='<div class="tip-image"><span class="tip-day">'+icon('wrench')+'<small>Work</small></span><span class="tip-day cure">'+icon('clock')+'<small>24h cure</small></span><span class="tip-day flight">'+icon('plane')+'<small>Fly</small></span></div>';
    else visual='<div class="tip-image">'+icon('wrench')+' → '+icon('grid')+'</div>';
    openDialog('A small hint',visual+'<p>'+esc(s.tip || s.hint)+'</p><button class="go-btn ready" data-action="close">Got it '+icon('arrow')+'</button>');
  }
  function showRules() {
    if(s.kind==='skills'){
      openDialog('The rules of this game','<div class="rules-list"><p>'+icon('grid')+'Tap cards, place values, and build the work.</p><p>'+icon('undo')+'Undo a move or restart this challenge.</p><p>'+icon('star')+'3 stars: no failed checks. 2: corrected work. 1: hint used. A shown example earns no stars.</p></div><p class="help-footer">Fictional scenarios and simplified models. Stars track game progress, not job certification.</p>',false);return;
    }
    openDialog('The rules of this game','<div class="rules-list"><p>'+icon('plane')+'One flight per aircraft, per wave. Aircraft can return for wave two.</p><p>'+icon('wrench')+'Work runs 08:00–16:00 on weekdays. Striped days stay grounded.</p><p>'+icon('clock')+'A 24-hour cure ends at 16:00 the following calendar day. Flying resumes the next morning.</p><p>'+icon('star')+'3 stars: no failed checks. 2: corrected plan. 1: hint used. A shown solution earns no stars.</p></div><p class="help-footer">Fictional aircraft and simplified rules for this game. Work durations, cure compatibility, and flying limits vary in real operations.</p>');
  }
  function solution() {
    state.hints++;state.assisted=true;checkpoint();closeDialog();
    if(s.kind==='skills'){state.play=copy(currentPack().solve(s));state.won=false;state.feedback='';persist();render();toast('Example loaded. Check the work.');}
    else if(s.kind==='waves'){state.am=copy(s.model.am);state.pm=copy(s.model.pm);state.wave='am';state.launched=[];state.won=false;persist();render();toast('Example loaded. Launch to see it work.');}
    else {state.placements=copy(s.model.placements);state.flights=copy(s.model.flights);state.phase='flights';state.activeDay=firstFlightDay();state.boardWave='am';state.confirmed=[];state.won=false;persist();render();toast('Example loaded. Check the whole plan.');}
  }
  function undo() {
    if(!history.length)return;
    const attempts=state.mistakes,hints=state.hints,assisted=state.assisted;
    state=history.pop();state.mistakes=Math.max(attempts,state.mistakes);state.hints=Math.max(hints,state.hints);state.assisted=assisted||state.assisted;state.won=false;persist();render();toast('Undone.');
  }
  root.addEventListener('dragstart',event=>{
    const tile=event.target.closest('[data-task]');if(!tile)return;
    state.selectedTask=tile.dataset.task;event.dataTransfer.setData('text/plain',tile.dataset.task);event.dataTransfer.effectAllowed='move';
  });
  root.addEventListener('dragover',event=>{if(state.phase==='work'&&event.target.closest('[data-cell]')){event.preventDefault();event.dataTransfer.dropEffect='move';}});
  root.addEventListener('drop',event=>{
    const cell=event.target.closest('[data-cell]');if(!cell||state.phase!=='work')return;
    event.preventDefault();const id=event.dataTransfer.getData('text/plain');
    if(s.tasks.some(t=>t.id===id)){state.selectedTask=id;placeTask(cell.dataset.plane,Number(cell.dataset.day));}
  });
  document.addEventListener('click',event=>{
    const tile=event.target.closest('[data-skill-action]');
    if(tile&&!tile.disabled&&!['INPUT','SELECT','TEXTAREA'].includes(tile.tagName)){packAction(tile);return;}
    const button=event.target.closest('[data-action]');if(!button||button.disabled||busy)return;
    const a=button.dataset.action;
    if(a==='plane')selectPlane(button.dataset.plane);
    else if(a==='launch')launch();
    else if(a==='map')levelMap();
    else if(a==='worlds')worldsMenu();
    else if(a==='skills')skillsMenu();
    else if(a==='switch-skill')switchTrack(button.dataset.skill);
    else if(a==='switch-world')switchTrack(skill,button.dataset.world);
    else if(a==='skill-check')checkSkill();
    else if(a==='level')startLevel(Number(button.dataset.id));
    else if(a==='next-level')startLevel(Math.min(s.id+1,G.levels.length));
    else if(a==='replay')startLevel(s.id,randomSeed());
    else if(a==='reset'){const seed=s.seed;startLevel(s.id,seed,true);toast('Fresh start. Same challenge.');}
    else if(a==='undo')undo();
    else if(a==='close')closeDialog();
    else if(a==='menu')menu();
    else if(a==='help')showHelp();
    else if(a==='model')showRules();
    else if(a==='solution')solution();
    else if(a==='review'){state.won=false;persist();render();}
    else if(a==='sound'){progress.sound=!progress.sound;persist();sound();render();if(dialog.open)menu();}
    else if(a==='haptics'&&isNative){profile.haptics=profile.haptics===false;persist();sound();menu();}
    else if(a==='saved-data')savedData();
    else if(a==='export-game')exportGame();
    else if(a==='import-game')importGame();
    else if(a==='confirm-game-restore')restoreGame();
    else if(a==='reset-all')confirmResetAll();
    else if(a==='confirm-reset-all')resetAll();
    else if(a==='retry-save')persist().then(ok=>toast(ok?'Progress saved.':'Saving is still unavailable. Export a backup.',!ok));
    else if(a==='fullscreen'){
      closeDialog();
      if(isNative){document.body.classList.toggle('fullscreen');return;}
      if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});document.body.classList.remove('fullscreen');}
      else if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>{document.body.classList.toggle('fullscreen');toast('Full-screen view enabled.');});}
      else document.body.classList.toggle('fullscreen');
    }
    else if(a==='task'){state.selectedTask=button.dataset.task;persist();render();}
    else if(a==='remove-task'){checkpoint();delete state.placements[state.selectedTask];state.confirmed=[];persist();render();}
    else if(a==='cell'){if(state.phase==='work')placeTask(button.dataset.plane,Number(button.dataset.day));else toggleFlight(button.dataset.plane,Number(button.dataset.day));}
    else if(a==='phase'){if(button.dataset.phase==='flights')planFlights();else{checkpoint();state.phase='work';state.selectedTask ||= s.tasks[0]?.id;persist();render();}}
    else if(a==='plan-flights')planFlights();
    else if(a==='day')chooseDay(Number(button.dataset.day));
    else if(a==='previous-day')nextDay(-1);
    else if(a==='next-day')nextDay(1);
    else if(a==='board-wave'){state.boardWave=button.dataset.wave;persist();render();}
    else if(a==='set-wave')setWave();
    else if(a==='check-board')checkBoard();
  });
  document.addEventListener('change',event=>{const input=event.target.closest('[data-skill-action]');if(input&&!input.disabled)packAction(input);});
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
  window.addEventListener('keydown',event=>{
    if(state.won&&!dialog.open){
      if(event.key==='Escape'){state.won=false;persist();render();return;}
      if(event.key==='Tab'){
        const buttons=[...root.querySelectorAll('.celebration button')],first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    }
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!dialog.open){event.preventDefault();if(!busy)undo();}
  });
  window.addEventListener('hashchange',()=>{const r=readRoute();if(!r)return;if(r.skill!==skill||r.world!==worldId)switchTrack(r.skill,r.world,r.id);else if(G.levels.some(l=>l.id===r.id)&&r.id!==s.id)startLevel(r.id);});
  selectEngine();restore();persist();render();
  window.addEventListener('pagehide',()=>{if(!resetting)persist();});
  if(!isNative&&'serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
if(window.FMNative?.isNative)window.FMNative.ready.then(startForceMultiplierGame);
else startForceMultiplierGame();
