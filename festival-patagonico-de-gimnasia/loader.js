document.documentElement.classList.add("has-js");

const loader = document.querySelector("#fpg-loader");
const progressText = document.querySelector("#loader-progress");
const progressTrack = document.querySelector("#loader-track");
const skipButton = document.querySelector("#skip-loader");
const replayButton = document.querySelector("#replay-loader");
const heroSlides = [...document.querySelectorAll(".demo-hero__photo")];
const heroSlideshowToggle = document.querySelector("#hero-slideshow-toggle");
const heroNavLogo = document.querySelector(".demo-hero__nav-logo");
const backToTopButton = document.querySelector("#back-to-top");
const venueChapter = document.querySelector("#el-espacio");
const clubsChapter = document.querySelector("#clubes");
const clubsStage = clubsChapter?.querySelector(".clubs-chapter__stage");
const clubsTrack = document.querySelector("#clubs-track");
const clubCards = [...document.querySelectorAll(".club-card")];
const clubsProgressNumber = document.querySelector("#clubs-progress-number");
const clubsProgressBar = document.querySelector("#clubs-progress-bar");
const memoryTransition = document.querySelector(".memory-transition");
const memoryReveals = [...document.querySelectorAll(".memory-transition__reveal")];
const memoryLinks = document.querySelector(".memory-links");
const memoryCards = [...document.querySelectorAll(".memory-card")];
const sponsorsCard = document.querySelector(".paper-stat--sponsors");
const sponsorStripImages = [...document.querySelectorAll(".sponsor-strip")];
const shirtModel = document.querySelector("#fpg-shirt-model");
const cards = [...document.querySelectorAll(".photo-card")];
const images = cards.map((card) => card.querySelector("img"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const CLUBS_SCROLL_RATIO = 0.72;

let animationFrame = 0;
let heroSlideTimer = 0;
let heroSlideIndex = 0;
let heroSlidesPaused = false;
let venueAnimationFrame = 0;
let clubsAnimationFrame = 0;
let memoryTransitionAnimationFrame = 0;
let backToTopAnimationFrame = 0;
let clubsTravel = 0;
let skipTimer = 0;
let finishTimer = 0;
let revealTimer = 0;
let dockTimer = 0;
let hideTimer = 0;
let settledAssets = 0;
let runId = 0;

function clamp(value, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function renderBackToTop() {
  backToTopButton?.classList.toggle("is-visible", window.scrollY > 24);
}

function scheduleBackToTop() {
  window.cancelAnimationFrame(backToTopAnimationFrame);
  backToTopAnimationFrame = window.requestAnimationFrame(renderBackToTop);
}

function prepareSponsorRibbons() {
  if (!sponsorsCard || sponsorStripImages.length === 0) return;

  const imageSettlements = sponsorStripImages.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  });

  Promise.allSettled(imageSettlements).then(() => sponsorsCard?.classList.add("sponsors-ready"));
}

prepareSponsorRibbons();

function showHeroSlide(index) {
  if (heroSlides.length === 0) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === heroSlideIndex));
}

function stopHeroSlideshow({ reset = false } = {}) {
  window.clearInterval(heroSlideTimer);
  heroSlideTimer = 0;
  if (reset) showHeroSlide(0);
}

function startHeroSlideshow() {
  stopHeroSlideshow();
  if (reduceMotion.matches || heroSlidesPaused || heroSlides.length < 2) return;
  heroSlideTimer = window.setInterval(() => showHeroSlide(heroSlideIndex + 1), 3000);
}

function setHeroSlideshowPaused(paused) {
  heroSlidesPaused = paused;
  heroSlideshowToggle.setAttribute("aria-pressed", String(paused));
  heroSlideshowToggle.setAttribute("aria-label", paused ? "Reanudar fotos" : "Pausar fotos");
  heroSlideshowToggle.textContent = paused ? "▶" : "II";
  if (paused) stopHeroSlideshow();
  else startHeroSlideshow();
}

