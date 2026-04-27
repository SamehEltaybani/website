document.addEventListener("DOMContentLoaded", () => {
  fetch("json/navigation.json")
    .then(res => res.json())
    .then(data => renderNavigation(data))
    .catch(err => console.error("Navigation load failed", err));
});

function renderNavigation(data) {
  const navContainer = document.getElementById("site-navigation");
  if (!navContainer) return;

  const profile = data.profile || {};
  const items = Array.isArray(data.items) ? data.items : [];

  navContainer.innerHTML = `
    <nav class="nav">
      <div class="nav-inner">
        ${renderProfile(profile)}
        <button id="nav-toggle" class="nav-toggle" aria-label="Menu">
          ☰
        </button>
        <ul class="nav-links" id="nav-links">
          ${items.map(renderNavItem).join("")}
        </ul>
      </div>
    </nav>
  `;

  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

function renderProfile(profile) {
  if (!profile.name && !profile.image) return "";

  return `
    <a href="${profile.link || "#"}" class="nav-profile">
      ${profile.image ? `<img src="${profile.image}" alt="${profile.name || ""}">` : ""}
      ${profile.name ? `<span>${profile.name}</span>` : ""}
    </a>
  `;
}

function renderNavItem(item) {
  if (!item.label || !item.url) return "";

  const highlightClass = item.highlight ? "highlight" : "";
  return `
    <li class="nav-item ${highlightClass}">
      <a href="${item.url}">${item.label}</a>
    </li>
  `;
}
