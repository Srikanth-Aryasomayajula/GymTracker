import { auth, signOut } from "./firebase.js";

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

function getInitials(user) {
  if (!user) return "GT";

  if (user.displayName) {
    const parts = user.displayName.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return "GT";
}

function getAvatar(user) {

  if (user?.photoURL) {
    return `
      <img
        class="user-avatar-image"
        src="${user.photoURL}"
        alt="Profile"
        referrerpolicy="no-referrer"
      >
    `;
  }

  return `
    <div class="user-avatar-fallback">
      ${getInitials(user)}
    </div>
  `;
}

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

export function renderNavigation(current) {

  const desktop = NAV.map(([href, label, icon]) =>
    `
      <a
        class="nav-link ${href === current ? "active" : ""}"
        href="${href}"
      >
        <i data-lucide="${icon}"></i>
        <span>${label}</span>
      </a>
    `
  ).join("");

  const bottom = NAV.slice(0, 5).map(([href, label, icon]) =>
    `
      <a
        class="bottom-link ${href === current ? "active" : ""}"
        href="${href}"
      >
        <i data-lucide="${icon}"></i>
        <small>${label}</small>
      </a>
    `
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

      <div class="user-menu-wrapper">

        <button
          type="button"
          class="user-avatar-button"
          id="user-menu-button"
          aria-label="Open profile menu"
          aria-expanded="false"
        >
          ${getAvatar(user)}
        </button>

        <div
          class="user-dropdown"
          id="user-dropdown"
        >

          <div class="user-dropdown-header">

            <div class="user-dropdown-avatar">
              ${getAvatar(user)}
            </div>

            <div class="user-dropdown-info">

              <strong>
                ${escapeHtml(
                  user?.displayName || "Gym Tracker User"
                )}
              </strong>

              <span>
                ${escapeHtml(user?.email || "")}
              </span>

            </div>

          </div>

          <div class="dropdown-divider"></div>

          <button
            type="button"
            class="dropdown-item"
            id="profile-menu-btn"
          >
            <i data-lucide="user"></i>
            <span>Profile</span>
          </button>

          <button
            type="button"
            class="dropdown-item"
            id="switch-profile-btn"
          >
            <i data-lucide="users"></i>
            <span>Switch profile</span>
          </button>

          <div class="dropdown-divider"></div>

          <button
            type="button"
            class="dropdown-item danger"
            id="signout-menu-btn"
          >
            <i data-lucide="log-out"></i>
            <span>Sign out</span>
          </button>

        </div>

      </div>

    </header>

    <nav class="bottom-nav">
      ${bottom}
    </nav>
  `;
}


export function initNavigation() {

  const menuButton =
    document.getElementById("user-menu-button");

  const dropdown =
    document.getElementById("user-dropdown");

  if (!menuButton || !dropdown) return;

  menuButton.addEventListener("click", e => {

    e.stopPropagation();

    const open =
      dropdown.classList.toggle("show");

    menuButton.setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  document.addEventListener("click", e => {

    if (
      !dropdown.contains(e.target) &&
      !menuButton.contains(e.target)
    ) {

      dropdown.classList.remove("show");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });

  document
    .getElementById("profile-menu-btn")
    ?.addEventListener("click", () => {
      location.href = "profile.html";
    });

  document
    .getElementById("switch-profile-btn")
    ?.addEventListener("click", () => {
      location.href = "profile.html";
    });

  document
    .getElementById("signout-menu-btn")
    ?.addEventListener("click", async () => {

      try {

        await signOut(auth);

        location.href = "login.html";

      } catch (err) {

        console.error(err);

      }

    });

  // Convert <i data-lucide="..."> into actual SVG icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}