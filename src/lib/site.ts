/**
 * Canonical site constants.
 *
 * Every value here is taken verbatim from MASTER_CONTENT.md §01 and §16.
 * Nothing in this file may be invented. If a fact changes, update
 * MASTER_CONTENT.md first, then mirror it here.
 *
 * Note: MASTER_CONTENT.md §01 lists a phone number under "Public contact",
 * but DESIGN_SYSTEM.md §22 (contact actions) and §23 (footer) both omit it.
 * The design spec governs what the site publishes, so the phone number is
 * deliberately absent here. It belongs on the resume PDF only.
 */

export const SITE = {
  url: 'https://gautham-balaji.vercel.app',
  name: 'Gautham Balaji',
  title: 'Software Engineer',
  locality: 'Chennai',
  region: 'Tamil Nadu',
  country: 'India',
  /** Short form used in metadata rails and the footer. */
  locationShort: 'Chennai, India',
  positioning: 'Building reliable AI systems and backend infrastructure.',
  supporting:
    'I build software across backend systems, AI, agentic workflows, and the infrastructure that connects them.',
  email: 'gautham.balajis@gmail.com',
  github: 'https://github.com/gautham-balaji',
  /**
   * Phase 2 flagged a discrepancy: MASTER_CONTENT.md §01 gave this URL without
   * a trailing "b", while this file used the "b" version corroborated by the
   * previous live site. Phase 5 reconciled MASTER_CONTENT.md to match this
   * value, which is the intended, current URL.
   */
  linkedin: 'https://www.linkedin.com/in/gautham-balaji-18722228b',
} as const;

/**
 * Resume download path.
 *
 * The PDF now exists at public/resume/resume_gautham.pdf, so the gate is open
 * and both entry points (the hero's secondary CTA and the contact rail) render
 * real download links. The gate itself stays: it is what kept the site from
 * ever linking to a missing file while the PDF was outstanding, and it is the
 * switch to close again if the file is withdrawn.
 *
 * `RESUME_PATH` must match the filename on disk exactly. It is served straight
 * from public/, so it is a root-relative URL and works from every route.
 */
export const RESUME_PATH = '/resume/resume_gautham.pdf';
export const RESUME_AVAILABLE = true;

/** MASTER_CONTENT.md §16. Used for JSON-LD `alumniOf`. */
export const EDUCATION_INSTITUTION = 'Vellore Institute of Technology, Chennai';

/**
 * Default social preview image.
 *
 * A static 1200x630 PNG built from verified identity facts only (name, title,
 * positioning statement, location): no project claims, metrics or
 * screenshots. `buildMeta` falls back to this path whenever a page does not
 * supply its own `ogImage`, so every page emits a real preview image.
 */
export const DEFAULT_OG_IMAGE = '/images/og-default.png';
