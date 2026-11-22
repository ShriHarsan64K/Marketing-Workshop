// Menu drawer
const mb = document.getElementById('mb'), dr = document.getElementById('dr'), vl = document.getElementById('vl');
function tog(open) {
  dr.classList.toggle('open', open); vl.classList.toggle('open', open); mb.setAttribute('aria-expanded', open);
  if (open) dr.querySelector('a').focus(); else if (document.activeElement && dr.contains(document.activeElement)) mb.focus();
}
mb.onclick = () => tog(!dr.classList.contains('open'));
vl.onclick = () => tog(false);
document.addEventListener('keydown', e => e.key === 'Escape' && tog(false));
dr.querySelectorAll('a').forEach(a => a.addEventListener('click', () => tog(false)));

// Home slideshow (pauses on hover, keyboard focus, or the Pause button)
const hero = document.getElementById('hero');
if (hero) {
  const slides = [...hero.querySelectorAll('.sl')], dots = [...hero.querySelectorAll('.dots [data-i]')], pp = document.getElementById('pp');
  let i = 0, timer = null, paused = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-current', k === i); });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
  document.getElementById('pv').onclick = () => show(i - 1);
  document.getElementById('nx').onclick = () => show(i + 1);
  dots.forEach(d => d.onclick = () => show(+d.dataset.i));
  pp.textContent = paused ? 'Play' : 'Pause';
  pp.onclick = () => { paused = !paused; pp.textContent = paused ? 'Play' : 'Pause'; paused ? stop() : start(); };
  hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop); hero.addEventListener('focusout', start);
  start();
}
