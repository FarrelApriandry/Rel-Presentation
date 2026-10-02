/* ── Prompt reference images (Supabase `images` bucket) ── */

export const PROMPT_IMAGES_BUCKET = 'images';

export const MAX_PROMPT_IMAGE_BYTES = 50 * 1024 * 1024; // 50MB per file

export const ACCEPTED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'] as const;

export const PROMPT_IMAGE_ACCEPT = '.png,.jpg,.jpeg,image/png,image/jpeg';

export type PromptImageUploadErrorCode =
  | 'invalid-type'
  | 'too-large'
  | 'empty-file';

export interface PromptImageValidation {
  ok: boolean;
  code?: PromptImageUploadErrorCode;
  message?: string;
}

const EXTENSION_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export function getMimeFromFilename(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase().trim() ?? '';
  return EXTENSION_TO_MIME[ext] ?? null;
}

export function validatePromptImageFile(file: File): PromptImageValidation {
  if (!file || file.size <= 0) {
    return { ok: false, code: 'empty-file', message: 'File is empty.' };
  }

  // Some OS/browsers leave `type` empty — fall back to extension check.
  const mime = file.type || getMimeFromFilename(file.name) || '';
  const normalized = mime.toLowerCase();

  const isAccepted =
    (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(normalized) ||
    (normalized === '' && getMimeFromFilename(file.name) !== null);

  if (!isAccepted) {
    return {
      ok: false,
      code: 'invalid-type',
      message: `“${file.name}” must be PNG or JPG.`,
    };
  }

  if (file.size > MAX_PROMPT_IMAGE_BYTES) {
    return {
      ok: false,
      code: 'too-large',
      message: `“${file.name}” exceeds the 50MB limit.`,
    };
  }

  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[idx]}`;
}

export interface SignedUploadResponse {
  path: string;
  signedUrl: string;
  token: string;
  publicUrl: string;
  contentType?: string;
}

export async function requestSignedUploadUrl(file: File): Promise<SignedUploadResponse> {
  const res = await fetch('/api/prompt-images/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || getMimeFromFilename(file.name) || 'image/jpeg',
      size: file.size,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to prepare upload.');
  }
  if (!data.path || !data.signedUrl || !data.publicUrl) {
    throw new Error('Upload preparation returned an incomplete response.');
  }
  return data as SignedUploadResponse;
}

/**
 * Uploads a file with XHR so we can report progress (needed for large 50MB files).
 */
export function uploadFileWithProgress(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);

    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const onAbort = () => xhr.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      }
    };

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('Network error during upload.'));
    };

    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    xhr.send(file);
  });
}

export async function deletePromptImage(path: string): Promise<void> {
  const res = await fetch('/api/prompt-images/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete image.');
  }
}
