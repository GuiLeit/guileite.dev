import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../../../i18n';
import { getProjects } from '../../../lib/api';
import ProjectsGrid from '../../../components/projects-grid';
import Pagination from '../../../components/pagination';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'projectsPage' });
  return { title: t('title') };
}

interface ProjectsPageProps {
  params: { locale: string };
  searchParams: { page?: string };
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const locale = params.locale as Locale;
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const LIMIT = 9;

  const t = await getTranslations({ locale, namespace: 'projectsPage' });
  const modalT = await getTranslations({ locale, namespace: 'modal' });
  const featuredT = await getTranslations({ locale, namespace: 'featured' });

  const { data: projects, meta } = await getProjects(locale, page, LIMIT);

  const entryCount = meta.total.toString().padStart(2, '0');

  return (
    <div style={{ padding: 'clamp(48px, 8vh, 80px) var(--gutter)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container)' }}>
        <header className="mb-12">
          <p className="text-eyebrow mb-4">/ ARCHIVE · {entryCount} ENTRIES</p>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 'clamp(48px, 8vw, 104px)' }}
          >
            {t('title')}
          </h1>
          <p className="mt-4 font-sans text-[15px] text-fg-muted" style={{ maxWidth: '48ch' }}>
            {t('caption')}
          </p>
        </header>

        {projects.length === 0 ? (
          <p className="font-sans text-fg-muted">{t('empty')}</p>
        ) : (
          <>
            <ProjectsGrid
              projects={projects}
              startIndex={(page - 1) * LIMIT}
              liveLabel={featuredT('live')}
              repoLabel={featuredT('repo')}
              modalLabels={{
                close: modalT('close'),
                prev: modalT('prev'),
                next: modalT('next'),
                visit: modalT('visit'),
                code: modalT('code'),
              }}
            />

            <Pagination
              page={page}
              totalPages={meta.totalPages}
              locale={locale}
              prevLabel={t('prev')}
              nextLabel={t('next')}
              pageOfLabel={t('pageOf')}
            />
          </>
        )}
      </div>
    </div>
  );
}
