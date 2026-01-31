# Lekhan H R - Portfolio

Minimal 3D portfolio experience with interactive markers, GitHub-powered projects, and a clean HUD UI.

## Features
- Three.js 3D world with orbit controls and clickable markers
- GitHub REST API integration for profile stats, achievements, and featured repos
- Panel-based UI for About, Projects, and Contact
- Desktop + mobile friendly controls (drag, pinch, scroll)
- SEO-friendly meta tags plus `sitemap.xml` and `robots.txt`

## Pages
- `index.html` - 3D portfolio experience
- `about.html` - Legacy about page
- `projects.html` - Legacy projects page
- `experience.html` - Legacy experience page
- `contact.html` - Legacy contact page

## Tech Stack
- HTML5, CSS3, Vanilla JS
- Three.js (ESM import via CDN)
- GitHub REST API
- Google Fonts: Inter, JetBrains Mono

## Project Structure
```
portfoiloo/
  index.html
  about.html
  projects.html
  experience.html
  contact.html
  css/
    experience.css
    style.css
  js/
    experience.js
    experience-ui.js
    github-api.js
  images/
  sitemap.xml
  robots.txt
  vercel.json
  README.md
```

## Local Development
No build step is required. Serve the folder with any static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Configuration
- GitHub username: update `GITHUB_USERNAME` in `js/github-api.js`
- GitHub cache duration: update `CACHE_DURATION` in `js/github-api.js`
- 3D scene: adjust markers, colors, and camera settings in `js/experience.js`
- Theme styles: update CSS variables in `css/experience.css`
- Contact info: update the Contact panel content in `index.html`

## Deploy
### GitHub Pages
1. Push the repo to GitHub.
2. In GitHub: Settings -> Pages.
3. Source: deploy from branch, then select the default branch and root folder.
4. Your site will be available at `https://<user>.github.io/<repo>/`.

### Vercel
1. Import the repo in Vercel.
2. Deploy (no build command required).

## License
No license file is included. Add a `LICENSE` file if you plan to open-source.
