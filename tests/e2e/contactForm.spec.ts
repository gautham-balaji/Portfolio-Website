import { expect, test, type Page, type Route } from '@playwright/test';
import type { ContactResponse } from '../../src/lib/contact';

/**
 * Contact form interaction.
 *
 * The dev server this suite runs against has no Resend or Upstash
 * credentials configured (see .env.example), so a genuinely valid submission
 * always reaches the real endpoint's `unavailable` (503) branch
 * deterministically -- no network calls to a real provider are ever made,
 * with or without mocking. Tests that need a specific outcome (success,
 * server error, rate limit, network failure) intercept `/api/contact` with
 * `page.route()` instead, per the brief: mock the provider boundary, never
 * require real credentials.
 *
 * One exception needs no mock at all: a submission with the honeypot filled
 * in is answered `{ ok: true }` by the real endpoint with no external call,
 * which is used below to prove the real success path end-to-end (including
 * the no-JS HTML fallback) without touching Resend.
 */

async function fulfillJson(route: Route, body: ContactResponse, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function fillValidForm(page: Page) {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page
    .getByLabel('Message')
    .fill('I would like to talk to you about a backend systems role.');
}

test.describe('contact form: structure and accessibility', () => {
  test('every field has an associated label', async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });

  test('the honeypot is present but excluded from the tab order', async ({ page }) => {
    await page.goto('/#contact');
    const honeypot = page.locator('#contact-company');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot).toHaveAttribute('name', 'company');
    // Visually hidden, not display:none -- a naive bot filling "every input"
    // by DOM query still finds it, which is the point of a honeypot.
    await expect(page.locator('.honeypot')).toHaveCSS('clip-path', /inset/);
  });

  test('required fields carry real HTML5 constraints', async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.getByLabel('Name')).toHaveAttribute('required', '');
    await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
    await expect(page.getByLabel('Message')).toHaveAttribute('required', '');
  });

  test('is keyboard operable end to end', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel('Name').focus();
    await page.keyboard.type('Ada Lovelace');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
    await page.keyboard.type('ada@example.com');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Message')).toBeFocused();
    await page.keyboard.type('A message long enough to pass validation checks.');
  });

  test('does not scroll horizontally at 360, 768 or 1920', async ({ page }) => {
    for (const width of [360, 768, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#contact');
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    }
  });
});

test.describe('contact form: client-side wiring', () => {
  test('posts JSON including a fresh startedAt once the island has hydrated', async ({
    page,
  }) => {
    await page.goto('/#contact');

    const requestBody = page.waitForRequest(
      (req) => req.url().includes('/api/contact') && req.method() === 'POST',
    );
    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    const request = await requestBody;

    expect(request.headers()['content-type']).toContain('application/json');
    const body = request.postDataJSON() as Record<string, unknown>;
    expect(body.name).toBe('Ada Lovelace');
    expect(body.email).toBe('ada@example.com');
    expect(typeof body.startedAt).toBe('number');
    expect(body.startedAt as number).toBeGreaterThan(Date.now() - 60_000);
    expect(body.company).toBe('');
  });

  test('shows a submitting state through more than button text alone', async ({ page }) => {
    await page.goto('/#contact');
    // A generous artificial delay, not a tight one: under full-suite parallel
    // load, many concurrent Chromium processes can add real scheduling jitter
    // between the click resolving and these assertions starting to poll. A
    // short delay risks the mocked response already having landed and the
    // "submitting" DOM already having been replaced by "success" before the
    // first assertion below ever runs, which is a false failure of the test,
    // not of the app.
    await page.route('**/api/contact', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await fulfillJson(route, { ok: true });
    });

    await fillValidForm(page);
    const submit = page.getByRole('button', { name: 'Send message' });
    await submit.click();

    await expect(page.getByRole('button', { name: 'Sending message…' })).toBeDisabled();
    await expect(page.locator('form.contact-form')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.form-status').first()).toHaveText('Sending message…');
  });

  test('prevents a duplicate submission from a second click while in flight', async ({
    page,
  }) => {
    await page.goto('/#contact');
    let hits = 0;
    // See the comment on the previous test: a generous delay leaves real
    // margin for both clicks to land inside the in-flight window even under
    // heavy parallel scheduling jitter.
    await page.route('**/api/contact', async (route) => {
      hits += 1;
      await new Promise((r) => setTimeout(r, 1500));
      await fulfillJson(route, { ok: true });
    });

    await fillValidForm(page);
    // Located by a stable selector, not by accessible name: the name itself
    // changes to "Sending message…" after the first click, so re-resolving
    // getByRole('button', { name: 'Send message' }) for the second click
    // would just wait forever for a button that no longer exists.
    const submit = page.locator('button.form-submit');
    await submit.click();
    // The button is disabled synchronously on the first click; a second
    // click while disabled must not reach the network layer at all.
    await submit.click({ force: true });
    await page.waitForTimeout(500);

    expect(hits).toBe(1);
  });
});

