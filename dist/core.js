(function(){
  'use strict';
  window.FM_TRACKS=[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rng=seed=>{let a=Number(seed)>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}};
  window.FM={esc,rng,int:(r,a,b)=>Math.floor(r()*(b-a+1))+a,pick:(r,a)=>a[Math.floor(r()*a.length)],shuffle:(r,a)=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},round:(n,p=2)=>Math.round((Number(n)+Number.EPSILON)*10**p)/10**p,check:(id,label,ok,feedback,critical=false)=>({id,label,ok:!!ok,feedback,critical})};
})();
