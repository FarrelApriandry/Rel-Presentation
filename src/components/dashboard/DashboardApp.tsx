import { useState, useCallback } from 'react';
import UploadModal from './UploadModal';
import BasicPromptModal from './BasicPromptModal';
import PresentationGrid from './PresentationGrid';
import { Plus, Sparkles } from 'lucide-react';

export default function DashboardApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const handleUploaded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <>
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
          Basic Prompt
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
      />
    </>
  );
}