test.describe('contact form: success', () => {
  test('shows the established success copy and moves focus to it', async ({ page }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) => fulfillJson(route, { ok: true }));

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    const success = page.getByRole('status').filter({ hasText: 'Message sent' });
    await expect(success).toBeVisible();
    await expect(success).toContainText("I'll get back to you.");
    await expect(success).toBeFocused();

    // MASTER_CONTENT §03: no generic SaaS phrasing.
    await expect(page.locator('body')).not.toContainText(
      'Your request has been successfully processed',
    );
  });

  test('replaces the form so stale fields cannot be resubmitted', async ({ page }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) => fulfillJson(route, { ok: true }));

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toBeVisible();

    await expect(page.locator('form.contact-form')).toHaveCount(0);
  });

  test('"Send another message" returns a fresh, empty form', async ({ page }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) => fulfillJson(route, { ok: true }));

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.getByRole('button', { name: 'Send another message' }).click();

    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
  });
});

test.describe('contact form: errors', () => {
  test('the general error region is exposed to assistive technology as an alert', async ({
    page,
  }) => {
    // A structural check, kept separate from the content assertions in the
    // tests below: those use a CSS locator rather than getByRole('alert')
    // because Chromium's accessibility tree can lag a DOM update by a beat
    // under heavy parallel load, which made a role-based content assertion
    // occasionally flake. The role itself is static markup, not a transient
    // state, so it is verified once, directly, here.
    await page.goto('/#contact');
    await expect(page.locator('.form-status-error')).toHaveAttribute('role', 'alert');
  });

  test('validation errors are tied to their fields and move focus to the first one', async ({
    page,
  }) => {
    await page.goto('/#contact');
    const fieldErrors = { email: 'Please enter a valid email address.' };
    await page.route('**/api/contact', (route) =>
      fulfillJson(route, { ok: false, error: 'validation', fieldErrors }, 400),
    );

    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page
      .getByLabel('Message')
      .fill('A message long enough to pass client-side validation.');
    await page.getByRole('button', { name: 'Send message' }).click();

    const email = page.getByLabel('Email');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email-error')).toHaveText(fieldErrors.email);
    await expect(email).toBeFocused();

    // The value the visitor already typed must survive a failed submit.
    await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
  });

  test('a rate-limited response is announced and explains when to retry', async ({ page }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) =>
      fulfillJson(route, { ok: false, error: 'rate_limited', retryAfterSeconds: 42 }, 429),
    );

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.locator('.form-status-error')).toContainText('Too many messages');
    await expect(page.locator('.form-status-error')).toContainText('42 seconds');
  });

  test('a server error offers the direct email address as a fallback', async ({ page }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) =>
      fulfillJson(route, { ok: false, error: 'server' }, 502),
    );

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.locator('.form-status-error')).toContainText('Something went wrong');
    // Scoped to the error hint specifically: the CTA column beside the form
    // always shows its own large mailto link with the same address, so an
    // unscoped locator would match both and fail Playwright's strict mode.
    await expect(page.locator('.field-hint a')).toHaveAttribute(
      'href',
      'mailto:gautham.balajis@gmail.com',
    );
  });

  test('an unreachable server is reported honestly as a network problem, not a send', async ({
    page,
  }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) => route.abort('failed'));

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.locator('.form-status-error')).toContainText(
      'Could not reach the server',
    );
    // Must not show the success panel for a request that never completed.
    await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });

  test('can be retried immediately after an error without reloading', async ({ page }) => {
    await page.goto('/#contact');
    let attempt = 0;
    await page.route('**/api/contact', (route) => {
      attempt += 1;
      if (attempt === 1) return fulfillJson(route, { ok: false, error: 'server' }, 500);
      return fulfillJson(route, { ok: true });
    });

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('.form-status-error')).toContainText('Something went wrong');

    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toBeVisible();
  });
});

test.describe('contact form: reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the full submit-to-success flow completes with no reliance on animation', async ({
    page,
  }) => {
    await page.goto('/#contact');
    await page.route('**/api/contact', (route) => fulfillJson(route, { ok: true }));

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toBeVisible();
  });
});

