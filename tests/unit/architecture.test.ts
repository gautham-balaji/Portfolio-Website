import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

/**
 * P2.1: one canonical architecture source.
 *
 * Before P2.1 every project described its architecture twice: a `flow` block
 * in frontmatter and a matching entry in `src/lib/architectureDiagrams.ts`.
 * The two had already drifted three ways (GeoCounterfactual omitted a stage
 * and the return edge lived in only one of them; Legal NLP marked its gate on
 * a different stage in each), and the diagram data had been hand-abbreviated
 * at authoring time to fit a fixed-width SVG.
 *
 * These tests exist to make that unrepeatable. They assert the union survived
 * the merge, string for string, and that the structural facts only the diagram
 * used to carry (parallel nodes, the reject loop) are now in the content file
 * alongside everything else the project claims.
 *
 * The baselines below are the pre-migration values, copied verbatim from
 * commit 1c50900. They are deliberately inlined rather than derived: a test
 * that recomputes its expectation from the thing it is checking proves
 * nothing.
 */

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface Node {
  id: string;
  label: string;
  detail?: string;
}

interface Stage {
  id: string;
  label?: string;
  detail?: string;
  gate?: boolean;
  nodes?: Node[];
}

interface Architecture {
  label: string;
  figure?: number;
  stages: Stage[];
  loop?: { from: string; to: string; label: string };
}

interface Frontmatter {
  architecture?: Architecture;
  flow?: unknown;
  figures?: { figure: number; caption: string; kind?: string }[];
}

/** Read one project's YAML frontmatter. */
async function frontmatter(slug: string): Promise<Frontmatter> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match?.[1]) throw new Error(`No frontmatter found in ${slug}.md`);
  return parse(match[1]) as Frontmatter;
}

async function architecture(slug: string): Promise<Architecture> {
  const data = await frontmatter(slug);
  if (!data.architecture) throw new Error(`${slug}.md declares no architecture block`);
  return data.architecture;
}

/** Every addressable unit in a project: stages, plus the nodes inside them. */
function units(arch: Architecture): { id: string; label: string; detail?: string }[] {
  const out: { id: string; label: string; detail?: string }[] = [];
  for (const stage of arch.stages) {
    if (stage.label) out.push({ id: stage.id, label: stage.label, detail: stage.detail });
    for (const node of stage.nodes ?? []) {
      out.push({ id: node.id, label: node.label, detail: node.detail });
    }
  }
  return out;
}

const SLUGS = ['chess-engine', 'legal-nlp', 'vera', 'geocounterfactual'] as const;

/**
 * Pre-migration `flow` steps, verbatim from commit 1c50900.
 *
 * Every one of these details must survive into the canonical block unchanged.
 * `MERGED` lists the single stage where that is relaxed, and why.
 */
const BASELINE_FLOW: Record<string, { label: string; detail: string; gate?: boolean }[]> = {
  'chess-engine': [
    { label: 'Position', detail: '8x8x12 planes, one per piece type per colour' },
    { label: 'CNN', detail: 'Predicts a Stockfish centipawn evaluation' },
    { label: 'Classical features', detail: 'Material, space, centre control, mobility' },
    { label: 'Ridge fusion', detail: 'Weighted combination into one hybrid score' },
    { label: 'Rerank', detail: 'Heuristic bonuses plus one-ply opponent lookahead' },
    { label: 'Move + explanation', detail: 'Ranked moves with checkable reasoning' },
  ],
  'legal-nlp': [
    { label: 'Judgment', detail: 'Raw court judgment text' },
    {
      label: 'NLP extraction',
      detail: 'Legal NER plus pattern matching for IPC and CrPC references',
    },
    { label: 'Entities and relations', detail: 'Cases, statutes, sections, courts, judges' },
    { label: 'Knowledge graph', detail: 'CITES, APPLIES, DECIDED_BY, INVOLVES' },
    {
      label: 'Hybrid retrieval',
      detail: 'Semantic search and graph signals scored together',
      gate: true,
    },
    { label: 'Ranked cases', detail: 'Combined-score reranking with an explanation' },
  ],
  vera: [
    { label: 'Caller', detail: 'Inbound call to a business number' },
    { label: 'Twilio', detail: 'Telephony transport and audio streaming' },
    { label: 'VERA', detail: 'Session handling and conversation memory' },
    { label: 'Gemini', detail: 'Understanding and response generation' },
    {
      label: 'Retrieval and tools',
      detail: 'Vector search over domain knowledge, dynamic tool selection',
      gate: true,
    },
    { label: 'Speech', detail: 'Generated response returned as audio' },
    { label: 'Caller', detail: 'Reply heard in-call' },
  ],
  geocounterfactual: [
    { label: 'Intervention', detail: 'Natural-language request for a selected watershed' },
    { label: 'Planner', detail: 'Gemini parses intent into a structured plan' },
    {
      label: 'Earth observation',
      detail: 'Sentinel-2, Copernicus DEM, ESA WorldCover, CHIRPS at 10m',
    },
    {
      label: 'Dynamics',
      detail: 'Deterministic NumPy hydro-ecological constraints, D8 routing',
    },
    { label: 'Generator', detail: 'Stable Diffusion 1.5 with ControlNet proposes imagery' },
    {
      label: 'Critic',
      detail: 'Accept, or reject and route back to the generator',
      gate: true,
    },
    { label: 'Simulation', detail: 'Accepted counterfactual with XAI overlay' },
  ],
};

