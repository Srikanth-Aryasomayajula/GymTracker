export async function init(){
 const content=document.getElementById("page-content");const data=await fetch("data/exercises.json").then(r=>r.json());let filter="All";
 content.innerHTML=`
 <section class="page-heading"><div><div class="eyebrow">LIBRARY</div><h1>Home Exercises</h1><p class="muted">Bodyweight and home-friendly movements with video support.</p></div></section>
 <div class="chips category-chips">${["All",...data.categories].map(c=>`<button class="chip ${c==="All"?"selected":""}" data-cat="${c}">${c}</button>`).join("")}</div>
 <section class="exercise-grid" id="exercise-grid"></section>`;
 document.querySelectorAll(".category-chips .chip").forEach(b=>b.onclick=()=>{filter=b.dataset.cat;document.querySelectorAll(".category-chips .chip").forEach(x=>x.classList.toggle("selected",x===b));render()});
 function render(){
  const items=data.exercises.filter(e=>filter==="All"||e.category===filter);
  document.getElementById("exercise-grid").innerHTML=items.map(e=>`<article class="card exercise-card"><div class="exercise-icon">${e.icon||"●"}</div><div class="eyebrow">${e.category}</div><h2>${e.name}</h2><p>${e.description}</p><div class="exercise-meta"><span>${e.difficulty}</span><span>${e.muscles}</span></div>${e.youtube?`<a class="btn-secondary full" target="_blank" rel="noopener" href="${e.youtube}">▶ Watch on YouTube</a>`:""}</article>`).join("");
 }
 render();
}
