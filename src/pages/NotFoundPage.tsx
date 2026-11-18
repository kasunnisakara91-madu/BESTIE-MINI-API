import { ArrowLeft, BookOpen, Terminal } from 'lucide-react';
import type { AppRoute } from '../components/Navbar';

interface NotFoundPageProps {
  onNavigate: (path: AppRoute) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="glass-surface rounded-2xl p-8 sm:p-12 max-w-lg w-full text-center space-y-5">
        <div className="font-mono text-5xl font-bold text-violet-400 tabular-nums">404</div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-sm text-zinc-400">
            The route you requested does not exist in the BESTIE MINI API portal.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/docs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-violet-500/25 text-zinc-200 hover:bg-violet-500/15 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Documentation</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/tester')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-violet-500/25 text-zinc-200 hover:bg-violet-500/15 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span>API Tester</span>
          </button>
        </div>
      </div>
    </div>
  );
}
