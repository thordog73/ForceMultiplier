/* Force Multiplier reference browser: command filters, official catalog lookup,
   and offline-independent, user-initiated remote PDF saving. No claim of live currency. */
(function(){'use strict';
const DB=window.FMReferenceData;if(!DB)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=Object.fromEntries(DB.references.map(r=>[r.id,r]));
const commandNames=Object.fromEntries(DB.commands.map(c=>[c.id,c.name]));
const TYPES=['MAJCOM supplement / GM','MAJCOM supplement','MAJCOM addendum','Wing/local supplement','ANG addendum','Parent DAF publication'];
let filters={command:'',q:'',type:'',sort:'command'};
let busy=false;
const isNative=()=>Boolean(window.Capacitor?.isNativePlatform?.());
function isOfficialURL(url){try{const p=new URL(url);return p.protocol==='https:'&&['static.e-publishing.af.mil','www.e-publishing.af.mil','e-publishing.af.mil'].includes(p.hostname);}catch{return false;}}
function getVisible(){const cmdOrder=Object.fromEntries(DB.commands.map((c,i)=>[c.id,i]));return DB.references.filter(r=>{
  if(filters.command&&r.command!==filters.command)return false;
  if(filters.type&&r.level!==filters.type)return false;
  const terms=[r.command,commandNames[r.command],r.number,r.title,r.level,r.note].join(' ').toLowerCase();
  return !filters.q||terms.includes(filters.q);
}).sort((a,b)=>filters.sort==='date'?b.date.localeCompare(a.date):filters.sort==='title'?a.title.localeCompare(b.title):(cmdOrder[a.command]-cmdOrder[b.command])||b.date.localeCompare(a.date));}
function renderCard(r){return `<article class="ref-card" data-ref-card="${esc(r.id)}" data-ref-command="${esc(r.command)}">
  <div class="ref-meta"><span class="ref-tag">${esc(r.command)}</span><span class="ref-tag">${esc(r.level)}</span><span class="ref-tag">Published ${esc(r.date)}</span></div>
  <h3>${esc(r.title)}</h3><div class="ref-number">${esc(r.number)}</div>
  <p class="ref-desc">${esc(r.note)}</p>
  <div class="ref-actions"><button type="button" data-ref-open="${esc(r.id)}">↗ View / share PDF</button><button type="button" class="ref-download" data-ref-save="${esc(r.id)}">↓ Save PDF</button><button type="button" data-ref-catalog="${esc(r.command)}">Check current edition</button></div>
 </article>`;}
function render(){const rows=getVisible();return `<section class="ref-lib" aria-label="Air Force publications and MAJCOM supplement browser">
 <div class="ref-hero"><div class="eyebrow">FORCE MULTIPLIER · REFERENCE LIBRARY</div><h1>Find the right maintenance instruction</h1><p>Browse DAFI 21-101 and published MAJCOM/wing supplement examples. Choose a command, read what applies, check the official catalog for the current edition, then open or save the publication.</p>
 <div class="ref-flag"><strong>Online references, offline training.</strong> The game and fundamentals work offline; opening or saving an e-Publishing PDF needs internet access. These are indexed starting points, not a live inventory or authority to use an obsolete publication. Confirm publication status, guidance memoranda, and local applicability in the official e-Publishing catalog before operational use.</div>
 <div class="ref-actions"><button type="button" data-ref-catalog="">↗ Open official e-Publishing catalog</button><button type="button" data-route="fundamentals:overview">⌂ Return to Fundamentals</button></div></div>
 <div class="ref-filters"><label class="ref-field">Search instructions / units<input id="refSearch" type="search" placeholder="21-101, ACC, Kadena, PS&D…" value="${esc(filters.q)}" autocomplete="off"></label>
 <label class="ref-field">MAJCOM / organization<select id="refCommand"><option value="">All commands</option>${DB.commands.map(c=>`<option value="${esc(c.id)}" ${filters.command===c.id?'selected':''}>${esc(c.id)} — ${esc(c.name)}</option>`).join('')}</select></label>
 <label class="ref-field">Publication type<select id="refType"><option value="">All levels</option>${TYPES.map(t=>`<option value="${esc(t)}" ${filters.type===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label>
 <label class="ref-field">Sort<select id="refSort"><option value="command" ${filters.sort==='command'?'selected':''}>By command</option><option value="date" ${filters.sort==='date'?'selected':''}>Newest indexed date</option><option value="title" ${filters.sort==='title'?'selected':''}>Title A–Z</option></select></label></div>
 <div class="ref-summary"><span id="refCounter">${rows.length} indexed examples · ${DB.commands.length-2} MAJCOMs</span><span>Catalog review: ${esc(DB.checked)}</span></div>
 <div id="refNotice" class="ref-message" role="status" aria-live="polite" hidden></div>
 <div id="refList">${rows.map(renderCard).join('')}</div><div id="refEmpty" class="ref-empty" ${rows.length?'hidden':''}>No indexed PDFs match. The official catalog may still contain publications not included in this starter list.</div>
 <section class="ref-command-helps"><h2>How to find the latest applicable reference</h2><ol><li>Choose your MAJCOM from the filter, then identify the parent instruction, command supplement, and applicable wing/base supplement.</li><li>Tap <strong>Check current edition</strong> and search the product number in e-Publishing. The catalog is the source of record; saved copies are not automatically refreshed.</li><li>Open the PDF to read it. On iPhone, <strong>Save PDF</strong> downloads a temporary copy and opens the iOS share sheet so you can choose <em>Save to Files</em>. If the publisher blocks downloading, use the official catalog link instead.</li><li>Check current guidance memoranda, effective dates, applicability, and amendments before teaching or applying a requirement.</li></ol><p class="ref-note">Not every command has a verified, directly linked command-level supplement in this starter library. Local examples are labeled as such, rather than being misrepresented as a MAJCOM-wide publication. ANG is provided separately because it is not one of the nine MAJCOMs in the catalog.</p></section>
 </section>`;}
function notice(msg,error=false){const el=document.getElementById('refNotice');if(el){el.hidden=false;el.classList.toggle('error',!!error);el.textContent=msg;el.scrollIntoView({block:'nearest',behavior:'smooth'});}else{window.alert?.(msg);}}
function updateResults(){const list=document.getElementById('refList');if(!list)return;const rows=getVisible();list.innerHTML=rows.map(renderCard).join('');const counter=document.getElementById('refCounter');if(counter)counter.textContent=`${rows.length} indexed examples · ${DB.commands.length-2} MAJCOMs`;const empty=document.getElementById('refEmpty');if(empty)empty.hidden=!!rows.length;}
async function openURL(url,title){if(!isOfficialURL(url))throw Error('Not a verified e-Publishing URL.');
 if(isNative()){const share=window.Capacitor?.Plugins?.Share;if(share?.share){await share.share({url,title,dialogTitle:'Open official reference'});return;}window.location.assign(url);return;}
 const tab=window.open(url,'_blank');if(tab){try{tab.opener=null;}catch{}}else window.location.assign(url);
}
async function savePDF(id){const r=byId[id];if(!r)throw Error('Unknown reference.');if(!isOfficialURL(r.url)||!r.url.toLowerCase().endsWith('.pdf'))throw Error('The reference does not have a verified PDF link.');
 if(isNative()){
  const plugins=window.Capacitor?.Plugins||{};
  if(!plugins.Filesystem?.downloadFile||!plugins.Share?.share)throw Error('The native save/share feature is not available in this installed build. Use View / share PDF or the official catalog.');
  const filename='FM-'+r.id.replace(/[^a-zA-Z0-9_-]/g,'')+'-'+r.date+'.pdf';
  let pathResult=null;
  try{
   pathResult=await plugins.Filesystem.downloadFile({url:r.url,path:filename,directory:'CACHE',recursive:true,progress:false});
   const fileUri=pathResult?.path||((await plugins.Filesystem.getUri({directory:'CACHE',path:filename})).uri);
   if(!fileUri)throw Error('The downloaded PDF location could not be verified.');
   await plugins.Share.share({title:r.number,files:[fileUri],dialogTitle:'Save PDF to Files'});
   notice('The iOS share sheet was opened. Select Save to Files to keep the PDF. A downloaded copy is not automatically the current instruction.');
  }finally{
   if(pathResult)await plugins.Filesystem.deleteFile({directory:'CACHE',path:filename}).catch(()=>{});
  }
  return;
 }
 await openURL(r.url,r.number);
 notice('The PDF was opened in the browser. Use the browser download or Share → Save to Files control to save it.');
}
async function actionOpen(id){const r=byId[id];if(!r)throw Error('Unknown PDF.');await openURL(r.url,r.number);}
async function actionCatalog(cmd){const name=cmd&&commandNames[cmd]?commandNames[cmd]:'the applicable command';
 notice('Official catalog opened. Search 21-101 and select '+name+' under Major Commands (or the corresponding unit). Re-check the publication and any guidance memorandum.');
 await openURL(DB.catalog,'Air Force e-Publishing — Product Index');}
function attach(root){root.addEventListener('input',e=>{if(e.target.id==='refSearch'){filters.q=e.target.value.trim().toLowerCase();updateResults();}});
 root.addEventListener('change',e=>{const id=e.target.id;if(id==='refCommand')filters.command=e.target.value;else if(id==='refType')filters.type=e.target.value;else if(id==='refSort')filters.sort=e.target.value;else return;updateResults();});
 root.addEventListener('click',async e=>{const b=e.target.closest('[data-ref-open],[data-ref-save],[data-ref-catalog]');if(!b)return;e.preventDefault();if(busy)return;busy=true;const original=b.textContent;b.disabled=true;b.textContent='Opening…';try{
  if(b.hasAttribute('data-ref-open'))await actionOpen(b.dataset.refOpen);
  else if(b.hasAttribute('data-ref-save'))await savePDF(b.dataset.refSave);
  else await actionCatalog(b.dataset.refCatalog||'');
 }catch(err){if(err?.message?.toLowerCase().includes('cancel')){notice('Action cancelled. No reference changes were made.');}else notice((err?.message||'Could not complete this request.')+' If needed, choose Check current edition to use the official e-Publishing website.',true);}
 finally{busy=false;b.disabled=false;b.textContent=original;}
 });}
window.FMReferences={DB,render,attach,getVisible,isOfficialURL,openURL,savePDF};
})();
