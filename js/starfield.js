/* ====================================================
   Starfield & 3D Ring — Three.js Scene for Proposal
   ==================================================== */

class CinematicRingScene {
  constructor() {
    this.canvas = document.getElementById('ring-canvas');
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ring = null;
    this.stars = null;
    this.animationId = null;
    this.isLoaded = false;
    this.starsSpeed = 0.0005;
    this.ringSpeed = 0.01;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // Create Scene
    this.scene = new THREE.Scene();

    // Create Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    // Create Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffd700, 2, 50); // Gold light
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe91e63, 1.5, 50); // Pink light
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(pointLight2);

    const directionLight = new THREE.DirectionalLight(0xffffff, 1);
    directionLight.position.set(0, 10, 0);
    this.scene.add(directionLight);

    // Create Starfield
    this.createStarfield();

    // Create 3D Metallic Ring
    this.createRing();

    // Event listener
    window.addEventListener('resize', () => this.onWindowResize());

    this.isLoaded = true;
    this.animate();
  }

  createStarfield() {
    const starsCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Random coordinates in a sphere
      const r = 25 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);

      // Star colors (mostly white, some yellow, some pink/blue)
      const rand = Math.random();
      if (rand > 0.8) {
        colors[i] = 1.0;     // gold
        colors[i + 1] = 0.85;
        colors[i + 2] = 0.5;
      } else if (rand > 0.6) {
        colors[i] = 0.9;     // soft pink
        colors[i + 1] = 0.6;
        colors[i + 2] = 0.8;
      } else {
        colors[i] = 1.0;     // white
        colors[i + 1] = 1.0;
        colors[i + 2] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Star texture (circle particle)
    const pMaterial = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(geometry, pMaterial);
    this.scene.add(this.stars);
  }

  createRing() {
    // Torus represents the ring band
    const torusGeometry = new THREE.TorusGeometry(2.5, 0.35, 32, 100);

    // Shiny gold metallic material
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      flatShading: false
    });

    this.ring = new THREE.Mesh(torusGeometry, ringMaterial);
    this.ring.rotation.x = Math.PI / 3; // Tilt ring slightly forward
    this.scene.add(this.ring);

    // Add a diamond gem on top of the ring
    const gemGeometry = new THREE.OctahedronGeometry(0.7, 1);
    const gemMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0xffffff,
      transparent: true,
      opacity: 0.9,
      flatShading: true
    });
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    gem.position.set(0, 2.5, 0); // Position it on top of the band
    this.ring.add(gem);

    // Hide the static emoji ring because WebGL 3D ring is rendering!
    const staticRing = document.querySelector('.proposal-ring');
    if (staticRing) {
      staticRing.style.display = 'none';
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  explodeStars() {
    // Accelerate stars rotation and change speed to represent explosion
    this.starsSpeed = 0.01;
    this.ringSpeed = 0.08;

    // Slow back down to normal over a few seconds
    gsap.to(this, {
      starsSpeed: 0.0005,
      ringSpeed: 0.01,
      duration: 5,
      ease: 'power2.out'
    });

    // Move camera in dramatically
    gsap.to(this.camera.position, {
      z: 5,
      duration: 2,
      ease: 'power3.out',
      yoyo: true,
      repeat: 1
    });
  }

  animate() {
    if (!this.isLoaded) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Slow rotation of ring
    if (this.ring) {
      this.ring.rotation.y += this.ringSpeed;
      // Gentle float
      this.ring.position.y = Math.sin(Date.now() * 0.0015) * 0.2;
    }

    // Slow rotation of starfield
    if (this.stars) {
      this.stars.rotation.y += this.starsSpeed;
      this.stars.rotation.x += this.starsSpeed * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isLoaded = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}

// Export
window.CinematicRingScene = CinematicRingScene;