function renderVenueTransition() {
  if (!venueChapter) return;

  venueChapter.classList.add("is-scroll-driven");
  const rect = venueChapter.getBoundingClientRect();
  const revealProgress = reduceMotion.matches ? 1 : clamp((window.innerHeight - rect.top) / window.innerHeight);
  const copyProgress = reduceMotion.matches ? 1 : clamp((revealProgress - 0.52) / 0.32);

  venueChapter.style.setProperty("--venue-left", `${-112 * revealProgress}%`);
  venueChapter.style.setProperty("--venue-right", `${112 * revealProgress}%`);
  venueChapter.style.setProperty("--venue-copy-opacity", String(copyProgress));
  venueChapter.style.setProperty("--venue-copy-y", `${44 * (1 - copyProgress)}px`);
}

function scheduleVenueTransition() {
  window.cancelAnimationFrame(venueAnimationFrame);
  venueAnimationFrame = window.requestAnimationFrame(renderVenueTransition);
}

function renderClubsJourney() {
  if (!clubsChapter || !clubsStage || !clubsTrack || reduceMotion.matches) return;

  const rect = clubsChapter.getBoundingClientRect();
  const journeyLength = Math.max(1, clubsChapter.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / journeyLength);
  const currentX = clubsTravel * progress;

  clubsChapter.style.setProperty("--clubs-x", `${-currentX}px`);
  clubsProgressBar.style.transform = `scaleX(${progress})`;

  const viewportCenter = currentX + clubsStage.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  clubCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  clubsProgressNumber.textContent = String(closestIndex + 1).padStart(2, "0");
}

function measureClubsJourney() {
  if (!clubsChapter || !clubsStage || !clubsTrack) return;

  if (reduceMotion.matches) {
    clubsChapter.classList.remove("is-scroll-driven");
    clubsChapter.style.removeProperty("--clubs-section-height");
    clubsChapter.style.removeProperty("--clubs-x");
    return;
  }

  clubsChapter.classList.add("is-scroll-driven");
  clubsTravel = Math.max(0, clubsTrack.scrollWidth - clubsStage.clientWidth);
  clubsChapter.style.setProperty("--clubs-section-height", `${clubsTravel * CLUBS_SCROLL_RATIO + window.innerHeight}px`);
  renderClubsJourney();
}

function scheduleClubsJourney() {
  window.cancelAnimationFrame(clubsAnimationFrame);
  clubsAnimationFrame = window.requestAnimationFrame(renderClubsJourney);
}

