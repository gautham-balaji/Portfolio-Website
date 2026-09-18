# Portfolio Rebuild: Analysis and Implementation Plan

> Reconnaissance and planning document. No repository files were modified, no dependencies installed.
>
> Authoritative inputs: `MASTER_CONTENT.md` (content, facts, boundaries) and `DESIGN_SYSTEM.md` (visual, interaction, accessibility, performance).
>
> Everything in this document is either (a) a finding, (b) a plan derived from those two specs, or (c) a clearly marked **SUGGESTION**.
>
> Date: 2026-09-13 · Repo state: commit `a495816` + 3 untracked spec files

---

## Legend

| Marker | Meaning |
|---|---|
| **SPEC** | Required by `MASTER_CONTENT.md` or `DESIGN_SYSTEM.md`. Not my decision. |
| **SUGGESTION** | My proposal. Not in the specs. Your call. |
| **GAP** | Something the specs require that does not yet exist. |
| **BLOCKER** | Must be resolved before the relevant phase can complete. |

---

# Executive Summary

The repository contains no reusable code. It is three unbuilt files (`index.html`, `styles.css`, `script.js`, 1,453 lines total) plus twelve images, all of which describe a previous version of you: different projects, different sections, different visual direction. The two specification documents describe a substantially different site. This is a clean build on an empty foundation, not a migration.

**The specs themselves are in good shape.** `MASTER_CONTENT.md` and `DESIGN_SYSTEM.md` are internally consistent, cross-referenced, and unusually disciplined about factual boundaries. I found no contradictions between them. The design direction is well defined enough to implement without inventing anything, with three exceptions noted below.

**Four findings materially affect sequencing:**

1. **Assets are the critical path, not code.** Of twelve existing images, one is potentially reusable (the portrait, as a source file to re-export). `DESIGN_SYSTEM.md` §93 states "Images are evidence" and §36 requires screenshots, diagrams, and real application states. None of the four projects currently has a usable UI screenshot. The engineering work here is a few weeks; producing the evidence is the longer lead time.

2. **Two project repositories will not withstand a recruiter clicking through.** `legal-nlp-with-knowledge-graphs` is 5 KB and contains only a README, LICENSE, `requirements.txt` and `.gitignore`. The code is not pushed. Its README describes a sophisticated system that is not in the repository. **VERA has no repository at all** (confirmed: zero results searching your account). Linking either as-is undermines the credibility the site is built to establish.

3. **The specified colour palette fails WCAG AA in its two most-used secondary roles.** Graphite on Paper is 3.75:1 and Oxide on Paper is 3.58:1, both below the 4.5:1 required for normal text. `DESIGN_SYSTEM.md` assigns Graphite to "metadata, secondary text" and §05 sets metadata at 0.7rem to 0.85rem, which is small text. §33 mandates contrast verification. This is the exact failure mode of the old site and it is currently baked into the spec. Corrections are proposed below.

4. **Content model fields are missing for three of four projects.** `MASTER_CONTENT.md` §22 requires `status`, `year`, and `role` on every project. Chess has all three. Legal NLP has none. VERA and GeoCounterfactual have status but no year or role. Zod will reject these at build time, which is the correct behaviour, but the values must come from you.

**Recommended approach:** proceed with the Astro / TypeScript / Tailwind architecture as intended. Adopt your Phase 0 to 10 ordering with two adjustments (detailed in Implementation Phases): move asset capture to run in parallel starting immediately, and move the contact backend earlier so it is not compressed at the end.

---

# Repository Findings

## A. Current architecture

Already audited in detail; summarised here for completeness.

| Concern | State |
|---|---|
| Framework | None. Hand-written HTML5. |
| Build system | None. Files served verbatim by Vercel. |
| Package manager | None. No `package.json`, no lockfile. |
| Entry point | `index.html`, single document. |
| Routing | In-page anchors only. One route (`/`). |
| Styling | One 951-line global stylesheet. |
| JavaScript | One 237-line non-module script, two `DOMContentLoaded` handlers. |
| Dependencies | three.js r128, Font Awesome 6.4.2 and 5.15.3, all CDN, no SRI. |
| Deployment | Vercel static. No `vercel.json`. Deployed bundle is byte-identical to `main`. |

**Relevant carry-forward facts:** the Vercel project and the `gautham-balaji.vercel.app` URL work correctly and need no change. The git history is clean. There is no CI, no linter, no formatter, no `.gitignore`, no README.

## B. Specification files

Three markdown files sit in the root. Two are named as authoritative. The third is not.

| File | Lines | Status |
|---|---:|---|
| `MASTER_CONTENT.md` | 1,637 | **SPEC.** Authoritative for content. |
| `DESIGN_SYSTEM.md` | 2,200 | **SPEC.** Authoritative for visual and interaction. |
| `gautham_portfolio_master_content_design.md` | 2,601 | Not named as authoritative. See below. |

The third file is an earlier combined version that the other two were split from. I cross-checked every load-bearing fact (LinkedIn URL, phone, email, CGPA, Pearson 0.506, simulation timing 146-195s, chess team composition) and found **no contradictions**. It is a consistent predecessor, not a competing source.

It does contain three passages absent from the split files:

- `# 00. CORE PRINCIPLE` ("an engineer's personal publication about the systems he builds, not a resume rendered as a website")
- `## Core areas` (a twelve-item list of technical domains)
- `# 45. FINAL PERSONAL POSITIONING` (three canonical positioning statements)

The first is preserved almost verbatim in `DESIGN_SYSTEM.md` §01. The other two are not preserved anywhere. **GAP:** if you want the "Core areas" list or the final positioning statements available to implementation, they need to move into `MASTER_CONTENT.md`. Otherwise the third file is duplicate state that will drift. See Questions.

## C. Git and tooling state

```
Branch:     main (clean working tree, 3 untracked spec files)
Untracked:  DESIGN_SYSTEM.md, MASTER_CONTENT.md,
            gautham_portfolio_master_content_design.md
Node:       v24.15.0      npm: 11.14.1      git: 2.48.1.windows.1
Platform:   Windows 11, PowerShell + Git Bash
```

Node 24 and npm 11 comfortably exceed Astro 5's requirements. No tooling blockers.

**Note:** there is no `.gitignore`. Adding one is Phase 1 work, but until then any `node_modules` created would be picked up by git status.

## D. Project repository reconnaissance

`MASTER_CONTENT.md` §22 defines a `github` field but supplies no URLs. I resolved them against your GitHub account.

| Project | Repository | Size | Last push | Contents | Verdict |
|---|---|---:|---|---|---|
| XAI Chess Engine | `chess-bot` | 46.9 MB | 2026-04-16 | `app.py`, `engine.py`, `models/`, `static/`, `templates/`, `chess_model_FINAL.ipynb` | Real and substantial. Name mismatch, see below. |
| Legal NLP KG | `legal-nlp-with-knowledge-graphs` | **5 KB** | 2026-04-07 | README (8.4 KB), LICENSE, `requirements.txt`, `.gitignore` | **BLOCKER. No code.** |
| VERA | **none found** | | | | **BLOCKER. No repository.** |
| GeoCounterfactual | `geocounterfactual` | 304 KB | **2026-09-13** | `backend/`, `src/`, Vite, Tailwind, `IMPLEMENTATION_MASTER_SPEC.md` | Real and actively worked on. |

Three specific issues:

**D-1. The chess repository is named and described differently from the portfolio.** Repo name is `chess-bot`, description is "Lightweight Interactive Chess Engine". The site will present it as "XAI Chess Engine" with the thesis "Teaching a chess engine to explain itself." A recruiter clicking through lands on something that reads as a smaller, different project. The explainability work, which is the entire point, is invisible from the repo surface.

**D-2. The Legal NLP repository is effectively empty.** Its README describes entity extraction, knowledge graph construction, hybrid retrieval, SHAP and LIME explainability, and quotes benchmarks (Entity F1 0.87, classification accuracy 0.92, MAP@10 0.78). None of the implementing code is present. `MASTER_CONTENT.md` §09 authorises those benchmarks "with context on the detailed project page", but a visitor who verifies by opening the repo finds nothing. This is the single largest credibility risk in the rebuild.

**D-3. The Legal NLP README violates the site's own copy rules.** It opens with emoji section markers and uses "sophisticated", which `MASTER_CONTENT.md` §03 explicitly bans. Not a site problem directly, but the repo is linked from the site and forms part of the same impression.

## E. Problems that must not survive the rebuild

Carried from the prior audit, mapped to the specs that now forbid them.

| Problem | Forbidden by |
|---|---|
| 2.6 MB profile PNG rendered at 200x200 | `DESIGN_SYSTEM.md` §59 (named explicitly) |
| Render-blocking three.js starfield | §31, §58, §59 (named explicitly) |
| Inert contact form | §58, `MASTER_CONTENT.md` §18 ("Do not ship an inert form") |
| Font Awesome icon fonts, loaded twice | §43 ("Do not use icon fonts"), §59 |
| Projects unreachable by keyboard | §33, §62 |
| Form fields with no labels or names | §33, §48 |
| No `prefers-reduced-motion` support anywhere | §34 |
| Root font-size dropping to 12px on mobile | §05 (mobile body stays 1rem) |
| Hover-only project information | §25 ("Do not require hover to understand the project") |
| Hero parallax overlapping the next section | §27 ("Avoid excessive parallax") |
| Auto-scrolling carousel | §40 (vertical sequence, tap to navigate) |
| Colour contrast failures | §33, §62 |

