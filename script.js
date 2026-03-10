/* script.js */
document.addEventListener("DOMContentLoaded", () => {
    initBanner();
    initLightbox();
    initTheme();
    initSpotlight();
    initKonami();
    initMagneticButtons();
    initPageTransitions();
});

console.log("%cTry typing the Konami code on the keyboard for a surprise...", "color: #14b8a6; font-size: 14px; font-weight: bold;");

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

/**
 * SPOTLIGHT & 3D TILT EFFECT
 * Tracks mouse movement to move the glowing gradient and physically tilt the card.
 */
function initSpotlight() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'border-color 0.3s ease'; 
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Update Spotlight Variables
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // Calculate 3D Tilt Math
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Max degrees of tilt
            const rotateX = ((y - centerY) / centerY) * -2;
            const rotateY = ((x - centerX) / centerX) * 2;
            
            // Apply the 3D rotation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
        });

        // When mouse leaves, put the slow transition back and reset the card to flat
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, border-color 0.3s ease';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

/**
 * KONAMI CODE EASTER EGG
 * Listens for Konami code key sequence and triggers a barrel roll + achievement toast when activated.
 */
function initKonami() {
    // The keycodes for the Konami sequence
    const konamiSequence = [
        "ArrowUp", "ArrowUp", 
        "ArrowDown", "ArrowDown", 
        "ArrowLeft", "ArrowRight", 
        "ArrowLeft", "ArrowRight", 
        "b", "a"
    ];
    let position = 0;

    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a' ? e.key.toLowerCase() : e.key;
        
        // If the key matches the current position in the sequence
        if (key === konamiSequence[position]) {
            position++;
            
            // If the whole sequence is completed
            if (position === konamiSequence.length) {
                triggerEasterEgg();
                position = 0; // Reset so they can do it again
            }
        } else {
            position = 0; // Reset if they mess up
        }
    });
}

/**
 * Triggers the Easter Egg: A barrel roll animation and a secret achievement toast.
 */
function triggerEasterEgg() {
    // Do a barrel roll
    document.body.classList.add("barrel-roll");
    
    // Remove the class after animation finishes so it can be triggered again
    setTimeout(() => {
        document.body.classList.remove("barrel-roll");

        showAchievement("Cheat Code Activated!", "Real gamer over here! +30 lives... right?");
    }, 1500);
}

/**
 * Creates and displays a sleek gaming-style achievement toast
 */
function showAchievement(title, message) {
    // Prevent spamming if they enter the code multiple times fast
    if (document.querySelector(".achievement-toast")) return;

    // Create the toast element
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
        <div class="achievement-text">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(toast);

    // Trigger the slide-up animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove it after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        // Wait for slide-down animation to finish before deleting the element
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/**
 * MAGNETIC BUTTONS
 * Buttons subtly pull towards the mouse cursor on hover.
 */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate distance from the center of the button
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Prevent sub-pixel rendering (which causes blur)
            const moveX = Math.round(x * 0.08);
            const moveY = Math.round(y * 0.12);
            
            // Apply the movement with a Z-axis lock to keep text crisp
            btn.style.transform = `translate(${moveX}px, ${moveY}px) translateZ(0)`;
        });

        btn.addEventListener('mouseleave', () => {
            // Snap back to default CSS rules when mouse leaves
            btn.style.transform = ''; 
        });
    });
}

/**
 * CASCADING PAGE LOAD ANIMATIONS
 * Smoothly fades and floats elements in sequentially on load.
 */
function initPageTransitions() {
    // Stagger the Hero Section
    const heroElements = document.querySelectorAll('.hero h1, .hero p, .hero div, .hero .btn, .hero .screenshot-row');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0'; 
        el.style.animation = `fadeUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${index * 0.1}s forwards`;
        
        // Once the animation finishes, unlock the transform property so hover effects work
        el.addEventListener('animationend', () => {
            el.style.opacity = '1';      // Lock opacity to visible
            el.style.animation = 'none'; // Delete the animation lock
        });
    });

    // Stagger the Grid Cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${0.3 + (index * 0.1)}s forwards`;
        
        // Unlock the cards so the 3D tilt can take over
        card.addEventListener('animationend', () => {
            card.style.opacity = '1';
            card.style.animation = 'none';
        });
    });
}