import {
  getAllThemesFromGitHub,
  saveThemeToGitHub,
  getThemeFromGitHub,
} from "../utils/github.js";

// Helper functions for error display
function getErrorIcon(errorType) {
  const icons = {
    authentication: "lock",
    configuration: "settings",
    network_error: "wifi_off",
    timeout: "schedule",
    permissions: "block",
    repository_not_found: "folder_off",
    validation: "rule",
    preview_upload: "image_not_supported",
    api_error: "api",
    server_error: "dns",
    unknown: "error",
  };
  return icons[errorType] || icons.unknown;
}

function getErrorTitle(errorType) {
  const titles = {
    authentication: "Authentication Failed",
    configuration: "Configuration Error",
    network_error: "Network Error",
    timeout: "Request Timeout",
    permissions: "Permission Denied",
    repository_not_found: "Repository Not Found",
    validation: "Validation Error",
    preview_upload: "Preview Upload Failed",
    api_error: "GitHub API Error",
    server_error: "Server Error",
    unknown: "Submission Failed",
  };
  return titles[errorType] || titles.unknown;
}

function getErrorHelp(errorType) {
  const help = {
    authentication:
      "Please check that your GitHub token is valid and has the necessary permissions.",
    configuration:
      "The server configuration is missing required GitHub settings. Contact the administrator.",
    network_error: "Please check your internet connection and try again.",
    timeout:
      "The request took too long to complete. Please try again with a smaller file.",
    permissions:
      "Your GitHub token doesn't have write permissions to this repository.",
    repository_not_found:
      "The specified GitHub repository doesn't exist or isn't accessible.",
    validation:
      "The theme data or file path is invalid. Please check your JSON format.",
    preview_upload:
      "The preview image couldn't be uploaded. Try with a smaller image or different format.",
    api_error:
      "GitHub's API returned an error. This might be temporary - please try again.",
    server_error:
      "GitHub's servers are experiencing issues. Please try again later.",
    unknown:
      "An unexpected error occurred. Please try again or contact support.",
  };
  return help[errorType] || help.unknown;
}

// Reusable function to generate the standard navbar HTML
export function getNavbarHtml(activePage, isAdmin) {
  const adminLink = isAdmin
    ? `
        <a href="/admin/dashboard" class="nav-btn ${activePage === "admin" ? "active" : ""}">
            <span class="material-symbols-outlined">shield_person</span>
            <span>Admin Panel</span>
        </a>
        <form method="POST" action="/admin/logout" style="display: inline;">
            <button type="submit" class="nav-btn logout-btn">
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        </form>`
    : `
        <a href="/admin/login" class="nav-btn ${activePage === "admin" ? "active" : ""}">
            <span class="material-symbols-outlined">shield_person</span>
            <span>Admin</span>
        </a>`;

  return `
    <header>
        <div class="container">
            <nav class="navbar" role="navigation" aria-label="Main">
                <a href="/" class="logo">
                    <span class="material-symbols-outlined" aria-hidden="true">palette</span>
                    <span>ThemeHub</span>
                </a>
                <button id="navToggle" class="nav-btn mobile-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="mobileDrawer">
                    <span class="hamburger" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
                <div class="nav-links" id="navLinks">
                    <a href="/" class="nav-btn ${activePage === "home" ? "active" : ""}">
                        <span class="material-symbols-outlined" aria-hidden="true">home</span>
                        <span>Home</span>
                    </a>
                    <a href="/build" class="nav-btn ${activePage === "building" ? "active" : ""}">
                        <span class="material-symbols-outlined" aria-hidden="true">construction</span>
                        <span>Building</span>
                    </a>
                    <a href="/submit" class="nav-btn ${activePage === "submit" ? "active" : ""}">
                        <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
                        <span>Submit Theme</span>
                    </a>
                    <a href="/submit-repo" class="nav-btn ${activePage === "submit-repo" ? "active" : ""}">
                        <span class="material-symbols-outlined" aria-hidden="true">folder_shared</span>
                        <span>Submit Repo</span>
                    </a>
                    <a href="/repositories" class="nav-btn ${activePage === "repositories" ? "active" : ""}">
                        <span class="material-symbols-outlined" aria-hidden="true">folder_open</span>
                        <span>Repositories</span>
                    </a>
                    ${adminLink}
                    <button id="themeToggle" class="nav-btn theme-toggle">
                        <span class="material-symbols-outlined" aria-hidden="true">light_mode</span>
                        <span>Light Mode</span>
                    </button>
                </div>
            </nav>
        </div>
        <!-- Mobile drawer -->
        <aside id="mobileDrawer" class="mobile-drawer" aria-hidden="true" tabindex="-1">
            <div class="drawer-links">
                <a href="/" class="nav-btn ${activePage === "home" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">home</span><span>Home</span></a>
                <a href="/build" class="nav-btn ${activePage === "building" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">construction</span><span>Building</span></a>
                <a href="/submit" class="nav-btn ${activePage === "submit" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">add_circle</span><span>Submit Theme</span></a>
                <a href="/submit-repo" class="nav-btn ${activePage === "submit-repo" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">folder_shared</span><span>Submit Repo</span></a>
                <a href="/repositories" class="nav-btn ${activePage === "repositories" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span><span>Repositories</span></a>
                ${adminLink}
                <button id="themeToggleMobile" class="nav-btn theme-toggle"><span class="material-symbols-outlined" aria-hidden="true">light_mode</span><span>Light Mode</span></button>
            </div>
        </aside>
    </header>
    <style>
    header .container { position: relative; }
    .icon-btn { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 6px; border-radius: 8px; }
    .icon-btn:hover { background: var(--md-sys-color-primary-container); }
         /* Remove tap highlight on mobile */
     *, *:focus, *:active { -webkit-tap-highlight-color: transparent; }
     .nav-btn, .btn, .icon-btn, a, button { -webkit-tap-highlight-color: transparent; outline: none; }

    /* Desktop: show inline links */
    @media (min-width: 769px) {
        .mobile-toggle { display: none !important; }
        .nav-links { display: flex !important; }
        .mobile-overlay { display: none !important; }
        .mobile-drawer { display: none !important; }
    }

    /* Mobile: hide inline links, use drawer */
    @media (max-width: 768px) {
        .nav-links { display: none !important; }
        .mobile-toggle {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; padding: 0; border-radius: 10px;
            position: absolute; right: 8px; top: 8px; background: transparent;
            border: none;
            box-shadow: none;
            color: inherit;
            touch-action: manipulation;
            transition: background-color .2s ease, border-color .2s ease, color .2s ease;
        }
        .mobile-toggle .material-symbols-outlined { font-size: 22px; }
        .mobile-overlay { display: none !important; }

        /* Drawer integrated under header */
        header { position: sticky; top: 0; z-index: 100; }
        .mobile-drawer { position: sticky; top: 0; background: var(--md-sys-color-surface); border-bottom: 1px solid transparent; z-index: 90; overflow: hidden; max-height: 0; opacity: 0; transition: max-height .24s cubic-bezier(.2,.8,.2,1), opacity .16s ease, background-color .2s ease, border-color .2s ease; will-change: max-height, opacity; margin: 0; }
        .mobile-drawer.open { opacity: 1; border-bottom-color: var(--md-sys-color-outline); }
        .drawer-links { display: flex; flex-direction: column; padding: 12px; gap: 8px; }
        .drawer-links .nav-btn { width: 100%; justify-content: flex-start; padding: 14px 12px; font-size: 1.05rem; border-radius: 12px; transition: background-color .2s ease, color .2s ease, border-color .2s ease; }

        /* Hamburger animation */
        .hamburger { position: relative; width: 18px; height: 14px; display: inline-block; }
        .hamburger span { position: absolute; left: 0; right: 0; height: 2px; background: currentColor; border-radius: 2px; transition: transform .22s cubic-bezier(.2,.8,.2,1), opacity .14s ease, background-color .2s ease, color .2s ease; }
        .hamburger span:nth-child(1) { top: 0; }
        .hamburger span:nth-child(2) { top: 6px; }
        .hamburger span:nth-child(3) { bottom: 0; }
        .mobile-toggle[aria-expanded="true"] .hamburger span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .mobile-toggle[aria-expanded="true"] .hamburger span:nth-child(2) { opacity: 0; }
        .mobile-toggle[aria-expanded="true"] .hamburger span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    }
    </style>
    <script>
    (function(){
        try {
            const body = document.body;
            const toggle = document.getElementById('themeToggle');
            const toggleMobile = document.getElementById('themeToggleMobile');
            const menuBtn = document.getElementById('navToggle');
            const drawer = document.getElementById('mobileDrawer');

            // Open drawer: set ARIA, animate by max-height based on content
            function openDrawer(){
                drawer.classList.add('open');
                drawer.setAttribute('aria-hidden','false');
                if (menuBtn) menuBtn.setAttribute('aria-expanded','true');
                const target = Math.min(drawer.scrollHeight, Math.round(window.innerHeight * 0.75));
                drawer.style.maxHeight = target + 'px';
            }
            // Close drawer: collapse height and reset ARIA
            function closeDrawer(){
                drawer.style.maxHeight = '0px';
                drawer.classList.remove('open');
                drawer.setAttribute('aria-hidden','true');
                if (menuBtn) menuBtn.setAttribute('aria-expanded','false');
            }

            if (menuBtn && drawer) {
                // Toggle drawer from navbar button (hamburger ↔ X)
                menuBtn.addEventListener('click', () => {
                    const isOpen = drawer.classList.contains('open');
                    if (isOpen) closeDrawer(); else openDrawer();
                });
                // Allow closing with ESC and after navigation
                drawer.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeDrawer(); });
                drawer.querySelectorAll('.drawer-links a, .drawer-links button:not(.theme-toggle)').forEach((el)=>{
                    el.addEventListener('click', closeDrawer);
                });
                // Keep animation smooth on viewport changes
                window.addEventListener('resize', () => {
                    if (!drawer.classList.contains('open')) return;
                    const target = Math.min(drawer.scrollHeight, Math.round(window.innerHeight * 0.75));
                    drawer.style.maxHeight = target + 'px';
                });
            }

            function syncThemeButton(btn){
                if (!btn) return;
                const icon = btn.querySelector('.material-symbols-outlined');
                const label = btn.querySelector('span:nth-child(2)');
                const isDark = document.documentElement.classList.contains('dark-mode');
                if (isDark) { if (icon) icon.textContent = 'light_mode'; if (label) label.textContent = 'Light Mode'; }
                else { if (icon) icon.textContent = 'dark_mode'; if (label) label.textContent = 'Dark Mode'; }
            }

            function initTheme(btn){
                const saved = localStorage.getItem('theme');
                const initialDark = saved ? saved === 'dark' : true; // default dark
                if (initialDark) document.documentElement.classList.add('dark-mode'); else document.documentElement.classList.remove('dark-mode');
                syncThemeButton(btn);
            }

            // Initialize and wire up both theme buttons
            initTheme(toggle);
            initTheme(toggleMobile);
            [toggle, toggleMobile].forEach((btn)=>{
                if (!btn) return;
                btn.addEventListener('click', ()=>{
                    const nextDark = !document.documentElement.classList.contains('dark-mode');
                    if (nextDark) document.documentElement.classList.add('dark-mode'); else document.documentElement.classList.remove('dark-mode');
                    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
                    syncThemeButton(toggle);
                    syncThemeButton(toggleMobile);
                });
            });
        } catch(_) {}
    })();
    </script>
    `;
}

