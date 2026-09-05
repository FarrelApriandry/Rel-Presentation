import { LogOut, Presentation } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(39, 39, 42, 0.8)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-6 py-4"
        style={{ maxWidth: 'var(--container-max)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
            }}
          >
            <Presentation size={18} style={{ color: 'var(--color-accent-text)' }} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-main)' }}>
              AI Deck Presenter
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUploadClick}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              border: 'none',
            }}
          >
            <Presentation size={16} />
            New Deck
          </button>

          <a
            href="/api/auth/signout"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{
              color: 'var(--text-sub)',
              textDecoration: 'none',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </a>
        </div>
      </div>
    </header>
  );
}