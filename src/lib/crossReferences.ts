/**
 * Cross-reference resolution (P2.2).
 *
 * Two kinds of link connect a project page to itself:
 *
 *   architecture stage  --section-->  a prose heading on the same page
 *   decision            --stage---->  an architecture stage or node
 *
 * Both are optional, and both must be impossible to point at something that
 * does not exist. The two checks happen in different places because the data
 * is available at different times: a decision's target is a sibling field, so
 * Zod can resolve it while parsing frontmatter, but a heading slug only exists
 * once the markdown body has been rendered, which is after the schema has run.
 *
 * So the functions here are deliberately pure and import nothing. The content
 * schema calls them during parsing, the project layout calls them during
 * rendering, and the unit tests call them directly with fabricated input,
 * which is the only way to test the failure cases without authoring broken
 * content.
 */

/** A node inside a paired stage, or the shape of one. */
export interface ReferencedNode {
  id: string;
  section?: string | undefined;
}

/** One architecture stage, which may hold a pair of nodes. */
export interface ReferencedStage extends ReferencedNode {
  nodes?: readonly ReferencedNode[] | undefined;
}

/** A decision that may name the stage it governs. */
export interface ReferencingDecision {
  title: string;
  stage?: string | undefined;
}

/**
 * DOM id for an architecture stage or node.
 *
 * Namespaced, because a stage id and a prose heading slug are drawn from
 * different vocabularies and have already collided once: Legal NLP has both a
 * `hybrid-retrieval` stage and a `hybrid-retrieval` heading. Unprefixed, those
 * would be two elements with the same id on one page.
 */
export function stageAnchorId(id: string): string {
  return `stage-${id}`;
}

/** Every addressable id in an architecture: stages, plus their nodes. */
export function architectureIds(stages: readonly ReferencedStage[]): string[] {
  const ids: string[] = [];
  for (const stage of stages) {
    ids.push(stage.id);
    for (const node of stage.nodes ?? []) ids.push(node.id);
  }
  return ids;
}

/** Every stage and node that names a prose section, flattened. */
export function sectionRefs(
  stages: readonly ReferencedStage[],
): { id: string; section: string }[] {
  const refs: { id: string; section: string }[] = [];
  for (const stage of stages) {
    if (stage.section) refs.push({ id: stage.id, section: stage.section });
    for (const node of stage.nodes ?? []) {
      if (node.section) refs.push({ id: node.id, section: node.section });
    }
  }
  return refs;
}

/**
 * Decisions whose `stage` names nothing in the architecture.
 *
 * Returned rather than thrown so the caller decides what a miss means: the
 * schema turns it into a Zod issue, the tests assert on the list.
 */
export function unknownStageRefs(
  decisions: readonly ReferencingDecision[],
  stages: readonly ReferencedStage[],
): { title: string; stage: string }[] {
  const known = new Set(architectureIds(stages));
  return decisions
    .filter((decision) => decision.stage && !known.has(decision.stage))
    .map((decision) => ({ title: decision.title, stage: decision.stage as string }));
}

/** Stages or nodes whose `section` names no heading in the rendered body. */
export function unknownSectionRefs(
  stages: readonly ReferencedStage[],
  headingSlugs: readonly string[],
): { id: string; section: string }[] {
  const known = new Set(headingSlugs);
  return sectionRefs(stages).filter((ref) => !known.has(ref.section));
}
