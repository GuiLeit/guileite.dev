import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../i18n';
import { getFeaturedProjects } from '../lib/api';
import SectionHeader from './section-header';
import ProjectsGrid from './projects-grid';

export default async function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations('featured');
  const modalT = await getTranslations('modal');

  const projects = await getFeaturedProjects(locale, 3);

  return (
    <section
      id="work"
      style={{ padding: 'clamp(64px, 8vh, 96px) var(--gutter)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container)' }}>
        <SectionHeader
          index="04 / SELECTED"
          title={t('title')}
          caption={t('caption')}
        />

        <ProjectsGrid
          projects={projects}
          startIndex={0}
          liveLabel={t('live')}
          repoLabel={t('repo')}
          modalLabels={{
            close: modalT('close'),
            prev: modalT('prev'),
            next: modalT('next'),
            visit: modalT('visit'),
            code: modalT('code'),
          }}
        />

        <div className="mt-10 flex justify-end">
          <Link
            href={`/${locale}/projects`}
            className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle no-underline transition-colors duration-150 hover:text-accent"
          >
            <span
              className="h-px bg-border-strong transition-all duration-200 group-hover:bg-accent"
              style={{ width: '80px' }}
              aria-hidden
            />
            <span>{t('seeMore')}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
