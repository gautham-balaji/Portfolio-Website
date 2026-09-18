/**
 * Contact form: constants, bot heuristics, and the response contract.
 *
 * Imported by BOTH the server endpoint and the client island, so the two can
 * never disagree about field limits, the honeypot name, or the response
 * shape. MASTER_CONTENT.md §18 defines the fields (Name, Email, Message) and
 * the required states.
 *
 * This module deliberately has NO dependency on zod. The Zod schemas
 * (`contactFormSchema`, `submissionMetaSchema`) live in
 * `src/lib/contactValidation.ts`, a server-only module, instead of here.
 *
 * That split exists because of how bundlers tree-shake ES modules: a `z
 * .object(...)` call is a function call with side effects Rollup cannot prove
 * are safe to discard, so importing even one zod-free constant from a module
 * that ALSO builds a zod schema at its top level pulls the whole schema (and
 * therefore zod itself) into whatever bundle does the importing. Measured
 * concretely during Phase 4: before this split, importing only
 * `HONEYPOT_FIELD` into the client contact island added an 89 KB chunk built
 * almost entirely from zod internals (`ZodError`, `ZodObject`, `ZodString`)
 * that the island never calls. `ContactForm.tsx` must only ever import from
 * *this* file, never from `contactValidation.ts`.
 *
 * Bot detection is deliberately separated from field validation:
 *   - A validation failure is a human mistake and gets specific field errors.
 *   - A bot signal is answered with a normal success response so the caller
 *     learns nothing about the heuristic (see the endpoint).
 */

/**
 * Honeypot input name. Rendered visually hidden and off the tab order.
 * Named to look plausible to a naive form filler.
 */
export const HONEYPOT_FIELD = 'company';

/** Submissions faster than this are treated as automated. */
export const MIN_FILL_MS = 2_000;

/** Forms older than this are stale (tab left open, clock skew, replay). */
export const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1_000;

/** Field bounds, exported so the UI can mirror them in `maxlength` etc. */
export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 20,
  messageMax: 5_000,
} as const;

/**
 * Shape of the anti-automation metadata `detectBot` reads.
 *
 * Written by hand rather than derived via `z.infer` so this file stays
 * zod-free (see the module comment). `contactValidation.ts`'s
 * `submissionMetaSchema` produces values that structurally satisfy this type;
 * TypeScript checks that at the one call site in the API route.
 */
export type SubmissionMeta = { [K in typeof HONEYPOT_FIELD]?: string } & {
  startedAt?: number;
};

export type BotReason = 'honeypot' | 'too-fast' | 'stale' | 'invalid-timing';

export interface BotVerdict {
  isBot: boolean;
  reason?: BotReason;
}

/**
 * Cheap automation heuristics. Not a security control: `startedAt` is
 * client-supplied and forgeable. It exists to stop naive form spam, and is
 * intentionally simple to keep maintainable.
 */
export function detectBot(meta: SubmissionMeta, now: number = Date.now()): BotVerdict {
  const honeypot = meta[HONEYPOT_FIELD];
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { isBot: true, reason: 'honeypot' };
  }

  if (meta.startedAt !== undefined) {
    // A present value that failed to coerce to a real number (see
    // contactValidation.ts) is itself a forgery signal, not an absence of one.
    if (!Number.isFinite(meta.startedAt) || meta.startedAt < 0) {
      return { isBot: true, reason: 'invalid-timing' };
    }

    const elapsed = now - meta.startedAt;
    // Negative elapsed means a future timestamp: treat as forged.
    if (elapsed < MIN_FILL_MS) return { isBot: true, reason: 'too-fast' };
    if (elapsed > MAX_FORM_AGE_MS) return { isBot: true, reason: 'stale' };
  }

  return { isBot: false };
}

/** Discriminated response contract shared by the endpoint and the UI. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: 'validation'; fieldErrors: Record<string, string> }
  | { ok: false; error: 'rate_limited'; retryAfterSeconds: number }
  | { ok: false; error: 'unavailable' }
  | { ok: false; error: 'server' };

/**
 * Human-facing copy for each non-validation failure, so the endpoint and the
 * UI present the same wording. Kept plain and actionable.
 */
export const ERROR_COPY: Record<
  Exclude<Extract<ContactResponse, { ok: false }>['error'], 'validation'>,
  string
> = {
  rate_limited: 'Too many messages sent recently. Please try again shortly.',
  unavailable: 'Messages cannot be sent right now. Please email directly instead.',
  server: 'Something went wrong sending your message. Please email directly instead.',
};
