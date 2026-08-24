export async function init() {

  const content = document.getElementById("page-content");

  const data = await fetch("data/exercises.json")
    .then(r => r.json());

  let filter = "All";


  /* -------------------------------------------------------
     DETERMINE TODAY'S RECOMMENDATION
  ------------------------------------------------------- */

  const day = new Date().getDay();

  const recommendations = {
    0: {
      type: "Recovery",
      title: "Recovery & Mobility",
      description: "Light movement, stretching and recovery.",
      duration: "15–30 min",
      icon: "🧘"
    },

    1: {
      type: "Strength",
      title: "Strength Training",
      description: "Build strength with controlled resistance and bodyweight movements.",
      duration: "45–60 min",
      icon: "🏋"
    },

    2: {
      type: "Endurance",
      title: "Endurance",
      description: "Improve cardiovascular fitness with continuous movement.",
      duration: "30–45 min",
      icon: "❤️"
    },

    3: {
      type: "Strength",
      title: "Strength Training",
      description: "Focus on progressive strength and muscular development.",
      duration: "45–60 min",
      icon: "🏋"
    },

    4: {
      type: "Mobility",
      title: "Mobility & Flexibility",
      description: "Improve range of motion and movement quality.",
      duration: "20–30 min",
      icon: "🤸"
    },

    5: {
      type: "Strength",
      title: "Strength Training",
      description: "Build strength and support muscular development.",
      duration: "45–60 min",
      icon: "🏋"
    },

    6: {
      type: "Yoga",
      title: "Yoga & Recovery",
      description: "Relax, improve flexibility and recover from training.",
      duration: "20–40 min",
      icon: "🧘"
    }
  };

  const today = recommendations[day];


  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  content.innerHTML = `

    <section class="page-heading">

      <div>

        <div class="eyebrow">
          LIBRARY
        </div>

        <h1>
          Exercises
        </h1>

        <p class="muted">
          Find the right movement for your training and recovery.
        </p>

      </div>

    </section>


    <section class="exercise-layout">


      <!-- =========================================
           LEFT : TODAY
      ========================================== -->

      <aside class="exercise-recommendation card">

        <div class="eyebrow">
          TODAY
        </div>

        <div class="recommendation-icon">
          ${today.icon}
        </div>

        <div class="eyebrow">
          ${today.type}
        </div>

        <h2>
          ${today.title}
        </h2>

        <p class="muted">
          ${today.description}
        </p>

        <div class="recommendation-meta">

          <span>
            ⏱ ${today.duration}
          </span>

        </div>

        <button
          class="btn-primary full"
          id="show-today"
        >
          Show exercises
        </button>

      </aside>


      <!-- =========================================
           RIGHT : LIBRARY
      ========================================== -->

      <div class="exercise-library">

        <div class="chips category-chips">

          ${
            [
              "All",
              ...data.categories
            ]
              .map(c => `
                <button
                  class="chip ${c === "All" ? "selected" : ""}"
                  data-cat="${c}"
                >
                  ${c}
                </button>
              `)
              .join("")
          }

        </div>


        <section
          class="exercise-grid"
          id="exercise-grid"
        ></section>

      </div>

    </section>

  `;


  /* -------------------------------------------------------
     CATEGORY FILTER
  ------------------------------------------------------- */

  document
    .querySelectorAll(".category-chips .chip")
    .forEach(button => {

      button.onclick = () => {

        filter = button.dataset.cat;

        document
          .querySelectorAll(".category-chips .chip")
          .forEach(x =>
            x.classList.toggle(
              "selected",
              x === button
            )
          );

        render();

      };

    });


  /* -------------------------------------------------------
     TODAY BUTTON
  ------------------------------------------------------- */

  document
    .getElementById("show-today")
    .onclick = () => {

      filter = today.type;

      document
        .querySelectorAll(".category-chips .chip")
        .forEach(button => {

          button.classList.toggle(
            "selected",
            button.dataset.cat === today.type
          );

        });

      render();

    };


  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  function render() {

    const items = data.exercises.filter(e => {

      if (filter === "All") {
        return true;
      }

      /*
       * Match either the main category
       * or one of the exercise keywords.
       */

      if (e.category === filter) {
        return true;
      }

      if (
        Array.isArray(e.keywords) &&
        e.keywords.some(
          keyword =>
            keyword.toLowerCase() ===
            filter.toLowerCase()
        )
      ) {
        return true;
      }

      return false;

    });


    document.getElementById(
      "exercise-grid"
    ).innerHTML =

      items.length

        ? items.map(e => `

          <article class="card exercise-card">

            <div class="exercise-icon">
              ${e.icon || "●"}
            </div>

            <div class="eyebrow">
              ${e.category}
            </div>

            <h2>
              ${e.name}
            </h2>

            <p>
              ${e.description}
            </p>

            <div class="exercise-meta">

              <span>
                ${e.difficulty}
              </span>

              <span>
                ${e.muscles}
              </span>

            </div>

            ${
              e.youtube
                ? `
                  <a
                    class="btn-secondary full"
                    target="_blank"
                    rel="noopener"
                    href="${e.youtube}"
                  >
                    ▶ Watch on YouTube
                  </a>
                `
                : ""
            }

          </article>

        `).join("")

        : `

          <div class="card empty-state">

            No exercises found for this category.

          </div>

        `;

  }


  render();

}