(() => {
  const SLIDE_SELECTOR = ".fs-slide";
  const INNER_SCROLL_SELECTOR = ".fs-inner-scroll, [data-fs-inner-scroll='true']";

  const WHEEL_LOCK_MS = 900;
  const TOUCH_THRESHOLD_PX = 35;

  const state = {
    slides: [],
    index: 0,
    lastWheelTs: 0,
    isAnimating: false,
    touchStartY: null,
    scrollRaf: 0,
  };

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const getScrollY = () =>
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    0;

  const getSlideTop = (el) => el.getBoundingClientRect().top + getScrollY();

  function getNearestSlideIndex() {
    const y = getScrollY();
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < state.slides.length; i++) {
      const top = getSlideTop(state.slides[i]);
      const dist = Math.abs(top - y);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function isScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (!(overflowY === "auto" || overflowY === "scroll")) return false;
    return el.scrollHeight > el.clientHeight + 1;
  }

  function findInnerScrollContainer(startEl) {
    let el = startEl;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.matches && el.matches(INNER_SCROLL_SELECTOR) && isScrollable(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function innerCanScroll(container, direction) {
    if (!container) return false;
    if (direction > 0) {
      return container.scrollTop + container.clientHeight < container.scrollHeight - 1;
    }
    return container.scrollTop > 0;
  }

  function scrollToSlide(index) {
    if (!state.slides.length) return;

    const next = clamp(index, 0, state.slides.length - 1);
    state.index = next;

    const top = getSlideTop(state.slides[next]);
    const behavior = prefersReducedMotion() ? "auto" : "smooth";

    state.isAnimating = true;
    window.scrollTo({ top, behavior });

    window.setTimeout(() => {
      state.isAnimating = false;
    }, prefersReducedMotion() ? 0 : 650);
  }

  function onWheel(e) {
    if (e.ctrlKey) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const inner = findInnerScrollContainer(e.target);
    if (inner && innerCanScroll(inner, direction)) return;

    if (!state.slides.length) return;

    const now = Date.now();
    if (state.isAnimating || now - state.lastWheelTs < WHEEL_LOCK_MS) {
      e.preventDefault();
      return;
    }

    state.lastWheelTs = now;
    e.preventDefault();

    scrollToSlide(state.index + direction);
  }

  function onKeyDown(e) {
    if (!state.slides.length) return;

    const tag = (e.target && e.target.tagName || "").toLowerCase();
    const isTypingField =
      tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if (isTypingField) return;

    let direction = 0;

    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") direction = 1;
    if (e.key === "ArrowUp" || e.key === "PageUp") direction = -1;

    if (e.key === "Home") {
      e.preventDefault();
      scrollToSlide(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      scrollToSlide(state.slides.length - 1);
      return;
    }

    if (direction !== 0) {
      e.preventDefault();
      scrollToSlide(state.index + direction);
    }
  }

  function onTouchStart(e) {
    if (!state.slides.length) return;
    if (!e.touches || e.touches.length !== 1) return;
    state.touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (!state.slides.length) return;
    if (state.touchStartY == null) return;

    const endY = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY) ?? null;
    if (endY == null) {
      state.touchStartY = null;
      return;
    }

    const dy = state.touchStartY - endY;
    state.touchStartY = null;

    if (Math.abs(dy) < TOUCH_THRESHOLD_PX) return;

    const direction = dy > 0 ? 1 : -1;

    const inner = findInnerScrollContainer(e.target);
    if (inner && innerCanScroll(inner, direction)) return;

    scrollToSlide(state.index + direction);
  }

  function onScroll() {
    if (state.scrollRaf) return;
    state.scrollRaf = window.requestAnimationFrame(() => {
      state.scrollRaf = 0;
      if (state.slides.length) {
        state.index = getNearestSlideIndex();
      }
    });
  }

  function init() {
    state.slides = Array.from(document.querySelectorAll(SLIDE_SELECTOR));
    if (!state.slides.length) return;

    state.index = getNearestSlideIndex();

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        const slide = target.closest(SLIDE_SELECTOR);
        if (slide) {
          const idx = state.slides.indexOf(slide);
          if (idx >= 0) scrollToSlide(idx);
        }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();