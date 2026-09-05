import { LogOut, Presentation } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-main) 80%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
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
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Presentation size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
              AI Deck Presenter
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUploadClick}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-px"
            style={{
              backgroundColor: 'var(--color-accent)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
            }}
          >
            <Presentation size={16} />
            New Deck
          </button>

          <a
            href="/api/auth/signout"
            className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
            style={{
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
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