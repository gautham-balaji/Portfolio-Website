/**
 * Scroll reveals and decrypted section labels.
 *
 * One module, one IntersectionObserver, no dependencies. It is the only
 * always-on script the site ships, so it stays small and it never owns any
 * content: everything it touches is already rendered and readable before it
 * runs (DESIGN_SYSTEM.md §27, "motion should never delay content visibility").
 *
 * The hidden state lives behind `html.js-reveal`, set synchronously in the
 * document head. This module's first responsibility is therefore to remove
 * that class again in every case where reveals must not happen: reduced
 * motion, or a browser without IntersectionObserver. If the module fails to
 * load at all, the head script's own failsafe does the same thing, so content
 * can never be left invisible by a script that did not arrive.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Glyphs used while a label resolves. Deliberately technical, not runic. */
const SCRAMBLE_GLYPHS = '#$%&/<>[]{}=+*0123456789';

/** Long enough to read as deliberate, short enough never to be in the way. */
const DECRYPT_DURATION = 420;

/** One scrambled frame every ~45ms: legible churn rather than a blur. */
const SCRAMBLE_TICK = 45;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/** Put every reveal target in its final state and drop the gating class. */
function settleEverything(): void {
  document.documentElement.classList.remove('js-reveal');
  for (const el of document.querySelectorAll('[data-reveal]')) {
    el.classList.add('is-revealed');
  }
}

/**
 * Resolve one label from scrambled glyphs into its real text.
 *
 * The element is `aria-hidden` with a visually hidden twin holding the real
 * text, both set up before the first scrambled frame is written. A screen
 * reader therefore only ever encounters the finished string, never a
 * half-resolved one, and the twin costs one span per label.
 */
function decrypt(el: HTMLElement): void {
  const text = el.textContent ?? '';
  if (!text.trim()) return;

  const twin = document.createElement('span');
  twin.className = 'sr-only';
  twin.textContent = text;
  el.setAttribute('aria-hidden', 'true');
  el.after(twin);

  const chars = [...text];
  const start = performance.now();
  let lastTick = 0;

  const step = (now: number): void => {
    const progress = Math.min(1, (now - start) / DECRYPT_DURATION);

    if (progress >= 1) {
      el.textContent = text;
      return;
    }

    if (now - lastTick >= SCRAMBLE_TICK) {
      lastTick = now;
      // Characters settle left to right, so the label reads as arriving
      // rather than as flickering in place.
      const settled = Math.floor(progress * chars.length);
      el.textContent = chars
        .map((char, i) => {
          if (i < settled || !/[A-Za-z0-9]/.test(char)) return char;
          return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        })
        .join('');
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function init(): void {
  // Tells the head script's failsafe that this module arrived and is taking
  // responsibility for revealing everything.
  document.documentElement.setAttribute('data-reveal-ready', '');

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    settleEverything();
    return;
  }

  // -10% on the bottom edge: an element reveals once it is properly in the
  // viewport rather than the instant its first pixel appears, which keeps the
  // movement in the reader's field of view instead of at the very edge of it.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        observer.unobserve(target);

        target.classList.add('is-revealed');

        const label = target.querySelector<HTMLElement>('[data-decrypt]');
        if (label) decrypt(label);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
  );

  for (const el of document.querySelectorAll('[data-reveal]')) {
    // Anything the reader has already passed is put straight into its final
    // state rather than observed. Loading at an anchor (/#contact), restoring
    // a scroll position, or following an in-page link all start the page part
    // way down, and an element above that point has no arrival left to
    // animate: it would sit hidden until the reader happened to scroll back
    // up, then fade in behind them. Reading position, not a timer, decides.
    if (el.getBoundingClientRect().bottom < 0) {
      el.classList.add('is-revealed');
      const passedLabel = el.querySelector<HTMLElement>('[data-decrypt]');
      if (passedLabel) passedLabel.removeAttribute('data-decrypt');
      continue;
    }
    observer.observe(el);
  }

  // Labels that are not themselves inside a reveal target still need a
  // trigger, so they get their own observation.
  const looseLabels = document.querySelectorAll<HTMLElement>(
    '[data-decrypt]:not([data-reveal] [data-decrypt])',
  );
  const labelObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        labelObserver.unobserve(entry.target);
        decrypt(entry.target as HTMLElement);
      }
    },
    { threshold: 0.5 },
  );

  for (const label of looseLabels) {
    // Same rule as the reveal targets above: a label the reader has already
    // scrolled past is simply left as the real text.
    if (label.getBoundingClientRect().bottom < 0) continue;
    labelObserver.observe(label);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
