import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  aiPrompt: string;
  file: File | null;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, scale: 0.95, y: 10,
    transition: { duration: 0.15 },
  },
};

export default function UploadModal({ isOpen, onClose, onUploaded }: UploadModalProps) {
  const [form, setForm] = useState<FormData>({
    title: '', slug: '', description: '', aiPrompt: '', file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setForm({ title: '', slug: '', description: '', aiPrompt: '', file: null });
    setError(null);
    setIsSubmitting(false);
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

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Only .html files are accepted.'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.'); return;
    }
    setError(null);
    setForm((prev) => ({ ...prev, file }));
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
// CONTINUE
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!form.file || !form.title || !form.slug) {
        setError('Title, slug, and file are required.'); return;
      }
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('slug', form.slug);
        formData.append('description', form.description);
        formData.append('ai_prompt', form.aiPrompt);
        formData.append('file', form.file);
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
    }, [form, onUploaded, onClose, resetForm]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-main)',
  };
  const labelStyle: React.CSSProperties = { color: 'var(--text-sub)' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants} initial="hidden" animate="visible" exit="hidden">
          <div className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose} />
          <motion.div className="relative w-full max-w-lg overflow-y-auto p-6"
            style={{
              backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-subtle)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh',
            }}
            variants={modalVariants} initial="hidden" animate="visible" exit="exit">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Upload Presentation</h2>
              <button onClick={handleClose} className="cursor-pointer rounded-lg p-1.5 hover:opacity-70"
                style={{ color: 'var(--text-muted)', border: 'none', background: 'none' }}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Dropzone */}
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 p-6 transition-colors"
                style={{
                  border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--border-color)'}`,
                  backgroundColor: isDragging ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)' : 'var(--surface-muted)',
                  borderRadius: 'var(--radius-md)',
                }}>
                <input ref={fileInputRef} type="file" accept=".html,.htm" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                {form.file ? (
                  <div className="flex items-center gap-2">
                    <FileText size={20} style={{ color: 'var(--color-accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{form.file.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({(form.file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Drag and drop .html file, or click to browse</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Max 10MB</span>
                  </>
                )}
              </div>
{/* PART3 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium" style={labelStyle}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input id="title" type="text" required value={form.title}
                  onChange={handleTitleChange} placeholder="My Awesome Presentation"
                  className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="slug" className="text-sm font-medium" style={labelStyle}>
                  Custom Slug <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="flex items-center">
                  <span className="shrink-0 px-3 py-2.5 text-sm"
                    style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)',
                      borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', color: 'var(--text-muted)' }}>/p/</span>
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
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-sub)', backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-accent)', borderRadius: 'var(--radius-sm)', border: 'none' }}>
                  {isSubmitting ? (<><Loader2 size={16} className="animate-spin" />Uploading...</>) : (<><Upload size={16} />Upload</>)}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
