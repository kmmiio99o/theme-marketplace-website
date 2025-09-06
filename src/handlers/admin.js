import {
  getAllThemesFromGitHub,
  moveThemeBetweenStatuses,
  deleteThemeFromGitHub,
} from "../utils/github.js";
import { getNavbarHtml, sharedStyles } from "./public.js";
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
