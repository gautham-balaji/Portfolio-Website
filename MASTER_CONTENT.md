# Gautham Balaji Portfolio
## Master Content Specification

> Canonical source of truth for website content, personal positioning, project facts, experience framing, and factual boundaries.
>
> The visual system is defined separately in `DESIGN_SYSTEM.md`.
>
> Last updated: September 2026

---

# 01. IDENTITY

## Name

Gautham Balaji

## Primary title

Software Engineer

## Location

Chennai, Tamil Nadu, India

## Primary positioning

**Building reliable AI systems and backend infrastructure.**

## Supporting positioning

I build software across backend systems, AI, agentic workflows, and the infrastructure that connects them.

## Public contact

- Email: gautham.balajis@gmail.com
- Phone: +91 9080302593
- Location: Chennai, India

## Public profiles

- GitHub: https://github.com/gautham-balaji
- LinkedIn: https://www.linkedin.com/in/gautham-balaji-18722228b

Only GitHub and LinkedIn are confirmed social profiles.

## Resume

A downloadable resume should be available from the hero and/or contact area.

---

# 02. ENGINEERING IDENTITY

## What I like building

Primary interests:

1. System architecture and backend design
2. AI and agentic systems
3. Interesting ML/AI problems

## Relationship with AI

Core viewpoint:

> AI is one of the most interesting tools available to software engineers, and I want to understand how far I can push it.

Additional viewpoint:

> AI is constantly evolving, and when used correctly, it can be one of the best tools available for building software.

The portfolio should communicate that the interest is not simply using AI or calling an LLM API.

The interest is in understanding how AI systems can become useful, reliable software systems.

## Engineering instincts

I care strongly about:

- Understanding why a system works
- Clean architecture
- Performance
- Good abstractions
- Good UX
- Good overall product design
- Documentation
- Connecting different technologies
- Understanding unfamiliar products, projects, and codebases quickly
- Getting things built
- Thinking from the overall architectural viewpoint

Things that bother me:

- Software that works but has ugly architecture
- Software that works but whose behaviour is not understood
- Slow systems
- Bad documentation
- Bad abstractions
- Bad UX
- Poor overall design

## Current areas of improvement

I am actively interested in getting better at:

- Making systems faster
- Networking
- Processes and system behaviour
- Databases
- Deeper infrastructure and systems thinking

These are areas of active development, not weaknesses to advertise.

## Builder thesis

> I find things that need improving in real life. If I see that nothing exists that solves the problem properly, I take the base idea and make it better.

Potential editorial statement:

> **I DON'T JUST LOOK FOR THINGS TO BUILD.**
>
> **I LOOK FOR THINGS THAT COULD WORK BETTER.**

Use once as a strong visual statement. Do not repeat throughout the site.

## Common thread

My work spans:

- Explainable chess
- Legal NLP and knowledge graphs
- Voice AI
- Geospatial simulation
- Enterprise AI and backend systems

The common thread is:

> Taking complicated or incomplete ideas, understanding the system underneath them, and building them into something useful and reliable.

---

# 03. VOICE AND WRITING RULES

## Voice

Technical, direct, confident, thoughtful, slightly experimental.

The writing should sound like an engineer explaining interesting work, not a marketing department.

## Desired visitor reaction

The visitor should leave thinking:

- This person is technically serious.
- This person can actually build.
- This person understands AI beyond superficial API usage.
- This person can work across backend, full-stack, and AI systems.
- This person thinks about architecture and reliability.
- This person has ambitious technical curiosity.

Primary desired reaction:

> **"Woah. I need to hire this guy."**

## Avoid

Never use generic portfolio filler such as:

- Passionate developer
- Tech enthusiast
- Results-driven professional
- Innovative problem solver
- Cutting-edge solutions
- Leveraging the power of AI
- Passionate about technology
- Highly motivated
- 10x engineer
- Next-generation
- Revolutionary
- Seamless
- World-class
- Industry-leading without evidence

Do not use fake testimonials, fake metrics, fake clients, fake scale, or invented achievements.

## No em dash

Do not use em dashes in website copy.

Use commas, periods, colons, parentheses, or separate sentences.

## Technical specificity

Prefer actual engineering decisions and mechanisms over adjectives.

Good:

> Built a hybrid retrieval pipeline combining semantic search with graph-based reasoning.

Bad:

> Built a sophisticated AI-powered legal platform.

## Claims

