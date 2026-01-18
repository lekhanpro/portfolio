/**
 * ═══════════════════════════════════════════════════════════════
 * GITHUB API INTEGRATION
 * Automatically fetch and display repos, stats, and achievements
 * ═══════════════════════════════════════════════════════════════
 */

const GITHUB_USERNAME = 'lekhanpro';
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const GITHUB_API = 'https://api.github.com';

// Cache management
const cache = {
    get(key) {
        const item = localStorage.getItem(`gh_${key}`);
        if (!item) return null;
        const { data, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(`gh_${key}`);
            return null;
        }
        return data;
    },
    set(key, data) {
        localStorage.setItem(`gh_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    }
};

/**
 * Fetch GitHub user profile
 */
async function fetchGitHubProfile() {
    const cached = cache.get('profile');
    if (cached) return cached;

    try {
        const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`);
        const data = await response.json();
        cache.set('profile', data);
        return data;
    } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        return null;
    }
}

/**
 * Fetch GitHub repositories
 */
async function fetchGitHubRepos() {
    const cached = cache.get('repos');
    if (cached) return cached;

    try {
        const response = await fetch(
            `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        );
        const data = await response.json();
        cache.set('repos', data);
        return data;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
    }
}

/**
 * Calculate GitHub achievements based on activity
 */
function calculateAchievements(profile, repos) {
    const achievements = [];

    // Public repos count
    if (profile.public_repos >= 10) {
        achievements.push({
            icon: '📦',
            title: 'Repository Creator',
            desc: `${profile.public_repos} public repositories`
        });
    }

    // Total stars
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    if (totalStars > 0) {
        achievements.push({
            icon: '⭐',
            title: 'Star Collector',
            desc: `${totalStars} total stars`
        });
    }

    // Account age
    const accountAge = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    );
    if (accountAge >= 1) {
        achievements.push({
            icon: '🎂',
            title: `${accountAge} Year${accountAge > 1 ? 's' : ''} on GitHub`,
            desc: `Member since ${new Date(profile.created_at).getFullYear()}`
        });
    }

    // Language diversity
    const languages = new Set(repos.map(r => r.language).filter(Boolean));
    if (languages.size >= 5) {
        achievements.push({
            icon: '🌐',
            title: 'Polyglot Developer',
            desc: `${languages.size} programming languages`
        });
    }

    // Active projects (updated in last 30 days)
    const activeProjects = repos.filter(repo => {
        const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 30;
    }).length;

    if (activeProjects > 0) {
        achievements.push({
            icon: '🚀',
            title: 'Active Developer',
            desc: `${activeProjects} project${activeProjects > 1 ? 's' : ''} updated recently`
        });
    }

    return achievements;
}

/**
 * Update GitHub stats in the UI
 */
async function updateGitHubStats() {
    const profile = await fetchGitHubProfile();
    const repos = await fetchGitHubRepos();

    if (!profile || !repos) return;

    // Update profile info
    const profileName = document.getElementById('gh-profile-name');
    const profileBio = document.getElementById('gh-profile-bio');
    const profileAvatar = document.getElementById('gh-profile-avatar');

    if (profileName) profileName.textContent = profile.name || profile.login;
    if (profileBio) profileBio.textContent = profile.bio || 'No bio available';
    if (profileAvatar && profile.avatar_url) {
        profileAvatar.src = profile.avatar_url;
        profileAvatar.alt = profile.name || profile.login;
    }

    // Update stats with animation
    updateStat('gh-repos-count', profile.public_repos);
    updateStat('gh-followers-count', profile.followers);

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    updateStat('gh-stars-count', totalStars);

    // Update achievements
    const achievements = calculateAchievements(profile, repos);
    displayAchievements(achievements);

    // Update projects grid
    displayProjects(repos);
}

/**
 * Animate stat counter
 */
function updateStat(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (targetValue - startValue) * eased);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = targetValue;
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Display achievements
 */
function displayAchievements(achievements) {
    const container = document.getElementById('gh-achievements');
    if (!container) return;

    container.innerHTML = achievements.map(({ icon, title, desc }) => `
        <div class="achievement-badge" data-aos="fade-up">
            <span class="achievement-icon">${icon}</span>
            <div class="achievement-info">
                <h4 class="achievement-title">${title}</h4>
                <p class="achievement-desc">${desc}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Display projects from GitHub
 */
function displayProjects(repos) {
    const container = document.getElementById('gh-projects-grid');
    if (!container) return;

    // Filter out unwanted repos and sort by stars + recent activity
    const featuredRepos = repos
        .filter(repo => !repo.fork && !['lekhanpro', 'Love', 'loveforu'].includes(repo.name))
        .sort((a, b) => {
            const scoreA = (a.stargazers_count * 10) + (new Date(a.updated_at).getTime() / 1000000000);
            const scoreB = (b.stargazers_count * 10) + (new Date(b.updated_at).getTime() / 1000000000);
            return scoreB - scoreA;
        })
        .slice(0, 12); // Show top 12 projects

    container.innerHTML = featuredRepos.map((repo, index) => {
        const languages = getLanguageIcon(repo.language);
        const isRecent = isRecentlyUpdated(repo.updated_at);

        return `
            <article class="project-card" data-category="${languages.category}" data-aos="fade-up" data-aos-delay="${index * 50}">
                ${isRecent ? '<div class="project-badges"><span class="badge">🆕 Recent</span></div>' : ''}
                ${repo.stargazers_count > 0 ? `<div class="project-badges"><span class="badge">⭐ ${repo.stargazers_count}</span></div>` : ''}
                
                <h3 class="project-title">${formatRepoName(repo.name)}</h3>
                <p class="project-desc">
                    ${repo.description || 'No description available'}
                </p>
                
                ${repo.language ? `
                    <div class="project-tech">
                        <span>${languages.icon} ${repo.language}</span>
                        ${repo.homepage ? '<span>🌐 Live Demo</span>' : ''}
                    </div>
                ` : ''}
                
                <div class="project-links">
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Live Demo
                        </a>
                    ` : ''}
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Source
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Helper: Get language icon and category
 */
function getLanguageIcon(language) {
    const langMap = {
        'JavaScript': { icon: '🟨', category: 'web' },
        'TypeScript': { icon: '🔷', category: 'web' },
        'Python': { icon: '🐍', category: 'backend' },
        'HTML': { icon: '📄', category: 'web' },
        'CSS': { icon: '🎨', category: 'web' },
        'Java': { icon: '☕', category: 'backend' },
        'EJS': { icon: '📝', category: 'web' },
        'C++': { icon: '⚙️', category: 'systems' },
        'React': { icon: '⚛️', category: 'frontend' },
    };

    return langMap[language] || { icon: '📦', category: 'other' };
}

/**
 * Helper: Check if repo was updated recently
 */
function isRecentlyUpdated(updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7; // Updated within last week
}

/**
 * Helper: Format repository name
 */
function formatRepoName(name) {
    return name
        .replace(/-/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Auto-update on page load
document.addEventListener('DOMContentLoaded', () => {
    updateGitHubStats();

    // Refresh every 10 minutes
    setInterval(updateGitHubStats, CACHE_DURATION);
});

// Export for use in other modules
window.GitHubAPI = {
    fetchProfile: fetchGitHubProfile,
    fetchRepos: fetchGitHubRepos,
    updateStats: updateGitHubStats
};
