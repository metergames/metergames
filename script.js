/* script.js */
const SITE_HOME_PATH = "/metergames";
const SITE_NAV_ITEMS = [
    { page: "home", label: "Home", href: SITE_HOME_PATH },
    { page: "parker", label: "Parker", href: "parker" },
    { page: "slicestack", label: "Slice Stack", href: "slicestack" },
    { page: "studysnap", label: "StudySnap", href: "studysnap" },
    { page: "pitwall", label: "Pit Wall", href: "pitwall" },
    { page: "cipher", label: "Cipher", href: "cipher" },
    { page: "about", label: "About", href: "about" },
];

const OSS_CONTRIB_CONFIG = {
    githubUsername: "metergames",
    repositories: [
        // Format: "owner/repo"
        "petertzy/markdown-reader",
        "nextcloud/passman-android",
    ],
    maxEntriesPerRepo: 4,
};

class SiteHeader extends HTMLElement {
    connectedCallback() {
        const activePage = this.getAttribute("page") || "home";

        this.innerHTML = `
            <header class="header">
                <div class="logo">
                    <a href="${SITE_HOME_PATH}">
                        <img src="images/logo.webp" alt="Meter Games Logo" />
                    </a>
                </div>
                <nav>
                    ${SITE_NAV_ITEMS.map((item) => renderNavLink(item, activePage)).join("")}
                </nav>
            </header>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <p>&copy; 2026 Meter Games. All rights reserved.</p>
                <p><a href="privacy">Privacy Policy</a></p>
                <p><a href="terms">Terms of Use</a></p>
            </footer>
        `;
    }
}

function renderNavLink(item, activePage) {
    const isActive = item.page === activePage;

    return `
        <a href="${item.href}" class="nav-link${isActive ? " active" : ""}"${isActive ? ' aria-current="page"' : ""}>
            ${item.label}
        </a>
    `;
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);

const HAS_FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const PREFERS_REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
    initBanner();
    initCipherScreenshotTheme();
    initLightbox();
    initTheme();
    initChangelog();
    initKonami();
    initOpenSourceContributions();

    if (HAS_FINE_POINTER) {
        initSpotlight();
        initMagneticButtons();
    }

    if (!PREFERS_REDUCED_MOTION) {
        initPageTransitions();
    }
});