Every technical claim must be supported by:

- Direct user confirmation
- Resume
- Project README
- Project audit
- Or explicitly marked planned/future work

Do not turn planned work into completed work.

---

# 04. WEBSITE NARRATIVE

The site should answer these questions in order:

### Hero
Who are you?

### Selected Work
What have you built?

### Experience
Can you build professionally?

### Engineering Profile
How do you think?

### About
Who is the person behind the engineering?

### Currently Building
What are you working toward now?

### Education
What is your formal background?

### Contact
How can someone work with you?

---

# 05. SITE STRUCTURE

Landing page:

1. Sticky restrained navigation
2. Hero
3. `01 / SELECTED WORK`
4. `02 / EXPERIENCE`
5. `03 / ENGINEERING PROFILE`
6. `04 / ABOUT`
7. `05 / CURRENTLY BUILDING`
8. `06 / EDUCATION`
9. Final contact CTA
10. Minimal footer

Routes:

- `/`
- `/projects/chess-engine`
- `/projects/legal-nlp`
- `/projects/vera`
- `/projects/geocounterfactual`
- `/404`

---

# 06. HERO

## Eyebrow

SOFTWARE ENGINEER

## Heading

GAUTHAM BALAJI

## Primary positioning

**Building reliable AI systems and backend infrastructure.**

## Supporting copy

> I build software across backend systems, AI, agentic workflows, and the infrastructure that connects them.

## Primary CTA

VIEW SELECTED WORK

## Secondary CTA

DOWNLOAD RESUME

## Metadata

CHENNAI, INDIA

Optional:

SCROLL TO EXPLORE

## Visual

Rectangular personal portrait on the right on desktop.

Do not make the portrait a giant full-screen hero asset.

## Interaction

Text Pressure may be used on the name.

Requirements:

- Static typography fallback
- Reduced-motion safe
- No layout instability
- Name remains immediately readable
- No functional dependency on JavaScript

---

# 07. SELECTED WORK

## Section label

`01 / SELECTED WORK`

## Project hierarchy

1. XAI Chess Engine
2. Legal NLP Knowledge Graph
3. VERA
4. GeoCounterfactual

XAI Chess Engine is the flagship.

---

# 08. XAI CHESS ENGINE

## Title

XAI Chess Engine

## Positioning

**Teaching a chess engine to explain itself.**

## Descriptor

A hybrid neural and classical chess engine built to explain its decisions.

## Status

Completed

## Year

2026

## Role

Co-builder

## Team

Gautham Balaji + Naren Kumar

## Stack

Python, TensorFlow, scikit-learn, Flask, Vanilla JavaScript, Stockfish

## Homepage copy

> Teaching a chess engine to explain itself.

> A hybrid CNN and classical ML chess engine that ranks moves, evaluates positions, and generates human-readable explanations for its decisions.

## Thesis

> The goal was not just to build a chess engine that could choose a move. It was to build one that could explain why it chose it.

## Problem

Chess engines can produce strong moves while giving users little insight into how a recommendation was formed.

This project explores an explainable hybrid approach combining learned position evaluation with classical chess features and explicit reasoning.

## Board representation

8x8x12 planes, one for each piece type for each colour.

## CNN

Predicts Stockfish centipawn evaluations.

Training:

- Stockfish depth 8
- Approximately 50,000 positions

Architecture:

- Conv2D 64
- Conv2D 128
- Conv2D 128
- Batch normalization
- Flatten
- Dense 256
- Dropout 0.3
- Dense 1

Held-out Pearson correlation:

**0.506**

Do not call this 50.6% accuracy.

## Classical ML

Random Forest:

- 500 trees
- Maximum depth 12
- Predicts future space control

MLP:

- 256 -> 128 -> 64
- StandardScaler
- Predicts game outcome

## Hybrid fusion

Ridge regression combines:

- CNN score
- Material
- Space
- Centre control
- Mobility

Ridge weights:

- CNN normalized: 330.9
- Material: 32.4
- Space: 0.79
- Centre: 5.17
- Mobility: 0.019

## Move reranking

1. Generate legal moves
2. Batch resulting positions through the CNN
3. Compute hybrid scores
4. Apply heuristic move bonuses
5. Perform one-ply opponent lookahead
6. Rank moves

## Explainability

`explain_move()` generates explanations from checkable conditions:

- Centre control
- Minor-piece development
- Pawn space
- Captures
- Checks
- Promotion
- CNN positional improvement
- Board-control delta

Do not imply that the neural model itself produced these explanations.

## Integrated Gradients

- Empty board baseline
- 50 interpolation steps
- TensorFlow GradientTape
- 12 channels aggregated to 8x8 saliency

## UI

- Interactive board
- Live analysis
- Top three moves
- Move explanations
- Live metrics
- Analyse mode
- Resign
- Game statistics
- Promotion
- Touch support
- Saliency visualization

## Media

Preferred:

1. Chess UI screenshot
2. Architecture diagram
3. Move explanation UI
4. Saliency map
5. Optional gameplay recording

No fabricated screenshots.

---

# 09. LEGAL NLP KNOWLEDGE GRAPH

## Title

Legal NLP Knowledge Graph

## Positioning

**Turning legal judgments into connected knowledge.**

## Descriptor

An NLP system that extracts legal entities and relationships from Indian court judgments, builds a knowledge graph, classifies cases, and retrieves similar cases using semantic and graph-based signals.

## Stack

Python, spaCy, BERT, scikit-learn, NetworkX, Streamlit, SHAP, LIME, Sentence Transformers

## Thesis

Legal judgments contain relationships that are difficult to capture with plain text search alone.

The system combines NLP extraction with graph structure and semantic retrieval to make those relationships usable.

## Pipeline

INPUT

-> NLP processing

-> Entity and relationship extraction

-> Knowledge graph

-> Classification

-> Hybrid retrieval

-> Explainability

-> Streamlit UI

## Entity extraction

- Custom legal NER
- Pattern-based extraction for legal references such as IPC and CrPC
- Relationship extraction

## Knowledge graph

Nodes:

- Cases
- Statutes
- Sections
- Courts
- Judges

Edges:

- CITES
- APPLIES
- DECIDED_BY
- INVOLVES

Graph analysis:

- PageRank
- Centrality
- Community detection

## Classification

Models:

- Logistic Regression
- Random Forest
- BERT

Features:

- TF-IDF
- Entity features
- Graph features

Ensemble methods are used.

## Hybrid retrieval

- Sentence Transformer semantic search
- Graph citation networks
- Combined-score reranking

## Explainability

- SHAP
- LIME
- Highlighted text spans

## UI

- Judgment upload/paste
- Entity extraction
- Classification confidence
- Feature importance
- SHAP explanations
- Interactive graph exploration
- Graph filters
- PageRank/centrality/community analytics
- Similar case retrieval
- Semantic/graph score breakdown
- Graph paths
- Export
- Analytics

## Data

- Indian Kanoon scraping
- Synthetic data
- Custom judgments

## Benchmarks

- Entity F1: 0.87
- Classification accuracy: 0.92
- Retrieval MAP@10: 0.78
- Graph construction: approximately 2 seconds/case
- Query: under 1 second

Use these with context on the detailed project page.

## Media

- Architecture pipeline
- Knowledge graph screenshot
- Retrieval UI
- Explainability screenshot

---

# 10. VERA

## Title

VERA

## Positioning

**AI-powered voice receptionist for business calls.**

## Alternative thesis

> Building a voice AI system that can understand, retrieve, act, and respond in real time.

## Status

Hackathon / prototype

Not publicly deployed.

## Stack

- Gemini / Gemini Live
- Twilio
- RAG
- Tool orchestration

## Description

> A real-time AI voice agent built around Gemini and Twilio for conversational business calls, with retrieval and tool orchestration to ground responses and handle live interactions.

## Core flow

Caller

-> Twilio

-> VERA

-> Gemini

-> Retrieval / tools

-> Response generation

-> Voice response

-> Caller

## Technical story

Focus areas:

- Streaming interaction
- Response generation
- Voice response flow
- Tool selection
- Knowledge retrieval
- Conversation memory
- Latency reduction

## Latency

A key optimization was offloading text-to-speech work to improve response time.

Do not invent latency numbers.

## RAG

The resume describes a RAG pipeline with vector-based retrieval for domain-specific knowledge.

Present this as implemented.

## Tool orchestration

Multi-tool orchestration enables dynamic tool selection during live calls.

## Memory

Structured conversation memory was designed to maintain contextual continuity across sessions.

## Deployment

No public deployment.

Do not provide a fake live URL.

## Media

- System architecture
- Voice interaction flow
- Tool orchestration
- Retrieval flow
- UI/demo screenshot if available

