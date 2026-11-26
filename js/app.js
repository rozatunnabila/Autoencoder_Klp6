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

/* ---------- analisis otomatis: noise atau buram? ---------- */
function analyze() {
  const w = src.width, h = src.height, p = sctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g[i] = .299 * p[4 * i] + .587 * p[4 * i + 1] + .114 * p[4 * i + 2];
  let bad = 0, n = 0, s = 0, s2 = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const nb = [g[i - 1], g[i + 1], g[i - w], g[i + w], g[i - w - 1], g[i - w + 1], g[i + w - 1], g[i + w + 1]].sort((a, b) => a - b);
    if (Math.abs(g[i] - (nb[3] + nb[4]) / 2) > 70) bad++;      // piksel menyimpang jauh dari tetangganya = bintik
    const lap = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
    s += lap; s2 += lap * lap; n++;                             // variansi Laplacian = ukuran ketajaman
  }
  return { noise: bad / n, sharp: s2 / n - (s / n) ** 2 };
}

function recommend(pre = '') {
  const a = analyze(), noisy = a.noise > 0.01, blurry = a.sharp < 100;
  $('mode').value = noisy ? 'denoise' : 'sharpen';
  setStatus(pre + (noisy
    ? `Terdeteksi noise (${(a.noise * 100).toFixed(1)}% piksel). Disarankan: hilangkan noise.`
    : blurry ? 'Tidak ada noise, gambar tampak buram. Disarankan: perjelas gambar.'
             : 'Tidak ada noise dan gambar sudah cukup tajam. Kamu tetap bisa mempertajamnya lebih lanjut.')
    + ' Ganti mode bila perlu, lalu klik "Proses foto".');
}

/* ---------- model ---------- */
// skip=false : denoising autoencoder biasa. skip=true : autoencoder dengan skip connection yang memprediksi residual (untuk mempertajam).
function buildModel(skip) {
  const L = tf.layers, conv = (f, a = 'relu') => L.conv2d({ filters: f, kernelSize: 3, padding: 'same', activation: a });
  const i = tf.input({ shape: [null, null, 3] });
  const e1 = conv(16).apply(i);
  const e2 = conv(32).apply(L.maxPooling2d({ poolSize: 2 }).apply(e1));
  let x = conv(48).apply(L.maxPooling2d({ poolSize: 2 }).apply(e2));   // bottleneck
  x = conv(32).apply(L.upSampling2d({ size: [2, 2] }).apply(x));
  if (skip) x = L.concatenate().apply([x, e2]);
  x = conv(16).apply(L.upSampling2d({ size: [2, 2] }).apply(x));
  if (skip) x = L.concatenate().apply([x, e1]);
  x = skip ? L.conv2d({ filters: 3, kernelSize: 3, padding: 'same', kernelInitializer: 'zeros' }).apply(x)
           : conv(3, 'sigmoid').apply(x);
  return tf.model({ inputs: i, outputs: x });
}

// Kernel blur Gaussian 7x7 (sigma = tingkat blur tambahan yang harus dipelajari untuk dibalik)
function gaussKernel(sigma) {
  const k = []; let t = 0;
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const v = Math.exp(-(x * x + y * y) / (2 * sigma * sigma)); k.push(v); t += v; }
  return tf.tensor4d(k.map(v => v / t), [7, 7, 1, 1]).tile([1, 1, 3, 1]);
}

$('go').onclick = async () => {
  const btn = $('go'); btn.disabled = true; $('dl').disabled = true;
  const sharpen = $('mode').value === 'sharpen', alpha = +$('alpha').value;
  const steps = +$('steps').value, B = 16, H = src.height, W = src.width, ps = Math.min(64, H, W);
  let K = null;
  try {
    await tf.ready();
    const img = tf.tidy(() => tf.browser.fromPixels(src).toFloat().div(255));
    const model = buildModel(sharpen), opt = tf.train.adam(sharpen ? 0.002 : 0.003);
    if (sharpen) K = gaussKernel(1.3);
    for (let s = 1; s <= steps; s++) {
      const loss = tf.tidy(() => {
        const tgt = tf.stack(Array.from({ length: B }, () => {
          const y = Math.floor(Math.random() * (H - ps + 1)), x = Math.floor(Math.random() * (W - ps + 1));
          return img.slice([y, x, 0], [ps, ps, 3]);
        }));
        let inp;
        if (sharpen) {            // input = potongan foto yang di-blur lagi + noise halus, target = potongan foto itu sendiri
          const bl = tf.depthwiseConv2d(tf.mirrorPad(tgt, [[0, 0], [3, 3], [3, 3], [0, 0]], 'reflect'), K, 1, 'valid');
          // noise halus ditambahkan ke input (target tetap bersih) supaya model belajar mempertajam tanpa memperkuat noise
          inp = bl.add(tf.randomNormal([B, ps, ps, 3], 0, Math.random() * 0.04));
        } else {                  // input = potongan foto yang diberi bintik tambahan, target = potongan itu sendiri
          const m = tf.randomUniform([B, ps, ps, 1]).less(0.06).cast('float32');
          const nv = tf.randomUniform([B, ps, ps, 1]).round();
          inp = tgt.mul(tf.scalar(1).sub(m)).add(m.mul(nv));
        }
        const fwd = () => { const o = model.apply(inp, { training: true }); return sharpen ? inp.add(o).clipByValue(0, 1) : o; };
        return opt.minimize(() => tf.losses.absoluteDifference(tgt, fwd()), true);
      });
      if (s % 10 === 0) {
        const l = (await loss.data())[0];
        $('prog').style.width = (s / steps * 100) + '%';
        setStatus(`Melatih autoencoder (${sharpen ? 'perjelas' : 'hilangkan noise'}): langkah ${s} dari ${steps}, loss ${l.toFixed(4)}`);
        await tf.nextFrame();
      }
      loss.dispose();
    }
    const res = tf.tidy(() => {
      const x = img.expandDims(0), o = model.predict(x);
      return (sharpen ? x.add(o.mul(alpha)) : o).squeeze().clipByValue(0, 1);
    });
    await tf.browser.toPixels(res, out);
    res.dispose(); img.dispose(); model.dispose(); opt.dispose(); if (K) K.dispose();
    $('prog').style.width = '100%'; $('dl').disabled = false;
    setStatus('Selesai. Geser penanda di gambar untuk membandingkan.' + (sharpen ? ' Naikkan "Kekuatan perjelas" atau langkah latih bila ingin lebih tajam.' : ' Tambah langkah latih untuk hasil lebih tajam.'));
  } catch (e) { setStatus('Terjadi kesalahan: ' + e.message); }
  btn.disabled = false;
};

$('dl').onclick = () => {
  const a = document.createElement('a'); a.href = out.toDataURL('image/png'); a.download = 'jernih-hasil.png'; a.click();
};