test.describe('contact form: works without JavaScript', () => {
  // reducedMotion: 'reduce' here is a stability fix, not a motion test: with
  // JavaScript disabled, `page.goto('/#contact')` triggers the browser's own
  // anchor scroll, and global.css's `html { scroll-behavior: smooth }`
  // animates it. Playwright's actionability checks then see the submit
  // button's position still changing frame to frame and refuse to click it
  // ("element is not stable"). Reduced motion resolves to instant scrolling
  // via this project's own reduced-motion override, which is real production
  // behaviour, not a test-only shortcut.
  test('the honeypot success path proves the real no-JS fallback page end to end', async ({
    browser,
  }) => {
    // A filled honeypot is answered `{ ok: true }` by the real endpoint with
    // no Resend call, so this exercises the genuine success response -- not
    // a mock -- for the one outcome the dev server can produce deterministically.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/#contact');

    await page.locator('#contact-name').fill('Ada Lovelace');
    await page.locator('#contact-email').fill('ada@example.com');
    await page
      .locator('#contact-message')
      .fill('A message long enough to pass validation checks.');
    // The honeypot exists in the DOM (see the structural test above); a real
    // browser without JS submits whatever value is present, so setting one
    // stands in for "an automated filler completed every input it found".
    await page.locator('#contact-company').fill('Automated Co');

    await page.locator('form.contact-form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/api\/contact/);
    await expect(page.locator('h1')).toHaveText('Message sent');
    await expect(page.locator('body')).toContainText("I'll get back to you.");
    await expect(page.locator('a[href="/#contact"]')).toBeVisible();

    await context.close();
  });

  test('a genuine submission renders the honest unavailable fallback, not raw JSON', async ({
    browser,
  }) => {
    // No Resend key is configured for this dev server (see .env.example), so
    // a real, valid, non-bot submission deterministically reaches the
    // `unavailable` branch. This proves the negotiation picks HTML for a
    // native form POST without mocking anything.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/#contact');

    await page.locator('#contact-name').fill('Ada Lovelace');
    await page.locator('#contact-email').fill('ada@example.com');
    await page
      .locator('#contact-message')
      .fill('A message long enough to pass validation checks, sent with JavaScript off.');

    const response = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/contact')),
      page.locator('form.contact-form button[type="submit"]').click(),
    ]).then(([r]) => r);

    expect(response.status()).toBe(503);
    expect(response.headers()['content-type']).toContain('text/html');
    await expect(page.locator('h1')).toHaveText('Messages cannot be sent right now');
    await expect(page.locator('a[href^="mailto:"]')).toHaveAttribute(
      'href',
      'mailto:gautham.balajis@gmail.com',
    );
    await expect(page.locator('a[href="/#contact"]')).toBeVisible();

    await context.close();
  });

  test('a no-JS validation failure lists the specific problems in plain HTML', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/#contact');

    // A value the native `minlength`/`required` constraints cannot catch, so
    // the request genuinely reaches the server: 25 raw characters clears
    // `minlength={20}` and satisfies `required`, but the server's schema
    // trims whitespace before checking length, so this becomes empty and
    // fails validation there. A short non-whitespace string would instead be
    // blocked by the browser's own native validation UI before any request
    // is sent at all, which is a different (already-covered) case.
    await page.locator('#contact-name').fill('Ada Lovelace');
    await page.locator('#contact-email').fill('ada@example.com');
    await page.locator('#contact-message').fill(' '.repeat(25));

    const response = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/contact')),
      page.locator('form.contact-form button[type="submit"]').click(),
    ]).then(([r]) => r);

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('text/html');
    await expect(page.locator('li')).toContainText(/at least 20 characters/);
    await expect(page.locator('a[href="/#contact"]')).toBeVisible();

    await context.close();
  });

  test('the no-JS fallback page never reveals that a honeypot exists', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/#contact');

    await page.locator('#contact-name').fill('Bot');
    await page.locator('#contact-email').fill('bot@example.com');
    await page.locator('#contact-message').fill('This message is long enough to pass checks.');
    await page.locator('#contact-company').fill('Automated Co');

    await page.locator('form.contact-form button[type="submit"]').click();

    // Byte-for-byte the same page a genuine send produces (see the success
    // test above): identical heading, identical status code, no mention of a
    // honeypot or bot detection anywhere in the response.
    await expect(page.locator('h1')).toHaveText('Message sent');
    await expect(page.locator('body')).not.toContainText(/honeypot|bot|spam/i);

    await context.close();
  });
});
