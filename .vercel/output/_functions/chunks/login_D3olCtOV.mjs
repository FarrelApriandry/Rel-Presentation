import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
//#region src/pages/api/auth/login.ts
var login_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request, cookies, redirect }) => {
	const formData = await request.formData();
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	if (!email || !password) return redirect("/login?error=" + encodeURIComponent("Email and password are required."));
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});
	if (error) return redirect("/login?error=" + encodeURIComponent(error.message));
	const { access_token, refresh_token } = data.session;
	cookies.set("sb-access-token", access_token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax"
	});
	cookies.set("sb-refresh-token", refresh_token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax"
	});
	return redirect("/dashboard");
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/login@_@ts
var page = () => login_exports;
//#endregion
export { page };
