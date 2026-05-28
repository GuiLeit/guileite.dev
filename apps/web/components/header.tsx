'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '../i18n';
import { useTheme } from '../providers/theme-provider';

function ChipToggle({
  leftLabel,
  rightLabel,
  leftActive,
  onToggle,
  ariaLabel,
}: {
  leftLabel: string;
  rightLabel: string;
  leftActive: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={ariaLabel}
      className="flex items-center gap-0 border border-border px-[10px] py-[6px] font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-150 hover:border-border-strong"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <span className={leftActive ? 'text-fg' : 'text-fg-subtle'}>{leftLabel}</span>
      <span className="mx-[5px] text-fg-subtle">/</span>
      <span className={!leftActive ? 'text-fg' : 'text-fg-subtle'}>{rightLabel}</span>
    </button>
  );
}

export default function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const { theme, toggle: toggleTheme } = useTheme();

  function switchLocale() {
    const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
    const newPath = pathname.replace(/^\/(pt-BR|en)/, `/${next}`);
    router.replace(newPath, { scroll: false });
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
  }

  const isProjectsPage = pathname.includes('/projects');

  return (
    <header
      className="sticky top-0 z-50 h-16 hairline-b"
      style={{
        background: 'oklch(from var(--bg) l c h / 0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between"
        style={{ maxWidth: 'var(--container)', padding: '0 var(--gutter)' }}
      >
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-center gap-1.5 font-mono text-sm no-underline">
          <span className="text-accent">⟡</span>
          <span className="text-fg">
            guileite
            <span className="text-fg-subtle">.dev</span>
          </span>
        </Link>

        

        {/* Controls */}
        <div className="flex items-center gap-2">
          <ChipToggle
            leftLabel="PT"
            rightLabel="EN"
            leftActive={locale === 'pt-BR'}
            onToggle={switchLocale}
            ariaLabel={t('common.lang')}
          />
          <ChipToggle
            leftLabel="DARK"
            rightLabel="LIGHT"
            leftActive={theme === 'dark'}
            onToggle={toggleTheme}
            ariaLabel={t('common.theme')}
          />
        </div>
      </div>
    </header>
  );
}