Every one of these is already prohibited by `DESIGN_SYSTEM.md`. The spec was written with the old site's failures in view.

---

# Existing Assets

All twelve live in `assets/`. Dimensions and sizes measured directly.

| File | Type | Dimensions | Size | Represents | Verdict |
|---|---|---|---:|---|---|
| `gautham3.png` | PNG photo | 1024x1536 | 2,591 KB | Formal portrait, suit, grey background | **REVIEW.** See note. |
| `logo3.png` | PNG logo | 225x225 | 59 KB | VIT Chennai crest | **REVIEW.** Probably unused. |
| `project4.png` | PNG | 627x398 | 241 KB | Emotion Detection project | **DISCARD.** Not in new content. |
| `project5.png` | PNG | 593x421 | 149 KB | Fraud Detection project | **DISCARD.** Not in new content. |
| `car.png` | JPEG (mislabelled) | 300x168 | 11 KB | Car Management System | **DISCARD.** |
| `logo.png` | PNG logo | 1280x1180 | 126 KB | Sonique Discord bot | **DISCARD.** |
| `gb.png` | PNG logo | 500x500 | 22 KB | Old portfolio self-reference | **DISCARD.** |
| `aiclub.png` | PNG logo | 200x200 | 30 KB | AI Club | **DISCARD.** No clubs section. |
| `ospc.png` | PNG logo | 200x200 | 45 KB | Open Source Programming Club | **DISCARD.** |
| `sports.png` | PNG logo | 209x189 | 72 KB | Sports Club | **DISCARD.** |
| `logo1.png` | PNG logo | 142x150 | 25 KB | Sankara school | **DISCARD.** §21 forbids school history. |
| `logo2.png` | PNG logo | 500x500 | 149 KB | Shraddha Children's Academy | **DISCARD.** Same. |

**Reuse rate: 1 of 12, conditionally.**

### Note on the portrait

`DESIGN_SYSTEM.md` §11 asks for "a slightly editorial crop rather than a conventional rounded headshot", with "neutral background, subtle paper framing, thin border" and "do not apply heavy filters". The existing file is a formal suit headshot on a grey studio background at 1024x1536, which is a usable 2:3 vertical aspect for a rectangular editorial crop.

It is technically reusable as a **source file** (never as shipped, at 2.6 MB). Whether it is the right image is an art-direction judgement: a formal studio headshot reads more corporate than editorial. Flagged for your review rather than decided.

### Note on the VIT logo

Education is now a typographic section (§21: large `VIT CHENNAI`, smaller degree line, metadata `2027` and `CGPA 8.30`). No logo is specified, and §43 says "do not decorate every section with icons". `logo3.png` is therefore probably unnecessary, but it is the one other file that maps to surviving content.

### Assets found inside project repositories

`chess-bot/static/` contains six images that are not in this repository:

| File | Size | Likely content |
|---|---:|---|
| `architecture_breakdown.png` | 130 KB | Architecture diagram |
| `training_progress.png` | 293 KB | Training curves |
| `performance_comparison.png` | 174 KB | Model comparison chart |
| `accuracy_metrics.png` | 116 KB | Metrics chart |
| `logo.png` | 28 KB | Project logo |
| `titlelogo.png` | 10 KB | Project title logo |

These are **ML training charts, not UI screenshots**. `MASTER_CONTENT.md` §08 lists preferred media in order: (1) chess UI screenshot, (2) architecture diagram, (3) move explanation UI, (4) saliency map. The repo supplies a candidate for (2) only.

**Two cautions:**

- `accuracy_metrics.png` and `performance_comparison.png` carry a factual risk. `MASTER_CONTENT.md` §23 is explicit that the CNN result is a **Pearson correlation of 0.506, not accuracy**. Publishing a chart whose own filename and axis labels say "accuracy" would contradict the site's stated factual boundary. These should be reviewed before use, and relabelled or excluded.
- `architecture_breakdown.png` was drawn for the repo, not for this design system. §52 requires diagrams in Ink / Paper / Soft Paper / Graphite with monospace labels, thin outlines, minimal arrowheads, and explicitly rules out "rainbow diagrams, glowing nodes, 3D effects, gradient pipelines". It is unlikely to match. Expect to redraw rather than import.

---

# What To Keep

| Item | Notes |
|---|---|
| The Vercel project and deployment URL | Works correctly. Repoint the build, keep the host. |
| Git history and `LICENSE` | No reason to reset. |
| `MASTER_CONTENT.md` and `DESIGN_SYSTEM.md` | The build inputs. Keep in-repo and version them. |
| `assets/gautham3.png` | As a **source** file only, pending art-direction review. |
| Real project content in `chess-bot` and `geocounterfactual` | Substantial, genuine engineering to point at. |

Nothing else in the repository survives.

---

# What To Discard

| Item | Reason |
|---|---|
| `index.html` (265 lines) | Describes obsolete content and structure. |
| `styles.css` (951 lines) | Global, element-selector-heavy, four confirmed dead rules, wrong visual direction. |
| `script.js` (237 lines) | Contains two confirmed runtime bugs; every component it drives is being replaced. |
| three.js, both Font Awesome copies | Forbidden by §31, §43, §59. |
| Ten of twelve images | Map to content that no longer exists. |
| The Instagram link | `MASTER_CONTENT.md` §01: "Only GitHub and LinkedIn are confirmed social profiles." |
| Skills-as-pills presentation | §17 "Do not render as a giant wall of pills"; §58 anti-pattern. |
| Clubs, school history, old project set | Absent from the new content spec entirely. |

---

# Proposed Architecture

## Stack

**SPEC-aligned.** Astro 5 (static output), TypeScript in strict mode, Tailwind CSS 4, Astro content collections with Zod, React islands only where interaction genuinely requires state.

**SUGGESTION on specifics:**

| Choice | Recommendation | Why |
|---|---|---|
| Astro output mode | `static` with a single `prerender = false` API route | Keeps the whole site static; only the contact endpoint is server-rendered. |
| Adapter | `@astrojs/vercel` | Required for the one server route. Zero cost to the static pages. |
| Tailwind | v4, CSS-first config via `@theme` | Design tokens (§61) live in CSS variables, which is exactly what v4's `@theme` block produces. Avoids maintaining a parallel JS config. |
| React | 19, via `@astrojs/react` | Only loaded on pages that carry an island. |
| Content | `astro:content` with `glob()` loader over local MDX | Type-safe, build-time validated, no CMS. |

**Deliberately not included:** no animation library by default (see Interaction Review), no icon library beyond a handful of inlined Lucide SVGs (§43), no UI component library, no state manager, no CSS-in-JS.

## Directory structure

```
/
├─ MASTER_CONTENT.md            # spec, versioned
├─ DESIGN_SYSTEM.md             # spec, versioned
├─ REBUILD_PLAN.md              # this file
├─ astro.config.mjs
├─ tsconfig.json                # extends astro/tsconfigs/strict
├─ package.json
├─ .gitignore                   # currently missing
├─ .prettierrc / eslint.config.js
├─ playwright.config.ts
├─ lighthouserc.json
├─ public/
│  ├─ favicon.ico / favicon.svg / apple-touch-icon.png
│  ├─ site.webmanifest
│  ├─ robots.txt
│  └─ gautham-balaji-resume.pdf
└─ src/
   ├─ content.config.ts         # Zod schemas for all 4 collections
   ├─ content/
   │  ├─ projects/
   │  │  ├─ chess-engine.mdx
   │  │  ├─ legal-nlp.mdx
   │  │  ├─ vera.mdx
   │  │  └─ geocounterfactual.mdx
   │  ├─ experience/
   │  │  ├─ admrls.mdx
   │  │  ├─ crfthq.mdx
   │  │  └─ sundaram-finance.mdx
   │  ├─ education/vit-chennai.mdx
   │  └─ skills/index.yaml
   ├─ assets/                   # processed by Astro's image pipeline
   │  ├─ portrait/
   │  └─ projects/{chess,legal,vera,geo}/
   ├─ styles/
   │  ├─ global.css             # @theme tokens, base elements, focus ring
   │  └─ fonts.css
   ├─ lib/
   │  ├─ seo.ts                 # per-page metadata builder
   │  ├─ schema.ts              # JSON-LD Person
   │  └─ contact.ts             # shared Zod schema, client + server
   ├─ components/
   │  ├─ layout/     SiteNav · MobileMenu · PageContainer · Section · Footer · SkipLink
   │  ├─ type/       DisplayHeading · TechnicalLabel · EditorialStatement · SectionNumber
   │  ├─ project/    ProjectIndex · ProjectRow · ProjectHero · ProjectMeta ·
   │  │              ProjectFigure · ArchitectureDiagram · ProjectNext
   │  ├─ experience/ ExperienceFeature · ExperienceRow · ExperienceMeta
   │  ├─ contact/    ContactCTA · ContactForm
   │  └─ islands/    TextPressure.tsx · DecryptedText.tsx ·
   │                 MobileMenu.tsx · ContactForm.tsx · MotionReveal.tsx
   ├─ layouts/       BaseLayout.astro · ProjectLayout.astro
   └─ pages/
      ├─ index.astro
      ├─ 404.astro
      ├─ projects/[...slug].astro
      └─ api/contact.ts          # prerender = false
```

