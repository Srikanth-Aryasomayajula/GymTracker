let foods = [];

/* =========================================
   INIT
   ========================================= */

export async function init() {

  const content =
    document.getElementById("page-content");

  foods =
    await fetch("data/foods.json")
      .then(r => r.json());

  content.innerHTML = `

    <section class="page-heading">

      <div>

        <div class="eyebrow">
          PLANNING
        </div>

        <h1>
          Meal Plan
        </h1>

        <p class="muted">
          Create a simple personalized meal plan based on your body,
          goal, diet and daily schedule.
        </p>

      </div>

    </section>


    <!-- =================================
         INPUTS
         ================================= -->

    <section class="card">

      <div class="form-grid three">

        <div class="field">

          <label>
            Goal
          </label>

          <select id="goal">

            <option value="bulk">
              Build muscle
            </option>

            <option value="maintain">
              Maintain
            </option>

            <option value="cut">
              Fat loss
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Body weight (kg)
          </label>

          <input
            id="bodyweight"
            type="number"
            step="0.1"
            placeholder="70"
          >

        </div>


        <div class="field">

          <label>
            Activity
          </label>

          <select id="activity">

            <option value="1.35">
              Light
            </option>

            <option value="1.55" selected>
              Moderate
            </option>

            <option value="1.75">
              High
            </option>

          </select>

        </div>

      </div>


      <div class="form-grid four">

        <div class="field">

          <label>
            Height (cm)
          </label>

          <input
            id="height"
            type="number"
            placeholder="175"
          >

        </div>


        <div class="field">

          <label>
            Age
          </label>

          <input
            id="age"
            type="number"
            placeholder="30"
          >

        </div>


        <div class="field">

          <label>
            Gender
          </label>

          <select id="gender">

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Diet
          </label>

          <select id="diet">

            <option value="vegetarian-eggs">
              Vegetarian + Eggs
            </option>

            <option value="vegetarian">
              Vegetarian
            </option>

            <option value="omnivore">
              Omnivore
            </option>

          </select>

        </div>

      </div>


      <!-- =================================
           DAILY SCHEDULE
           ================================= -->

      <div class="eyebrow" style="margin-top:24px;">
        DAILY SCHEDULE
      </div>


      <div class="form-grid three">

        <div class="field">

          <label>
            Wake-up time
          </label>

          <input
            id="wake-time"
            type="time"
            value="05:00"
          >

        </div>


        <div class="field">

          <label>
            Sleep time
          </label>

          <input
            id="sleep-time"
            type="time"
            value="22:00"
          >

        </div>


        <div class="field">

          <label>
            Lunch time
          </label>

          <input
            id="lunch-time"
            type="time"
            value="12:30"
          >

        </div>

      </div>


      <div class="form-grid three">

        <div class="field">

          <label>
            Dinner time
          </label>

          <input
            id="dinner-time"
            type="time"
            value="19:00"
          >

        </div>


        <div class="field">

          <label>
            Workout time
          </label>

          <input
            id="workout-time"
            type="time"
            value="06:00"
          >

        </div>


        <div class="field">

          <label>
            Workout duration (min)
          </label>

          <input
            id="workout-duration"
            type="number"
            value="60"
            min="0"
          >

        </div>

      </div>


      <button
        class="btn-primary"
        id="generate"
      >
        Generate Plan
      </button>

    </section>


    <!-- =================================
         PLAN OUTPUT
         ================================= -->

    <section id="plan-output"></section>

  `;


  document
    .getElementById("generate")
    .onclick = generate;

}


/* =========================================
   GENERATE PLAN
   ========================================= */

