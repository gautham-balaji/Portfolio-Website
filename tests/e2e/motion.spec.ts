import { expect, test, type Page } from '@playwright/test';

/**
 * Motion and interaction (Phase 6).
 *
 * The theme of this suite is that motion is an enhancement and never a
 * precondition: every test here either proves that an effect happens, or that
 * the page is complete and readable when it does not. The three fallbacks
 * (reduced motion, no JavaScript, touch) get explicit contexts rather than
 * relying on the project viewport, so they assert the same thing under both
 * Playwright projects.
 */

/** Scroll the whole page so every observer fires, then return to the top. */
async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // The site sets `scroll-behavior: smooth` globally, which would turn each
    // step below into an interrupted animation rather than a jump.
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

/** Reveal targets that are on screen but still fully transparent. */
async function invisibleInViewport(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      [...document.querySelectorAll('[data-reveal]')].filter((el) => {
        const box = el.getBoundingClientRect();
        const onScreen = box.top < window.innerHeight && box.bottom > 0 && box.height > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.05;
      }).length,
  );
}

test.describe('scroll reveals', () => {
  test('never leave on-screen content invisible, and settle by the end of the page', async ({
    page,
  }) => {
    // The failure this guards against is the one that makes reveals dangerous:
    // content that is in front of the reader and still at opacity 0.
    await page.goto('/');
    expect(await invisibleInViewport(page)).toBe(0);

    await scrollThrough(page);
    expect(await invisibleInViewport(page)).toBe(0);

    const unrevealed = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal]')].filter(
          (el) => !el.classList.contains('is-revealed'),
        ).length,
    );
    expect(unrevealed).toBe(0);
  });

  test('are never applied when JavaScript is unavailable', async ({ browser }) => {
    // Without the head script there is no `js-reveal` class, so the hidden
    // state in global.css cannot match anything. A regression here would ship
    // a blank page to every reader without JavaScript.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('html')).not.toHaveClass(/js-reveal/);
    expect(await page.locator('[data-reveal]').count()).toBeGreaterThan(0);
    expect(await invisibleInViewport(page)).toBe(0);

    await context.close();
  });

  test('are declined entirely under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('html')).not.toHaveClass(/js-reveal/);
    expect(await invisibleInViewport(page)).toBe(0);

    await context.close();
  });
});

test.describe('hero Text Pressure', () => {
  test('touches nothing until a mouse actually approaches the name', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const heading = page.locator('#hero-name');
    // Page load does no DOM work and forces no layout for this effect.
    await expect(heading.locator('.tp-char')).toHaveCount(0);
    await expect(heading).toHaveText('GAUTHAM BALAJI');

    await context.close();
  });

  test('keeps the name as text, and as its own accessible name', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const heading = page.locator('#hero-name');
    const box = await heading.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(heading.locator('.tp-char').first()).toBeAttached();

    // Whatever the script does to the markup, these two must hold: the
    // rendered text is unchanged (so selection and copy still work), and the
    // heading still announces the full name rather than thirteen letters.
    await expect(heading).toHaveText('GAUTHAM BALAJI');
    await expect(heading).toHaveAttribute('aria-label', 'GAUTHAM BALAJI');
    await expect(heading.locator('.tp-wrapper')).toHaveAttribute('aria-hidden', 'true');

    await context.close();
  });

  test('responds to the pointer without moving the heading', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const heading = page.locator('#hero-name');
    const before = await heading.boundingBox();
    expect(before).not.toBeNull();

    await page.mouse.move(before!.x + 60, before!.y + before!.height / 2);
    await page.waitForTimeout(350);

    const nearest = await page
      .locator('.tp-char')
      .first()
      .evaluate((el) => {
        const settings = getComputedStyle(el).fontVariationSettings;
        return Number(/"wght"\s+([\d.]+)/.exec(settings)?.[1] ?? 0);
      });
    // Rest weight is 600; the letter under the pointer must be heavier.
    expect(nearest).toBeGreaterThan(620);

    // DESIGN_SYSTEM §12: no layout shift. The letters move within their own
    // locked slots, so the heading's box is identical before and after.
    const after = await heading.boundingBox();
    expect(after!.width).toBeCloseTo(before!.width, 1);
    expect(after!.height).toBeCloseTo(before!.height, 1);
    expect(after!.y).toBeCloseTo(before!.y, 1);

    await context.close();
  });

  test('does not run on touch devices or under reduced motion', async ({ browser }) => {
    for (const options of [
      { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } },
      { reducedMotion: 'reduce' as const },
    ]) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      await page.goto('/');

      // Move a mouse over the name anyway: even the trigger must not wake it.
      const heading = page.locator('#hero-name');
      const box = await heading.boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.waitForTimeout(400);

      await expect(heading).toHaveText('GAUTHAM BALAJI');
      await expect(page.locator('.tp-char')).toHaveCount(0);

      await context.close();
    }
  });
});

