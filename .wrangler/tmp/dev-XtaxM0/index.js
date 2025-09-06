var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-dWNqiD/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/itty-router/index.mjs
var e = /* @__PURE__ */ __name(({ base: e2 = "", routes: t = [], ...o2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((o3, s2, r, n) => "handle" == s2 ? r.fetch : (o4, ...a) => t.push([s2.toUpperCase?.(), RegExp(`^${(n = (e2 + o4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), a, n]) && r, "get") }), routes: t, ...o2, async fetch(e3, ...o3) {
  let s2, r, n = new URL(e3.url), a = e3.query = { __proto__: null };
  for (let [e4, t2] of n.searchParams) a[e4] = a[e4] ? [].concat(a[e4], t2) : t2;
  for (let [a2, c2, i2, l2] of t) if ((a2 == e3.method || "ALL" == a2) && (r = n.pathname.match(c2))) {
    e3.params = r.groups || {}, e3.route = l2;
    for (let t2 of i2) if (null != (s2 = await t2(e3.proxy ?? e3, ...o3))) return s2;
  }
} }), "e");
var o = /* @__PURE__ */ __name((e2 = "text/plain; charset=utf-8", t) => (o2, { headers: s2 = {}, ...r } = {}) => void 0 === o2 || "Response" === o2?.constructor.name ? o2 : new Response(t ? t(o2) : o2, { headers: { "content-type": e2, ...s2.entries ? Object.fromEntries(s2) : s2 }, ...r }), "o");
var s = o("application/json; charset=utf-8", JSON.stringify);
var c = o("text/plain; charset=utf-8", String);
var i = o("text/html");
var l = o("image/jpeg");
var p = o("image/png");
var d = o("image/webp");

// src/utils/github.js
function createSafeFilename(themeName) {
  return themeName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "untitled-theme";
}
__name(createSafeFilename, "createSafeFilename");
function getGitHubHeaders(env) {
  if (!env.GITHUB_TOKEN) {
    throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
  }
  console.log("\u{1F511} Using personal token authentication...");
  return {
    "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
    "User-Agent": "ThemeHub",
    "Accept": "application/vnd.github.v3+json"
  };
}
__name(getGitHubHeaders, "getGitHubHeaders");
function getBranch(env) {
  return env.GITHUB_BRANCH || "main";
}
__name(getBranch, "getBranch");
async function saveThemeToGitHub(env, theme, status = "pending", customFilename) {
  try {
    if (!env.GITHUB_TOKEN) {
      throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
    }
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const safeName = createSafeFilename(theme.name);
    const timestamp = Date.now();
    const filename = customFilename || `${safeName}-${timestamp}`;
    const path = `themes/${status}/${filename}.json`;
    if (theme.previewImage) {
      const previewPath = `themes/${status}/${filename}-preview.png`;
      const previewUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}`;
      const encodedImageData = theme.previewImage.replace(/^.*base64,/, "");
      const headers2 = getGitHubHeaders(env);
      headers2["Content-Type"] = "application/json";
      const branch = getBranch(env);
      await fetch(previewUrl, {
        method: "PUT",
        headers: headers2,
        body: JSON.stringify({
          message: `Add ${status} theme preview: ${theme.name}`,
          content: encodedImageData,
          branch
        })
      });
      theme.previewUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${previewPath}`;
      delete theme.previewImage;
    }
    const content = JSON.stringify(theme, null, 2);
    const encodedContent = btoa(content);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = getGitHubHeaders(env);
    headers["Content-Type"] = "application/json";
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Add ${status} theme: ${theme.name || filename}`,
        content: encodedContent,
        branch: getBranch(env)
      })
    });
    if (response.ok) {
      return filename;
    } else {
      const errorText = await response.text();
      console.error("GitHub API Error:", response.status, errorText);
      return null;
    }
  } catch (error) {
    console.error("GitHub Save Error:", error);
    return null;
  }
}
__name(saveThemeToGitHub, "saveThemeToGitHub");
async function getAllThemesFromGitHub(env, status = "approved") {
  try {
    if (!env.GITHUB_TOKEN) {
      throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
    }
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const path = `themes/${status}/`;
    const branch = getBranch(env);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = getGitHubHeaders(env);
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("List themes error:", response.status, errText);
      return [];
    }
    const files = await response.json();
    if (!Array.isArray(files)) {
      console.error("Unexpected list response shape for", path);
      return [];
    }
    const themes = [];
    for (const file of files) {
      if (file.type === "file" && file.name.endsWith(".json") && !file.name.includes("-preview")) {
        try {
          const themeResponse = await fetch(file.download_url);
          const themeData = await themeResponse.json();
          const themeId = file.name.replace(".json", "");
          themes.push({
            id: themeId,
            // This is the filename without .json
            filename: file.name,
            // Keep original filename for reference
            ...themeData
          });
        } catch (error) {
          console.error("Error loading theme:", file.name, error);
        }
      }
    }
    return themes;
  } catch (error) {
    console.error("GitHub List Error:", error);
    return [];
  }
}
__name(getAllThemesFromGitHub, "getAllThemesFromGitHub");
async function getThemeFromGitHub(env, themeId, status = "approved") {
  try {
    if (!env.GITHUB_TOKEN) {
      throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
    }
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const safeId = encodeURIComponent(themeId);
    const path = `themes/${status}/${safeId}.json`;
    const branch = getBranch(env);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = getGitHubHeaders(env);
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Theme not found at", path);
      }
      return null;
    }
    const file = await response.json();
    const themeResponse = await fetch(file.download_url);
    const themeData = await themeResponse.json();
    return {
      id: themeId,
      filename: file.name,
      ...themeData
    };
  } catch (error) {
    console.error("GitHub Get Theme Error:", error);
    return null;
  }
}
__name(getThemeFromGitHub, "getThemeFromGitHub");
async function moveThemeBetweenStatuses(env, themeId, fromStatus, toStatus) {
  try {
    console.log(`\u{1F504} Moving theme ${themeId} from ${fromStatus} to ${toStatus}...`);
    if (!env.GITHUB_TOKEN) {
      throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
    }
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const theme = await getThemeFromGitHub(env, themeId, fromStatus);
    if (!theme) {
      return false;
    }
    const originalFilename = theme.filename ? theme.filename.replace(/\.json$/, "") : themeId;
    const fromPreviewPath = `themes/${fromStatus}/${originalFilename}-preview.png`;
    const toPreviewPath = `themes/${toStatus}/${originalFilename}-preview.png`;
    try {
      const branch = getBranch(env);
      const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fromPreviewPath}?ref=${branch}`;
      const headers = getGitHubHeaders(env);
      const fileInfoResponse = await fetch(fileInfoUrl, {
        headers
      });
      if (fileInfoResponse.ok) {
        const fileInfo = await fileInfoResponse.json();
        const previewContentResponse = await fetch(fileInfo.download_url);
        const previewArrayBuffer = await previewContentResponse.arrayBuffer();
        const u8 = new Uint8Array(previewArrayBuffer);
        let binary = "";
        const chunkSize = 32768;
        for (let i2 = 0; i2 < u8.length; i2 += chunkSize) {
          const chunk = u8.subarray(i2, i2 + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        const encoded = btoa(binary);
        const toPreviewUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${toPreviewPath}`;
        const putHeaders = getGitHubHeaders(env);
        putHeaders["Content-Type"] = "application/json";
        await fetch(toPreviewUrl, {
          method: "PUT",
          headers: putHeaders,
          body: JSON.stringify({
            message: `Copy preview to ${toStatus}: ${originalFilename}`,
            content: encoded,
            branch: getBranch(env)
          })
        });
        theme.previewUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${toPreviewPath}`;
        const oldPreviewDeleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fromPreviewPath}`;
        const deleteHeaders = getGitHubHeaders(env);
        deleteHeaders["Content-Type"] = "application/json";
        await fetch(oldPreviewDeleteUrl, {
          method: "DELETE",
          headers: deleteHeaders,
          body: JSON.stringify({
            message: `Delete ${fromStatus} theme preview: ${originalFilename}`,
            sha: fileInfo.sha,
            branch: getBranch(env)
          })
        });
      }
    } catch (previewErr) {
      console.error("Preview copy error (continuing):", previewErr);
    }
    const newThemeId = await saveThemeToGitHub(env, theme, toStatus, originalFilename);
    if (!newThemeId) {
      return false;
    }
    const deleteSuccess = await deleteThemeFromGitHub(env, themeId, fromStatus);
    if (deleteSuccess) {
      console.log(`\u2705 Successfully moved theme ${themeId} from ${fromStatus} to ${toStatus}`);
    } else {
      console.error(`\u274C Failed to delete theme ${themeId} from ${fromStatus} after move`);
    }
    return deleteSuccess;
  } catch (error) {
    console.error("Move Error:", error);
    return false;
  }
}
__name(moveThemeBetweenStatuses, "moveThemeBetweenStatuses");
async function deleteThemeFromGitHub(env, themeId, status) {
  try {
    if (!env.GITHUB_TOKEN) {
      throw new Error("No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml");
    }
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const path = `themes/${status}/${themeId}.json`;
    const branch = getBranch(env);
    const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = getGitHubHeaders(env);
    const fileInfoResponse = await fetch(fileInfoUrl, {
      headers
    });
    if (!fileInfoResponse.ok) {
      console.error("File not found for deletion:", path);
      return true;
    }
    const fileInfo = await fileInfoResponse.json();
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const deleteHeaders = getGitHubHeaders(env);
    deleteHeaders["Content-Type"] = "application/json";
    console.log("\u{1F5D1}\uFE0F Attempting to delete theme:", themeId, "from status:", status);
    console.log("\u{1F517} Delete URL:", deleteUrl);
    console.log("\u{1F4DD} Commit message:", `Delete ${status} theme: ${themeId}`);
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: deleteHeaders,
      body: JSON.stringify({
        message: `Delete ${status} theme: ${themeId}`,
        sha: fileInfo.sha,
        branch: getBranch(env)
      })
    });
    console.log("\u{1F4CA} Delete response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("\u274C Delete error details:", errorText);
    }
    if (response.ok || response.status === 204) {
      try {
        const previewPath = `themes/${status}/${themeId}-preview.png`;
        const branch2 = getBranch(env);
        const previewFileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}?ref=${branch2}`;
        const previewFileInfoResponse = await fetch(previewFileInfoUrl, {
          headers
        });
        if (previewFileInfoResponse.ok) {
          const previewFileInfo = await previewFileInfoResponse.json();
          const previewDeleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}`;
          await fetch(previewDeleteUrl, {
            method: "DELETE",
            headers: deleteHeaders,
            body: JSON.stringify({
              message: `Delete ${status} theme preview: ${themeId}`,
              sha: previewFileInfo.sha,
              branch: getBranch(env)
            })
          });
        }
      } catch (previewError) {
        console.error("Preview deletion error (continuing):", previewError);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.error("Delete error:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return true;
  }
}
__name(deleteThemeFromGitHub, "deleteThemeFromGitHub");