// Reusable CSS style block
export const sharedStyles = `
<style>
    :root {
        --md-sys-color-primary: #3355dd;
        --md-sys-color-on-primary: #ffffff;
        --md-sys-color-primary-container: #d4dcff;
        --md-sys-color-on-primary-container: #001847;
        --md-sys-color-secondary: #51606f;
        --md-sys-color-on-secondary: #ffffff;
        --md-sys-color-secondary-container: #c5d4e6;
        --md-sys-color-on-secondary-container: #0d1d2a;
        --md-sys-color-surface: #f0f2f5;
        --md-sys-color-on-surface: #1a1c1e;
        --md-sys-color-surface-variant: #e3e6eb;
        --md-sys-color-on-surface-variant: #42474e;
        --md-sys-color-outline: #73777f;
        --md-sys-color-background: #e8eaed;
        --md-sys-color-background-variant: #e0e2e5;
        --md-sys-color-error: #ba1a1a;
        --md-sys-color-error-container: #ffdad6;
        --md-sys-color-on-error-container: #410002;
        --md-sys-color-success: #006d3a;
        --md-sys-color-success-container: #99f7b5;
        --md-sys-color-on-success-container: #00210d;
        --md-sys-color-shadow: rgba(0, 0, 0, 0.15);

        /* Search bar colors - Light Mode Defaults */
        --search-background-color: #ffffff;
        --search-text-color: #1a1c1e;
        --search-border-color: #e0e0e0;
        --search-placeholder-color: #73777f;
    }
    /* Dark Theme */
    .dark-mode {
        --md-sys-color-primary: #adc6ff;
        --md-sys-color-on-primary: #002578;
        --md-sys-color-primary-container: #1c3999;
        --md-sys-color-on-primary-container: #dbe3ff;
        --md-sys-color-secondary: #b8c8da;
        --md-sys-color-on-secondary: #233240;
        --md-sys-color-secondary-container: #394857;
        --md-sys-color-on-secondary-container: #d4e4f6;
        --md-sys-color-surface: #1a1c1e;
        --md-sys-color-on-surface: #e2e2e5;
        --md-sys-color-surface-variant: #282b30;
        --md-sys-color-on-surface-variant: #c2c7cf;
        --md-sys-color-outline: #8c9199;
        --md-sys-color-background: #121416;
        --md-sys-color-background-variant: #1a1c1e;
        --md-sys-color-error: #ffb4ab;
        --md-sys-color-error-container: #93000a;
        --md-sys-color-on-error-container: #ffdad6;
        --md-sys-color-success: #6bdd9b;
        --md-sys-color-success-container: #00522a;
        --md-sys-color-on-success-container: #99f7b5;
        --md-sys-color-shadow: rgba(0, 0, 0, 0.4);

        /* Search bar colors - Dark Mode */
        --search-background-color: #1f1f1f;
        --search-text-color: #e0e0e0;
        --search-border-color: #333;
        --search-placeholder-color: #8c9199;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Roboto', sans-serif;
        background-color: var(--md-sys-color-background-variant);
        color: var(--md-sys-color-on-surface);
        line-height: 1.6;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header {
        background-color: var(--md-sys-color-surface);
        border-bottom: 1px solid var(--md-sys-color-outline);
        position: sticky;
        top: 0;
        z-index: 100;
        transition: background-color 0.3s ease, border-bottom 0.3s ease;
    }

    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }

    .logo {
        display: flex; align-items: center; gap: 6px; font-size: 1.25rem;
        font-weight: 700; color: var(--md-sys-color-primary); text-decoration: none;
    }
    .navbar .material-symbols-outlined { font-size: 20px; }

    .nav-links { display: flex; gap: 6px; align-items: center; }

    .nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        color: var(--md-sys-color-on-surface-variant);
        font-weight: 500;
        padding: 8px 12px;
        border-radius: 12px;
        transition: background-color 0.2s ease, color 0.2s ease;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.95rem;
        line-height: 1;
    }
    /* Ensure navbar color propagates to hamburger via currentColor */
    .navbar { color: var(--md-sys-color-on-surface-variant); }
    .navbar .logo { color: var(--md-sys-color-primary); }

    .nav-btn:hover {
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }

    .nav-btn.active {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }

    .logout-btn {
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
    }
    .logout-btn:hover {
        background-color: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
    }
    .theme-toggle {
        background-color: var(--md-sys-color-secondary-container);
        border: none;
        color: var(--md-sys-color-on-secondary-container);
        padding: 10px 16px;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        font-family: inherit;
        font-size: inherit;
    }
    .theme-toggle:hover {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
    }
    main { padding: 48px 0; }
    .page-header {
        text-align: center;
        margin-bottom: 48px;
    }
    .page-header h1 {
        font-size: 2.8rem;
        font-weight: 700;
        color: var(--md-sys-color-on-surface);
        margin-bottom: 16px;
    }
    .page-header p {
        font-size: 1.2rem;
        color: var(--md-sys-color-on-surface-variant);
        max-width: 600px;
        margin: 0 auto;
    }
    .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 32px;
        margin-top: 32px;
    }
    .theme-card {
        background-color: var(--md-sys-color-background);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.3s ease, transform 0.3s ease;
        box-shadow: 0 1px 3px var(--md-sys-color-shadow);
    }

    /* Keep previews consistent (crop 9:16 phone shots to 16:9) */
    .theme-preview {
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background-color: var(--md-sys-color-surface-variant);
        border-bottom: 1px solid var(--md-sys-color-outline);
    }
    .theme-preview.portrait { aspect-ratio: 9 / 16; }
    .theme-preview img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover; /* center-crop tall images */
        object-position: center;
    }

    .theme-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px var(--md-sys-color-shadow); }
    .theme-header { padding: 24px; border-bottom: 1px solid var(--md-sys-color-outline); }
    .theme-title { font-size: 1.5rem; color: var(--md-sys-color-on-surface); font-weight: 500; }
    .theme-meta { color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; margin-top: 8px; }
    .theme-body {
        padding: 24px;
        flex-grow: 1;
    }
    .theme-description {
        color: var(--md-sys-color-on-surface-variant);
        margin-bottom: 24px;
        line-height: 1.5;
    }
    .theme-actions {
        padding: 16px 24px;
        background-color: var(--md-sys-color-surface-variant);
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 20px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        justify-content: center;
        box-shadow: 0 1px 2px var(--md-sys-color-shadow);
    }
    .btn-filled {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }
    .btn-filled:hover {
        background-color: var(--md-sys-color-primary);
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px var(--md-sys-color-shadow);
    }
    .btn-outlined {
        background-color: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-primary);
    }
    .btn-outlined:hover {
        background-color: var(--md-sys-color-surface-variant);
        border-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px var(--md-sys-color-shadow);
    }
    .btn-copy {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }
    .btn-copy:hover {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
    }
    .empty-state {
        text-align: center;
        padding: 64px 24px;
    }
    .empty-state .material-symbols-outlined {
        font-size: 4rem;
        color: var(--md-sys-color-secondary-container);
        margin-bottom: 24px;
    }
    .empty-state h3 {
        font-size: 1.8rem;
        color: var(--md-sys-color-on-surface);
        margin-bottom: 16px;
    }
    .empty-state p {
        color: var(--md-sys-color-on-surface-variant);
        margin-bottom: 24px;
    }
    footer {
        background-color: var(--md-sys-color-surface);
        border-top: 1px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-on-surface-variant);
        text-align: center;
        padding: 32px 0;
        margin-top: 64px;
        transition: background-color 0.3s ease, border 0.3s ease, color 0.3s ease;
    }
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: var(--md-sys-color-success);
        color: var(--md-sys-color-on-success-container);
        border-radius: 8px;
        box-shadow: 0 4px 6px var(--md-sys-color-shadow);
        transform: translateX(200%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    .notification.show {
        transform: translateX(0);
    }
    .file-drop-area {
        border: 2px dashed var(--md-sys-color-outline);
        border-radius: 12px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s ease;
    }
    .file-drop-area:hover, .file-drop-area.drag-over {
        border-color: var(--md-sys-color-primary);
    }
    .file-drop-area input[type="file"] {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
    .preview-container {
        margin: 20px 0;
        text-align: center;
    }
    .preview-image {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        border: 1px solid var(--md-sys-color-outline);
    }
    /* In submit form, crop live preview to 16:9 as well */
    .preview-container .preview-image {
            width: 100%;
        max-height: none;
        aspect-ratio: 16 / 9;
        object-fit: cover;
    }
    @media (max-width: 768px) {
        .navbar { flex-direction: column; gap: 16px; }
        .nav-links { flex-direction: column; width: 100%; }
        .theme-grid { grid-template-columns: 1fr; }
        .container { padding: 0 16px; }
        .page-header h1 { font-size: 2rem; }
        .card { padding: 20px; }
        .nav-btn { width: 100%; justify-content: center; }
        .theme-actions { flex-direction: column; }
        .theme-actions .btn { width: 100%; }
        /* Lżejsze cienie i brak podnoszenia kart na mobile */
        .theme-card { box-shadow: 0 1px 2px var(--md-sys-color-shadow); }
        .theme-card:hover { transform: none; box-shadow: 0 1px 2px var(--md-sys-color-shadow); }
        .notification { box-shadow: 0 2px 6px var(--md-sys-color-shadow); }
    }

    /* Phone-first refinements */
    @media (max-width: 480px) {
        .container { padding: 0 12px; }
        .page-header h1 { font-size: 1.8rem; }
        .page-header p { font-size: 1rem; }
        .nav-links { gap: 8px; }
        .nav-btn { padding: 12px 14px; font-size: 1rem; }
        .form-control { padding: 14px; font-size: 1rem; }
        .btn { padding: 12px 14px; font-size: 1rem; width: 100%; }
        .json-toolbar { padding: 6px; gap: 6px; }
        .json-toolbar .btn { flex: 1 1 calc(50% - 6px); }
        .theme-card { border-radius: 12px; }
        .theme-preview { aspect-ratio: 16 / 9; }
        .preview-container .preview-image { aspect-ratio: 16 / 9; }
    }

    /* Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; animation: none !important; }
        .mobile-overlay, .mobile-drawer { transition: none !important; }
    }

    /* Disable hover effects on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .nav-btn:hover, .theme-toggle:hover, .btn:hover {
            background-color: inherit;
            color: inherit;
        }
    }
</style>
`;