The `components/` subdirectories mirror `DESIGN_SYSTEM.md` §60 exactly.

## Content collections

**SPEC** (`MASTER_CONTENT.md` §22) defines the fields. Proposed Zod shape:

```ts
// projects
{
  title, slug, status: enum, year: number, role, featured: boolean,
  order: number,                    // controls the 01-04 index sequence
  shortDescription, thesis, positioning,
  problem, approach, architecture,
  technicalDecisions: array, technologies: array,
  results: optional, limitations: optional,
  lessons: optional, futureWork: optional,
  github: optional url, live: optional url,
  media: array of { src, alt, caption, figure, kind }
}
```

Three deliberate design decisions:

1. **`github` and `live` are optional.** VERA has neither and GeoCounterfactual has no public deployment. §11 and §10 forbid inventing URLs. Optional fields let the template omit the link rather than render a dead one.
2. **`limitations` is a first-class field, not a footnote.** §16 lists it as story section 8, and the GeoCounterfactual and chess entries both carry explicit limitations that the spec requires be stated. Making it schema-level prevents it being quietly dropped.
3. **`status` is a strict enum** matching §49: `COMPLETED`, `PROTOTYPE`, `ACTIVE DEVELOPMENT`, `CURRENT`. Free text would drift.

**GAP, confirmed by inspection:** `status`, `year` and `role` are required by §22 but are not supplied in the content spec for three projects.

| Project | status | year | role |
|---|---|---|---|
| XAI Chess Engine | Completed | 2026 | Co-builder |
| Legal NLP KG | **missing** | **missing** | **missing** |
| VERA | Hackathon / prototype | **missing** | **missing** |
| GeoCounterfactual | Active development | **missing** | **missing** |

Zod will fail the build on these, which is correct. The values must come from you; I will not infer them from repository creation dates.

## Image handling

**SPEC** (§36): Astro image pipeline, responsive sizes, modern formats, lazy load below fold, hero prioritised, explicit dimensions.

- Everything except the favicon set lives in `src/assets/` so it passes through Sharp. `public/` is only for files that must keep a stable URL (favicon, resume, robots).
- `<Image>` for fixed-size art, `<Picture>` with AVIF and WebP for the hero portrait and project heroes.
- Hero portrait: `loading="eager"`, `fetchpriority="high"`. Everything else: `loading="lazy"` with explicit `width`/`height`.
- **SUGGESTION:** set a hard budget of 250 KB per image after optimisation, and 1.2 MB total page weight. The old site shipped 3,792 KB; this makes the improvement measurable rather than assumed.

## Font handling

**SPEC** (§04) defines three roles (Display, Body, Technical) and their characteristics, but **names no typefaces**. This is a genuine gap and one of the three decisions blocking Phase 2.

**SUGGESTION.** One technical constraint should drive the display choice: §12 specifies Text Pressure on the hero name with "no layout shift" and "must remain readable". Done properly, Text Pressure animates a variable font's **width and weight axes**, not a transform. That requires a display face with a `wdth` axis. Without one, the effect degrades into scaling, which causes exactly the layout shift §12 forbids.

Candidates, all self-hostable via Fontsource:

| Role | Candidate | Axes / notes |
|---|---|---|
| Display | **Archivo Variable** | `wght 100-900`, `wdth 62-125`. Grotesque with editorial presence. The `wdth` axis makes Text Pressure viable as specified. |
| Display (alt) | **Roboto Flex** | Very wide axis range, more neutral personality. |
| Display (alt) | **Bricolage Grotesque** | `wght`, `wdth`, `opsz`. More expressive, closer to "slightly experimental" in §01. |
| Body | **Public Sans** or **IBM Plex Sans** | Neutral personality per §04. Plex pairs optically with Plex Mono. |
| Technical | **IBM Plex Mono** or **JetBrains Mono** | Plex Mono was designed for engineering documentation, which matches §01 directly. |

My recommendation is **Archivo Variable + IBM Plex Sans + IBM Plex Mono**, chosen because Archivo's width axis is what makes the specified hero interaction implementable without compromise.

Loading: self-host via Fontsource, subset to Latin, `font-display: swap`, `preload` only the display face used above the fold. No Google Fonts CDN request at runtime.

## Interactive island strategy

**SPEC** (§35): the site must work without JavaScript. §33: every interactive visual component must have a normal HTML equivalent.

| Island | Directive | Static fallback |
|---|---|---|
| `MobileMenu` | `client:media="(max-width: 1023px)"` | `<details>`/`<summary>` renders and toggles with no JS. |
| `ContactForm` | `client:visible` | Native form POSTs to `/api/contact`, server returns a rendered result page. |
| `TextPressure` | `client:idle` | Plain `<h1>` in final typography. The island enhances an existing DOM node; it never creates it. |
| `DecryptedText` | `client:visible` | Final text is the server-rendered content. |
| `MotionReveal` | CSS-only where possible | Content at `opacity: 1` by default; reveal is an enhancement, never a gate. |

**Rule to enforce in review:** no island may be the only source of any content, heading, or link. Islands attach to server-rendered DOM. This single rule satisfies §35 and prevents the most common Astro regression.

## SEO structure

**SPEC** (`MASTER_CONTENT.md` §27): titles, descriptions, canonicals, OG, social preview, sitemap, robots, JSON-LD Person, semantic landmarks, proper 404.

- `src/lib/seo.ts` exports a typed `buildMeta()` consumed by `BaseLayout`. Every page passes title, description, canonical, OG image. No page can render without them because the props are required.
- `@astrojs/sitemap` generates `sitemap-index.xml`; `robots.txt` references it.
- JSON-LD `Person` with name, jobTitle, address (Chennai), `sameAs` (GitHub, LinkedIn), `alumniOf` (VIT Chennai).
- **SUGGESTION:** generate per-project OG images at build time with `astro-og-canvas`, using the design tokens (Ink on Paper, project number, title, mono metadata). Four project pages plus home each get a distinct, on-brand preview card. This is the highest-leverage SEO item, because the site's main distribution channel is a link pasted into LinkedIn or a message.

## Contact form architecture

**SPEC** (`MASTER_CONTENT.md` §18): real backend, validation, honeypot, rate limiting, accessible errors, keyboard support, five states (idle, submitting, success, validation error, server error). "Do not ship an inert form."

Proposed:

```
ContactForm island (React, client:visible)
  └─ POST /api/contact          (Astro endpoint, prerender = false, Vercel function)
       ├─ Zod parse             (same schema as client, imported from lib/contact.ts)
       ├─ honeypot field check  (hidden input must be empty)
       ├─ timing check          (reject submissions faster than ~2s)
       ├─ rate limit            (see question below)
       └─ send via Resend       → your inbox, reply-to set to sender
```

One schema in `lib/contact.ts` is imported by both client and server, so validation rules cannot diverge.

Accessibility per §48 and §33: labels above fields (never placeholder-only), `aria-describedby` linking errors to inputs, `aria-live="polite"` status region, `aria-invalid` on failed fields, focus moved to the first error on failed submit.

**Open decision (see Questions):** rate limiting on Vercel serverless needs external state. Options are Upstash Redis (free tier, one dependency), Cloudflare Turnstile (no state, adds a third-party script), or honeypot plus timing only (no dependency, weaker). This is a genuine cost/benefit tradeoff, not something the specs settle.

## Testing, build, typecheck, lint

Mapped directly onto the §62 accessibility checklist, §63 performance checklist and §64 viewport list, so the specs become executable rather than aspirational.

| Layer | Tool | Covers |
|---|---|---|
| Types | `astro check` (strict) | Content schema conformance, component props |
| Lint | ESLint + `eslint-plugin-jsx-a11y` | Catches missing labels, non-semantic handlers |
| Format | Prettier + `prettier-plugin-astro` | Consistency |
| Unit | Vitest | Contact schema, SEO builder, content helpers |
| E2E / a11y | Playwright + `@axe-core/playwright` | Keyboard traversal, focus visibility, mobile menu, form states |
| Visual / responsive | Playwright screenshots at the 8 §64 viewports | Recomposition correctness, no horizontal overflow |
| Perf | Lighthouse CI with budgets | Weight, LCP, CLS |

**SUGGESTION:** three Playwright specs are worth writing even if nothing else is tested, because they encode the three requirements most likely to regress silently:

