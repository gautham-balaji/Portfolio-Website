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

/**
 * P2.2: navigability and cross-references.
 *
 * The section index, the stage-to-prose links, the decision-to-stage
 * back-references and the end-of-page contact lead. The theme is that every
 * link added here has to land somewhere real, and that none of it costs the
 * project routes their static, island-free guarantee.
 */
const NAVIGABLE: { slug: string; sections: number; stageLinks: number; governed: number }[] = [
  { slug: 'chess-engine', sections: 8, stageLinks: 5, governed: 3 },
  { slug: 'legal-nlp', sections: 7, stageLinks: 4, governed: 2 },
  { slug: 'vera', sections: 7, stageLinks: 5, governed: 4 },
  { slug: 'geocounterfactual', sections: 8, stageLinks: 4, governed: 4 },
];

for (const project of NAVIGABLE) {
  test.describe(`${project.slug} navigability`, () => {
    test('has one section index listing every prose heading', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('.section-index')).toHaveCount(1);
      await expect(page.locator('.section-index-link')).toHaveCount(project.sections);

      // Page furniture is not a section of the article.
      const texts = await page
        .locator('.section-index-text')
        .evaluateAll((els) => els.map((el) => el.textContent?.trim().toLowerCase()));
      expect(texts).not.toContain('visual evidence');
      expect(texts).not.toContain('limitations');

      // The index lists the body's own headings, in order.
      const headings = await page
        .locator('.prose > h2')
        .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
      const listed = await page
        .locator('.section-index-text')
        .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
      expect(listed).toEqual(headings);
    });

    test('resolves every in-page link it renders', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => (a as HTMLAnchorElement).getAttribute('href')!.slice(1))
          // "#top" is the navigation wordmark. It is a fragment the browser
          // resolves itself, with no element behind it, and predates this work.
          .filter((id) => id && id !== 'top' && !document.getElementById(id)),
      );
      expect(broken).toEqual([]);
    });

    test('emits no duplicate element ids', async ({ page }) => {
      // Legal NLP has both a `hybrid-retrieval` stage and a `hybrid-retrieval`
      // heading. The `stage-` prefix is what keeps them apart, and this is
      // what stops the prefix from being dropped later.
      await page.goto(`/projects/${project.slug}`);

      const duplicates = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
        return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      });
      expect(duplicates).toEqual([]);
    });

    test('links mapped stages to their prose section and leaves the rest alone', async ({
      page,
    }) => {
      await page.goto(`/projects/${project.slug}`);

      const links = page.locator('.stage-link');
      await expect(links).toHaveCount(project.stageLinks);

      // Every stage link names its destination for a screen reader, rather
      // than announcing only the stage's own name.
      const named = await links.evaluateAll((els) =>
        els.every((el) => /,\s*read\s+\S/i.test(el.textContent ?? '')),
      );
      expect(named).toBe(true);
    });

    test('links decisions back to the stage they govern', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      const governed = page.locator('.decision-stage-link');
      await expect(governed).toHaveCount(project.governed);

      for (const href of await governed.evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
      )) {
        expect(href).toMatch(/^#stage-[a-z0-9-]+$/);
        await expect(page.locator(`${href}`)).toHaveCount(1);
      }
    });

    test('lands anchored sections clear of the sticky navigation', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      });

      const navHeight = await page.evaluate(
        () =>
          document.querySelector('.site-nav, header nav, header')?.getBoundingClientRect()
            .height ?? 56,
      );

      const target = await page.locator('.section-index-link').last().getAttribute('href');
      await page.locator('.section-index-link').last().click();
      await page.waitForTimeout(250);

      const top = await page.locator(target!).evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(navHeight - 1);
    });

    test('ends on a contact lead, after the project navigation and without a form', async ({
      page,
    }) => {
      await page.goto(`/projects/${project.slug}`);

      const lead = page.locator('.project-contact');
      await expect(lead).toHaveCount(1);
      await expect(lead.locator('#project-contact-heading')).toBeVisible();
      await expect(page.locator('form')).toHaveCount(0);
      // Project pages must not claim the homepage's contact anchor.
      await expect(page.locator('#contact')).toHaveCount(0);

      const order = await page.evaluate(() => {
        const nav = document.querySelector('.project-nav')!.getBoundingClientRect().top;
        const cta = document.querySelector('.project-contact')!.getBoundingClientRect().top;
        return cta > nav;
      });
      expect(order).toBe(true);
    });
  });
}

