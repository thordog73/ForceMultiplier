/*!
Third-party native runtime notices

@capacitor/core 8.6.0
MIT License

Copyright (c) 2017-present Drifty Co.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


@capacitor/ios 8.6.0
MIT License

Copyright (c) 2017-present Drifty Co.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


@capacitor/preferences 8.0.1
Copyright 2020-present Ionic
https://ionic.io

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


@capacitor/haptics 8.0.2
Copyright 2020-present Ionic
https://ionic.io

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(()=>{var ue=Object.defineProperty;var W=(r,e,t)=>()=>{if(t)throw t[0];try{return r&&(e=r(r=0)),e}catch(n){throw t=[n],n}};var X=(r,e)=>{for(var t in e)ue(r,t,{get:e[t],enumerable:!0})};var $,M,de,fe,me,R,S,L,N,ee,q,be,he,pe,ge,we,z,xe,te,re,G,Pe,T=W(()=>{(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})($||($={}));M=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},de=r=>{var e,t;return r?.androidBridge?"android":!((t=(e=r?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},fe=r=>{let e=r.CapacitorCustomPlatform||null,t=r.Capacitor||{},n=t.Plugins=t.Plugins||{},i=()=>e!==null?e.name:de(r),s=()=>i()!=="web",a=d=>{let u=h.get(d);return!!(u?.platforms.has(i())||l(d))},l=d=>{var u;return(u=t.PluginHeaders)===null||u===void 0?void 0:u.find(C=>C.name===d)},f=d=>r.console.error(d),h=new Map,v=(d,u={})=>{let C=h.get(d);if(C)return console.warn(`Capacitor plugin "${d}" already registered. Cannot register plugins twice.`),C.proxy;let x=i(),E=l(d),o,m=async()=>(!o&&x in u?o=typeof u[x]=="function"?o=await u[x]():o=u[x]:e!==null&&!o&&"web"in u&&(o=typeof u.web=="function"?o=await u.web():o=u.web),o),y=(g,w)=>{var P,I;if(E){let j=E?.methods.find(b=>w===b.name);if(j)return j.rtype==="promise"?b=>t.nativePromise(d,w.toString(),b):(b,H)=>t.nativeCallback(d,w.toString(),b,H);if(g)return(P=g[w])===null||P===void 0?void 0:P.bind(g)}else{if(g)return(I=g[w])===null||I===void 0?void 0:I.bind(g);throw new M(`"${d}" plugin is not implemented on ${x}`,$.Unimplemented)}},c=g=>{let w,P=(...I)=>{let j=m().then(b=>{let H=y(b,g);if(H){let D=H(...I);return w=D?.remove,D}else throw new M(`"${d}.${g}()" is not implemented on ${x}`,$.Unimplemented)});return g==="addListener"&&(j.remove=async()=>w()),j};return P.toString=()=>`${g.toString()}() { [capacitor code] }`,Object.defineProperty(P,"name",{value:g,writable:!1,configurable:!1}),P},p=c("addListener"),O=c("removeListener"),F=(g,w)=>{let P=p({eventName:g},w),I=async()=>{let b=await P;O({eventName:g,callbackId:b},w)},j=new Promise(b=>P.then(()=>b({remove:I})));return j.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await I()},j},K=new Proxy({},{get(g,w){switch(w){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return E?F:p;case"removeListener":return O;default:return c(w)}}});return n[d]=K,h.set(d,{name:d,proxy:K,platforms:new Set([...Object.keys(u),...E?[x]:[]])}),K};return t.convertFileSrc||(t.convertFileSrc=d=>d),t.getPlatform=i,t.handleError=f,t.isNativePlatform=s,t.isPluginAvailable=a,t.registerPlugin=v,t.Exception=M,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},me=r=>r.Capacitor=fe(r),R=me(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),S=R.registerPlugin,L=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let s=this.windowListeners[e];s&&!s.registered&&this.addWindowListener(s),n&&this.sendRetainedArgumentsForEvent(e);let a=async()=>this.removeListener(e,t);return Promise.resolve({remove:a})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let i=this.listeners[e];if(!i){if(n){let s=this.retainedEventArguments[e];s||(s=[]),s.push(t),this.retainedEventArguments[e]=s}return}i.forEach(s=>s(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:n=>{this.notifyListeners(t,n)}}}unimplemented(e="not implemented"){return new R.Exception(e,$.Unimplemented)}unavailable(e="not available"){return new R.Exception(e,$.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let i=n.indexOf(t);i!==-1&&this.listeners[e].splice(i,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(n=>{this.notifyListeners(e,n)}))}},N=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),ee=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),q=class extends L{async getCookies(){let e=document.cookie,t={};return e.split(";").forEach(n=>{if(n.length<=0)return;let[i,s]=n.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=ee(i).trim(),s=ee(s).trim(),t[i]=s}),t}async setCookie(e){try{let t=N(e.key),n=N(e.value),i=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",s=(e.path||"/").replace("path=",""),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${n||""}${i}; path=${s}; ${a};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},be=S("CapacitorCookies",{web:()=>new q}),he=async r=>new Promise((e,t)=>{let n=new FileReader;n.onload=()=>{let i=n.result;e(i.indexOf(",")>=0?i.split(",")[1]:i)},n.onerror=i=>t(i),n.readAsDataURL(r)}),pe=(r={})=>{let e=Object.keys(r);return Object.keys(r).map(i=>i.toLocaleLowerCase()).reduce((i,s,a)=>(i[s]=r[e[a]],i),{})},ge=(r,e=!0)=>r?Object.entries(r).reduce((n,i)=>{let[s,a]=i,l,f;return Array.isArray(a)?(f="",a.forEach(h=>{l=e?encodeURIComponent(h):h,f+=`${s}=${l}&`}),f.slice(0,-1)):(l=e?encodeURIComponent(a):a,f=`${s}=${l}`),`${n}&${f}`},"").substr(1):null,we=(r,e={})=>{let t=Object.assign({method:r.method||"GET",headers:r.headers},e),i=pe(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(i.includes("application/x-www-form-urlencoded")){let s=new URLSearchParams;for(let[a,l]of Object.entries(r.data||{}))s.set(a,l);t.body=s.toString()}else if(i.includes("multipart/form-data")||r.data instanceof FormData){let s=new FormData;if(r.data instanceof FormData)r.data.forEach((l,f)=>{s.append(f,l)});else for(let l of Object.keys(r.data))s.append(l,r.data[l]);t.body=s;let a=new Headers(t.headers);a.delete("content-type"),t.headers=a}else(i.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t},z=class extends L{async request(e){let t=we(e,e.webFetchExtra),n=ge(e.params,e.shouldEncodeUrlParams),i=n?`${e.url}?${n}`:e.url,s=await fetch(i,t),a=s.headers.get("content-type")||"",{responseType:l="text"}=s.ok?e:{};a.includes("application/json")&&(l="json");let f,h;switch(l){case"arraybuffer":case"blob":h=await s.blob(),f=await he(h);break;case"json":f=await s.json();break;default:f=await s.text()}let v={};return s.headers.forEach((d,u)=>{v[u]=d}),{data:f,headers:v,status:s.status,url:s.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}},xe=S("CapacitorHttp",{web:()=>new z});(function(r){r.Dark="DARK",r.Light="LIGHT",r.Default="DEFAULT"})(te||(te={}));(function(r){r.StatusBar="StatusBar",r.NavigationBar="NavigationBar"})(re||(re={}));G=class extends L{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}},Pe=S("SystemBars",{web:()=>new G})});var ne={};X(ne,{PreferencesWeb:()=>V});var V,se=W(()=>{T();V=class extends L{constructor(){super(...arguments),this.group="CapacitorStorage"}async configure({group:e}){typeof e=="string"&&(this.group=e)}async get(e){return{value:this.impl.getItem(this.applyPrefix(e.key))}}async set(e){this.impl.setItem(this.applyPrefix(e.key),e.value)}async remove(e){this.impl.removeItem(this.applyPrefix(e.key))}async keys(){return{keys:this.rawKeys().map(t=>t.substring(this.prefix.length))}}async clear(){for(let e of this.rawKeys())this.impl.removeItem(e)}async migrate(){var e;let t=[],n=[],i="_cap_",s=Object.keys(this.impl).filter(a=>a.indexOf(i)===0);for(let a of s){let l=a.substring(i.length),f=(e=this.impl.getItem(a))!==null&&e!==void 0?e:"",{value:h}=await this.get({key:l});typeof h=="string"?n.push(l):(await this.set({key:l,value:f}),t.push(l))}return{migrated:t,existing:n}}async removeOld(){let e="_cap_",t=Object.keys(this.impl).filter(n=>n.indexOf(e)===0);for(let n of t)this.impl.removeItem(n)}get impl(){return window.localStorage}get prefix(){return this.group==="NativeStorage"?"":`${this.group}.`}rawKeys(){return Object.keys(this.impl).filter(e=>e.indexOf(this.prefix)===0)}applyPrefix(e){return this.prefix+e}}});var A,k,J=W(()=>{(function(r){r.Heavy="HEAVY",r.Medium="MEDIUM",r.Light="LIGHT"})(A||(A={}));(function(r){r.Success="SUCCESS",r.Warning="WARNING",r.Error="ERROR"})(k||(k={}))});var oe={};X(oe,{HapticsWeb:()=>Y});var Y,ae=W(()=>{T();J();Y=class extends L{constructor(){super(...arguments),this.selectionStarted=!1}async impact(e){let t=this.patternForImpact(e?.style);this.vibrateWithPattern(t)}async notification(e){let t=this.patternForNotification(e?.type);this.vibrateWithPattern(t)}async vibrate(e){let t=e?.duration||300;this.vibrateWithPattern([t])}async selectionStart(){this.selectionStarted=!0}async selectionChanged(){this.selectionStarted&&this.vibrateWithPattern([70])}async selectionEnd(){this.selectionStarted=!1}patternForImpact(e=A.Heavy){return e===A.Medium?[43]:e===A.Light?[20]:[61]}patternForNotification(e=k.Success){return e===k.Warning?[30,40,30,50,60]:e===k.Error?[27,45,50]:[35,65,21]}vibrateWithPattern(e){if(navigator.vibrate)navigator.vibrate(e);else throw this.unavailable("Browser does not support the vibrate API")}}});T();T();var ie=S("Preferences",{web:()=>Promise.resolve().then(()=>(se(),ne)).then(r=>new r.PreferencesWeb)});T();J();var Z=S("Haptics",{web:()=>Promise.resolve().then(()=>(ae(),oe)).then(r=>new r.HapticsWeb)});var Q=Object.freeze(["force-multiplier-worlds-22","force-multiplier-flightline-22","force-multiplier-universal-v22"]);function ce({isNative:r,storage:e,preferences:t,onError:n=()=>{}}){let i=new Set(Q),s="fm.progress.",a="fm.progress.pending.",l=Promise.resolve(),f=!r,h=null,v=new Map,d=new Set,u=o=>{if(typeof o!="string"||o.length>8e6)return!1;try{let m=JSON.parse(o);return!!m&&typeof m=="object"&&!Array.isArray(m)}catch{return!1}},C=(async()=>{if(!r)return{available:!0,native:!1};try{let o=await Promise.all(Q.map(async c=>({key:c,...await t.get({key:s+c})})));if(o.some(({value:c})=>c!==null&&!u(c)))throw new Error("Saved device progress could not be read.");let m=o.map(c=>({...c,local:e.getItem(c.key),pending:e.getItem(a+c.key)}));for(let{local:c,pending:p}of m)if(p!==null&&(!u(p)||u(c)&&c!==p))throw new Error("Conflicting local progress was preserved. Export it before resetting or restoring.");let y=[];for(let{key:c,value:p,local:O,pending:F}of m)F!==null?(e.setItem(c,F),y.push({key:c,value:F})):p!==null?e.setItem(c,p):u(O)&&y.push({key:c,value:O});f=!0;for(let{key:c,value:p}of y)try{e.setItem(a+c,p),await t.set({key:s+c,value:p}),e.getItem(a+c)===p&&e.removeItem(a+c)}catch(O){v.set(c,O),n(O)}return{available:!0,native:!0,...v.size?{pending:!0}:{}}}catch(o){return f=!1,h=o,n(o),{available:!1,native:!0}}})();function x(o){if(!i.has(o))throw new Error("This is not a Force Multiplier progress key.")}function E(o,m,y=!1){let c=l.then(async()=>{if(await C,!!r){if(!f&&!y)throw new Error("Device backup is unavailable. Your current browser session is still usable. Export it before closing.");await m(),v.delete(o)}});return l=c.catch(p=>{v.set(o,p),n(p)}),c}return{ready:C,save(o,m){if(x(o),!u(m))return Promise.reject(new Error("Progress must be a JSON object smaller than 8 MB."));if(r&&f)try{e.setItem(a+o,m)}catch(y){return v.set(o,y),n(y),Promise.reject(y)}return E(o,async()=>{await t.set({key:s+o,value:m}),e.getItem(a+o)===m&&e.removeItem(a+o)})},remove(o){return x(o),E(o,async()=>{await t.remove({key:s+o}),e.removeItem(a+o),d.add(o),Q.every(m=>d.has(m))&&(f=!0,h=null)},!0)},async flush(){if(await C,await l,h)throw h;if(v.size)throw v.values().next().value},available:()=>f}}var U=R.isNativePlatform(),B=S("FMFiles"),_=ce({isNative:U,storage:{getItem:r=>window.localStorage.getItem(r),setItem:(r,e)=>window.localStorage.setItem(r,e),removeItem:r=>window.localStorage.removeItem(r)},preferences:ie,onError:r=>{console.warn("Progress backup:",r?.message||"unavailable"),window.dispatchEvent(new CustomEvent("fm-storage-warning",{detail:{message:"Device backup is unavailable. Export your progress before closing the app."}}))}}),le=r=>String(r||"force-multiplier.json").replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120),ve={isNative:U,ready:_.ready,get storageAvailable(){return _.available()},saveProgress:(r,e)=>_.save(r,e),removeProgress:r=>_.remove(r),flush:()=>_.flush(),async haptic(r="selection"){if(U)try{r==="success"||r==="error"?await Z.notification({type:r==="success"?k.Success:k.Error}):await Z.impact({style:A.Light})}catch{}},async shareFile({name:r,mimeType:e="application/json",data:t}){if(typeof t!="string"||t.length>8e6)throw new Error("Export must be text smaller than 8 MB.");if(U)return B.shareFile({name:le(r),mimeType:e,data:t});let n=new Blob([t],{type:e}),i=URL.createObjectURL(n),s=document.createElement("a");return s.href=i,s.download=le(r),document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(i),6e4),{completed:!0}},async importFile(){if(U){let r=await B.importFile();return r.cancelled?null:r}return new Promise((r,e)=>{let t=document.createElement("input");t.type="file",t.accept=".json,application/json",t.addEventListener("change",async()=>{try{let n=t.files?.[0];if(!n)return r(null);if(n.size>8e6)throw new Error("This backup is too large. Maximum size is 8 MB.");r({name:n.name,data:await n.text()})}catch(n){e(n)}finally{t.remove()}},{once:!0}),t.addEventListener("cancel",()=>{t.remove(),r(null)},{once:!0}),t.hidden=!0,document.body.appendChild(t),t.click()})},async copyText(r){if(U){await B.copyText({text:String(r)});return}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(String(r));return}let e=document.createElement("textarea");e.value=String(r),e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select();let t=document.execCommand("copy");if(e.remove(),!t)throw new Error("Copy is unavailable in this browser. Use Export instead.")},async printHTML(r,e="Force Multiplier"){if(U){await B.printHTML({html:String(r),title:String(e)});return}let t=document.createElement("iframe");t.style.cssText="position:fixed;right:0;bottom:0;width:1px;height:1px;border:0",document.body.appendChild(t),t.contentDocument.open(),t.contentDocument.write(String(r)),t.contentDocument.close(),t.contentWindow.focus(),t.contentWindow.print(),setTimeout(()=>t.remove(),6e4)}};window.FMNative=Object.freeze(ve);document.documentElement.classList.toggle("native-app",U);document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&_.flush().catch(()=>{})});})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
