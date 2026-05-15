'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('racket-companion:theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setThemeClass(t: Theme) {
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

const TRANSITION_MS = 1280;

function applyTheme(t: Theme) {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Prefer the View Transitions API for a clean cross-fade
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (!reduced && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => setThemeClass(t));
    return;
  }

  // Fallback: scope a one-off transition just for this swap
  if (!reduced) {
    root.classList.add('theme-transitioning');
    setThemeClass(t);
    window.setTimeout(() => root.classList.remove('theme-transitioning'), TRANSITION_MS);
  } else {
    setThemeClass(t);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    setHydrated(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem('racket-companion:theme', next);
  };

  // Render placeholder until hydrated so we don't flicker the wrong icon
  const label = hydrated ? (theme === 'dark' ? 'Light' : 'Dark') : 'Theme';
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="font-sans text-[11px] tracking-widest uppercase text-dim hover:text-ink transition flex items-center gap-1.5"
    >
      <span className="w-3 h-3 inline-block" aria-hidden="true">
        {hydrated && theme === 'dark' ? (
          // Sun (suggesting "switch to light")
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
            <circle cx="6" cy="6" r="2.2" />
            <path d="M6 0.8v1.6M6 9.6v1.6M0.8 6h1.6M9.6 6h1.6M2.3 2.3l1.1 1.1M8.6 8.6l1.1 1.1M2.3 9.7l1.1-1.1M8.6 3.4l1.1-1.1" strokeLinecap="round" />
          </svg>
        ) : (
          // Moon (suggesting "switch to dark")
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
            <path d="M9.5 7.4A3.7 3.7 0 0 1 4.6 2.5a.4.4 0 0 0-.5-.5A4.7 4.7 0 1 0 10 7.9a.4.4 0 0 0-.5-.5Z" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
