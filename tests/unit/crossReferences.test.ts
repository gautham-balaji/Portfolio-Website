import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import Slugger from 'github-slugger';
import {
  architectureIds,
  sectionRefs,
  stageAnchorId,
  unknownSectionRefs,
  unknownStageRefs,
} from '@/lib/crossReferences';

/**
 * P2.2: cross-references between the architecture, the prose and the
 * decisions.
 *
 * Two things are being protected. The first is that a reference can never
 * point at something that does not exist: a renamed heading or a renamed
 * stage has to break a test rather than produce a link that silently goes
 * nowhere. The second is that the mappings stay the ones that were actually
 * approved. Most stages and several decisions are deliberately unmapped
 * because no single target is correct for them, and "unmapped" is a decision
 * worth defending, not an oversight for a later pass to tidy up.
 *
 * Heading slugs are recomputed here with github-slugger, which is the same
 * library the markdown pipeline uses, so these run without a build.
 */

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');

const SLUGS = ['chess-engine', 'legal-nlp', 'vera', 'geocounterfactual'] as const;
type Slug = (typeof SLUGS)[number];

interface Addressable {
  id: string;
  section?: string;
}
interface Node extends Addressable {
  label: string;
}
/** A stage names itself only when it is not a bare pair of nodes. */
interface Stage extends Addressable {
  label?: string;
  gate?: boolean;
  nodes?: Node[];
}
interface Decision {
  title: string;
  stage?: string;
}
interface Project {
  architecture: { stages: Stage[] };
  decisions: Decision[];
}

async function read(slug: Slug): Promise<{ data: Project; headingSlugs: string[] }> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match?.[1]) throw new Error(`No frontmatter in ${slug}.md`);

  // Same slugger the markdown pipeline runs, so these are the real ids.
  const slugger = new Slugger();
  const headingSlugs = [...(match[2] ?? '').matchAll(/^## (.+)$/gm)].map((m) =>
    slugger.slug(m[1]!.trim()),
  );

  return { data: parse(match[1]) as Project, headingSlugs };
}

/* ---------------------------------------------------------------------------
   The pure resolvers, including the failure cases. These cannot be exercised
   through the real content, because the real content is correct.
   --------------------------------------------------------------------------- */

describe('reference resolution', () => {
  const stages: Stage[] = [
    { id: 'alpha', label: 'Alpha', section: 'the-start' },
    {
      id: 'pair',
      nodes: [
        { id: 'left', label: 'Left', section: 'the-middle' },
        { id: 'right', label: 'Right' },
      ],
    },
    { id: 'omega', label: 'Omega' },
  ];

  it('namespaces stage anchors so they cannot collide with heading slugs', () => {
    // Legal NLP has a `hybrid-retrieval` stage and a `hybrid-retrieval`
    // heading. Unprefixed, those are two elements with one id.
    expect(stageAnchorId('hybrid-retrieval')).toBe('stage-hybrid-retrieval');
  });

  it('collects stage and node ids together', () => {
    expect(architectureIds(stages)).toEqual(['alpha', 'pair', 'left', 'right', 'omega']);
  });

  it('collects only the parts that name a section', () => {
    expect(sectionRefs(stages)).toEqual([
      { id: 'alpha', section: 'the-start' },
      { id: 'left', section: 'the-middle' },
    ]);
  });

  it('accepts a decision that references a real stage or node', () => {
    const decisions = [
      { title: 'A', stage: 'omega' },
      { title: 'B', stage: 'left' },
    ];
    expect(unknownStageRefs(decisions, stages)).toEqual([]);
  });

  it('reports a decision that references a stage that does not exist', () => {
    const decisions = [{ title: 'Bad', stage: 'nowhere' }];
    expect(unknownStageRefs(decisions, stages)).toEqual([{ title: 'Bad', stage: 'nowhere' }]);
  });

  it('ignores decisions that reference no stage at all', () => {
    expect(unknownStageRefs([{ title: 'Unmapped' }], stages)).toEqual([]);
  });

  it('accepts sections that match a heading slug', () => {
    expect(unknownSectionRefs(stages, ['the-start', 'the-middle'])).toEqual([]);
  });

  it('reports a section that matches no heading slug', () => {
    expect(unknownSectionRefs(stages, ['the-start'])).toEqual([
      { id: 'left', section: 'the-middle' },
    ]);
  });
});

/* ---------------------------------------------------------------------------
   The real content.
   --------------------------------------------------------------------------- */

describe('every reference in the content resolves', () => {
  it.each(SLUGS)('%s: each decision stage names a real stage or node', async (slug) => {
    const { data } = await read(slug);
    expect(unknownStageRefs(data.decisions, data.architecture.stages)).toEqual([]);
  });

  it.each(SLUGS)('%s: each stage section names a real prose heading', async (slug) => {
    const { data, headingSlugs } = await read(slug);
    expect(unknownSectionRefs(data.architecture.stages, headingSlugs)).toEqual([]);
  });

  it.each(SLUGS)('%s: no stage anchor collides with a prose heading id', async (slug) => {
    // The prefix is what makes this safe; the test is what keeps it safe.
    const { data, headingSlugs } = await read(slug);
    const anchors = architectureIds(data.architecture.stages).map(stageAnchorId);
    expect(anchors.filter((a) => headingSlugs.includes(a))).toEqual([]);
  });
});

