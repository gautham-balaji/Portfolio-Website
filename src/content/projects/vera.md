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
limitations:
  - Hackathon prototype. Not publicly deployed.
  - >-
    A key optimization was offloading text-to-speech work to improve response
    time. No latency figures are published because none were measured.
media: []
---

The call flow runs from caller through Twilio into VERA, which routes to Gemini
with retrieval and tool selection, then returns a generated voice response.
