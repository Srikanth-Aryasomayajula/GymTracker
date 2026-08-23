import {
  addEntry,
  listEntries,
  deleteEntry,
  updateEntry,
  toNumber,
  getProfile,
  updateProfile,
  getSelectedProfileId
} from "./storage.js";

let entries = [];
let foods = [];
let dailyTarget = 2500;

const today = () =>
  new Date().toISOString().slice(0, 10);

export async function init() {

  const content =
    document.getElementById("page-content");

  foods =
    await fetch("data/foods.json")
      .then(r => r.json());

  entries =
    await listEntries("calories");
	
  const profileId = getSelectedProfileId();
  const profile = await getProfile(profileId);

  dailyTarget =
  Number(profile?.dailyCalorieTarget) || 2500;

  content.innerHTML = `

    <div class="calories-layout">

      <!-- =================================
           LEFT: STATS
           ================================= -->

      <aside class="calories-sidebar">

        <div class="sidebar-heading">
          <div class="eyebrow">OVERVIEW</div>
          <h2>Nutrition Stats</h2>
        </div>


        <button
          class="calorie-stat active"
          id="stat-calories"
        >

          <div class="calorie-stat-icon">
            <i data-lucide="flame"></i>
          </div>

          <div>
            <span>Today's Calories</span>
            <strong id="stat-calories-value">
              0
            </strong>
          </div>

        </button>


        <button
          class="calorie-stat"
          id="stat-protein"
        >

          <div class="calorie-stat-icon">
            <i data-lucide="beef"></i>
          </div>

          <div>
            <span>Today's Protein</span>
            <strong id="stat-protein-value">
              0 g
            </strong>
          </div>

        </button>


        <button
          class="calorie-stat"
          id="stat-carbs"
        >

          <div class="calorie-stat-icon">
            <i data-lucide="wheat"></i>
          </div>

          <div>
            <span>Today's Carbs</span>
            <strong id="stat-carbs-value">
              0 g
            </strong>
          </div>

        </button>


        <button
          class="calorie-stat"
          id="stat-fat"
        >

          <div class="calorie-stat-icon">
            <i data-lucide="droplets"></i>
          </div>

          <div>
            <span>Today's Fat</span>
            <strong id="stat-fat-value">
              0 g
            </strong>
          </div>

        </button>


        <button
          class="calorie-stat"
          id="stat-days"
        >

          <div class="calorie-stat-icon">
            <i data-lucide="calendar-days"></i>
          </div>

          <div>
            <span>Days Tracked</span>
            <strong id="stat-days-value">
              0
            </strong>
          </div>

        </button>


        <div class="calorie-sidebar-note">

          <i data-lucide="info"></i>

          <span>
            Select a date to view and add food for that day.
          </span>

        </div>


        <!-- EXPORT -->

        <div class="calorie-export">

          <button
            class="btn-secondary"
            id="export-csv-btn"
          >
            <i data-lucide="file-spreadsheet"></i>
            Export CSV
          </button>


          <button
            class="btn-secondary"
            id="export-json-btn"
          >
            <i data-lucide="download"></i>
            Backup JSON
          </button>


          <button
            class="btn-secondary"
            id="import-json-btn"
          >
            <i data-lucide="upload"></i>
            Import
          </button>

          <input
            hidden
            type="file"
            id="import-json-file"
            accept=".json,application/json"
          >

        </div>

      </aside>


      <!-- =================================
           MAIN
           ================================= -->

      <main class="calories-main">

        <section class="page-heading">

          <div>

            <div class="eyebrow">
              NUTRITION
            </div>

            <h1>
              Calorie Tracker
            </h1>

            <p class="muted">
              Track your daily food intake and nutrition.
            </p>

          </div>

        </section>


        <!-- =================================
             ANALYTICS
             ================================= -->

        <section class="calorie-analytics">


          <!-- DAILY CALORIES -->

          <div class="analytics-card card">

            <div class="analytics-heading">

              <div>
                <div class="eyebrow">
                  DAILY INTAKE
                </div>

                <h3>
                  Calories
                </h3>
              </div>

            </div>

            <div
              class="calorie-ring"
              id="calorie-ring"
            >

              <div class="calorie-ring-center">

                <strong id="ring-calories">
                  0
                </strong>

                <span>
                  kcal
                </span>

              </div>

            </div>

            <div class="calorie-target-text">
			  <span>Daily target:</span>
			  <strong>
				<span id="daily-target">Loading...</span>
				<button
				  type="button"
				  class="daily-target-edit"
				  id="edit-target-btn"
				>
				  Edit
				</button>
			  </strong>
			</div>

          </div>


          <!-- MACROS -->

          <div class="analytics-card card">

            <div class="analytics-heading">

              <div>
                <div class="eyebrow">
                  MACROS
                </div>

                <h3>
                  Today's split
                </h3>
              </div>

            </div>

            <div
              class="macro-chart"
              id="macro-chart"
            ></div>

          </div>


          <!-- MULTI-DAY -->

          <div class="analytics-card card">

            <div class="analytics-heading">

              <div>
                <div class="eyebrow">
                  TREND
                </div>

                <h3>
                  Recent Calories
                </h3>
              </div>

            </div>

            <div
              class="calorie-trend"
              id="calorie-trend"
            ></div>

          </div>

        </section>


        <!-- =================================
             ADD FOOD
             ================================= -->

        <section class="card calorie-input-card">

          <div class="section-head">

            <div>

              <div class="eyebrow">
                ADD FOOD
              </div>

              <h2>
                Food intake
              </h2>

            </div>

            <div class="field date-field">

              <label for="entry-date">
                Date
              </label>

              <input
                id="entry-date"
                type="date"
                value="${today()}"
              >

            </div>

          </div>


          <div class="form-grid four">

			  <div class="field">

				<label>
				  Food
				</label>

				<input
				  id="food"
				  list="food-list"
				  placeholder="e.g. banana"
				>

				<datalist id="food-list">

				  ${foods.map(f =>
					`<option value="${escapeHtml(f.name)}">`
				  ).join("")}

				</datalist>

			  </div>


			  <div class="field">

				<label>
				  Quantity
				</label>

				<input
				  id="quantity"
				  type="number"
				  step="0.1"
				  min="0"
				  value="1"
				>

			  </div>


			  <div class="field">

				<label>
				  Unit
				</label>

				<select id="food-unit">
				  <option value="">Select unit</option>
				</select>

			  </div>


			  <div class="field">

				<label>
				  Calories
				</label>

				<input
				  id="food-calories"
				  type="number"
				  step="0.1"
				  placeholder="0"
				>

			  </div>

		  </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Protein (g)
              </label>

              <input
                id="food-protein"
                type="number"
                step="0.1"
                value="0"
              >

            </div>


            <div class="field">

              <label>
                Carbs (g)
              </label>

              <input
                id="food-carbs"
                type="number"
                step="0.1"
                value="0"
              >

            </div>


            <div class="field">

              <label>
                Fat (g)
              </label>

              <input
                id="food-fat"
                type="number"
                step="0.1"
                value="0"
              >

            </div>

          </div>


          <button
            class="btn-primary"
            id="add-food"
          >
            Add Food
          </button>

        </section>


        <!-- =================================
             SELECTED DAY
             ================================= -->

        <section class="card">

          <div class="section-head">

            <div>

              <div class="eyebrow">
                DAILY LOG
              </div>

              <h2 id="selected-day-title">
                Today's Food
              </h2>

            </div>

          </div>

          <div
            id="food-list-selected"
          ></div>

        </section>


        <!-- =================================
             HISTORY TABLE
             ================================= -->

        <section class="card calorie-history-card">

          <div class="section-head">

            <div>

              <div class="eyebrow">
                HISTORY
              </div>

              <h2>
                Nutrition History
              </h2>

            </div>

            <select id="history-date-filter">

              <option value="">
                All dates
              </option>

            </select>

          </div>


          <div class="calorie-table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Food</th>
                  <th>Quantity</th>
				  <th>Unit</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th></th>
                </tr>

              </thead>

              <tbody id="calorie-tbody"></tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  `;


  /* =================================
     FOOD AUTOFILL
     ================================= */

  document
  .getElementById("food")
  .addEventListener("input", () => {

    const name =
      document
        .getElementById("food")
        .value
        .toLowerCase()
        .trim();

    const f =
      foods.find(
        x =>
          x.name.toLowerCase() === name
      );

    const unitSelect =
      document.getElementById("food-unit");

    // Reset unit options
    unitSelect.innerHTML =
      `<option value="">Select unit</option>`;

    if (!f) return;

    // Allowed units
    const units =
      f.units || ["g"];

    units.forEach(unit => {

      const option =
        document.createElement("option");

      option.value = unit;
      option.textContent = unit;

      unitSelect.appendChild(option);

    });

    // Select first available unit
    if (units.length) {
      unitSelect.value = units[0];
    }

    updateNutrition();

  });
  
  /* Recalculate when quantity changes */

  document
    .getElementById("quantity")
    .addEventListener("input", updateNutrition);
  
  
  /* Recalculate when unit changes */
  
  document
    .getElementById("food-unit")
    .addEventListener("change", updateNutrition);

  /* =================================
     DATE CHANGE
     ================================= */

  document
    .getElementById("entry-date")
    .addEventListener("change", render);


  document
    .getElementById("history-date-filter")
    .addEventListener("change", renderTable);


  /* =================================
     ADD FOOD
     ================================= */

  document
    .getElementById("add-food")
    .onclick = async () => {

      const name =
        document
          .getElementById("food")
          .value
          .trim();

      if (!name) {

        showToast("Enter a food.");

        return;
      }

      await addEntry(
        "calories",
        {
          date:
            document.getElementById("entry-date").value ||
            today(),

          food: name,

          quantity:
            toNumber(
              document.getElementById("quantity").value
            ) || 1,
			
		  unit: 
			document.getElementById("food-unit").value || "",

          calories:
            toNumber(
              document.getElementById("food-calories").value
            ) || 0,

          protein:
            toNumber(
              document.getElementById("food-protein").value
            ) || 0,

          carbs:
            toNumber(
              document.getElementById("food-carbs").value
            ) || 0,

          fat:
            toNumber(
              document.getElementById("food-fat").value
            ) || 0
        }
      );

      entries =
        await listEntries("calories");
		
	  // Reset food input fields
      document.getElementById("food").value = "";
      document.getElementById("quantity").value = "1";
	  document.getElementById("food-unit").innerHTML = `<option value="">Select unit</option>`;
      document.getElementById("food-calories").value = "";
      document.getElementById("food-protein").value = "0";
      document.getElementById("food-carbs").value = "0";
      document.getElementById("food-fat").value = "0";

      render();

      showToast("Food added.");

    };


  /* =================================
     EXPORT
     ================================= */

  document
    .getElementById("export-csv-btn")
    .onclick = exportCSV;


  document
    .getElementById("export-json-btn")
    .onclick = exportJSON;


  document
    .getElementById("import-json-btn")
    .onclick = () =>
      document
        .getElementById("import-json-file")
        .click();


  document
    .getElementById("import-json-file")
    .onchange = importJSON;


  /* =================================
     STATS
     ================================= */

  document
    .getElementById("stat-calories")
    .onclick = () => {

      selectToday();

      setActiveStat("stat-calories");

      render();

    };


  document
    .getElementById("stat-protein")
    .onclick = () => {

      selectToday();

      setActiveStat("stat-protein");

      render();

    };


  document
    .getElementById("stat-carbs")
    .onclick = () => {

      selectToday();

      setActiveStat("stat-carbs");

      render();

    };


  document
    .getElementById("stat-fat")
    .onclick = () => {

      selectToday();

      setActiveStat("stat-fat");

      render();

    };


  document
    .getElementById("stat-days")
    .onclick = () => {

      clearSelectedDate();

      setActiveStat("stat-days");

      render();

    };


  window.removeFood = async id => {

    if (!confirm("Delete this food entry?"))
      return;

    await deleteEntry("calories", id);

    entries =
      entries.filter(
        e => e.id !== id
      );

    render();

    showToast("Food deleted.");

  };


  render();

  if (window.lucide) {
    window.lucide.createIcons();
  }

}

