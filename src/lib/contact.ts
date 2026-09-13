/**
 * Contact form: shared validation schema, bot heuristics, and response types.
 *
 * Imported by BOTH the server endpoint and (later) the client island, so the
 * two can never disagree about what is valid. MASTER_CONTENT.md §18 defines
 * the fields (Name, Email, Message) and the required states.
 *
 * Bot detection is deliberately separated from field validation:
 *   - A validation failure is a human mistake and gets specific field errors.
 *   - A bot signal is answered with a normal success response so the caller
 *     learns nothing about the heuristic (see the endpoint).
 */

import { z } from 'zod';

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

/** The three real fields. */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.nameMin, 'Please enter your name.')
    .max(LIMITS.nameMax, `Name must be ${LIMITS.nameMax} characters or fewer.`),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(LIMITS.emailMax, 'That email address is too long.')
    .pipe(z.email('Please enter a valid email address.')),
  message: z
    .string()
    .trim()
    .min(LIMITS.messageMin, `Please write at least ${LIMITS.messageMin} characters.`)
    .max(LIMITS.messageMax, `Message must be ${LIMITS.messageMax} characters or fewer.`),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Anti-automation metadata submitted alongside the real fields.
 * Both are optional: a missing value is treated as "no signal", never as a
 * failure, so a legitimate submission is never silently dropped.
 */
export const submissionMetaSchema = z.object({
  [HONEYPOT_FIELD]: z.string().optional(),
  startedAt: z.coerce.number().int().nonnegative().optional(),
});

export type SubmissionMeta = z.infer<typeof submissionMetaSchema>;

export type BotReason = 'honeypot' | 'too-fast' | 'stale';

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

  if (typeof meta.startedAt === 'number') {
    const elapsed = now - meta.startedAt;
    // Negative elapsed means a future timestamp: treat as forged.
    if (elapsed < MIN_FILL_MS) return { isBot: true, reason: 'too-fast' };
    if (elapsed > MAX_FORM_AGE_MS) return { isBot: true, reason: 'stale' };
  }

  return { isBot: false };
}

/**
 * Flatten a ZodError into `{ field: firstMessage }` for accessible,
 * per-field error rendering (DESIGN_SYSTEM.md §48).
 */
export function formatFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== 'string') continue;
    if (result[key] === undefined) result[key] = issue.message;
  }
  return result;
}

/** Discriminated response contract shared by the endpoint and the future UI. */
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
