const $ = id => document.getElementById(id);

/* ---------- navbar ---------- */
const nav = $('nav'), menu = $('menu'), burger = $('burger');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
burger.onclick = () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
};
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open'); burger.setAttribute('aria-expanded', false);
}));

/* ---------- hero: bintik dekoratif di sisi "sebelum" ---------- */
(() => {
  const g = $('specks'), ns = 'http://www.w3.org/2000/svg';
  const cols = ['#2c2b15', '#FCF5E8'];
  for (let i = 0; i < 170; i++) {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', (Math.random() * 240).toFixed(1));
    c.setAttribute('cy', (Math.random() * 520).toFixed(1));
    c.setAttribute('r', (1 + Math.random() * 2.2).toFixed(1));
    c.setAttribute('fill', cols[Math.random() < .55 ? 0 : 1]);
    g.appendChild(c);
  }
})();

/* ---------- studio ---------- */
const src = $('src'), out = $('out'), stage = $('stage');
const sctx = src.getContext('2d', { willReadFrequently: true }), octx = out.getContext('2d');
const setStatus = t => $('status').textContent = t;

$('steps').oninput = e => $('sv').textContent = e.target.value;
$('alpha').oninput = e => $('av').textContent = (+e.target.value).toFixed(1);
$('cmp').oninput = e => {
  const v = e.target.value;
  out.style.clipPath = `inset(0 0 0 ${v}%)`;
  $('divider').style.left = v + '%';
};

function loadImage(img) {
  const m = 768, s = Math.min(1, m / Math.max(img.width, img.height));
  const w = Math.max(8, Math.round(img.width * s / 4) * 4), h = Math.max(8, Math.round(img.height * s / 4) * 4);
  src.width = out.width = w; src.height = out.height = h;
  sctx.drawImage(img, 0, 0, w, h); octx.clearRect(0, 0, w, h);
  $('go').disabled = false; $('dl').disabled = true; $('prog').style.width = '0';
  recommend(`Foto dimuat (${w} x ${h}). `);
}

$('file').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(); img.onload = () => loadImage(img); img.src = URL.createObjectURL(f);
};

$('demo').onclick = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 192; const x = c.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#CDA96A'); g.addColorStop(1, '#FCF5E8');
  x.fillStyle = g; x.fillRect(0, 0, 256, 192);
  x.fillStyle = '#BC6F37'; x.beginPath(); x.arc(185, 62, 34, 0, 7); x.fill();
  x.fillStyle = '#8E8946'; x.beginPath(); x.moveTo(0, 130); x.quadraticCurveTo(70, 70, 140, 125); x.quadraticCurveTo(200, 100, 256, 130); x.lineTo(256, 192); x.lineTo(0, 192); x.fill();
  x.fillStyle = '#6B6A30'; x.beginPath(); x.moveTo(0, 165); x.quadraticCurveTo(90, 120, 180, 160); x.quadraticCurveTo(220, 150, 256, 165); x.lineTo(256, 192); x.lineTo(0, 192); x.fill();
  x.strokeStyle = '#FCF5E8'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 105); x.bezierCurveTo(80, 90, 120, 150, 256, 140); x.stroke();
  const img = new Image(); img.onload = () => { loadImage(img); speckle(); }; img.src = c.toDataURL();
};

function speckle() {
  const d = sctx.getImageData(0, 0, src.width, src.height), p = d.data, q = $('dens').value / 100;
  for (let i = 0; i < p.length; i += 4) if (Math.random() < q) { const v = Math.random() < .5 ? 0 : 255; p[i] = p[i + 1] = p[i + 2] = v; }
  sctx.putImageData(d, 0, 0); recommend('Bintik ditambahkan. ');
}
$('speck').onclick = () => { if (!$('go').disabled) speckle(); };
