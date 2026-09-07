# 🎯 Task: Dual-Input Support in UploadModal (File Upload + Raw Code Paste)

**Objective:** Add a tabbed interface in `UploadModal.tsx` allowing users to either upload an `.html` file or paste raw HTML code directly. Pasted code must be automatically cleaned, converted into a `File` object client-side, and processed through the existing thumbnail & upload pipeline without modifying backend API routes.

---

## Task Checklist

### Phase 1: Input Switcher & Helper Functions (`UploadModal.tsx`)
- [ ] Add a UI tab switcher at the top of `UploadModal.tsx` to toggle between **Upload File** and **Paste Code** modes.
- [ ] Implement a code cleaner function `cleanRawHtml(code: string): string`:
  - Strips markdown code block wrappers (e.g., ````html ... ```` or ```` ... ````).
  - Trims unnecessary leading/trailing whitespace.
- [ ] Implement an auto-extract helper for `<title>` tag:
  - Extract text inside `<title>...</title>` using Regex when code is pasted or changed.
  - Auto-fill the **Title** and **Slug** input fields if they are currently empty.

### Phase 2: Client-Side File Synthesis & Thumbnail Pipeline
- [ ] Convert the cleaned raw HTML string into a `File` object:
  ```ts
  const htmlBlob = new Blob([cleanedCode], { type: 'text/html' });
  const synthesizedFile = new File([htmlBlob], `${slug || 'presentation'}.html`, { type: 'text/html' });

* [ ] Ensure the synthesized `File` is passed into the existing hidden `iframe` (`srcdoc` or `URL.createObjectURL`) for thumbnail snapshot generation.
* [ ] Seamlessly hook the synthesized `File` and generated thumbnail blob into the existing `FormData` submission to `POST /api/presentations`.

### Phase 3: UI & UX Enhancements

* [ ] Add a clean monospace `<textarea>` with line-wrapping support for the "Paste Code" tab.
* [ ] Show a character count or live status indicator when code is pasted.
* [ ] Maintain consistent dark-theme styling per `docs/DESIGN.md` (subtle borders, focus rings, clear tab active states).

### Phase 4: Verification

* [ ] Run `bun run build` ONCE to verify TypeScript type-checking and production build readiness.