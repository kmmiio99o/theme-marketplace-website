import {
  getAllThemesFromGitHub,
  moveThemeBetweenStatuses,
  deleteThemeFromGitHub,
} from "../utils/github.js";
import { getNavbarHtml, sharedStyles, getExternalRepositories } from "./public.js";
import { isAdminAuthenticated } from "./auth.js";

// Handler for showing the admin login page
export async function showAdminLoginPage(request) {
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
    headers: { "Content-Type": "text/html" },
  });
}

// Handler for handling admin login logic
export async function handleAdminLogin(request, env) {
  const formData = await request.formData();
  const password = formData.get("password");
  const { ADMIN_PASSWORD } = env;

  if (password === ADMIN_PASSWORD) {
    // Successful login, set a cookie and redirect
    const headers = new Headers();
    headers.set(
      "Set-Cookie",
      `token=${ADMIN_PASSWORD}; Path=/admin; HttpOnly; SameSite=Strict`,
    );
    headers.set("Location", "/admin/dashboard");
    return new Response(null, { status: 302, headers });
  } else {
    // Failed login, redirect back with an error message
    const url = new URL(request.url).origin;
    return Response.redirect(`${url}/admin/login?error=true`, 302);
  }
}

// Handler for handling admin logout logic
export async function handleAdminLogout(request) {
  const headers = new Headers();
  // Clear the token cookie
  headers.set(
    "Set-Cookie",
    "token=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0",
  );
  headers.set("Location", "/"); // Redirect to home page
  return new Response(null, { status: 302, headers });
}

// Handler for showing the main admin dashboard
export async function showAdminDashboard(request, env) {
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
                <a href="/admin/repositories" class="btn btn-filled">
                    <span class="material-symbols-outlined">folder_shared</span>
                    <span>External Repositories</span>
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
    </script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

// Handler for showing pending themes
export async function showPendingThemes(request, env) {
  const isAdmin = isAdminAuthenticated(request, env);
  try {
    const pendingThemes = await getAllThemesFromGitHub(env, "pending");
    const themeCards = pendingThemes
      .map(
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
        `,
      )
      .join("");

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
    </script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error generating HTML response:", error);
    return new Response("Error generating page", { status: 500 });
  }
}

// Handler for showing approved themes
export async function showApprovedThemes(request, env) {
  const isAdmin = isAdminAuthenticated(request, env);
  try {
    const approvedThemes = await getAllThemesFromGitHub(env, "approved");
    const themeCards = approvedThemes
      .map(
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
        `,
      )
      .join("");

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
    </script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error generating HTML response:", error);
    return new Response("Error generating page", { status: 500 });
  }
}

// Handler to approve a pending theme
export async function approveTheme(request, env) {
  const { id } = request.params;
  try {
    console.log("Approve requested for id:", id);
    const success = await moveThemeBetweenStatuses(
      env,
      id,
      "pending",
      "approved",
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
      status: 500,
    });
  }
}

// Handler to reject a pending theme
export async function rejectTheme(request, env) {
  const { id } = request.params;
  try {
    if (!id) {
      return new Response("Theme ID required", { status: 400 });
    }

    // Directly delete the theme from pending without creating a rejected folder
    const deleteSuccess = await deleteThemeFromGitHub(env, id, "pending");
    if (deleteSuccess) {
      const baseUrl = new URL(request.url).origin;
      return Response.redirect(`${baseUrl}/admin/pending`, 302);
    } else {
      console.error('❌ Delete failed for theme:', id);
      return new Response("Error rejecting theme", { status: 500 });
    }
  } catch (error) {
    console.error("Reject error:", error);
    return new Response("Error rejecting theme", { status: 500 });
  }
}

