import { addEntry, listEntries } from "./storage.js";


/* -------------------------------------------------------
   TIMER STATE
------------------------------------------------------- */

let timer = null;
let remaining = 600;
let running = false;
let selectedDuration = 10;


/* -------------------------------------------------------
   SOUND STATE
------------------------------------------------------- */

let youtubePlayer = null;
let youtubeReady = false;
let customAudioURL = null;

let selectedSound = "none";
let customSoundType = "file";

/* -------------------------------------------------------
   MUSIC PLAYER STATE
------------------------------------------------------- */

let playerVisible = false;
let playerUpdateTimer = null;
let playerIsPlaying = false;
let playerMuted = false;
let playerVolume = 70;


/* -------------------------------------------------------
   SOUND DEFINITIONS
------------------------------------------------------- */

const meditationSounds = {

  none: {
    name: "No sound",
    type: "none"
  },

  om: {
    name: "Om Chanting",
    type: "youtube",
    videoId: "SBiwLibZqfw"
  },
  
  "om-soft": {
    name: "Om Chanting (Soft)",
    type: "youtube",
    videoId: "ijfLsKg8jFY"
  },

  ram: {
    name: "Ram Chanting",
    type: "youtube",
    videoId: "vrYaiUdUUPA"
  },

  "ram-soft": {
    name: "Ram Chanting (Soft)",
    type: "youtube",
    videoId: "dyc7u8V_kB8"
  },
  
  onv: {
    name: "Om Namo Venkatesaya",
    type: "youtube",
    videoId: "j7ZShX2P9ew"
  },

  nature: {
    name: "Nature Sounds",
    type: "youtube",
    videoId: "WZKW2Hq2fks"
  },

  bowls: {
    name: "Singing Bowls",
    type: "youtube",
    videoId: "-4rtl36Cz48"
  }

};


/* -------------------------------------------------------
   INLINE ICONS
------------------------------------------------------- */

