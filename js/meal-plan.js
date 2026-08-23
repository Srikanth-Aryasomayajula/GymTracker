let foods = [];

const FOODS_URL = "./data/foods.json";

/* -------------------------------------------------------
   INITIALIZE
------------------------------------------------------- */

export async function init() {

  const content = document.getElementById("page-content");

  content.innerHTML = `
    <section class="page-heading">
      <div>
        <div class="eyebrow">PLANNING</div>
        <h1>Meal Plan</h1>
        <p class="muted">
          Generate a personalized starter meal plan based on your body,
          goal, diet and daily schedule.
        </p>
      </div>
    </section>

    <section class="meal-planner-layout">

      <!-- LEFT SIDE -->
      <aside class="meal-sidebar">

        <section class="card profile-card">

          <div class="eyebrow">BODY PROFILE</div>

          <div class="form-grid">

            <div class="field">
              <label>Goal</label>
              <select id="goal">
                <option value="bulk">Build muscle</option>
                <option value="maintain">Maintain</option>
                <option value="cut">Fat loss</option>
              </select>
            </div>

            <div class="field">
              <label>Body weight (kg)</label>
              <input
                id="bodyweight"
                type="number"
                min="1"
                step="0.1"
                placeholder="70"
              >
            </div>

            <div class="field">
              <label>Height (cm)</label>
              <input
                id="height"
                type="number"
                min="50"
                step="0.1"
                placeholder="175"
              >
            </div>

            <div class="field">
              <label>Age</label>
              <input
                id="age"
                type="number"
                min="1"
                placeholder="30"
              >
            </div>

            <div class="field">
              <label>Gender</label>
              <select id="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div class="field">
              <label>Activity</label>
              <select id="activity">
                <option value="1.2">Sedentary</option>
                <option value="1.35">Light</option>
                <option value="1.55" selected>Moderate</option>
                <option value="1.725">High</option>
                <option value="1.9">Very High</option>
              </select>
            </div>

            <div class="field">
              <label>Diet</label>
              <select id="diet">
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="egg">Vegetarian + Eggs</option>
                <option value="nonveg-no-beef-pork">
                  Non-Veg — No Beef/Pork
                </option>
                <option value="nonveg-all">
                  Non-Veg — All
                </option>
              </select>
            </div>

          </div>

        </section>

        <!-- BODY STATS -->
        <section class="card body-stats">

          <div class="eyebrow">BODY STATS</div>

          <div class="mini-stat">
            <span>BMI (Body Mass Index)</span>
			<small>A quick health score that uses your height and weight to estimate if your body size falls into a healthy range</small>
            <strong id="bmi-value">—</strong>
            <small id="bmi-label">Enter your details</small>
          </div>

          <div class="mini-stat">
            <span>BMR (Basal Metabolic Rate)</span>
			<small>The minimum number of calories your body burns to perform basic, life-sustaining functions while at complete rest</small>
            <strong id="bmr-value">—</strong>
            <small>kcal/day</small>
          </div>

          <div class="mini-stat">
            <span>MAINTENANCE</span>
            <strong id="maintenance-value">—</strong>
            <small>estimated kcal/day</small>
          </div>

          <div class="mini-stat highlight-stat">
            <span>ESTIMATED DAILY TARGET</span>
            <strong id="target-value">—</strong>
            <small>kcal/day</small>
          </div>

          <div class="mini-stat">
            <span>PROTEIN TARGET</span>
            <strong id="protein-value">—</strong>
            <small>g/day</small>
          </div>

        </section>

      </aside>


      <!-- RIGHT SIDE -->
      <main class="meal-main">

        <!-- TIMINGS -->
        <section class="card">

          <div class="section-title">
            <div>
              <div class="eyebrow">DAILY SCHEDULE</div>
              <h2>Your timings</h2>
            </div>
          </div>

		  <div class="form-grid one">
			<div class="field">
				<label>Foods to avoid</label>
				<input
				  id="avoid-foods"
				  type="text"
				  placeholder="e.g. banana, paneer, peanuts"
				>
				<small class="muted">
				  Enter foods you dislike or are allergic to, separated by commas.
				</small>
			</div>
    	  </div>

          <div class="form-grid three">

            <div class="field">
              <label>Wake-up time</label>
              <input id="wake-time" type="time" value="05:00">
            </div>

            <div class="field">
              <label>Workout start</label>
              <input id="workout-start" type="time" value="06:00">
            </div>

            <div class="field">
              <label>Workout end</label>
              <input id="workout-end" type="time" value="07:00">
            </div>

            <div class="field">
              <label>Breakfast</label>
              <input id="breakfast-time" type="time" value="07:30">
            </div>

            <div class="field">
              <label>Lunch</label>
              <input id="lunch-time" type="time" value="12:30">
            </div>

            <div class="field">
              <label>Snack</label>
              <input id="snack-time" type="time" value="15:30">
            </div>

            <div class="field">
              <label>Dinner</label>
              <input id="dinner-time" type="time" value="19:00">
            </div>

            <div class="field">
              <label>Sleep</label>
              <input id="sleep-time" type="time" value="22:00">
            </div>

          </div>

          <button class="btn-primary" id="generate">
            Generate Meal Plan
          </button>

        </section>


        <!-- OUTPUT -->
        <section id="plan-output"></section>

      </main>

    </section>
  `;

  try {

    const response = await fetch(FOODS_URL);

    if (!response.ok) {
      throw new Error("Could not load foods.json");
    }

    foods = await response.json();

  } catch (error) {

    console.error(error);

    showToast("Could not load foods.json.");
    foods = [];
  }


  document
    .getElementById("generate")
    .addEventListener("click", generatePlan);


  /* Update body statistics while typing */

  [
    "bodyweight",
    "height",
    "age",
    "gender",
    "activity",
    "goal"
  ].forEach(id => {

    document
      .getElementById(id)
      .addEventListener("input", updateBodyStats);

    document
      .getElementById(id)
      .addEventListener("change", updateBodyStats);

  });

}


