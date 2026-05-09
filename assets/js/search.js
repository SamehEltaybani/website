/* ============================================================================
   SITE‑WIDE SEARCH (icon, modal, result labels)
   ============================================================================
   To customize the search icon, change the values below:
   --search-icon-size: width/height of the circle
   --search-icon-bg: background colour of the circle
   --search-icon-color: the magnifying‑glass colour
   --search-icon-hover-bg: background on hover
   ============================================================================ */

:root {
    --search-icon-size: 38px;
    --search-icon-bg: var(--color-gold);
    --search-icon-color: var(--color-midnight-blue);
    --search-icon-hover-bg: var(--color-gold-light);
}

/* Search icon button (circle) */
.search-icon-btn {
    width: var(--search-icon-size);
    height: var(--search-icon-size);
    border-radius: 50%;
    background-color: var(--search-icon-bg);
    color: var(--search-icon-color);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: background-color 0.2s, transform 0.2s;
    padding: 0;
    flex-shrink: 0;
}

.search-icon-btn:hover {
    background-color: var(--search-icon-hover-bg);
    transform: scale(1.08);
}

/* On mobile, move the icon to the left of the hamburger */
@media (max-width: 992px) {
    .navbar-right {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }
    .search-icon-btn {
        order: -1;   /* forces it to the far left of the right group */
    }
}

/* ============================================================================
   SEARCH MODAL (pop‑up overlay)
   ============================================================================ */
.search-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 2000;
    display: none;
    align-items: center;
    justify-content: center;
}

.search-modal-overlay.open {
    display: flex;
}

.search-modal-box {
    background-color: var(--color-white);
    border-radius: 12px;
    padding: var(--space-lg);
    width: 90%;
    max-width: 500px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    position: relative;
}

.search-modal-input {
    width: 100%;
    padding: var(--space-sm) var(--space-lg);
    font-size: 16px;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
}

.search-modal-input:focus {
    border-color: var(--color-gold);
}

.search-modal-close {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-muted);
    line-height: 1;
}

.search-modal-submit {
    margin-top: var(--space-md);
    width: 100%;
}

/* ============================================================================
   RESULT TYPE LABELS (used on search.html)
   ============================================================================ */
.result-type {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.result-type-blog    { background-color: #DCE9F9; color: #1B5E9E; }   /* soft blue */
.result-type-publication { background-color: #D4EDDA; color: #1B5E20; } /* soft green */
.result-type-portfolio { background-color: #E8DAEF; color: #6A1B9A; }  /* soft purple */
.result-type-page   { background-color: #F5E6CC; color: #7B5E3B; }    /* soft tan */
