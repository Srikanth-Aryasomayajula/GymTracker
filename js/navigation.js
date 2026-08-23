export const NAV = [
  ["index.html","Dashboard","⌂"],
  ["workout.html","Workout","＋"],
  ["history.html","History","▤"],
  ["calories.html","Calories","◉"],
  ["meal-plan.html","Meal Plan","◆"],
  ["meditation.html","Meditation","◌"],
  ["exercises.html","Exercises","▣"],
  ["profile.html","Profile","◎"]
];

export function renderNavigation(current) {
  const desktop = NAV.map(([href,label,icon]) =>
    `<a class="nav-link ${href === current ? "active":""}" href="${href}"><span>${icon}</span>${label}</a>`
  ).join("");

  const bottom = NAV.slice(0,5).map(([href,label,icon]) =>
    `<a class="bottom-link ${href === current ? "active":""}" href="${href}"><span>${icon}</span><small>${label}</small></a>`
  ).join("");

  return `
    <header class="topbar">
      <a class="brand" href="index.html">GYM <b>TRACKER</b></a>
      <nav class="desktop-nav">${desktop}</nav>
      <a class="profile-mini" href="profile.html" title="Profile">◎</a>
    </header>
    <nav class="bottom-nav">${bottom}</nav>
  `;
}