/**
 * The one approved exception to verbatim preservation.
 *
 * GeoCounterfactual's Critic was the only stage where the two old sources
 * carried genuinely different information rather than a long and a short form
 * of the same sentence: `flow` described the accept/reject behaviour and the
 * diagram named the three checks. Dropping either would lose documented
 * content, so the merged detail has to contain both. The flow sentence is
 * still required to appear verbatim inside it.
 */
const MERGED = {
  slug: 'geocounterfactual',
  stageId: 'critic',
  mustContain: ['Accept, or reject and route back to the generator', 'SSIM'],
};

/** Node details that existed only in the old diagram data. */
const BASELINE_DIAGRAM_ONLY: Record<string, Record<string, string>> = {
  'legal-nlp': {
    'Semantic search': 'Sentence embeddings',
    'Graph signals': 'Citation structure',
  },
};

describe('one canonical architecture source', () => {
  it('no longer ships a second architecture definition module', async () => {
    await expect(
      fs.access(path.join(ROOT, 'src/lib/architectureDiagrams.ts')),
    ).rejects.toThrow();
  });

  it.each(SLUGS)(
    '%s declares an architecture block and no legacy flow block',
    async (slug) => {
      const data = await frontmatter(slug);
      expect(data.architecture, 'architecture block').toBeDefined();
      expect(data.flow, 'legacy flow block must be gone').toBeUndefined();
    },
  );

  it.each(SLUGS)('%s names its architecture and points at a figure slot', async (slug) => {
    const arch = await architecture(slug);
    expect(arch.label.length).toBeGreaterThan(3);
    expect(arch.figure).toBeTypeOf('number');
  });

  it('no source file outside the content collection defines architecture stages', async () => {
    const entries = await fs.readdir(path.join(ROOT, 'src'), {
      recursive: true,
      withFileTypes: true,
    });
    const offenders: string[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!/\.(ts|tsx|astro)$/.test(entry.name)) continue;
      const filePath = path.join(entry.parentPath, entry.name);
      const content = await fs.readFile(filePath, 'utf-8');
      // A literal stage list outside content would be a second source again.
      if (/ARCHITECTURE_DIAGRAMS/.test(content)) offenders.push(filePath);
    }
    expect(offenders).toEqual([]);
  });
});

describe('stage identity', () => {
  it.each(SLUGS)('%s gives every stage and node a unique kebab-case id', async (slug) => {
    const arch = await architecture(slug);
    const ids: string[] = [];
    for (const stage of arch.stages) {
      ids.push(stage.id);
      for (const node of stage.nodes ?? []) ids.push(node.id);
    }
    for (const id of ids) expect(id, `${slug}: "${id}"`).toMatch(KEBAB);
    expect(new Set(ids).size, `${slug}: ids must be unique`).toBe(ids.length);
  });

  it('disambiguates the two stages VERA labels "Caller"', async () => {
    // Labels are not usable as identifiers: VERA opens and closes on a stage
    // called Caller, so an id keyed on the label would collide.
    const arch = await architecture('vera');
    const callers = arch.stages.filter((s) => s.label === 'Caller');
    expect(callers).toHaveLength(2);
    expect(callers[0]?.id).not.toBe(callers[1]?.id);
  });

  it.each(SLUGS)('%s gives every stage either a label or a pair of nodes', async (slug) => {
    const arch = await architecture(slug);
    for (const stage of arch.stages) {
      const describable = Boolean(stage.label) || (stage.nodes?.length ?? 0) >= 2;
      expect(describable, `${slug}: stage "${stage.id}"`).toBe(true);
    }
  });
});