/* =========================================
   Nutrition Calculation
   ========================================= */
function calculateNutrition(food, quantity, unit) {

  const conversions = {
    g: 1,
    ml: 1,
    piece: 1
  };

  const enteredInBase =
    quantity * conversions[unit];

  const baseAmount =
    food.baseQuantity * conversions[food.baseUnit];

  const factor =
    enteredInBase / baseAmount;

  return {
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor
  };
}

function updateNutrition() {

  const name =
    document
      .getElementById("food")
      .value
      .trim();

  const f =
    foods.find(
      x =>
        x.name.toLowerCase() ===
        name.toLowerCase()
    );

  if (!f) return;

  const quantity =
    toNumber(
      document.getElementById("quantity").value
    );

  const unit =
    document.getElementById("food-unit").value;

  if (!quantity || !unit) return;

  const nutrition =
    calculateNutrition(
      f,
      quantity,
      unit
    );

  document.getElementById("food-calories").value =
    nutrition.calories.toFixed(1);

  document.getElementById("food-protein").value =
    nutrition.protein.toFixed(1);

  document.getElementById("food-carbs").value =
    nutrition.carbs.toFixed(1);

  document.getElementById("food-fat").value =
    nutrition.fat.toFixed(1);

}

/* =========================================
   RENDER
   ========================================= */

