import { marked } from 'marked';
import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { HttpError } from './docs';

export const SUPPORTED = ['.txt', '.md', '.docx'] as const;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Only tags the editor can represent survive; everything else is stripped.
export function sanitizeDocHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'br', 'blockquote', 'code', 'pre', 'hr', 's'],
    allowedAttributes: {},
  });
}

export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
}

export async function fileToHtml(name: string, data: Buffer): Promise<string> {
  const ext = extOf(name);
  if (!(SUPPORTED as readonly string[]).includes(ext))
    throw new HttpError(415, `Unsupported file type "${ext || name}". Supported: .txt, .md, .docx`);
  if (data.length === 0) throw new HttpError(400, 'The file is empty');
  if (data.length > MAX_UPLOAD_BYTES) throw new HttpError(413, 'File is too large (max 2 MB)');
  let html: string;
  if (ext === '.txt') html = textToHtml(data.toString('utf8'));
  else if (ext === '.md') html = await marked.parse(data.toString('utf8'));
  else {
    try {
      html = (await mammoth.convertToHtml({ buffer: data })).value;
    } catch {
      throw new HttpError(400, 'Could not read this .docx file (is it corrupted?)');
    }
  }
  return sanitizeDocHtml(html) || '<p></p>';
}
