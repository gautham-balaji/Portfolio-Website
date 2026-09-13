/**
 * Architecture diagram data for specific project figure slots.
 *
 * Phase 5: Chess, Legal NLP and VERA have no public repository imagery (or,
 * for Chess, only imagery that mismatches or exceeds what MASTER_CONTENT.md
 * verifies), and GeoCounterfactual's own repository has no diagrams or media
 * at all. Where a figure's caption already promises an architecture diagram,
 * this file supplies the node/edge structure ArchitectureDiagram.astro draws,
 * built only from facts already stated in the matching project's frontmatter
 * (`flow`, `decisions`) and prose. Nothing here introduces a component,
 * metric or relationship that is not already written elsewhere in that
 * project's content file.
 *
 * Keyed by project `id` (the content collection entry id, i.e. the filename
 * without extension) and then by figure number.
 */

interface DiagramNode {
  label: string;
  detail?: string;
}

interface DiagramStage {
  nodes: [DiagramNode] | [DiagramNode, DiagramNode];
  gate?: boolean;
}

export interface DiagramSpec {
  stages: DiagramStage[];
  loopBack?: { from: number; to: number; label: string };
}

export const ARCHITECTURE_DIAGRAMS: Record<string, Record<number, DiagramSpec>> = {
  'chess-engine': {
    2: {
      stages: [
        { nodes: [{ label: 'Position', detail: '8x8x12 planes' }] },
        {
          nodes: [
            { label: 'CNN', detail: 'Predicts eval' },
            { label: 'Classical features', detail: 'Material + space' },
          ],
        },
        { nodes: [{ label: 'Ridge fusion', detail: 'Hybrid score' }] },
        { nodes: [{ label: 'Rerank', detail: 'Heuristics + 1-ply lookahead' }] },
      ],
    },
  },
  'legal-nlp': {
    1: {
      stages: [
        { nodes: [{ label: 'Judgment', detail: 'Raw court text' }] },
        { nodes: [{ label: 'NLP extraction', detail: 'Legal NER + IPC/CrPC patterns' }] },
        {
          nodes: [
            { label: 'Knowledge graph', detail: 'CITES, APPLIES, DECIDED_BY, INVOLVES' },
          ],
        },
        {
          nodes: [
            { label: 'Semantic search', detail: 'Sentence embeddings' },
            { label: 'Graph signals', detail: 'Citation structure' },
          ],
        },
        { nodes: [{ label: 'Ranked cases', detail: 'Combined rerank' }], gate: true },
      ],
    },
  },
  vera: {
    1: {
      stages: [
        { nodes: [{ label: 'Caller', detail: 'Inbound call' }] },
        { nodes: [{ label: 'Twilio', detail: 'Telephony transport' }] },
        { nodes: [{ label: 'VERA', detail: 'Session + conversation memory' }] },
        { nodes: [{ label: 'Gemini', detail: 'Understanding + generation' }] },
        {
          nodes: [{ label: 'Retrieval and tools', detail: 'Vector search, tool selection' }],
          gate: true,
        },
        { nodes: [{ label: 'Speech', detail: 'Generated audio' }] },
        { nodes: [{ label: 'Caller', detail: 'Reply heard in-call' }] },
      ],
    },
  },
  geocounterfactual: {
    2: {
      stages: [
        { nodes: [{ label: 'Input handler', detail: 'LangGraph entry point' }] },
        { nodes: [{ label: 'Planner', detail: 'Gemini parses intent' }] },
        { nodes: [{ label: 'Dynamics', detail: 'NumPy hydro-ecological constraints' }] },
        { nodes: [{ label: 'Generator', detail: 'Stable Diffusion 1.5 + ControlNet' }] },
        {
          nodes: [{ label: 'Critic', detail: 'Slope, spectral, SSIM checks' }],
          gate: true,
        },
        { nodes: [{ label: 'Simulation', detail: 'Accepted counterfactual' }] },
      ],
      loopBack: { from: 4, to: 3, label: 'reject' },
    },
  },
};
