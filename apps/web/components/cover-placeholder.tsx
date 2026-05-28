interface CoverPlaceholderProps {
  projectId: string;
  code?: string;
  year?: number;
  imageCount: number;
  sig: [string, string];
}

export default function CoverPlaceholder({
  projectId,
  code,
  year,
  imageCount,
  sig,
}: CoverPlaceholderProps) {
  const gradId = `g-${projectId}`;
  const patId = `sp-${projectId}`;
  const [a, b] = sig;

  return (
    <div className="relative border border-border" style={{ aspectRatio: '16/10' }}>
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
          <pattern id={patId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill={`url(#${gradId})`} />
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#${patId})`} />
        <rect width="400" height="250" fill="rgba(0,0,0,0.18)" />
      </svg>

      {(code || year) && (
        <div
          className="absolute right-2 top-2 bg-bg-deep/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle backdrop-blur-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {[code, year].filter(Boolean).join(' · ')}
        </div>
      )}

      <div
        className="absolute bottom-2 left-2 bg-bg-deep/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius)' }}
      >
        FRAME 01 / {String(imageCount).padStart(2, '0')}
      </div>
    </div>
  );
}
