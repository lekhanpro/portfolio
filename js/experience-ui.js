document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('panel');
    const panelTitle = document.getElementById('panelTitle');
    const panelClose = document.getElementById('panelClose');
    const sections = {
        about: document.getElementById('panel-about'),
        projects: document.getElementById('panel-projects'),
        contact: document.getElementById('panel-contact')
    };

    const buttons = document.querySelectorAll('[data-panel]');

    function openPanel(name) {
        const section = sections[name];
        if (!section) return;

        Object.values(sections).forEach((item) => {
            if (item) item.hidden = item !== section;
        });

        if (panelTitle) {
            panelTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        }

        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (name === 'projects' && window.GitHubAPI && typeof window.GitHubAPI.updateStats === 'function') {
            window.GitHubAPI.updateStats();
        }
    }

    function closePanel() {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            openPanel(button.dataset.panel);
        });
    });

    panelClose.addEventListener('click', closePanel);
    panel.addEventListener('click', (event) => {
        if (event.target === panel) {
            closePanel();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.classList.contains('is-open')) {
            closePanel();
        }
    });

    window.addEventListener('open-panel', (event) => {
        openPanel(event.detail);
    });

    window.ExperienceUI = { openPanel, closePanel };
});
