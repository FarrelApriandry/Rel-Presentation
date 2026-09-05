import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
//#region src/pages/api/presentations/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({ DELETE: () => DELETE });
var DELETE = async ({ params, cookies }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (!accessToken || !refreshToken) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken
	});
	if (sessionError || !sessionData.user) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
	const { id } = params;
	if (!id) return new Response(JSON.stringify({ error: "Missing presentation ID" }), { status: 400 });
	const { data: presentation, error: fetchError } = await supabase.from("presentations").select("*").eq("id", id).eq("user_id", sessionData.user.id).single();
	if (fetchError || !presentation) return new Response(JSON.stringify({ error: "Presentation not found or access denied" }), { status: 404 });
	const { error: storageError } = await supabase.storage.from("decks").remove([presentation.file_path]);
	if (storageError) return new Response(JSON.stringify({ error: `Storage delete failed: ${storageError.message}` }), { status: 500 });
	const { error: dbError } = await supabase.from("presentations").delete().eq("id", id).eq("user_id", sessionData.user.id);
	if (dbError) return new Response(JSON.stringify({ error: `Database delete failed: ${dbError.message}` }), { status: 500 });
	return new Response(JSON.stringify({ success: true }), { status: 200 });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/presentations/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
