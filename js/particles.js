/* ====================================================
   Particle System — Fireflies, Hearts, Cherry Blossoms,
   Golden Dust, Butterflies, and Floating Lanterns
   ==================================================== */

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.init();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  init() {
    // Warm Fireflies
    for (let i = 0; i < 30; i++) {
      this.particles.push(this.createFirefly());
    }
    // Ambient Golden dust
    for (let i = 0; i < 20; i++) {
      this.particles.push(this.createGoldenDust());
    }
    // Floating hearts
    for (let i = 0; i < 10; i++) {
      this.particles.push(this.createHeart());
    }
  }

  createFirefly() {
    return {
      type: 'firefly',
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      glowSize: Math.random() * 10 + 5,
      hue: 42 + Math.random() * 15 // Sunset golden / soft orange
    };
  }

  createGoldenDust() {
    return {
      type: 'dust',
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -Math.random() * 0.25 - 0.05,
      opacity: Math.random() * 0.3 + 0.1,
      opacityDir: 1
    };
  }

  createHeart() {
    return {
      type: 'heart',
      x: Math.random() * this.width,
      y: this.height + Math.random() * 150,
      size: Math.random() * 9 + 5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.6 - 0.2,
      opacity: Math.random() * 0.35 + 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  }

  createCherryBlossom() {
    return {
      type: 'blossom',
      x: Math.random() * this.width,
      y: -30,
      size: Math.random() * 7 + 4,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: Math.random() * 0.7 + 0.4,
      opacity: Math.random() * 0.4 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.015
    };
  }

  createButterfly() {
    return {
      type: 'butterfly',
      x: Math.random() * this.width,
      y: this.height + Math.random() * 100,
      size: Math.random() * 8 + 5,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: -Math.random() * 1.0 - 0.4,
      opacity: Math.random() * 0.55 + 0.25,
      color: `hsla(${335 + Math.random() * 35}, 85%, 65%, 1)`, // Romantic pink/rose shades
      flapSpeed: 0.12 + Math.random() * 0.08,
      flapAngle: Math.random() * Math.PI
    };
  }

  createLantern() {
    return {
      type: 'lantern',
      x: Math.random() * this.width,
      y: this.height + Math.random() * 200,
      width: Math.random() * 12 + 8,
      height: Math.random() * 16 + 12,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.4 - 0.15,
      opacity: Math.random() * 0.5 + 0.3,
      swingSpeed: 0.015 + Math.random() * 0.02,
      swingAngle: Math.random() * Math.PI
    };
  }

  drawHeart(x, y, size, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = `rgba(216, 27, 96, ${opacity})`; // Rose red core
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.2, x, y + size);
    this.ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBlossom(x, y, size, rotation, opacity) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.globalAlpha = opacity;
    // Draw cherry blossom petals
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = `rgba(255, 192, 203, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.ellipse(0, -size * 0.5, size * 0.32, size * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.rotate(Math.PI * 2 / 5);
    }
    // Gold center
    this.ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawButterfly(x, y, size, flapAngle, color, opacity) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.globalAlpha = opacity;

    // Wing flap scaling factor
    const flapWidth = Math.sin(flapAngle) * size * 0.8;

    this.ctx.fillStyle = color;
    
    // Draw wings (left and right)
    this.ctx.beginPath();
    // Top-left wing
    this.ctx.ellipse(-size * 0.6, -size * 0.4, Math.abs(flapWidth), size * 0.6, Math.PI / 6, 0, Math.PI * 2);
    // Bottom-left wing
    this.ctx.ellipse(-size * 0.5, size * 0.3, Math.abs(flapWidth) * 0.8, size * 0.45, -Math.PI / 6, 0, Math.PI * 2);
    // Top-right wing
    this.ctx.ellipse(size * 0.6, -size * 0.4, Math.abs(flapWidth), size * 0.6, -Math.PI / 6, 0, Math.PI * 2);
    // Bottom-right wing
    this.ctx.ellipse(size * 0.5, size * 0.3, Math.abs(flapWidth) * 0.8, size * 0.45, Math.PI / 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = '#111';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.12, size * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawLantern(x, y, w, h, swingAngle, opacity) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.sin(swingAngle) * 0.08); // Gentle swing
    this.ctx.globalAlpha = opacity;

    // Outer glow
    const glowGrad = this.ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, h * 1.5);
    glowGrad.addColorStop(0, `rgba(255, 140, 0, ${opacity * 0.7})`);
    glowGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');
    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(w/2, h/2, h * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Lantern body (rounded top, flat bottom)
    const bodyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    bodyGrad.addColorStop(0, `rgba(255, 69, 0, ${opacity})`);     // Red-orange top
    bodyGrad.addColorStop(0.7, `rgba(255, 165, 0, ${opacity})`);   // Orange body
    bodyGrad.addColorStop(1, `rgba(255, 235, 59, ${opacity})`);     // Yellow base
    this.ctx.fillStyle = bodyGrad;

    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.15);
    this.ctx.quadraticCurveTo(0, 0, w * 0.5, 0);
    this.ctx.quadraticCurveTo(w, 0, w, h * 0.15);
    this.ctx.lineTo(w, h * 0.95);
    this.ctx.lineTo(0, h * 0.95);
    this.ctx.closePath();
    this.ctx.fill();

    // Base frame black lip
    this.ctx.fillStyle = `rgba(30, 20, 10, ${opacity})`;
    this.ctx.fillRect(0, h * 0.93, w, h * 0.07);

    // Inner glowing fire core
    const coreGrad = this.ctx.createRadialGradient(w/2, h * 0.75, 1, w/2, h * 0.75, w * 0.4);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
    coreGrad.addColorStop(1, `rgba(255, 215, 0, 0)`);
    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(w/2, h * 0.75, w * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  update(particle) {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.type === 'firefly') {
      particle.opacity += particle.opacityDir * 0.007;
      if (particle.opacity > 0.85) particle.opacityDir = -1;
      if (particle.opacity < 0.15) particle.opacityDir = 1;
      
      // Gentle wander
      particle.speedX += (Math.random() - 0.5) * 0.04;
      particle.speedY += (Math.random() - 0.5) * 0.04;
      particle.speedX = Math.max(-0.6, Math.min(0.6, particle.speedX));
      particle.speedY = Math.max(-0.4, Math.min(0.4, particle.speedY));
    }

    else if (particle.type === 'dust') {
      particle.opacity += particle.opacityDir * 0.003;
      if (particle.opacity > 0.35) particle.opacityDir = -1;
      if (particle.opacity < 0.05) {
        particle.opacityDir = 1;
        particle.y = this.height + 10;
        particle.x = Math.random() * this.width;
      }
    }

    else if (particle.type === 'heart') {
      if (particle.y < -20) {
        particle.y = this.height + 30;
        particle.x = Math.random() * this.width;
      }
    }

    else if (particle.type === 'blossom') {
      particle.rotation += particle.rotationSpeed;
      particle.wobble += particle.wobbleSpeed;
      particle.x += Math.sin(particle.wobble) * 0.4;
      if (particle.y > this.height + 20) {
        particle.y = -30;
        particle.x = Math.random() * this.width;
      }
    }

    else if (particle.type === 'butterfly') {
      particle.flapAngle += particle.flapSpeed;
      // Fly with custom sinewave wiggle
      particle.x += Math.sin(particle.flapAngle * 0.3) * 0.3;
      if (particle.y < -20) {
        particle.y = this.height + 30;
        particle.x = Math.random() * this.width;
      }
    }

    else if (particle.type === 'lantern') {
      particle.swingAngle += particle.swingSpeed;
      particle.x += Math.sin(particle.swingAngle) * 0.12;
      if (particle.y < -40) {
        particle.y = this.height + 50;
        particle.x = Math.random() * this.width;
      }
    }

    // Horizontal bounds check
    if (particle.x < -40) particle.x = this.width + 30;
    if (particle.x > this.width + 40) particle.x = -30;
  }

  draw(particle) {
    if (particle.type === 'firefly') {
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.glowSize
      );
      gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 72%, ${particle.opacity})`);
      gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.glowSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Core
      this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 88%, ${particle.opacity + 0.15})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    else if (particle.type === 'dust') {
      this.ctx.fillStyle = `rgba(197, 155, 109, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    else if (particle.type === 'heart') {
      this.drawHeart(particle.x, particle.y, particle.size, particle.opacity);
    }

    else if (particle.type === 'blossom') {
      this.drawBlossom(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
    }

    else if (particle.type === 'butterfly') {
      this.drawButterfly(particle.x, particle.y, particle.size, particle.flapAngle, particle.color, particle.opacity);
    }

    else if (particle.type === 'lantern') {
      this.drawLantern(particle.x, particle.y, particle.width, particle.height, particle.swingAngle, particle.opacity);
    }
  }

  addBlossoms(count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createCherryBlossom());
    }
  }

  intensify() {
    // Spawn fireflies, hearts, blossoms
    for (let i = 0; i < 20; i++) {
      this.particles.push(this.createFirefly());
    }
    for (let i = 0; i < 12; i++) {
      this.particles.push(this.createHeart());
    }
    this.addBlossoms(20);

    // Spawn butterflies
    for (let i = 0; i < 15; i++) {
      this.particles.push(this.createButterfly());
    }

    // Spawn floating lanterns
    for (let i = 0; i < 12; i++) {
      this.particles.push(this.createLantern());
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      this.update(p);
      this.draw(p);
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

// Export
window.ParticleSystem = ParticleSystem;
