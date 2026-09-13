import { describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '@/lib/site';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** Every source file under a directory, by extension, read as UTF-8. */
async function readSourceFiles(dir: string, extensions: string[]) {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  const files: { path: string; content: string }[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
    const filePath = path.join(entry.parentPath, entry.name);
    files.push({ path: filePath, content: await fs.readFile(filePath, 'utf-8') });
  }
  return files;
}

describe('education content (Phase 5: CGPA removed from the public site)', () => {
  it('does not declare a CGPA in the education content source', async () => {
    const content = await fs.readFile(
      path.join(ROOT, 'src/content/education/vit-chennai.md'),
      'utf-8',
    );
    expect(content).not.toMatch(/^cgpa:/m);
  });

  it('does not define a cgpa field on the education schema', async () => {
    const content = await fs.readFile(path.join(ROOT, 'src/content.config.ts'), 'utf-8');
    expect(content).not.toMatch(/cgpa/);
  });

  it('does not render a CGPA value anywhere in the Education component', async () => {
    const content = await fs.readFile(
      path.join(ROOT, 'src/components/home/Education.astro'),
      'utf-8',
    );
    expect(content).not.toMatch(/cgpa/i);
  });
});

describe('LinkedIn URL (Phase 5: reconciled to the "b" variant everywhere)', () => {
  it('uses the intended URL, with the trailing "b", as the site constant', () => {
    expect(SITE.linkedin).toBe('https://www.linkedin.com/in/gautham-balaji-18722228b');
  });

  it('MASTER_CONTENT.md states the same URL', async () => {
    const content = await fs.readFile(path.join(ROOT, 'MASTER_CONTENT.md'), 'utf-8');
    expect(content).toContain('https://www.linkedin.com/in/gautham-balaji-18722228b');
  });

  it('the obsolete URL (missing the trailing "b") is absent from active site code', async () => {
    // A naive substring check for the obsolete URL would also match the
    // correct one, since it is a prefix of it. The negative lookahead
    // excludes any occurrence that is actually the correct, longer URL.
    const obsolete = /gautham-balaji-18722228(?!b)/;
    const files = await readSourceFiles(path.join(ROOT, 'src'), [
      '.ts',
      '.tsx',
      '.astro',
      '.md',
      '.json',
    ]);
    const offenders = files.filter((file) => obsolete.test(file.content));
    expect(offenders.map((f) => f.path)).toEqual([]);
  });
});
