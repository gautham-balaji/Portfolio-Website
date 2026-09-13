# Gautham Balaji Portfolio
## Design System + Visual Blueprint

> Authoritative visual and interaction specification for the portfolio rebuild.
>
> `MASTER_CONTENT.md` defines what the site says.
> `DESIGN_SYSTEM.md` defines how it looks, feels, moves, and behaves.
>
> Implementation may evolve details after visual testing, but must preserve the design intent.
>
> Last updated: September 2026

---

# 01. CREATIVE DIRECTION

## Name

**Technical Editorial**

## Core concept

> An engineer's personal publication about the systems he builds.

The site should feel closer to a technical journal, experimental engineering publication, or meticulously designed product documentation than a conventional developer portfolio.

## Emotional target

The visitor should feel:

- Technical seriousness
- Curiosity
- Confidence
- Precision
- Taste
- Ambition
- A sense that the person behind the site actually builds things

The visual language should communicate:

> **"This person thinks about systems."**

without literally stating it everywhere.

## Design tension

The site should sit between:

- Editorial and technical
- Minimal and expressive
- Serious and slightly experimental
- Structured and asymmetric
- Warm and precise
- Static and interactive

Do not make it sterile.

Do not make it chaotic.

---

# 02. VISUAL PRINCIPLES

## Principle 1: Typography is the primary visual element

Large type, spacing, and hierarchy should carry much of the visual identity.

Do not rely on decorative graphics to create visual interest.

## Principle 2: Structure should feel engineered

Use:

- Rules
- Columns
- Alignment
- Coordinates
- Section numbering
- Metadata
- Monospace labels
- Deliberate spacing

The layout should feel designed rather than decorated.

## Principle 3: Asymmetry with discipline

Use asymmetry intentionally.

Avoid arbitrary offsets that simply make the page look "creative."

Every unusual placement should still feel aligned to an underlying grid.

## Principle 4: Images are evidence

Project imagery should show actual work:

- Interfaces
- Architecture
- Graphs
- Diagrams
- Visual outputs
- System states

Do not use generic AI stock imagery.

## Principle 5: Motion should reveal, not distract

Animation should communicate:

- Hierarchy
- State
- Relationship
- Interaction
- Transition

It should never be present simply because an animation library exists.

## Principle 6: Empty space is part of the design

The page should breathe.

Do not fill every region with cards or decoration.

---

# 03. COLOR SYSTEM

## Core palette

Ink:

`#121212`

Primary background / Paper:

`#E8E4DC`

Secondary background / Soft Paper:

`#DCD7CD`

Graphite:

`#74736E`

Accent / Oxide:

`#B85C38`

## Usage

### Ink

Primary text, strong rules, dark blocks, major controls.

### Paper

Primary page background.

### Soft Paper

Secondary surfaces, subtle project panels, alternate section backgrounds.

### Graphite

Metadata, secondary text, subtle rules.

### Oxide

Very restrained emphasis:

- Active navigation
- Small highlights
- Important interactive state
- Occasional project metadata
- Small editorial marks

Accent should remain scarce.

## Forbidden

- Gradients
- Neon
- Glow
- Pure white backgrounds
- Cyberpunk palettes
- Pastel SaaS colours
- Glassmorphism
- Multi-colour card systems

---

# 04. TYPOGRAPHY SYSTEM

Use three type roles.

## Display

Large editorial display type.

Use for:

- Hero name
- Major section headings
- Project titles
- Major editorial statements
- Selected large quotes

Characteristics:

- High visual presence
- Tight but controlled leading
- Strong contrast in scale
- Prefer variable or expressive display font if it remains readable

## Body

Readable sans serif.

Use for:

- Paragraphs
- Project descriptions
- Experience
- About
- Form labels

Characteristics:

- Comfortable line height
- Strong readability
- Neutral personality

## Technical

Monospace.

Use for:

- Section numbers
- Dates
- Location
- Stack
- Small metadata
- Status
- Route names
- Technical labels
- UI terminal elements

Do not use monospace for large paragraphs.

---

# 05. TYPE SCALE

Starting design scale, to be tuned after actual font selection:

## Desktop

Hero name:

`clamp(4.5rem, 10vw, 10rem)`

Hero positioning:

`clamp(2rem, 4vw, 4.5rem)`

