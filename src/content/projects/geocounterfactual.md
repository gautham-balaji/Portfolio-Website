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
limitations:
  - >-
    Fine-tuned generative weights are not complete. Training is still being
    prepared and dataset extraction is active, so realistic satellite generation
    is not a finished capability.
  - >-
    The SSIM guard in the critic is weak because of hard compositing. It should
    not be presented as a major validated capability.
  - >-
    Simulation takes approximately 146 to 195 seconds per region. This is
    current behaviour, not a performance result.
  - Local development with Colab and Ngrok support. No public production deployment.
github: https://github.com/gautham-balaji/geocounterfactual
media: []
---

A user enters an intervention such as building three check-dams for a selected
region. The system parses the intervention, fetches satellite and elevation
data, computes deterministic hydro-ecological constraints, generates a
counterfactual image, evaluates it, rejects invalid candidates, and regenerates
until the critic converges.
