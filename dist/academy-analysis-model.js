/* Block Academy analysis cases. All observations below are synthetic training data.
 * Reuses the tested statistics and improvement profiles in fm2290-model.js when
 * available; equivalent local math keeps this module usable as a standalone file.
 * Definitions are taught with an explicit scenario population and reporting window.
 * Command-specific definitions, deadlines and routing always come from the actual
 * applicable reporting instruction, not from this simulator.
 * Statistical basis: NIST/SEMATECH e-Handbook, two-sample t-test and scatter plot:
 * https://www.itl.nist.gov/div898/handbook/eda/section3/eda353.htm
 * https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm
 */
(function (root, factory) {
  var dependency = root && root.FMModel;
  if (typeof module === 'object' && module.exports) {
    try { dependency = require('./fm2290-model.js'); } catch (ignored) { /* standalone use */ }
    module.exports = factory(dependency);
  } else root.FMAcademyAnalysisModel = factory(dependency);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (legacy) {
  'use strict';

  var VERSION = '22.17.0';
  var TRACKS = [
    {id:'rates', title:'Build the Right Rate', shortTitle:'Rates', lessons:8,
      description:'Choose the right count and population, calculate the rate, and explain its meaning.'},
    {id:'reports', title:'MAJCOM Reports', shortTitle:'MAJCOM reports', lessons:6,
      description:'Build a traceable report from the requirement through validation, review, submission and correction.'},
    {id:'trend', title:'Improvement Laboratory: Trend', shortTitle:'Trend', lessons:5,
      description:'Read actual month-by-month data and distinguish direction, cycles and unusual observations.'},
    {id:'correlation', title:'Improvement Laboratory: Correlation', shortTitle:'Correlation', lessons:3,
      description:'Read paired observations, describe their association and choose an evidence-based next step.'},
    {id:'difference', title:'Improvement Laboratory: Difference', shortTitle:'Difference', lessons:3,
      description:'Compare two groups, calculate their gap and interpret a Welch test without claiming causation.'},
    {id:'fishbone', title:'Improvement Laboratory: Fishbone', shortTitle:'Fishbone', lessons:3,
      description:'Separate a possible cause from evidence, then design a test of that cause.'},
    {id:'improve', title:'Improvement Laboratory: Test a Change', shortTitle:'Test a change', lessons:6,
      description:'Set a baseline, pilot a countermeasure and check results, data quality and side effects.'}
  ];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function frozen(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.keys(value).forEach(function (key) { frozen(value[key]); });
      Object.freeze(value);
    }
    return value;
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function sum(values) { return values.reduce(function (a,b) { return a+b; },0); }
  function mean(values) { return sum(values)/values.length; }
  function round(value, places) { var p=Math.pow(10,places===undefined?1:places); return Math.round((value+Number.EPSILON)*p)/p; }
  function display(value, places) { return String(round(value,places)); }
  function boundedInteger(value, fallback, minimum) {
    value=Number(value); return Number.isFinite(value)?Math.max(minimum,Math.floor(value)):fallback;
  }
  function rngFor(text) {
    var seed=2166136261;
    for(var i=0;i<text.length;i++) { seed^=text.charCodeAt(i); seed=Math.imul(seed,16777619); }
    return function () { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  }
  function shuffled(array,rng) {
    var result=array.slice();
    for(var i=result.length-1;i>0;i--) { var j=Math.floor(rng()*(i+1)),v=result[i]; result[i]=result[j]; result[j]=v; }
    return result;
  }
  function choice(id,title,detail) { var c={id:id,title:title}; if(detail)c.detail=detail; return c; }
  function step(rng,id,title,question,choices,correct,explanation,instruction) {
    return {id:id,title:title,question:question,
      instruction:instruction||'Tap the block that answers this question. Then check your choice.',
      choices:shuffled(choices,rng),correct:correct,explanation:explanation};
  }
  function makeBase(track,level,variation,title,goal) {
    return {id:track+'-'+level+'-'+variation,track:track,level:level,variation:variation,
      title:title,goal:goal,synthetic:true,scope:'Synthetic training observations; apply the definitions and window stated in this case.',evidence:'',facts:[],steps:[],summary:''};
  }
  function pText(p) { return p<0.001?'< 0.001':display(p,3); }
  function pearson(x,y) {
    if(legacy && typeof legacy.pearson==='function')return legacy.pearson(x,y);
    var mx=mean(x),my=mean(y),cross=0,vx=0,vy=0;
    x.forEach(function(v,i){var a=v-mx,b=y[i]-my;cross+=a*b;vx+=a*a;vy+=b*b;});
    return vx>0&&vy>0?cross/Math.sqrt(vx*vy):null;
  }
  function variance(a) { var m=mean(a);return sum(a.map(function(v){return (v-m)*(v-m);} ))/(a.length-1); }
  // Numerical fallback is the same Lanczos/incomplete-beta calculation used by FMModel.
  function logGamma(z) {
    var c=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
    if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
    z-=1;var x=.9999999999998099;for(var i=0;i<c.length;i++)x+=c[i]/(z+i+1);
    var t=z+c.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
  }
  function betaFraction(a,b,x) {
    var q=a+b,qap=a+1,qam=a-1,c=1,d=1-q*x/qap,tiny=1e-30;
    if(Math.abs(d)<tiny)d=tiny;d=1/d;var h=d;
    for(var m=1;m<=200;m++){
      var m2=2*m,aa=m*(b-m)*x/((qam+m2)*(a+m2));
      d=1+aa*d;if(Math.abs(d)<tiny)d=tiny;c=1+aa/c;if(Math.abs(c)<tiny)c=tiny;d=1/d;h*=d*c;
      aa=-(a+m)*(q+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<tiny)d=tiny;
      c=1+aa/c;if(Math.abs(c)<tiny)c=tiny;d=1/d;var delta=d*c;h*=delta;if(Math.abs(delta-1)<3e-12)break;
    }return h;
  }
  function incompleteBeta(x,a,b) {
    if(x<=0)return 0;if(x>=1)return 1;
    var bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));
    return x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b;
  }
  function welch(a,b) {
    var result;
    if(legacy && typeof legacy.welchT==='function')result=legacy.welchT(a,b);
    else {
      var va=variance(a)/a.length,vb=variance(b)/b.length,t=(mean(a)-mean(b))/Math.sqrt(va+vb);
      var df=Math.pow(va+vb,2)/(va*va/(a.length-1)+vb*vb/(b.length-1));
      result={mean1:mean(a),mean2:mean(b),t:t,df:df,p:incompleteBeta(df/(df+t*t),df/2,.5)};
    }
    // Avoid loss of a very small tail when the legacy 1-CDF subtraction rounds to zero.
    if(result.p<1e-8&&Number.isFinite(result.t)&&result.df>0)result.p=incompleteBeta(result.df/(result.df+result.t*result.t),result.df/2,.5);
    return {meanA:result.mean1,meanB:result.mean2,difference:result.mean2-result.mean1,t:result.t,df:result.df,p:result.p,
      alpha:.05,significant:result.p<.05,method:'Welch two-sample t-test, two-sided'};
  }

  var METRICS=[
    {id:'fix8',name:'8-hour fix rate',num:'qualifying breaks fixed within 8 hours',den:'qualifying breaks',unit:'%',
      meaning:'the share of qualifying breaks restored within 8 hours',base:'breaks',direction:'A higher value means a larger share was restored within the stated time.'},
    {id:'break',name:'Break rate',num:'qualifying breaks',den:'completed flights',unit:'%',
      meaning:'qualifying breaks per 100 completed flights',base:'flights',direction:'A higher value means more qualifying breaks per 100 completed flights.'},
    {id:'repeat',name:'Repeat rate',num:'qualifying repeat discrepancies',den:'pilot-reported discrepancies',unit:'%',
      meaning:'the share of pilot-reported discrepancies classified as repeats',base:'discrepancies',direction:'A higher value means a larger repeat-discrepancy share.'},
    {id:'cann',name:'CANN rate',num:'cannibalization actions',den:'completed flights',unit:'actions per 100 flights',
      meaning:'cannibalization actions per 100 completed flights',base:'flights',direction:'This counts actions per 100 flights; it is not the percentage of aircraft that donated a part.'},
    {id:'mc',name:'Mission-capable rate',num:'mission-capable hours',den:'possessed hours',unit:'%',
      meaning:'the share of possessed time that was mission capable',base:'hours',direction:'A higher value means a larger share of possessed time was mission capable.'},
    {id:'ground',name:'Ground-abort rate',num:'ground aborts',den:'qualifying ground attempts',unit:'%',
      meaning:'ground aborts per 100 qualifying ground attempts',base:'attempts',direction:'Use the ground-attempt population defined by the applicable reporting rule.'},
    {id:'air',name:'Air-abort rate',num:'air aborts',den:'completed flights',unit:'%',
      meaning:'air aborts per 100 completed flights',base:'flights',direction:'Use flown sorties, including the qualifying air-abort sorties, in this exercise.'},
    {id:'tnmcm',name:'Total maintenance NMC rate',num:'maintenance-only NMC hours plus both-status NMC hours',den:'possessed hours',unit:'%',
      meaning:'the share of possessed time counted as total maintenance NMC',base:'hours',direction:'Include the both-status hours once in this numerator; do not add total maintenance and total supply rates to find all NMC time.'}
  ];
  function rates(level,variation,rng) {
    var m=METRICS[(level-1)%METRICS.length],cycle=Math.floor((level-1)/METRICS.length);
    var v=(variation+cycle)%9,n,d,extras,parts;
    if(m.id==='fix8'){d=10+v*2;n=2+v;extras=200+v*20;}
    if(m.id==='break'){d=200+v*20;n=8+v*2;extras=30+v;}
    if(m.id==='repeat'){d=40+v*5;n=4+v;extras=200+v*20;}
    if(m.id==='cann'){d=200+v*20;n=12+v*2;extras=24+v;}
    if(m.id==='mc'){d=2400+v*240;n=Math.round(d*(.70+v*.02));extras=200+v*20;}
    if(m.id==='ground'){d=200+v*20;n=6+v;extras=d-n;}
    if(m.id==='air'){d=200+v*20;n=4+v;extras=240+v*20;}
    if(m.id==='tnmcm'){d=2400+v*240;parts=[360+v*36,120+v*12];n=sum(parts);extras=200+v*20;}
    var value=n/d*100,formatted=display(value)+(m.unit==='%'?'%':' '+m.unit),c=makeBase('rates',level,variation,m.name,'Build '+m.name.toLowerCase()+': count → population → calculation → meaning.');
    c.evidence='Training reporting month: '+n+' '+m.num+'; '+d+' '+m.den+'. Both totals use the same validated population and reporting window.';
    if(m.id==='fix8')c.evidence+=' All '+d+' qualifying breaks have a complete 8-hour follow-up window. This case uses an 8-hour criterion; '+extras+' flown sorties are background information, not the denominator.';
    if(m.id==='tnmcm')c.evidence='Training reporting month: '+parts[0]+' maintenance-only NMC hours + '+parts[1]+' both-status NMC hours; '+d+' possessed hours. These mutually exclusive status buckets cover the same aircraft and window.';
    if(m.id==='ground')c.evidence+=' The scenario has already validated the qualifying-attempt base against its reporting instruction; do not substitute flights.';
    c.scope=m.id==='fix8'?'8-hour criterion; all eligible breaks fully observed through 8 hours. The reporting rule determines eligibility.':m.id==='repeat'?'Repeat classifications are already validated against the scenario’s reporting definition; all counts cover the same month.':m.id==='ground'?'Ground-attempt eligibility is supplied by this scenario’s reporting rule; command definitions can differ.':'Validated training counts using one reporting month and the stated metric definition.';
    c.facts=[{label:'Count',value:n+' '+m.num},{label:'Population / time base',value:d+' '+m.den},{label:'Calculation',value:'Count ÷ base × 100'}];
    c.metric={id:m.id,name:m.name,numerator:n,denominator:d,numeratorLabel:m.num,denominatorLabel:m.den,result:value,displayResult:formatted,unit:m.unit,window:'Training reporting month'};
    var numTitle=m.id==='tnmcm'?parts[0]+' + '+parts[1]+' = '+n+' NMC hours':n+' '+m.num;
    var decoys=[round(value/10,1),round(100-value,1),round(n,1),round(value+10,1),round(value+5,1)].filter(function(x,i,a){return x!==round(value,1)&&a.indexOf(x)===i;}).slice(0,3);
    var formatValue=function(x){return display(x)+(m.unit==='%'?'%':' '+m.unit);};
    c.steps=[
      step(rng,'numerator','1 · Choose the count','What belongs above the division line?',[
        choice('count',numTitle,'Count the defined outcome.'),choice('base',d+' '+m.den,'This is the population or time base.'),
        choice('other',extras+' '+(m.base==='hours'?'flights':'unrelated records'),'A count from a different category.')],'count',
        'The numerator is '+n+' '+m.num+'. '+(m.id==='tnmcm'?'Add maintenance-only and both-status hours once.':'Keep the stated inclusion rules.'),
        'Numerator means the outcome you count. Choose the count of '+m.num+'.'),
      step(rng,'denominator','2 · Choose the base','What belongs below the division line?',[
        choice('population',d+' '+m.den),choice('outcome',n+' '+m.num),
        choice('different',m.id==='fix8'?extras+' flown sorties':extras+' '+(m.base==='hours'?'flights':'unrelated records'))],'population',
        'Use '+d+' '+m.den+' from the same window. '+(m.id==='fix8'?'The question is how many qualifying breaks were fixed quickly, so the base is breaks—not flights.':'The denominator must match the metric’s question and units.'),
        'Denominator means the whole eligible population or time base. Choose the '+m.den+' that the outcome is compared with.'),
      step(rng,'calculate','3 · Calculate the rate','What is '+n+' ÷ '+d+' × 100 (round to one decimal if needed)?',[
        choice('result',formatted),choice('wrong0',formatValue(decoys[0])),choice('wrong1',formatValue(decoys[1])),choice('wrong2',formatValue(decoys[2]))],'result',
        n+' ÷ '+d+' × 100 = '+formatted+'. '+(m.id==='cann'?'This is a frequency of actions per 100 flights, not a percentage of aircraft.':'The multiplication by 100 expresses the stated ratio on a 100-unit basis.'),
        'Divide the outcome count by its eligible base, then multiply by 100. Keep the unit with the answer.'),
      step(rng,'meaning','4 · Explain the meaning','Which statement is supported by this rate?',[
        choice('supported',formatted+' describes '+m.meaning+' in this month.'),
        choice('cause','The rate proves that training caused this month’s result.'),
        choice('forecast','Every future month will have exactly the same result.')],'supported',
        m.direction+' The rate describes the defined sample and window; it does not by itself establish a cause or predict the next month.',
        'Interpretation means explaining what the number says about this population and window—and what it cannot establish.')
    ];
    c.summary=m.name+': '+n+' ÷ '+d+' × 100 = '+formatted+'. State the population, reporting window and meaning every time.';
    return c;
  }

  function reports(level,variation,rng) {
    var family=(level-1)%6,period='Training Month '+(1+(variation%12));
    var titles=['Start with the requirement','Validate the reporting data','Build a defensible explanation','Review and submit','Correct a submitted report','Complete the reporting process'];
    var c=makeBase('reports',level,variation,'MAJCOM Reports · '+titles[family],'Choose the next defensible block in a traceable reporting process.');
    var n=2+(variation%6),d=10+(variation%6)*2,rate=display(n/d*100)+'%';
    c.evidence='You are preparing a synthetic MAJCOM report for '+period+'. The controlling instruction supplies the definition, reporting window, suspense, designated reviewer and submission channel. The simulator does not assign universal command deadlines.';
    c.facts=[{label:'Period',value:period},{label:'Requirement',value:'Use the applicable current instruction'},{label:'Outcome',value:'Validated, reviewed, traceable report'}];
    var bank={
      requirement:step(rng,'requirement','Confirm the requirement','Before pulling numbers, what must you establish?',[
        choice('scope','Applicable instruction, scope, definitions, window and suspense'),choice('copy','Copy last month’s totals into this month’s template'),choice('deadline','Assume every MAJCOM uses the same monthly deadline')],'scope',
        'Start with the actual reporting requirement. Definitions, exclusions, suspense, reviewer and submission route can differ by command and report.'),
      authority:step(rng,'authority','Confirm the route','Who reviews and receives this report?',[
        choice('designated','The reviewer and recipient designated by the applicable process'),choice('anyone','Any person who can open the spreadsheet'),choice('shortcut','Send it directly to the highest headquarters without checking the route')],'designated',
        'Follow the designated review and submission route in the applicable instruction and local process; do not invent an approving authority.'),
      source:step(rng,'source','Acquire traceable data','Which data package is ready for validation?',[
        choice('traceable','Authorized source extract with its filters, cutoff and extraction time'),choice('screenshot','An unlabeled screenshot from an unknown month'),choice('mixed','Several totals with different cutoffs combined into one number')],'traceable',
        'Retain enough source context to reproduce the calculation: source, covered population, filters, reporting cutoff and extraction time.'),
      window:step(rng,'window','Align the window','The numerator is for '+period+'; the denominator is for the previous month. What next?',[
        choice('align','Re-extract a denominator for the same period and population'),choice('average','Average the two months to hide the mismatch'),choice('submit','Calculate anyway because both numbers are available')],'align',
        'A plausible-looking rate can still be invalid. Align the reporting windows and population before calculating.'),
      validate:step(rng,'validate','Validate the inputs','The extract contains a duplicate event and a missing status record. What is the defensible action?',[
        choice('reconcile','Reconcile against source records and document the disposition'),choice('delete','Delete every unexpected row without investigation'),choice('ignore','Ignore both issues because the total looks reasonable')],'reconcile',
        'Check completeness, duplicates, classifications, timestamps and reconciliation totals. Resolve or explicitly document discrepancies according to the reporting process.'),
      calculate:step(rng,'calculate','Check the calculation','The validated 8-hour fix data are '+n+' qualifying fixes and '+d+' qualifying breaks. Which block is correct?',[
        choice('valid',n+' ÷ '+d+' × 100 = '+rate),choice('wrongbase','Use completed flights as the 8-hour fix denominator'),choice('reverse','Divide all qualifying breaks by the qualifying fixes')],'valid',
        'The numerator and denominator answer the same metric question in the same window. Recalculate the report, including dependent fields, after input corrections.'),
      comments:step(rng,'comments','Explain the result','Which comment makes the report more useful?',[
        choice('bounded','State the change, verified context, limitations and proposed follow-up'),choice('blame','Assign blame to a shop based only on a rate'),choice('hide','Omit an unresolved data limitation to keep the report simple')],'bounded',
        'Separate verified facts from possible explanations. Explain meaningful exceptions and limitations without turning an untested hypothesis into a cause.'),
      review:step(rng,'review','Perform the review','What should be checked before release?',[
        choice('reviewed','Definitions, arithmetic, source traceability, comments and required review'),choice('looks','Only whether the dashboard colors look correct'),choice('speed','Only whether the file can be sent quickly')],'reviewed',
        'A review checks that the report is supported and internally consistent, then uses the approval or review steps required by the actual process.'),
      submit:step(rng,'submit','Submit the controlled version','Which submission block belongs next?',[
        choice('controlled','Send the reviewed version through the required channel by its actual suspense'),choice('broadcast','Send several different drafts so recipients can choose'),choice('guess','Guess a channel and mark the report complete')],'controlled',
        'Submit the identified reviewed version through the designated route. Retain submission or receipt evidence as required by the applicable process.'),
      archive:step(rng,'archive','Preserve the record','What belongs with the reporting record?',[
        choice('package','Submitted version, source basis, review trail and submission evidence'),choice('finalonly','Only the final displayed percentage'),choice('erase','Erase source extracts immediately after pressing Send')],'package',
        'Preserve a traceable reporting package under the applicable records and access rules so another analyst can reproduce and explain the result.'),
      correction:step(rng,'correction','Handle a correction','A source error is confirmed after submission. What should happen?',[
        choice('amend','Follow the correction route; identify impact, version and recipients'),choice('overwrite','Silently overwrite the prior submitted file'),choice('leave','Leave a confirmed error because the suspense has passed')],'amend',
        'Revalidate affected fields and use the prescribed correction process. Identify what changed and why, coordinate the revised version, and preserve the earlier submission trail.')
    };
    var sequence=[['requirement','authority','source','window'],['source','window','validate','calculate'],['validate','calculate','comments','review'],['review','submit','archive','correction'],['correction','validate','calculate','review','submit','archive'],['requirement','source','validate','review','submit','archive']][family];
    c.steps=sequence.map(function(id){return bank[id];});
    c.workflow=['Confirm requirement','Acquire source','Validate and reconcile','Calculate and explain','Review','Submit','Archive','Correct if needed'];
    c.summary='MAJCOM reporting is a controlled process: requirement → traceable data → validation → calculation and explanation → review → submission → retained record. Route corrections explicitly.';
    return c;
  }

  function trend(level,variation,rng) {
    var pattern=(level-1)%5,base=28+(variation%9)*2;
    var offsets=[
      [0,1,3,4,5,7,8,10,11,12,14,15],
      [15,14,13,11,10,8,7,6,4,3,2,0],
      [0,1,-1,0,1,-1,1,0,-1,1,0,-1],
      [-4,0,5,1,-4,0,5,1,-4,0,5,1],
      [0,1,-1,0,1,13,0,-1,1,0,-1,0]
    ][pattern];
    var values=offsets.map(function(v){return base+v;});
    var c=makeBase('trend',level,variation,'Read the Trend','Use the plotted months to describe a pattern, then choose what to investigate.');
    c.evidence='Monthly mean parts-wait time in hours. Each month uses the same job definition and data method; lower is desirable for this training process. The chart is descriptive, not a control chart.';
    c.chart={kind:'line',labels:MONTHS.slice(),series:[{name:'Mean parts-wait time',values:values}],xLabel:'Reporting month',yLabel:'Mean wait (hours)',description:MONTHS.map(function(m,i){return m+': '+values[i]+' hours';}).join('; ')};
    var change=values[11]-values[0],direction=change>0?'higher':change<0?'lower':'unchanged';
    c.facts=[{label:'First month',value:values[0]+' h'},{label:'Last month',value:values[11]+' h'},{label:'Basis',value:'Same definition each month'}];
    c.stats={first:values[0],last:values[11],change:change,mean:mean(values),pattern:['rising','falling','stable','cyclical','outlier'][pattern]};
    var interpretations=[
      'Wait time generally increases over these months.',
      'Wait time generally decreases over these months.',
      'Wait time varies in a narrow band with little sustained direction.',
      'A similar rise-and-fall pattern repeats about every four months.',
      'June is unusually high relative to the surrounding months.'
    ];
    var patternChoices=interpretations.map(function(t,i){return choice('pattern'+i,t);});
    var followup=[
      'Check queue age, demand, job mix and source definitions behind the rise.',
      'Verify the improvement persists and check for changes in mix or recording.',
      'Check whether the stable-looking level meets the target and inspect variation.',
      'Check recurring workload or environmental factors against the repeated peaks.',
      'Verify June’s records and investigate an event; keep the point until resolved.'
    ];
    c.steps=[
      step(rng,'read','1 · Read the axes','What does one plotted point represent?',[
        choice('monthly','The mean parts-wait time for one reporting month'),choice('single','A single aircraft’s entire lifetime'),choice('rate','The percentage of aircraft that are mission capable')],'monthly','The horizontal axis is month; the vertical axis is average waiting hours. Read the unit before interpreting the shape.'),
      step(rng,'pattern','2 · Name the pattern','Which block best describes the full chart?',patternChoices,'pattern'+pattern,interpretations[pattern]+' This describes the displayed observations and is not a prediction.'),
      step(rng,'change','3 · Quantify the change','Compare January with December. What is the endpoint change?',[
        choice('difference',change===0?'No endpoint change ('+values[0]+' h to '+values[11]+' h)':Math.abs(change)+' '+(Math.abs(change)===1?'hour':'hours')+' '+direction+' ('+values[0]+' h to '+values[11]+' h)'),
        choice('percent',Math.abs(change)+' percentage points'),choice('always','The endpoints explain every month in between')],'difference',
        'December minus January = '+values[11]+' − '+values[0]+' = '+change+' hours. An endpoint difference alone can hide cycles and unusual months.'),
      step(rng,'next','4 · Investigate the pattern','What is the most useful next move?',[
        choice('investigate',followup[pattern]),choice('cause','Declare one shop to be the cause from the line alone'),choice('guarantee','Guarantee next month will match this pattern')],'investigate',
        'Check the source data and process context. A pattern is a reason to investigate, not proof of a specific cause; formal process stability requires more than this descriptive line.')
    ];
    c.summary=interpretations[pattern]+' The endpoint change is '+change+' hours. Describe the whole chart, verify the data and investigate before attributing a cause.';
    return c;
  }

  function correlation(level,variation,rng) {
    var pattern=(level-1)%3,shift=(variation%8),x=[1,2,3,4,5,6,7,8,9,10,11,12];
    var y=pattern===0?[3,5,4,8,7,10,12,11,14,15,16,18]:pattern===1?[18,16,17,14,13,12,10,11,7,6,5,3]:[8,15,10,18,6,12,12,6,18,10,15,8];
    x=x.map(function(v){return v+shift;});y=y.map(function(v){return v+shift;});
    var r=pearson(x,y);
    var c=makeBase('correlation',level,variation,'Read the Scatter','Keep observations paired, read the direction, and separate association from causation.');
    var xLabel=pattern===1?'Qualified staff available':'Jobs waiting at shift start',yLabel='Mean job turnaround (hours)';
    c.evidence='Twelve training shifts: each dot pairs '+xLabel.toLowerCase()+' with mean job turnaround for that same shift. These are observational data; job mix and workload may differ.';
    c.chart={kind:'scatter',points:x.map(function(v,i){return {x:v,y:y[i],label:'Shift '+(i+1)};}),xLabel:xLabel,yLabel:yLabel,description:x.map(function(v,i){return 'Shift '+(i+1)+': '+v+', '+y[i]+' hours';}).join('; ')};
    c.stats={r:r,n:x.length,pattern:['positive','negative','little-linear'][pattern]};
    c.facts=[{label:'Paired shifts',value:String(x.length)},{label:'Pearson r',value:display(r,2)},{label:'Design',value:'Observational; causes not established'}];
    var trendText=['Larger queues tend to accompany longer turnaround.','More available staff tend to accompany shorter turnaround.','The dots show little straight-line association.'][pattern];
    var inference=pattern===2?'An r near zero does not rule out nonlinear patterns, confounding or an association in a different sample.':'The association does not prove that changing this input alone will change the outcome; other factors may explain some of it.';
    c.steps=[
      step(rng,'pair','1 · Keep the pair','What does one dot mean?',[
        choice('paired','Both values come from the same training shift'),choice('sort','Sort each column independently before plotting'),choice('average','One dot combines any two convenient observations')],'paired',
        'Preserve the pair identity. Sorting the two columns independently can manufacture an association that was not in the observations.'),
      step(rng,'direction','2 · Read the association','What pattern does the scatter show?',[
        choice('positive','A positive straight-line association'),choice('negative','A negative straight-line association'),choice('little','Little straight-line association')],['positive','negative','little'][pattern],
        trendText+' Pearson r = '+display(r,2)+' summarizes linear association in these '+x.length+' paired shifts.'),
      step(rng,'meaning','3 · Bound the conclusion','Which conclusion respects the evidence?',[
        choice('association',pattern===2?'Little linear association here does not mean no possible relationship.':'These values are associated; the chart alone does not establish cause.'),
        choice('proof',pattern===2?'An r of zero proves the variables are unrelated in every way.':'The correlation proves a cause and guarantees the effect of a change.'),
        choice('percent','Pearson r is the percentage of jobs completed correctly.')],'association',inference),
      step(rng,'test','4 · Choose a follow-up','What would strengthen the investigation?',[
        choice('design','Check outliers and job mix, then plan a controlled or well-matched pilot'),choice('discard','Discard points until the line looks convincing'),choice('combine','Mix different time windows to increase the dot count')],'design',
        'Verify paired records, inspect unusual observations and account for plausible confounders. A planned comparison or controlled pilot can test a specific process hypothesis.')
    ];
    c.summary=trendText+' r = '+display(r,2)+'. '+inference;
    return c;
  }

  function difference(level,variation,rng) {
    var family=(level-1)%3,scale=1+(variation%3)*.1,shift=(variation%5)*3;
    var a=family===1?[90,96,88,93,91,94,89,95,92,90]:[121,117,115,124,119,122,116,120,118,123];
    var b=family===1?[89,94,91,90,93,92,88,96,91,89]:family===2?[143,148,146,150,142,145,151,144,149,147]:[63,59,62,58,66,60,61,64,57,65];
    a=a.map(function(v){return round(v*scale+shift,1);});b=b.map(function(v){return round(v*scale+shift,1);});
    var stats=welch(a,b),gap=stats.difference,clear=stats.significant;
    var c=makeBase('difference',level,variation,'Compare Two Groups','Compare the actual observations, quantify the gap, and interpret uncertainty.');
    c.evidence='Two independent training samples of the same job class: 10 standard-process jobs and 10 pilot-process jobs, measured in minutes using the same start/stop rule. The samples are not matched pairs. A two-sided Welch test uses a preselected α = 0.05; approximate normality and independence are assumed for this exercise.';
    c.chart={kind:'groups',groups:[{name:'Standard',values:a},{name:'Pilot',values:b}],xLabel:'Independent job group',yLabel:'Completion time (minutes)',description:'Standard: '+a.join(', ')+' min. Pilot: '+b.join(', ')+' min.'};
    c.stats=stats;
    c.facts=[{label:'Standard mean',value:display(stats.meanA)+' min'},{label:'Pilot mean',value:display(stats.meanB)+' min'},{label:'Welch p',value:pText(stats.p)}];
    var effect=display(Math.abs(gap))+' minutes '+(gap<0?'shorter':'longer');
    var infer=clear?'The samples provide evidence of a difference in mean time under the test assumptions.':'The test does not provide clear evidence of a mean difference at α = 0.05.';
    c.steps=[
      step(rng,'basis','1 · Check the comparison','Which feature makes the intended comparison interpretable?',[
        choice('comparable','Same job definition, same measurement rule, independent observations'),choice('volume','Different job types are acceptable if both groups contain ten rows'),choice('paired','Treat the first row in each group as a matched pair automatically')],'comparable',
        'Compare like with like. Welch handles unequal variances, but does not repair biased sampling, different job mix, repeated dependent observations or incorrect pairing.'),
      step(rng,'gap','2 · Quantify the gap','What is the pilot-minus-standard difference in sample means?',[
        choice('effect',display(gap)+' min: the pilot is '+effect),choice('percentage',display(Math.abs(gap))+' percentage points'),choice('reverse',display(-gap)+' min: reverse the subtraction order')],'effect',
        display(stats.meanB)+' − '+display(stats.meanA)+' = '+display(gap)+' minutes. State the subtraction order and unit, then judge whether the size matters operationally.'),
      step(rng,'uncertainty','3 · Interpret the test','Welch p '+(stats.p<.001?'< 0.001':'= '+pText(stats.p))+'. With α = 0.05, which block is supported?',[
        choice('supported',infer),choice('certainty',clear?'The p-value proves the pilot caused the difference.':'The p-value proves the two processes are identical.'),choice('probability','The p-value is the probability that the null hypothesis is true.')],'supported',
        infer+' A p-value concerns how incompatible the data are with the specified null model; it is not the probability that the null is true. '+(clear?'Statistical evidence does not establish a causal mechanism or practical value.':'Failure to find a difference is not an equivalence test.')),
      step(rng,'decision','4 · Choose the next decision','What should the team do before expanding or rejecting the change?',[
        choice('followup','Review the effect size, design, safety/quality measures and more comparable follow-up'),choice('pOnly','Use only whether p is below 0.05'),choice('ignore','Ignore source data because the group means are different')],'followup',
        'Combine practical effect, uncertainty, data quality and balancing measures. A comparison alone does not justify a claim that the pilot caused the outcome.')
    ];
    c.summary='Standard '+display(stats.meanA)+' min; pilot '+display(stats.meanB)+' min; pilot minus standard '+display(gap)+' min. Welch p '+(stats.p<.001?'< 0.001':'= '+pText(stats.p))+'. '+infer;
    return c;
  }

  function fishbone(level,variation,rng) {
    var family=(level-1)%3,counts=12+variation%7;
    var hypothesis=['The parts-request handoff creates avoidable waiting.','Job instructions are hard to find at the point of work.','Shared test equipment is a queue bottleneck.'][family];
    var evidence=['Timestamp samples show a gap between request creation and acceptance.','Observed jobs show repeated searching before the correct instruction is opened.','Equipment logs show jobs waiting while the shared unit is occupied.'][family];
    var test=['Pilot a verified handoff check and compare request-to-accept time for comparable jobs.','Pilot a controlled point-of-work access change and measure search time and instruction accuracy.','Pilot a coordinated equipment schedule and measure queue time, throughput and rework.'][family];
    var c=makeBase('fishbone',level,variation,'Fishbone · Test a Possible Cause','Build a cause-and-effect investigation using hypotheses, evidence and a measurable test.');
    c.evidence='Problem statement: '+counts+' of 40 comparable training jobs exceeded the agreed turnaround target this month. The fishbone organizes possible contributors; none becomes a proven root cause simply by being placed on a branch.';
    c.chart={kind:'fishbone',effect:'Jobs exceed turnaround target',categories:[
      {name:'People',items:['Coverage at handoff','Qualification mix']},
      {name:'Process',items:['Request handoff','Priority changes']},
      {name:'Equipment',items:['Shared test equipment','Tool availability']},
      {name:'Materials',items:['Part availability','Request accuracy']},
      {name:'Information',items:['Instruction access','Status visibility']},
      {name:'Measurement',items:['Timestamp accuracy','Comparable job definition']}
    ],description:'Possible contributors grouped by people, process, equipment, materials, information and measurement. The effect is jobs exceeding the turnaround target.'};
    c.facts=[{label:'Problem',value:counts+' of 40 jobs above target'},{label:'Candidate',value:hypothesis},{label:'Status',value:'Hypothesis to test'}];
    c.steps=[
      step(rng,'problem','1 · Define the problem','Which statement is a measurable problem?',[
        choice('measured',counts+' of 40 comparable jobs exceeded the turnaround target this month.'),choice('blame','The team does not care enough.'),choice('solution','Buy new equipment immediately.')],'measured',
        'State what happened, how much, where and when before selecting a cause or solution. A blame statement is not a measured problem.'),
      step(rng,'hypothesis','2 · Add a possible cause','How should this fishbone candidate be labeled?',[
        choice('possible',hypothesis+' — a testable hypothesis.'),choice('proven',hypothesis+' — proven because it is on the diagram.'),choice('symptom','The delayed jobs themselves are the root cause.')],'possible',
        'A fishbone is a structure for possible explanations. The branch or category does not validate the cause.'),
      step(rng,'evidence','3 · Seek supporting evidence','Which evidence is relevant to this candidate?',[
        choice('observed',evidence),choice('vote','The candidate received the most votes in a meeting.'),choice('repeat','The same opinion was repeated in several briefings.')],'observed',
        'Use traceable observations and investigate alternatives. Relevant evidence can support a hypothesis, but correlation and a few examples alone do not prove causation.'),
      step(rng,'test','4 · Design a test','Which block tests the mechanism while checking side effects?',[
        choice('pilot',test),choice('rename','Rename the fishbone branch and declare the problem fixed.'),choice('skip','Implement every suggested countermeasure at once without a baseline.')],'pilot',
        'Define the expected mechanism, baseline, measurement window and balancing measures. A limited, well-designed pilot helps show whether the change addresses the suspected cause.')
    ];
    c.summary='Measured problem → possible cause → relevant evidence → test. A fishbone organizes the investigation; it does not certify a root cause.';
    return c;
  }

  var FALLBACK_PROFILES=[
    {type:'better',mc:[67.2,68,69.4,71.2,73,74.1,74.8],driver:[145,136,122,105,91,79,72]},
    {type:'same',mc:[67.2,67.4,67,67.5,67.1,67.3,67.2],driver:[145,142,146,143,145,144,145]},
    {type:'worse',mc:[67.2,66.5,65.8,64.9,64.2,63.8,63.4],driver:[145,154,163,171,180,188,194]},
    {type:'delayed',mc:[67.2,67.1,67.3,67.5,68.4,70.9,73.2],driver:[145,144,142,140,126,104,87]},
    {type:'type1',mc:[67.2,68.5,70.1,72.4,74,75.2,76],driver:[145,132,119,101,88,76,69]},
    {type:'type2',mc:[67.2,67.1,67.3,67,67.2,67.4,67.3],driver:[145,145,143,144,142,143,141]}
  ];
  function improve(level,variation,rng) {
    var family=(level-1)%6,profile=legacy&&typeof legacy.improvementProfile==='function'?legacy.improvementProfile(family+1):clone(FALLBACK_PROFILES[family]);
    var offset=(variation%7)*3,values=profile.driver.map(function(v){return v+offset;}),labels=['Baseline','Month 1','Month 2','Month 3','Month 4','Month 5','Month 6'];
    var c=makeBase('improve',level,variation,'Test a Change','Set a fair baseline, run a focused pilot and decide what the actual follow-up supports.');
    c.evidence='Training pilot: a parts-request handoff check aims to reduce mean waiting time. The chart shows baseline and six follow-up months in minutes. Baseline is a planning summary, not proof of prior process stability. Rework and overtime are the balancing measures.';
    if(family===4)c.evidence+=' At Month 3, the reporting feed stopped including the most difficult job category. The apparent improvement is not a like-for-like comparison.';
    if(family===5)c.evidence+=' A source audit found completed jobs missing from the follow-up feed. The displayed values are incomplete.';
    c.chart={kind:'line',labels:labels,series:[{name:'Mean parts-request wait',values:values}],xLabel:'Pilot period',yLabel:'Mean wait (minutes)',description:labels.map(function(label,i){return label+': '+values[i]+' minutes';}).join('; ')};
    var change=values[6]-values[0];
    c.stats={profile:profile.type,baseline:values[0],followup:values[6],change:change,sourceValidated:family<4};
    c.facts=[{label:'Baseline',value:values[0]+' min'},{label:'Month 6',value:values[6]+' min'},{label:'Balancing checks',value:'Rework and overtime'}];
    var interpretations=[
      'The measured wait declines across the follow-up periods.',
      'The measured wait stays near the baseline with no sustained improvement.',
      'The measured wait rises after the pilot begins.',
      'Early months are nearly flat; the measured wait falls later.',
      'The apparent decline is confounded by a change in the reporting population.',
      'Missing completions prevent a reliable conclusion from this reported series.'
    ];
    var actions=[
      'Verify comparable data and balancing measures; sustain the pilot and plan controlled standardization.',
      'Check implementation and reopen the cause investigation before claiming success.',
      'Assess and contain adverse effects, then revisit the mechanism and pilot design.',
      'Investigate the lag, verify comparable data and balancing measures, and continue planned follow-up.',
      'Restore or reconcile the population and recalculate before judging the pilot.',
      'Repair and reconcile the reporting feed, then reassess the outcome.'
    ];
    c.steps=[
      step(rng,'baseline','1 · Establish the baseline','What must be fixed before testing the change?',[
        choice('measure','The job population, time definition, baseline window and target'),choice('target','Only the desired final number'),choice('story','Only the story the team hopes to tell')],'measure',
        'Specify what is measured, for whom, how and when. Look at sufficient baseline history and normal variation; one summary point alone does not establish stability.'),
      step(rng,'pilot','2 · Choose the pilot','Which pilot is most informative?',[
        choice('focused','Test a defined handoff change with comparable jobs and a recorded start date'),choice('everything','Change staffing, tools, workflow and definitions simultaneously'),choice('records','Remove slow jobs from the metric to reach the target')],'focused',
        'A focused countermeasure with an explicit mechanism and measurement plan is easier to evaluate. Preserve measurement definitions and record other changes.'),
      step(rng,'balance','3 · Check side effects','What should accompany the waiting-time measure?',[
        choice('sideeffects','Rework and overtime on a consistent basis'),choice('duplicate','Only a second chart of the same waiting-time values'),choice('none','No other measure if the headline number improves')],'sideeffects',
        'A faster process may shift burden elsewhere. Check quality, rework, overtime and other relevant balancing measures before scaling a change.'),
      step(rng,'interpret','4 · Read the follow-up','Which block describes the actual chart and case evidence?',[
        choice('supported',interpretations[family]),choice('guaranteed','The pilot definitely works because the team implemented it.'),choice('causal','The line alone proves the change caused every outcome.')],'supported',
        interpretations[family]+' The reported endpoint change is '+change+' minutes. '+(family>=4?'Resolve the stated data limitation before drawing an effectiveness conclusion.':'The time pattern is evidence to investigate alongside implementation, context and balancing measures.')),
      step(rng,'decision','5 · Act on the evidence','What is the defensible next block?',[
        choice('next',actions[family]),choice('close','Close the project permanently without further verification'),choice('publish','Announce causation based only on the final displayed value')],'next',
        actions[family]+' Predefine follow-up measures and responsibilities so any gain can be checked after the initial pilot.')
    ];
    c.summary=interpretations[family]+' '+actions[family];
    return c;
  }

  var BUILDERS={rates:rates,reports:reports,trend:trend,correlation:correlation,difference:difference,fishbone:fishbone,improve:improve};
  function makeCase(track,level,variation) {
    if(!Object.prototype.hasOwnProperty.call(BUILDERS,track))throw new RangeError('Unknown analysis track: '+track);
    level=boundedInteger(level===undefined?1:level,1,1);
    variation=boundedInteger(variation===undefined?0:variation,0,0);
    var rng=rngFor(track+':'+level+':'+variation);
    return frozen(BUILDERS[track](level,variation,rng));
  }
  function describe() {
    return frozen({version:VERSION,title:'Block Academy · Analysis and Improvement Laboratory',
      interaction:'Choose a block for the highlighted question. Check it, read why, and continue to the next step.',
      tracks:clone(TRACKS),syntheticData:true,metrics:METRICS.map(function(m){return {id:m.id,title:m.name};}),
      statistics:'Descriptive trend; Pearson correlation; two-sided Welch comparison at alpha 0.05. Statistical assumptions are stated in each case.'});
  }
  return frozen({version:VERSION,describe:describe,makeCase:makeCase});
});
