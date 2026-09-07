import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Trash2, Check, Eye, Loader2, ImageOff } from 'lucide-react';

interface Presentation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  file_path: string;
  thumbnail_url: string | null;
}

interface PresentationGridProps {
  refreshTrigger: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export default function PresentationGrid({ refreshTrigger }: PresentationGridProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const fetchPresentations = useCallback(async () => {
    try {
      const res = await fetch('/api/presentations');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPresentations(data.presentations ?? []);
    } catch { setPresentations([]); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { setIsLoading(true); fetchPresentations(); }, [fetchPresentations, refreshTrigger]);

  const handleCopyLink = useCallback(async (slug: string, id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
      setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/presentations/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Delete failed'); }
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setDeletingId(null); }
  }, []);

  const formatDate = useCallback((d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), []);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  if (presentations.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)' }}>
        <ExternalLink size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--text-sub)' }}>No presentations yet. Upload your first deck.</p>
    </div>
  );
// GRID_CONTINUE
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      <AnimatePresence mode="popLayout">
        {presentations.map((pres, i) => (
          <motion.div key={pres.id} custom={i} variants={cardVariants}
            initial="hidden" animate="visible" exit="exit" layout
            className="group flex flex-col justify-between overflow-hidden rounded-xl transition-all"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.5)', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-subtle)',
              borderRadius: 16,
              transition: 'border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            whileHover={{ borderColor: 'var(--border-hover)' }}>
            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full overflow-hidden"
              style={{ 
                backgroundColor: 'var(--surface-muted)',
                transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
              {pres.thumbnail_url && !failedImages.has(pres.id) ? (
                <img
                  src={pres.thumbnail_url}
                  alt={`${pres.title} thumbnail`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  onError={() => handleImageError(pres.id)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
                  }}>
                  <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <ImageOff size={24} strokeWidth={1.5} />
                    <span className="text-xs font-mono">No Preview</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{pres.title}</h3>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium font-mono"
                  style={{
                    backgroundColor: pres.is_public ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: pres.is_public ? '#6ee7b7' : '#fbbf24',
                    border: `1px solid ${pres.is_public ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}>{pres.is_public ? 'Public' : 'Private'}</span>
              </div>
              <p className="mb-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>/p/{pres.slug}</p>
              {pres.description && <p className="mb-2 text-sm" style={{ color: 'var(--text-sub)' }}>{pres.description}</p>}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(pres.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border-color)' }}>
              <a href={`/p/${pres.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ color: 'var(--color-accent-text)', backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  textDecoration: 'none' }}>
                <Eye size={14} />View</a>
              <button onClick={() => handleCopyLink(pres.slug, pres.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ color: copiedId === pres.id ? '#6ee7b7' : 'var(--text-sub)',
                  backgroundColor: copiedId === pres.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-muted)',
                  border: 'none' }}>
                {copiedId === pres.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === pres.id ? 'Copied!' : 'Copy Link'}</button>
              <button onClick={() => handleDelete(pres.id)} disabled={deletingId === pres.id}
                className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                style={{ color: '#fca5a5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: 'none' }}>
                {deletingId === pres.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