Section title:

`clamp(3rem, 7vw, 7rem)`

Project title:

`clamp(2.5rem, 5vw, 5.5rem)`

Editorial statement:

`clamp(3rem, 7vw, 8rem)`

Body:

`1rem - 1.125rem`

Technical metadata:

`0.7rem - 0.85rem`

## Mobile

Hero name:

`clamp(3.25rem, 17vw, 5rem)`

Section title:

`clamp(2.5rem, 13vw, 4rem)`

Project title:

`clamp(2.25rem, 12vw, 4rem)`

Body:

`1rem`

Technical:

`0.7rem - 0.8rem`

These are starting values, not immutable numbers.

---

# 06. GRID

## Desktop

Use a 12-column grid.

Recommended:

- 24px to 40px page gutter
- 16px to 28px column gap
- Max content width around 1440px to 1600px
- Large screens should retain generous outer margins

## Tablet

Use 8 columns.

## Mobile

Use 4 columns internally where useful, but most content should behave as a single readable column.

## Grid philosophy

The grid should be visible occasionally through:

- Thin rules
- Column-aligned metadata
- Project indexes
- Image framing

Do not draw a visible full-page grid everywhere.

---

# 07. SPACING

Use a consistent spacing system.

Suggested base:

`4px`

Common values:

- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64
- 96
- 128
- 160
- 192

Major sections should generally have generous vertical spacing.

Avoid artificially forcing every section to exactly `100vh`.

---

# 08. BORDERS / RULES

Rules are a major part of the visual language.

Use:

- 1px borders
- Ink at strong hierarchy
- Graphite at subtle hierarchy
- Soft Paper surfaces

Good locations:

- Section boundaries
- Navigation bottom rule
- Project metadata separators
- Experience timeline divisions
- Footer
- Form fields
- Project index

Avoid thick decorative borders.

---

# 09. SHAPE LANGUAGE

Primary shapes:

- Rectangles
- Slightly rounded rectangles
- Thin lines
- Large text blocks

Buttons may have:

- 0 to 8px radius

Avoid pill-shaped UI except where semantically necessary.

No floating glass cards.

---

# 10. NAVIGATION

## Desktop composition

A restrained sticky bar.

Suggested structure:

Left:

`GAUTHAM BALAJI`

Right:

`WORK   EXPERIENCE   ABOUT   CONTACT`

Optional small resume link.

Use a thin bottom rule.

## Behaviour

At page top:

- Quiet
- Transparent/paper background depending on design

On scroll:

- May acquire a subtle paper background
- May compress slightly
- Never become a giant floating pill

## Mobile

Top bar:

Left: GAUTHAM BALAJI

Right: menu trigger

Menu opens as a full-width or near-full-screen editorial panel.

Requirements:

- Focus trap
- Escape to close
- Visible focus
- Keyboard operation
- Screen reader label

---

# 11. HERO LAYOUT

## Desktop

Use a 12-column composition.

Suggested:

- Text region: columns 1-8
- Portrait region: columns 9-12

The exact ratio can vary after testing.

### Top

Small monospace eyebrow:

`SOFTWARE ENGINEER`

### Main

Huge:

`GAUTHAM BALAJI`

### Below

Positioning:

`Building reliable AI systems and backend infrastructure.`

Then supporting copy.

### CTA

Two rectangular actions:

`VIEW SELECTED WORK`

`DOWNLOAD RESUME`

### Metadata

Small technical details:

`CHENNAI, INDIA`

Potential small scroll marker.

## Portrait

Right side, rectangular.

Prefer a slightly editorial crop rather than a conventional rounded headshot.

Possible treatment:

- Neutral background
- Subtle paper framing
- Thin border

Do not apply heavy filters.

## Hero height

Target approximately 75vh to 90vh on desktop, not an oversized 1000px+ hero.

CTA must appear above the fold on common laptop/desktop viewports.

## Mobile

Order:

1. Eyebrow
2. Name
3. Positioning
4. Supporting copy
5. CTA
6. Portrait
7. Metadata

The name should remain the dominant element.

Portrait becomes full-width or near-full-width.

Do not force the desktop side-by-side composition onto mobile.

---

# 12. HERO INTERACTION

## Text Pressure

Preferred major effect #1.

Apply to:

`GAUTHAM BALAJI`

Interaction:

Pointer proximity can subtly alter letter pressure/width.

Rules:

- Very subtle
- Must remain readable
- No exaggerated deformation
- No layout shift
- Keyboard and touch remain static
- Reduced-motion disables effect
- Static fallback is identical in content and hierarchy

Do not make the hero name depend on canvas rendering.

---

# 13. SELECTED WORK LAYOUT

## Section intro

Use:

`01 / SELECTED WORK`

Then a large editorial heading.

Potential:

**THINGS I'VE BUILT.**

or simply:

**SELECTED WORK**

The exact headline can be decided after visual testing.

## Project navigation concept

Use an interactive project index rather than four conventional cards.

Potential structure:

Left:

project number

Middle:

project title

Right:

short descriptor / stack / year

Hover:

- Project row expands
- Preview image appears or changes
- Metadata becomes more visible

Keyboard:

Same interaction must be available with focus.

## Infinite Menu

Preferred major interaction #2.

Use as the project index/navigation treatment if implementation remains accessible.

It should behave like an enhanced list, not a replacement for normal links.

## Static fallback

Without JavaScript:

A standard accessible project list remains fully functional.

---

# 14. FLAGSHIP PROJECT COMPOSITION

## XAI Chess Engine

Give this project more visual weight.

Possible composition:

Top:

`01`

Large title:

`XAI CHESS ENGINE`

Editorial thesis:

`TEACHING A CHESS ENGINE TO EXPLAIN ITSELF.`

Large chess UI image spanning approximately 7-8 columns.

Technical metadata occupying remaining columns.

Below:

Architecture diagram + explanation screenshot + saliency.

## Visual hierarchy

The project should feel like a case study, not a card.

Use large whitespace and a few strong visuals.

---

# 15. SECONDARY PROJECT COMPOSITIONS

## Legal NLP

Use a more structured technical composition.

Strong visual:

Knowledge graph.

Supporting:

Judgment -> entities -> graph -> retrieval.

Could use a split layout:

Left: large graph

Right: technical pipeline and explanation.

## VERA

Use a flow-oriented composition.

Strong visual:

Caller -> Twilio -> VERA -> Gemini -> tools/RAG -> voice.

Use audio/voice metaphors sparingly.

No fake waveform decoration unless tied to actual audio/demo.

## GeoCounterfactual

Use a cinematic technical composition.

Strong visual:

Before/after satellite comparison.

Supporting visuals:

- Critic loop
- XAI overlay
- Agent terminal
- Globe

This project can visually break the standard project layout because the work itself is spatial.

---

# 16. PROJECT DETAIL PAGE

Every project page should feel like a technical editorial article.

## Top

Project number / status / year.

## Hero

Large project title.

Thesis statement.

Large hero visual.

## Metadata rail

- Role
- Year
- Status
- Stack
- Links

## Story sections

Recommended order:

1. Thesis
2. Problem
3. Approach
4. Architecture
5. Technical decisions
6. Implementation details
7. Results / observations
8. Limitations
9. What I learned
10. Future work

Do not make every section a generic card.

## Architecture visuals

Architecture diagrams should be custom and consistent with the design system.

Use thin lines, simple nodes, technical labels.

Avoid default Mermaid-looking diagrams unless visually integrated.

---

# 17. EXPERIENCE LAYOUT

## Section label

`02 / EXPERIENCE`

## Admrls

This is the strongest experience entry.

Make it visually dominant.

Suggested composition:

Left:

`ADM RLS` / actually render as `Admrls`

Role + dates.

Right:

Large intro statement.

Below:

Selected work / responsibilities.

Then:

Stack.

## Visual emphasis

Admrls should occupy substantially more vertical space than CrftHQ and Sundaram.

Do not make it look like a fake "featured company" badge.

## CrftHQ + Sundaram

Can become compact editorial rows.

Potential:

`CRFTHQ` | Role | Dates | Description

`SUNDARAM FINANCE` | Role | Dates | Description

Expand/collapse can be considered, but default content should remain discoverable.

---

# 18. ENGINEERING PROFILE LAYOUT

## Section label

`03 / ENGINEERING PROFILE`

## Headline

**I LIKE BUILDING SYSTEMS THAT ACTUALLY MAKE SENSE.**

