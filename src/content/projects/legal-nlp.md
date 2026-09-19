---
title: Legal NLP Knowledge Graph
order: 2
featured: false
status: Built
year: 2026
role: Co-Builder
positioning: Turning legal judgments into connected knowledge.
descriptor: >-
  An NLP system that extracts legal entities and relationships from Indian court
  judgments, builds a knowledge graph, classifies cases, and retrieves similar
  cases using semantic and graph-based signals.
technologies:
  - Python
  - spaCy
  - BERT
  - scikit-learn
  - NetworkX
  - Streamlit
  - SHAP
  - LIME
  - Sentence Transformers
thesis: >-
  Legal judgments contain relationships that are difficult to capture with plain
  text search alone. The system combines NLP extraction with graph structure and
  semantic retrieval to make those relationships usable.
overview: >-
  Judgments are parsed into entities and relationships, assembled into a
  citation graph, and then searched two ways at once: by meaning, using sentence
  embeddings, and by structure, using the graph. The two signals are combined at
  rerank time, so a case can surface because it reads similarly or because it
  sits in the right position in the citation network.
architecture:
  label: Judgment to retrieval
  figure: 1
  stages:
    - id: judgment
      label: Judgment
      detail: Raw court judgment text
    - id: nlp-extraction
      label: NLP extraction
      detail: Legal NER plus pattern matching for IPC and CrPC references
    - id: entities-relations
      label: Entities and relations
      detail: Cases, statutes, sections, courts, judges
    - id: knowledge-graph
      label: Knowledge graph
      detail: CITES, APPLIES, DECIDED_BY, INVOLVES
    # The decision point, and the one stage that is itself a pair: the two
    # retrieval signals are scored together rather than in sequence.
    - id: hybrid-retrieval
      label: Hybrid retrieval
      detail: Semantic search and graph signals scored together
      gate: true
      nodes:
        - id: semantic-search
          label: Semantic search
          detail: Sentence embeddings
        - id: graph-signals
          label: Graph signals
          detail: Citation structure
    - id: ranked-cases
      label: Ranked cases
      detail: Combined-score reranking with an explanation
decisions:
  - title: Two retrieval signals instead of one
    body: >-
      Sentence Transformer embeddings find judgments that read alike. Citation
      structure finds judgments that are connected, even when the wording
      differs. Combining them at rerank time covers a case that plain semantic
      search misses: a precedent phrased quite differently but central to the
      citation network.
  - title: Pattern matching alongside learned extraction
    body: >-
      Statutory references such as IPC and CrPC sections follow strict, known
      formats. Handling them with explicit patterns rather than leaving them to
      the model makes that part of extraction deterministic and reviewable,
      while custom legal NER handles the parts that genuinely need learning.
  - title: Graph analytics as a ranking signal
    body: >-
      PageRank, centrality and community detection run over the citation graph,
      which gives a structural notion of which judgments are load-bearing. This
      is information that exists only in the relationships, not in any single
      document's text.
  - title: Explanations attached to predictions
    body: >-
      SHAP and LIME expose which features drove a classification, and matching
      text spans are highlighted in the source judgment. In a legal context an
      unexplained classification is not usable, so the explanation is part of
      the output rather than a debugging aid.
metrics:
  - label: Entity extraction F1
    value: '0.87'
    note: Across the evaluated entity types.
  - label: Classification accuracy
    value: '0.92'
    note: Case category classification over the project's evaluation set.
  - label: Retrieval MAP@10
    value: '0.78'
    note: Mean average precision over the top ten retrieved cases.
  - label: Graph construction
    value: ~2 s/case
    note: Time to build graph structure per judgment.
  - label: Query latency
    value: < 1 s
    note: Retrieval response time.
limitations:
  - >-
    These are project evaluation figures measured during development, not
    production monitoring. They describe the system on its own dataset.
  - >-
    The corpus combines Indian Kanoon scraping with synthetic and custom
    judgments, so results reflect that mixture rather than a clean sample of
    real case law.
  - >-
    There is no public repository or deployment for this project. The system ran
    as a local Streamlit application.
figures:
  - figure: 1
    kind: diagram
    span: full
    ratio: auto
    caption: >-
      Pipeline: judgment through NLP extraction into the knowledge graph, then
      out through hybrid semantic and graph retrieval.
  - figure: 2
    kind: screenshot
    span: wide
    ratio: 16 / 10
    caption: >-
      Knowledge graph exploration: cases, statutes and courts linked by citation
      and application edges, with filters applied.
  - figure: 3
    kind: screenshot
    span: half
    ratio: 4 / 3
    caption: >-
      Retrieval results showing the semantic and graph score breakdown for each
      returned case.
---

## The problem

Legal research is a relationship problem disguised as a search problem.

What matters about a judgment is rarely contained in the judgment alone. It is
which statutes it applies, which earlier cases it cites, which court decided it,
and how it sits relative to everything around it. Full-text search over the
words on the page cannot see any of that, because the structure is not in the
text. It is in the connections between documents.

## Extraction

Each judgment passes through a custom legal named-entity recognition stage,
which identifies cases, statutes, sections, courts and judges.

Statutory references are handled separately. Citations to the IPC, the CrPC and
similar codes follow strict formats, so they are matched by explicit pattern
rules rather than left to a learned model. That part of extraction is therefore
deterministic and can be checked by reading the rule.

A relationship extraction stage then connects the entities to each other.

## The graph

Extracted entities become nodes. Relationships become typed edges: `CITES`,
`APPLIES`, `DECIDED_BY` and `INVOLVES`.

Once the corpus is a graph rather than a pile of documents, structural questions
become answerable. PageRank surfaces judgments that the network treats as
authoritative. Centrality measures identify the cases that hold regions of the
graph together. Community detection groups clusters of related law.

None of these are derivable from any single judgment's text.

## Hybrid retrieval

This is the part of the system worth the most attention.

Retrieval runs on two signals at once. Sentence Transformer embeddings provide
semantic similarity, finding judgments that discuss the same substance. The
citation network provides structural proximity, finding judgments that are
connected to the query case.

The two are combined through a reranking step that produces a single ordering
while keeping the contribution of each signal visible. A case can be retrieved
because it reads similarly, because it sits in the right part of the citation
graph, or both, and the interface shows which.

## Classification

Logistic regression, random forest and BERT models classify case category.
Features combine TF-IDF over judgment text, entity features from extraction and
graph features from the citation network, with ensemble methods over the
individual models.

Classification reached **0.92 accuracy** on the project's evaluation set,
against **0.87 F1** for entity extraction and **MAP@10 of 0.78** for retrieval.
These are development measurements on the project's own corpus, which mixes
Indian Kanoon scraping with synthetic and custom judgments.

## Explainability

SHAP and LIME attribute each classification to specific features, and the spans
responsible are highlighted in the source judgment.

This was treated as a requirement rather than an addition. A classification that
a lawyer cannot trace back to the text of the judgment is not something they can
act on.

## The application

A Streamlit interface carries the full workflow: judgment upload or paste,
extracted entities, classification with confidence, feature importance, SHAP
explanations, interactive graph exploration with filters, PageRank and
centrality analytics, similar-case retrieval with the semantic and graph score
breakdown, graph paths between cases, and export.

Graph construction runs at roughly two seconds per case, with queries returning
in under a second.
