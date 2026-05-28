import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '../../i18n';
import Hero from '../../components/hero';
import Skills from '../../components/skills';
import FeaturedProjects from '../../components/featured-projects';
import Contact from '../../components/contact';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Guilherme Leite — Software Developer',
    description: t('headline'),
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <Hero locale={locale as Locale} />
      <Skills locale={locale as Locale} />
      <FeaturedProjects locale={locale as Locale} />
      <Contact />
    </>
  );
}
