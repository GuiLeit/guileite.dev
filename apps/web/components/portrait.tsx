export default function Portrait({ label }: { label: string }) {
  return (
    <div
      className="relative border border-border"
      style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)' }}
    >
      <svg
        viewBox="0 0 320 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="port-g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--portrait-a)" />
            <stop offset="100%" stopColor="var(--portrait-b)" />
          </linearGradient>
          <pattern id="port-sp" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="url(#port-g)" />
            <circle cx="3" cy="3" r="0.55" fill="rgba(0,0,0,0.35)" />
          </pattern>
        </defs>
        <rect width="320" height="400" fill="url(#port-sp)" />
        <g opacity="0.55">
          <ellipse cx="160" cy="160" rx="62" ry="72" fill="rgba(0,0,0,0.35)" />
          <path d="M50 400 C 70 300, 120 250, 160 250 C 200 250, 250 300, 270 400 Z" fill="rgba(0,0,0,0.35)" />
        </g>
      </svg>

      {/* Bottom-left label */}
      <div
        className="absolute bottom-0 left-0 border border-border bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle"
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