function render() {

  const selectedDate =
    document.getElementById("entry-date").value ||
    today();

  const selected =
    entries.filter(
      e => e.date === selectedDate
    );

  const sum = key =>
    selected.reduce(
      (s, e) =>
        s + (Number(e[key]) || 0),
      0
    );


  const calories =
    sum("calories");

  const protein =
    sum("protein");

  const carbs =
    sum("carbs");

  const fat =
    sum("fat");


  /* SIDEBAR */

  document.getElementById("stat-calories-value")
    .textContent =
      Math.round(calories).toLocaleString();

  document.getElementById("stat-protein-value")
    .textContent =
      `${Math.round(protein)} g`;

  document.getElementById("stat-carbs-value")
    .textContent =
      `${Math.round(carbs)} g`;

  document.getElementById("stat-fat-value")
    .textContent =
      `${Math.round(fat)} g`;


  const trackedDays =
    new Set(
      entries
        .map(e => e.date)
        .filter(Boolean)
    ).size;

  document.getElementById("stat-days-value")
    .textContent =
      trackedDays;


  /* TITLE */

  document.getElementById("selected-day-title")
    .textContent =
      selectedDate === today()
        ? "Today's Food"
        : `Food · ${selectedDate}`;


  /* FOOD LIST */

  document.getElementById("food-list-selected")
    .innerHTML =
      selected.length

        ? selected.map(e => `

          <div class="recent-row">

            <div>

              <b>
                ${escapeHtml(e.food)}
              </b>

              <small>
			    ${e.quantity ?? 1} ${escapeHtml(e.unit || "serving")}
			    · ${Math.round(e.protein || 0)}g protein
			  </small>

            </div>

            <div class="food-row-right">

              <strong>
                ${Math.round(e.calories || 0)} kcal
              </strong>

              <button
                class="icon-btn danger"
                onclick="window.removeFood('${e.id}')"
              >
                ×
              </button>

            </div>

          </div>

        `).join("")

        : `
          <div class="empty-state">
            No food logged for this day.
          </div>
        `;


  /* ANALYTICS */

  renderCalorieRing(calories);

  renderMacroChart(
    protein,
    carbs,
    fat
  );

  renderCalorieTrend();


  /* TABLE */

  renderTable();

}


