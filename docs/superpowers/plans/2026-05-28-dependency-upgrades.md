# Dependency Upgrades: NestJS 10→11, Next.js 14→15 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade NestJS from 10 to 11 and Next.js from 14 to 15 (plus next-intl from 3 to 4) to resolve runtime security vulnerabilities found in `npm audit`.

**Architecture:** Two independent upgrade tracks — API and Web — each with their own breaking changes. NestJS 11 pulls in Express 5 and bumps all `@nestjs/*` peer-dep ranges. Next.js 15 makes `params` and `searchParams` async Promises, requiring every page/layout that reads route params to `await` them before use. next-intl 4 removes the `localeDetection` middleware option.

**Tech Stack:** NestJS 11, Express 5, Next.js 15, next-intl 4, TypeScript 5, npm workspaces, Turborepo.

---

## Files changed

### API (`apps/api/`)
| File | Change |
|---|---|
| `apps/api/package.json` | Bump all `@nestjs/*` to v11, `@types/express` to v5, `@nestjs/throttler` to v7 |

### Web (`apps/web/`)
| File | Change |
|---|---|
| `apps/web/package.json` | Bump `next` to v15, `next-intl` to v4, `eslint-config-next` to v15 |
| `apps/web/middleware.ts` | Remove `localeDetection` option (removed from next-intl v4) |
| `apps/web/app/[locale]/layout.tsx` | `params` becomes `Promise<{locale}>` — await in `generateMetadata` and `LocaleLayout` |
| `apps/web/app/[locale]/page.tsx` | `params` becomes `Promise<{locale}>` — make `HomePage` async, await params |
| `apps/web/app/[locale]/projects/page.tsx` | `params` and `searchParams` both become Promises — await both |

---

## Task 1: Upgrade NestJS 10 → 11 in `apps/api/package.json`

**Files:**
- Modify: `apps/api/package.json`

NestJS 11 peers: all `@nestjs/*` runtime packages jump to `^11.0.0`. The devDep `@nestjs/cli` and `@nestjs/schematics` also go to `^11.0.0`. `@nestjs/throttler` v6 only peers with NestJS 10; v7 is required for NestJS 11. `@types/express` must go to `^5.0.0` because NestJS 11 uses Express 5 under the hood.

- [ ] **Step 1: Update `apps/api/package.json`**

Replace the entire file with:

```json
{
  "name": "@guileite/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "type-check": "tsc --noEmit -p tsconfig.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/throttler": "^7.0.0",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "helmet": "^8.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.8",
    "@types/express": "^5.0.0",
    "@types/node": "^20",
    "@types/passport-jwt": "^4.0.1",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Install from repo root**

```bash
npm install
```

Expected: packages resolve, no ERESOLVE errors. If there are peer dep conflicts, run `npm install --legacy-peer-deps` and note which packages still have mismatched peers.

- [ ] **Step 3: Run type-check on API**

```bash
cd apps/api && npx tsc --noEmit -p tsconfig.json
```

Expected: no errors. If `@types/express` v5 surface changed something (e.g. `Request.cookies` type), fix the specific line flagged.

- [ ] **Step 4: Smoke-test API startup**

Ensure `apps/api/.env` exists with valid `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, and `DATABASE_URL`, then:

```bash
cd apps/api && npm run build 2>&1 | tail -5
```

