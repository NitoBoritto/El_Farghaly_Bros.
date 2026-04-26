/* ═══════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => loader.remove(), 700);
  }, 2200);
});

/* ═══════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animateCursor() {
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ═══════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 90;
const particles = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.3,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a: Math.random() * 0.5 + 0.1,
  });
}

const LINE_DIST = 130;
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width)  p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,180,41,${p.a})`;
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < LINE_DIST) {
        const alpha = (1 - dist / LINE_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(240,180,41,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ═══════════════════════════════════════════════
   NAV SCROLL EFFECT
═══════════════════════════════════════════════ */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // stagger children if kpi-grid or features-grid
      const children = entry.target.querySelectorAll('.kpi-card, .feature-card, .chart-card, .pipe-step');
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.07}s`;
        child.classList.add('visible');
      });
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════
   KPI CARD TILT
═══════════════════════════════════════════════ */
document.querySelectorAll('.kpi-card, .feature-card, .chart-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const xPct  = (e.clientX - rect.left) / rect.width  - 0.5;
    const yPct  = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-5px) rotateX(${-yPct * 6}deg) rotateY(${xPct * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════
   GLITCH EFFECT ON HERO TITLE (subtle)
═══════════════════════════════════════════════ */
const heroTitle = document.querySelector('.hero-title');
setInterval(() => {
  if (Math.random() > 0.93) {
    heroTitle.style.textShadow = `2px 0 rgba(0,212,255,0.4), -2px 0 rgba(255,76,106,0.4)`;
    setTimeout(() => { heroTitle.style.textShadow = ''; }, 80);
  }
}, 1800);



  /* ═══ 3D TEAM PARALLAX ═══ */
  (function() {
    const stage = document.getElementById('teamStage');
    if (!stage) return;

    // Crop each person from the full group image using CSS
// ── Yasser & Mohanad: individual PNG files — no cropping needed
  // ── personImg3 & personImg4: crop from group photo
  const groupCrops = [
    { id: 'personImg3', left: '46.4%', width: '19.7%', wrapW: 108, wrapH: 400 },
    { id: 'personImg4', left: '63.6%', width: '28.5%', wrapW: 112, wrapH: 385 },
  ];

  groupCrops.forEach(c => {
    const img = document.getElementById(c.id);
    if (!img) return;
    const wrap = img.parentElement;
    const scaleW = 100 / parseFloat(c.width);
    img.style.width    = (scaleW * 100) + '%';
    img.style.height   = 'auto';
    img.style.maxWidth = 'none';
    img.style.position = 'relative';
    img.style.left     = (-parseFloat(c.left) * scaleW) + '%';
    wrap.style.overflow = 'hidden';
    wrap.style.width    = c.wrapW + 'px';
    wrap.style.height   = c.wrapH + 'px';
  });

  // ── Yasser (personImg2) & Mohanad (personImg1): reset any wrapper constraints
  ['personImg1', 'personImg2'].forEach(function(id) {
    const img = document.getElementById(id);
    if (!img) return;
    const wrap = img.parentElement;
    // Clear any previously set inline styles that could clip the image
    wrap.style.overflow = 'visible';
    wrap.style.width    = 'auto';
    wrap.style.height   = 'auto';
    img.style.position  = 'static';
    img.style.left      = '0';
    img.style.maxWidth  = 'none';
  });

    // ── Parallax mouse interaction ──
    const people = [
      { el: document.getElementById('p1'), depth: 0.35, baseX: 0, baseY: 0 },
      { el: document.getElementById('p2'), depth: 0.9,  baseX: 0, baseY: 0 }, // leader — most movement
      { el: document.getElementById('p3'), depth: 0.6,  baseX: 0, baseY: 0 },
      { el: document.getElementById('p4'), depth: 0.45, baseX: 0, baseY: 0 },
    ];

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    stage.addEventListener('mousemove', e => {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      targetX = (e.clientX - cx) / (rect.width  / 2);
      targetY = (e.clientY - cy) / (rect.height / 2);
    });

    stage.addEventListener('mouseleave', () => {
      targetX = 0; targetY = 0;
    });

    function animateParallax() {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;

      people.forEach(p => {
        if (!p.el) return;
        const moveX =  currentX * p.depth * 38;
        const moveY =  currentY * p.depth * 18;
        const rotY  =  currentX * p.depth * 8;
        const rotX  = -currentY * p.depth * 5;
        const scale = 1 + Math.abs(currentX) * p.depth * 0.02;

        p.el.style.transform =
          `translateX(${moveX}px) translateY(${moveY}px)
           perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg)
           scale(${scale})`;
      });

      requestAnimationFrame(animateParallax);
    }
    animateParallax();

    // ── Scroll-in bars ──
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.member-bar-fill').forEach((fill, i) => {
            setTimeout(() => { fill.style.width = fill.dataset.width || '80%'; }, i * 200);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const rp = document.querySelector('.roster-panel');
    if (rp) barObserver.observe(rp);
  })();


/* ═══ Fill person images from single source ═══ */
(function(){
  var src = document.getElementById('TEAM_SRC');
  if(!src) return;
  function fill(){ document.querySelectorAll('.person-wrap img, .person-img').forEach(function(img){ img.src = src.src; }); }
  if(src.complete) fill(); else src.onload = fill;
})();

/* ═══════════════════════════════════════════════════════
   AI PREDICTION ENGINE — Full Interactive JS
═══════════════════════════════════════════════════════ */
(function() {

  /* ── Utilities ── */
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── State ── */
  let horizon = 6;
  let currentModel = 'lgbm';
  let chartInstances = {};
  let animFrame;
  let predRunning = false;

  /* ── Model performance data ── */
  const modelData = {
    lgbm: { auc: 0.809, f1: 0.667, prec: 0.750, recall: 0.750, color: '#f0b429', name: 'LightGBM' }
  };

  /* ── Generate forecast data ── */
  function genForecast(months) {
    const base = 20.4;
    const predicted = [], upper = [], lower = [], labels = [];
    const mnames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    let trend = base;
    for (let i = 0; i < months; i++) {
      trend += rand(-0.6, 0.9);
      trend = Math.max(15, Math.min(30, trend));
      const conf = 0.8 + i * 0.12;
      const m = new Date(now.getFullYear(), now.getMonth() + i);
      labels.push(mnames[m.getMonth()] + ' ' + String(m.getFullYear()).slice(2));
      predicted.push(+trend.toFixed(2));
      upper.push(+(trend + conf).toFixed(2));
      lower.push(+(trend - conf).toFixed(2));
    }
    return { labels, predicted, upper, lower };
  }

  /* ── Generate revenue data ── */
  function genRevenue(months) {
    const labels = [], noAction = [], withAction = [];
    const mnames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    let base1 = 4200000, base2 = 4200000;
    for (let i = 0; i < months; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() + i);
      labels.push(mnames[m.getMonth()] + "'" + String(m.getFullYear()).slice(2));
      base1 += rand(50000, 180000);
      base2 += rand(-30000, 80000);
      noAction.push(+(base1 / 1e6).toFixed(2));
      withAction.push(+(base2 / 1e6).toFixed(2));
    }
    return { labels, noAction, withAction };
  }

  /* ── Draw sparklines ── */
  function drawSparkline(canvasId, data, color) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    c.width = c.offsetWidth || 200;
    c.height = 28;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * c.width,
      y: c.height - ((v - min) / range) * (c.height - 4) - 2
    }));
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, c.height);
    ctx.lineTo(0, c.height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ── Draw gauge ── */
  function drawGauge(val) {
    const c = document.getElementById('gaugeCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const cx = 110, cy = 115, r = 90;
    ctx.clearRect(0, 0, c.width, c.height);
    // background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.stroke();
    // colored arc
    const pct = val / 100;
    const startA = Math.PI;
    const endA = Math.PI + pct * Math.PI;
    const color = val < 40 ? '#00e5a0' : val < 65 ? '#f0b429' : '#ff4c6a';
    const grad = ctx.createLinearGradient(20, cy, cx*2-20, cy);
    grad.addColorStop(0, '#00e5a0');
    grad.addColorStop(0.5, '#f0b429');
    grad.addColorStop(1, '#ff4c6a');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.stroke();
    // tick marks
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      const x1 = cx + (r - 24) * Math.cos(a), y1 = cy + (r - 24) * Math.sin(a);
      const x2 = cx + (r - 16) * Math.cos(a), y2 = cy + (r - 16) * Math.sin(a);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // labels
    const labels = ['0','25','50','75','100'];
    labels.forEach((l, i) => {
      const a = Math.PI + (i / 4) * Math.PI;
      const x = cx + (r - 32) * Math.cos(a), y = cy + (r - 32) * Math.sin(a);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(l, x, y);
    });
    // needle
    const needleA = Math.PI + pct * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleA);
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(0, -(r - 28)); ctx.lineTo(6, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    // update text
    const gv = document.getElementById('gaugeVal');
    const gs = document.getElementById('gaugeStatus');
    if (gv) gv.textContent = val;
    if (gs) gs.textContent = val < 40 ? 'LOW RISK — PORTFOLIO HEALTHY' : val < 65 ? 'MODERATE RISK — ACTION ADVISED' : 'HIGH RISK — URGENT INTERVENTION';
    if (gv) gv.style.color = color;
  }

  /* ── Build feature importance bars ── */
  function buildFeatures() {
    const features = [
      { name: 'Age',            pct: 88, color: '#f0b429' },
      { name: 'Balance',        pct: 82, color: '#f0b429' },
      { name: '# Products',     pct: 76, color: '#00d4ff' },
      { name: 'Country',        pct: 68, color: '#00d4ff' },
      { name: 'IsActiveMember', pct: 61, color: '#00e5a0' },
      { name: 'Gender',         pct: 44, color: '#00e5a0' },
      { name: 'CreditScore',    pct: 38, color: '#ff4c6a' },
      { name: 'Tenure',         pct: 32, color: '#ff4c6a' },
    ];
    const container = document.getElementById('featList');
    if (!container) return;
    container.innerHTML = '';
    features.forEach((f, i) => {
      const row = document.createElement('div');
      row.className = 'feat-row';
      row.innerHTML = `
        <span class="feat-name">${f.name}</span>
        <div class="feat-bar-track">
          <div class="feat-bar-fill" data-pct="${f.pct}" style="background:${f.color};width:0"></div>
        </div>
        <span class="feat-pct">${f.pct}%</span>`;
      container.appendChild(row);
      setTimeout(() => {
        const fill = row.querySelector('.feat-bar-fill');
        if (fill) fill.style.width = f.pct + '%';
      }, 300 + i * 80);
    });
  }

  /* ── Build risk table ── */
  function buildRiskTable() {
    const countries = ['Germany', 'France', 'Spain'];
    const actions = ['Call Now', 'Email Offer', 'VIP Upgrade', 'Rate Review', 'Flag Review'];
    const body = document.getElementById('riskTableBody');
    if (!body) return;
    body.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const prob = rand(0.65, 0.97);
      const risk = prob > 0.85 ? 'high' : prob > 0.72 ? 'med' : 'low';
      const riskLabel = prob > 0.85 ? 'HIGH' : prob > 0.72 ? 'MEDIUM' : 'LOW';
      const bal = (rand(50000, 250000)).toFixed(0);
      const probColor = risk === 'high' ? '#ff4c6a' : risk === 'med' ? '#f0b429' : '#00e5a0';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${randInt(10000,99999)}</td>
        <td>${randInt(28,62)}</td>
        <td>${countries[randInt(0,2)]}</td>
        <td>$${parseInt(bal).toLocaleString()}</td>
        <td>${randInt(1,9)} yrs</td>
        <td>
          ${(prob*100).toFixed(1)}%
          <span class="prob-bar"><span class="prob-fill" style="width:${prob*100}%;background:${probColor}"></span></span>
        </td>
        <td><span class="risk-tag risk-${risk}">${riskLabel}</span></td>
        <td style="color:var(--gold);font-size:10px">${actions[randInt(0,4)]}</td>`;
      body.appendChild(tr);
    }
  }

  /* ── Build model comparison table ── */
  function buildModelTable() {
    const body = document.getElementById('modelTableBody');
    if (!body) return;
    body.innerHTML = '';
    Object.entries(modelData).forEach(([key, m]) => {
      const isBest = m.auc === Math.max(...Object.values(modelData).map(x => x.auc));
      const tr = document.createElement('tr');
      if (isBest) tr.className = 'model-best';
      tr.innerHTML = `
        <td class="model-name">${isBest ? '★ ' : ''}${m.name}</td>
        <td>${m.auc.toFixed(3)} <span class="score-bar"><span class="score-fill ${key==='xgb'?'':'cyan'}" style="width:${m.auc*100}%"></span></span></td>
        <td>${m.f1.toFixed(3)}</td>
        <td>${m.prec.toFixed(3)}</td>
        <td>${m.recall.toFixed(3)}</td>`;
      body.appendChild(tr);
    });
  }

  /* ── Chart.js defaults ── */
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.color = '#3a4a6b';
    Chart.defaults.borderColor = 'rgba(240,180,41,0.08)';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 10;
  }

  /* ── Destroy & create chart ── */
  function makeChart(id, config) {
    if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    const c = document.getElementById(id);
    if (!c) return null;
    chartInstances[id] = new Chart(c, config);
    return chartInstances[id];
  }

  /* ── Draw churn forecast chart ── */
  function drawChurnForecast() {
    const d = genForecast(horizon);
    const lbl = document.getElementById('horizonLabel');
    if (lbl) lbl.textContent = horizon + ' months';
    makeChart('churnForecastChart', {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          { label: 'Upper CI', data: d.upper, borderColor: 'transparent', backgroundColor: 'rgba(240,180,41,0.07)', fill: '+1', tension: 0.4, pointRadius: 0 },
          { label: 'Predicted', data: d.predicted, borderColor: '#f0b429', backgroundColor: 'rgba(240,180,41,0.08)', fill: false, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#f0b429' },
          { label: 'Lower CI', data: d.lower, borderColor: 'transparent', backgroundColor: 'rgba(240,180,41,0.07)', fill: '-1', tension: 0.4, pointRadius: 0 },
          { label: 'Intervention Target', data: d.predicted.map(v => +(v * 0.85).toFixed(2)), borderColor: '#00e5a0', borderDash: [5, 4], fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
        ]
      },
      options: {
        responsive: true, animation: { duration: 800 },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: true, labels: { color: '#3a4a6b', boxWidth: 10, font: { size: 9 } } }, tooltip: { backgroundColor: '#0a1223', borderColor: 'rgba(240,180,41,0.3)', borderWidth: 1 } },
        scales: {
          x: { grid: { color: 'rgba(240,180,41,0.04)' }, ticks: { maxRotation: 45 } },
          y: { grid: { color: 'rgba(240,180,41,0.06)' }, ticks: { callback: v => v + '%' }, title: { display: true, text: 'Churn Rate %', color: '#3a4a6b' } }
        }
      }
    });
  }

  /* ── Segment chart ── */
  function drawSegmentChart() {
    makeChart('segmentChart', {
      type: 'bar',
      data: {
        labels: ['France','Germany','Spain','Age<30','Age 30-45','Age 45-60','Age>60','1 Product','2 Products','3+ Products'],
        datasets: [
          { label: 'Churn %', data: [16.7,32.4,16.2,14.1,19.8,28.6,24.2,27.8,7.6,4.1], backgroundColor: ctx => { const v = ctx.raw; return v > 25 ? 'rgba(255,76,106,0.7)' : v > 18 ? 'rgba(240,180,41,0.7)' : 'rgba(0,229,160,0.65)'; }, borderRadius: 4, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, animation: { duration: 900 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + ctx.raw + '% churn rate' } } },
        scales: { x: { grid: { display: false }, ticks: { maxRotation: 60, font: { size: 8 } } }, y: { grid: { color: 'rgba(240,180,41,0.05)' }, ticks: { callback: v => v + '%' } } }
      }
    });
  }

  /* ── ROC Curve ── */
  function drawROC() {
    function rocPoints(auc) {
      const pts = [{x:0,y:0}];
      let prev = 0;
      for (let i = 1; i <= 20; i++) {
        const fpr = i / 20;
        const tpr = Math.min(1, prev + (auc * 0.1 + rand(0, 0.03)));
        prev = tpr;
        pts.push({ x: +fpr.toFixed(3), y: +tpr.toFixed(3) });
      }
      pts.push({x:1,y:1});
      return pts;
    }
    const diag = Array.from({length:11}, (_,i) => ({x: i/10, y: i/10}));
    makeChart('rocChart', {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'LightGBM (0.809)', data: rocPoints(0.809), borderColor: '#f0b429', showLine: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: 'Random Forest (0.861)', data: rocPoints(0.861), borderColor: '#00d4ff', showLine: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
          { label: 'Neural Net (0.856)', data: rocPoints(0.856), borderColor: '#ff4c6a', showLine: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
          { label: 'Log. Reg. (0.783)', data: rocPoints(0.783), borderColor: '#00e5a0', showLine: true, tension: 0.4, pointRadius: 0, borderWidth: 1, borderDash: [3,3] },
          { label: 'Random', data: diag, borderColor: 'rgba(255,255,255,0.1)', showLine: true, pointRadius: 0, borderWidth: 1, borderDash: [4,4] },
        ]
      },
      options: {
        responsive: true, animation: { duration: 800 },
        plugins: { legend: { labels: { color: '#3a4a6b', boxWidth: 10, font: { size: 9 } } } },
        scales: {
          x: { min:0, max:1, grid:{color:'rgba(240,180,41,0.05)'}, title:{display:true,text:'False Positive Rate',color:'#3a4a6b'} },
          y: { min:0, max:1, grid:{color:'rgba(240,180,41,0.05)'}, title:{display:true,text:'True Positive Rate',color:'#3a4a6b'} }
        }
      }
    });
  }

  /* ── Revenue chart ── */
  function drawRevenue(mode) {
    const months = mode === 'quarterly' ? 12 : mode === 'annual' ? 3 : 36;
    const d = genRevenue(months);
    makeChart('revenueChart', {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          { label: 'Without Intervention ($M)', data: d.noAction, borderColor: '#ff4c6a', backgroundColor: 'rgba(255,76,106,0.07)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
          { label: 'With Retention Strategy ($M)', data: d.withAction, borderColor: '#00e5a0', backgroundColor: 'rgba(0,229,160,0.07)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
        ]
      },
      options: {
        responsive: true, animation: { duration: 700 },
        plugins: { legend: { labels: { color: '#3a4a6b', boxWidth: 10, font: { size: 9 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 45 } },
          y: { grid: { color: 'rgba(240,180,41,0.05)' }, ticks: { callback: v => '$' + v + 'M' } }
        }
      }
    });
  }

  /* ── Geo chart ── */
  function drawGeo() {
    makeChart('geoChart', {
      type: 'doughnut',
      data: {
        labels: ['Germany 32.4%', 'France 16.7%', 'Spain 16.2%'],
        datasets: [{ data: [32.4, 16.7, 16.2], backgroundColor: ['rgba(255,76,106,0.8)', 'rgba(240,180,41,0.8)', 'rgba(0,229,160,0.8)'], borderColor: '#070d1a', borderWidth: 2 }]
      },
      options: {
        responsive: true, animation: { duration: 800 },
        plugins: { legend: { position: 'bottom', labels: { color: '#3a4a6b', font: { size: 9 }, padding: 10 } }, tooltip: { callbacks: { label: ctx => ' Churn rate: ' + ctx.label } } },
        cutout: '60%'
      }
    });
  }

  /* ── Age distribution ── */
  function drawAgeDist() {
    const ages = Array.from({length: 12}, (_, i) => (i * 5) + 20);
    const churned = ages.map(a => Math.max(0, +(rand(2, 22) + (a > 40 ? (a - 40) * 0.6 : 0)).toFixed(1)));
    const retained = ages.map(a => +(rand(30, 80) - (a > 50 ? (a - 50) * 0.5 : 0)).toFixed(1));
    makeChart('ageDistChart', {
      type: 'bar',
      data: {
        labels: ages.map(a => a + '-' + (a+5)),
        datasets: [
          { label: 'Churned', data: churned, backgroundColor: 'rgba(255,76,106,0.65)', borderRadius: 2 },
          { label: 'Retained', data: retained, backgroundColor: 'rgba(0,229,160,0.5)', borderRadius: 2 },
        ]
      },
      options: {
        responsive: true, animation: { duration: 800 },
        plugins: { legend: { labels: { color: '#3a4a6b', boxWidth: 10, font: { size: 9 } } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 8 }, maxRotation: 60 } }, y: { grid: { color: 'rgba(240,180,41,0.05)' }, stacked: false } }
      }
    });
  }

  /* ── Balance vs churn ── */
  function drawBalance() {
    const buckets = ['$0–25K','$25–50K','$50–100K','$100–150K','$150–200K','$200K+'];
    const rates = [24.1, 21.8, 18.4, 22.6, 19.7, 25.3];
    makeChart('balanceChart', {
      type: 'bar',
      data: {
        labels: buckets,
        datasets: [{ label: 'Churn Rate %', data: rates, backgroundColor: rates.map(v => v > 22 ? 'rgba(255,76,106,0.7)' : 'rgba(240,180,41,0.65)'), borderRadius: 4, borderSkipped: false }]
      },
      options: {
        responsive: true, animation: { duration: 800 },
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 8 } } }, y: { grid: { color: 'rgba(240,180,41,0.05)' }, ticks: { callback: v => v + '%' } } }
      }
    });
  }

  /* ── Sparklines ── */
  function drawAllSparklines() {
    drawSparkline('spkChurn',  Array.from({length:12},()=>rand(18,24)),  'rgb(255,76,106)');
    drawSparkline('spkRetain', Array.from({length:12},()=>rand(7500,8200)), 'rgb(0,229,160)');
    drawSparkline('spkAuc',    Array.from({length:12},()=>rand(0.82,0.90)), 'rgb(0,212,255)');
    drawSparkline('spkRisk',   Array.from({length:12},()=>rand(1100,1400)), 'rgb(255,76,106)');
    drawSparkline('spkRev',    Array.from({length:12},()=>rand(3.8,4.8)),   'rgb(255,76,106)');
    drawSparkline('spkPrec',   Array.from({length:12},()=>rand(79,88)),     'rgb(0,212,255)');
  }

  /* ── 3D Scatter (WebGL-free, canvas 3D projection) ── */
  let scene3dData = [];
  let rotX = 0.3, rotY = 0, isDragging = false, lastMX = 0, lastMY = 0, autoRotate = true;

  function gen3DData(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const age = rand(20, 70);
      const bal = rand(0, 250000);
      const tenure = rand(0, 10);
      const prob = Math.max(0, Math.min(1,
        0.1 + (age > 45 ? 0.15 : 0) + (bal < 30000 ? 0.1 : 0) + (tenure < 2 ? 0.15 : 0) + rand(-0.1, 0.1)
      ));
      pts.push({ x: age, y: bal / 250000, z: tenure / 10, prob, churned: prob > 0.5 });
    }
    return pts;
  }

  function project3D(x, y, z, rx, ry, cx, cy, scale) {
    // rotate Y
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let x2 = x * cosY - z * sinY;
    let z2 = x * sinY + z * cosY;
    // rotate X
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    let y2 = y * cosX - z2 * sinX;
    let z3 = y * sinX + z2 * cosX;
    const fov = scale / (scale + z3 * 0.3);
    return { px: cx + x2 * fov * scale, py: cy + y2 * fov * scale, depth: z3 };
  }

  function draw3DScene() {
    const c = document.getElementById('scene3d');
    if (!c) return;
    const W = c.width, H = c.height;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2, scale = Math.min(W, H) * 0.38;
    const center = { x: 0.5, y: 0.5, z: 0.5 };

    // draw axis grid
    const axes = [
      [[0,0,0],[1,0,0],'Age', [1.05,0,0]],
      [[0,0,0],[0,1,0],'Balance', [0,1.08,0]],
      [[0,0,0],[0,0,1],'Tenure', [0,0,1.08]],
    ];
    axes.forEach(([from, to, label, lpos]) => {
      const p1 = project3D(from[0]-0.5, from[1]-0.5, from[2]-0.5, rotX, rotY, cx, cy, scale);
      const p2 = project3D(to[0]-0.5, to[1]-0.5, to[2]-0.5, rotX, rotY, cx, cy, scale);
      ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
      ctx.strokeStyle = 'rgba(240,180,41,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      const pl = project3D(lpos[0]-0.5, lpos[1]-0.5, lpos[2]-0.5, rotX, rotY, cx, cy, scale);
      ctx.fillStyle = 'rgba(240,180,41,0.5)'; ctx.font = '10px JetBrains Mono,monospace';
      ctx.textAlign = 'center'; ctx.fillText(label, pl.px, pl.py);
    });

    // sort by depth
    const projected = scene3dData.map(pt => {
      const p = project3D(pt.x/50-1, pt.y-0.5, pt.z-0.5, rotX, rotY, cx, cy, scale);
      return { ...pt, ...p };
    }).sort((a, b) => b.depth - a.depth);

    // draw points
    projected.forEach(pt => {
      const r = pt.prob;
      const cr = Math.floor(255 * r);
      const cg = Math.floor(229 * (1 - r));
      const alpha = 0.55 + pt.prob * 0.35;
      ctx.beginPath();
      ctx.arc(pt.px, pt.py, pt.churned ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},80,${alpha})`;
      ctx.fill();
    });
  }

  function init3DScene() {
    const c = document.getElementById('scene3d');
    if (!c) return;
    scene3dData = gen3DData(400);
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight || 320; }
    resize();
    window.addEventListener('resize', resize);

    c.addEventListener('mousedown', e => { isDragging = true; autoRotate = false; lastMX = e.clientX; lastMY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    c.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rotY += (e.clientX - lastMX) * 0.012;
      rotX += (e.clientY - lastMY) * 0.012;
      lastMX = e.clientX; lastMY = e.clientY;
    });
    c.addEventListener('touchstart', e => { isDragging = true; autoRotate = false; lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; });
    c.addEventListener('touchmove', e => {
      if (!isDragging) return;
      rotY += (e.touches[0].clientX - lastMX) * 0.012;
      rotX += (e.touches[0].clientY - lastMY) * 0.012;
      lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    });
    c.addEventListener('touchend', () => isDragging = false);

    function loop() {
      if (autoRotate) rotY += 0.005;
      draw3DScene();
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── Global control functions (exposed to window) ── */
  window.setHorizon = function(h, btn) {
    horizon = h;
    document.querySelectorAll('.ai-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    drawChurnForecast();
  };

  window.switchModel = function(model) {
    currentModel = model;
    const m = modelData[model];
    document.getElementById('pkAuc').textContent = m.auc.toFixed(3);
    buildModelTable();
    drawROC();
  };

  window.setRevTab = function(mode, btn) {
    document.querySelectorAll('.tl-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    drawRevenue(mode);
  };

  /* ═══════════════════════════════════════════════════════
     PREDICTION MODAL — injects itself once into the DOM
  ═══════════════════════════════════════════════════════ */
  const MODAL_ID = 'bankiq-pred-modal';

  const MODAL_CSS = `
    #${MODAL_ID}-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(7,13,26,0.88);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #${MODAL_ID}-overlay.open { opacity: 1; pointer-events: all; }
    #${MODAL_ID} {
      background: #0d1829;
      border: 1px solid rgba(240,180,41,0.22);
      border-radius: 12px;
      width: min(94vw, 760px);
      max-height: 88vh;
      overflow-y: auto;
      padding: 32px 36px;
      font-family: 'JetBrains Mono', monospace;
      color: #c8d8ff;
      transform: translateY(20px);
      transition: transform 0.25s ease;
    }
    #${MODAL_ID}-overlay.open #${MODAL_ID} { transform: translateY(0); }
    .biq-modal-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem; letter-spacing: 3px;
      color: #f0b429; margin-bottom: 4px;
    }
    .biq-modal-sub {
      font-size: 10px; color: #4a5a8b; margin-bottom: 24px;
      letter-spacing: 1px;
    }
    .biq-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 14px 20px; margin-bottom: 24px;
    }
    @media (max-width: 520px) { .biq-grid { grid-template-columns: 1fr; } }
    .biq-field label {
      display: block; font-size: 9px; letter-spacing: 1.5px;
      color: #4a6a9b; margin-bottom: 5px; text-transform: uppercase;
    }
    .biq-field input, .biq-field select {
      width: 100%; box-sizing: border-box;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(240,180,41,0.18);
      border-radius: 6px; padding: 8px 10px;
      color: #c8d8ff; font-family: inherit; font-size: 12px;
      outline: none; transition: border-color 0.2s;
    }
    .biq-field input:focus, .biq-field select:focus {
      border-color: rgba(240,180,41,0.55);
    }
    .biq-field select option { background: #0d1829; }
    .biq-section-label {
      font-size: 9px; letter-spacing: 2px; color: #f0b429;
      margin: 16px 0 10px; text-transform: uppercase;
      border-bottom: 1px solid rgba(240,180,41,0.12);
      padding-bottom: 6px;
    }
    .biq-actions {
      display: flex; gap: 12px; margin-top: 8px;
      justify-content: flex-end;
    }
    .biq-btn-cancel {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.12);
      color: #4a5a8b; border-radius: 6px;
      padding: 10px 22px; font-family: inherit;
      font-size: 11px; letter-spacing: 1px;
      cursor: pointer; transition: all 0.2s;
    }
    .biq-btn-cancel:hover { border-color: rgba(255,255,255,0.3); color: #c8d8ff; }
    .biq-btn-run {
      background: #f0b429; color: #070d1a;
      border: none; border-radius: 6px;
      padding: 10px 28px; font-family: inherit;
      font-size: 11px; font-weight: 700;
      letter-spacing: 2px; cursor: pointer;
      transition: all 0.2s;
    }
    .biq-btn-run:hover { background: #ffe066; }
    .biq-btn-run:disabled { background: #4a5a8b; color: #070d1a; cursor: not-allowed; }
    #biq-result-banner {
      display: none; margin-top: 20px;
      border-radius: 8px; padding: 18px 20px;
      border: 1px solid;
    }
    #biq-result-banner.show { display: block; }
    #biq-result-banner.yes {
      background: rgba(0,229,160,0.08);
      border-color: rgba(0,229,160,0.35);
    }
    #biq-result-banner.no {
      background: rgba(255,76,106,0.08);
      border-color: rgba(255,76,106,0.35);
    }
    .biq-result-label {
      font-size: 9px; letter-spacing: 2px; color: #4a5a8b;
      text-transform: uppercase; margin-bottom: 6px;
    }
    .biq-result-prediction {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem; letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .biq-result-metrics {
      display: flex; gap: 24px; flex-wrap: wrap;
    }
    .biq-metric { display: flex; flex-direction: column; gap: 2px; }
    .biq-metric-key {
      font-size: 8px; letter-spacing: 1.5px; color: #4a5a8b;
      text-transform: uppercase;
    }
    .biq-metric-val {
      font-size: 15px; font-weight: 600; color: #f0b429;
    }
    .biq-error-msg {
      display: none; margin-top: 14px;
      background: rgba(255,76,106,0.08);
      border: 1px solid rgba(255,76,106,0.3);
      border-radius: 6px; padding: 12px 16px;
      font-size: 11px; color: #ff7a96;
    }
    .biq-error-msg.show { display: block; }
  `;

  function injectModal() {
    if (document.getElementById(MODAL_ID + '-overlay')) return;

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = MODAL_CSS;
    document.head.appendChild(styleEl);

    // Build modal HTML
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID + '-overlay';
    overlay.innerHTML = `
      <div id="${MODAL_ID}" role="dialog" aria-modal="true" aria-labelledby="biq-modal-heading">
        <div class="biq-modal-title" id="biq-modal-heading">⚡ CUSTOMER PREDICTION</div>
        <div class="biq-modal-sub">// Enter customer data — all fields required</div>

        <div class="biq-section-label">Client Demographics</div>
        <div class="biq-grid">
          <div class="biq-field">
            <label>Age</label>
            <input type="number" id="biq-age" min="17" max="98" value="42" />
          </div>
          <div class="biq-field">
            <label>Job</label>
            <select id="biq-job">
              <option value="admin.">Admin.</option>
              <option value="blue-collar">Blue-collar</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="housemaid">Housemaid</option>
              <option value="management">Management</option>
              <option value="retired">Retired</option>
              <option value="self-employed">Self-employed</option>
              <option value="services">Services</option>
              <option value="student">Student</option>
              <option value="technician" selected>Technician</option>
              <option value="unemployed">Unemployed</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Marital Status</label>
            <select id="biq-marital">
              <option value="divorced">Divorced</option>
              <option value="married" selected>Married</option>
              <option value="single">Single</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Education</label>
            <select id="biq-education">
              <option value="basic.4y">Basic 4y</option>
              <option value="basic.6y">Basic 6y</option>
              <option value="basic.9y">Basic 9y</option>
              <option value="high.school">High School</option>
              <option value="illiterate">Illiterate</option>
              <option value="professional.course">Professional Course</option>
              <option value="university.degree" selected>University Degree</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Credit Default</label>
            <select id="biq-default">
              <option value="no" selected>No</option>
              <option value="yes">Yes</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Housing Loan</label>
            <select id="biq-housing">
              <option value="no">No</option>
              <option value="yes" selected>Yes</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Personal Loan</label>
            <select id="biq-loan">
              <option value="no" selected>No</option>
              <option value="yes">Yes</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div class="biq-section-label">Last Contact</div>
        <div class="biq-grid">
          <div class="biq-field">
            <label>Contact Type</label>
            <select id="biq-contact">
              <option value="cellular" selected>Cellular</option>
              <option value="telephone">Telephone</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Month</label>
            <select id="biq-month">
              <option value="jan">Jan</option><option value="feb">Feb</option>
              <option value="mar">Mar</option><option value="apr">Apr</option>
              <option value="may" selected>May</option><option value="jun">Jun</option>
              <option value="jul">Jul</option><option value="aug">Aug</option>
              <option value="sep">Sep</option><option value="oct">Oct</option>
              <option value="nov">Nov</option><option value="dec">Dec</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Day of Week</label>
            <select id="biq-dow">
              <option value="mon" selected>Mon</option>
              <option value="tue">Tue</option><option value="wed">Wed</option>
              <option value="thu">Thu</option><option value="fri">Fri</option>
            </select>
          </div>
          <div class="biq-field">
            <label>Duration (seconds)</label>
            <input type="number" id="biq-duration" min="0" value="261" />
          </div>
        </div>

        <div class="biq-section-label">Campaign &amp; History</div>
        <div class="biq-grid">
          <div class="biq-field">
            <label>Contacts This Campaign</label>
            <input type="number" id="biq-campaign" min="1" value="1" />
          </div>
          <div class="biq-field">
            <label>Days Since Last Contact (999=never)</label>
            <input type="number" id="biq-pdays" min="0" value="999" />
          </div>
          <div class="biq-field">
            <label>Previous Campaign Contacts</label>
            <input type="number" id="biq-previous" min="0" value="0" />
          </div>
          <div class="biq-field">
            <label>Previous Outcome</label>
            <select id="biq-poutcome">
              <option value="failure">Failure</option>
              <option value="nonexistent" selected>Nonexistent</option>
              <option value="success">Success</option>
            </select>
          </div>
        </div>

        <div class="biq-section-label">Social &amp; Economic Context</div>
        <div class="biq-grid">
          <div class="biq-field">
            <label>Emp. Variation Rate</label>
            <input type="number" id="biq-emp-var-rate" step="0.1" value="-1.8" />
          </div>
          <div class="biq-field">
            <label>Consumer Price Index</label>
            <input type="number" id="biq-cons-price-idx" step="0.001" value="93.075" />
          </div>
          <div class="biq-field">
            <label>Consumer Confidence Index</label>
            <input type="number" id="biq-cons-conf-idx" step="0.1" value="-47.1" />
          </div>
          <div class="biq-field">
            <label>Euribor 3M Rate</label>
            <input type="number" id="biq-euribor3m" step="0.001" value="1.313" />
          </div>
          <div class="biq-field">
            <label>Nr. Employed (thousands)</label>
            <input type="number" id="biq-nr-employed" step="0.1" value="5099.1" />
          </div>
        </div>

        <div id="biq-error-msg" class="biq-error-msg"></div>
        <div id="biq-result-banner"></div>

        <div class="biq-actions">
          <button class="biq-btn-cancel" id="biq-cancel-btn">CANCEL</button>
          <button class="biq-btn-run" id="biq-submit-btn">⚡ RUN PREDICTION</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Wire close button
    document.getElementById('biq-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Wire submit
    document.getElementById('biq-submit-btn').addEventListener('click', submitPrediction);
  }

  function openModal() { 
    injectModal();
    const overlay = document.getElementById(MODAL_ID + '-overlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Reset result area
    const result = document.getElementById('biq-result-banner');
    const err    = document.getElementById('biq-error-msg');
    if (result) { result.className = ''; result.innerHTML = ''; }
    if (err)    { err.className = 'biq-error-msg'; err.textContent = ''; }
  }

  function closeModal() {
    const overlay = document.getElementById(MODAL_ID + '-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    predRunning = false;
    const btn = document.querySelector('.ai-btn.gold');
    if (btn) { btn.textContent = '⚡ RUN PREDICTION'; btn.style.opacity = '1'; }
  }

  async function submitPrediction() {
    const submitBtn = document.getElementById('biq-submit-btn');
    const errEl     = document.getElementById('biq-error-msg');
    const resultEl  = document.getElementById('biq-result-banner');

    // ── Reset UI ──
    errEl.className    = 'biq-error-msg';
    resultEl.className = '';
    resultEl.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ RUNNING…';

    // ── Collect form values ──
    const payload = {
      age:        parseInt(document.getElementById('biq-age').value, 10),
      job:        document.getElementById('biq-job').value,
      marital:    document.getElementById('biq-marital').value,
      education:  document.getElementById('biq-education').value,
      default:    document.getElementById('biq-default').value,
      housing:    document.getElementById('biq-housing').value,
      loan:       document.getElementById('biq-loan').value,
      contact:    document.getElementById('biq-contact').value,
      month:      document.getElementById('biq-month').value,
      day_of_week: document.getElementById('biq-dow').value,
      duration:   parseInt(document.getElementById('biq-duration').value, 10),
      campaign:   parseInt(document.getElementById('biq-campaign').value, 10),
      pdays:      parseInt(document.getElementById('biq-pdays').value, 10),
      previous:   parseInt(document.getElementById('biq-previous').value, 10),
      poutcome:   document.getElementById('biq-poutcome').value,
      // Use dot-notation aliases so FastAPI's populate_by_name accepts them
      'emp.var.rate':  parseFloat(document.getElementById('biq-emp-var-rate').value),
      'cons.price.idx': parseFloat(document.getElementById('biq-cons-price-idx').value),
      'cons.conf.idx':  parseFloat(document.getElementById('biq-cons-conf-idx').value),
      euribor3m:        parseFloat(document.getElementById('biq-euribor3m').value),
      'nr.employed':    parseFloat(document.getElementById('biq-nr-employed').value),
    };

    try {
      const response = await fetch('/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI validation errors (422) or business errors (503/500)
        const detail = data.detail ?? JSON.stringify(data);
        throw new Error(`Server ${response.status}: ${
          Array.isArray(detail)
            ? detail.map(d => `${d.loc?.slice(-1)[0] ?? ''}: ${d.msg}`).join('; ')
            : detail
        }`);
      }

      // ── Show result ──
      const subscribeColor = data.prediction.includes('likely subscribe') &&
                             !data.prediction.includes('not')
                             ? '#00e5a0' : '#ff4c6a';
      const isPositive     = data.prediction.includes('likely subscribe') &&
                             !data.prediction.includes('not');

      resultEl.className = `show ${isPositive ? 'yes' : 'no'}`;
      resultEl.innerHTML = `
        <div class="biq-result-label">// Prediction Result</div>
        <div class="biq-result-prediction" style="color:${subscribeColor}">
          ${data.prediction.toUpperCase()}
        </div>
        <div class="biq-result-metrics">
          <div class="biq-metric">
            <span class="biq-metric-key">Subscribe Probability</span>
            <span class="biq-metric-val">${(data.probability * 100).toFixed(1)}%</span>
          </div>
          <div class="biq-metric">
            <span class="biq-metric-key">Confidence</span>
            <span class="biq-metric-val">${Number(data.confidence).toFixed(1)}%</span>
          </div>
          <div class="biq-metric">
            <span class="biq-metric-key">Risk Score</span>
            <span class="biq-metric-val">${Number(data.risk_score).toFixed(1)}%</span>
          </div>
        </div>
      `;

      // ── Update dashboard KPIs with live result ──
      _updateDashboardWithResult(data);

    } catch (err) {
      errEl.className = 'biq-error-msg show';
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errEl.textContent = '⚠ Cannot reach the API. Make sure the FastAPI server is available on the same origin.';
      } else {
        errEl.textContent = '⚠ ' + err.message;
      }
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = '⚡ RUN PREDICTION';
    }
  }

  /* ── Sync live prediction result back to dashboard visuals ── */
  function _updateDashboardWithResult(data) {
    // Update gauge with risk score
    drawGauge(data.risk_score);

    // Update churn forecast + other charts to reflect new inference cycle
    drawChurnForecast();
    drawSegmentChart();
    buildRiskTable();
    drawAllSparklines();
    scene3dData = gen3DData(400);

    // Flash the nav status indicator
    const navStatus = document.querySelector('.nav-status');
    if (navStatus) {
      const dot = navStatus.querySelector('.status-dot');
      const origText = navStatus.textContent.trim();
      if (dot) dot.style.background = data.risk_score < 40 ? '#00e5a0' : data.risk_score < 65 ? '#f0b429' : '#ff4c6a';
      navStatus.lastChild.textContent = ' MODEL LIVE';
      setTimeout(() => { navStatus.lastChild.textContent = ' AWAITING DATA'; }, 5000);
    }
  }

  /* ═══════════════════════════════════════════════
     runPrediction — wires up the "RUN PREDICTION"
     button to the real backend via the modal.
  ═══════════════════════════════════════════════ */
  window.runPrediction = function() {
    if (typeof window.openPredModal === 'function') {
      window.openPredModal();
      return;
    }
    openModal();
  };

  window.simulateNewData = function() {
    buildRiskTable();
    scene3dData = gen3DData(400);
    drawAllSparklines();
    drawChurnForecast();
  };

  /* ── Init everything ── */
  function initAll() {
    if (!window.Chart) { setTimeout(initAll, 300); return; }
    chartDefaults();
    drawChurnForecast();
    drawSegmentChart();
    drawROC();
    drawRevenue('monthly');
    drawGeo();
    drawBalance();
    buildFeatures();
    buildRiskTable();
    buildModelTable();
    drawGauge(62);
    drawAllSparklines();
    init3DScene();
  }

  // Use IntersectionObserver to init on scroll
  const aiSection = document.getElementById('ai-engine');
  if (aiSection) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { initAll(); io.disconnect(); }
    }, { threshold: 0.05 });
    io.observe(aiSection);
  } else {
    setTimeout(initAll, 500);
  }

})(); /* end AI engine */


