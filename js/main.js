/* ═══════════════════════════════════════════════
   QpeqIT — Main JS
   ═══════════════════════════════════════════════ */

// ── PARTICLE CANVAS ──────────────────────────────
(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const COUNT = 80;
  const MAX_DIST = 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 136, 238, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 136, 238, ${0.2 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
})();

// ── NAVBAR SCROLL ────────────────────────────────
(function () {
  const nav = document.getElementById('navbar');
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    back.classList.toggle('visible', y > 400);
  }, { passive: true });
  back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ── HAMBURGER MENU ───────────────────────────────
(function () {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
})();

// ── SCROLL REVEAL ────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

// ── COUNTER ANIMATION ────────────────────────────
(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      observer.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const isDecimal = target % 1 !== 0;
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const current = target * eased;
        el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

// ── ACTIVE NAV LINK ON SCROLL ────────────────────
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 100;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        navLinks.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + s.id) a.style.color = 'var(--primary)';
        });
      }
    });
  }, { passive: true });
})();

// ── CONTACT FORM (Formspree) ──────────────────────
(function () {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error = document.getElementById('formError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;
    if (error) error.style.display = 'none';

    try {
      const res = await fetch('https://formspree.io/f/meevzpjw', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'flex';
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      if (error) error.style.display = 'block';
    }
  });
})();

// ── SMOOTH HOVER TILT ON SERVICE CARDS ───────────
(function () {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();