---

# 11. GEOCounterfactual

## Title

GeoCounterfactual

## Positioning

**Simulating what a landscape could look like after intervention.**

## Descriptor

A geospatial simulation engine that combines satellite imagery, generative models, and deterministic hydro-ecological constraints to visualize the potential impact of rural water interventions.

## Status

Active development / research prototype

## Maturity

Final-year academic research prototype / proof of concept.

The architecture is locked.

The local backend and UI are functional.

Data extraction for final ML fine-tuning is actively in progress.

Do not present the generative model as fully trained or production-ready.

## Core statement

> **DON'T ASK THE MODEL IF ITS ANSWER IS REAL. BUILD A SYSTEM THAT CAN CHECK IT.**

## System concept

User enters an intervention such as:

> Build 3 check-dams

for a selected region.

The system:

1. Parses the intervention
2. Fetches satellite/elevation data
3. Computes deterministic hydro-ecological constraints
4. Generates a counterfactual image
5. Critically evaluates the result
6. Rejects invalid candidates
7. Regenerates when necessary
8. Accepts a candidate once the critic converges

## Frontend

- React
- Vite
- Tailwind
- Lucide
- Three.js
- XAI overlays
- 3D globe
- Offscreen canvas

## Backend

- FastAPI
- Python
- REST
- Server-Sent Events

## AI

- Gemini for intervention parsing
- LangGraph for workflow orchestration
- Stable Diffusion 1.5 / ControlNet for image generation
- Deterministic NumPy physics and critic

## Architectural principle

Gemini parses intent.

Deterministic systems handle:

- Spatial constraints
- Hydro-ecological calculations
- Validation
- Critic decisions

The generative model proposes imagery.

This separation should be highlighted.

## LangGraph

Input Handler

-> Planner

-> Dynamics

-> Generator

-> Critic

-> accept or reject

Rejected outputs can route back through the generator.

State includes rejection history and violation information.

## GIS

Data sources:

- Sentinel-2 SR Harmonized
- Copernicus DEM GLO30
- ESA WorldCover
- CHIRPS rainfall

Resolution:

10m

Processing:

- Google Earth Engine
- NumPy
- D8 routing

## Water detection

Multi-year post-monsoon persistence:

- Water in at least 2 of 2022-2024
- Absent in 2018-2020

CHIRPS rainfall is incorporated to remove wet-year confounds.

## Data story

A key discovery was that rainfall could make imagery appear to support a water intervention when the intervention itself was not responsible.

Potential editorial statement:

> **THE DATA WAS LYING.**

Then explain the rainfall confound technically.

## Counterfactual constraints

- Water interventions constrained by slope
- Vegetation capped by NDVI ceiling
- Existing open water protected
- Changes restricted to a spatial change mask
- Background held constant through hard compositing

Example:

Water on slope greater than approximately 2.5 degrees should be rejected.

## Critic

Checks:

- Gravity / slope consistency
- Spectral consistency
- SSIM-related consistency

Important limitation:

The SSIM guard is weak/vacuous because of hard compositing.

Do not market SSIM as a major validated capability.

## Generator maturity

Stable Diffusion 1.5 / ControlNet integration exists.

Current limitations:

- Fine-tuned weights are not complete
- Training is still being prepared
- Dataset extraction is active

Do not claim realistic satellite generation as completed.

## Dataset

15 verified semi-arid Indian watersheds.

Training dataset:

512x512 GeoTIFF before/after intervention pairs.

## API

POST `/api/simulate/async`

GET `/api/stream/{job_id}`

GET `/api/health`

## UI

- 3D globe
- 15 watershed selection
- Intervention input
- Simulation
- Before/after imagery
- Comparison slider
- XAI overlays
- Pipeline nodes
- Streaming terminal logs
- Metrics

## Performance

Approximately 146-195 seconds per region.

Do not present this as a performance achievement.

## Engineering decisions

1. Deterministic NumPy critic instead of an LLM vision critic
2. Google Earth Engine Batch Export instead of synchronous `getInfo` for long-running data extraction
3. Client-side rainfall filtering to avoid rerunning long GEE exports
4. StubGenerator fallback because remote Colab/Ngrok can fail

## Current state

Working:

- LangGraph workflow
- UI
- Physics critic
- GEE ingestion
- Data extraction pipeline

In progress:

- Final dataset extraction
- Stable Diffusion fine-tuning

