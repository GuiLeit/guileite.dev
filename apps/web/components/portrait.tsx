import Image from 'next/image';

export default function Portrait({ label }: { label: string }) {
  return (
    <div
      className="relative overflow-hidden border border-border"
      style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)' }}
    >
      <Image
        src="/images/profile.jpeg"
        alt="Guilherme Leite"
        fill
        className="object-cover object-top"
        sizes="360px"
        priority
      />

      {/* Gradient fade — blends the bottom crop into the page background */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/5"
        style={{ background: 'linear-gradient(to top, var(--bg) 10%, transparent 100%)' }}
        aria-hidden
      />

      {/* Bottom-left label */}
      <div
        className="absolute bottom-0 left-0 border border-border bg-bg/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {label}
      </div>

      {/* Top-right accent L-bracket */}
      <div
        className="absolute right-0 top-0 h-[18px] w-[18px]"
        style={{
          borderTop: '2px solid var(--accent)',
          borderRight: '2px solid var(--accent)',
        }}
        aria-hidden
      />
    </div>
  );
}
