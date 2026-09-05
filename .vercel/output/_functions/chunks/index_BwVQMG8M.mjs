import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { x as createAstro } from "./server_Blh08s3f.mjs";
import { t as createComponent } from "./compiler_C8N4MCtW.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
createAstro("https://astro.build");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	return Astro.redirect("/login");
}, "/home/rel/Development/GitHub/rel-presentation/src/pages/index.astro", void 0);
var $$file = "/home/rel/Development/GitHub/rel-presentation/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