const icons = {

  play: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round">
      <polygon points="8 5 19 12 8 19 8 5"></polygon>
    </svg>
  `,

  pause: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round">
      <line x1="8" y1="5" x2="8" y2="19"></line>
      <line x1="16" y1="5" x2="16" y2="19"></line>
    </svg>
  `,

  reset: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <polyline points="3 4 3 10 9 10"></polyline>
    </svg>
  `,

  mute: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round"
         stroke-linejoin="round">
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5"></polygon>
      <line x1="18" y1="9" x2="22" y2="15"></line>
      <line x1="22" y1="9" x2="18" y2="15"></line>
    </svg>
  `,

  om: `
    <span style="font-size:18px; line-height:1;">ॐ</span>
  `,

  "om-soft": `
    <span style="font-size:18px; line-height:1;">ॐ</span>
  `,

  ram: `
    <span style="font-size:13px; line-height:1;">राम</span>
  `,

  "ram-soft": `
    <span style="font-size:13px; line-height:1;">राम</span>
  `,
  
  onv: `
    <svg class="meditation-icon" viewBox="0 0 100 100" fill="none" xmlns="http://w3.org">
    <!-- Soft drop shadow effect underneath the emblem -->
    <defs>
      <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>
  
    <g filter="url(#subtle-shadow)">
      <!-- White Outer U-Shape (Thenkalai Naamam) -->
      <path d="
        M 16 13
        L 35 15
        Q 36.5 45, 39 63
        Q 42 80, 50 82
        Q 58 80, 61 63
        Q 63.5 45, 65 15
        L 84 13
        L 74.5 68
        C 70.5 86, 61 91, 50 91
        C 39 91, 29.5 86, 25.5 68
        Z
      " fill="#F4F4F6"/>
  
      <!-- Distinct Central Notch / Base Extension -->
      <path d="
        M 45.5 90.5
        Q 50 95, 54.5 90.5
        L 50 93.5
        Z
      " fill="#F4F4F6"/>
  
      <!-- Deep Red Central Flame Drop (Sri Churnam) -->
	  <path stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" d="
	    M 50 0.5
	    C 52.8 26, 56.5 52, 56.5 66
	    A 6.5 7 0 0 1 43.5 66
	    C 43.5 52, 47.2 26, 50 0.5
	    Z
	  " fill="#FF0000"/>

    </g>
  </svg>

  `,

  nature: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z"></path>
      <path d="M4 21c3-5 7-8 12-10"></path>
    </svg>
  `,

  bowls: `
    <svg class="meditation-icon" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M4 10h16"></path>
      <path d="M5 10c.5 6 3.2 9 7 9s6.5-3 7-9"></path>
      <path d="M8 7c.5-2 1.8-3 4-3s3.5 1 4 3"></path>
      <path d="M12 1v3"></path>
    </svg>
  `,

  external: `
    <svg class="sound-option-external" viewBox="0 0 24 24"
         fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M14 3h7v7"></path>
      <path d="M10 14 21 3"></path>
      <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"></path>
    </svg>
  `

};


/* -------------------------------------------------------
   SOUND OPTION HTML
------------------------------------------------------- */

function soundOption(
  value,
  name,
  icon,
  external = false
) {

  return `
    <button
      type="button"
      class="sound-option ${selectedSound === value ? "active" : ""}"
      data-sound="${value}"
    >

      <span class="sound-option-radio"></span>

      <span class="sound-option-icon">
        ${icon}
      </span>

      <span class="sound-option-name">
        ${name}
      </span>

      ${
        external
          ? icons.external
          : `<span class="sound-option-external hidden"></span>`
      }

    </button>
  `;

}

/* -------------------------------------------------------
   INITIALIZE
------------------------------------------------------- */

export async function init() {

  const content =
    document.getElementById("page-content");

  const sessions =
    await listEntries("meditations");


  content.innerHTML = `

    <section class="page-heading">

      <div>

        <div class="eyebrow">
          RECOVERY
        </div>

        <h1>
          Meditation
        </h1>

        <p class="muted">
          Slow down. Breathe. Recover.
        </p>

      </div>

    </section>


    <!-- MAIN MEDITATION CARD -->

    <section class="card meditation-card">

      <div class="meditation-layout">


        <!-- =========================================
             LEFT : TIMER
        ========================================== -->

        <div class="meditation-timer-panel">

          <div
            class="timer"
            id="timer"
          >
            10:00
          </div>


          <!-- BREATHING RINGS -->

          <div
            class="breath-ring-wrap"
            id="breath-ring-wrap"
          >

            <div
              class="breath-ring"
              id="breath-ring"
            ></div>

          </div>


          <!-- TIMER ACTIONS -->

          <div class="timer-actions">

            <button
              class="btn-primary"
              id="start"
            >
              ${icons.play}
              <span>Start</span>
            </button>

            <button
              class="btn-secondary"
              id="reset"
            >
              ${icons.reset}
              <span>Reset</span>
            </button>

          </div>


          <!-- DURATIONS -->

          <div class="duration-section">

            <div class="meditation-section-label">
              Duration
            </div>

            <div class="duration-buttons">

              <button
                class="chip"
                data-min="2"
              >
                2 min
              </button>

              <button
                class="chip"
                data-min="5"
              >
                5 min
              </button>

              <button
                class="chip active"
                data-min="10"
              >
                10 min
              </button>

              <button
                class="chip"
                data-min="15"
              >
                15 min
              </button>

              <button
                class="chip"
                data-min="20"
              >
                20 min
              </button>

              <button
                class="chip"
                id="custom-duration-button"
              >
                Custom
              </button>

            </div>


            <!-- CUSTOM DURATION -->

            <div
              class="custom-duration hidden"
              id="custom-duration"
            >

              <div class="custom-duration-title">
                <b>Custom meditation duration</b>
              </div>

              <div class="custom-duration-fields">

                <div class="field">

                  <label for="custom-hours">
                    Hours
                  </label>

                  <input
                    id="custom-hours"
                    type="number"
                    min="0"
                    max="23"
                    value="0"
                  >

                </div>


                <div class="field">

                  <label for="custom-minutes">
                    Minutes
                  </label>

                  <input
                    id="custom-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value="30"
                  >

                </div>
				
				<div class="field">

                  <label for="custom-seconds">
                    Seconds
                  </label>

                  <input
                    id="custom-seconds"
                    type="number"
                    min="0"
                    max="59"
                    value="30"
                  >

                </div>

              </div>
			  <small class="muted custom-duration-note">
					Maximum meditation duration: 24 hours
			  </small>

            </div>

          </div>

        </div>


        <!-- =========================================
             RIGHT : SOUND
        ========================================== -->

        <div class="meditation-sound">

          <div class="sound-panel-title">

            <label>
              Sounds
            </label>

          </div>

		  <!-- MUSIC PLAYER -->

		  <div
		  class="meditation-player hidden"
		  id="meditation-player"
		  >
		  
		  <div class="meditation-player-top">
		  
		  	<div class="meditation-player-title">
		  	<span class="sound-dot"></span>
		  
		  	<span id="player-sound-name">
		  		Meditation Sounds
		  	</span>
		  	</div>
		  
		  	<span
		  	class="meditation-player-time"
		  	id="player-time"
		  	>
		  	0:00 / 0:00
		  	</span>
		  
		  </div>
		  
		  
		  <!-- PROGRESS -->
		  
		  <input
		  	type="range"
		  	id="player-progress"
		  	class="meditation-player-progress"
		  	min="0"
		  	max="100"
		  	value="0"
		  >
		  
		  
		  <!-- CONTROLS -->
		  
		  <div class="meditation-player-controls">
		  
		  	<button
		  	type="button"
		  	class="player-control"
		  	id="player-rewind"
		  	title="Rewind 10 seconds"
		  	>
		  	<span data-lucide="rotate-ccw"></span>
		  	<small>10</small>
		  	</button>
		  
		  
		  	<button
		  	type="button"
		  	class="player-control player-main-control"
		  	id="player-play"
		  	title="Play"
		  	>
		  	<span data-lucide="pause"></span>
		  	</button>
		  
		  
		  	<button
		  	type="button"
		  	class="player-control"
		  	id="player-forward"
		  	title="Forward 10 seconds"
		  	>
		  	<span data-lucide="rotate-cw"></span>
		  	<small>10</small>
		  	</button>
		  
		  
		  	<button
		  	type="button"
		  	class="player-control"
		  	id="player-mute"
		  	title="Mute"
		  	>
		  	<span data-lucide="volume-2"></span>
		  	</button>
		  
		  
		  	<input
		  	type="range"
		  	id="player-volume"
		  	class="meditation-player-volume"
		  	min="0"
		  	max="100"
		  	value="70"
		  	title="Volume"
		  	>
		  
		  </div> <!-- meditation-player-controls -->

		</div> <!-- meditation-player -->

          <div class="sound-options">

            ${soundOption(
              "none",
              "No sound",
              icons.mute
            )}

            ${soundOption(
              "om",
              "Om Chanting",
              icons.om,
              true
            )}
			
			${soundOption(
              "om-soft",
              "Om Chanting (Soft)",
              icons.om,
              true
            )}

            ${soundOption(
              "ram",
              "Ram Chanting",
              icons.ram,
              true
            )}
			
			${soundOption(
              "ram-soft",
              "Ram Chanting (Soft)",
              icons.ram,
              true
            )}
			
			${soundOption(
              "onv",
              "Om Namo Venkatesaya",
              icons.onv,
              true
            )}

            ${soundOption(
              "bowls",
              "Singing Bowls",
              icons.bowls,
              true
            )}

            ${soundOption(
              "nature",
              "Nature Sounds",
              icons.nature,
              true
            )}

            ${soundOption(
              "custom",
              "Custom Sound",
              "♫"
            )}

          </div>

          <small
            class="muted sound-description"
            id="sound-description"
          >
            Silence during your meditation.
          </small>


          <!-- CUSTOM SOUND -->

          <div
            class="custom-sound hidden"
            id="custom-sound"
          >
			

            <div class="sound-option-tabs">

              <button
                type="button"
                class="chip active"
                id="custom-file-tab"
              >
                Upload file
              </button>

			  <button
                type="button"
                class="chip"
                id="custom-youtube-tab"
              >
                YouTube
              </button>

            </div>


            <!-- FILE -->

            <div
              class="custom-sound-field"
              id="custom-file-field"
            >

			  <label for="custom-sound-file">
                Audio file
              </label>

			  <small class="muted custom-sound-instruction">
                Select your audio source and press Start
              </small>

              <input
                id="custom-sound-file"
                type="file"
                accept="audio/*"
              >

            </div>


            <!-- YOUTUBE -->

            <div
              class="custom-sound-field hidden"
              id="custom-youtube-field"
            >

              <label for="custom-youtube-url">
                YouTube URL
              </label>

			  <small class="muted custom-sound-instruction">
                Paste your YouTube URL and press Start
              </small>

              <input
                id="custom-youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
              >

              <small class="muted custom-sound-note">
                The YouTube video will be used only as the meditation
                audio source.
              </small>

            </div>

          </div>


          <!-- SOUND STATUS -->

          <div
            class="sound-status muted"
            id="sound-status"
          >

            <span class="sound-dot"></span>

            <span id="sound-status-text">
              No sound
            </span>

          </div>
		  
		  </div>

        </div>


      </div>


      <!-- HIDDEN YOUTUBE PLAYER -->

      <div id="meditation-youtube-player"></div>


      <!-- HIDDEN AUDIO -->

      <audio
        id="meditation-audio"
        preload="auto"
      ></audio>

    </section>


    <!-- HISTORY -->

    <section class="section-head meditation-history">

      <div>

        <div class="eyebrow">
          HISTORY
        </div>

        <h2>
          Sessions
        </h2>

      </div>

      <span class="muted">
        ${sessions.length} completed
      </span>

    </section>


    <section class="card">

      ${
        sessions
          .slice(0, 20)
          .map(
            s => `
              <div class="recent-row">

                <div>

                  <b>
                    ${s.duration} minute meditation
                  </b>

                  <small>
                    ${s.date}
                  </small>

                </div>

                <span>
                  ✓
                </span>

              </div>
            `
          )
          .join("")
        ||
        `<div class="empty-state">
          No sessions yet.
        </div>`
      }

    </section>

  `;


  /* ---------------------------------------------------
     TIMER BUTTONS
  --------------------------------------------------- */

  document
    .querySelectorAll(".duration-buttons .chip[data-min]")
    .forEach(button => {

      button.onclick = () => {

        if (running) {
          return;
        }

        selectedDuration =
          Number(button.dataset.min);

        remaining =
          selectedDuration * 60;

        document
          .querySelectorAll(".duration-buttons .chip")
          .forEach(b =>
            b.classList.remove("active")
          );

        button.classList.add("active");

        document
          .getElementById("custom-duration")
          .classList.add("hidden");

        update();

      };

    });


  /* ---------------------------------------------------
     CUSTOM DURATION BUTTON
  --------------------------------------------------- */

  document
    .getElementById("custom-duration-button")
    .onclick = () => {

      if (running) {
        return;
      }

      const custom =
        document.getElementById(
          "custom-duration"
        );

      custom.classList.toggle("hidden");

      document
        .querySelectorAll(".duration-buttons .chip")
        .forEach(b =>
          b.classList.remove("active")
        );

    };


  /* ---------------------------------------------------
     CUSTOM DURATION INPUT
  --------------------------------------------------- */

  [
    "custom-hours",
    "custom-minutes",
	"custom-seconds"
  ].forEach(id => {

    document
      .getElementById(id)
      .addEventListener(
        "input",
        applyCustomDuration
      );

  });


  /* ---------------------------------------------------
     TIMER ACTIONS
  --------------------------------------------------- */

  document
    .getElementById("start")
    .onclick = toggle;


  document
    .getElementById("reset")
    .onclick = resetTimer;


  /* ---------------------------------------------------
     SOUND OPTIONS
  --------------------------------------------------- */

  document
    .querySelectorAll(".sound-option")
    .forEach(option => {

      option.onclick = () => {

        const sound =
          option.dataset.sound;

        selectSound(sound);

      };

    });


  /* ---------------------------------------------------
     CUSTOM SOUND TABS
  --------------------------------------------------- */

  document
    .getElementById("custom-file-tab")
    .onclick = () => {

      customSoundType = "file";

      document
        .getElementById("custom-file-tab")
        .classList.add("active");

      document
        .getElementById("custom-youtube-tab")
        .classList.remove("active");

      document
        .getElementById("custom-file-field")
        .classList.remove("hidden");

      document
        .getElementById("custom-youtube-field")
        .classList.add("hidden");

    };


  document
    .getElementById("custom-youtube-tab")
    .onclick = () => {

      customSoundType = "youtube";

      document
        .getElementById("custom-youtube-tab")
        .classList.add("active");

      document
        .getElementById("custom-file-tab")
        .classList.remove("active");

      document
        .getElementById("custom-youtube-field")
        .classList.remove("hidden");

      document
        .getElementById("custom-file-field")
        .classList.add("hidden");

    };


  document
    .getElementById("custom-sound-file")
    .onchange = handleCustomFile;


  /* ---------------------------------------------------
     MUSIC PLAYER
  --------------------------------------------------- */
  
  document
    .getElementById("player-play")
    .onclick = togglePlayerPlayback;
  
  
  document
    .getElementById("player-rewind")
    .onclick = () => seekSound(-10);
  
  
  document
    .getElementById("player-forward")
    .onclick = () => seekSound(10);
  
  
  document
    .getElementById("player-mute")
    .onclick = toggleMute;
  
  
  document
    .getElementById("player-volume")
    .oninput = event => {
  
      setSoundVolume(
        Number(event.target.value)
      );
  
    };
  
  
  document
    .getElementById("player-progress")
    .oninput = event => {
  
      seekToPercent(
        Number(event.target.value)
      );
  
    };

  update();

}


/* -------------------------------------------------------
   SELECT SOUND
------------------------------------------------------- */

function selectSound(sound) {

  selectedSound = sound;


  document
    .querySelectorAll(".sound-option")
    .forEach(option => {

      option.classList.toggle(
        "active",
        option.dataset.sound === sound
      );

    });


  const customSound =
    document.getElementById(
      "custom-sound"
    );


  const description =
    document.getElementById(
      "sound-description"
    );


  if (sound === "custom") {

    customSound.classList.remove("hidden");

    description.textContent =
      "Use your own audio file or YouTube sound.";

    updateSoundStatus(
      "Custom sound selected",
      true
    );

    return;

  }


  customSound.classList.add("hidden");

  stopSound();


  const soundDefinition =
    meditationSounds[sound];


  if (
    !soundDefinition ||
    soundDefinition.type === "none"
  ) {

    description.textContent =
      "Silence during your meditation.";

    updateSoundStatus(
      "No sound",
      false
    );

  }

  else {

    description.textContent =
      `${soundDefinition.name} will play during meditation.`;

    updateSoundStatus(
      soundDefinition.name,
      true
    );

  }

}


/* -------------------------------------------------------
   CUSTOM DURATION
------------------------------------------------------- */

function applyCustomDuration() {

  let hours =
    Number(
      document.getElementById(
        "custom-hours"
      ).value
    ) || 0;

  let minutes =
    Number(
      document.getElementById(
        "custom-minutes"
      ).value
    ) || 0;

  let seconds =
    Number(
      document.getElementById(
        "custom-seconds"
      ).value
    ) || 0;


  /* Keep values within valid ranges */

  hours = Math.max(0, Math.min(24, hours));
  minutes = Math.max(0, Math.min(59, minutes));
  seconds = Math.max(0, Math.min(59, seconds));


  /* 24 hours maximum */

  let totalSeconds =
    hours * 3600 +
    minutes * 60 +
    seconds;


  if (totalSeconds > 86400) {

    totalSeconds = 86400;

    hours = 24;
    minutes = 0;
    seconds = 0;

  }


  /* Update input values */

  document.getElementById(
    "custom-hours"
  ).value = hours;

  document.getElementById(
    "custom-minutes"
  ).value = minutes;

  document.getElementById(
    "custom-seconds"
  ).value = seconds;


  if (totalSeconds <= 0) {
    return;
  }


  selectedDuration =
    totalSeconds / 60;

  remaining =
    totalSeconds;

  update();

}


/* -------------------------------------------------------
   TIMER DISPLAY
------------------------------------------------------- */

function update() {

  const hours =
    Math.floor(
      remaining / 3600
    );

  const minutes =
    Math.floor(
      (remaining % 3600) / 60
    );

  const seconds =
    remaining % 60;


  let display;


  if (hours > 0) {

    display =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

  }

  else {

    display =
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

  }


  document
    .getElementById("timer")
    .textContent = display;

}


/* -------------------------------------------------------
   STOP
------------------------------------------------------- */

function stop() {

  clearInterval(timer);

  timer = null;

  running = false;

  const button =
    document.getElementById("start");


  button.innerHTML =
    `${icons.play}<span>Start</span>`;

}


/* -------------------------------------------------------
   RESET
------------------------------------------------------- */

function resetTimer() {

  stop();

  stopSound();


  const customButton =
    document.getElementById(
      "custom-duration-button"
    );


  const customDuration =
    document.getElementById(
      "custom-duration"
    );


  if (
    !customDuration.classList.contains(
      "hidden"
    )
  ) {

    applyCustomDuration();

  }

  else {

    remaining =
      selectedDuration * 60;

  }


  update();

}


/* -------------------------------------------------------
   START / PAUSE
------------------------------------------------------- */

async function toggle() {

  const button =
    document.getElementById("start");


  if (running) {

    stop();

    pauseSound();

    return;

  }


  if (remaining <= 0) {

    remaining =
      selectedDuration * 60;

    update();

  }


  /*
    Start sound inside the click event.
    This is important because browsers generally
    block autoplay without user interaction.
  */

  await startSound();


  running = true;


  button.innerHTML =
    `${icons.pause}<span>Pause</span>`;


  timer =
    setInterval(
      async () => {

        remaining--;

        update();


        if (remaining <= 0) {

          stop();

          stopSound();

          await completeMeditation();

        }

      },
      1000
    );

}


/* -------------------------------------------------------
   COMPLETE MEDITATION
------------------------------------------------------- */

async function completeMeditation() {

  const duration =
    Math.round(selectedDuration);


  await addEntry(
    "meditations",
    {
      date:
        new Date()
          .toISOString()
          .slice(0, 10),

      duration
    }
  );


  showToast(
    "Meditation complete."
  );

}


/* -------------------------------------------------------
   CUSTOM FILE
------------------------------------------------------- */

function handleCustomFile(event) {

  const file =
    event.target.files[0];


  if (!file) {
    return;
  }


  if (customAudioURL) {

    URL.revokeObjectURL(
      customAudioURL
    );

  }


  customAudioURL =
    URL.createObjectURL(file);


  const audio =
    document.getElementById(
      "meditation-audio"
    );


  audio.src =
    customAudioURL;

  audio.loop = true;


  updateSoundStatus(
    file.name,
    true
  );

}


/* -------------------------------------------------------
   START SOUND
------------------------------------------------------- */

async function startSound() {

  if (selectedSound === "none") {

    updateSoundStatus(
      "No sound",
      false
    );

    return;

  }


  /* ---------------------------------------------
     PREDEFINED YOUTUBE SOUND
  --------------------------------------------- */

  if (
    meditationSounds[selectedSound] &&
    meditationSounds[selectedSound].type === "youtube"
  ) {

    const sound =
      meditationSounds[selectedSound];


    if (
      !sound.videoId ||
      sound.videoId.startsWith("YOUR_")
    ) {

      showToast(
        "Add the YouTube video ID for this sound."
      );

      return;

    }


    await playYouTubeSound(
      sound.videoId
    );

    return;

  }


  /* ---------------------------------------------
     CUSTOM SOUND
  --------------------------------------------- */

  if (selectedSound === "custom") {

    if (customSoundType === "file") {

      const audio =
        document.getElementById(
          "meditation-audio"
        );


      if (!audio.src) {

        showToast(
          "Please select an audio file first."
        );

        return;

      }


      try {

		await audio.play();
		
		playerIsPlaying = true;
		
		showPlayer();
		
		updatePlayerButton();
		
		updateSoundStatus(
			"Playing custom audio",
			true
		);
		
	  }

      catch (error) {

        console.error(error);

        showToast(
          "Could not play the audio file."
        );

      }

      return;

    }


    if (customSoundType === "youtube") {

      const url =
        document.getElementById(
          "custom-youtube-url"
        ).value.trim();


      const videoId =
        getYouTubeVideoId(url);


      if (!videoId) {

        showToast(
          "Please enter a valid YouTube URL."
        );

        return;

      }


      await playYouTubeSound(
        videoId
      );

    }

  }

}


/* -------------------------------------------------------
   YOUTUBE PLAYER
------------------------------------------------------- */

function loadYouTubeAPI() {

  return new Promise(resolve => {

    if (
      window.YT &&
      window.YT.Player
    ) {

      resolve();

      return;

    }


    const existing =
      document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );


    if (!existing) {

      const script =
        document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      document.head.appendChild(script);

    }


    const previousCallback =
      window.onYouTubeIframeAPIReady;


    window.onYouTubeIframeAPIReady =
      () => {

        if (previousCallback) {
          previousCallback();
        }

        resolve();

      };

  });

}


/* -------------------------------------------------------
   PLAY YOUTUBE
------------------------------------------------------- */

async function playYouTubeSound(videoId) {

  await loadYouTubeAPI();


  return new Promise(resolve => {

    if (!youtubePlayer) {

      youtubePlayer =
        new YT.Player(
          "meditation-youtube-player",
          {

            height: "1",
            width: "1",

            videoId,

            playerVars: {

              autoplay: 1,

              controls: 0,

              modestbranding: 1,

              rel: 0,

              playsinline: 1,

              enablejsapi: 1

            },

            events: {

              onReady: event => {

				youtubeReady = true;
				
				event.target.setVolume(
					playerVolume
				);
				
				event.target.unMute();
				
				event.target.playVideo();
				
				playerIsPlaying = true;
				
				showPlayer();
				
				updatePlayerButton();
				
				updateSoundStatus(
					getCurrentSoundName(),
					true
				);
				
				resolve();
				
			  },

              onStateChange: event => {

				if (
					event.data ===
					YT.PlayerState.PLAYING
				) {
				
					playerIsPlaying = true;
				
					updatePlayerButton();
				
				}
				
				
				if (
					event.data ===
					YT.PlayerState.PAUSED
				) {
				
					playerIsPlaying = false;
				
					updatePlayerButton();
				
				}
				
				
				if (
					event.data ===
					YT.PlayerState.ENDED
				) {
				
					event.target.playVideo();
				
				}
				
			  }

            }

          }
        );

    }

    else {

      youtubePlayer.loadVideoById(
        videoId
      );

      youtubePlayer.setVolume(
		playerVolume
		);
		
		youtubePlayer.unMute();
		
		youtubePlayer.playVideo();
		
		youtubeReady = true;
		
		playerIsPlaying = true;
		
		showPlayer();
		
		updatePlayerButton();
		
		updateSoundStatus(
		getCurrentSoundName(),
		true
	  );

      resolve();

    }

  });

}


/* -------------------------------------------------------
   PAUSE SOUND
------------------------------------------------------- */

function pauseSound() {

  const audio =
    document.getElementById(
      "meditation-audio"
    );


  if (audio) {
    audio.pause();
  }


  if (
    youtubePlayer &&
    youtubeReady
  ) {

    youtubePlayer.pauseVideo();

  }


  playerIsPlaying = false;

  updatePlayerButton();

}


/* -------------------------------------------------------
   STOP SOUND
------------------------------------------------------- */

function stopSound() {

  const audio =
    document.getElementById(
      "meditation-audio"
    );


  if (audio) {

    audio.pause();

    audio.currentTime = 0;

  }


  if (
    youtubePlayer &&
    youtubeReady
  ) {

    youtubePlayer.stopVideo();

  }


  playerIsPlaying = false;

  hidePlayer();

  updateSoundStatus(
    getCurrentSoundName(),
    selectedSound !== "none"
  );

}

/* -------------------------------------------------------
   SOUND STATUS
------------------------------------------------------- */

function updateSoundStatus(
  text,
  active
) {

  const status =
    document.getElementById(
      "sound-status"
    );

  const statusText =
    document.getElementById(
      "sound-status-text"
    );


  if (!status || !statusText) {
    return;
  }


  statusText.textContent =
    text;


  if (active) {

    status.classList.remove(
      "muted"
    );

  }

  else {

    status.classList.add(
      "muted"
    );

  }

}


/* -------------------------------------------------------
   CURRENT SOUND NAME
------------------------------------------------------- */

function getCurrentSoundName() {

  if (selectedSound === "none") {
    return "No sound";
  }


  if (selectedSound === "custom") {

    if (customSoundType === "file") {

      const file =
        document.getElementById(
          "custom-sound-file"
        )?.files?.[0];


      return file
        ? file.name
        : "Custom audio";

    }


    return "Custom YouTube audio";

  }


  return (
    meditationSounds[selectedSound]?.name ||
    "Meditation sound"
  );

}

/* -------------------------------------------------------
   SHOW PLAYER
------------------------------------------------------- */

function showPlayer() {

  const player =
    document.getElementById(
      "meditation-player"
    );

  if (!player) {
    return;
  }

  player.classList.remove("hidden");

  playerVisible = true;

  updatePlayerSoundName();

  startPlayerUpdates();

}


/* -------------------------------------------------------
   HIDE PLAYER
------------------------------------------------------- */

function hidePlayer() {

  const player =
    document.getElementById(
      "meditation-player"
    );

  if (!player) {
    return;
  }

  player.classList.add("hidden");

  playerVisible = false;

  stopPlayerUpdates();

}


/* -------------------------------------------------------
   PLAYER SOUND NAME
------------------------------------------------------- */

function updatePlayerSoundName() {

  const element =
    document.getElementById(
      "player-sound-name"
    );

  if (!element) {
    return;
  }

  element.textContent =
    getCurrentSoundName();

}


/* -------------------------------------------------------
   PLAYER PLAY / PAUSE
------------------------------------------------------- */

function togglePlayerPlayback() {

  if (selectedSound === "none") {
    return;
  }


  const audio =
    document.getElementById(
      "meditation-audio"
    );


  /* Custom audio file */

  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (!audio || !audio.src) {
      return;
    }

    if (audio.paused) {

      audio.play();

      playerIsPlaying = true;

    }

    else {

      audio.pause();

      playerIsPlaying = false;

    }

    updatePlayerButton();

    return;

  }


  /* YouTube */

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    const state =
      youtubePlayer.getPlayerState();


    if (
      state === YT.PlayerState.PLAYING
    ) {

      youtubePlayer.pauseVideo();

      playerIsPlaying = false;

    }

    else {

      youtubePlayer.playVideo();

      playerIsPlaying = true;

    }


    updatePlayerButton();

  }

}


/* -------------------------------------------------------
   PLAYER BUTTON ICON
------------------------------------------------------- */

function updatePlayerButton() {

  const button =
    document.getElementById(
      "player-play"
    );

  if (!button) {
    return;
  }


  button.innerHTML =
    playerIsPlaying

      ? `<span data-lucide="pause"></span>`

      : `<span data-lucide="play"></span>`;


  if (window.lucide) {
    lucide.createIcons();
  }

}


/* -------------------------------------------------------
   SEEK ±10 SECONDS
------------------------------------------------------- */

function seekSound(seconds) {

  const audio =
    document.getElementById(
      "meditation-audio"
    );


  /* Custom audio */

  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (!audio || !audio.src) {
      return;
    }

    audio.currentTime =
      Math.max(
        0,
        Math.min(
          audio.duration || Infinity,
          audio.currentTime + seconds
        )
      );

    return;

  }


  /* YouTube */

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    const current =
      youtubePlayer.getCurrentTime();

    const duration =
      youtubePlayer.getDuration();

    youtubePlayer.seekTo(
      Math.max(
        0,
        Math.min(
          duration,
          current + seconds
        )
      ),
      true
    );

  }

}


/* -------------------------------------------------------
   SEEK USING PROGRESS BAR
------------------------------------------------------- */

function seekToPercent(percent) {

  const audio =
    document.getElementById(
      "meditation-audio"
    );


  /* Custom audio */

  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (
      !audio ||
      !audio.src ||
      !audio.duration
    ) {
      return;
    }

    audio.currentTime =
      audio.duration *
      (percent / 100);

    return;

  }


  /* YouTube */

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    const duration =
      youtubePlayer.getDuration();

    youtubePlayer.seekTo(
      duration * (percent / 100),
      true
    );

  }

}


/* -------------------------------------------------------
   VOLUME
------------------------------------------------------- */

function setSoundVolume(volume) {

  playerVolume =
    Math.max(
      0,
      Math.min(100, volume)
    );


  const audio =
    document.getElementById(
      "meditation-audio"
    );


  /* Custom audio */

  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (audio) {

      audio.volume =
        playerVolume / 100;

      audio.muted = false;

    }

  }


  /* YouTube */

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    youtubePlayer.setVolume(
      playerVolume
    );

    youtubePlayer.unMute();

  }


  playerMuted = false;

  updateMuteButton();

}


/* -------------------------------------------------------
   MUTE / UNMUTE
------------------------------------------------------- */

function toggleMute() {

  playerMuted =
    !playerMuted;


  const audio =
    document.getElementById(
      "meditation-audio"
    );


  /* Custom audio */

  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (audio) {

      audio.muted =
        playerMuted;

    }

  }


  /* YouTube */

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    if (playerMuted) {

      youtubePlayer.mute();

    }

    else {

      youtubePlayer.unMute();

      youtubePlayer.setVolume(
        playerVolume
      );

    }

  }


  updateMuteButton();

}


/* -------------------------------------------------------
   MUTE BUTTON ICON
------------------------------------------------------- */

function updateMuteButton() {

  const button =
    document.getElementById(
      "player-mute"
    );

  if (!button) {
    return;
  }


  button.innerHTML =
    playerMuted

      ? `<span data-lucide="volume-x"></span>`

      : `<span data-lucide="volume-2"></span>`;


  if (window.lucide) {
    lucide.createIcons();
  }

}


/* -------------------------------------------------------
   PLAYER PROGRESS
------------------------------------------------------- */

function updatePlayerProgress() {

  if (!playerVisible) {
    return;
  }


  const progress =
    document.getElementById(
      "player-progress"
    );

  const time =
    document.getElementById(
      "player-time"
    );


  if (!progress || !time) {
    return;
  }


  let current = 0;
  let duration = 0;


  /* Custom audio */

  const audio =
    document.getElementById(
      "meditation-audio"
    );


  if (
    selectedSound === "custom" &&
    customSoundType === "file"
  ) {

    if (!audio || !audio.duration) {
      return;
    }

    current =
      audio.currentTime;

    duration =
      audio.duration;

  }


  /* YouTube */

  else if (
    youtubePlayer &&
    youtubeReady
  ) {

    current =
      youtubePlayer.getCurrentTime();

    duration =
      youtubePlayer.getDuration();

  }


  if (!duration) {
    return;
  }


  progress.value =
    (current / duration) * 100;


  time.textContent =
    `${formatPlayerTime(current)} / ${formatPlayerTime(duration)}`;

}


/* -------------------------------------------------------
   PLAYER TIME FORMAT
------------------------------------------------------- */

function formatPlayerTime(seconds) {

  seconds =
    Math.floor(seconds || 0);


  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;


  return (
    `${minutes}:` +
    `${String(
      remainingSeconds
    ).padStart(2, "0")}`
  );

}


/* -------------------------------------------------------
   PLAYER UPDATE LOOP
------------------------------------------------------- */

function startPlayerUpdates() {

  stopPlayerUpdates();


  playerUpdateTimer =
    setInterval(
      updatePlayerProgress,
      500
    );

}


function stopPlayerUpdates() {

  if (playerUpdateTimer) {

    clearInterval(
      playerUpdateTimer
    );

    playerUpdateTimer = null;

  }

}

/* -------------------------------------------------------
   YOUTUBE URL → VIDEO ID
------------------------------------------------------- */

function getYouTubeVideoId(url) {

  try {

    const parsed =
      new URL(url);


    /* youtube.com/watch?v= */

    if (
      parsed.hostname.includes(
        "youtube.com"
      )
    ) {

      const id =
        parsed.searchParams.get("v");

      if (id) {
        return id;
      }


      /* youtube.com/shorts/VIDEO_ID */

      const shorts =
        parsed.pathname.match(
          /\/shorts\/([^/]+)/
        );

      if (shorts) {
        return shorts[1];
      }


      /* youtube.com/embed/VIDEO_ID */

      const embed =
        parsed.pathname.match(
          /\/embed\/([^/]+)/
        );

      if (embed) {
        return embed[1];
      }

    }


    /* youtu.be/VIDEO_ID */

    if (
      parsed.hostname ===
      "youtu.be"
    ) {

      return parsed.pathname
        .replace("/", "")
        .split("?")[0];

    }

  }

  catch (error) {

    return null;

  }


  return null;

}