/* ============================================
   BALLOON POP BACKGROUND - Vanilla JS
   Interactive canvas background with floating
   balloons that pop on mouse hover
   ============================================ */

(function () {
  'use strict';

  function initBalloonBackground(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let balloons = [];
    let particles = [];
    const mouse = { x: -2000, y: -2000 };
    const balloonCount = 12;

    const colors = [
      { base: '#00C853', light: '#69F0AE', dark: '#009624' },
      { base: '#00d2ff', light: '#80eaff', dark: '#006a80' },
      { base: '#9d50bb', light: '#c089d8', dark: '#4f285e' },
      { base: '#43e97b', light: '#a6f7c1', dark: '#1e6a38' },
      { base: '#00E676', light: '#b9f6ca', dark: '#00a152' },
      { base: '#00c9ff', light: '#92fe9d', dark: '#00607a' },
      { base: '#ff6b8f', light: '#ffa4b6', dark: '#c4385a' },
    ];

    /* ---- Particle class ---- */
    function Particle(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 12;
      this.speedY = (Math.random() - 0.5) * 12;
      this.gravity = 0.2;
      this.opacity = 1;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.opacity -= 0.025;
    };

    Particle.prototype.draw = function () {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    /* ---- Balloon class ---- */
    function Balloon(first) {
      this.x = 0;
      this.y = 0;
      this.r = 0;
      this.speed = 0;
      this.angle = 0;
      this.wobbleSpeed = 0;
      this.popped = false;
      this.colorSet = colors[0];
      this.tailMidY = 0;
      this.tailEndY = 0;
      this.tailVelMid = 0;
      this.tailVelEnd = 0;
      this.prevX = 0;
      this.init(first !== false);
    }

    Balloon.prototype.init = function (firstLoad) {
      this.r = Math.random() * 10 + 18;
      this.x = Math.random() * (canvas.width / (window.devicePixelRatio || 1));
      this.y = firstLoad
        ? Math.random() * (canvas.height / (window.devicePixelRatio || 1))
        : (canvas.height / (window.devicePixelRatio || 1)) + this.r + 200;
      this.colorSet = colors[Math.floor(Math.random() * colors.length)];
      this.speed = Math.random() * 0.8 + 0.3;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.angle = Math.random() * Math.PI * 2;
      this.popped = false;
      this.prevX = this.x;
      this.tailMidY = this.r + 40;
      this.tailEndY = this.r + 120;
      this.tailVelMid = 0;
      this.tailVelEnd = 0;
    };

    Balloon.prototype.drawBalloonPath = function (r) {
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.bezierCurveTo(-r * 1.2, r * 0.8, -r * 1.3, -r * 1.2, 0, -r * 1.2);
      ctx.bezierCurveTo(r * 1.3, -r * 1.2, r * 1.2, r * 0.8, 0, r);
      ctx.closePath();
    };

    Balloon.prototype.drawString = function () {
      var dx = this.x - this.prevX;
      this.prevX = this.x;

      var stiffness = 0.08;
      var damping = 0.85;
      var gravity = 0.35;

      var midTarget = this.r + 40 + Math.abs(dx) * 8;
      this.tailVelMid += (midTarget - this.tailMidY) * stiffness;
      this.tailVelMid *= damping;
      this.tailMidY += this.tailVelMid;

      var endTarget = this.r + 120 + Math.abs(dx) * 14;
      this.tailVelEnd += (endTarget - this.tailEndY) * stiffness;
      this.tailVelEnd *= damping;
      this.tailVelEnd += gravity;
      this.tailEndY += this.tailVelEnd;

      var sway = Math.sin(this.angle * 1.8) * 6 + dx * 4;

      ctx.beginPath();
      ctx.moveTo(0, this.r + 5);
      ctx.bezierCurveTo(
        sway,
        this.tailMidY * 0.5,
        -sway,
        this.tailMidY,
        sway * 0.6,
        this.tailEndY
      );
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    Balloon.prototype.pop = function () {
      if (this.popped) return;
      this.popped = true;
      for (var i = 0; i < 16; i++) {
        particles.push(new Particle(this.x, this.y, this.colorSet.base));
      }
      var self = this;
      setTimeout(function () { self.init(false); }, 1200 + Math.random() * 1500);
    };

    Balloon.prototype.update = function () {
      if (this.popped) return;
      this.y -= this.speed;
      this.angle += this.wobbleSpeed;
      this.x += Math.sin(this.angle * 0.6) * 0.7;

      var dx = this.x - mouse.x;
      var dy = this.y - this.r * 0.2 - mouse.y;
      if (Math.sqrt(dx * dx + dy * dy) < this.r + 10) {
        this.pop();
      }
      var h = canvas.height / (window.devicePixelRatio || 1);
      if (this.y < -this.r - 200) this.init(false);
      this.draw();
    };

    Balloon.prototype.draw = function () {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.sin(this.angle) * 0.06);

      this.drawString();
      this.drawBalloonPath(this.r);

      var grad = ctx.createRadialGradient(
        -this.r * 0.3, -this.r * 0.5, this.r * 0.1,
        0, 0, this.r * 1.5
      );
      grad.addColorStop(0, this.colorSet.light);
      grad.addColorStop(0.4, this.colorSet.base);
      grad.addColorStop(1, this.colorSet.dark);
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.55;
      ctx.fill();

      ctx.restore();
    };

    /* ---- Loop ---- */
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var parent = canvas.parentElement;
      var w = parent ? parent.clientWidth : window.innerWidth;
      var h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      balloons = [];
      for (var i = 0; i < balloonCount; i++) {
        balloons.push(new Balloon(true));
      }
    }

    function animate() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particles = particles.filter(function (p) { return p.opacity > 0; });
      particles.forEach(function (p) {
        p.update();
        p.draw();
      });
      balloons.forEach(function (b) { b.update(); });
      requestAnimationFrame(animate);
    }

    function onMouseMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -2000;
      mouse.y = -2000;
    }

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    resize();
    animate();
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBalloonBackground('balloon-canvas');
    });
  } else {
    initBalloonBackground('balloon-canvas');
  }

  window.initBalloonBackground = initBalloonBackground;
})();
