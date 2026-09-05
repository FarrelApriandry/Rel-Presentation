import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
//#region src/pages/api/presentations/index.ts
var presentations_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ cookies }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (!accessToken || !refreshToken) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken
	});
	if (sessionError || !sessionData.user) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
	const { data: presentations, error } = await supabase.from("presentations").select("*").eq("user_id", sessionData.user.id).order("created_at", { ascending: false });
	if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	return new Response(JSON.stringify({ presentations }), { status: 200 });
};
var POST = async ({ request, cookies }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (!accessToken || !refreshToken) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken
	});
	if (sessionError || !sessionData.user) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
	const userId = sessionData.user.id;
	const formData = await request.formData();
	const title = formData.get("title")?.toString();
	const slug = formData.get("slug")?.toString();
	const description = formData.get("description")?.toString() ?? null;
	const aiPrompt = formData.get("ai_prompt")?.toString() ?? null;
	const file = formData.get("file");
	if (!title || !slug || !file) return new Response(JSON.stringify({ error: "Title, slug, and file are required." }), { status: 400 });
	if (file.size > 10485760) return new Response(JSON.stringify({ error: "File size exceeds 10MB limit." }), { status: 400 });
	const { data: existing } = await supabase.from("presentations").select("id").eq("slug", slug).maybeSingle();
	if (existing) return new Response(JSON.stringify({ error: "Slug already exists. Choose a different one." }), { status: 409 });
	const filePath = `decks/${userId}/${slug}.html`;
	const fileBuffer = await file.arrayBuffer();
	const { error: uploadError } = await supabase.storage.from("decks").upload(filePath, fileBuffer, {
		contentType: "text/html",
		upsert: true
	});
	if (uploadError) return new Response(JSON.stringify({ error: `Upload failed: ${uploadError.message}` }), { status: 500 });
	const { data: presentation, error: insertError } = await supabase.from("presentations").insert({
		user_id: userId,
		title,
		slug,
		description,
		file_path: filePath,
		ai_prompt: aiPrompt,
		is_public: true
	}).select().single();
	if (insertError) {
		await supabase.storage.from("decks").remove([filePath]);
		return new Response(JSON.stringify({ error: `Database insert failed: ${insertError.message}` }), { status: 500 });
	}
	return new Response(JSON.stringify({ presentation }), { status: 201 });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/presentations/index@_@ts
var page = () => presentations_exports;
//#endregion
export { page };
