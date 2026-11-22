// «De Hartenvrouw» — Three.js колода из 5 RoundedBox-карт (CanvasTexture: лицо — корона+сердца, рубашка — гильош).
// index: скролл раскладывает веер → карта выезжает → переворот → встаёт (window.__spelP). afspraak: одна карта переворачивается на категорию (window.__deckOne).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C = { karton: '#F6EFEA', ink: '#1D1519', rood: '#B5172F', poeder: '#EED3D3' };
const W = 2.5, H = 3.5, TW = 512, TH = 716;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (p, a, b) => { const t = clamp((p - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function heart(x, cx, cy, s) {
  x.save(); x.translate(cx - 6 * s, cy - 5.5 * s); x.scale(s, s); x.beginPath();
  x.moveTo(0, 3.2); x.bezierCurveTo(0, 1.2, 1.5, 0, 3.1, 0); x.bezierCurveTo(4.3, 0, 5.3, .7, 6, 1.8); x.bezierCurveTo(6.7, .7, 7.7, 0, 8.9, 0);
  x.bezierCurveTo(10.5, 0, 12, 1.2, 12, 3.2); x.bezierCurveTo(12, 6.6, 7.6, 9.4, 6, 11); x.bezierCurveTo(4.4, 9.4, 0, 6.6, 0, 3.2); x.closePath(); x.fill(); x.restore();
}
function rr(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); }
function canvasTex(draw) {
  const c = document.createElement('canvas'); c.width = TW; c.height = TH; const x = c.getContext('2d'); draw(x);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.ctx = x; t.userData.draw = draw; return t;
}
function drawBack(x) {
  x.fillStyle = C.karton; x.fillRect(0, 0, TW, TH);
  x.fillStyle = C.rood; rr(x, 14, 14, TW - 28, TH - 28, 26); x.fill(); x.fillStyle = C.karton; rr(x, 24, 24, TW - 48, TH - 48, 20); x.fill();
  x.save(); x.beginPath(); x.roundRect(40, 40, TW - 80, TH - 80, 16); x.clip();
  x.fillStyle = '#E9B9BE'; x.fillRect(40, 40, TW - 80, TH - 80); x.strokeStyle = C.rood; x.lineWidth = 2.8;
  for (let k = 0; k < 24; k++) { x.save(); x.translate(TW / 2, TH / 2); x.rotate(k * Math.PI / 12); x.beginPath(); x.ellipse(0, 0, 210, 70, 0, 0, Math.PI * 2); x.stroke(); x.restore(); }
  for (let r = 236; r < 520; r += 18) { x.beginPath(); x.arc(TW / 2, TH / 2, r, 0, Math.PI * 2); x.stroke(); }
  x.restore();
  x.fillStyle = C.karton; x.beginPath(); x.arc(TW / 2, TH / 2, 46, 0, 7); x.fill(); x.strokeStyle = C.rood; x.lineWidth = 4; x.stroke(); x.fillStyle = C.rood; heart(x, TW / 2, TH / 2, 5);
}
function drawFace(label) {
  return x => {
    x.fillStyle = C.ink; rr(x, 0, 0, TW, TH, 30); x.fill(); x.fillStyle = '#FFFBF8'; rr(x, 8, 8, TW - 16, TH - 16, 24); x.fill();
    x.setLineDash([5, 7]); rr(x, 30, 30, TW - 60, TH - 60, 18); x.strokeStyle = C.rood; x.lineWidth = 2; x.stroke(); x.setLineDash([]);
    const corner = () => { x.fillStyle = C.rood; x.font = '700 64px Fraunces, serif'; x.textAlign = 'center'; x.fillText('Q', 74, 112); heart(x, 74, 146, 2.6); };
    corner(); x.save(); x.translate(TW, TH); x.rotate(Math.PI); corner(); x.restore();
    // кроон met harten als punten
    const cx = TW / 2, cy = label ? 300 : 360;
    x.fillStyle = C.ink; x.beginPath(); x.moveTo(cx - 92, cy + 70); x.lineTo(cx - 104, cy - 20); x.lineTo(cx - 48, cy + 22); x.lineTo(cx, cy - 46);
    x.lineTo(cx + 48, cy + 22); x.lineTo(cx + 104, cy - 20); x.lineTo(cx + 92, cy + 70); x.closePath(); x.fill();
    rr(x, cx - 92, cy + 80, 184, 16, 5); x.fill();
    x.fillStyle = C.rood; heart(x, cx - 104, cy - 44, 2.6); heart(x, cx, cy - 72, 2.6); heart(x, cx + 104, cy - 44, 2.6);
    x.textAlign = 'center';
    if (label) {
      x.fillStyle = C.ink; x.font = '600 50px Fraunces, serif';
      const words = label.split(' '); let lines = [], cur = '';
      words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > 380) { lines.push(cur); cur = w; } else cur = t; }); lines.push(cur);
      lines.forEach((l, i) => x.fillText(l, cx, 480 + i * 56));
      x.fillStyle = C.rood; x.font = '500 20px "IBM Plex Mono", monospace'; x.fillText('OP AANVRAAG', cx, 480 + lines.length * 56 + 20);
    } else { x.fillStyle = C.rood; x.font = 'italic 400 58px Fraunces, serif'; x.fillText('hartenvrouw', cx, 540); }
  };
}

