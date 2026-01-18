/**
 * ═══════════════════════════════════════════════════════════════
 * THREE.JS ANIMATED BACKGROUND
 * Particle wave animation with mouse interaction
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

let scene, camera, renderer, particles, particleCount;
let mouseX = 0, mouseY = 0;

function initThreeJS() {
    const container = document.getElementById('threejs-canvas');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: container,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    createParticles();

    // Mouse move listener
    document.addEventListener('mousemove', onMouseMove);

    // Window resize listener
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function createParticles() {
    particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Color palette (purple to blue gradient)
    const color1 = new THREE.Color(0x6366f1); // Indigo
    const color2 = new THREE.Color(0xa855f7); // Purple
    const color3 = new THREE.Color(0x3b82f6); // Blue

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Position
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;

        // Color mixing
        const mixFactor = Math.random();
        let color;
        if (mixFactor < 0.33) {
            color = color1;
        } else if (mixFactor < 0.66) {
            color = color2;
        } else {
            color = color3;
        }

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0001;

    if (particles) {
        // Rotate particle system
        particles.rotation.x = time * 0.1 + mouseY * 0.2;
        particles.rotation.y = time * 0.15 + mouseX * 0.3;

        // Wave animation
        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Wave effect on Y axis
            const x = positions[i3];
            const z = positions[i3 + 2];
            positions[i3 + 1] += Math.sin(time * 3 + x * 0.1 + z * 0.1) * 0.02;
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}