/* -------------------------------------------------------
   BODY CALCULATIONS
------------------------------------------------------- */

function getProfile() {

  const weight =
    Number(document.getElementById("bodyweight").value);

  const height =
    Number(document.getElementById("height").value);

  const age =
    Number(document.getElementById("age").value);

  const gender =
    document.getElementById("gender").value;

  const activity =
    Number(document.getElementById("activity").value);

  const goal =
    document.getElementById("goal").value;

  return {
    weight,
    height,
    age,
    gender,
    activity,
    goal
  };
}


function calculateStats(profile) {

  const {
    weight,
    height,
    age,
    gender,
    activity,
    goal
  } = profile;

  if (!weight || !height || !age) {
    return null;
  }

  /* BMI */

  const heightM = height / 100;

  const bmi =
    weight / (heightM * heightM);


  /* Mifflin-St Jeor */

  let bmr =
    10 * weight +
    6.25 * height -
    5 * age;

  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }


  const maintenance =
    Math.round(bmr * activity);


  let target;

  if (goal === "bulk") {
    target = maintenance + 250;
  }

  else if (goal === "cut") {
    target = maintenance - 350;
  }

  else {
    target = maintenance;
  }


  /*
    Protein target

    Bulk       = 1.8 g/kg
    Maintain   = 1.6 g/kg
    Cut        = 1.8 g/kg
  */

  let proteinMultiplier;

  if (goal === "bulk") {
    proteinMultiplier = 1.8;
  }

  else if (goal === "cut") {
    proteinMultiplier = 1.8;
  }

  else {
    proteinMultiplier = 1.6;
  }

  const protein =
    Math.round(weight * proteinMultiplier);


  return {
    bmi,
    bmr: Math.round(bmr),
    maintenance,
    target,
    protein
  };
}


/* -------------------------------------------------------
   BODY STATS DISPLAY
------------------------------------------------------- */

function updateBodyStats() {

  const profile = getProfile();

  const stats = calculateStats(profile);

  if (!stats) {
    return;
  }

  document.getElementById("bmi-value").textContent =
    stats.bmi.toFixed(1);

  document.getElementById("bmi-label").textContent =
    getBMIStatus(stats.bmi);

  document.getElementById("bmr-value").textContent =
    stats.bmr;

  document.getElementById("maintenance-value").textContent =
    stats.maintenance;

  document.getElementById("target-value").textContent =
    stats.target;

  document.getElementById("protein-value").textContent =
    `${stats.protein} g`;
}


function getBMIStatus(bmi) {

  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal range";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obesity range";
}


/* -------------------------------------------------------
   FOOD HELPERS
------------------------------------------------------- */

