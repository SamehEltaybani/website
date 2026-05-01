/**
 * ============================================
 * BREADCRUMBS.JS - RENDERS BREADCRUMB BAR
 * ============================================
 * 
 * DEPENDENCIES:
 * - utils.js (must be loaded FIRST)
 * - site-data.json (loaded via SiteUtils.loadJSON)
 * - main.css (provides styling classes)
 * 
 * FUNCTIONALITY:
 * - Reads breadcrumbHierarchy from site-data.json
 * - Traverses parent links to build full path
 * - Renders breadcrumb bar with clickable links
 * - Mobile: shows full path unless it overflows;
 *   then collapses to a left arrow + last item (modal sheet for full hierarchy)
 * - Graceful degradation if JSON fails or page missing
 * 
 * Last updated: 2026-05-01 (adaptive mobile breadcrumb)
 * ============================================
 */

(function() {
    'use strict';
    
    // ============================================
    // PRIVATE VARIABLES
    // ============================================
    
    let hierarchyData = null;      // breadcrumbHierarchy array from JSON
    let currentPage = '';          // Current page filename
    let breadcrumbPath = [];        // Array of { title, filename, isClickable }
    let isModalOpen = false;        // Track mobile modal state
    let resizeObserver = null;      // For re-checking overflow on resize
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Gets the current page filename from utils.js
     * Falls back to window.location if utils not available
     */
    function getCurrentPage() {
        if (typeof SiteUtils !== 'undefined' && SiteUtils.getCurrentPageFilename) {
            return SiteUtils.getCurrentPageFilename();
        }
        const path = window.location.pathname;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return cleanPath === '' || cleanPath === '/' ? 'index.html' : cleanPath;
    }
    
    /**
     * Finds a page entry in the hierarchy by filename
     */
    function findPageEntry(filename) {
        if (!hierarchyData) return null;
        return hierarchyData.find(item => item.filename === filename);
    }
    
    /**
     * Builds the breadcrumb path by traversing parent links
     * Returns array from Home to current page
     */
    function buildBreadcrumbPath() {
        const path = [];
        
        let currentEntry = findPageEntry(currentPage);
        
        if (!currentEntry) {
            console.warn(`[Breadcrumbs] Page "${currentPage}" not found in breadcrumbHierarchy`);
            const pageTitle = currentPage.replace('.html', '').replace(/-/g, ' ');
            const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
            return [
                { title: 'Home', filename: 'index.html', isClickable: true },
                { title: capitalizedTitle, filename: currentPage, isClickable: false }
            ];
        }
        
        let current = currentEntry;
        const reversePath = [];
        
        reversePath.push({
            title: current.title,
            filename: current.filename,
            isClickable: false
        });
        
        while (current.parent) {
            const parentEntry = findPageEntry(current.parent);
            if (!parentEntry) break;
            
            reversePath.push({
                title: parentEntry.title,
                filename: parentEntry.filename,
                isClickable: true
            });
            
            current = parentEntry;
        }
        
        return reversePath.reverse();
    }
    
    /**
     * Creates a breadcrumb item element
     */
    function createBreadcrumbItem(item, isLast = false) {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        
        if (isLast) {
            li.classList.add('active');
            li.textContent = item.title;
        } else {
            const link = document.createElement('a');
            link.href = item.filename;
            link.textContent = item.title;
            li.appendChild(link);
        }
        
        return li;
    }
    
    /**
     * Creates a separator between breadcrumb items
     */
    function createSeparator() {
        const li = document.createElement('li');
        li.className = 'breadcrumb-separator';
        li.textContent = '›';
        return li;
    }
    
    /**
     * Creates the mobile modal sheet with full breadcrumb hierarchy
     */
    function createMobileModal() {
        const existingModal = document.querySelector('.breadcrumb-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'breadcrumb-modal';
        modal.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--color-white, white);
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
            z-index: 2000;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--space-md, 16px);
            border-bottom: 1px solid var(--color-border, #DEE2E6);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background-color: var(--color-white, white);
        `;
        
        const dragIndicator = document.createElement('div');
        dragIndicator.style.cssText = `
            width: 40px;
            height: 4px;
            background-color: var(--color-border, #DEE2E6);
            border-radius: 2px;
            margin: 0 auto;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: var(--color-text-muted, #6C757D);
        `;
        closeBtn.addEventListener('click', closeMobileModal);
        
        header.appendChild(dragIndicator);
        header.appendChild(closeBtn);
        
        const content = document.createElement('div');
        content.style.cssText = `padding: var(--space-md, 16px);`;
        
        breadcrumbPath.forEach((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            const linkContainer = document.createElement('div');
            linkContainer.style.cssText = `
                padding: var(--space-sm, 8px) 0;
                border-bottom: 1px solid var(--color-border, #DEE2E6);
            `;
            
            if (isLast) {
                linkContainer.style.fontWeight = '600';
                linkContainer.style.color = 'var(--color-text-main, #333333)';
                linkContainer.textContent = item.title;
            } else {
                const link = document.createElement('a');
                link.href = item.filename;
                link.textContent = item.title;
                link.style.cssText = `
                    text-decoration: none;
                    color: var(--color-midnight-blue, #1A2530);
                    display: block;
                `;
                link.addEventListener('click', closeMobileModal);
                linkContainer.appendChild(link);
            }
            
            content.appendChild(linkContainer);
        });
        
        modal.appendChild(header);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const overlay = document.createElement('div');
        overlay.className = 'breadcrumb-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            z-index: 1999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out;
        `;
        overlay.addEventListener('click', closeMobileModal);
        document.body.appendChild(overlay);
        
        return { modal, overlay };
    }
    
    /**
     * Opens the mobile modal sheet
     */
    function openMobileModal() {
        if (isModalOpen) return;
        
        const { modal, overlay } = createMobileModal();
        
        setTimeout(() => {
            modal.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }, 10);
        
        isModalOpen = true;
        document.body.dataset.breadcrumbModal = 'open';
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Closes the mobile modal sheet
     */
    function closeMobileModal() {
        if (!isModalOpen) return;
        
        const modal = document.querySelector('.breadcrumb-modal');
        const overlay = document.querySelector('.breadcrumb-overlay');
        
        if (modal) modal.style.transform = 'translateY(100%)';
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
        }
        
        setTimeout(() => {
            if (modal) modal.remove();
            if (overlay) overlay.remove();
            document.body.style.overflow = '';
            delete document.body.dataset.breadcrumbModal;
        }, 300);
        
        isModalOpen = false;
    }
    
    /**
     * Checks whether the breadcrumb list overflows its container.
     */
    function isBreadcrumbOverflowing(list, container) {
        if (!list || !container) return false;
        return list.scrollWidth > container.clientWidth;
    }
    
    /**
     * Converts a full breadcrumb list into the mobile‑collapsed version
     * (left arrow + last item only).
     */
    function collapseToMobileView(list, containerElement) {
        if (!list) return;
        
        // Remove all items except keep a reference to the last one
        const items = list.querySelectorAll('.breadcrumb-item');
        const lastItem = items[items.length - 1];
        if (!lastItem) return;
        
        // Clear the list
        list.innerHTML = '';
        
        // Create back arrow
        const backItem = document.createElement('li');
        backItem.className = 'breadcrumb-item breadcrumb-mobile-back';
        backItem.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backItem.style.cursor = 'pointer';
        backItem.addEventListener('click', openMobileModal);
        list.appendChild(backItem);
        
        // Clone last item and mark as active
        const lastClone = lastItem.cloneNode(true);
        lastClone.classList.add('active');
        list.appendChild(lastClone);
    }
    
    /**
     * Renders the breadcrumb and then, if on mobile and overflowing,
     * collapses it to the back‑arrow view.
     */
    function renderAdaptiveBreadcrumb() {
        const breadcrumbBar = document.querySelector('[data-component="breadcrumb"]');
        if (!breadcrumbBar) return;
        
        breadcrumbBar.innerHTML = '';
        
        // Always start with the full desktop layout
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        const list = document.createElement('ul');
        list.className = 'breadcrumb-list';
        
        breadcrumbPath.forEach((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            const breadcrumbItem = createBreadcrumbItem(item, isLast);
            list.appendChild(breadcrumbItem);
            if (!isLast) {
                list.appendChild(createSeparator());
            }
        });
        
        container.appendChild(list);
        breadcrumbBar.appendChild(container);
        
        // After rendering, check if we need to collapse on mobile
        requestAnimationFrame(() => {
            if (window.innerWidth < 768 && isBreadcrumbOverflowing(list, container)) {
                collapseToMobileView(list, container);
            }
        });
    }
    
    /**
     * Render fallback (Home > current page) without overflow checks.
     */
    function showFallbackBreadcrumbs() {
        const breadcrumbBar = document.querySelector('[data-component="breadcrumb"]');
        if (!breadcrumbBar) return;
        
        breadcrumbBar.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        const list = document.createElement('ul');
        list.className = 'breadcrumb-list';
        
        const homeItem = createBreadcrumbItem({ title: 'Home', filename: 'index.html', isClickable: true }, false);
        list.appendChild(homeItem);
        list.appendChild(createSeparator());
        
        const pageTitle = currentPage.replace('.html', '').replace(/-/g, ' ');
        const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
        const currentItem = createBreadcrumbItem({ title: capitalizedTitle, filename: currentPage, isClickable: false }, true);
        list.appendChild(currentItem);
        
        container.appendChild(list);
        breadcrumbBar.appendChild(container);
    }
    
    /**
     * Re-renders the breadcrumb when the window is resized.
     */
    function handleResize() {
        renderAdaptiveBreadcrumb();
        if (window.innerWidth >= 768 && isModalOpen) {
            closeMobileModal();
        }
    }
    
    /**
     * Loads breadcrumb data from site-data.json
     */

    async function loadBreadcrumbData() {
    try {
        if (typeof SiteUtils === 'undefined') {
            console.error('[Breadcrumbs] utils.js not loaded.');
            showFallbackBreadcrumbs();
            return;
        }
        
        const data = await SiteUtils.loadJSON('/json/site-data.json', true);
        
        if (data && data.breadcrumbHierarchy && Array.isArray(data.breadcrumbHierarchy)) {
            hierarchyData = data.breadcrumbHierarchy;
            breadcrumbPath = buildBreadcrumbPath();
            
            // ---- NEW: For blog articles, replace the last item's title with the shortTitle from blog-list.json ----
            if (currentPage.startsWith('blog/') && currentPage !== 'blog.html') {
                try {
                    const blogData = await SiteUtils.loadJSON('/json/blog-list.json', true);
                    if (blogData && Array.isArray(blogData)) {
                        const entry = blogData.find(item => item.blogfile === currentPage);
                        if (entry && entry.shortTitle && breadcrumbPath.length > 0) {
                            breadcrumbPath[breadcrumbPath.length - 1].title = entry.shortTitle;
                        }
                    }
                } catch (e) {
                    console.warn('[Breadcrumbs] Could not load short title for blog article, using fallback.');
                }
            }
            
            renderAdaptiveBreadcrumb();
            window.addEventListener('resize', SiteUtils.debounce ? SiteUtils.debounce(handleResize, 150) : handleResize);
            
            console.log('[Breadcrumbs] Initialized. Path:', breadcrumbPath.map(p => p.title).join(' > '));
        } else {
            console.error('[Breadcrumbs] Invalid JSON structure');
            showFallbackBreadcrumbs();
        }
    } catch (error) {
        console.error('[Breadcrumbs] Failed to load site-data.json:', error);
        showFallbackBreadcrumbs();
    }
}
    
    /**
     * Initializes the breadcrumb bar
     */
    async function init() {
        if (typeof SiteUtils !== 'undefined' && SiteUtils.waitForDOM) {
            await SiteUtils.waitForDOM();
        } else {
            await new Promise(resolve => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
        
        currentPage = getCurrentPage();
        await loadBreadcrumbData();
    }
    
    // ============================================
    // START INITIALIZATION
    // ============================================
    
    init();
})();