/* =========================================
   CALORIE RING
   ========================================= */

function renderCalorieRing(calories) {

  const target = dailyTarget;

  const percentage =
    Math.min(
      (calories / target) * 100,
      100
    );

  document.getElementById("ring-calories")
    .textContent =
      Math.round(calories).toLocaleString();

  document.getElementById("daily-target")
    .innerHTML = `${target.toLocaleString()} kcal`;

  document.getElementById("calorie-ring")
    .style.background =
      `conic-gradient(
        var(--accent) ${percentage * 3.6}deg,
        var(--surface-2) 0deg
      )`;
	  
  document.getElementById("edit-target-btn")
    ?.addEventListener("click", editDailyTarget);
}


/* =========================================
   MACRO CHART
   ========================================= */

function renderMacroChart(
  protein,
  carbs,
  fat
) {

  const container =
    document.getElementById("macro-chart");

  const total =
    protein + carbs + fat;

  if (!total) {

    container.innerHTML =
      `<span class="muted">
        No macro data yet.
      </span>`;

    return;
  }

  const data = [
    ["Protein", protein],
    ["Carbs", carbs],
    ["Fat", fat]
  ];

  container.innerHTML =
    data.map(([name, value]) => {

      const percent =
        (value / total) * 100;

      return `

        <div class="macro-row">

          <div class="macro-row-label">

            <span>
              ${name}
            </span>

            <strong>
              ${Math.round(value)} g
            </strong>

          </div>

          <div class="macro-track">

            <div
              class="macro-fill"
              style="width:${percent}%"
            ></div>

          </div>

        </div>

      `;

    }).join("");

}


