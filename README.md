# ThemeHub - Theme Marketplace

A modern, user-friendly marketplace for discovering, sharing, and managing themes. Built with Cloudflare Workers and featuring a Material Design-inspired interface.

![ThemeHub Screenshot](https://cdn.discordapp.com/attachments/1300495495071928321/1421322370605383781/j4SiMjf.png?ex=68d89d1c&is=68d74b9c&hm=6e08124ea48ce8314912b53701a4c3fe77989ffee625fb5ce15ae8947712eccf&)

## Features

- 🎨 Browse and search themes
- 🚀 Submit your own themes
- 📦 External repository support
- 👥 User-friendly admin panel
- 🔒 Secure authentication
- 🌐 Built on Cloudflare Workers
- 🎯 Material Design interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kmmiio99o/theme-marketplace-website.git
cd theme-marketplace-website
```

2. Install dependencies:
```bash
npm install
```

3. Configure Wrangler:
```bash
wrangler login
```

4. Create a KV namespace:
```bash
wrangler kv namespace create THEMES
```

5. Update your `wrangler.toml` with the new namespace ID:
```toml
kv_namespaces = [
  { binding = "THEMES", id = "your-namespace-id" }
]
```

### Development

Start the development server:
```bash
wrangler dev
```

### Deployment

Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

## Project Structure

```
theme-marketplace-website/
├── src/
│   ├── handlers/      # Request handlers
│   ├── utils/         # Utility functions
│   └── index.js       # Entry point
│   └── test.js        # Testing script
└── wrangler.toml      # Cloudflare configuration
```

## Environment Variables

Create a `.env` file with the following variables:

```env
GITHUB_TOKEN=your_github_token
ADMIN_PASSWORD=your_admin_password
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
```

## Features

### Theme Management
- Browse and search themes
- Submit new themes
- Theme version control
- Theme preview functionality

### External Repositories
- Submit external theme repositories
- Automatic theme detection
- Repository status management
- Theme synchronization

### Admin Panel
- Approve/reject themes
- Manage external repositories
- User management
- System statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Uses secure authentication
- Implements rate limiting
- Validates all user input
- Secures sensitive endpoints

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the [Issues](https://github.com/kmmiio99o/theme-marketplace-website/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible in bug reports

## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Uses [Material Design](https://material.io/design)
- Icons from [Material Symbols](https://fonts.google.com/icons)

## Contact

Your Name - [@kmmiio99o.dev](https://discord.com/users/879393496627306587)

Project Link: [https://github.com/kmmiio99o/theme-marketplace-website](https://github.com/kmmiio99o/theme-marketplace-website)