1. `no-js.spec.ts` runs with `javaScriptEnabled: false` and asserts nav links, project links, all headings, and images render (§35).
2. `reduced-motion.spec.ts` runs with `prefers-reduced-motion: reduce` and asserts no element is mid-animation and all content is present (§34).
3. `keyboard.spec.ts` tabs the full page and asserts every project is reachable and focus is always visible. This is the exact test the old site would have failed.

CI on push: `astro check && eslint && vitest && astro build && playwright test && lhci autorun`.

---

# Page / Component Architecture

## Routes

**SPEC** (`MASTER_CONTENT.md` §05):

| Route | Source | Rendering |
|---|---|---|
| `/` | `pages/index.astro` | Static |
| `/projects/chess-engine` | `[...slug].astro` | Static (SSG from collection) |
| `/projects/legal-nlp` | same | Static |
| `/projects/vera` | same | Static |
| `/projects/geocounterfactual` | same | Static |
| `/404` | `pages/404.astro` | Static |
| `/api/contact` | `pages/api/contact.ts` | **Server** (`prerender = false`) |

## Homepage section order

**SPEC** (§05). Numbering is content, not decoration: it is the reader's position in a sequence.

```
SiteNav (sticky)
Hero
01 / SELECTED WORK
02 / EXPERIENCE
03 / ENGINEERING PROFILE
04 / ABOUT
05 / CURRENTLY BUILDING
06 / EDUCATION
Contact CTA
Footer
```

---

# Design Implementation Plan

Each section below follows: composition, desktop, mobile, components, responsive notes, interaction, static fallback, risk.

## 1. Navigation

**SPEC** §10.

- **Composition.** Left: `GAUTHAM BALAJI`. Right: `WORK  EXPERIENCE  ABOUT  CONTACT`, optional resume link. Thin bottom rule.
- **Desktop.** Sticky bar, quiet at page top, acquires Soft Paper background on scroll, may compress slightly. Explicitly never a floating pill.
- **Mobile.** Left wordmark, right menu trigger. Opens as a near-full-screen editorial panel, not a dropdown.
- **Components.** `SiteNav.astro`, `MobileMenu.tsx` (island), `SkipLink.astro`.
- **Responsive.** Full links to about 1024px, then trigger. **SUGGESTION:** switch at 1024px rather than 768px. Four links plus a wordmark plus a resume link is tight at 768px, and the old site's failure was exactly a nav row that technically fitted but had 28px targets.
- **Interaction.** Scroll state via `IntersectionObserver` on a sentinel, not a scroll handler. Active section via `IntersectionObserver` (§25).
- **Static fallback.** `<details>`/`<summary>` gives an operable menu with zero JS. The island upgrades it with focus trap and Escape.
- **Risk.** Focus trap correctness. Mitigation: use the native `<dialog>` element's `showModal()`, which provides trapping and Escape without hand-written key handling.

## 2. Hero

**SPEC** §11, §12, §39.

- **Composition.** Eyebrow `SOFTWARE ENGINEER`, name `GAUTHAM BALAJI`, positioning line, supporting copy, two rectangular CTAs, metadata `CHENNAI, INDIA`.
- **Desktop.** 12-column: text columns 1-8, portrait columns 9-12. Height 75vh to 90vh. **CTA must be above the fold** (§11).
- **Mobile.** Strict order: eyebrow, name, positioning, supporting copy, CTAs, portrait, metadata. Name occupies most of the first viewport. Portrait comes **after** the CTAs (§39: "do not push the CTA below a huge decorative image").
- **Components.** `Hero.astro`, `TextPressure.tsx`, `DisplayHeading.astro`, `TechnicalLabel.astro`.
- **Responsive.** This is a genuine recomposition, not a reflow. Desktop is a two-column grid; mobile is a reordered single column where the portrait changes position in the sequence. Implement as one grid with explicit `order` at breakpoints, or two compositions.
- **Interaction.** Text Pressure on the name only. Pointer-driven, disabled for touch, keyboard, and reduced motion.
- **Static fallback.** The `<h1>` is server-rendered at final size and weight. The island only mutates variable-font axes on an existing node.
- **Risk.** Hero height plus above-the-fold CTA is the tightest constraint on the page. At 1280x800 with browser chrome, real viewport is roughly 700px. **Mitigation:** verify the CTA's Y position with a Playwright assertion at 1280x800 and 1440x900 rather than trusting the design.

## 3. Selected Work

**SPEC** §13, §14, §15, §40.

- **Composition.** `01 / SELECTED WORK`, large editorial heading, then an interactive project index rather than four cards.
- **Desktop.** Row per project: left project number, middle title, right descriptor / stack / year. Hover or focus expands the row, swaps a preview image, raises metadata contrast.
- **Mobile.** Clean vertical sequence: number, title, one-line descriptor, year/status, optional thumbnail. Tap navigates. **No hover-dependent previews** (§40).
- **Components.** `ProjectIndex.astro`, `ProjectRow.astro`, `ProjectMeta.astro`.
- **Responsive.** Genuine recomposition. Desktop is a three-column row with a shared preview region; mobile is a stacked list with no preview region at all.
- **Interaction.** Hover and focus must be equivalent (§13). Preview swap is an enhancement.
- **Static fallback.** A plain accessible list of four links. Every row is an `<a>`, so it works with JS disabled.
- **Risk.** "Infinite Menu" ambiguity. See Interaction Review; my recommendation is to implement the enhanced index the spec describes rather than importing a WebGL component.

## 4. Flagship composition (XAI Chess Engine)

**SPEC** §14.

- Large `01`, title `XAI CHESS ENGINE`, thesis `TEACHING A CHESS ENGINE TO EXPLAIN ITSELF.`, a 7-8 column UI image, metadata in the remainder, then architecture diagram plus explanation screenshot plus saliency below.
- **Risk, high:** this composition is built around "a large chess UI image" that **does not currently exist**. See Content / Asset Gaps.

## 5. Experience

**SPEC** §17, §41.

- **Composition.** `02 / EXPERIENCE`. Admrls visually dominant; CrftHQ and Sundaram Finance as compact editorial rows.
- **Desktop.** Admrls: left company, role, dates; right large intro statement; below, highlights; then stack. Should occupy substantially more vertical space than the other two.
- **Mobile.** Admrls first with company, role, date, intro, 3-4 strongest highlights, stack. Others compact but fully readable.
- **Components.** `ExperienceFeature.astro` (Admrls), `ExperienceRow.astro`, `ExperienceMeta.astro`.
- **Static fallback.** §17 permits expand/collapse but requires default content remain discoverable. **SUGGESTION:** use `<details open>` on mobile, or no disclosure at all. Collapsing highlights hides the evidence that the section exists to provide.
- **Risk.** Admrls has six highlights; mobile spec says 3-4. The selection must be made deliberately rather than by truncation. Content decision, flagged.

## 6. Engineering Profile

**SPEC** §18.

- **Composition.** `03 / ENGINEERING PROFILE`, headline `I LIKE BUILDING SYSTEMS THAT ACTUALLY MAKE SENSE.`, asymmetric columns, four numbered principles (Understanding, Systems, AI Engineering, Building), then the editorial statement as a full-width break.
- **Desktop.** Large copy one side, four principles the other or below. Each principle: mono number, short heading, short paragraph.
- **Mobile.** Single column; principles become a numbered vertical sequence.
- **Interaction.** The editorial statement is "one of the largest type moments on the page" (§18). Static. **SUGGESTION:** resist animating it; §69 warns against decorative theatre and the statement is strong enough set still.
- **Risk.** At `clamp(3rem, 7vw, 8rem)`, "I DON'T JUST LOOK FOR THINGS TO BUILD." will break awkwardly between 360px and 430px. Needs manual line-break control (`<br>` at defined breakpoints or `text-wrap: balance` plus testing), not automatic wrapping.

## 7. About

**SPEC** §19.

- **Composition.** `04 / ABOUT`, intentionally smaller. Left large `ABOUT`, right short personal copy, below small metadata: `BASED IN / CHENNAI`, `FOCUS / AI + BACKEND`, `CURRENTLY / BUILDING`.
- **Mobile.** Stacked; metadata becomes a two-column mono grid.
- **Risk.** Low. This section's main risk is growing into a biography, which §19 explicitly forbids.

## 8. Currently Building

**SPEC** §20.

- **Composition.** `05 / CURRENTLY BUILDING`, heading `WHAT HAPPENS WHEN GENERATIVE AI HAS TO OBEY PHYSICS?`, large GeoCounterfactual visual, side panel with status, current phase, stack, next milestone.
- **Optional.** `DATA -> MODEL -> CRITIC -> VALIDATION` sequence, but **no percentage progress** (§20) and no progress bars (§49, §58).
- **Desktop.** Visual dominant, side panel narrow.
- **Mobile.** Heading, visual, then panel as a metadata list.
- **Risk.** Honesty framing. §11 and §15 require that the generative model is not presented as trained or production-ready. The "in progress" treatment must be subtle (§20: not a bright status badge) while remaining unambiguous. This is the section where an over-polished visual would actively misrepresent the work.

