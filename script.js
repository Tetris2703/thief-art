const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');
const cards = document.querySelectorAll('.reference-art');
cards.forEach((card, index) => {
  card.classList.add('reveal');
  card.style.setProperty('--delay', `${(index % 3) * 90}ms`);
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06, rootMargin: '0px 0px 35px 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
let scrollFrame = 0;
function updateProgress() {
  scrollFrame = 0;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
}
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  cards.forEach(card => {
    const surface = card.querySelector('.reference-image');
    card.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      surface.style.setProperty('--rx', `${(0.5 - y) * 3}deg`);
      surface.style.setProperty('--ry', `${(x - 0.5) * 3}deg`);
      surface.style.setProperty('--px', `${x * 100}%`);
      surface.style.setProperty('--py', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      surface.style.setProperty('--rx', '0deg');
      surface.style.setProperty('--ry', '0deg');
    });
  });
}

const strip = document.querySelector('#art-strip');
if (strip) {
  const previous = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const step = () => strip.querySelector('.reference-art').getBoundingClientRect().width + parseFloat(getComputedStyle(strip).gap);
  const move = direction => strip.scrollBy({left:direction * step(),behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  function refreshButtons() {
    previous.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2;
  }
  strip.addEventListener('scroll', refreshButtons, {passive:true});
  addEventListener('resize', refreshButtons);
  strip.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? strip.clientWidth : 1);
    const max = strip.scrollWidth - strip.clientWidth;
    if ((delta > 0 && strip.scrollLeft >= max - 2) || (delta < 0 && strip.scrollLeft <= 2)) return;
    event.preventDefault();
    strip.scrollBy({left:delta,behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  }, {passive:false});
  strip.addEventListener('keydown', event => {
    if (event.target !== strip) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  refreshButtons();
  addEventListener('load', refreshButtons, {once:true});
}
