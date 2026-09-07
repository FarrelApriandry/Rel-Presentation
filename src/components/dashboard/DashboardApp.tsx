import { useState, useCallback, useRef } from 'react';
import { toBlob } from 'html-to-image';
import UploadModal from './UploadModal';
import BasicPromptModal from './BasicPromptModal';
import PresentationGrid from './PresentationGrid';
import { synthesizeHtmlFile } from './UploadModal';
import { Plus, Sparkles } from 'lucide-react';

export default function DashboardApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handleUploaded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const captureThumbnail = useCallback(async (): Promise<Blob | null> => {
    if (!iframeRef.current?.contentDocument?.body) return null;
    try {
      const blob = await toBlob(iframeRef.current.contentDocument.body, {
        type: 'image/webp',
        quality: 0.8,
        width: 1280,
        height: 720,
        pixelRatio: 1,
      });
      return blob;
    } catch {
      console.warn('Thumbnail capture failed, continuing without thumbnail');
      return null;
    }
  }, []);

  const handleGenerated = useCallback(
    async ({ html, title, slug }: { html: string; title: string; slug: string }) => {
      const file = synthesizeHtmlFile(html, `${slug}.html`);

      // Load file into hidden iframe for thumbnail capture
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      const iframe = iframeRef.current;
      if (!iframe) {
        // No iframe available — upload without thumbnail
        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('file', file);
        const fallbackRes = await fetch('/api/presentations', { method: 'POST', body: formData });
        if (!fallbackRes.ok) {
          const result = await fallbackRes.json().catch(() => ({}));
          throw new Error(result.error || 'Upload failed');
        }
        setIsPromptOpen(false);
        setRefreshTrigger((prev) => prev + 1);
        return;
      }

      // Wait for iframe to load, then delay for CDN fonts/scripts/styles to fully render
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          // 400ms delay ensures Tailwind CDN, Google Fonts, and inline styles are painted
          setTimeout(() => resolve(), 400);
        };
        iframe.src = url;
      });

      const thumbnailBlob = await captureThumbnail();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('file', file);

      if (thumbnailBlob) {
        formData.append('thumbnail', thumbnailBlob, 'thumbnail.webp');
      }

      const response = await fetch('/api/presentations', { method: 'POST', body: formData });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Upload failed');
      }

      // Clean up
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      iframe.src = 'about:blank';

      setIsPromptOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    },
    [captureThumbnail],
  );

  return (
    <>
      {/* Hidden iframe for thumbnail capture — shared by UploadModal pipeline & AI generation */}
      <iframe
        ref={iframeRef}
        title="Thumbnail preview"
        className="pointer-events-none absolute -z-50 opacity-0"
        style={{ width: 1280, height: 720 }}
        sandbox="allow-scripts allow-same-origin"
      />

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            border: 'none',
          }}
        >
          <Plus size={16} />
          New Deck
        </button>

        <button
          onClick={() => setIsPromptOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <Sparkles size={16} />
          Prompt Builder
        </button>
      </div>

      <PresentationGrid refreshTrigger={refreshTrigger} />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />

      <BasicPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onGenerated={handleGenerated}
      />
    </>
  );
}
