import type { APIRoute } from 'astro';

/**
 * POST /api/generate-deck
 *
 * Server-side endpoint that forwards the user's presentation prompt to the
 * Gemini REST API and returns a cleaned, self-contained HTML string together
 * with a title and URL-safe slug extracted from the HTML <title> tag.
 */

function cleanGeminiHtml(raw: string): string {
  // Strip markdown code fences (```html ... ``` or ``` ... ```)
  const stripped = raw.replace(/^```(?:html|htm)?\s*\n?([\s\S]*?)\n?\s*```$/gm, '$1');
  return stripped.trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() || 'Untitled Presentation';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error: missing API key.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let prompt: string;
  try {
    const body = await request.json();
    prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!prompt) {
    return new Response(
      JSON.stringify({ success: false, error: 'Prompt is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const systemInstruction =
    'You are an expert HTML presentation generator. ' +
    'Output ONLY a single, self-contained HTML file — no explanations, no markdown fences, no commentary. ' +
    'The HTML must include all CSS inline (or via a Tailwind CDN <script>), all fonts (e.g. Google Fonts CDN links), ' +
    'and any required JavaScript inline. It must be renderable in any modern browser with zero external dependencies ' +
    'beyond CDN links embedded in the HTML. Use semantic markup and ensure a 16:9 slide layout.';

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to reach Gemini API.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text().catch(() => 'Unknown error');
    return new Response(
      JSON.stringify({ success: false, error: `Gemini API error (${geminiResponse.status}): ${errorText}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let data: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  try {
    data = await geminiResponse.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to parse Gemini API response.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rawHtml = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawHtml) {
    return new Response(
      JSON.stringify({ success: false, error: 'Gemini returned an empty response.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const html = cleanGeminiHtml(rawHtml);
  const title = extractTitle(html);
  const slug = slugify(title);

  return new Response(
    JSON.stringify({ success: true, html, title, slug }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
