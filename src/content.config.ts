/**
 * Content collections (MASTER_CONTENT.md §22).
 *
 * Zod validates every entry at build time, so a missing or malformed field
 * fails the build rather than the page.
 *
 * Optionality is deliberate. Fields are optional only where the content does
 * not exist yet and must not be invented (REBUILD_PLAN "Content / Asset Gaps").
 * Required fields are those MASTER_CONTENT.md actually supplies today.
 */

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
// Framework boundary: Astro generates collection types with
// `import('astro/zod').infer<...>`, so content schemas must be built with
// Astro's bundled zod or every entry infers as `any`. Application code
// (src/lib) uses the standalone zod 4 package instead.
import { z } from 'astro/zod';

/**
 * Project status values.
 *
 * DESIGN_SYSTEM.md §49 gives COMPLETED / PROTOTYPE / ACTIVE DEVELOPMENT /
 * CURRENT as *examples* of status treatment, not a closed list. 'Built' is
 * the locked Phase 1 value for Legal NLP and is added here accordingly.
 * Rendered uppercase by the UI; stored in title case.
 */
const projectStatus = z.enum(['Completed', 'Built', 'Prototype', 'Active Development']);

/**
 * A figure attached to a project.
 *
 * `src` is a repo-relative path under `src/assets/` so Astro's image pipeline
 * processes it. No project has media yet; the array defaults to empty and must
 * never be populated with placeholder or fabricated imagery.
 */
const mediaItem = z.object({
  src: z.string(),
  /** Describes what the figure demonstrates, not merely what it is. */
  alt: z.string(),
  caption: z.string().optional(),
  /** Figure number shown in the editorial caption, e.g. 1 renders "FIG. 01". */
  figure: z.number().int().positive().optional(),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    // --- identity and ordering -------------------------------------------
    title: z.string(),
    /** Position in the 01-04 Selected Work sequence (MASTER_CONTENT §07). */
    order: z.number().int().positive(),
    featured: z.boolean().default(false),

    // --- locked metadata --------------------------------------------------
    status: projectStatus,
    year: z.number().int().min(2000).max(2100),
    role: z.string(),

    // --- homepage copy ----------------------------------------------------
    /** Short bold line, e.g. "Teaching a chess engine to explain itself." */
    positioning: z.string(),
    /** One-sentence descriptor used in the project index. */
    descriptor: z.string(),
    technologies: z.array(z.string()).min(1),

    // --- detail-page narrative (Phase 4; optional until written) ----------
    thesis: z.string().optional(),
    problem: z.string().optional(),
    approach: z.string().optional(),
    architecture: z.string().optional(),
    technicalDecisions: z.array(z.string()).optional(),
    results: z.array(z.string()).optional(),
    /**
     * Stated limitations. Optional only because not every project page is
     * written yet. Where MASTER_CONTENT.md §23 defines a boundary, it must be
     * present before that project page ships.
     */
    limitations: z.array(z.string()).optional(),
    lessons: z.array(z.string()).optional(),
    futureWork: z.array(z.string()).optional(),

    // --- links ------------------------------------------------------------
    // Optional by design: Legal NLP and VERA have no public link, and
    // MASTER_CONTENT.md §10 and §23 forbid inventing one.
    github: z.url().optional(),
    live: z.url().optional(),

    // --- media ------------------------------------------------------------
    media: z.array(mediaItem).default([]),
  }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.md' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    /** Human-readable, as written in MASTER_CONTENT.md §12, e.g. "Aug 2025". */
    startDate: z.string(),
    /** `null` means the role is current ("Present"). */
    endDate: z.string().nullable().default(null),
    /** Display order; Admrls is first and visually dominant (§17). */
    order: z.number().int().positive(),
    /** Admrls only: rendered as the large feature block. */
    featured: z.boolean().default(false),
    description: z.string(),
    highlights: z.array(z.string()).min(1),
    technologies: z.array(z.string()).default([]),
    /** True where role detail is constrained by confidentiality (§12). */
    nda: z.boolean().default(false),
  }),
});

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/*.md' }),
  schema: z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    /** Not stated in MASTER_CONTENT.md §16, so genuinely optional. */
    startYear: z.number().int().optional(),
    /** Expected graduation year. */
    endYear: z.number().int(),
    cgpa: z.number().optional(),
  }),
});

const skills = defineCollection({
  loader: file('./src/content/skills/skills.json'),
  schema: z.object({
    id: z.string(),
    category: z.string(),
    order: z.number().int().positive(),
    items: z.array(z.string()).min(1),
  }),
});

export const collections = { projects, experience, education, skills };
