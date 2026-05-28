interface SectionHeaderProps {
  index: string;
  title: string;
  caption?: string;
  id?: string;
}

export default function SectionHeader({ index, title, caption, id }: SectionHeaderProps) {
  return (
    <header className="mb-10" id={id}>
      <div className="mb-5 flex items-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle whitespace-nowrap">
          {index}
        </span>
        <div className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <h2
        className="font-display"
        style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
      >
        {title}
      </h2>
      {caption && (
        <p className="mt-3 font-sans text-[15px] text-fg-muted" style={{ maxWidth: '52ch' }}>
          {caption}
        </p>
      )}
    </header>
  );
}
