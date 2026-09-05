import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/auth/signout.ts
var signout_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ cookies, redirect }) => {
	cookies.delete("sb-access-token", { path: "/" });
	cookies.delete("sb-refresh-token", { path: "/" });
	return redirect("/login");
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/signout@_@ts
var page = () => signout_exports;
//#endregion
export { page };