function generate() {

  const w =
    Number(
      document.getElementById("bodyweight").value
    );

  const h =
    Number(
      document.getElementById("height").value
    );

  const age =
    Number(
      document.getElementById("age").value
    );

  const activity =
    Number(
      document.getElementById("activity").value
    );

  const goal =
    document.getElementById("goal").value;

  const gender =
    document.getElementById("gender").value;

  const diet =
    document.getElementById("diet").value;

  const wakeTime =
    document.getElementById("wake-time").value;

  const sleepTime =
    document.getElementById("sleep-time").value;

  const lunchTime =
    document.getElementById("lunch-time").value;

  const dinnerTime =
    document.getElementById("dinner-time").value;

  const workoutTime =
    document.getElementById("workout-time").value;

  const workoutDuration =
    Number(
      document.getElementById("workout-duration").value
    ) || 60;


  if (!w || !h || !age) {

    showToast(
      "Enter weight, height and age."
    );

    return;
  }


  /* =================================
     BMI
     ================================= */

  const bmi =
    w / Math.pow(h / 100, 2);

  const bmiValue =
    bmi.toFixed(1);

  const bmiCategory =
    getBmiCategory(bmi);


  /* =================================
     BMR
     ================================= */

  let bmr;

  if (gender === "female") {

    bmr =
      10 * w +
      6.25 * h -
      5 * age -
      161;

  } else {

    bmr =
      10 * w +
      6.25 * h -
      5 * age +
      5;

  }


  /* =================================
     CALORIE TARGET
     ================================= */

  const maintenance =
    Math.round(
      bmr * activity
    );


  let target;

  if (goal === "bulk") {

    target =
      maintenance + 250;

  } else if (goal === "cut") {

    target =
      maintenance - 350;

  } else {

    target =
      maintenance;

  }


  /* =================================
     PROTEIN TARGET
     ================================= */

  let proteinFactor;

  if (goal === "bulk") {

    proteinFactor = 1.8;

  } else if (goal === "cut") {

    proteinFactor = 1.8;

  } else {

    proteinFactor = 1.6;

  }


  const proteinTarget =
    Math.round(
      w * proteinFactor
    );


  /* =================================
     FIND FOODS
     ================================= */

  const food = name =>
    foods.find(
      f =>
        f.name.toLowerCase() ===
        name.toLowerCase()
    );


  const banana =
    food("Banana");

  const egg =
    food("Egg");

  const milk =
    food("Milk");

  const whey =
    food("Whey Protein");

  const oats =
    food("Oats");

  const peanutButter =
    food("Peanut Butter");

  const rice =
    food("Rice");

  const dal =
    food("Dal");

  const paneer =
    food("Paneer");

  const tofu =
    food("Tofu");


  /* =================================
     BUILD MEALS
     ================================= */

  const meals =
    createMeals({
      goal,
      diet,
      target,
      proteinTarget,
      banana,
      egg,
      milk,
      whey,
      oats,
      peanutButter,
      rice,
      dal,
      paneer,
      tofu
    });


  /* =================================
     BUILD TIMETABLE
     ================================= */

  const timetable =
    createTimetable({
      wakeTime,
      sleepTime,
      lunchTime,
      dinnerTime,
      workoutTime,
      workoutDuration,
      meals
    });


  /* =================================
     OUTPUT
     ================================= */

  document
    .getElementById("plan-output")
    .innerHTML = `

      <div class="meal-plan-layout">


        <!-- =================================
             LEFT: BMI
             ================================= -->

        <aside class="meal-plan-sidebar">

          <section class="card">

            <div class="eyebrow">
              BODY METRICS
            </div>

            <h2>
              BMI
            </h2>

            <div class="bmi-value">
              ${bmiValue}
            </div>

            <strong>
              ${bmiCategory}
            </strong>

            <div class="muted">
              Weight: ${w} kg
            </div>

            <div class="muted">
              Height: ${h} cm
            </div>

            <div class="muted">
              Age: ${age}
            </div>

            <hr>

            <div class="eyebrow">
              ESTIMATES
            </div>

            <p>
              <strong>
                BMR
              </strong><br>
              ${Math.round(bmr)} kcal/day
            </p>

            <p>
              <strong>
                Maintenance
              </strong><br>
              ${maintenance} kcal/day
            </p>

            <p>
              <strong>
                Target
              </strong><br>
              ${target} kcal/day
            </p>

            <p>
              <strong>
                Protein
              </strong><br>
              ${proteinTarget} g/day
            </p>

          </section>

        </aside>


        <!-- =================================
             CENTER: PLAN
             ================================= -->

        <main class="meal-plan-main">

          <section class="card">

            <div class="eyebrow">
              DAILY TARGET
            </div>

            <h2>
              ${getGoalName(goal)}
            </h2>

            <div class="stats-grid">

              <div class="stat-card">

                <span>
                  TARGET
                </span>

                <b>
                  ${target}
                </b>

                <small>
                  kcal/day
                </small>

              </div>


              <div class="stat-card">

                <span>
                  PROTEIN
                </span>

                <b>
                  ${proteinTarget}g
                </b>

                <small>
                  per day
                </small>

              </div>


              <div class="stat-card">

                <span>
                  DIET
                </span>

                <b>
                  ${getDietName(diet)}
                </b>

                <small>
                  selected
                </small>

              </div>

            </div>

          </section>


          <section class="card">

            <div class="eyebrow">
              DIET PLAN
            </div>

            <h2>
              Daily timetable
            </h2>

            <div class="calorie-table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Time
                    </th>

                    <th>
                      Meal
                    </th>

                    <th>
                      Food
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Approx Protein
                    </th>

                    <th>
                      Approx Calories
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${timetable}

                </tbody>

              </table>

            </div>

          </section>


          <!-- =================================
               WATER
               ================================= -->

          <section class="card">

            <div class="eyebrow">
              WATER PLAN
            </div>

            <h2>
              Daily hydration
            </h2>

            <div class="calorie-table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Time
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Purpose
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td>${wakeTime}</td>
                    <td>400 ml</td>
                    <td>Start hydration</td>
                  </tr>

                  <tr>
                    <td>${workoutTime}</td>
                    <td>200 ml</td>
                    <td>Before workout</td>
                  </tr>

                  <tr>
                    <td>
                      During workout
                    </td>
                    <td>
                      400–500 ml
                    </td>
                    <td>
                      Training hydration
                    </td>
                  </tr>

                  <tr>
                    <td>
                      ${lunchTime}
                    </td>
                    <td>
                      300 ml
                    </td>
                    <td>
                      Before/during lunch
                    </td>
                  </tr>

                  <tr>
                    <td>
                      ${dinnerTime}
                    </td>
                    <td>
                      300 ml
                    </td>
                    <td>
                      Evening hydration
                    </td>
                  </tr>

                  <tr>

                    <td>
                      ${sleepTime}
                    </td>

                    <td>
                      200 ml
                    </td>

                    <td>
                      If needed
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>


          <p class="muted disclaimer">

            This is a rule-based planning estimate, not medical or
            dietary advice. Actual calorie and protein requirements
            vary between individuals.

          </p>

        </main>

      </div>

    `;

}


