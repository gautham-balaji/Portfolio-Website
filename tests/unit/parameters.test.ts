import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import Slugger from 'github-slugger';
import { unknownRefs } from '@/lib/crossReferences';

/**
 * P2.3: technical parameters as specification tables.
 *
 * The values here are the project's documented configuration, moved out of
 * running prose so they can be read against each other. Two things need
 * guarding.
 *
 * The first is the numbers themselves, which are pinned verbatim against
 * MASTER_CONTENT. The second, and the reason the ridge group gets a test of
 * its own, is the framing: ridge coefficients fitted on differently scaled
 * inputs are not importances, and a table is the one place where a layout
 * could quietly turn them into a ranking. The assertions below make that a
 * failing test rather than a judgement call.
 *
 * Legal NLP and VERA are asserted to have no parameters at all. That is not
 * an omission waiting to be filled: Legal NLP's numbers are results and
 * already live in `metrics`, and VERA documents none and must never be given
 * invented ones.
 */

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');

const SLUGS = ['chess-engine', 'legal-nlp', 'vera', 'geocounterfactual'] as const;
type Slug = (typeof SLUGS)[number];

interface Row {
  label: string;
  value: string;
  note?: string;
}
interface Group {
  id: string;
  label: string;
  section?: string;
  note?: string;
  rows: Row[];
}
interface Project {
  parameters?: Group[];
  metrics?: { label: string }[];
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function read(slug: Slug): Promise<{ data: Project; headingSlugs: string[] }> {
  const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match?.[1]) throw new Error(`No frontmatter in ${slug}.md`);