test.describe('section index placement', () => {
  test('is a sticky rail beside the prose at 1440 and a static block at 390', async ({
    browser,
  }) => {
    for (const [width, expected] of [
      [1440, 'sticky'],
      [1024, 'sticky'],
      [768, 'static'],
      [390, 'static'],
    ] as const) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto('/projects/geocounterfactual');
      await page.evaluate(() => document.fonts.ready);

      const measured = await page.evaluate(() => {
        const wrap = document.querySelector('.section-index-wrap')!;
        const prose = document.querySelector('.prose')!;
        const w = wrap.getBoundingClientRect();
        const p = prose.getBoundingClientRect();
        return {
          position: getComputedStyle(wrap).position,
          beside: w.left > p.right - 1,
          above: w.bottom <= p.top + 1,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });

      expect(measured.position, `position at ${width}px`).toBe(expected);
      if (expected === 'sticky') {
        expect(measured.beside, `rail must sit beside the prose at ${width}px`).toBe(true);
      } else {
        expect(measured.above, `index must sit above the prose at ${width}px`).toBe(true);
      }
      expect(measured.overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);

      await context.close();
    }
  });
});

/**
 * P2.3: technical parameters as specification tables.
 *
 * Configuration the projects document, relocated out of prose. The tests
 * guard three things: that only the two projects with documented
 * configuration have tables at all, that the markup is a real table rather
 * than a grid of divs, and that nothing in the presentation turns ridge
 * coefficients into a ranking.
 */
const PARAMETERS: { slug: string; tables: number; rows: number }[] = [
  { slug: 'chess-engine', tables: 3, rows: 16 },
  { slug: 'legal-nlp', tables: 0, rows: 0 },
  { slug: 'vera', tables: 0, rows: 0 },
  { slug: 'geocounterfactual', tables: 1, rows: 8 },
];