function findFood(name) {

  return foods.find(
    food =>
      food.name.toLowerCase() === name.toLowerCase()
  );
}


function foodCalories(food, quantity) {

  return (
    food.calories *
    quantity /
    food.baseQuantity
  );
}


function foodProtein(food, quantity) {

  return (
    food.protein *
    quantity /
    food.baseQuantity
  );
}


function foodLabel(food, quantity) {

  const rounded =
    Math.round(quantity * 10) / 10;

  return `${food.name} — ${rounded} ${food.baseUnit}`;
}


/* -------------------------------------------------------
   DIET FILTERING
------------------------------------------------------- */

const veganForbidden = [

  "Egg",
  "Egg White",
  "Milk",
  "Low Fat Milk",
  "Curd",
  "Greek Yogurt",
  "Paneer",
  "Cheese",
  "Whey Protein",
  "Ghee",
  "Butter",
  "Chicken Breast",
  "Chicken",
  "Chicken Curry",
  "Chicken Biryani",
  "Mutton",
  "Mutton Curry",
  "Fish",
  "Prawns",
  "Beef",
  "Beef Curry",
  "Pork",
  "Pork Curry"

];


const vegetarianForbidden = [

  "Chicken Breast",
  "Chicken",
  "Chicken Curry",
  "Chicken Biryani",
  "Mutton",
  "Mutton Curry",
  "Fish",
  "Prawns",
  "Beef",
  "Beef Curry",
  "Pork",
  "Pork Curry"

];


const dairyFoods = [

  "Milk",
  "Low Fat Milk",
  "Curd",
  "Greek Yogurt",
  "Paneer",
  "Cheese",
  "Whey Protein",
  "Ghee",
  "Butter"

];


const eggFoods = [

  "Egg",
  "Egg White"

];


const beefPorkFoods = [

  "Beef",
  "Beef Curry",
  "Pork",
  "Pork Curry"

];


function isFoodAllowed(food, diet) {

  const name = food.name;

  if (diet === "vegan") {

    return !veganForbidden.includes(name);

  }


  if (diet === "vegetarian") {

    return !vegetarianForbidden.includes(name);

  }


  if (diet === "egg") {

    return (
      !vegetarianForbidden.includes(name)
    );

  }


  if (diet === "nonveg-no-beef-pork") {

    return (
      !beefPorkFoods.includes(name)
    );

  }


  return true;
}


function getAvailableFoods(diet) {

  return foods.filter(
    food => isFoodAllowed(food, diet)
  );

}


/* -------------------------------------------------------
   FOOD SELECTION
------------------------------------------------------- */

function getAvoidedFoods() {

  const input =
    document.getElementById("avoid-foods").value;

  return input
    .split(",")
    .map(name => name.trim().toLowerCase())
    .filter(Boolean);

}

function chooseFood(names, diet) {

  const available =
    getAvailableFoods(diet);

  const avoided =
    getAvoidedFoods();

  for (const name of names) {

    const food =
      available.find(
        f => {

          const foodName =
            f.name.toLowerCase();

          const requestedName =
            name.toLowerCase();

          const isRequested =
            foodName === requestedName;

          const isAvoided =
            avoided.some(
              avoidedName =>
                foodName === avoidedName
            );

          return (
            isRequested &&
            !isAvoided
          );

        }
      );

    if (food) {
      return food;
    }

  }

  return null;
}


/* -------------------------------------------------------
   PORTION CREATION
------------------------------------------------------- */

function makeItem(food, quantity) {

  return {
    food,
    quantity,
    calories: foodCalories(food, quantity),
    protein: foodProtein(food, quantity)
  };

}


/* -------------------------------------------------------
   MEAL GENERATION
------------------------------------------------------- */

function createMeal(time, meal, items) {

  const validItems =
    items.filter(item => item && item.food);

  const calories =
    validItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );

  const protein =
    validItems.reduce(
      (sum, item) => sum + item.protein,
      0
    );

  return {
    time,
    meal,
    items: validItems,
    calories,
    protein
  };

}


/* -------------------------------------------------------
   MAIN PLAN GENERATOR
------------------------------------------------------- */

