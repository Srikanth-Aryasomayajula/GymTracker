const CACHE = "gym-tracker-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./workout.html",
  "./history.html",
  "./calories.html",
  "./meal-plan.html",
  "./meditation.html",
  "./exercises.html",
  "./profile.html",
  "./login.html",
  "./css/global.css",
  "./css/components.css",
  "./css/dashboard.css",
  "./css/workout.css",
  "./css/history.css",
  "./css/calories.css",
  "./css/meal-plan.css",
  "./css/meditation.css",
  "./css/exercises.css",
  "./css/profile.css",
  "./css/login.css",
  "./js/app.js",
  "./js/dashboard.js",
  "./js/firebase-config.js",
  "./js/firebase.js",
  "./js/storage.js",
  "./js/navigation.js",
  "./js/workout.js",
  "./js/history.js",
  "./js/calories.js",
  "./js/meal-plan.js",
  "./js/meditation.js",
  "./js/exercises.js",
  "./js/profile.js",
  "./data/machines.json",
  "./data/exercises.json",
  "./data/foods.json",
  "./assets/icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin && event.request.method === "GET") {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html"))));
  }
});
