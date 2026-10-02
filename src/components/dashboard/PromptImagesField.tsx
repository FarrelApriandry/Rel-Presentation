import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import type { PromptImage } from '../../lib/prompt-generator';
import {
  PROMPT_IMAGE_ACCEPT,
  deletePromptImage,
  formatBytes,
  getMimeFromFilename,
  requestSignedUploadUrl,
  uploadFileWithProgress,
  validatePromptImageFile,
} from '../../lib/prompt-images';

interface PromptImagesFieldProps {
  images: PromptImage[];
  onChange: (next: PromptImage[]) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}

interface PendingUpload {
  id: string;
  filename: string;
  size: number;
  progress: number;
  status: 'preparing' | 'uploading' | 'error';
  error?: string;
  abort?: AbortController;
}

const labelStyle: React.CSSProperties = { color: 'var(--text-main)' };
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-muted)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  fontFamily: 'var(--font-sans)',
};

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `up-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export default function PromptImagesField({ images, onChange, onBusyChange, disabled }: PromptImagesFieldProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const busy = pending.some((p) => p.status === 'preparing' || p.status === 'uploading');
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  const updatePending = useCallback((id: string, patch: Partial<PendingUpload>) => {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const startUpload = useCallback(async (file: File, pendingId: string, abort: AbortController) => {
    try {
      updatePending(pendingId, { status: 'preparing', progress: 0 });
      const signed = await requestSignedUploadUrl(file);
      if (abort.signal.aborted) return;
      const contentType = file.type || getMimeFromFilename(file.name) || signed.contentType || 'image/jpeg';
      updatePending(pendingId, { status: 'uploading', progress: 0 });
      await uploadFileWithProgress(signed.signedUrl, file, contentType,
        (percent) => updatePending(pendingId, { progress: percent }), abort.signal);
      if (abort.signal.aborted) return;
      const next: PromptImage = { url: signed.publicUrl, description: '', name: file.name, path: signed.path };
      onChange([...imagesRef.current, next]);
      setPending((prev) => prev.filter((p) => p.id !== pendingId));
      setGlobalError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setPending((prev) => prev.filter((p) => p.id !== pendingId));
        return;
      }
      updatePending(pendingId, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed.' });
    }
  }, [onChange, updatePending]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setGlobalError(null);
    for (const file of Array.from(fileList)) {
      const check = validatePromptImageFile(file);
      if (!check.ok) { setGlobalError(check.message ?? 'Invalid file.'); continue; }
      const abort = new AbortController();
      const id = newId();
      setPending((prev) => [...prev, { id, filename: file.name, size: file.size, progress: 0, status: 'preparing', abort }]);
      void startUpload(file, id, abort);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [startUpload]);



  const handleDescriptionChange = useCallback((index: number, value: string) => {
    const next = imagesRef.current.map((img, i) => (i === index ? { ...img, description: value } : img));
    onChange(next);
  }, [onChange]);

  const handleRemove = useCallback(async (index: number) => {
    const target = imagesRef.current[index];
    if (!target) return;
    onChange(imagesRef.current.filter((_, i) => i !== index));
    if (target.path) {
      setDeletingPath(target.path);
      try { await deletePromptImage(target.path); } catch {}
      finally { setDeletingPath(null); }
    }
  }, [onChange]);

  const dismissPending = useCallback((id: string) => {
    setPending((prev) => {
      const t = prev.find((p) => p.id === id);
      try { t?.abort?.abort(); } catch {}
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium" style={labelStyle}>
          Reference Images
        </label>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          PNG/JPG, 50MB max, unlimited
        </span>
      </div>
      <input ref={fileInputRef} type="file" accept={PROMPT_IMAGE_ACCEPT} multiple className="hidden"
        disabled={disabled} onChange={(e) => handleFiles(e.target.files)} />
      <button type="button" disabled={disabled} onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm font-medium disabled:opacity-50"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-sub)', backgroundColor: 'transparent' }}>
        <ImagePlus size={16} /> Add images
      </button>
      {globalError && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
          style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{globalError}</span>
        </div>
      )}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((p) => (
            <div key={p.id} className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text-main)' }}>{p.filename}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {formatBytes(p.size)}{p.status === 'preparing' ? ' · preparing…' : p.status === 'uploading' ? ` · uploading ${p.progress}%` : ` · failed${p.error ? `: ${p.error}` : ''}`}
                  </p>
                </div>
                {p.status === 'error' ? (
                  <button type="button" onClick={() => dismissPending(p.id)} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs" style={{ color: 'var(--text-sub)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    <RotateCcw size={12} /> Dismiss
                  </button>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                    <button type="button" title="Cancel upload" onClick={() => dismissPending(p.id)} className="cursor-pointer rounded-md p-1.5" style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              {p.status !== 'error' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.status === 'preparing' ? 4 : Math.max(4, p.progress)}%`, backgroundColor: '#a855f7' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          {images.map((img, idx) => (
            <div key={(img.path ?? img.url) + '-' + idx} className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)' }}>
              <img src={img.url} alt={img.description || img.name || 'Reference image'} className="h-14 w-14 shrink-0 rounded-md object-cover" loading="lazy" style={{ border: '1px solid var(--border-color)' }} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--text-main)' }}>{idx + 1}. {img.name || 'Image'}</p>
                <input type="text" value={img.description} disabled={disabled} onChange={(e) => handleDescriptionChange(idx, e.target.value)} placeholder="Describe this image..." className="px-2.5 py-2 text-xs outline-none" style={inputStyle} />
                <a href={img.url} target="_blank" rel="noreferrer" className="truncate font-mono text-[11px] underline" style={{ color: 'var(--text-muted)' }}>{img.url}</a>
              </div>
              <button type="button" title="Remove image" disabled={disabled || deletingPath === img.path} onClick={() => void handleRemove(idx)} className="h-fit shrink-0 cursor-pointer rounded-md p-1.5 disabled:opacity-50" style={{ color: '#fca5a5', backgroundColor: 'transparent', border: 'none' }}>
                {deletingPath === img.path ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}