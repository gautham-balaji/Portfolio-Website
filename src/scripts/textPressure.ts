/**
 * Hero Text Pressure (DESIGN_SYSTEM.md §12).
 *
 * Pointer proximity raises the weight and width axes of the letters nearest
 * the cursor, so the name responds to the reader the way ink responds to
 * pressure. It is the site's one genuinely interactive effect, and it is
 * deliberately built from the typography that is already there rather than
 * from a canvas: Archivo Variable ships both a `wght` (100-900) and a `wdth`
 * (62-125%) axis, so the effect is a few style writes per frame on fourteen
 * spans and nothing else. No dependency, no canvas, no WebGL.
 *
 * Four rules shape the implementation:
 *
 *   Readable always.   The axes stay inside the range Archivo ships (weight
 *                      600 to 900, width 100 to 104). The name gets heavier
 *                      under the pointer; it never deforms.
 *
 *   No layout shift.   Every character span is locked to the width it
 *                      measured at rest, so a letter under pressure expands
 *                      within its own slot instead of pushing its neighbours
 *                      along the line. The heading's metrics never change,
 *                      which also means the effect cannot move the CTA below
 *                      it (§12).
 *
 *   Never the content. The heading keeps its accessible name via aria-label
 *                      and the split spans are hidden from assistive
 *                      technology, because inline-block letters are read out
 *                      one at a time by some screen readers. Words stay
 *                      inside nowrap spans so splitting cannot introduce a
 *                      mid-word line break, and the inter-word space stays a
 *                      real text node so selection and copy still yield
 *                      "GAUTHAM BALAJI".
 *
 *   Desktop only.      Touch and reduced motion never reach the split at all:
 *                      the server-rendered heading is left exactly as it is.
 */

/**
 * Axis range, calibrated against the rendered page rather than picked.
 *
 * A production audit found the effect technically working but invisible in
 * normal use, and measuring it showed why: with the peak at 780 and the radius
 * at 2x, a letter only approached full weight when the pointer was almost
 * exactly on its centre, and 600 to 780 is a small step for a face this large.
 * Halfway to the old radius the letter was at weight 645, which nobody sees.
 *
 * REST_WEIGHT stays at 600 deliberately, and does not follow the audit's
 * suggested 400. 600 is what `.display` sets in global.css, so it is the
 * weight the heading has for a touch reader, a reduced-motion reader and a
 * reader with no JavaScript. Dropping the rest value would mean the hero name
 * visibly un-bolded the instant a mouse moved anywhere in the section, and
 * would leave the desktop resting state different from the static one, which
 * DESIGN_SYSTEM §12 does not allow ("static fallback is identical"). The range
 * is widened at the top instead: 600 to 900 is 300 units where it was 180, and
 * 900 is the axis maximum Archivo ships, not a distortion of it.
 *
 * PEAK_WIDTH comes DOWN, from 107 to 104, which looks backwards but is not.
 * Each character sits in a slot locked to its resting width, so everything
 * above rest overflows into the gaps either side. Measured on the page, the
 * widest glyph overflows its slot by 14.7px at 1280 under the old 780/107, and
 * by exactly the same 14.7px at 900/100: the extra weight costs the same room
 * the old width axis was spending. 104 buys back a little of the swell for
 * 18.5px total, while 108 reached 22.3px and visibly closed the gaps between
 * letters. The letters press; they do not touch.
 */
const REST_WEIGHT = 600;
const PEAK_WEIGHT = 900;
const REST_WIDTH = 100;
const PEAK_WIDTH = 104;

/**
 * Influence radius, in multiples of the heading's own font size.
 *
 * 3x rather than 2x, so the swell reaches a few letters either side of the
 * pointer and reads as a wave moving through the word. The falloff stays
 * squared: a flatter curve (tested with smoothstep) lifted every neighbour at
 * once, which both looked like a global weight change rather than pressure and
 * pushed adjacent glyphs into each other.
 */
const RADIUS_RATIO = 3;

/** Per-frame approach rate. Low enough to trail the pointer very slightly. */
const EASING = 0.18;

/** Below this, a character is at rest and needs no further style write. */
const EPSILON = 0.002;

interface Char {
  el: HTMLElement;
  /** Centre, in coordinates local to the heading box. */
  cx: number;
  cy: number;
  current: number;
  target: number;
}

