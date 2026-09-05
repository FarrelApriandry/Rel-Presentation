import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, x as createAstro } from "./server_Blh08s3f.mjs";
import { t as createComponent } from "./compiler_C8N4MCtW.mjs";
import { t as supabase } from "./supabase_DdIAacED.mjs";
import { t as $$Layout } from "./Layout_CYXF_Hfb.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Eye, FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/dashboard/UploadModal.tsx
var overlayVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 }
};
var modalVariants = {
	hidden: {
		opacity: 0,
		scale: .95,
		y: 10
	},
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: .2,
			ease: [
				.16,
				1,
				.3,
				1
			]
		}
	},
	exit: {
		opacity: 0,
		scale: .95,
		y: 10,
		transition: { duration: .15 }
	}
};
function UploadModal({ isOpen, onClose, onUploaded }) {
	const [form, setForm] = useState({
		title: "",
		slug: "",
		description: "",
		aiPrompt: "",
		file: null
	});
	const [isDragging, setIsDragging] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const fileInputRef = useRef(null);
	const resetForm = useCallback(() => {
		setForm({
			title: "",
			slug: "",
			description: "",
			aiPrompt: "",
			file: null
		});
		setError(null);
		setIsSubmitting(false);
	}, []);
	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);
	const generateSlug = useCallback((t) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim(), []);
	const handleTitleChange = useCallback((e) => {
		const title = e.target.value;
		setForm((prev) => ({
			...prev,
			title,
			slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug
		}));
	}, [generateSlug]);
	const handleFileSelect = useCallback((file) => {
		if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
			setError("Only .html files are accepted.");
			return;
		}
		if (file.size > 10485760) {
			setError("File size exceeds 10MB limit.");
			return;
		}
		setError(null);
		setForm((prev) => ({
			...prev,
			file
		}));
	}, []);
	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFileSelect(file);
	}, [handleFileSelect]);
	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);
	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);
	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		setError(null);
		if (!form.file || !form.title || !form.slug) {
			setError("Title, slug, and file are required.");
			return;
		}
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("title", form.title);
			formData.append("slug", form.slug);
			formData.append("description", form.description);
			formData.append("ai_prompt", form.aiPrompt);
			formData.append("file", form.file);
			const response = await fetch("/api/presentations", {
				method: "POST",
				body: formData
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || "Upload failed");
			resetForm();
			onUploaded();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.");
		} finally {
			setIsSubmitting(false);
		}
	}, [
		form,
		onUploaded,
		onClose,
		resetForm
	]);
	const inputStyle = {
		backgroundColor: "var(--surface-muted)",
		border: "1px solid var(--border-color)",
		borderRadius: "var(--radius-sm)",
		color: "var(--text-main)"
	};
	const labelStyle = { color: "var(--text-sub)" };
	return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs(motion.div, {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		variants: overlayVariants,
		initial: "hidden",
		animate: "visible",
		exit: "hidden",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0",
			style: {
				backgroundColor: "rgba(0,0,0,0.4)",
				backdropFilter: "blur(4px)"
			},
			onClick: handleClose
		}), /* @__PURE__ */ jsxs(motion.div, {
			className: "relative w-full max-w-lg overflow-y-auto p-6",
			style: {
				backgroundColor: "var(--surface-card)",
				border: "1px solid var(--border-color)",
				boxShadow: "var(--shadow-subtle)",
				borderRadius: "var(--radius-lg)",
				maxHeight: "90vh"
			},
			variants: modalVariants,
			initial: "hidden",
			animate: "visible",
			exit: "exit",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-semibold",
						style: { color: "var(--text-main)" },
						children: "Upload Presentation"
					}), /* @__PURE__ */ jsx("button", {
						onClick: handleClose,
						className: "cursor-pointer rounded-lg p-1.5 hover:opacity-70",
						style: {
							color: "var(--text-muted)",
							border: "none",
							background: "none"
						},
						children: /* @__PURE__ */ jsx(X, { size: 18 })
					})]
				}),
				error && /* @__PURE__ */ jsx("div", {
					className: "mb-4 rounded-lg px-4 py-3 text-sm",
					style: {
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b"
					},
					children: error
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							onDrop: handleDrop,
							onDragOver: handleDragOver,
							onDragLeave: handleDragLeave,
							onClick: () => fileInputRef.current?.click(),
							className: "flex cursor-pointer flex-col items-center justify-center gap-2 p-6 transition-colors",
							style: {
								border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--border-color)"}`,
								backgroundColor: isDragging ? "color-mix(in srgb, var(--color-accent) 5%, transparent)" : "var(--surface-muted)",
								borderRadius: "var(--radius-md)"
							},
							children: [/* @__PURE__ */ jsx("input", {
								ref: fileInputRef,
								type: "file",
								accept: ".html,.htm",
								className: "hidden",
								onChange: (e) => {
									const f = e.target.files?.[0];
									if (f) handleFileSelect(f);
								}
							}), form.file ? /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ jsx(FileText, {
										size: 20,
										style: { color: "var(--color-accent)" }
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-sm font-medium",
										style: { color: "var(--text-main)" },
										children: form.file.name
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-xs",
										style: { color: "var(--text-muted)" },
										children: [
											"(",
											(form.file.size / 1024).toFixed(1),
											" KB)"
										]
									})
								]
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
								/* @__PURE__ */ jsx(Upload, {
									size: 24,
									style: { color: "var(--text-muted)" }
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-sm",
									style: { color: "var(--text-muted)" },
									children: "Drag and drop .html file, or click to browse"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs",
									style: { color: "var(--text-muted)" },
									children: "Max 10MB"
								})
							] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsxs("label", {
								htmlFor: "title",
								className: "text-sm font-medium",
								style: labelStyle,
								children: ["Title ", /* @__PURE__ */ jsx("span", {
									style: { color: "#ef4444" },
									children: "*"
								})]
							}), /* @__PURE__ */ jsx("input", {
								id: "title",
								type: "text",
								required: true,
								value: form.title,
								onChange: handleTitleChange,
								placeholder: "My Awesome Presentation",
								className: "px-3.5 py-2.5 text-sm outline-none",
								style: inputStyle
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsxs("label", {
								htmlFor: "slug",
								className: "text-sm font-medium",
								style: labelStyle,
								children: ["Custom Slug ", /* @__PURE__ */ jsx("span", {
									style: { color: "#ef4444" },
									children: "*"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center",
								children: [/* @__PURE__ */ jsx("span", {
									className: "shrink-0 px-3 py-2.5 text-sm",
									style: {
										backgroundColor: "var(--surface-muted)",
										border: "1px solid var(--border-color)",
										borderRight: "none",
										borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
										color: "var(--text-muted)"
									},
									children: "/p/"
								}), /* @__PURE__ */ jsx("input", {
									id: "slug",
									type: "text",
									required: true,
									pattern: "[a-z0-9\\-]+",
									value: form.slug,
									onChange: (e) => setForm((prev) => ({
										...prev,
										slug: e.target.value
									})),
									placeholder: "my-presentation",
									className: "flex-1 px-3.5 py-2.5 text-sm outline-none",
									style: {
										...inputStyle,
										borderLeft: "none",
										borderTopLeftRadius: 0,
										borderBottomLeftRadius: 0
									}
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "description",
								className: "text-sm font-medium",
								style: labelStyle,
								children: "Description"
							}), /* @__PURE__ */ jsx("input", {
								id: "description",
								type: "text",
								value: form.description,
								onChange: (e) => setForm((prev) => ({
									...prev,
									description: e.target.value
								})),
								placeholder: "Short description (optional)",
								className: "px-3.5 py-2.5 text-sm outline-none",
								style: inputStyle
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "ai-prompt",
								className: "text-sm font-medium",
								style: labelStyle,
								children: "AI Prompt Notes"
							}), /* @__PURE__ */ jsx("textarea", {
								id: "ai-prompt",
								rows: 3,
								value: form.aiPrompt,
								onChange: (e) => setForm((prev) => ({
									...prev,
									aiPrompt: e.target.value
								})),
								placeholder: "Notes about the AI prompt used (optional)",
								className: "resize-none px-3.5 py-2.5 text-sm outline-none",
								style: inputStyle
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex justify-end gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleClose,
								className: "cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors",
								style: {
									color: "var(--text-sub)",
									backgroundColor: "transparent",
									border: "1px solid var(--border-color)",
									borderRadius: "var(--radius-sm)"
								},
								children: "Cancel"
							}), /* @__PURE__ */ jsx("button", {
								type: "submit",
								disabled: isSubmitting,
								className: "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-px disabled:opacity-50",
								style: {
									backgroundColor: "var(--color-accent)",
									borderRadius: "var(--radius-sm)",
									border: "none"
								},
								children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}), "Uploading..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Upload, { size: 16 }), "Upload"] })
							})]
						})
					]
				})
			]
		})]
	}) });
}
//#endregion
//#region src/components/dashboard/PresentationGrid.tsx
var cardVariants = {
	hidden: {
		opacity: 0,
		y: 12
	},
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * .05,
			duration: .25,
			ease: [
				.16,
				1,
				.3,
				1
			]
		}
	}),
	exit: {
		opacity: 0,
		scale: .95,
		transition: { duration: .15 }
	}
};
function PresentationGrid({ refreshTrigger }) {
	const [presentations, setPresentations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [copiedId, setCopiedId] = useState(null);
	const [deletingId, setDeletingId] = useState(null);
	const fetchPresentations = useCallback(async () => {
		try {
			const res = await fetch("/api/presentations");
			if (!res.ok) throw new Error("Failed");
			const data = await res.json();
			setPresentations(data.presentations ?? []);
		} catch {
			setPresentations([]);
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		setIsLoading(true);
		fetchPresentations();
	}, [fetchPresentations, refreshTrigger]);
	const handleCopyLink = useCallback(async (slug, id) => {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 2e3);
		} catch {}
	}, []);
	const handleDelete = useCallback(async (id) => {
		if (!confirm("Are you sure you want to delete this presentation?")) return;
		setDeletingId(id);
		try {
			const res = await fetch(`/api/presentations/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const d = await res.json();
				throw new Error(d.error || "Delete failed");
			}
			setPresentations((prev) => prev.filter((p) => p.id !== id));
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		} finally {
			setDeletingId(null);
		}
	}, []);
	const formatDate = useCallback((d) => new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	}), []);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex items-center justify-center py-20",
		children: /* @__PURE__ */ jsx(Loader2, {
			size: 24,
			className: "animate-spin",
			style: { color: "var(--text-muted)" }
		})
	});
	if (presentations.length === 0) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center gap-3 py-20",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex h-16 w-16 items-center justify-center",
			style: {
				backgroundColor: "var(--surface-muted)",
				border: "1px solid var(--border-color)",
				borderRadius: "var(--radius-lg)"
			},
			children: /* @__PURE__ */ jsx(ExternalLink, {
				size: 24,
				style: { color: "var(--text-muted)" }
			})
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm",
			style: { color: "var(--text-muted)" },
			children: "No presentations yet. Upload your first deck."
		})]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "grid gap-4",
		style: { gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" },
		children: /* @__PURE__ */ jsx(AnimatePresence, {
			mode: "popLayout",
			children: presentations.map((pres, i) => /* @__PURE__ */ jsxs(motion.div, {
				custom: i,
				variants: cardVariants,
				initial: "hidden",
				animate: "visible",
				exit: "exit",
				layout: true,
				className: "group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5",
				style: {
					backgroundColor: "var(--surface-card)",
					border: "1px solid var(--border-color)",
					borderRadius: "var(--radius-md)",
					boxShadow: "var(--shadow-subtle)"
				},
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-2 flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-base font-semibold leading-tight",
							style: { color: "var(--text-main)" },
							children: pres.title
						}), /* @__PURE__ */ jsx("span", {
							className: "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
							style: {
								backgroundColor: pres.is_public ? "#dcfce7" : "#fef3c7",
								color: pres.is_public ? "#166534" : "#92400e",
								borderRadius: "9999px"
							},
							children: pres.is_public ? "Public" : "Private"
						})]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mb-1 text-xs",
						style: {
							color: "var(--text-muted)",
							fontFamily: "var(--font-mono)"
						},
						children: ["/p/", pres.slug]
					}),
					pres.description && /* @__PURE__ */ jsx("p", {
						className: "mb-2 text-sm",
						style: { color: "var(--text-sub)" },
						children: pres.description
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs",
						style: { color: "var(--text-muted)" },
						children: formatDate(pres.created_at)
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex items-center gap-2 border-t pt-4",
					style: { borderColor: "var(--border-color)" },
					children: [
						/* @__PURE__ */ jsxs("a", {
							href: `/p/${pres.slug}`,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium",
							style: {
								color: "var(--color-accent)",
								backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
								borderRadius: "var(--radius-sm)",
								textDecoration: "none"
							},
							children: [/* @__PURE__ */ jsx(Eye, { size: 14 }), "View"]
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => handleCopyLink(pres.slug, pres.id),
							className: "flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium",
							style: {
								color: copiedId === pres.id ? "#16a34a" : "var(--text-sub)",
								backgroundColor: copiedId === pres.id ? "#dcfce7" : "var(--surface-muted)",
								borderRadius: "var(--radius-sm)",
								border: "none"
							},
							children: [copiedId === pres.id ? /* @__PURE__ */ jsx(Check, { size: 14 }) : /* @__PURE__ */ jsx(Copy, { size: 14 }), copiedId === pres.id ? "Copied!" : "Copy Link"]
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => handleDelete(pres.id),
							disabled: deletingId === pres.id,
							className: "ml-auto flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-50",
							style: {
								color: "#dc2626",
								backgroundColor: "#fef2f2",
								borderRadius: "var(--radius-sm)",
								border: "none"
							},
							children: [deletingId === pres.id ? /* @__PURE__ */ jsx(Loader2, {
								size: 14,
								className: "animate-spin"
							}) : /* @__PURE__ */ jsx(Trash2, { size: 14 }), "Delete"]
						})
					]
				})]
			}, pres.id))
		})
	});
}
//#endregion
//#region src/components/dashboard/DashboardApp.tsx
function DashboardApp() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const handleUploaded = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "mb-6",
			children: /* @__PURE__ */ jsxs("button", {
				onClick: () => setIsModalOpen(true),
				className: "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-px",
				style: {
					backgroundColor: "var(--color-accent)",
					borderRadius: "var(--radius-sm)",
					border: "none"
				},
				children: [/* @__PURE__ */ jsx(Plus, { size: 16 }), "New Deck"]
			})
		}),
		/* @__PURE__ */ jsx(PresentationGrid, { refreshTrigger }),
		/* @__PURE__ */ jsx(UploadModal, {
			isOpen: isModalOpen,
			onClose: () => setIsModalOpen(false),
			onUploaded: handleUploaded
		})
	] });
}
//#endregion
//#region src/pages/dashboard.astro
var dashboard_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Dashboard,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Dashboard;
	const accessToken = Astro.cookies.get("sb-access-token");
	const refreshToken = Astro.cookies.get("sb-refresh-token");
	if (!accessToken || !refreshToken) return Astro.redirect("/login");
	let session;
	try {
		session = await supabase.auth.setSession({
			refresh_token: refreshToken.value,
			access_token: accessToken.value
		});
		if (session.error) {
			Astro.cookies.delete("sb-access-token", { path: "/" });
			Astro.cookies.delete("sb-refresh-token", { path: "/" });
			return Astro.redirect("/login");
		}
	} catch {
		Astro.cookies.delete("sb-access-token", { path: "/" });
		Astro.cookies.delete("sb-refresh-token", { path: "/" });
		return Astro.redirect("/login");
	}
	const email = session.data.user?.email ?? "";
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard — AI Deck Presenter" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="min-h-screen" style="background-color: var(--bg-main);"><header class="sticky top-0 z-40"${addAttribute({
		backgroundColor: "color-mix(in srgb, var(--bg-main) 80%, transparent)",
		backdropFilter: "blur(12px)",
		WebkitBackdropFilter: "blur(12px)",
		borderBottom: "1px solid var(--border-color)"
	}, "style")}><div class="mx-auto flex items-center justify-between px-6 py-4"${addAttribute({ maxWidth: "var(--container-max)" }, "style")}><h1 class="text-base font-semibold"${addAttribute({ color: "var(--text-main)" }, "style")}>AI Deck Presenter</h1><div class="flex items-center gap-4"><span class="text-sm"${addAttribute({ color: "var(--text-muted)" }, "style")}>${email}</span><a href="/api/auth/signout" class="text-sm font-medium transition-colors hover:opacity-70"${addAttribute({
		color: "var(--text-sub)",
		textDecoration: "none"
	}, "style")}>Sign Out</a></div></div></header><main class="mx-auto px-6 py-8"${addAttribute({ maxWidth: "var(--container-max)" }, "style")}><div class="mb-8"><h2 class="text-2xl font-bold tracking-tight"${addAttribute({ color: "var(--text-main)" }, "style")}>Your Presentations</h2><p class="mt-1 text-sm"${addAttribute({ color: "var(--text-muted)" }, "style")}>Manage and share your AI-generated slide decks</p></div>${renderComponent($$result, "DashboardApp", DashboardApp, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/rel/Development/GitHub/rel-presentation/src/components/dashboard/DashboardApp.tsx",
		"client:component-export": "default"
	})}</main></div>` })}`;
}, "/home/rel/Development/GitHub/rel-presentation/src/pages/dashboard.astro", void 0);
var $$file = "/home/rel/Development/GitHub/rel-presentation/src/pages/dashboard.astro";
var $$url = "/dashboard";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
