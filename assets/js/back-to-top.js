/**
 * back-to-top.js – Floating button, appears after scrolling down
 * Must be loaded AFTER footer.js
 */
(function() {
    'use strict';

    // Create the button once the DOM is ready
    function createButton() {
        var btn = document.getElementById('backToTop');
        if (btn) return;

        btn = document.createElement('div');
        btn.id = 'backToTop';
        btn.className = 'back-to-top';
        btn.innerHTML = '<span class="back-to-top-icon"><i class="fas fa-circle-up"></i></span><span class="back-to-top-text">To Top</span>';
        document.body.appendChild(btn);

        // Scroll to top on click/touch
        btn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide on scroll (simple, without dependencies)
        var showBtn = function() {
            if (window.scrollY > 300) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        };
        window.addEventListener('scroll', showBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
