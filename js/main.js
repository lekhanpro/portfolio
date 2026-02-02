/**
 * LEKHAN H R - NEUMORPHIC PORTFOLIO CORE JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    initTheme();
    initCustomCursor();
    initScrollReveal();
    initSmoothScroll();
});

/**
 * Dark/Light Theme Switching
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    html.classList.toggle('dark', currentTheme === 'dark');
    html.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');
        const newTheme = isDark ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * Custom Neumorphic Cursor
 */
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    
    if (!dot || !ring) return;

    window.addEventListener('mousemove', (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        
        // Ring follows with a small delay for smoothness
        ring.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 250, fill: "forwards" });
    });

    // Interaction states
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .cursor-pointer');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width = '40px';
            ring.style.height = '40px';
            ring.style.borderWidth = '2px';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width = '20px';
            ring.style.height = '20px';
            ring.style.borderWidth = '1px';
        });
    });
}

/**
 * Scroll Reveal Animations
 */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el, index) => {
        // Add a slight stagger delay for multiple elements in view
        el.style.transitionDelay = `${(index % 3) * 0.1}s`;
        observer.observe(el);
    });
}

/**
 * Smooth Scroll for Navigation
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = 100; // Header height adjustment
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