/* ═══════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════ */
/* ══ THEME TOGGLE — clean, bulletproof ══ */
(function() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    /* particle canvas: CSS handles opacity & hue-rotate via body.light class */
    if (window.Chart) {
      Chart.defaults.color        = isLight ? '#7ab8d4' : '#3a4a6b';
      Chart.defaults.borderColor  = isLight ? 'rgba(0,150,200,0.1)' : 'rgba(240,180,41,0.08)';
    }
    try { localStorage.setItem('bankiq-theme', isLight ? 'light' : 'dark'); } catch(e){}
  }

  // Restore on load
  var saved = '';
  try { saved = localStorage.getItem('bankiq-theme') || ''; } catch(e){}
  if (saved === 'light') applyTheme(true);

  // Toggle on click — use addEventListener, no onclick attribute
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isNowLight = !document.body.classList.contains('light');
    applyTheme(isNowLight);
  });
})();

function updateMoneyTheme(isLight) {
  const bills = document.querySelectorAll('.money-bill');
  bills.forEach(b => {
    b.style.filter = isLight
      ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.12)) sepia(0.2) brightness(0.95)'
      : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))';
  });
}

/* ═══════════════════════════════════════════════
   MONEY PARTICLE CANVAS ENHANCEMENT
═══════════════════════════════════════════════ */
(function() {
  // Enhance the existing particle canvas with money-colored nodes
  const originalDraw = window._particleDrawFn;

  // Add coin burst on click anywhere
  document.addEventListener('click', function(e) {
    const burst = document.createElement('div');
    burst.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      pointer-events:none;z-index:9997;
      font-size:20px;transform:translate(-50%,-50%);
      animation:coinburst 0.7s ease-out forwards;
    `;
    burst.textContent = ['💰','💵','🪙','💴','💶'][Math.floor(Math.random()*5)];
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 750);
  });

  // Inject coinburst keyframe
  if (!document.getElementById('coinburstStyle')) {
    const s = document.createElement('style');
    s.id = 'coinburstStyle';
    s.textContent = `
      @keyframes coinburst {
        0%   { transform:translate(-50%,-50%) scale(0.5); opacity:1; }
        50%  { transform:translate(-50%,-120%) scale(1.4); opacity:0.9; }
        100% { transform:translate(-50%,-200%) scale(0.8); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }

  // Floating $ counter near cursor
  let lastMoney = 0;
  document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastMoney < 600) return;
    if (Math.random() > 0.92) {
      lastMoney = now;
      const el = document.createElement('div');
      const signs = ['+$', '€', '£', '¥', '₿', '+%'];
      el.style.cssText = `
        position:fixed;left:${e.clientX + Math.random()*30 - 15}px;
        top:${e.clientY - 10}px;pointer-events:none;z-index:9997;
        font-family:'JetBrains Mono',monospace;font-size:11px;
        color:var(--gold);font-weight:600;letter-spacing:1px;
        animation:moneydrift 1.2s ease-out forwards;white-space:nowrap;
      `;
      el.textContent = signs[Math.floor(Math.random() * signs.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }
  });

  if (!document.getElementById('moneydriftStyle')) {
    const s = document.createElement('style');
    s.id = 'moneydriftStyle';
    s.textContent = `
      @keyframes moneydrift {
        0%   { transform:translateY(0) scale(1); opacity:0.9; }
        100% { transform:translateY(-50px) scale(0.7); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ═══════════════════════════════════════════════════════════
   DATASET EXPLORER — live data from Transformed.Bank
═══════════════════════════════════════════════════════════ */
(function () {
  const DEFAULT_PREVIEW_LIMIT = 200;
  const DATASET_ROWS_PER_PAGE = 10;
  let datasetColumns = [];
  let datasetRows = [];
  let currentPage = 1;

  function normalizeCellValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (Math.abs(value) >= 1000) return value.toLocaleString();
      return String(value);
    }
    return String(value);
  }

  function renderDatasetRows(columns, rows) {
    const headRow = document.getElementById('dataset-table-head-row');
    const tbody = document.getElementById('dataset-table-body');
    if (!headRow || !tbody) return;

    headRow.innerHTML = '';
    columns.forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column;
      headRow.appendChild(th);
    });

    tbody.innerHTML = '';
    if (!rows.length) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = Math.max(columns.length, 1);
      emptyCell.className = 'cell-empty';
      emptyCell.textContent = 'No rows found in table preview.';
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      columns.forEach((column) => {
        const td = document.createElement('td');
        const value = normalizeCellValue(row[column]);
        td.textContent = value;
        if (value === '—') td.classList.add('cell-empty');
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function getDatasetTotalPages() {
    return Math.max(1, Math.ceil(datasetRows.length / DATASET_ROWS_PER_PAGE));
  }

  function updateDatasetPager() {
    const pageInfo = document.getElementById('dataset-page-info');
    const prevBtn = document.getElementById('dataset-prev-page');
    const nextBtn = document.getElementById('dataset-next-page');
    const totalPages = getDatasetTotalPages();

    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  function renderCurrentDatasetPage() {
    const startIndex = (currentPage - 1) * DATASET_ROWS_PER_PAGE;
    const pageRows = datasetRows.slice(startIndex, startIndex + DATASET_ROWS_PER_PAGE);
    renderDatasetRows(datasetColumns, pageRows);
    updateDatasetPager();
  }

  function goToDatasetPage(page) {
    const totalPages = getDatasetTotalPages();
    currentPage = Math.min(Math.max(page, 1), totalPages);
    renderCurrentDatasetPage();
  }

  function bindDatasetPagerEvents() {
    const prevBtn = document.getElementById('dataset-prev-page');
    const nextBtn = document.getElementById('dataset-next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToDatasetPage(currentPage - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToDatasetPage(currentPage + 1);
      });
    }
  }

  function syncDatasetScrollSlider() {
    const tableScroll = document.getElementById('dataset-table-scroll');
    const slider = document.getElementById('dataset-scroll-slider');
    const scrollControl = document.getElementById('dataset-scroll-control');
    if (!tableScroll || !slider || !scrollControl) return;

    const maxScroll = Math.max(0, tableScroll.scrollWidth - tableScroll.clientWidth);
    const hasOverflow = maxScroll > 0;
    scrollControl.style.opacity = hasOverflow ? '1' : '0.75';
    slider.disabled = false;
    slider.max = String(Math.max(1, Math.round(maxScroll)));

    if (!hasOverflow) {
      slider.value = '0';
      tableScroll.scrollLeft = 0;
      return;
    }

    slider.value = String(Math.round(tableScroll.scrollLeft));
  }

  function bindDatasetScrollControl() {
    const tableScroll = document.getElementById('dataset-table-scroll');
    const slider = document.getElementById('dataset-scroll-slider');
    if (!tableScroll || !slider) return;

    let isDraggingSlider = false;

    function getMaxDatasetScroll() {
      return Math.max(0, tableScroll.scrollWidth - tableScroll.clientWidth);
    }

    function setTableScrollFromPointer(clientX) {
      const rect = slider.getBoundingClientRect();
      if (!rect.width) return;

      const relative = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const ratio = relative / rect.width;
      const maxScroll = getMaxDatasetScroll();
      tableScroll.scrollLeft = ratio * maxScroll;
      slider.value = String(Math.round(tableScroll.scrollLeft));
    }

    function onPointerMove(event) {
      if (!isDraggingSlider) return;
      setTableScrollFromPointer(event.clientX);
    }

    function onPointerUp() {
      if (!isDraggingSlider) return;
      isDraggingSlider = false;
      slider.classList.remove('dragging');
    }

    slider.addEventListener('input', function () {
      tableScroll.scrollLeft = Number(slider.value);
    });

    slider.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      isDraggingSlider = true;
      slider.classList.add('dragging');
      if (slider.setPointerCapture) {
        slider.setPointerCapture(event.pointerId);
      }
      setTableScrollFromPointer(event.clientX);
    });

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    slider.addEventListener('touchstart', function (event) {
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      event.preventDefault();
      isDraggingSlider = true;
      slider.classList.add('dragging');
      setTableScrollFromPointer(touch.clientX);
    }, { passive: false });

    window.addEventListener('touchmove', function (event) {
      if (!isDraggingSlider) return;
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      event.preventDefault();
      setTableScrollFromPointer(touch.clientX);
    }, { passive: false });

    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    tableScroll.addEventListener('scroll', function () {
      syncDatasetScrollSlider();
    });

    window.addEventListener('resize', function () {
      syncDatasetScrollSlider();
    });

    const innerTable = tableScroll.querySelector('table');
    if (window.ResizeObserver && innerTable) {
      const ro = new ResizeObserver(function () {
        syncDatasetScrollSlider();
      });
      ro.observe(tableScroll);
      ro.observe(innerTable);
    }

    // Run multiple passes in case layout/fonts settle after initial paint.
    requestAnimationFrame(syncDatasetScrollSlider);
    setTimeout(syncDatasetScrollSlider, 120);
    setTimeout(syncDatasetScrollSlider, 450);
  }

  async function loadDatasetExplorer(limit = DEFAULT_PREVIEW_LIMIT) {
    const badge = document.getElementById('dataset-table-badge');
    const loadedCount = document.getElementById('dataset-loaded-count');
    const pageInfo = document.getElementById('dataset-page-info');
    const tbody = document.getElementById('dataset-table-body');
    const prevBtn = document.getElementById('dataset-prev-page');
    const nextBtn = document.getElementById('dataset-next-page');

    if (!badge || !loadedCount || !pageInfo || !tbody) return;

    try {
      const response = await fetch(`/api/dataset/transformed-bank?limit=${limit}`);
      const payload = await response.json();

      if (!response.ok) {
        const detail = payload && payload.detail ? payload.detail : 'Unknown server error';
        throw new Error(String(detail));
      }

      const columns = Array.isArray(payload.columns) ? payload.columns : [];
      const rows = Array.isArray(payload.rows) ? payload.rows : [];

      datasetColumns = columns;
      datasetRows = rows;
      currentPage = 1;

      renderCurrentDatasetPage();
      requestAnimationFrame(syncDatasetScrollSlider);
      setTimeout(syncDatasetScrollSlider, 60);
      badge.textContent = 'LIVE DB';
      loadedCount.textContent = `${payload.preview_rows} records loaded from ${payload.table} · total ${payload.total_rows}`;
    } catch (error) {
      const headRow = document.getElementById('dataset-table-head-row');
      if (headRow) {
        headRow.innerHTML = '<th>Dataset Preview</th>';
      }
      tbody.innerHTML = '<tr><td class="cell-empty">Unable to load Transformed.Bank from cloud database.</td></tr>';
      badge.textContent = 'NO DATA';
      loadedCount.textContent = '0 records loaded · database connection unavailable';
      pageInfo.textContent = 'Page 1 of —';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      console.error('Dataset explorer load failed:', error);
    }
  }

  window.addEventListener('load', function () {
    bindDatasetPagerEvents();
    bindDatasetScrollControl();
    loadDatasetExplorer();
  });
})();

/* ═══════════════════════════════════════════════════════════
   PREDICTION ENGINE — MODAL (deprecated duplicate)
═══════════════════════════════════════════════════════════ */
(function () {
  // The active prediction panel is implemented in body.html.
  // Keeping this placeholder prevents duplicate listeners and execution.

})();