## Deployment

Local development with Colab/Ngrok support.

Not public production deployment.

## Best demo

Kadapa +:

> Build 3 check-dams

Narrative:

- First generated image rejected because water appears on an invalid slope
- Critic identifies the violation
- System regenerates
- Second iteration converges
- XAI overlay shows affected region

No fabricated screenshots.

---

# 12. EXPERIENCE

# Admrls

## Company

Admrls

Important spelling: **Admrls**

## Role

Full Stack Developer

## Dates

Aug 2025 - Present

## Priority

Strongest professional experience entry.

## Public-safe intro

> Enterprise software across backend systems, AI infrastructure, and multi-tenant SaaS.

## Description

> I contribute to production-oriented systems across backend services, AI workflows, and customer-facing enterprise applications. My work spans implementation, integration, selected architectural decisions, and development deployments.

## Highlights

- Develop enterprise-grade applications across FastAPI backends, PostgreSQL, React interfaces, and containerized infrastructure.
- Co-develop a production-ready multi-agent AI platform using Microsoft AutoGen, implementing modular agent orchestration, task routing, lifecycle management, and observability.
- Contribute to agent infrastructure through structured logging, RBAC, execution tracing, and fault recovery for reliable agent execution.
- Contribute to the commercialization of an enterprise video conferencing platform, working on multi-tenant architecture, secure recording management, administrative workflows, and SaaS capabilities.
- Work with Docker and Kubernetes as part of deployment infrastructure, while making selected architectural decisions within assigned components.
- Deploy and test incremental changes in development environments, validating integrations and system behaviour before delivery.

## Stack

Python, FastAPI, PostgreSQL, React, Microsoft AutoGen, Docker, Kubernetes

## Role boundaries

Do not claim:

- Full system ownership
- Principal architecture ownership
- Production incident response
- Large-scale operations ownership
- Confidential customer names
- Confidential metrics
- Undisclosed infrastructure details

Current reality:

Primarily assigned component work, with some architecture decisions.

Deployment work should be mentioned minimally.

Production incident/debugging ownership should be added only once it actually happens.

---

# CrftHQ

## Role

Technical Specialist

## Dates

Jul 2025 - Present

## Description

> Student-led innovation accelerator empowering 30,000+ student creators with resources, mentorship, and venture support.

## Intro

> Engineering automation and AI-driven workflows for a student innovation ecosystem.

## Highlights

- Designed and deployed automation systems, including streamlined email communication workflows for outreach and engagement.
- Worked across AI, design, and operations to integrate automation into internal workflows.
- Contributed to improving the scalability and operational efficiency of CrftHQ programs and creator ecosystem.

## Focus

Automation, AI integration, workflow engineering

---

# Sundaram Finance

## Role

Data Science Intern

## Dates

May 2025 - Jul 2025

## Intro

> Built an end-to-end customer churn prediction system using real-world banking data to support proactive retention.

## Highlights

- Developed a churn prediction pipeline using 10,000+ banking records, covering data exploration, feature engineering, modelling, evaluation, and deployment.
- Investigated churn drivers through EDA, feature engineering, and outlier treatment, identifying factors including age, product count, and activity level.
- Evaluated Logistic Regression, Random Forest, XGBoost, and stacked ensemble approaches using ROC AUC, Recall, and F1-score.
- Improved minority-class churn recall from 0.21 to 0.73 through ensemble learning.
- Applied SHAP to explain individual predictions and global feature importance for business stakeholders.
- Deployed the resulting interactive application on Hugging Face Spaces with CI/CD automation through GitHub Actions.

## Focus

Machine Learning, banking analytics, explainable AI, model deployment

---

# 13. ENGINEERING PROFILE

## Section label

`03 / ENGINEERING PROFILE`

## Headline

**I LIKE BUILDING SYSTEMS THAT ACTUALLY MAKE SENSE.**

## Main copy

> I'm a software engineer interested in backend systems, AI engineering, and the architecture that connects them.
>
> I like understanding how a system works from the ground up, whether that means tracing an unfamiliar codebase, figuring out the architecture behind a product, or connecting technologies that were never designed to work together.
>
> AI is one of the most interesting tools available to software engineers right now. It is evolving quickly, and when used correctly, I think it can be one of the best tools for building software. My interest isn't just in using models, but in understanding how to turn them into reliable systems that can actually do useful work.
>
> A lot of what I build starts the same way: I notice something that could work better. If nothing exists that solves it properly, I start with the underlying idea and build from there.
>
> I'm particularly interested in making those systems faster, more reliable, and better designed, from the AI workflow itself down to the backend, database, networking, and processes underneath it.