function initCipherScreenshotTheme() {
    const switcher = document.querySelector(".cipher-theme-switcher");
    const galleries = document.querySelectorAll("[data-cipher-screenshot-gallery]");
    if (!switcher || galleries.length === 0) return;

    const buttons = Array.from(switcher.querySelectorAll("[data-cipher-theme]"));
    const shots = Array.from(document.querySelectorAll(".theme-shot[data-shot-theme]"));
    const availableThemes = buttons.map((button) => button.dataset.cipherTheme);
    const savedTheme = localStorage.getItem("cipherScreenshotTheme");
    const defaultTheme = availableThemes.includes(savedTheme) ? savedTheme : "hacker";

    const applyFrameColor = (shot) => {
        const frame = shot.closest(".cipher-phone-frame");
        if (!frame || !shot.dataset.topSampleColor) return;

        frame.style.setProperty("--cipher-screenshot-top-color", shot.dataset.topSampleColor);
    };

    const sampleTopColor = (shot) => {
        if (!shot.naturalWidth || !shot.naturalHeight) return;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;

        canvas.width = 1;
        canvas.height = 1;

        const sampleX = Math.max(0, Math.min(shot.naturalWidth - 1, Math.floor(shot.naturalWidth / 3)));
        const sampleY = Math.min(shot.naturalHeight - 1, 4);
        context.drawImage(shot, sampleX, sampleY, 1, 1, 0, 0, 1, 1);

        const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
        shot.dataset.topSampleColor = alpha === 255 ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;

        if (shot.classList.contains("is-active")) {
            applyFrameColor(shot);
        }
    };

    shots.forEach((shot) => {
        if (shot.complete) {
            sampleTopColor(shot);
        } else {
            shot.addEventListener("load", () => sampleTopColor(shot), { once: true });
        }
    });

    const setActiveTheme = (theme) => {
        if (!availableThemes.includes(theme)) return;

        localStorage.setItem("cipherScreenshotTheme", theme);

        galleries.forEach((gallery) => {
            gallery.dataset.activeTheme = theme;
        });

        buttons.forEach((button) => {
            const isActive = button.dataset.cipherTheme === theme;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        shots.forEach((shot) => {
            const isActive = shot.dataset.shotTheme === theme;
            shot.classList.toggle("is-active", isActive);
            shot.setAttribute("aria-hidden", String(!isActive));

            if (isActive) {
                applyFrameColor(shot);
            }
        });
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveTheme(button.dataset.cipherTheme);
        });
    });

    setActiveTheme(defaultTheme);
}
function initOpenSourceContributions() {
    const container = document.getElementById("oss-contrib-list");
    if (!container) return;

    const repos = OSS_CONTRIB_CONFIG.repositories;
    if (!Array.isArray(repos) || repos.length === 0) {
        container.innerHTML = `
            <div class="card open-source-card">
                <h3>No repositories configured yet</h3>
                <p>
                    Add repositories in the OSS_CONTRIB_CONFIG block inside script.js using the format owner/repo.
                </p>
            </div>
        `;
        return;
    }

    fetchAndRenderContributions(container).catch((err) => {
        console.error("Could not load open source contributions:", err);
        container.innerHTML = `
            <div class="card open-source-card">
                <h3>Contributions unavailable</h3>
                <p>
                    GitHub data could not be loaded right now. Please try again later.
                </p>
            </div>
        `;
    });
}

async function fetchAndRenderContributions(container) {
    const { repositories, githubUsername, maxEntriesPerRepo } = OSS_CONTRIB_CONFIG;

    const repoResults = await Promise.all(
        repositories.map(async (repoName) => {
            const pulls = await fetchMergedPullRequestsForRepo(repoName, githubUsername);
            const metadata = await fetchRepositoryMetadata(repoName);
            return {
                repoName,
                pulls,
                metadata,
            };
        }),
    );

    const reposWithContribs = repoResults.filter((repo) => repo.pulls.length > 0);

    if (reposWithContribs.length === 0) {
        container.innerHTML = `
            <div class="card open-source-card">
                <h3>No merged PRs found</h3>
                <p>
                    No merged pull requests were found for the configured repositories and username.
                </p>
            </div>
        `;
        return;
    }

    reposWithContribs.sort((a, b) => {
        const aLatest = new Date(a.pulls[0].merged_at).getTime();
        const bLatest = new Date(b.pulls[0].merged_at).getTime();
        return bLatest - aLatest;
    });

    container.innerHTML = reposWithContribs
        .map((repo) => {
            const items = repo.pulls.slice(0, maxEntriesPerRepo);

            const itemMarkup = items
                .map((pr) => {
                    const mergedDate = formatDate(pr.merged_at);
                    return `
                        <div class="open-source-pr-item">
                            <a href="${pr.html_url}" target="_blank" rel="noreferrer">${escapeHtml(pr.title)}</a>
                            <div class="open-source-pr-meta">#${pr.number} merged on ${mergedDate}</div>
                        </div>
                    `;
                })
                .join("");

            const { description, stars, languages } = repo.metadata;
            const safeDescription = description ? escapeHtml(description) : "No repository description provided.";
            const languageMarkup =
                languages.length > 0
                    ? languages.map((lang) => `<span class="skill-badge">${escapeHtml(lang)}</span>`).join("")
                    : '<span class="skill-badge">Languages unavailable</span>';

            return `
                <div class="card open-source-card">
                    <div class="open-source-repo">
                        <div class="open-source-repo-title-group">
                            <h3>${escapeHtml(repo.repoName)}</h3>
                            <span class="open-source-stars-bubble" aria-label="${stars.toLocaleString()} stars">
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"></path></svg>
                                ${stars.toLocaleString()}
                            </span>
                        </div>
                        <span class="open-source-count">${repo.pulls.length} merged PR${repo.pulls.length === 1 ? "" : "s"}</span>
                    </div>
                    <p class="open-source-repo-desc">${safeDescription}</p>
                    <div class="skill-container open-source-language-list">
                        ${languageMarkup}
                    </div>
                    <div class="open-source-pr-list">
                        ${itemMarkup}
                    </div>
                </div>
            `;
        })
        .join("");

    if (HAS_FINE_POINTER) {
        initSpotlight(container);
    }
}

