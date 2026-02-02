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
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const limit = 6;
    const topRepos = getTopRepos(repos, limit);
    grid.innerHTML = '';

    topRepos.forEach(repo => {
        const year = repo.updated_at ? new Date(repo.updated_at).getFullYear() : '';
        const card = document.createElement('article');
        card.className = 'reveal p-8 neu-md bg-surface rounded-[40px] flex flex-col h-full';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div class="w-12 h-12 neu-sm bg-surface rounded-2xl flex items-center justify-center text-text-secondary">
                    <i data-lucide="folder" class="w-6 h-6"></i>
                </div>
                <div class="flex gap-2">
                    ${repo.stargazers_count > 0 ? `
                        <div class="px-3 py-1 neu-inset bg-surface rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <i data-lucide="star" class="w-3 h-3"></i> ${repo.stargazers_count}
                        </div>
                    ` : ''}
                    <span class="px-3 py-1 neu-inset bg-surface rounded-lg text-[10px] font-bold tracking-widest uppercase text-text-muted">
                        ${repo.language || 'Code'}
                    </span>
                </div>
            </div>
            <h3 class="text-xl font-extrabold mb-3 capitalize">${repo.name.replace(/-/g, ' ')}</h3>
            <p class="text-sm text-text-secondary leading-relaxed mb-8 flex-grow">
                ${repo.description || 'A custom built project demonstrating technical proficiency and architectural design.'}
            </p>
            <div class="flex items-center justify-between mt-auto">
                <span class="text-[10px] font-bold text-text-muted tracking-widest uppercase">${year}</span>
                <div class="flex gap-3">
                    ${repo.homepage ? `
                        <a href="${ensureUrl(repo.homepage)}" target="_blank" class="p-2 neu-sm bg-surface rounded-xl neu-btn text-text-secondary hover:text-text-primary">
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </a>
                    ` : ''}
                    <a href="${repo.html_url}" target="_blank" class="p-2 neu-sm bg-surface rounded-xl neu-btn text-text-secondary hover:text-text-primary">
                        <i data-lucide="github" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Re-initialize Lucide icons for new content
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Re-initialize ScrollReveal for new content
    if (window.initScrollReveal) {
        window.initScrollReveal();
    }
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
