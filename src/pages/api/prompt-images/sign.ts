import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'images';
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg']);

function extFromMime(mime: string, filename: string): string {
  if (mime === 'image/png') return 'png';
  const original = filename.split('.').pop()?.toLowerCase() ?? '';
  if (original === 'jpg' || original === 'jpeg') return original === 'jpeg' ? 'jpeg' : 'jpg';
  // Default for image/jpeg without usable extension
  return 'jpg';
}

function sanitizeBase(filename: string): string {
  const base = filename.split('/').pop()?.split('\\').pop() ?? 'image';
  const withoutExt = base.replace(/\.[^.]*$/, '');
  const cleaned = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return cleaned || 'image';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured: missing Supabase env.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let filename = '';
  let contentType = '';
  let size = 0;
  try {
    const body = await request.json();
    filename = typeof body.filename === 'string' ? body.filename : '';
    contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
    size = typeof body.size === 'number' ? body.size : 0;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!filename.trim()) {
    return new Response(JSON.stringify({ error: 'filename is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fallback when browser leaves type empty: infer from extension.
  if (!contentType || contentType === 'application/octet-stream') {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.png')) contentType = 'image/png';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
  }

  if (!ALLOWED_MIME.has(contentType)) {
    return new Response(
      JSON.stringify({ error: 'Only PNG and JPG images are allowed.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!Number.isFinite(size) || size <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid file size.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (size > MAX_BYTES) {
    return new Response(
      JSON.stringify({ error: 'File exceeds the 50MB limit.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !sessionData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = sessionData.user.id;
  const ext = extFromMime(contentType, filename);
  const path = `prompt-images/${userId}/${crypto.randomUUID()}-${sanitizeBase(filename)}.${ext}`;

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (signedError || !signedData) {
    return new Response(
      JSON.stringify({ error: `Failed to prepare upload: ${signedError?.message ?? 'unknown error'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // supabase-js v2 returns { signedUrl, path, token }. Normalize to absolute URL.
  const rawSignedUrl = (signedData as { signedUrl?: string; signedURL?: string }).signedUrl
    ?? (signedData as { signedURL?: string }).signedURL
    ?? '';
  const token = (signedData as { token?: string }).token ?? '';
  const signedUrl = rawSignedUrl.startsWith('http')
    ? rawSignedUrl
    : `${supabaseUrl.replace(/\/$/, '')}/storage/v1${rawSignedUrl.startsWith('/') ? '' : '/'}${rawSignedUrl}`;

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return new Response(
    JSON.stringify({
      path,
      signedUrl,
      token,
      publicUrl: publicUrlData.publicUrl,
      contentType,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
