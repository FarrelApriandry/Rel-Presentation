# 🎯 Task: Client-Side Auto-Generated Thumbnail Feature

**Objective:** Automatically capture a 16:9 WebP thumbnail of the first slide when uploading an HTML presentation, save it to Supabase Storage, and render it on the Dashboard card grid.

---

## Task Checklist

### Phase 1: Database & Dependencies Setup
- [ ] Add `thumbnail_url` column (type `text`, nullable) to the `presentations` table in Supabase.
- [x] Install `html-to-image` using Bun (`bun add html-to-image`).

### Phase 2: Client Capture & Upload Engine (`UploadModal.tsx`)
- [ ] Render the uploaded `.html` file inside a hidden/off-screen `<iframe>` when selected in `UploadModal.tsx`.
- [ ] Implement a helper function using `html-to-image` (`toBlob`) to snapshot the first slide of the iframe as a 1280x720 WebP Blob (`quality: 0.8`).
- [ ] Append the generated thumbnail blob to the `FormData` as `thumbnail` before submitting to `POST /api/presentations`.

### Phase 3: API Endpoint Update (`/api/presentations/index.ts`)
- [ ] Update `POST /api/presentations` to extract the `thumbnail` file from `request.formData()`.
- [ ] Upload the thumbnail image to Supabase Storage at path: `decks/{user_id}/thumbnails/{slug}.webp`.
- [ ] Obtain the public URL for the uploaded thumbnail.
- [ ] Include `thumbnail_url` in the database record insertion into the `presentations` table.
- [ ] Handle cleanup: if DB insertion fails, delete both the HTML file and thumbnail from Supabase Storage.

### Phase 4: UI Dashboard Enhancement (`PresentationGrid.tsx`)
- [ ] Update `PresentationGrid.tsx` card layout to display the thumbnail in an `aspect-video` (16:9) container.
- [ ] Implement a fallback UI placeholder (clean gradient or icon) if `thumbnail_url` is missing or fails to load.
- [ ] Apply CSS styles and Framer Motion hover animations conforming to `docs/DESIGN.md` (subtle border shift, slight scale on image hover).

### Phase 5: Verification & Cleanup
- [ ] Test uploading a new HTML presentation deck and confirm thumbnail appears on the dashboard.
- [ ] Verify image delete logic (`DELETE /api/presentations/[id].ts`) removes the thumbnail from storage alongside the `.html` file.