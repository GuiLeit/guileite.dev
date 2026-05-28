import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '../../i18n';
import Header from '../../components/header';
import Footer from '../../components/footer';
import HtmlLang from '../../components/html-lang';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hero' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guileite.dev';
  return {
    title: {
      default: 'Guilherme Leite — Software Developer',
      template: '%s · guileite.dev',
    },
    description: t('headline'),
    metadataBase: new URL(siteUrl),
    alternates: {
      languages: {
        'pt-BR': `${siteUrl}/pt-BR`,
        en:      `${siteUrl}/en`,
        'x-default': `${siteUrl}/pt-BR`,
      },
    },
    openGraph: {
      siteName: 'guileite.dev',
      locale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang locale={locale} />
      <Header locale={locale as Locale} />
      <main>{children}</main>
      <Footer locale={locale as Locale} />
    </NextIntlClientProvider>
  );
}
