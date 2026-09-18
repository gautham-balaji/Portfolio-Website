import { expect, test } from '@playwright/test';

/**
 * Phase 1 foundation checks.
 *
 * These assert the guarantees the foundation is supposed to provide, not the
 * design. Page-level visual and interaction suites arrive in later phases.
 *
 * Content assertions are scoped to `main` on purpose. The suite runs against
 * `astro dev`, which injects the Astro dev toolbar into the document; the
 * toolbar carries its own `h1` elements. Scoping keeps the tests about the
 * page rather than dev-only chrome, which does not exist in production.
 */

test('renders a document with correct landmarks and a single h1', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('main#main h1')).toHaveCount(1);
});

test('the skip link is the first focusable element and becomes visible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const focused = page.locator(':focus');
  await expect(focused).toHaveClass(/skip-link/);
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute('href', '#main');
});

test('the skip link moves focus, not just the scroll position', async ({ page }) => {
  // <main> carries tabindex="-1" for exactly this. Without it the browser
  // scrolled to the landmark but left focus on <body>, so the next Tab
  // restarted at the top of the document and the skip link achieved nothing
  // for the keyboard user it exists to serve.
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  await expect(page.locator('#main')).toBeFocused();
});

test('anchored sections land clear of the sticky navigation', async ({ page }) => {
  // scroll-margin-top on the targets, so the browser does its own scrolling.
  // Before it, every in-page link left the section label hidden behind the
  // sticky bar.
  for (const hash of ['#work', '#experience', '#about', '#contact']) {
    await page.goto(`/${hash}`);
    await page.waitForTimeout(300);

    const { targetTop, navBottom } = await page.evaluate((selector) => {
      const target = document.querySelector(selector)!.getBoundingClientRect();
      const nav = document.querySelector('.site-nav')!.getBoundingClientRect();
      return { targetTop: target.top, navBottom: nav.bottom };
    }, hash);

    expect(targetTop, `${hash} must not sit under the navigation`).toBeGreaterThanOrEqual(
      navBottom,
    );
  }
});

test('focused elements have a visible focus indicator', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const outlineWidth = await page
    .locator(':focus')
    .evaluate((el) => getComputedStyle(el).outlineWidth);

  expect(parseFloat(outlineWidth)).toBeGreaterThan(0);
});

test('the page does not scroll horizontally', async ({ page }) => {
  await page.goto('/');

  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
});

test('body text is never smaller than 16px', async ({ page }) => {
  await page.goto('/');

  const fontSize = await page.evaluate(() => getComputedStyle(document.body).fontSize);
  expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
});

test('self-hosted fonts are applied, not a fallback', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(bodyFont).toContain('IBM Plex Sans');

  const headingFont = await page
    .locator('main#main h1')
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(headingFont).toContain('Archivo');
});

test('no third-party requests are made', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      external.push(request.url());
    }
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(external).toEqual([]);
});

test('declares a favicon and a real, absolute OG image', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/favicon/icon.svg',
  );
  await expect(page.locator('link[rel="icon"][type="image/x-icon"]')).toHaveAttribute(
    'href',
    '/favicon/favicon.ico',
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/favicon/apple-touch-icon.png',
  );

  for (const href of [
    '/favicon/icon.svg',
    '/favicon/favicon.ico',
    '/favicon/apple-touch-icon.png',
  ]) {
    const response = await page.request.get(href);
    expect(response.status()).toBe(200);
  }

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toMatch(/^https?:\/\/.+\/images\/og-default\.png$/);
});

test('both resume entry points download the real PDF', async ({ page }) => {
  // The resume was absent for most of the rebuild and the CTAs were gated
  // behind RESUME_AVAILABLE so the site never linked to a missing file. Now
  // that the PDF exists the gate is open, and what matters is that neither
  // entry point can quietly rot into a 404: the path is declared once in
  // src/lib/site.ts and must keep matching the filename on disk.
  await page.goto('/');

  const entryPoints = [
    page.locator('.hero-actions a[href*="resume"]'),
    page.locator('.contact-links a[href*="resume"]'),
  ];

  for (const cta of entryPoints) {
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute('href', '/resume/resume_gautham.pdf');
    // `download` rather than a navigation: this is a file, not a page.
    await expect(cta).toHaveAttribute('download', '');
  }

  const response = await page.request.get('/resume/resume_gautham.pdf');
  expect(response.status()).toBe(200);
  // Served as a real PDF, not an HTML error page dressed as one.
  expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
});

test('emits canonical, description and Person structured data', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toBeTruthy();
  const parsed = JSON.parse(jsonLd ?? '{}');
  expect(parsed['@type']).toBe('Person');
});

test.describe('POST /api/contact', () => {
  test('rejects a malformed submission with per-field errors', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: '', email: 'not-an-email', message: '' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('validation');
    expect(Object.keys(body.fieldErrors)).toContain('email');
  });

  test('answers a honeypot submission as though it succeeded', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Bot',
        email: 'bot@example.com',
        message: 'This message is long enough to pass validation checks.',
        company: 'filled in by a bot',
        startedAt: Date.now() - 10_000,
      },
    });

    // The caller must not learn that the honeypot exists.
    expect(response.status()).toBe(200);
    expect((await response.json()).ok).toBe(true);
  });

  test('rejects non-POST methods', async ({ request }) => {
    const response = await request.get('/api/contact');
    expect(response.status()).toBe(405);
    expect(response.headers()['allow']).toBe('POST');
  });
});
