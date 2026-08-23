import { addEntry, listEntries } from "./storage.js";
let timer=null, remaining=600, running=false;
export async function init(){
 const content=document.getElementById("page-content");const sessions=await listEntries("meditations");
 content.innerHTML=`
 <section class="page-heading"><div><div class="eyebrow">RECOVERY</div><h1>Meditation</h1><p class="muted">Slow down. Breathe. Recover.</p></div></section>
 <section class="card meditation-card"><div class="timer" id="timer">10:00</div><div class="breath-ring" id="breath-ring"></div><div class="timer-actions"><button class="btn-primary" id="start">Start</button><button class="btn-secondary" id="reset">Reset</button></div><div class="duration-buttons">${[5,10,15,20].map(m=>`<button class="chip" data-min="${m}">${m} min</button>`).join("")}</div></section>
 <section class="section-head"><div><div class="eyebrow">HISTORY</div><h2>Sessions</h2></div><span class="muted">${sessions.length} completed</span></section>
 <section class="card">${sessions.slice(0,20).map(s=>`<div class="recent-row"><div><b>${s.duration} minute meditation</b><small>${s.date}</small></div><span>✓</span></div>`).join("")||`<div class="empty-state">No sessions yet.</div>`}</section>`;
 document.querySelectorAll(".duration-buttons .chip").forEach(b=>b.onclick=()=>{remaining=Number(b.dataset.min)*60;update()});
 document.getElementById("start").onclick=toggle;
 document.getElementById("reset").onclick=()=>{stop();remaining=600;update()};
 update();
 function update(){document.getElementById("timer").textContent=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;}
 function stop(){clearInterval(timer);timer=null;running=false;document.getElementById("start").textContent="Start";}
 async function toggle(){
   if(running){stop();return;}
   running=true;document.getElementById("start").textContent="Pause";
   timer=setInterval(async()=>{remaining--;update();if(remaining<=0){stop();await addEntry("meditations",{date:new Date().toISOString().slice(0,10),duration:Math.round(Number(document.getElementById("timer").dataset.duration||10))});showToast("Meditation complete.");}},1000);
 }
}
