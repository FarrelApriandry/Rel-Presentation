import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
//#region src/pages/api/presentations/[slug]/serve.ts
var serve_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ params, cookies }) => {
	const { slug } = params;
	if (!slug) return new Response("Not found", { status: 404 });
	const { data: presentation, error } = await supabase.from("presentations").select("*").eq("slug", slug).maybeSingle();
	if (error || !presentation) return new Response("Not found", { status: 404 });
	if (!presentation.is_public) {
		const accessToken = cookies.get("sb-access-token")?.value;
		const refreshToken = cookies.get("sb-refresh-token")?.value;
		if (!accessToken || !refreshToken) return new Response("Not found", { status: 404 });
		try {
			const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken
			});
			if (sessionError || sessionData.user?.id !== presentation.user_id) return new Response("Not found", { status: 404 });
		} catch {
			return new Response("Not found", { status: 404 });
		}
	}
	const { data: fileData, error: downloadError } = await supabase.storage.from("decks").download(presentation.file_path);
	if (downloadError || !fileData) return new Response("Failed to load presentation", { status: 500 });
	const html = await fileData.text();
	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Content-Disposition": "inline",
			"Cache-Control": "public, max-age=300"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/presentations/[slug]/serve@_@ts
var page = () => serve_exports;
//#endregion
export { page };
