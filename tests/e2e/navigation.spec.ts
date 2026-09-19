import { expect, test, type Page } from '@playwright/test';

/**
 * Site navigation.
 *
 * The bar has two modes and one rule joining them: exactly one of them is
 * present at any width. Below 640px a native <details> disclosure; at 640 and
 * above the full list. The disclosure stays native, so most of what is
 * asserted here is that the small script layered on top adds what the element
 * lacks without taking anything away from it, including with JavaScript off.
 */

const NARROW = { width: 390, height: 844 };

/** Widths the navigation is contracted to handle, including both sides of
 *  the switch so the transition itself is covered. */
const WIDTHS = [360, 390, 430, 560, 639, 640, 768, 820, 860, 900, 1024, 1280];

async function navState(page: Page) {
  return page.evaluate(() => {
    const list = document.querySelector('.nav-list')!;
    const disclosure = document.querySelector('.nav-disclosure')!;
    const listShown = getComputedStyle(list).display !== 'none';
    const disclosureShown = getComputedStyle(disclosure).display !== 'none';
    return {
      mode:
        listShown && !disclosureShown
          ? 'desktop'
          : disclosureShown && !listShown
            ? 'disclosure'
            : 'broken',
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
}

test.describe('navigation modes', () => {
  test('shows exactly one navigation at every width, with nothing clipped or wrapped', async ({
    browser,
  }) => {
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 800 } });
      const page = await context.newPage();
      const problems: string[] = [];
      page.on('pageerror', (error) => problems.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(message.text());
      });

      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);

      const state = await navState(page);
      // 640 is the measured switch: below it the desktop bar crowds the
      // wordmark, above it there is at least 137px between the two.
      expect(state.mode, `${width}px must resolve to one navigation`).toBe(
        width >= 640 ? 'desktop' : 'disclosure',
      );
      expect(state.overflow, `${width}px must not scroll sideways`).toBeLessThanOrEqual(1);

      if (state.mode === 'desktop') {
        const geometry = await page.evaluate(() => {
          const lines = (el: Element) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            return range.getClientRects().length;
          };
          const mark = document.querySelector('.wordmark')!;
          const list = document.querySelector('.nav-list')!;
          return {
            wrapped: [...document.querySelectorAll('.nav-link')].filter((l) => lines(l) > 1)
              .length,
            markLines: lines(mark),
            gap: list.getBoundingClientRect().left - mark.getBoundingClientRect().right,
          };
        });
        expect(geometry.wrapped, `${width}px: no link may wrap`).toBe(0);
        expect(geometry.markLines, `${width}px: the wordmark stays on one line`).toBe(1);
        expect(geometry.gap, `${width}px: the bar must not crowd`).toBeGreaterThan(32);
      }

      expect(problems, `${width}px console`).toEqual([]);
      await context.close();
    }
  });
});

test.describe('navigation destinations', () => {
  // Both navigation modes carry the same four destinations, so both are
  // checked: the wide bar directly, the narrow one through its panel.
  const MODES = [
    {
      name: 'desktop bar',
      viewport: { width: 1024, height: 800 },
      link: '.site-nav .nav-link',
    },
    { name: 'disclosure panel', viewport: NARROW, link: '.nav-panel-link' },
  ];

  for (const mode of MODES) {
    test(`reach their section from a route that does not contain it (${mode.name})`, async ({
      browser,
    }) => {
      // The header renders on every route but these sections only exist on
      // the homepage. As bare fragments the links were dead everywhere else:
      // they appended `#work` to the project URL and went nowhere.
      const context = await browser.newContext({ viewport: mode.viewport });
      const page = await context.newPage();
      await page.goto('/projects/vera');

      if (mode.link === '.nav-panel-link') {
        await page.locator('.nav-disclosure summary').click();
      }
      await page.locator(mode.link, { hasText: 'Work' }).click();
      await page.waitForLoadState('networkidle');

      expect(new URL(page.url()).pathname).toBe('/');
      await expect(page.locator('#work')).toBeVisible();

      await context.close();
    });
  }

  test('stay a same-document jump when already on the homepage', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1024, height: 800 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => {
      (window as unknown as { marker: string }).marker = 'same-document';
    });

    await page.locator('.site-nav .nav-link', { hasText: 'Contact' }).click();
    await page.waitForTimeout(300);

    // Root-relative hrefs must not turn an in-page jump into a reload.
    expect(await page.evaluate(() => (window as unknown as { marker?: string }).marker)).toBe(
      'same-document',
    );
    expect(new URL(page.url()).hash).toBe('#contact');

    await context.close();
  });
});

