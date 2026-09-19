import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

/**
 * P2.4: one project-specific signature block, where a project documents
 * something the shared blocks cannot carry.
 *
 * Two projects have one and two deliberately do not. That asymmetry is the
 * design, not an oversight: Chess already states its configuration in three
 * parameter tables and a fork diagram, and GeoCounterfactual's reject loop is
 * already in the overview, the drawn arc, the stage legend and the prose. The
 * tests assert their absence so a later pass cannot add a block for symmetry.
 *
 * The two blocks have opposite failure modes, and most of what follows guards
 * against them. Legal NLP's risk is drawing a graph: the node types and edge
 * types are documented but their endpoints are not, so a connection of any
 * kind would be invented. VERA's risk is implying a measurement or a
 * mechanism: no latency was recorded, and the source never says what replaced
 * the blocking text-to-speech step.
 */

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');

type Slug = 'chess-engine' | 'legal-nlp' | 'vera' | 'geocounterfactual';

interface GraphSchemaSignature {
  kind: 'graph-schema';
  sets: { label: string; items: string[] }[];
  note?: string;
}
interface CriticalPathSignature {
  kind: 'critical-path';
  paths: { label: string; steps: string[]; note?: string }[];
  outcome: { label: string; statements: string[] };
  note?: string;
}
type Signature = GraphSchemaSignature | CriticalPathSignature;

async function signatureOf(slug: Slug): Promise<Signature | undefined> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match?.[1]) throw new Error(`No frontmatter in ${slug}.md`);
  return (parse(match[1]) as { signature?: Signature }).signature;
}

/** The body, lower-cased and unwrapped, so assertions ignore line breaks. */
async function body(slug: Slug): Promise<string> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const raw = /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(source)?.[1] ?? '';
  return raw.toLowerCase().replace(/\s+/g, ' ');
}

/** One `## ...` section of the body, so a trim can be asserted where it applies. */
async function prose(slug: Slug, heading: string): Promise<string> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const raw = (
    /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(source)?.[1] ?? ''
  ).toLowerCase();
  const sections = raw.split(/^## /m).map((s) => s.trim());
  const match = sections.find((s) => s.startsWith(heading.toLowerCase()));
  if (!match) throw new Error(`No "## ${heading}" section in ${slug}.md`);
  return match.replace(/\s+/g, ' ');
}

/* ---------------------------------------------------------------------------
   Which projects have one.
   --------------------------------------------------------------------------- */

describe('signature blocks exist only where they add something', () => {
  it('legal-nlp declares a graph schema', async () => {
    expect((await signatureOf('legal-nlp'))?.kind).toBe('graph-schema');
  });

  it('vera declares a critical path', async () => {
    expect((await signatureOf('vera'))?.kind).toBe('critical-path');
  });

  it.each(['chess-engine', 'geocounterfactual'] as const)(
    '%s declares no signature block',
    async (slug) => {
      // Chess would be restating its parameter tables; Geo would be a fifth
      // rendering of the reject loop.
      expect(await signatureOf(slug)).toBeUndefined();
    },
  );
});

/* ---------------------------------------------------------------------------
   Legal NLP: the documented vocabulary, and nothing that implies a topology.
   --------------------------------------------------------------------------- */

const DOCUMENTED_SETS: Record<string, string[]> = {
  'Node types': ['Cases', 'Statutes', 'Sections', 'Courts', 'Judges'],
  'Relationship types': ['CITES', 'APPLIES', 'DECIDED_BY', 'INVOLVES'],
  'Graph analytics': ['PageRank', 'Centrality', 'Community detection'],
};

describe('legal-nlp graph schema', () => {
  async function schema(): Promise<GraphSchemaSignature> {
    const sig = await signatureOf('legal-nlp');
    if (sig?.kind !== 'graph-schema') throw new Error('not a graph schema');
    return sig;
  }

  it('lists exactly the three documented sets, in order', async () => {
    const sets = (await schema()).sets;
    expect(sets.map((s) => s.label)).toEqual(Object.keys(DOCUMENTED_SETS));
  });

  it.each(Object.entries(DOCUMENTED_SETS))(
    'the %s set matches MASTER_CONTENT exactly',
    async (label, items) => {
      const set = (await schema()).sets.find((s) => s.label === label);
      expect(set?.items).toEqual(items);
    },
  );

  it('states no endpoint for any relationship', async () => {
    // No source says which node types an edge connects, so the block must
    // never pair them. Anything that reads as "X -> Y" would be invented.
    const sig = await schema();
    const relationships = sig.sets.find((s) => s.label === 'Relationship types')?.items ?? [];
    const nodes = sig.sets.find((s) => s.label === 'Node types')?.items ?? [];

    for (const item of [...relationships, ...nodes]) {
      expect(item, `"${item}" must be a bare term`).not.toMatch(
        /->|→|\bto\b|\bfrom\b|\bconnects\b|\bbetween\b|\blinks\b/i,
      );
    }

    // And no set item may name two vocabulary terms at once.
    for (const item of relationships) {
      const named = nodes.filter((node) => item.toLowerCase().includes(node.toLowerCase()));
      expect(named, `"${item}" must not name a node type`).toEqual([]);
    }
  });

  it('records why the schema is stated as sets rather than drawn', async () => {
    const note = (await schema()).note?.toLowerCase() ?? '';
    expect(note).toContain('not published');
    expect(note).toContain('rather than drawn');
  });

  it('invents no node count, edge count or corpus size', async () => {
    const sig = await schema();
    expect(JSON.stringify(sig)).not.toMatch(/\d/);
  });
});

