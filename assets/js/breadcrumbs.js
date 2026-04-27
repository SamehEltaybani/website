/* ==========================================================
   breadcrumbs.js
   Purpose:
   Render dynamic breadcrumbs across the website
   ========================================================== */


/* ==========================================================
   1. CONFIGURATION: PAGE-LEVEL BREADCRUMB DEFINITIONS
   ----------------------------------------------------------
   HOW TO USE (Non‑programmer friendly):
   - Each key is a page file name (e.g. "research.html")
   - Each value is an ordered list of breadcrumb items
   - Each item has:
       - label (text shown)
       - url (optional; omit for current page)
   - You may add, remove, or edit entries safely
   ========================================================== */

const BREADCRUMB_CONFIG = {
  "research.html": [
    { label: "Home", url: "index.html" },
    { label: "Research" }
  ],

  "publications.html": [
    { label: "Home", url: "index.html" },
    { label: "Publications" }
  ],

  "blog.html": [
    { label: "Home", url: "index.html" },
    { label: "Blog" }
  ],

  /* Example: sub‑page */
  "research-portfolio.html": [
    { label: "Home", url: "index.html" },
    { label: "Research", url: "research.html" },
    { label: "Research Portfolio" }
  ]

  /* Blog articles will be added later by templates */
};


/* ==========================================================
   2. UTILITY HELPERS
   ========================================================== */

/**
 * Get the current page file name (e.g. "index.html")
 */
function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

/**
 * Get a safe page title fallback
 */
function getPageTitleFallback() {
  return document.title
    ? document.title.replace(/\|.*/, "").trim()
    : "Current Page";
}


/* ==========================================================
   3. PAGE HIERARCHY RESOLUTION
   ----------------------------------------------------------
   Determines which breadcrumb trail to use for this page
   ========================================================== */

function resolveBreadcrumbs(page) {
  if (BREADCRUMB_CONFIG[page]) {
    return BREADCRUMB_CONFIG[page];
  }

  /* Fallback: Home > Current Page */
  return [
    { label: "Home", url: "index.html" },
    { label: getPageTitleFallback() }
  ];
}


/* ==========================================================
   4. BREADCRUMB DOM CREATION
   ----------------------------------------------------------
   Creates semantic breadcrumb markup dynamically
   ========================================================== */

function buildBreadcrumbs(trail) {
  const nav = document.createElement("nav");
  nav.className = "breadcrumbs-nav";

  trail.forEach((item, index) => {
    const isLast = index === trail.length - 1;

    if (item.url && !isLast) {
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.label;
      link.className = "breadcrumb-link";
      nav.appendChild(link);
    } else {
      const span = document.createElement("span");
      span.textContent = item.label;
      span.className = "breadcrumb-current";
      nav.appendChild(span);
    }

    if (!isLast) {
      const separator = document.createElement("span");
      separator.textContent = "›";
      separator.className = "breadcrumb-separator";
      nav.appendChild(separator);
    }
  });

  return nav;
}


/* ==========================================================
   5. BLOG ARTICLE SUPPORT (PREPARED FOR FUTURE USE)
   ----------------------------------------------------------
   Logic ready for:
   - fullTitle
   - shortTitle (preferred for breadcrumbs when available)
   Data source will be defined later (template or JSON)
   ========================================================== */

function resolveBlogTitle(articleData) {
  if (!articleData) return null;
  return articleData.shortTitle || articleData.fullTitle || null;
}


/* ==========================================================
   6. INITIALIZATION LOGIC
   ----------------------------------------------------------
   - Finds breadcrumb container
   - Resolves hierarchy
   - Injects breadcrumbs
   - Fails silently if not applicable
   ========================================================== */

(function initBreadcrumbs() {
  const container = document.getElementById("site-breadcrumbs");
  if (!container) return; // fail silently

  const currentPage = getCurrentPage();
  const trail = resolveBreadcrumbs(currentPage);
  const breadcrumbsDOM = buildBreadcrumbs(trail);

  container.innerHTML = "";
  container.appendChild(breadcrumbsDOM);
})();
