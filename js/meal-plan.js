export async function init(){
  const content=document.getElementById("page-content");
  content.innerHTML=`
    <section class="page-heading"><div><div class="eyebrow">PLANNING</div><h1>Meal Plan</h1><p class="muted">A rule-based starter plan. AI personalization is intentionally reserved for a future version.</p></div></section>
    <section class="card">
      <div class="form-grid three">
        <div class="field"><label>Goal</label><select id="goal"><option value="bulk">Build muscle</option><option value="maintain">Maintain</option><option value="cut">Fat loss</option></select></div>
        <div class="field"><label>Body weight (kg)</label><input id="bodyweight" type="number" placeholder="70"></div>
        <div class="field"><label>Activity</label><select id="activity"><option value="1.35">Light</option><option value="1.55" selected>Moderate</option><option value="1.75">High</option></select></div>
      </div>
      <div class="form-grid three">
        <div class="field"><label>Height (cm)</label><input id="height" type="number" placeholder="175"></div>
        <div class="field"><label>Age</label><input id="age" type="number" placeholder="30"></div>
        <div class="field"><label>Diet</label><select id="diet"><option>Vegetarian + Eggs</option><option>Vegetarian</option><option>Omnivore</option></select></div>
      </div>
      <button class="btn-primary" id="generate">Generate Starter Plan</button>
    </section>
    <section id="plan-output"></section>
  `;
  document.getElementById("generate").onclick=generate;
}
function generate(){
  const w=Number(bodyweight.value),h=Number(height.value),a=Number(age.value),activity=Number(document.getElementById("activity").value),goal=document.getElementById("goal").value;
  if(!w||!h||!a){showToast("Enter weight, height and age.");return;}
  const bmr=10*w+6.25*h-5*a+5;
  const maintenance=Math.round(bmr*activity);
  const target=goal==="bulk"?maintenance+250:goal==="cut"?maintenance-350:maintenance;
  const protein=Math.round(w*(goal==="bulk"?1.8:1.6));
  const plan=[
    ["Breakfast","Protein smoothie + eggs + fruit",Math.round(target*.25)],
    ["Lunch","Rice/roti + dal/chana + vegetables + curd",Math.round(target*.30)],
    ["Snack","Whey + banana + peanut butter",Math.round(target*.15)],
    ["Dinner","Paneer/tofu/egg-based meal + vegetables + carbs",Math.round(target*.30)]
  ];
  document.getElementById("plan-output").innerHTML=`
    <section class="stats-grid"><div class="stat-card"><span>EST. MAINTENANCE</span><b>${maintenance}</b><small>kcal/day</small></div><div class="stat-card"><span>TARGET</span><b>${target}</b><small>kcal/day</small></div><div class="stat-card"><span>PROTEIN</span><b>${protein}g</b><small>starter target</small></div></section>
    <section class="meal-grid">${plan.map(p=>`<article class="card meal-card"><div class="eyebrow">${p[0]}</div><h2>${p[1]}</h2><strong>${p[2]} kcal</strong></article>`).join("")}</section>
    <p class="muted disclaimer">This is a simple planning estimate, not medical or dietary advice. Adjust portions based on progress and individual needs.</p>`;
}
