import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencySelector } from '@/components/CurrencySelector';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Racket Database',
  description: 'A field guide to badminton rackets — every spec, sourced.',
};

// Sets the dark class on <html> before first paint to avoid a light flash.
const themeBoot = `
try {
  var t = localStorage.getItem('racket-companion:theme');
  if (t !== 'light' && t !== 'dark') {
    t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-screen antialiased">
        <header className="border-b border-rule bg-paper">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-baseline justify-between">
            <Link href="/" className="font-serif italic text-xl md:text-2xl font-semibold tracking-tight no-underline">
              The Racket Database
            </Link>
            <nav className="font-sans text-[11px] tracking-widest uppercase text-dim flex items-center gap-6">
              <Link href="/" className="hover:text-ink">Browse</Link>
              <Link href="/compare" className="hover:text-ink">Compare</Link>
              <CurrencySelector />
              <ThemeToggle />
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-rule mt-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 font-sans text-xs text-dim">
            Data compiled from manufacturer (Yonex US, Victor Global) and retailer (Badminton Warehouse) sources. Specs may vary by lot.
          </div>
        </footer>
      </body>
    </html>
  );
}