test.describe('project index', () => {
  test('emphasises the engaged row and recedes the others, for pointer and keyboard alike', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-project-index] .row').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);

    const state = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-project-index] .row')].map((row) => ({
          filter: getComputedStyle(row).filter,
          rule: getComputedStyle(row.querySelector('.rule')!).borderTopColor,
        })),
      );

    const atRest = await state();
    expect(atRest.every((row) => row.filter === 'none')).toBe(true);

    await page.locator('[data-project-index] .row').first().hover();
    await page.waitForTimeout(350);
    const hovered = await state();
    expect(hovered[0]?.filter).toBe('none');
    // Oxide rule: the engaged row is marked by more than contrast alone.
    expect(hovered[0]?.rule).toBe('rgb(184, 92, 56)');
    expect(hovered[1]?.filter).not.toBe('none');

    // Keyboard parity. Focusing a link inside the second row must produce the
    // same treatment the pointer produced, not a reduced version of it.
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll('[data-project-index] .row')];
      rows[1]?.querySelector('a')?.focus();
    });
    await page.mouse.move(2, 2);
    await page.waitForTimeout(350);

    const focused = await state();
    expect(focused[1]?.filter).toBe('none');
    expect(focused[1]?.rule).toBe('rgb(184, 92, 56)');
    expect(focused[0]?.filter).not.toBe('none');
  });
});

test.describe('section labels', () => {
  test('resolve to their real text and never scramble the accessible name', async ({
    page,
  }) => {
    await page.goto('/');
    await scrollThrough(page);

    const labels = await page
      .locator('[data-decrypt]')
      .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(labels).toEqual([
      'Selected Work',
      'Experience',
      'Engineering Profile',
      'About',
      'Currently Building',
      'Education',
    ]);

    // Every label that has been through the effect is hidden from assistive
    // technology and paired with a visually hidden twin carrying the final
    // text, so a screen reader never meets a half-resolved string.
    const paired = await page.evaluate(() =>
      [...document.querySelectorAll('[data-decrypt][aria-hidden="true"]')].every(
        (el) =>
          el.nextElementSibling?.classList.contains('sr-only') &&
          el.nextElementSibling.textContent === el.textContent,
      ),
    );
    expect(paired).toBe(true);
  });
});

test.describe('architecture diagrams', () => {
  test('reveal their stages and keep the text equivalent visible throughout', async ({
    page,
  }) => {
    await page.goto('/projects/geocounterfactual');

    const diagram = page.locator('[data-reveal="diagram"]');
    await diagram.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    await expect(diagram).toHaveClass(/is-revealed/);

    const opacities = await diagram
      .locator('.arch-stage')
      .evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).opacity))]);
    expect(opacities).toEqual(['1']);

    // The accessible description is never part of the animation.
    await expect(diagram.locator('.dg-sr li').first()).not.toBeEmpty();
  });
});

test.describe('controls', () => {
  test('buttons keep a visible focus ring and a pressed state', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('.hero-actions .btn').first();
    await cta.focus();

    const outlineWidth = await cta.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0);

    // Pressed state, exercised rather than read out of a stylesheet: hold the
    // pointer down on the control and check it takes the press. The mouse is
    // released without ever completing a click, so no navigation happens.
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    const resting = await cta.evaluate((el) => getComputedStyle(el).translate);
    await page.mouse.down();
    // The press is a transition, so read it once it has landed rather than
    // catching it on its first frame.
    await page.waitForTimeout(250);
    const held = await cta.evaluate((el) => getComputedStyle(el).translate);
    await page.mouse.up();

    expect(resting).toBe('none');
    expect(held).toBe('0px 1px');
  });
});