Large type.

## Layout

Use asymmetric columns.

Large copy on one side.

Four principles on the other or below:

- Understanding
- Systems
- AI Engineering
- Building

Each principle should have:

- Monospace number
- Short heading
- Short paragraph

## Editorial statement

Give:

`I DON'T JUST LOOK FOR THINGS TO BUILD.`

`I LOOK FOR THINGS THAT COULD WORK BETTER.`

a full-width visual break.

This should be one of the largest type moments on the page.

---

# 19. ABOUT LAYOUT

## Section label

`04 / ABOUT`

Keep this section intentionally smaller.

Possible composition:

Left:

Large `ABOUT`

Right:

Short personal copy.

Below:

Small technical metadata:

`BASED IN / CHENNAI`

`FOCUS / AI + BACKEND`

`CURRENTLY / BUILDING`

Avoid turning this into a resume biography.

---

# 20. CURRENTLY BUILDING LAYOUT

## Section label

`05 / CURRENTLY BUILDING`

## Purpose

Create a sense of forward motion.

This is not just another project card.

## Composition

Large heading:

**WHAT HAPPENS WHEN GENERATIVE AI HAS TO OBEY PHYSICS?**

Large GeoCounterfactual visual.

Side panel:

- Status
- Current phase
- Stack
- Next technical milestone

Use a subtle "in progress" visual treatment, not a bright status badge.

## Optional visual

Small progress-like sequence:

DATA -> MODEL -> CRITIC -> VALIDATION

But do not use percentage progress.

---

# 21. EDUCATION LAYOUT

## Section label

`06 / EDUCATION`

Minimal.

Potential:

Large:

`VIT CHENNAI`

Smaller:

`B.TECH / COMPUTER SCIENCE AND ENGINEERING (AI & ML)`

Metadata:

`2027`

`CGPA 8.30`

No school history.

No giant academic timeline.

---

# 22. CONTACT LAYOUT

The contact section should feel like the end of an editorial piece.

## Composition

Large heading:

**HAVE SOMETHING WORTH BUILDING?**

Supporting copy.

Then a large email link.

Below:

GitHub / LinkedIn / Resume.

## Form

Could sit alongside the CTA on desktop.

Desktop:

Left: CTA / contact links

Right: form

Mobile:

CTA

Email

Links

Form

## Inputs

Editorial fields with:

- Thin bottom/outline rule
- Strong focus state
- Clear labels
- No placeholder-only labels

---

# 23. FOOTER

Minimal.

Possible layout:

Left:

GAUTHAM BALAJI

Middle:

CHENNAI, INDIA

Right:

GITHUB / LINKEDIN / EMAIL

Bottom:

COPYRIGHT 2026

Use thin rules.

---

# 24. MOBILE STICKY CTA

Use:

`LET'S TALK`

Position:

Bottom of viewport.

Rules:

- Appears during browsing
- Disappears when contact section is reached
- Does not cover content
- Respects safe-area inset
- 44px+ target
- Accessible
- Reduced motion safe

This is optional if the mobile page feels crowded.

---

# 25. MICRO-INTERACTIONS

## Links

Simple:

- Underline transition
- Opacity/colour change
- Small position shift where appropriate

Do not animate arrows everywhere.

## Buttons

Hover:

- Small background inversion or border treatment
- Fast transition

Active:

- Slight compression

Focus:

- Clearly visible high-contrast ring/outline

## Project rows

Hover/focus:

- Typography shifts slightly
- Preview image appears or changes
- Metadata becomes clearer

Do not require hover to understand the project.

---

# 26. DECRYPTED TEXT

Use sparingly.

Good candidates:

- Small section metadata
- Status labels
- Technical route labels
- Contact metadata

Bad candidates:

- Main headings
- Body paragraphs
- Important content

Animation should be brief.

Reduced motion:

Render final text immediately.

---

# 27. MOTION PRIMITIVES

Use selective motion primitives for:

- Section entry
- Image reveal
- Project transitions
- Small hover interactions

Avoid:

- Continuous scroll animation
- Constant floating objects
- Excessive parallax
- Scroll hijacking

Motion should never delay content visibility.

---

# 28. MAGNETIC LINES

Potential use only if the final composition needs a visual bridge between project or CTA regions.

If used:

- Lightweight
- Subtle
- Decorative
- Disabled for reduced motion
- No canvas dependency for basic navigation

If it does not clearly improve the design, cut it.

---

# 29. PARTICLE TYPOGRAPHY

Potential use only as an experimental secondary visual.

Possible placement:

A transition between major page sections or a small hero-adjacent moment.

Do not use as a background.

Do not use if it adds significant performance cost.

Do not let particles compete with project content.

---

# 30. LANYARD

Default decision:

**Do not use.**

Reason:

- Adds complexity
- Potential WebGL cost
- Weak fit with the editorial concept
- Not necessary to communicate technical depth

Reconsider only if a future visual concept makes it genuinely useful.

---

# 31. WEBGL / HEAVY EFFECTS

No default WebGL background.

No Three.js starfield.

No decorative 3D environment behind the entire site.

If WebGL is used:

- It must be localized
- It must have a static fallback
- It must not block rendering
- It must be lazy-loaded
- It must respect reduced motion
- It must not harm mobile performance

GeoCounterfactual may display an actual 3D globe because it is relevant to that project.

---

# 32. EFFECT BUDGET

Maximum:

**Two expensive visual effects across the site.**

Preferred:

1. Text Pressure in hero
2. Infinite Menu / project interaction if implemented with acceptable performance

All other motion should be lightweight.

If Infinite Menu proves expensive, it should not count as a reason to add another major effect.

---

# 33. ACCESSIBILITY

Mandatory:

- Semantic HTML
- Skip link
- Proper landmarks
- Visible focus
- Keyboard navigation
- Accessible mobile menu
- Accessible dialogs
- Form labels
- Form error announcements
- 44px minimum touch targets
- Contrast verification
- Reduced motion
- Meaningful alt text
- No colour-only information
- Links that work without JavaScript

Interactive visual components must have a normal HTML equivalent.

---

# 34. REDUCED MOTION

When `prefers-reduced-motion: reduce`:

Disable:

- Text Pressure movement
- Parallax
- Particle movement
- Decorative scrolling
- Continuous animation
- Large image choreography

Keep:

- Content
- Layout
- Navigation
- Functional state changes
- Static project previews

The final rendered content must remain identical in meaning.

---

# 35. JS DISABLED BEHAVIOUR

The site must still work.

Without JavaScript:

- Navigation links work
- Project links work
- Project pages render
- Content is readable
- Images display
- Contact page/form has a useful fallback
- No blank interactive regions
- No missing headings

JavaScript should enhance, not create the fundamental page.

---

# 36. IMAGE DIRECTION

## General

Images should feel documentary and technical.

Prefer:

- Screenshots
- Architecture diagrams
- Actual application states
- Maps
- Graphs
- Saliency
- System logs
- Before/after comparisons

## Framing

Use:

- Rectangles
- Thin borders
- Controlled crops
- Asymmetric spans

Avoid:

- Giant rounded cards
- Drop shadows
- Floating image frames
- Generic device mockups

## Image loading

- Astro image pipeline
- Responsive sizes
- Modern formats
- Lazy load below fold
- Hero image prioritized
- Explicit dimensions to prevent layout shift

---

# 37. PROJECT IMAGE TREATMENT

## Chess

Use a strong wide UI screenshot.

Potential secondary image:

Saliency overlay.

## Legal

Use graph as the visual anchor.

## VERA

Use architecture/flow because the actual product is not publicly deployed.

## GeoCounterfactual

Use before/after imagery and XAI overlays.

The image itself should communicate why the project is interesting.

---

# 38. RESPONSIVE COMPOSITION

## Desktop

12-column grid.

Strong asymmetry.

Large typography.

Side-by-side project media and metadata.

## Tablet

8-column grid.

Reduce type scale.

Collapse some side panels.

## Mobile

4-column internal grid where helpful.

Mostly single-column content.

Stack:

- Text
- Visual
- Metadata

Do not simply scale down desktop.

Recompose sections.

---

# 39. MOBILE HERO

Order:

1. Eyebrow
2. Name
3. Positioning
4. Supporting copy
5. CTAs
6. Portrait
7. Location/scroll metadata

The name should occupy the majority of the first viewport.

Do not push the CTA below a huge decorative image.

---

# 40. MOBILE PROJECTS

