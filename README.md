# Lekhan H R - Portfolio

Minimal editorial portfolio inspired by studio-style layouts, with content pulled live from GitHub.

## Features
- Studio-inspired minimal layout with airy typography
- GitHub REST API integration for profile stats and projects
- Dynamic About, Projects, Experience, and Contact content
- Responsive multi-page layout for desktop + mobile
- SEO-friendly meta tags plus `sitemap.xml` and `robots.txt`

## Pages
- `index.html` - Home
- `about.html` - About
- `projects.html` - Projects
- `experience.html` - Experience
- `contact.html` - Contact

## Tech Stack
- HTML5, CSS3, Vanilla JS
- GitHub REST API (public endpoints)
- Google Fonts: Cormorant Garamond, Manrope

## Project Structure
```
portfoiloo/
  index.html
  about.html
  projects.html
  experience.html
  contact.html
  css/
    puntocero.css
    style.css
  js/
    site.js
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
- GitHub username: update `GITHUB_USERNAME` in `js/site.js`
- GitHub cache duration: update `CACHE_DURATION` in `js/site.js`
- Theme styles: update CSS variables in `css/puntocero.css`
- Contact info: update the Contact details in `contact.html`

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
