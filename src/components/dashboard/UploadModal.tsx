import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2, Code } from 'lucide-react';
import { toBlob } from 'html-to-image';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

interface UploadFormData {
  title: string;
  slug: string;
  description: string;
  aiPrompt: string;
  file: File | null;
}

type InputMode = 'upload' | 'paste';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0, scale: 0.95, y: 10,
    transition: { duration: 0.15 },
  },
};

/**
 * Strips markdown code block wrappers (```html ... ``` or ``` ... ```)
 * and trims leading/trailing whitespace.
 */
function cleanRawHtml(code: string): string {
  const stripped = code.replace(/^```(?:html|htm)?\s*\n?([\s\S]*?)\n?\s*```$/gm, '$1');
  return stripped.trim();
}

/**
 * Extracts the text content inside <title>...</title> tags.
 * Returns null if no title tag is found.
 */
function extractTitleFromHtml(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() || null;
}

/**
 * Synthesizes a File object from a cleaned HTML string.
 */
function synthesizeHtmlFile(cleanedCode: string, filename: string): File {
  const htmlBlob = new Blob([cleanedCode], { type: 'text/html' });
  return new File([htmlBlob], filename, { type: 'text/html' });
}

export default function UploadModal({ isOpen, onClose, onUploaded }: UploadModalProps) {
  const [form, setForm] = useState<UploadFormData>({
    title: '', slug: '', description: '', aiPrompt: '', file: null,
  });
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [rawCode, setRawCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const resetForm = useCallback(() => {
    setForm({ title: '', slug: '', description: '', aiPrompt: '', file: null });
    setRawCode('');
    setInputMode('upload');
    setError(null);
    setIsSubmitting(false);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const generateSlug = useCallback((t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(), []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      setForm((prev) => ({
        ...prev, title,
        slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
      }));
    }, [generateSlug]);

  /**
   * Loads a File into the hidden iframe for thumbnail capture and sets it on the form.
   */
  const loadFileIntoPipeline = useCallback((file: File) => {
    setError(null);
    setForm((prev) => ({ ...prev, file }));

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Only .html files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    loadFileIntoPipeline(file);
  }, [loadFileIntoPipeline]);

  /**
   * Handles raw code textarea changes. Cleans the code, extracts title,
   * auto-fills title/slug, synthesizes a File, and loads it into the pipeline.
   */
  const handleRawCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setRawCode(value);

      const cleaned = cleanRawHtml(value);

      if (cleaned.length > 0) {
        const extractedTitle = extractTitleFromHtml(cleaned);
        if (extractedTitle) {
          setForm((prev) => {
            const prevCleaned = cleanRawHtml(rawCode);
            const prevExtracted = extractTitleFromHtml(prevCleaned);
            const shouldFillTitle = prev.title.trim() === '' || prev.title === prevExtracted;
            const newTitle = shouldFillTitle ? extractedTitle : prev.title;

            const currentAutoSlug = generateSlug(prev.title);
            const shouldFillSlug = prev.slug.trim() === '' || prev.slug === currentAutoSlug;
            const newSlug = shouldFillSlug ? generateSlug(extractedTitle) : prev.slug;

            return { ...prev, title: newTitle, slug: newSlug };
          });
        }

        const filename = extractedTitle
          ? `${generateSlug(extractedTitle)}.html`
          : 'presentation.html';
        const synthesizedFile = synthesizeHtmlFile(cleaned, filename);

        if (synthesizedFile.size > 10 * 1024 * 1024) {
          setError('Pasted code exceeds 10MB limit.');
          return;
        }

        setError(null);
        loadFileIntoPipeline(synthesizedFile);
      } else {
        setForm((prev) => ({ ...prev, file: null }));
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        if (iframeRef.current) {
          iframeRef.current.src = 'about:blank';
        }
      }
    }, [rawCode, generateSlug, loadFileIntoPipeline]);

  /**
   * Switches input mode. Clears the opposing input state to avoid stale data.
   */
  const handleModeSwitch = useCallback((mode: InputMode) => {
    setInputMode(mode);
    setError(null);
    if (mode === 'upload') {
      setRawCode('');
    }
    setForm((prev) => ({ ...prev, file: null }));
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
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
// CONTINUE
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // For paste mode, synthesize the file on submit if not already done
      let activeFile = form.file;
      if (inputMode === 'paste' && !activeFile && rawCode.trim()) {
        const cleaned = cleanRawHtml(rawCode);
        if (cleaned.length > 0) {
          const extractedTitle = extractTitleFromHtml(cleaned);
          const filename = extractedTitle ? `${generateSlug(extractedTitle)}.html` : 'presentation.html';
          activeFile = synthesizeHtmlFile(cleaned, filename);
        }
      }

      if (!activeFile || !form.title || !form.slug) {
        setError('Title, slug, and file/code are required.'); return;
      }
      setIsSubmitting(true);
      try {
        // Capture thumbnail before submitting
        const thumbnailBlob = await captureThumbnail();
        
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('slug', form.slug);
        formData.append('description', form.description);
        formData.append('ai_prompt', form.aiPrompt);
        formData.append('file', activeFile);
        
        if (thumbnailBlob) {
          formData.append('thumbnail', thumbnailBlob, 'thumbnail.webp');
        }
        const response = await fetch('/api/presentations', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');
        resetForm();
        onUploaded();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }, [form, inputMode, rawCode, generateSlug, captureThumbnail, onUploaded, onClose, resetForm]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-main)',
  };
  const labelStyle: React.CSSProperties = { color: 'var(--text-sub)' };

  const tabBaseStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const tabActiveStyle: React.CSSProperties = {
    ...tabBaseStyle,
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
  };

  const tabInactiveStyle: React.CSSProperties = {
    ...tabBaseStyle,
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
  };

  return (
    <>
      {/* Hidden iframe for thumbnail capture */}
      <iframe
        ref={iframeRef}
        title="Thumbnail preview"
        className="pointer-events-none absolute -z-50 opacity-0"
        style={{ width: 1280, height: 720 }}
        sandbox="allow-scripts allow-same-origin"
      />
      
      <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
          <div className="absolute inset-0"
            style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose} />
          <motion.div className="relative w-full max-w-lg overflow-y-auto p-6"
            style={{
              backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-subtle)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh',
            }}
            variants={modalVariants} initial="hidden" animate="visible" exit="exit">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-main)' }}>Upload Presentation</h2>
              <button onClick={handleClose} className="cursor-pointer rounded-lg border border-zinc-700 p-1.5 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                style={{ color: 'var(--text-sub)' }}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Tab Switcher */}
              <div
                className="flex gap-1 rounded-lg p-1"
                style={{ backgroundColor: 'var(--surface-muted)' }}
              >
                <button
                  type="button"
                  onClick={() => handleModeSwitch('upload')}
                  style={inputMode === 'upload' ? tabActiveStyle : tabInactiveStyle}
                >
                  <Upload size={16} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('paste')}
                  style={inputMode === 'paste' ? tabActiveStyle : tabInactiveStyle}
                >
                  <Code size={16} />
                  Paste Code
                </button>
              </div>

              {/* Upload File Tab Content */}
              {inputMode === 'upload' && (
                <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 transition-colors"
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--border-color)'}`,
                    backgroundColor: isDragging ? 'rgba(79, 70, 229, 0.05)' : 'var(--surface-card)',
                  }}>
                  <input ref={fileInputRef} type="file" accept=".html,.htm" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                  {form.file ? (
                    <div className="flex items-center gap-2">
                      <FileText size={20} style={{ color: 'var(--color-accent-text)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{form.file.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({(form.file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-sub)' }}>Drag and drop .html file, or click to browse</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Max 10MB</span>
                    </>
                  )}
                </div>
              )}

              {/* Paste Code Tab Content */}
              {inputMode === 'paste' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="raw-code" className="text-sm font-medium" style={labelStyle}>
                    HTML Code
                  </label>
                  <textarea
                    id="raw-code"
                    rows={10}
                    value={rawCode}
                    onChange={handleRawCodeChange}
                    placeholder={`<!DOCTYPE html>\n<html>\n<head>\n  <title>My Presentation</title>\n</head>\n<body>\n  <!-- Paste your HTML here -->\n</body>\n</html>`}
                    spellCheck={false}
                    className="resize-none px-3.5 py-2.5 text-sm outline-none"
                    style={{
                      ...inputStyle,
                      fontFamily: 'var(--font-mono)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      minHeight: '200px',
                      transition: 'border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Supports markdown code fences (```html ... ```)
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {rawCode.length.toLocaleString()} chars
                    </span>
                  </div>
                  {form.file && rawCode.trim().length > 0 && (
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        backgroundColor: 'var(--surface-muted)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <FileText size={16} style={{ color: 'var(--color-accent-text)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
                        Synthesized: {form.file.name} ({(form.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium" style={labelStyle}>
                  Title <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input id="title" type="text" required value={form.title}
                  onChange={handleTitleChange} placeholder="My Awesome Presentation"
                  className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="slug" className="text-sm font-medium" style={labelStyle}>
                  Custom Slug <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div className="flex items-center">
                  <span className="shrink-0 rounded-l-md px-3 py-2.5 text-sm"
                    style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)',
                      borderRight: 'none', color: 'var(--text-muted)' }}>/p/</span>
                  <input id="slug" type="text" required pattern="[a-z0-9\-]+" value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="my-presentation" className="flex-1 px-3.5 py-2.5 text-sm outline-none"
                    style={{ ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium" style={labelStyle}>Description</label>
                <input id="description" type="text" value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description (optional)" className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ai-prompt" className="text-sm font-medium" style={labelStyle}>AI Prompt Notes</label>
                <textarea id="ai-prompt" rows={3} value={form.aiPrompt}
                  onChange={(e) => setForm((prev) => ({ ...prev, aiPrompt: e.target.value }))}
                  placeholder="Notes about the AI prompt used (optional)"
                  className="resize-none px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={handleClose}
                  className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-sub)', backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-accent)', border: 'none' }}>
                  {isSubmitting ? (<><Loader2 size={16} className="animate-spin" />Uploading...</>) : (<><Upload size={16} />Upload</>)}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
