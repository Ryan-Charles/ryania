/* QG des agents n8n — open space isométrique, statut mis à jour chaque jour par n8n.
   Données : data/agents.json (réécrit chaque jour par le workflow n8n « QG - API agents ») */
(function () {
  "use strict";
  var DATA_URL = "data/agents.json";
  var root = document.getElementById("qgAgents");
  if (!root) return;

  /* zones : couleurs tirées de la palette du site, une par activité */
  var ZONES = [
    { id: "acose",      label: "Acose · e-commerce",     color: "#146B52", rect: [0.5, 0.5, 10.5, 6.6] },
    { id: "ryania",     label: "Ryania · contenu",       color: "#1B36C4", rect: [11.5, 0.5, 21.5, 6.6] },
    { id: "immobilier", label: "Immobilier · Martinique", color: "#B8452A", rect: [0.5, 7.6, 10.5, 13.7] },
    { id: "btp",        label: "BTP · Guyane",            color: "#8A5A00", rect: [11.5, 7.6, 21.5, 13.7] }
  ];
  var STAT = {
    actif:  { t: "En service",  c: "#146B52" },
    veille: { t: "En veille",   c: "#575D57" },
    pause:  { t: "En pause",    c: "#868C85" },
    erreur: { t: "Incident",    c: "#B8452A" },
    absent: { t: "Hors ligne",  c: "#868C85" }
  };
  var W = 22, D = 14.2, T = 8; // demi-tuile
  var OX = (D + 1) * T + 6, OY = 30;
  var CW = OX + (W + 1) * T + 6, CH = OY + (W + D + 1) * T / 2 + 16;
  var OUT = "#141715";

  root.innerHTML =
    '<div class="qgHead"><span class="qgDot"></span><span>Instance n8n · en direct</span><span class="qgMaj" id="qgMaj"></span></div>' +
    '<div class="qgStage" id="qgStage"><canvas id="qgCv" aria-label="Open space des agents n8n de Ryan Charles"></canvas><div id="qgPlates"></div><div class="qgTip" id="qgTip" hidden></div></div>' +
    '<div class="qgFoot" id="qgFoot"><span><i style="background:#146B52"></i>en service</span><span><i style="background:#C2C6BD"></i>en veille</span><span>zz en pause</span><span class="qgSum" id="qgSum"></span></div>';
  var stage = root.querySelector("#qgStage"), cv = root.querySelector("#qgCv"), ctx = cv.getContext("2d");
  var tip = root.querySelector("#qgTip"), k = 1, tick = 0, hits = [], agents = [], maj = null, sel = null;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function iso(x, y, z) { return [OX + (x - y) * T, OY + (x + y) * T / 2 - (z || 0)]; }
  function hex(c) { c = c.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
  function mix(c, t, a) { var A = hex(c), B = hex(t); return "#" + A.map(function (v, i) { return Math.round(v + (B[i] - v) * a).toString(16).padStart(2, "0"); }).join(""); }
  function poly(p, f, s) { ctx.beginPath(); p.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
    if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = .55; ctx.lineJoin = "round"; ctx.stroke(); } }
  function box(x, y, w, d, h, z, top, left, right, o) {
    left = left || mix(top, "#141715", .16); right = right || mix(top, "#141715", .3); o = o === undefined ? OUT : o;
    poly([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], left, o);
    poly([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], right, o);
    poly([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], top, o);
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  var SK = ["#f3d0ae", "#e3b28a", "#c98f62", "#9b6844", "#6f472e"], HR = ["#2b1d14", "#5a3825", "#d9aa4a", "#1c1c22", "#8a4a2a", "#e6e1d6"];

  function person(sx, F, a, color, st) {
    var h = hash(a.id), skin = SK[h % SK.length], hair = HR[(h >> 3) % HR.length];
    var sleep = st === "pause" || st === "absent", bob = (st === "actif" && tick % 4 < 2 && !reduce) ? .8 : 0, y = F + (sleep ? 1.5 : 0);
    var parts = [[sx - 5.5, F - 20, 11, 12, "#3b3f3c"], [sx - 4.5, y - 13, 9, 9.5, color], [sx - 4, y - 22.5 - bob, 8, 8, skin]];
    ctx.fillStyle = OUT; parts.forEach(function (p) { ctx.fillRect(p[0] - .6, p[1] - .6, p[2] + 1.2, p[3] + 1.2); });
    parts.forEach(function (p) { ctx.fillStyle = p[4]; ctx.fillRect(p[0], p[1], p[2], p[3]); });
    ctx.fillStyle = mix(color, "#000000", .25); ctx.fillRect(sx + 1.5, y - 13, 3, 9.5);
    ctx.fillStyle = hair; ctx.fillRect(sx - 4.2, y - 23.5 - bob, 8.4, 3.2); ctx.fillRect(sx - 4.2, y - 21 - bob, 1.6, 3.4);
    ctx.fillStyle = OUT;
    if (sleep) { ctx.fillRect(sx - 2.6, y - 17.5, 2, .8); ctx.fillRect(sx + .8, y - 17.5, 2, .8); }
    else { ctx.fillRect(sx - 2.2, y - 18.5 - bob, 1.2, 1.6); ctx.fillRect(sx + 1.2, y - 18.5 - bob, 1.2, 1.6); }
  }
  function hands(sx, F, a, st) {
    var skin = SK[hash(a.id) % SK.length], kk = (st === "actif" && !reduce) ? tick % 2 : 0;
    ctx.fillStyle = OUT; ctx.fillRect(sx - 5.2, F - 7.2 - kk, 3.4, 2.4); ctx.fillRect(sx + 1.8, F - 7.2 - (1 - kk) * (st === "actif" ? 1 : 0), 3.4, 2.4);
    ctx.fillStyle = skin; ctx.fillRect(sx - 4.8, F - 6.8 - kk, 2.6, 1.6); ctx.fillRect(sx + 2.2, F - 6.8 - (1 - kk) * (st === "actif" ? 1 : 0), 2.6, 1.6);
  }
  function desk(cx, cy, glow) {
    box(cx, cy + 1, 2.2, 1, 7, 0, "#F7F8F5", "#DADDD6", "#C6CAC1");
    box(cx + .25, cy + 1.15, .9, .18, 6, 7, "#2b2f2c", "#1f2220", "#171918");
    var p = iso(cx + .7, cy + 1.33, 10.5); ctx.fillStyle = glow; ctx.fillRect(p[0] - 1.2, p[1] - 1.2, 2.4, 2.4);
  }
  function plant(x, y) {
    box(x, y, .6, .6, 3.5, 0, "#8a6a4a", "#6f5338", "#5b432d");
    var p = iso(x + .3, y + .3, 3.5);
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(p[0], p[1] - 5, 5.4, 0, 7); ctx.fill();
    ctx.fillStyle = "#2f6e4f"; ctx.beginPath(); ctx.arc(p[0], p[1] - 5, 4.7, 0, 7); ctx.fill();
    ctx.fillStyle = "#4a9470"; ctx.beginPath(); ctx.arc(p[0] - 1.3, p[1] - 6.3, 2.4, 0, 7); ctx.fill();
  }
  function slots(z) {
    var r = z.rect, s = [];
    for (var cy = r[1] + .7; cy + 2.9 <= r[3] - .2; cy += 3.1) for (var cx = r[0] + .9; cx + 2.2 <= r[2] - .5; cx += 3) s.push({ cx: cx, cy: cy });
    return s;
  }
  function zoneOf(a) { var z = ZONES.filter(function (x) { return x.id === a.zone; })[0]; return z || ZONES[1]; }

  function draw() {
    hits = [];
    ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, CW, CH);
    // dalle
    var S = 9;
    poly([iso(0, D), iso(W, D), [iso(W, D)[0], iso(W, D)[1] + S], [iso(0, D)[0], iso(0, D)[1] + S]], "#C2C6BD", OUT);
    poly([iso(W, 0), iso(W, D), [iso(W, D)[0], iso(W, D)[1] + S], [iso(W, 0)[0], iso(W, 0)[1] + S]], "#AEB3A9", OUT);
    poly([iso(0, 0), iso(W, 0), iso(W, D), iso(0, D)], "#E9EBE6", OUT);
    for (var x = 0; x < W; x++) for (var y = 0; y < D - .1; y++) if ((x + y) % 2) poly([iso(x, y), iso(x + 1, y), iso(x + 1, Math.min(y + 1, D)), iso(x, Math.min(y + 1, D))], "#E1E4DE");
    // murs du fond
    var WH = 26;
    poly([iso(0, 0), iso(W, 0), iso(W, 0, WH), iso(0, 0, WH)], "#EFF0EC", OUT);
    poly([iso(0, 0), iso(0, D), iso(0, D, WH), iso(0, 0, WH)], "#D7DAD3", OUT);
    for (var i = 1.5; i < W - 2; i += 4) { poly([iso(i, 0, 9), iso(i + 2.4, 0, 9), iso(i + 2.4, 0, 22), iso(i, 0, 22)], "#C9D3F2", OUT); }
    for (var j = 2; j < D - 2; j += 5) { poly([iso(0, j, 9), iso(0, j + 2.4, 9), iso(0, j + 2.4, 22), iso(0, j, 22)], "#BCC6E6", OUT); }
    var over = [];
    ZONES.forEach(function (z) {
      var r = z.rect, x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3];
      var a1 = mix(z.color, "#ffffff", .78), a2 = mix(z.color, "#ffffff", .7);
      for (var xx = x0; xx < x1 - .01; xx++) for (var yy = y0; yy < y1 - .01; yy++) {
        var w = Math.min(1, x1 - xx), d = Math.min(1, y1 - yy);
        poly([iso(xx, yy), iso(xx + w, yy), iso(xx + w, yy + d), iso(xx, yy + d)], ((Math.floor(xx) + Math.floor(yy)) % 2) ? a1 : a2);
      }
      var wc = z.color, cap = mix(z.color, "#ffffff", .35), t = .3, h = 7;
      box(x0, y0, x1 - x0, t, h, 0, cap, wc, mix(wc, "#000", .2));
      box(x0, y0, t, y1 - y0, h, 0, cap, wc, mix(wc, "#000", .2));
      var members = agents.filter(function (a) { return zoneOf(a) === z; });
      plant(x1 - 1.1, y0 + .5);
      slots(z).forEach(function (s, i) {
        var a = members[i], p = iso(s.cx + 1.1, s.cy + .7), sx = p[0], F = p[1], st = a ? a.statut : null;
        if (!a) return;
        person(sx, F, a, z.color, st);
        desk(s.cx, s.cy, st !== "pause" && st !== "absent" ? z.color : "#6b706a");
        if (a) {
          hands(sx, F, a, st);
          hits.push({ a: a, z: z, x0: sx - 8, x1: sx + 8, y0: F - 28, y1: F + 3, sx: sx, F: F });
          over.push(function () { bubble(sx, F, st, a === sel); });
        }
      });
      var mid = (x0 + x1) / 2;
      box(x0, y1 - t, mid - 1.3 - x0, t, h, 0, cap, wc, mix(wc, "#000", .2));
      box(mid + 1.3, y1 - t, x1 - mid - 1.3, t, h, 0, cap, wc, mix(wc, "#000", .2));
      box(x1 - t, y0, t, y1 - y0, h, 0, cap, wc, mix(wc, "#000", .2));
    });
    over.forEach(function (f) { f(); });
  }
  function bubble(sx, F, st, isSel) {
    var y = F - 31;
    if (isSel) {
      var b = reduce ? 0 : (tick % 6 < 3 ? 0 : 1.5);
      ctx.beginPath(); ctx.moveTo(sx - 5, y - 4 + b); ctx.lineTo(sx + 5, y - 4 + b); ctx.lineTo(sx, y + 2 + b); ctx.closePath();
      ctx.fillStyle = "#1B36C4"; ctx.fill(); return;
    }
    if (st === "actif") {
      var on = reduce || tick % 4 < 2;
      ctx.fillStyle = "rgba(20,107,82,.22)"; ctx.beginPath(); ctx.arc(sx, y, on ? 4.6 : 3.6, 0, 7); ctx.fill();
      ctx.fillStyle = "#146B52"; ctx.beginPath(); ctx.arc(sx, y, 2.3, 0, 7); ctx.fill();
    } else if (st === "erreur") {
      ctx.fillStyle = "#B8452A"; ctx.fillRect(sx - 3.3, y - 5.3, 6.6, 8.6); ctx.fillStyle = "#fff"; ctx.fillRect(sx - .7, y - 4, 1.4, 4.4); ctx.fillRect(sx - .7, y + 1.2, 1.4, 1.4);
    } else if (st === "pause" || st === "absent") {
      var o = reduce ? 0 : (tick % 8) / 2; ctx.fillStyle = "#575D57";
      ctx.font = "600 7px 'JetBrains Mono', monospace"; ctx.fillText("z", sx + 3, y + 2 - o);
      ctx.font = "600 9px 'JetBrains Mono', monospace"; ctx.fillText("z", sx + 6, y - 4 - o);
    }
  }

  function plates() {
    var box = root.querySelector("#qgPlates"); box.innerHTML = "";
    ZONES.forEach(function (z) {
      var p = iso(z.rect[2] - 3.2, z.rect[1] + 3.7, 0), d = document.createElement("span");
      d.className = "qgPlate"; d.style.background = z.color; d.textContent = z.label;
      d.style.left = (p[0] / CW * 100) + "%"; d.style.top = (p[1] / CH * 100) + "%";
      box.appendChild(d);
    });
  }

  /* taille : sur téléphone, le bloc tient dans l'écran sous le titre, sans défilement */
  function layout() {
    var w = stage.clientWidth || root.clientWidth;
    var h = w * CH / CW;
    if (window.innerWidth < 760 && window.scrollY < 40) {
      var top = stage.getBoundingClientRect().top + window.scrollY;
      var foot = root.querySelector("#qgFoot").offsetHeight || 30;
      var avail = window.innerHeight - top - foot - 14;
      h = Math.max(170, Math.min(h, avail));
    }
    var sc = Math.min(w / CW, h / CH), cssW = CW * sc, cssH = CH * sc;
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.style.width = cssW + "px"; cv.style.height = cssH + "px";
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr); k = cv.width / CW;
    stage.style.height = cssH + "px";
    var pl = root.querySelector("#qgPlates"); pl.style.width = cssW + "px"; pl.style.height = cssH + "px";
    pl.style.fontSize = Math.max(8.5, Math.min(11, cssW / 52)) + "px";
    draw();
  }

  function rel(s) {
    if (!s) return "aucune exécution récente";
    var d = (Date.now() - Date.parse(s)) / 1000;
    if (d < 3600) return "il y a " + Math.max(1, Math.round(d / 60)) + " min";
    if (d < 86400) return "il y a " + Math.round(d / 3600) + " h";
    var j = Math.round(d / 86400); return "il y a " + j + " jour" + (j > 1 ? "s" : "");
  }
  function pick(e) {
    var b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * CW, y = (e.clientY - b.top) / b.height * CH;
    for (var i = hits.length - 1; i >= 0; i--) { var h = hits[i]; if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h; }
    return null;
  }
  function show(h) {
    if (!h) { tip.hidden = true; sel = null; draw(); return; }
    sel = h.a; var s = STAT[h.a.statut] || STAT.veille;
    tip.innerHTML = '<b>' + esc(h.a.nom) + '</b> · ' + esc(h.a.role) + '<br><span style="color:' + s.c + '">● ' + s.t + '</span> · ' + esc(h.a.dernier_run ? "dernier passage " + rel(h.a.dernier_run) : rel(null));
    var b = cv.getBoundingClientRect(), sb = stage.getBoundingClientRect();
    tip.style.left = (b.left - sb.left + h.sx / CW * b.width) + "px"; tip.style.top = (b.top - sb.top + (h.F - 33) / CH * b.height) + "px";
    tip.hidden = false; draw();
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  cv.addEventListener("mousemove", function (e) { var h = pick(e); cv.style.cursor = h ? "pointer" : "default"; if (h) show(h); else if (sel) show(null); });
  cv.addEventListener("mouseleave", function () { show(null); });
  cv.addEventListener("click", function (e) { show(pick(e)); });

  function summary() {
    var on = agents.filter(function (a) { return a.statut === "actif"; }).length;
    var runs = agents.reduce(function (n, a) { return n + (a.runs_7j || 0); }, 0);
    root.querySelector("#qgSum").textContent = agents.length ? (on + " en service · " + runs + " exécutions sur 7 j") : "";
    root.querySelector("#qgMaj").textContent = maj ? "maj " + rel(maj) : "";
  }
  function load() {
    fetch(DATA_URL + "?t=" + Math.floor(Date.now() / 300000), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { agents = Array.isArray(j.agents) ? j.agents : []; maj = j.maj || null; summary(); draw(); })
      .catch(function () { root.querySelector("#qgMaj").textContent = "statut indisponible"; });
  }

  plates(); layout(); load();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  if (!reduce) setInterval(function () { tick++; draw(); }, 220);
  setInterval(function () { if (document.visibilityState === "visible") load(); }, 10 * 60 * 1000);
})();