function renderMemoryTransition() {
  if (!memoryTransition) return;

  if (reduceMotion.matches) {
    memoryTransition.classList.remove("is-scroll-driven");
    memoryTransition.style.removeProperty("--memory-title-opacity");
    memoryTransition.style.removeProperty("--memory-title-y");
    memoryTransition.style.removeProperty("--memory-intro-opacity");
    memoryTransition.style.removeProperty("--memory-links-opacity");
    memoryTransition.style.removeProperty("--memory-links-y");
    memoryLinks?.classList.add("is-active");
    if (memoryLinks) {
      memoryLinks.inert = false;
      memoryLinks.setAttribute("aria-hidden", "false");
    }
    memoryReveals.forEach((item) => {
      item.style.removeProperty("--reveal-opacity");
      item.style.removeProperty("--reveal-x");
      item.style.removeProperty("--reveal-y");
      item.style.removeProperty("--reveal-rotate");
      item.style.removeProperty("--reveal-scale");
    });
    memoryCards.forEach((card) => {
      card.style.removeProperty("--card-opacity");
      card.style.removeProperty("--card-x");
      card.style.removeProperty("--card-y");
      card.style.removeProperty("--card-reveal-rotate");
      card.style.removeProperty("--card-scale");
    });
    return;
  }

  memoryTransition.classList.add("is-scroll-driven");
  const rect = memoryTransition.getBoundingClientRect();
  const journeyLength = Math.max(1, memoryTransition.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / journeyLength);
  const titleProgress = clamp(progress / 0.08);
  const titleExit = clamp((progress - 0.06) / 0.07);
  const introExit = clamp((progress - 0.62) / 0.1);
  const titleOpacity = (0.25 + titleProgress * 0.75) * (1 - titleExit);
  const linksProgress = clamp((progress - 0.68) / 0.12);
  const linksEased = 1 - (1 - linksProgress) ** 3;

  memoryTransition.style.setProperty("--memory-title-opacity", String(titleOpacity));
  memoryTransition.style.setProperty("--memory-title-y", `${28 * (1 - titleProgress) - 24 * titleExit}px`);
  memoryTransition.style.setProperty("--memory-intro-opacity", String(1 - introExit));
  memoryTransition.style.setProperty("--memory-links-opacity", String(linksEased));
  memoryTransition.style.setProperty("--memory-links-y", `${28 * (1 - linksEased)}px`);
  const linksAreActive = progress >= 0.68;
  memoryLinks?.classList.toggle("is-active", linksAreActive);
  if (memoryLinks) {
    memoryLinks.inert = !linksAreActive;
    memoryLinks.setAttribute("aria-hidden", String(!linksAreActive));
  }

  memoryReveals.forEach((item) => {
    const start = Number(item.dataset.revealStart ?? 0);
    const end = Number(item.dataset.revealEnd ?? 1);
    const revealProgress = clamp((progress - start) / Math.max(0.01, end - start));
    const easedProgress = 1 - (1 - revealProgress) ** 3;
    const remaining = 1 - easedProgress;
    const hasExit = item.dataset.exitStart !== undefined;
    const exitStart = Number(item.dataset.exitStart ?? 1);
    const exitEnd = Number(item.dataset.exitEnd ?? 1);
    const exitProgress = hasExit ? clamp((progress - exitStart) / Math.max(0.01, exitEnd - exitStart)) : 0;
    const easedExit = exitProgress * exitProgress * (3 - 2 * exitProgress);
    const x = Number(item.dataset.revealX ?? 0);
    const y = Number(item.dataset.revealY ?? 0);
    const rotation = Number(item.dataset.revealRotate ?? 0);
    const exitX = Number(item.dataset.exitX ?? 0);
    const exitY = Number(item.dataset.exitY ?? 0);
    const exitRotation = Number(item.dataset.exitRotate ?? 0);

    item.style.setProperty("--reveal-opacity", String(easedProgress * (1 - easedExit)));
    item.style.setProperty("--reveal-x", `${x * remaining + exitX * easedExit}vw`);
    item.style.setProperty("--reveal-y", `${y * remaining + exitY * easedExit}vh`);
    item.style.setProperty("--reveal-rotate", `${rotation * remaining + exitRotation * easedExit}deg`);
    item.style.setProperty("--reveal-scale", String(0.78 + easedProgress * 0.22 - easedExit * 0.14));
  });

  memoryCards.forEach((card) => {
    const start = Number(card.dataset.cardStart ?? 0.72);
    const end = Number(card.dataset.cardEnd ?? 0.9);
    const cardProgress = clamp((progress - start) / Math.max(0.01, end - start));
    const easedProgress = 1 - (1 - cardProgress) ** 3;
    const remaining = 1 - easedProgress;
    const x = Number(card.dataset.cardX ?? 0);
    const y = Number(card.dataset.cardY ?? 0);
    const rotation = Number(card.dataset.cardRotate ?? 0);

    card.style.setProperty("--card-opacity", String(easedProgress));
    card.style.setProperty("--card-x", `${x * remaining}vw`);
    card.style.setProperty("--card-y", `${y * remaining}vh`);
    card.style.setProperty("--card-reveal-rotate", `${rotation * remaining}deg`);
    card.style.setProperty("--card-scale", String(0.78 + easedProgress * 0.22));
  });
}

function scheduleMemoryTransition() {
  window.cancelAnimationFrame(memoryTransitionAnimationFrame);
  memoryTransitionAnimationFrame = window.requestAnimationFrame(renderMemoryTransition);
}

function syncShirtMotionPreference() {
  shirtModel?.toggleAttribute("auto-rotate", !reduceMotion.matches);
}

function settleAsset() {
  settledAssets += 1;
}

function preloadImages() {
  settledAssets = 0;
  images.forEach((image) => {
    if (image.complete) {
      settleAsset();
      return;
    }
    image.addEventListener("load", settleAsset, { once: true });
    image.addEventListener("error", settleAsset, { once: true });
  });
}

function renderProgress(value) {
  const rounded = Math.max(0, Math.min(100, Math.round(value)));
  progressText.textContent = String(rounded).padStart(2, "0");
  progressTrack.style.width = `${rounded}%`;
  loader.setAttribute("aria-label", `Cargando el Festival Patagónico de Gimnasia: ${rounded}%`);

  const activeIndex = Math.min(cards.length - 1, Math.floor((rounded / 100) * cards.length));
  cards.forEach((card, index) => {
    card.style.zIndex = String(index + 1);
    card.classList.toggle("is-past", index < activeIndex);
    card.classList.toggle("is-current", index === activeIndex);
  });
}

