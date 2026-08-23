import {
  auth, googleProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, signOut,
  onAuthStateChanged, getDoc, db, doc
} from "./firebase.js";
import { getSelectedProfileId, getProfile, getProfilesForUser, setSelectedProfileId, isAdmin } from "./storage.js";
import { renderNavigation } from "./navigation.js";

const page = document.body.dataset.page;
const app = document.getElementById("app");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.GT = { esc };

function shell(content) {
  app.innerHTML = `${renderNavigation(`${page}.html`)}<main class="page-shell">${content}</main>`;
}

function showToast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}
window.showToast = showToast;

async function routeAfterAuth(user) {
  if (page === "login") {
    const profiles = await getProfilesForUser();
    if (profiles.length === 1) {
      setSelectedProfileId(profiles[0].id);
      location.href = "index.html";
    } else {
      location.href = "profile.html";
    }
    return;
  }

  const profiles = await getProfilesForUser();
  const selected = await getProfile();
  if (!selected && profiles.length === 1) {
    setSelectedProfileId(profiles[0].id);
  }
  if (!selected && profiles.length === 0 && page !== "profile") {
    shell(`<section class="empty-state card"><div class="eyebrow">WELCOME</div><h1>Your Gym Tracker is ready.</h1><p>An admin profile needs to be assigned to your account first.</p><a class="btn-primary inline" href="profile.html">Open Profile</a></section>`);
    return;
  }

  if (page === "dashboard") {
    const mod = await import("./dashboard.js");
    await mod.init();
  } else {
    shell(`<div id="page-content"></div>`);
    const mod = await import(`./${page}.js`);
    await mod.init();
  }
}

function loginMarkup() {
  return `
  <main class="auth-page">
    <section class="auth-card">
      <div class="logo-mark">GT</div>
      <div class="eyebrow">GYM TRACKER</div>
      <h1>Train. Track. Improve.</h1>
      <p class="muted">Your workouts, progress and habits — synced across your devices.</p>

      <form id="login-form" class="stack">
        <div class="field"><label>Email</label><input id="email" type="email" autocomplete="email" required></div>
        <div class="field"><label>Password</label><input id="password" type="password" autocomplete="current-password" required></div>
        <button class="btn-primary">Sign in</button>
      </form>

      <button class="btn-secondary full" id="google-btn">Continue with Google</button>
      <button class="link-btn full" id="signup-btn">Create an account</button>
      <button class="link-btn full" id="reset-btn">Forgot password?</button>
      <p id="auth-message" class="muted center"></p>
    </section>
  </main>`;
}

async function initLogin() {
  app.innerHTML = loginMarkup();
  const msg = t => document.getElementById("auth-message").textContent = t;
  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
      location.href = "index.html";
    } catch (err) { msg(err.message.replace("Firebase: ","")); }
  });
  document.getElementById("google-btn").onclick = async () => {
    try { await signInWithPopup(auth, googleProvider); location.href="index.html"; }
    catch(err) { msg(err.message.replace("Firebase: ","")); }
  };
  document.getElementById("signup-btn").onclick = async () => {
    const e = prompt("Email address");
    const p = prompt("Choose a password (at least 6 characters)");
    if (!e || !p) return;
    try { await createUserWithEmailAndPassword(auth,e.trim(),p); location.href="profile.html"; }
    catch(err) { msg(err.message.replace("Firebase: ","")); }
  };
  document.getElementById("reset-btn").onclick = async () => {
    const e = prompt("Email address");
    if (!e) return;
    try { await sendPasswordResetEmail(auth,e.trim()); msg("Password reset email sent."); }
    catch(err) { msg(err.message.replace("Firebase: ","")); }
  };
}

onAuthStateChanged(auth, async user => {
  try {
    if (!user) {
      if (page !== "login") location.href = "login.html";
      else initLogin();
      return;
    }
    if (page === "login") {
      await routeAfterAuth(user);
      return;
    }
    await routeAfterAuth(user);
  } catch (err) {
    console.error(err);
    app.innerHTML = `<main class="page-shell"><section class="card empty-state"><h2>Something went wrong</h2><p>${esc(err.message)}</p><a class="btn-primary inline" href="index.html">Try again</a></section></main>`;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
}
