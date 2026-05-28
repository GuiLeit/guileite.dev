import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  locale: string;
  prevLabel: string;
  nextLabel: string;
  pageOfLabel: string;
}

export default function Pagination({
  page,
  totalPages,
  locale,
  prevLabel,
  nextLabel,
  pageOfLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const label = pageOfLabel
    .replace('{page}', String(page))
    .replace('{total}', String(totalPages));

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em]"
    >
      {page > 1 ? (
        <Link
          href={`/${locale}/projects?page=${page - 1}`}
          scroll
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle no-underline transition-colors duration-150 hover:border-border-strong hover:text-fg"
          style={{ borderRadius: 'var(--radius)' }}
        >
          ← {prevLabel}
        </Link>
      ) : (
        <span
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle opacity-30"
          style={{ borderRadius: 'var(--radius)' }}
          aria-disabled="true"
        >
          ← {prevLabel}
        </span>
      )}

      <span className="text-fg-subtle">{label}</span>

      {page < totalPages ? (
        <Link
          href={`/${locale}/projects?page=${page + 1}`}
          scroll
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle no-underline transition-colors duration-150 hover:border-border-strong hover:text-fg"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {nextLabel} →
        </Link>
      ) : (
        <span
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle opacity-30"
          style={{ borderRadius: 'var(--radius)' }}
          aria-disabled="true"
        >
          {nextLabel} →
        </span>
      )}
    </nav>
  );
}