function buildMealPlan(stats, profile) {

  const diet =
    document.getElementById("diet").value;


  const breakfastTime =
    document.getElementById("breakfast-time").value;

  const lunchTime =
    document.getElementById("lunch-time").value;

  const snackTime =
    document.getElementById("snack-time").value;

  const dinnerTime =
    document.getElementById("dinner-time").value;

  const wakeTime =
    document.getElementById("wake-time").value;

  const workoutStart =
    document.getElementById("workout-start").value;

  const workoutEnd =
    document.getElementById("workout-end").value;

  const sleepTime =
    document.getElementById("sleep-time").value;


  const target =
    stats.target;


  /*
    Approximate calorie distribution

    Breakfast 25%
    Lunch     30%
    Snack     15%
    Dinner    30%
  */

  const breakfastTarget =
    Math.round(target * 0.25);

  const lunchTarget =
    Math.round(target * 0.30);

  const snackTarget =
    Math.round(target * 0.15);

  const dinnerTarget =
    Math.round(target * 0.30);


  const meals = [];


  /* Wake up */

  meals.push({
    time: wakeTime,
    meal: "Wake up",
    items: [],
    calories: 0,
    protein: 0,
    note: "Water"
  });


  /* Workout */

  meals.push({
    time: `${workoutStart}–${workoutEnd}`,
    meal: "Workout",
    items: [],
    calories: 0,
    protein: 0,
    note: "Training + water"
  });


  /* ---------------------------------------------------
     BREAKFAST
  --------------------------------------------------- */

  const breakfastItems = [];

  if (profile.goal === "bulk" || profile.goal === "maintain") {

    const oats =
      chooseFood(["Oats"], diet);

    if (oats) {

      breakfastItems.push(
        makeItem(
          oats,
          oats.baseQuantity
        )
      );

    }

  }


  const milk =
    chooseFood(
      ["Low Fat Milk", "Milk"],
      diet
    );

  if (milk) {

    breakfastItems.push(
      makeItem(
        milk,
        300
      )
    );

  }


  const whey =
    chooseFood(
      ["Whey Protein"],
      diet
    );

  if (whey && profile.goal !== "cut") {

    breakfastItems.push(
      makeItem(
        whey,
        30
      )
    );

  }


  const egg =
    chooseFood(
      ["Egg"],
      diet
    );

  if (egg && diet === "egg") {

    breakfastItems.push(
      makeItem(
        egg,
        2
      )
    );

  }


  const fruit =
    chooseFood(
      ["Banana", "Apple", "Orange", "Mango"],
      diet
    );

  if (fruit) {

    breakfastItems.push(
      makeItem(
        fruit,
        fruit.baseQuantity
      )
    );

  }


  const peanutButter =
    chooseFood(
      ["Peanut Butter"],
      diet
    );

  if (peanutButter && profile.goal === "bulk") {

    breakfastItems.push(
      makeItem(
        peanutButter,
        30
      )
    );

  }


  meals.push(
    createMeal(
      breakfastTime,
      "Breakfast",
      breakfastItems
    )
  );


  /* ---------------------------------------------------
     LUNCH
  --------------------------------------------------- */

  const lunchItems = [];


  const rice =
    chooseFood(
      ["Brown Rice", "Rice"],
      diet
    );

  if (rice) {

    lunchItems.push(
      makeItem(
        rice,
        200
      )
    );

  }


  let proteinFood;

  if (
    diet === "nonveg-no-beef-pork" ||
    diet === "nonveg-all"
  ) {

    proteinFood =
      chooseFood(
        [
          "Chicken Breast",
          "Chicken",
          "Fish",
          "Prawns"
        ],
        diet
      );

  }

  else if (diet === "vegan") {

    proteinFood =
      chooseFood(
        [
          "Tofu",
          "Soya Chunks",
          "Green Moong",
          "Black Chana",
          "Chickpeas"
        ],
        diet
      );

  }

  else {

    proteinFood =
      chooseFood(
        [
          "Paneer",
          "Tofu",
          "Dal",
          "Rajma",
          "Chickpeas"
        ],
        diet
      );

  }


  if (proteinFood) {

    let quantity =
      proteinFood.baseQuantity;

    if (
      proteinFood.name === "Chicken Breast" ||
      proteinFood.name === "Chicken" ||
      proteinFood.name === "Fish" ||
      proteinFood.name === "Prawns"
    ) {
      quantity = 150;
    }

    else if (
      proteinFood.name === "Paneer" ||
      proteinFood.name === "Tofu"
    ) {
      quantity = 150;
    }

    lunchItems.push(
      makeItem(
        proteinFood,
        quantity
      )
    );

  }


  const vegetables =
    chooseFood(
      [
        "Broccoli",
        "Spinach",
        "Green Beans",
        "Cauliflower",
        "Carrot"
      ],
      diet
    );

  if (vegetables) {

    lunchItems.push(
      makeItem(
        vegetables,
        150
      )
    );

  }


  const curd =
    chooseFood(
      ["Greek Yogurt", "Curd"],
      diet
    );

  if (
    curd &&
    diet !== "vegan"
  ) {

    lunchItems.push(
      makeItem(
        curd,
        100
      )
    );

  }


  meals.push(
    createMeal(
      lunchTime,
      "Lunch",
      lunchItems
    )
  );


  /* ---------------------------------------------------
     SNACK
  --------------------------------------------------- */

  const snackItems = [];


  if (whey) {

    snackItems.push(
      makeItem(
        whey,
        30
      )
    );

  }


  const snackFruit =
    chooseFood(
      [
        "Banana",
        "Apple",
        "Orange",
        "Guava",
        "Grapes"
      ],
      diet
    );

  if (snackFruit) {

    snackItems.push(
      makeItem(
        snackFruit,
        snackFruit.baseQuantity
      )
    );

  }


  const nuts =
    chooseFood(
      ["Almonds", "Cashews", "Walnuts"],
      diet
    );

  if (
    nuts &&
    profile.goal === "bulk"
  ) {

    snackItems.push(
      makeItem(
        nuts,
        30
      )
    );

  }


  meals.push(
    createMeal(
      snackTime,
      "Snack",
      snackItems
    )
  );


  /* ---------------------------------------------------
     DINNER
  --------------------------------------------------- */

  const dinnerItems = [];


  const dinnerCarb =
    chooseFood(
      ["Roti", "Chapati", "Brown Rice", "Rice"],
      diet
    );

  if (dinnerCarb) {

    if (
      dinnerCarb.name === "Roti" ||
      dinnerCarb.name === "Chapati"
    ) {

      dinnerItems.push(
        makeItem(
          dinnerCarb,
          2
        )
      );

    } else {

      dinnerItems.push(
        makeItem(
          dinnerCarb,
          150
        )
      );

    }

  }


  let dinnerProtein;


  if (
    diet === "nonveg-no-beef-pork" ||
    diet === "nonveg-all"
  ) {

    dinnerProtein =
      chooseFood(
        [
          "Fish",
          "Chicken Breast",
          "Chicken",
          "Prawns"
        ],
        diet
      );

  }

  else if (diet === "vegan") {

    dinnerProtein =
      chooseFood(
        [
          "Soya Chunks",
          "Tofu",
          "Green Moong",
          "Black Chana"
        ],
        diet
      );

  }

  else {

    dinnerProtein =
      chooseFood(
        [
          "Paneer",
          "Tofu",
          "Dal",
          "Rajma"
        ],
        diet
      );

  }


  if (dinnerProtein) {

    let quantity = 150;

    if (
      dinnerProtein.name === "Dal"
    ) {
      quantity = 200;
    }

    if (
      dinnerProtein.name === "Green Moong" ||
      dinnerProtein.name === "Black Chana"
    ) {
      quantity = 100;
    }

    dinnerItems.push(
      makeItem(
        dinnerProtein,
        quantity
      )
    );

  }


  const dinnerVegetables =
    chooseFood(
      [
        "Spinach",
        "Broccoli",
        "Cauliflower",
        "Green Beans",
        "Aloo Gobi"
      ],
      diet
    );

  if (dinnerVegetables) {

    dinnerItems.push(
      makeItem(
        dinnerVegetables,
        150
      )
    );

  }


  meals.push(
    createMeal(
      dinnerTime,
      "Dinner",
      dinnerItems
    )
  );


  /* ---------------------------------------------------
     BEFORE SLEEP
  --------------------------------------------------- */

  const sleepItems = [];


  const sleepMilk =
    chooseFood(
      ["Low Fat Milk", "Milk"],
      diet
    );

  if (sleepMilk) {

    sleepItems.push(
      makeItem(
        sleepMilk,
        250
      )
    );

  }


  meals.push(
    createMeal(
      sleepTime,
      "Before sleep",
      sleepItems
    )
  );


  /*
    Adjust calories.

    We calculate the current calories and add a flexible
    calorie source so that the plan approaches the target.
  */

  const currentCalories =
    meals.reduce(
      (sum, meal) =>
        sum + meal.calories,
      0
    );


  const calorieDifference =
    target - currentCalories;


  if (calorieDifference > 100) {

    addCalorieAdjustment(
      meals,
      calorieDifference,
      diet
    );

  }


  return meals;
}


