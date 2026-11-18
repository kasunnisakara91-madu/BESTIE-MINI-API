import type { AppRoute } from './Navbar';

interface FooterProps {
  onNavigate: (path: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-violet-500/15 bg-[#07060c] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-semibold text-zinc-200">BESTIE MINI API</span>
          <span aria-hidden="true">·</span>
          <span>Server-authenticated proxy gateway &amp; developer portal</span>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => onNavigate('/docs')}
            className="hover:text-zinc-100 transition-colors"
          >
            Documentation
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/tester')}
            className="hover:text-zinc-100 transition-colors"
          >
            API Tester
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/logs')}
            className="hover:text-zinc-100 transition-colors"
          >
            Health &amp; Logs
          </button>
          <a
            href="/health"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-violet-400 hover:text-violet-300 transition-colors"
          >
            /health
          </a>
        </div>
      </div>
    </footer>
  );
}