for (const project of PARAMETERS) {
  test.describe(`${project.slug} parameters`, () => {
    test('renders the expected number of tables, or none at all', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('.parameter-table')).toHaveCount(project.tables);
      await expect(page.locator('.parameters-block')).toHaveCount(project.tables > 0 ? 1 : 0);
    });

    if (project.tables === 0) return;

    test('uses real table semantics throughout', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);

      const shape = await page.evaluate(() =>
        [...document.querySelectorAll('table.parameter-table')].map((table) => {
          const rows = [...table.querySelectorAll('tbody tr')];
          return {
            caption: (table.querySelector('caption')?.textContent ?? '').trim().length,
            rows: rows.length,
            rowHeaders: rows.filter(
              (r) => r.querySelector('th')?.getAttribute('scope') === 'row',
            ).length,
            cells: rows.filter((r) => r.querySelector('td')).length,
            presentation: table.getAttribute('role'),
          };
        }),
      );

      expect(shape).toHaveLength(project.tables);
      let total = 0;
      for (const t of shape) {
        expect(t.caption).toBeGreaterThan(0);
        expect(t.rowHeaders).toBe(t.rows);
        expect(t.cells).toBe(t.rows);
        expect(t.presentation).toBeNull();
        total += t.rows;
      }
      expect(total).toBe(project.rows);
    });

    test('sets values in tabular figures', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const variants = await page
        .locator('.parameter-value')
        .evaluateAll((els) => [
          ...new Set(els.map((el) => getComputedStyle(el).fontVariantNumeric)),
        ]);
      expect(variants).toEqual(['tabular-nums']);
    });

    test('sits between the narrative and the decisions', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const order = await page.evaluate(() => {
        const top = (sel: string) =>
          document.querySelector(sel)!.getBoundingClientRect().top + window.scrollY;
        return {
          prose: top('.prose'),
          params: top('.parameters-block'),
          decisions: top('.decisions-wrap'),
          metrics: top('.metrics'),
        };
      });
      expect(order.params).toBeGreaterThan(order.prose);
      expect(order.params).toBeLessThan(order.decisions);
      expect(order.decisions).toBeLessThan(order.metrics);
    });

    test('links each caption to the prose section it documents', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const links = page.locator('.parameter-caption-link');
      await expect(links).toHaveCount(project.tables);

      for (const href of await links.evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
      )) {
        expect(href).toMatch(/^#[a-z0-9-]+$/);
        await expect(page.locator(href!)).toHaveCount(1);
      }
    });

    test('draws no chart, bar or proportional visualisation', async ({ page }) => {
      // DESIGN_SYSTEM bans progress bars, and ridge coefficients on
      // differently scaled inputs must never be shown as comparable lengths.
      await page.goto(`/projects/${project.slug}`);

      await expect(page.locator('.parameters-block progress')).toHaveCount(0);
      await expect(page.locator('.parameters-block meter')).toHaveCount(0);
      await expect(page.locator('.parameters-block svg')).toHaveCount(0);
      await expect(page.locator('.parameters-block canvas')).toHaveCount(0);

      const proportional = await page.evaluate(
        () =>
          [...document.querySelectorAll('.parameters-block *')].filter((el) =>
            /width\s*:\s*[\d.]+%/.test(el.getAttribute('style') ?? ''),
          ).length,
      );
      expect(proportional).toBe(0);
    });

    test('scrolls inside its own container rather than the page', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const containers = await page
        .locator('.parameters-scroll')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).overflowX));
      expect(containers.length).toBeGreaterThan(0);
      expect([...new Set(containers)]).toEqual(['auto']);
    });
  });
}

test('the chess ridge table states the coefficients without ranking them', async ({
  page,
}) => {
  await page.goto('/projects/chess-engine');

  const table = page.locator('.parameter-table').filter({ hasText: 'Ridge fusion' });
  await expect(table).toHaveCount(1);

  const values = await table
    .locator('.parameter-value')
    .evaluateAll((els) => els.map((el) => el.firstChild?.textContent?.trim()));
  expect(values).toEqual(['330.9', '32.4', '5.17', '0.79', '0.019']);

  const block = (await page.locator('.parameters-block').innerText()).toLowerCase();
  expect(block).toContain('not feature importance');
  expect(block).toContain('normalised');
  expect(block).not.toContain('most important');
  expect(block).not.toMatch(/\brank/);
  expect(block).not.toContain('%');
});

test('chess states each relocated number once in the tables, not again in prose', async ({
  page,
}) => {
  // Relocation, not duplication: before P2.3 the page stated its headline
  // numbers three times each, and the risk of adding a table was a fourth.
  await page.goto('/projects/chess-engine');

  const zones = await page.evaluate(() => {
    const read = (sel: string) =>
      (document.querySelector(sel) as HTMLElement)?.innerText ?? '';
    return {
      prose: read('.prose'),
      params: read('.parameters-block'),
      main: read('main'),
    };
  });

  // Configuration now lives only in the tables.
  for (const moved of ['Conv2D', '500 trees', 'StandardScaler']) {
    expect(zones.params, `${moved} in tables`).toContain(moved);
    expect(zones.prose, `${moved} must have left the prose`).not.toContain(moved);
  }

  // The ridge coefficients appear in the table and in the decision that
  // argues for a linear model, and nowhere else.
  expect(zones.main.split('330.9').length - 1).toBeLessThanOrEqual(2);
  expect(zones.prose).not.toContain('330.9');

  // The factual tripwires are untouched.
  expect(zones.main).toContain('0.506');
  expect(zones.main).toContain('Pearson');
  expect(zones.main).not.toMatch(/50\.6\s*%/);
});

