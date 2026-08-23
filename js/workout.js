import { addEntry, updateEntry, listEntries, toNumber } from "./storage.js";

let machines = [];
let entries = [];
let editingId = null;

export async function init() {
  const content = document.getElementById("page-content");
  const machineData = await fetch("data/machines.json").then(r => r.json());
  machines = machineData.machines || [];
  entries = await listEntries("workouts");

  const editParam = new URLSearchParams(location.search).get("edit");

  content.innerHTML = `
    <section class="page-heading">
      <div>
        <div class="eyebrow">TRAINING</div>
        <h1>Workout</h1>
        <p class="muted">Log every set. Keep the details that help you progress.</p>
      </div>
      <a class="btn-secondary" href="history.html">History</a>
    </section>

    <section class="card workout-form">
      <div class="field">
        <label>Machine / Exercise</label>
        <select id="machine">
          ${machines.map(m => `<option>${m}</option>`).join("")}
          <option value="__other">Other</option>
        </select>
      </div>

      <div id="other-wrap" class="field hidden">
        <label>Other machine</label>
        <input id="other-machine" placeholder="e.g. Hack Squat">
      </div>

      <div class="chips" id="chips"></div>

      <div class="form-grid three">
        <div class="field"><label>Sets</label><input id="sets" type="number" min="0" inputmode="numeric" placeholder="3"></div>
        <div class="field"><label>Reps</label><input id="reps" type="number" min="0" inputmode="numeric" placeholder="10"></div>
        <div class="field">
          <label>Weight</label>
          <div class="input-unit">
            <input id="weight" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0">
            <select id="unit"><option>kg</option><option>lb</option></select>
          </div>
        </div>
      </div>

      <div class="field"><label>Machine settings</label><input id="settings" placeholder="e.g. seat 4 · incline 2 · pin 6"></div>
      <div class="field"><label>Notes</label><input id="notes" placeholder="e.g. felt easy, increase next time"></div>
      <div class="field"><label>Date</label><input id="date" type="date" value="${today()}"></div>

      <div class="form-actions">
        <button class="btn-primary" id="save-btn">Log Set</button>
        <button class="btn-secondary hidden" id="cancel-btn">Cancel edit</button>
      </div>
    </section>

    <section class="section-head">
      <div><div class="eyebrow">TODAY</div><h2>Quick view</h2></div>
      <span class="muted" id="today-count"></span>
    </section>
    <section id="today-list" class="card"></section>
  `;

  const select = document.getElementById("machine");
  select.onchange = () => {
    document.getElementById("other-wrap").classList.toggle("hidden", select.value !== "__other");
  };

  document.getElementById("save-btn").onclick = save;
  document.getElementById("cancel-btn").onclick = reset;

  renderChips();
  renderToday();

  if (editParam) setTimeout(() => editWorkout(editParam), 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMachine() {
  const select = document.getElementById("machine");
  return select.value === "__other"
    ? document.getElementById("other-machine").value.trim()
    : select.value;
}

function renderChips() {
  const names = [...new Set(entries.map(e => e.machine).filter(Boolean))].slice(0, 8);
  const el = document.getElementById("chips");
  el.innerHTML = names.map(n =>
    `<button class="chip" data-machine="${escapeHtml(n)}">${escapeHtml(n)}</button>`
  ).join("");

  el.querySelectorAll(".chip").forEach(button => {
    button.onclick = () => {
      const select = document.getElementById("machine");
      if (machines.includes(button.dataset.machine)) {
        select.value = button.dataset.machine;
        document.getElementById("other-wrap").classList.add("hidden");
      } else {
        select.value = "__other";
        document.getElementById("other-wrap").classList.remove("hidden");
        document.getElementById("other-machine").value = button.dataset.machine;
      }
    };
  });
}

function renderToday() {
  const todayEntries = entries.filter(e => e.date === today());
  document.getElementById("today-count").textContent = `${todayEntries.length} entries`;

  document.getElementById("today-list").innerHTML = todayEntries.length
    ? todayEntries.map(e => `
      <div class="recent-row">
        <div>
          <b>${escapeHtml(e.machine)}</b>
          <small>${e.sets || 0} × ${e.reps || 0} · ${escapeHtml(e.settings || "")}</small>
        </div>
        <strong>${e.weight ?? "—"} ${e.unit || ""}</strong>
      </div>
    `).join("")
    : `<div class="empty-state">Nothing logged today.</div>`;
}

async function save() {
  const machine = currentMachine();

  if (!machine) {
    showToast("Choose or enter a machine.");
    return;
  }

  const payload = {
    machine,
    sets: toNumber(document.getElementById("sets").value),
    reps: toNumber(document.getElementById("reps").value),
    weight: toNumber(document.getElementById("weight").value),
    unit: document.getElementById("unit").value,
    settings: document.getElementById("settings").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    date: document.getElementById("date").value || today()
  };

  try {
    if (editingId) {
      await updateEntry("workouts", editingId, payload);
      showToast("Workout updated.");
    } else {
      await addEntry("workouts", payload);
      showToast("Workout logged.");
    }

    entries = await listEntries("workouts");
    reset();
    renderChips();
    renderToday();
  } catch (error) {
    showToast(error.message);
  }
}

function reset() {
  editingId = null;
  document.getElementById("save-btn").textContent = "Log Set";
  document.getElementById("cancel-btn").classList.add("hidden");

  document.getElementById("machine").value = machines[0] || "__other";
  document.getElementById("other-wrap").classList.add("hidden");
  document.getElementById("other-machine").value = "";
  document.getElementById("sets").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("settings").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("date").value = today();
}

function editWorkout(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  editingId = id;

  const select = document.getElementById("machine");
  if (machines.includes(entry.machine)) {
    select.value = entry.machine;
    document.getElementById("other-wrap").classList.add("hidden");
  } else {
    select.value = "__other";
    document.getElementById("other-wrap").classList.remove("hidden");
    document.getElementById("other-machine").value = entry.machine;
  }

  document.getElementById("sets").value = entry.sets ?? "";
  document.getElementById("reps").value = entry.reps ?? "";
  document.getElementById("weight").value = entry.weight ?? "";
  document.getElementById("unit").value = entry.unit || "kg";
  document.getElementById("settings").value = entry.settings || "";
  document.getElementById("notes").value = entry.notes || "";
  document.getElementById("date").value = entry.date || today();

  document.getElementById("save-btn").textContent = "Save Changes";
  document.getElementById("cancel-btn").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.editWorkout = editWorkout;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