async function mount(canvas) {
  const mode = canvas.dataset.deck;
  try { await Promise.all([document.fonts.load('600 50px Fraunces'), document.fonts.load('italic 400 58px Fraunces'), document.fonts.load('500 20px "IBM Plex Mono"')]); } catch (e) {}
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100); cam.position.set(0, mode === 'one' ? 0 : 0.6, mode === 'one' ? 7.8 : 13);
  scene.add(new THREE.AmbientLight(0xfff1ea, 1.1));
  const sun = new THREE.DirectionalLight(0xfff0dc, 1.4); sun.position.set(-6, 5, 7); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xf08a9a, 0.6); rim.position.set(5, -2, -4); scene.add(rim);

  const geo = new RoundedBoxGeometry(W, H, 0.03, 3, 0.16);
  const backTex = canvasTex(drawBack);
  const edge = new THREE.MeshStandardMaterial({ color: C.rood, roughness: .6 });
  const mat = map => new THREE.MeshPhysicalMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.45, roughness: .5, clearcoat: .7, clearcoatRoughness: .3 });
  const backMat = mat(backTex);
  const root = new THREE.Group(); scene.add(root);
  const n = mode === 'one' ? 1 : 5, cards = [];
  for (let i = 0; i < n; i++) {
    const faceTex = canvasTex(drawFace(mode === 'one' ? '' : (i === 2 ? '' : null)));
    const m = new THREE.Mesh(geo, [edge, edge, edge, edge, mat(faceTex), backMat]);
    m.position.y = H / 2; m.rotation.y = Math.PI;
    const pivot = new THREE.Group(); pivot.position.y = -H / 2; pivot.add(m); root.add(pivot);
    cards.push({ pivot, m, faceTex });
  }
  // мягкая тень под колодой
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sx = sc.getContext('2d');
  const gr = sx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(29,21,25,.6)'); gr.addColorStop(1, 'rgba(29,21,25,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(mode === 'one' ? 3.4 : 6, mode === 'one' ? 1.4 : 2.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.25; scene.add(shadow);

  // drag ±0.7 rad
  let drag = 0, dragT = 0, down = null;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, d: dragT }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (down) dragT = clamp(down.d + (e.clientX - down.x) * 0.006, -0.7, 0.7); });
  const up = () => { down = null; dragT = 0; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  const size = () => { const r = canvas.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height;
    cam.position.z = (mode === 'one' ? 7.8 : 13) * clamp((mode === 'one' ? 0.75 : 1.1) / cam.aspect, 1, 1.9); cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(canvas); size();

  // режим «one»: API для конфигуратора
  const one = { flip: 0, spin: 0 };
  if (mode === 'one') {
    window.__deckOne = (label, peek) => {
      const c = cards[0];
      if (label === 'done') { gsap.to(one, { spin: one.spin + Math.PI * 2, duration: 1.2, ease: 'power3.inOut' }); return; }
      if (label) { const x = c.faceTex.userData.ctx; drawFace(label)(x); c.faceTex.needsUpdate = true; }
      gsap.to(one, { flip: label ? 1 : 0, spin: one.spin + (label && !peek ? Math.PI * 2 : 0), duration: RM ? 0 : (peek ? 0.5 : 0.9), ease: peek ? 'power3.out' : 'back.out(1.4)', overwrite: true });
    };
  }

  let vis = true, cur = 0, t0 = performance.now();
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) loop(); }, { rootMargin: '100px' }).observe(canvas);
  function pose(p, t) {
    if (mode === 'one') {
      const c = cards[0]; c.pivot.rotation.set(0, 0, 0); c.pivot.position.set(0, -H / 2 + Math.sin(t * 1.2) * 0.06, 0);
      c.m.rotation.y = Math.PI * (1 - one.flip) + one.spin; root.rotation.set(0.08, -0.25 + Math.sin(t * .6) * .1 + drag, 0); return;
    }
    const a = seg(p, 0.02, 0.18), f = seg(p, 0.18, 0.36), u = seg(p, 0.38, 0.55), r = seg(p, 0.55, 0.72), s = seg(p, 0.74, 0.95);
    cards.forEach((c, i) => {
      const q = i === 2; const side = i < 2 ? -1 : (i > 2 ? 1 : (i % 2 ? 1 : -1));
      const riffle = Math.sin(a * Math.PI) * (q ? 0 : side) * (1.1 + 0.15 * i);
      const fan = (2 - i) * 0.26 * f * (1 - s * (q ? 1 : 0.85));
      let x = riffle + (2 - i) * -0.06 * f, y = -H / 2 + Math.sin(a * Math.PI) * 0.25 * (i % 2), z = (i - 2) * 0.045 + Math.sin(a * Math.PI) * (i % 2 ? .2 : -.2);
      let rz = fan, ry = Math.PI, sc = 1;
      if (q) { y += 1.7 * u - 0.7 * s; z += 0.5 * u + 0.8 * s; ry = Math.PI * (1 - r) + Math.sin(r * Math.PI) * 0.4; sc = 1 + 0.15 * s; }
      else { y -= 0.9 * s; z -= 0.8 * s; x *= 1 - 0.6 * s; }
      c.pivot.position.set(x, y, z); c.pivot.rotation.set(0, 0, rz); c.m.rotation.y = ry; c.pivot.scale.setScalar(sc);
    });
    root.rotation.set(0.12 - 0.08 * s, -0.45 + 0.3 * f + Math.sin(t * .5) * .05 + drag, 0);
  }
  function loop() {
    if (!vis) return; requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000; const target = window.__spelP || 0;
    cur += (target - cur) * (RM ? 1 : 0.12); drag += (dragT - drag) * 0.1;
    pose(cur, t); renderer.render(scene, cam);
  }
  loop();
}
document.querySelectorAll('canvas[data-deck]').forEach(c => mount(c).catch(e => console.warn('deck', e)));
