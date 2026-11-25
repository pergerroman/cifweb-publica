(() => {
  const gallery = document.querySelector('.vac-gallery');
  if (!gallery || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const originals = [...gallery.children];
  originals.forEach(figure => {
    const copy = figure.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    gallery.append(copy);
  });

  const speed = 12; // Píxeles por segundo, hacia la izquierda visualmente.
  let previous = 0;
  let position = 0;
  let resumeAt = 0;
  let visible = true;

  const cycleWidth = () =>
    gallery.children[originals.length].offsetLeft - originals[0].offsetLeft;

  const reset = () => {
    const cycle = cycleWidth();
    position = cycle ? position % cycle : 0;
    gallery.scrollLeft = position;
  };

  const pauseAfterInteraction = () => {
    position = gallery.scrollLeft;
    resumeAt = performance.now() + 5000;
  };

  reset();
  addEventListener('resize', reset);
  ['pointerdown', 'wheel', 'keydown'].forEach(event =>
    gallery.addEventListener(event, pauseAfterInteraction, { passive: true })
  );

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previous = 0;
    }, { threshold: 0.05 }).observe(gallery);
  }

  function animate(now) {
    const delta = previous ? Math.min(now - previous, 50) : 0;
    previous = now;

    if (visible && now > resumeAt && !document.hidden) {
      const cycle = cycleWidth();
      position += delta * speed / 1000;
      if (position >= cycle) position -= cycle;
      gallery.scrollLeft = position;
    } else if (now <= resumeAt) {
      position = gallery.scrollLeft;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
