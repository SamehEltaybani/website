(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", function () {
        const tocContent = document.getElementById("toc-content");
        if (!tocContent) return;          // only runs if the ToC container exists

        const headings = document.querySelectorAll("main h2:not(.ignore-toc), main h3:not(.ignore-toc)");
        const tocList = document.createElement("ul");
        const currentPage = window.location.pathname;

        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = "toc-section-" + index;
            }

            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = currentPage + "#" + heading.id;

            const symbol = (heading.tagName === "H3") ? "- " : "■ ";
            link.textContent = symbol + heading.textContent;

            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });

        tocContent.appendChild(tocList);

                // --- MOBILE TOC FUNCTIONALITY ---
        const mobileToggle = document.getElementById("toc-mobile-toggle");
        const closeButton = document.getElementById("toc-close");
        const sidebar = document.querySelector(".toc-sidebar");
        const overlay = document.getElementById("toc-overlay");   // NEW

        function openMobileToc() {
            if (sidebar) {
                sidebar.classList.add("active");
                document.body.classList.add("toc-open");
            }
            if (overlay) {
                overlay.style.display = "block";
            }
        }

        function closeMobileToc() {
            if (sidebar) {
                sidebar.classList.remove("active");
                document.body.classList.remove("toc-open");
            }
            if (overlay) {
                overlay.style.display = "none";
            }
        }

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener("click", openMobileToc);
        }

        if (closeButton && sidebar) {
            closeButton.addEventListener("click", closeMobileToc);
        }

        // Close TOC when overlay is tapped
        if (overlay) {
            overlay.addEventListener("click", closeMobileToc);
        }

        // Close TOC when a link is clicked
        const tocLinks = document.querySelectorAll("#toc-content a");
        tocLinks.forEach(link => {
            link.addEventListener("click", () => {
                closeMobileToc();
            });
        });
    });   
})();    