Project list should become a clean vertical sequence.

Each item:

- Number
- Title
- One-line descriptor
- Year/status
- Thumbnail if useful

Tap navigates to the project.

Avoid hover-dependent previews.

---

# 41. MOBILE EXPERIENCE

Admrls first.

Use:

- Company
- Role
- Date
- Intro
- 3-4 strongest highlights
- Stack

CrftHQ and Sundaram can be compact but readable.

---

# 42. MOBILE CONTACT

The final CTA should be easy to reach.

Sticky `LET'S TALK` should not obscure:

- Inputs
- Submit button
- Footer
- Important content

Hide sticky CTA when contact section enters view.

---

# 43. ICONOGRAPHY

Do not use icon fonts.

Prefer:

- Text
- CSS
- Inline SVG
- Lucide where useful

Icons should be functional.

Do not decorate every section with icons.

Avoid icon-filled skill lists.

---

# 44. CURSOR

Default browser cursor is acceptable.

A custom cursor is not required.

If experimented with:

- Desktop only
- No replacement of functional cursor semantics
- No accessibility impact
- Disabled on touch
- Disabled for reduced motion if animated

Default decision:

**Do not add a custom cursor unless the design clearly benefits.**

---

# 45. SCROLL BEHAVIOUR

Normal browser scrolling.

No scroll hijacking.

No forced snap sections.

Smooth scrolling may be used for internal anchor navigation, but respect reduced motion.

---

# 46. PAGE TRANSITIONS

Optional.

If implemented:

- Short
- Lightweight
- No blank screen
- No content delay
- Accessible
- Reduced-motion safe

Do not use a dramatic page wipe merely for visual flair.

---

# 47. LOADING STATES

Static pages should not require a loading screen.

For dynamic interactions:

Use small state indicators.

Do not display:

`INITIALIZING PORTFOLIO...`

as fake technical theatre.

The site itself should load quickly enough that a loading screen is unnecessary.

---

# 48. CONTACT FORM VISUALS

Inputs should look editorial, not like a SaaS form builder.

Recommended:

- Label above field
- Thin border or underline
- Generous vertical spacing
- Clear focus
- Clear error state
- Rectangular submit button

Avoid:

- Rounded giant input pills
- Placeholder-only labels
- Decorative floating labels if accessibility suffers

---

# 49. STATUS TREATMENT

Statuses should use typography and restrained colour.

Examples:

`COMPLETED`

`PROTOTYPE`

`ACTIVE DEVELOPMENT`

`CURRENT`

Avoid:

- Giant green "AVAILABLE" badges
- Pulsing dots
- Neon indicators
- Progress bars

---

# 50. DATA / TECHNICAL METADATA

Use monospace metadata to reinforce the engineering-documentation feel.

Examples:

`2026 / PYTHON / TENSORFLOW`

`FASTAPI / POSTGRESQL / KUBERNETES`

`STATUS / ACTIVE DEVELOPMENT`

`ROLE / CO-BUILDER`

Metadata should be compact.

Do not turn it into a tag cloud.

---

# 51. EDITORIAL DEVICES

Useful devices:

- Section numbering
- Small all-caps labels
- Thin rules
- Large pull quotes
- Coordinate-like metadata
- Technical captions
- Figure numbers
- "READ MORE" / "VIEW PROJECT" labels
- Small footnote-style explanations

Use these consistently.

---

# 52. PROJECT DETAIL FIGURE STYLE

Architecture diagrams should use:

- Ink
- Paper
- Soft Paper
- Graphite
- Oxide only for important transitions

Node shapes:

- Rectangles
- Thin outlines

Edges:

- Simple lines
- Minimal arrowheads

Typography:

- Monospace labels

Do not use:

- Rainbow diagrams
- Glowing nodes
- 3D effects
- Gradient pipelines

---

# 53. GEOCOUNTERFACTUAL SPECIAL VISUAL LANGUAGE

This project may use a slightly more data-centric visual treatment.

Allowed:

- Raster imagery
- Map overlays
- Coordinate labels
- Small grid references
- XAI overlays
- Terminal-style logs
- Satellite comparison

Still forbidden:

- Generic sci-fi HUD
- Neon geospatial UI
- Fake NASA styling
- Decorative holograms

The visual language should remain part of the same portfolio.

