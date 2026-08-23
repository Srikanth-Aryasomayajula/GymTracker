import { auth } from "./firebase.js";

export const NAV = [
  ["index.html", "Dashboard", "layout-dashboard"],
  ["workout.html", "Workout", "dumbbell"],
  ["history.html", "History", "bar-chart-3"],
  ["calories.html", "Calories", "flame"],
  ["meal-plan.html", "Meal Plan", "utensils"],
  ["meditation.html", "Meditation", "brain"],
  ["exercises.html", "Exercises", "dumbbell"],
  ["profile.html", "Profile", "user"]
];

export function renderNavigation(current) {

  const desktop = NAV.map(([href, label, icon]) =>
    `<a class="nav-link ${href === current ? "active" : ""}" href="${href}">
      <i data-lucide="${icon}"></i>
      <span>${label}</span>
    </a>`
  ).join("");

  const bottom = NAV.slice(0, 5).map(([href, label, icon]) =>
    `<a class="bottom-link ${href === current ? "active" : ""}" href="${href}">
      <i data-lucide="${icon}"></i>
      <small>${label}</small>
    </a>`
  ).join("");

  const user = auth.currentUser;

  return `
    <header class="topbar">

      <a class="brand" href="index.html">
        GYM <b>TRACKER</b>
      </a>

      <nav class="desktop-nav">
        ${desktop}
      </nav>

      <a class="profile-mini" href="profile.html" title="Profile">
        ${
          user?.photoURL
            ? `<img
                class="user-avatar-image"
                src="${user.photoURL}"
                alt="Profile"
                referrerpolicy="no-referrer"
              >`
            : `<i data-lucide="user"></i>`
        }
      </a>

    </header>

    <nav class="bottom-nav">
      ${bottom}
    </nav>
  `;
}