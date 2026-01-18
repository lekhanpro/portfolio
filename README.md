# 🚀 Lekhan H R - Premium Developer Portfolio

[![Three.js](https://img.shields.io/badge/Three.js-0.170.0-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![GitHub API](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github)](https://docs.github.com/en/rest)
[![Live Demo](https://img.shields.io/badge/LIVE-DEMO-blue?style=for-the-badge)](https://your-vercel-url.vercel.app)

## ✨ Features

### 🎨 **3D Particle Animation Background**
- **Three.js powered** interactive particle wave system
- 2000+ animated particles with dynamic color gradients  
- Mouse-reactive movements for immersive experience
- Smooth 60fps performance with optimized rendering

### 🔗 **Live GitHub Integration**
- **Auto-synced** repos - updates when you create new projects!
- Real-time GitHub stats (repos, stars, followers)
- Intelligent achievement system based on activity
- Smart caching (10 min) to respect API limits
- Automatic project categorization by language

### 🎭 **Achievement Badges**
Automatically generated based on your GitHub activity:
- ✨ Star Collector (total stars across repos)
- 📦 Repository Creator (10+ public repos)  
- 🎂 GitHub Anniversary
- 🌐 Polyglot Developer (5+ languages)
- 🚀 Active Developer (recent commits)

### 💎 **Premium Design**
- Glassmorphism effects with frosted glass UI
- Smooth gradient animations
- Custom cursor glow effect
- Responsive design (mobile → desktop)
- SEO optimized with semantic HTML

## 🛠️ Technologies

| Category | Stack |
|----------|-------|
| **3D Graphics** | Three.js (CDN via import maps) |
| **API Integration** | GitHub REST API v3 |
| **Frontend** | HTML5, CSS3, Vanilla JS |
| **Fonts** | Inter, JetBrains Mono |
| **Deployment** | Vercel |

## 📂 Project Structure

```
portfoiloo/
├── index.html              # Main landing page
├── about.html             # About page with skills
├── projects.html          # GitHub-powered projects (auto-updated!)
├── experience.html        # Timeline of experience
├── contact.html           # Contact information
├── css/
│   └── style.css          # Premium glassmorphism styles
├── js/
│   ├── main.js            # Core interactions
│   ├── threejs-bg.js      # Three.js particle animation
│   └── github-api.js      # GitHub API integration with caching
└── README.md
```

## 🚦 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lekhanpro/portfolio.git
   cd portfolio
   ```

2. **Serve locally**  
   No build step needed! Just open with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Customization

#### Update GitHub Username
In `js/github-api.js`:
```javascript
const GITHUB_USERNAME = 'lekhanpro'; // Change to your username
```

#### Customize Three.js Particles
In `js/threejs-bg.js`:
```javascript
particleCount = 2000;  // Number of particles
const color1 = new THREE.Color(0x6366f1); // Particle colors
```

#### Adjust Cache Duration
In `js/github-api.js`:
```javascript
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
```

## 📊 GitHub API Features

### Automatic Project Detection
The portfolio intelligently filters and displays projects:
- ✅ Excludes forks
- ✅ Filters out placeholder repos  
- ✅ Sorts by stars + recent activity
- ✅ Shows top 12 most relevant projects

### Smart Language Icons
Automatic language detection with custom icons:
- 🟨 JavaScript/TypeScript
- 🐍 Python  
- 🎨 HTML/CSS
- ⚙️ C/C++
- And more!

### Rate Limiting Protection
- Local storage caching (10 min default)
- Prevents hitting GitHub API limits
- Fallback to cached data on failure

## 🎨 Design Philosophy

### Color Palette
```css
--color-primary: #6366f1    /* Indigo */
--color-secondary: #a855f7  /* Purple */
--color-accent: #ec4899     /* Pink */
--color-bg: #0a0a0a         /* Deep black */
```

### Typography
- **Headings**: Inter (800-900 weight)
- **Body**: Inter (400-600 weight)  
- **Code**: JetBrains Mono (monospace)

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import on Vercel
3. Deploy! (Auto-deploys on push)

### Netlify
1. Drag & drop the folder
2. Or connect GitHub repo
3. Deploy!

No build configuration needed - it's pure HTML/CSS/JS!

##💡 Performance

- ⚡ **Lighthouse Score**: 95+ (Performance)
- 🎯 **FCP**: < 1s (First Contentful Paint)
- 🚀 **TTI**: < 2s (Time to Interactive)
- 📦 **Bundle Size**: < 100KB (without Three.js)

## 📝 License

MIT License - Feel free to use this portfolio as inspiration or template!

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue or PR!

---

**Built with 💜 by Lekhan H R**  
*AI Enthusiast | Full-Stack Developer | Building the future, one commit at a time*