test.describe('disclosure navigation', () => {
  test('opens from the keyboard and reports its state', async ({ browser }) => {
    const context = await browser.newContext({ viewport: NARROW });
    const page = await context.newPage();
    await page.goto('/');

    const summary = page.locator('.nav-disclosure summary');
    const firstLink = page.locator('.nav-panel-link').first();

    await expect(firstLink).toBeHidden();

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(firstLink).toBeVisible();
    // Native <details> carries its own expanded state; nothing here sets
    // aria-expanded by hand, so this guards against that being "helpfully"
    // added later and going out of sync.
    await expect(page.locator('.nav-disclosure')).toHaveAttribute('open', '');

    await context.close();
  });

  test('closes on Escape and hands focus back to the control that opened it', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: NARROW });
    const page = await context.newPage();
    await page.goto('/');

    const summary = page.locator('.nav-disclosure summary');
    const firstLink = page.locator('.nav-panel-link').first();

    // Escape with focus on the control itself.
    await summary.click();
    await expect(firstLink).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(firstLink).toBeHidden();
    await expect(summary).toBeFocused();

    // Escape with focus moved down into the panel: the panel is not modal and
    // traps nothing, so focus has to be brought back deliberately rather than
    // dropped on <body>.
    await summary.click();
    await firstLink.focus();
    await page.keyboard.press('Escape');
    await expect(firstLink).toBeHidden();
    await expect(summary).toBeFocused();

    await context.close();
  });

  test('closes when a destination is chosen', async ({ browser }) => {
    const context = await browser.newContext({ viewport: NARROW });
    const page = await context.newPage();
    await page.goto('/');

    await page.locator('.nav-disclosure summary').click();
    await expect(page.locator('.nav-panel-link').first()).toBeVisible();

    await page.locator('.nav-panel-link', { hasText: 'Contact' }).click();

    // Every link here is a same-page anchor, so nothing unloads: without the
    // close the panel would sit open over the section just asked for.
    await expect(page.locator('.nav-panel-link').first()).toBeHidden();
    expect(new URL(page.url()).hash).toBe('#contact');

    await context.close();
  });

  test('does not swallow Escape from the rest of the page', async ({ browser }) => {
    // The handler is bound to the disclosure, not to the document, so Escape
    // pressed anywhere else still reaches whatever is listening for it.
    const context = await browser.newContext({ viewport: NARROW });
    const page = await context.newPage();
    await page.goto('/');

    await page.evaluate(() => {
      (window as unknown as { escapes: number }).escapes = 0;
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') (window as unknown as { escapes: number }).escapes += 1;
      });
    });

    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('main a').first().focus();
    await page.keyboard.press('Escape');

    expect(await page.evaluate(() => (window as unknown as { escapes: number }).escapes)).toBe(
      1,
    );
    await context.close();
  });

  test('is not left open by a back navigation', async ({ browser }) => {
    const context = await browser.newContext({ viewport: NARROW });
    const page = await context.newPage();
    await page.goto('/');

    await page.locator('.nav-disclosure summary').click();
    await expect(page.locator('.nav-panel-link').first()).toBeVisible();

    await page.goto('/projects/vera');
    await page.goBack();

    // A restored page returns its DOM exactly as it was, open attribute and
    // all, which reads as the menu having opened by itself.
    await expect(page.locator('.nav-panel-link').first()).toBeHidden();
    await context.close();
  });

  test('still opens and navigates with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ viewport: NARROW, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    const firstLink = page.locator('.nav-panel-link').first();
    await expect(firstLink).toBeHidden();

    await page.locator('.nav-disclosure summary').click();
    await expect(firstLink).toBeVisible();

    await page.locator('.nav-panel-link', { hasText: 'About' }).click();
    expect(new URL(page.url()).hash).toBe('#about');

    await context.close();
  });

  test('remains usable under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ viewport: NARROW, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');

    const firstLink = page.locator('.nav-panel-link').first();
    await page.locator('.nav-disclosure summary').click();
    await expect(firstLink).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(firstLink).toBeHidden();

    await context.close();
  });
});
