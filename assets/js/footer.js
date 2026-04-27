/* ==========================================================
   footer.js
   Purpose:
   Render a consistent, site‑wide footer from one source
   ========================================================== */


/* ==========================================================
   1. CONFIGURATION & CONSTANTS
   ----------------------------------------------------------
   Central place to manage footer content safely
   ========================================================== */

const SITE_OWNER_NAME = "Dr. Sameh Eltaybani";
const LEGAL_PAGE_URL = "legal.html";


/* ==========================================================
   2. FOOTER DATA DEFINITIONS
   ----------------------------------------------------------
   Easy to edit, extend, or rearrange later
   ========================================================== */

/* --- Social Media Links (icons only) --- */
const SOCIAL_LINKS = [
  { name: "LinkedIn", url: "https://www.linkedin.com/" },
  { name: "Google Scholar", url: "https://scholar.google.com/" },
  { name: "GitHub", url: "https://github.com/" }
];

/* --- Sitemap (main pages only) --- */
const SITEMAP_LINKS = [
  { label: "Home", url: "index.html" },
  { label: "Research", url: "research.html" },
  { label: "Publications", url: "publications.html" },
  { label: "Data Analysis", url: "data-analysis.html" },
  { label: "Teaching", url: "teaching.html" },
  { label: "Portfolios", url: "portfolios.html" },
  { label: "Blog", url: "blog.html" },
  { label: "Contact", url: "contact.html" },
  { label: "Newsletter", url: "newsletter.html" }
];

/* --- Legal Disclaimer Preview Text --- */
const LEGAL_PREVIEW_TEXT =
  "The content on this website is provided for academic, research, and professional purposes only and does not constitute legal or contractual advice.";


/* ==========================================================
   3. DOM CONSTRUCTION HELPERS
   ========================================================== */

/**
 * Create a footer section container
 */
function createSection(className) {
  const section = document.createElement("div");
  section.className = className;
  return section;
}

/**
 * Create an external icon link
 */
function createExternalIconLink(item) {
  const link = document.createElement("a");
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "footer-social-link";
  link.setAttribute("aria-label", item.name);
  return link;
}

/**
 * Create a standard internal link
 */
function createInternalLink(item) {
  const link = document.createElement("a");
  link.href = item.url;
  link.textContent = item.label;
  link.className = "footer-link";
  return link;
}


/* ==========================================================
   4. FOOTER RENDERING LOGIC
   ========================================================== */

function renderFooter(container) {
  const footerWrapper = document.createElement("div");
  footerWrapper.className = "footer-wrapper";

  /* --- Social Media Section --- */
  const socialSection = createSection("footer-social");
  SOCIAL_LINKS.forEach(item => {
    socialSection.appendChild(createExternalIconLink(item));
  });

  /* --- Sitemap Section --- */
  const sitemapSection = createSection("footer-sitemap");
  SITEMAP_LINKS.forEach(item => {
    sitemapSection.appendChild(createInternalLink(item));
  });

  /* --- Legal Disclaimer Section --- */
  const legalSection = createSection("footer-legal");
  const legalText = document.createElement("p");
  legalText.textContent = LEGAL_PREVIEW_TEXT;
  legalText.className = "footer-legal-text";

  const legalLink = document.createElement("a");
  legalLink.href = LEGAL_PAGE_URL;
  legalLink.textContent = "Read more >>";
  legalLink.className = "footer-legal-link";

  legalSection.appendChild(legalText);
  legalSection.appendChild(legalLink);

  /* --- Copyright Section --- */
  const copyrightSection = createSection("footer-copyright");
  const year = new Date().getFullYear();
  copyrightSection.textContent = `© ${year} ${SITE_OWNER_NAME}`;

  /* --- Assemble Footer --- */
  footerWrapper.appendChild(socialSection);
  footerWrapper.appendChild(sitemapSection);
  footerWrapper.appendChild(legalSection);
  footerWrapper.appendChild(copyrightSection);

  container.appendChild(footerWrapper);
}


/* ==========================================================
   5. INITIALIZATION
   ----------------------------------------------------------
   Safe, silent execution
   ========================================================== */

(function initFooter() {
  const container = document.getElementById("site-footer");
  if (!container) return; // fail silently

  container.innerHTML = "";
  renderFooter(container);
})();