describe('stage preservation (nothing documented was dropped in the merge)', () => {
  it.each(SLUGS)(
    '%s keeps every pre-migration flow stage, in order, with its detail',
    async (slug) => {
      // Walked positionally rather than looked up by label, for two reasons:
      // VERA opens and closes on a stage called "Caller", so a label map
      // would silently check the same entry twice, and Legal NLP's canonical
      // list is now a superset (its paired retrieval nodes came from the old
      // diagram data and are checked separately below).
      const all = units(await architecture(slug));
      let cursor = 0;

      for (const step of BASELINE_FLOW[slug]!) {
        const index = all.findIndex((unit, i) => i >= cursor && unit.label === step.label);
        expect(index, `${slug}: "${step.label}" is missing or out of order`).toBeGreaterThan(
          -1,
        );
        // Verbatim everywhere except the single approved merge, which still
        // has to carry the original sentence inside it.
        expect(all[index]?.detail, `${slug}: "${step.label}"`).toContain(step.detail);
        cursor = index + 1;
      }
    },
  );

  it.each(SLUGS)('%s adds nothing beyond the documented union', async (slug) => {
    // The canonical list may only exceed the old flow by the node labels the
    // old diagram carried. Anything else would be a new claim.
    const all = units(await architecture(slug)).map((u) => u.label);
    const allowed = [
      ...BASELINE_FLOW[slug]!.map((s) => s.label),
      ...Object.keys(BASELINE_DIAGRAM_ONLY[slug] ?? {}),
    ];
    const extra = all.filter((label) => !allowed.includes(label));
    expect(extra).toEqual([]);
    expect(all).toHaveLength(allowed.length);
  });

  it('merges GeoCounterfactual’s critic without losing either source', async () => {
    const arch = await architecture(MERGED.slug);
    const critic = arch.stages.find((s) => s.id === MERGED.stageId);
    expect(critic, 'critic stage').toBeDefined();
    for (const fragment of MERGED.mustContain) {
      expect(critic?.detail).toContain(fragment);
    }
  });

  it('keeps the node details that previously existed only in the diagram data', async () => {
    for (const [slug, expectations] of Object.entries(BASELINE_DIAGRAM_ONLY)) {
      const arch = await architecture(slug);
      const found = new Map(units(arch).map((u) => [u.label, u.detail]));
      for (const [label, detail] of Object.entries(expectations)) {
        expect(found.get(label), `${slug}: "${label}"`).toBe(detail);
      }
    }
  });

  it('keeps GeoCounterfactual’s Earth observation stage and its data sources', async () => {
    // The stage the old diagram dropped, and the one that makes the project
    // geospatial rather than generative.
    const arch = await architecture('geocounterfactual');
    const stage = arch.stages.find((s) => s.label === 'Earth observation');
    expect(stage).toBeDefined();
    for (const token of ['Sentinel-2', 'Copernicus DEM', 'ESA WorldCover', 'CHIRPS', '10m']) {
      expect(stage?.detail).toContain(token);
    }
  });

  it('keeps GeoCounterfactual’s D8 routing detail', async () => {
    const arch = await architecture('geocounterfactual');
    const stage = arch.stages.find((s) => s.id === 'dynamics');
    expect(stage?.detail).toContain('D8 routing');
  });

  it('does not reintroduce "Input handler" as a stage', async () => {
    // Approved decision: canonical stage 0 is Intervention. Input handler
    // remains in the prose, where it describes the LangGraph implementation.
    const arch = await architecture('geocounterfactual');
    const labels = units(arch).map((u) => u.label.toLowerCase());
    expect(labels).not.toContain('input handler');
    expect(labels[0]).toBe('intervention');

    const source = await fs.readFile(path.join(PROJECTS_DIR, 'geocounterfactual.md'), 'utf-8');
    const body = source.split(/^---$/m)[2] ?? '';
    expect(body.toLowerCase(), 'prose still documents the LangGraph node').toContain(
      'input handler',
    );
  });
});