test('geocounterfactual keeps its constraint reasoning in prose and its values in the table', async ({
  page,
}) => {
  await page.goto('/projects/geocounterfactual');

  const params = await page.locator('.parameters-block').innerText();
  const prose = await page.locator('.prose').innerText();

  expect(params).toContain('2.5 degrees');
  expect(prose).not.toContain('2.5');
  expect(prose).toContain('gravity does not permit it');

  // The undocumented terms must never appear.
  for (const absent of ['MNDWI', 'focal mean', 'UTM', '/api/']) {
    expect(params, `must not surface ${absent}`).not.toContain(absent);
  }
  // Simulation time is current behaviour, not configuration.
  expect(params).not.toContain('146');
  // The NDVI threshold is not published, and no number may stand in for it.
  expect(params).toContain('not published');
});

/**
 * P2.4: project-specific signature blocks.
 *
 * Two projects have one and two deliberately do not, so the absences are
 * asserted as firmly as the presences. The two blocks also have opposite
 * failure modes: Legal NLP must never draw a graph whose edge endpoints are
 * undocumented, and VERA must never imply a measurement or a mechanism.
 */
const SIGNATURES: {
  slug: string;
  kind: 'graph-schema' | 'critical-path' | null;
  parameters: number;
}[] = [
  { slug: 'chess-engine', kind: null, parameters: 3 },
  { slug: 'legal-nlp', kind: 'graph-schema', parameters: 0 },
  { slug: 'vera', kind: 'critical-path', parameters: 0 },
  { slug: 'geocounterfactual', kind: null, parameters: 1 },
];

for (const project of SIGNATURES) {
  test.describe(`${project.slug} signature`, () => {
    test('renders one signature block, or none', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('.signature-block')).toHaveCount(project.kind ? 1 : 0);
      await expect(page.locator('.schema')).toHaveCount(
        project.kind === 'graph-schema' ? 1 : 0,
      );
      await expect(page.locator('.critical-path')).toHaveCount(
        project.kind === 'critical-path' ? 1 : 0,
      );
      // P2.3 must be untouched by P2.4.
      await expect(page.locator('.parameter-table')).toHaveCount(project.parameters);
    });

    test('keeps one h1 and a valid heading order', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('main h1')).toHaveCount(1);
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2, main h3')].map((h) =>
          Number(h.tagName[1]),
        ),
      );
      let previous = levels[0] ?? 1;
      for (const level of levels) {
        expect(level - previous).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    test('emits no duplicate element ids', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const duplicates = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
        return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      });
      expect(duplicates).toEqual([]);
    });

    if (!project.kind) return;

    test('sits between the narrative and the decisions', async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const order = await page.evaluate(() => {
        const top = (sel: string) =>
          document.querySelector(sel)!.getBoundingClientRect().top + window.scrollY;
        return {
          prose: top('.prose'),
          signature: top('.signature-block'),
          decisions: top('.decisions-wrap'),
        };
      });
      expect(order.signature).toBeGreaterThan(order.prose);
      expect(order.signature).toBeLessThan(order.decisions);
    });

    test('draws nothing', async ({ page }) => {
      // Neither block may become a picture: Legal's endpoints are
      // undocumented and VERA's mechanism is undocumented.
      await page.goto(`/projects/${project.slug}`);
      for (const tag of ['svg', 'canvas', 'progress', 'meter', 'img']) {
        await expect(page.locator(`.signature-block ${tag}`)).toHaveCount(0);
      }
      const proportional = await page.evaluate(
        () =>
          [...document.querySelectorAll('.signature-block *')].filter((el) =>
            /width\s*:\s*[\d.]+%/.test(el.getAttribute('style') ?? ''),
          ).length,
      );
      expect(proportional).toBe(0);
    });
  });
}

