import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { sans, mono, display } from '../fonts';
import '../globals.css';
import { locales, type Locale } from '../../i18n';
import Header from '../../components/header';
import Footer from '../../components/footer';

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
    <html
      lang={locale}
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash theme script — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('theme');var mql=window.matchMedia('(prefers-color-scheme:dark)');document.documentElement.setAttribute('data-theme',s||(mql.matches?'dark':'light'));}catch(e){}`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <main>{children}</main>
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
