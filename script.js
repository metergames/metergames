/* script.js */
const SITE_HOME_PATH = "/metergames";
const SITE_NAV_ITEMS = [
    { page: "home", label: "Home", href: SITE_HOME_PATH },
    { page: "parker", label: "Parker", href: "parker" },
    { page: "slicestack", label: "Slice Stack", href: "slicestack" },
    { page: "studysnap", label: "StudySnap", href: "studysnap" },
    { page: "pitwall", label: "Pit Wall", href: "pitwall" },
    { page: "about", label: "About", href: "about" },
];

const OSS_CONTRIB_CONFIG = {
    githubUsername: "metergames",
    repositories: [
        // Format: "owner/repo"
        "petertzy/markdown-reader"
    ],
    maxEntriesPerRepo: 4,
};

const HOME_SPOTLIGHT_PROJECTS = [
    {
        id: "parker",
        title: "Parker",
        href: "parker",
        description: "Precision parking with progression systems, custom level tooling, and rich vehicle behavior.",
        accent: "var(--parker-accent)",
        tags: ["Unity", "3D Physics", "Progression"],
    },
    {
        id: "studysnap",
        title: "StudySnap",
        href: "studysnap",
        description: "A local-first flashcard engine with AI-assisted deck creation and focused study sessions.",
        accent: "var(--study-accent)",
        tags: ["C#", "WPF", "AI Integration"],
    },
    {
        id: "pitwall",
        title: "Pit Wall",
        href: "pitwall",
        description: "A fast Formula 1 dashboard that turns raw API feeds into race-ready insights.",
        accent: "var(--pit-accent)",
        tags: ["React", "TypeScript", "Data Visualization"],
    },
    {
        id: "slicestack",
        title: "Slice Stack",
        href: "slicestack",
        description: "A premium stacking arcade loop built around calm pacing, polish, and satisfying feedback.",
        accent: "var(--slice-accent)",
        tags: ["Mobile", "Gameplay Loop", "UX Polish"],
    },
];

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
    initLightbox();
    initTheme();
    initQuickNavigator();
    initKonami();
    initAboutNudge();
    initProjectSpotlight();
    initOpenSourceContributions();

    if (HAS_FINE_POINTER) {
        initSpotlight();
        initMagneticButtons();
    }

    if (!PREFERS_REDUCED_MOTION) {
        initPageTransitions();
    }
});

