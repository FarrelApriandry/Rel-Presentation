import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Trash2, Check, Eye, Loader2 } from 'lucide-react';

interface Presentation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  file_path: string;
}

interface PresentationGridProps {
  refreshTrigger: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export default function PresentationGrid({ refreshTrigger }: PresentationGridProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  if (presentations.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center"
        style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <ExternalLink size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No presentations yet. Upload your first deck.</p>
    </div>
  );
// GRID_CONTINUE
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      <AnimatePresence mode="popLayout">
        {presentations.map((pres, i) => (
          <motion.div key={pres.id} custom={i} variants={cardVariants}
            initial="hidden" animate="visible" exit="exit" layout
            className="group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-subtle)',
            }}>
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{pres.title}</h3>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: pres.is_public ? '#dcfce7' : '#fef3c7',
                    color: pres.is_public ? '#166534' : '#92400e', borderRadius: '9999px',
                  }}>{pres.is_public ? 'Public' : 'Private'}</span>
              </div>
              <p className="mb-1 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/p/{pres.slug}</p>
              {pres.description && <p className="mb-2 text-sm" style={{ color: 'var(--text-sub)' }}>{pres.description}</p>}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(pres.created_at)}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <a href={`/p/${pres.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                style={{ color: 'var(--color-accent)', backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                <Eye size={14} />View</a>
              <button onClick={() => handleCopyLink(pres.slug, pres.id)}
                className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                style={{ color: copiedId === pres.id ? '#16a34a' : 'var(--text-sub)',
                  backgroundColor: copiedId === pres.id ? '#dcfce7' : 'var(--surface-muted)',
                  borderRadius: 'var(--radius-sm)', border: 'none' }}>
                {copiedId === pres.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === pres.id ? 'Copied!' : 'Copy Link'}</button>
              <button onClick={() => handleDelete(pres.id)} disabled={deletingId === pres.id}
                className="ml-auto flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', border: 'none' }}>
                {deletingId === pres.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
