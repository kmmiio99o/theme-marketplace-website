export async function getThemes(request) {
    const env = request.env;

    try {
        const list = await env.THEMES.list({ prefix: 'approved:' });
        const themes = [];

        for (const key of list.keys) {
            const value = await env.THEMES.get(key.name);
            if (value) {
                const theme = JSON.parse(value);
                themes.push({
                    ...theme,
                    json: JSON.stringify(theme, null, 2),
                    id: key.name.split(':')[1]
                });
            }
        }

        const html = renderTemplate('home', { themes });
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error loading themes', { status: 500 });
    }
}

export async function showSubmitForm(request) {
    const html = renderTemplate('submit');
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

export async function submitTheme(request) {
    const env = request.env;

    try {
        const formData = await request.formData();
        const themeData = formData.get('themeData');

        if (!themeData) {
            const html = renderTemplate('submit', { error: 'Please provide theme data' });
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        let theme;
        try {
            theme = JSON.parse(themeData);
        } catch (e) {
            const html = renderTemplate('submit', { error: 'Invalid JSON format' });
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        if (!theme.name) {
            theme.name = 'Untitled Theme';
        }
        if (!theme.description) {
            theme.description = 'No description provided';
        }

        const id = crypto.randomUUID();
        await env.THEMES.put(`pending:${id}`, JSON.stringify(theme));

        const html = renderTemplate('submit', {
            success: 'Theme submitted successfully! Awaiting admin approval.'
        });
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Error:', error);
        const html = renderTemplate('submit', { error: 'Error submitting theme' });
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

export async function showPendingThemes(request) {
    const env = request.env;

    try {
        const list = await env.THEMES.list({ prefix: 'pending:' });
        const themes = [];

        for (const key of list.keys) {
            const value = await env.THEMES.get(key.name);
            if (value) {
                const theme = JSON.parse(value);
                const id = key.name.split(':')[1];
                themes.push({
                    id,
                    ...theme,
                    json: JSON.stringify(theme, null, 2)
                });
            }
        }

        const html = renderTemplate('pending', { themes });
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error loading pending themes', { status: 500 });
    }
}

function renderTemplate(templateName, data = {}) {
    const templates = {
        base: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThemeHub - Professional Theme Marketplace</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #4361ee;
            --secondary: #3f37c9;
            --success: #4cc9f0;
            --danger: #f72585;
            --warning: #f8961e;
            --info: #4895ef;
            --light: #f8f9fa;
            --dark: #212529;
            --gray: #6c757d;
            --light-gray: #e9ecef;
            --border: #dee2e6;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --shadow-hover: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
        }
        
        .logo i {
            color: var(--secondary);
        }
        
        .nav-links {
            display: flex;
            gap: 30px;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        
        .nav-links a:hover {
            background: var(--light-gray);
            color: var(--primary);
        }
        
        .nav-links a.active {
            background: var(--primary);
            color: white;
        }
        
        main {
            padding: 40px 0;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
            color: var(--dark);
            margin-bottom: 10px;
        }
        
        .page-header p {
            font-size: 1.2rem;
            color: var(--gray);
            max-width: 600px;
            margin: 0 auto;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            padding: 30px;
            margin-bottom: 30px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .theme-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .theme-card {
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .theme-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .theme-header {
            padding: 20px;
            border-bottom: 1px solid var(--border);
        }
        
        .theme-title {
            font-size: 1.4rem;
            color: var(--dark);
            margin-bottom: 5px;
        }
        
        .theme-meta {
            display: flex;
            justify-content: space-between;
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        .theme-body {
            padding: 20px;
        }
        
        .theme-description {
            color: var(--dark);
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .theme-json {
            background: var(--light-gray);
            border-radius: 6px;
            padding: 15px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
            max-height: 200px;
            overflow: auto;
            margin-top: 15px;
        }
        
        .theme-actions {
            padding: 20px;
            background: var(--light-gray);
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--secondary);
        }
        
        .btn-success {
            background: var(--success);
            color: white;
        }
        
        .btn-success:hover {
            background: #38b2d0;
        }
        
        .btn-danger {
            background: var(--danger);
            color: white;
        }
        
        .btn-danger:hover {
            background: #e11570;
        }
        
        .btn-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }
        
        .btn-outline:hover {
            background: var(--primary);
            color: white;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--dark);
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border);
            border-radius: 6px;
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }
        
        textarea.form-control {
            min-height: 300px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
        }
        
        .alert {
            padding: 15px 20px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: rgba(76, 201, 240, 0.2);
            border: 1px solid var(--success);
            color: #0d6efd;
        }
        
        .alert-danger {
            background: rgba(247, 37, 133, 0.2);
            border: 1px solid var(--danger);
            color: var(--danger);
        }
        
        .stats-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            margin-bottom: 30px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
        }
        
        .stat-label {
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
        }
        
        .empty-state i {
            font-size: 4rem;
            color: var(--light-gray);
            margin-bottom: 20px;
        }
        
        .empty-state h3 {
            font-size: 1.5rem;
            color: var(--dark);
            margin-bottom: 10px;
        }
        
        .empty-state p {
            color: var(--gray);
            margin-bottom: 20px;
        }
        
        footer {
            background: var(--dark);
            color: white;
            text-align: center;
            padding: 30px 0;
            margin-top: 60px;
        }
        
        @media (max-width: 768px) {
            .navbar {
                flex-direction: column;
                gap: 15px;
            }
            
            .nav-links {
                gap: 15px;
            }
            
            .theme-grid {
                grid-template-columns: 1fr;
            }
            
            .page-header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <nav class="navbar">
                <a href="/" class="logo">
                    <i class="fas fa-palette"></i>
                    <span>ThemeHub</span>
                </a>
                <div class="nav-links">
                    <a href="/"><i class="fas fa-home"></i> Home</a>
                    <a href="/submit"><i class="fas fa-plus-circle"></i> Submit Theme</a>
                    <a href="/admin"><i class="fas fa-user-shield"></i> Admin</a>
                </div>
            </nav>
        </div>
    </header>
    
    <main>
        <div class="container">
            {{{content}}}
        </div>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; 2023 ThemeHub. Professional Theme Marketplace.</p>
        </div>
    </footer>
</body>
</html>`,

        home: `<div class="page-header">
    <h1><i class="fas fa-paint-brush"></i> Available Themes</h1>
    <p>Discover and download professionally designed themes for your projects</p>
</div>

{{#themes.length}}
<div class="stats-card">
    <div class="stat-item">
        <div class="stat-number">{{themes.length}}</div>
        <div class="stat-label">Themes Available</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">12</div>
        <div class="stat-label">Designers</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">1.2K</div>
        <div class="stat-label">Downloads</div>
    </div>
</div>

<div class="theme-grid">
    {{#themes}}
    <div class="theme-card">
        <div class="theme-header">
            <h3 class="theme-title">{{name}}</h3>
            <div class="theme-meta">
                <span><i class="fas fa-calendar"></i> {{date}}</span>
                <span><i class="fas fa-user"></i> {{author}}</span>
            </div>
        </div>
        <div class="theme-body">
            <p class="theme-description">{{description}}</p>
            <details>
                <summary><i class="fas fa-code"></i> View JSON Structure</summary>
                <div class="theme-json">{{json}}</div>
            </details>
        </div>
        <div class="theme-actions">
            <button class="btn btn-primary"><i class="fas fa-download"></i> Download</button>
            <button class="btn btn-outline"><i class="fas fa-heart"></i> Favorite</button>
        </div>
    </div>
    {{/themes}}
</div>
{{/themes.length}}

{{^themes.length}}
<div class="empty-state">
    <i class="fas fa-box-open"></i>
    <h3>No Themes Available</h3>
    <p>Be the first to contribute a theme to our marketplace!</p>
    <a href="/submit" class="btn btn-primary"><i class="fas fa-plus"></i> Submit Your First Theme</a>
</div>
{{/themes.length}}`,

        submit: `<div class="page-header">
    <h1><i class="fas fa-cloud-upload-alt"></i> Submit New Theme</h1>
    <p>Share your professionally designed theme with the community</p>
</div>

{{#error}}
<div class="alert alert-danger">
    <i class="fas fa-exclamation-circle"></i> {{error}}
</div>
{{/error}}

{{#success}}
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i> {{success}}
</div>
{{/success}}

<div class="card">
    <form method="POST">
        <div class="form-group">
            <label class="form-label" for="themeData">Theme JSON Configuration</label>
            <textarea 
                class="form-control" 
                id="themeData" 
                name="themeData" 
                placeholder='{&#10;  "name": "Modern Dark Theme",&#10;  "description": "A sleek dark theme with vibrant accents",&#10;  "author": "Your Name",&#10;  "version": "1.0.0",&#10;  "colors": {&#10;    "primary": "#4361ee",&#10;    "secondary": "#3f37c9",&#10;    "background": "#101010",&#10;    "text": "#f8f9fa"&#10;  },&#10;  "fonts": {&#10;    "heading": "Poppins, sans-serif",&#10;    "body": "Inter, sans-serif"&#10;  }&#10;}' 
                required>{{#themeData}}{{themeData}}{{/themeData}}</textarea>
        </div>
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> Submit for Review
        </button>
    </form>
</div>

<div class="card">
    <h3><i class="fas fa-info-circle"></i> Submission Guidelines</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Ensure your JSON is valid and properly formatted</li>
        <li>Include a descriptive name and detailed description</li>
        <li>Provide author information for attribution</li>
        <li>All submissions are reviewed before publication</li>
        <li>Inappropriate content will be rejected</li>
    </ul>
</div>`,

        admin: `<div class="page-header">
    <h1><i class="fas fa-user-shield"></i> Admin Dashboard</h1>
    <p>Manage theme submissions and platform settings</p>
</div>

<div class="stats-card">
    <div class="stat-item">
        <div class="stat-number">{{pendingCount}}</div>
        <div class="stat-label">Pending Reviews</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">{{approvedCount}}</div>
        <div class="stat-label">Published Themes</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">24</div>
        <div class="stat-label">Total Users</div>
    </div>
</div>

<div class="card">
    <h3><i class="fas fa-tasks"></i> Administrative Actions</h3>
    <div style="margin: 20px 0;">
        <a href="/pending" class="btn btn-primary">
            <i class="fas fa-eye"></i> Review Pending Themes ({{pendingCount}})
        </a>
        <button class="btn btn-outline" style="margin-left: 10px;">
            <i class="fas fa-cog"></i> Platform Settings
        </button>
    </div>
</div>

{{#message}}
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i> {{message}}
</div>
{{/message}}`,

        pending: `<div class="page-header">
    <h1><i class="fas fa-clock"></i> Pending Theme Reviews</h1>
    <p>Review and approve community submissions</p>
</div>

{{#themes.length}}
<div class="stats-card">
    <div class="stat-item">
        <div class="stat-number">{{themes.length}}</div>
        <div class="stat-label">Themes Awaiting Review</div>
    </div>
</div>

<div class="theme-grid">
    {{#themes}}
    <div class="theme-card">
        <div class="theme-header">
            <h3 class="theme-title">{{name}}</h3>
            <div class="theme-meta">
                <span><i class="fas fa-user"></i> {{author}}</span>
            </div>
        </div>
        <div class="theme-body">
            <p class="theme-description">{{description}}</p>
            <details>
                <summary><i class="fas fa-code"></i> View JSON Structure</summary>
                <div class="theme-json">{{json}}</div>
            </details>
        </div>
        <div class="theme-actions">
            <form method="POST" action="/admin/approve/{{id}}" style="display: inline;">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-check"></i> Approve
                </button>
            </form>
            <form method="POST" action="/admin/reject/{{id}}" style="display: inline;">
                <button type="submit" class="btn btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            </form>
        </div>
    </div>
    {{/themes}}
</div>
{{/themes.length}}

{{^themes.length}}
<div class="empty-state">
    <i class="fas fa-check-circle"></i>
    <h3>All Caught Up!</h3>
    <p>No themes are currently pending review.</p>
</div>
{{/themes.length}}`
    };

    let content = templates[templateName] || '';

    // Template rendering logic
    content = content.replace(/{{#(\w+)\.length}}([\s\S]*?){{\/\1}}/g, (match, arrayName, innerContent) => {
        const array = data[arrayName] || [];
        if (array.length > 0) {
            return array.map(item => {
                let itemContent = innerContent;
                Object.keys(item).forEach(key => {
                    itemContent = itemContent.replace(new RegExp(`{{${key}}}`, 'g'), item[key] || '');
                });
                return itemContent;
            }).join('');
        }
        return '';
    });

    content = content.replace(/{{\^(\w+)\.length}}([\s\S]*?){{\/\1}}/g, (match, arrayName, innerContent) => {
        const array = data[arrayName] || [];
        return array.length === 0 ? innerContent : '';
    });

    Object.keys(data).forEach(key => {
        if (key !== 'themes') {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), data[key] || '');
        }
    });

    return templates.base.replace('{{{content}}}', content);
}