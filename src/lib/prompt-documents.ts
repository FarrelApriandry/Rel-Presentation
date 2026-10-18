/* ── Prompt reference documents (text-based file uploads) ── */

export const MAX_PROMPT_DOC_BYTES = 10 * 1024 * 1024; // 10MB per file
export const MAX_PROMPT_DOC_CHARS = 80_000; // hard cap on parsed content per document

/**
 * Text-based formats the UI accepts. ODT is a ZIP package with a primary
 * content.xml inside — it is flattened to plain text at parse time on the
 * server (/api/prompt-docs/parse). Nothing is stored; only the extracted
 * text is carried into the prompt.
 */
export const ACCEPTED_DOC_EXTENSIONS = [
  'txt', 'md', 'markdown', 'odt', 'csv', 'tsv',
  'log', 'json', 'yaml', 'yml', 'ini', 'toml',
] as const;

export const PROMPT_DOCUMENT_ACCEPT =
  '.txt,.md,.markdown,.odt,.csv,.tsv,.log,.json,.yaml,.yml,.ini,.toml';

/** One parsed reference document — `text` is embedded into the prompt. */
export interface PromptDocument {
  name: string;
  text: string;
  chars: number;
  truncated?: boolean;
}

export type PromptDocumentParseErrorCode =
  | 'invalid-type'
  | 'too-large'
  | 'empty-file'
  | 'parse-failed';

export interface PromptDocumentValidation {
  ok: boolean;
  code?: PromptDocumentParseErrorCode;
  message?: string;
}

export function getDocExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase().trim() ?? '';
}

export function validatePromptDocumentFile(file: File): PromptDocumentValidation {
  if (!file || file.size <= 0) {
    return { ok: false, code: 'empty-file', message: `“${file?.name ?? 'file'}” is empty.` };
  }

  const ext = getDocExt(file.name);
  if (!(ACCEPTED_DOC_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      ok: false,
      code: 'invalid-type',
      message: `“${file.name}” is not a supported format. Allowed: ${ACCEPTED_DOC_EXTENSIONS.join(', ')}.`,
    };
  }

  if (file.size > MAX_PROMPT_DOC_BYTES) {
    return {
      ok: false,
      code: 'too-large',
      message: `“${file.name}” exceeds the 10MB limit.`,
    };
  }

  return { ok: true };
}

/* ── Upload + parse round-trip ── */

export interface ParsedDocumentResponse {
  success: boolean;
  error?: string;
  filename: string;
  parsedText: string;
  truncated: boolean;
  charCount: number;
}

/**
 * Uploads a file to /api/prompt-docs/parse (multipart) and returns the
 * server-extracted plain text, ready to embed into the prompt.
 */
export async function parsePromptDocument(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<PromptDocument> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const res = await fetch('/api/prompt-docs/parse', {
    method: 'POST',
    body: formData,
    signal,
  });

  const data: ParsedDocumentResponse = await res.json().catch(() => ({ success: false, error: 'Malformed server response.', filename: file.name, parsedText: '', truncated: false, charCount: 0 }));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to parse document.');
  }
  onProgress?.(100);

  return {
    name: file.name,
    text: data.parsedText,
    chars: data.charCount ?? data.parsedText.length,
    truncated: data.truncated ?? false,
  };
}

/* ── Prompt embedding ── */

/**
 * Renders parsed documents as a reference block for the prompt. Each
 * document is wrapped in markers so the model can tell where one file
 * ends and another begins.
 */
export function buildDocumentsSection(documents: PromptDocument[]): string {
  if (!Array.isArray(documents) || documents.length === 0) return '';

  const blocks = documents.map((doc, idx) => {
    const name = (doc.name || `Document ${idx + 1}`).replace(/[\n\r]/g, ' ').trim();
    return `### Reference document ${idx + 1}: ${name}\n<doc>\n${doc.text}\n</doc>`;
  });

  return (
    '\n\nThe following reference documents were uploaded by the presenter. ' +
    'Use the document contents as the primary source of facts, data, and narrative for the presentation. ' +
    'Do not invent facts outside the documents; if the topic requires material beyond them, ' +
    'treat the documents as the main context and everything else as general supporting material.\n' +
    blocks.join('\n\n')
  );
}