## What I care about

### 01 / UNDERSTANDING

> I want to know why a system works, not just that it works. I naturally gravitate toward unfamiliar codebases, architecture, and the relationships between components.

### 02 / SYSTEMS

> The interesting problems are often underneath the interface. Backend architecture, databases, networking, processes, performance, reliability, and the boundaries between systems.

### 03 / AI ENGINEERING

> LLMs, agents, retrieval, orchestration, and the engineering required to make AI useful beyond a prototype.

### 04 / BUILDING

> I like finding things that could work better, starting from a base idea, and turning them into something usable.

## Editorial statement

> **I DON'T JUST LOOK FOR THINGS TO BUILD.**
>
> **I LOOK FOR THINGS THAT COULD WORK BETTER.**

---

# 14. ABOUT

## Draft

> I'm Gautham, a software engineer based in Chennai.
>
> I spend most of my time somewhere between backend systems, AI workflows, and figuring out why complicated software behaves the way it does.
>
> I like building things that start as a rough idea and end up as an actual system. Sometimes that means an AI agent, sometimes a backend platform, sometimes an experiment that probably has no business being as complicated as I made it.
>
> The common thread is simple: understand the problem, understand the system, then build it properly.

The final wording can be tightened during visual implementation.

Do not include unnecessary personal biography or school history.

---

# 15. CURRENTLY BUILDING

## Section label

`05 / CURRENTLY BUILDING`

## Project

GeoCounterfactual

## Headline

**What happens when generative AI has to obey physics?**

Alternative:

**Building a system that can check its own generated world.**

## Intro

> I'm currently building GeoCounterfactual, a geospatial simulation system that combines satellite data, generative models, deterministic hydro-ecological constraints, and cyclic validation.

## Current work

- Extracting and validating intervention datasets
- Working toward fine-tuning Stable Diffusion 1.5 / ControlNet for satellite imagery
- Improving the counterfactual generation pipeline
- Refining deterministic validation
- Exploring better performance and system architecture

## Honest status

> The core orchestration, geospatial ingestion, deterministic critic, and interface are functional. The final generative model training is still in progress.

---

# 16. EDUCATION

## Degree

B.Tech in Computer Science and Engineering (AI & ML)

## Institution

Vellore Institute of Technology, Chennai

## Expected graduation

2027

## CGPA

8.30

Keep compact.

Do not include school history.

---

# 17. SKILLS

## Languages

- Python
- C++
- Java
- SQL
- JavaScript

## AI & Agentic Systems

- LangChain
- Microsoft AutoGen
- RAG
- LLM Agents
- Tool Orchestration
- Prompt Engineering

## Backend & Full Stack

- FastAPI
- Flask
- React
- JWT Authentication

## Tools & Platforms

- Git
- GitHub
- GitHub Actions
- Hugging Face Spaces
- Docker
- Kubernetes
- PostgreSQL

Do not render as a giant wall of pills.

---

# 18. CONTACT

## CTA candidates

Preferred:

**HAVE SOMETHING WORTH BUILDING?**

Alternatives:

**LET'S BUILD SOMETHING USEFUL.**

**BUILDING SOMETHING INTERESTING?**

## Supporting copy

> I'm open to software engineering opportunities, interesting technical problems, and projects worth building.

## Actions

- Email
- LinkedIn
- GitHub
- Download Resume

## Form

Fields:

- Name
- Email
- Message

States:

- Idle
- Submitting
- Success
- Validation error
- Server error

Requirements:

- Real backend
- Validation
- Honeypot
- Rate limiting
- Accessible errors
- Keyboard support

Do not ship an inert form.

---

# 19. FOOTER

Include:

- Gautham Balaji
- Chennai, India
- GitHub
- LinkedIn
- Email
- Current copyright year

Keep minimal.

---

# 20. 404

## Copy

> **404**
>
> This page doesn't exist.
>
> You can go back to the work.

CTA:

BACK TO HOME

---

# 21. NAVIGATION

Desktop:

- Work
- Experience
- About
- Contact
- Optional Resume

Keep restrained.

Mobile:

Compact accessible menu.

Requirements:

- Keyboard navigation
- Focus management
- Escape
- Visible focus
- Screen reader support

---

# 22. CONTENT DATA MODEL

Projects should support:

```text
title
slug
status
year
role
featured
shortDescription
thesis
problem
approach
architecture
technicalDecisions
technologies
results
limitations
lessons
futureWork
github
live
media
```

Experience:

```text
company
role
startDate
endDate
description
highlights
technologies
nda
featured
```

Education:

```text
institution
degree
field
startYear
endYear
cgpa
```

Skills:

```text
category
items
```

---

# 23. FACTUAL GUARDRAILS

Never invent:

- Company clients
- Confidential product names
- Admrls customer counts
- Production scale
- Request volumes
- Uptime
- Revenue
- Team size
- Infrastructure ownership
- Incident response experience
- Cloud provider usage unless confirmed
- Latency numbers
- AI performance not documented
- Deployment status
- Public URLs
- Testimonials
- Awards
- Certifications
- Metrics

Specific boundaries:

### Admrls
NDA-safe overview only.

### VERA
Not publicly deployed.

### GeoCounterfactual
Active research prototype. Fine-tuning is incomplete.

### Chess
Pearson correlation 0.506, not accuracy.

### Legal NLP
Documented benchmark values can be used with context.

---

# 24. PROJECT HIERARCHY

## 1. XAI Chess Engine

Flagship.

Strongest combination of technical depth, explainability, architecture, actual UI, and complete project story.

## 2. Legal NLP Knowledge Graph

Deep NLP, graph reasoning, hybrid retrieval, explainability.

## 3. VERA

Real-time AI interaction, voice, RAG, tools, latency.

## 4. GeoCounterfactual

Most ambitious and actively evolving.

Feature strongly as Currently Building rather than presenting it as a finished project.

---

# 25. PORTFOLIO NARRATIVE ARC

Chess:

> Can AI explain its reasoning?

Legal NLP:

> Can language and graph structure work together?

VERA:

> Can AI interact with people in real time?

GeoCounterfactual:

> Can generative AI be constrained by reality?

Admrls:

> Can these ideas become actual enterprise software?

This should be communicated subtly, not as literal marketing copy everywhere.

---

# 26. ASSET REQUIREMENTS

- Professional portrait
- Resume PDF
- Favicon
- OG/social preview image
- Chess screenshots
- Chess architecture diagram
- Legal graph screenshots
- Legal architecture diagram
- VERA architecture/flow visual
- GeoCounterfactual simulator screenshot
- GeoCounterfactual before/after
- GeoCounterfactual critic loop
- GeoCounterfactual XAI overlay
- Optional demo recordings

Never fabricate project screenshots.

---

# 27. SEO / METADATA

Implement:

- Page titles
- Meta descriptions
- Canonicals
- Open Graph
- Social preview image
- Sitemap
- Robots
- JSON-LD Person
- Semantic landmarks
- Proper 404

---

# 28. SOURCE / TRUTH NOTES

This content combines:

- Current resume facts
- Directly confirmed user statements
- Project README information
- Project audit information
- Design decisions established during planning

If facts change, update this file first.

Important future updates:

- Admrls responsibilities
- Production ownership
- GeoCounterfactual model training
- New projects
- New deployments
- New skills
- New professional experience

This file is the canonical content source for implementation.

---

# 29. CORE AREAS

> Migrated verbatim from `gautham_portfolio_master_content_design.md` during
> Phase 2, before that duplicate file was removed. Content unchanged.

- Backend engineering
- AI systems
- Agentic systems
- LLM workflows
- RAG
- Tool orchestration
- Full-stack engineering
- System architecture
- Multi-tenant SaaS
- Performance and reliability
- Applied machine learning
- Explainable AI

---

# 30. FINAL PERSONAL POSITIONING

> Migrated verbatim from `gautham_portfolio_master_content_design.md` during
> Phase 2, before that duplicate file was removed. Content unchanged.

The strongest concise description of Gautham's engineering identity is:

> **A software engineer building reliable AI systems and backend infrastructure, with a strong interest in architecture, performance, and turning ambitious ideas into usable software.**

The deeper personal thesis is:

> **I find things that could work better, understand the system underneath them, and build them.**

The AI thesis is:

> **AI is one of the most interesting tools available to software engineers. The interesting problem is figuring out how far you can push it while still building a system that works.**

These three ideas should guide every future piece of portfolio copy.
