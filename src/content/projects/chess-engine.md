---
title: XAI Chess Engine
order: 1
featured: true
status: Completed
year: 2026
role: Co-Builder
positioning: Teaching a chess engine to explain itself.
descriptor: A hybrid neural and classical chess engine built to explain its decisions.
technologies:
  - Python
  - TensorFlow
  - scikit-learn
  - Flask
  - Vanilla JavaScript
  - Stockfish
thesis: >-
  The goal was not just to build a chess engine that could choose a move. It was
  to build one that could explain why it chose it.
overview: >-
  A hybrid engine that scores positions with a convolutional network trained
  against Stockfish evaluations, combines that score with classical chess
  features through ridge regression, reranks candidate moves, and then states
  the reasoning behind its choice in language a player can check.
architecture:
  label: Move selection
  figure: 2
  stages:
    - id: position
      label: Position
      detail: 8x8x12 planes, one per piece type per colour
      section: board-representation-and-the-network
    # The learned and the hand-written signals run alongside each other and
    # rejoin at the fusion step. Reading them as two sequential stages, as the
    # old flow list had to, misses the point of the architecture.
    - id: scoring-signals
      nodes:
        - id: cnn
          label: CNN
          detail: Predicts a Stockfish centipawn evaluation
          section: board-representation-and-the-network
        - id: classical-features
          label: Classical features
          detail: Material, space, centre control, mobility
          section: the-classical-layer
    - id: ridge-fusion
      label: Ridge fusion
      detail: Weighted combination into one hybrid score
      section: fusion
    - id: rerank
      label: Rerank
      detail: Heuristic bonuses plus one-ply opponent lookahead
      section: reranking
    - id: move-explanation
      label: Move + explanation
      detail: Ranked moves with checkable reasoning
decisions:
  - title: Predict an existing evaluation rather than learn from self-play
    stage: cnn
    body: >-
      The network is trained on roughly 50,000 positions evaluated by Stockfish
      at depth 8, so it learns to approximate a known-good evaluation function
      instead of discovering one. That makes the learned component measurable
      against a reference rather than only against itself.
  - title: Ridge regression for fusion, not another network
    stage: ridge-fusion
    body: >-
      A linear model keeps the contribution of each signal inspectable. The
      fitted weights show the normalised CNN score dominating at 330.9, with
      material at 32.4, centre control at 5.17, space at 0.79 and mobility at
      0.019. A second neural layer would have scored just as well while hiding
      exactly the information the project exists to expose.
  - title: Explanations from checkable conditions, not from the model
    stage: move-explanation
    body: >-
      explain_move() derives its reasoning from board conditions that can be
      independently verified: centre control, minor-piece development, pawn
      space, captures, checks, promotion, CNN positional improvement and
      board-control delta. The neural model does not generate the text. This
      keeps every stated reason falsifiable.
  - title: Integrated Gradients for a separate, visual account
    body: >-
      Attribution runs from an empty-board baseline over 50 interpolation steps
      using TensorFlow GradientTape, aggregating 12 input channels into one 8x8
      saliency map. It answers a different question from the symbolic
      explanation: which squares moved the network's score, rather than which
      chess principles applied.
metrics:
  - label: Held-out Pearson correlation
    value: '0.506'
    note: >-
      Correlation between predicted and Stockfish centipawn evaluations. This is
      a correlation coefficient, not an accuracy percentage.
  - label: Training positions
    value: '~50,000'
    note: Evaluated with Stockfish at depth 8.
  - label: Board representation
    value: 8x8x12
    note: One plane per piece type per colour.
  - label: Attribution steps
    value: '50'
    note: Integrated Gradients interpolation steps from an empty-board baseline.
parameters:
  - id: network
    label: Network
    section: board-representation-and-the-network
    rows:
      - label: Convolution
        value: Conv2D 64 to 128 to 128 filters
      - label: Batch normalization
        value: Present
      - label: Flatten
        value: Present
      - label: Dense layer
        value: 256 units
      - label: Dropout
        value: '0.3'
      - label: Output
        value: Dense 1
  - id: classical-models
    label: Classical models
    section: the-classical-layer
    rows:
      - label: Random Forest
        value: 500 trees, maximum depth 12
      - label: Random Forest target
        value: Future space control
      - label: MLP
        value: 256 to 128 to 64
      - label: MLP preprocessing
        value: StandardScaler
      - label: MLP target
        value: Game outcome
  - id: ridge-fusion
    label: Ridge fusion
    section: fusion
    note: >-
      These are fitted ridge coefficients, not feature importance values. Only
      the CNN score is documented as normalised, so the inputs are on
      different scales and the magnitudes cannot be compared against each
      other. Read together they say the learned evaluation dominates,
      material remains a meaningful correction, and mobility contributes
      almost nothing once the other signals are present.
    rows:
      - label: CNN score
        value: '330.9'
        note: Normalised.
      - label: Material
        value: '32.4'
      - label: Center control
        value: '5.17'
      - label: Space control
        value: '0.79'
      - label: Mobility
        value: '0.019'