/* =========================================
   CREATE MEALS
   ========================================= */

function createMeals({
  goal,
  diet,
  target,
  proteinTarget,
  banana,
  egg,
  milk,
  whey,
  oats,
  peanutButter,
  rice,
  dal,
  paneer,
  tofu
}) {

  const meals = [];


  /*
   * Breakfast
   */

  const breakfast = [];

  if (oats)
    breakfast.push(
      nutritionItem(
        oats,
        80,
        "g"
      )
    );

  if (milk)
    breakfast.push(
      nutritionItem(
        milk,
        300,
        "ml"
      )
    );

  if (banana)
    breakfast.push(
      nutritionItem(
        banana,
        1,
        "piece"
      )
    );

  if (peanutButter)
    breakfast.push(
      nutritionItem(
        peanutButter,
        30,
        "g"
      )
    );

  if (diet !== "vegetarian" && egg) {

    breakfast.push(
      nutritionItem(
        egg,
        3,
        "piece"
      )
    );

  }


  meals.push({
    time: "Breakfast",
    name: "Breakfast",
    foods: breakfast
  });


  /*
   * Lunch
   */

  const lunch = [];

  if (rice)
    lunch.push(
      nutritionItem(
        rice,
        250,
        "g"
      )
    );

  if (dal)
    lunch.push(
      nutritionItem(
        dal,
        200,
        "g"
      )
    );


  /*
   * Add protein source
   */

  if (diet === "vegetarian" && tofu) {

    lunch.push(
      nutritionItem(
        tofu,
        100,
        "g"
      )
    );

  } else if (paneer) {

    lunch.push(
      nutritionItem(
        paneer,
        100,
        "g"
      )
    );

  }


  meals.push({
    time: "Lunch",
    name: "Lunch",
    foods: lunch
  });


  /*
   * Snack
   */

  const snack = [];

  if (whey)
    snack.push(
      nutritionItem(
        whey,
        30,
        "g"
      )
    );

  if (banana)
    snack.push(
      nutritionItem(
        banana,
        1,
        "piece"
      )
    );


  meals.push({
    time: "Snack",
    name: "Snack",
    foods: snack
  });


  /*
   * Dinner
   */

  const dinner = [];

  if (rice)
    dinner.push(
      nutritionItem(
        rice,
        200,
        "g"
      )
    );

  if (dal)
    dinner.push(
      nutritionItem(
        dal,
        200,
        "g"
      )
    );


  if (diet === "vegetarian" && tofu) {

    dinner.push(
      nutritionItem(
        tofu,
        150,
        "g"
      )
    );

  } else if (diet !== "vegetarian" && egg) {

    dinner.push(
      nutritionItem(
        egg,
        3,
        "piece"
      )
    );

  } else if (paneer) {

    dinner.push(
      nutritionItem(
        paneer,
        100,
        "g"
      )
    );

  }


  meals.push({
    time: "Dinner",
    name: "Dinner",
    foods: dinner
  });


  return meals;

}


/* =========================================
   CREATE TIMETABLE
   ========================================= */

