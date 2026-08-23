export async function init() {

  document.getElementById("page-content").innerHTML = `

    <section class="contact-page">

      <section class="contact-intro">
        <div class="eyebrow">CONTACT</div>

        <h1>Let's stay in touch.</h1>

        <p class="muted">
          Have a question, suggestion or feedback?
          I'd love to hear from you.
        </p>
      </section>


      <div class="contact-grid">

        <!-- ABOUT -->

        <section class="card about-card">

          <div class="eyebrow">ABOUT ME</div>

          <h2>Hi, I'm Srikanth.</h2>

          <p>
            I created Gym Tracker as a simple way to keep track
            of workouts, progress and daily habits without making
            fitness tracking unnecessarily complicated.
          </p>

          <p>
            I'm continuously improving the app and adding features
            that make it more useful in everyday training.
          </p>

          <div class="about-links">

            <a
              href="https://www.linkedin.com/in/venkatasrikantharyasomayajula/"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-link"
            >
              <i data-lucide="linkedin"></i>
              <span>LinkedIn</span>
            </a>
			
			<a
              href="https://github.com/Srikanth-Aryasomayajula"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-link"
            >
              <i data-lucide="github"></i>
              <span>GitHub</span>
            </a>

          </div>

        </section>


        <!-- CONTACT FORM -->

        <section class="card contact-form-card">

          <div class="eyebrow">GET IN TOUCH</div>

          <h2>Send me a message.</h2>

          <form
            id="contact-form"
            action="https://formspree.io/f/xrpzvypa"
            method="POST"
          >

            <div class="field">

              <label for="contact-name">
                Name
              </label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                required
              >

            </div>


            <div class="field">

              <label for="contact-email">
                Email
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              >

            </div>


            <div class="field">

              <label for="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows="6"
                placeholder="Write your message..."
                required
              ></textarea>

            </div>


            <button
              type="submit"
              class="btn-primary contact-submit"
              id="contact-submit"
            >
              <i data-lucide="send"></i>
              Send message
            </button>

          </form>

          <p
            id="contact-status"
            class="contact-status"
          ></p>

        </section>

      </div>

    </section>
  `;

  const form = document.getElementById("contact-form");
  const submitButton = document.getElementById("contact-submit");
  const status = document.getElementById("contact-status");

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = `
      <i data-lucide="loader-circle"></i>
      Sending...
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    status.textContent = "";
    status.className = "contact-status";

    try {

      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      form.reset();

      status.textContent =
        "Thanks! Your message has been sent.";

      status.classList.add("success");

    } catch (error) {

      console.error(error);

      status.textContent =
        "Something went wrong. Please try again.";

      status.classList.add("error");

    } finally {

      submitButton.disabled = false;

      submitButton.innerHTML = `
        <i data-lucide="send"></i>
        Send message
      `;

      if (window.lucide) {
        window.lucide.createIcons();
      }

    }

  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}