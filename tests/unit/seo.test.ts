import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildMeta } from '@/lib/seo';
import { buildPersonSchema, serialiseSchema } from '@/lib/schema';
import { DEFAULT_OG_IMAGE, SITE } from '@/lib/site';

describe('absoluteUrl', () => {
  it('joins a root-relative path to the site origin', () => {
    expect(absoluteUrl('/projects/vera')).toBe(`${SITE.url}/projects/vera`);
  });

  it('adds the missing leading slash', () => {
    expect(absoluteUrl('projects/vera')).toBe(`${SITE.url}/projects/vera`);
  });

  it('does not double the separator or leave a trailing slash', () => {
    expect(absoluteUrl('/projects/vera/')).toBe(`${SITE.url}/projects/vera`);
  });

  it('keeps the root path as the bare origin', () => {
    expect(absoluteUrl('/')).toBe(`${SITE.url}/`);
  });

  it('passes an already-absolute URL through untouched', () => {
    expect(absoluteUrl('https://cdn.example.com/og.png')).toBe(
      'https://cdn.example.com/og.png',
    );
  });
});

describe('buildMeta', () => {
  it('suffixes a page title with the site name', () => {
    const meta = buildMeta({ title: 'VERA', description: 'd', path: '/projects/vera' });
    expect(meta.title).toBe(`VERA | ${SITE.name}`);
  });

  it('uses the site default title when a page supplies none', () => {
    const meta = buildMeta({ description: 'd', path: '/' });
    // A comma, not an em dash: this string is the homepage's <title>, its
    // og:title and its twitter:title, so it is the copy a search result and a
    // shared link show, and MASTER_CONTENT.md §03 rules out em dashes in
    // visible copy. Still not the "X | Gautham Balaji" pattern, which is
    // reserved for pages that supply their own title.
    expect(meta.title).toBe(`${SITE.name}, ${SITE.title}`);
    expect(meta.title).not.toContain('|');
    expect(meta.title).not.toContain('—');
  });

  it('derives the canonical URL from the path', () => {
    const meta = buildMeta({ description: 'd', path: '/projects/vera' });
    expect(meta.canonical).toBe(`${SITE.url}/projects/vera`);
    expect(meta.ogUrl).toBe(meta.canonical);
  });

  it('falls back to the site default image when a page supplies none', () => {
    // Every page must emit a real preview image (Phase 5): a page that forgets
    // to pass `ogImage` must never fall back to no image at all.
    const meta = buildMeta({ description: 'd', path: '/' });
    expect(meta.ogImage).toBe(`${SITE.url}${DEFAULT_OG_IMAGE}`);
    expect(meta.twitterCard).toBe('summary_large_image');
  });

  it('absolutises a supplied image and upgrades the card type', () => {
    const meta = buildMeta({ description: 'd', path: '/', ogImage: '/images/og.png' });
    expect(meta.ogImage).toBe(`${SITE.url}/images/og.png`);
    expect(meta.twitterCard).toBe('summary_large_image');
  });

  it('defaults to an indexable robots directive', () => {
    expect(buildMeta({ description: 'd', path: '/' }).robots).toBe('index, follow');
  });

  it('emits noindex when requested', () => {
    const meta = buildMeta({ description: 'd', path: '/', noindex: true });
    expect(meta.robots).toBe('noindex, nofollow');
  });
});

describe('buildPersonSchema', () => {
  it('lists only the two confirmed profiles', () => {
    // MASTER_CONTENT.md §01: "Only GitHub and LinkedIn are confirmed profiles."
    const schema = buildPersonSchema();
    expect(schema.sameAs).toEqual([SITE.github, SITE.linkedin]);
    expect(schema.sameAs).toHaveLength(2);
  });

  it('uses the verified identity facts', () => {
    const schema = buildPersonSchema();
    expect(schema.name).toBe(SITE.name);
    expect(schema.jobTitle).toBe(SITE.title);
    expect(schema.address.addressLocality).toBe('Chennai');
  });
});

describe('serialiseSchema', () => {
  it('escapes angle brackets so the payload cannot close the script tag', () => {
    const output = serialiseSchema({ evil: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c');
  });
});
