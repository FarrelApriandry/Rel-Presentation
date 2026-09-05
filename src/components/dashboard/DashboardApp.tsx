import { useState, useCallback } from 'react';
import UploadModal from './UploadModal';
import PresentationGrid from './PresentationGrid';
import { Plus } from 'lucide-react';

export default function DashboardApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploaded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-px"
          style={{
            backgroundColor: 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
          }}
        >
          <Plus size={16} />
          New Deck
        </button>
      </div>

      <PresentationGrid refreshTrigger={refreshTrigger} />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />
    </>
  );
}