export async function showHomePage(request, env) {
  const formatThemeDisplay = (theme) => {
    return {
      ...theme,
      displayName: theme.name,
      displayAuthor:
        theme.source === "external"
          ? theme.themeData?.authors
            ? theme.themeData.authors.map((author) => author.name).join(", ")
            : theme.author || theme.externalRepo?.author || "Unknown"
          : theme.themeData?.authors
            ? theme.themeData.authors.map((author) => author.name).join(", ")
            : theme.author || "Unknown",
      displayDescription: theme.description || "No description available",
    };
  };

  try {
    const themes = await getAllThemesFromGitHub(env, "approved");
    const externalThemes = await fetchExternalThemes(env);

    // Combine themes from GitHub and external repositories
    const allThemes = [...themes, ...externalThemes];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThemeHub - Discord themes page</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
    <script>(function(){try{var s=localStorage.getItem('theme');if(s?s==='dark':true){document.documentElement.classList.add('dark-mode');}}catch(e){document.documentElement.classList.add('dark-mode');}})();</script>
    ${sharedStyles}
    <style>
        /* Placeholder color for search input */
        #themeSearch::placeholder {
            color: var(--search-placeholder-color);
        }
    </style>
</head>
<body>
    <div id="notification" class="notification">Link copied to clipboard!</div>

    ${getNavbarHtml("home", false)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">palette</span> Available Themes</h1>
                <p>Discover and download themes for Kettu/Revenge Discord Clients!</p>
            </div>

            <div class="search-container" style="margin-bottom: 24px; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto;">
                <div style="position: relative;">
                    <input
                        type="text"
                        id="themeSearch"
                        placeholder="Search themes..."
                        style="
                            width: 100% !important;
                            padding-left: 16px !important;
                            border-radius: 12px !important;
                            border: 1px solid var(--search-border-color) !important; /* Use variable */
                            background: var(--search-background-color) !important; /* Use variable */
                            color: var(--search-text-color) !important; /* Use variable */
                            font-size: 1rem !important;
                            padding: 16px 20px !important;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
                            transition: all 0.2s ease !important;
                        "
                        class="form-control"
                    />
                </div>
            </div>

            ${
              allThemes.length > 0
                ? `
            <div class="theme-grid">
                ${allThemes
                  .map(
                    (theme) => `
                <div class="theme-card">
                    ${
                      theme.previewUrl
                        ? `
                    <div class="theme-preview">
                        <img src="${theme.previewUrl}" alt="${theme.name} Preview" loading="lazy" decoding="async" onerror="this.style.display='none'">
                    </div>
                    `
                        : ""
                    }
                    <div class="theme-header">
                        <h3 class="theme-title">${theme.name}</h3>
                        <div class="theme-meta" style="display: flex; flex-direction: column; gap: 4px;">
                            <span>
                                <span class="material-symbols-outlined" style="font-size: 16px;">person</span>
                                <strong>Author:</strong> ${theme.author || "Unknown"}
                            </span>
                            ${
                              theme.source === "external" && theme.externalRepo
                                ? `
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <span class="material-symbols-outlined" style="font-size: 16px;">folder_shared</span>
                                <strong>Repository:</strong>
                                <a href="${theme.externalRepo.url}" target="_blank" rel="noopener noreferrer"
                                   style="color: var(--md-sys-color-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                    ${theme.externalRepo.name}
                                    <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
                                </a>
                            </span>
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <span class="material-symbols-outlined" style="font-size: 16px;">verified_user</span>
                                <strong>Owner:</strong> ${theme.externalRepo.author || "Unknown"}
                            </span>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    <div class="theme-body">
                        <p class="theme-description">${theme.description || theme.themeData?.description || "No description available"}</p>
                    </div>
                    <div class="theme-actions">
                        <a href="/theme/${theme.themeData?.filename?.replace(".json", "")}" class="btn btn-filled" style="flex: 1;">
                            <span class="material-symbols-outlined">visibility</span> View Details
                        </a>
                        ${
                          theme.source === "external"
                            ? `
                        <a href="${theme.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outlined">
                            <span class="material-symbols-outlined">open_in_new</span> View Raw
                        </a>
                        `
                            : `
                        <button class="btn btn-copy" onclick="copyThemeLink('${theme.id}')">
                            <span class="material-symbols-outlined">link</span> Copy Raw Link
                        </button>
                        `
                        }
                    </div>
                </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : `
            <div class="empty-state">
                <span class="material-symbols-outlined">inbox</span>
                <h3>No Themes Available</h3>
                <p>Be the first to contribute a theme to our marketplace!</p>
                <a href="/submit" class="btn btn-filled">
                    <span class="material-symbols-outlined">add</span> Submit Your First Theme
                </a>
            </div>
            `
            }
        </div>
    </main>

    <footer>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1;"></div>
                <p style="text-align: center; margin: 0;">&copy; 2025 ThemeHub. Discord Public Theme Repository.</p>
                <a href="https://github.com/kmmiio99o/theme-marketplace" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--md-sys-color-on-surface-variant); text-decoration: none; border-radius: 8px; transition: background-color .2s ease;" title="GitHub Repository">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>

    <script>
        const allThemes = ${JSON.stringify(allThemes)};
        document.addEventListener('DOMContentLoaded', function() {
            const themeSearchInput = document.getElementById('themeSearch');
            const themeGrid = document.querySelector('.theme-grid');

            function renderThemes(themesToRender) {
                if (themesToRender.length === 0) {
                    themeGrid.innerHTML = '<p style="text-align: center; color: var(--md-sys-color-on-surface-variant);">No themes found matching your criteria.</p>';
                    return;
                }
                themeGrid.innerHTML = themesToRender.map(theme => \`
                <div class="theme-card">
                    \${theme.previewUrl ? \`
                    <div class="theme-preview">
                        <img src="\${theme.previewUrl}" alt="\${theme.name} Preview" loading="lazy" decoding="async" onerror="this.style.display='none'">
                    </div>
                    \` : ""}\
                    <div class="theme-header">
                        <h3 class="theme-title">\${theme.name}</h3>
                        <div class="theme-meta">
                            \${theme.source === "external" ? \`
                            <span><span class="material-symbols-outlined">folder_shared</span> \${theme.externalRepo.author}</span>
                            \` : ""}
                        </div>
                    </div>
                    <div class="theme-body">
                        <p class="theme-description">\${theme.themeData?.description || "No description available"}</p>
                        \${theme.source === "external" ? \`
                        <p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); margin-top: 8px;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">folder_open</span>
                            From: <a href="\${theme.externalRepo.url}" target="_blank" rel="noopener noreferrer" style="color: var(--md-sys-color-primary);">\${theme.externalRepo.name}</a>
                        </p>
                        \` : ""}
                    </div>
                    <div class="theme-actions">
                        <a href="/theme/\${theme.id}" class="btn btn-filled">View Details</a>
                        \${theme.source === "external" ? \`
                        <a href="\${theme.externalRepo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outlined">
                            <span class="material-symbols-outlined">open_in_new</span> Visit Repo
                        </a>
                        \` : \`
                        <button class="btn btn-outlined" onclick="copyThemeLink('\${theme.id}')">
                            <span class="material-symbols-outlined">link</span> Copy Link
                        </button>
                        \`}
                    </div>
                </div>
                \`).join('');
            }

            function filterThemes(query) {
                const lowerCaseQuery = query.toLowerCase();
                return allThemes.filter(theme => {
                    const name = theme.themeData?.name || "";
                    const description = theme.themeData?.description || "";
                    const author = theme.source === "external"
                      ? (theme.themeData?.author || theme.externalRepo?.author || "")
                      : (theme.themeData?.authors?.[0]?.name || theme.themeData?.author || "");

                    return name.toLowerCase().includes(lowerCaseQuery) ||
                           description.toLowerCase().includes(lowerCaseQuery) ||
                           author.toLowerCase().includes(lowerCaseQuery);
                });
            }

            // Debounce input to reduce work on slower devices
            let searchDebounce;
            themeSearchInput.addEventListener('input', (event) => {
                const searchQuery = event.target.value;
                clearTimeout(searchDebounce);
                searchDebounce = setTimeout(() => {
                    const filtered = filterThemes(searchQuery);
                    renderThemes(filtered);
                }, 150);
            });

            // Initial render of all themes when the page loads
            renderThemes(allThemes);
        });

        // Copy theme link functionality
        function copyThemeLink(themeId) {
            // Generate direct raw GitHub URL using the actual filename
            const link = 'https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/refs/heads/main/themes/approved/' + themeId + '.json';
            navigator.clipboard.writeText(link).then(() => {
                const notification = document.getElementById('notification');
                notification.textContent = 'Raw GitHub link copied to clipboard!';
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                const notification = document.getElementById('notification');
                notification.textContent = 'Raw GitHub link copied to clipboard!';
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            });
        }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    return new Response("Error loading themes", { status: 500 });
  }
}

export async function showSubmitForm(request) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  const isError = url.searchParams.get("error") === "1";
  const errorType = url.searchParams.get("errorType") || "unknown";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submit Theme - ThemeHub</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
    <script>(function(){try{var s=localStorage.getItem('theme');if(s?s==='dark':true){document.documentElement.classList.add('dark-mode');}}catch(e){document.documentElement.classList.add('dark-mode');}})();</script>
    ${sharedStyles}
    <style>
        /* Submit page enhancements */
        .submit-form-container {
            display: flex;
            gap: 24px;
        }
        .json-editor-section {
            flex: 2;
        }
        .upload-sections-container {
            flex: 1;
        }
        @media (max-width: 1200px) {
            .submit-form-container {
                flex-direction: column;
            }
        }
        .upload-section {
            background: var(--md-sys-color-surface-variant);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            height: fit-content;
        }
        .upload-section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
        }
        .upload-section-header .material-symbols-outlined {
            font-size: 24px;
            color: var(--md-sys-color-primary);
        }
        .upload-section-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--md-sys-color-on-surface);
        }
        .json-toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; background: var(--md-sys-color-surface); padding: 8px; border-radius: 10px; border: 1px solid var(--md-sys-color-outline); }
        .json-toolbar .btn { padding: 8px 12px; border-radius: 8px; }
        .code-editor {
            background: var(--md-sys-color-surface-variant);
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 12px;
            box-shadow: 0 2px 8px var(--md-sys-color-shadow);
            overflow: hidden;
        }
        .code-editor .editor-inner { padding: 12px; }
        #themeData {
            width: 100%;
            min-height: 480px;
            resize: vertical;
            padding: 14px 16px;
            border: none;
            outline: none;
            background: transparent;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.95rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface);
            tab-size: 2;
            caret-color: var(--md-sys-color-primary);
            white-space: pre; /* wrap off domyślnie */
        }
        #themeData:focus { box-shadow: inset 0 0 0 2px var(--md-sys-color-primary-container); border-radius: 8px; }
        .file-drop-area {
            border: 2px dashed var(--md-sys-color-outline);
            background: var(--md-sys-color-background);
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .file-drop-area:hover {
            border-color: var(--md-sys-color-primary);
            background: var(--md-sys-color-surface);
        }
        .file-drop-area.drag-over {
            border-color: var(--md-sys-color-primary);
            background: var(--md-sys-color-primary-container);
        }
        .preview-image {
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 12px var(--md-sys-color-shadow);
        }
        .form-sidebar {
            position: sticky;
            top: 24px;
        }
        /* Custom scrollbar */
        #themeData::-webkit-scrollbar { width: 12px; height: 12px; }
        #themeData::-webkit-scrollbar-thumb { background: var(--md-sys-color-outline); border-radius: 10px; }
        #themeData::-webkit-scrollbar-thumb:hover { background: var(--md-sys-color-on-surface-variant); }
        #themeData::-webkit-scrollbar-track { background: transparent; }

        /* Guidelines section styling */
        .guidelines-card {
            background: var(--md-sys-color-surface);
            border: 1px solid var(--md-sys-color-outline);
            padding: 24px;
            border-radius: 12px;
        }
        .guidelines-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            color: var(--md-sys-color-on-surface);
            font-size: 1.3rem;
        }
        .guidelines-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
            color: var(--md-sys-color-on-surface-variant);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .guidelines-card li {
            position: relative;
            padding-left: 24px;
        }
        .guidelines-card li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--md-sys-color-primary);
            font-weight: bold;
            font-size: 1.2rem;
        }

        /* Enhanced Alert Styles */
        .alert {
            border-radius: 12px;
            padding: 0;
            margin-bottom: 24px;
            border: 1px solid;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .alert-content {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 20px;
        }

        .alert-icon {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .alert-text {
            flex: 1;
            min-width: 0;
        }

        .alert-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 4px;
        }

        .alert-message {
            font-size: 0.95rem;
            line-height: 1.4;
            margin-bottom: 8px;
        }

        .alert-help {
            font-size: 0.85rem;
            opacity: 0.8;
            line-height: 1.3;
            font-style: italic;
        }

        /* Success Alert */
        .alert-success {
            background: rgba(76, 201, 240, 0.1);
            border-color: var(--md-sys-color-success);
            color: var(--md-sys-color-on-success-container);
        }

        .alert-success .alert-icon {
            background: var(--md-sys-color-success);
            color: var(--md-sys-color-on-success-container);
        }

        /* Error Alert Base */
        .alert-danger {
            background: rgba(247, 37, 133, 0.1);
            border-color: var(--md-sys-color-error);
            color: var(--md-sys-color-on-error-container);
        }

        .alert-danger .alert-icon {
            background: var(--md-sys-color-error);
            color: var(--md-sys-color-on-error-container);
        }

        /* Specific Error Types */
        .alert-authentication {
            background: rgba(255, 193, 7, 0.1);
            border-color: #ffc107;
            color: #856404;
        }

        .alert-authentication .alert-icon {
            background: #ffc107;
            color: #856404;
        }

        .alert-configuration {
            background: rgba(108, 117, 125, 0.1);
            border-color: #6c757d;
            color: #495057;
        }

        .alert-configuration .alert-icon {
            background: #6c757d;
            color: white;
        }

        .alert-network_error,
        .alert-timeout {
            background: rgba(255, 87, 34, 0.1);
            border-color: #ff5722;
            color: #d84315;
        }

        .alert-network_error .alert-icon,
        .alert-timeout .alert-icon {
            background: #ff5722;
            color: white;
        }

        .alert-permissions {
            background: rgba(244, 67, 54, 0.1);
            border-color: #f44336;
            color: #c62828;
        }

        .alert-permissions .alert-icon {
            background: #f44336;
            color: white;
        }

        .alert-repository_not_found {
            background: rgba(156, 39, 176, 0.1);
            border-color: #9c27b0;
            color: #7b1fa2;
        }

        .alert-repository_not_found .alert-icon {
            background: #9c27b0;
            color: white;
        }

        .alert-validation {
            background: rgba(255, 152, 0, 0.1);
            border-color: #ff9800;
            color: #ef6c00;
        }

        .alert-validation .alert-icon {
            background: #ff9800;
            color: white;
        }

        .alert-preview_upload {
            background: rgba(103, 58, 183, 0.1);
            border-color: #673ab7;
            color: #512da8;
        }

        .alert-preview_upload .alert-icon {
            background: #673ab7;
            color: white;
        }

        .alert-api_error,
        .alert-server_error {
            background: rgba(33, 150, 243, 0.1);
            border-color: #2196f3;
            color: #1565c0;
        }

        .alert-api_error .alert-icon,
        .alert-server_error .alert-icon {
            background: #2196f3;
            color: white;
        }

        /* Dark mode adjustments */
        .dark-mode .alert-authentication {
            background: rgba(255, 193, 7, 0.15);
            color: #ffc107;
        }

        .dark-mode .alert-configuration {
            background: rgba(108, 117, 125, 0.15);
            color: #adb5bd;
        }

        .dark-mode .alert-network_error,
        .dark-mode .alert-timeout {
            background: rgba(255, 87, 34, 0.15);
            color: #ff8a65;
        }

        .dark-mode .alert-permissions {
            background: rgba(244, 67, 54, 0.15);
            color: #ef5350;
        }

        .dark-mode .alert-repository_not_found {
            background: rgba(156, 39, 176, 0.15);
            color: #ba68c8;
        }

        .dark-mode .alert-validation {
            background: rgba(255, 152, 0, 0.15);
            color: #ffb74d;
        }

        .dark-mode .alert-preview_upload {
            background: rgba(103, 58, 183, 0.15);
            color: #9575cd;
        }

        .dark-mode .alert-api_error,
        .dark-mode .alert-server_error {
            background: rgba(33, 150, 243, 0.15);
            color: #64b5f6;
        }

    </style>
</head>
<body>
    ${getNavbarHtml("submit", false)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">cloud_upload</span> Submit New Theme</h1>
                <p>Share your professionally designed theme with the community</p>
            </div>

            ${
              message
                ? `
            <div class="alert ${isError ? "alert-danger" : "alert-success"} ${isError ? `alert-${errorType}` : ""}">
                <div class="alert-content" style="background: ${isError ? "var(--md-sys-color-error-container)" : "var(--md-sys-color-success-container)"}; border-radius: 12px; border: 1px solid ${isError ? "var(--md-sys-color-error)" : "var(--md-sys-color-success)"}">
                    <div class="alert-icon" style="background: ${isError ? "var(--md-sys-color-error)" : "var(--md-sys-color-success)"}; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 20px;">
                        <span class="material-symbols-outlined" style="color: ${isError ? "var(--md-sys-color-on-error)" : "var(--md-sys-color-on-success)"}">${isError ? getErrorIcon(errorType) : "check_circle"}</span>
                    </div>
                    <div class="alert-text">
                        <div class="alert-title" style="color: ${isError ? "var(--md-sys-color-on-error-container)" : "var(--md-sys-color-on-success-container)"}; font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">${isError ? getErrorTitle(errorType) : "Success!"}</div>
                        <div class="alert-message" style="color: ${isError ? "var(--md-sys-color-on-error-container)" : "var(--md-sys-color-on-success-container)"};">${message}</div>
                        ${
                          isError && errorType !== "unknown"
                            ? `
                        <div class="alert-help">
                            ${getErrorHelp(errorType)}
                        </div>
                        `
                            : ""
                        }
                        ${
                          !isError
                            ? `
                        <div class="alert-help">
                            Your theme is now in the pending queue. Administrators will review it before making it available to the public. You can check back later to see if it's been approved!
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
            `
                : ""
            }

            <div class="card">
                <form method="POST" action="/submit" enctype="multipart/form-data">
                    <div class="submit-form-container">
                        <div class="json-editor-section">
                            <div class="form-group">
                                <label class="form-label" for="themeData">Theme JSON Configuration</label>
                                <div class="json-toolbar">
                                    <button type="button" id="btnValidateJson" class="btn btn-outlined"><span class="material-symbols-outlined">rule</span> Validate</button>
                                    <button type="button" id="btnFormatJson" class="btn btn-outlined"><span class="material-symbols-outlined">format_align_left</span> Format</button>
                                    <button type="button" id="btnSampleJson" class="btn btn-outlined"><span class="material-symbols-outlined">description</span> Load sample</button>
                                    <button type="button" id="btnCopyJson" class="btn btn-outlined"><span class="material-symbols-outlined">content_copy</span> Copy</button>
                                    <button type="button" id="btnToggleWrap" class="btn btn-outlined"><span class="material-symbols-outlined">wrap_text</span> Wrap</button>
                                    <button type="button" id="btnFontMinus" class="btn btn-outlined"><span class="material-symbols-outlined">text_decrease</span></button>
                                    <button type="button" id="btnFontPlus" class="btn btn-outlined"><span class="material-symbols-outlined">text_increase</span></button>
                                </div>
                                <div class="code-editor">
                                    <div class="editor-inner">
                        <textarea
                            class="form-control"
                            id="themeData"
                            name="themeData"
                                            placeholder='{"name":"Modern Dark Theme","description":"A sleek dark theme with vibrant accents","colors":{"primary":"#4361ee","secondary":"#3f37c9","background":"#101010","text":"#f8f9fa"},"fonts":{"heading":"Poppins, sans-serif","body":"Inter, sans-serif"}}'
                            required></textarea>
                                        </div>
                                    </div>
                        </div>
                                <div id="jsonStatus" style="margin-top:8px; font-size:0.9rem; color: var(--md-sys-color-on-surface-variant);"></div>
                            </div>

                        </div>
                        <div class="upload-sections-container">
                            <div class="json-editor-section">
                                <div class="upload-section">
                                    <div class="upload-section-header">
                                        <span class="material-symbols-outlined">link</span>
                                        <h3>Theme Link</h3>
                                    </div>
                                    <div class="code-editor" style="margin-top: 12px;">
                                        <div class="editor-inner" style="padding: 12px;">
                                            <input type="url"
                                                class="form-control"
                                                id="repositoryUrl"
                                                name="repositoryUrl"
                                                style="width: 100%; min-height: 48px; resize: none; padding: 14px 16px; border: none; outline: none; background: transparent; font-family: 'Roboto Mono', monospace; font-size: 0.95rem; line-height: 1.5; color: var(--md-sys-color-on-surface); caret-color: var(--md-sys-color-primary);"
                                                placeholder="https://raw.githubusercontent.com/username/repo/main/theme.json">
                                        </div>
                                    </div>
                                    <div id="urlStatus" style="margin-top:8px; font-size:0.9rem; color: var(--md-sys-color-on-surface-variant);"></div>
                                </div>
                            </div>
                        <div class="form-group">
                                <div class="upload-section">
                                    <div class="upload-section-header">
                                        <span class="material-symbols-outlined">upload_file</span>
                                        <h3>Import JSON file</h3>
                                    </div>
                                    <div class="file-drop-area" id="jsonDropArea">
                                    <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--md-sys-color-on-surface-variant);">upload_file</span>
                                    <p style="color: var(--md-sys-color-on-surface-variant);">Drag & Drop your .json here</p>
                                    <p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant);">or click to select a file (JSON)</p>
                                    <input type="file" id="themeJsonFile" accept="application/json,.json" style="display: none;">
                                </div>
                    </div>

                    <div class="form-group">
                        <div class="upload-section">
                            <div class="upload-section-header">
                                <span class="material-symbols-outlined">image</span>
                                <h3>Preview Image (Optional)</h3>
                            </div>
                            <div class="file-drop-area" id="fileDropArea">
                            <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--md-sys-color-on-surface-variant);">cloud_upload</span>
                            <p style="color: var(--md-sys-color-on-surface-variant);">Drag & Drop your preview image here</p>
                            <p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant);">or click to select a file (PNG, JPG, GIF)</p>
                            <input type="file" id="previewImage" name="previewImage" accept="image/*" style="display: none;">
                        </div>
                        <div class="preview-container" id="previewContainer" style="display: none;">
                            <img id="previewImg" class="preview-image" src="" alt="Preview">
                            <button type="button" id="removePreview" class="btn btn-outlined" style="margin-top: 10px;">
                                <span class="material-symbols-outlined">delete</span> Remove Preview
                            </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-filled">
                        <span class="material-symbols-outlined">send</span> Submit for Review
                    </button>
                </form>
            </div>

            <div style="height: 24px;"></div>

            <div class="card guidelines-card">
                <h3><span class="material-symbols-outlined">info</span> Submission Guidelines</h3>
                <ul>
                    <li>Ensure your JSON is valid and properly formatted</li>
                    <li>Include a descriptive name and detailed description</li>
                    <li>All submissions are reviewed before publication</li>
                    <li>Inappropriate content will be rejected</li>
                </ul>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1;"></div>
                <p style="text-align: center; margin: 0;">&copy; 2025 ThemeHub. Discord Public Theme Repository.</p>
                <a href="https://github.com/kmmiio99o/theme-marketplace" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--md-sys-color-on-surface-variant); text-decoration: none; border-radius: 8px; transition: background-color .2s ease;" title="GitHub Repository">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Theme toggle fix for submit page
            const fileDropArea = document.getElementById('fileDropArea');
            const previewImageInput = document.getElementById('previewImage');
            const previewContainer = document.getElementById('previewContainer');
            const previewImg = document.getElementById('previewImg');
            const removePreviewBtn = document.getElementById('removePreview');

            const jsonDropArea = document.getElementById('jsonDropArea');
            const jsonFileInput = document.getElementById('themeJsonFile');
            const themeDataTextarea = document.getElementById('themeData');
            const jsonStatus = document.getElementById('jsonStatus');
            const btnValidateJson = document.getElementById('btnValidateJson');
            const btnFormatJson = document.getElementById('btnFormatJson');
            const btnSampleJson = document.getElementById('btnSampleJson');
            const btnCopyJson = document.getElementById('btnCopyJson');
            const btnToggleWrap = document.getElementById('btnToggleWrap');
            const btnFontPlus = document.getElementById('btnFontPlus');
            const btnFontMinus = document.getElementById('btnFontMinus');

            let editorFontSize = 0.95; // rem

            function setStatus(message, ok = true) {
                const successColor = 'var(--md-sys-color-success)';
                const errorColor = 'var(--md-sys-color-error)';
                const successBg = 'var(--md-sys-color-success-container)';
                const errorBg = 'var(--md-sys-color-error-container)';
                const successText = 'var(--md-sys-color-on-success-container)';
                const errorText = 'var(--md-sys-color-on-error-container)';

                jsonStatus.innerHTML =
                    '<div style="display: flex; align-items: center; gap: 8px; background: ' +
                    (ok ? successBg : errorBg) +
                    '; padding: 12px; border-radius: 8px; border: 1px solid ' +
                    (ok ? successColor : errorColor) +
                    '"><span class="material-symbols-outlined" style="color: ' +
                    (ok ? successColor : errorColor) +
                    '">' + (ok ? 'check_circle' : 'error') +
                    '</span><span style="color: ' +
                    (ok ? successText : errorText) +
                    '">' + message + '</span></div>';
            }

            btnValidateJson.addEventListener('click', () => {
                try {
                    JSON.parse(themeDataTextarea.value);
                    setStatus('JSON is valid.');
                } catch (e) {
                    setStatus('Invalid JSON: ' + e.message, false);
                }
            });

            btnFormatJson.addEventListener('click', () => {
                try {
                    const parsed = JSON.parse(themeDataTextarea.value);
                    themeDataTextarea.value = JSON.stringify(parsed, null, 2);
                    setStatus('JSON formatted.');
                } catch (e) {
                    setStatus('Cannot format invalid JSON: ' + e.message, false);
                }
            });

            btnSampleJson.addEventListener('click', () => {
                const sampleTheme = {
                    "name": "Modern Dark Theme",
                    "description": "A sleek dark theme with vibrant accents and modern design elements. Perfect for Discord users who prefer a dark interface with colorful highlights.",
                    "author": "ThemeHub Community",
                    "version": "1.0.0",
                    "colors": {
                        "primary": "#4361ee",
                        "secondary": "#3f37c9",
                        "background": "#101010",
                        "surface": "#1a1a1a",
                        "text": "#f8f9fa",
                        "text-secondary": "#adb5bd",
                        "accent": "#00d4aa",
                        "error": "#f72585",
                        "warning": "#f8961e",
                        "success": "#4cc9f0"
                    },
                    "fonts": {
                        "heading": "Poppins, sans-serif",
                        "body": "Inter, sans-serif",
                        "mono": "JetBrains Mono, monospace"
                    },
                    "spacing": {
                        "xs": "4px",
                        "sm": "8px",
                        "md": "16px",
                        "lg": "24px",
                        "xl": "32px"
                    },
                    "borderRadius": {
                        "sm": "4px",
                        "md": "8px",
                        "lg": "12px",
                        "xl": "16px"
                    },
                    "shadows": {
                        "sm": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "md": "0 4px 6px rgba(0, 0, 0, 0.1)",
                        "lg": "0 10px 15px rgba(0, 0, 0, 0.1)"
                    }
                };
                themeDataTextarea.value = JSON.stringify(sampleTheme, null, 2);
                setStatus('Sample theme loaded. You can modify it or use it as a starting point.');
            });

            btnCopyJson.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(themeDataTextarea.value);
                    setStatus('Copied to clipboard.');
                } catch (e) {
                    setStatus('Failed to copy: ' + e.message, false);
                }
            });

            let wrapOn = false;
            btnToggleWrap.addEventListener('click', () => {
                wrapOn = !wrapOn;
                themeDataTextarea.style.whiteSpace = wrapOn ? 'pre-wrap' : 'pre';
                setStatus('Wrap ' + (wrapOn ? 'enabled' : 'disabled') + '.');
            });

            btnFontPlus.addEventListener('click', () => {
                editorFontSize = Math.min(editorFontSize + 0.05, 1.4);
                themeDataTextarea.style.fontSize = editorFontSize + 'rem';
            });
            btnFontMinus.addEventListener('click', () => {
                editorFontSize = Math.max(editorFontSize - 0.05, 0.75);
                themeDataTextarea.style.fontSize = editorFontSize + 'rem';
            });

            // JSON file drop area events
            jsonDropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                jsonDropArea.classList.add('drag-over');
            });
            jsonDropArea.addEventListener('dragleave', () => {
                jsonDropArea.classList.remove('drag-over');
            });
            // Make the JSON drop area clickable
            jsonDropArea.addEventListener('click', () => {
                jsonFileInput.click();
            });

            jsonDropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                jsonDropArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length) {
                    jsonFileInput.files = files;
                    handleJsonFile(files[0]);
                }
            });
            jsonFileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleJsonFile(e.target.files[0]);
                }
            });
            function handleJsonFile(file) {
                if (!file) return;
                if (!(file.type === 'application/json' || file.name.toLowerCase().endsWith('.json'))) {
                    setStatus('Please upload a .json file', false);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const parsed = JSON.parse(ev.target.result);
                        themeDataTextarea.value = JSON.stringify(parsed, null, 2);
                        setStatus('JSON file loaded into configuration.');
                    } catch (e) {
                        setStatus('Invalid JSON file: ' + e.message, false);
                    }
                };
                reader.readAsText(file);
            }

            // Image file drop area events
            fileDropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDropArea.classList.add('drag-over');
            });

            fileDropArea.addEventListener('dragleave', () => {
                fileDropArea.classList.remove('drag-over');
            });

            // Make the file drop area clickable
            fileDropArea.addEventListener('click', () => {
                previewImageInput.click();
            });

            fileDropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDropArea.classList.remove('drag-over');

                const files = e.dataTransfer.files;
                if (files.length) {
                    previewImageInput.files = files;
                    handlePreviewImage(files[0]);
                }
            });

            // File input change event
            previewImageInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handlePreviewImage(e.target.files[0]);
                }
            });

            // Remove preview button
            removePreviewBtn.addEventListener('click', () => {
                previewImageInput.value = '';
                previewContainer.style.display = 'none';
                fileDropArea.style.display = 'block';
            });

            // Handle preview image display
            function handlePreviewImage(file) {
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImg.src = e.target.result;
                        previewContainer.style.display = 'block';
                        fileDropArea.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            }

            // Theme URL validation and copy functionality
            const btnValidateUrl = document.getElementById('btnValidateUrl');
            const btnCopyUrl = document.getElementById('btnCopyUrl');
            const repositoryUrl = document.getElementById('repositoryUrl');
            const urlStatus = document.getElementById('urlStatus');

            function setUrlStatus(message, ok = true) {
                const successColor = 'var(--md-sys-color-success)';
                const errorColor = 'var(--md-sys-color-error)';
                const successBg = 'var(--md-sys-color-success-container)';
                const errorBg = 'var(--md-sys-color-error-container)';
                const successText = 'var(--md-sys-color-on-success-container)';
                const errorText = 'var(--md-sys-color-on-error-container)';

                urlStatus.innerHTML =
                    '<div style="display: flex; align-items: center; gap: 8px; background: ' +
                    (ok ? successBg : errorBg) +
                    '; padding: 12px; border-radius: 8px; border: 1px solid ' +
                    (ok ? successColor : errorColor) +
                    '"><span class="material-symbols-outlined" style="color: ' +
                    (ok ? successColor : errorColor) +
                    '">' + (ok ? 'check_circle' : 'error') +
                    '</span><span style="color: ' +
                    (ok ? successText : errorText) +
                    '">' + message + '</span></div>';
            }

            btnValidateUrl.addEventListener('click', () => {
                const url = repositoryUrl.value.trim();
                try {
                    new URL(url);
                    if (url.startsWith('https://raw.githubusercontent.com/') && url.endsWith('.json')) {
                        setUrlStatus('Valid theme URL format');
                    } else {
                        setUrlStatus('URL must be a raw GitHub JSON file link', false);
                    }
                } catch (e) {
                    setUrlStatus('Invalid URL format', false);
                }
            });

            btnCopyUrl.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(repositoryUrl.value);
                    setUrlStatus('URL copied to clipboard');
                } catch (e) {
                    setUrlStatus('Failed to copy URL: ' + e.message, false);
                }
            });
        });
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function showSubmitRepoForm(request) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  const isError = url.searchParams.get("error") === "1";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submit External Repository - ThemeHub</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
    <script>(function(){try{var s=localStorage.getItem('theme');if(s?s==='dark':true){document.documentElement.classList.add('dark-mode');}}catch(e){document.documentElement.classList.add('dark-mode');}})();</script>
    ${sharedStyles}
    <style>
        /* Guidelines section styling */
        .guidelines-card {
            background: var(--md-sys-color-surface);
            border: 1px solid var(--md-sys-color-outline);
            padding: 24px;
            border-radius: 12px;
        }
        .guidelines-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            color: var(--md-sys-color-on-surface);
            font-size: 1.3rem;
        }
        .guidelines-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
            color: var(--md-sys-color-on-surface-variant);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .guidelines-card li {
            position: relative;
            padding-left: 24px;
        }
        .guidelines-card li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--md-sys-color-primary);
            font-weight: bold;
            font-size: 1.2rem;
        }
        .repo-form-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .form-group {
            margin-bottom: 24px;
        }
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface);
        }
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 8px;
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            background: var(--md-sys-color-background);
            color: var(--md-sys-color-on-surface);
        }
        .form-control:focus {
            outline: none;
            border-color: var(--md-sys-color-primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }
        .submit-options {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
        }
        .submit-option {
            flex: 1;
            padding: 20px;
            border: 2px solid var(--md-sys-color-outline);
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: var(--md-sys-color-background);
        }
        .submit-option:hover {
            border-color: var(--md-sys-color-primary);
            background: var(--md-sys-color-primary-container);
        }
        .submit-option.active {
            border-color: var(--md-sys-color-primary);
            background: var(--md-sys-color-primary-container);
        }
        .submit-option h3 {
            margin: 0 0 8px 0;
            color: var(--md-sys-color-on-surface);
        }
        .submit-option p {
            margin: 0;
            color: var(--md-sys-color-on-surface-variant);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    ${getNavbarHtml("submit-repo", false)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">cloud_upload</span> Submit External Repository</h1>
                <p>Add external repositories with themes to our marketplace</p>
            </div>

            ${
              message
                ? `
            <div class="alert ${isError ? "alert-danger" : "alert-success"}">
                <div class="alert-content">
                    <div class="alert-icon">
                        <span class="material-symbols-outlined">${isError ? "error" : "check_circle"}</span>
                    </div>
                    <div class="alert-text">
                        <div class="alert-title">${isError ? "Error" : "Success!"}</div>
                        <div class="alert-message">${message}</div>
                    </div>
                </div>
            </div>
            `
                : ""
            }

            <div class="card">
                <form method="POST" action="/submit-repo">
                    <div class="form-group">
                        <label class="form-label" for="repoUrl">Repository URL</label>
                        <input type="url" class="form-control" id="repoUrl" name="repoUrl" placeholder="https://github.com/username/repository" required>
                        <p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); margin-top: 8px;">
                            Enter the URL of your repository. We'll automatically fetch the repository name, author, and description.
                        </p>
                    </div>

                    <button type="submit" class="btn btn-filled">
                        <span class="material-symbols-outlined">send</span> Submit Repository
                    </button>
                </form>
            </div>

            <div style="height: 24px;"></div>

            <div class="card guidelines-card">
                <h3><span class="material-symbols-outlined">info</span> Repository Submission Guidelines</h3>
                <ul>
                    <li>Repository must be publicly accessible</li>
                    <li>Should contain theme files in JSON format</li>
                    <li>Include a clear description of available themes</li>
                    <li>Repository will be reviewed before being added to the marketplace</li>
                    <li>Only legitimate theme repositories will be accepted</li>
                </ul>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1;"></div>
                <p style="text-align: center; margin: 0;">&copy; 2025 ThemeHub. Discord Public Theme Repository.</p>
                <a href="https://github.com/kmmiio99o/theme-marketplace" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--md-sys-color-on-surface-variant); text-decoration: none; border-radius: 8px; transition: background-color .2s ease;" title="GitHub Repository">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

// Function to save external repository to JSON file
async function saveExternalRepo(env, repoData) {
  try {
    // Get existing repositories from KV storage
    const existingRepos = await env.THEMES.get("external_repositories");
    let repositories = [];

    if (existingRepos) {
      try {
        repositories = JSON.parse(existingRepos);
      } catch (e) {
        console.warn("Failed to parse existing repositories, starting fresh");
        repositories = [];
      }
    }

    // Add new repository
    repositories.push(repoData);

    // Save back to KV storage
    await env.THEMES.put(
      "external_repositories",
      JSON.stringify(repositories, null, 2),
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving external repository:", error);
    return {
      success: false,
      message: "Failed to save repository data",
    };
  }
}

// Function to get external repositories
export async function getExternalRepositories(env) {
  try {
    const existingRepos = await env.THEMES.get("external_repositories");
    if (!existingRepos) {
      return [];
    }
    return JSON.parse(existingRepos);
  } catch (error) {
    console.error("Error loading external repositories:", error);
    return [];
  }
}

// Function to fetch themes from external repositories
export async function fetchExternalThemes(env) {
  try {
    const repositories = await getExternalRepositories(env);
    const approvedRepos = repositories.filter(
      (repo) => repo.status === "approved",
    );
    const externalThemes = [];

    for (const repo of approvedRepos) {
      try {
        // Try to fetch themes from the repository
        const themes = await fetchThemesFromRepository(repo, env);
        externalThemes.push(...themes);
      } catch (error) {
        console.warn(`Failed to fetch themes from ${repo.url}:`, error);
        // Continue with other repositories even if one fails
      }
    }

    return externalThemes;
  } catch (error) {
    console.error("Error fetching external themes:", error);
    return [];
  }
}

// Function to fetch repository information from URL
async function fetchRepositoryInfo(repoUrl, env) {
  try {
    const url = new URL(repoUrl);
    let apiUrl = "";

    if (url.hostname.includes("github.com")) {
      // GitHub API
      const pathParts = url.pathname.split("/").filter((part) => part);
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repoName = pathParts[1];
        apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
      }
    } else if (url.hostname.includes("gitlab.com")) {
      // GitLab API
      const pathParts = url.pathname.split("/").filter((part) => part);
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repoName = pathParts[1];
        apiUrl = `https://gitlab.com/api/v4/projects/${owner}%2F${repoName}`;
      }
    } else if (url.hostname.includes("codeberg.org")) {
      // Codeberg API
      const pathParts = url.pathname.split("/").filter((part) => part);
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repoName = pathParts[1];
        apiUrl = `https://codeberg.org/api/v1/repos/${owner}/${repoName}`;
      }
    }

    if (!apiUrl) {
      throw new Error("Unsupported repository service");
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "ThemeHub",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.status}`);
    }

    const repoData = await response.json();

    // Extract information based on service
    let name, author, description;

    if (
      url.hostname.includes("github.com") ||
      url.hostname.includes("codeberg.org")
    ) {
      name = repoData.name;
      author = repoData.owner.login;
      description = repoData.description || "No description available";
    } else if (url.hostname.includes("gitlab.com")) {
      name = repoData.name;
      author = repoData.namespace.name;
      description = repoData.description || "No description available";
    }

    return {
      name: name || "Unknown Repository",
      author: author || "Unknown Author",
      description: description || "No description available",
    };
  } catch (error) {
    console.error(`Error fetching repository info from ${repoUrl}:`, error);
    return null;
  }
}

// Function to fetch themes from a specific repository
async function fetchThemesFromRepository(repo, env) {
  try {
    if (!repo || !repo.url) {
      console.error("Invalid repo object:", repo);
      throw new Error("Invalid repository object");
    }

    const url = new URL(repo.url);
    let owner, repoName;

    if (url.hostname.includes("github.com")) {
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        owner = pathParts[0];
        repoName = pathParts[1];
      }
    } else {
      throw new Error("Unsupported repository service for recursive search");
    }

    if (!owner || !repoName) {
      throw new Error("Could not determine repository owner or name");
    }

    const jsonFiles = await fetchRepoContentsRecursive(
      owner,
      repoName,
      "",
      env,
    );
    const themes = [];

    for (const item of jsonFiles) {
      try {
        const themeResponse = await fetch(item.download_url, {
          headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "ThemeHub",
          },
        });

        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (themeData) {
            const themeName =
              themeData.name ||
              item.name.replace(".json", "").replace(/_/g, " ");
            const authorName =
              themeData.authors?.[0]?.name ||
              themeData.author ||
              repo.author ||
              "Unknown";
            const themeMetadata = {
              id: `external_${repo.id}_${item.name.replace(".json", "")}`,
              source: "external",
              name: themeName,
              author: authorName,
              description: themeData.description || `Theme from ${repo.name}`,
              url: item.download_url,
              repositoryUrl: repo.url,
              previewUrl: themeData.preview_url || themeData.previewUrl,
              externalRepo: {
                name: repo.name || "",
                url: repo.url || "",
                author: repo.author || "Unknown",
                description: repo.description || "",
              },
              themeData: themeData,
            };
            themes.push(themeMetadata);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse theme ${item.name}:`, error);
      }
    }

    return themes;
  } catch (error) {
    console.error(`Error fetching themes from repository ${repo.url}:`, error);
    return [];
  }
}

