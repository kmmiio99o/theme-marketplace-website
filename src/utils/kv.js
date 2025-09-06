export async function getAllApprovedThemes(env) {
    try {
        const list = await env.THEMES_KV.list({ prefix: 'approved:' });
        const themes = [];

        for (const key of list.keys) {
            const value = await env.THEMES_KV.get(key.name);
            if (value) {
                const theme = JSON.parse(value);
                const id = key.name.split(':')[1];
                themes.push({
                    id,
                    ...theme
                });
            }
        }

        return themes;
    } catch (error) {
        console.error('KV Error:', error);
        return [];
    }
}

export async function getAllPendingThemes(env) {
    try {
        const list = await env.THEMES_KV.list({ prefix: 'pending:' });
        const themes = [];

        for (const key of list.keys) {
            const value = await env.THEMES_KV.get(key.name);
            if (value) {
                const theme = JSON.parse(value);
                const id = key.name.split(':')[1];
                themes.push({
                    id,
                    ...theme
                });
            }
        }

        return themes;
    } catch (error) {
        console.error('KV Error:', error);
        return [];
    }
}

export async function savePendingTheme(env, theme) {
    try {
        const id = crypto.randomUUID();
        await env.THEMES_KV.put(`pending:${id}`, JSON.stringify(theme));
        return id;
    } catch (error) {
        console.error('KV Error:', error);
        throw error;
    }
}

export async function getThemeById(env, id) {
    try {
        // Check approved themes first
        let theme = await env.THEMES_KV.get(`approved:${id}`);
        if (theme) {
            return JSON.parse(theme);
        }

        // Check pending themes
        theme = await env.THEMES_KV.get(`pending:${id}`);
        if (theme) {
            return JSON.parse(theme);
        }

        return null;
    } catch (error) {
        console.error('KV Error:', error);
        return null;
    }
}

export async function approvePendingTheme(env, id) {
    try {
        const themeData = await env.THEMES_KV.get(`pending:${id}`);
        if (!themeData) {
            throw new Error('Theme not found');
        }

        await env.THEMES_KV.put(`approved:${id}`, themeData);
        await env.THEMES_KV.delete(`pending:${id}`);
    } catch (error) {
        console.error('KV Error:', error);
        throw error;
    }
}

export async function rejectPendingTheme(env, id) {
    try {
        await env.THEMES_KV.delete(`pending:${id}`);
    } catch (error) {
        console.error('KV Error:', error);
        throw error;
    }
}

// New function to delete approved themes
export async function deleteApprovedTheme(env, id) {
    try {
        await env.THEMES_KV.delete(`approved:${id}`);
    } catch (error) {
        console.error('KV Error:', error);
        throw error;
    }
}