/* ---------------------------------------------------------------------------
   The approved mappings, and the deliberate gaps.
   --------------------------------------------------------------------------- */

const APPROVED_SECTIONS: Record<Slug, Record<string, string>> = {
  'chess-engine': {
    position: 'board-representation-and-the-network',
    cnn: 'board-representation-and-the-network',
    'classical-features': 'the-classical-layer',
    'ridge-fusion': 'fusion',
    rerank: 'reranking',
  },
  'legal-nlp': {
    'nlp-extraction': 'extraction',
    'entities-relations': 'extraction',
    'knowledge-graph': 'the-graph',
    'hybrid-retrieval': 'hybrid-retrieval',
    'semantic-search': 'hybrid-retrieval',
    'graph-signals': 'hybrid-retrieval',
  },
  vera: {
    'caller-inbound': 'the-call-lifecycle',
    twilio: 'the-call-lifecycle',
    vera: 'the-call-lifecycle',
    gemini: 'the-call-lifecycle',
    'caller-reply': 'the-call-lifecycle',
  },
  geocounterfactual: {
    planner: 'the-architecture-principle',
    'earth-observation': 'earth-observation-data',
    dynamics: 'constraints',
    critic: 'the-critic',
  },
};

/** Stages with no single correct prose section. Left unmapped on purpose. */
const UNMAPPED_STAGES: Record<Slug, string[]> = {
  'chess-engine': ['scoring-signals', 'move-explanation'],
  'legal-nlp': ['judgment', 'ranked-cases'],
  vera: ['retrieval-tools', 'speech'],
  geocounterfactual: ['intervention', 'generator', 'simulation'],
};

const APPROVED_DECISION_STAGES: Record<Slug, Record<string, string>> = {
  'chess-engine': {
    'Predict an existing evaluation rather than learn from self-play': 'cnn',
    'Ridge regression for fusion, not another network': 'ridge-fusion',
    'Explanations from checkable conditions, not from the model': 'move-explanation',
  },
  'legal-nlp': {
    'Two retrieval signals instead of one': 'hybrid-retrieval',
    'Pattern matching alongside learned extraction': 'nlp-extraction',
  },
  vera: {
    'Offloading text-to-speech work': 'speech',
    'Retrieval to ground the agent in company knowledge': 'retrieval-tools',
    'Multi-tool orchestration during a live call': 'retrieval-tools',
    'Structured conversation memory': 'vera',
  },
  geocounterfactual: {
    'A deterministic critic instead of an LLM vision critic': 'critic',
    'Earth Engine batch export rather than synchronous getInfo': 'earth-observation',
    'Client-side rainfall filtering': 'earth-observation',
    'A StubGenerator fallback': 'generator',
  },
};

/** Decisions that govern no single stage. Left unmapped on purpose. */
const UNMAPPED_DECISIONS: Record<Slug, string[]> = {
  'chess-engine': ['Integrated Gradients for a separate, visual account'],
  'legal-nlp': ['Graph analytics as a ranking signal', 'Explanations attached to predictions'],
  vera: ['Latency treated as the primary constraint'],
  geocounterfactual: [],
};

describe('approved mappings, and only those', () => {
  it.each(SLUGS)('%s: stage sections match the approved table exactly', async (slug) => {
    const { data } = await read(slug);
    const actual = Object.fromEntries(
      sectionRefs(data.architecture.stages).map((ref) => [ref.id, ref.section]),
    );
    expect(actual).toEqual(APPROVED_SECTIONS[slug]);
  });

  it.each(SLUGS)('%s: the ambiguous stages are still unmapped', async (slug) => {
    // Named individually rather than inferred, so filling one in later is a
    // deliberate act with a test to update, not a silent change.
    const { data } = await read(slug);
    const mapped = new Set(sectionRefs(data.architecture.stages).map((r) => r.id));
    for (const id of UNMAPPED_STAGES[slug]) {
      expect(architectureIds(data.architecture.stages), `${slug}: ${id} must exist`).toContain(
        id,
      );
      expect(mapped.has(id), `${slug}: ${id} must stay unmapped`).toBe(false);
    }
  });

  it.each(SLUGS)('%s: decision stages match the approved table exactly', async (slug) => {
    const { data } = await read(slug);
    const actual = Object.fromEntries(
      data.decisions.filter((d) => d.stage).map((d) => [d.title, d.stage]),
    );
    expect(actual).toEqual(APPROVED_DECISION_STAGES[slug]);
  });

  it.each(SLUGS)('%s: the ambiguous decisions are still unmapped', async (slug) => {
    const { data } = await read(slug);
    const titles = data.decisions.map((d) => d.title);
    for (const title of UNMAPPED_DECISIONS[slug]) {
      expect(titles, `${slug}: "${title}" must exist`).toContain(title);
      expect(
        data.decisions.find((d) => d.title === title)?.stage,
        `${slug}: "${title}" must stay unmapped`,
      ).toBeUndefined();
    }
  });
});
