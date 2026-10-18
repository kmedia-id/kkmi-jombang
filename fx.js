/* Efek tampilan v2 - dimuat setelah script utama di index.html */
(() => {
  const q = s => document.querySelector(s);
  const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const pal = ['#4f46e5', '#ff3d81', '#00b8a0', '#ffa400', '#2d7bff'];

  // gelembung melayang (motif lembar jawab) di hero
  if (!rm) for (let i = 0; i < 16; i++) {
    const b = document.createElement('i'), s = 16 + Math.random() * 48;
    b.className = 'fb' + (i % 3 ? '' : ' fill');
    b.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;animation-duration:${9 + Math.random() * 12}s;animation-delay:-${Math.random() * 14}s`;
    q('header').appendChild(b);
  }

  // angka naik
  const count = el => {
    const m = el.textContent.match(/^(\D*)(\d+)(\D*)$/);
    if (!m || rm) return;
    const to = +m[2], t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / 1000, 1);
      el.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - p, 3))) + m[3];
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // bar tumbuh dari 0
  const bars = () => rm || document.querySelectorAll('.pane.on .bar i').forEach((i, n) => {
    const w = i.style.width; i.style.width = '0';
    setTimeout(() => i.style.width = w, 120 + n * 70);
  });

  // pendaftar terbaru
  const latest = () => {
    const g = q('#p-beranda .g2');
    if (!g || !D.peserta.length) return;
    g.insertAdjacentHTML('afterbegin', `<div class="card"><h3>Pendaftar terbaru</h3>${D.peserta.slice(-5).reverse().map((p, i) =>
      `<div class="who"><b style="background:${pal[i % 5]}">${esc(p.Nama.trim().charAt(0).toUpperCase())}</b><div><div>${esc(p.Nama)}</div><small>${esc(p['Madrasah Asal'])} - ${esc(p.Jabatan)}</small></div></div>`).join('')}</div>`);
  };

  // hitung mundur pendaftaran (hanya mode "Ikuti jadwal")
  let cd;
  const clock = () => {
    clearInterval(cd);
    const c = D.config, t = D.open.daftar ? c.daftar_tutup : c.daftar_buka;
    const tg = t && c.daftar_mode === 'auto' ? new Date(t + ':00+07:00').getTime() : 0;
    if (!tg || tg <= Date.now()) return;
    q('#chips').insertAdjacentHTML('beforeend', '<span class="chip cd" id="cd"></span>');
    const el = q('#cd'), lab = D.open.daftar ? 'Pendaftaran ditutup dalam ' : 'Pendaftaran dibuka dalam ';
    const tick = () => {
      const s = Math.floor((tg - Date.now()) / 1e3);
      if (s <= 0) { clearInterval(cd); return load(); }
      el.textContent = lab + `${Math.floor(s / 86400)} hari ${Math.floor(s % 86400 / 3600)} jam ${Math.floor(s % 3600 / 60)} mnt ${s % 60} dtk`;
    };
    tick(); cd = setInterval(tick, 1000);
  };

  // konfeti saat berhasil
  const burst = () => {
    for (let i = 0; i < 48; i++) {
      const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
      p.className = 'cf';
      p.style.cssText = `background:${pal[i % 5]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 120}px;--r:${Math.random() * 720}deg`;
      document.body.appendChild(p); setTimeout(() => p.remove(), 1400);
    }
  };
  if (!rm) new MutationObserver(ms => ms.forEach(m => {
    const t = m.target;
    if (t.classList.contains('msg') && t.classList.contains('k') && m.oldValue !== t.className) burst();
  })).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true, attributeOldValue: true });

  // sambungkan ke render() milik index.html
  const base = render;
  render = function () {
    base();
    if (!D) return;
    clock();
    if (tab === 'beranda') latest();
    document.querySelectorAll('.stat b,.donut div').forEach(count);
    bars();
  };
})();
