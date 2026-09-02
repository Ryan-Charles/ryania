/* ryania.fr — interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── grain (généré une fois, injecté en variable CSS) ───────────────── */
  (function grain() {
    var n = 180, c = document.createElement('canvas');
    c.width = c.height = n;
    var x = c.getContext('2d'), d = x.createImageData(n, n), s = 7;
    var rnd = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    for (var i = 0; i < d.data.length; i += 4) {
      var v = 120 + rnd() * 135;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    document.documentElement.style.setProperty('--grain', 'url(' + c.toDataURL('image/png') + ')');
  })();

  /* ── journal d'exécution : lignes réelles de l'instance n8n ─────────── */
  var LOG = [
    ['01/09  18:11:19', 'Acose · service client', '13,2 s'],
    ['01/09  10:20:19', 'Acose · service client', '9,1 s'],
    ['01/09  10:14:19', 'Acose · service client', '2 min 31'],
    ['01/09  00:01:19', 'Acose · service client', '11,4 s'],
    ['31/08  18:30:19', 'Acose · service client', '11,0 s'],
    ['31/08  14:33:19', 'Acose · service client', '2 min 33'],
    ['31/08  07:36:19', 'Acose · service client', '10,2 s'],
    ['31/08  02:00:00', 'Acose · éditorial SEO', '39,2 s'],
    ['30/08  10:33:19', 'Acose · service client', '30,1 s'],
    ['29/08  15:26:19', 'Acose · service client', '2 min 30'],
    ['28/08  14:12:19', 'Acose · service client', '9,6 s'],
    ['27/08  02:00:00', 'Acose · éditorial SEO', '45,5 s']
  ];
  var tk = document.getElementById('tk');
  if (tk) {
    var row = LOG.map(function (r) {
      return '<div class="tk"><span>' + r[0] + '</span><span class="who">' + r[1] +
        '</span><span class="ok">succès</span><span>' + r[2] + '</span></div>';
    }).join('');
    tk.innerHTML = '<div class="row">' + row + '</div><div class="row">' + row + '</div>';
  }

  /* ── révélation au scroll ──────────────────────────────────────────── */
  var els = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sibs = [].slice.call(en.target.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('rv');
        });
        var i = Math.min(sibs.indexOf(en.target), 5);
        en.target.style.transitionDelay = (i > 0 ? i * 70 : 0) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ── barre de progression ──────────────────────────────────────────── */
  var rail = document.getElementById('rail'), ticking = false;
  function prog() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    rail.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(prog); }
  }, { passive: true });
  prog();

  /* ── lecteurs vidéo ────────────────────────────────────────────────── */
  var players = [].slice.call(document.querySelectorAll('.player'));
  players.forEach(function (p) {
    var btn = p.querySelector('.play');
    btn.addEventListener('click', function () {
      players.forEach(function (o) {
        var v = o.querySelector('video');
        if (o !== p && v) { v.pause(); }
      });
      var v = p.querySelector('video');
      if (!v) {
        v = document.createElement('video');
        v.src = p.dataset.src || (window.__VID && window.__VID[p.dataset.key]) || '';
        v.controls = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.setAttribute('controlslist', 'nodownload');
        p.insertBefore(v, p.firstChild);
      }
      p.classList.add('on');
      v.play();
    });
  });

  /* ── compteurs ─────────────────────────────────────────────────────── */
  if (!reduce && 'IntersectionObserver' in window) {
    var nums = [].slice.call(document.querySelectorAll('.kpi .v'));
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        io2.unobserve(e.target);
        var end = parseInt(e.target.textContent, 10);
        if (isNaN(end) || end === 0) return;
        var t0 = null, dur = 950;
        (function step(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur);
          e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  }

  /* ── pastille « revenir au sommaire » ──────────────────────────────── */
  var toTop = document.getElementById('totop');
  var hero = document.querySelector('.ticker');
  if (toTop && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      toTop.classList.toggle('on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(hero);
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
