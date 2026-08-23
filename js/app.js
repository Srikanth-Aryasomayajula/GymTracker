import {
  auth, googleProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail, signOut,
  onAuthStateChanged, getDoc, db, doc
} from "./firebase.js";
import { getSelectedProfileId, getProfile, getProfilesForUser, setSelectedProfileId, isAdmin } from "./storage.js";
import {
  renderNavigation,
  initNavigation
} from "./navigation.js";

const page = document.body.dataset.page;
const app = document.getElementById("app");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.GT = { esc };

function shell(content, profile = null) {

  app.innerHTML = `
    ${renderNavigation(`${page}.html`, profile)}
    <main class="page-shell">
      ${content}
    </main>
  `;

  initNavigation();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
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
  let selected = await getProfile();
  
  if (!selected && profiles.length === 1) {
    setSelectedProfileId(profiles[0].id);
    selected = profiles[0];
  }
  
  if (!selected && profiles.length === 0 && page !== "profile") {
    shell(`
      <section class="empty-state card">
        <div class="eyebrow">WELCOME</div>
        <h1>Your Gym Tracker is ready.</h1>
        <p>An admin has to approve your account first. Please use the contact form to make a request.</p>
        <a class="btn-primary inline" href="profile.html">Open Profile</a>
      </section>
    `);
  
    return;
  }

  shell(`<div id="page-content"></div>`, selected);

  if (page === "dashboard") {
    const mod = await import("./dashboard.js");
    await mod.init();
  } else {
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

function registerMarkup() {
  return `
    <main class="auth-page">
      <section class="auth-card">

        <div class="logo-mark">GT</div>

        <div class="eyebrow">GYM TRACKER</div>

        <h1>Create your account</h1>

        <p class="muted">
          Start tracking your workouts, progress and habits.
        </p>

        <form id="register-form" class="stack">

          <div class="field">
            <label for="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
            >
          </div>

          <div class="field">
            <label for="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="Create a password"
            >
          </div>

          <div class="field">
            <label for="register-password-confirm">
              Confirm password
            </label>

            <input
              id="register-password-confirm"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              placeholder="Repeat your password"
            >
          </div>

          <div class="password-requirements">
            <div id="password-length">
              ○ At least 6 characters
            </div>

            <div id="password-match">
              ○ Passwords match
            </div>
          </div>

          <button
            type="submit"
            class="btn-primary"
            id="register-submit"
          >
            Create account
          </button>

        </form>

        <button
          type="button"
          class="link-btn full"
          id="back-login-btn"
        >
          Already have an account? Sign in
        </button>

        <p id="register-message" class="muted center"></p>

      </section>
    </main>
  `;
}

function forgotMarkup() {
  return `
    <main class="auth-page">
      <section class="auth-card">

        <div class="logo-mark">GT</div>

        <div class="eyebrow">GYM TRACKER</div>

        <h1>Reset your password</h1>

        <p class="muted">
          Enter the email address associated with your account
          and we'll send you a password reset link.
        </p>

        <form id="forgot-form" class="stack">

          <div class="field">
            <label for="forgot-email">Email</label>

            <input
              id="forgot-email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
            >
          </div>

          <button
            type="submit"
            class="btn-primary"
            id="forgot-submit"
          >
            Send reset link
          </button>

        </form>

        <button
          type="button"
          class="link-btn full"
          id="back-login-forgot"
        >
          Back to sign in
        </button>

        <p
          id="forgot-message"
          class="muted center"
        ></p>

      </section>
    </main>
  `;
}

async function initLogin() {
  app.innerHTML = loginMarkup();
  const msg = t => document.getElementById("auth-message").textContent = t;
  
  document.getElementById("login-form").addEventListener("submit", async e => {
	e.preventDefault();
	
	const emailValue = document.getElementById("email").value.trim();
	const passwordValue = document.getElementById("password").value;
	
	msg("");
	
	try {
		await signInWithEmailAndPassword(
		auth,
		emailValue,
		passwordValue
		);
	
		location.href = "index.html";
	
	} catch (err) {

	  console.error(err);

	  if (
		err.code === "auth/invalid-credential" ||
		err.code === "auth/wrong-password" ||
		err.code === "auth/user-not-found"
	  ) {

		msg(
		  "Incorrect email or password. If you created this account with Google, please use “Continue with Google”."
		);

	  } else {

		msg(err.message.replace("Firebase: ", ""));
	  }
	}
  });
  
  document.getElementById("google-btn").onclick = async () => {
    try { await signInWithPopup(auth, googleProvider); location.href="index.html"; }
    catch(err) { msg(err.message.replace("Firebase: ","")); }
  };
  
  document.getElementById("signup-btn").onclick = () => {
	location.href = "register.html";
  };
  document.getElementById("reset-btn").onclick = () => {
    location.href = "forgot.html";
  };
}

async function initRegister() {

  app.innerHTML = registerMarkup();

  const form = document.getElementById("register-form");
  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");
  const confirm = document.getElementById("register-password-confirm");

  const lengthIndicator =
    document.getElementById("password-length");

  const matchIndicator =
    document.getElementById("password-match");

  const message =
    document.getElementById("register-message");

  const updatePasswordIndicators = () => {

    const validLength = password.value.length >= 6;
    const passwordsMatch =
      password.value.length > 0 &&
      password.value === confirm.value;

    lengthIndicator.innerHTML =
	  `${validLength ? "✓ " : "✕ "} At least 6 characters`;

	matchIndicator.innerHTML =
	  `${passwordsMatch ? "✓ " : "✕ "} Passwords match`;

	lengthIndicator.className =
	  validLength ? "valid" : "invalid";

	matchIndicator.className =
	  passwordsMatch ? "valid" : "invalid";

  };

  password.addEventListener(
    "input",
    updatePasswordIndicators
  );

  confirm.addEventListener(
    "input",
    updatePasswordIndicators
  );

  document.getElementById("back-login-btn").onclick = () => {
    location.href = "login.html";
  };

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";

    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const confirmValue = confirm.value;

    if (passwordValue.length < 6) {
      message.textContent =
        "Password must contain at least 6 characters.";
      return;
    }

    if (passwordValue !== confirmValue) {
      message.textContent =
        "Passwords do not match.";
      return;
    }

    const submitButton =
      document.getElementById("register-submit");

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    try {

      await createUserWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );

      location.href = "profile.html";

    } catch (err) {

      console.error(err);

      let text = err.message
        .replace("Firebase: ", "");

      if (err.code === "auth/email-already-in-use") {
        text = "An account with this email already exists.";
      }

      if (err.code === "auth/invalid-email") {
        text = "Please enter a valid email address.";
      }

      if (err.code === "auth/weak-password") {
        text = "That password is too weak.";
      }

      message.textContent = text;

      submitButton.disabled = false;
      submitButton.textContent = "Create account";
    }
  });
}