// Helper function to recursively fetch all JSON files from a repository
async function fetchRepoContentsRecursive(owner, repo, path, env) {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    if (!env || !env.GITHUB_TOKEN) {
      throw new Error("GitHub token not found in environment");
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "ThemeHub",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Failed to fetch repository contents for ${path}: ${response.status} - ${errorText}`,
      );
    }

    const contents = await response.json();

    let jsonFiles = [];

    for (const item of contents) {
      if (
        item.type === "file" &&
        (item.name.endsWith(".json") || item.name.endsWith(".theme.css"))
      ) {
        jsonFiles.push(item);
      } else if (item.type === "dir") {
        try {
          const subDirFiles = await fetchRepoContentsRecursive(
            owner,
            repo,
            item.path,
            env,
          );
          jsonFiles = jsonFiles.concat(subDirFiles);
        } catch (error) {}
      }
    }

    return jsonFiles;
  } catch (error) {
    return [];
  }
}

export async function showRepositoriesPage(request) {
  const env = request.env;

  try {
    const externalThemes = await fetchExternalThemes(env);
    const internalThemes = []; // Add your internal themes fetching logic here
    const allThemes = [...internalThemes, ...externalThemes];
    const repositories = await getExternalRepositories(env);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>External Repositories - ThemeHub</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
    <script>(function(){try{var s=localStorage.getItem('theme');if(s?s==='dark':true){document.documentElement.classList.add('dark-mode');}}catch(e){document.documentElement.classList.add('dark-mode');}})();</script>
    ${sharedStyles}
    <style>
        .repo-card {
            background: var(--md-sys-color-background);
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            transition: all 0.3s ease;
        }
        .repo-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--md-sys-color-shadow);
        }
        .repo-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        .repo-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface);
            margin: 0 0 8px 0;
        }
        .repo-author {
            color: var(--md-sys-color-on-surface-variant);
            font-size: 0.9rem;
            margin: 0;
        }
        .repo-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .repo-status.approved {
            background: var(--md-sys-color-success-container);
            color: var(--md-sys-color-on-success-container);
        }
        .repo-status.pending {
            background: var(--md-sys-color-warning-container);
            color: var(--md-sys-color-on-warning-container);
        }
        .repo-description {
            color: var(--md-sys-color-on-surface-variant);
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .repo-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
        }
        .repo-tag {
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        .repo-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        .repo-url {
            color: var(--md-sys-color-primary);
            text-decoration: none;
            font-weight: 500;
        }
        .repo-url:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    ${getNavbarHtml("repositories", false)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">folder_shared</span> External Repositories</h1>
                <p>Discover theme collections from external repositories</p>
            </div>

            ${
              repositories.length > 0
                ? `
            <div class="theme-grid">
                ${(
                  await Promise.all(
                    repositories.map(async (repo) => {
                      let themeInfo = "";
                      try {
                        const themes = await fetchThemesFromRepository(
                          repo,
                          env,
                        );
                        if (themes.length > 0) {
                          themeInfo = `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--md-sys-color-outline);"><h4>Themes Found (${themes.length}):</h4><ul>${themes.map((t) => `<li>${t.name}</li>`).join("")}</ul></div>`;
                        } else {
                          themeInfo = `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--md-sys-color-outline);"><p>No valid themes found in this repository.</p></div>`;
                        }
                      } catch (error) {
                        themeInfo = `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--md-sys-color-outline);"><p style="color: var(--md-sys-color-error);"><b>Error fetching themes:</b> ${error.message}</p></div>`;
                      }

                      return `
                <div class="repo-card">
                    <div class="repo-header">
                        <div>
                            <h3 class="repo-title">${repo.name}</h3>
                            <p class="repo-author">by ${repo.author}</p>
                        </div>
                        <span class="repo-status ${repo.status}">${repo.status}</span>
                    </div>
                    <p class="repo-description">${repo.description}</p>
                    ${
                      repo.tags && repo.tags.length > 0
                        ? `
                    <div class="repo-tags">
                        ${repo.tags.map((tag) => `<span class="repo-tag">${tag}</span>`).join("")}
                    </div>
                    `
                        : ""
                    }
                    <div class="repo-actions">
                        <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-filled">
                            <span class="material-symbols-outlined">open_in_new</span> Visit Repository
                        </a>
                    </div>
                    ${themeInfo}
                </div>
                `;
                    }),
                  )
                ).join("")}
            </div>
            `
                : `
            <div class="empty-state">
                <span class="material-symbols-outlined">folder_off</span>
                <h3>No External Repositories</h3>
                <p>No external repositories have been submitted yet.</p>
                <a href="/submit-repo" class="btn btn-filled">
                    <span class="material-symbols-outlined">add</span> Submit First Repository
                </a>
            </div>
            `
            }
        </div>
    </main>

    <footer>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1;"></div>
                <p style="text-align: center; margin: 0;">&copy; 2025 ThemeHub. Discord Public Theme Repository.</p>
                <a href="https://github.com/kmmiio99o/theme-marketplace" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--md-sys-color-on-surface-variant); text-decoration: none; border-radius: 8px; transition: background-color .2s ease;" title="GitHub Repository">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error loading repositories page:", error);
    return new Response("Error loading repositories", { status: 500 });
  }
}

export async function handleRepoSubmission(request, env) {
  try {
    const formData = await request.formData();
    const repoUrl = formData.get("repoUrl");

    if (!repoUrl) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit-repo?error=1&message=Please provide a repository URL`,
        302,
      );
    }

    // Validate URL format
    try {
      new URL(repoUrl);
    } catch (e) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit-repo?error=1&message=Please provide a valid URL`,
        302,
      );
    }

    // Fetch repository information automatically
    const repoInfo = await fetchRepositoryInfo(repoUrl, env);
    if (!repoInfo) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit-repo?error=1&message=Could not fetch repository information. Please ensure the repository is public and accessible.`,
        302,
      );
    }

    // Create repository object
    const repoData = {
      id: crypto.randomUUID(),
      name: repoInfo.name,
      url: repoUrl,
      description: repoInfo.description,
      author: repoInfo.author,
      tags: [],
      status: "pending",
    };

    // Save to external repositories JSON file
    const result = await saveExternalRepo(env, repoData);

    const baseUrl = new URL(request.url).origin;
    if (result.success) {
      return Response.redirect(
        `${baseUrl}/submit-repo?message=${encodeURIComponent("External repository submitted successfully! It will be reviewed before being added to the marketplace.")}`,
        302,
      );
    } else {
      return Response.redirect(
        `${baseUrl}/submit-repo?error=1&message=${encodeURIComponent(result.message || "Failed to submit repository")}`,
        302,
      );
    }
  } catch (error) {
    console.error("Repository submission error:", error);
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(
      `${baseUrl}/submit-repo?error=1&message=${encodeURIComponent("Unexpected server error during submission.")}`,
      302,
    );
  }
}

