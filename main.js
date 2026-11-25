const track = document.querySelector('.slides');
const slides = [...track.children];
const dots = [...document.querySelectorAll('[data-slide]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Destinos internos relativos a la raíz pública de clubcif.com.
const destinations = {
  whatsapp: 'https://wa.me/5492996292249',
  vacaciones: './vacaciones/',
  campus: '',
  fpg: './festival-patagonico-de-gimnasia/',
};
document.querySelectorAll('[data-destination]').forEach(link => {
  const url = destinations[link.dataset.destination];
  if (url) {
    link.href = url;
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
  } else {
    link.title = 'Enlace pendiente de confirmar';
  }
});
let index = 0;
let playing = !reducedMotion.matches;
let timer;
function schedule() {
  clearInterval(timer);
  if (playing && !document.hidden) timer = setInterval(() => go(index + 1), 6000);
}
function go(next, announce = false) {
  index = (next + slides.length) % slides.length;
  track.scrollTo({ left: slides[index].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  if (announce) document.querySelector('#status').textContent = `Imagen ${index + 1} de ${slides.length}`;
  schedule();
}
function sync() {
  index = slides.reduce((nearest, slide, i) =>
    Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[nearest].offsetLeft - track.scrollLeft) ? i : nearest, 0);
  slides.forEach((slide, i) => {
    slide.inert = i !== index;
    slide.dataset.active = String(i === index);
  });
  dots.forEach((dot, i) => {
    if (i === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}
document.querySelector('#prev').addEventListener('click', () => go(index - 1, true));
document.querySelector('#next').addEventListener('click', () => go(index + 1, true));
dots.forEach(dot => dot.addEventListener('click', () => go(Number(dot.dataset.slide), true)));
track.addEventListener('scroll', sync, { passive: true });
track.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  go(index + (event.key === 'ArrowRight' ? 1 : -1), true);
});
track.addEventListener('pointerdown', () => { playing = false; schedule(); });
document.querySelector('.hero').addEventListener('focusin', () => { playing = false; schedule(); });
document.addEventListener('visibilitychange', schedule);
window.addEventListener('resize', () => track.scrollTo({ left: slides[index].offsetLeft, behavior: 'instant' }));
reducedMotion.addEventListener('change', () => { playing = false; schedule(); });
schedule();
sync();
