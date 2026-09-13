import { expect, test } from '@playwright/test';

/**
 * Project detail routes.
 *
 * Structural and factual guarantees. Several of these encode MASTER_CONTENT.md
 * §23 boundaries directly, so a future copy edit that softens a limitation or
 * invents a link fails the build rather than shipping quietly.
 */

const PROJECTS = [
  { slug: 'chess-engine', title: 'XAI Chess Engine', order: '01', repo: true },
  { slug: 'legal-nlp', title: 'Legal NLP Knowledge Graph', order: '02', repo: false },
  { slug: 'vera', title: 'VERA', order: '03', repo: false },
  { slug: 'geocounterfactual', title: 'GeoCounterfactual', order: '04', repo: true },
] as const;

for (const project of PROJECTS) {
  test.describe(`/projects/${project.slug}`, () => {
    test('resolves with its title, number and metadata rail', async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);

      await expect(page.locator('main h1')).toHaveText(project.title);
      await expect(page.locator('.eyebrow-number')).toHaveText(project.order);

      // Status, Year, Role, Stack and Source are all required.
      for (const key of ['Status', 'Year', 'Role', 'Stack', 'Source']) {
        await expect(page.locator('.meta-rail dt', { hasText: key })).toHaveCount(1);
      }
    });

    test('emits a correct canonical URL and a unique description', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://gautham-balaji.vercel.app/projects/${project.slug}`,
      );

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(40);

      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        'content',
        'article',
      );
    });

    test('states its limitations', async ({ page }) => {
      // MASTER_CONTENT §23 defines a boundary for every project. Removing the
      // limitations block would make the rest of the page less trustworthy.
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('#limitations-heading')).toBeVisible();
      expect(await page.locator('.limitation').count()).toBeGreaterThan(0);
    });

    test('has exactly one h1 and a valid heading order', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('main h1')).toHaveCount(1);

      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2, main h3')].map((h) =>
          Number(h.tagName[1]),
        ),
      );

      // No heading may skip a level relative to the one before it.
      let previous = levels[0] ?? 1;
      for (const level of levels) {
        expect(level - previous).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    test('links back to the work index and on to two other projects', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('.back-link')).toHaveAttribute('href', '/#work');

      const navLinks = page.locator('.project-nav .nav-link');
      await expect(navLinks).toHaveCount(2);

      for (const href of await navLinks.evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).getAttribute('href')),
      )) {
        expect(href).toMatch(/^\/projects\/[a-z-]+$/);
        // Never link a project to itself.
        expect(href).not.toBe(`/projects/${project.slug}`);
      }
    });

    test('renders every declared figure', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const figures = page.locator('figure');
      expect(await figures.count()).toBeGreaterThan(0);

      // A plate must never be mistaken for a real capture: each one announces
      // its kind and that it is not yet captured.
      const plates = page.locator('.plate');
      for (let i = 0; i < (await plates.count()); i++) {
        const label = await plates.nth(i).getAttribute('aria-label');
        expect(label?.toLowerCase()).toContain('not yet captured');
      }
    });

    test('does not scroll horizontally', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    });

    if (!project.repo) {
      test('renders no outbound project link', async ({ page }) => {
        // MASTER_CONTENT §10 and §23 forbid inventing a URL for Legal NLP and
        // VERA. The rail must say so rather than omit the row.
        await page.goto(`/projects/${project.slug}`);
        await expect(page.locator('.meta-absent')).toHaveText('No public repository');

        const projectLinks = await page
          .locator('.meta-rail a[href^="http"]')
          .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
        expect(projectLinks).toEqual([]);
      });
    } else {
      test('links to its real repository', async ({ page }) => {
        await page.goto(`/projects/${project.slug}`);
        const href = await page
          .locator('.meta-rail a[href^="http"]')
          .first()
          .getAttribute('href');
        expect(href).toMatch(/^https:\/\/github\.com\/gautham-balaji\//);
      });
    }
  });
}

test('the chess page never presents 0.506 as an accuracy figure', async ({ page }) => {
  // MASTER_CONTENT §23 is explicit: "Do not call this 50.6% accuracy."
  await page.goto('/projects/chess-engine');

  const body = (await page.locator('main').textContent()) ?? '';
  expect(body).not.toMatch(/50\.6\s*%/);
  expect(body).toContain('0.506');
  expect(body).toContain('Pearson');
});

test('every project is reachable from the homepage index', async ({ page }) => {
  await page.goto('/');

  const hrefs = await page
    .locator('#work a[href^="/projects/"]')
    .evaluateAll((els) =>
      [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute('href')))].sort(),
    );

  expect(hrefs).toEqual([
    '/projects/chess-engine',
    '/projects/geocounterfactual',
    '/projects/legal-nlp',
    '/projects/vera',
  ]);
});

test('project pages hydrate no islands', async ({ page }) => {
  // Asserted as island count rather than script count: this suite runs against
  // `astro dev`, which injects its own HMR client and toolbar. The production
  // build emits no page scripts at all beyond the JSON-LD block.
  await page.goto('/projects/chess-engine');
  await expect(page.locator('astro-island')).toHaveCount(0);
});

test.describe('/404', () => {
  test('serves a 404 status with the specified copy', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);

    await expect(page.locator('main h1')).toHaveText('404');
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
    await expect(page.getByText('You can go back to the work.')).toBeVisible();
  });

  test('offers routes home, to the work index, and to every project', async ({ page }) => {
    await page.goto('/404');

    await expect(page.locator('a[href="/"].btn')).toBeVisible();
    await expect(page.locator('a[href="/#work"].btn')).toBeVisible();
    await expect(page.locator('.index-link')).toHaveCount(4);
  });
});
