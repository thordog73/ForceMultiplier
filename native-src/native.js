import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
const keys=['force-multiplier-worlds-22','force-multiplier-flightline-22','force-multiplier-universal-v22','force-multiplier-worlds-22-recovery','force-multiplier-recognize-integrate-v2','force-multiplier-visual-sim-v1','force-multiplier-visual-sim-v2'];
window.FMRecoveryNotice=(message)=>{const warning=document.getElementById('fm-recovery-warning');if(warning){warning.textContent=message;warning.hidden=false;}};
window.FMStorageError=()=>{const warning=document.getElementById('fm-save-warning');if(warning)warning.hidden=false;};
window.FMExport=async(name,value)=>{
 const data=JSON.stringify(value,null,2);
 if(Capacitor.isNativePlatform()){
  const file=await Filesystem.writeFile({path:name,data,directory:Directory.Cache,encoding:Encoding.UTF8});
  try {await Share.share({title:'Force Multiplier backup',files:[file.uri],dialogTitle:'Save or share your backup'});} finally {await Filesystem.deleteFile({path:name,directory:Directory.Cache}).catch(()=>{});}
 }else{
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
};
window.FMBackup=async()=>{
 const entries=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null));
 await window.FMExport('force-multiplier-all-progress-'+new Date().toISOString().slice(0,10)+'.json',{format:'force-multiplier-all-progress',version:1,createdAt:new Date().toISOString(),entries});
};
window.FMRestore=async(file)=>{
 if(!file||file.size>10*1024*1024)throw Error('Select a backup smaller than 10 MB.');
 const data=JSON.parse(await file.text());
 if(data.format!=='force-multiplier-all-progress'||data.version!==1||!data.entries||Object.keys(data.entries).some(k=>!keys.includes(k)))throw Error('This is not a supported complete-progress backup.');
 for(const [key,value]of Object.entries(data.entries)){
  if(typeof value!=='string')throw Error('Invalid backup entry.');const p=JSON.parse(value);
  if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Invalid progress object.');
  if(key==='force-multiplier-worlds-22'&&(!p.tracks||!p.world||!p.activeSkill))throw Error('Game progress is missing required fields.');
  if(key==='force-multiplier-universal-v22'&&(p.schema!==3||!p.settings||!p.cases||!Array.isArray(p.evidence)))throw Error('Workspace progress is missing required fields.');
 }
 if(!Object.keys(data.entries).length)throw Error('This backup is empty.');
 if(!confirm('Replace saved Force Multiplier progress on this device with this backup? Export current progress first if you want to keep it.'))return;
 const before=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
 try{for(const k of keys){if(k in data.entries)localStorage.setItem(k,data.entries[k]);else localStorage.removeItem(k);}}
 catch(error){for(const[k,v]of Object.entries(before)){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch{}}throw Error('Restore failed. Storage may be full. Keep your original backup and free device space before retrying.');}
 location.href='./index.html';
};
window.FMDelete=()=>{if(confirm('Delete all Force Multiplier game and workspace progress on this device? This cannot be undone without a backup.')){for(const k of keys)localStorage.removeItem(k);location.href='./index.html';}};
document.addEventListener('click',async(event)=>{const target=event.target.closest('[data-native-action]');if(!target)return;try{if(target.dataset.nativeAction==='backup')await window.FMBackup();if(target.dataset.nativeAction==='delete')window.FMDelete();}catch(error){alert('Action did not complete: '+error.message);}});
document.addEventListener('change',async(event)=>{if(event.target.id!=='fm-restore')return;try{await window.FMRestore(event.target.files[0]);}catch(error){alert('Restore did not complete: '+error.message);}event.target.value='';});
