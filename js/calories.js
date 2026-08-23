import { addEntry, listEntries, deleteEntry, toNumber } from "./storage.js";

export async function init(){
  const content=document.getElementById("page-content");
  const foods=await fetch("data/foods.json").then(r=>r.json());
  let entries=await listEntries("calories");
  const today=()=>new Date().toISOString().slice(0,10);
  content.innerHTML=`
    <section class="page-heading"><div><div class="eyebrow">NUTRITION</div><h1>Calorie Tracker</h1><p class="muted">Keep the numbers simple and useful.</p></div></section>
    <section class="macro-grid">
      <div class="macro-card"><span>CALORIES</span><b id="cal-total">0</b><small>/ target</small></div>
      <div class="macro-card"><span>PROTEIN</span><b id="protein-total">0g</b></div>
      <div class="macro-card"><span>CARBS</span><b id="carb-total">0g</b></div>
      <div class="macro-card"><span>FAT</span><b id="fat-total">0g</b></div>
    </section>
    <section class="card">
      <div class="section-head"><div><div class="eyebrow">ADD FOOD</div><h2>Today's intake</h2></div></div>
      <div class="form-grid three">
        <div class="field"><label>Food</label><input id="food" list="food-list" placeholder="e.g. banana"><datalist id="food-list">${foods.map(f=>`<option value="${f.name}">`).join("")}</datalist></div>
        <div class="field"><label>Quantity</label><input id="quantity" type="number" step="0.1" value="1"></div>
        <div class="field"><label>Calories</label><input id="food-calories" type="number" placeholder="0"></div>
      </div>
      <div class="form-grid three">
        <div class="field"><label>Protein (g)</label><input id="food-protein" type="number" step="0.1" value="0"></div>
        <div class="field"><label>Carbs (g)</label><input id="food-carbs" type="number" step="0.1" value="0"></div>
        <div class="field"><label>Fat (g)</label><input id="food-fat" type="number" step="0.1" value="0"></div>
      </div>
      <button class="btn-primary" id="add-food">Add Food</button>
    </section>
    <section class="card" id="food-list-today"></section>
  `;
  document.getElementById("food").addEventListener("input",()=>{
    const f=foods.find(x=>x.name.toLowerCase()===document.getElementById("food").value.toLowerCase());
    if(f){for(const [id,k] of [["food-calories","calories"],["food-protein","protein"],["food-carbs","carbs"],["food-fat","fat"]])document.getElementById(id).value=f[k]||0;}
  });
  document.getElementById("add-food").onclick=async()=>{
    const name=document.getElementById("food").value.trim();if(!name)return showToast("Enter a food.");
    await addEntry("calories",{date:today(),food:name,quantity:toNumber(quantity.value)||1,calories:toNumber(document.getElementById("food-calories").value)||0,protein:toNumber(document.getElementById("food-protein").value)||0,carbs:toNumber(document.getElementById("food-carbs").value)||0,fat:toNumber(document.getElementById("food-fat").value)||0});
    entries=await listEntries("calories");render();showToast("Food added.");
  };
  window.removeFood=async id=>{await deleteEntry("calories",id);entries=entries.filter(e=>e.id!==id);render();};
  render();
  function render(){
    const t=entries.filter(e=>e.date===today());
    const sum=k=>t.reduce((s,e)=>s+(Number(e[k])||0),0);
    document.getElementById("cal-total").textContent=Math.round(sum("calories")).toLocaleString();
    document.getElementById("protein-total").textContent=`${Math.round(sum("protein"))}g`;
    document.getElementById("carb-total").textContent=`${Math.round(sum("carbs"))}g`;
    document.getElementById("fat-total").textContent=`${Math.round(sum("fat"))}g`;
    document.getElementById("food-list-today").innerHTML=t.length?t.map(e=>`<div class="recent-row"><div><b>${e.food}</b><small>${e.quantity} serving · ${e.protein||0}g protein</small></div><div><strong>${Math.round(e.calories)} kcal</strong><button class="icon-btn danger" onclick="window.removeFood('${e.id}')">×</button></div></div>`).join(""):`<div class="empty-state">No food logged today.</div>`;
  }
}