describe('structure only the diagram used to carry', () => {
  it('keeps the chess fork: CNN and classical features run alongside each other', async () => {
    const arch = await architecture('chess-engine');
    const parallel = arch.stages.filter((s) => s.nodes?.length === 2);
    expect(parallel).toHaveLength(1);
    expect(parallel[0]?.nodes?.map((n) => n.label)).toEqual(['CNN', 'Classical features']);
  });

  it('keeps the legal fork under the documented hybrid retrieval stage', async () => {
    const arch = await architecture('legal-nlp');
    const parallel = arch.stages.filter((s) => s.nodes?.length === 2);
    expect(parallel).toHaveLength(1);
    expect(parallel[0]?.label).toBe('Hybrid retrieval');
    expect(parallel[0]?.nodes?.map((n) => n.label)).toEqual([
      'Semantic search',
      'Graph signals',
    ]);
  });

  it.each(['vera', 'geocounterfactual'] as const)(
    '%s declares no parallel stage, as documented',
    async (slug) => {
      const arch = await architecture(slug);
      expect(arch.stages.filter((s) => s.nodes)).toHaveLength(0);
    },
  );

  it('keeps GeoCounterfactual as the only project with a return edge', async () => {
    for (const slug of SLUGS) {
      const arch = await architecture(slug);
      if (slug === 'geocounterfactual') {
        expect(arch.loop).toBeDefined();
        expect(arch.loop?.label).toBe('reject');
      } else {
        expect(arch.loop, `${slug} must declare no loop`).toBeUndefined();
      }
    }
  });

  it('references the loop by stage id, and both endpoints resolve', async () => {
    // The old model used array indices, so inserting a stage silently
    // repointed the edge. Slugs make that a build failure instead.
    const arch = await architecture('geocounterfactual');
    const ids = new Set(arch.stages.map((s) => s.id));
    expect(arch.loop?.from).toBe('critic');
    expect(arch.loop?.to).toBe('generator');
    expect(ids.has(arch.loop!.from)).toBe(true);
    expect(ids.has(arch.loop!.to)).toBe(true);
  });
});

describe('gates mark decision points', () => {
  const EXPECTED_GATES: Record<string, string[]> = {
    'chess-engine': [],
    'legal-nlp': ['hybrid-retrieval'],
    vera: ['retrieval-tools'],
    geocounterfactual: ['critic'],
  };

  it.each(SLUGS)('%s marks exactly the documented decision points', async (slug) => {
    const arch = await architecture(slug);
    const gates = arch.stages.filter((s) => s.gate).map((s) => s.id);
    expect(gates).toEqual(EXPECTED_GATES[slug]);
  });

  it('puts the Legal NLP gate on hybrid retrieval, not on the output', async () => {
    // Pre-migration defect: `flow` marked the decision (Hybrid retrieval) and
    // the diagram marked the result (Ranked cases), so the homepage and the
    // detail page disagreed about where this project decides anything.
    const arch = await architecture('legal-nlp');
    const gated = arch.stages.find((s) => s.gate);
    expect(gated?.label).toBe('Hybrid retrieval');
    expect(arch.stages.find((s) => s.label === 'Ranked cases')?.gate ?? false).toBe(false);
  });
});

describe('figure slots', () => {
  const EXPECTED_FIGURE: Record<string, number> = {
    'chess-engine': 2,
    'legal-nlp': 1,
    vera: 1,
    geocounterfactual: 2,
  };

  it.each(SLUGS)('%s points its architecture at the figure it belongs to', async (slug) => {
    const data = await frontmatter(slug);
    const figureNumber = data.architecture?.figure;
    expect(figureNumber).toBe(EXPECTED_FIGURE[slug]);

    const declared = data.figures?.map((f) => f.figure) ?? [];
    expect(declared, `${slug}: figure ${figureNumber} must exist`).toContain(figureNumber);
  });

  it('describes GeoCounterfactual’s figure as the simulation architecture', async () => {
    // Approved decision: the old caption named the LangGraph node list, which
    // the unified 7-stage drawing no longer is.
    const data = await frontmatter('geocounterfactual');
    const caption = data.figures?.find((f) => f.figure === 2)?.caption ?? '';
    expect(caption).not.toMatch(/input handler/i);
    expect(caption).toMatch(/critic/i);
    expect(caption).toMatch(/reject/i);
  });
});