  const slugger = new Slugger();
  const headingSlugs = [...(match[2] ?? '').matchAll(/^## (.+)$/gm)].map((m) =>
    slugger.slug(m[1]!.trim()),
  );
  return { data: parse(match[1]) as Project, headingSlugs };
}

/** Flatten a project's parameter rows to `groupId.rowLabel -> value`. */
function flatten(groups: Group[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of groups) {
    for (const row of group.rows) out[`${group.id}.${row.label}`] = row.value;
  }
  return out;
}

/* ---------------------------------------------------------------------------
   Which projects get tables at all.
   --------------------------------------------------------------------------- */

describe('parameter tables exist only where configuration is documented', () => {
  it('chess declares the three approved groups, in order', async () => {
    const { data } = await read('chess-engine');
    expect(data.parameters?.map((g) => g.id)).toEqual([
      'network',
      'classical-models',
      'ridge-fusion',
    ]);
  });

  it('geocounterfactual declares exactly one group', async () => {
    const { data } = await read('geocounterfactual');
    expect(data.parameters?.map((g) => g.id)).toEqual(['constraints']);
  });

  it.each(['legal-nlp', 'vera'] as const)('%s declares no parameters', async (slug) => {
    // Legal NLP's figures are results, not configuration, and belong to the
    // measurements block. VERA publishes no numbers and must not be given
    // any: MASTER_CONTENT.md §10 and its own limitations forbid it.
    const { data } = await read(slug);
    expect(data.parameters ?? []).toEqual([]);
  });
});

/* ---------------------------------------------------------------------------
   Shape and references.
   --------------------------------------------------------------------------- */

describe('parameter group shape', () => {
  it.each(SLUGS)('%s: group ids are unique, kebab-case, and rows non-empty', async (slug) => {
    const { data } = await read(slug);
    const groups = data.parameters ?? [];
    const ids = groups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const group of groups) {
      expect(group.id, `${slug}: "${group.id}"`).toMatch(KEBAB);
      expect(group.rows.length, `${slug}: "${group.id}" rows`).toBeGreaterThan(0);
      for (const row of group.rows) {
        expect(row.label.trim().length).toBeGreaterThan(0);
        expect(row.value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it.each(SLUGS)('%s: every group section names a real prose heading', async (slug) => {
    const { data, headingSlugs } = await read(slug);
    expect(unknownRefs(data.parameters ?? [], headingSlugs)).toEqual([]);
  });

  it.each(SLUGS)('%s: no parameter row repeats a measurement label', async (slug) => {
    // Configuration and results sit three blocks apart; the same label in
    // both reads as the page disagreeing with itself about what the number
    // is. Enforced in the schema, asserted here against the real content.
    const { data } = await read(slug);
    const metricLabels = new Set(
      (data.metrics ?? []).map((m) => m.label.trim().toLowerCase()),
    );
    const clashes: string[] = [];
    for (const group of data.parameters ?? []) {
      for (const row of group.rows) {
        if (metricLabels.has(row.label.trim().toLowerCase())) clashes.push(row.label);
      }
    }
    expect(clashes).toEqual([]);
  });
});

/* ---------------------------------------------------------------------------
   The values, pinned to MASTER_CONTENT.
   --------------------------------------------------------------------------- */

const CHESS_EXPECTED: Record<string, string> = {
  'network.Convolution': 'Conv2D 64 to 128 to 128 filters',
  'network.Batch normalization': 'Present',
  'network.Flatten': 'Present',
  'network.Dense layer': '256 units',
  'network.Dropout': '0.3',
  'network.Output': 'Dense 1',
  'classical-models.Random Forest': '500 trees, maximum depth 12',
  'classical-models.Random Forest target': 'Future space control',
  'classical-models.MLP': '256 to 128 to 64',
  'classical-models.MLP preprocessing': 'StandardScaler',
  'classical-models.MLP target': 'Game outcome',
  'ridge-fusion.CNN score': '330.9',
  'ridge-fusion.Material': '32.4',
  'ridge-fusion.Center control': '5.17',
  'ridge-fusion.Space control': '0.79',
  'ridge-fusion.Mobility': '0.019',
};

const GEO_EXPECTED: Record<string, string> = {
  'constraints.Water presence': 'Present in at least 2 of 2022-2024',
  'constraints.Historical absence': 'Absent across 2018-2020',
  'constraints.Rainfall confound control': 'CHIRPS used to remove wet-year confounds',
  'constraints.Water slope': 'Reject water on slopes above approximately 2.5 degrees',
  'constraints.NDVI ceiling': 'Applied',
  'constraints.Existing open water': 'Protected',
  'constraints.Change mask': 'Changes restricted to the spatial change mask',
  'constraints.Background': 'Held constant through hard compositing',
};

describe('documented values', () => {
  it('chess parameters match the approved table exactly', async () => {
    const { data } = await read('chess-engine');
    expect(flatten(data.parameters ?? [])).toEqual(CHESS_EXPECTED);
  });

  it('geocounterfactual parameters match the approved table exactly', async () => {
    const { data } = await read('geocounterfactual');
    expect(flatten(data.parameters ?? [])).toEqual(GEO_EXPECTED);
  });

  it('states that the NDVI threshold is not published rather than inventing one', async () => {
    const { data } = await read('geocounterfactual');
    const row = data.parameters?.[0]?.rows.find((r) => r.label === 'NDVI ceiling');
    expect(row?.note?.toLowerCase()).toContain('not published');
    expect(`${row?.value} ${row?.note}`).not.toMatch(/\d/);
  });

  it('surfaces no undocumented geospatial parameter', async () => {
    // MNDWI, focal mean and dynamic UTM appear nowhere in the project
    // content or in MASTER_CONTENT, so they cannot be tabulated.
    const { data } = await read('geocounterfactual');
    const text = JSON.stringify(data.parameters).toLowerCase();
    for (const absent of ['mndwi', 'focal mean', 'utm', '/api/']) {
      expect(text, `must not surface "${absent}"`).not.toContain(absent);
    }
  });

  it('keeps simulation time out of the parameter tables', async () => {
    // It is current behaviour, not configuration, and already carries its
    // "not a performance result" qualifier in the measurements block.
    const { data } = await read('geocounterfactual');
    expect(JSON.stringify(data.parameters)).not.toMatch(/146|195/);
  });

  it('keeps Integrated Gradients configuration out of the parameter tables', async () => {
    // Locked decision: it stays in the Explainability prose and its decision.
    const { data } = await read('chess-engine');
    const text = JSON.stringify(data.parameters).toLowerCase();
    for (const absent of ['gradient', 'saliency', 'interpolation', 'baseline']) {
      expect(text, `must not surface "${absent}"`).not.toContain(absent);
    }
  });
});

/* ---------------------------------------------------------------------------
   The ridge coefficients, and how they are allowed to be framed.
   --------------------------------------------------------------------------- */

describe('ridge coefficients', () => {
  async function ridge() {
    const { data } = await read('chess-engine');
    const group = data.parameters?.find((g) => g.id === 'ridge-fusion');
    if (!group) throw new Error('no ridge-fusion group');
    return group;
  }

  it('prints the five coefficients exactly as documented, unrounded', async () => {
    const group = await ridge();
    expect(group.rows.map((r) => [r.label, r.value])).toEqual([
      ['CNN score', '330.9'],
      ['Material', '32.4'],
      ['Center control', '5.17'],
      ['Space control', '0.79'],
      ['Mobility', '0.019'],
    ]);
  });

  it('says they are fitted coefficients and not importance values', async () => {
    const note = (await ridge()).note ?? '';
    expect(note.toLowerCase()).toContain('fitted ridge coefficients');
    expect(note.toLowerCase()).toContain('not feature importance');
  });

  it('records that only the CNN score is normalised, so magnitudes do not compare', async () => {
    const group = await ridge();
    const note = (group.note ?? '').toLowerCase();
    expect(note).toContain('normalis');
    expect(note).toMatch(/cannot be compared|not.*compar/);
    expect(group.rows.find((r) => r.label === 'CNN score')?.note?.toLowerCase()).toContain(
      'normalised',
    );
  });

  it('adds no ranking, share or derived value', async () => {
    const group = await ridge();
    const text = JSON.stringify(group).toLowerCase();
    for (const banned of ['importance', '%', 'rank', 'most important', 'percent', 'share']) {
      // "not feature importance" is the one permitted use, and it is a
      // denial of the reading rather than an assertion of it.
      const occurrences = text.split(banned).length - 1;
      const allowed = banned === 'importance' ? 1 : 0;
      expect(occurrences, `"${banned}" in ridge group`).toBe(allowed);
    }
    // Exactly five rows: no total, no normalised share.
    expect(group.rows).toHaveLength(5);
  });
});

/* ---------------------------------------------------------------------------
   Relocation, not duplication.
   --------------------------------------------------------------------------- */

describe('prose was rewritten rather than left to repeat the tables', () => {
  /** The body, lower-cased and unwrapped, so assertions ignore line breaks. */
  async function body(slug: Slug): Promise<string> {
    const source = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.md`), 'utf-8');
    const raw = /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(source)?.[1] ?? '';
    return raw.toLowerCase().replace(/\s+/g, ' ');
  }

  it('chess prose no longer enumerates the network or classical configuration', async () => {
    const prose = await body('chess-engine');
    for (const moved of [
      '64, 128 and 128',
      '500 trees',
      '256 to 128 to 64',
      'dropout at 0.3',
    ]) {
      expect(prose, `"${moved}" should now live only in the table`).not.toContain(moved);
    }
  });

  it('chess prose no longer enumerates the ridge coefficients', async () => {
    const prose = await body('chess-engine');
    for (const value of ['330.9', '32.4', '5.17', '0.019']) {
      expect(prose, `"${value}" should now live only in the table`).not.toContain(value);
    }
  });

  it('chess prose keeps the reasoning the tables cannot carry', async () => {
    const prose = await body('chess-engine');
    expect(prose).toContain('coefficients rather than');
    expect(prose).toContain('gradienttape');
    expect(prose).toContain('50 interpolation steps');
  });

  it('geo prose no longer re-lists the constraints', async () => {
    const prose = await body('geocounterfactual');
    expect(prose).not.toContain('2.5 degrees');
    expect(prose).not.toContain('vegetation is capped by an ndvi');
  });

  it('geo prose keeps the reason the constraints exist', async () => {
    const prose = await body('geocounterfactual');
    expect(prose).toContain('gravity does not permit it');
    expect(prose).toContain('bounded before generation');
  });
});
