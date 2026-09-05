import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params, cookies }) => {
  const { slug } = params;

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  // Fetch presentation by slug
  const { data: presentation, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !presentation) {
    return new Response('Not found', { status: 404 });
  }

  // If not public, verify owner
  if (!presentation.is_public) {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError || sessionData.user?.id !== presentation.user_id) {
        return new Response('Not found', { status: 404 });
      }
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }

  // Download the HTML file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('decks')
    .download(presentation.file_path);

  if (downloadError || !fileData) {
    return new Response('Failed to load presentation', { status: 500 });
  }

  const html = await fileData.text();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
