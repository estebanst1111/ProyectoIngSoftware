/* landing.js — animaciones e interacciones de la landing page */
'use strict';

// ── Nav scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Contador animado de estadísticas ──
function animarContador(el, final, duracion = 1800) {
  const inicio = performance.now();
  const update = (now) => {
    const t = Math.min((now - inicio) / duracion, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const valor = Math.round(ease * final);
    el.textContent = valor >= 1000
      ? (valor >= 10000 ? (valor / 1000).toFixed(0) + 'k' : valor.toLocaleString('es-CO'))
      : valor;
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = final >= 1000
      ? (final >= 10000 ? (final / 1000).toFixed(0) + 'k' : final.toLocaleString('es-CO'))
      : final;
  };
  requestAnimationFrame(update);
}

// Observar cuando la sección de stats entra en viewport
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.stat-item').forEach((item, i) => {
          const ids = ['s1','s2','s3','s4'];
          const vals = [128, 3400, 12000, 19];
          const el = document.getElementById(ids[i]);
          if (el) animarContador(el, vals[i], 1600 + i * 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ── Reveal on scroll ──
const revealEls = document.querySelectorAll('.step-card, .refugio-card, .stat-item');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.animation = `fadeUp 0.5s ${i * 0.07}s ease both`;
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));
