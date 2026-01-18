/**
 * ═══════════════════════════════════════════════════════════════
 * LEKHAN H R - PREMIUM PORTFOLIO JAVASCRIPT
 * Cursor Glow • Scroll Animations • Counters • Interactions
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initMobileMenu();
    initScrollAnimations();
    initCounterAnimation();
    initProjectFilters();
    initSmoothScroll();
    initPageTransitions();
});

/**
 * Cursor Glow Effect - Follows mouse with smooth trailing
 */
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow || window.innerWidth < 1024) {
        if (cursorGlow) cursorGlow.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.08;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        currentX += (mouseX - currentX) * ease;
        currentY += (mouseY - currentY) * ease;
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        requestAnimationFrame(animate);
    }
    animate();

    // Hide on leave
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursorGlow.style.opacity = '1';
    });
}

/**
 * Mobile Menu Toggle with Animation
 */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Scroll Animations - AOS-like reveal animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');

    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Apply delay if specified
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Counter Animation - Animate numbers on scroll
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');

    if (!counters.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
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
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const filter = tag.dataset.filter;

            projectCards.forEach((card, index) => {
                const categories = card.dataset.category || '';
                const shouldShow = filter === 'all' || categories.includes(filter);

                card.style.transition = 'opacity 0.3s, transform 0.3s';

                if (shouldShow) {
                    card.style.display = '';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50);
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

                projectCards.forEach((card) => {
                    const text = card.textContent.toLowerCase();
                    const shouldShow = query === '' || text.includes(query);

                    if (shouldShow) {
                        card.style.display = '';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            if (!text.includes(query)) {
                                card.style.display = 'none';
                            }
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
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Page Transition Effects
 */
function initPageTransitions() {
    document.body.style.opacity = '1';

    // Fade out on internal link clicks
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip external links, anchors, and special links
            if (!href ||
                href.startsWith('#') ||
                href.startsWith('http') ||
                href.startsWith('mailto:') ||
                link.target === '_blank') {
                return;
            }

            e.preventDefault();
            document.body.style.opacity = '0';

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

/**
 * Character Wave Animation on Hero Title
 */
function initCharacterAnimation() {
    const chars = document.querySelectorAll('.char');

    chars.forEach((char, i) => {
        char.style.animationDelay = `${i * 0.05}s`;
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    initCharacterAnimation();
});

// Parallax effect on scroll (optional enhancement)
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const spheres = document.querySelectorAll('.gradient-sphere');

            spheres.forEach((sphere, i) => {
                const speed = 0.02 + (i * 0.01);
                sphere.style.transform = `translateY(${scrolled * speed}px)`;
            });

            ticking = false;
        });
        ticking = true;
    }
});