async function fetchRepositoryMetadata(repoName) {
    const repoEndpoint = `https://api.github.com/repos/${repoName}`;
    const languageEndpoint = `https://api.github.com/repos/${repoName}/languages`;

    const [repoResponse, languageResponse] = await Promise.all([fetch(repoEndpoint), fetch(languageEndpoint)]);

    if (!repoResponse.ok) {
        throw new Error(`GitHub repo metadata error for ${repoName}: ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();
    const description = repoData?.description || "";
    const stars = typeof repoData?.stargazers_count === "number" ? repoData.stargazers_count : 0;

    let languages = [];
    if (languageResponse.ok) {
        const languageData = await languageResponse.json();
        if (languageData && typeof languageData === "object") {
            languages = Object.entries(languageData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([language]) => language);
        }
    }

    if (languages.length === 0 && typeof repoData?.language === "string" && repoData.language.trim() !== "") {
        languages = [repoData.language.trim()];
    }

    return {
        description,
        stars,
        languages,
    };
}

async function fetchMergedPullRequestsForRepo(repoName, username) {
    const allPulls = [];
    const pagesToCheck = 3;

    for (let page = 1; page <= pagesToCheck; page++) {
        const endpoint = `https://api.github.com/repos/${repoName}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`GitHub API error for ${repoName}: ${response.status}`);
        }

        const pulls = await response.json();
        if (!Array.isArray(pulls) || pulls.length === 0) {
            break;
        }

        allPulls.push(...pulls);

        if (pulls.length < 100) {
            break;
        }
    }

    return allPulls
        .filter((pr) => pr?.user?.login?.toLowerCase() === username.toLowerCase() && Boolean(pr.merged_at))
        .sort((a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime());
}

function formatDate(dateValue) {
    if (!dateValue) return "unknown date";

    return new Date(dateValue).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function escapeHtml(value) {
    if (typeof value !== "string") return "";

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

console.log(
    "%cTry typing the Konami code on the keyboard for a surprise...",
    "color: #14b8a6; font-size: 14px; font-weight: bold;",
);

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
        toggleTheme();
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateLogo(theme);

    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
        themeToggle.innerHTML = getThemeIcon(theme);
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
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
    const isGamePage =
        document.body.classList.contains("parker-theme") ||
        document.body.classList.contains("slice-theme") ||
        document.body.classList.contains("study-theme") ||
        document.body.classList.contains("pit-theme") ||
        document.body.classList.contains("about-theme") ||
        document.body.classList.contains("cipher-theme");

    if (!isGamePage) {
        // We are on Index or Privacy page
        const logoImg = document.querySelector(".logo img");
        if (logoImg) {
            logoImg.src = "images/logo.webp";
        }
    }
}

/**
 * Initializes the random banner loader (Parker Page).
 */
function initBanner() {
    const container = document.getElementById("banner-container");
    if (!container) return;

    const banners = ["images/parker-banner.webp", "images/parker-banner-2.webp"];

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
 * CHANGELOG "SHOW ALL" TOGGLE
 * Collapses long update logs (e.g. Cipher) to the most recent entries behind an
 * expand/collapse button. Degrades gracefully: with no JS the full list shows.
 * Short logs (e.g. Parker) are left untouched.
 */
function initChangelog() {
    const VISIBLE_WHEN_COLLAPSED = 5;

    document.querySelectorAll(".changelog-box").forEach((box) => {
        const entries = Array.from(box.querySelectorAll(".version-entry"));
        if (entries.length <= VISIBLE_WHEN_COLLAPSED + 1) {
            return;
        }

        box.classList.add("is-collapsible");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn changelog-toggle";

        const collapse = () => {
            entries.forEach((entry, index) => {
                entry.classList.toggle("is-hidden", index >= VISIBLE_WHEN_COLLAPSED);
            });
            toggle.textContent = `Show all ${entries.length} versions`;
            toggle.setAttribute("aria-expanded", "false");
        };

        const expand = () => {
            entries.forEach((entry) => entry.classList.remove("is-hidden"));
            toggle.textContent = "Show fewer versions";
            toggle.setAttribute("aria-expanded", "true");
        };

        let collapsed = true;
        collapse();

        toggle.addEventListener("click", () => {
            collapsed = !collapsed;
            if (collapsed) {
                collapse();
                box.parentElement?.scrollIntoView({
                    behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth",
                    block: "start",
                });
            } else {
                expand();
            }
        });

        box.insertAdjacentElement("afterend", toggle);
    });
}

/**
 * SPOTLIGHT & 3D TILT EFFECT
 * Tracks mouse movement to move the glowing gradient and physically tilt the card.
 */
function initSpotlight(scope = document) {
    const cards = scope.querySelectorAll(".card");

    cards.forEach((card) => {
        if (card.dataset.spotlightBound === "true") {
            return;
        }
        card.dataset.spotlightBound = "true";

        card.addEventListener("mouseenter", () => {
            card.style.transition = "border-color 0.3s ease";
        });

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const isOpenSourceCard = card.classList.contains("open-source-card");

            // Update Spotlight Variables
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            // Keep open-source cards flat while still tracking glow position.
            if (isOpenSourceCard) {
                return;
            }

            // Calculate 3D Tilt Math
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Scale tilt by card size so large panels feel less aggressive.
            const dominantSize = Math.max(rect.width, rect.height);
            const maxTilt = Math.min(2.2, Math.max(0.9, 900 / dominantSize));
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            // Apply the 3D rotation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
        });

        // When mouse leaves, put the slow transition back and reset the card to flat
        card.addEventListener("mouseleave", () => {
            if (card.classList.contains("open-source-card")) {
                return;
            }

            card.style.transition = "transform 0.5s ease, border-color 0.3s ease";
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
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a",
    ];
    let position = 0;

    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase() === "b" || e.key.toLowerCase() === "a" ? e.key.toLowerCase() : e.key;

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
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
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

        btn.addEventListener("mouseleave", () => {
            // Snap back to default CSS rules when mouse leaves
            btn.style.transform = "";
        });
    });
}

/**
 * CASCADING PAGE LOAD ANIMATIONS
 * Smoothly fades and floats elements in sequentially on load.
 */
function initPageTransitions() {
    // Stagger the Hero Section
    const heroElements = document.querySelectorAll(".hero h1, .hero p, .hero div, .hero .btn, .hero .screenshot-row");
    heroElements.forEach((el, index) => {
        el.style.opacity = "0";
        el.style.animation = `fadeUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${index * 0.1}s forwards`;

        // Once the animation finishes, unlock the transform property so hover effects work
        el.addEventListener("animationend", () => {
            el.style.opacity = "1"; // Lock opacity to visible
            el.style.animation = "none"; // Delete the animation lock
        });
    });

    // Stagger the Grid Cards
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.animation = `fadeUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${0.3 + index * 0.1}s forwards`;

        // Unlock the cards so the 3D tilt can take over
        card.addEventListener("animationend", () => {
            card.style.opacity = "1";
            card.style.animation = "none";
        });
    });
}