function finish(currentRun) {
  if (currentRun !== runId || loader.classList.contains("is-finishing")) return;
  renderProgress(100);
  loader.classList.add("is-finishing");
  window.clearTimeout(skipTimer);

  if (reduceMotion.matches) {
    loader.classList.add("is-revealing", "is-docking");
    document.body.classList.add("hero-nav-ready");
    hideTimer = window.setTimeout(() => {
      if (currentRun !== runId) return;
      loader.hidden = true;
      document.body.classList.remove("loader-active");
      startHeroSlideshow();
      replayButton.focus({ preventScroll: true });
    }, 80);
    return;
  }

  finishTimer = window.setTimeout(() => {
    if (currentRun !== runId) return;
    loader.classList.add("is-revealing");
    revealTimer = window.setTimeout(() => {
      if (currentRun !== runId) return;
      loader.classList.add("is-holding");
      dockTimer = window.setTimeout(() => {
        if (currentRun !== runId) return;
        loader.classList.add("is-docking");
        hideTimer = window.setTimeout(() => {
          if (currentRun !== runId) return;
          document.body.classList.add("hero-nav-ready");
          loader.hidden = true;
          document.body.classList.remove("loader-active");
          startHeroSlideshow();
          replayButton.focus({ preventScroll: true });
        }, 780);
      }, 900);
    }, 400);
  }, 450);
}

function startLoader() {
  runId += 1;
  const currentRun = runId;
  const duration = reduceMotion.matches ? 420 : 3200;
  const startedAt = performance.now();

  window.cancelAnimationFrame(animationFrame);
  window.clearTimeout(skipTimer);
  window.clearTimeout(finishTimer);
  window.clearTimeout(revealTimer);
  window.clearTimeout(dockTimer);
  window.clearTimeout(hideTimer);
  stopHeroSlideshow({ reset: true });
  document.body.classList.add("logo-transition-ready");
  document.body.classList.remove("hero-nav-ready");
  document.body.classList.add("loader-active");
  loader.hidden = false;
  loader.classList.remove("is-finishing", "is-revealing", "is-holding", "is-docking", "can-skip");
  cards.forEach((card) => card.classList.remove("is-past", "is-current"));
  renderProgress(0);
  preloadImages();
  skipTimer = window.setTimeout(() => loader.classList.add("can-skip"), 900);

  function tick(now) {
    if (currentRun !== runId) return;
    const elapsedProgress = Math.min(100, ((now - startedAt) / duration) * 100);
    const assetProgress = images.length === 0 ? 100 : (settledAssets / images.length) * 100;
    renderProgress(Math.min(elapsedProgress, assetProgress));
    if (elapsedProgress >= 100 && assetProgress >= 100) {
      finish(currentRun);
      return;
    }
    animationFrame = window.requestAnimationFrame(tick);
  }
  animationFrame = window.requestAnimationFrame(tick);
}

skipButton.addEventListener("click", () => finish(runId));
replayButton.addEventListener("click", startLoader);
heroSlideshowToggle.addEventListener("click", () => setHeroSlideshowPaused(!heroSlidesPaused));
backToTopButton?.addEventListener("click", () => {
  heroNavLogo?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
});
clubsStage?.addEventListener("keydown", (event) => {
  if (!clubsChapter.classList.contains("is-scroll-driven") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  window.scrollBy({ top: direction * window.innerWidth * 0.65, behavior: reduceMotion.matches ? "auto" : "smooth" });
});
window.addEventListener("scroll", scheduleVenueTransition, { passive: true });
window.addEventListener("scroll", scheduleClubsJourney, { passive: true });
window.addEventListener("scroll", scheduleMemoryTransition, { passive: true });
window.addEventListener("scroll", scheduleBackToTop, { passive: true });
window.addEventListener("resize", () => {
  scheduleVenueTransition();
  measureClubsJourney();
  scheduleMemoryTransition();
});
reduceMotion.addEventListener("change", () => {
  startLoader();
  renderVenueTransition();
  measureClubsJourney();
  renderMemoryTransition();
  syncShirtMotionPreference();
});
renderVenueTransition();
renderMemoryTransition();
syncShirtMotionPreference();
renderBackToTop();
window.requestAnimationFrame(measureClubsJourney);
startLoader();
