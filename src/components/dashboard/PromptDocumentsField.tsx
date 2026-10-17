import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Trash2, X, Loader2, AlertCircle, FileUp } from 'lucide-react';
import type { PromptDocument } from '../../lib/prompt-documents';
import {
  ACCEPTED_DOC_EXTENSIONS,
  PROMPT_DOCUMENT_ACCEPT,
  parsePromptDocument,
  validatePromptDocumentFile,
} from '../../lib/prompt-documents';

interface PromptDocumentsFieldProps {
  documents: PromptDocument[];
  onChange: (next: PromptDocument[]) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}

interface PendingParse {
  id: string;
  filename: string;
  size: number;
  status: 'parsing' | 'error';
  error?: string;
  abort?: AbortController;
}

const labelStyle: React.CSSProperties = { color: 'var(--text-main)' };

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `doc-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function formatChars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k chars`;
  return `${n} chars`;
}

export default function PromptDocumentsField({ documents, onChange, onBusyChange, disabled }: PromptDocumentsFieldProps) {
  const [pending, setPending] = useState<PendingParse[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docsRef = useRef(documents);
  docsRef.current = documents;

  const busy = pending.some((p) => p.status === 'parsing');
  // Relay busy state up to parent (for the "wait before generating" hint).
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  const startParse = useCallback(async (file: File, pendingId: string, abort: AbortController) => {
    try {
      setPending((prev) => prev.map((p) => (p.id === pendingId ? { ...p, status: 'parsing' as const } : p)));
      const parsed = await parsePromptDocument(file, undefined, abort.signal);
      if (abort.signal.aborted) return;
      onChange([...docsRef.current, parsed]);
      setPending((prev) => prev.filter((p) => p.id !== pendingId));
      setGlobalError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setPending((prev) => prev.filter((p) => p.id !== pendingId));
        return;
      }
      setPending((prev) => prev.map((p) => (p.id === pendingId ? { ...p, status: 'error' as const, error: err instanceof Error ? err.message : 'Parse failed.' } : p)));
    }
  }, [onChange]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setGlobalError(null);
    for (const file of Array.from(fileList)) {
      const check = validatePromptDocumentFile(file);
      if (!check.ok) { setGlobalError(check.message ?? 'Invalid file.'); continue; }
      const abort = new AbortController();
      const id = newId();
      setPending((prev) => [...prev, { id, filename: file.name, size: file.size, status: 'parsing', abort }]);
      void startParse(file, id, abort);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [startParse]);

  const handleRemove = useCallback((index: number) => {
    onChange(docsRef.current.filter((_, i) => i !== index));
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
          Reference Documents
        </label>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {ACCEPTED_DOC_EXTENSIONS.join('/').toUpperCase()}, 10MB max
        </span>
      </div>
      <input ref={fileInputRef} type="file" accept={PROMPT_DOCUMENT_ACCEPT} multiple className="hidden"
        disabled={disabled} onChange={(e) => handleFiles(e.target.files)} />
      <button type="button" disabled={disabled} onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm font-medium disabled:opacity-50"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-sub)', backgroundColor: 'transparent' }}>
        <FileUp size={16} /> Add documents (content will be parsed &amp; embedded)
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
                    {p.status === 'parsing' ? 'Parsing…' : `Failed${p.error ? `: ${p.error}` : ''}`}
                  </p>
                </div>
                {p.status === 'error' ? (
                  <button type="button" onClick={() => dismissPending(p.id)} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs" style={{ color: 'var(--text-sub)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    <X size={12} /> Dismiss
                  </button>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                    <button type="button" title="Cancel" onClick={() => dismissPending(p.id)} className="cursor-pointer rounded-md p-1.5" style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {documents.map((doc, idx) => (
            <div key={doc.name + '-' + idx} className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-color)' }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--border-color)' }}>
                <FileText size={16} style={{ color: '#818cf8' }} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--text-main)' }}>{idx + 1}. {doc.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {formatChars(doc.chars)}
                  {doc.truncated && (
                    <span style={{ color: '#fbbf24' }}> · truncated to fit prompt limits</span>
                  )}
                </p>
              </div>
              <button type="button" title="Remove document" disabled={disabled} onClick={() => handleRemove(idx)} className="h-fit shrink-0 cursor-pointer rounded-md p-1.5 disabled:opacity-50" style={{ color: '#fca5a5', backgroundColor: 'transparent', border: 'none' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
