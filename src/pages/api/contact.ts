/**
 * POST /api/contact
 *
 * The only on-demand route on the site. Everything else is static.
 *
 * Order of operations is deliberate and unchanged from Phase 1:
 *   1. Method and payload parsing
 *   2. Bot heuristics        -> answered with a normal success response
 *   3. Field validation      -> 400 with per-field messages
 *   4. Rate limit            -> 429, fails open if Redis is unreachable
 *   5. Delivery              -> 502 on provider failure
 *
 * Bot submissions are answered with `{ ok: true }` on purpose. Telling an
 * automated client that it tripped a honeypot only helps it adapt.
 *
 * Phase 4 adds one thing: every response point now renders in one of two
 * formats, chosen by request Content-Type, never by a client-controlled
 * Accept header or any other signal that could be used to influence a
 * security decision:
 *   - application/json                                  -> the ContactResponse
 *     contract below, consumed by the React island's fetch call.
 *   - application/x-www-form-urlencoded / multipart/*    -> a small HTML page
 *     (src/lib/contactFallbackPage.ts), for a native <form> submission from a
 *     browser with JavaScript disabled or unavailable.
 * This mirrors the exact check `readPayload` already performs to parse the
 * body, so no new header-sniffing logic exists anywhere in this file, and the
 * choice of format never changes validation, rate limiting, or bot detection.
 */

import type { APIRoute } from 'astro';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import {
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  RESEND_API_KEY,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from 'astro:env/server';
import { detectBot, ERROR_COPY, type ContactResponse } from '@/lib/contact';
import {
  renderContactFallbackPage,
  type ContactFallbackPageOptions,
} from '@/lib/contactFallbackPage';
import {
  contactFormSchema,
  formatFieldErrors,
  submissionMetaSchema,
} from '@/lib/contactValidation';

export const prerender = false;

/** 5 submissions per 10 minutes per client address. */
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = '10 m' as const;

/**
 * Does this Content-Type indicate a native browser form submission?
 * Everything else (JSON, missing, or an exotic value) is answered as JSON,
 * which is the safe default for any non-browser client.
 */
function isFormEncoded(contentType: string): boolean {
  return (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  );
}

/**
 * Emit one response in whichever format the request used to submit data.
 * `json` and `html` describe the SAME outcome; requiring both together at
 * every call site is what stops the two representations from drifting apart
 * as this file changes.
 */
function respond(
  isJson: boolean,
  json: ContactResponse,
  status: number,
  html: ContactFallbackPageOptions,
  headers: HeadersInit = {},
): Response {
  if (isJson) {
    return new Response(JSON.stringify(json), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
    });
  }
  return new Response(renderContactFallbackPage(html), {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...headers },
  });
}

/** Built once per server instance, only when both credentials are present. */
let cachedLimiter: Ratelimit | null | undefined;

function getRateLimiter(): Ratelimit | null {
  if (cachedLimiter !== undefined) return cachedLimiter;

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[contact] Upstash credentials absent; rate limiting disabled.');
    cachedLimiter = null;
    return cachedLimiter;
  }

  cachedLimiter = new Ratelimit({
    redis: new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
    prefix: 'portfolio:contact',
    analytics: false,
  });
  return cachedLimiter;
}

/**
 * Resolve the client address.
 *
 * `context.clientAddress` is supplied by the Vercel adapter from the platform
 * edge, so it is preferred. `x-forwarded-for` is only consulted as a fallback
 * and only its first hop is used, since downstream entries are attacker
 * controlled. A missing address yields a shared bucket rather than no limit.
 */
function resolveClientId(clientAddress: string | undefined, headers: Headers): string {
  if (clientAddress) return clientAddress;

  const forwarded = headers.get('x-forwarded-for');
  const firstHop = forwarded?.split(',')[0]?.trim();
  if (firstHop) return firstHop;

  return 'unknown';
}

