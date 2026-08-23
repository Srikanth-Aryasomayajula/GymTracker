import { getProfile, listEntries, getProfilesForUser, getSelectedProfileId, setSelectedProfileId } from "./storage.js";
import {
  renderNavigation,
  initNavigation
} from "./navigation.js";
import { auth } from "./firebase.js";

export async function init() {
  const profile = await getProfile();
  const workouts = await listEntries("workouts");
  const calories = await listEntries("calories");
  const meditations = await listEntries("meditations");
  const totalSets = workouts.reduce((s,e)=>s+(Number(e.sets)||0),0);
  const totalVolume = workouts.reduce((s,e)=>s+(Number(e.sets)||0)*(Number(e.reps)||0)*(Number(e.weight)||0),0);
  const today = new Date().toISOString().slice(0,10);
  const todayWorkouts = workouts.filter(e=>e.date===today);
  const prs = calculatePRs(workouts);

  document.getElementById("app").innerHTML = `
    ${renderNavigation("index.html", profile)}
    <main class="page-shell dashboard">
      <section class="hero">
          <div class="eyebrow">WELCOME BACK</div>
		  <h1>${escapeHtml(profile?.name || "Athlete")}</h1>
		  <p class="muted">
			${todayWorkouts.length
			  ? `${todayWorkouts.length} exercises logged today.`
			  : "Ready for your next session?"}
		  </p>
      </section>

      <section class="quick-grid">
        <a class="quick-card featured" href="workout.html"><span>＋</span><strong>Log Workout</strong><small>Start tracking a set</small></a>
        <a class="quick-card" href="history.html"><span>▤</span><strong>History</strong><small>${workouts.length} entries</small></a>
        <a class="quick-card" href="calories.html"><span>◉</span><strong>Calories</strong><small>${calories.length} food entries</small></a>
        <a class="quick-card" href="meditation.html"><span>◌</span><strong>Meditate</strong><small>${meditations.length} sessions</small></a>
      </section>

      <section class="stats-grid">
        <div class="stat-card"><span>WORKOUT ENTRIES</span><b>${workouts.length}</b></div>
        <div class="stat-card"><span>TOTAL SETS</span><b>${totalSets}</b></div>
        <div class="stat-card"><span>VOLUME</span><b>${Math.round(totalVolume).toLocaleString()} kg</b></div>
        <div class="stat-card"><span>PERSONAL RECORDS</span><b>${prs.length}</b></div>
      </section>

      <section class="section-head"><div><div class="eyebrow">PROGRESS</div><h2>Training volume</h2></div><a href="history.html">View history →</a></section>
      <section class="card volume-chart">${renderVolumeChart(workouts)}</section>

      <section class="section-head"><div><div class="eyebrow">ACHIEVEMENTS</div><h2>Personal Records</h2></div></section>
      <section class="pr-grid">
        ${prs.slice(0,6).map(p=>`<div class="pr-card"><span>🏆</span><div><b>${escapeHtml(p.machine)}</b><small>${p.weight}${p.unit} · ${p.reps || 0} reps</small></div></div>`).join("") || `<div class="card empty-state">Log workouts to start building your records.</div>`}
      </section>

      <section class="section-head"><div><div class="eyebrow">RECENT</div><h2>Latest entries</h2></div><a href="history.html">See all →</a></section>
      <section class="card recent-list">
        ${workouts.slice(0,8).map(e=>`<div class="recent-row"><div><b>${escapeHtml(e.machine)}</b><small>${e.date} · ${e.sets||0} × ${e.reps||0}</small></div><strong>${e.weight ?? "—"} ${e.unit||""}</strong></div>`).join("") || `<div class="empty-state">No workouts yet.</div>`}
      </section>
    </main>`;
	
	initNavigation();

	if (window.lucide) {
	  window.lucide.createIcons();
	}
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function calculatePRs(entries){
  const map = new Map();
  for(const e of entries){
    const w=Number(e.weight); if(!e.machine || !Number.isFinite(w)) continue;
    const key=e.machine.toLowerCase();
    const old=map.get(key);
    if(!old || w>old.weight || (w===old.weight && Number(e.reps||0)>Number(old.reps||0))) map.set(key,e);
  }
  return [...map.values()].sort((a,b)=>Number(b.weight)-Number(a.weight));
}

function renderVolumeChart(entries) {
  const byDate = {};
  for (const e of entries) {
    const volume = (Number(e.sets)||0) * (Number(e.reps)||0) * (Number(e.weight)||0);
    if (e.date) byDate[e.date] = (byDate[e.date]||0) + volume;
  }
  const days = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0])).slice(-10);
  if (!days.length) return `<div class="empty-state">Your volume chart will appear after you log a workout.</div>`;
  const max = Math.max(...days.map(d=>d[1]),1);
  return `<div class="bars">${days.map(([date,value])=>`
    <div class="bar-col" title="${date}: ${Math.round(value).toLocaleString()} kg">
      <div class="bar-value">${Math.round(value).toLocaleString()}</div>
      <div class="bar" style="height:${Math.max(8,(value/max)*170)}px"></div>
      <small>${date.slice(5)}</small>
    </div>`).join("")}</div>`;
}
