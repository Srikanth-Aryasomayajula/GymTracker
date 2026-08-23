import {
  listEntries,
  updateEntry,
  deleteEntry
} from "./storage.js";

let entries = [];

export async function init() {

  const content = document.getElementById("page-content");

  entries = await listEntries("workouts");

  content.innerHTML = `

    <div class="history-layout">

      <!-- =================================
           LEFT: INTERACTIVE STATS
           ================================= -->

      <aside class="history-sidebar">

        <div class="sidebar-heading">
          <div class="eyebrow">OVERVIEW</div>
          <h2>Training Stats</h2>
        </div>

        <button class="history-stat active" id="stat-all">

          <div class="history-stat-icon">
            <i data-lucide="dumbbell"></i>
          </div>

          <div>
            <span>Total Entries</span>
            <strong id="stat-entries">0</strong>
          </div>

        </button>

        <button class="history-stat" id="stat-days">

          <div class="history-stat-icon">
            <i data-lucide="calendar-days"></i>
          </div>

          <div>
            <span>Workout Days</span>
            <strong id="stat-days-value">0</strong>
          </div>

        </button>

        <button class="history-stat" id="stat-sets">

          <div class="history-stat-icon">
            <i data-lucide="layers-3"></i>
          </div>

          <div>
            <span>Total Sets</span>
            <strong id="stat-sets-value">0</strong>
          </div>

        </button>

        <button class="history-stat" id="stat-volume">

          <div class="history-stat-icon">
            <i data-lucide="weight"></i>
          </div>

          <div>
            <span>Total Volume</span>
            <strong id="stat-volume-value">0 kg</strong>
          </div>

        </button>

        <button class="history-stat" id="stat-exercises">

          <div class="history-stat-icon">
            <i data-lucide="activity"></i>
          </div>

          <div>
            <span>Exercises</span>
            <strong id="stat-exercises-value">0</strong>
          </div>

        </button>

        <div class="history-sidebar-note">
          <i data-lucide="mouse-pointer-2"></i>
          <span>Click a statistic to filter your history.</span>
        </div>

      </aside>


      <!-- =================================
           RIGHT: HISTORY
           ================================= -->

      <section class="history-main">
	  
	  <!-- =================================
			 ANALYTICS
			================================= -->

		<section class="history-analytics">

		  <div class="analytics-card card">
			<div class="analytics-heading">
			  <div>
				<div class="eyebrow">DISTRIBUTION</div>
				<h3>Exercises</h3>
			  </div>
			</div>

			<div class="donut-wrapper">
			  <div class="exercise-donut" id="exercise-donut">
				<div class="donut-center">
				  <strong id="donut-total">0</strong>
				  <span>entries</span>
				</div>
			  </div>

			  <div class="donut-legend" id="donut-legend"></div>
			</div>
		  </div>


		  <div class="analytics-card card">
			<div class="analytics-heading">
			  <div>
				<div class="eyebrow">VOLUME</div>
				<h3>Top Exercises</h3>
			  </div>
			</div>

			<div class="volume-chart" id="volume-chart"></div>
		  </div>


		  <div class="analytics-card card">
			<div class="analytics-heading">
			  <div>
				<div class="eyebrow">ACTIVITY</div>
				<h3>Workout Days</h3>
			  </div>
			</div>

			<div class="activity-chart" id="activity-chart"></div>
		  </div>

		</section>

        <section class="page-heading">

          <div>
            <div class="eyebrow">YOUR TRAINING LOG</div>

            <h1>History</h1>

            <p class="muted">
              Search, edit and review everything you've recorded.
            </p>
          </div>

          <div class="history-actions">

            <button
              class="btn-secondary"
              id="export-csv-btn"
            >
              <i data-lucide="file-spreadsheet"></i>
              Export CSV
            </button>

            <button
              class="btn-secondary"
              id="export-btn"
            >
              <i data-lucide="download"></i>
              Backup JSON
            </button>

            <button
              class="btn-secondary"
              id="import-btn"
            >
              <i data-lucide="upload"></i>
              Import
            </button>

            <input
              hidden
              type="file"
              id="import-file"
              accept=".json,application/json"
            >

          </div>

        </section>


        <!-- FILTER -->

        <section class="filter-bar card">

          <input
            id="search"
            placeholder="Search machine or notes…"
          >

          <select id="date-filter">

            <option value="">
              All dates
            </option>

          </select>

        </section>


        <!-- DESKTOP TABLE -->

        <section class="table-wrap card">

          <table>

            <thead>

              <tr>
                <th>Date</th>
                <th>Machine</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight</th>
                <th>Settings</th>
                <th></th>
              </tr>

            </thead>

            <tbody id="tbody"></tbody>

          </table>

        </section>


        <!-- MOBILE -->

        <section
          class="mobile-history"
          id="mobile-history"
        ></section>

      </section>

    </div>
  `;

  const dates = [
    ...new Set(
      entries
        .map(e => e.date)
        .filter(Boolean)
    )
  ].sort().reverse();

  document.getElementById("date-filter").innerHTML +=
    dates
      .map(d => `<option value="${d}">${d}</option>`)
      .join("");


  /* =================================
     FILTER EVENTS
     ================================= */

  document.getElementById("search").oninput = () => {
    clearStatSelection();
    render();
  };

  document.getElementById("date-filter").onchange = () => {
    clearStatSelection();
    render();
  };


  /* =================================
     EXPORT / IMPORT
     ================================= */

  document.getElementById("export-btn").onclick =
    exportBackup;

  document.getElementById("export-csv-btn").onclick =
    exportCSV;

  document.getElementById("import-btn").onclick =
    () =>
      document
        .getElementById("import-file")
        .click();

  document.getElementById("import-file").onchange =
    importBackup;


  /* =================================
     INTERACTIVE STATS
     ================================= */

  document.getElementById("stat-all").onclick = () => {

    document.getElementById("search").value = "";
    document.getElementById("date-filter").value = "";

    setActiveStat("stat-all");

    render();
  };


  document.getElementById("stat-days").onclick = () => {

    document.getElementById("search").value = "";

    const latestDate =
      [...new Set(entries.map(e => e.date))]
        .filter(Boolean)
        .sort()
        .reverse()[0];

    if (latestDate) {
      document.getElementById("date-filter").value =
        latestDate;
    }

    setActiveStat("stat-days");

    render();
  };


  document.getElementById("stat-sets").onclick = () => {

    clearFilters();

    setActiveStat("stat-sets");

    render();
  };


  document.getElementById("stat-volume").onclick = () => {

    clearFilters();

    setActiveStat("stat-volume");

    render();
  };


  document.getElementById("stat-exercises").onclick = () => {

    clearFilters();

    setActiveStat("stat-exercises");

    render();
  };


  render();
  updateStats();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}