/** Accepts JSON and form-encoded bodies so a no-JS form POST also works. */
async function readPayload(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const parsed: unknown = await request.json();
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      return parsed as Record<string, unknown>;
    }

    if (isFormEncoded(contentType)) {
      const form = await request.formData();
      const result: Record<string, unknown> = {};
      for (const [key, value] of form.entries()) {
        if (typeof value === 'string') result[key] = value;
      }
      return result;
    }
  } catch {
    return null;
  }

  return null;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentType = request.headers.get('content-type') ?? '';
  const isJson = !isFormEncoded(contentType);

  const payload = await readPayload(request);
  if (payload === null) {
    return respond(isJson, { ok: false, error: 'validation', fieldErrors: {} }, 400, {
      title: 'Message not sent',
      heading: 'There was a problem with your submission',
      message: 'The form data could not be read. Please try again.',
    });
  }

  // --- 1. Bot heuristics ---------------------------------------------------
  // `submissionMetaSchema` never fails outright (see src/lib/contact.ts), so
  // this always runs against real, if possibly forged, values.
  const meta = submissionMetaSchema.safeParse(payload);
  if (meta.success) {
    const verdict = detectBot(meta.data);
    if (verdict.isBot) {
      console.warn(`[contact] Discarded submission (${verdict.reason}).`);
      // Identical to the real success response in every observable way: see
      // the module comment on why this must never differ from a genuine send.
      return respond(isJson, { ok: true }, 200, {
        title: 'Message sent',
        heading: 'Message sent',
        message: "I'll get back to you.",
      });
    }
  }

  // --- 2. Field validation -------------------------------------------------
  const parsed = contactFormSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = formatFieldErrors(parsed.error);
    return respond(isJson, { ok: false, error: 'validation', fieldErrors }, 400, {
      title: 'Message not sent',
      heading: "Some of that didn't look right",
      message: 'Please fix the following and try again.',
      fieldErrors,
    });
  }
  const { name, email, message } = parsed.data;

  // --- 3. Rate limiting ----------------------------------------------------
  const limiter = getRateLimiter();
  if (limiter) {
    const clientId = resolveClientId(clientAddress, request.headers);
    try {
      const { success, reset } = await limiter.limit(clientId);
      if (!success) {
        const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
        return respond(
          isJson,
          { ok: false, error: 'rate_limited', retryAfterSeconds },
          429,
          {
            title: 'Message not sent',
            heading: 'Too many messages',
            message: `${ERROR_COPY.rate_limited} (about ${retryAfterSeconds} seconds)`,
          },
          { 'retry-after': String(retryAfterSeconds) },
        );
      }
    } catch {
      // Fail open: a Redis outage must not block a legitimate message.
      console.error('[contact] Rate limit check failed; allowing submission.');
    }
  }

  // --- 4. Delivery ---------------------------------------------------------
  if (!RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not configured; cannot deliver.');
    return respond(isJson, { ok: false, error: 'unavailable' }, 503, {
      title: 'Message not sent',
      heading: 'Messages cannot be sent right now',
      message: ERROR_COPY.unavailable,
      showMailto: true,
    });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject: `Portfolio contact: ${name}`,
      // Plain text only. Nothing user-supplied is ever interpolated into HTML.
      text: [`Name: ${name}`, `Email: ${email}`, '', message].join('\n'),
    });

    if (error) {
      // Log the provider's message, never return it to the caller.
      console.error('[contact] Resend rejected the message:', error.message);
      return respond(isJson, { ok: false, error: 'server' }, 502, {
        title: 'Message not sent',
        heading: 'Something went wrong',
        message: ERROR_COPY.server,
        showMailto: true,
      });
    }
  } catch {
    console.error('[contact] Unexpected failure while sending.');
    return respond(isJson, { ok: false, error: 'server' }, 500, {
      title: 'Message not sent',
      heading: 'Something went wrong',
      message: ERROR_COPY.server,
      showMailto: true,
    });
  }

  // Deliberately excludes the message body and the sender address.
  console.info(`[contact] Delivered a message of ${message.length} characters.`);
  return respond(isJson, { ok: true }, 200, {
    title: 'Message sent',
    heading: 'Message sent',
    message: "I'll get back to you.",
  });
};

/** Any other method gets a correct 405 rather than a framework default. */
export const ALL: APIRoute = ({ request }) => {
  if (request.method === 'POST') {
    const body: ContactResponse = { ok: false, error: 'server' };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
};
