import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate, x as createAstro } from "./server_Blh08s3f.mjs";
import { t as createComponent } from "./compiler_C8N4MCtW.mjs";
import { t as $$Layout } from "./Layout_CYXF_Hfb.mjs";
//#region src/pages/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Login = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Login;
	const error = Astro.url.searchParams.get("error");
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login — AI Deck Presenter" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="flex min-h-screen items-center justify-center px-4" style="background-color: var(--bg-main);"><div class="w-full max-w-sm rounded-2xl p-8" style="
        background-color: var(--surface-card);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-subtle);
        border-radius: var(--radius-lg);
      "><div class="mb-8 text-center"><h1 class="text-2xl font-semibold tracking-tight" style="color: var(--text-main);">AI Deck Presenter</h1><p class="mt-1 text-sm" style="color: var(--text-muted);">Sign in to manage your presentations</p></div>${error && renderTemplate`<div class="mb-4 rounded-lg px-4 py-3 text-sm" style="
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
          ">${decodeURIComponent(error)}</div>`}<form method="POST" action="/api/auth/login" class="flex flex-col gap-4"><div class="flex flex-col gap-1.5"><label for="email" class="text-sm font-medium" style="color: var(--text-sub);">Email</label><input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" class="px-3.5 py-2.5 text-sm outline-none transition-colors" style="
              background-color: var(--surface-muted);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-sm);
              color: var(--text-main);
            "></div><div class="flex flex-col gap-1.5"><label for="password" class="text-sm font-medium" style="color: var(--text-sub);">Password</label><input id="password" name="password" type="password" required autocomplete="current-password" placeholder="••••••••" class="px-3.5 py-2.5 text-sm outline-none transition-colors" style="
              background-color: var(--surface-muted);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-sm);
              color: var(--text-main);
            "></div><button type="submit" class="mt-2 cursor-pointer px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-px" style="
            background-color: var(--color-accent);
            border-radius: var(--radius-sm);
            border: none;
          ">Sign In</button></form></div></main>` })}`;
}, "/home/rel/Development/GitHub/rel-presentation/src/pages/login.astro", void 0);
var $$file = "/home/rel/Development/GitHub/rel-presentation/src/pages/login.astro";
var $$url = "/login";
//#endregion
//#region \0virtual:astro:page:src/pages/login@_@astro
var page = () => login_exports;
//#endregion
export { page };
