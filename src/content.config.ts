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
import type { SchemaContext } from 'astro:content';
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
 * A verified measurement.
 *
 * `note` exists to preserve meaning. MASTER_CONTENT.md §23 requires, for
 * example, that 0.506 is read as a Pearson correlation and never as an
 * accuracy percentage, so the qualifier travels with the number rather than
 * being left to the layout.
 */
const metric = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});

/**
 * Architecture (P2.1).
 *
 * One canonical description of how a project works, replacing the pair of
 * sources that preceded it: a `flow` block here and a matching entry in
 * `src/lib/architectureDiagrams.ts`. Keeping them apart meant the drawing and
 * the reading of it could disagree, and they had: GeoCounterfactual's diagram
 * omitted the Earth observation stage, Legal NLP marked its decision point on
 * a different stage in each, and the return edge existed in only one of them.
 *
 * Everything the two used to carry between them is expressible here, so the
 * page renders one architecture and every projection of it is derived rather
 * than restated.
 */

/** Slug shape for stage and node ids. Stable, and safe in a fragment. */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lower-case kebab-case');

/** One box in the drawing. */
const architectureNode = z.object({
  id: slug,
  label: z.string(),
  detail: z.string().optional(),
});

/**
 * One column of the pipeline.
 *
 * Normally a single labelled step. A stage may instead hold two nodes that run
 * alongside each other and rejoin (the chess CNN beside the classical
 * features, the two Legal NLP retrieval signals), which is structure the old
 * `flow` list could not express at all. A paired stage may still carry its own
 * label where the grouping is itself documented, as Legal NLP's "Hybrid
 * retrieval" is.
 */
const architectureStage = z
  .object({
    id: slug,
    label: z.string().optional(),
    detail: z.string().optional(),
    /** Marks a decision point, e.g. the GeoCounterfactual critic. */
    gate: z.boolean().default(false),
    nodes: z.array(architectureNode).length(2).optional(),
  })
  .refine((stage) => Boolean(stage.label) || Boolean(stage.nodes), {
    message: 'a stage needs either a label of its own or a pair of nodes',
  });

const architecture = z
  .object({
    /** The pipeline's own name, e.g. "Call lifecycle". */
    label: z.string(),
    /** Which declared figure slot this drawing fills. */
    figure: z.number().int().positive(),
    stages: z.array(architectureStage).min(2),
    /**
     * A documented return path, e.g. GeoCounterfactual's critic rejecting
     * back to the generator. Endpoints are stage ids rather than array
     * positions: the previous model used indices, so inserting a stage
     * silently repointed the edge at the wrong boxes.
     */
    loop: z
      .object({
        from: slug,
        to: slug,
        label: z.string(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const stageIds = new Set<string>();
    const allIds: string[] = [];

    for (const stage of value.stages) {
      stageIds.add(stage.id);
      allIds.push(stage.id);
      for (const node of stage.nodes ?? []) allIds.push(node.id);
    }

    const duplicates = allIds.filter((id, i) => allIds.indexOf(id) !== i);
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `duplicate architecture ids: ${[...new Set(duplicates)].join(', ')}`,
        path: ['stages'],
      });
    }

    for (const end of ['from', 'to'] as const) {
      const target = value.loop?.[end];
      if (target && !stageIds.has(target)) {
        ctx.addIssue({
          code: 'custom',
          message: `loop.${end} "${target}" does not match any stage id`,
          path: ['loop', end],
        });
      }
    }
  });

/** A named engineering decision and the reasoning behind it. */
const decision = z.object({
  title: z.string(),
  body: z.string(),
});

export type ProjectFigureKind = 'screenshot' | 'diagram' | 'chart' | 'map';

/**
 * A figure slot.
 *
 * Figures are declared in content even when the asset does not exist yet, so
 * the page states what evidence belongs where. Without `src` the component
 * renders an editorial plate; adding `src` and `alt` later fills it in with no
 * layout change.
 *
 * `kind` is rendered as a visible label, so an architecture diagram can never
 * be mistaken for an application screenshot.
 */
const figureSchema = (image: SchemaContext['image']) =>
  z.object({
    figure: z.number().int().positive(),
    caption: z.string(),
    kind: z.enum(['screenshot', 'diagram', 'chart', 'map']).default('screenshot'),
    span: z.enum(['full', 'wide', 'half']).default('wide'),
    ratio: z.string().default('16 / 10'),
    src: image().optional(),
    /** Required whenever `src` is present. Describes what the figure shows. */
    alt: z.string().optional(),
    /** Optional provenance line, e.g. which run produced the output. */
    source: z.string().optional(),
  });

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
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

      // --- detail page ------------------------------------------------------
      /** Short lead paragraph under the project hero. */
      overview: z.string().optional(),
      thesis: z.string().optional(),

      /**
       * The canonical architecture. Rendered once per detail page as a
       * topology drawing plus a visible stage legend, and projected onto the
       * homepage index as a compact rail, so the drawing is never the only
       * way to read it (DESIGN_SYSTEM §33).
       */
      architecture: architecture.optional(),

      /** Named engineering decisions, the most interesting part of each story. */
      decisions: z.array(decision).default([]),

      /** Verified measurements only. Every value carries its own qualifier. */
      metrics: z.array(metric).default([]),

      /**
       * Stated limitations. Required in practice for every project page:
       * MASTER_CONTENT.md §23 defines a boundary for all four projects, and
       * stating it is what makes the rest credible.
       */
      limitations: z.array(z.string()).default([]),

      // --- links ------------------------------------------------------------
      // Optional by design: Legal NLP and VERA have no public link, and
      // MASTER_CONTENT.md §10 and §23 forbid inventing one.
      github: z.url().optional(),
      live: z.url().optional(),

      // --- figures ----------------------------------------------------------
      figures: z.array(figureSchema(image)).default([]),
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