limitations:
  - >-
    The CNN reaches a held-out Pearson correlation of 0.506 against Stockfish
    evaluations. This is a correlation, not an accuracy figure, and it should
    not be read as the engine agreeing with Stockfish half the time.
  - >-
    Move explanations are generated by explain_move() from checkable board
    conditions. The neural model does not produce them, so they describe the
    position rather than the network's internal reasoning.
  - >-
    Lookahead is one ply. The engine evaluates the opponent's immediate reply
    and no deeper, so it is not comparable to a conventional search engine.
github: https://github.com/gautham-balaji/chess-bot
figures:
  - figure: 1
    kind: screenshot
    span: full
    ratio: 16 / 9
    caption: >-
      The interface during play: board, live evaluation, the top three candidate
      moves and the generated explanation for the chosen move.
  - figure: 2
    kind: diagram
    span: wide
    ratio: auto
    caption: >-
      Architecture: board planes into the CNN, classical features alongside, and
      ridge fusion producing the hybrid score used for reranking and the
      explained move.
  - figure: 3
    kind: chart
    span: half
    ratio: 4 / 3
    caption: >-
      Integrated Gradients saliency over the board, showing which squares moved
      the network's evaluation most.
  - figure: 4
    kind: chart
    span: half
    ratio: 87 / 61
    src: ../../assets/projects/chess/training-loss.png
    alt: >-
      Line chart of training and validation MSE loss over 50 epochs, both
      curves descending sharply in the first few epochs and levelling out
      close together with no divergence.
    source: Training run, chess-bot repository.
    caption: >-
      Training and validation loss (MSE) over 50 epochs. The two curves stay
      close throughout, with no sign of overfitting.
---

## The problem

A strong chess engine can tell you its move and its evaluation. It usually
cannot tell you what about the position produced that number.

That gap matters most for anyone trying to learn from the engine. A centipawn
score is a verdict without an argument. The interesting question is not whether
a model can pick a good move, but whether it can expose enough of its reasoning
that a human can disagree with it.

## The approach

The engine keeps the learned component and the explainable component separate,
then combines them in a way that stays inspectable.

A convolutional network handles positional intuition, the part that is hard to
write by hand. Classical chess features handle the quantities that are already
well understood and cheap to compute. A linear model decides how much each one
counts, which means the balance between them can be read off directly rather
than inferred.

## Board representation and the network

Positions are encoded as **8x8x12 planes**, one plane per piece type per colour.
This keeps the spatial structure of the board intact, so convolution operates
over real board geometry rather than a flattened vector.

The network is a small convolutional stack, widening as it goes and ending in
a single scalar: the layer sizes are set out in the table below. It is
deliberately modest, because the job is to approximate an evaluation function
that already exists rather than to discover one, and a larger model would have
bought accuracy at the cost of the training budget the project had. It is
trained to predict Stockfish centipawn evaluations across roughly 50,000
positions at depth 8.

On held-out positions it reaches a Pearson correlation of **0.506**. That is a
correlation between its predictions and Stockfish's, and it is reported that way
deliberately: it is not an accuracy figure and does not describe how often the
engine picks the same move.

## The classical layer

Two conventional models run alongside the network, each answering a question
the CNN is not asked. A random forest predicts future space control, which is
a structured, feature-shaped problem where an ensemble of shallow trees is a
better fit than a convolution over the board. A multilayer perceptron predicts
game outcome from scaled inputs, which is the one place a small dense model
earns its keep. Their configurations are in the table below.

These cover signals that are well characterised in chess theory and do not need
to be rediscovered by a network.

## Fusion

Ridge regression combines the normalised CNN score with material, space, centre
control and mobility into a single hybrid score.

The fitted weights are the most informative artefact the project produced, and
they are set out in the table below. They are coefficients rather than
importances: only the CNN score is normalised, so the five numbers sit on
different scales and cannot be ranked against one another. What they do show,
read with that caveat, is that the learned evaluation dominates, material
remains a meaningful correction, and mobility contributes almost nothing once
the other signals are present.

A linear fusion step was chosen precisely so that this could be stated as a fact
rather than guessed at. A second network would have hidden exactly the numbers
this section exists to print.

## Reranking

Candidate moves are ranked rather than searched. The engine generates legal
moves, batches the resulting positions through the CNN, computes hybrid scores,
applies heuristic move bonuses, performs a one-ply opponent lookahead, and ranks
what remains.

One ply is a real constraint. The engine sees the immediate reply and no
further, so it plays positionally rather than tactically deep.

## Explainability

Two independent mechanisms, answering different questions.

`explain_move()` builds an explanation from conditions that can be checked
against the board: centre control, minor-piece development, pawn space,
captures, checks, promotion, CNN positional improvement and board-control delta.
Because each condition is verifiable, a player can test the claim rather than
take it on trust. The network does not write these explanations.

Integrated Gradients produces the visual account. Starting from an empty-board
baseline, the attribution runs 50 interpolation steps through TensorFlow
GradientTape and aggregates 12 channels into one 8x8 saliency map over the
board.

## The application

A Flask application with a vanilla JavaScript front end carries the interactive
board, live analysis, the top three candidate moves, generated explanations,
live metrics, an analyse mode, resign, game statistics, promotion handling,
touch support and the saliency visualisation.
