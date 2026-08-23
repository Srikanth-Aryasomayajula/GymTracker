import { listEntries, updateEntry, deleteEntry } from "./storage.js";

let entries=[];

export async function init(){
  const content=document.getElementById("page-content");
  entries=await listEntries("workouts");
  content.innerHTML=`
    <section class="page-heading"><div><div class="eyebrow">YOUR TRAINING LOG</div><h1>History</h1><p class="muted">Search, edit and review everything you've recorded.</p></div><div class="history-actions"><button class="btn-secondary" id="export-btn">Export JSON</button><button class="btn-secondary" id="import-btn">Import</button><input hidden type="file" id="import-file" accept=".json,application/json"></div></section>
    <section class="filter-bar card"><input id="search" placeholder="Search machine or notes…"><select id="date-filter"><option value="">All dates</option></select></section>
    <section class="table-wrap card"><table><thead><tr><th>Date</th><th>Machine</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Settings</th><th></th></tr></thead><tbody id="tbody"></tbody></table></section>
    <section class="mobile-history" id="mobile-history"></section>
  `;
  const dates=[...new Set(entries.map(e=>e.date))].sort().reverse();
  document.getElementById("date-filter").innerHTML+=dates.map(d=>`<option value="${d}">${d}</option>`).join("");
  document.getElementById("search").oninput=render;
  document.getElementById("date-filter").onchange=render;
  document.getElementById("export-btn").onclick=exportBackup;
  document.getElementById("import-btn").onclick=()=>document.getElementById("import-file").click();
  document.getElementById("import-file").onchange=importBackup;
  render();
}

function filtered(){
  const term=document.getElementById("search").value.trim().toLowerCase();
  const date=document.getElementById("date-filter").value;
  return entries.filter(e=>(!term||`${e.machine} ${e.notes||""} ${e.settings||""}`.toLowerCase().includes(term))&&(!date||e.date===date));
}
function render(){
  const rows=filtered();
  document.getElementById("tbody").innerHTML=rows.map(e=>`
    <tr><td>${e.date}</td><td><b>${e.machine}</b>${e.notes?`<small>${e.notes}</small>`:""}</td><td>${e.sets??"—"}</td><td>${e.reps??"—"}</td><td>${e.weight??"—"} ${e.unit||""}</td><td>${e.settings||"—"}</td><td><div class="row-actions"><button onclick="window.editEntry('${e.id}')">Edit</button><button class="danger" onclick="window.removeEntry('${e.id}')">Delete</button></div></td></tr>`).join("")||`<tr><td colspan="7" class="empty-state">No matching entries.</td></tr>`;
  document.getElementById("mobile-history").innerHTML=rows.map(e=>`<article class="history-card card"><div class="history-card-top"><div><div class="eyebrow">${e.date}</div><h3>${e.machine}</h3></div><strong>${e.weight??"—"} ${e.unit||""}</strong></div><p>${e.sets??0} × ${e.reps??0}</p><small>${e.settings||""}</small><small>${e.notes||""}</small><div class="row-actions"><button onclick="window.editEntry('${e.id}')">Edit</button><button class="danger" onclick="window.removeEntry('${e.id}')">Delete</button></div></article>`).join("");
}
window.editEntry=id=>{
  const e=entries.find(x=>x.id===id); if(!e)return;
  location.href=`workout.html?edit=${encodeURIComponent(id)}`;
};
window.removeEntry=async id=>{
  if(!confirm("Delete this workout entry?"))return;
  try{await deleteEntry("workouts",id);entries=entries.filter(e=>e.id!==id);render();showToast("Entry deleted.");}catch(e){showToast(e.message)}
};
function exportBackup(){
  const blob=new Blob([JSON.stringify({version:2,entries},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`gym-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
}
async function importBackup(e){
  const file=e.target.files[0];if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());
    const imported=Array.isArray(parsed.entries)?parsed.entries:[];
    for(const x of imported) await updateOrAdd(x);
    entries=await listEntries("workouts");render();showToast(`Imported ${imported.length} entries.`);
  }catch(err){showToast("Could not read that backup.")}
  e.target.value="";
}
async function updateOrAdd(x){
  const id=x.id;
  if(id && entries.some(e=>e.id===id)){await updateEntry("workouts",id,{...x,id:undefined});}
  else{
    const {addEntry}=await import("./storage.js");
    await addEntry("workouts",{machine:x.machine,sets:x.sets??null,reps:x.reps??null,weight:x.weight??null,unit:x.unit||"kg",settings:x.settings||"",notes:x.notes||"",date:x.date||new Date().toISOString().slice(0,10)});
  }
}