// Handler to delete an approved theme
export async function deleteTheme(request, env) {
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

// External Repositories Management
export async function showExternalRepositories(request) {
  const env = request.env;
  
  try {
    const repositories = await getExternalRepositories(env);
    const pendingRepos = repositories.filter(repo => repo.status === "pending");
    const approvedRepos = repositories.filter(repo => repo.status === "approved");
    const rejectedRepos = repositories.filter(repo => repo.status === "rejected");
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>External Repositories - Admin</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
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
    ${getNavbarHtml("admin", true)}

    <main>
        <div class="container">
            <div class="page-header">
                <h1><span class="material-symbols-outlined">folder_shared</span> External Repositories</h1>
                <p>Manage external repository submissions</p>
            </div>

            ${pendingRepos.length > 0 ? `
            <div class="card" style="margin-bottom: 32px;">
                <h2><span class="material-symbols-outlined">pending</span> Pending Repositories (${pendingRepos.length})</h2>
                <div class="theme-grid">
                    ${pendingRepos.map(repo => `
                    <div class="repo-card">
                        <div class="repo-header">
                            <div>
                                <h3 class="repo-title">${repo.name}</h3>
                                <p class="repo-author">by ${repo.author}</p>
                            </div>
                            <span class="repo-status ${repo.status}">${repo.status}</span>
                        </div>
                        <p class="repo-description">${repo.description}</p>
                        <div class="repo-actions">
                            <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outlined">
                                <span class="material-symbols-outlined">open_in_new</span> Visit Repository
                            </a>
                            <form method="POST" action="/admin/approve-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-filled">
                                    <span class="material-symbols-outlined">check</span> Approve
                                </button>
                            </form>
                            <form method="POST" action="/admin/reject-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger">
                                    <span class="material-symbols-outlined">close</span> Reject
                                </button>
                            </form>
                            <form method="POST" action="/admin/delete-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this repository?')">
                                    <span class="material-symbols-outlined">delete</span> Delete
                                </button>
                            </form>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${approvedRepos.length > 0 ? `
            <div class="card" style="margin-bottom: 32px;">
                <h2><span class="material-symbols-outlined">check_circle</span> Approved Repositories (${approvedRepos.length})</h2>
                <div class="theme-grid">
                    ${approvedRepos.map(repo => `
                    <div class="repo-card">
                        <div class="repo-header">
                            <div>
                                <h3 class="repo-title">${repo.name}</h3>
                                <p class="repo-author">by ${repo.author}</p>
                            </div>
                            <span class="repo-status ${repo.status}">${repo.status}</span>
                        </div>
                        <p class="repo-description">${repo.description}</p>
                        <div class="repo-actions">
                            <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outlined">
                                <span class="material-symbols-outlined">open_in_new</span> Visit Repository
                            </a>
                            <form method="POST" action="/admin/delete-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this repository?')">
                                    <span class="material-symbols-outlined">delete</span> Delete
                                </button>
                            </form>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${rejectedRepos.length > 0 ? `
            <div class="card" style="margin-bottom: 32px;">
                <h2><span class="material-symbols-outlined">cancel</span> Rejected Repositories (${rejectedRepos.length})</h2>
                <div class="theme-grid">
                    ${rejectedRepos.map(repo => `
                    <div class="repo-card">
                        <div class="repo-header">
                            <div>
                                <h3 class="repo-title">${repo.name}</h3>
                                <p class="repo-author">by ${repo.author}</p>
                            </div>
                            <span class="repo-status ${repo.status}">${repo.status}</span>
                        </div>
                        <p class="repo-description">${repo.description}</p>
                        <div class="repo-actions">
                            <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outlined">
                                <span class="material-symbols-outlined">open_in_new</span> Visit Repository
                            </a>
                            <form method="POST" action="/admin/approve-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-filled">
                                    <span class="material-symbols-outlined">check</span> Approve
                                </button>
                            </form>
                            <form method="POST" action="/admin/delete-repo/${repo.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this repository?')">
                                    <span class="material-symbols-outlined">delete</span> Delete
                                </button>
                            </form>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${repositories.length === 0 ? `
            <div class="empty-state">
                <span class="material-symbols-outlined">folder_off</span>
                <h3>No External Repositories</h3>
                <p>No external repositories have been submitted yet.</p>
            </div>
            ` : ''}
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
    console.error("Error loading external repositories:", error);
    return new Response("Error loading repositories", { status: 500 });
  }
}

export async function approveRepository(request) {
  const env = request.env;
  const { id } = request.params;
  
  try {
    const repositories = await getExternalRepositories(env);
    const repoIndex = repositories.findIndex(repo => repo.id === id);
    
    if (repoIndex === -1) {
      return new Response("Repository not found", { status: 404 });
    }
    
    repositories[repoIndex].status = "approved";
    await env.THEMES.put("external_repositories", JSON.stringify(repositories, null, 2));
    
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(`${baseUrl}/admin/repositories`, 302);
  } catch (error) {
    console.error("Error approving repository:", error);
    return new Response("Error approving repository", { status: 500 });
  }
}

export async function rejectRepository(request) {
  const env = request.env;
  const { id } = request.params;
  
  try {
    const repositories = await getExternalRepositories(env);
    const repoIndex = repositories.findIndex(repo => repo.id === id);
    
    if (repoIndex === -1) {
      return new Response("Repository not found", { status: 404 });
    }
    
    repositories[repoIndex].status = "rejected";
    await env.THEMES.put("external_repositories", JSON.stringify(repositories, null, 2));
    
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(`${baseUrl}/admin/repositories`, 302);
  } catch (error) {
    console.error("Error rejecting repository:", error);
    return new Response("Error rejecting repository", { status: 500 });
  }
}

export async function deleteRepository(request) {
  const env = request.env;
  const { id } = request.params;
  
  try {
    const repositories = await getExternalRepositories(env);
    const filteredRepos = repositories.filter(repo => repo.id !== id);
    
    await env.THEMES.put("external_repositories", JSON.stringify(filteredRepos, null, 2));
    
    const baseUrl = new URL(request.url).origin;
    return Response.redirect(`${baseUrl}/admin/repositories`, 302);
  } catch (error) {
    console.error("Error deleting repository:", error);
    return new Response("Error deleting repository", { status: 500 });
  }
}