export async function handleThemeSubmission(request, env) {
  try {
    const formData = await request.formData();
    const themeData = formData.get("themeData");
    const previewImage = formData.get("previewImage");
    const repositoryUrl = formData.get("repositoryUrl");

    if (!themeData) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit?error=1&message=Please provide theme data`,
        302,
      );
    }

    // Validate GitHub env configuration
    const missing = [];
    if (!env.GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
    if (!env.GITHUB_OWNER) missing.push("GITHUB_OWNER");
    if (!env.GITHUB_REPO) missing.push("GITHUB_REPO");
    if (missing.length) {
      console.error("Missing GitHub ENV:", missing.join(", "));
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit?error=1&message=Missing GitHub configuration on server: ${encodeURIComponent(missing.join(", "))}`,
        302,
      );
    }

    let theme;
    try {
      theme = JSON.parse(themeData);
    } catch (e) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl}/submit?error=1&message=${encodeURIComponent("Invalid JSON format: " + e.message)}`,
        302,
      );
    }

    // Add required fields
    if (!theme.name) {
      theme.name = "Untitled Theme";
    }
    if (!theme.description) {
      theme.description = "No description provided";
    }

    // Add repository URL if provided
    if (repositoryUrl && repositoryUrl.trim() !== "") {
      theme.repositoryUrl = repositoryUrl.trim();
    }

    // Handle preview image if uploaded
    if (previewImage && previewImage.size > 0) {
      const arrayBuffer = await previewImage.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      // Chunked base64 encoding to avoid call stack overflow
      function uint8ToBase64(u8) {
        let binary = "";
        const chunkSize = 0x8000; // 32KB
        for (let i = 0; i < u8.length; i += chunkSize) {
          const chunk = u8.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        // Use Unicode-safe base64 encoding
        try {
          return btoa(binary);
        } catch (e) {
          // Fallback for Unicode characters
          const utf8Bytes = new TextEncoder().encode(binary);
          let safeBinary = "";
          for (let i = 0; i < utf8Bytes.length; i++) {
            safeBinary += String.fromCharCode(utf8Bytes[i]);
          }
          return btoa(safeBinary);
        }
      }
      const base64String = uint8ToBase64(uint8Array);
      theme.previewImage = `${previewImage.type};base64,${base64String}`;
    }

    const result = await saveThemeToGitHub(env, theme, "pending");

    const baseUrl = new URL(request.url).origin;
    if (result.success) {
      return Response.redirect(
        `${baseUrl}/submit?message=${encodeURIComponent("Theme submitted successfully! Your theme has been saved to GitHub and is now awaiting admin approval. You'll be able to see it on the main page once it's approved.")}`,
        302,
      );
    } else {
      // Create detailed error message with error type and details
      let errorMessage = result.message;
      if (result.details) {
        errorMessage += ` (${result.details})`;
      }

      return Response.redirect(
        `${baseUrl}/submit?error=1&errorType=${encodeURIComponent(result.error || "unknown")}&message=${encodeURIComponent(errorMessage)}`,
        302,
      );
    }
  } catch (error) {
    console.error("Theme submission error:", error);
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(
      `${baseUrl}/submit?error=1&message=${encodeURIComponent("Unexpected server error during submission.")}`,
      302,
    );
  }
}

export async function showThemeDetails(request) {
  const cleanThemeData = (theme) => {
    return theme;
  };

  const env = request.env;
  const { id } = request.params;

  try {
    let theme;

    if (id.startsWith("external_")) {
      const externalThemes = await fetchExternalThemes(env);
      theme = externalThemes.find((t) => t.id === id);
    } else {
      theme = await getThemeFromGitHub(env, id, "approved");

      if (!theme) {
        // Try pending themes
        const pendingTheme = await getThemeFromGitHub(env, id, "pending");
        if (pendingTheme) {
          return new Response("Theme is pending approval", { status: 403 });
        }
      }
    }

    if (!theme) {
      console.warn("Theme not found:", id);
      return new Response("Theme not found", { status: 404 });
    }

    // Generate appropriate URL based on theme source
    let rawUrl =
      theme.source === "external"
        ? theme.url
        : theme.repositoryUrl ||
          `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/main/themes/approved/${encodeURIComponent(id)}.json`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${theme.name} - ThemeHub</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
    <script>(function(){try{var s=localStorage.getItem('theme');if(s?s==='dark':true){document.documentElement.classList.add('dark-mode');}}catch(e){document.documentElement.classList.add('dark-mode');}})();</script>
    ${sharedStyles}
    <style>
        .hero-preview {
            max-width: 820px;
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: 12px;
            overflow: hidden;
            background: var(--md-sys-color-surface-variant);
            border: 1px solid var(--md-sys-color-outline);
            box-shadow: 0 2px 10px var(--md-sys-color-shadow);
            margin: 0 auto 20px auto;
        }
        .hero-preview.portrait { aspect-ratio: 9 / 16; max-width: 420px; }
        .hero-preview img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
        }
    </style>
</head>
<body>
    <div id="notification" class="notification">Link copied to clipboard!</div>

    ${getNavbarHtml("home", false)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">brush</span> ${theme.name}</h1>
                <div class="theme-meta">
                </div>
            </div>

            ${
              theme.previewUrl
                ? `
            <div class="hero-preview" id="detailHeroPreview">
                <img src="${theme.previewUrl}" alt="${theme.name} Preview" id="detailHeroImage" loading="lazy" decoding="async">
            </div>
            `
                : ""
            }

            <div class="card">
                <h2>Theme Description</h2>
                <div style="padding: 16px; background: var(--md-sys-color-surface-variant); border-radius: 8px; border-left: 4px solid var(--md-sys-color-primary);">
                    <h3 style="margin: 0 0 8px 0; color: var(--md-sys-color-on-surface); font-size: 1.1rem;">
                        <span class="material-symbols-outlined" style="font-size: 20px; vertical-align: middle;">${theme.source === "external" ? "folder_shared" : "palette"}</span>
                        ${theme.source === "external" ? "External Repository" : "Theme Details"}
                    </h3>
                    ${
                      theme.source === "external"
                        ? `
                    <p style="margin: 0 0 8px 0; color: var(--md-sys-color-on-surface-variant);">
                        <strong>Repository:</strong> <a href="${theme.externalRepo?.url || theme.url || "#"}" target="_blank" rel="noopener noreferrer" style="color: var(--md-sys-color-primary);">${theme.externalRepo?.name || "External Repository"}</a>
                    </p>`
                        : ""
                    }
                    <p style="margin: 0 0 8px 0; color: var(--md-sys-color-on-surface-variant);">
                        <strong>Author${theme.authors?.length > 1 ? "s" : ""}:</strong> ${theme.authors ? theme.authors.map((author) => author.name).join(", ") : theme.author || "Unknown"}
                    </p>
                    <p style="margin: 0; color: var(--md-sys-color-on-surface-variant);">
                        <strong>Description:</strong> ${theme.description || "No description available"}
                    </p>
                </div>
            </div>



            <div class="card">
                <div class="json-editor-section" style="margin-top: 24px;">
                    <div class="upload-section">
                        <div class="upload-section-header" style="background: var(--md-sys-color-surface-variant); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary);">link</span>
                                    <h3 style="color: var(--md-sys-color-on-surface); margin: 0;">Theme Link</h3>
                                </div>
                                <button class="btn btn-filled" onclick="copyRawLink()" style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); padding: 8px 16px; border-radius: 20px; border: none; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; white-space: nowrap;">
                                    <span class="material-symbols-outlined">content_copy</span> Copy
                                </button>
                            </div>
                            <div style="margin-top: 12px; background: var(--md-sys-color-background); padding: 12px; border-radius: 6px; border: 1px solid var(--md-sys-color-outline); font-family: 'Roboto Mono', monospace; font-size: 0.95rem; color: var(--md-sys-color-on-surface); line-height: 1.5; word-break: break-all;">${rawUrl}</div>
                        </div>
                    </div>
                </div>
            </div>
                <div class="section-header" style="background: var(--md-sys-color-surface-variant); padding: 12px 16px; border-radius: 8px; margin: 16px 0; cursor: pointer;" onclick="toggleThemeCode()">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary);">code</span>
                            <h3 style="color: var(--md-sys-color-on-surface); margin: 0;">Theme Code</h3>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="btn btn-filled" onclick="event.stopPropagation(); copyThemeCode()" style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); padding: 8px 16px; border-radius: 20px; border: none; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; white-space: nowrap;">
                                <span class="material-symbols-outlined">content_copy</span> Copy
                            </button>
                            <span id="themeCodeToggle" class="material-symbols-outlined" style="color: var(--md-sys-color-on-surface-variant); transition: transform .22s cubic-bezier(.2,.8,.2,1);">expand_more</span>
                        </div>
                    </div>
                </div>
                <div id="themeCodeContent" style="max-height: 0; overflow: hidden; opacity: 0; transition: max-height .24s cubic-bezier(.2,.8,.2,1), opacity .16s ease;">
                    <pre id="themeJSON" style="background: var(--md-sys-color-surface); padding: 20px; border-radius: 6px; overflow-x: auto; font-family: 'Roboto Mono', monospace; font-size: 0.9rem; color: var(--md-sys-color-on-surface); border: 1px solid var(--md-sys-color-outline); margin: 0;">${JSON.stringify(theme, null, 2)}</pre>
                </div>
            </div>

            <script>
                function copyRawLink() {
                    const rawLink = document.getElementById('rawLink').textContent;
                    navigator.clipboard.writeText(rawLink).then(() => {
                        const notification = document.getElementById('notification');
                        notification.textContent = 'Link copied to clipboard!';
                        notification.classList.add('show');
                        setTimeout(() => notification.classList.remove('show'), 3000);
                    });
                }

                function copyJSON() {
                    const jsonContent = document.getElementById('themeJSON').textContent;
                    navigator.clipboard.writeText(jsonContent).then(() => {
                        const notification = document.getElementById('notification');
                        notification.textContent = 'JSON copied to clipboard!';
                        notification.classList.add('show');
                        setTimeout(() => notification.classList.remove('show'), 3000);
                    });
                }
            </script>

            <div style="text-align: center; margin: 30px 0;" class="theme-actions">
                ${
                  theme.source === "external"
                    ? `
                <a href="${theme.externalRepo?.url || theme.url || "#"}" target="_blank" rel="noopener noreferrer" class="btn btn-filled">
                    <span class="material-symbols-outlined">open_in_new</span> Visit Repository
                </a>
                `
                    : `
                <button class="btn btn-filled" onclick="copyRawLink()">
                    <span class="material-symbols-outlined">link</span> Copy Raw GitHub Link
                </button>
                `
                }
                <a href="/" class="btn btn-outlined">
                    <span class="material-symbols-outlined">arrow_back</span> Back to Themes
                </a>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1;"></div>
                <p style="text-align: center; margin: 0;">&copy; 2025 ThemeHub. Discord Public Theme Repository.</p>
                <a href="https://github.com/kmmiio99o/theme-marketplace" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--md-sys-color-on-surface-variant); text-decoration: none; border-radius: 8px; transition: background-color .2s ease;" title="GitHub Repository">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Oznacz portretowe obrazy na liście
            document.querySelectorAll('.theme-preview img').forEach(function(img){
                if (img.complete) markOrientation(img);
                else img.addEventListener('load', function(){ markOrientation(img); }, { once: true });
            });
            function markOrientation(img){
                try {
                    if (img.naturalHeight > img.naturalWidth) {
                        const parent = img.closest('.theme-preview');
                        if (parent) parent.classList.add('portrait');
                    }
                } catch(_){}
            }
            // Oznacz podgląd na stronie szczegółów
            const detailImg = document.getElementById('detailHeroImage');
            const detailWrap = document.getElementById('detailHeroPreview');
            if (detailImg && detailWrap) {
                const apply = () => { if (detailImg.naturalHeight > detailImg.naturalWidth) detailWrap.classList.add('portrait'); };
                if (detailImg.complete) apply(); else detailImg.addEventListener('load', apply, { once: true });
            }
        });

        function copyRawLink() {
            const rawLink = document.getElementById('rawLink').textContent;
            navigator.clipboard.writeText(rawLink).then(() => {
                const notification = document.getElementById('notification');
                notification.textContent = 'Link copied to clipboard!';
                notification.classList.add('show');
                setTimeout(() => notification.classList.remove('show'), 3000);
            });
        }

        // Theme code toggle functionality
        function toggleThemeCode() {
            const content = document.getElementById('themeCodeContent');
            const toggle = document.getElementById('themeCodeToggle');

            if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
                toggle.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                toggle.style.transform = 'rotate(0deg)';
            }
        }

        // Copy theme code functionality
        function copyThemeCode() {
            const code = document.getElementById('themeJSON').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const notification = document.getElementById('notification');
                notification.textContent = 'Theme code copied to clipboard!';
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            });
        }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error loading theme details:", error);
    return new Response("Error loading theme", { status: 500 });
  }
}

export async function downloadThemeJSON(request) {
  const env = request.env;
  const { id } = request.params;

  try {
    // Try approved first
    let theme = await getThemeFromGitHub(env, id, "approved");
    let status = "approved";

    if (!theme) {
      // Try pending
      theme = await getThemeFromGitHub(env, id, "pending");
      status = "pending";
    }

    if (!theme) {
      return new Response("Theme not found", { status: 404 });
    }

    const jsonContent = JSON.stringify(theme, null, 2);
    const filename = `${theme.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${id}.json`;

    return new Response(jsonContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Error downloading theme", { status: 500 });
  }
}