test('the legal graph schema states three named vocabularies and connects nothing', async ({
  page,
}) => {
  await page.goto('/projects/legal-nlp');

  const sets = page.locator('.schema-set');
  await expect(sets).toHaveCount(3);

  const contents = await sets.evaluateAll((els) =>
    els.map((el) => ({
      label: el.querySelector('.schema-set-label')?.textContent?.trim(),
      named: Boolean(el.getAttribute('aria-labelledby')),
      lists: el.querySelectorAll('ul').length,
      items: [...el.querySelectorAll('li')].map((li) => li.textContent?.trim()),
    })),
  );

  expect(contents.map((s) => s.label)).toEqual([
    'Node types',
    'Relationship types',
    'Graph analytics',
  ]);
  expect(contents.every((s) => s.named && s.lists === 1)).toBe(true);
  expect(contents[0]?.items).toEqual(['Cases', 'Statutes', 'Sections', 'Courts', 'Judges']);
  expect(contents[1]?.items).toEqual(['CITES', 'APPLIES', 'DECIDED_BY', 'INVOLVES']);
  expect(contents[2]?.items).toEqual(['PageRank', 'Centrality', 'Community detection']);

  // No arrow, no endpoint pairing, no invented count.
  const block = await page.locator('.signature-block').innerText();
  expect(block).not.toMatch(/->|→|⟶/);
  expect(block).toContain('not published');
});

test('the vera response path shows one sequence and states the change as text', async ({
  page,
}) => {
  await page.goto('/projects/vera');

  // Exactly one ordered sequence: a second would assert concurrency the
  // source never describes.
  const steps = page.locator('.cp-steps');
  await expect(steps).toHaveCount(1);
  await expect(page.locator('.cp-step')).toHaveCount(5);

  const ordered = await steps.evaluateAll((els) => els.map((el) => el.tagName));
  expect(ordered).toEqual(['OL']);

  const statements = await page
    .locator('.cp-statement')
    .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
  expect(statements).toEqual([
    'Speech generation was moved off the blocking path.',
    'The response cycle no longer waits on audio rendering.',
  ]);

  // No authored digit anywhere in the block. The visible 01-05 markers are
  // CSS counters on the step list, the same ordinal treatment the decisions
  // and the architecture legend use, and they are not part of the content:
  // `innerText` does not include generated content, which is exactly the
  // distinction being asserted. A number that arrived from the content would
  // be read as a measurement, and none was ever recorded.
  const block = await page.locator('.signature-block').innerText();
  expect(block).not.toMatch(/\d/);
  for (const banned of ['latency', 'parallel', 'concurrent', 'faster', '%', 'ms']) {
    expect(block.toLowerCase(), `"${banned}" must not appear`).not.toContain(banned);
  }

  // And the markers really are generated rather than authored, so the check
  // above is measuring what it claims to.
  const markers = await page
    .locator('.cp-step')
    .first()
    .evaluate((el) => ({
      authored: el.textContent ?? '',
      generated: getComputedStyle(el, '::before').content,
    }));
  expect(markers.authored).not.toMatch(/\d/);
  // Chromium reports the specified value rather than the resolved string,
  // which is the stronger evidence anyway: the marker is a counter function,
  // so no digit was ever authored into the content.
  expect(markers.generated).toContain('counter(');
});

test('chess and geocounterfactual are unchanged by P2.4', async ({ page }) => {
  await page.goto('/projects/chess-engine');
  await expect(page.locator('.signature-block')).toHaveCount(0);
  await expect(page.locator('.parameter-table')).toHaveCount(3);
  let body = await page.locator('main').innerText();
  expect(body).toContain('0.506');
  expect(body).toContain('Pearson');
  expect(body).not.toMatch(/50\.6\s*%/);

  await page.goto('/projects/geocounterfactual');
  await expect(page.locator('.signature-block')).toHaveCount(0);
  await expect(page.locator('.parameter-table')).toHaveCount(1);
  body = await page.locator('.parameters-block').innerText();
  expect(body).toContain('not published');
  expect(body).not.toContain('146');
});