function initProjectSpotlight() {
    const section = document.querySelector(".project-spotlight");
    const titleEl = document.getElementById("spotlight-title");
    const descriptionEl = document.getElementById("spotlight-description");
    const tagsEl = document.getElementById("spotlight-tags");
    const linkEl = document.getElementById("spotlight-link");
    const indicatorWrap = document.getElementById("spotlight-indicators");

    if (!section || !titleEl || !descriptionEl || !tagsEl || !linkEl || !indicatorWrap) {
        return;
    }

    const projects = HOME_SPOTLIGHT_PROJECTS;
    const storedIndex = Number.parseInt(localStorage.getItem("home-spotlight-index") || "0", 10);
    let activeIndex = Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < projects.length ? storedIndex : 0;
    let rotationTimer = null;
    let flashTimer = null;

    function renderIndicators() {
        indicatorWrap.innerHTML = projects
            .map(
                (project, index) =>
                    `<button type="button" class="project-spotlight-indicator${index === activeIndex ? " is-active" : ""}" data-index="${index}" aria-label="Show ${escapeHtml(project.title)}"></button>`,
            )
            .join("");
    }

    function setIndicatorState() {
        const buttons = indicatorWrap.querySelectorAll(".project-spotlight-indicator");
        buttons.forEach((button, index) => {
            button.classList.toggle("is-active", index === activeIndex);
            button.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });
    }

    function flashSpotlight() {
        if (flashTimer) {
            window.clearTimeout(flashTimer);
        }

        section.classList.remove("is-flashing");
        // Force a reflow so the same animation can restart reliably on rapid tab changes.
        void section.offsetWidth;
        section.classList.add("is-flashing");

        flashTimer = window.setTimeout(() => {
            section.classList.remove("is-flashing");
        }, 620);
    }

    function renderSpotlight() {
        const project = projects[activeIndex];
        if (!project) {
            return;
        }

        titleEl.textContent = project.title;
        descriptionEl.textContent = project.description;
        linkEl.href = project.href;
        linkEl.textContent = `Explore ${project.title}`;
        section.style.setProperty("--spotlight-accent", project.accent);

        tagsEl.innerHTML = project.tags.map((tag) => `<span class="project-spotlight-tag">${escapeHtml(tag)}</span>`).join("");

        setIndicatorState();
        localStorage.setItem("home-spotlight-index", String(activeIndex));

        if (!PREFERS_REDUCED_MOTION) {
            flashSpotlight();
        }
    }

    function setActiveIndex(nextIndex) {
        activeIndex = (nextIndex + projects.length) % projects.length;
        renderSpotlight();
    }

    function rotateToNext() {
        setActiveIndex(activeIndex + 1);
    }

    function resetRotationTimer() {
        if (rotationTimer) {
            window.clearInterval(rotationTimer);
        }

        if (PREFERS_REDUCED_MOTION) {
            return;
        }

        rotationTimer = window.setInterval(() => {
            rotateToNext();
        }, 6500);
    }

    renderIndicators();
    renderSpotlight();
    resetRotationTimer();

    indicatorWrap.addEventListener("click", (event) => {
        const button = event.target.closest(".project-spotlight-indicator");
        if (!button) {
            return;
        }

        const nextIndex = Number.parseInt(button.getAttribute("data-index") || "0", 10);
        if (!Number.isInteger(nextIndex)) {
            return;
        }

        setActiveIndex(nextIndex);
        resetRotationTimer();
    });

    section.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setActiveIndex(activeIndex + 1);
            resetRotationTimer();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            setActiveIndex(activeIndex - 1);
            resetRotationTimer();
        }
    });
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
        document.body.classList.contains("about-theme");

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

function getQuickNavigatorActions() {
    const pageActions = SITE_NAV_ITEMS.map((item) => ({
        id: `page-${item.page}`,
        label: `Go to ${item.label}`,
        description: "Navigate to page",
        keywords: `${item.label} ${item.page} page navigate`,
        run: () => {
            window.location.href = item.href;
        },
    }));

    return [
        ...pageActions,
        {
            id: "privacy",
            label: "Open Privacy Policy",
            description: "View privacy details",
            keywords: "privacy policy legal",
            run: () => {
                window.location.href = "privacy";
            },
        },
        {
            id: "theme",
            label: "Toggle Theme",
            description: "Switch dark/light mode",
            keywords: "theme dark light mode",
            run: () => {
                toggleTheme();
            },
        },
        {
            id: "surprise",
            label: "Random Project",
            description: "Jump to a random featured project",
            keywords: "random surprise project game",
            run: () => {
                const routes = ["parker", "slicestack", "studysnap", "pitwall"];
                const target = routes[Math.floor(Math.random() * routes.length)];
                window.location.href = target;
            },
        },
    ];
}

