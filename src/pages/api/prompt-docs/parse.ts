import type { APIRoute } from 'astro';
import { inflateRawSync } from 'node:zlib';

/**
 * POST /api/prompt-docs/parse  (multipart/form-data: `file`, optional `filename`)
 *
 * Extracts plain text from a text-based reference document so it can be embedded
 * into the presentation prompt. Supported:
 *   - flat text: .txt .md .markdown .csv .tsv .log .json .yaml .yml .ini .toml
 *   - ODT (.odt): a ZIP package — content.xml is inflated and flattened to text.
 *
 * No storage side effect: the raw bytes are parsed in-memory and only the text
 * is returned to the client (then carried in the prompt).
 */

const MAX_RAW_BYTES = 4 * 1024 * 1024; // 4MB raw — well under Vercel's body limit
const MAX_CHARS = 80_000; // cap on extracted text per document

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'log', 'json', 'yaml', 'yml', 'ini', 'toml',
]);
const ZIP_EXTENSIONS = new Set(['odt']);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ── Minimal ZIP reader (central-directory based) ── */

export function readZipEntries(buf: Buffer): Map<string, Buffer> {
  const EOCD_SIG = 0x06054b50;
  const CD_SIG = 0x02014b50;
  const LH_SIG = 0x04034b50;

  // Locate End Of Central Directory record (scan backwards, comment may follow).
  let eocd = -1;
  const minPos = Math.max(0, buf.length - 22 - 65536);
  for (let i = buf.length - 22; i >= minPos; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a valid ZIP/ODT archive.');

  const cdEntries = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);

  const entries = new Map<string, Buffer>();
  let p = cdOffset;
  for (let n = 0; n < cdEntries; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== CD_SIG) break;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localHeaderOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;

    if (buf.readUInt32LE(localHeaderOffset) !== LH_SIG) continue;
    const lhNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const lhExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
    const compData = buf.subarray(dataStart, dataStart + compSize);

    let data: Buffer;
    if (method === 0) data = Buffer.from(compData);
    else if (method === 8) data = inflateRawSync(compData);
    else continue; // unsupported compression method — skip entry
    entries.set(name, data);
  }
  return entries;
}

/* ── ODT content.xml → plain text ── */

export function odtToText(xml: string): string {
  let s = xml;
  // Block-level separators so structure survives tag stripping.
  s = s.replace(/<text:h(\s[^>]*)?>/g, '\n\n## ');
  s = s.replace(/<\/text:h>/g, '\n\n');
  // Strip closing tags inside list items first so bullets don't end up
  // dangling after a newline (a bare "-" on its own line).
  s = s.replace(/<text:list-item(\s[^>]*)?>\s*<text:p(\s[^>]*)?>/g, '\n- ');
  s = s.replace(/<\/text:p>\s*<\/text:list-item>/g, '');
  s = s.replace(/<text:p(\s[^>]*)?>/g, '');
  s = s.replace(/<\/text:p>/g, '\n');
  s = s.replace(/<text:list-item(\s[^>]*)?>/g, '\n- ');
  s = s.replace(/<\/text:list-item>/g, '');
  s = s.replace(/<\/table:table-cell>/g, '\t');
  s = s.replace(/<\/table:table-row>/g, '\n');
  s = s.replace(/<text:line-break\s*\/>/g, '\n');
  s = s.replace(/<text:tab\s*\/>/g, '\t');
  s = s.replace(/<text:s(\s[^>]*)?\/>/g, ' ');
  // Drop every remaining tag.
  s = s.replace(/<[^>]+>/g, '');
  // Decode the XML entities ODT emits.
  s = s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&');
  // Tidy whitespace.
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Expected multipart/form-data body.' }, 400);
  }

  const file = form.get('file');
  const fallbackName = typeof form.get('filename') === 'string' ? String(form.get('filename')) : '';
  if (!(file instanceof File)) {
    return json({ error: 'No file uploaded.' }, 400);
  }

  const filename = file.name || fallbackName || 'document';
  const ext = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : '';

  if (file.size <= 0) return json({ error: 'File is empty.' }, 400);
  if (file.size > MAX_RAW_BYTES) {
    return json({ error: `File exceeds the ${MAX_RAW_BYTES / 1024 / 1024}MB limit.` }, 413);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let text = '';

  try {
    if (ZIP_EXTENSIONS.has(ext)) {
      const entries = readZipEntries(buf);
      const contentXml = entries.get('content.xml');
      if (!contentXml) return json({ error: 'ODT archive is missing content.xml.' }, 422);
      text = odtToText(contentXml.toString('utf8'));
    } else if (TEXT_EXTENSIONS.has(ext)) {
      text = buf.toString('utf8');
    } else {
      return json({ error: `Unsupported format: .${ext || '(none)'}` }, 400);
    }
  } catch (err) {
    return json({ error: `Parse failed: ${err instanceof Error ? err.message : 'unknown error'}` }, 422);
  }

  text = text.replace(/\r\n/g, '\n').trim();

  if (!text) {
    return json({ error: 'No readable text could be extracted from this file.' }, 422);
  }

  const truncated = text.length > MAX_CHARS;
  if (truncated) text = text.slice(0, MAX_CHARS);

  return json({
    success: true,
    filename,
    parsedText: text,
    truncated,
    charCount: text.length,
  });
};
