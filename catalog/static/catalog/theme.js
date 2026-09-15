(function () {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", initial);

    document.addEventListener("DOMContentLoaded", function () {
        const btn = document.getElementById("theme-toggle");
        if (!btn) return;

        function updateIcon() {
            const current = root.getAttribute("data-theme");
            btn.textContent = current === "dark" ? "☀️" : "🌙";
        }
        updateIcon();

        btn.addEventListener("click", function () {
            const current = root.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            updateIcon();
        });
    });
})();
