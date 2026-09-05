import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, x as createAstro } from "./server_Blh08s3f.mjs";
import { t as createComponent } from "./compiler_C8N4MCtW.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
import { t as $$Layout } from "./Layout_CYXF_Hfb.mjs";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Maximize, Minimize, Share2 } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/viewer/FloatingControls.tsx
function FloatingControls({ shareUrl }) {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [copied, setCopied] = useState(false);
	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
		else document.exitFullscreen().then(() => setIsFullscreen(false));
	}, []);
	const handleShare = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		} catch {}
	}, [shareUrl]);
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 20,
			scale: .9
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1
		},
		transition: {
			delay: .5,
			duration: .3,
			ease: [
				.16,
				1,
				.3,
				1
			]
		},
		className: "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl p-2",
		style: {
			background: "rgba(255, 255, 255, 0.7)",
			backdropFilter: "blur(12px)",
			WebkitBackdropFilter: "blur(12px)",
			border: "1px solid rgba(228, 228, 231, 0.6)",
			boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
		},
		children: [/* @__PURE__ */ jsx("button", {
			onClick: toggleFullscreen,
			title: isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
			className: "flex cursor-pointer items-center justify-center rounded-xl p-2.5 transition-all hover:-translate-y-px",
			style: {
				color: "var(--text-sub, #52525b)",
				backgroundColor: "transparent",
				border: "none"
			},
			children: isFullscreen ? /* @__PURE__ */ jsx(Minimize, { size: 18 }) : /* @__PURE__ */ jsx(Maximize, { size: 18 })
		}), /* @__PURE__ */ jsx("button", {
			onClick: handleShare,
			title: "Copy share link",
			className: "flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all hover:-translate-y-px",
			style: {
				color: copied ? "#16a34a" : "var(--text-sub, #52525b)",
				backgroundColor: copied ? "#dcfce7" : "transparent",
				border: "none"
			},
			children: /* @__PURE__ */ jsx(AnimatePresence, {
				mode: "wait",
				children: copied ? /* @__PURE__ */ jsxs(motion.span, {
					initial: { scale: 0 },
					animate: { scale: 1 },
					exit: { scale: 0 },
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ jsx(Check, { size: 14 }), "Copied!"]
				}, "check") : /* @__PURE__ */ jsxs(motion.span, {
					initial: { scale: 0 },
					animate: { scale: 1 },
					exit: { scale: 0 },
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ jsx(Share2, { size: 14 }), "Share"]
				}, "share")
			})
		})]
	});
}
//#endregion
//#region src/pages/p/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug } = Astro.params;
	if (!slug) return Astro.redirect("/login");
	const { data: presentation, error } = await supabase.from("presentations").select("*").eq("slug", slug).maybeSingle();
	if (error || !presentation) return new Response("Presentation not found", { status: 404 });
	if (!presentation.is_public) {
		const accessToken = Astro.cookies.get("sb-access-token");
		const refreshToken = Astro.cookies.get("sb-refresh-token");
		if (!accessToken || !refreshToken) return new Response("Presentation not found", { status: 404 });
		try {
			const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
				access_token: accessToken.value,
				refresh_token: refreshToken.value
			});
			if (sessionError || sessionData.user?.id !== presentation.user_id) return new Response("Presentation not found", { status: 404 });
		} catch {
			return new Response("Presentation not found", { status: 404 });
		}
	}
	const serveUrl = `/api/presentations/${slug}/serve`;
	const shareUrl = `${Astro.url.origin}/p/${slug}`;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${presentation.title} — AI Deck Presenter` }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="relative h-screen w-screen overflow-hidden" style="background-color: #000;"><iframe${addAttribute(serveUrl, "src")}${addAttribute(presentation.title, "title")} class="h-full w-full border-0" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" allow="fullscreen"></iframe>${renderComponent($$result, "FloatingControls", FloatingControls, {
		"client:load": true,
		"shareUrl": shareUrl,
		"client:component-hydration": "load",
		"client:component-path": "/home/rel/Development/GitHub/rel-presentation/src/components/viewer/FloatingControls.tsx",
		"client:component-export": "default"
	})}</div>` })}`;
}, "/home/rel/Development/GitHub/rel-presentation/src/pages/p/[slug].astro", void 0);
var $$file = "/home/rel/Development/GitHub/rel-presentation/src/pages/p/[slug].astro";
var $$url = "/p/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/p/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
