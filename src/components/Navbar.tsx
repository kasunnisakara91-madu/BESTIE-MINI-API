import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type AppRoute = '/' | '/docs' | '/tester' | '/logs';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: AppRoute) => void;
  onQuickHealthCheck: () => void;
  checkingHealth: boolean;
}

const NAV_LINKS: Array<{ path: AppRoute; label: string }> = [
  { path: '/', label: 'Overview' },
  { path: '/docs', label: 'Documentation' },
  { path: '/tester', label: 'API Tester' },
  { path: '/logs', label: 'Health & Logs' },
];

export function Navbar({
  currentPath,
  onNavigate,
  onQuickHealthCheck,
  checkingHealth,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (path: AppRoute) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-violet-500/15 bg-[#09080f]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400 rounded-md"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="2"
              y="2"
              width="28"
              height="28"
              rx="8"
              fill="url(#bestieLogoGrad)"
              fillOpacity="0.18"
              stroke="#a855f7"
              strokeWidth="1.5"
            />
            <path
              d="M11 10.5H17.5C19.433 10.5 21 12.067 21 14C21 15.105 20.488 16.09 19.688 16.73C20.777 17.342 21.5 18.508 21.5 19.833C21.5 21.858 19.858 23.5 17.833 23.5H11V10.5Z"
              stroke="#e9d5ff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M11 16.8H18" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
            <defs>
              <linearGradient id="bestieLogoGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            BESTIE MINI API
          </span>
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.path);
                }}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400 rounded ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-[21px] h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-400" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onQuickHealthCheck}
            disabled={checkingHealth}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-300"
          >
            <Activity className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            <span>{checkingHealth ? 'Checking...' : 'Check Health'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-violet-500/20 text-zinc-200 hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-violet-500/15 bg-[#0c0a15] px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.path);
                }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600/20 text-white border border-violet-500/30'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onQuickHealthCheck();
            }}
            disabled={checkingHealth}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            <Activity className={`w-4 h-4 ${checkingHealth ? 'animate-spin' : ''}`} />
            <span>{checkingHealth ? 'Checking Health...' : 'Check Health'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
