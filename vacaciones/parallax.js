(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const opening = document.querySelector('.vac-opening');
  const location = document.querySelector('.vac-location-section');
  const decorations = [...document.querySelectorAll('.vac-cloud,.vac-sun,.vac-ring,.vac-schedule-flower,.vac-info-cloud')];
  let pending = false;
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
  function draw() {
    pending = false;
    const reduced = preference.matches;
    const mobile = innerWidth <= 700;
    const scale = 1;
    const cover = opening.querySelector('.vac-cover');
    const brand = cover.querySelector('h1');
    // La nube acompa?a al logo, independientemente del alto del bot?n.
    opening.style.setProperty('--opening-cloud-top', (cover.offsetTop + brand.offsetHeight * 0.62) + 'px');
    const offset = element => {
      const bounds = element.getBoundingClientRect();
      return innerHeight * 0.5 - (bounds.top + bounds.height * 0.5);
    };
    opening.style.setProperty('--landscape-shift', `${reduced ? 0 : clamp(scrollY * 0.14, 110) * scale}px`);
    location.style.setProperty('--landscape-shift', `${reduced ? 0 : clamp(offset(location) * 0.14, 90) * scale}px`);
    decorations.forEach(element => {
      // Remove the previous translation to measure each decoration's stationary anchor.
      const previous = parseFloat(element.style.getPropertyValue('--float-shift')) || 0;
      const bounds = element.getBoundingClientRect();
      const center = bounds.top - previous + bounds.height / 2;
      const distance = innerHeight / 2 - center;
      const flower = element.classList.contains('vac-schedule-flower');
      const ring = element.classList.contains('vac-ring');
      const cloud = element.classList.contains('vac-info-cloud');
      const inOpening = element.parentElement === opening;
      const limit = flower ? 8 : ring ? 65 : cloud ? 65 : mobile ? 30 : 100;
      // Opening decorations travel down only, within the reserved space above the logo.
      const movement = inOpening
        ? Math.max(0, clamp(scrollY * 0.18, limit))
        : clamp(distance * 0.24, limit);
      element.style.setProperty('--float-shift', `${reduced ? 0 : movement}px`);
    });
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(draw); }
  }
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', schedule, { passive:true });
  addEventListener('load', schedule);
  preference.addEventListener('change', schedule);
  draw();
})();