/* =========================================
   MULTI-DAY CALORIE TREND
   ========================================= */

function renderCalorieTrend() {

  const container =
    document.getElementById("calorie-trend");

  const grouped = {};

  entries.forEach(e => {

    if (!e.date) return;

    grouped[e.date] =
      (grouped[e.date] || 0) +
      (Number(e.calories) || 0);

  });


  const dates =
    Object.keys(grouped)
      .sort()
      .slice(-7);


  if (!dates.length) {

    container.innerHTML =
      `<span class="muted">
        No history yet.
      </span>`;

    return;
  }


  const max =
    Math.max(
      ...dates.map(d => grouped[d]),
      1
    );


  container.innerHTML =
    dates.map(date => {

      const value =
        grouped[date];

      const height =
        Math.max(
          (value / max) * 100,
          4
        );

      return `

        <div class="calorie-day">

          <div class="calorie-day-value">
            ${Math.round(value)}
          </div>

          <div class="calorie-bar-wrapper">

            <div
              class="calorie-bar"
              style="height:${height}%"
            ></div>

          </div>

          <span>
            ${date.slice(5)}
          </span>

        </div>

      `;

    }).join("");

}


/* =========================================
   TABLE
   ========================================= */

function renderTable() {

  const filter =
    document.getElementById(
      "history-date-filter"
    );

  if (!filter) return;


  const dates =
    [
      ...new Set(
        entries
          .map(e => e.date)
          .filter(Boolean)
      )
    ]
    .sort()
    .reverse();


  const current =
    filter.value;


  filter.innerHTML =
    `<option value="">
      All dates
    </option>` +

    dates.map(
      d =>
        `<option value="${d}">
          ${d}
        </option>`
    ).join("");


  if (dates.includes(current))
    filter.value = current;


  const selected =
    current
      ? entries.filter(
          e => e.date === current
        )
      : entries;


  const tbody =
    document.getElementById(
      "calorie-tbody"
    );


  tbody.innerHTML =
    selected.length

      ? selected.map(e => `

        <tr>

          <td>
            ${escapeHtml(e.date)}
          </td>

          <td>
            <b>
              ${escapeHtml(e.food)}
            </b>
          </td>

          <td>
		    ${e.quantity ?? 1}
		  </td>
		  
		  <td>
		    ${escapeHtml(e.unit || "")}
		  </td>
		  
		  <td>
		    ${Math.round(e.calories || 0)}
		  </td>

          <td>
            ${Math.round(e.protein || 0)} g
          </td>

          <td>
            ${Math.round(e.carbs || 0)} g
          </td>

          <td>
            ${Math.round(e.fat || 0)} g
          </td>

          <td>

            <button
              class="danger table-delete"
              onclick="window.removeFood('${e.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `).join("")

      : `
        <tr>
          <td
            colspan="9"
            class="empty-state"
          >
            No entries found.
          </td>
        </tr>
      `;

}


