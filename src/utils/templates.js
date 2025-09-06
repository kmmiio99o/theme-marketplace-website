// This file will read HTML files from the templates directory
// For Cloudflare Workers, we need to import them as text

export async function renderTemplate(templateName, data = {}) {
    // In a real implementation, you would import templates like this:
    // import baseTemplate from '../templates/base.html';
    // import homeTemplate from '../templates/home.html';

    // For this example, I'll provide a simple template renderer
    const templates = {
        'base.html': `<!DOCTYPE html>
<html>
<head>
  <title>Theme Marketplace</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    header { border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
    nav a { margin-right: 15px; text-decoration: none; color: #007acc; }
    nav a:hover { text-decoration: underline; }
    .theme { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; background: #fafafa; }
    .theme h3 { margin-top: 0; color: #333; }
    textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; }
    .actions { margin-top: 10px; }
    button { padding: 8px 15px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; }
    button:hover { background: #005a9e; }
    .reject { background: #dc3545; }
    .reject:hover { background: #c82333; }
    form { margin: 20px 0; }
    .alert { padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724; margin: 15px 0; }
    .empty { text-align: center; color: #666; font-style: italic; padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Theme Marketplace</h1>
      <nav>
        <a href="/">Home</a> | 
        <a href="/submit">Submit Theme</a> | 
        <a href="/admin">Admin Panel</a>
      </nav>
    </header>
    <main>
      {{{content}}}
    </main>
  </div>
</body>
</html>`,

        'home.html': `<h2>Available Themes</h2>

{{#themes.length}}
  {{#themes}}
    <div class="theme">
      <h3>{{name}}</h3>
      <p><strong>Description:</strong> {{description}}</p>
      <details>
        <summary>View JSON</summary>
        <pre>{{{json}}}</pre>
      </details>
    </div>
  {{/themes}}
{{/themes.length}}

{{^themes.length}}
  <div class="empty">
    <p>No themes available yet.</p>
  </div>
{{/themes.length}}`,

        'submit.html': `<h2>Submit New Theme</h2>

<form method="POST">
  <p>
    <label for="themeData"><strong>Theme JSON:</strong></label><br>
    <textarea 
      id="themeData" 
      name="themeData" 
      required 
      placeholder='{&#10;  "name": "My Theme",&#10;  "description": "A beautiful theme",&#10;  "colors": {&#10;    "primary": "#007acc",&#10;    "secondary": "#6c757d"&#10;  }&#10;}'></textarea>
  </p>
  <button type="submit">Submit for Review</button>
</form>`,

        'admin.html': `<h2>Admin Panel</h2>

<ul>
  <li><a href="/pending">Review Pending Themes ({{pendingCount}})</a></li>
</ul>

{{#message}}
  <div class="alert">{{message}}</div>
{{/message}}`,

        'pending.html': `<h2>Pending Themes for Review</h2>

{{#themes.length}}
  {{#themes}}
    <div class="theme">
      <h3>{{name}}</h3>
      <p><strong>Description:</strong> {{description}}</p>
      <details>
        <summary>View JSON</summary>
        <pre>{{{json}}}</pre>
      </details>
      <div class="actions">
        <form method="POST" action="/admin/approve/{{id}}" style="display: inline;">
          <button type="submit">Approve</button>
        </form>
        <form method="POST" action="/admin/reject/{{id}}" style="display: inline;">
          <button type="submit" class="reject">Reject</button>
        </form>
      </div>
    </div>
  {{/themes}}
{{/themes.length}}

{{^themes.length}}
  <div class="empty">
    <p>No pending themes for review.</p>
  </div>
{{/themes.length}}`
    };

    let template = templates[templateName] || '';

    // Simple template rendering (Handlebars-like)
    template = template.replace(/{{{(\w+)}}}/g, (_, key) => data[key] || '');

    // Handle {{#array.length}}...{{/array}} blocks
    template = template.replace(/{{#(\w+)\.length}}([\s\S]*?){{\/\1}}/g, (_, arrayName, content) => {
        const array = data[arrayName] || [];
        if (array.length > 0) {
            return array.map(item => {
                return content.replace(/{{(\w+)}}/g, (_, key) => item[key] || '');
            }).join('');
        }
        return '';
    });

    // Handle {{^array.length}}...{{/array}} (inverse blocks)
    template = template.replace(/{{\^(\w+)\.length}}([\s\S]*?){{\/\1}}/g, (_, arrayName, content) => {
        const array = data[arrayName] || [];
        return array.length === 0 ? content : '';
    });

    // Handle simple variables {{variable}}
    template = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');

    // Insert content into base template
    if (templateName !== 'base.html') {
        return templates['base.html'].replace('{{{content}}}', template);
    }

    return template;
}