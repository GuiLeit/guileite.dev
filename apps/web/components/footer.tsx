'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '../i18n';

export default function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations('footer');
  const router = useRouter();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  function switchLocale() {
    const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
    const newPath = pathname.replace(/^\/(pt-BR|en)/, `/${next}`);
    router.replace(newPath, { scroll: false });
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
  }

  return (
    <footer
      className="hairline-t font-mono text-[11px] text-fg-subtle"
      style={{ padding: '32px var(--gutter)' }}
    >
      <div
        className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ maxWidth: 'var(--container)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-accent">⟡</span>
          <span>guileite.dev</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span>{t('copyright', { year })}</span>
          <span className="text-border-strong">·</span>
          <a
            href="https://github.com/GuiLeit/guileite.dev"
            target="_blank"
            rel="noreferrer"
            className="text-fg-subtle transition-colors duration-150 hover:text-accent"
          >
            {t('source')}
          </a>
          <span className="text-border-strong">·</span>
          <button
            onClick={switchLocale}
            className="text-fg-subtle transition-colors duration-150 hover:text-accent"
          >
            {locale === 'pt-BR' ? 'PT-BR ↔ EN' : 'EN ↔ PT-BR'}
          </button>
        </div>
      </div>
    </footer>
  );
}