/* =========================================
   DATE HELPERS
   ========================================= */

function selectToday() {

  document.getElementById("entry-date")
    .value = today();

}

function clearSelectedDate() {

  document.getElementById("entry-date")
    .value = today();

}

function setActiveStat(id) {

  document
    .querySelectorAll(".calorie-stat")
    .forEach(el =>
      el.classList.remove("active")
    );

  document
    .getElementById(id)
    ?.classList.add("active");

}

/* =========================================
   CSV EXPORT
   ========================================= */

function exportCSV() {

  if (!entries.length) {

    showToast(
      "There are no calorie entries to export."
    );

    return;
  }


  const headers = [
    "Date",
    "Food",
    "Quantity",
	"Unit",
    "Calories",
    "Protein",
    "Carbs",
    "Fat"
  ];


  const rows = [
    headers,

    ...entries.map(e => [
      e.date || "",
      e.food || "",
      e.quantity ?? "",
	  e.unit || "",
      e.calories ?? "",
      e.protein ?? "",
      e.carbs ?? "",
      e.fat ?? ""
    ])
  ];


  const csv =
    rows
      .map(row =>
        row
          .map(csvEscape)
          .join(",")
      )
      .join("\r\n");


  const blob =
    new Blob(
      ["\uFEFF" + csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `gym-tracker-calories-${today()}.csv`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);


  showToast(
    `Exported ${entries.length} calorie entries.`
  );

}


/* =========================================
   JSON BACKUP
   ========================================= */

function exportJSON() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            type: "calories",
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


  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `gym-tracker-calories-backup-${today()}.json`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

}


/* =========================================
   JSON IMPORT
   ========================================= */

async function importJSON(e) {

  const file =
    e.target.files[0];

  if (!file) return;


  try {

    const parsed =
      JSON.parse(
        await file.text()
      );

    const imported =
      Array.isArray(parsed.entries)
        ? parsed.entries
        : [];


    for (const x of imported) {

      await addEntry(
        "calories",
        {
          date:
            x.date || today(),

          food:
            x.food || "",

          quantity:
            x.quantity ?? 1,
			
		  unit:
		    x.unit || "",

          calories:
            x.calories ?? 0,

          protein:
            x.protein ?? 0,

          carbs:
            x.carbs ?? 0,

          fat:
            x.fat ?? 0
        }
      );

    }


    entries =
      await listEntries("calories");

    render();

    showToast(
      `Imported ${imported.length} entries.`
    );


  } catch (err) {

    console.error(err);

    showToast(
      "Could not read that backup."
    );

  }


  e.target.value = "";

}


/* =========================================
   CSV ESCAPE
   ========================================= */

function csvEscape(value) {

  const text =
    String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {

    return `"${text.replace(
      /"/g,
      '""'
    )}"`;

  }

  return text;

}

/* =========================================
   Edit Daily Target Function
   ========================================= */

async function editDailyTarget() {

  const input = prompt(
    "Enter your daily calorie target:",
    dailyTarget
  );

  if (input === null) return;

  const target = Number(input);

  if (!Number.isFinite(target) || target <= 0) {
    showToast("Please enter a valid calorie target.");
    return;
  }

  try {

    const profileId = getSelectedProfileId();

    if (!profileId) {
      showToast("No profile selected.");
      return;
    }

    await updateProfile(profileId, {
      dailyCalorieTarget: target
    });

    dailyTarget = target;

    render();

    showToast(
      `Daily target updated to ${target.toLocaleString()} kcal.`
    );

  } catch (err) {

    console.error(err);

    showToast(
      "Could not save your calorie target."
    );

  }
}

/* =========================================
   HTML ESCAPE
   ========================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c])
    );

}