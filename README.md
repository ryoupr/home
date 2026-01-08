# My Website

Personal portfolio website built with HTML, Tailwind CSS, and JavaScript.

## Features

- 📱 Responsive design (mobile, tablet, desktop)
- ♿ WCAG 2.1 AA accessibility compliant
- 🎨 Modern UI with Tailwind CSS
- ⚡ Optimized performance (lazy loading, minified assets)
- 🚀 GitHub Pages ready

## Development

```bash
# Install dependencies
npm install

# Watch Tailwind CSS changes
npm run build:watch

# Start development server (in another terminal)
npm run dev

# Format code
npm run format

# Lint JavaScript
npm run lint
```

Visit <http://localhost:8000> to view the site.

## Building for Production

```bash
# Build all assets (CSS + JS + HTML)
npm run build:all
```

This command will:

1. Minify Tailwind CSS → `css/output.css`
2. Minify JavaScript files → `js/**/*.min.js`
3. Generate production HTML → `index.prod.html`

## Deployment to GitHub Pages

### Option 1: Manual Deployment

```bash
# Build production assets
npm run build:all

# Apply production HTML
cp index.prod.html index.html

# Commit and push
git add .
git commit -m "Build for production"
git push origin main
```

Then enable GitHub Pages in repository settings:

- Settings → Pages
- Source: Deploy from a branch
- Branch: main / (root)

### Option 2: Automated Deployment (Recommended)

See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Actions setup.

### Custom Domain Setup (Optional)

If you want to use a custom domain:

1. Copy the CNAME template:

   ```bash
   cp CNAME.example CNAME
   ```

2. Edit `CNAME` and replace with your domain:

   ```
   yourdomain.com
   ```

3. Configure DNS records at your domain provider (see [DEPLOYMENT.md](DEPLOYMENT.md) for details)

4. Enable custom domain in GitHub Pages settings

## Customization

### Update Personal Information

Edit `js/config.js`:

```javascript
const config = {
  developer: {
    name: 'Your Name',
    role: 'Your Role',
    bio: 'Your bio...',
    email: 'your@email.com',
    social: {
      github: 'https://github.com/username',
      twitter: 'https://twitter.com/username',
      linkedin: 'https://linkedin.com/in/username'
    }
  }
};
```

### Add Projects

Edit `js/data/projects.js`:

```javascript
const projects = [
  {
    id: 'project-1',
    title: 'Project Name',
    description: 'Project description...',
    image: 'images/projects/project1.jpg',
    tags: ['JavaScript', 'React', 'Node.js'],
    links: {
      github: 'https://github.com/user/project',
      demo: 'https://demo.com',
      website: null
    }
  }
];
```

### Add Images

1. Place images in appropriate directories:
   - `images/hero/` - Avatar/hero images
   - `images/projects/` - Project screenshots
   - `images/icons/` - Icon files

2. Optimize images (see [images/IMAGE_OPTIMIZATION_GUIDE.md](images/IMAGE_OPTIMIZATION_GUIDE.md))

## Project Structure

```
.
├── index.html              # Main HTML file
├── index.prod.html         # Production HTML (generated)
├── css/
│   ├── input.css          # Tailwind directives
│   └── output.css         # Generated CSS (minified)
├── js/
│   ├── main.js            # Main application logic
│   ├── navigation.js      # Navigation functionality
│   ├── animations.js      # Scroll animations
│   ├── config.js          # Site configuration
│   ├── components/        # UI components
│   │   ├── ProjectCard.js
│   │   └── ProjectsSection.js
│   └── data/
│       └── projects.js    # Project data
├── images/
│   ├── hero/              # Hero section images
│   ├── projects/          # Project screenshots
│   └── icons/             # Icon files
├── scripts/
│   ├── minify-js.js       # JavaScript minification
│   └── create-production-html.js
├── package.json
├── tailwind.config.js
├── DEPLOYMENT.md          # Detailed deployment guide
└── README.md
```

## Performance

- ✅ CSS minified with Tailwind CLI
- ✅ JavaScript minified (40-50% size reduction)
- ✅ Images lazy loaded below the fold
- ✅ SVG icons for optimal quality and size
- ✅ Optimized for GitHub Pages hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this template for your own portfolio!

## Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Image Optimization Guide](images/IMAGE_OPTIMIZATION_GUIDE.md) - Image optimization best practices
- [Requirements](.kiro/specs/portfolio-website/requirements.md) - Feature requirements
- [Design Document](.kiro/specs/portfolio-website/design.md) - Technical design
