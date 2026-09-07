# 🎯 Task: 1-Click AI Presentation Generation (Gemini API Integration)

**Objective:** Add a "✨ Generate Presentation" button inside `BasicPromptModal.tsx` that sends the generated prompt to a new server-side API route (`/api/generate-deck.ts`). The API calls the Gemini API to produce a complete HTML presentation, which is then automatically synthesized into a `File` object, processed through the existing thumbnail snapshot pipeline, uploaded to Supabase, and rendered on the dashboard.

---

## Task Checklist

### Phase 1: Server-Side API Endpoint (`src/pages/api/generate-deck.ts`)
- [ ] Create a new API route `POST /api/generate-deck.ts`.
- [ ] Read `GEMINI_API_KEY` from `import.meta.env` or `process.env`. Validate key presence.
- [ ] Extract `prompt` from the JSON request body.
- [ ] Send request to Gemini REST API (`gemini-2.5-flash` endpoint) using `fetch`:
  - Enforce system instruction/formatting so the output is strictly a single, self-contained HTML file (including Tailwind CDN, fonts, CSS, and JS).
- [ ] Clean the AI output response by stripping markdown code block fences (` ```html `, ` ``` `).
- [ ] Extract `<title>` from the HTML response to construct a default `title` and unique `slug`.
- [ ] Return JSON response: `{ success: true, html: string, title: string, slug: string }`.

### Phase 2: UI Integration in `BasicPromptModal.tsx`
- [ ] In the **Preview Stage** of `BasicPromptModal.tsx`, add a primary action button: **"✨ Generate Presentation"** alongside the existing "Copy Prompt" button.
- [ ] Add loading/generating state management:
  - Disable buttons during generation.
  - Display an animated loading spinner/status ("Generating presentation with Gemini AI...").
  - Handle error states (e.g., missing API key, rate limits, generation failures) with clear UI feedback.

### Phase 3: Seamless Pipeline Hook (`DashboardApp.tsx` & `UploadModal.tsx`)
- [ ] Once the HTML string is returned from `/api/generate-deck`:
  1. Convert the HTML string into a `File` object client-side using `synthesizeHtmlFile()`.
  2. Load the synthesized file into an off-screen/hidden `iframe` to capture the 16:9 WebP thumbnail via `html-to-image`.
  3. Submit the `File` and `thumbnail` blob to `POST /api/presentations`.
- [ ] Upon successful creation:
  - Close the modal.
  - Trigger `onSuccess` / refresh in `DashboardApp.tsx` to reload the presentation grid.

### Phase 4: Build Verification
- [ ] Execute `bun run build` ONCE to verify TypeScript type-checking and production build readiness.