function initQuickNavigator() {
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    if (isMobileViewport || isTouchDevice) return;

    if (document.querySelector(".quick-nav-overlay")) return;

    const actions = getQuickNavigatorActions();
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "quick-nav-launcher";
    launcher.setAttribute("aria-label", "Open quick navigator");
    launcher.innerHTML = `
        <span class="quick-nav-launcher-label">Quick Nav</span>
        <span class="quick-nav-launcher-shortcut">Ctrl+K</span>
    `;

    const overlay = document.createElement("div");
    overlay.className = "quick-nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div class="quick-nav-panel" role="dialog" aria-modal="true" aria-label="Quick navigator">
            <div class="quick-nav-input-wrap">
                <input type="text" class="quick-nav-input" placeholder="Type to jump somewhere..." autocomplete="off" />
            </div>
            <ul class="quick-nav-results" role="listbox"></ul>
            <div class="quick-nav-footer">Use ↑ ↓ to move, Enter to launch, Esc to close.</div>
        </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(overlay);

    const input = overlay.querySelector(".quick-nav-input");
    const results = overlay.querySelector(".quick-nav-results");
    let selectedIndex = 0;
    let filteredActions = [...actions];

    function renderResults() {
        if (!results) return;

        if (filteredActions.length === 0) {
            results.innerHTML = '<li class="quick-nav-empty">No matching actions</li>';
            return;
        }

        results.innerHTML = filteredActions
            .map((action, index) => {
                const isSelected = index === selectedIndex;
                return `
                    <li>
                        <button type="button" class="quick-nav-item${isSelected ? " is-selected" : ""}" data-action-index="${index}" role="option" aria-selected="${isSelected}">
                            <span class="quick-nav-item-copy">
                                <strong>${escapeHtml(action.label)}</strong>
                                <span>${escapeHtml(action.description)}</span>
                            </span>
                        </button>
                    </li>
                `;
            })
            .join("");

        syncSelectedIntoView();
    }

    function syncSelectedIntoView() {
        const selected = results.querySelector(`.quick-nav-item[data-action-index="${selectedIndex}"]`);
        if (!selected) return;

        selected.scrollIntoView({
            block: "nearest",
            inline: "nearest",
        });
    }

    function closeNavigator() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        input.value = "";
        filteredActions = [...actions];
        selectedIndex = 0;
        renderResults();
    }

    function openNavigator() {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        filteredActions = [...actions];
        selectedIndex = 0;
        renderResults();

        window.requestAnimationFrame(() => {
            input.focus();
            input.select();
        });
    }

    function executeSelectedAction() {
        const action = filteredActions[selectedIndex];
        if (!action) return;
        closeNavigator();
        action.run();
    }

    launcher.addEventListener("click", () => {
        openNavigator();
    });

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeNavigator();
        }

        const actionButton = event.target.closest(".quick-nav-item");
        if (actionButton) {
            const index = Number(actionButton.getAttribute("data-action-index"));
            if (Number.isInteger(index)) {
                selectedIndex = index;
                executeSelectedAction();
            }
        }
    });

    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        filteredActions = actions.filter((action) => {
            const haystack = `${action.label} ${action.description} ${action.keywords}`.toLowerCase();
            return haystack.includes(query);
        });

        selectedIndex = 0;
        renderResults();
    });

    document.addEventListener("keydown", (event) => {
        const isToggleShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

        if (isToggleShortcut) {
            event.preventDefault();
            if (overlay.classList.contains("is-open")) {
                closeNavigator();
            } else {
                openNavigator();
            }
            return;
        }

        if (!overlay.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeNavigator();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectedIndex = filteredActions.length === 0 ? 0 : (selectedIndex + 1) % filteredActions.length;
            renderResults();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            selectedIndex =
                filteredActions.length === 0
                    ? 0
                    : (selectedIndex - 1 + filteredActions.length) % filteredActions.length;
            renderResults();
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            executeSelectedAction();
        }
    });

    renderResults();
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
 * Home-page CTA nudge.
 * Shows a delayed, non-blocking prompt that links to the About page.
 */
function initAboutNudge() {
    const header = document.querySelector("site-header");
    const isHomePage = header?.getAttribute("page") === "home";
    const isSmallOrTouch = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;

    if (!isHomePage || isSmallOrTouch) return;

    const nudge = document.createElement("div");
    nudge.className = "about-nudge";
    nudge.setAttribute("aria-label", "Learn more about Ryan");
    nudge.innerHTML = `
        <div class="about-nudge-copy">
            <span class="about-nudge-kicker">Curious who built this?</span>
            <a href="about" class="about-nudge-link">check here</a>
        </div>
        <button type="button" class="about-nudge-close" aria-label="Dismiss message" title="Dismiss">x</button>
    `;

    document.body.appendChild(nudge);

    const closeBtn = nudge.querySelector(".about-nudge-close");
    closeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nudge.classList.add("closing");
        setTimeout(() => nudge.remove(), 300);
    });

    // Delay the reveal so it is not an interruption.
    window.setTimeout(() => {
        nudge.classList.add("show");
    }, 5500);
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