## 9. Education

**SPEC** §21.

- Large `VIT CHENNAI`, smaller `B.TECH / COMPUTER SCIENCE AND ENGINEERING (AI & ML)`, metadata `2027` and `CGPA 8.30`. No school history, no timeline.
- Identical composition at all breakpoints; only type scale changes. The one section that is pure scaling.
- **Risk.** None.

## 10. Contact

**SPEC** §22, §48, `MASTER_CONTENT.md` §18.

- **Composition.** Large `HAVE SOMETHING WORTH BUILDING?`, supporting copy, large email link, then GitHub / LinkedIn / Resume.
- **Desktop.** Left CTA and links, right form.
- **Mobile.** CTA, email, links, form, in that order.
- **Inputs.** Label above field, thin underline or border, generous spacing, strong focus, clear error state, rectangular submit. No placeholder-only labels, no pill inputs.
- **Static fallback.** Native form POST to `/api/contact`, which returns a server-rendered confirmation. The island upgrades to inline states.
- **Risk.** The five required states are where forms usually ship incomplete. Test all five in Playwright, including server error, which requires a forced failure path.

## 11. Footer

**SPEC** §23. Left `GAUTHAM BALAJI`, middle `CHENNAI, INDIA`, right `GITHUB / LINKEDIN / EMAIL`, bottom copyright. Thin rules. Mobile stacks to a single column. Copyright year computed at build time, not hardcoded (the old site still says 2025).

## 12. 404

**SPEC** `MASTER_CONTENT.md` §20. `404`, "This page doesn't exist.", "You can go back to the work.", CTA `BACK TO HOME`.

Uses the full site layout including nav and footer, so a lost visitor can still navigate. **SUGGESTION:** also link the four projects directly; a 404 is usually a stale project URL, and offering the real ones recovers the visit.

## 13. Mobile sticky CTA

**SPEC** §24, §42. `LET'S TALK` at viewport bottom, appears during browsing, hides when the contact section enters view, respects safe-area inset, 44px minimum, must not obscure inputs, submit, or footer. §24 marks it optional if mobile feels crowded.

**SUGGESTION:** build it last, after mobile composition is settled, and keep it only if the page does not already feel dense. Implement with `IntersectionObserver` on the contact section, `env(safe-area-inset-bottom)` padding, and `prefers-reduced-motion` disabling the transition.

---

# Interaction Review

`DESIGN_SYSTEM.md` §32 sets the budget explicitly: **a maximum of two expensive visual effects across the entire site**, preferring Text Pressure and the project interaction. §32 also states that if the project interaction proves expensive, that is not a licence to add a different major effect. The classifications below work within that budget rather than around it.

| Effect | Verdict | Reasoning |
|---|---|---|
| **Text Pressure** | **KEEP** | §12 names it preferred effect #1. Constraints are already specified: subtle, readable, no layout shift, static for keyboard and touch, disabled for reduced motion. Implementable in roughly 60 lines against a variable font's `wdth`/`wght` axes with a pointer listener, no library, no canvas. §12 explicitly forbids making the name depend on canvas rendering. Cost: near zero once the font is loaded. |
| **Infinite Project Menu** | **KEEP WITH CAUTION** | §13 names it preferred #2 but qualifies it twice: "if implementation remains accessible" and "it should behave like an enhanced list, not a replacement for normal links". The widely circulated component of this name is a WebGL sphere of tiles, which conflicts with §31 (no decorative WebGL), §40 (mobile must avoid hover-dependent previews), and §13's own "enhanced list" requirement. **Recommendation: implement the enhanced project index §13 actually describes** (row expansion, preview swap, metadata emphasis, hover and focus equivalent) and do not import the WebGL component. This satisfies the spec's intent, keeps the second budget slot, and costs no runtime dependency. |
| **Decrypted Text** | **KEEP** | §26 permits it for small section metadata, status labels, route labels, contact metadata, and forbids it on headings and body. Brief animation, final text rendered immediately under reduced motion. Cheap and on-concept. Enforce the restriction in code: the component should accept only short strings and be used only inside `TechnicalLabel`. |
| **Motion Primitives** | **KEEP** | §27 permits selective use for section entry, image reveal, project transitions, small hover states. §27 also forbids continuous scroll animation, floating objects, excessive parallax, scroll hijacking, and states motion must never delay content visibility. **SUGGESTION:** implement reveals with CSS `@starting-style` and `animation-timeline: view()` where supported, falling back to no animation, rather than adding Framer Motion. Saves roughly 40 KB of JS and makes §35 compliance automatic, since CSS reveals cannot hide content when JS is off. |
| **Magnetic Lines** | **CUT** | §28 already says "If it does not clearly improve the design, cut it." It is defined only as a "visual bridge between project or CTA regions", which is a problem the composition may not have. Adding it would spend budget on decoration in a system whose first visual principle is that typography carries the identity. Reconsider only if a specific composition gap appears in Phase 8. |
| **Particle Typography** | **CUT** | §29 restricts it heavily: not a background, not if it adds significant performance cost, must not compete with project content. It would be the third expensive effect, exceeding the §32 budget. The budget is better spent on Text Pressure and the project index. |
| **GeoCounterfactual visual interaction** | **KEEP WITH CAUTION** | §31 makes a specific exception: "GeoCounterfactual may display an actual 3D globe because it is relevant to that project." §53 permits raster imagery, map overlays, coordinate labels, XAI overlays, terminal-style logs, satellite comparison. The strongest and cheapest version is a **before/after comparison slider**, which is pure CSS plus a range input, fully keyboard operable, and communicates the project better than a globe. **SUGGESTION:** ship the comparison slider first; treat the globe as optional, route-scoped, lazy-loaded, and only if real imagery exists to put on it. |
| **Localised WebGL** | **OPTIONAL, default no** | §31 sets the conditions: localised, static fallback, non-blocking, lazy-loaded, reduced-motion aware, no mobile performance harm. Only the GeoCounterfactual globe currently qualifies, and only on `/projects/geocounterfactual`. Never on the homepage. |
| **Lanyard** | **CUT** | §30 already decided this: "Default decision: do not use." Listed here only for completeness. |
| **Custom cursor** | **CUT** | §44 already decided this. |
| **Page transitions** | **OPTIONAL** | §46 permits them if short, lightweight, no blank screen, no content delay, reduced-motion safe. Astro's `<ClientRouter />` satisfies all of these with a `view-transition-name` on the project title, which makes index-to-detail navigation feel continuous. Cheap. **SUGGESTION:** add in Phase 7, cut immediately if it causes any flash. |

**Net effect budget: two.** Text Pressure (hero) and the enhanced project index (Selected Work). Everything else is either CSS-level or cut.

---

# Project Page Strategy

## Shared architecture

All four routes render from `ProjectLayout.astro` via `pages/projects/[...slug].astro`.

**SPEC** §16 defines the common skeleton:

```
Project number / status / year          (mono, thin rule under)
Large project title
Thesis statement
Large hero visual

Metadata rail: Role · Year · Status · Stack · Links

01  Thesis
02  Problem
03  Approach
04  Architecture            <- figure
05  Technical decisions
06  Implementation details
07  Results / observations
08  Limitations
09  What I learned
10  Future work

ProjectNext (prev / next project)
Contact CTA
```

§16 warns: "Do not make every section a generic card." Sections are separated by rules and spacing, not by boxes.

## What is common

- Layout skeleton, metadata rail, type scale, figure component, section rhythm
- `ProjectNext` navigation, so the four pages read as a sequence rather than dead ends
- Figure numbering (`FIG. 01`), captions, and diagram style per §52
- SEO and OG image generation
- Breadcrumb back to `/#work`

## What is custom per project

**SPEC** §14, §15, §37, §53, §54, §55, §56.

| Project | Visual anchor | Custom treatment | Spec |
|---|---|---|---|
| **XAI Chess** | Wide chess UI screenshot | Board geometry, coordinate labels, move lines, saliency overlay, evaluation values. Not a chess-themed gaming site; the board is evidence. | §37, §54 |
| **Legal NLP** | Knowledge graph | Split layout: large graph left, pipeline and explanation right. Graph nodes, citation edges, document excerpts, highlighted entities. **No gavels, scales, courtroom or law-book imagery.** | §15, §55 |
| **VERA** | Architecture / flow diagram | Flow-oriented: Caller -> Twilio -> VERA -> Gemini -> tools/RAG -> voice. Architecture leads **because there is no public deployment**. No fake waveforms, no fake call telemetry. | §15, §56 |
| **GeoCounterfactual** | Before/after satellite comparison | Cinematic. May break the standard layout because the work is spatial. Raster imagery, map overlays, coordinate labels, XAI overlays, terminal logs. No sci-fi HUD, no neon, no fake NASA styling. | §15, §53 |

## How technical depth is presented

The depth is already written in `MASTER_CONTENT.md` and should be used at full specificity. Ridge weights, CNN layer stack, 8x8x12 board planes, D8 routing, the multi-year water-persistence rule, LangGraph node sequence: these are the evidence. §03 requires mechanisms over adjectives.

