import { useState, useCallback } from 'react';
import { Maximize, Minimize, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingControlsProps {
  shareUrl: string;
}

export default function FloatingControls({ shareUrl }: FloatingControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl p-2"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(228, 228, 231, 0.6)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      }}
    >
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className="flex cursor-pointer items-center justify-center rounded-xl p-2.5 transition-all hover:-translate-y-px"
        style={{
          color: 'var(--text-sub, #52525b)',
          backgroundColor: 'transparent',
          border: 'none',
        }}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      <button
        onClick={handleShare}
        title="Copy share link"
        className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all hover:-translate-y-px"
        style={{
          color: copied ? '#16a34a' : 'var(--text-sub, #52525b)',
          backgroundColor: copied ? '#dcfce7' : 'transparent',
          border: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="flex items-center gap-1">
              <Check size={14} />Copied!
            </motion.span>
          ) : (
            <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="flex items-center gap-1">
              <Share2 size={14} />Share
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
