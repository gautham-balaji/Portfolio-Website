import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ERROR_COPY, HONEYPOT_FIELD, LIMITS, type ContactResponse } from '@/lib/contact';
import { SITE } from '@/lib/site';

/**
 * The contact form.
 *
 * Progressive enhancement, not a JS-only widget: this component's
 * server-rendered output (every `client:*` directive except `client:only`
 * pre-renders on the server) IS the real, complete `<form action="/api/contact"
 * method="post">`. A visitor with JavaScript disabled gets that exact markup,
 * frozen at build time, and a native form submission works against it
 * unmodified. A visitor with JavaScript gets the same DOM plus this
 * component's event handling layered on top: `onSubmit` calls
 * `preventDefault()` and posts to the same endpoint over `fetch`, so there is
 * only ever one server contract to keep in sync (`src/lib/contact.ts`'s
 * `ContactResponse`), never two forms.
 *
 * Fields are uncontrolled (read via `FormData` at submit time), not
 * `useState`-bound. There is no need to control them: a failed submit leaves
 * whatever the visitor typed exactly where it was with zero extra code, and
 * `required` / `type="email"` / `maxLength` give free native validation that
 * blocks the `submit` event (and shows the browser's own focus + tooltip)
 * before `handleSubmit` ever runs, for both JS and no-JS visitors alike.
 *
 * `startedAt` is the one field that must NOT be present in the server-rendered
 * output. This page is fully static (`output: 'static'`); if a timestamp were
 * written into the JSX unconditionally, every visitor would receive the same
 * BUILD-time value baked into the HTML, which would make every no-JS
 * submission look either impossibly stale or (worse) intermittently valid
 * depending only on how long ago the site was last deployed. Rendering the
 * hidden input only after `useEffect` has set a real, request-time value means
 * the field simply does not exist for a no-JS visitor, and the server already
 * treats a missing `startedAt` as "no timing signal" rather than a failure
 * (see `detectBot` in src/lib/contact.ts) -- which is the correct outcome:
 * the timing heuristic is a JS-only enhancement, the honeypot and rate limit
 * are not, and no-JS submissions still pass through both of those unchanged.
 */

type Phase = 'idle' | 'submitting' | 'success' | 'error';
type ErrorKind = Exclude<ContactResponse, { ok: true }>['error'] | 'network';

const FIELD_NAMES = ['name', 'email', 'message'] as const;
type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

