/**
 * SEO metadata construction.
 *
 * Pages supply their own copy; this module only assembles and normalises it.
 * No page-specific copy is defined here (that belongs with the pages, in a
 * later phase). MASTER_CONTENT.md §27 lists the required outputs.
 */

import { DEFAULT_OG_IMAGE, SITE } from './site';

export interface SeoInput {
  /** Page-specific title. Omit on the home page to use the site default. */
  title?: string;
  description: string;
  /** Route path, e.g. `/projects/vera`. Used to build the canonical URL. */
  path: string;
  /** Absolute or root-relative image path. Falls back to the site default. */
  ogImage?: string;
  /** `article` for project pages, `website` elsewhere. */
  ogType?: 'website' | 'article';
  /** Set true for pages that should not be indexed. */
  noindex?: boolean;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogType: 'website' | 'article';
  ogUrl: string;
  ogImage: string;
  twitterCard: 'summary_large_image';
  robots: string;
}

/** Site-level default title, used when a page supplies none. */
const DEFAULT_TITLE = `${SITE.name}, ${SITE.title}`;

/** Join the site origin and a route path without doubling or dropping slashes. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = SITE.url.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  // Preserve the root path as a bare origin with trailing slash.
  return suffix === '/' ? `${base}/` : `${base}${suffix.replace(/\/+$/, '')}`;
}

/**
 * Build the complete metadata set for a page.
 *
 * Titles are suffixed with the site name unless the page title already is the
 * site name, which avoids "Gautham Balaji | Gautham Balaji" on the home page.
 */
export function buildMeta(input: SeoInput): SeoMeta {
  const title = input.title ? `${input.title} | ${SITE.name}` : DEFAULT_TITLE;
  const canonical = absoluteUrl(input.path);
  const ogImage = absoluteUrl(input.ogImage ?? DEFAULT_OG_IMAGE);

  return {
    title,
    description: input.description,
    canonical,
    ogTitle: title,
    ogDescription: input.description,
    ogType: input.ogType ?? 'website',
    ogUrl: canonical,
    ogImage,
    twitterCard: 'summary_large_image',
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
  };
}
