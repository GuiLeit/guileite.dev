import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center" style={{ padding: 'var(--gutter)' }}>
      <p className="text-eyebrow mb-4">404 / NOT FOUND</p>
      <h1 className="font-display text-[clamp(48px,8vw,104px)] leading-none">Page not found</h1>
      <Link href="/" className="mt-8 font-mono text-xs uppercase tracking-widest text-accent hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
