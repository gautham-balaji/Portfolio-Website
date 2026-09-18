/**
 * JSON-LD structured data (MASTER_CONTENT.md §27).
 *
 * Only facts present in MASTER_CONTENT.md are emitted. `sameAs` lists the two
 * confirmed profiles and nothing else: §01 states "Only GitHub and LinkedIn
 * are confirmed social profiles."
 */

import { EDUCATION_INSTITUTION, SITE } from './site';

/** Minimal structural type for the Person graph we emit. */
export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  url: string;
  email: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  alumniOf: {
    '@type': 'CollegeOrUniversity';
    name: string;
  };
  sameAs: string[];
}

export function buildPersonSchema(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    jobTitle: SITE.title,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: EDUCATION_INSTITUTION,
    },
    sameAs: [SITE.github, SITE.linkedin],
  };
}

/**
 * Serialise a schema object for embedding in a <script type="application/ld+json">.
 * `<` is escaped so the payload cannot terminate the surrounding script tag.
 */
export function serialiseSchema(schema: object): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