function canRun(): boolean {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Replace the heading's text with per-character spans, grouped by word.
 *
 * Returns the character spans in document order.
 */
function split(host: HTMLElement, text: string): Char[] {
  const wrapper = document.createElement('span');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.className = 'tp-wrapper';

  const chars: Char[] = [];

  text.split(' ').forEach((word, wordIndex) => {
    // A real space between word spans, so the line can still break between
    // words and a copied selection still contains the space.
    if (wordIndex > 0) wrapper.append(' ');

    const wordEl = document.createElement('span');
    wordEl.className = 'tp-word';

    for (const char of word) {
      const charEl = document.createElement('span');
      charEl.className = 'tp-char';
      charEl.textContent = char;
      wordEl.append(charEl);
      chars.push({ el: charEl, cx: 0, cy: 0, current: 0, target: 0 });
    }

    wrapper.append(wordEl);
  });

  host.setAttribute('aria-label', text);
  host.replaceChildren(wrapper);
  return chars;
}

/**
 * Cache each character's centre and lock its slot to its resting width.
 *
 * Runs after the web font is ready and again on resize, because both change
 * the measurements this effect depends on.
 */
function measure(host: HTMLElement, chars: Char[]): number {
  for (const char of chars) {
    char.el.style.width = '';
  }

  const hostRect = host.getBoundingClientRect();
  const rects = chars.map((char) => char.el.getBoundingClientRect());

  chars.forEach((char, i) => {
    const rect = rects[i];
    if (!rect) return;
    char.cx = rect.left - hostRect.left + rect.width / 2;
    char.cy = rect.top - hostRect.top + rect.height / 2;
    char.el.style.width = `${rect.width}px`;
  });

  // Read here rather than per frame: resolving computed style inside the
  // animation loop would force a style recalculation on every tick.
  return parseFloat(getComputedStyle(host).fontSize) * RADIUS_RATIO;
}

export function initTextPressure(): void {
  const host = document.querySelector<HTMLElement>('[data-text-pressure]');
  if (!host || !canRun()) return;

  const text = (host.textContent ?? '').trim();
  if (!text) return;

  let chars: Char[] = [];
  let radius = 0;
  let ready = false;

  const remeasure = (): void => {
    radius = measure(host, chars);
  };

  /**
   * Split and measure, once, on the first mouse movement near the heading.
   *
   * Nothing above happens at page load. Splitting writes fourteen spans into
   * the DOM and measuring forces a layout, and neither is worth spending on
   * the critical path for an effect that may never be used: a reader on a
   * trackpad who scrolls straight past the hero never pays for it, and a
   * reader on a phone never reaches this function at all.
   */
  const prepare = (): void => {
    if (ready) return;
    ready = true;

    chars = split(host, text);
    remeasure();

    // The locked widths are only correct once the real face has loaded; until
    // then they describe the fallback face.
    void document.fonts?.ready.then(remeasure);

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(remeasure, 150);
    });
  };

  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;
  let running = false;

  const frame = (): void => {
    const hostRect = host.getBoundingClientRect();
    const localX = pointerX - hostRect.left;
    const localY = pointerY - hostRect.top;

    let settled = true;

    for (const char of chars) {
      if (pointerInside) {
        const dx = localX - char.cx;
        const dy = localY - char.cy;
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / radius);
        // Squared falloff keeps the peak tight around the pointer instead of
        // lifting the whole word.
        char.target = falloff * falloff;
      } else {
        char.target = 0;
      }

      char.current += (char.target - char.current) * EASING;

      if (Math.abs(char.target - char.current) > EPSILON) settled = false;
      else char.current = char.target;

      const weight = REST_WEIGHT + (PEAK_WEIGHT - REST_WEIGHT) * char.current;
      const width = REST_WIDTH + (PEAK_WIDTH - REST_WIDTH) * char.current;
      char.el.style.fontVariationSettings = `"wght" ${weight.toFixed(1)}, "wdth" ${width.toFixed(2)}`;
    }

    // The loop stops the moment there is nothing left to interpolate, whether
    // that is because the letters have returned to rest or because the
    // pointer is resting and they have reached their targets. The next
    // pointermove restarts it. A page nobody is pointing at, or one where the
    // cursor is sitting still, schedules no animation frames at all.
    if (settled) {
      running = false;
      return;
    }

    requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  // Listening on the section rather than the heading means the letters begin
  // responding as the pointer approaches, which is the whole idea. Passive:
  // this never blocks scrolling, selection, or any control beneath it.
  const zone = host.closest('section') ?? host;

  zone.addEventListener(
    'pointermove',
    (event) => {
      const pointer = event as PointerEvent;
      if (pointer.pointerType !== 'mouse') return;
      prepare();
      pointerX = pointer.clientX;
      pointerY = pointer.clientY;
      pointerInside = true;
      start();
    },
    { passive: true },
  );

  zone.addEventListener(
    'pointerleave',
    () => {
      if (!ready) return;
      pointerInside = false;
      start();
    },
    { passive: true },
  );
}

initTextPressure();
