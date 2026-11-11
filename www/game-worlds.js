(function(root){
  'use strict';
  const worlds = {
    airline:{id:'airline',label:'Airline',assetSingular:'aircraft',assetPlural:'aircraft',jobSingular:'flight',jobPlural:'flights',person:'pilot',place:'airline',icon:'plane',color:'#8ed2f1',description:'Plan flights. Keep aircraft ready.',short:'Airline'},
    bus:{id:'bus',label:'Bus Company',assetSingular:'bus',assetPlural:'buses',jobSingular:'run',jobPlural:'runs',person:'driver',place:'bus company',icon:'bus',color:'#f1ce8a',description:'Plan routes. Keep buses moving.',short:'Bus Company'},
    cats:{id:'cats',label:'Cat Hugs',assetSingular:'care van',assetPlural:'care vans',jobSingular:'visit',jobPlural:'visits',person:'volunteer',place:'cat rescue',icon:'cat',color:'#edb9d0',description:'Send care vans. Deliver cat hugs.',short:'Cat Hugs'},
    squirrel:{id:'squirrel',label:'Acorn Ops',assetSingular:'rover',assetPlural:'rovers',jobSingular:'mission',jobPlural:'missions',person:'crew member',place:'Acorn Ops',icon:'squirrel',color:'#a8ddbb',description:'Plan missions. Keep teams ready.',short:'Acorn Ops'}
  };
  function vehicle(id){
    const color=worlds[id]?.color || '#8ed2f1';
    const roof=id==='cats'?'<path d="M60 81c-17-11-22-20-13-24 6-3 12 1 13 5 1-4 7-8 13-5 9 4 4 13-13 24" fill="#be6385"/>':id==='squirrel'?'<path d="M47 66q13-15 26 0v10q-2 16-13 20-11-4-13-20Z" fill="#5a8e69"/><path d="M44 66q16-14 32 0v6H44Z" fill="#23513b"/><path d="m60 57 4-6" fill="none" stroke="#23513b" stroke-width="3"/>':'<rect x="47" y="54" width="26" height="40" rx="4" fill="#fff" opacity=".22"/>';
    return '<svg class="plane-svg vehicle-svg" viewBox="0 0 120 138" aria-hidden="true"><rect x="25" y="27" width="9" height="23" rx="4" fill="#25485c"/><rect x="86" y="27" width="9" height="23" rx="4" fill="#25485c"/><rect x="25" y="93" width="9" height="23" rx="4" fill="#25485c"/><rect x="86" y="93" width="9" height="23" rx="4" fill="#25485c"/><rect x="31" y="7" width="58" height="122" rx="'+(id==='bus'?13:21)+'" fill="currentColor"/><path d="M37 22q23-10 46 0v21H37Z" fill="#264b60"/><path d="M40 29h40" stroke="'+color+'" stroke-width="3" opacity=".7"/>'+roof+'<rect x="39" y="109" width="42" height="11" rx="3" fill="#264b60"/><rect x="34" y="13" width="9" height="6" rx="2" fill="#fff6c6"/><rect x="77" y="13" width="9" height="6" rx="2" fill="#fff6c6"/><path d="M34 48v52m52-52v52" fill="none" stroke="#fff" stroke-width="3" opacity=".25"/></svg>';
  }
  const cap = v => v.charAt(0).toUpperCase()+v.slice(1);
  function text(value,id){
    let v=String(value??'');if(id==='airline'||!worlds[id])return v;
    const w=worlds[id],singular=w.assetSingular,plural=w.assetPlural;
    const phrases=[
      [/READY FOR TAKEOFF/g,id==='cats'?'READY FOR HUGS':id==='squirrel'?'READY FOR MISSIONS':'READY TO ROLL'],
      [/Cleared for takeoff\./g,id==='cats'?'Hugs on the way.':id==='squirrel'?'Mission accomplished.':'Ready to roll.'],
      [/You kept it flying\./g,id==='cats'?'You kept the visits going.':'You kept it moving.'],
      [/Keep them flying/g,'Keep them moving'],
      [/today’s flying/g,id==='bus'?'today’s routes':'today’s '+w.jobPlural],
      [/Fly it/g,'Use it'],[/fly it/g,'use it'],
      [/\bAn aircraft\b/g,'A '+singular],[/\ban aircraft\b/g,'a '+singular],
      [/\bAircraft (?=\d)/g,cap(singular)+' '],[/\baircraft (?=\d)/g,singular+' '],
      [/\ba usable aircraft\b/g,'a usable '+singular],
      [/\bA usable aircraft\b/g,'A usable '+singular],
      [/\bthe aircraft\b/g,'the '+singular],[/\bThe aircraft\b/g,'The '+singular],
      [/\baircraft\b/g,plural],[/\bAircraft\b/g,cap(plural)],[/\bAIRCRAFT\b/g,plural.toUpperCase()],
      [/\bflights\b/g,w.jobPlural],[/\bFlights\b/g,cap(w.jobPlural)],[/\bFLIGHTS\b/g,w.jobPlural.toUpperCase()],
      [/\bflight\b/g,w.jobSingular],[/\bFlight\b/g,cap(w.jobSingular)],
      [/\bpilots\b/g,w.person==='crew member'?'crew members':w.person+'s'],[/\bpilot\b/g,w.person],[/\bPilot\b/g,cap(w.person)],
      [/\bFlown\b/g,'Used'],[/\bflew\b/g,'worked'],[/\bflying\b/g,id==='bus'?'running':'operating'],[/\bFlying\b/g,id==='bus'?'Running':'Operating'],
      [/\bfly\b/g,id==='bus'?'run':'operate'],[/\bFly\b/g,id==='bus'?'Run':'Use'],
      [/\bLaunch\b/g,id==='cats'?'Send hugs':id==='squirrel'?'Send team':'Dispatch'],
      [/\bFirst wave is back\b/g,'First '+(id==='bus'?'run':'team')+' is back']
    ];
    phrases.forEach(([from,to])=>{v=v.replace(from,to);});return v;
  }
  const api={worlds,vehicle,text};
  if(root)root.FM_WORLDS=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