/* =========================================
   FILTERED ENTRIES
   ========================================= */

function filtered() {

  const term =
    document
      .getElementById("search")
      .value
      .trim()
      .toLowerCase();

  const date =
    document
      .getElementById("date-filter")
      .value;

  return entries.filter(e =>

    (
      !term ||
      `${e.machine} ${e.notes || ""} ${e.settings || ""}`
        .toLowerCase()
        .includes(term)
    )

    &&

    (
      !date ||
      e.date === date
    )

  );
}


/* =========================================
   RENDER HISTORY
   ========================================= */

function render() {

  const rows = filtered();

  document.getElementById("tbody").innerHTML =

    rows.map(e => `

      <tr>

        <td>${escapeHtml(e.date)}</td>

        <td>
          <b>${escapeHtml(e.machine)}</b>

          ${
            e.notes
              ? `<small>${escapeHtml(e.notes)}</small>`
              : ""
          }
        </td>

        <td>${e.sets ?? "—"}</td>

        <td>${e.reps ?? "—"}</td>

        <td>
          ${e.weight ?? "—"}
          ${escapeHtml(e.unit || "")}
        </td>

        <td>
          ${escapeHtml(e.settings || "—")}
        </td>

        <td>

          <div class="row-actions">

            <button
              onclick="window.editEntry('${e.id}')"
            >
              Edit
            </button>

            <button
              class="danger"
              onclick="window.removeEntry('${e.id}')"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>

    `).join("")

    ||

    `
      <tr>
        <td colspan="7" class="empty-state">
          No matching entries.
        </td>
      </tr>
    `;


  document.getElementById("mobile-history").innerHTML =

    rows.map(e => `

      <article class="history-card card">

        <div class="history-card-top">

          <div>

            <div class="eyebrow">
              ${escapeHtml(e.date)}
            </div>

            <h3>
              ${escapeHtml(e.machine)}
            </h3>

          </div>

          <strong>
            ${e.weight ?? "—"}
            ${escapeHtml(e.unit || "")}
          </strong>

        </div>

        <p>
          ${e.sets ?? 0} × ${e.reps ?? 0}
        </p>

        <small>
          ${escapeHtml(e.settings || "")}
        </small>

        <small>
          ${escapeHtml(e.notes || "")}
        </small>

        <div class="row-actions">

          <button
            onclick="window.editEntry('${e.id}')"
          >
            Edit
          </button>

          <button
            class="danger"
            onclick="window.removeEntry('${e.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");


  updateStats(rows);
  renderCharts(rows);
}


/* =========================================
   STATISTICS
   ========================================= */

function updateStats(data = entries) {

  const workoutDays =
    new Set(
      data
        .map(e => e.date)
        .filter(Boolean)
    ).size;

  const totalSets =
    data.reduce(
      (sum, e) =>
        sum + (Number(e.sets) || 0),
      0
    );

  const totalVolume =
    data.reduce(
      (sum, e) =>
        sum +
        (Number(e.sets) || 0) *
        (Number(e.reps) || 0) *
        (Number(e.weight) || 0),
      0
    );

  const exercises =
    new Set(
      data
        .map(e =>
          String(e.machine || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    ).size;


  document.getElementById("stat-entries")
    .textContent = data.length;

  document.getElementById("stat-days-value")
    .textContent = workoutDays;

  document.getElementById("stat-sets-value")
    .textContent = totalSets;

  document.getElementById("stat-volume-value")
    .textContent =
      `${Math.round(totalVolume).toLocaleString()} kg`;

  document.getElementById("stat-exercises-value")
    .textContent = exercises;
}

/* =========================================
   VISUAL ANALYTICS
   ========================================= */

function renderCharts(data = entries) {

  renderExerciseDonut(data);
  renderVolumeChart(data);
  renderActivityChart(data);

}


/* =========================================
   EXERCISE DONUT
   ========================================= */

function renderExerciseDonut(data) {

  const donut = document.getElementById("exercise-donut");
  const legend = document.getElementById("donut-legend");
  const totalEl = document.getElementById("donut-total");

  if (!donut || !legend || !totalEl) return;

  const counts = {};

  data.forEach(e => {

    const name = String(e.machine || "Other").trim();

    if (!name) return;

    counts[name] = (counts[name] || 0) + 1;

  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const total =
    sorted.reduce((sum, [, value]) => sum + value, 0);

  totalEl.textContent = total;

  if (!sorted.length) {

    donut.style.background = "var(--surface-2)";
    legend.innerHTML = `<span class="muted">No workout data yet.</span>`;

    return;
  }

  const colors = [
    "var(--accent)",
    "#8b7a52",
    "#6f6758",
    "#514c43",
    "#393631"
  ];

  let current = 0;

  const gradients = sorted.map(
    ([name, value], index) => {

      const start = current;

      current += (value / total) * 360;

      return `${colors[index]} ${start}deg ${current}deg`;

    }
  );

  donut.style.background =
    `conic-gradient(${gradients.join(", ")})`;

  legend.innerHTML = sorted.map(
    ([name, value], index) => `

      <div class="legend-item">

        <span
          class="legend-dot"
          style="background:${colors[index]}"
        ></span>

        <span class="legend-name">
          ${escapeHtml(name)}
        </span>

        <strong>
          ${value}
        </strong>

      </div>

    `
  ).join("");

}


/* =========================================
   VOLUME BAR CHART
   ========================================= */

function renderVolumeChart(data) {

  const container =
    document.getElementById("volume-chart");

  if (!container) return;

  const volumes = {};

  data.forEach(e => {

    const name =
      String(e.machine || "Other").trim();

    const volume =
      (Number(e.sets) || 0) *
      (Number(e.reps) || 0) *
      (Number(e.weight) || 0);

    if (!name) return;

    volumes[name] =
      (volumes[name] || 0) + volume;

  });

  const sorted =
    Object.entries(volumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

  if (!sorted.length) {

    container.innerHTML =
      `<span class="muted">No volume data yet.</span>`;

    return;
  }

  const max =
    Math.max(...sorted.map(([, value]) => value));

  container.innerHTML =
    sorted.map(([name, value]) => {

      const percentage =
        max > 0
          ? (value / max) * 100
          : 0;

      return `

        <div class="volume-row">

          <div class="volume-label">
            <span>${escapeHtml(name)}</span>
            <strong>
              ${Math.round(value).toLocaleString()} kg
            </strong>
          </div>

          <div class="volume-track">

            <div
              class="volume-fill"
              style="width:${percentage}%"
            ></div>

          </div>

        </div>

      `;

    }).join("");

}


/* =========================================
   WEEKLY ACTIVITY
   ========================================= */

function renderActivityChart(data) {

  const container =
    document.getElementById("activity-chart");

  if (!container) return;

  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ];

  const counts = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0
  };

  const uniqueDays = new Set();

  data.forEach(e => {

    if (!e.date) return;

    const date = new Date(`${e.date}T00:00:00`);

    if (Number.isNaN(date.getTime())) return;

    const day =
      date.toLocaleDateString("en-US", {
        weekday: "short"
      });

    uniqueDays.add(e.date);

    if (counts[day] !== undefined) {
      counts[day]++;
    }

  });

  const max =
    Math.max(...Object.values(counts), 1);

  container.innerHTML =
    days.map(day => {

      const value = counts[day];

      const height =
        value > 0
          ? Math.max((value / max) * 100, 8)
          : 3;

      return `

        <div class="activity-column">

          <div class="activity-value">
            ${value || ""}
          </div>

          <div class="activity-bar-wrapper">

            <div
              class="activity-bar"
              style="height:${height}%"
            ></div>

          </div>

          <span>${day}</span>

        </div>

      `;

    }).join("");

}

/* =========================================
   STAT SELECTION
   ========================================= */

function setActiveStat(id) {

  document
    .querySelectorAll(".history-stat")
    .forEach(el =>
      el.classList.remove("active")
    );

  document
    .getElementById(id)
    ?.classList.add("active");
}


function clearStatSelection() {

  document
    .querySelectorAll(".history-stat")
    .forEach(el =>
      el.classList.remove("active")
    );
}


function clearFilters() {

  document.getElementById("search").value = "";
  document.getElementById("date-filter").value = "";
}


/* =========================================
   EDIT / DELETE
   ========================================= */

window.editEntry = id => {

  const e =
    entries.find(x => x.id === id);

  if (!e) return;

  location.href =
    `workout.html?edit=${encodeURIComponent(id)}`;
};


window.removeEntry = async id => {

  if (!confirm("Delete this workout entry?"))
    return;

  try {

    await deleteEntry("workouts", id);

    entries =
      entries.filter(e => e.id !== id);

    render();

    showToast("Entry deleted.");

  } catch (e) {

    showToast(e.message);

  }
};


/* =========================================
   JSON BACKUP
   ========================================= */

function exportBackup() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          {
            version: 2,
            entries
          },
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    `gym-tracker-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  a.click();

  URL.revokeObjectURL(a.href);
}


/* =========================================
   CSV EXPORT
   ========================================= */

function exportCSV() {

  const rows = filtered();

  if (!rows.length) {

    showToast("There are no entries to export.");

    return;
  }

  const headers = [
    "Date",
    "Machine",
    "Sets",
    "Reps",
    "Weight",
    "Unit",
    "Settings",
    "Notes"
  ];

  const csvRows = [
    headers,
    ...rows.map(e => [
      e.date || "",
      e.machine || "",
      e.sets ?? "",
      e.reps ?? "",
      e.weight ?? "",
      e.unit || "",
      e.settings || "",
      e.notes || ""
    ])
  ];


  const csv = csvRows
    .map(row =>
      row
        .map(value => csvEscape(value))
        .join(",")
    )
    .join("\r\n");


  /* UTF-8 BOM helps Excel display characters correctly */

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;"
    }
  );


  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `gym-tracker-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

  showToast(
    `Exported ${rows.length} entries to CSV.`
  );
}


function csvEscape(value) {

  const text =
    String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {

    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}


/* =========================================
   IMPORT
   ========================================= */

async function importBackup(e) {

  const file =
    e.target.files[0];

  if (!file) return;

  try {

    const parsed =
      JSON.parse(await file.text());

    const imported =
      Array.isArray(parsed.entries)
        ? parsed.entries
        : [];

    for (const x of imported)
      await updateOrAdd(x);

    entries =
      await listEntries("workouts");

    render();

    showToast(
      `Imported ${imported.length} entries.`
    );

  } catch (err) {

    showToast(
      "Could not read that backup."
    );
  }

  e.target.value = "";
}


async function updateOrAdd(x) {

  const id = x.id;

  if (
    id &&
    entries.some(e => e.id === id)
  ) {

    await updateEntry(
      "workouts",
      id,
      {
        ...x,
        id: undefined
      }
    );

  } else {

    const { addEntry } =
      await import("./storage.js");

    await addEntry(
      "workouts",
      {
        machine: x.machine,
        sets: x.sets ?? null,
        reps: x.reps ?? null,
        weight: x.weight ?? null,
        unit: x.unit || "kg",
        settings: x.settings || "",
        notes: x.notes || "",
        date:
          x.date ||
          new Date()
            .toISOString()
            .slice(0, 10)
      }
    );
  }
}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
}