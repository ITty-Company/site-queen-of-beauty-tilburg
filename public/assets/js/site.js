// Queen of Beauty — «Hartenvrouw». Своё: скраб-фильмы (pin), Schudden, Kaartdraai, Waaier, конфигуратор. Остальное — motion-kit (data-атрибуты).
import { MK } from '../vendor/motion-kit.js';
const g = gsap, ST = ScrollTrigger;
g.registerPlugin(ST, ...[window.SplitText, window.Flip, window.ScrambleTextPlugin].filter(Boolean));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOB = matchMedia('(max-width:900px)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;

// ---------- видео: desktop/mobile источник
$$('video[data-src]').forEach(v => { v.src = MOB ? v.dataset.srcM : v.dataset.src; if (MOB && v.dataset.posterM) v.poster = v.dataset.posterM; v.load(); });
function scrubber(v) {
  let want = 0; const go = () => { if (!v.duration) return; const t = want * (v.duration - 0.05); if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t; };
  v.addEventListener('seeked', go); v.addEventListener('loadedmetadata', go);
  return p => { want = p; if (!v.seeking) go(); };
}

// ---------- переход «Kaartdraai»
const kd = $('.kd'), kc = $('.kd-card');
function arrive() {
  if (!root.classList.contains('kd-arrive')) return;
  try { sessionStorage.removeItem('kd'); } catch (e) {}
  if (RM) { root.classList.remove('kd-arrive'); return; }
  g.timeline({ onComplete: () => { root.classList.remove('kd-arrive'); g.set(kc, { clearProps: 'all' }); } })
    .to(kc, { yPercent: -118, rotate: 7, duration: 0.8, ease: 'power3.in', delay: 0.12 });
}
arrive();
addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('kd-arrive'); g.set(kd, { visibility: 'hidden' }); } });
$$('a[href]').forEach(a => {
  const h = a.getAttribute('href');
  if (!h || !/\.html(#.*)?$/.test(h) || a.target || /^https?:/.test(h)) return;
  a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || RM) return;
    e.preventDefault(); try { sessionStorage.setItem('kd', '1'); } catch (er) {}
    g.set(kd, { visibility: 'visible' });
    g.timeline({ onComplete: () => { location.href = h; } })
      .fromTo(kc, { yPercent: 118, rotate: -9, rotateY: 0 }, { yPercent: 0, rotate: 0, duration: 0.55, ease: 'power3.out' })
      .to(kc, { rotateY: 180, duration: 0.5, ease: 'power2.inOut' }, '-=0.05');
  });
});

// ---------- «Schudden»: строки/слова влетают слева и справа через одну + стук колоды
function riffle(el, delay = 0, trigger = true) {
  if (!window.SplitText) return;
  const s = new SplitText(el, { type: 'lines,words' });
  const parts = s.lines.length >= 3 ? s.lines : s.words;
  const tl = g.timeline({ paused: true, delay })
    .from(parts, { x: i => (i % 2 ? 1 : -1) * Math.min(innerWidth * 0.6, 700), opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.03 })
    .fromTo(el, { scaleY: 0.96, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.25, ease: 'power2.out' });
  if (trigger) ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => tl.play() }); else tl.play();
  return tl;
}

// ---------- шапка «Kaartrand»
let waaierOpen = false;
const top = $('[data-top]'), idx = $('[data-idx]');
let lastN = 1;
ST.create({ start: 0, end: 'max', onUpdate: s => {
  const y = s.scroll(); top.classList.toggle('solid', y > 40); top.classList.toggle('hide', s.direction === 1 && y > 300 && !waaierOpen);
  const n = Math.min(5, Math.floor(s.progress * 5) + 1);
  if (n !== lastN && idx) { lastN = n; g.to(idx, { duration: 0.5, scrambleText: { text: '0' + n, chars: '0123456789Q', speed: 0.6 } }); }
} });

