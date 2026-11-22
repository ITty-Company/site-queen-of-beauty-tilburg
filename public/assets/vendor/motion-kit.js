/* ITty motion-kit — готовые эффекты движения (GSAP 3.15 + ScrollTrigger + SplitText + Lenis + Three.js r170).
   Подключение (в <head> importmap, в конце body):
   <script src="assets/vendor/lenis.min.js"></script>
   <script src="assets/vendor/gsap/gsap.min.js"></script><script src="assets/vendor/gsap/ScrollTrigger.min.js"></script>
   <script src="assets/vendor/gsap/SplitText.min.js"></script><script src="assets/vendor/gsap/Flip.min.js"></script>
   <script type="module">import {MK} from './assets/vendor/motion-kit.js'; MK.init({three:true});</script>
   Разметка — data-атрибуты, см. references/MOTION_KIT.md. Всё уважает prefers-reduced-motion. */
const g = window.gsap, ST = window.ScrollTrigger;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const MK = {
  lenis: null,
  init(o = {}) {
    g.registerPlugin(...[ST, window.SplitText, window.Flip].filter(Boolean));
    if (!RM && window.Lenis) { const l = this.lenis = new Lenis({ lerp: 0.09 }); l.on('scroll', ST.update); g.ticker.add(t => l.raf(t * 1000)); g.ticker.lagSmoothing(0); }
    if (RM) { document.documentElement.classList.add('mk-rm'); return; }
    ['splitHeads', 'reveals', 'clips', 'parallax', 'horizontal', 'pinStack', 'counters', 'marquee', 'magnetic', 'tilt', 'cursor', 'bgShift', 'pageTransitions', 'scrubVideo'].forEach(f => { try { this[f](); } catch (e) { console.warn('MK', f, e); } });
    if (o.three) this.three3d().catch(e => console.warn('MK three', e));
    addEventListener('load', () => ST.refresh());
  },
  // [data-split="chars|words|lines"] — заголовок проявляется по буквам/словам/строкам
  splitHeads() { $$('[data-split]').forEach(el => { const t = el.dataset.split || 'words'; const s = new SplitText(el, { type: t === 'chars' ? 'chars,words' : t, mask: t === 'lines' ? 'lines' : undefined });
    g.from(s[t], { yPercent: 110, opacity: 0, rotate: t === 'chars' ? 8 : 0, duration: 0.9, ease: 'expo.out', stagger: t === 'chars' ? 0.025 : 0.07, scrollTrigger: { trigger: el, start: 'top 85%' } }); }); },
  // [data-reveal="up|fade|scale|left|right"] (+ data-stagger на родителе для детей)
  reveals() { const v = { up: { y: 60 }, fade: {}, scale: { scale: 0.86 }, left: { x: -80 }, right: { x: 80 } };
    $$('[data-reveal]').forEach(el => g.from(el.hasAttribute('data-stagger') ? el.children : el, { opacity: 0, ...(v[el.dataset.reveal] || v.up), duration: 1.1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 88%' } })); },
  // [data-clip] — картинка открывается шторкой (inset), с лёгким зумом
  clips() { $$('[data-clip]').forEach(el => { const img = el.querySelector('img,video') || el;
    g.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } }).fromTo(el, { clipPath: 'inset(18% 12% 18% 12% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.4, ease: 'expo.inOut' }).from(img, { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 0); }); },
  // [data-speed="0.3"] — параллакс (минус = против скролла)
  parallax() { $$('[data-speed]').forEach(el => g.to(el, { yPercent: -100 * +el.dataset.speed, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })); },
  // [data-horizontal] > .track — секция закрепляется, карточки едут вбок
  horizontal() { $$('[data-horizontal]').forEach(sec => { const tr = sec.querySelector('.track'); if (!tr) return;
    g.to(tr, { x: () => -(tr.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: sec, pin: true, scrub: 1, end: () => '+=' + (tr.scrollWidth - innerWidth), invalidateOnRefresh: true } }); }); },
  // [data-stack] > .card — карточки ложатся стопкой, предыдущая уменьшается
  pinStack() { $$('[data-stack]').forEach(w => { const c = $$('.card', w); c.forEach((el, i) => { if (i === c.length - 1) return;
    g.to(el, { scale: 0.9, opacity: 0.4, filter: 'blur(4px)', scrollTrigger: { trigger: c[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } }); ST.create({ trigger: el, start: 'top 12%', endTrigger: w, end: 'bottom bottom', pin: true, pinSpacing: false }); }); }); },
  // [data-count="250"] — счётчик (только реальные числа!)
  counters() { $$('[data-count]').forEach(el => { const o = { v: 0 }; g.to(o, { v: +el.dataset.count, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v) }); }); },
  // [data-marquee] — бегущая строка, ускоряется от скорости скролла
  marquee() { $$('[data-marquee]').forEach(el => { el.innerHTML += el.innerHTML; const tw = g.to(el, { xPercent: -50, repeat: -1, duration: +(el.dataset.marquee || 20), ease: 'none' });
    ST.create({ onUpdate: s => g.to(tw, { timeScale: 1 + Math.min(Math.abs(s.getVelocity()) / 300, 4), duration: 0.2, overwrite: true, onComplete: () => g.to(tw, { timeScale: 1, duration: 1 }) }) }); }); },
  // [data-magnetic] — кнопка тянется к курсору
  magnetic() { if (matchMedia('(hover:none)').matches) return; $$('[data-magnetic]').forEach(el => { const x = g.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1,0.4)' }), y = g.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1,0.4)' });
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35); }); el.addEventListener('mouseleave', () => { x(0); y(0); }); }); },
  // [data-tilt] — 3D-наклон карточки за курсором
  tilt() { if (matchMedia('(hover:none)').matches) return; $$('[data-tilt]').forEach(el => { el.style.transformStyle = 'preserve-3d'; el.parentElement.style.perspective = '900px';
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); g.to(el, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 14, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 14, duration: 0.6 }); });
    el.addEventListener('mouseleave', () => g.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' })); }); },
  // <div class="mk-cursor"></div> — мягкий курсор, растёт над [data-cursor]
  cursor() { const c = document.querySelector('.mk-cursor'); if (!c || matchMedia('(hover:none)').matches) return; const x = g.quickTo(c, 'x', { duration: 0.35 }), y = g.quickTo(c, 'y', { duration: 0.35 });
    addEventListener('mousemove', e => { x(e.clientX); y(e.clientY); }); $$('a,button,[data-cursor]').forEach(a => { a.addEventListener('mouseenter', () => g.to(c, { scale: 3, duration: 0.3 })); a.addEventListener('mouseleave', () => g.to(c, { scale: 1, duration: 0.3 })); }); },
  // section[data-bg="#hex"] — фон страницы плавно меняет цвет между главами
  bgShift() { $$('[data-bg]').forEach(s => ST.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: e => e.isActive && g.to('body', { backgroundColor: s.dataset.bg, color: s.dataset.fg || '', duration: 0.8 }) })); },
  // переход между страницами: шторка .mk-curtain (div в body) уезжает/заезжает
  pageTransitions() { const c = document.querySelector('.mk-curtain'); if (!c) return; g.to(c, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.1 });
    $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (!h || h.startsWith('#') || h.startsWith('http') || h.startsWith('tel') || h.startsWith('mailto') || a.target) return;
      a.addEventListener('click', e => { e.preventDefault(); g.fromTo(c, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut', onComplete: () => location.href = h }); }); }); },
  // video[data-scrub] внутри высокой секции — прокрутка управляет кадром (фильм LTX, -g 1)
  scrubVideo() { $$('video[data-scrub]').forEach(v => { v.pause(); const sec = v.closest('[data-scrub-wrap]') || v.parentElement;
    const go = () => ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => { if (v.duration) v.currentTime = s.progress * (v.duration - 0.05); } });
    v.readyState >= 1 ? go() : v.addEventListener('loadedmetadata', go, { once: true }); }); },
  // <canvas data-three="ring|blob|glass|particles" data-color="#c9a36b"> — 3D-объект, вращается от скролла и курсора
  async three3d() { const cs = $$('canvas[data-three]'); if (!cs.length) return; const T = await import('three'); const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    cs.forEach(cv => { const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.toneMapping = T.ACESFilmicToneMapping;
      const S = new T.Scene(), C = new T.PerspectiveCamera(35, 1, 0.1, 100); C.position.z = 6; S.environment = new T.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
      const col = new T.Color(cv.dataset.color || '#c9a36b'), k = cv.dataset.three; let m;
      if (k === 'particles') { const n = 2500, p = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) p[i] = (Math.random() - 0.5) * 8; const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(p, 3)); m = new T.Points(geo, new T.PointsMaterial({ color: col, size: 0.025, transparent: true, opacity: 0.8 })); }
      else { const geo = k === 'ring' ? new T.TorusGeometry(1.3, 0.42, 96, 200) : k === 'glass' ? new T.IcosahedronGeometry(1.5, 0) : new T.IcosahedronGeometry(1.5, 64);
        const mat = k === 'glass' ? new T.MeshPhysicalMaterial({ color: col, transmission: 1, roughness: 0.05, thickness: 1.2, ior: 1.5 }) : new T.MeshPhysicalMaterial({ color: col, metalness: 0.9, roughness: 0.18, clearcoat: 1 });
        m = new T.Mesh(geo, mat); if (k === 'blob') { m.userData.base = geo.attributes.position.array.slice(); } }
      S.add(m); const size = () => { const w = cv.clientWidth, h = cv.clientHeight; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
      const st = { r: 0 }; g.to(st, { r: Math.PI * 2, ease: 'none', scrollTrigger: { trigger: cv.closest('section') || cv, start: 'top bottom', end: 'bottom top', scrub: true } });
      const ms = { x: 0, y: 0 }; addEventListener('mousemove', e => { ms.x = e.clientX / innerWidth - 0.5; ms.y = e.clientY / innerHeight - 0.5; });
      let vis = true; new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
      R.setAnimationLoop(t => { if (!vis) return; m.rotation.y = st.r + t * 0.0002 + ms.x * 0.6; m.rotation.x = st.r * 0.4 + ms.y * 0.4;
        if (m.userData.base) { const a = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2], f = 1 + 0.08 * Math.sin(x * 2 + t * 0.0015) * Math.cos(y * 2 + t * 0.001); a.setXYZ(i, x * f, y * f, z * f); } a.needsUpdate = true; }
        R.render(S, C); }); }); },
};
