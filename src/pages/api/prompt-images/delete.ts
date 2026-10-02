import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'images';

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

  let path = '';
  try {
    const body = await request.json();
    path = typeof body.path === 'string' ? body.path : '';
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!path.startsWith('prompt-images/')) {
    return new Response(JSON.stringify({ error: 'Invalid path.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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

  // Users may only delete their own folder: prompt-images/{userId}/...
  const expectedPrefix = `prompt-images/${sessionData.user.id}/`;
  if (!path.startsWith(expectedPrefix)) {
    return new Response(JSON.stringify({ error: 'Forbidden.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
  if (removeError) {
    return new Response(JSON.stringify({ error: `Delete failed: ${removeError.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