/* -------------------------------------------------------
   CALORIE ADJUSTMENT
------------------------------------------------------- */

function addCalorieAdjustment(
  meals,
  caloriesNeeded,
  diet
) {

  /*
    We use foods already present in foods.json.

    Rice is the main adjustable carbohydrate.
    Peanut butter / nuts are useful for bulking.
  */

  let adjustmentFood;

  if (caloriesNeeded > 300) {

    adjustmentFood =
      chooseFood(
        [
          "Rice",
          "Brown Rice"
        ],
        diet
      );

  }

  else {

    adjustmentFood =
      chooseFood(
        [
          "Peanut Butter",
          "Almonds",
          "Rice",
          "Brown Rice"
        ],
        diet
      );

  }


  if (!adjustmentFood) {
    return;
  }


  let quantity =
    caloriesNeeded *
    adjustmentFood.baseQuantity /
    adjustmentFood.calories;


  /*
    Keep portions sensible.
  */

  if (
    adjustmentFood.baseUnit === "g"
  ) {

    quantity =
      Math.min(
        Math.max(quantity, 10),
        300
      );

  }

  else {

    quantity =
      Math.max(
        1,
        Math.round(quantity)
      );

  }


  const adjustmentItem =
    makeItem(
      adjustmentFood,
      quantity
    );


  /*
    Add the adjustment to lunch.

    This keeps the same time instead of creating
    another time entry.
  */

  const lunch =
    meals.find(
      meal => meal.meal === "Lunch"
    );

  if (lunch) {

    lunch.items.push(
      adjustmentItem
    );

    lunch.calories +=
      adjustmentItem.calories;

    lunch.protein +=
      adjustmentItem.protein;

  }

}