Expected: `Successfully compiled` (or similar NestJS build success message), no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/package.json package-lock.json
git commit -m "chore(api): upgrade NestJS 10 → 11, Express 4 → 5, throttler 6 → 7"
```

---

## Task 2: Upgrade Next.js 14 → 15 and next-intl 3 → 4 in `apps/web/package.json`

**Files:**
- Modify: `apps/web/package.json`

Next.js 15 requires `eslint-config-next` to match. `next-intl` v3 is not compatible with Next.js 15 App Router params changes; v4 is required. React 18 still works with Next.js 15 so we leave React at 18 to minimise scope.

- [ ] **Step 1: Update `apps/web/package.json`**

Replace the entire file with:

```json
{
  "name": "@guileite/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-visually-hidden": "^1.1.1",
    "clsx": "^2.1.1",
    "geist": "^1.7.1",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "next-intl": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "eslint": "^8",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Install from repo root**

```bash
npm install
```

Expected: packages resolve without ERESOLVE errors.

- [ ] **Step 3: Commit package changes before code fixes**

```bash
git add apps/web/package.json package-lock.json
git commit -m "chore(web): bump next 14→15, next-intl 3→4, eslint-config-next 15"
```

---

## Task 3: Fix next-intl v4 middleware API

**Files:**
- Modify: `apps/web/middleware.ts`

`next-intl` v4 removed the `localeDetection` option from `createMiddleware`. Locale detection from `Accept-Language` is now always on by default, so removing the option has no behaviour change.

- [ ] **Step 1: Update `apps/web/middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/middleware.ts
git commit -m "fix(web): remove localeDetection option removed in next-intl v4"
```

---

## Task 4: Fix async params in `app/[locale]/layout.tsx`

**Files:**
- Modify: `apps/web/app/[locale]/layout.tsx`

Next.js 15 changed `params` to be a `Promise`. Both `generateMetadata` and the layout component itself must `await params` before destructuring `locale`.

- [ ] **Step 1: Update `apps/web/app/[locale]/layout.tsx`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/[locale]/layout.tsx
git commit -m "fix(web): await params Promise in locale layout (Next.js 15)"
```

---

## Task 5: Fix async params in `app/[locale]/page.tsx`

**Files:**
- Modify: `apps/web/app/[locale]/page.tsx`

`params` is now a Promise. `HomePage` must become `async` to `await` it.

- [ ] **Step 1: Update `apps/web/app/[locale]/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '../../i18n';
import Hero from '../../components/hero';
import Skills from '../../components/skills';
import FeaturedProjects from '../../components/featured-projects';
import Contact from '../../components/contact';

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
      <Hero locale={locale as Locale} />
      <Skills locale={locale as Locale} />
      <FeaturedProjects locale={locale as Locale} />
      <Contact />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/[locale]/page.tsx
git commit -m "fix(web): await params Promise in home page (Next.js 15)"
```

---

## Task 6: Fix async params and searchParams in `app/[locale]/projects/page.tsx`

**Files:**
- Modify: `apps/web/app/[locale]/projects/page.tsx`

Both `params` and `searchParams` are Promises in Next.js 15. The interface and the component body need updating.

- [ ] **Step 1: Update `apps/web/app/[locale]/projects/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '../../../i18n';
import { locales } from '../../../i18n';
import { getProjects } from '../../../lib/api';
import ProjectsGrid from '../../../components/projects-grid';
import Pagination from '../../../components/pagination';

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
  const t = await getTranslations({ locale, namespace: 'projectsPage' });
  return { title: t('title') };
}

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const locale_ = locale as Locale;
  setRequestLocale(locale);
  const raw = Number(pageParam);
  const page = Math.max(1, Number.isFinite(raw) ? Math.floor(raw) : 1);
  const LIMIT = 9;

  const t = await getTranslations({ locale, namespace: 'projectsPage' });
  const modalT = await getTranslations({ locale, namespace: 'modal' });
  const featuredT = await getTranslations({ locale, namespace: 'featured' });

  const { data: projects, meta } = await getProjects(locale_, page, LIMIT);

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
              locale={locale_}
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/[locale]/projects/page.tsx
git commit -m "fix(web): await params and searchParams Promises in projects page (Next.js 15)"
```

---

## Task 7: Verify and final audit

- [ ] **Step 1: Run type-check across the entire monorepo**

```bash
npm run type-check
```

Expected: 0 errors. If `@nestjs/swagger` v11 changed any decorator types, fix the affected DTO/controller file.

- [ ] **Step 2: Build both apps**

```bash
npm run build
```

Expected: both `apps/api` and `apps/web` build successfully.

- [ ] **Step 3: Run final audit**

```bash
npm audit
```

Expected: the high/moderate runtime vulnerabilities from `next`, `next-intl`, `@nestjs/core`, `lodash`, `multer`, `qs`, and `express` are gone. Remaining findings should be limited to `@nestjs/cli` dev tooling (not shipped to production) and flagged as acceptable.

- [ ] **Step 4: Commit if there were any type-fix adjustments**

```bash
git add -p   # stage only the fix files
git commit -m "fix: post-upgrade type fixes after NestJS 11 / Next.js 15 migration"
```

- [ ] **Step 5: Final summary commit**

```bash
git log --oneline -8
```

Verify the upgrade commits are present and the branch is clean (`git status` shows nothing staged or unstaged).
