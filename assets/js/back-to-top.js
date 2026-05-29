/**
 * back-to-top.js – Reliable floating button
 * Works instantly on first tap (mobile & desktop)
 */
(function() {
    'use strict';

    function createButton() {
        var btn = document.getElementById('backToTop');
        if (btn) return;

        btn = document.createElement('div');
        btn.id = 'backToTop';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '<span class="back-to-top-icon"><i class="fas fa-circle-up"></i></span><span class="back-to-top-text">To Top</span>';
        document.body.appendChild(btn);

        // Scroll to top – uses both events for maximum compatibility
        var scrollTop = function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        btn.addEventListener('click', scrollTop);
        btn.addEventListener('pointerdown', scrollTop);

        // Show / hide based on scroll position
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 300) {
                        btn.style.display = 'flex';
                    } else {
                        btn.style.display = 'none';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