**SUGGESTION:** render numeric parameter sets (ridge weights, CNN architecture, benchmark tables) as monospace definition tables rather than prose. It suits the engineering-documentation concept, scans faster, and is where §50's mono metadata treatment earns its place.

## How limitations are presented

This is where the site earns trust, and the spec is unusually firm about it.

- **Chess:** Pearson correlation 0.506, never "50.6% accuracy" (§23). Explanations come from `explain_move()` checkable conditions, **not** from the neural model (§08).
- **Legal NLP:** benchmarks usable with context (§23).
- **VERA:** hackathon prototype, not publicly deployed, no invented latency numbers (§10, §23).
- **GeoCounterfactual:** fine-tuning incomplete, SSIM guard weak because of hard compositing, 146-195s not framed as an achievement (§11, §23).

**Recommendation:** give Limitations the same type treatment as every other section. Do not shrink it, do not put it in a muted box, do not move it to the end as a footnote. A project page that states its own weak SSIM guard is more convincing than one that does not, and it is the clearest available signal of engineering judgement.

## Project navigation

`ProjectNext` cycles 01 -> 02 -> 03 -> 04 -> 01 using the collection `order` field. Rendered as two rows (previous, next) with number, title, and descriptor. Plain links, keyboard operable, works without JS.

---

# Responsive Strategy

**SPEC** §38, §64. Eight QA viewports.

| Width | Grid | Notes |
|---|---|---|
| 360px | 4 col | Tightest case. Display type at `clamp` floor. Verify no overflow. |
| 390px | 4 col | Most common phone. Primary mobile design target. |
| 430px | 4 col | Large phone. |
| 768px | 8 col | Tablet portrait. Nav still collapsed (see recommendation). |
| 1024px | 8 -> 12 col | Nav expands. First two-column compositions appear. |
| 1280px | 12 col | Primary desktop target. Hero CTA above fold is tightest here. |
| 1440px | 12 col | Design reference width. |
| 1920px | 12 col | Container caps at 1440-1600px; outer margins grow (§06). |

## Sections needing genuine recomposition, not scaling

These four change structure, not just size. Plan them as separate compositions.

1. **Hero.** Desktop is a two-column grid with the portrait right. Mobile reorders so the portrait falls *after* the CTAs (§39). The element order in the visual sequence changes, which means DOM order plus `order` overrides, verified for tab-order sanity.

2. **Selected Work index.** Desktop is a three-column row with a shared preview region driven by hover and focus. Mobile drops the preview region entirely and becomes a stacked list (§40). The preview is not shrunk; it is removed.

3. **Experience (Admrls).** Desktop is left metadata / right intro with highlights below. Mobile is a single flow, and §41 reduces to the 3-4 strongest highlights. Content differs between breakpoints, which is a content decision, not CSS.

4. **Contact.** Desktop places CTA and links left, form right. Mobile serialises to CTA, email, links, form (§22). Plus the sticky CTA, which exists only on mobile.

Everything else (Engineering Profile, About, Currently Building, Education, Footer, 404) reflows within one composition.

## Cross-cutting rules

- Minimum 16px side gutter at every width, set once on one wrapper (the old site hit 0px).
- Root font-size stays 16px at all breakpoints. Display sizes use `clamp()`; body does not shrink.
- Form controls minimum 16px to prevent iOS focus zoom.
- All interactive targets minimum 44px (§33).
- No horizontal overflow at any width. Assert in Playwright, do not mask with `overflow-x: hidden`.
- Test at 200% zoom (§62 item 8), which is distinct from testing at narrow widths.

---

# Accessibility & Performance

## Accessibility rules (binding)

From §33 and the §62 ten-question checklist, which every interactive component must pass before merge:

1. Operable by keyboard
2. Understandable without animation
3. Visible focus
4. Semantic HTML fallback
5. Reduced motion disables unnecessary movement
6. Screen reader output makes sense
7. Hit area at least 44px
8. Works at 200% zoom
9. Colour contrast sufficient
10. Works if JavaScript fails

Plus: skip link, landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, correct heading order, labelled form fields, announced errors, meaningful alt text, no colour-only information, links that work without JS.

**Non-negotiable implementation rules:**

- One focus-visible token defined once in `global.css`, applied globally. Never `outline: none` without a stronger replacement.
- Alt text describes what the figure demonstrates, not what it is. "Saliency overlay showing the engine weighting the e4 and d4 squares most heavily" beats "saliency map".
- Decorative layers get `aria-hidden="true"`.

## Contrast: finding and correction

**GAP, BLOCKER for Phase 2.** §33 mandates contrast verification. I ran it against the §03 palette.

| Pair | Assigned use | Ratio | Required | Result |
|---|---|---:|---:|---|
| Ink `#121212` on Paper `#E8E4DC` | Body text | 14.77:1 | 4.5:1 | PASS (AAA) |
| Ink on Soft Paper `#DCD7CD` | Body text | 13.06:1 | 4.5:1 | PASS |
| Paper on Ink | Inverted button label | 14.77:1 | 4.5:1 | PASS |
| **Graphite `#74736E` on Paper** | **Metadata, secondary text** | **3.75:1** | 4.5:1 | **FAIL** |
| **Graphite on Soft Paper** | Metadata on panels | **3.31:1** | 4.5:1 | **FAIL** |
| **Oxide `#B85C38` on Paper** | **Active nav, highlights** | **3.58:1** | 4.5:1 | **FAIL** |
| **Oxide on Soft Paper** | Accent on panels | **3.17:1** | 4.5:1 | **FAIL** |
| Oxide on Ink | Accent on dark blocks | 4.13:1 | 4.5:1 | **FAIL** |
| Graphite on Ink | Muted on dark blocks | 3.94:1 | 4.5:1 | **FAIL** |
| Oxide on Paper | Large display type | 3.58:1 | 3:1 | PASS |
| Graphite on Paper | Large display type | 3.75:1 | 3:1 | PASS |
| Oxide on Paper | Focus ring, borders | 3.58:1 | 3:1 | PASS |

The conflict is structural, not cosmetic: §03 assigns Graphite to "metadata, secondary text" and §05 sets technical metadata at **0.7rem to 0.85rem** (11.2px to 13.6px). That is small text, requiring 4.5:1. Graphite delivers 3.75:1 on Paper and 3.31:1 on Soft Paper. Oxide is assigned to "active navigation", also small text, at 3.58:1.

Ink on Paper is excellent, so the palette's foundation is sound. The two secondary roles are the problem.

**SUGGESTION, two options:**

**Option A: darken the two tokens.** Minimal hue-preserving shifts that clear 4.5:1 on both Paper and Soft Paper:

| Token | Current | Proposed | On Paper | On Soft Paper |
|---|---|---|---:|---:|
| Graphite | `#74736E` | **`#5F5E5A`** | 5.10:1 | 4.51:1 |
| Oxide | `#B85C38` | **`#934A2D`** | 5.09:1 | 4.51:1 |

Both stay in the same hue family (18% and 20% darker respectively). Oxide remains a recognisable oxide red.

**Option B: keep the colours, restrict their roles.** Use Graphite and Oxide only for large display type, rules, borders and focus rings, all of which pass at 3:1. Move all small metadata to Ink, differentiating it by size, weight and letter-spacing instead of colour.

**My recommendation: both.** Adopt Option A's values as the text-safe tokens, and keep the original `#74736E` and `#B85C38` as `--color-graphite-rule` and `--color-oxide-rule` for non-text use, where their lighter value is an advantage. Four tokens instead of two, each contrast-correct for its role. This preserves the intended look while satisfying §33.

This is your decision, not mine. The palette is SPEC.

## Performance rules (binding)

From §59 and §63: Astro static-first, React islands only where needed, minimal JS, image optimisation, responsive images, modern formats, lazy loading, no render-blocking decorative effects, no unnecessary dependencies, no icon fonts, no duplicate libraries.

**SUGGESTION: enforce with budgets in CI**, so regressions fail the build rather than being noticed later.

| Metric | Budget | Old site |
|---|---:|---:|
| Total page weight (home) | 1.2 MB | 3,792 KB |
| Largest single image | 250 KB | 2,591 KB |
| JS shipped on home | 60 KB | 118.7 KB (three.js alone) |
| Third-party requests | 0 | 3 |
| LCP (mobile, throttled) | under 2.0s | not measured |
| CLS | under 0.02 | unmeasured, images had no dimensions |
| Lighthouse a11y | 100 | would fail |

Zero third-party requests is achievable: self-hosted fonts, inlined SVG icons, no analytics unless you choose to add it.

---

# Content / Asset Gaps

Nothing below is invented. These are items the specs require that do not currently exist.

## BLOCKERS

