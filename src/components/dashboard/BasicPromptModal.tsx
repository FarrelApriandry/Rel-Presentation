import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Copy, Check } from 'lucide-react';

interface BasicPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BASIC_PROMPT = `
You are an AI assistant helping create a presentation. Please generate a professional slide deck about [TOPIC].

Requirements:
- Title slide with the topic name
- 5-7 content slides with key points
- Use bullet points for clarity
- Include a summary/conclusion slide
- Keep text concise and impactful
- Suggest relevant visuals or icons for each slide
`;

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

export default function BasicPromptModal({ isOpen, onClose }: BasicPromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BASIC_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}>
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
            className="mx-4 w-full max-w-lg rounded-xl p-6"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                  <Sparkles size={16} style={{ color: '#c084fc' }} />
                </div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
                  Basic Prompt
                </h2>
              </div>
              <button onClick={handleClose}
                className="flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors hover:bg-zinc-700"
                style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none' }}>
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 max-h-[60vh] overflow-y-auto rounded-lg p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap"
              style={{
                backgroundColor: 'var(--surface-muted)',
                color: 'var(--text-sub)',
                border: '1px solid var(--border-color)',
              }}>
              {BASIC_PROMPT}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={handleClose}
                className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-sub)', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                Close
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}