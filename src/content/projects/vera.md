---
title: VERA
order: 3
featured: false
status: Prototype
year: 2025
role: Lead Engineer
positioning: AI-powered voice receptionist for business calls.
descriptor: >-
  A real-time AI voice agent built around Gemini and Twilio for conversational
  business calls, with retrieval and tool orchestration to ground responses and
  handle live interactions.
technologies:
  - Gemini
  - Gemini Live
  - Twilio
  - RAG
  - Tool Orchestration
thesis: >-
  Building a voice AI system that can understand, retrieve, act, and respond in
  real time.
overview: >-
  A caller dials a business number and talks to an agent that can answer from
  the company's own knowledge rather than a script. The engineering problem is
  not the conversation, it is the clock: every stage between the caller
  finishing a sentence and hearing a reply has to fit inside the window where a
  pause still feels like a conversation.
architecture:
  label: Call lifecycle
  figure: 1
  stages:
    # The call opens and closes on the same participant, so the two stages
    # share a label and are told apart by their ids.
    - id: caller-inbound
      label: Caller
      detail: Inbound call to a business number
      section: the-call-lifecycle
    - id: twilio
      label: Twilio
      detail: Telephony transport and audio streaming
      section: the-call-lifecycle
    - id: vera
      label: VERA
      detail: Session handling and conversation memory
      section: the-call-lifecycle
    - id: gemini
      label: Gemini
      detail: Understanding and response generation
      section: the-call-lifecycle
    - id: retrieval-tools
      label: Retrieval and tools
      detail: Vector search over domain knowledge, dynamic tool selection
      gate: true
    - id: speech
      label: Speech
      detail: Generated response returned as audio
    - id: caller-reply
      label: Caller
      detail: Reply heard in-call
      section: the-call-lifecycle
decisions:
  - title: Latency treated as the primary constraint
    body: >-
      In a voice interface, delay is the failure mode. Text can arrive late and
      still read correctly, but a pause on a phone call reads as the system
      being broken. The architecture is shaped around keeping the caller inside
      a natural conversational rhythm rather than around maximising response
      quality in isolation.
  - title: Offloading text-to-speech work
    stage: speech
    body: >-
      The key optimisation was moving text-to-speech work off the critical path
      so that speech generation stopped blocking the response cycle. This was
      the single change that most improved responsiveness. No latency figures
      are published here because none were formally measured.
  - title: Retrieval to ground the agent in company knowledge
    stage: retrieval-tools
    body: >-
      A RAG pipeline with vector-based retrieval supplies domain-specific
      context at answer time, so the agent responds from the business's own
      material rather than from the model's general knowledge. For a
      receptionist, being wrong confidently is worse than being slow.
  - title: Multi-tool orchestration during a live call
    stage: retrieval-tools
    body: >-
      Rather than a fixed script, the agent selects tools dynamically as the
      conversation develops. This is what separates a voice agent from an
      interactive voice response tree: the path through the call is decided at
      runtime.
  - title: Structured conversation memory
    stage: vera
    body: >-
      Memory is kept in a structured form to maintain contextual continuity
      across a session, so the caller does not have to restate what they have
      already said.
signature:
  kind: critical-path
  note: >-
    No timings appear here. Responsiveness was improved, but it was never
    formally measured, so this records where the work sits in the cycle rather
    than how long any of it takes.
  paths:
    - label: Handled naively
      note: >-
        Every step is blocking: the caller is waiting through all of it,
        including the audio rendering at the end.
      steps:
        - Caller finishes speaking
        - Understanding and retrieval
        - Response decided
        - Speech rendered
        - Audio returned to the caller
  outcome:
    label: As built
    statements:
      - Speech generation was moved off the blocking path.
      - The response cycle no longer waits on audio rendering.
limitations:
  - >-
    VERA is a hackathon prototype. It is not deployed, has no public URL, and
    has not run with real customer traffic.
  - >-
    No latency figures are published. Responsiveness was improved by offloading
    text-to-speech work, but the improvement was not formally measured, so
    quoting a number would be an invention.
  - >-
    There is no public repository for this project.
figures:
  - figure: 1
    kind: diagram
    span: full
    ratio: auto
    caption: >-
      Call lifecycle: inbound call through Twilio into VERA, with Gemini,
      retrieval and tool selection producing the spoken response.
  - figure: 2
    kind: diagram
    span: half
    ratio: 4 / 3
    caption: >-
      Tool orchestration: how the agent selects between available tools during a
      live call rather than following a fixed script.
  - figure: 3
    kind: diagram
    span: half
    ratio: 4 / 3
    caption: >-
      Retrieval path: vector search over domain knowledge feeding grounded
      context into response generation.
---

## The problem

Most automated phone systems fail in the same way. They can route a call, but
they cannot answer a question, because the answer lives in the company's
material and the system has no access to it.

Building something that can actually answer means putting a language model in
the middle of a live phone call. That turns a fairly ordinary retrieval problem
into a timing problem.

## Why voice is harder than text

The difference is the tolerance for delay.

In a chat interface, a response that takes several seconds is acceptable. On a
phone call, the same delay reads as a dropped connection. The caller starts
talking again, the turn-taking breaks, and the conversation falls apart. There
is no loading state on a phone line.

So the architecture is organised around the response cycle rather than around
any single component. Every stage between the caller finishing a sentence and
hearing the first syllable back is on the critical path.

## The call lifecycle

Twilio carries the telephony transport and streams audio in both directions.
VERA handles the session, maintaining structured conversation memory so context
persists across turns. Gemini and Gemini Live handle understanding and response
generation.

Between understanding and response, two things happen. A retrieval step performs
vector search over domain-specific knowledge to ground the reply in the
business's own material. A tool-selection step decides, dynamically, what the
agent should actually do for this turn.

## Retrieval

The RAG pipeline exists to constrain the model rather than to extend it.

A receptionist that answers plausibly but incorrectly is worse than one that
cannot answer, because the caller acts on what they were told. Grounding
responses in retrieved company knowledge is what makes the output usable rather
than merely fluent.

## Tool orchestration

Multi-tool orchestration allows the agent to select tools during the call, as
the conversation develops.

This is the structural difference between a voice agent and an interactive voice
response tree. An IVR decides the possible paths in advance. Here the path is
decided at runtime, which is what allows a caller to ask something the designer
did not anticipate.

## The latency decision

The most significant engineering change was offloading text-to-speech work so
that speech generation no longer blocked the response cycle.

Audio generation is expensive and, handled naively, it sits directly on the
critical path: the system finishes deciding what to say, then waits to render
it, then speaks. Moving that work off the blocking path is what brought the
interaction closer to conversational timing.

No latency numbers are quoted here. The improvement was real and audible in
testing, but it was not formally measured, and publishing a figure that was
never recorded would be fabrication.

## Current state

VERA was built as a hackathon project and remains a prototype. It is not
deployed, there is no public URL, and it has not been run against real customer
traffic. What exists is the architecture and a working demonstration of the call
path.
