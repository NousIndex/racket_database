import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-12 py-24 text-center">
      <h1 className="font-serif text-5xl font-normal tracking-tight">Not in the catalogue.</h1>
      <p className="font-serif text-lg text-dim mt-4">
        We couldn’t find that racket. It may have been a misspelled slug, or it’s simply not in our index yet.
      </p>
      <p className="mt-8">
        <Link href="/" className="font-sans text-sm underline underline-offset-2">← Back to the browse view</Link>
      </p>
    </main>
  );
}