async function initForgot() {

  app.innerHTML = forgotMarkup();

  const form =
    document.getElementById("forgot-form");

  const email =
    document.getElementById("forgot-email");

  const submitButton =
    document.getElementById("forgot-submit");

  const message =
    document.getElementById("forgot-message");

  document
    .getElementById("back-login-forgot")
    .onclick = () => {
      location.href = "login.html";
    };

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";

    const emailValue = email.value.trim();

    if (!emailValue) {
      message.textContent =
        "Please enter your email address.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {

      await sendPasswordResetEmail(
        auth,
        emailValue
      );

      message.textContent =
        "If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.";

      email.value = "";

      submitButton.textContent =
        "Email sent";

    } catch (err) {

      console.error(err);

      let text = err.message
        .replace("Firebase: ", "");

      if (err.code === "auth/user-not-found") {
        text = "No account was found with this email address.";
      }

      if (err.code === "auth/invalid-email") {
        text = "Please enter a valid email address.";
      }

      message.textContent = text;

      submitButton.disabled = false;
      submitButton.textContent = "Send reset link";
    }
  });
}

onAuthStateChanged(auth, async user => {
  try {
    if (!user) {
	  if (page === "login") {
		initLogin();
		return;
	  }

	  if (page === "register") {
		initRegister();
		return;
	  }

	  if (page === "forgot") {
		initForgot();
		return;
	  }

	  location.href = "login.html";
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
