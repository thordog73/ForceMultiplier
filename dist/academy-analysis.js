/* Force Multiplier 22.17.0 — guided, visible evidence inside Block Academy. */
(function () {
'use strict';
var Model=window.FMAcademyAnalysisModel;
if(!Model)return;
var tracks=Model.describe().tracks;
var E=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var num=function(x){return Number.isFinite(Number(x))?Math.round(Number(x)*100)/100:0;};
var mean=function(a){return a.reduce(function(s,x){return s+x;},0)/a.length;};
function ensure(state){
  var academy=state.academy||(state.academy={}),a=academy.analysisLab||(academy.analysisLab={});
  if(!tracks.some(function(t){return t.id===a.track;}))a.track='rates';
  if(!Number.isInteger(a.level)||a.level<1)a.level=1;
  if(!Number.isInteger(a.variation)||a.variation<0)a.variation=0;
  if(!Number.isInteger(a.step)||a.step<0)a.step=0;
  if(!Array.isArray(a.history))a.history=[];
  if(!a.progress||typeof a.progress!=='object')a.progress={};
  if(!a.runs||typeof a.runs!=='object')a.runs={};
  if(!Number.isInteger(a.mistakes)||a.mistakes<0)a.mistakes=0;
  if(!Number.isInteger(a.choicePage)||a.choicePage<0)a.choicePage=0;
  return a;
}
function caseFor(state){var a=ensure(state);return Model.makeCase(a.track,a.level,a.variation);}
function fresh(a){
  a.step=0;a.selected=null;a.checked=false;a.feedback=null;a.assisted=false;
  a.completed=false;a.history=[];a.mistakes=0;a.choicePage=0;a.help=null;
}
function checkpoint(a){
  a.runs[a.track]={level:a.level,variation:a.variation,step:a.step,selected:a.selected,
    checked:!!a.checked,feedback:a.feedback,assisted:!!a.assisted,completed:!!a.completed,
    history:a.history.slice(),mistakes:a.mistakes,choicePage:a.choicePage};
}
function chooseTrack(state,id,ui){
  if(!tracks.some(function(t){return t.id===id;}))return;
  var a=ensure(state);
  if(a.started)checkpoint(a);
  var saved=a.runs[id];
  a.track=id;
  if(saved)Object.assign(a,saved);
  else{
    a.level=id==='rates'?Math.min(90,Math.max(1,(Number(state.academy.progress&&state.academy.progress[5])||0)+1)):1;
    a.variation=0;fresh(a);
  }
  a.help=null;a.focusQuestion=true;a.started=true;state.academy.focusPanel=null;
  ui.setRoute('academy','analysis-lab');
}
function resumeRate(state){
  var a=ensure(state);
  if(a.started)checkpoint(a);
  var saved=a.runs.rates;
  a.track='rates';
  if(saved)Object.assign(a,saved);
  else{
    a.level=Math.max(1,Math.min(90,Number(state.academy.round)||1));
    a.variation=Math.max(0,Number(state.academy.variation)||0);fresh(a);
  }
  a.started=true;a.help=null;a.focusQuestion=true;
  state.academy.focusPanel=null;state.screen='analysis-lab';
}
function homeCards(state){
  var a=ensure(state),card=function(t){
    var p=a.progress[t.id]||{},count=Number(p.independent)||0;
    return '<button class="al-course" data-al-track="'+E(t.id)+'"><span class="al-course-icon" aria-hidden="true">'+
      ({rates:'÷',reports:'▤',trend:'↗',correlation:'⠿',difference:'Δ',fishbone:'⑂',improve:'↻'}[t.id])+
      '</span><span><strong>'+E(t.shortTitle)+'</strong><small>'+E(t.description)+'</small><em>'+
      t.lessons+' concept families · '+count+' completed without examples</em></span><b aria-hidden="true">→</b></button>';
  };
  return '<section class="al-home-section" aria-labelledby="al-home-title"><div class="academy-sectionhead"><div><small>BUILD THE DECISION · ONE BLOCK AT A TIME</small><h2 id="al-home-title">Analysis in Block Academy</h2></div></div>'+
    '<p class="al-home-intro">Read the evidence. Choose a block. Check why it fits. Each exercise teaches the steps as you go.</p>'+
    '<div class="al-course-grid">'+tracks.slice(0,2).map(card).join('')+'</div>'+
    '<div class="al-lab-heading"><span>IMPROVEMENT LABORATORY</span><h3>See the pattern. Test the explanation.</h3><p>Use real charts of fictional training data to practice trend, correlation, difference, fishbone reasoning and testing a change.</p></div>'+
    '<div class="al-course-grid al-lab-grid">'+tracks.slice(2).map(card).join('')+'</div></section>';
}
function svgText(x,y,text,attrs){return '<text x="'+num(x)+'" y="'+num(y)+'" '+(attrs||'')+'>'+E(text)+'</text>';}
function chartSVG(chart,expanded){
  if(!chart)return '';
  var W=440,H=210,L=50,R=20,T=22,B=44,pw=W-L-R,ph=H-T-B;
  var body='',label=chart.description||'Training data chart';
  var colors=['#69d8ef','#ffd778','#bf9dff'],labelAttrs='font-size="12" fill="#c5dfec"';
  if(chart.kind==='fishbone'){
    body='<path d="M28 108 H405" stroke="#78c9df" stroke-width="3"/><path d="M397 101 L408 108 L397 115" fill="none" stroke="#78c9df" stroke-width="3"/>';
    (chart.categories||[]).forEach(function(g,i){
      var x=78+Math.floor(i/2)*112,top=i%2===0,sy=top?36:173;
      body+='<path d="M'+(x-24)+' '+sy+' L'+(x+16)+' 108" stroke="#5b91ad" stroke-width="2"/>';
      body+=svgText(x-18,top?26:191,g.name,'font-size="13" fill="#e3f5ff" text-anchor="middle"');
    });
    body+=svgText(216,89,'Possible contributors','font-size="13" fill="#ffe5a1" text-anchor="middle"');
    body+=svgText(216,132,'Effect: delayed jobs','font-size="13" fill="#e6f4ff" text-anchor="middle"');
  }else{
    var ys=[],xs=[],ymax,xmax,xmin=0;
    if(chart.kind==='line'){(chart.series||[]).forEach(function(s){ys=ys.concat(s.values);});xs=(chart.labels||[]).map(function(_,i){return i;});}
    if(chart.kind==='scatter'){ys=(chart.points||[]).map(function(p){return p.y;});xs=(chart.points||[]).map(function(p){return p.x;});}
    if(chart.kind==='groups'){(chart.groups||[]).forEach(function(g){ys=ys.concat(g.values);});xs=[0,1];}
    ymax=Math.max(1,...ys)*1.12;xmax=Math.max(1,...xs);
    var y=function(v){return T+ph-(v/ymax)*ph;},x=function(v){return L+(v-xmin)/(xmax-xmin)*pw;};
    for(var tick=0;tick<=2;tick++){
      var val=ymax*tick/2,yy=y(val);
      body+='<path d="M'+L+' '+num(yy)+' H'+(W-R)+'" stroke="#355970" stroke-width="1"/>';
      body+=svgText(L-7,yy+4,Math.round(val*10)/10,labelAttrs+' text-anchor="end"');
    }
    body+=svgText(L,14,chart.yLabel||'Value','font-size="11" fill="#c5dfec"');
    if(chart.kind==='line'){
      (chart.series||[]).forEach(function(s,si){
        var path=s.values.map(function(v,i){return (i?'L':'M')+num(x(i))+' '+num(y(v));}).join(' ');
        body+='<path d="'+path+'" fill="none" stroke="'+colors[si%colors.length]+'" stroke-width="3" stroke-linejoin="round"/>';
        s.values.forEach(function(v,i){body+='<circle cx="'+num(x(i))+'" cy="'+num(y(v))+'" r="3" fill="'+colors[si%colors.length]+'"><title>'+E((chart.labels||[])[i]+': '+v+' · '+s.name)+'</title></circle>';});
      });
      (chart.labels||[]).forEach(function(v,i,arr){
        if(arr.length<=6||i===0||i===arr.length-1||i%3===0)body+=svgText(x(i),H-B+17,v,labelAttrs+' text-anchor="middle"');
      });
    }else if(chart.kind==='scatter'){
      (chart.points||[]).forEach(function(p){body+='<circle cx="'+num(x(p.x))+'" cy="'+num(y(p.y))+'" r="4" fill="#71dff1" stroke="#e9fbff" stroke-width="1"><title>'+E(p.label+': '+p.x+', '+p.y)+'</title></circle>';});
      [0,xmax/2,xmax].forEach(function(v){body+=svgText(x(v),H-B+17,num(v),labelAttrs+' text-anchor="middle"');});
    }else if(chart.kind==='groups'){
      (chart.groups||[]).forEach(function(g,i,arr){
        var xx=L+(i+.5)/arr.length*pw,avg=mean(g.values);
        body+='<path d="M'+num(xx-26)+' '+num(y(avg))+' H'+num(xx+26)+'" stroke="'+colors[i%colors.length]+'" stroke-width="4"/>';
        g.values.forEach(function(v,j){body+='<circle cx="'+num(xx+((j%5)-2)*7)+'" cy="'+num(y(v))+'" r="3.4" fill="'+colors[i%colors.length]+'" opacity=".8"><title>'+E(g.name+': '+v)+'</title></circle>';});
        body+=svgText(xx,H-B+17,g.name,labelAttrs+' text-anchor="middle"');
      });
    }
    body+=svgText(L+pw/2,H-5,chart.xLabel||'Observation','font-size="11" fill="#c5dfec" text-anchor="middle"');
  }
  return '<svg class="al-data-chart '+(expanded?'expanded':'')+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E(label)+'"><title>'+E(chart.kind==='fishbone'?'Fishbone: hypotheses to investigate':label)+'</title>'+body+'</svg>';
}
function chartTable(c){
  var chart=c.chart;
  if(!chart)return '';
  var headers=[],rows=[];
  if(chart.kind==='line'){
    headers=[chart.xLabel||'Observation'].concat(chart.series.map(function(s){return s.name;}));
    rows=chart.labels.map(function(label,i){return [label].concat(chart.series.map(function(s){return s.values[i];}));});
  }else if(chart.kind==='scatter'){
    headers=['Observation',chart.xLabel,chart.yLabel];rows=chart.points.map(function(p){return [p.label,p.x,p.y];});
  }else if(chart.kind==='groups'){
    headers=['Independent group','Observation ID','Minutes'];
    rows=[];
    chart.groups.forEach(function(g){g.values.forEach(function(v,i){rows.push([g.name,g.name+' '+(i+1),v]);});});
  }else{
    headers=['Branch','Possible contributors'];rows=chart.categories.map(function(g){return [g.name,g.items.join('; ')];});
  }
  return '<div class="al-table-wrap"><table><caption>'+E(chart.description||'Exact training observations')+'</caption><thead><tr>'+
    headers.map(function(h){return '<th scope="col">'+E(h)+'</th>';}).join('')+'</tr></thead><tbody>'+
    rows.map(function(row){return '<tr>'+row.map(function(v,i){return i?'<td>'+E(v)+'</td>':'<th scope="row">'+E(v)+'</th>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
}
function caseBrief(c){
  if(c.track==='rates')return c.metric.id==='fix8'?'All eligible breaks have complete 8-hour follow-up. Count breaks from this reporting month.':'Use the defined count and population from the same reporting month.';
  if(c.track==='trend')return 'Read all months in order. The plotted observations use one measurement definition.';
  if(c.track==='correlation')return 'Each dot pairs values from the same shift. These observations do not establish a cause; job mix can differ.';
  if(c.track==='difference')return 'Unpaired samples; same job definition. Welch uses α = 0.05 and assumes independent observations and approximate normality.';
  if(c.track==='fishbone')return 'A branch is a possible contributor. Look for evidence and test it before naming a cause.';
  if(c.track==='improve'){
    var caveat=c.evidence.match(/At Month 3[\s\S]*|A source audit[\s\S]*/);
    return caveat?caveat[0]:'The handoff pilot aims to reduce waiting. Also check rework and overtime; one baseline point does not prove stability.';
  }
  return '';
}
function evidenceView(c,a,expanded){
  if(expanded)return '<p>'+E(c.scope||'Fictional training case.')+'</p><p>'+E(c.evidence)+'</p>'+chartSVG(c.chart,true)+
    '<dl class="al-facts">'+(c.facts||[]).map(function(f){return '<div><dt>'+E(f.label)+'</dt><dd>'+E(f.value)+'</dd></div>';}).join('')+'</dl>'+chartTable(c);
  if(c.metric){
    var m=c.metric,rateKnown=a.step>2||a.completed||(a.checked&&a.step===2);
    return '<section class="al-evidence al-rate-evidence" aria-label="Rate training data"><div class="al-evidence-head"><strong>TRAINING MONTH · SAME POPULATION</strong><button type="button" data-al-action="table" aria-label="Read the full rate case">Case details</button></div>'+
      '<div class="al-rate-counts"><div><b>'+E(m.numerator)+'</b><span>'+E(m.numeratorLabel)+'</span></div><div><b>'+E(m.denominator)+'</b><span>'+E(m.denominatorLabel)+'</span></div></div>'+
      '<p class="al-case-brief">'+E(caseBrief(c))+'</p><div class="al-equation"><span>'+E(m.numerator)+'</span><b>÷</b><span>'+E(m.denominator)+'</span><b>× 100 =</b><strong>'+E(rateKnown?m.displayResult:'?')+'</strong></div></section>';
  }
  if(c.chart){
    return '<section class="al-evidence" aria-label="Visible case evidence"><div class="al-evidence-head"><strong>'+E(c.chart.kind==='fishbone'?'POSSIBLE CAUSES · NOT YET PROVEN':c.chart.kind==='groups'?'SAME JOB CLASS · INDEPENDENT SAMPLES':'SYNTHETIC TRAINING OBSERVATIONS')+'</strong><button type="button" data-al-action="table">Chart & data</button></div>'+
      chartSVG(c.chart,false)+'<p class="al-case-brief '+(c.stats&&c.stats.sourceValidated===false?'caution':'')+'">'+E(caseBrief(c))+'</p>'+
      '<div class="al-fact-strip">'+(c.facts||[]).filter(function(f){return f.label!=='Candidate';}).map(function(f){return '<span><b>'+E(f.label)+':</b> '+E(f.value)+'</span>';}).join('')+'</div></section>';
  }
  return '<section class="al-evidence al-process-evidence" aria-label="MAJCOM reporting process"><div class="al-evidence-head"><strong>MAJCOM REPORTS · PRACTICE WORKFLOW</strong><button type="button" data-al-action="table">Case details</button></div>'+
    '<div class="al-process">'+['Requirement','Source','Validate','Calculate / explain','Review','Submit','Retain','Correct'].map(function(x,i){return '<span><small>'+(i+1)+'</small>'+x+'</span>';}).join('')+'</div>'+
    '<p>Use the applicable instruction for definitions, reporting window, suspense, reviewer and submission route.</p></section>';
}
function header(c,a,state){
  var title=tracks.find(function(t){return t.id===a.track;}).shortTitle;
  return '<header class="af-topbar"><button type="button" data-route="academy:home">← Academy</button><div class="af-round-label"><strong>'+E(title)+'</strong><span>CASE '+a.level+' · '+(a.assisted?'COACHED PRACTICE':window.FMTeaching&&state&&window.FMTeaching.activeIndependent(state)?'CHALLENGE / PROVE':'LEARN BY DOING')+'</span></div><button type="button" data-al-action="help">Help / menu</button></header>';
}
function dialog(state,c,a){
  if(!a.help)return '';
  var title=a.help==='coach'?'Training coach':a.help==='table'?'Evidence & full-size chart':a.help==='feedback'?'Why this decision?':'How this block exercise works';
  var content=a.help==='coach'?(window.FMTeaching?window.FMTeaching.renderCoach(state):'<p>Training coach is unavailable.</p>'):a.help==='table'?evidenceView(c,a,true):a.help==='feedback'?'<p>'+E(a.feedback&&a.feedback.text||'Choose and check a block to get feedback.')+'</p>':
    '<ol><li>Read the highlighted question and the evidence.</li><li>Tap an answer block once. It goes directly into the active answer slot.</li><li>Select <b>Check answer</b>. Read why the choice fits or what to reconsider.</li><li>Select <b>Next step</b> to build the rest of the decision.</li></ol><p>There is no timer and no life penalty. Each new case changes the data or the problem. An example marks the case as coached; use a fresh variation to complete it without examples.</p>'+
    '<div class="al-menu-tracks">'+tracks.map(function(t){return '<button type="button" data-al-track="'+E(t.id)+'">'+E(t.shortTitle)+'</button>';}).join('')+'</div>'+
    '<p>“Completed without examples” records simulator practice. It does not certify on-the-job qualification.</p>'+
    '<div class="al-help-actions"><button type="button" data-al-action="coach">Training coach / mode</button><button type="button" data-coach-stage="1">Help Me mode</button><button type="button" data-al-action="example">Show this step</button><button type="button" data-al-action="retry">Fresh variation</button></div>';
  return '<div class="af-overlay"><section class="af-dialog" role="dialog" aria-modal="true" aria-labelledby="al-dialog-title"><header><h2 id="al-dialog-title">'+E(title)+'</h2><button type="button" data-al-action="close">✕ Back</button></header><div class="af-dialog-body">'+content+'</div><footer><button type="button" data-al-action="close">Return to the exercise</button></footer></section></div>';
}
function completedView(state,c,a){
  var p=a.progress[a.track]||{};
  return '<div class="academy-view af-shell af-result al-result">'+header(c,a,state)+
    '<section class="academy-result"><div class="academy-result-icon">✓</div><span class="al-kicker">'+(a.assisted?'COACHED CASE COMPLETE':'CASE COMPLETE')+'</span><h1>'+E(c.title)+'</h1><p>'+E(c.summary)+'</p>'+
    '<div class="al-completion-facts"><span>'+c.steps.length+' decisions built</span><span>'+a.mistakes+' corrected '+(a.mistakes===1?'choice':'choices')+'</span><span>'+(Number(p.independent)||0)+' cases without examples</span></div>'+
    '<button type="button" class="af-primary" data-al-action="'+(a.assisted?'retry':'new')+'">'+(a.assisted?'Try a fresh variation independently':'Next case →')+'</button>'+
    '<button type="button" data-al-action="table">Review the evidence</button><button type="button" data-route="academy:home">Choose another skill</button></section>'+dialog(state,c,a)+'</div>';
}
function render(state){
  var a=ensure(state),c=caseFor(state);a.started=true;
  if(a.step>=c.steps.length)a.step=c.steps.length-1;
  if(a.completed)return completedView(state,c,a);
  var s=c.steps[a.step],selected=s.choices.find(function(x){return x.id===a.selected;});
  var compact=(window.innerWidth||390)<780&&(window.innerHeight||844)<720;
  var landscape=(window.innerWidth||390)>(window.innerHeight||844)&&(window.innerHeight||844)<520;
  var pageSize=compact||landscape?2:4,pages=Math.ceil(s.choices.length/pageSize);
  a.choicePage=Math.min(pages-1,a.choicePage);
  var pageStart=a.choicePage*pageSize;
  var pager=pages>1?'<div class="al-choice-pager"><span>Answer blocks '+(pageStart+1)+'–'+Math.min(s.choices.length,pageStart+pageSize)+' of '+s.choices.length+'</span><button type="button" data-al-action="options-prev" aria-label="Previous answer blocks" '+(a.choicePage===0?'disabled':'')+'>‹</button><button type="button" data-al-action="options-next" aria-label="Next answer blocks" '+(a.choicePage===pages-1?'disabled':'')+'>›</button></div>':'';
  var wrong=a.feedback&&!a.feedback.good;
  var feedback=a.feedback?a.feedback.text:'Tap one block. It fills the answer slot automatically.';
  var limited=wrong&&feedback.length>135?feedback.slice(0,132)+'…':feedback;
  var checked=a.checked&&selected&&selected.id===s.correct;
  var status=checked?'<div class="al-explanation good" role="status"><strong>✓ '+E(selected.title)+'</strong><p>'+E(s.explanation)+'</p></div>':
    pager+'<div class="al-choice-grid" role="group" aria-label="Answer blocks">'+s.choices.slice(pageStart,pageStart+pageSize).map(function(x,i){return '<button type="button" class="al-choice '+(a.selected===x.id?'selected':'')+'" data-al-choice="'+E(x.id)+'" aria-pressed="'+(a.selected===x.id)+'"><span class="al-block-mark" aria-hidden="true">'+String.fromCharCode(65+pageStart+i)+'</span><strong>'+E(x.title)+'</strong></button>';}).join('')+'</div>';
  return '<div class="academy-view af-shell al-shell '+(compact?'al-compact':'')+'">'+header(c,a,state)+
    '<section class="af-objective al-objective"><h1>'+E(c.title)+'</h1><p>'+E(c.goal)+'</p></section>'+
    '<div class="al-workspace"><div class="al-evidence-column">'+evidenceView(c,a,false)+'</div>'+
    '<section class="al-decision"><nav class="al-step-track" aria-label="Exercise steps">'+c.steps.map(function(x,i){return '<span class="'+(i===a.step?'current':i<a.step?'done':'')+'" '+(i===a.step?'aria-current="step"':'')+' title="'+E(x.title)+'">'+(i<a.step?'✓':i+1)+'</span>';}).join('')+'<b>Step '+(a.step+1)+' of '+c.steps.length+'</b></nav>'+
    '<div class="al-question"><span>'+E(s.title)+'</span><h2 id="al-question-title" tabindex="-1">'+E(s.question)+'</h2><p>'+E(s.instruction)+'</p></div>'+
    '<div class="al-answer-slot '+(selected?'filled':'')+'" aria-label="Active answer slot"><small>YOUR BLOCK</small><strong>'+E(selected?selected.title:'Tap an answer below')+'</strong></div>'+
    status+'</section></div>'+
    '<footer class="af-dock al-dock"><div class="af-status '+(wrong?'bad':checked?'good':'')+'" role="status" aria-live="polite"><span>'+E(checked?'Correct. Read the explanation, then continue.':limited)+'</span>'+(!checked&&limited!==feedback?'<button type="button" data-al-action="feedback">Why?</button>':'')+'</div>'+
    '<div class="af-actions"><button type="button" data-al-action="example">Show step</button><button type="button" class="af-primary" data-al-action="'+(checked?'next':'check')+'" '+(!selected&&!checked?'disabled':'')+'>'+E(checked?(a.step===c.steps.length-1?'Finish case ✓':'Next step →'):'✓ Check answer')+'</button><button type="button" data-al-action="back" '+(a.step===0?'disabled':'')+'>← Back</button></div></footer>'+dialog(state,c,a)+'</div>';
}
function recordCompletion(state,a,c){
  if(a.completed)return;
  a.completed=true;
  var p=a.progress[a.track]||(a.progress[a.track]={independent:0,coached:0,firstTry:0,completed:[]});
  if(!Array.isArray(p.completed))p.completed=[];
  var key=c.id+(a.assisted?':coached':':independent');
  if(!p.completed.includes(key)){
    p.completed.push(key);
    if(a.assisted)p.coached=(Number(p.coached)||0)+1;
    else{p.independent=(Number(p.independent)||0)+1;if(a.mistakes===0)p.firstTry=(Number(p.firstTry)||0)+1;}
    p.lastLevel=a.level;p.lastVariation=a.variation;
    if(a.track==='rates'&&!a.assisted){
      var academy=state.academy;academy.progress=academy.progress||{};
      if((Number(academy.progress[5])||0)<90&&a.level===(Number(academy.progress[5])||0)+1&&a.level<=90){
        academy.progress[5]=a.level;academy.score=(Number(academy.score)||0)+175;
      }
    }
  }
}
function handleClick(dataset,state,ui){
  if(dataset.alTrack!==undefined){chooseTrack(state,dataset.alTrack,ui);return true;}
  if(dataset.alChoice===undefined&&dataset.alAction===undefined)return false;
  if(state.module!=='academy'||state.screen!=='analysis-lab')return false;
  var a=ensure(state),c=caseFor(state),s=c.steps[Math.min(a.step,c.steps.length-1)];
  if(dataset.alChoice!==undefined){
    if(!a.completed&&!a.checked&&s.choices.some(function(x){return x.id===dataset.alChoice;})){
      a.selected=dataset.alChoice;a.feedback=null;
    }
  }else{
    var action=dataset.alAction;
    if(action==='help'||action==='table'||action==='feedback'||action==='coach'){
      if(!a.help)a.helpReturn=action;
      a.help=action;
      if(action==='coach'&&window.FMTeaching){var coach=window.FMTeaching.ensure(state);coach.open=true;coach.academyModeActive=true;}
    }
    else if(action==='close')a.help=null;
    else if(action==='retry'||action==='new'){
      if(action==='new'&&!a.completed)return true;
      if(action==='new'){a.level++;a.variation=0;}else a.variation++;
      fresh(a);a.focusQuestion=true;
    }else if(!a.completed){
      if(action==='options-next'||action==='options-prev'){
        var small=(window.innerWidth||390)<780&&(window.innerHeight||844)<720;
        var landscape=(window.innerWidth||390)>(window.innerHeight||844)&&(window.innerHeight||844)<520;
        var pages=Math.ceil(s.choices.length/(small||landscape?2:4));
        a.choicePage=Math.max(0,Math.min(pages-1,a.choicePage+(action==='options-next'?1:-1)));
      }else if(action==='check'&&!a.checked){
        if(!s.choices.some(function(x){return x.id===a.selected;}))a.feedback={good:false,text:'Tap one answer block first. It will fill the active slot.'};
        else if(a.selected===s.correct){
          a.checked=true;a.feedback={good:true,text:s.explanation};ui.tone&&ui.tone(true);
        }else{
          a.mistakes++;a.feedback={good:false,text:'Reconsider this block. '+s.instruction+' Recheck the case evidence before choosing again.'};ui.tone&&ui.tone(false);
        }
      }else if(action==='next'&&a.checked&&a.selected===s.correct){
        a.history[a.step]={step:s.id,choice:a.selected,checked:true};a.focusQuestion=true;
        if(a.step===c.steps.length-1)recordCompletion(state,a,c);
        else{a.step++;a.selected=null;a.checked=false;a.feedback=null;a.choicePage=0;}
      }else if(action==='back'&&a.step>0){
        a.step--;a.focusQuestion=true;var previous=a.history[a.step];a.selected=previous?previous.choice:null;
        a.checked=!!previous;a.feedback=previous?{good:true,text:c.steps[a.step].explanation}:null;
      }else if(action==='example'){
        if(window.FMTeaching&&window.FMTeaching.activeIndependent(state)){
          a.feedback={good:false,text:'Examples are unavailable in Challenge / Prove mode. Change to Help Me in the training coach to receive coaching.'};a.help=null;
        }else{
          a.assisted=true;a.selected=s.correct;a.checked=true;a.feedback={good:true,text:s.explanation};a.help=null;
        }
      }
    }
  }
  checkpoint(a);ui.save();ui.render();return true;
}
function handleKeydown(e,root,state,ui){
  if(state.module!=='academy'||state.screen!=='analysis-lab')return false;
  var a=ensure(state);
  if(!a.help)return false;
  if(e.key==='Escape'){e.preventDefault();a.help=null;ui.save();ui.render();return true;}
  if(e.key==='Tab'){
    var modal=root.querySelector&&root.querySelector('.af-overlay:not([hidden])');
    var items=Array.from(modal&&modal.querySelectorAll?modal.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]'):[]).filter(function(x){return x.getClientRects&&x.getClientRects().length;});
    if(items.length){
      if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items[items.length-1].focus();}
      else if(!e.shiftKey&&document.activeElement===items[items.length-1]){e.preventDefault();items[0].focus();}
    }
    return true;
  }
  return false;
}
function afterRender(root,state,previous){
  if(state.module!=='academy'||state.screen!=='analysis-lab')return;
  document.documentElement&&document.documentElement.classList&&document.documentElement.classList.toggle('af-active',true);
  document.body&&document.body.classList&&document.body.classList.toggle('af-active',true);
  var a=ensure(state),modal=root.querySelector&&root.querySelector('.af-overlay:not([hidden])');
  var shell=root.querySelector&&root.querySelector('.af-shell'),target=null;
  if(shell&&modal)Array.from(shell.children||[]).forEach(function(child){if(!child.classList.contains('af-overlay'))child.inert=true;});
  function find(attr,value,parent){
    var nodes=(parent||root).querySelectorAll?(parent||root).querySelectorAll('['+attr+']'):[];
    return Array.from(nodes).find(function(el){return el.getAttribute(attr)===value&&!el.disabled;});
  }
  if(modal){
    if(previous&&previous.inOverlay)target=find(previous.attr,previous.value,modal);
    if(!target)target=modal.querySelector('[data-al-action="close"]');
  }else if(a.focusQuestion&&!a.completed){
    target=root.querySelector&&root.querySelector('#al-question-title');a.focusQuestion=false;
  }else if(previous&&previous.inOverlay){
    target=find('data-al-action',a.helpReturn||'help')||find('data-al-action','help');
  }else if(previous){
    target=find(previous.attr,previous.value);
    if(!target&&previous.attr==='data-al-action')target=find('data-al-action','next')||find('data-al-action','check');
  }
  if(target&&target.focus)target.focus({preventScroll:true});
}
window.FMAcademyAnalysis={resumeRate:resumeRate,afterRender:afterRender,render:render,homeCards:homeCards,handleClick:handleClick,handleKeydown:handleKeydown,ensure:ensure,caseFor:caseFor,chartSVG:chartSVG};
})();
