(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", function () {
        
        // --- 1. TABLE OF CONTENTS (ToC) GENERATION ---
        const tocContainer = document.getElementById("blog-toc-container");
        const articleContent = document.getElementById("article-content");

        if (tocContainer && articleContent) {
            const headings = articleContent.querySelectorAll("h2, h3");
            
            if (headings.length > 0) {
                const list = document.createElement("ul");

                headings.forEach(function (heading, index) {
                    // Ensure each heading has a unique ID for linking
                    if (!heading.id) {
                        heading.id = "blog-section-" + index;
                    }

                    const item = document.createElement("li");
                    const link = document.createElement("a");
                    // Use pathname to ensure the hash link works correctly on the current page
                    link.href = window.location.pathname + "#" + heading.id;

                    // Marker: ■ for h2, ‒ for h3
                    const marker = (heading.tagName === "H3") ? "‒ " : "■ ";
                    link.textContent = marker + heading.textContent;

                    item.appendChild(link);
                    list.appendChild(item);
                });

                tocContainer.appendChild(list);
            }
        }

        // --- 2. SCROLL PROGRESS BAR ---
        const progressBar = document.getElementById('progress-bar');
        
        if (progressBar) {
            window.addEventListener('scroll', function () {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                
                if (height > 0) {
                    const scrolled = (winScroll / height) * 100;
                    progressBar.style.width = scrolled + "%";
                } else {
                    progressBar.style.width = "0%";
                }
            });
        }
    });
})();