function createTimetable({
  wakeTime,
  lunchTime,
  dinnerTime,
  workoutTime,
  workoutDuration,
  sleepTime,
  meals
}) {

  let html = "";


  /* Wake */

  html += tableRow(
    wakeTime,
    "Wake up",
    "Water",
    "400 ml",
    0,
    0
  );


  /* Workout */

  html += tableRow(
    workoutTime,
    "Workout",
    "Weight training + water",
    `${workoutDuration} min`,
    0,
    0
  );


  /* Post workout */

  const breakfast =
    meals.find(
      m => m.name === "Breakfast"
    );

  const breakfastTime =
    addMinutes(
      workoutTime,
      workoutDuration + 30
    );


  if (breakfast) {

    breakfast.foods.forEach(
      (item, index) => {

        html += tableRow(
          breakfastTime,
          index === 0
            ? "Breakfast"
            : "",
          item.food.name,
          formatQuantity(
            item.quantity,
            item.unit
          ),
          item.protein,
          item.calories
        );

      }
    );

  }


  /* Lunch */

  const lunch =
    meals.find(
      m => m.name === "Lunch"
    );


  if (lunch) {

    lunch.foods.forEach(
      (item, index) => {

        html += tableRow(
          lunchTime,
          index === 0
            ? "Lunch"
            : "",
          item.food.name,
          formatQuantity(
            item.quantity,
            item.unit
          ),
          item.protein,
          item.calories
        );

      }
    );

  }


  /* Snack */

  const snack =
    meals.find(
      m => m.name === "Snack"
    );


  const snackTime =
    addMinutes(
      lunchTime,
      180
    );


  if (snack) {

    snack.foods.forEach(
      (item, index) => {

        html += tableRow(
          snackTime,
          index === 0
            ? "Snack"
            : "",
          item.food.name,
          formatQuantity(
            item.quantity,
            item.unit
          ),
          item.protein,
          item.calories
        );

      }
    );

  }


  /* Dinner */

  const dinner =
    meals.find(
      m => m.name === "Dinner"
    );


  if (dinner) {

    dinner.foods.forEach(
      (item, index) => {

        html += tableRow(
          dinnerTime,
          index === 0
            ? "Dinner"
            : "",
          item.food.name,
          formatQuantity(
            item.quantity,
            item.unit
          ),
          item.protein,
          item.calories
        );

      }
    );

  }


  /* Sleep */

  html += tableRow(
    sleepTime,
    "Sleep",
    "Rest",
    "-",
    0,
    0
  );


  return html;

}


/* =========================================
   NUTRITION ITEM
   ========================================= */

function nutritionItem(
  food,
  quantity,
  unit
) {

  const conversions = {
    g: 1,
    ml: 1,
    piece: 1
  };


  const entered =
    quantity *
    (conversions[unit] || 1);


  const base =
    food.baseQuantity *
    (conversions[food.baseUnit] || 1);


  const factor =
    entered / base;


  return {

    food,

    quantity,

    unit,

    calories:
      food.calories * factor,

    protein:
      food.protein * factor

  };

}


/* =========================================
   TABLE ROW
   ========================================= */

function tableRow(
  time,
  meal,
  food,
  quantity,
  protein,
  calories
) {

  return `

    <tr>

      <td>
        ${escapeHtml(time)}
      </td>

      <td>
        ${escapeHtml(meal)}
      </td>

      <td>
        <b>
          ${escapeHtml(food)}
        </b>
      </td>

      <td>
        ${escapeHtml(quantity)}
      </td>

      <td>
        ${
          protein
            ? `~${Math.round(protein)} g`
            : "-"
        }
      </td>

      <td>
        ${
          calories
            ? `~${Math.round(calories)} kcal`
            : "-"
        }
      </td>

    </tr>

  `;

}


/* =========================================
   TIME HELPER
   ========================================= */

function addMinutes(
  time,
  minutes
) {

  if (!time)
    return "";


  const parts =
    time.split(":");


  const date =
    new Date();

  date.setHours(
    Number(parts[0]),
    Number(parts[1]),
    0,
    0
  );


  date.setMinutes(
    date.getMinutes() + minutes
  );


  return date
    .toTimeString()
    .slice(0, 5);

}


/* =========================================
   QUANTITY FORMAT
   ========================================= */

function formatQuantity(
  quantity,
  unit
) {

  if (unit === "piece") {

    return `${quantity} piece${quantity === 1 ? "" : "s"}`;

  }

  return `${quantity} ${unit}`;

}


/* =========================================
   BMI CATEGORY
   ========================================= */

function getBmiCategory(bmi) {

  if (bmi < 18.5)
    return "Underweight";

  if (bmi < 25)
    return "Normal weight";

  if (bmi < 30)
    return "Overweight";

  return "Obesity";

}


/* =========================================
   GOAL NAME
   ========================================= */

function getGoalName(goal) {

  if (goal === "bulk")
    return "Build Muscle";

  if (goal === "cut")
    return "Fat Loss";

  return "Maintain Weight";

}


/* =========================================
   DIET NAME
   ========================================= */

function getDietName(diet) {

  if (diet === "vegetarian-eggs")
    return "Veg + Eggs";

  if (diet === "vegetarian")
    return "Vegetarian";

  return "Omnivore";

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