/**
 * No-JavaScript fallback page for POST /api/contact.
 *
 * A fetch/XHR request (the React island) always gets the JSON contract in
 * `ContactResponse`. A native `<form>` submission -- the only way this route
 * is ever reached with JavaScript disabled or unavailable -- gets a small,
 * self-contained HTML page instead of raw JSON, per DESIGN_SYSTEM.md §35
 * ("no blank interactive regions") and MASTER_CONTENT.md §18 ("do not ship an
 * inert form").
 *
 * This is intentionally NOT rendered through the Astro component tree. The
 * endpoint is a plain serverless function with no access to the app's
 * Tailwind bundle or component rendering, and the brief for this phase is
 * explicit: "a simple server-rendered success/error fallback is sufficient."
 * The few design tokens used below are duplicated from DESIGN_SYSTEM.md §03
 * as literal values for that reason -- update them here if the palette
 * changes.
 *
 * The success page is used for BOTH a genuinely delivered message and a
 * bot-detected submission (honeypot or timing). Rendering anything visibly
 * different for the bot case would leak the heuristic to whatever is probing
 * the endpoint with a plain form-encoded POST, so the copy and status code
 * must stay identical to the real success path.
 */

const INK = '#121212';
const PAPER = '#e8e4dc';
const GRAPHITE = '#5f5e5a';
const OXIDE = '#934a2d';
const RULE = '#74736e';

export interface ContactFallbackPageOptions {
  title: string;
  heading: string;
  message: string;
  /** Surface the direct email address as an actionable alternative. */
  showMailto?: boolean;
  /** Per-field validation problems, shown as a plain list when present. */
  fieldErrors?: Record<string, string>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CONTACT_EMAIL = 'gautham.balajis@gmail.com';

export function renderContactFallbackPage(options: ContactFallbackPageOptions): string {
  const { title, heading, message, showMailto = false, fieldErrors } = options;

  const fieldMessages = fieldErrors ? Object.values(fieldErrors) : [];
  const fieldList =
    fieldMessages.length > 0
      ? `<ul>${fieldMessages.map((msg) => `<li>${escapeHtml(msg)}</li>`).join('')}</ul>`
      : '';

  const mailtoLine = showMailto
    ? `<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    background: ${PAPER};
    color: ${INK};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    margin: 0;
    padding: clamp(2rem, 8vw, 4rem) 1.25rem;
  }
  .wrap { max-width: 34rem; margin: 0 auto; }
  h1 {
    font-size: clamp(1.5rem, 5vw, 2.25rem);
    line-height: 1.15;
    letter-spacing: -0.01em;
    margin: 0 0 1rem;
  }
  p { line-height: 1.6; color: ${GRAPHITE}; margin: 0 0 1rem; max-width: 60ch; }
  ul { margin: 0 0 1.5rem; padding-left: 1.25rem; color: ${GRAPHITE}; line-height: 1.6; }
  a { color: ${INK}; text-decoration-color: ${OXIDE}; text-underline-offset: 0.2em; }
  .back {
    display: inline-block;
    margin-top: 1.5rem;
    padding-top: 0.875rem;
    border-top: 1px solid ${RULE};
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
</style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(message)}</p>
    ${fieldList}
    ${mailtoLine}
    <a class="back" href="/#contact">Back to the form</a>
  </div>
</body>
</html>
`;
}
