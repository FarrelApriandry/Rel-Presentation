import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Copy, Check, RotateCcw, ArrowLeft, Wand2 } from 'lucide-react';
import {
  type PresentationFormData,
  DEFAULT_FORM_DATA,
  AUDIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  PURPOSE_OPTIONS,
  VISUAL_STYLE_OPTIONS,
  CONTENT_DETAIL_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  generatePresentationPrompt,
} from '../../lib/prompt-generator';

interface BasicPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage = 'configure' | 'preview';

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

const labelStyle: React.CSSProperties = { color: 'var(--text-main)' };
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-muted)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  fontFamily: 'var(--font-sans)',
};

/* ── Reusable field components ── */

function SelectField({
  id, label, value, onChange, options, required,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={labelStyle}>
        {label}{required && <span style={{ color: '#f87171' }}> *</span>}
      </label>
      <select id={id} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none px-3.5 py-2.5 text-sm outline-none"
        style={{
          ...inputStyle,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 6.146a.5.5 0 0 1 .708 0L8 8.793l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextInput({
  id, label, value, onChange, placeholder, required, type = 'text',
}: {
  id: string; label: string; value: string | number;
  onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={labelStyle}>
        {label}{required && <span style={{ color: '#f87171' }}> *</span>}
      </label>
      <input id={id} type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
    </div>
  );
}
/* ── Configure Stage ── */

function ConfigureStage({
  form, update, showCustomAudience, showCustomLanguage, showCustomStyle, validationError,
}: {
  form: PresentationFormData;
  update: <K extends keyof PresentationFormData>(key: K, value: PresentationFormData[K]) => void;
  showCustomAudience: boolean;
  showCustomLanguage: boolean;
  showCustomStyle: boolean;
  validationError: string | null;
}) {
  return (
    <div className="flex flex-col gap-5">
      {validationError && (
        <div className="rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          {validationError}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Content
        </span>
        <TextInput id="topic" label="Presentation Topic" required
          value={form.topic} onChange={(v) => update('topic', v)}
          placeholder="e.g. The Future of Renewable Energy in Southeast Asia" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Structure
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="slideCount" label="Number of Slides" required type="number"
            value={form.slideCount} onChange={(v) => update('slideCount', parseInt(v, 10) || 0)}
            placeholder="12" />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="slideStructure" className="text-sm font-medium" style={labelStyle}>
              Slide Structure
            </label>
            <input id="slideStructure" type="text" value={form.slideStructure}
              onChange={(e) => update('slideStructure', e.target.value)}
              placeholder="e.g. 1 opening, 10 content, 1 conclusion"
              className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Audience & Language
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <SelectField id="audience" label="Audience"
              value={form.audience} onChange={(v) => update('audience', v)}
              options={AUDIENCE_OPTIONS} />
            {showCustomAudience && (
              <input id="customAudience" type="text" value={form.customAudience}
                onChange={(e) => update('customAudience', e.target.value)}
                placeholder="Describe your audience"
                className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <SelectField id="language" label="Language"
              value={form.language} onChange={(v) => update('language', v)}
              options={LANGUAGE_OPTIONS} />
            {showCustomLanguage && (
              <input id="customLanguage" type="text" value={form.customLanguage}
                onChange={(e) => update('customLanguage', e.target.value)}
                placeholder="Specify language"
                className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Purpose & Style
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField id="purpose" label="Presentation Purpose"
            value={form.purpose} onChange={(v) => update('purpose', v)}
            options={PURPOSE_OPTIONS} />
          <SelectField id="contentDetail" label="Content Detail"
            value={form.contentDetail} onChange={(v) => update('contentDetail', v)}
            options={CONTENT_DETAIL_OPTIONS} />
        </div>
        <div className="flex flex-col gap-1.5">
          <SelectField id="visualStyle" label="Visual Style"
            value={form.visualStyle} onChange={(v) => update('visualStyle', v)}
            options={VISUAL_STYLE_OPTIONS} />
          {showCustomStyle && (
            <input id="customVisualStyle" type="text" value={form.customVisualStyle}
              onChange={(e) => update('customVisualStyle', e.target.value)}
              placeholder="Describe your preferred visual style"
              className="px-3.5 py-2.5 text-sm outline-none" style={inputStyle} />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Additional
        </span>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="specialRequirements" className="text-sm font-medium" style={labelStyle}>
            Special Requirements
          </label>
          <textarea id="specialRequirements" rows={4} value={form.specialRequirements}
            onChange={(e) => update('specialRequirements', e.target.value)}
            placeholder="e.g. Include data visualizations, avoid bullet-heavy slides, add speaker notes..."
            className="resize-none px-3.5 py-2.5 text-sm leading-relaxed outline-none"
            style={inputStyle} />
        </div>
        <SelectField id="outputFormat" label="Output Format"
          value={form.outputFormat} onChange={(v) => update('outputFormat', v)}
          options={OUTPUT_FORMAT_OPTIONS} />
      </div>
    </div>
  );
}

/* ── Preview Stage ── */

function PreviewStage({ prompt }: { prompt: string }) {
  return (
    <div className="rounded-lg p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap"
      style={{
        backgroundColor: 'var(--surface-muted)',
        color: 'var(--text-sub)',
        border: '1px solid var(--border-color)',
        maxHeight: '55vh',
        overflowY: 'auto',
      }}>
      {prompt}
    </div>
  );
}

/* ── Main Modal ── */

export default function BasicPromptModal({ isOpen, onClose }: BasicPromptModalProps) {
  const [stage, setStage] = useState<Stage>('configure');
  const [form, setForm] = useState<PresentationFormData>({ ...DEFAULT_FORM_DATA });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = useCallback(<K extends keyof PresentationFormData>(
    key: K, value: PresentationFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!form.topic.trim()) { setValidationError('Please enter a presentation topic.'); return; }
    if (form.slideCount < 1) { setValidationError('Number of slides must be at least 1.'); return; }
    setValidationError(null);
    setGeneratedPrompt(generatePresentationPrompt(form));
    setStage('preview');
  }, [form]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [generatedPrompt]);

  const handleReset = useCallback(() => {
    setForm({ ...DEFAULT_FORM_DATA });
    setGeneratedPrompt('');
    setValidationError(null);
    setCopied(false);
    setStage('configure');
  }, []);

  const handleClose = useCallback(() => {
    setCopied(false);
    setValidationError(null);
    setStage('configure');
    onClose();
  }, [onClose]);

  const showCustomAudience = form.audience === 'custom';
  const showCustomLanguage = form.language === 'custom';
  const showCustomStyle = form.visualStyle === 'custom';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}>
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
            className="mx-4 flex w-full max-w-2xl flex-col rounded-xl"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                  <Sparkles size={16} style={{ color: '#c084fc' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
                    Prompt Builder
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {stage === 'configure' ? 'Configure your presentation requirements' : 'Review and copy your prompt'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose}
                className="flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors hover:bg-zinc-700"
                style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {stage === 'configure' ? (
                  <motion.div key="configure"
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                    <ConfigureStage form={form} update={update}
                      showCustomAudience={showCustomAudience}
                      showCustomLanguage={showCustomLanguage}
                      showCustomStyle={showCustomStyle}
                      validationError={validationError} />
                  </motion.div>
                ) : (
                  <motion.div key="preview"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                    <PreviewStage prompt={generatedPrompt} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4 pb-6"
              style={{ borderTop: '1px solid var(--border-color)' }}>
              {stage === 'configure' ? (
                <>
                  <button onClick={handleReset}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                    <RotateCcw size={14} />Reset
                  </button>
                  <div className="flex gap-3">
                    <button onClick={handleClose}
                      className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: 'var(--text-sub)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                      Cancel
                    </button>
                    <button onClick={handleGenerate}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: 'var(--color-accent)', border: 'none' }}>
                      <Wand2 size={16} />Generate Prompt
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => { setStage('configure'); setCopied(false); }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-sub)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} />Edit
                  </button>
                  <div className="flex gap-3">
                    <button onClick={handleReset}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                      <RotateCcw size={14} />Reset
                    </button>
                    <button onClick={handleCopy}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
                      style={{
                        backgroundColor: copied ? 'rgba(16, 185, 129, 0.8)' : 'var(--color-accent)',
                        border: 'none',
                      }}>
                      {copied ? (<><Check size={16} />Copied!</>) : (<><Copy size={16} />Copy Prompt</>)}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
