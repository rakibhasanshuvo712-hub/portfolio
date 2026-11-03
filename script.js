/* ========================================================
   RAKIB HASAN SHUVO - PORTFOLIO INTERACTION & BACKGROUND
   ======================================================== */

// ---- Mobile Menu & Navigation ----
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Dynamic Copyright Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ---- Contact Form Handler ----
function sendMsg() {
  const g = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const f = document.getElementById('cf');
  if (!f) return;

  if (!g('cn') || !g('ce') || !g('cm')) {
    f.textContent = 'Please fill in your name, email and message.';
    f.style.color = '#f87171';
    return;
  }
  const to = 'rakibhasanshuvo712@gmail.com';
  const subject = g('cs') || 'Portfolio message from ' + g('cn');
  const body = g('cm') + '\n\n— ' + g('cn') + ' (' + g('ce') + ')';
  f.style.color = '#00d4ff';
  f.innerHTML = 'Opening your email app… <a style="color:#00d4ff;text-decoration:underline" target="_blank" rel="noreferrer" href="https://mail.google.com/mail/?view=cm&fs=1&to=' + to + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '">or open in Gmail ↗</a>';
  location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

// ---- Dynamic Interactive Starfield & Constellation Canvas ----
(function initCanvas() {
  const cv = document.getElementById('bg');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let stars = [];
  let pts = [];
  let ripples = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let animId = null;
  let isVisible = true;

  // Modern cyber/aurora color palette for constellation nodes
  const colors = [
    { r: 0, g: 212, b: 255 },   // Cyan
    { r: 139, g: 92, b: 246 },  // Violet
    { r: 56, g: 189, b: 248 },  // Sky
    { r: 168, g: 85, b: 247 },  // Purple
  ];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Starfield (distant twinkling stars)
    const starCount = Math.floor(Math.min(W, 1600) / 25);
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      color: Math.random() > 0.5 ? '200, 235, 255' : '230, 215, 255'
    }));

    // Constellation nodes
    const nodeCount = Math.floor(Math.min(W, 1400) / 22);
    pts = Array.from({ length: Math.max(30, Math.min(nodeCount, 65)) }, () => {
      const col = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.4 + 1.8,
        col: col,
        pulsePhase: Math.random() * Math.PI * 2
      };
    });
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support for mobile devices
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Interactive shockwave ripple on click / tap
  window.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button, input, textarea')) return;
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      r: 0,
      maxR: 160,
      alpha: 0.65
    });
  });

  let time = 0;

  function draw() {
    if (!isVisible) {
      animId = requestAnimationFrame(draw);
      return;
    }

    time += 0.02;
    ctx.clearRect(0, 0, W, H);

    // 1. Draw Distant Twinkling Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      const alpha = s.baseAlpha + Math.sin(time * 2 + s.phase) * 0.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${Math.max(0.05, alpha)})`;
      ctx.fill();
    }

    // 2. Draw & Update Shockwave Ripples
    for (let k = ripples.length - 1; k >= 0; k--) {
      const rip = ripples[k];
      rip.r += 4.5;
      rip.alpha -= 0.018;

      if (rip.alpha <= 0 || rip.r >= rip.maxR) {
        ripples.splice(k, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 212, 255, ${rip.alpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gentle repulsion of nearby particles by ripple wave
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dist = Math.hypot(p.x - rip.x, p.y - rip.y);
        if (Math.abs(dist - rip.r) < 25 && dist > 1) {
          const push = (1 - Math.abs(dist - rip.r) / 25) * 1.5;
          p.x += ((p.x - rip.x) / dist) * push;
          p.y += ((p.y - rip.y) / dist) * push;
        }
      }
    }

    // 3. Update & Draw Constellation Nodes and Interconnecting Lines
    const maxDist = 135;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Node to Node Connections
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * 0.35;
          const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          grad.addColorStop(0, `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, ${alpha})`);
          grad.addColorStop(1, `rgba(${q.col.r}, ${q.col.g}, ${q.col.b}, ${alpha})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // Mouse Proximity Attraction & Radiant Energy Thread
      if (mouse.active) {
        const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const mouseRange = 175;
        if (m < mouseRange) {
          const factor = (1 - m / mouseRange);
          const grad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
          grad.addColorStop(0, `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, ${factor * 0.7})`);
          grad.addColorStop(1, `rgba(0, 212, 255, ${factor * 0.9})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Soft spring attraction towards cursor
          p.x += (mouse.x - p.x) * 0.008;
          p.y += (mouse.y - p.y) * 0.008;
        }
      }

      // Node Body & Subtle Glowing Halo
      const pulse = 1 + Math.sin(time * 3 + p.pulsePhase) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, 0.85)`;
      ctx.fill();

      // Soft halo ring around node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, 0.12)`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);

  // Tab visibility management to save battery & CPU
  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
  });
})();

// ---- Smooth Cursor Glow (Lerped Spotlight) ----
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = -500, mouseY = -500;
  let curX = -500, curY = -500;
  let isMoving = false;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      curX = mouseX;
      curY = mouseY;
      glow.classList.add('active');
    }
  });

  window.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
    isMoving = false;
  });

  function renderGlow() {
    if (isMoving) {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      glow.style.transform = `translate3d(${curX - 220}px, ${curY - 220}px, 0)`;
    }
    requestAnimationFrame(renderGlow);
  }
  requestAnimationFrame(renderGlow);
})();

// ---- Scroll Progress Bar ----
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    if (total > 0) {
      bar.style.width = (window.scrollY / total) * 100 + '%';
    }
  }, { passive: true });
})();

// ---- Scroll Reveal Observer ----
(function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.section, .skill-card, .project-card, .hero-copy, .cv-box, .cta-box')
    .forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
})();

// ---- 3D Tilt on Cards ----
(function initCardTilt() {
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project-card, .skill-card, .cv-box, .cta-box').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();

// ---- Hero Subtitle Typing Effect ----
(function initTyping() {
  const target = document.querySelector('.hero h2');
  if (!target) return;
  const text = target.textContent.trim();
  target.textContent = '';
  let idx = 0;

  function typeChar() {
    if (idx <= text.length) {
      target.textContent = text.slice(0, idx++);
      setTimeout(typeChar, 45);
    }
  }
  setTimeout(typeChar, 300);
})();
