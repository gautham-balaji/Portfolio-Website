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

/**
 * P2.1: one canonical architecture per page.
 *
 * Each project used to render its pipeline twice, from two sources that had
 * drifted apart. It now renders once, as a single figure whose drawing carries
 * the topology and whose visible legend carries the detail.
 */
const ARCHITECTURES: {
  slug: string;
  stages: number;
  /** Stages drawn as a pair of nodes rather than one box. */
  parallel: number;
  loop?: boolean;
}[] = [
  { slug: 'chess-engine', stages: 5, parallel: 1 },
  { slug: 'legal-nlp', stages: 6, parallel: 1 },
  { slug: 'vera', stages: 7, parallel: 0 },
  { slug: 'geocounterfactual', stages: 7, parallel: 0, loop: true },
];

for (const project of ARCHITECTURES) {
  test.describe(`${project.slug} architecture`, () => {
    test('renders exactly once, as one drawing with one legend', async ({ page }) => {
      // The consolidation this suite exists to protect: no page may grow a
      // second full architecture rendering back.
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('svg.arch-svg')).toHaveCount(1);
      await expect(page.locator('.stage-list')).toHaveCount(1);
      // The retired component and its markup must not return.
      await expect(page.locator('.flow-steps')).toHaveCount(0);
      await expect(page.locator('.dg-sr')).toHaveCount(0);
    });

    test('sits inside a single numbered figure with one caption', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      const figure = page.locator('figure').filter({ has: page.locator('svg.arch-svg') });
      await expect(figure).toHaveCount(1);
      await expect(figure.locator('figcaption')).toHaveCount(1);
      await expect(figure.locator('.stage-list')).toHaveCount(1);
    });

    test('names the drawing and the legend for assistive technology', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      const svg = page.locator('svg.arch-svg');
      await expect(svg).toHaveAttribute('role', 'img');
      const ariaLabel = await svg.getAttribute('aria-label');
      expect(ariaLabel?.length ?? 0).toBeGreaterThan(20);

      // The legend is a real list and says what it is a list of. The old
      // flow block rendered its title as an unassociated paragraph.
      const label = await page.locator('.stage-list').getAttribute('aria-label');
      expect(label).toMatch(/stages$/);
    });

    test('lists every stage, with its documented detail', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('.stage-list > .stage')).toHaveCount(project.stages);
      await expect(page.locator('.stage-list .is-parallel')).toHaveCount(project.parallel);

      // A stage is worth listing only if it says something: every entry
      // carries a detail line, or nodes that do.
      const empty = await page
        .locator('.stage-list > .stage')
        .evaluateAll((items) =>
          items
            .filter((item) => !item.querySelector('.stage-detail'))
            .map((item) => item.getAttribute('data-stage')),
        );
      expect(empty).toEqual([]);
    });

    test('draws the same nodes the legend names, in the same order', async ({ page }) => {
      // The drawing and its legend are generated from one list, and this is
      // what keeps them from being allowed to disagree again.
      await page.goto(`/projects/${project.slug}`);

      const drawn = await page
        .locator('svg.arch-svg g[data-stage]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-stage')));
      const listed = await page
        .locator('.stage-list [data-stage]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-stage')));

      expect(drawn.length).toBeGreaterThan(0);
      // A paired stage is one legend entry holding two drawn boxes, so the
      // legend is a superset: every drawn box must appear, in order.
      expect(listed.filter((id) => drawn.includes(id))).toEqual(drawn);
    });

    if (project.loop) {
      test('states the return path in the drawing and in the legend', async ({ page }) => {
        await page.goto(`/projects/${project.slug}`);

        const ariaLabel = await page.locator('svg.arch-svg').getAttribute('aria-label');
        expect(ariaLabel).toMatch(/routing back/i);
        // Referenced by name, not by stage number: the endpoints are ids now.
        expect(ariaLabel).toMatch(/from Critic to Generator/i);

        await expect(page.locator('.stage-loop')).toHaveCount(1);
        await expect(page.getByText(/on reject, returns to Generator/i)).toHaveCount(1);
      });
    } else {
      test('shows no return path, because none is documented', async ({ page }) => {
        await page.goto(`/projects/${project.slug}`);
        await expect(page.locator('.stage-loop')).toHaveCount(0);
      });
    }
  });
}

test('GeoCounterfactual keeps the stage its old diagram dropped', async ({ page }) => {
  // The pre-P2.1 drawing omitted Earth observation, so the page described a
  // system with no satellite input while the list beside it did not.
  await page.goto('/projects/geocounterfactual');

  const legend = page.locator('.stage-list');
  await expect(legend.locator('[data-stage="earth-observation"]')).toHaveCount(1);
  await expect(page.locator('svg.arch-svg g[data-stage="earth-observation"]')).toHaveCount(1);

  const detail = await legend.locator('[data-stage="earth-observation"]').textContent();
  for (const token of ['Sentinel-2', 'Copernicus DEM', 'CHIRPS', '10m']) {
    expect(detail).toContain(token);
  }
});

test('Legal NLP marks its decision point on retrieval, not on the result', async ({
  page,
}) => {
  // The two old sources disagreed: the flow gated Hybrid retrieval and the
  // diagram gated Ranked cases, so the homepage and this page contradicted
  // each other about where the project decides anything.
  await page.goto('/projects/legal-nlp');

  const gated = page.locator('.stage-list > .stage.is-gate');
  await expect(gated).toHaveCount(1);
  await expect(gated).toHaveAttribute('data-stage', 'hybrid-retrieval');
  await expect(gated.locator('.stage-flag').first()).toBeVisible();
});

test('the chess page never presents 0.506 as an accuracy figure', async ({ page }) => {
  // MASTER_CONTENT §23 is explicit: "Do not call this 50.6% accuracy."
  await page.goto('/projects/chess-engine');

  const body = (await page.locator('main').textContent()) ?? '';
  expect(body).not.toMatch(/50\.6\s*%/);
  expect(body).toContain('0.506');
  expect(body).toContain('Pearson');
});

test('the chess training-loss chart is a real, resolvable image with descriptive alt text', async ({
  page,
}) => {
  // The one real, verified asset integrated in Phase 5 (a cropped training
  // run chart from the chess-bot repository, not a placeholder).
  await page.goto('/projects/chess-engine');

  const img = page.locator('figure img[src*="training-loss"]');
  await expect(img).toHaveCount(1);

  const alt = await img.getAttribute('alt');
  expect(alt?.length ?? 0).toBeGreaterThan(20);
  expect(alt).not.toMatch(/^figure \d+ placeholder/i);

  const src = await img.getAttribute('src');
  const response = await page.request.get(src!);
  expect(response.status()).toBe(200);
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

test.describe('/404 layout stability', () => {
  test('keeps its two calls to action off the wrap threshold at 360px', async ({
    browser,
  }) => {
    // Regression guard for the site's last real layout shift. At 360px the two
    // buttons need 332px of a 328px line: laid out as a wrapping row they fitted
    // during first paint with the fallback mono face, then wrapped when IBM Plex
    // Mono arrived fractionally wider, dropping the project index and footer 57px
    // and costing 0.096 CLS. Below 400px they are stacked from the first frame,
    // so no font can change the outcome.
    const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
    const page = await context.newPage();
    await page.goto('/404');
    await page.evaluate(() => document.fonts.ready);

    const tops = await page
      .locator('.actions .btn')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));

    expect(tops).toHaveLength(2);
    expect(tops[0], 'the controls must be stacked, not side by side').not.toBe(tops[1]);

    await context.close();
  });
});