---

# 54. CHESS SPECIAL VISUAL LANGUAGE

Chess can use:

- Board geometry
- Coordinate labels
- Move lines
- Saliency
- Evaluation values
- Technical notation

Do not turn the page into a chess-themed gaming site.

The chessboard is evidence of the engineering.

---

# 55. LEGAL NLP SPECIAL VISUAL LANGUAGE

Legal project can use:

- Graph nodes
- Citation relationships
- Document excerpts
- Highlighted entities
- Section references

Avoid stereotypical legal imagery:

- Gavel
- Scales
- Courtroom stock photos
- Law-book photography

The graph itself is the visual identity.

---

# 56. VERA SPECIAL VISUAL LANGUAGE

Voice project can use:

- Conversation flow
- Tool routing
- Retrieval
- Audio states
- Call lifecycle

Avoid generic waveform animations unless based on actual audio.

Do not fake live-call telemetry.

---

# 57. TYPOGRAPHIC HIERARCHY EXAMPLE

A section should generally feel like:

```text
01 / SELECTED WORK

THINGS
I'VE BUILT.

--------------------------------------------

01
XAI CHESS ENGINE

TEACHING A CHESS ENGINE
TO EXPLAIN ITSELF.

[large actual project visual]

PYTHON / TENSORFLOW / SCIKIT-LEARN
2026 / CO-BUILDER
```

This is a structural reference, not final HTML.

---

# 58. DESIGN ANTI-PATTERNS

Never drift toward:

- Bento grid
- Pastel SaaS
- Glassmorphism
- Generic AI landing page
- Giant skill-pill wall
- GitHub graph
- Testimonials
- Fake metrics
- Client logo wall
- Giant availability badge
- Starfield
- Excessive WebGL
- Radial orbs
- Sparkles
- Decorative gradients
- Animated arrows everywhere
- Skill percentages
- Progress bars
- Rocket/checkmark bullets
- Giant hero image
- Inert contact form

---

# 59. PERFORMANCE DESIGN

Performance is part of the visual experience.

The site should feel fast before animation starts.

Requirements:

- Astro static-first
- React islands only where needed
- Minimal JS
- Image optimization
- Responsive images
- Modern formats
- Lazy loading
- No render-blocking decorative effects
- No unnecessary dependencies
- No icon fonts
- No duplicate libraries

Avoid recreating the old site's:

- 2.6MB profile image
- Render-blocking Three.js starfield
- Excessive page weight
- Inert carousel behaviour

---

# 60. COMPONENT ARCHITECTURE

Suggested component categories:

## Layout

- SiteNav
- PageContainer
- Section
- Footer

## Typography

- DisplayHeading
- TechnicalLabel
- EditorialStatement

## Projects

- ProjectIndex
- ProjectRow
- ProjectHero
- ProjectMeta
- ProjectFigure
- ArchitectureDiagram
- ProjectNext

## Experience

- ExperienceFeature
- ExperienceRow
- ExperienceMeta

## Interaction

- TextPressure
- DecryptedText
- InfiniteProjectMenu
- MotionReveal

## Contact

- ContactCTA
- ContactForm

Every interactive component should have a static fallback.

---

# 61. DESIGN TOKENS

Create CSS variables / Tailwind tokens for:

```text
--color-ink
--color-paper
--color-paper-soft
--color-graphite
--color-oxide

--font-display
--font-body
--font-mono

--space-1
--space-2
...
--space-section

--radius-sm
--border-thin

--container-max
--grid-gap
--page-gutter
```

Do not scatter raw values throughout components.

---

# 62. ACCESSIBILITY DESIGN CHECKLIST

Every interactive component must answer:

1. Can I use it with keyboard?
2. Can I understand it without animation?
3. Does it have visible focus?
4. Does it have a semantic HTML fallback?
5. Does reduced motion disable unnecessary movement?
6. Does screen reader output make sense?
7. Is the hit area at least 44px?
8. Does it work at 200% zoom?
9. Does colour contrast remain sufficient?
10. Does it still work if JavaScript fails?

---

# 63. PERFORMANCE CHECKLIST

Before launch:

- [ ] Hero image optimized
- [ ] Fonts optimized
- [ ] Images have explicit dimensions
- [ ] Below-fold images lazy load
- [ ] Decorative JS lazy loads
- [ ] No unnecessary hydration
- [ ] No console errors
- [ ] No layout shift
- [ ] Lighthouse reviewed
- [ ] Mobile network tested
- [ ] JavaScript-disabled page reviewed

---

# 64. QA VIEWPORTS

Test:

- 360px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

Test both portrait and landscape where relevant.

---

# 65. DESIGN IMPLEMENTATION ORDER

## Pass 1: Foundations

- Fonts
- Colours
- Tokens
- Grid
- Typography
- Base elements

## Pass 2: Static shell

- Nav
- Hero
- Section primitives
- Footer

## Pass 3: Work

- Project index
- Flagship project
- Secondary projects
- Detail routes

## Pass 4: Experience

- Admrls
- CrftHQ
- Sundaram

## Pass 5: Profile

- Engineering Profile
- About
- Currently Building
- Education

## Pass 6: Contact

- CTA
- Links
- Form

## Pass 7: Motion

- Text Pressure
- Project interaction
- Decrypted Text
- Motion reveals

## Pass 8: Polish

- Spacing
- Typography
- Image treatment
- Responsive composition
- Hover states

## Pass 9: QA

- Accessibility
- Reduced motion
- JS disabled
- Mobile
- Performance
- Lighthouse
- Build/typecheck/lint/tests

---

# 66. CLAUDE IMPLEMENTATION RULES

Claude should not be asked to invent the visual direction.

Claude should:

1. Read `MASTER_CONTENT.md`
2. Read `DESIGN_SYSTEM.md`
3. Inspect the existing repository
4. Identify reusable assets
5. Propose an implementation plan
6. Implement in controlled passes
7. Preserve the factual boundaries
8. Ask before inventing missing content
9. Prefer simple implementation over unnecessary dependencies
10. Test each pass before continuing

Claude may suggest improvements.

Claude must distinguish:

- Existing specification
- Suggested improvement
- Implemented decision

Do not silently change the design direction.

---

# 67. CLAUDE REVIEW / IDEA LOOP

The workflow should allow Claude to suggest improvements.

Good questions to ask Claude:

- Does this layout create enough hierarchy?
- Is this interaction worth its complexity?
- Which project visual should dominate?
- Is this mobile composition stronger if reordered?
- Are any dependencies unnecessary?
- Can this effect be implemented more accessibly?
- Does the current layout communicate the technical story?
- Where does the page feel visually repetitive?
- Which section needs more whitespace?
- Which effect should be cut if performance suffers?

Claude should propose alternatives with reasons.

The human decision remains authoritative.

---

# 68. TWO-PASS DESIGN RULE

For every major visual section:

### Pass A

Build the static composition first.

### Pass B

Add interaction and motion.

Never use motion to compensate for a weak static layout.

---

# 69. NO DECORATIVE TECH THEATRE

Do not add fake:

- System logs
- Terminal output
- Request counters
- CPU graphs
- Network diagrams
- Loading states
- "AI thinking" animations
- Random coordinates
- Fake latency meters

unless they represent actual project data or a clearly labelled visual concept.

The portfolio itself should demonstrate engineering quality instead of pretending to be a machine.

---

# 70. FINAL DESIGN TARGET

The finished site should feel like:

> **A highly technical personal publication with the visual confidence of an editorial design studio.**

It should not feel like:

> "A developer discovered Framer Motion and made a portfolio."

The visual hierarchy should be driven by:

**Typography -> Structure -> Real work -> Interaction -> Decoration**

not the other way around.

---

# 71. FINAL SUCCESS CRITERIA

The design is successful if:

- The hero communicates identity in seconds.
- Admrls clearly establishes professional engineering experience.
- XAI Chess Engine feels like the flagship.
- Projects look like real engineering case studies.
- GeoCounterfactual clearly feels active and unfinished in an honest way.
- The site communicates backend + AI depth without becoming a skill list.
- The design feels distinctive without being gimmicky.
- Mobile feels intentionally designed.
- Animation enhances rather than dominates.
- The site remains excellent with reduced motion.
- The site remains useful without JavaScript.
- Performance is strong.
- A technical recruiter can understand the candidate quickly.
- A software engineer can see the depth.
- The overall reaction is:

> **"Woah. I need to hire this guy."**