/* ---------------------------------------------------------------------------
   VERA: a documented change of position, with no measurement and no mechanism.
   --------------------------------------------------------------------------- */

describe('vera critical path', () => {
  async function critical(): Promise<CriticalPathSignature> {
    const sig = await signatureOf('vera');
    if (sig?.kind !== 'critical-path') throw new Error('not a critical path');
    return sig;
  }

  it('renders the naive handling as one documented sequence', async () => {
    const sig = await critical();
    expect(sig.paths).toHaveLength(1);
    expect(sig.paths[0]?.label).toBe('Handled naively');
    expect(sig.paths[0]?.steps.length).toBeGreaterThanOrEqual(4);
    // The documented order: decide, then render, then speak.
    const joined = sig.paths[0]!.steps.join(' | ').toLowerCase();
    expect(joined.indexOf('response decided')).toBeLessThan(joined.indexOf('speech rendered'));
    expect(joined.indexOf('speech rendered')).toBeLessThan(joined.indexOf('audio returned'));
  });

  it('states the change as sentences rather than a second sequence', async () => {
    // A parallel track would assert concurrency the source never describes.
    const sig = await critical();
    expect(sig.paths).toHaveLength(1);
    expect(sig.outcome.label).toBe('As built');
    expect(sig.outcome.statements).toEqual([
      'Speech generation was moved off the blocking path.',
      'The response cycle no longer waits on audio rendering.',
    ]);
  });

  it('contains no digit anywhere', async () => {
    // No latency was ever formally measured; MASTER_CONTENT.md §10 forbids
    // inventing one, and a number of any kind in this block would read as one.
    expect(JSON.stringify(await critical())).not.toMatch(/\d/);
  });

  it('uses none of the words that would imply a measurement or a mechanism', async () => {
    const text = JSON.stringify(await critical()).toLowerCase();
    for (const banned of [
      'ms',
      'second',
      'latency',
      '%',
      'percent',
      'faster',
      'parallel',
      'concurrent',
      'async',
      'stream',
      'chunk',
      'queue',
      'thread',
      'benchmark',
    ]) {
      expect(text, `"${banned}" must not appear`).not.toContain(banned);
    }
  });

  it('names no tool, because none is documented', async () => {
    // The content says tools are selected dynamically but never names one.
    const text = JSON.stringify(await critical()).toLowerCase();
    for (const invented of ['calendar', 'booking', 'crm', 'lookup', 'transfer', 'sms']) {
      expect(text, `"${invented}" is not documented`).not.toContain(invented);
    }
  });

  it('records that no timing is being claimed', async () => {
    const note = (await critical()).note?.toLowerCase() ?? '';
    expect(note).toContain('never formally measured');
  });
});

/* ---------------------------------------------------------------------------
   Relocation: the prose no longer enumerates what the schema now carries.
   --------------------------------------------------------------------------- */

describe('legal-nlp prose was rewritten rather than left to repeat the block', () => {
  it('no longer enumerates the node vocabulary', async () => {
    expect(await body('legal-nlp')).not.toContain(
      'cases, statutes, sections, courts and judges',
    );
  });

  it('no longer enumerates the relationship types', async () => {
    const prose = await body('legal-nlp');
    for (const edge of ['cites', 'applies', 'decided_by', 'involves']) {
      expect(prose, `"${edge}" should now live only in the block`).not.toContain(
        `\`${edge}\``,
      );
    }
    expect(prose).not.toContain('decided_by');
  });

  it('no longer enumerates the analytics by name where it explains the graph', async () => {
    // Scoped to "The graph", which is the section the block supersedes.
    // "The application" still lists PageRank and centrality among the
    // interface's features, which is a different claim about a different
    // thing and was not part of the trim.
    const section = await prose('legal-nlp', 'the graph');
    for (const name of ['pagerank', 'centrality', 'community detection']) {
      expect(section, `"${name}" should now live only in the block`).not.toContain(name);
    }
  });

  it('keeps the reasoning the block cannot carry', async () => {
    const prose = await body('legal-nlp');
    expect(prose).toContain('none of these are derivable from any single judgment');
    expect(prose).toContain('an untyped edge can only say that two documents are related');
    expect(prose).toContain('typed entities the graph schema');
  });

  it('leaves the architecture stage details untouched', async () => {
    // The P2.1 canonical data is not a prose surface and is out of scope.
    const source = await fs.readFile(path.join(PROJECTS_DIR, 'legal-nlp.md'), 'utf-8');
    expect(source).toContain('detail: Cases, statutes, sections, courts, judges');
    expect(source).toContain('detail: CITES, APPLIES, DECIDED_BY, INVOLVES');
  });
});
