/* script.js */
document.addEventListener("DOMContentLoaded", () => {
    initBanner();
    initLightbox();
});

/**
 * Initializes the random banner loader.
 * Checks for #banner-container presence to avoid errors on other pages.
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
 * Sets up global click delegation for lightbox images.
 * Eliminates the need for onclick="..." attributes in HTML.
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

    // Close on click
    clone.onclick = () => {
        clone.classList.add("closing");
        document.body.style.overflow = "";
        
        // Remove from DOM after animation finishes (200ms)
        setTimeout(() => clone.remove(), 200);
    };

    document.body.appendChild(clone);
}