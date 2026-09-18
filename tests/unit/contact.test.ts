import { describe, expect, it } from 'vitest';
import {
  detectBot,
  ERROR_COPY,
  HONEYPOT_FIELD,
  LIMITS,
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
} from '@/lib/contact';
import {
  contactFormSchema,
  formatFieldErrors,
  submissionMetaSchema,
} from '@/lib/contactValidation';

const validInput = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I would like to talk to you about a backend systems role.',
};

describe('contactFormSchema', () => {
  it('accepts a well-formed submission', () => {
    const result = contactFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace from every field', () => {
    const result = contactFormSchema.parse({
      name: '  Ada Lovelace  ',
      email: '  ada@example.com  ',
      message: `  ${validInput.message}  `,
    });
    expect(result.name).toBe('Ada Lovelace');
    expect(result.email).toBe('ada@example.com');
    expect(result.message).toBe(validInput.message);
  });

  it('normalises email casing so delivery and rate limiting agree', () => {
    const result = contactFormSchema.parse({ ...validInput, email: 'Ada@Example.COM' });
    expect(result.email).toBe('ada@example.com');
  });

  it('rejects a name below the minimum length', () => {
    const result = contactFormSchema.safeParse({ ...validInput, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email address', () => {
    const result = contactFormSchema.safeParse({ ...validInput, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a message below the minimum length', () => {
    const result = contactFormSchema.safeParse({ ...validInput, message: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects oversized fields at the declared limits', () => {
    expect(
      contactFormSchema.safeParse({ ...validInput, name: 'a'.repeat(LIMITS.nameMax + 1) })
        .success,
    ).toBe(false);
    expect(
      contactFormSchema.safeParse({
        ...validInput,
        message: 'a'.repeat(LIMITS.messageMax + 1),
      }).success,
    ).toBe(false);
  });

  it('rejects a whitespace-only message rather than accepting it as filled', () => {
    const result = contactFormSchema.safeParse({ ...validInput, message: '          ' });
    expect(result.success).toBe(false);
  });

  it('ignores unknown keys such as the honeypot without failing', () => {
    const result = contactFormSchema.safeParse({
      ...validInput,
      [HONEYPOT_FIELD]: '',
      startedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });
});

describe('formatFieldErrors', () => {
  it('returns one message per invalid field, keyed by field name', () => {
    const result = contactFormSchema.safeParse({ name: '', email: 'nope', message: '' });
    expect(result.success).toBe(false);
    if (result.success) return;

    const errors = formatFieldErrors(result.error);
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
    expect(typeof errors.name).toBe('string');
  });

  it('returns an empty object when nothing is wrong', () => {
    const result = contactFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});

describe('detectBot', () => {
  const now = 1_700_000_000_000;
  const humanStart = now - MIN_FILL_MS - 1_000;

  it('passes a plausible human submission', () => {
    const meta = submissionMetaSchema.parse({ startedAt: humanStart });
    expect(detectBot(meta, now)).toEqual({ isBot: false });
  });

  it('flags a filled honeypot', () => {
    const meta = submissionMetaSchema.parse({
      [HONEYPOT_FIELD]: 'Acme Inc',
      startedAt: humanStart,
    });
    expect(detectBot(meta, now)).toEqual({ isBot: true, reason: 'honeypot' });
  });

  it('treats a whitespace-only honeypot as empty', () => {
    const meta = submissionMetaSchema.parse({
      [HONEYPOT_FIELD]: '   ',
      startedAt: humanStart,
    });
    expect(detectBot(meta, now).isBot).toBe(false);
  });

  it('flags a submission completed faster than a human could type', () => {
    const meta = submissionMetaSchema.parse({ startedAt: now - 200 });
    expect(detectBot(meta, now)).toEqual({ isBot: true, reason: 'too-fast' });
  });

  it('flags a stale form', () => {
    const meta = submissionMetaSchema.parse({ startedAt: now - MAX_FORM_AGE_MS - 1 });
    expect(detectBot(meta, now)).toEqual({ isBot: true, reason: 'stale' });
  });

  it('flags a forged future timestamp', () => {
    const meta = submissionMetaSchema.parse({ startedAt: now + 60_000 });
    expect(detectBot(meta, now)).toEqual({ isBot: true, reason: 'too-fast' });
  });

  it('does not flag a submission that omits timing metadata', () => {
    const meta = submissionMetaSchema.parse({});
    expect(detectBot(meta, now)).toEqual({ isBot: false });
  });

  it('accepts a string startedAt, since form posts send strings', () => {
    const meta = submissionMetaSchema.parse({ startedAt: String(humanStart) });
    expect(meta.startedAt).toBe(humanStart);
    expect(detectBot(meta, now).isBot).toBe(false);
  });

  it('flags a startedAt that cannot be coerced to a number at all', () => {
    // Regression test: this exact input used to fail submissionMetaSchema's
    // parse entirely, which caused the caller to skip detectBot altogether
    // (see the schema comment). A forged, unparseable value must now be
    // treated as a timing violation, not as "no signal".
    const meta = submissionMetaSchema.parse({ startedAt: 'not-a-timestamp' });
    expect(detectBot(meta, now)).toEqual({ isBot: true, reason: 'invalid-timing' });
  });

  it('never fails to parse, even with a malformed honeypot field', () => {
    const result = submissionMetaSchema.safeParse({
      [HONEYPOT_FIELD]: ['not', 'a', 'string'],
    });
    expect(result.success).toBe(true);
  });

  it('never fails to parse, whatever shape startedAt arrives in', () => {
    for (const bogus of [null, {}, [], Symbol('x'), () => 1]) {
      const result = submissionMetaSchema.safeParse({ startedAt: bogus });
      expect(result.success).toBe(true);
    }
  });
});

describe('ERROR_COPY', () => {
  it('provides plain, non-empty guidance for every non-validation failure', () => {
    for (const message of Object.values(ERROR_COPY)) {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(10);
      // MASTER_CONTENT.md §03: no em dashes in website copy.
      expect(message).not.toContain('—');
    }
  });
});

describe('client/server bundle boundary', () => {
  it('keeps src/lib/contact.ts free of a zod import', async () => {
    // Regression test for a measured bug: this file is imported by the
    // ContactForm React island, and a `z.object(...)` call executes at
    // module load, so a zod import here previously pulled an ~89 KB chunk of
    // zod internals into the client bundle even though nothing in the island
    // ever called it. The zod-dependent schemas live in
    // contactValidation.ts, a server-only module ContactForm.tsx must never
    // import from.
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const source = await fs.readFile(
      path.resolve(import.meta.dirname, '../../src/lib/contact.ts'),
      'utf-8',
    );
    expect(source).not.toMatch(/from ['"]zod['"]/);
    expect(source).not.toMatch(/from ['"]astro\/zod['"]/);
  });
});