/* -------------------------------------------------------
   WATER PLAN
------------------------------------------------------- */

function createWaterPlan(profile) {

  const weight =
    profile.weight;

  /*
    Rough baseline:
    35 ml/kg body weight.
  */

  const total =
    Math.round(
      weight * 35
    );


  const wake =
    document.getElementById("wake-time").value;

  const workoutStart =
    document.getElementById("workout-start").value;

  const workoutEnd =
    document.getElementById("workout-end").value;

  const lunch =
    document.getElementById("lunch-time").value;

  const snack =
    document.getElementById("snack-time").value;

  const dinner =
    document.getElementById("dinner-time").value;

  const sleep =
    document.getElementById("sleep-time").value;


  const rows = [

    [wake, 400, "Start hydration"],

    [workoutStart, 200, "Before workout"],

    [`${workoutStart}–${workoutEnd}`, 500, "During workout"],

    [lunch, 300, "Lunch"],

    [snack, 400, "Afternoon"],

    [dinner, 300, "Dinner"],

    [sleep, 200, "Evening / before sleep"]

  ];


  const current =
    rows.reduce(
      (sum, row) => sum + row[1],
      0
    );


  /*
    Scale the amounts to the person's
    approximate body-weight requirement.
  */

  const factor =
    total / current;


  return {
    rows: rows.map(row => [
      row[0],
      Math.round(row[1] * factor / 50) * 50,
      row[2]
    ]),
    total
  };

}


/* -------------------------------------------------------
   DISPLAY MEAL TABLE
------------------------------------------------------- */

