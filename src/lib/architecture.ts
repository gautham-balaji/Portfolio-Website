/**
 * Architecture projections (P2.1).
 *
 * One canonical architecture lives in each project's frontmatter. This module
 * is the only place that reads it, and it hands out two derived views:
 *
 *   detailView  the project page: full topology, every documented detail
 *   rowView     the homepage index: stage names and the return path, nothing else
 *
 * Nothing here adds, renames or infers a stage. Every field is carried through
 * from the content entry; the only work done is resolving the loop endpoints
 * from ids to labels and flattening paired stages for the compact rail. That
 * boundary is the point: before P2.1 three components each reached into their
 * own idea of what a project's architecture was, and two of them had already
 * drifted apart.
 */

import type { CollectionEntry } from 'astro:content';

type Project = CollectionEntry<'projects'>;
type Architecture = NonNullable<Project['data']['architecture']>;

export type ArchitectureStage = Architecture['stages'][number];
export type ArchitectureNode = NonNullable<ArchitectureStage['nodes']>[number];

/** A loop with its endpoints resolved to the labels a reader will recognise. */
export interface ResolvedLoop {
  from: string;
  to: string;
  label: string;
  fromLabel: string;
  toLabel: string;
  /** Position of each endpoint in the stage list, for drawing the arc. */
  fromIndex: number;
  toIndex: number;
}

export interface DetailView {
  label: string;
  figure: number;
  stages: ArchitectureStage[];
  loop?: ResolvedLoop | undefined;
}

export interface RowStage {
  id: string;
  label: string;
  gate: boolean;
}

export interface RowView {
  label: string;
  steps: RowStage[];
  /** The return path's own word, e.g. "reject". Absent where none is documented. */
  loop?: string | undefined;
}

/**
 * How a stage is named when it has to be named in one string.
 *
 * A paired stage usually carries its own label, because the grouping is itself
 * documented (Legal NLP's "Hybrid retrieval" is the two signals scored
 * together). Where it does not, the nodes name it between them rather than
 * this module inventing a word for it.
 */
export function stageLabel(stage: ArchitectureStage): string {
  if (stage.label) return stage.label;
  return (stage.nodes ?? []).map((node) => node.label).join(' + ');
}

/** The full architecture for a project detail page, or undefined if it has none. */
export function detailView(project: Project): DetailView | undefined {
  const architecture = project.data.architecture;
  if (!architecture) return undefined;

  return {
    label: architecture.label,
    figure: architecture.figure,
    stages: architecture.stages,
    loop: resolveLoop(architecture),
  };
}

/**
 * Every architecture id mapped to the label a reader would recognise.
 *
 * Decisions reference a stage by id; the decision list has to print a name.
 * Covers nodes as well as stages, because a decision may govern one half of a
 * pair (chess's fusion decision is about `ridge-fusion`, but its training
 * decision is about the `cnn` node inside the paired scoring stage).
 */
export function stageLabels(project: Project): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const stage of project.data.architecture?.stages ?? []) {
    if (stage.label) labels[stage.id] = stage.label;
    for (const node of stage.nodes ?? []) labels[node.id] = node.label;
  }
  return labels;
}

/** The compact projection the homepage index rail renders. */
export function rowView(project: Project): RowView | undefined {
  const architecture = project.data.architecture;
  if (!architecture) return undefined;

  return {
    label: architecture.label,
    steps: architecture.stages.map((stage) => ({
      id: stage.id,
      label: stageLabel(stage),
      gate: stage.gate,
    })),
    loop: architecture.loop?.label,
  };
}

/**
 * Turn `{ from: 'critic', to: 'generator' }` into something renderable.
 *
 * The schema already guarantees both ids resolve, so a miss here would mean
 * the content and the schema disagree. Returning undefined rather than
 * throwing keeps a bad edge from taking the whole page down, and the unit
 * tests assert the edge exists.
 */
function resolveLoop(architecture: Architecture): ResolvedLoop | undefined {
  const loop = architecture.loop;
  if (!loop) return undefined;

  const fromIndex = architecture.stages.findIndex((stage) => stage.id === loop.from);
  const toIndex = architecture.stages.findIndex((stage) => stage.id === loop.to);
  if (fromIndex < 0 || toIndex < 0) return undefined;

  return {
    from: loop.from,
    to: loop.to,
    label: loop.label,
    fromLabel: stageLabel(architecture.stages[fromIndex]!),
    toLabel: stageLabel(architecture.stages[toIndex]!),
    fromIndex,
    toIndex,
  };
}
