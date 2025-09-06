// Middleware to protect admin routes
export async function requireAuth(request, env) {
    const token = getCookie(request.headers.get('Cookie'), 'token');

    // Check if the token exists and matches the admin password
    if (!token || token !== env.ADMIN_PASSWORD) {
        const baseUrl = new URL(request.url).origin;
        return Response.redirect(`${baseUrl}/admin/login`, 302);
    }
}

// Reusable function to check if the user is authenticated
export function isAdminAuthenticated(request, env) {
    const token = getCookie(request.headers.get('Cookie'), 'token');
    return token && token === env.ADMIN_PASSWORD;
}

// Helper to get cookie value by name
export function getCookie(cookieString, name) {
    if (!cookieString) {
        return null;
    }
    const cookies = cookieString.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
}