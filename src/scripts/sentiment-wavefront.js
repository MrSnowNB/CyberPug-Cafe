// Cyberpunk Pug Cafe Sentiment Wavefront Visualizer

class SentimentWavefront {
    constructor() {
        this.currentSentiment = { score: 0, emotion: 'neutral' };
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.particles = null;
        this.animationId = null;
        this.targetPosition = null;
        this.targetColors = null;
        this.controls = null;
        this.isInitialized = false;

        console.log('Sentiment wavefront initialized');
    }

    /**
     * Initialize Three.js scene
     */
    initialize() {
        if (this.isInitialized) return;

        const canvas = document.getElementById('sentiment-wavefront');
        if (!canvas) {
            console.error('Sentiment wavefront canvas not found');
            return;
        }

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.targetPosition = new THREE.Vector3(0, 10, 10);
        this.camera.position.copy(this.targetPosition);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Orbit controls for mouse/touch interaction
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Create terrain geometry
        this.createTerrain();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Add particles for cyberpunk effect
        this.createParticles();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        this.isInitialized = true;
        this.animate();

        console.log('Sentiment wavefront scene initialized');
    }

    /**
     * Create terrain mesh
     */
    createTerrain() {
        const width = 20;
        const height = 20;
        const widthSegments = 50;
        const heightSegments = 50;

        this.geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        this.geometry.rotateX(-Math.PI / 2);

        // Initial vertices for neutral state
        this.updateTerrainGeometry(0);

        // Cyberpunk wireframe material
        this.material = new THREE.MeshLambertMaterial({
            color: 0x00ff44,
            wireframe: true,
            emissive: 0x002211,
            emissiveIntensity: 0.5
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    /**
     * Update terrain geometry based on sentiment score
     * @param {number} score - Sentiment score (-5 to +5)
     */
    updateTerrainGeometry(score) {
        if (!this.geometry || !this.geometry.vertices) {
            console.warn('Terrain geometry not ready');
            return;
        }

        const vertices = this.geometry.attributes.position.array;
        const widthSegments = 50;
        const heightSegments = 50;
        const clampScore = Math.max(-5, Math.min(5, score));

        for (let i = 0; i <= widthSegments; i++) {
            for (let j = 0; j <= heightSegments; j++) {
                const x = (i / widthSegments - 0.5) * 20;
                const z = (j / heightSegments - 0.5) * 20;

                // Wave function modulated by sentiment
                const waveX = Math.sin((x + this.currentSentiment.score) * 0.2) * (5 + clampScore);
                const waveZ = Math.sin((z + this.currentSentiment.score) * 0.2) * (5 + clampScore);
                const height = (waveX + waveZ) * 0.5;

                const index = (i * (heightSegments + 1) + j) * 3;
                if (index + 1 < vertices.length) {
                    vertices[index] = x;
                    vertices[index + 1] = height;
                    vertices[index + 2] = z;
                }
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();

        // Update material color based on score
        this.updateMaterialColor(clampScore);
    }

    /**
     * Update material color and emissive based on score
     * @param {number} score - Sentiment score (-5 to +5)
     */
    updateMaterialColor(score) {
        if (!this.material) return;

        let color = 0x00ff44; // neutral green
        let emissive = 0x002211;

        if (score < -2) {
            color = 0xff0044; // negative red
            emissive = 0x220011;
        } else if (score > 2) {
            color = 0x44ff00; // positive green
            emissive = 0x112200;
        } else if (score < 0) {
            color = 0xff4400; // negative orange
            emissive = 0x221100;
        } else if (score > 0) {
            color = 0x00ff44; // positive green
            emissive = 0x002211;
        }

        // Create pulsing effect
        const intensity = 0.5 + Math.abs(score) * 0.1;
        this.material.emissiveIntensity = intensity;
        this.material.color.setHex(color);
        this.material.emissive.setHex(emissive);
    }

    /**
     * Create particle system for cyberpunk effects
     */
    createParticles() {
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff44,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    /**
     * Update sentiment data
     * @param {Object} sentiment - Sentiment analysis result
     */
    updateSentiment(sentiment) {
        this.currentSentiment = sentiment;
        this.updateTerrainGeometry(sentiment.score);

        // Update camera position based on sentiment magnitude
        const magnitude = Math.abs(sentiment.score);
        this.targetPosition.y = 10 + magnitude;
        this.targetPosition.z = 10 + magnitude * 0.5;
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isInitialized) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth camera movement
        this.camera.position.lerp(this.targetPosition, 0.02);
        this.camera.lookAt(0, 0, 0);

        // Update controls
        this.controls.update();

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.005;
        }

        // Subtle mesh rotation
        if (this.mesh) {
            this.mesh.rotation.y += 0.002;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const canvas = document.getElementById('sentiment-wavefront');
        if (!canvas) return;

        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.geometry) {
            this.geometry.dispose();
        }

        if (this.material) {
            this.material.dispose();
        }

        this.isInitialized = false;
    }
}

// For use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentWavefront;
} else if (typeof window !== 'undefined') {
    window.SentimentWavefront = SentimentWavefront;
}
