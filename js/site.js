const GITHUB_USERNAME = 'lekhanpro';
const CACHE_DURATION = 1000 * 60 * 10;
const GITHUB_API = 'https://api.github.com';

const cache = {
    get(key) {
        try {
            const raw = localStorage.getItem(`gh_${key}`);
            if (!raw) return null;
            const { data, timestamp } = JSON.parse(raw);
            if (Date.now() - timestamp > CACHE_DURATION) {
                localStorage.removeItem(`gh_${key}`);
                return null;
            }
            return data;
        } catch (error) {
            return null;
        }
    },
    set(key, data) {
        try {
            localStorage.setItem(`gh_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (error) {
            // Ignore cache errors (private mode, etc)
        }
    }
};

async function fetchGitHub(path) {
    const response = await fetch(`${GITHUB_API}${path}`);
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    return response.json();
}

async function fetchProfile() {
    const cached = cache.get('profile');
    if (cached) return cached;
    const data = await fetchGitHub(`/users/${GITHUB_USERNAME}`);
    cache.set('profile', data);
    return data;
}

async function fetchRepos() {
    const cached = cache.get('repos');
    if (cached) return cached;
    const data = await fetchGitHub(`/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
    cache.set('repos', data);
    return data;
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function normalizeProfile(profile) {
    return {
        name: profile.name || profile.login,
        login: profile.login,
        avatar: profile.avatar_url,
        bio: profile.bio || 'No bio available yet.',
        location: profile.location || 'Location not shared',
        company: profile.company || 'Independent',
        blog: profile.blog || '',
        email: profile.email || '',
        twitter: profile.twitter_username || '',
        followers: profile.followers || 0,
        repos: profile.public_repos || 0,
        createdAt: profile.created_at,
        url: profile.html_url
    };
}

function getActiveRepos(repos) {
    return repos.filter(repo => !repo.fork && !repo.archived);
}

function getTopRepos(repos, limit) {
    return repos
        .slice()
        .sort((a, b) => {
            const scoreA = a.stargazers_count * 10 + new Date(a.updated_at).getTime() / 1000000000;
            const scoreB = b.stargazers_count * 10 + new Date(b.updated_at).getTime() / 1000000000;
            return scoreB - scoreA;
        })
        .slice(0, limit);
}

function getLanguageStats(repos) {
    const counts = {};
    repos.forEach(repo => {
        if (!repo.language) return;
        counts[repo.language] = (counts[repo.language] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
        entries,
        top: entries[0] ? entries[0][0] : '—'
    };
}

function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function projectGradient(name) {
    const hash = hashString(name);
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    return {
        hue1,
        hue2
    };
}

function ensureUrl(value) {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `https://${value}`;
}

function formatWebsite(value) {
    if (!value) return '';
    return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function setText(el, value, fallback = '—') {
    if (!el) return;
    if (!value) {
        el.textContent = fallback;
        el.classList.add('empty');
        return;
    }
    el.textContent = value;
}

function setLink(el, value) {
    if (!el) return;
    if (!value) {
        el.classList.add('empty');
        el.removeAttribute('href');
        return;
    }
    el.href = value;
}

function renderProfile(profile) {
    document.querySelectorAll('[data-gh]').forEach(el => {
        const key = el.dataset.gh;
        switch (key) {
            case 'name':
                setText(el, profile.name);
                break;
            case 'login':
                setText(el, profile.login);
                break;
            case 'bio':
                setText(el, profile.bio);
                break;
            case 'location':
                setText(el, profile.location);
                break;
            case 'company':
                setText(el, profile.company);
                break;
            case 'followers':
                setText(el, profile.followers.toLocaleString());
                break;
            case 'repos':
                setText(el, profile.repos.toLocaleString());
                break;
            case 'joined':
                setText(el, formatDate(profile.createdAt));
                break;
            case 'website':
                setText(el, profile.blog ? formatWebsite(profile.blog) : 'No website');
                break;
            case 'email':
                setText(el, profile.email || 'Email not public');
                break;
            case 'twitter':
                setText(el, profile.twitter ? `@${profile.twitter}` : 'Not shared');
                break;
            case 'avatar':
                if (el.tagName === 'IMG') {
                    el.src = profile.avatar;
                    el.alt = profile.name;
                }
                break;
            default:
                break;
        }
    });

    document.querySelectorAll('[data-gh-link]').forEach(el => {
        const key = el.dataset.ghLink;
        if (key === 'github') {
            setLink(el, profile.url);
        } else if (key === 'twitter') {
            setLink(el, profile.twitter ? `https://twitter.com/${profile.twitter}` : '');
        } else if (key === 'blog') {
            setLink(el, ensureUrl(profile.blog));
        } else if (key === 'email') {
            setLink(el, profile.email ? `mailto:${profile.email}` : '');
        }
    });
}

function renderLanguages(languages) {
    document.querySelectorAll('[data-gh-languages-placeholder]').forEach(el => {
        setText(el, languages.top);
    });

    document.querySelectorAll('[data-gh-languages]').forEach(container => {
        container.innerHTML = '';
        languages.entries.slice(0, 6).forEach(([name, count]) => {
            const item = document.createElement('div');
            item.className = 'stat-card';
            item.innerHTML = `
                <div class="stat-label">Language</div>
                <div class="stat-value">${name}</div>
                <div class="stat-sub">${count} repos</div>
            `;
            container.appendChild(item);
        });
    });
}

function renderProjects(repos) {
    document.querySelectorAll('[data-projects]').forEach(container => {
        const limit = parseInt(container.dataset.limit || '6', 10);
        const topRepos = getTopRepos(repos, limit);
        container.innerHTML = '';
        topRepos.forEach(repo => {
            const gradient = projectGradient(repo.name);
            const year = repo.updated_at ? new Date(repo.updated_at).getFullYear() : '';
            const card = document.createElement('article');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-thumb"></div>
                <div class="project-body">
                    <div class="project-meta">
                        <span>${repo.language || 'General'}</span>
                        <span>${year || '—'}</span>
                    </div>
                    <h3>${repo.name.replace(/-/g, ' ')}</h3>
                    <p>${repo.description || 'No description provided yet.'}</p>
                    <div class="project-links">
                        ${repo.homepage ? `<a href="${ensureUrl(repo.homepage)}" target="_blank" rel="noopener">Live</a>` : ''}
                        <a href="${repo.html_url}" target="_blank" rel="noopener">Source</a>
                    </div>
                </div>
            `;
            const thumb = card.querySelector('.project-thumb');
            if (thumb) {
                thumb.style.background = `
                    radial-gradient(circle at 20% 20%, hsl(${gradient.hue1} 50% 80%), transparent 55%),
                    radial-gradient(circle at 80% 80%, hsl(${gradient.hue2} 55% 75%), #f1e7db)
                `;
            }
            container.appendChild(card);
        });
    });
}

function renderExperience(profile, repos, languages) {
    document.querySelectorAll('[data-experience]').forEach(container => {
        const events = [];
        events.push({
            title: 'Joined GitHub',
            date: formatDate(profile.createdAt),
            detail: `Started as @${profile.login}`
        });

        if (repos.length) {
            const sortedByCreated = repos.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const firstRepo = sortedByCreated[0];
            events.push({
                title: 'First public repository',
                date: formatDate(firstRepo.created_at),
                detail: firstRepo.name
            });

            const mostStarred = repos.slice().sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
            events.push({
                title: 'Most starred project',
                date: formatDate(mostStarred.updated_at),
                detail: `${mostStarred.name} • ${mostStarred.stargazers_count} stars`
            });

            const mostRecent = repos.slice().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
            events.push({
                title: 'Latest update',
                date: formatDate(mostRecent.updated_at),
                detail: mostRecent.name
            });
        }

        events.push({
            title: 'Top language focus',
            date: '',
            detail: languages.top === '—' ? 'No languages detected yet' : languages.top
        });

        const limit = parseInt(container.dataset.limit || events.length.toString(), 10);
        container.innerHTML = '';
        events.slice(0, limit).forEach(event => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <span>${event.date}</span>
                <h3>${event.title}</h3>
                <p>${event.detail}</p>
            `;
            container.appendChild(item);
        });
    });
}

function updateContactForm(profile) {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    if (profile.email) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const subject = encodeURIComponent(formData.get('subject') || 'Portfolio Inquiry');
            const message = encodeURIComponent(formData.get('message') || '');
            window.location.href = `mailto:${profile.email}?subject=${subject}&body=${message}`;
        });
    } else {
        const note = document.querySelector('[data-contact-note]');
        if (note) {
            note.textContent = 'Email is not public. Please reach out via GitHub.';
        }
    }
}

async function init() {
    try {
        const [profileRaw, reposRaw] = await Promise.all([fetchProfile(), fetchRepos()]);
        const profile = normalizeProfile(profileRaw);
        const repos = getActiveRepos(reposRaw);
        const languages = getLanguageStats(repos);

        renderProfile(profile);
        renderLanguages(languages);
        renderProjects(repos);
        renderExperience(profile, repos, languages);
        updateContactForm(profile);
    } catch (error) {
        document.querySelectorAll('[data-gh-error]').forEach(el => {
            el.textContent = 'Unable to load GitHub data right now.';
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