| # | Gap | Affects | Detail |
|---|---|---|---|
| 1 | **No chess UI screenshot** | Flagship composition §14 | §08 lists it as preferred media #1. The entire flagship layout is built around "a large chess UI image spanning 7-8 columns". `chess-bot/static/` contains only ML charts. The repo has `templates/` and `static/`, so the UI exists and can be run and captured. |
| 2 | **Legal NLP repo has no code** | Credibility, `github` link | 5 KB, README only. README claims benchmarks the repo cannot evidence. Either push the code or omit the link. |
| 3 | **VERA has no repository** | `github` link, project page | Confirmed zero results. §10 forbids a fake live URL; the same logic applies to a repo link. |
| 4 | **No resume PDF** | Hero secondary CTA, contact, nav | §01 and §06 both require a downloadable resume. No file exists anywhere in the repo. |
| 5 | **Missing `status`/`year`/`role`** | Zod build validation | Legal NLP missing all three; VERA and GeoCounterfactual missing year and role. Will fail the build by design. |
| 6 | **No typeface decision** | All of Phase 2 | §04 defines three roles but names no fonts. Blocks the token layer. |

## HIGH PRIORITY

| # | Gap | Detail |
|---|---|---|
| 7 | Chess architecture diagram | §52-compliant version. `architecture_breakdown.png` exists but was drawn for the repo; likely needs redrawing in Ink/Paper/Graphite with mono labels. |
| 8 | Chess move-explanation screenshot | §08 preferred media #3. |
| 9 | Chess saliency visualisation | §08 #4, §37 secondary image, §54. |
| 10 | Legal NLP knowledge graph screenshot | §15 and §55: "the graph itself is the visual identity". Without it, the project has no visual anchor. |
| 11 | Legal NLP pipeline diagram | §09. |
| 12 | VERA architecture / flow visual | §15 and §37: architecture leads *because* there is no deployment. Without it the page has nothing. |
| 13 | GeoCounterfactual before/after pair | §15 and §37. §11 names the Kadapa "build 3 check-dams" run as the best demo. |
| 14 | GeoCounterfactual critic loop, XAI overlay, simulator screenshot | §26 asset requirements. |
| 15 | Favicon set | §27, and the old site 404s on `/favicon.ico`. |
| 16 | OG / social preview image | §27. |
| 17 | Portrait decision | Existing file is a formal studio headshot; §11 asks for an editorial crop. Reuse, recrop, or reshoot. |

## OBSERVATIONS (no action needed unless you disagree)

- **Phone number.** `MASTER_CONTENT.md` §01 lists `+91 9080302593` under "Public contact", but `DESIGN_SYSTEM.md` §22 (contact actions: Email, LinkedIn, GitHub, Resume) and §23 (footer: GitHub, LinkedIn, Email) both omit it. I am treating the design spec as settling this: **phone not published on the site.** It can still appear on the resume PDF.
- **Instagram.** Dropped. §01 confirms only GitHub and LinkedIn.
- **Legal NLP benchmarks.** §23 authorises them "with context". I will present them with the dataset caveat (§09 notes data includes synthetic and custom judgments alongside Indian Kanoon scraping), not as bare numbers.
- **Cookie banner.** No analytics are specified. With self-hosted fonts and no third-party scripts, no banner is required. If you add analytics later, Vercel Analytics sets no cookies and keeps it that way; Google Analytics does not.

## CONTENT THAT IS READY TO IMPLEMENT NOW

Substantial and complete, requiring no further input: hero copy, positioning, all navigation labels, Engineering Profile (headline, main copy, four principles, editorial statement), About draft, Currently Building copy and honest-status statement, Education (complete), Skills (four categories, 22 items), Contact CTA and supporting copy, footer, 404 copy, all four project theses and positioning lines, full chess technical detail, full GeoCounterfactual technical detail, all three experience entries with highlights, and every factual guardrail.

This is roughly 80% of the site's text. The gaps are images, three metadata fields, and two repository decisions.

---

# Risk Register

| # | Risk | Why it matters | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | **Asset gaps block the flagship** | §14's composition assumes a large chess UI image that does not exist. Phase 4 cannot complete without it. | **High** | **High** | Start capture now, in parallel with Phase 1. Run `chess-bot` locally, capture the board, explanation panel, and saliency view. Treat as Phase 0 work, not Phase 4. |
| R2 | **Empty Legal NLP repo undermines credibility** | The site is built to make a technical reader trust the work. A linked repo with no code does the opposite, and its README quotes benchmarks it cannot evidence. | **High** | **High** | Decide before Phase 4: push the code, or omit the `github` field for that project. Schema already allows omission. |
| R3 | **Contrast failures ship again** | Graphite and Oxide fail AA at the sizes assigned to them. This is the old site's exact failure, now encoded in the spec. | **High** if unaddressed | **High** | Resolve the token question before Phase 2. Add an automated contrast assertion to CI so it cannot regress. |
| R4 | **Effect scope creep** | Eight candidate effects against a budget of two (§32). Each addition costs performance, accessibility surface, and the restraint the concept depends on. | Medium | **High** | Treat §32 as a hard cap. Text Pressure plus enhanced project index. Any addition must displace one, not extend the list. |
| R5 | **Hero CTA falls below the fold** | §11 requires it above the fold; §06's hero stacks six elements before it. At 1280x800 the usable viewport is roughly 700px. | Medium | Medium | Playwright assertion on CTA Y-position at 1280x800 and 1440x900, added in Phase 3 and run on every build. |
| R6 | **Mobile recomposition treated as reflow** | Four sections need genuinely different compositions (§38: "do not simply scale down desktop"). Building desktop-first and shrinking produces the old site's mobile experience. | Medium | **High** | Build hero, project index, experience and contact as explicit mobile compositions in Phase 3, before desktop polish. |
| R7 | **Island boundaries leak content** | If an island renders content rather than enhancing it, §35 breaks silently and only shows up with JS disabled. | Medium | **High** | Enforce the rule that no island is the sole source of content. `no-js.spec.ts` in CI catches violations. |
| R8 | **Contact form ships incomplete** | Five states required (§18). Server-error and rate-limit paths are the ones usually skipped. "Do not ship an inert form" is explicit. | Medium | **High** | Move contact to Phase 6 as planned but build the endpoint first, UI second. Test all five states including a forced failure. |
| R9 | **Factual drift during copywriting** | §23 sets precise boundaries (Pearson not accuracy; SSIM guard weak; fine-tuning incomplete; no invented latency). Tightening copy for rhythm is exactly when these erode. | Medium | **High** | Keep §23 open while writing. Add a review pass before launch that checks each guardrail against rendered output. |
| R10 | **Three spec files drift apart** | The combined file duplicates both authoritative ones. A future edit to one will not propagate. | Medium | Medium | Delete or archive the combined file after moving its two unique passages into `MASTER_CONTENT.md`. |
| R11 | **Overengineering the build** | The temptation on a greenfield project is a CMS, a component library, an animation framework, and a design-token pipeline for a six-section site. | Medium | Medium | Dependency rule: nothing enters `package.json` without a named requirement from the specs. Target under 12 production dependencies. |
| R12 | **Asset weight regression** | §59 names the old site's 2.6 MB portrait explicitly. Screenshots of dense UIs (graphs, satellite imagery) compress poorly and will be large. | Medium | Medium | CI budgets (250 KB per image, 1.2 MB per page). AVIF with WebP fallback. Crop rather than shrink. |
| R13 | **Repo name mismatch on the flagship** | `chess-bot` / "Lightweight Interactive Chess Engine" reads as a smaller project than "XAI Chess Engine". The flagship's outbound link undersells it. | **High** | Low | Rename the repo and rewrite its description and README intro. Cheap, high leverage. |
| R14 | **Text Pressure without a variable font** | If the chosen display face lacks a `wdth` axis, the effect degrades to transform-based scaling, causing the layout shift §12 forbids. | Medium | Medium | Make a `wdth` axis a requirement of the typeface decision, not an afterthought. |
| R15 | **SEO under-delivery** | The site's main channel is a link pasted into LinkedIn. Without OG images it renders as a bare URL. | Low | Medium | Build-time OG generation in Phase 8. Verify with a link-preview debugger before launch. |

---

# Proposed Implementation Phases

Your Phase 0 to 10 ordering is sound. I recommend **two changes**, both driven by findings above.

**Change 1: asset capture runs as a parallel track starting immediately.** R1 makes this the critical path. The flagship composition cannot be built without a chess UI screenshot, and capturing it depends on you running the project, not on any code I write. Blocking it until Phase 4 stalls the most important section of the site.

**Change 2: split the contact work.** Build the endpoint in Phase 1 (it is isolated, testable, and has no design dependency) and the form UI in Phase 6. This de-risks R8 by removing the backend from the compressed end of the schedule, and it means the form UI is built against an endpoint that already works.

