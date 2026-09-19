import { expect, test } from '@playwright/test';

/**
 * Phase 2 homepage shell.
 *
 * These lock in structural and factual guarantees, not visual styling.
 * Several exist because the corresponding bug was found during Phase 2 and
 * must not silently return.
 */

test('renders the identified sections in the order MASTER_CONTENT §05 defines', async ({
  page,
}) => {
  await page.goto('/');

  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('main section[id]')].map((s) => s.id),
  );

  expect(ids).toEqual([
    'work',
    'experience',
    'profile',
    'about',
    'currently-building',
    'education',
    'contact',
  ]);
});

test('section numbering runs 01 to 06 in sequence', async ({ page }) => {
  await page.goto('/');
  const numbers = await page.locator('.section-number').allTextContents();
  expect(numbers).toEqual(['01', '02', '03', '04', '05', '06']);
});

test('the hero CTA is above the fold', async ({ page }) => {
  // DESIGN_SYSTEM §11 requires this, and the previous site failed it at every
  // viewport. Asserted rather than assumed.
  await page.goto('/');

  const box = await page.locator('.hero-actions .btn').first().boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThan(viewport!.height);
});

test('company names keep their intended casing', async ({ page }) => {
  // DESIGN_SYSTEM §17 requires "Admrls", and MASTER_CONTENT §12 flags the
  // spelling as important. A CSS uppercase transform broke this once.
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Admrls', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CrftHQ', exact: true })).toBeVisible();
});

test('projects without a public repository render no outbound link', async ({ page }) => {
  // MASTER_CONTENT §10 and §23 forbid inventing URLs. Legal NLP and VERA have
  // no public repository, so the row must say so rather than link anywhere.
  await page.goto('/');

  const noLink = page.locator('.row-nolink');
  await expect(noLink).toHaveCount(2);

  // Exactly two project repositories are real: chess-bot and geocounterfactual.
  const repoLinks = await page
    .locator('#work a[href*="github.com/gautham-balaji"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));

  expect(repoLinks.sort()).toEqual([
    'https://github.com/gautham-balaji/chess-bot',
    'https://github.com/gautham-balaji/geocounterfactual',
  ]);
});

test('no project row collides with the metadata rail', async ({ page }) => {
  // A long single-word title once overflowed its column into the descriptor.
  await page.goto('/');

  const collisions = await page.evaluate(
    () =>
      [...document.querySelectorAll('.row')].filter((row) => {
        const title = row.querySelector('.row-title');
        const desc = row.querySelector('.row-descriptor');
        const meta = row.querySelector('.row-meta');
        if (!title || !desc || !meta) return false;
        const t = title.getBoundingClientRect();
        const d = desc.getBoundingClientRect();
        const m = meta.getBoundingClientRect();
        // Only meaningful once the row is side-by-side rather than stacked.
        if (d.top > t.bottom) return false;
        return t.right > d.left + 1 || d.right > m.left + 1;
      }).length,
  );

  expect(collisions).toBe(0);
});

test('education states the expected graduation year and never shows a CGPA', async ({
  page,
}) => {
  // Phase 5 content correction: CGPA is a real MASTER_CONTENT.md fact but is
  // deliberately not surfaced on the public site.
  await page.goto('/');

  const education = page.locator('#education');
  await expect(education.getByText('2027')).toBeVisible();
  await expect(education.getByText(/cgpa/i)).toHaveCount(0);
  await expect(education.getByText(/8\.3/)).toHaveCount(0);
});

test('the contact form posts to the real endpoint with schema field names', async ({
  page,
}) => {
  // MASTER_CONTENT §18: "Do not ship an inert form."
  await page.goto('/');

  const form = page.locator('form.contact-form');
  await expect(form).toHaveAttribute('action', '/api/contact');
  await expect(form).toHaveAttribute('method', 'post');

  for (const name of ['name', 'email', 'message']) {
    await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
  }
});

test('every form control has an associated visible label', async ({ page }) => {
  await page.goto('/');

  const unlabelled = await page.evaluate(() =>
    [...document.querySelectorAll('form.contact-form input, form.contact-form textarea')]
      .filter((el) => {
        const input = el as HTMLInputElement;
        // The honeypot is intentionally hidden from users and assistive tech.
        if (input.closest('.honeypot')) return false;
        return !document.querySelector(`label[for="${input.id}"]`);
      })
      .map((el) => (el as HTMLInputElement).name),
  );

  expect(unlabelled).toEqual([]);
});

test('the mobile menu works without JavaScript', async ({ browser }) => {
  // DESIGN_SYSTEM §35. The disclosure is a native <details>, so it must open
  // with scripting disabled.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');

  const details = page.locator('.nav-disclosure');
  await expect(details).toBeVisible();

  await page.locator('.nav-disclosure summary').click();
  await expect(page.locator('.nav-panel')).toBeVisible();
  await expect(page.locator('.nav-panel-link')).toHaveCount(4);

  await context.close();
});

test('the page renders its content with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main section[id]')).toHaveCount(7);
  await expect(page.locator('img')).not.toHaveCount(0);

  await context.close();
});

test.describe('action pairs at narrow widths', () => {
  // Each pair stacks below the width its own content needs, rather than at a
  // shared device breakpoint: the hero controls measure 404px and the
  // flagship ones 341px, so they cannot sensibly change over at the same
  // place. Both sides of each threshold are checked, because the failure
  // being guarded against is a pair sitting on one line with almost no slack,
  // which is what leaves the layout to be decided by which font has loaded.
  const CASES = [
    { name: 'hero', selector: '.hero-actions', stacksBelow: 560 },
    { name: 'flagship', selector: '.flagship-actions', stacksBelow: 480 },
  ];

  for (const { name, selector, stacksBelow } of CASES) {
    test(`${name} controls stack below ${stacksBelow}px and sit on one line above it`, async ({
      browser,
    }) => {
      for (const [width, expected] of [
        [320, 'stack'],
        [390, 'stack'],
        [stacksBelow - 1, 'stack'],
        [stacksBelow, 'row'],
        [stacksBelow + 120, 'row'],
      ] as const) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        await page.goto('/');
        await page.evaluate(() => document.fonts.ready);

        const measured = await page.evaluate((sel) => {
          const group = document.querySelector(sel)!;
          const items = [...group.children].filter(
            (child) => child.getBoundingClientRect().width > 0,
          );
          const style = getComputedStyle(group);
          const gap = parseFloat(style.columnGap || style.gap) || 0;
          const needed =
            items.reduce((total, item) => total + item.getBoundingClientRect().width, 0) +
            gap * (items.length - 1);
          const tops = new Set(
            items.map((item) => Math.round(item.getBoundingClientRect().top)),
          );
          return {
            layout: tops.size === 1 ? 'row' : 'stack',
            slack: group.getBoundingClientRect().width - needed,
            shortest: Math.min(...items.map((item) => item.getBoundingClientRect().height)),
            overflow: document.documentElement.scrollWidth - window.innerWidth,
          };
        }, selector);

        expect(measured.layout, `${name} at ${width}px`).toBe(expected);
        // On one line there has to be real room, not a hairline of it.
        if (expected === 'row') {
          expect(measured.slack, `${name} at ${width}px must not be cramped`).toBeGreaterThan(
            40,
          );
        }
        // Stacking must not cost the controls their tap target.
        expect(
          measured.shortest,
          `${name} at ${width}px target height`,
        ).toBeGreaterThanOrEqual(44);
        expect(measured.overflow, `${name} at ${width}px`).toBeLessThanOrEqual(1);

        await context.close();
      }
    });
  }
});
