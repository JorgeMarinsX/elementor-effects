(() => {
  const STACK_SELECTOR = ".fx-fade-stack";
  const PANEL_SELECTOR = ".fx-fade-panel";

  const WHEEL_LOCK_MS = 750;     // 1 transition per gesture
  const TOUCH_THRESHOLD_PX = 35; // swipe sensitivity

  let activeStack = null;
  let panels = [];
  let index = 0;

  let lastWheelTs = 0;
  let isTransitioning = false;

  let lockedScrollY = 0;
  let touchStartY = null;
  let stackTopCache = 0;
  let stackHeightCache = 0;
  let exitCooldownUntil = 0; // prevent re-activation immediately after exit

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function getScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function disableScrollSnap() {
    // Disable scroll-snap on html (multiple property names for browser compat)
    document.documentElement.style.scrollSnapType = "none";
    document.documentElement.style.setProperty("scroll-snap-type", "none", "important");
    // Also remove the behavior from body just in case
    document.body.style.scrollSnapType = "none";
  }

  function enableScrollSnap() {
    // Re-enable by removing inline style (lets CSS take over again)
    document.documentElement.style.scrollSnapType = "";
    document.documentElement.style.removeProperty("scroll-snap-type");
    document.body.style.scrollSnapType = "";
  }

  function lockScroll() {
    lockedScrollY = getScrollY();
    document.documentElement.classList.add("fx-scroll-locked");

    // Disable scroll-snap while overlap-fade is active (prevents fighting with CSS snap)
    disableScrollSnap();

    // "freeze" body without jumping
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockAndJumpTo(targetY) {
    // IMPORTANT: Ensure scroll-snap is disabled BEFORE unlocking
    disableScrollSnap();

    // Remove fixed positioning from body
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.documentElement.classList.remove("fx-scroll-locked");

    // Use requestAnimationFrame to let the browser "settle" before scrolling
    requestAnimationFrame(() => {
      // Try multiple scroll methods
      window.scrollTo(0, targetY);
      document.documentElement.scrollTop = targetY;
      document.body.scrollTop = targetY; // For older browsers

      console.log("[overlap-fade] After rAF jump to", targetY, "actual scrollY:", getScrollY());

      // Re-enable scroll-snap after settling
      window.setTimeout(() => {
        enableScrollSnap();
      }, 150);
    });
  }


  function setActivePanel(nextIndex) {
    if (!activeStack) return;
    const n = panels.length;
    nextIndex = clamp(nextIndex, 0, n - 1);

    // Update classes
    panels.forEach((p, i) => {
      p.classList.remove("is-active", "is-prev");
      p.setAttribute("aria-hidden", "true");
    });

    const prev = panels[index];
    const next = panels[nextIndex];

    if (prev && prev !== next) prev.classList.add("is-prev");
    if (next) {
      next.classList.add("is-active");
      next.setAttribute("aria-hidden", "false");
    }

    index = nextIndex;

    // Transition guard (prevents rapid spam)
    isTransitioning = true;
    const timeout = prefersReducedMotion() ? 0 : 500;
    window.setTimeout(() => (isTransitioning = false), timeout);
  }

  function activateStack(stackEl) {
    if (activeStack === stackEl) return;

    activeStack = stackEl;
    panels = Array.from(activeStack.querySelectorAll(PANEL_SELECTOR));
    if (!panels.length) {
      activeStack = null;
      return;
    }

    // Cache position BEFORE locking (offsetTop is unreliable when body is fixed)
    stackTopCache = activeStack.getBoundingClientRect().top + getScrollY();
    stackHeightCache = activeStack.offsetHeight;

    // Init accessibility + default state
    panels.forEach((p) => p.setAttribute("aria-hidden", "true"));
    index = 0;
    setActivePanel(0);

    lockScroll();
  }

  function deactivateStack() {
    if (!activeStack) return;
    activeStack = null;
    panels = [];
    index = 0;
    isTransitioning = false;
  }

  function stackIsReadyToCapture(stackEl) {
    // Activate when the stack reaches the top area of viewport.
    // This makes it feel like a “pinned stage”.
    const r = stackEl.getBoundingClientRect();
    const vh = window.innerHeight || 0;

    // Condition: top is at/above top, and enough of it is still visible
    return r.top <= 0 && r.bottom >= Math.min(vh * 0.6, vh - 1);
  }

  function findCandidateStack() {
    const stacks = Array.from(document.querySelectorAll(STACK_SELECTOR));
    for (const s of stacks) {
      if (stackIsReadyToCapture(s)) return s;
    }
    return null;
  }

  function maybeActivateOnScroll() {
    if (activeStack) return;
    // Don't re-activate during cooldown after exiting
    if (Date.now() < exitCooldownUntil) return;
    const candidate = findCandidateStack();
    if (candidate) activateStack(candidate);
  }

  function leaveDown() {
    if (!activeStack) return;

    // Calculate target BEFORE unlocking (use cached values since body is fixed)
    // The next element's top = stackTop + stackHeight
    const targetY = stackTopCache + stackHeightCache;

    console.log("[overlap-fade] leaveDown - jumping to:", targetY);

    // Set cooldown to prevent immediate re-activation from scroll events
    exitCooldownUntil = Date.now() + 500;
    deactivateStack();

    // Unlock and jump in one operation
    unlockAndJumpTo(targetY);
  }

  function leaveUp() {
    if (!activeStack) return;

    // Calculate target BEFORE unlocking (use cached values)
    // Go to one pixel before the stack top so we're above it
    const targetY = Math.max(0, stackTopCache - 1);

    console.log("[overlap-fade] leaveUp - jumping to:", targetY);

    // Set cooldown to prevent immediate re-activation from scroll events
    exitCooldownUntil = Date.now() + 500;
    deactivateStack();

    // Unlock and jump in one operation
    unlockAndJumpTo(targetY);
  }

  function step(direction) {
    if (!activeStack || !panels.length) return;

    const n = panels.length;
    if (direction > 0) {
      if (index < n - 1) setActivePanel(index + 1);
      else leaveDown();
    } else {
      if (index > 0) setActivePanel(index - 1);
      else leaveUp();
    }
  }

  // Capture wheel BEFORE other scripts (helps coexist with your slideshow script)
  function onWheelCapture(e) {
    // If not currently active, we only try to activate when user scrolls into it
    if (!activeStack) {
      // Let normal scroll happen; after scroll, we may activate
      return;
    }

    // While active: we own the gesture
    e.preventDefault();
    e.stopImmediatePropagation();

    // Ignore zoom gestures
    if (e.ctrlKey) return;

    const now = Date.now();
    if (isTransitioning || now - lastWheelTs < WHEEL_LOCK_MS) return;
    lastWheelTs = now;

    const direction = e.deltaY > 0 ? 1 : -1;
    step(direction);
  }

  function onKeyDownCapture(e) {
    if (!activeStack) return;

    // Don’t hijack typing
    const tag = (e.target && e.target.tagName || "").toLowerCase();
    const isTyping =
      tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if (isTyping) return;

    const key = e.key;

    if (
      key === "ArrowDown" || key === "PageDown" || key === " " ||
      key === "ArrowUp"   || key === "PageUp"
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dir = (key === "ArrowUp" || key === "PageUp") ? -1 : 1;
      step(dir);
      return;
    }

    if (key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      // Escape exits without changing position (stays at current scroll)
      deactivateStack();
      unlockAndJumpTo(lockedScrollY);
    }
  }

  function onTouchStart(e) {
    if (!activeStack) return;
    if (!e.touches || e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (!activeStack) return;
    if (touchStartY == null) return;

    const endY = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY) ?? null;
    if (endY == null) {
      touchStartY = null;
      return;
    }

    const dy = touchStartY - endY; // >0 swipe up -> go down
    touchStartY = null;

    if (Math.abs(dy) < TOUCH_THRESHOLD_PX) return;

    // Own the gesture while active
    e.preventDefault?.();
    e.stopImmediatePropagation?.();

    step(dy > 0 ? 1 : -1);
  }

  function initAllStacks() {
    // Ensure first panel is visible even before activation
    document.querySelectorAll(STACK_SELECTOR).forEach((stack) => {
      const ps = Array.from(stack.querySelectorAll(PANEL_SELECTOR));
      if (!ps.length) return;

      ps.forEach((p) => p.setAttribute("aria-hidden", "true"));
      ps[0].classList.add("is-active");
      ps[0].setAttribute("aria-hidden", "false");
    });
  }

  function init() {
    initAllStacks();

    window.addEventListener("scroll", maybeActivateOnScroll, { passive: true });
    window.addEventListener("resize", maybeActivateOnScroll, { passive: true });

    // Capture-phase listeners to coexist with other scroll scripts
    window.addEventListener("wheel", onWheelCapture, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDownCapture, { passive: false, capture: true });

    // Touch (can’t be reliably prevented if passive; keep passive true and rely on lock)
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    // Try activate if loaded already at the right scroll position
    maybeActivateOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();