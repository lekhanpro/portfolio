/**
 * LEKHAN H R - Portfolio JavaScript
 * Modern Design with Purple Gradient Theme
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initProjectFilters();
    initSmoothScroll();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!toggle || !mobileMenu) return;

    toggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Scroll Animations - Fade in elements on scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.featured-card, .project-card, .skill-card, .timeline-item, ' +
        '.profile-card, .bio-section, .contact-card, .stat-card'
    );

    if (!animatedElements.length) return;

    // Set initial state
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Stagger animation based on element index
                const siblings = Array.from(entry.target.parentElement.children);
                const index = siblings.indexOf(entry.target);
                const delay = index * 100;

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Project Filters - Filter projects by category
 */
function initProjectFilters() {
    const filterTags = document.querySelectorAll('.filter-tag');
    const projectCards = document.querySelectorAll('[data-category]');
    const searchInput = document.getElementById('project-search');

    if (!filterTags.length) return;

    // Filter by category
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Update active state
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const filter = tag.dataset.filter;

            projectCards.forEach(card => {
                const categories = card.dataset.category || '';

                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = '';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Search functionality
    if (searchInput) {
        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();

                projectCards.forEach(card => {
                    const text = card.textContent.toLowerCase();

                    if (query === '' || text.includes(query)) {
                        card.style.display = '';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            }, 200);
        });
    }
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Page Transition Effect
 */
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

    e.preventDefault();
    document.body.style.opacity = '0';

    setTimeout(() => {
        window.location.href = href;
    }, 300);
});

// Fade in on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
