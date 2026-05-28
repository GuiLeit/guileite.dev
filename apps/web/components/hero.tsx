import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../i18n';
import Portrait from './portrait';

export default async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('hero');

  return (
    <section
      id="index"
      className="relative overflow-hidden"
      style={{ padding: 'clamp(64px, 10vh, 120px) var(--gutter)' }}
      aria-label="Hero"
    >
      {/* Background G.L. monogram */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 select-none font-display italic"
        style={{
          fontSize: 'clamp(280px, 38vw, 580px)',
          opacity: 0.025,
          color: 'var(--fg)',
          lineHeight: 0.85,
          userSelect: 'none',
        }}
      >
        G.L.
      </div>

      <div
        className="relative mx-auto"
        style={{
          maxWidth: 'var(--container)',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 'clamp(28px, 5vw, 88px)',
          alignItems: 'start',
        }}
      >
        {/* Main content */}
        <div className="min-w-0">
          <p className="text-eyebrow mb-6">{t('eyebrow')}</p>

          <h1 className="mb-6" style={{ lineHeight: 0.92 }}>
            <span
              className="block font-display"
              style={{ fontSize: 'clamp(64px, 9.5vw, 140px)', letterSpacing: '-0.025em' }}
            >
              Guilherme
              <br />
              Leite
            </span>
            <span className="mt-3 flex items-center gap-3">
              <span
                className="font-display italic"
                style={{ fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--accent)' }}
              >
                /
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
                {t('role')}
              </span>
            </span>
          </h1>

          <p
            className="mb-5 font-sans font-normal text-fg"
            style={{ fontSize: 'clamp(20px, 2.1vw, 28px)', maxWidth: '26ch', textWrap: 'pretty' } as React.CSSProperties}
          >
            {t('headline')}
          </p>

          <p
            id="about"
            className="mb-10 font-sans leading-[1.65] text-fg-muted"
            style={{ fontSize: '17px', maxWidth: '56ch', textWrap: 'pretty' } as React.CSSProperties}
          >
            {t('bio')}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/projects`}
              className="group flex items-center gap-2 bg-accent px-[22px] py-[14px] font-sans text-sm font-medium text-accent-fg no-underline transition-colors duration-150 hover:opacity-90"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span>{t('ctaProjects')}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
            </Link>
            <a
              href="#contact"
              className="group flex items-center gap-2 border border-border-strong bg-transparent px-[22px] py-[14px] font-sans text-sm font-medium text-fg no-underline transition-colors duration-150 hover:border-accent"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span>{t('ctaContact')}</span>
              <span className="transition-transform duration-200 group-hover:translate-y-[3px]">↓</span>
            </a>
          </div>
        </div>

        {/* Right side — sticky portrait + meta (hidden below xl) */}
        <aside className="hidden flex-col gap-6 xl:flex" style={{ position: 'sticky', top: '96px' }}>
          <Portrait label={t('meta.portrait')} />

          <dl className="hairline-t font-mono text-[11px]">
            {([
              ['STATUS', t('meta.status'), true],
              ['LOC',    t('meta.location'), false],
              ['REV',    t('meta.updated'), false],
            ] as [string, string, boolean][]).map(([key, value, hasDot]) => (
              <div key={key} className="hairline-b flex items-center gap-4 py-3">
                <dt className="w-14 shrink-0 uppercase tracking-[0.08em] text-fg-subtle">{key}</dt>
                <dd className="flex items-center gap-1.5 text-fg-muted">
                  {hasDot && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                      style={{ animation: 'pulse-dot 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
                      aria-hidden
                    />
                  )}
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Collapse portrait column below xl, pulse animation */}
      <style>{`
        @media (max-width: 1100px) {
          section[aria-label="Hero"] > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse-dot { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}
