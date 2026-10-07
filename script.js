const menuBtn=document.getElementById('menuBtn');const navLinks=document.getElementById('navLinks');menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));document.getElementById('year').textContent=new Date().getFullYear();
function sendMsg(){
  const g=id=>document.getElementById(id).value.trim(), f=document.getElementById('cf');
  if(!g('cn')||!g('ce')||!g('cm')){
    f.textContent='Please fill in your name, email and message.'; f.style.color='#f87171'; return;
  }
  const to='rakibhasanshuvo712@gmail.com';
  const subject=g('cs')||'Portfolio message from '+g('cn');
  const body=g('cm')+'\n\n— '+g('cn')+' ('+g('ce')+')';
  f.style.color='#22d3ee';
  f.innerHTML='Opening your email app… <a style="color:#22d3ee;text-decoration:underline" target="_blank" rel="noreferrer" href="https://mail.google.com/mail/?view=cm&fs=1&to='+to+'&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)+'">or open in Gmail ↗</a>';
  location.href='mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
// ---- particle network background ----
const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
let W, H, pts = [], mouse = { x: -999, y: -999 };
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  pts = Array.from({ length: Math.min(110, W / 12) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6
  }));
}
resize(); addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

(function draw() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7);
    ctx.fillStyle = 'rgba(0,212,255,.8)'; ctx.fill();
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(139,92,246,${1 - d / 130})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (m < 170) {
      ctx.strokeStyle = `rgba(255,140,0,${1 - m / 170})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      p.x -= (mouse.x - p.x) * .005; p.y -= (mouse.y - p.y) * .005;
    }
  });
  requestAnimationFrame(draw);
})();

// ---- cursor glow + scroll progress ----
const glow = document.querySelector('.cursor-glow'), bar = document.querySelector('.progress');
addEventListener('mousemove', e => glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`);
addEventListener('scroll', () => {
  bar.style.width = (scrollY / (document.body.scrollHeight - innerHeight)) * 100 + '%';
});

// ---- scroll reveal ----
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.section, .skill-card, .project-card, .hero-copy')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

// ---- 3D tilt on cards ----
document.querySelectorAll('.project-card, .skill-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
  });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});

// ---- typing effect ----
const t = document.querySelector('.hero h2');
if (t) {
  const txt = t.textContent.trim(); t.textContent = ''; let i = 0;
  (function type() { if (i <= txt.length) { t.textContent = txt.slice(0, i++); setTimeout(type, 55); } })();
}