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

  const speed = 48; // Píxeles por segundo, hacia la izquierda visualmente.
  let previous = 0;
  let position = 0;
  let resumeAt = 0;
  let visible = true;
  let cycle = 0;

  const measure = () => {
    cycle = gallery.children[originals.length].offsetLeft - originals[0].offsetLeft;
    position = cycle ? position % cycle : 0;
    gallery.scrollLeft = position;
  };

  const pauseAfterInteraction = () => {
    position = gallery.scrollLeft;
    resumeAt = performance.now() + 5000;
  };

  measure();
  addEventListener('resize', measure);
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

    if (visible && cycle > 0 && now > resumeAt && !document.hidden) {
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
