(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", function () {
        const container = document.getElementById("blog-toc-container");
        if (!container) return;

        // Find all h2 and h3 inside the article content
        const articleContent = document.getElementById("article-content");
        if (!articleContent) return;

        const headings = articleContent.querySelectorAll("h2, h3");
        if (headings.length === 0) return;        // no headings → hide the box

        // Build the list
        const list = document.createElement("ul");

        headings.forEach(function (heading, index) {
            // Give each heading a unique id so the link works
            if (!heading.id) {
                heading.id = "blog-section-" + index;
            }

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#" + heading.id;

            // Marker: ■ for h2, ‒ for h3
            const marker = (heading.tagName === "H3") ? "‒ " : "■ ";
            link.textContent = marker + heading.textContent;

            item.appendChild(link);
            list.appendChild(item);
        });

        // Insert the list into the container
        container.appendChild(list);
    });
})();