// ---------- меню «Waaier»
const burger = $('.burger'), waaier = $('#waaier');
burger?.addEventListener('click', () => {
  waaierOpen = !waaierOpen; burger.setAttribute('aria-expanded', waaierOpen); burger.setAttribute('aria-label', waaierOpen ? 'Menu sluiten' : 'Menu openen');
  const cards = $$('.wcard', waaier);
  if (waaierOpen) { waaier.hidden = false; MK.lenis?.stop(); g.fromTo(cards, { y: 260, rotate: i => (i - 2) * 16, opacity: 0 }, { y: 0, rotate: i => (i % 2 ? 1.5 : -1.5), opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.05 }); cards[0]?.focus(); }
  else { MK.lenis?.start(); g.to(cards, { y: 200, rotate: 0, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in', onComplete: () => { waaier.hidden = true; } }); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && waaierOpen) burger.click(); });

// ---------- index 1: hero pin, 3 состояния + скраб c1
const hero = $('[data-hero]');
if (hero && !RM) {
  const sc = scrubber($('video', hero));
  const tl = g.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=200%', pin: true, scrub: 0.6, onUpdate: s => sc(s.progress) } });
  tl.to('.s1', { yPercent: -30, opacity: 0, duration: 1 }, 0.8)
    .fromTo('.s2', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.2)
    .from('.s2 .chips li', { x: i => (i % 2 ? 260 : -260), opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, 1.3)
    .to('.s2', { autoAlpha: 0, y: -60, duration: 0.8 }, 2.7)
    .fromTo('.s3', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 3.0)
    .to('.scrollhint', { autoAlpha: 0, duration: 0.3 }, 0.3)
    .to({}, { duration: 0.6 });
}
$$('.hero [data-riffle]').forEach(el => riffle(el, root.classList.contains('kd-arrive') ? 0.6 : 0.2, false));

// ---------- index 2: «Het spel» pin + скраб + 3D-колода
const spel = $('[data-spel]');
if (spel && !RM) {
  const sc = scrubber($('video', spel)); const steps = $$('.step', spel), pips = $$('.pip', spel), cnt = $('[data-scount]', spel); let cur = -1;
  const show = n => {
    if (n === cur) return; const dir = n > cur ? 1 : -1;
    if (cur >= 0) g.to(steps[cur], { autoAlpha: 0, x: -80 * dir, rotate: -4 * dir, duration: 0.35, ease: 'power2.in', overwrite: true });
    g.fromTo(steps[n], { autoAlpha: 0, x: 120 * dir, rotate: 5 * dir }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.55, ease: 'power3.out', delay: cur >= 0 ? 0.15 : 0, overwrite: true });
    pips.forEach((p, i) => p.classList.toggle('on', i === n));
    if (cnt) g.to(cnt, { duration: 0.45, scrambleText: { text: '0' + (n + 1), chars: '0123456789', speed: 0.7 } });
    cur = n;
  };
  show(0);
  ST.create({ trigger: spel, start: 'top top', end: '+=500%', pin: true, scrub: 0.5, onUpdate: s => { sc(s.progress); window.__spelP = s.progress; show(Math.min(4, Math.floor(s.progress * 5))); } });
}

// ---------- index 6: iris через зеркало + скраб c6
const iris = $('[data-iris]');
if (iris && !RM) {
  const sc = scrubber($('video', iris));
  g.timeline({ scrollTrigger: { trigger: iris, start: 'top top', end: '+=150%', pin: true, scrub: 0.6, onUpdate: s => sc(s.progress) } })
    .fromTo('.irisv', { clipPath: 'circle(17% at 50% 38%)' }, { clipPath: 'circle(85% at 50% 45%)', ease: 'power1.in', duration: 1 })
    .from('.iris h2', { y: 50, opacity: 0, duration: 0.3 }, 0.1)
    .from('.iris .h2b', { y: 40, opacity: 0, duration: 0.3 }, 0.35)
    .from('.iris .ctas', { y: 30, opacity: 0, duration: 0.3 }, 0.5);
}

// ---------- motion-kit: split, reveal, clip, speed, horizontal, stack, count, marquee, magnetic, tilt, cursor, bg, scrub
MK.init({ three: false });

// Schudden на заголовках разделов
$$('[data-riffle]').forEach(el => { if (!el.closest('.hero')) riffle(el); });

// ---------- over-ons: своя стопка (sticky + лёгкое уменьшение, без прозрачности/блюра)
$$('[data-pile]').forEach(w => { const cs = $$('.card', w); cs.forEach((c, i) => { if (i === cs.length - 1 || RM) return;
  g.to(c, { scale: 0.94, rotate: i % 2 ? 1.5 : -1.5, ease: 'none', scrollTrigger: { trigger: cs[i + 1], start: 'top 85%', end: 'top 20%', scrub: true } }); }); });

// ---------- word-by-word
$$('[data-words]').forEach(el => {
  if (!window.SplitText || RM) return;
  const s = new SplitText(el, { type: 'words', wordsClass: 'w' });
  g.to(s.words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 50%', scrub: true } });
});

// ---------- кинетика навстречу
$$('[data-k]').forEach(r => { const d = +r.dataset.k;
  g.fromTo(r, { xPercent: d > 0 ? -28 : 0 }, { xPercent: d > 0 ? 0 : -28, ease: 'none', scrollTrigger: { trigger: r.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }); });
if ($('.kinetic')) g.to('.krow .hp', { rotate: 360, ease: 'none', scrollTrigger: { trigger: '.kinetic', start: 'top bottom', end: 'bottom top', scrub: true } });

// ---------- блик на tilt-картах
$$('.vcard,.bcard').forEach(c => c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect();
  c.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%'); }));

// ---------- footer «Troef»: буквы QUEEN тасуются скроллом
if ($('.giant') && !RM) g.from('.giant .gl', { x: i => (i % 2 ? 1 : -1) * innerWidth * 0.5, rotate: i => (i % 2 ? 12 : -12), opacity: 0, ease: 'power3.out', stagger: 0.06,
  scrollTrigger: { trigger: '.troef', start: 'top 70%', end: 'bottom bottom', scrub: 0.8 } });

// ---------- behandelingen: раздача веером
const fan = $('[data-fan]');
if (fan && !RM) {
  const cs = $$('.fcard', fan);
  g.from(cs, { rotate: 0, y: 300, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09, delay: root.classList.contains('kd-arrive') ? 0.7 : 0.25 });
  g.to(cs, { rotate: i => (i - 2) * 19, ease: 'none', scrollTrigger: { trigger: '.bhero', start: 'top top', end: 'bottom top', scrub: true } });
}

// ---------- contact: карта-маска + эхо
const mc = $('[data-mapcard]');
if (mc && !RM) g.fromTo(mc, { clipPath: 'inset(42% 38% 42% 38% round 28px)', rotate: -12 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', rotate: -2, duration: 1.5, ease: 'expo.inOut', delay: 0.5 });
$$('.eline span').forEach((s, i) => { const k = i - 1; if (!k || RM) return;
  g.fromTo(s, { y: -70 * k, x: 50 * k }, { y: 70 * k, x: -50 * k, ease: 'none', scrollTrigger: { trigger: '.echo', start: 'top bottom', end: 'bottom top', scrub: true } }); });
if ($('.eline')) g.from('.eline span:nth-child(2)', { scale: 1.3, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.echo', start: 'top 70%' } });

// ---------- табло телефона
$$('[data-scramble]').forEach(el => { const run = () => g.to(el, { duration: 1.3, scrambleText: { text: el.dataset.scramble, chars: '0123456789+', speed: 0.5 } });
  ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: run }); el.addEventListener('mouseenter', run); });

// ---------- 404: карта переворачивается
const nf = $('[data-nf]'); if (nf) { nf.addEventListener('click', () => nf.classList.toggle('on')); setTimeout(() => nf.classList.add('on'), RM ? 0 : 1300); }

// ---------- afspraak: конфигуратор «Trek je kaart» (ничего не отправляет)
const cfg = $('[data-cfg]');
if (cfg) {
  const sts = $$('.st', cfg), tabs = $$('.tabs li', cfg), hand = $('[data-hand]'), cap = $('[data-cap]');
  const days = $('[data-days]'), wd = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'], mn = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const d0 = new Date();
  for (let i = 1; i <= 12; i++) { const d = new Date(d0); d.setDate(d0.getDate() + i); const lbl = `${wd[d.getDay()]} ${d.getDate()} ${mn[d.getMonth()]}`;
    days.insertAdjacentHTML('beforeend', `<label class="day"><input type="radio" name="dag" value="${lbl}"><span><small>${wd[d.getDay()]}</small>${d.getDate()} ${mn[d.getMonth()]}</span></label>`); }
  let step = 0;
  const go = n => { sts.forEach((s, i) => s.hidden = i !== n); tabs.forEach((t, i) => { t.classList.toggle('on', i === n); t.classList.toggle('ok', i < n); }); step = n;
    if (!RM) g.from(sts[n], { x: 60, opacity: 0, duration: 0.45, ease: 'power3.out' });
    if (n > 0 && innerWidth < 900) cfg.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  go(0);
  const val = name => (cfg.querySelector(`[name="${name}"]:checked`) || {}).value;
  const err = (n, m) => { $(`[data-err="${n}"]`, cfg).textContent = m || ''; return !m; };
  const check = n => {
    if (n === 0) return err(0, val('cat') ? '' : 'Kies een categorie.');
    if (n === 1) return err(1, val('dag') && val('deel') ? '' : (val('dag') ? 'Kies een dagdeel.' : 'Kies een dag.'));
    if (n === 2) { const nm = cfg.naam, tl = cfg.tel; nm.removeAttribute('aria-invalid'); tl.removeAttribute('aria-invalid');
      if (!nm.value.trim()) { nm.setAttribute('aria-invalid', 'true'); nm.focus(); return err(2, 'Vul je naam in.'); }
      if (!/^\+?[\d\s()-]{8,}$/.test(tl.value.trim())) { tl.setAttribute('aria-invalid', 'true'); tl.focus(); return err(2, 'Vul een telefoonnummer in.'); }
      return err(2, ''); }
    return true;
  };
  $$('[data-next]', cfg).forEach(b => b.addEventListener('click', () => { if (check(step)) go(step + 1); }));
  $$('[data-prev]', cfg).forEach(b => b.addEventListener('click', () => go(step - 1)));
  // выбор карты → Flip в «руку» + 3D-карта переворачивается
  const picked = () => { const c = cfg.querySelector('input[name="cat"]:checked'); return c ? c.dataset.label.replace('&amp;', '&') : null; };
  $$('.ccard', cfg).forEach(l => { const lb = l.querySelector('input').dataset.label.replace('&amp;', '&');
    l.addEventListener('mouseenter', () => { if (lb !== picked()) window.__deckOne?.(lb, true); });
    l.addEventListener('mouseleave', () => { if (lb !== picked()) window.__deckOne?.(picked(), true); }); });
  $$('input[name="cat"]', cfg).forEach(inp => inp.addEventListener('change', () => {
    const face = inp.nextElementSibling, label = inp.dataset.label.replace('&amp;', '&');
    face.dataset.flipId = 'pick'; const state = window.Flip ? Flip.getState(face) : null;
    const clone = inp.closest('.ccard').cloneNode(true); clone.querySelector('input').remove(); clone.querySelector('.cface').dataset.flipId = 'pick';
    hand.replaceChildren(clone); err(0, '');
    if (state && !RM) Flip.from(state, { targets: clone.querySelector('.cface'), duration: 0.6, ease: 'power3.out', absolute: true });
    delete face.dataset.flipId;
    if (cap) cap.innerHTML = cap.innerHTML.replace(/·.*$/, '· ' + label);
    window.__deckOne?.(label);
  }));
  cfg.addEventListener('submit', e => {
    e.preventDefault(); if (!check(2)) return;
    const cat = cfg.querySelector('input[name="cat"]:checked').dataset.label.replace('&amp;', '&'), dag = val('dag'), deel = val('deel'), nm = cfg.naam.value.trim();
    const sum = $('[data-sum]', cfg); sum.textContent = ''; const em = document.createElement('em'); em.textContent = cat; sum.append(em, `voorkeur: ${dag}, ${deel}`, document.createElement('br'), `op naam van ${nm}`);
    const msg = `Hallo Queen of Beauty! Ik wil graag een afspraak maken: ${cat}, voorkeur ${dag} (${deel}). Naam: ${nm}.`;
    $('[data-wa]', cfg).href = 'https://wa.me/31642486026?text=' + encodeURIComponent(msg);
    go(3); const fc = $('[data-flip]', cfg); fc.classList.remove('on'); setTimeout(() => fc.classList.add('on'), RM ? 0 : 350);
    window.__deckOne?.('done');
  });
  $('[data-again]', cfg).addEventListener('click', () => { cfg.reset(); hand.textContent = 'nog geen kaart'; $('[data-flip]', cfg).classList.remove('on'); window.__deckOne?.(null);
    if (cap) cap.innerHTML = cap.innerHTML.replace(/·.*$/, '· nog geen kaart'); go(0); });
}

ST.sort?.();
addEventListener('load', () => ST.refresh());
