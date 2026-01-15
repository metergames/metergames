/* script.js */
document.addEventListener("DOMContentLoaded", () => {
    initBanner();
    initLightbox();
    initTheme();
});

/**
 * Initializes the Theme Toggle (Dark/Light).
 * Injects a button into the nav and handles logo swapping.
 */
function initTheme() {
    // 1. Get current theme (already set by the Head script)
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    
    // 2. Ensure the logo matches the theme immediately
    updateLogo(currentTheme);

    // 3. Create the toggle button
    const btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.ariaLabel = "Toggle Dark/Light Mode";
    btn.innerHTML = getThemeIcon(currentTheme);

    // 4. Inject it into the navigation bar
    const nav = document.querySelector(".header nav");
    if (nav) {
        nav.appendChild(btn);
    }

    // 5. Handle Click
    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateLogo(next);
        btn.innerHTML = getThemeIcon(next);
    });
}

// Returns the Sun icon (for Dark mode) or Moon icon (for Light mode)
function getThemeIcon(theme) {
    if (theme === "dark") {
        // Sun Icon (indicates "Switch to Light")
        return `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zm1.41-13.78c-.39-.39-1.02-.39-1.41 0l-1.29 1.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.29-1.29c.39-.39.39-1.02 0-1.41zM7.28 16.95c-.39-.39-1.02-.39-1.41 0l-1.29 1.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.29-1.29c.39-.39.39-1.02 0-1.41z"></path></svg>`;
    } else {
        // Moon Icon (indicates "Switch to Dark")
        return `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
}

// Logic to swap the logo ONLY on main pages (Index/Privacy)
// Game pages use CSS filters on the white logo, so we don't swap those.
function updateLogo(theme) {
    // Check if we are on a game page by looking for the theme class
    const isGamePage = document.body.classList.contains("parker-theme") || 
                       document.body.classList.contains("slice-theme") ||
                       document.body.classList.contains("study-theme") ||
                       document.body.classList.contains("about-theme");

    if (!isGamePage) {
        // We are on Index or Privacy page
        const logoImg = document.querySelector(".logo img");
        if (logoImg) {
            if (theme === "light") {
                logoImg.src = "images/logo-dark.png";
            } else {
                logoImg.src = "images/logo.png";
            }
        }
    }
}

/**
 * Initializes the random banner loader (Parker Page).
 */
function initBanner() {
    const container = document.getElementById("banner-container");
    if (!container) return;

    const banners = [
        "images/parker-banner.jpg",
        "images/parker-banner-2.jpg"
    ];

    const chosen = banners[Math.floor(Math.random() * banners.length)];
    const img = new Image();
    
    img.src = chosen;
    img.alt = "Parker Gameplay";
    img.className = "game-banner-animated";

    img.onload = () => container.classList.add("loaded");
    
    container.appendChild(img);
}

/**
 * Lightbox Logic
 */
function initLightbox() {
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("enlargeable-image")) {
            openLightbox(e.target);
        }
    });
}

function openLightbox(originalImg) {
    document.body.style.overflow = "hidden";

    const clone = document.createElement("img");
    clone.src = originalImg.src;
    clone.classList.add("lightbox-clone");

    clone.onclick = () => {
        clone.classList.add("closing");
        document.body.style.overflow = "";
        setTimeout(() => clone.remove(), 200);
    };

    document.body.appendChild(clone);
}