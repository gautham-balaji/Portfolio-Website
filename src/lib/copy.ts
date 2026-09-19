/**
 * Page copy that is not collection data.
 *
 * Every string here is taken verbatim from MASTER_CONTENT.md, with the section
 * noted. Nothing may be paraphrased into marketing language and nothing may be
 * invented. If copy needs to change, change MASTER_CONTENT.md first.
 *
 * Projects, experience, education and skills live in content collections, not
 * here.
 */

/** MASTER_CONTENT.md §06. */
export const HERO = {
  eyebrow: 'SOFTWARE ENGINEER',
  heading: 'GAUTHAM BALAJI',
  positioning: 'Building reliable AI systems and backend infrastructure.',
  supporting:
    'I build software across backend systems, AI, agentic workflows, and the infrastructure that connects them.',
  primaryCta: 'VIEW SELECTED WORK',
  secondaryCta: 'DOWNLOAD RESUME',
  location: 'CHENNAI, INDIA',
  scrollHint: 'SCROLL TO EXPLORE',
} as const;

/**
 * MASTER_CONTENT.md §21. Resume is listed as optional.
 *
 * Root-relative, not bare fragments. The header renders on every route, and
 * these four sections only exist on the homepage: as `#work` the links were
 * dead on all four project pages and on the 404, appending a fragment to the
 * current URL and going nowhere. `/#work` returns to the homepage and lands
 * on the section from anywhere, and from the homepage itself it is still a
 * same-document fragment navigation, so nothing reloads.
 */
export const NAV_ITEMS = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const;

/** MASTER_CONTENT.md §13. */
export const ENGINEERING_PROFILE = {
  headline: 'I LIKE BUILDING SYSTEMS THAT ACTUALLY MAKE SENSE.',
  body: [
    "I'm a software engineer interested in backend systems, AI engineering, and the architecture that connects them.",
    'I like understanding how a system works from the ground up, whether that means tracing an unfamiliar codebase, figuring out the architecture behind a product, or connecting technologies that were never designed to work together.',
    "AI is one of the most interesting tools available to software engineers right now. It is evolving quickly, and when used correctly, I think it can be one of the best tools for building software. My interest isn't just in using models, but in understanding how to turn them into reliable systems that can actually do useful work.",
    'A lot of what I build starts the same way: I notice something that could work better. If nothing exists that solves it properly, I start with the underlying idea and build from there.',
    "I'm particularly interested in making those systems faster, more reliable, and better designed, from the AI workflow itself down to the backend, database, networking, and processes underneath it.",
  ],
  principles: [
    {
      number: '01',
      title: 'UNDERSTANDING',
      body: 'I want to know why a system works, not just that it works. I naturally gravitate toward unfamiliar codebases, architecture, and the relationships between components.',
    },
    {
      number: '02',
      title: 'SYSTEMS',
      body: 'The interesting problems are often underneath the interface. Backend architecture, databases, networking, processes, performance, reliability, and the boundaries between systems.',
    },
    {
      number: '03',
      title: 'AI ENGINEERING',
      body: 'LLMs, agents, retrieval, orchestration, and the engineering required to make AI useful beyond a prototype.',
    },
    {
      number: '04',
      title: 'BUILDING',
      body: 'I like finding things that could work better, starting from a base idea, and turning them into something usable.',
    },
  ],
  /** Used once, as the largest type moment on the page (DESIGN_SYSTEM §18). */
  statement: [
    "I DON'T JUST LOOK FOR THINGS TO BUILD.",
    'I LOOK FOR THINGS THAT COULD WORK BETTER.',
  ],
} as const;

/** MASTER_CONTENT.md §14. */
export const ABOUT = {
  body: [
    "I'm Gautham, a software engineer based in Chennai.",
    'I spend most of my time somewhere between backend systems, AI workflows, and figuring out why complicated software behaves the way it does.',
    'I like building things that start as a rough idea and end up as an actual system. Sometimes that means an AI agent, sometimes a backend platform, sometimes an experiment that probably has no business being as complicated as I made it.',
    'The common thread is simple: understand the problem, understand the system, then build it properly.',
  ],
  /** DESIGN_SYSTEM.md §19 specifies these three metadata pairs. */
  meta: [
    { key: 'BASED IN', value: 'CHENNAI' },
    { key: 'FOCUS', value: 'AI + BACKEND' },
    { key: 'CURRENTLY', value: 'BUILDING' },
  ],
} as const;

/** MASTER_CONTENT.md §15. */
export const CURRENTLY_BUILDING = {
  headline: 'WHAT HAPPENS WHEN GENERATIVE AI HAS TO OBEY PHYSICS?',
  intro:
    "I'm currently building GeoCounterfactual, a geospatial simulation system that combines satellite data, generative models, deterministic hydro-ecological constraints, and cyclic validation.",
  currentWork: [
    'Extracting and validating intervention datasets',
    'Working toward fine-tuning Stable Diffusion 1.5 / ControlNet for satellite imagery',
    'Improving the counterfactual generation pipeline',
    'Refining deterministic validation',
    'Exploring better performance and system architecture',
  ],
  /** The honest-status line is required by §15 and must not be softened. */
  honestStatus:
    'The core orchestration, geospatial ingestion, deterministic critic, and interface are functional. The final generative model training is still in progress.',
  /** DESIGN_SYSTEM.md §20. No percentages, no progress bars. */
  pipeline: ['DATA', 'MODEL', 'CRITIC', 'VALIDATION'],
} as const;

/** MASTER_CONTENT.md §18. */
export const CONTACT = {
  heading: 'HAVE SOMETHING WORTH BUILDING?',
  supporting:
    "I'm open to software engineering opportunities, interesting technical problems, and projects worth building.",
} as const;