export default function ContactForm() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const successRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const fieldElement: Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null> = {
    name: nameRef.current,
    email: emailRef.current,
    message: messageRef.current,
  };

  // Records "the form became interactive", not "the page loaded" -- the two
  // can differ under client:visible, since hydration only happens once the
  // form scrolls into view. Either way this never runs for a no-JS visitor.
  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  // Move focus to whichever surface just became the answer to "what
  // happened": the success panel, or the first invalid field. Runs once per
  // phase transition, never on every render, so it cannot fight the visitor
  // for focus while they are still typing or re-editing a field.
  useEffect(() => {
    if (phase === 'success') {
      successRef.current?.focus();
      return;
    }
    if (phase === 'error') {
      const firstInvalid = FIELD_NAMES.find((name) => fieldErrors[name]);
      if (firstInvalid) fieldElement[firstInvalid]?.focus();
    }
    // Deliberately keyed on `phase` alone, not on `fieldElement`/`fieldErrors`
    // (both are rebuilt or can change on every render): re-running this on
    // every keystroke while the visitor corrects a field would steal focus
    // back from them mid-edit. eslint-plugin-react-hooks is not part of this
    // project's lint config, so no disable directive is needed for it here.
  }, [phase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Defense in depth alongside the disabled submit button: a second Enter
    // keypress before React re-renders cannot start a second request.
    if (phase === 'submitting') return;

    const data = new FormData(event.currentTarget);

    setPhase('submitting');
    setErrorKind(null);
    setErrorMessage('');
    setFieldErrors({});

    let response: Response;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          message: String(data.get('message') ?? ''),
          [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ''),
          ...(startedAt !== null && { startedAt }),
        }),
      });
    } catch {
      // fetch only throws for a network-level failure (offline, DNS, a
      // dropped connection) -- never for a non-2xx HTTP response, which is
      // handled below instead. The message is never assumed sent.
      setPhase('error');
      setErrorKind('network');
      setErrorMessage('Could not reach the server. Check your connection and try again.');
      return;
    }

    let body: ContactResponse;
    try {
      body = (await response.json()) as ContactResponse;
    } catch {
      setPhase('error');
      setErrorKind('server');
      setErrorMessage(ERROR_COPY.server);
      return;
    }

    if (body.ok) {
      setPhase('success');
      return;
    }

    setPhase('error');
    setErrorKind(body.error);

    if (body.error === 'validation') {
      const knownFieldErrors: Partial<Record<FieldName, string>> = {};
      for (const [key, message] of Object.entries(body.fieldErrors)) {
        if (isFieldName(key)) knownFieldErrors[key] = message;
      }
      setFieldErrors(knownFieldErrors);
      setErrorMessage(
        Object.keys(knownFieldErrors).length > 0
          ? 'Please fix the highlighted fields.'
          : 'There was a problem with your submission. Please try again.',
      );
      return;
    }

    if (body.error === 'rate_limited') {
      setErrorMessage(`${ERROR_COPY.rate_limited} (about ${body.retryAfterSeconds} seconds)`);
      return;
    }

    setErrorMessage(ERROR_COPY[body.error]);
  }

  function handleSendAnother() {
    // No form.reset() call needed: the success view below does not render
    // the <form> at all, so returning to 'idle' remounts a brand new one
    // (React treats <div class="form-success"> and <form> as unrelated
    // element types and replaces the subtree), which is already empty.
    setStartedAt(Date.now());
    setPhase('idle');
  }

  const showMailto = errorKind === 'unavailable' || errorKind === 'server';

  if (phase === 'success') {
    return (
      <div className="form-success" ref={successRef} tabIndex={-1} role="status">
        <p className="form-success-heading">Message sent</p>
        <p className="form-success-message">I'll get back to you.</p>
        <button
          type="button"
          className="btn btn-secondary form-retry"
          onClick={handleSendAnother}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="contact-form"
      action="/api/contact"
      method="post"
      onSubmit={handleSubmit}
      aria-busy={phase === 'submitting'}
    >
      <p className="label form-key">Send a message</p>

      <div className="field">
        <label className="field-label" htmlFor="contact-name">
          Name
        </label>
        <input
          ref={nameRef}
          className="field-input"
          type="text"
          id="contact-name"
          name="name"
          autoComplete="name"
          minLength={LIMITS.nameMin}
          maxLength={LIMITS.nameMax}
          required
          aria-invalid={fieldErrors.name ? 'true' : undefined}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
        />
        {fieldErrors.name && (
          <p id="contact-name-error" className="field-error">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="contact-email">
          Email
        </label>
        <input
          ref={emailRef}
          className="field-input"
          type="email"
          id="contact-email"
          name="email"
          autoComplete="email"
          maxLength={LIMITS.emailMax}
          required
          aria-invalid={fieldErrors.email ? 'true' : undefined}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="contact-email-error" className="field-error">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          ref={messageRef}
          className="field-input field-textarea"
          id="contact-message"
          name="message"
          rows={5}
          minLength={LIMITS.messageMin}
          maxLength={LIMITS.messageMax}
          required
          aria-invalid={fieldErrors.message ? 'true' : undefined}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
        />
        {fieldErrors.message && (
          <p id="contact-message-error" className="field-error">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot. Hidden from sight, from assistive technology, and from the
          tab order, so only an automated filler will complete it. Left
          uncontrolled: no legitimate visitor ever sets its value. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          type="text"
          id="contact-company"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* JS-only enhancement (see the module comment). Absent from the
          server-rendered, no-JS output. */}
      {startedAt !== null && <input type="hidden" name="startedAt" value={startedAt} />}

      <button
        type="submit"
        className="btn btn-primary form-submit"
        disabled={phase === 'submitting'}
      >
        {phase === 'submitting' ? 'Sending message…' : 'Send message'}
      </button>

      {/* Two permanently-mounted live regions, never conditionally rendered:
          aria-live only reaches content changes made AFTER the region is
          already being observed, so both must exist from first paint.
          Polite carries the in-progress state; assertive carries failures,
          which is why they are separate rather than one shared region. */}
      <p className="form-status" aria-live="polite">
        {phase === 'submitting' ? 'Sending message…' : ''}
      </p>
      <p className="form-status form-status-error" role="alert">
        {phase === 'error' ? errorMessage : ''}
      </p>

      {phase === 'error' && showMailto && (
        <p className="field-hint">
          Or email directly:{' '}
          <a className="link-editorial" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </p>
      )}
    </form>
  );
}
