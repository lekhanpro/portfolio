import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

const canvas = document.getElementById('world');
const statusEl = document.getElementById('hudStatus');

if (!canvas) {
    if (statusEl) statusEl.textContent = 'Canvas not found.';
} else {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0e11, 12, 40);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
    const target = new THREE.Vector3(0, 1.4, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0b0e11, 1);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const keyLight = new THREE.DirectionalLight(0x9dd7ff, 0.9);
    keyLight.position.set(6, 8, 4);
    scene.add(ambient, keyLight);

    const floor = new THREE.Mesh(
        new THREE.CircleGeometry(24, 64),
        new THREE.MeshStandardMaterial({ color: 0x0f1419, metalness: 0.2, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.2;
    scene.add(floor);

    const grid = new THREE.GridHelper(48, 36, 0x22303b, 0x141b22);
    grid.position.y = -0.18;
    scene.add(grid);

    const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 4.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x151d24, metalness: 0.5, roughness: 0.4 })
    );
    monolith.position.set(0, 2, 0);
    scene.add(monolith);

    const interactiveMeshes = [];
    const markers = [
        { label: 'About', panel: 'about', position: new THREE.Vector3(-6, 0.8, 3), color: 0x6bdcff },
        { label: 'Projects', panel: 'projects', position: new THREE.Vector3(0, 0.8, -7), color: 0x5ae38b },
        { label: 'Contact', panel: 'contact', position: new THREE.Vector3(6, 0.8, 3), color: 0xf5c86a }
    ];

    function createLabelSprite(text) {
        const canvasLabel = document.createElement('canvas');
        canvasLabel.width = 256;
        canvasLabel.height = 64;
        const ctx = canvasLabel.getContext('2d');
        ctx.clearRect(0, 0, canvasLabel.width, canvasLabel.height);
        ctx.fillStyle = 'rgba(12, 16, 20, 0.8)';
        ctx.fillRect(0, 0, canvasLabel.width, canvasLabel.height);
        ctx.fillStyle = '#e7edf3';
        ctx.font = '600 28px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvasLabel.width / 2, canvasLabel.height / 2);

        const texture = new THREE.CanvasTexture(canvasLabel);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(3.6, 0.9, 1);
        return sprite;
    }

    markers.forEach(({ label, panel, position, color }) => {
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 1.1, 0.6, 32),
            new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.4 })
        );
        base.position.copy(position);
        base.userData.panel = panel;
        scene.add(base);
        interactiveMeshes.push(base);

        const marker = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 1.4, 24),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.35 })
        );
        marker.position.copy(position).add(new THREE.Vector3(0, 1.2, 0));
        scene.add(marker);

        const labelSprite = createLabelSprite(label);
        labelSprite.position.copy(position).add(new THREE.Vector3(0, 2.2, 0));
        scene.add(labelSprite);

        base.userData.floatObject = marker;
        base.userData.label = labelSprite;
    });

    const stars = new THREE.BufferGeometry();
    const starCount = 200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPositions[i3] = (Math.random() - 0.5) * 80;
        starPositions[i3 + 1] = Math.random() * 30 + 5;
        starPositions[i3 + 2] = (Math.random() - 0.5) * 80;
    }
    stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x9aa3ad, size: 0.15, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(stars, starMaterial));

    const controls = {
        radius: 14,
        phi: 1.15,
        theta: 0.4,
        minRadius: 8,
        maxRadius: 22,
        isPointerDown: false,
        isDragging: false,
        lastX: 0,
        lastY: 0,
        pointers: new Map(),
        pinchStart: 0,
        radiusStart: 14
    };

    function updateCamera() {
        const x = controls.radius * Math.sin(controls.phi) * Math.sin(controls.theta);
        const y = controls.radius * Math.cos(controls.phi);
        const z = controls.radius * Math.sin(controls.phi) * Math.cos(controls.theta);
        camera.position.set(x, y, z);
        camera.lookAt(target);
    }

    function onPointerDown(event) {
        canvas.setPointerCapture(event.pointerId);
        controls.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        controls.isPointerDown = true;
        controls.isDragging = false;
        controls.lastX = event.clientX;
        controls.lastY = event.clientY;

        if (controls.pointers.size === 2) {
            const points = [...controls.pointers.values()];
            controls.pinchStart = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
            controls.radiusStart = controls.radius;
        }
    }

    function onPointerMove(event) {
        if (!controls.isPointerDown) return;
        if (!controls.pointers.has(event.pointerId)) return;
        controls.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (controls.pointers.size === 2) {
            const points = [...controls.pointers.values()];
            const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
            const zoomFactor = controls.pinchStart ? controls.pinchStart / distance : 1;
            controls.radius = THREE.MathUtils.clamp(controls.radiusStart * zoomFactor, controls.minRadius, controls.maxRadius);
            return;
        }

        const deltaX = event.clientX - controls.lastX;
        const deltaY = event.clientY - controls.lastY;
        controls.lastX = event.clientX;
        controls.lastY = event.clientY;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            controls.isDragging = true;
        }

        controls.theta -= deltaX * 0.005;
        controls.phi -= deltaY * 0.005;
        controls.phi = THREE.MathUtils.clamp(controls.phi, 0.5, 1.4);
    }

    function onPointerUp(event) {
        controls.pointers.delete(event.pointerId);
        if (controls.pointers.size === 0) {
            controls.isPointerDown = false;
        }

        if (!controls.isDragging) {
            handleRaycast(event);
        }
    }

    function onWheel(event) {
        controls.radius = THREE.MathUtils.clamp(
            controls.radius + event.deltaY * 0.01,
            controls.minRadius,
            controls.maxRadius
        );
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function handleRaycast(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(interactiveMeshes);
        if (hits.length) {
            const panel = hits[0].object.userData.panel;
            if (panel) {
                window.dispatchEvent(new CustomEvent('open-panel', { detail: panel }));
            }
        }
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onResize);

    updateCamera();

    const clock = new THREE.Clock();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate() {
        const elapsed = clock.getElapsedTime();
        interactiveMeshes.forEach((mesh, index) => {
            const floatTarget = mesh.userData.floatObject;
            const label = mesh.userData.label;
            if (floatTarget) {
                floatTarget.position.y = mesh.position.y + 1.2 + Math.sin(elapsed + index) * 0.15;
            }
            if (label) {
                label.position.y = mesh.position.y + 2.2 + Math.sin(elapsed + index) * 0.1;
                label.lookAt(camera.position);
            }
        });

        if (!prefersReducedMotion) {
            monolith.rotation.y = elapsed * 0.2;
        }

        updateCamera();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    if (statusEl) statusEl.textContent = 'World ready. Explore the markers.';
    animate();
}
