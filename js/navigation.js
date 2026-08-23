import { auth } from "./firebase.js";

const navItems = [
  {
    page: "index",
    label: "Workout",
    icon: "dumbbell"
  },
  {
    page: "history",
    label: "History",
    icon: "bar-chart-3"
  },
  {
    page: "meditation",
    label: "Meditation",
    icon: "brain"
  },
  {
    page: "calories",
    label: "Calories",
    icon: "flame"
  },
  {
    page: "meals",
    label: "Meal Prep",
    icon: "utensils"
  }
];

function getInitials(user) {

  if (!user) return "GT";

  if (user.displayName) {

    const parts =
      user.displayName.trim().split(/\s+/);

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

export function renderNavigation(currentPage) {

  const currentFile =
    currentPage?.split("/").pop()?.replace(".html", "") || "";

  const user = auth.currentUser;

  const nav = navItems.map(item => {

    const active =
      currentFile === item.page;

    return `
      <a
        class="nav-item ${active ? "active" : ""}"
        href="${item.page}.html"
      >
        <i data-lucide="${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `;

  }).join("");

  return `
    <header class="app-topbar">

      <a href="index.html" class="app-brand">
        <div class="brand-mark">GT</div>
        <span>GYM TRACKER</span>
      </a>

      <nav class="main-navigation">
        ${nav}
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
                ${escapeHtml(user?.displayName || "Gym Tracker User")}
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

  if (window.lucide) {
    window.lucide.createIcons();
  }
}