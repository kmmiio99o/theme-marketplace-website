export default {
    async fetch(request, env) {
        return new Response(JSON.stringify({
            GITHUB_TOKEN: env.GITHUB_TOKEN ? 'SET' : 'NOT SET',
            GITHUB_OWNER: env.GITHUB_OWNER ? 'SET' : 'NOT SET',
            GITHUB_REPO: env.GITHUB_REPO ? 'SET' : 'NOT SET',
            ALL_SET: !!(env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO)
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};