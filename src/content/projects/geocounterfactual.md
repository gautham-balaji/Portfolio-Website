---
title: GeoCounterfactual
order: 4
featured: false
status: Active Development
year: 2026
role: Lead Engineer, Architect
positioning: Simulating what a landscape could look like after intervention.
descriptor: >-
  A geospatial simulation engine that combines satellite imagery, generative
  models, and deterministic hydro-ecological constraints to visualize the
  potential impact of rural water interventions.
technologies:
  - Python
  - FastAPI
  - LangGraph
  - Gemini
  - Stable Diffusion 1.5
  - ControlNet
  - NumPy
  - Google Earth Engine
  - React
  - Three.js
thesis: >-
  Gemini parses intent. Deterministic systems handle spatial constraints,
  hydro-ecological calculations, validation and critic decisions. The generative
  model only proposes imagery.
overview: >-
  A user describes an intervention in plain language, such as building three
  check-dams in a chosen watershed. The system fetches real satellite and
  elevation data for that region, computes what the terrain physically permits,
  generates a candidate image of the result, and then checks that candidate
  against the physics. Invalid candidates are rejected and regenerated.
architecture:
  label: Simulation loop
  figure: 2
  stages:
    - id: intervention
      label: Intervention
      detail: Natural-language request for a selected watershed
    - id: planner
      label: Planner
      detail: Gemini parses intent into a structured plan
      section: the-architecture-principle
    - id: earth-observation
      label: Earth observation
      detail: Sentinel-2, Copernicus DEM, ESA WorldCover, CHIRPS at 10m
      section: earth-observation-data
    - id: dynamics
      label: Dynamics
      detail: Deterministic NumPy hydro-ecological constraints, D8 routing
      section: constraints
    - id: generator
      label: Generator
      detail: Stable Diffusion 1.5 with ControlNet proposes imagery
    - id: critic
      label: Critic
      detail: >-
        Accept, or reject and route back to the generator, on gravity and
        slope, spectral and SSIM checks
      gate: true
      section: the-critic
    - id: simulation
      label: Simulation
      detail: Accepted counterfactual with XAI overlay
  loop:
    from: critic
    to: generator
    label: reject
decisions:
  - title: A deterministic critic instead of an LLM vision critic
    stage: critic
    body: >-
      The critic is NumPy, not a model. Asking a vision model whether generated
      imagery looks plausible replaces one unverifiable judgment with another.
      Checking whether water appears on a slope steeper than roughly 2.5 degrees
      is a calculation with an answer. The validation layer is the part that has
      to be trustworthy, so it is the part with no learned component in it.
  - title: Earth Engine batch export rather than synchronous getInfo
    stage: earth-observation
    body: >-
      Extraction over multiple watersheds and multiple years exceeds what
      synchronous getInfo calls can carry. Moving to Batch Export made
      long-running data extraction survivable, at the cost of an asynchronous
      job model the rest of the pipeline has to accommodate.
  - title: Client-side rainfall filtering
    stage: earth-observation
    body: >-
      Rainfall filtering happens after extraction rather than inside it, so that
      adjusting the confound threshold does not require rerunning hours of Earth
      Engine export. The expensive step is made reusable instead of repeatable.
  - title: A StubGenerator fallback
    stage: generator
    body: >-
      Generation runs on remote Colab through Ngrok, which fails often enough to
      matter. A stub generator keeps the orchestration, dynamics and critic path
      testable when the remote generator is unavailable, so a failure in the
      least reliable component does not block work on everything else.
metrics:
  - label: Spatial resolution
    value: 10 m
    note: Sentinel-2 SR Harmonized, Copernicus DEM GLO30, ESA WorldCover.
  - label: Verified watersheds
    value: '15'
    note: Semi-arid Indian watersheds in the working set.
  - label: Training pairs
    value: 512x512
    note: GeoTIFF before and after intervention pairs.
  - label: Simulation time
    value: ~146-195 s
    note: Per region. Current behaviour, not a performance result.
limitations:
  - >-
    Fine-tuned generative weights are not complete. Training is still being
    prepared and dataset extraction is active, so realistic satellite generation
    is not a finished capability.
  - >-
    The generator is Stable Diffusion 1.5 with ControlNet, not a model trained
    for satellite imagery. Output should be read as a constrained proposal, not
    as a prediction of what the landscape will look like.
  - >-
    The SSIM guard in the critic is weak because of hard compositing. The
    gravity and slope checks carry the validation; SSIM should not be presented
    as a major validated capability.
  - >-
    Simulation takes approximately 146 to 195 seconds per region. This is
    current behaviour, not an optimisation result.
  - >-
    Local development with Colab and Ngrok support. There is no production
    deployment and no database layer.
