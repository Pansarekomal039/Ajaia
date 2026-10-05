import { describe, it, expect, beforeEach } from 'vitest';
import { openDb } from '@/lib/db';
import { createDoc, getDoc, listDocs, shareDoc, unshareDoc, updateDoc, deleteDoc, getAccess, HttpError } from '@/lib/docs';
import { fileToHtml, textToHtml, sanitizeDocHtml } from '@/lib/importer';

const A = 'u_alice', B = 'u_bob', C = 'u_carol';
let db: ReturnType<typeof openDb>;
beforeEach(() => { db = openDb(':memory:'); });

const status = (fn: () => unknown) => {
  try { fn(); } catch (e) { return (e as HttpError).status; }
  return 200;
};

describe('sharing and access control', () => {
  it('owner has access, strangers get 404 (existence is not leaked)', () => {
    const id = createDoc(db, A, 'Plan', '<p>x</p>');
    expect(getAccess(db, id, A)).toBe('owner');
    expect(getAccess(db, id, B)).toBeNull();
    expect(status(() => getDoc(db, id, B))).toBe(404);
  });

  it('sharing makes the doc appear under "shared" for the recipient only', () => {
    const id = createDoc(db, A, 'Plan');
    shareDoc(db, id, A, 'bob@example.com', 'viewer');
    expect(listDocs(db, B).shared.map((d: any) => d.id)).toEqual([id]);
    expect(listDocs(db, B).owned).toHaveLength(0);
    expect(listDocs(db, A).owned).toHaveLength(1);
    expect(listDocs(db, C).shared).toHaveLength(0);
  });

  it('viewer cannot edit, editor can edit content but not rename or share', () => {
    const id = createDoc(db, A, 'Plan');
    shareDoc(db, id, A, 'bob@example.com', 'viewer');
    expect(status(() => updateDoc(db, id, B, { content: '<p>hi</p>' }))).toBe(403);
    shareDoc(db, id, A, 'bob@example.com', 'editor'); // upgrade role
    expect(status(() => updateDoc(db, id, B, { content: '<p>hi</p>' }))).toBe(200);
    expect(status(() => updateDoc(db, id, B, { title: 'Hacked' }))).toBe(403);
    expect(status(() => shareDoc(db, id, B, 'carol@example.com', 'editor'))).toBe(403);
    expect(status(() => deleteDoc(db, id, B))).toBe(403);
  });

  it('revoking access removes it', () => {
    const id = createDoc(db, A, 'Plan');
    shareDoc(db, id, A, 'bob@example.com', 'editor');
    unshareDoc(db, id, A, B);
    expect(getAccess(db, id, B)).toBeNull();
  });

  it('validates share input', () => {
    const id = createDoc(db, A, 'Plan');
    expect(status(() => shareDoc(db, id, A, 'nobody@example.com', 'viewer'))).toBe(404);
    expect(status(() => shareDoc(db, id, A, 'alice@example.com', 'viewer'))).toBe(400);
    expect(status(() => shareDoc(db, id, A, 'bob@example.com', 'admin'))).toBe(400);
  });
});

describe('persistence and validation', () => {
  it('saves and reloads formatted content and renamed title', () => {
    const id = createDoc(db, A, 'Plan');
    const html = '<h1>T</h1><p><strong>b</strong> <em>i</em> <u>u</u></p><ul><li><p>x</p></li></ul>';
    updateDoc(db, id, A, { title: 'Renamed', content: html });
    const d = getDoc(db, id, A) as any;
    expect(d.title).toBe('Renamed');
    expect(d.content).toBe(html);
  });

  it('rejects empty/oversized titles', () => {
    const id = createDoc(db, A, 'Plan');
    expect(status(() => updateDoc(db, id, A, { title: '   ' }))).toBe(400);
    expect(status(() => updateDoc(db, id, A, { title: 'x'.repeat(201) }))).toBe(400);
  });
});

describe('file import', () => {
  it('turns .txt into escaped paragraphs', async () => {
    const html = await fileToHtml('n.txt', Buffer.from('Hello <b>\n\nSecond'));
    expect(html).toBe('<p>Hello &lt;b&gt;</p><p>Second</p>');
  });
  it('turns .md into headings and lists', async () => {
    const html = await fileToHtml('n.md', Buffer.from('# Title\n\n- a\n- b'));
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<li>a</li>');
  });
  it('rejects unsupported and empty files', async () => {
    await expect(fileToHtml('x.exe', Buffer.from('a'))).rejects.toMatchObject({ status: 415 });
    await expect(fileToHtml('x.txt', Buffer.alloc(0))).rejects.toMatchObject({ status: 400 });
  });
  it('strips scripts from imported markdown', async () => {
    const html = await fileToHtml('x.md', Buffer.from('hi <script>alert(1)</script>'));
    expect(html).not.toContain('script');
    expect(sanitizeDocHtml('<p onclick="x()">a</p>')).toBe('<p>a</p>');
  });
  it('textToHtml handles empty input', () => expect(textToHtml('')).toBe(''));
});
