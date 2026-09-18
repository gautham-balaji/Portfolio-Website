/**
 * Contact form: Zod schemas.
 *
 * Server-only. Imported exclusively by `src/pages/api/contact.ts`. See the
 * header comment in `src/lib/contact.ts` for why this is a separate file: a
 * `z.object(...)` call executes at module load, so importing anything from a
 * module that builds one -- even an unrelated constant -- drags zod into
 * whatever bundle does the importing. `ContactForm.tsx` must never import
 * from this file.
 */

import { z } from 'zod';
import { HONEYPOT_FIELD, LIMITS } from './contact';

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
 *
 * Both fields use `.catch()` rather than letting a malformed value fail the
 * whole object. Zod's default behaviour for `z.coerce.number().optional()` is
 * to fail the *entire* schema if a present-but-uncoercible value (e.g. the
 * string "abc") is supplied, which previously caused the caller to skip
 * `detectBot` entirely on `!meta.success` -- a forged, deliberately
 * unparseable `startedAt` silently bypassed both the honeypot and timing
 * checks. `.catch(NaN)` keeps the object parseable and hands the sentinel to
 * `detectBot`, which treats it as an explicit bad-timing signal rather than
 * "no signal".
 *
 * The parsed output structurally satisfies `SubmissionMeta` from
 * `src/lib/contact.ts`, so `detectBot` accepts it directly.
 */
export const submissionMetaSchema = z.object({
  [HONEYPOT_FIELD]: z.string().optional().catch(undefined),
  startedAt: z.coerce.number().optional().catch(NaN),
});

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