github: https://github.com/gautham-balaji/geocounterfactual
figures:
  - figure: 1
    kind: map
    span: full
    ratio: 21 / 9
    caption: >-
      Before and after comparison for the Kadapa watershed under a three
      check-dam intervention, with the comparison slider at the change boundary.
  - figure: 2
    kind: diagram
    span: wide
    ratio: auto
    caption: >-
      The simulation architecture: an intervention through planning, Earth
      observation and deterministic dynamics into generation, with the
      critic's rejection path routing back to the generator.
  - figure: 3
    kind: screenshot
    span: half
    ratio: 4 / 3
    caption: >-
      A rejected candidate: the critic flags water placed on an invalid slope
      and returns the violation to the generator.
  - figure: 4
    kind: screenshot
    span: half
    ratio: 4 / 3
    caption: >-
      XAI overlay over the accepted result, showing which region the
      intervention actually affected.
---

## The problem

Ask a generative model what a landscape would look like after building three
check-dams, and it will produce something. It will look convincing. There is no
particular reason to believe it.

The interesting engineering question is not how to generate the image. It is how
to decide whether the generated image is allowed to exist. Water does not
collect on a steep slope. Vegetation does not exceed what the local conditions
support. A model that has never been told this will cheerfully violate all of it
and produce an attractive picture.

## The architecture principle

The system separates the parts that can be wrong from the parts that cannot.

Gemini parses intent, turning a natural-language intervention into a structured
plan. That is a language problem and a language model is appropriate for it.

Everything downstream that determines physical validity is deterministic.
Spatial constraints, hydro-ecological calculations, validation and critic
decisions run in NumPy. The generative model proposes imagery and has no
authority over whether that imagery is accepted.

This split is the project.

## Earth observation data

Data comes from Sentinel-2 SR Harmonized for imagery, Copernicus DEM GLO30 for
elevation, ESA WorldCover for land cover and CHIRPS for rainfall, processed
through Google Earth Engine and NumPy at **10 metre** resolution with D8 flow
routing.

The working set covers **15 verified semi-arid Indian watersheds**.

## The data problem

Detecting whether a water intervention actually worked turns out to be harder
than it first appears.

Water presence is established by multi-year post-monsoon persistence: water
present in at least two of 2022 to 2024, and absent across 2018 to 2020. That
alone is not enough, because a wet year produces the same signal as a successful
intervention. Imagery that appears to show a check-dam working may only be
showing that it rained.

CHIRPS rainfall data is incorporated specifically to remove that confound. This
was the discovery that most changed the pipeline: the raw satellite evidence
supported conclusions the underlying reality did not.

## Constraints

The counterfactual is bounded before generation, not corrected afterwards.

Water interventions are constrained by slope. Vegetation is capped by an NDVI
ceiling. Existing open water is protected. Changes are restricted to a spatial
change mask, and the background is held constant through hard compositing.

The concrete rule that illustrates the approach: water appearing on a slope
steeper than roughly **2.5 degrees** should be rejected, because gravity does
not permit it.

## The critic

The critic checks gravity and slope consistency, spectral consistency, and
SSIM-related consistency, then accepts the candidate or rejects it.

A rejected candidate does not fail the run. LangGraph routes it back through the
generator, carrying rejection history and violation information in state, and
the loop continues until the critic converges on an acceptable result.

Choosing NumPy over a vision model here was deliberate. A learned critic would
make the validation layer as unverifiable as the thing it is validating.

One honest caveat: the SSIM guard is weak because of hard compositing. The
gravity and slope checks are doing the real work, and SSIM should not be
presented as a major validated capability.

## Orchestration and interface

LangGraph runs input handler, planner, dynamics, generator and critic as an
explicit graph with a rejection path, over a FastAPI backend exposing REST and
Server-Sent Events.

The React front end carries a 3D globe for watershed selection across the 15
regions, intervention input, before and after imagery with a comparison slider,
XAI overlays, pipeline node states, streaming terminal logs and metrics. The
streaming logs exist because a run takes **146 to 195 seconds** and a user
watching a blank screen for three minutes will assume it has crashed.

## Current state

Working: the LangGraph workflow, the interface, the physics critic, Earth Engine
ingestion and the data extraction pipeline.

In progress: final dataset extraction and Stable Diffusion 1.5 fine-tuning.

The generator is not yet trained for satellite imagery, so generated output
should be read as a constrained proposal rather than a prediction. The system
runs locally with Colab and Ngrok support, with no production deployment and no
database layer.
