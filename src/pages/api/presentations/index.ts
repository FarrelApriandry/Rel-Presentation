import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError || !sessionData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const { data: presentations, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', sessionData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ presentations }), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError || !sessionData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const userId = sessionData.user.id;

  const formData = await request.formData();
  const title = formData.get('title')?.toString();
  const slug = formData.get('slug')?.toString();
  const description = formData.get('description')?.toString() ?? null;
  const aiPrompt = formData.get('ai_prompt')?.toString() ?? null;
  const file = formData.get('file') as File | null;
  const thumbnail = formData.get('thumbnail') as File | null;

  if (!title || !slug || !file) {
    return new Response(
      JSON.stringify({ error: 'Title, slug, and file are required.' }),
      { status: 400 },
    );
  }

  // Validate file size (10MB max — NFR-4.2)
  if (file.size > 10 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: 'File size exceeds 10MB limit.' }),
      { status: 400 },
    );
  }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('presentations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Slug already exists. Choose a different one.' }),
      { status: 409 },
    );
  }

  // Upload file to Supabase Storage
  const filePath = `decks/${userId}/${slug}.html`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('decks')
    .upload(filePath, fileBuffer, {
      contentType: 'text/html',
      upsert: true,
    });

  if (uploadError) {
    return new Response(
      JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
      { status: 500 },
    );
  }

  // Upload thumbnail if provided
  let thumbnailUrl: string | null = null;
  let thumbnailPath: string | null = null;

  if (thumbnail) {
    thumbnailPath = `decks/${userId}/thumbnails/${slug}.webp`;
    const thumbnailBuffer = await thumbnail.arrayBuffer();

    const { error: thumbnailUploadError } = await supabase.storage
      .from('decks')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!thumbnailUploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('decks')
        .getPublicUrl(thumbnailPath);
      thumbnailUrl = publicUrlData.publicUrl;
    }
  }

  // Insert metadata into presentations table
  const { data: presentation, error: insertError } = await supabase
    .from('presentations')
    .insert({
      user_id: userId,
      title,
      slug,
      description,
      file_path: filePath,
      ai_prompt: aiPrompt,
      is_public: true,
      thumbnail_url: thumbnailUrl,
    })
    .select()
    .single();

  if (insertError) {
    // Clean up uploaded files on DB insert failure
    const filesToRemove = [filePath];
    if (thumbnailPath) filesToRemove.push(thumbnailPath);
    await supabase.storage.from('decks').remove(filesToRemove);
    return new Response(
      JSON.stringify({ error: `Database insert failed: ${insertError.message}` }),
      { status: 500 },
    );
  }

  return new Response(JSON.stringify({ presentation }), { status: 201 });
};