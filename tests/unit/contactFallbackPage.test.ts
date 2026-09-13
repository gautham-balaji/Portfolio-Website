import { describe, expect, it } from 'vitest';
import { renderContactFallbackPage } from '@/lib/contactFallbackPage';

describe('renderContactFallbackPage', () => {
  it('renders a complete, well-formed HTML document', () => {
    const html = renderContactFallbackPage({
      title: 'Message sent',
      heading: 'Message sent',
      message: "I'll get back to you.",
    });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Message sent</title>');
    expect(html).toContain('<h1>Message sent</h1>');
    expect(html).toContain('I&#39;ll get back to you.');
  });

  it('links back to the contact section so the visitor can retry', () => {
    const html = renderContactFallbackPage({
      title: 'Message not sent',
      heading: 'Something went wrong',
      message: 'Please try again.',
    });
    expect(html).toContain('href="/#contact"');
  });

  it('escapes HTML-significant characters in every field it embeds', () => {
    const html = renderContactFallbackPage({
      title: '<script>alert(1)</script>',
      heading: '<b>bold</b>',
      message: 'Tom & Jerry "quoted" <tag>',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<b>bold</b>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quoted&quot;');
  });

  it('omits the field list entirely when there are no field errors', () => {
    const html = renderContactFallbackPage({
      title: 'Message sent',
      heading: 'Message sent',
      message: 'Sent.',
    });
    expect(html).not.toContain('<ul>');
  });

  it('lists each field error as plain text, escaped', () => {
    const html = renderContactFallbackPage({
      title: 'Message not sent',
      heading: "Some of that didn't look right",
      message: 'Please fix the following and try again.',
      fieldErrors: {
        email: 'Please enter a valid email address.',
        message: 'Please write at least 20 characters.',
      },
    });

    expect(html).toContain('<ul>');
    expect(html).toContain('Please enter a valid email address.');
    expect(html).toContain('Please write at least 20 characters.');
  });

  it('omits the mailto line unless explicitly requested', () => {
    const withoutMailto = renderContactFallbackPage({
      title: 'a',
      heading: 'a',
      message: 'a',
    });
    expect(withoutMailto).not.toContain('mailto:');

    const withMailto = renderContactFallbackPage({
      title: 'a',
      heading: 'a',
      message: 'a',
      showMailto: true,
    });
    expect(withMailto).toContain('mailto:gautham.balajis@gmail.com');
  });

  it('never emits an em dash, per the established voice rules', () => {
    const html = renderContactFallbackPage({
      title: 'Message sent',
      heading: 'Message sent',
      message: "I'll get back to you.",
    });
    expect(html).not.toContain('—');
  });
});
