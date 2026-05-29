export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '../../i18n';
import Hero from '../../components/hero';
import Skills from '../../components/skills';
import FeaturedProjects from '../../components/featured-projects';
import Contact from '../../components/contact';
import HeroRail from '../../components/hero-rail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Guilherme Leite — Software Developer',
    description: t('headline'),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {/* Centered page grid: rail hugs the left edge of the content container */}
      <style>{`
        .page-with-rail {
          display: grid;
          grid-template-columns: 92px 1fr;
          max-width: calc(var(--container) + 92px);
          margin-left: auto;
          margin-right: auto;
        }
        @media (max-width: 720px) {
          .page-with-rail { display: block; }
          .hero-rail { display: none; }
        }
      `}</style>
      <div className="page-with-rail">
        <HeroRail />
        <div>
          <Hero locale={locale as Locale} />
          <Skills locale={locale as Locale} />
          <FeaturedProjects locale={locale as Locale} />
          <Contact />
        </div>
      </div>
    </>
  );
}