// src/handlers/public.js
function getNavbarHtml(activePage, isAdmin) {
  const adminLink = isAdmin ? `
        <a href="/admin/dashboard" class="nav-btn ${activePage === "admin" ? "active" : ""}">
            <span class="material-symbols-outlined">shield_person</span>
            <span>Admin Panel</span>
        </a>
        <form method="POST" action="/admin/logout" style="display: inline;">
            <button type="submit" class="nav-btn logout-btn">
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        </form>` : `
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
                    <span class="material-symbols-outlined" aria-hidden="true">menu</span>
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
                    ${adminLink}
                    <button id="themeToggle" class="nav-btn theme-toggle">
                        <span class="material-symbols-outlined" aria-hidden="true">light_mode</span>
                        <span>Light Mode</span>
                    </button>
                </div>
            </nav>
        </div>
        <!-- Mobile drawer -->
        <div id="mobileOverlay" class="mobile-overlay" hidden></div>
        <aside id="mobileDrawer" class="mobile-drawer" aria-hidden="true" tabindex="-1">
            <div class="drawer-header">
                <span class="brand"><span class="material-symbols-outlined" aria-hidden="true">palette</span> ThemeHub</span>
                <button id="drawerClose" class="icon-btn" aria-label="Close menu">
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </div>
            <div class="drawer-links">
                <a href="/" class="nav-btn ${activePage === "home" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">home</span><span>Home</span></a>
                <a href="/build" class="nav-btn ${activePage === "building" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">construction</span><span>Building</span></a>
                <a href="/submit" class="nav-btn ${activePage === "submit" ? "active" : ""}"><span class="material-symbols-outlined" aria-hidden="true">add_circle</span><span>Submit Theme</span></a>
                ${adminLink}
                <button id="themeToggleMobile" class="nav-btn theme-toggle"><span class="material-symbols-outlined" aria-hidden="true">light_mode</span><span>Light Mode</span></button>
            </div>
        </aside>
    </header>
    <style>
    header .container { position: relative; }
    .icon-btn { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 6px; border-radius: 8px; }
    .icon-btn:hover { background: var(--md-sys-color-primary-container); }

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
            width: 36px; height: 36px; padding: 0; border-radius: 8px;
            position: absolute; right: 8px; top: 8px; background: transparent;
        }
        .mobile-toggle .material-symbols-outlined { font-size: 22px; }

        .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 999; opacity: 0; transition: opacity .2s ease; }
        .mobile-overlay.show { opacity: 1; }

        .mobile-drawer { position: fixed; top: 0; right: -320px; width: 280px; height: 100vh; background: var(--md-sys-color-surface); border-left: 1px solid var(--md-sys-color-outline); box-shadow: -10px 0 24px rgba(0,0,0,.25); z-index: 1000; transition: right .2s ease; display: flex; flex-direction: column; }
        .mobile-drawer.open { right: 0; }
        .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 12px; border-bottom: 1px solid var(--md-sys-color-outline); }
        .drawer-header .brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
        .drawer-links { display: flex; flex-direction: column; padding: 8px; gap: 6px; }
        .drawer-links .nav-btn { width: 100%; justify-content: flex-start; padding: 10px 12px; font-size: 1rem; border-radius: 10px; }
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
            const overlay = document.getElementById('mobileOverlay');
            const drawerClose = document.getElementById('drawerClose');

            function openDrawer(){
                drawer.classList.add('open');
                drawer.setAttribute('aria-hidden','false');
                overlay.hidden = false;
                // Force reflow for transition
                void overlay.offsetWidth;
                overlay.classList.add('show');
                menuBtn.setAttribute('aria-expanded','true');
                body.style.overflow = 'hidden';
                drawer.focus();
            }
            function closeDrawer(){
                drawer.classList.remove('open');
                drawer.setAttribute('aria-hidden','true');
                overlay.classList.remove('show');
                menuBtn.setAttribute('aria-expanded','false');
                body.style.overflow = '';
                setTimeout(()=>{ overlay.hidden = true; }, 200);
            }

            if (menuBtn && drawer && overlay) {
                menuBtn.addEventListener('click', () => {
                    const isOpen = drawer.classList.contains('open');
                    if (isOpen) closeDrawer(); else openDrawer();
                });
                overlay.addEventListener('click', closeDrawer);
                if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
                drawer.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeDrawer(); });
            }

            function syncThemeButton(btn){
                if (!btn) return;
                const icon = btn.querySelector('.material-symbols-outlined');
                const label = btn.querySelector('span:nth-child(2)');
                const isDark = document.body.classList.contains('dark-mode');
                if (isDark) { if (icon) icon.textContent = 'light_mode'; if (label) label.textContent = 'Light Mode'; }
                else { if (icon) icon.textContent = 'dark_mode'; if (label) label.textContent = 'Dark Mode'; }
            }

            function initTheme(btn){
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const saved = localStorage.getItem('theme');
                const initialDark = saved ? saved === 'dark' : prefersDark;
                if (initialDark) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
                syncThemeButton(btn);
            }

            // Init and click handlers for both theme buttons
            initTheme(toggle);
            initTheme(toggleMobile);
            [toggle, toggleMobile].forEach((btn)=>{
                if (!btn) return;
                btn.addEventListener('click', ()=>{
                    const nextDark = !document.body.classList.contains('dark-mode');
                    if (nextDark) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
                    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
                    syncThemeButton(toggle);
                    syncThemeButton(toggleMobile);
                });
            });
        } catch(_) { /* noop */ }
    })();
    <\/script>
    `;
}
__name(getNavbarHtml, "getNavbarHtml");
var sharedStyles = `
<style>
    :root {
        --md-sys-color-primary: #4361ee;
        --md-sys-color-on-primary: #ffffff;
        --md-sys-color-primary-container: #cde5ff;
        --md-sys-color-on-primary-container: #001d32;
        --md-sys-color-secondary: #51606f;
        --md-sys-color-on-secondary: #ffffff;
        --md-sys-color-secondary-container: #d4e4f6;
        --md-sys-color-on-secondary-container: #0d1d2a;
        --md-sys-color-surface: #fbfcfe;
        --md-sys-color-on-surface: #1a1c1e;
        --md-sys-color-surface-variant: #eef1f6;
        --md-sys-color-on-surface-variant: #42474e;
        --md-sys-color-outline: #73777f;
        --md-sys-color-background: #ffffff;
        --md-sys-color-background-variant: #f5f8fa;
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
        --md-sys-color-primary: #97cbff;
        --md-sys-color-on-primary: #003352;
        --md-sys-color-primary-container: #004a74;
        --md-sys-color-on-primary-container: #cde5ff;
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
        transition: background-color 0.2s ease;
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
        transition: background-color 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        justify-content: center;
    }
    .btn-filled {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }
    .btn-filled:hover {
        background-color: var(--md-sys-color-secondary);
    }
    .btn-outlined {
        background-color: transparent;
        border: 1px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-primary);
    }
    .btn-outlined:hover {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
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
</style>
`;
async function showHomePage(request) {
  const env = request.env;
  try {
    const themes = await getAllThemesFromGitHub(env, "approved");
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
    <link rel="icon" href="/favicon.png?v=2" type="image/png">
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

            ${themes.length > 0 ? `
            <div class="theme-grid">
                ${themes.map(
      (theme) => `
                <div class="theme-card">
                    ${theme.previewUrl ? `
                    <div class="theme-preview">
                        <img src="${theme.previewUrl}" alt="${theme.name} Preview" onerror="this.style.display='none'">
                    </div>
                    ` : ""}
                    <div class="theme-header">
                        <h3 class="theme-title">${theme.name}</h3>
                        <div class="theme-meta">
                            <span><span class="material-symbols-outlined">calendar_today</span> ${theme.createdAt || "Unknown"}</span>
                        </div>
                    </div>
                    <div class="theme-body">
                        <p class="theme-description">${theme.description}</p>
                    </div>
                    <div class="theme-actions">
                        <a href="/theme/${theme.id}" class="btn btn-filled">
                            <span class="material-symbols-outlined">visibility</span> View Details
                        </a>
                        <button class="btn btn-copy" onclick="copyThemeLink('${theme.id}')">
                            <span class="material-symbols-outlined">link</span> Copy Raw Link
                        </button>
                    </div>
                </div>
                `
    ).join("")}
            </div>
            ` : `
            <div class="empty-state">
                <span class="material-symbols-outlined">inbox</span>
                <h3>No Themes Available</h3>
                <p>Be the first to contribute a theme to our marketplace!</p>
                <a href="/submit" class="btn btn-filled">
                    <span class="material-symbols-outlined">add</span> Submit Your First Theme
                </a>
            </div>
            `}
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2023 ThemeHub. Professional Theme Marketplace.</p>
        </div>
    </footer>

    <script>
        const allThemes = ${JSON.stringify(themes)};
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
                        <img src="\${theme.previewUrl}" alt="\${theme.name} Preview" onerror="this.style.display='none'">
                    </div>
                    \` : ""}                    <div class="theme-header">
                        <h3 class="theme-title">\${theme.name}</h3>
                        <div class="theme-meta">
                            <span><span class="material-symbols-outlined">calendar_today</span> \${theme.createdAt || "Unknown"}</span>
                        </div>
                    </div>
                    <div class="theme-body">
                        <p class="theme-description">\${theme.description}</p>
                    </div>
                    <div class="theme-actions">
                        <a href="/theme/\${theme.id}" class="btn btn-filled">View Details</a>
                        <button class="btn btn-outlined" onclick="copyThemeLink('\${theme.id}')">
                            <span class="material-symbols-outlined">link</span> Copy Link
                        </button>
                    </div>
                </div>
                \`).join('');
            }

            function filterThemes(query) {
                const lowerCaseQuery = query.toLowerCase();
                return allThemes.filter(theme =>
                    theme.name.toLowerCase().includes(lowerCaseQuery) ||
                    theme.description.toLowerCase().includes(lowerCaseQuery)
                );
            }

            themeSearchInput.addEventListener('input', (event) => {
                const searchQuery = event.target.value;
                const filtered = filterThemes(searchQuery);
                renderThemes(filtered);
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
    <\/script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    return new Response("Error loading themes", { status: 500 });
  }
}
__name(showHomePage, "showHomePage");
async function showSubmitForm(request) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  const isError = url.searchParams.get("error") === "1";
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
    <link rel="icon" href="/favicon.png?v=2" type="image/png">
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
            white-space: pre; /* wrap off domy\u015Blnie */
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
            content: '\u2022';
            position: absolute;
            left: 0;
            color: var(--md-sys-color-primary);
            font-weight: bold;
            font-size: 1.2rem;
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

            ${message ? `
            <div class="alert ${isError ? "alert-danger" : "alert-success"}">
                <span class="material-symbols-outlined">${isError ? "error" : "check_circle"}</span> ${message}
            </div>
            ` : ""}

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
            <p>&copy; 2023 ThemeHub. Professional Theme Marketplace.</p>
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
                jsonStatus.textContent = message;
                jsonStatus.style.color = ok ? 'var(--md-sys-color-on-success-container)' : 'var(--md-sys-color-on-error-container)';
                jsonStatus.style.background = ok ? 'var(--md-sys-color-success-container)' : 'var(--md-sys-color-error-container)';
                jsonStatus.style.padding = '8px 12px';
                jsonStatus.style.borderRadius = '8px';
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
                themeDataTextarea.value = JSON.stringify(sampleTheme, null, 2);
                setStatus('Sample JSON loaded.');
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
        });
    <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
__name(showSubmitForm, "showSubmitForm");
async function handleThemeSubmission(request) {
  const env = request.env;
  try {
    const formData = await request.formData();
    const themeData = formData.get("themeData");
    const previewImage = formData.get("previewImage");
    if (!themeData) {
      const baseUrl2 = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl2}/submit?error=1&message=Please provide theme data`,
        302
      );
    }
    const missing = [];
    if (!env.GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
    if (!env.GITHUB_OWNER) missing.push("GITHUB_OWNER");
    if (!env.GITHUB_REPO) missing.push("GITHUB_REPO");
    if (missing.length) {
      console.error("Missing GitHub ENV:", missing.join(", "));
      const baseUrl2 = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl2}/submit?error=1&message=Missing GitHub configuration on server: ${encodeURIComponent(missing.join(", "))}`,
        302
      );
    }
    let theme;
    try {
      theme = JSON.parse(themeData);
    } catch (e2) {
      const baseUrl2 = new URL(request.url).origin;
      return Response.redirect(
        `${baseUrl2}/submit?error=1&message=${encodeURIComponent("Invalid JSON format: " + e2.message)}`,
        302
      );
    }
    if (!theme.name) {
      theme.name = "Untitled Theme";
    }
    if (!theme.description) {
      theme.description = "No description provided";
    }
    theme.createdAt = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (previewImage && previewImage.size > 0) {
      let uint8ToBase64 = function(u8) {
        let binary = "";
        const chunkSize = 32768;
        for (let i2 = 0; i2 < u8.length; i2 += chunkSize) {
          const chunk = u8.subarray(i2, i2 + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
      };
      __name(uint8ToBase64, "uint8ToBase64");
      const arrayBuffer = await previewImage.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = uint8ToBase64(uint8Array);
      theme.previewImage = `${previewImage.type};base64,${base64String}`;
    }
    const themeId = await saveThemeToGitHub(env, theme, "pending");
    const baseUrl = new URL(request.url).origin;
    if (themeId) {
      return Response.redirect(
        `${baseUrl}/submit?message=${encodeURIComponent("Theme submitted successfully! Awaiting admin approval.")}`,
        302
      );
    } else {
      return Response.redirect(
        `${baseUrl}/submit?error=1&message=${encodeURIComponent("Error saving theme to GitHub. Check server logs for details.")}`,
        302
      );
    }
  } catch (error) {
    console.error("Theme submission error:", error);
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(
      `${baseUrl}/submit?error=1&message=${encodeURIComponent("Unexpected server error during submission.")}`,
      302
    );
  }
}
__name(handleThemeSubmission, "handleThemeSubmission");
async function showThemeDetails(request) {
  const env = request.env;
  const { id } = request.params;
  try {
    const theme = await getThemeFromGitHub(env, id, "approved");
    if (!theme) {
      const pendingTheme = await getThemeFromGitHub(env, id, "pending");
      if (pendingTheme) {
        return new Response("Theme is pending approval", { status: 403 });
      }
      console.warn("Theme not found in approved or pending for id:", id);
      return new Response("Theme not found", { status: 404 });
    }
    const rawUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/main/themes/approved/${encodeURIComponent(id)}.json`;
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
    <link rel="icon" href="/favicon.png?v=2" type="image/png">
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
                    <span><span class="material-symbols-outlined">calendar_today</span> Created: ${theme.createdAt || "Unknown"}</span>
                </div>
            </div>

            ${theme.previewUrl ? `
            <div class="hero-preview" id="detailHeroPreview">
                <img src="${theme.previewUrl}" alt="${theme.name} Preview" id="detailHeroImage">
            </div>
            ` : ""}

            <div class="card">
                <h2>Theme Description</h2>
                <p>${theme.description}</p>
            </div>

            <div class="card">
                <h2><span class="material-symbols-outlined">link</span> Direct GitHub Raw Link</h2>
                <div class="raw-link" id="rawLink" style="background: var(--md-sys-color-surface-variant); padding: 15px; border-radius: 6px; font-family: 'Roboto Mono', monospace; font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline); margin: 15px 0; word-break: break-all;">${rawUrl}</div>
                <button class="btn btn-copy" onclick="copyRawLink()">
                    <span class="material-symbols-outlined">content_copy</span> Copy Raw Link
                </button>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2><span class="material-symbols-outlined">code</span> Theme JSON</h2>
                    <button class="btn btn-copy" onclick="copyJSON()">
                        <span class="material-symbols-outlined">content_copy</span> Copy JSON
                    </button>
                </div>
                <pre id="themeJSON" style="background: var(--md-sys-color-surface-variant); padding: 20px; border-radius: 6px; overflow-x: auto; font-family: 'Roboto Mono', monospace; font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline);">${JSON.stringify(theme, null, 2)}</pre>
            </div>

            <div style="text-align: center; margin: 30px 0;" class="theme-actions">
                <button class="btn btn-filled" onclick="copyThemeLink('${id}')">
                    <span class="material-symbols-outlined">link</span> Copy Raw GitHub Link
                </button>

                <a href="/" class="btn btn-outlined">
                    <span class="material-symbols-outlined">arrow_back</span> Back to Themes
                </a>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2023 ThemeHub. Professional Theme Marketplace.</p>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Oznacz portretowe obrazy na li\u015Bcie
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
            // Oznacz podgl\u0105d na stronie szczeg\xF3\u0142\xF3w
            const detailImg = document.getElementById('detailHeroImage');
            const detailWrap = document.getElementById('detailHeroPreview');
            if (detailImg && detailWrap) {
                const apply = () => { if (detailImg.naturalHeight > detailImg.naturalWidth) detailWrap.classList.add('portrait'); };
                if (detailImg.complete) apply(); else detailImg.addEventListener('load', apply, { once: true });
            }
            });
    <\/script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Error loading theme details:", error);
    return new Response("Error loading theme", { status: 500 });
  }
}
__name(showThemeDetails, "showThemeDetails");
async function downloadThemeJSON(request) {
  const env = request.env;
  const { id } = request.params;
  try {
    let theme = await getThemeFromGitHub(env, id, "approved");
    let status = "approved";
    if (!theme) {
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
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Error downloading theme", { status: 500 });
  }
}
__name(downloadThemeJSON, "downloadThemeJSON");

// src/handlers/auth.js
async function requireAuth(request, env) {
  const token = getCookie(request.headers.get("Cookie"), "token");
  if (!token || token !== env.ADMIN_PASSWORD) {
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(`${baseUrl}/admin/login`, 302);
  }
}
__name(requireAuth, "requireAuth");
function isAdminAuthenticated(request, env) {
  const token = getCookie(request.headers.get("Cookie"), "token");
  return token && token === env.ADMIN_PASSWORD;
}
__name(isAdminAuthenticated, "isAdminAuthenticated");
function getCookie(cookieString, name) {
  if (!cookieString) {
    return null;
  }
  const cookies = cookieString.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}
__name(getCookie, "getCookie");

// src/handlers/admin.js
async function showAdminLoginPage(request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - ThemeHub</title>
    ${sharedStyles}
    <style>
        body.dark-mode {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: var(--md-sys-color-background);
            font-family: 'Roboto', sans-serif;
        }

        .login-card {
            background-color: var(--md-sys-color-surface);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 1px 3px var(--md-sys-color-shadow);
            max-width: 400px;
            width: 100%;
            text-align: center;
            border: 1px solid var(--md-sys-color-outline);
        }

        .login-card h2 {
            margin-top: 0;
            color: var(--text-color);
        }

        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--secondary-text);
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background-color: var(--secondary-bg);
            color: var(--text-color);
            box-sizing: border-box;
            transition: border-color 0.2s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .error-message {
            color: #dc3545;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="dark-mode">
    <div class="login-card">
        <h2>Admin Login</h2>
        ${error ? `<p class="error-message">Invalid password. Please try again.</p>` : ""}
        <form
         action="/admin/login"
         method="POST"
        >
         <div class="form-group">
          <label for="password">Password</label>
          <input
           type="password"
           id="password"
           name="password"
           required
          >
         </div>
         <button type="submit" class="btn btn-filled" style="width: 100%;">Login</button>
        </form>
    </div>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
__name(showAdminLoginPage, "showAdminLoginPage");
async function handleAdminLogin(request, env) {
  const formData = await request.formData();
  const password = formData.get("password");
  const { ADMIN_PASSWORD } = env;
  if (password === ADMIN_PASSWORD) {
    const headers = new Headers();
    headers.set(
      "Set-Cookie",
      `token=${ADMIN_PASSWORD}; Path=/admin; HttpOnly; SameSite=Strict`
    );
    headers.set("Location", "/admin/dashboard");
    return new Response(null, { status: 302, headers });
  } else {
    const url = new URL(request.url).origin;
    return Response.redirect(`${url}/admin/login?error=true`, 302);
  }
}
__name(handleAdminLogin, "handleAdminLogin");
async function handleAdminLogout(request) {
  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    "token=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0"
  );
  headers.set("Location", "/");
  return new Response(null, { status: 302, headers });
}
__name(handleAdminLogout, "handleAdminLogout");
async function showAdminDashboard(request, env) {
  const isAdmin = isAdminAuthenticated(request, env);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - ThemeHub</title>
    ${sharedStyles}
    <style>
        .admin-dashboard-card {
            max-width: 800px;
            margin: 2rem auto;
            text-align: center;
        }

        .admin-links {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .admin-links .button {
            text-decoration: none;
            flex: 1;
            text-align: center;
        }
    </style>
</head>
<body>
    ${getNavbarHtml("admin", isAdmin)}
    <main class="content container">
        <div class="admin-dashboard-card">
            <h2>Admin Dashboard</h2>
            <p>Welcome to the admin panel. Manage pending and approved themes.</p>
            <div class="admin-links">
                <a href="/admin/pending" class="btn btn-filled">
                    <span class="material-symbols-outlined">pending</span>
                    <span>Pending Themes</span>
                </a>
                <a href="/admin/approved" class="btn btn-filled">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span>Approved Themes</span>
                </a>
            </div>
        </div>
    </main>
    <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
        }
    <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
__name(showAdminDashboard, "showAdminDashboard");
async function showPendingThemes(request, env) {
  const isAdmin = isAdminAuthenticated(request, env);
  try {
    const pendingThemes = await getAllThemesFromGitHub(env, "pending");
    const themeCards = pendingThemes.map(
      (theme) => `
            <div class="theme-card">
                <h3>${theme.name}</h3>
                <p>${theme.description}</p>
                <p><strong>ID:</strong> ${theme.id}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; align-items: center;">
                    <button class="btn btn-filled" onclick="copyThemeLink('${theme.id}')" style="margin-right: 0.5rem;">Copy Link</button>
                    <form method="POST" action="/admin/approve/${theme.id}" style="display: inline;">
                        <button type="submit" class="btn btn-filled">Approve</button>
                    </form>
                    <form method="POST" action="/admin/reject/${theme.id}" style="display: inline;">
                        <button type="submit" class="btn btn-error">Reject</button>
                    </form>
                </div>
            </div>
        `
    ).join("");
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Themes - ThemeHub</title>
    ${sharedStyles}
    <style>
        body.dark-mode {
            background-color: var(--md-sys-color-background);
            color: var(--md-sys-color-on-surface);
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .theme-card {
            background-color: var(--md-sys-color-surface-variant);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px var(--md-sys-color-shadow);
            border: 1px solid var(--md-sys-color-outline);
        }

        .theme-card h3 {
            margin-top: 0;
            color: var(--md-sys-color-on-surface);
        }

        .theme-card p {
            color: var(--md-sys-color-on-surface-variant);
        }

        .btn-error {
            background-color: var(--md-sys-color-error);
            color: var(--md-sys-color-on-error);
        }

        .btn-error:hover {
            background-color: var(--md-sys-color-error-container);
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="dark-mode">
    ${getNavbarHtml("admin", isAdmin)}
    <main class="content container">
        <h2>Pending Themes</h2>
        <p>Review new themes submitted by users.</p>
        <div class="grid-container">
            ${themeCards.length > 0 ? themeCards : "<p>No pending themes to review.</p>"}
        </div>
        <div id="notification" class="notification"></div>
    </main>
    <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
        }

        function copyThemeLink(themeId) {
            const link = "https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/refs/heads/main/themes/pending/" + themeId + ".json";
            navigator.clipboard.writeText(link).then(() => {
                const notification = document.getElementById('notification');
                notification.textContent = 'Raw GitHub link copied to clipboard!';
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }

        // Make env variables available to the copy function
        window.env = {
            GITHUB_OWNER: "${env.GITHUB_OWNER}",
            GITHUB_REPO: "${env.GITHUB_REPO}"
        };
    <\/script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Error generating HTML response:", error);
    return new Response("Error generating page", { status: 500 });
  }
}
__name(showPendingThemes, "showPendingThemes");
async function showApprovedThemes(request, env) {
  const isAdmin = isAdminAuthenticated(request, env);
  try {
    const approvedThemes = await getAllThemesFromGitHub(env, "approved");
    const themeCards = approvedThemes.map(
      (theme) => `
            <div class="theme-card">
                <h3>${theme.name}</h3>
                <p>${theme.description}</p>
                <p><strong>ID:</strong> ${theme.id}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; align-items: center;">
                    <form method="POST" action="/admin/delete/${theme.id}" style="display: inline;">
                        <button type="submit" class="btn btn-error">Delete</button>
                    </form>
                </div>
            </div>
        `
    ).join("");
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approved Themes - ThemeHub</title>
    ${sharedStyles}
    <style>
        body.dark-mode {
            background-color: var(--md-sys-color-background);
            color: var(--md-sys-color-on-surface);
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .theme-card {
            background-color: var(--md-sys-color-surface-variant);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px var(--md-sys-color-shadow);
            border: 1px solid var(--md-sys-color-outline);
        }

        .theme-card h3 {
            margin-top: 0;
            color: var(--md-sys-color-on-surface);
        }

        .theme-card p {
            color: var(--md-sys-color-on-surface-variant);
        }
    </style>
</head>
<body class="dark-mode">
    ${getNavbarHtml("admin", isAdmin)}
    <main class="content container">
        <h2>Approved Themes</h2>
        <p>Manage themes that have been approved.</p>
        <div class="grid-container">
            ${themeCards.length > 0 ? themeCards : "<p>No approved themes found.</p>"}
        </div>
    </main>
    <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
        }
    <\/script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Error generating HTML response:", error);
    return new Response("Error generating page", { status: 500 });
  }
}
__name(showApprovedThemes, "showApprovedThemes");
async function approveTheme(request, env) {
  const { id } = request.params;
  try {
    console.log("Approve requested for id:", id);
    const success = await moveThemeBetweenStatuses(
      env,
      id,
      "pending",
      "approved"
    );
    if (success) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(`${baseUrl}/admin/pending`, 302);
    } else {
      console.error("Approve failed for id:", id);
      return new Response(`Error approving theme: ${id}`, { status: 500 });
    }
  } catch (error) {
    console.error("Approve error:", error);
    return new Response(`Error approving theme: ${error.message}`, {
      status: 500
    });
  }
}
__name(approveTheme, "approveTheme");
async function rejectTheme(request, env) {
  const { id } = request.params;
  try {
    if (!id) {
      return new Response("Theme ID required", { status: 400 });
    }
    console.log("\u{1F6AB} Attempting to reject theme:", id);
    try {
      const moveSuccess = await moveThemeBetweenStatuses(env, id, "pending", "rejected");
      if (moveSuccess) {
        console.log("\u2705 Theme moved to rejected status:", id);
        const baseUrl = new URL(request.url).origin;
        return Response.redirect(`${baseUrl}/admin/pending`, 302);
      }
    } catch (moveError) {
      console.warn("\u26A0\uFE0F Failed to move theme to rejected, trying deletion:", moveError.message);
    }
    const deleteSuccess = await deleteThemeFromGitHub(env, id, "pending");
    if (deleteSuccess) {
      console.log("\u2705 Theme deleted (rejected):", id);
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(`${baseUrl}/admin/pending`, 302);
    } else {
      console.error("\u274C Both move and delete failed for theme:", id);
      return new Response("Error rejecting theme", { status: 500 });
    }
  } catch (error) {
    console.error("Reject error:", error);
    return new Response("Error rejecting theme", { status: 500 });
  }
}
__name(rejectTheme, "rejectTheme");
async function deleteTheme(request, env) {
  const { id } = request.params;
  try {
    if (!id) {
      return new Response("Theme ID required", { status: 400 });
    }
    const success = await deleteThemeFromGitHub(env, id, "approved");
    if (success) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(`${baseUrl}/admin/approved`, 302);
    } else {
      return new Response("Error deleting theme", { status: 500 });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return new Response("Error deleting theme", { status: 500 });
  }
}
__name(deleteTheme, "deleteTheme");

// src/handlers/build.js
async function showBuildingPage(request, env) {
  const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Fizz Theme Studio \u2014 Alpha JSON Builder</title>
<style>
  :root{
    --brand:#2ea8ff; --brandHover:#166dce;
    --text:#d6e8ff; --muted:#a8c6ff; --textPrimary:#e7f1ff; --textSecond:#b9d4ff; --link:#2ea8ff;
    --bgPrimary:#0f0f10; --bgSecondary:#121214; --bgAlt:#101012; --bgTertiary:#0c0c0e; --bgFloating:#0f0f12; --bgNested:#0e0e10;
    --cardPrimary:#0e0e10; --cardSecondary:#0f0f12; --input:#121214;
    --success:#43b581; --warning:#f5b14d; --danger:#e04f5f;
    --ripple:#2a5d9c; --scrollbar:#2b2b2b;
  }
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;background:var(--bgPrimary);color:var(--text);font:14px/1.4 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .app{display:grid;grid-template-columns:340px 1fr;gap:0;height:100%}
  .panel{background:var(--bgSecondary);border-right:1px solid rgba(255,255,255,.05);padding:14px;overflow:auto}
  .panel h1{font-size:18px;margin:0;color:var(--textPrimary)}
  .panel h2{font-size:13px;margin:18px 0 6px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
  .panel-header{display: flex; align-items: center; gap: 8px; margin-bottom: 8px;}
  .row{display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin:6px 0}
  .row label{font-size:13px;color:var(--text)}
  .row input[type="text"]{width:100%;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:var(--input);color:var(--text)}
  .row input[type="color"]{width:100%;height:36px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:#0000}
  .btns{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}
  button{padding:8px 10px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:var(--bgAlt);color:var(--text);cursor:pointer}
  button.primary{background:var(--brand);border-color:transparent;color:#04121e;font-weight:600}
  button:active{transform:translateY(1px)}
  .preview{display:grid;grid-template-columns:64px 260px 1fr;height:100vh;overflow:hidden}
  .sv{background:var(--bgTertiary);display:flex;flex-direction:column;gap:6px;align-items:center;padding:8px 0;border-right:1px solid rgba(255,255,255,.05)}
  .sv .dot{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--bgAlt),var(--bgSecondary));border:1px solid rgba(255,255,255,.06)}
  .channels{background:var(--bgSecondary);border-right:1px solid rgba(255,255,255,.05);padding:10px;overflow:auto}
  .channels h3{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:8px 0}
  .chan{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;color:var(--muted)}
  .chan.active{background:var(--bgAlt);color:var(--text)}
  .chan .hash{opacity:.7}
  .chat{display:grid;grid-template-rows:auto 1fr auto;height:100%}
  .header{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid rgba(255,255,255,.05);background:var(--bgFloating)}
  .header .title{font-weight:600;color:var(--textPrimary)}
  .header .pill{margin-left:auto;background:var(--bgAlt);padding:6px 8px;border-radius:999px;color:var(--muted);font-size:12px}
  .msgs{padding:14px;overflow:auto;background:var(--bgPrimary)}
  .msg{margin:10px 0}
  .nick{color:var(--textPrimary);font-weight:600;margin-right:6px}
  .time{color:var(--muted);font-size:12px;margin-left:6px}
  .bubble{background:var(--cardPrimary);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px 12px;display:inline-block}
  a{color:var(--link);text-decoration:none}
  a:hover{color:var(--brandHover)}
  code{background:var(--bgAlt);padding:2px 6px;border-radius:6px;border:1px solid rgba(255,255,255,.08);color:var(--text)}
  .quote{border-left:3px solid rgba(255,255,255,.15);padding-left:10px;color:var(--muted)}
  .mention{color:var(--brand);font-weight:700}
  .spoiler{background:var(--bgAlt);color:var(--bgAlt);padding:2px 6px;border-radius:6px}
  .spoiler:hover{color:var(--text)}
  .input{padding:10px;border-top:1px solid rgba(255,255,255,.05);background:var(--input);display:flex;gap:8px}
  .input input{flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:var(--bgAlt);color:var(--text)}
  .json{margin-top:10px}
  textarea{width:100%;min-height:220px;background:#0b0b0d;color:#d0d0d5;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  .mini{font-size:12px;color:var(--muted);margin:6px 0 0}
  .hr{height:1px;background:rgba(255,255,255,.06);margin:10px 0}
  @media (max-width: 980px){ .app{grid-template-columns:1fr} .preview{display:none} }
</style>
</head>
<body>
<div class="app">
  <div class="panel">
    <div class="panel-header">
      <a href="/"><button>Go Back</button></a>
      <h1>Theme Studio by <a href="https://github.com/FizzvrDev">Fizz</a></h1>
    </div>
    <div class="btns">
      <button id="preset-blue" class="primary">Preset: Pastel Blue</button>
      <button id="preset-purple">Preset: Purple Vision</button>
    </div>

    <h2>Meta</h2>
    <div class="row"><label>Name</label><input id="name" type="text" value="Cobalt Vision (Alpha Dark)"/></div>
    <div class="row"><label>Description</label><input id="desc" type="text" value="Midnight alpha schema with a cobalt/azure palette. Dark server list + dark chat, crisp blue accents."/></div>
    <div class="row"><label>Version</label><input id="ver" type="text" value="3"/></div>
    <div class="row"><label>Icon Pack</label><input id="iconPack" type="text" value="rosiecord-plumpy"/></div>

    <h2>Authors</h2>
    <div class="row"><label>Author 1 name</label><input id="a1n" type="text" value="hi"/></div>
    <div class="row"><label>Author 1 id</label><input id="a1i" type="text" value="Fizz was here"/></div>


    <h2>Accent & Text</h2>
    <div class="row"><label>Brand</label><input id="brand" type="color" value="#2ea8ff"/></div>
    <div class="row"><label>Brand Hover</label><input id="brandHover" type="color" value="#166dce"/></div>
    <div class="row"><label>Text Normal</label><input id="text" type="color" value="#d6e8ff"/></div>
    <div class="row"><label>Text Muted</label><input id="muted" type="color" value="#a8c6ff"/></div>
    <div class="row"><label>Text Primary</label><input id="textPrimary" type="color" value="#e7f1ff"/></div>
    <div class="row"><label>Text Secondary</label><input id="textSecond" type="color" value="#b9d4ff"/></div>
    <div class="row"><label>Link</label><input id="link" type="color" value="#2ea8ff"/></div>

    <h2>Surfaces</h2>
    <div class="row"><label>Background Primary</label><input id="bgPrimary" type="color" value="#0f0f10"/></div>
    <div class="row"><label>Background Secondary</label><input id="bgSecondary" type="color" value="#121214"/></div>
    <div class="row"><label>Background Alt</label><input id="bgAlt" type="color" value="#101012"/></div>
    <div class="row"><label>Background Tertiary</label><input id="bgTertiary" type="color" value="#0c0c0e"/></div>
    <div class="row"><label>Floating</label><input id="bgFloating" type="color" value="#0f0f12"/></div>
    <div class="row"><label>Nested</label><input id="bgNested" type="color" value="#0e0e10"/></div>

    <h2>Cards & Inputs</h2>
    <div class="row"><label>Card Primary</label><input id="cardPrimary" type="color" value="#0e0e10"/></div>
    <div class="row"><label>Card Secondary</label><input id="cardSecondary" type="color" value="#0f0f12"/></div>
    <div class="row"><label>Input</label><input id="input" type="color" value="#121214"/></div>

    <h2>Status</h2>
    <div class="row"><label>Success</label><input id="success" type="color" value="#43b581"/></div>
    <div class="row"><label>Warning</label><input id="warning" type="color" value="#f5b14d"/></div>
    <div class="row"><label>Danger</label><input id="danger" type="color" value="#e04f5f"/></div>

    <h2>Misc</h2>
    <div class="row"><label>Ripple</label><input id="ripple" type="color" value="#2a5d9c"/></div>
    <div class="row"><label>Scrollbar</label><input id="scrollbar" type="color" value="#2b2b2b"/></div>

    <div class="hr"></div>
    <div class="btns">
      <button id="copyJson" class="primary">Copy JSON</button>
      <button id="downloadJson">Download JSON</button>
      </div>
    <div class="mini">Exports Cobalt/Alpha-compatible JSON: arrays-of-one, full ramps, PLUM_*, GUILD_BOOSTING_*, etc.</div>

    <h2>Generated JSON</h2>
    <div class="json">
      <textarea id="jsonOut" readonly></textarea>
    </div>
  </div>

  <div class="preview">
    <div class="sv">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>
    <div class="channels">
      <h3>text channels</h3>
      <div class="chan active"><span class="hash">#</span><span>general</span></div>
      <div class="chan"><span class="hash">#</span><span>announcements</span></div>
      <div class="chan"><span class="hash">#</span><span>showcase</span></div>
      <div class="chan"><span class="hash">#</span><span>support</span></div>
      <h3>voice channels</h3>
      <div class="chan"><span class="hash">\u{1F50A}</span><span>Chill</span></div>
    </div>
    <div class="chat">
      <div class="header">
        <div class="title"># general</div>
        <div class="pill">Live Preview</div>
      </div>
      <div class="msgs">
        <div class="msg">
          <span class="nick">Nova</span><span class="time">Today 12:34</span>
          <div class="bubble">Check the <a href="#">docs</a> and run <code>npm run build</code>.</div>
        </div>
        <div class="msg">
          <span class="nick">Fizz</span><span class="time">12:36</span>
          <div class="bubble"><span class="mention">@you</span> &gt; Quote looks like this<br><span class="quote">Nested quote with muted text</span></div>
        </div>
        <div class="msg">
          <span class="nick">Luna</span><span class="time">12:38</span>
          <div class="bubble">Spoiler: <span class="spoiler">secret</span> \u2014 selected/hover states test.</div>
        </div>
      </div>
      <div class="input">
        <input placeholder="Message #general"/>
        <button class="primary">Send</button>
      </div>
    </div>
  </div>
</div>

<script>
const $ = s => document.querySelector(s);

// Defaults to prevent blanks
const DEFAULTS = {
  brand:"#2ea8ff", brandHover:"#166dce",
  textNormal:"#d6e8ff", textMuted:"#a8c6ff", textPrimary:"#e7f1ff", textSecond:"#b9d4ff", textLink:"#2ea8ff",
  bgPrimary:"#0f0f10", bgSecondary:"#121214", bgAlt:"#101012", bgTertiary:"#0c0c0e", bgFloating:"#0f0f12", bgNested:"#0e0e10",
  cardPrimary:"#0e0e10", cardSecondary:"#0f0f12", input:"#121214",
  success:"#43b581", warning:"#f5b14d", danger:"#e04f5f",
  ripple:"#2a5d9c", scrollbar:"#2b2b2b",
  name:"Cobalt Vision (Alpha Dark)",
  description:"Midnight alpha schema with a cobalt/azure palette. Dark server list + dark chat, crisp blue accents.",
  version:"3",
  iconPack:"rosiecord-plumpy",
  mentionLine:"#8ecbff"
};
const getVal = (id, key) => {
  const v = (document.getElementById(id)?.value ?? "").trim();
  return v || DEFAULTS[key];
};

// Hook inputs
const fields = [
  "brand","brandHover","text","muted","textPrimary","textSecond","link",
  "bgPrimary","bgSecondary","bgAlt","bgTertiary","bgFloating","bgNested",
  "cardPrimary","cardSecondary","input","success","warning","danger","ripple","scrollbar"
];
for (const k of fields) { const el=document.getElementById(k); if(el) el.addEventListener("input", applyVars); }
["name","desc","ver","iconPack","a1n","a1i","a2n","a2i"].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener("input", buildJSON); });

// Presets
document.getElementById("preset-blue").addEventListener("click", ()=>{
  const p={brand:"#2ea8ff",brandHover:"#166dce",text:"#d6e8ff",muted:"#a8c6ff",textPrimary:"#e7f1ff",textSecond:"#b9d4ff",link:"#2ea8ff",
    bgPrimary:"#0f0f10",bgSecondary:"#121214",bgAlt:"#101012",bgTertiary:"#0c0c0e",bgFloating:"#0f0f12",bgNested:"#0e0e10",
    cardPrimary:"#0e0e10",cardSecondary:"#0f0f12",input:"#121214",success:"#43b581",warning:"#f5b14d",danger:"#e04f5f",ripple:"#2a5d9c",scrollbar:"#2b2b2b"};
  for(const k in p){ const el=document.getElementById(k); if(el) el.value=p[k]; } applyVars();
});
document.getElementById("preset-purple").addEventListener("click", ()=>{
  const p={brand:"#8200c8",brandHover:"#3d007a",text:"#cbadff",muted:"#d359ff",textPrimary:"#e9d9ff",textSecond:"#d79dff",link:"#8200c8",
    bgPrimary:"#0f0f10",bgSecondary:"#121214",bgAlt:"#101012",bgTertiary:"#0c0c0e",bgFloating:"#0f0f12",bgNested:"#0e0e10",
    cardPrimary:"#0e0e10",cardSecondary:"#0f0f12",input:"#121214",success:"#43b581",warning:"#faa61a",danger:"#7f007b",ripple:"#5b2a82",scrollbar:"#2b2b2b"};
  for(const k in p){ const el=document.getElementById(k); if(el) el.value=p[k]; } applyVars();
});

function applyVars(){
  for (const k of fields) {
    const el = document.getElementById(k);
    if (!el) continue;
    document.documentElement.style.setProperty("--"+k, el.value);
  }
  buildJSON();
}
function A(v){ return [v]; }

function buildJSON(){
  const P = {
    brand:getVal("brand","brand"),
    brandHover:getVal("brandHover","brandHover"),
    textNormal:getVal("text","textNormal"),
    textMuted:getVal("muted","textMuted"),
    textPrimary:getVal("textPrimary","textPrimary"),
    textSecond:getVal("textSecond","textSecond"),
    textLink:getVal("link","textLink"),
    bgPrimary:getVal("bgPrimary","bgPrimary"),
    bgSecondary:getVal("bgSecondary","bgSecondary"),
    bgAlt:getVal("bgAlt","bgAlt"),
    bgTertiary:getVal("bgTertiary","bgTertiary"),
    bgFloating:getVal("bgFloating","bgFloating"),
    bgNested:getVal("bgNested","bgNested"),
    cardPrimary:getVal("cardPrimary","cardPrimary"),
    cardSecondary:getVal("cardSecondary","cardSecondary"),
    input:getVal("input","input"),
    success:getVal("success","success"),
    warning:getVal("warning","warning"),
    danger:getVal("danger","danger"),
    ripple:getVal("ripple","ripple"),
    scrollbar:getVal("scrollbar","scrollbar")
  };

  // Authors: drop blanks; ensure at least one
  const authorsRaw = [
    { name: (document.getElementById("a1n")?.value || "").trim(), id: (document.getElementById("a1i")?.value || "").trim() },
    { name: (document.getElementById("a2n")?.value || "").trim(), id: (document.getElementById("a2i")?.value || "").trim() }
  ];
  let authors = authorsRaw.filter(a => a.name && a.id);
  if (authors.length === 0) authors = [{ name: "Fizz", id: "629700611994157057" }];

  // === semanticColors (Alpha/Cobalt field set) ===
  const semanticColors = {
    ANDROID_RIPPLE: A(P.ripple),

    CHAT_BACKGROUND: A(P.bgPrimary),

    BACKGROUND_ACCENT: A(P.brand),
    BACKGROUND_FLOATING: A(P.bgFloating),
    BACKGROUND_MENTIONED: A("rgba(114,0,0,0.1)"),
    BACKGROUND_MENTIONED_HOVER: A("rgba(170,0,0,0.1)"),
    BACKGROUND_MESSAGE_HOVER: A("#FFFFFF0D"),
    BACKGROUND_NESTED_FLOATING: A(P.bgNested),
    BACKGROUND_MOBILE_PRIMARY: A(P.bgPrimary),
    BACKGROUND_MOBILE_SECONDARY: A(P.bgSecondary),
    BACKGROUND_MODIFIER_ACCENT: A("#FFFFFF12"),
    BACKGROUND_MODIFIER_ACTIVE: A("#FFFFFF14"),
    BACKGROUND_MODIFIER_HOVER: A("#FFFFFF0F"),
    BACKGROUND_MODIFIER_SELECTED: A("#FFFFFF1A"),
    BACKGROUND_PRIMARY: A(P.bgPrimary),
    BACKGROUND_SECONDARY: A(P.bgSecondary),
    BACKGROUND_SECONDARY_ALT: A(P.bgAlt),
    BACKGROUND_TERTIARY: A(P.bgTertiary),

    BG_BASE_PRIMARY: A(P.bgPrimary),
    BG_BACKDROP: A("#000000b2"),
    BG_BASE_SECONDARY: A(P.bgSecondary),
    BG_BASE_TERTIARY: A(P.bgAlt),

    HOME_BACKGROUND: A(P.bgSecondary),

    BORDER_FAINT: A("#FFFFFF12"),
    BORDER_SUBTLE: A("#FFFFFF1c"),
    BORDER_STRONG: A("#FFFFFF26"),

    CARD_PRIMARY_BG: A(P.cardPrimary),
    CARD_SECONDARY_BG: A(P.cardSecondary),
    CHANNELS_DEFAULT: A(P.textMuted),
    CHANNEL_ICON: A(P.textMuted),
    CHANNELTEXTAREA_BACKGROUND: A(P.input),

    EMBED_BACKGROUND: A(P.bgFloating),

    HEADER_PRIMARY: A(P.textNormal),
    HEADER_SECONDARY: A(P.textMuted),

    INTERACTIVE_ACTIVE: A(P.brand),
    INTERACTIVE_HOVER: A(P.brandHover),
    INTERACTIVE_MUTED: A(P.textMuted),
    INTERACTIVE_NORMAL: A(P.textNormal),

    MENTION_BACKGROUND: A("rgba(114,0,0,0.1)"),
    MENTION_FOREGROUND: A(P.brand),

    REDESIGN_ACTIVITY_CARD_BACKGROUND: A(P.bgAlt),
    REDESIGN_ACTIVITY_CARD_BACKGROUND_PRESSED: A(P.bgSecondary),
    REDESIGN_BUTTON_SECONDARY_ALT_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BORDER: A("#FFFFFF1A"),
    REDESIGN_BUTTON_DANGER_BACKGROUND: A(P.danger),
    REDESIGN_CHANNEL_CATEGORY_NAME_TEXT: A(P.textMuted),
    REDESIGN_CHANNEL_NAME_TEXT: A(P.textNormal),
    REDESIGN_CHAT_INPUT_BACKGROUND: A(P.input),

    SPOILER_HIDDEN_BACKGROUND: A("#000000"),

    STATUS_DANGER: A(P.danger),
    STATUS_DANGER_BACKGROUND: A(P.danger),
    STATUS_DANGER_TEXT: A(P.bgPrimary),

    POLLS_NORMAL_FILL_HOVER: A(P.bgSecondary),
    POLLS_NORMAL_IMAGE_BACKGROUND: A(P.bgSecondary),
    POLLS_VICTOR_FILL: A(P.success + "80"),

    TEXT_LINK: A(P.brand),
    TEXT_MUTED: A(P.textMuted),
    TEXT_NORMAL: A(P.textNormal),
    TEXT_PRIMARY: A(P.textPrimary),
    TEXT_SECONDARY: A(P.textSecond),

    BG_MOD_FAINT: A("#FFFFFF12"),
    KEYBOARD: A(P.bgAlt),
    BACKGROUND_MODIFIER_ACCEPT: A(P.success + "33"),
    BACKGROUND_MODIFIER_ACCEPT_HOVER: A(P.success + "4d"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND: A(P.warning + "33"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND_HOVER: A(P.warning + "4d"),

    SCROLLBAR_AUTO_THUMB: A(P.scrollbar),
    SCROLLBAR_AUTO_TRACK: A("transparent"),
    SCROLLBAR_THIN_THUMB: A(P.scrollbar),
    SCROLLBAR_THIN_TRACK: A("transparent")
  };

  // === rawColors (full ramp, PLUM_*, guild boosting) ===
  const rawColors = {
    // BLUE fallback ramp
    BLUE_260:"#5a76a8", BLUE_300:"#5a76a8", BLUE_330:"#5a76a8", BLUE_345:"#5a76a8",
    BLUE_360:"#5a76a8", BLUE_400:"#5a76a8", BLUE_430:"#5a76a8", BLUE_460:"#5a76a8",
    BLUE_500:"#5a76a8", BLUE_530:"#5a76a8", BLUE_560:"#5a76a8", BLUE_600:"#5a76a8",
    BLUE_630:"#5a76a8", BLUE_660:"#5a76a8", BLUE_700:"#5a76a8",

    BLACK_500:"#000000b2",

    // BRAND ramp
    BRAND_200:P.brand, BRAND_260:P.brand, BRAND_300:P.brand, BRAND_330:P.brand,
    BRAND_345:P.brand, BRAND_360:P.brand, BRAND_400:P.brand, BRAND_430:P.brand,
    BRAND_460:P.brand, BRAND_500:P.brand, BRAND_530:P.brand, BRAND_560:P.brandHover,
    BRAND_600:P.brand, BRAND_630:P.brand, BRAND_660:P.brand, BRAND_700:P.brand,
    BRAND_730:P.textNormal,

    // PLUM placeholders mapped to palette (compat)
    PLUM_1:P.textNormal,
    PLUM_3:P.brand,
    PLUM_4:P.textNormal,
    PLUM_6:P.textNormal,
    PLUM_9:P.textMuted,
    PLUM_10:P.textMuted,
    PLUM_11:P.textMuted,
    PLUM_13:P.textMuted,
    PLUM_15:P.brand,
    PLUM_16:P.bgSecondary,
    PLUM_17:P.bgPrimary,
    PLUM_18:P.bgAlt,
    PLUM_19:P.bgSecondary,
    PLUM_20:P.bgPrimary,
    PLUM_21:P.bgSecondary,
    PLUM_22:P.bgSecondary,
    PLUM_24:P.bgPrimary,
    PLUM_25:P.bgPrimary,

    // PRIMARY full ramp
    PRIMARY_100:P.textMuted,
    PRIMARY_200:P.textNormal,
    PRIMARY_300:P.brand,
    PRIMARY_330:P.textNormal,
    PRIMARY_360:P.brand,
    PRIMARY_400:P.brandHover,
    PRIMARY_460:P.bgSecondary,
    PRIMARY_500:P.brand,
    PRIMARY_530:P.brand,
    PRIMARY_600:P.bgPrimary,
    PRIMARY_630:P.bgSecondary,
    PRIMARY_645:P.bgAlt,
    PRIMARY_660:P.bgSecondary,
    PRIMARY_700:P.bgTertiary,
    PRIMARY_730:P.textMuted,
    PRIMARY_800:P.cardSecondary,

    // GREEN ramp collapsed to success
    GREEN_260:P.success, GREEN_300:P.success, GREEN_330:P.success, GREEN_345:P.success,
    GREEN_360:P.success, GREEN_400:P.success, GREEN_430:P.success, GREEN_460:P.success,
    GREEN_500:P.success, GREEN_530:P.success, GREEN_560:P.success, GREEN_600:P.success,
    GREEN_630:P.success, GREEN_660:P.success, GREEN_700:P.success,

    // Guild boosting
    GUILD_BOOSTING_PINK:P.brand,
    GUILD_BOOSTING_PURPLE:P.brand,
    GUILD_BOOSTING_PURPLE_FOR_GRADIENTS:P.brand,

    // RED ramp
    RED_260:P.danger, RED_300:P.danger, RED_330:P.danger, RED_345:P.danger,
    RED_360:P.danger, RED_400:P.danger, RED_430:P.danger, RED_460:P.danger,
    RED_500:P.danger, RED_530:P.danger, RED_560:P.danger, RED_600:P.danger,
    RED_630:P.danger, RED_660:P.danger, RED_700:P.danger,

    // ORANGE/YELLOW ramps mapped to warning
    ORANGE_260:P.warning, ORANGE_300:P.warning, ORANGE_330:P.warning, ORANGE_345:P.warning,
    ORANGE_360:P.warning, ORANGE_400:P.warning, ORANGE_430:P.warning, ORANGE_460:P.warning,
    ORANGE_500:P.warning, ORANGE_530:P.warning, ORANGE_560:P.warning, ORANGE_600:P.warning,
    ORANGE_630:P.warning, ORANGE_660:P.warning, ORANGE_700:P.warning,

    YELLOW_260:P.warning, YELLOW_300:P.warning, YELLOW_330:P.warning, YELLOW_345:P.warning,
    YELLOW_360:P.warning, YELLOW_400:P.warning, YELLOW_430:P.warning, YELLOW_460:P.warning,
    YELLOW_500:P.warning, YELLOW_530:P.warning, YELLOW_560:P.warning, YELLOW_600:P.warning,
    YELLOW_630:P.warning, YELLOW_660:P.warning, YELLOW_700:P.warning,

    WHITE_500:P.textNormal,
    WHITE_630:P.textMuted,

    ROLE_DEFAULT:P.textMuted
  };

  const obj = {
    name: getVal("name","name"),
    description: getVal("desc","description"),
    version: getVal("ver","version"),
    authors,
    semanticColors,
    rawColors,
    plus: {
      version: "0",
      iconPack: getVal("iconPack","iconPack"),
      mentionLineColor: DEFAULTS.mentionLine
    },
    spec: 2
  };

  const out = document.getElementById("jsonOut");
  if (out) out.value = JSON.stringify(obj, null, 2);
}

// Controls
document.getElementById("copyJson").addEventListener("click", ()=>{
  const ta = document.getElementById("jsonOut");
  if (!ta) return;
  ta.select(); document.execCommand("copy");
  const btn = document.getElementById("copyJson"); btn.textContent="Copied!"; setTimeout(()=>btn.textContent="Copy JSON",1200);
});
document.getElementById("downloadJson").addEventListener("click", ()=>{
  const ta = document.getElementById("jsonOut"); if (!ta) return;
  const blob = new Blob([ta.value], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = (getVal("name","name") || "theme") + ".json";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
});
// Removed the "openJson" button and its functionality
// document.getElementById("openJson").addEventListener("click", ()=>{
//   const ta = document.getElementById("jsonOut"); if (!ta) return;
//   const data = "data:application/json;charset=utf-8," + encodeURIComponent(ta.value);
//   window.open(data, "_blank");
// });


// Init
applyVars(); // Initial application of variables and JSON generation
<\/script>
</body>
</html>`;
  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8"
    }
  });
}
__name(showBuildingPage, "showBuildingPage");

// src/index.js
var router = e();
router.get("/", (request, env) => showHomePage(request, env));
router.get("/submit", (request, env) => showSubmitForm(request, env));
router.post("/submit", handleThemeSubmission);
router.get("/theme/:id", (request, env) => showThemeDetails(request, env));
router.get(
  "/theme/:id.json",
  (request, env) => downloadThemeJSON(request, env)
);
router.get("/download/:id", (request, env) => downloadThemeJSON(request, env));
router.get("/build", (request, env) => showBuildingPage(request, env));
router.get("/admin/login", showAdminLoginPage);
router.post("/admin/login", handleAdminLogin);
router.post("/admin/logout", handleAdminLogout);
router.get("/admin/dashboard", requireAuth, showAdminDashboard);
router.get("/admin/pending", requireAuth, showPendingThemes);
router.get("/admin/approved", requireAuth, showApprovedThemes);
router.post("/admin/approve/:id", requireAuth, approveTheme);
router.post("/admin/reject/:id", requireAuth, rejectTheme);
router.post("/admin/delete/:id", requireAuth, deleteTheme);
router.all("*", () => new Response("Not Found", { status: 404 }));
var src_default = {
  async fetch(request, env, ctx) {
    request.env = env;
    return router.handle(request, env, ctx).catch((err) => {
      console.error("Application Error:", err);
      return new Response("Internal Server Error", { status: 500 });
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError(e2.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e2) {
    const error = reduceError(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-dWNqiD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-dWNqiD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