| Phase | Scope | Exit criteria | Blocked by |
|---|---|---|---|
| **0** | **Decisions and reconnaissance.** Answer the questions below. Resolve fonts, contrast tokens, repo decisions, contact backend. | All Phase-0 questions answered. | This document |
| **0-P** | **Asset track (parallel, starts now).** Run `chess-bot`, capture UI / explanation / saliency. Capture Legal NLP graph and pipeline. Capture GeoCounterfactual Kadapa run, before/after, critic loop, XAI overlay. Export portrait. Produce resume PDF. | Media exists for all four projects. | You |
| **1** | **Foundation.** Astro + TS strict + Tailwind 4 + React. `.gitignore`, ESLint, Prettier, Vitest, Playwright, Lighthouse CI. `/api/contact` endpoint with Zod, honeypot, rate limit, Resend. Deploy skeleton to Vercel. | `astro check` clean, CI green, endpoint verified to deliver mail. | Phase 0 (contact decision) |
| **2** | **Tokens and typography.** Colour tokens (contrast-corrected), self-hosted fonts, type scale, spacing scale, grid, rules, base elements, global focus ring. Contrast assertion in CI. | Token layer complete, contrast test passes. | Phase 0 (fonts, contrast) |
| **3** | **Static shell, mobile-first.** Nav (desktop + mobile `<details>`), skip link, `Section`, `PageContainer`, hero, footer, 404. **Mobile compositions built first** (R6). | Renders at all 8 viewports. Hero CTA above fold at 1280x800. Zero JS. | Phase 2 |
| **4** | **Projects.** Content collections + Zod. Project index (static). `ProjectLayout`, four detail routes, figure component, `ProjectNext`. Flagship composition. | Four routes render. Build fails on invalid content. | Phase 0-P (screenshots), Phase 0 (metadata) |
| **5** | **Remaining sections.** Experience (Admrls feature + two rows), Engineering Profile, About, Currently Building, Education. | Homepage complete and static. | Phase 3 |
| **6** | **Contact UI.** `ContactCTA`, `ContactForm` island, five states, accessible errors. Mobile sticky CTA (keep only if mobile is not crowded). | All five states tested, including forced server error. | Phase 1 |
| **7** | **Interaction.** Text Pressure. Enhanced project index (hover + focus parity, preview swap). Decrypted Text on metadata. CSS motion reveals. Optional view transitions. | Effects work; reduced-motion and no-JS suites still pass. | Phase 5 |
| **8** | **SEO.** Meta component, canonicals, OG generation, sitemap, robots, JSON-LD Person, favicon set. | Link preview verified on a real debugger. | Phase 0-P (OG image) |
| **9** | **Polish.** Spacing, type refinement, image treatment, hover states, 200% zoom, safe-area insets, all 8 viewports. | Visual QA at every viewport. | Phase 7 |
| **10** | **Audit and launch.** axe across all routes, keyboard traversal, reduced motion, JS disabled, Lighthouse budgets, factual guardrail review against §23, throttled mobile test. Cut over Vercel. | All budgets met, guardrails verified. | Phase 9 |

Note that Phases 1 and 0-P run concurrently, as do 2 and 0-P. The asset track is the long pole and should never be waiting on me.

---

# Recommended Changes

All **SUGGESTION**. The specs remain authoritative; none of these is assumed.

## Design

| # | Change | Reason |
|---|---|---|
| D1 | **Add contrast-corrected Graphite and Oxide tokens** (`#5F5E5A`, `#934A2D`), keeping the originals for rules and borders. | §33 mandates contrast verification; current values fail AA at the sizes §03 and §05 assign them. The highest-priority design change. |
| D2 | **Interpret "Infinite Menu" as the enhanced index §13 describes**, not the WebGL component of that name. | §13 requires "enhanced list, not a replacement for normal links"; §31 forbids decorative WebGL; §40 forbids hover-dependent mobile previews. The literal component conflicts with all three. |
| D3 | **Choose a display face with a `wdth` axis** (Archivo Variable recommended). | §12's "no layout shift" requirement is only satisfiable if Text Pressure animates font axes rather than transforms. |
| D4 | **Use CSS-native scroll animations instead of an animation library.** | Saves roughly 40 KB, and makes §35 compliance structural rather than tested: CSS reveals cannot hide content when JS is off. |
| D5 | **Switch to the mobile nav at 1024px, not 768px.** | Four links plus wordmark plus resume is cramped at 768px; the old site's nav technically fitted while having 28px targets. |
| D6 | **Ship the GeoCounterfactual before/after comparison slider first; treat the 3D globe as optional.** | The slider communicates the project better, is keyboard operable, and costs nothing. §31 permits the globe but does not require it. |
| D7 | **Do not animate the editorial statement.** | §69 warns against decorative theatre. At `clamp(3rem, 7vw, 8rem)` the statement is the largest type moment on the page; motion would weaken it. |
| D8 | **Add build-time OG images per route.** | The site's main distribution channel is a pasted link. |
| D9 | **Link the four projects from the 404 page.** | A 404 is usually a stale project URL; offering the real ones recovers the visit. |

## Content

| # | Change | Reason |
|---|---|---|
| C1 | **Rename `chess-bot` to something matching "XAI Chess Engine"** and rewrite its description and README intro. | R13. The flagship's outbound link currently undersells it and hides the explainability work entirely. |
| C2 | **Resolve the Legal NLP repo: push the code, or drop the `github` link.** | R2. A linked empty repo whose README claims benchmarks is worse than no link. |
| C3 | **Rewrite the Legal NLP README to match the site's voice rules.** | It opens with emoji markers and uses "sophisticated", both banned by §03. The repo is part of the same impression. |
| C4 | **Supply `status`, `year`, `role` for Legal NLP, VERA, GeoCounterfactual.** | Required by §22; the build will reject without them. |
| C5 | **Choose the 3-4 strongest Admrls highlights for mobile deliberately.** | §41 caps mobile at 3-4; Admrls has six. Truncating by order rather than by strength wastes the strongest experience entry. |
| C6 | **Migrate "Core areas" and "Final positioning" into `MASTER_CONTENT.md`, then delete the combined file.** | R10. They exist only in the non-authoritative third file and will otherwise be lost or drift. |
| C7 | **Review `accuracy_metrics.png` and `performance_comparison.png` before use.** | §23 forbids calling the CNN result accuracy. Charts labelled "accuracy" would contradict the site's own stated boundary. |
| C8 | **Consider whether the existing portrait suits the editorial direction.** | §11 asks for an editorial crop; the current file is a formal studio headshot. Not a defect, an art-direction call. |

---

# Questions Requiring My Input

Only decisions that cannot be answered from the repository or the two specifications.

## Blocking Phase 1 and 2

**Q1. Typefaces.** §04 defines three roles but names no faces. My recommendation is **Archivo Variable** (display, for its `wdth` axis, which Text Pressure needs), **IBM Plex Sans** (body), **IBM Plex Mono** (technical). Accept, or name your own?

**Q2. Contrast correction.** Graphite and Oxide fail AA at the sizes §03 and §05 assign them. Do you want:
- (a) the darkened values `#5F5E5A` and `#934A2D`,
- (b) keep the originals and restrict them to large type, rules and borders only,
- (c) my recommended hybrid, four tokens split by role, or
- (d) something else?

**Q3. Contact backend.** Resend for delivery is my recommendation. For rate limiting, §18 requires it but serverless needs external state:
- (a) Upstash Redis, free tier, proper rate limiting, one dependency,
- (b) Cloudflare Turnstile, no state, adds a third-party script (breaks the zero-third-party-request budget),
- (c) honeypot plus timing check only, no dependency, weaker.

Also: which inbox should submissions go to, `gautham.balajis@gmail.com` or another?

## Blocking Phase 4

**Q4. Legal NLP repository.** It contains no code. Push it, link it anyway, or omit the `github` field for that project?

**Q5. VERA links.** No repository exists and there is no public deployment. Ship the project page with no outbound links, or is there a private repo or demo recording that could be made available?

**Q6. Missing project metadata.** I will not infer these from repo creation dates:

| Project | Need |
|---|---|
| Legal NLP KG | status, year, role |
| VERA | year, role |
| GeoCounterfactual | year, role |

**Q7. Chess repository naming.** Rename `chess-bot` and update its description to match "XAI Chess Engine"? Cheap and high-leverage, but it is your repo and renaming changes its URL.

## Blocking Phase 8 and 10

**Q8. Deployment target.** Overwrite the existing Vercel project so `gautham-balaji.vercel.app` serves the new site, or create a new project and switch later? Also: is a custom domain planned, since it affects canonical URLs and OG absolute paths?

**Q9. Analytics.** None specified. Add Vercel Analytics (no cookies, no banner needed), something else, or nothing?

## Housekeeping

**Q10. The third spec file.** `gautham_portfolio_master_content_design.md` duplicates both authoritative documents and holds two passages the others dropped ("Core areas", "Final personal positioning"). Move those two into `MASTER_CONTENT.md` and delete it, or keep it as an archive?

---

## Summary of what I need to start

To begin Phase 1 immediately: **Q1, Q2, Q3.**

To keep Phase 4 unblocked: **Q4, Q5, Q6**, plus the asset track (0-P), starting with the chess UI screenshots, which are the single highest-value missing item in the entire rebuild.

Everything else can be answered later without stalling work.

---

*Analysis only. No repository files were modified and no dependencies were installed. Findings verified against the live deployment, the GitHub API, and direct measurement. Specifications treated as authoritative throughout; every deviation is marked as a suggestion.*
