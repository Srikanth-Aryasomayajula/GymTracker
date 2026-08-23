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
   SOUND DEFINITIONS
-------------------------------------------------------

   Replace the VIDEO_ID values with the YouTube videos
   you want to use.

   Example:
   https://www.youtube.com/watch?v=XXXXXXXXXXX

------------------------------------------------------- */

const meditationSounds = {

  none: {
    name: "No sound",
    type: "none"
  },

  om: {
    name: "Om Chanting",
    type: "youtube",
    videoId: "https://www.youtube.com/watch?v=SBiwLibZqfw"
  },

  ram: {
    name: "Ram Chanting",
    type: "youtube",
    videoId: "https://www.youtube.com/watch?v=vrYaiUdUUPA"
  },

  nature: {
    name: "Nature Sounds",
    type: "youtube",
    videoId: "https://www.youtube.com/watch?v=WZKW2Hq2fks"
  },

  bowls: {
    name: "Singing Bowls",
    type: "youtube",
    videoId: "https://www.youtube.com/watch?v=-4rtl36Cz48"
  }

};


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


    <section class="card meditation-card">

      <!-- TIMER -->

      <div
        class="timer"
        id="timer"
      >
        10:00
      </div>


      <!-- BREATHING -->

      <div
        class="breath-ring"
        id="breath-ring"
      ></div>


      <!-- TIMER ACTIONS -->

      <div class="timer-actions">

        <button
          class="btn-primary"
          id="start"
        >
          Start
        </button>

        <button
          class="btn-secondary"
          id="reset"
        >
          Reset
        </button>

      </div>


      <!-- DURATIONS -->

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

        </div>

      </div>


      <!-- SOUND -->

      <div class="meditation-sound">

        <div class="field">

          <label for="meditation-sound-select">
            Sound
          </label>

          <select
            id="meditation-sound-select"
            class="sound-select"
          >

            <option value="none">
              No sound
            </option>

            <option value="om">
              Om Chanting
            </option>

            <option value="ram">
              Ram Chanting
            </option>

            <option value="nature">
              Nature Sounds
            </option>

            <option value="bowls">
              Singing Bowls
            </option>

            <option value="custom">
              Custom sound
            </option>

          </select>

          <small
            class="muted sound-description"
            id="sound-description"
          >
            Silence during your meditation.
          </small>

        </div>


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


      <!-- HIDDEN YOUTUBE PLAYER -->

      <div
        id="meditation-youtube-player"
      ></div>


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
          .forEach(b => b.classList.remove("active"));

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

      document
        .getElementById("custom-duration")
        .classList.toggle("hidden");

      document
        .querySelectorAll(".duration-buttons .chip")
        .forEach(b => b.classList.remove("active"));

    };


  /* ---------------------------------------------------
     CUSTOM DURATION INPUT
  --------------------------------------------------- */

  [
    "custom-hours",
    "custom-minutes"
  ].forEach(id => {

    document
      .getElementById(id)
      .addEventListener("input", applyCustomDuration);

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
     SOUND
  --------------------------------------------------- */

  document
    .getElementById("meditation-sound-select")
    .onchange = handleSoundChange;


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


  update();

}


/* -------------------------------------------------------
   CUSTOM DURATION
------------------------------------------------------- */

function applyCustomDuration() {

  const hours =
    Number(
      document.getElementById("custom-hours").value
    ) || 0;

  const minutes =
    Number(
      document.getElementById("custom-minutes").value
    ) || 0;


  if (minutes > 59) {

    document.getElementById("custom-minutes").value = 59;

  }


  if (hours < 0 || minutes < 0) {
    return;
  }


  const totalSeconds =
    hours * 3600 +
    minutes * 60;


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
    Math.floor(remaining / 3600);

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

  document
    .getElementById("start")
    .textContent = "Start";

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


  if (
    customButton.classList.contains("active")
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

  document
    .getElementById("start")
    .textContent = "Pause";


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
   SOUND CHANGE
------------------------------------------------------- */

function handleSoundChange() {

  selectedSound =
    document
      .getElementById(
        "meditation-sound-select"
      )
      .value;


  const customSound =
    document.getElementById(
      "custom-sound"
    );


  if (selectedSound === "custom") {

    customSound.classList.remove("hidden");

    updateSoundStatus(
      "Custom sound selected",
      true
    );

  }

  else {

    customSound.classList.add("hidden");

    stopSound();


    const sound =
      meditationSounds[selectedSound];


    if (!sound || sound.type === "none") {

      updateSoundStatus(
        "No sound",
        false
      );

    }

    else {

      updateSoundStatus(
        sound.name,
        true
      );

    }

  }

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


      await playYouTubeSound(videoId);

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

                event.target.playVideo();

                updateSoundStatus(
                  getCurrentSoundName(),
                  true
                );

                resolve();

              },

              onStateChange: event => {

                /*
                  When the YouTube video finishes,
                  start it again so meditation sound
                  can continue for long sessions.
                */

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

      youtubePlayer.loadVideoById(videoId);

      youtubePlayer.playVideo();

      youtubeReady = true;

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

    status.classList.remove("muted");

  }

  else {

    status.classList.add("muted");

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
   YOUTUBE URL → VIDEO ID
------------------------------------------------------- */

function getYouTubeVideoId(url) {

  try {

    const parsed =
      new URL(url);


    /* youtube.com/watch?v= */

    if (
      parsed.hostname.includes("youtube.com")
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
      parsed.hostname === "youtu.be"
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