function renderPlan(meals, stats, profile) {

  const water =
    createWaterPlan(profile);


  const actualCalories =
    meals.reduce(
      (sum, meal) =>
        sum + meal.calories,
      0
    );


  const actualProtein =
    meals.reduce(
      (sum, meal) =>
        sum + meal.protein,
      0
    );


  const mealRows =
    meals.map(meal => {

      const foodText =
        meal.items.length
          ? meal.items
              .map(item =>
                foodLabel(
                  item.food,
                  item.quantity
                )
              )
              .join("<br>")
          : meal.note || "—";


      const calories =
        meal.calories > 0
          ? `${Math.round(meal.calories)} kcal`
          : "—";


      const protein =
        meal.protein > 0
          ? `${Math.round(meal.protein)} g`
          : "—";


      return `
        <tr>
          <td class="time-cell">
            ${meal.time}
          </td>

          <td class="meal-name">
            ${meal.meal}
          </td>

          <td>
            ${foodText}
          </td>

          <td>
            ${protein}
          </td>

          <td>
            ${calories}
          </td>
        </tr>
      `;

    }).join("");


  const waterRows =
    water.rows.map(row => `
      <tr>
        <td>${row[0]}</td>
        <td>${row[1]} ml</td>
        <td>${row[2]}</td>
      </tr>
    `).join("");


  document.getElementById("plan-output").innerHTML = `

    <section class="stats-grid">

      <div class="stat-card">
        <span>TARGET</span>
        <b>${stats.target}</b>
        <small>kcal/day</small>
      </div>

      <div class="stat-card">
        <span>PLAN</span>
        <b>${Math.round(actualCalories)}</b>
        <small>kcal/day</small>
      </div>

      <div class="stat-card">
        <span>PROTEIN</span>
        <b>${Math.round(actualProtein)} g</b>
        <small>target ${stats.protein} g</small>
      </div>

    </section>


    <section class="card plan-table-card">

      <div class="section-title">

        <div>
          <div class="eyebrow">DIET PLAN</div>
          <h2>Daily meal plan</h2>
        </div>

        <div class="plan-actions">

          <button
            class="btn-secondary"
            id="regenerate"
          >
            Regenerate
          </button>

          <button
            class="btn-secondary"
            id="print-plan"
          >
            Print
          </button>

        </div>

      </div>


      <div class="table-wrapper">

        <table class="diet-table">

          <thead>
            <tr>
              <th>Time</th>
              <th>Meal</th>
              <th>Food / Quantity</th>
              <th>Protein</th>
              <th>Calories</th>
            </tr>
          </thead>

          <tbody>
            ${mealRows}
          </tbody>

        </table>

      </div>

    </section>


    <section class="card water-card">

      <div class="section-title">

        <div>
          <div class="eyebrow">HYDRATION</div>
          <h2>Water plan</h2>
        </div>

        <strong>
          ~${(water.total / 1000).toFixed(1)} L/day
        </strong>

      </div>


      <div class="table-wrapper">

        <table class="diet-table">

          <thead>
            <tr>
              <th>Time</th>
              <th>Amount</th>
              <th>Purpose</th>
            </tr>
          </thead>

          <tbody>
            ${waterRows}
          </tbody>

        </table>

      </div>

    </section>


    <p class="muted disclaimer">
      Calories and protein are estimates based on the selected foods
      and calculated portions. This is a rule-based planning tool,
      not medical or dietary advice.
    </p>

  `;


  document
    .getElementById("regenerate")
    .addEventListener(
      "click",
      generatePlan
    );


  document
    .getElementById("print-plan")
    .addEventListener(
      "click",
      () => window.print()
    );

}


/* -------------------------------------------------------
   GENERATE
------------------------------------------------------- */

function generatePlan() {

  const profile =
    getProfile();


  if (
    !profile.weight ||
    !profile.height ||
    !profile.age
  ) {

    showToast(
      "Enter weight, height and age."
    );

    return;

  }


  if (!foods.length) {

    showToast(
      "foods.json could not be loaded."
    );

    return;

  }


  /* ---------------------------------------------------
     CHECK AVOIDED FOODS
  --------------------------------------------------- */

  const avoided =
    getAvoidedFoods();

  const knownFoods =
    foods.map(
      food => food.name.toLowerCase()
    );

  const unknownFoods =
    avoided.filter(
      name =>
        !knownFoods.includes(name)
    );


  if (unknownFoods.length) {

    console.warn(
      "Foods not found in foods.json:",
      unknownFoods
    );

    showToast(
      `Some foods were not found: ${unknownFoods.join(", ")}`
    );

  }


  /* ---------------------------------------------------
     CALCULATE STATS
  --------------------------------------------------- */

  const stats =
    calculateStats(profile);


  updateBodyStats();


  /* ---------------------------------------------------
     BUILD PLAN
  --------------------------------------------------- */

  const meals =
    buildMealPlan(
      stats,
      profile
    );


  /* ---------------------------------------------------
     DISPLAY
  --------------------------------------------------- */

  renderPlan(
    meals,
    stats,
    profile
  );

}