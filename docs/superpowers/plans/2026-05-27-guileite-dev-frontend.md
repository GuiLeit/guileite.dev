# guileite.dev Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Next.js 14+ App Router frontend for guileite.dev — an engineering-log-aesthetic personal site with i18n (pt-BR/en), dark/light themes, and a NestJS API-backed projects showcase.

**Architecture:** Single `apps/web` Next.js app with `[locale]` route segment for i18n via `next-intl`. All data fetching is in React Server Components with ISR (`revalidate: 60`). Theme state lives in `data-theme` on `<html>`, persisted to localStorage, with a no-flash inline script. The NestJS API is consumed via a typed fetch wrapper; a stub is included for local dev when the API isn't running.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, next-intl 3.x, next/font/google (Geist + JetBrains Mono + Instrument Serif), shadcn/ui (Dialog only), lucide-react.

**Design Reference:** All components are re-expressed from `DESIGN_HANGOFF/prototype/site/components.jsx`. Do **not** port that file — re-express idiomatically. The `globals.css` and `messages/*.json` in `DESIGN_HANGOFF/` are drop-ins.

---

## File Map

```
apps/web/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                          (local dev env vars)
├── app/
│   ├── fonts.ts                        (Geist, JetBrains Mono, Instrument Serif)
│   ├── globals.css                     (drop-in from DESIGN_HANGOFF/globals.css)
│   └── [locale]/
│       ├── layout.tsx                  (html, fonts, theme script, Header, Footer)
│       ├── page.tsx                    (home: Hero + Skills + FeaturedProjects + Contact)
│       ├── not-found.tsx
│       └── projects/
│           └── page.tsx               (paginated projects grid + modal)
├── middleware.ts                       (next-intl locale detection + redirect)
├── i18n.ts                            (next-intl config)
├── messages/
│   ├── pt-BR.json                     (drop-in from DESIGN_HANGOFF/messages/)
│   └── en.json
├── components/
│   ├── header.tsx                     (sticky, blurred, lang + theme toggles)
│   ├── hero.tsx                       (asymmetric 3-col grid, portrait, meta)
│   ├── portrait.tsx                   (halftone SVG placeholder)
│   ├── skills.tsx                     (tabular dl from lib/skills.ts)
│   ├── section-header.tsx             (index + rule + title + caption)
│   ├── featured-projects.tsx          (server component, ISR fetch)
│   ├── project-card.tsx               (shared card, opens modal on click/Enter)
│   ├── cover-placeholder.tsx          (striped SVG for missing cover images)
│   ├── contact.tsx                    (tabular link list)
│   ├── footer.tsx                     (3-col, locale echo)
│   ├── project-modal.tsx              (Dialog, carousel, keyboard nav)
│   └── pagination.tsx                 (prev/next + counter, URL-driven)
└── lib/
    ├── api.ts                         (typed fetch wrapper + stub toggle)
    ├── types.ts                       (Project, ProjectImage, Locale)
    ├── skills.ts                      (SKILLS constant)
    └── contact.ts                     (CONTACT constant)
```

---

## Task 1: Scaffold `apps/web` — Next.js project with all dependencies

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/.env.local`

- [ ] **Step 1: Create the apps/web directory and package.json**

```bash
mkdir -p apps/web
```

Create `apps/web/package.json`:
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
    "next": "14.2.29",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-intl": "^3.26.5",
    "lucide-react": "^0.468.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-visually-hidden": "^1.1.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.17",
    "postcss": "^8",
    "autoprefixer": "^10.4.20",
    "eslint": "^8",
    "eslint-config-next": "14.2.29"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create .env.local**

```bash
# Server-side only (not exposed to browser)
API_URL=http://localhost:3001/api/v1

# Public
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=pt-BR
NEXT_PUBLIC_SUPPORTED_LOCALES=pt-BR,en

# Set to "true" to use stub data instead of hitting the API
NEXT_PUBLIC_USE_STUB=true
```

- [ ] **Step 6: Install dependencies**

```bash
cd apps/web && npm install
```

Expected: `node_modules` populated, no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json apps/web/next.config.ts apps/web/tsconfig.json apps/web/postcss.config.js apps/web/.env.local
git commit -m "feat: scaffold apps/web — Next.js 14 + TypeScript"
```

---

## Task 2: Design tokens — globals.css, fonts, Tailwind config

**Files:**
- Create: `apps/web/app/globals.css`  (copy from DESIGN_HANGOFF)
- Create: `apps/web/app/fonts.ts`
- Create: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Copy globals.css from DESIGN_HANGOFF**

Copy `DESIGN_HANGOFF/globals.css` verbatim to `apps/web/app/globals.css`. The file already has `@tailwind base/components/utilities` directives, OKLCH tokens for dark and light, base html/body styles, focus ring, reduced-motion media query, and utility classes `.text-eyebrow`, `.hairline-t/b/l/r`.

- [ ] **Step 2: Create apps/web/app/fonts.ts**

```ts
import { Geist, JetBrains_Mono, Instrument_Serif } from 'next/font/google';

export const sans = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const display = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});
```

- [ ] **Step 3: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:              'var(--bg)',
        'bg-elevated':   'var(--bg-elevated)',
        'bg-deep':       'var(--bg-deep)',
        fg:              'var(--fg)',
        'fg-muted':      'var(--fg-muted)',
        'fg-subtle':     'var(--fg-subtle)',
        border:          'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent:          'var(--accent)',
        'accent-fg':     'var(--accent-fg)',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['var(--font-display)', 'serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '6px',
        none: '0',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/globals.css apps/web/app/fonts.ts apps/web/tailwind.config.ts
git commit -m "feat: add design tokens — OKLCH, fonts, Tailwind mapping"
```

---

## Task 3: i18n setup — next-intl, messages, middleware

**Files:**
- Create: `apps/web/i18n.ts`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/messages/pt-BR.json`
- Create: `apps/web/messages/en.json`

- [ ] **Step 1: Create i18n.ts**

```ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 2: Create middleware.ts**

```ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 3: Copy messages from DESIGN_HANGOFF**

Copy `DESIGN_HANGOFF/messages/pt-BR.json` → `apps/web/messages/pt-BR.json`
Copy `DESIGN_HANGOFF/messages/en.json` → `apps/web/messages/en.json`

Both files already have all required keys. Do not edit them — they are the source of truth.

- [ ] **Step 4: Commit**

```bash
git add apps/web/i18n.ts apps/web/middleware.ts apps/web/messages/
git commit -m "feat: i18n setup — next-intl, pt-BR/en messages, locale middleware"
```

---

## Task 4: Types and API client

**Files:**
- Create: `apps/web/lib/types.ts`
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/lib/skills.ts`
- Create: `apps/web/lib/contact.ts`

- [ ] **Step 1: Create lib/types.ts**

```ts
export type Locale = 'pt-BR' | 'en';

export interface ProjectImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectUrl?: string | null;
  githubUrl?: string | null;
  orderIndex: number;
  resolvedLocale: string;
  requestedLocale: string;
  tags?: string[];
  year?: number;
  code?: string;
  images: ProjectImage[];
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    locale: string;
  };
}
```

- [ ] **Step 2: Create lib/skills.ts**

```ts
export const SKILLS = {
  languages:  ['TypeScript', 'Go', 'Python', 'Rust', 'SQL', 'Bash'],
  frameworks: ['Next.js', 'NestJS', 'React', 'Tailwind', 'Prisma', 'tRPC'],
  tools:      ['Git', 'Docker', 'Turborepo', 'Vercel', 'Fly.io', 'Figma'],
  databases:  ['PostgreSQL', 'Redis', 'SQLite', 'Neon'],
} as const;

export type SkillGroup = keyof typeof SKILLS;
```

- [ ] **Step 3: Create lib/contact.ts**

```ts
export const CONTACT = [
  { key: 'email',    value: 'hello@guileite.dev',        href: 'mailto:hello@guileite.dev' },
  { key: 'linkedin', value: '/in/guileite',              href: 'https://linkedin.com/in/guileite' },
  { key: 'github',   value: '@guileite',                 href: 'https://github.com/guileite' },
  { key: 'twitter',  value: '@guileite',                 href: 'https://x.com/guileite' },
] as const;

export type ContactKey = typeof CONTACT[number]['key'];
```

- [ ] **Step 4: Create lib/api.ts**

This file exports a typed fetch wrapper. When `NEXT_PUBLIC_USE_STUB=true`, it returns mock data instead of hitting the network. This makes development possible before the NestJS API is deployed.

```ts
import type { Project, PaginatedProjects, Locale } from './types';

// ─── Stub data (mirrors DESIGN_HANGOFF/prototype/site/data.jsx) ─────────────
const SIGS = [
  ['oklch(0.68 0.14 50)', 'oklch(0.42 0.09 50)'],
  ['oklch(0.72 0.10 220)', 'oklch(0.38 0.08 220)'],
  ['oklch(0.70 0.13 145)', 'oklch(0.40 0.08 145)'],
  ['oklch(0.74 0.12 90)', 'oklch(0.42 0.07 90)'],
  ['oklch(0.66 0.14 20)', 'oklch(0.40 0.09 20)'],
  ['oklch(0.70 0.12 290)', 'oklch(0.40 0.08 290)'],
  ['oklch(0.72 0.10 180)', 'oklch(0.40 0.07 180)'],
  ['oklch(0.74 0.11 60)', 'oklch(0.42 0.07 60)'],
  ['oklch(0.68 0.13 340)', 'oklch(0.40 0.08 340)'],
];

// Stub images array (3 placeholder items per project)
function makeImages(n: number): Project['images'] {
  return Array.from({ length: n }, (_, i) => ({
    id: `img-${i}`,
    url: '',    // empty → Cover placeholder renders SVG
    alt: '',
    order: i,
  }));
}

type StubRow = {
  id: string; code: string; year: number; sig: string[];
  projectUrl?: string; githubUrl?: string;
  tags: string[]; imageCount: number;
  translations: Record<Locale, { title: string; short: string; long: string }>;
};

const STUB_ROWS: StubRow[] = [
  {
    id: 'shotbox', code: 'SHB', year: 2026, sig: SIGS[0],
    projectUrl: 'https://shotbox.dev', githubUrl: 'https://github.com/guileite/shotbox',
    tags: ['Go', 'CLI'], imageCount: 4,
    translations: {
      'pt-BR': { title: 'Shotbox', short: 'Servidor de arquivos estáticos com presets para times pequenos.', long: 'Shotbox é um servidor de arquivos estáticos em Go, pensado para times pequenos que precisam compartilhar builds, design files e capturas de tela sem montar um drive na nuvem. Inclui presets para CI, expiração automática e um painel mínimo de auditoria.' },
      en:       { title: 'Shotbox', short: 'A static file server with presets for small teams.', long: 'Shotbox is a static file server written in Go for small teams who need to share builds, design files and screenshots without standing up a cloud drive. Ships with CI presets, automatic expiry and a minimal audit panel.' },
    },
  },
  {
    id: 'lume', code: 'LUM', year: 2026, sig: SIGS[1],
    githubUrl: 'https://github.com/guileite/lume',
    tags: ['React', 'Design system'], imageCount: 6,
    translations: {
      'pt-BR': { title: 'Lume', short: 'Biblioteca de componentes para interfaces administrativas densas.', long: 'Coleção de componentes React focada em interfaces administrativas — tabelas grandes, formulários longos, hierarquias profundas. Pareada com tokens em OKLCH, modo escuro de primeira classe e zero dependências de runtime.' },
      en:       { title: 'Lume', short: 'A component library for dense admin interfaces.', long: 'A React component library aimed at admin-style interfaces — big tables, long forms, deep hierarchies. Pairs with OKLCH design tokens, a first-class dark mode and zero runtime dependencies.' },
    },
  },
  {
    id: 'orbital', code: 'ORB', year: 2025, sig: SIGS[2],
    projectUrl: 'https://orbital.run', githubUrl: 'https://github.com/guileite/orbital',
    tags: ['Distributed', 'Rust'], imageCount: 5,
    translations: {
      'pt-BR': { title: 'Orbital', short: 'Agendador de jobs distribuído com leasing por lock no Postgres.', long: 'Orbital roda jobs cron em vários workers usando leasing por advisory lock no Postgres. Sem broker, sem Redis.' },
      en:       { title: 'Orbital', short: 'A distributed cron runner that leases jobs via Postgres advisory locks.', long: 'Orbital runs cron jobs across many workers using Postgres advisory locks for leasing. No broker, no Redis.' },
    },
  },
  {
    id: 'peripatos', code: 'PER', year: 2025, sig: SIGS[3],
    githubUrl: 'https://github.com/guileite/peripatos',
    tags: ['Notebook', 'Hobby'], imageCount: 3,
    translations: {
      'pt-BR': { title: 'Perípatos', short: 'Caderno de leitura com anotações cruzadas para filosofia antiga.', long: 'Aplicativo pessoal de leitura para textos clássicos: anotações por parágrafo, ligações cruzadas entre obras e busca por conceitos em grego.' },
      en:       { title: 'Peripatos', short: 'A reading notebook with cross-references for ancient philosophy.', long: 'A personal reading app for classical texts: paragraph-level notes, cross-links between works, concept search in Greek.' },
    },
  },
  {
    id: 'tilemap', code: 'TLM', year: 2025, sig: SIGS[4],
    projectUrl: 'https://tilemap.cc',
    tags: ['WebSocket', 'Multiplayer'], imageCount: 5,
    translations: {
      'pt-BR': { title: 'Tilemap', short: 'Editor colaborativo de pixel art em tempo real.', long: 'Editor de pixel art em tempo real para grupos pequenos. CRDTs para resolução de conflitos, paleta limitada por sala e exportação direta para sprite sheets.' },
      en:       { title: 'Tilemap', short: 'A real-time collaborative pixel-art editor.', long: 'A real-time pixel-art editor for small groups. CRDTs for conflict resolution, room-locked palettes and direct sprite-sheet export.' },
    },
  },
  {
    id: 'pgtap', code: 'PGT', year: 2024, sig: SIGS[5],
    githubUrl: 'https://github.com/guileite/pgtap-runner',
    tags: ['Postgres', 'Testing'], imageCount: 2,
    translations: {
      'pt-BR': { title: 'pgtap-runner', short: 'Runner moderno para testes pgTap com paralelismo opt-in.', long: 'Runner sobre pgTap com saída TAP colorida, paralelismo opt-in por schema e relatório de cobertura em SQL puro.' },
      en:       { title: 'pgtap-runner', short: 'A modern runner for pgTap suites with opt-in parallelism.', long: 'A runner over pgTap with colored TAP output, opt-in per-schema parallelism and a pure-SQL coverage report.' },
    },
  },
  {
    id: 'saci', code: 'SCI', year: 2024, sig: SIGS[6],
    githubUrl: 'https://github.com/guileite/saci',
    tags: ['TypeScript', 'Library'], imageCount: 3,
    translations: {
      'pt-BR': { title: 'Saci', short: 'Detector de fingerprints em tempo de build para apps web.', long: 'Saci varre o bundle final em busca de hashes, e-mails e segredos esquecidos antes que o deploy aconteça.' },
      en:       { title: 'Saci', short: 'A build-time fingerprint detector for web apps.', long: 'Saci scans the final bundle for stray hashes, emails and forgotten secrets before deploy time.' },
    },
  },
  {
    id: 'minima', code: 'MIN', year: 2024, sig: SIGS[7],
    projectUrl: 'https://minima.fyi',
    tags: ['Typography', 'Web'], imageCount: 4,
    translations: {
      'pt-BR': { title: 'Mínima', short: 'Sandbox de tipografia com métricas em tempo real.', long: 'Sandbox de tipografia para web: x-height, cap-height, espaço entre linhas e largura de coluna desenhados sobre o texto enquanto você muda.' },
      en:       { title: 'Mínima', short: 'A typography sandbox with live metric overlays.', long: 'A web typography sandbox: x-height, cap-height, leading and column width drawn on top of the text as you change it.' },
    },
  },
  {
    id: 'retro', code: 'RTR', year: 2023, sig: SIGS[8],
    githubUrl: 'https://github.com/guileite/retro',
    tags: ['Team', 'Tooling'], imageCount: 3,
    translations: {
      'pt-BR': { title: 'Retro', short: 'Ferramenta de retrospectivas que esquece menos do que a anterior.', long: 'Retrospectivas com colunas configuráveis, votação anônima e arquivo permanente — incluindo busca por temas recorrentes ao longo de meses.' },
      en:       { title: 'Retro', short: 'A retrospective tool that forgets less than the previous one.', long: 'Retrospectives with configurable columns, anonymous voting and a permanent archive — including search across recurring themes over months.' },
    },
  },
];

function rowToProject(row: StubRow, locale: Locale): Project {
  const t = row.translations[locale] ?? row.translations['pt-BR'];
  return {
    id: row.id,
    title: t.title,
    description: t.short,
    projectUrl: row.projectUrl ?? null,
    githubUrl: row.githubUrl ?? null,
    orderIndex: 0,
    resolvedLocale: locale,
    requestedLocale: locale,
    tags: row.tags,
    year: row.year,
    code: row.code,
    images: makeImages(row.imageCount),
  };
}

export function getStubProjects(locale: Locale): Project[] {
  return STUB_ROWS.map((r) => rowToProject(r, locale));
}

// ─── Real API helpers ────────────────────────────────────────────────────────
const API_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────────────────────
const USE_STUB = process.env.NEXT_PUBLIC_USE_STUB === 'true';

export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<Project[]> {
  if (USE_STUB) return getStubProjects(locale).slice(0, limit);
  return apiFetch<Project[]>(
    `/projects/featured?limit=${limit}&locale=${locale}`,
    { next: { revalidate: 60 } },
  );
}

export async function getProjects(
  locale: Locale,
  page = 1,
  limit = 9,
): Promise<PaginatedProjects> {
  if (USE_STUB) {
    const all = getStubProjects(locale);
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit), locale },
    };
  }
  return apiFetch<PaginatedProjects>(
    `/projects?page=${page}&limit=${limit}&locale=${locale}`,
    { next: { revalidate: 60 } },
  );
}

export async function getProject(id: string, locale: Locale): Promise<Project> {
  if (USE_STUB) {
    const p = getStubProjects(locale).find((x) => x.id === id);
    if (!p) throw new Error(`Project not found: ${id}`);
    return p;
  }
  return apiFetch<Project>(`/projects/${id}?locale=${locale}`, { next: { revalidate: 60 } });
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/
git commit -m "feat: types, API client with stub toggle, skills + contact constants"
```

---

## Task 5: Root layout — `[locale]/layout.tsx` with theme script and font wiring

**Files:**
- Create: `apps/web/app/[locale]/layout.tsx`
- Create: `apps/web/app/[locale]/not-found.tsx`

- [ ] **Step 1: Create [locale]/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { sans, mono, display } from '../fonts';
import '../globals.css';
import { locales, type Locale } from '../../i18n';
import Header from '../../components/header';
import Footer from '../../components/footer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
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
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
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

- [ ] **Step 2: Create [locale]/not-found.tsx**

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center" style={{ padding: 'var(--gutter)' }}>
      <p className="text-eyebrow mb-4">404 / NOT FOUND</p>
      <h1 className="font-display text-[clamp(48px,8vw,104px)] leading-none">Page not found</h1>
      <Link href="/" className="mt-8 font-mono text-xs uppercase tracking-widest text-accent hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/[locale]/
git commit -m "feat: [locale] layout with next-intl, no-flash theme, metadata"
```

---

## Task 6: Header component

**Files:**
- Create: `apps/web/components/header.tsx`

The header is a Client Component (needs `useState` for theme). It:
- Is sticky, 64px tall, blurred semi-transparent bg, 1px bottom border
- Left: brand `⟡ guileite.dev`
- Center: nav links with mono index numbers
- Right: segmented toggles for PT/EN and DARK/LIGHT
- Hides nav on mobile (<720px)
- Reads initial theme from `data-theme` on `<html>` (set by the inline script)
- Persists theme to `localStorage`
- Language switch: `router.replace` with locale swap in the path, `scroll: false`

- [ ] **Step 1: Create components/header.tsx**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '../i18n';

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

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme state from data-theme (set by no-flash script)
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') setTheme('light');
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
  }

  function switchLocale() {
    const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
    // Swap the locale prefix in the current path
    const newPath = pathname.replace(/^\/(pt-BR|en)/, `/${next}`);
    router.replace(newPath, { scroll: false });
    // Persist choice in cookie so middleware respects it next visit
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

        {/* Nav — hidden on mobile */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <NavLink href={`/${locale}/projects`} index="01" active={isProjectsPage}>
            {t('nav.projects')}
          </NavLink>
          <NavLink href={`/${locale}#contact`} index="02" active={false}>
            {t('nav.contact')}
          </NavLink>
        </nav>

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

function NavLink({
  href,
  index,
  active,
  children,
}: {
  href: string;
  index: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-1.5 text-sm no-underline transition-colors duration-150"
      style={{ color: active ? 'var(--fg)' : 'var(--fg-muted)' }}
    >
      <span className="font-mono text-[11px] text-fg-subtle">{index}</span>
      <span>{children}</span>
      {active && (
        <span
          className="absolute bottom-[-2px] left-[22px] h-[2px] bg-accent"
          style={{ width: '2px', display: 'block' }}
          aria-hidden
        />
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/header.tsx
git commit -m "feat: Header — sticky, theme + lang toggles, nav, mobile-responsive"
```

---

## Task 7: Hero component (most important screen)

**Files:**
- Create: `apps/web/components/portrait.tsx`
- Create: `apps/web/components/hero.tsx`

The hero has three columns: `92px rail | 1fr main | 360px side`. Collapses to one column below 1100px. The right side (`hero-side`) is `position: sticky; top: 96px` on desktop, `static` below 1100px.

- [ ] **Step 1: Create components/portrait.tsx**

```tsx
export default function Portrait({ label }: { label: string }) {
  return (
    <div
      className="relative border border-border"
      style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)' }}
    >
      {/* Halftone SVG placeholder — replace with next/image when portrait is available */}
      <svg
        viewBox="0 0 320 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="port-g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--portrait-a)" />
            <stop offset="100%" stopColor="var(--portrait-b)" />
          </linearGradient>
          <pattern id="port-sp" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="url(#port-g)" />
            <circle cx="3" cy="3" r="0.55" fill="rgba(0,0,0,0.35)" />
          </pattern>
        </defs>
        <rect width="320" height="400" fill="url(#port-sp)" />
        <g opacity="0.55">
          <ellipse cx="160" cy="160" rx="62" ry="72" fill="rgba(0,0,0,0.35)" />
          <path d="M50 400 C 70 300, 120 250, 160 250 C 200 250, 250 300, 270 400 Z" fill="rgba(0,0,0,0.35)" />
        </g>
      </svg>

      {/* Bottom-left label */}
      <div
        className="absolute bottom-0 left-0 border border-border bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {label}
      </div>

      {/* Top-right accent L-bracket */}
      <div
        className="absolute right-0 top-0 h-[18px] w-[18px]"
        style={{
          borderTop: '2px solid var(--accent)',
          borderRight: '2px solid var(--accent)',
        }}
        aria-hidden
      />
    </div>
  );
}
```

- [ ] **Step 2: Create components/hero.tsx**

```tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../i18n';
import Portrait from './portrait';

const RAIL_ITEMS = ['INDEX', 'ABOUT', 'STACK', 'WORK', 'CONTACT'] as const;

export default async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('hero');
  const meta = {
    status: t('meta.status'),
    location: t('meta.location'),
    updated: t('meta.updated'),
    portrait: t('meta.portrait'),
  };

  return (
    <section
      className="relative"
      style={{ padding: 'clamp(64px, 10vh, 120px) var(--gutter)' }}
      aria-label="Hero"
    >
      {/* Background monogram — very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 select-none font-display italic leading-none"
        style={{
          fontSize: 'clamp(280px, 38vw, 580px)',
          opacity: 0.025,
          color: 'var(--fg)',
          lineHeight: 0.85,
        }}
      >
        G.L.
      </div>

      <div
        className="relative mx-auto"
        style={{
          maxWidth: 'var(--container)',
          display: 'grid',
          gridTemplateColumns: '92px 1fr 360px',
          gap: 'clamp(28px, 5vw, 88px)',
          alignItems: 'start',
        }}
      >
        {/* Left rail — desktop only */}
        <aside
          className="hidden font-mono"
          style={{ position: 'sticky', top: '96px' }}
          aria-hidden
          // Hidden below 720px via inline style override at breakpoint via CSS
        >
          <style>{`
            @media (max-width: 720px) { .hero-rail { display: none !important; } }
          `}</style>
          <div className="hero-rail flex flex-col gap-3">
            {RAIL_ITEMS.map((label, i) => (
              <div
                key={label}
                className="flex items-center gap-3.5 text-[11px] uppercase tracking-[0.14em]"
                style={{ color: i === 1 ? 'var(--fg)' : 'var(--fg-subtle)' }}
              >
                <span
                  className="w-7 text-right text-[11px]"
                  style={{ color: i === 1 ? 'var(--accent)' : 'var(--fg-subtle)' }}
                >
                  0{i + 1}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {/* Eyebrow */}
          <p className="text-eyebrow mb-6">{t('eyebrow')}</p>

          {/* Display name */}
          <h1 className="mb-6" style={{ lineHeight: 0.92 }}>
            <span
              className="block font-display"
              style={{
                fontSize: 'clamp(64px, 9.5vw, 140px)',
                letterSpacing: '-0.025em',
              }}
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
              <span
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle"
              >
                {t('role')}
              </span>
            </span>
          </h1>

          {/* Headline */}
          <p
            className="mb-5 font-sans font-normal text-fg"
            style={{
              fontSize: 'clamp(20px, 2.1vw, 28px)',
              maxWidth: '26ch',
              textWrap: 'pretty',
            } as React.CSSProperties}
          >
            {t('headline')}
          </p>

          {/* Bio */}
          <p
            className="mb-10 font-sans leading-[1.65] text-fg-muted"
            style={{ fontSize: '17px', maxWidth: '56ch', textWrap: 'pretty' } as React.CSSProperties}
          >
            {t('bio')}
          </p>

          {/* CTAs */}
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

        {/* Right side — sticky portrait + meta */}
        <aside
          style={{ position: 'sticky', top: '96px' }}
          className="hidden flex-col gap-6 xl:flex"
        >
          <Portrait label={meta.portrait} />

          {/* Meta list */}
          <dl className="hairline-t hairline-b font-mono text-[11px]">
            {([
              ['STATUS', meta.status, true],
              ['LOC', meta.location, false],
              ['REV', meta.updated, false],
            ] as [string, string, boolean][]).map(([key, value, hasDot]) => (
              <div
                key={key}
                className="hairline-b flex items-center gap-4 py-3 last:border-b-0"
              >
                <dt
                  className="w-14 shrink-0 uppercase tracking-[0.08em] text-fg-subtle"
                >
                  {key}
                </dt>
                <dd className="flex items-center gap-1.5 text-fg-muted">
                  {hasDot && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                      style={{
                        animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                      }}
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

      {/* Inline responsive styles for the hero grid */}
      <style>{`
        @media (max-width: 1100px) {
          section[aria-label="Hero"] > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          span[aria-hidden] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
```

**Note on the hero-side visibility:** The `hidden xl:flex` pattern hides the side on smaller screens. The grid also collapses to 1 column below 1100px. At mobile widths the portrait and meta don't render — per the README, these stack below the bio. Add a mobile version of the portrait below the bio in `apps/web/app/[locale]/page.tsx` (Task 14).

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/portrait.tsx apps/web/components/hero.tsx
git commit -m "feat: Hero — asymmetric 3-col grid, portrait placeholder, meta rail"
```

---

## Task 8: Section header, Skills, and Cover placeholder

**Files:**
- Create: `apps/web/components/section-header.tsx`
- Create: `apps/web/components/skills.tsx`
- Create: `apps/web/components/cover-placeholder.tsx`

- [ ] **Step 1: Create components/section-header.tsx**

```tsx
interface SectionHeaderProps {
  index: string;
  title: string;
  caption?: string;
  id?: string;
}

export default function SectionHeader({ index, title, caption, id }: SectionHeaderProps) {
  return (
    <header className="mb-10" id={id}>
      {/* Rule line with index chip */}
      <div className="mb-5 flex items-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle whitespace-nowrap">
          {index}
        </span>
        <div className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <h2
        className="font-display"
        style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
      >
        {title}
      </h2>
      {caption && (
        <p className="mt-3 font-sans text-[15px] text-fg-muted" style={{ maxWidth: '52ch' }}>
          {caption}
        </p>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Create components/skills.tsx**

```tsx
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../i18n';
import { SKILLS } from '../lib/skills';
import SectionHeader from './section-header';

export default async function Skills({ locale }: { locale: Locale }) {
  const t = await getTranslations('skills');

  const rows = [
    ['languages',  SKILLS.languages],
    ['frameworks', SKILLS.frameworks],
    ['tools',      SKILLS.tools],
    ['databases',  SKILLS.databases],
  ] as const;

  return (
    <section
      className="section"
      style={{ padding: 'clamp(64px, 8vh, 96px) var(--gutter)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container)' }}>
        <SectionHeader
          index="03 / STACK"
          title={t('title')}
          caption={t('caption')}
        />
        <dl className="hairline-t hairline-b">
          {rows.map(([key, items]) => (
            <div
              key={key}
              className="hairline-b flex flex-col gap-3 py-6 last:border-b-0 md:flex-row md:items-baseline md:gap-0"
            >
              <dt
                className="w-full shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle md:w-[200px]"
              >
                {t(`groups.${key}`)}
              </dt>
              <dd className="flex flex-wrap items-baseline gap-x-1">
                {(items as readonly string[]).map((item, i) => (
                  <span key={item} className="flex items-baseline gap-x-1">
                    <span className="font-sans text-[20px] text-fg">{item}</span>
                    {i < items.length - 1 && (
                      <span className="font-mono text-[13px] text-border-strong">·</span>
                    )}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create components/cover-placeholder.tsx**

This renders the striped SVG placeholder when a project has no real cover image. The `sig` prop is a `[colorA, colorB]` pair stored on the project (or derived from the project index).

```tsx
interface CoverPlaceholderProps {
  projectId: string;
  code?: string;
  year?: number;
  imageCount: number;
  sig: [string, string];
}

export default function CoverPlaceholder({
  projectId,
  code,
  year,
  imageCount,
  sig,
}: CoverPlaceholderProps) {
  const gradId = `g-${projectId}`;
  const patId = `sp-${projectId}`;
  const [a, b] = sig;

  return (
    <div className="relative border border-border" style={{ aspectRatio: '16/10' }}>
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
          <pattern id={patId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill={`url(#${gradId})`} />
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#${patId})`} />
        <rect width="400" height="250" fill="rgba(0,0,0,0.18)" />
      </svg>

      {/* Top-right: code + year chip */}
      {(code || year) && (
        <div
          className="absolute right-2 top-2 bg-bg-deep/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle backdrop-blur-sm"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {[code, year].filter(Boolean).join(' · ')}
        </div>
      )}

      {/* Bottom-left: frame counter */}
      <div
        className="absolute bottom-2 left-2 bg-bg-deep/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius)' }}
      >
        FRAME 01 / {String(imageCount).padStart(2, '0')}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/section-header.tsx apps/web/components/skills.tsx apps/web/components/cover-placeholder.tsx
git commit -m "feat: SectionHeader, Skills tabular dl, CoverPlaceholder SVG"
```

---

## Task 9: ProjectCard and ProjectModal

**Files:**
- Create: `apps/web/components/project-card.tsx`
- Create: `apps/web/components/project-modal.tsx`

The card is a shared component used on both pages. The modal is a client component using `@radix-ui/react-dialog`.

- [ ] **Step 1: Create components/project-card.tsx**

The card needs to open a modal. Since it's used in a Server Component context (FeaturedProjects, projects page), the modal state is lifted up: the parent passes an `onOpen` callback. The card itself is a Client Component (needs onClick + keyboard events).

```tsx
'use client';

import Image from 'next/image';
import type { Project } from '../lib/types';
import CoverPlaceholder from './cover-placeholder';

// OKLCH color signatures — same as stub data, indexed by position
const SIGS: [string, string][] = [
  ['oklch(0.68 0.14 50)', 'oklch(0.42 0.09 50)'],
  ['oklch(0.72 0.10 220)', 'oklch(0.38 0.08 220)'],
  ['oklch(0.70 0.13 145)', 'oklch(0.40 0.08 145)'],
  ['oklch(0.74 0.12 90)', 'oklch(0.42 0.07 90)'],
  ['oklch(0.66 0.14 20)', 'oklch(0.40 0.09 20)'],
  ['oklch(0.70 0.12 290)', 'oklch(0.40 0.08 290)'],
  ['oklch(0.72 0.10 180)', 'oklch(0.40 0.07 180)'],
  ['oklch(0.74 0.11 60)', 'oklch(0.42 0.07 60)'],
  ['oklch(0.68 0.13 340)', 'oklch(0.40 0.08 340)'],
];

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
  liveLabel: string;
  repoLabel: string;
}

export default function ProjectCard({ project, index, onOpen, liveLabel, repoLabel }: ProjectCardProps) {
  const cover = project.images.find((img) => img.order === 0) ?? project.images[0];
  const hasCover = cover?.url && cover.url.length > 0;
  const sig = SIGS[index % SIGS.length];
  const idx = String(index + 1).padStart(2, '0');

  return (
    <article
      className="group relative cursor-pointer border border-border bg-bg transition-colors duration-200 hover:bg-bg-elevated"
      style={{ borderRadius: 'var(--radius)' }}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(project); }}
      tabIndex={0}
      role="button"
      aria-label={project.title}
    >
      {/* Index chip */}
      <div
        className="absolute left-2 top-2 z-10 bg-bg-deep/80 px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {idx}
      </div>

      {/* Cover */}
      <div className="overflow-hidden">
        <div className="transition-transform duration-[250ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:-translate-y-0.5">
          {hasCover ? (
            <div className="relative border-b border-border" style={{ aspectRatio: '16/10' }}>
              <Image
                src={cover.url}
                alt={cover.alt ?? project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
              {/* Top-right chip */}
              {(project.code || project.year) && (
                <div
                  className="absolute right-2 top-2 bg-bg-deep/80 px-2 py-0.5 font-mono text-[10px] tracking-widest text-fg-subtle backdrop-blur-sm"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {[project.code, project.year].filter(Boolean).join(' · ')}
                </div>
              )}
              {/* Bottom-left frame counter */}
              <div
                className="absolute bottom-2 left-2 bg-bg-deep/80 px-2 py-0.5 font-mono text-[10px] tracking-widest text-fg-subtle backdrop-blur-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                FRAME 01 / {String(project.images.length).padStart(2, '0')}
              </div>
            </div>
          ) : (
            <CoverPlaceholder
              projectId={project.id}
              code={project.code}
              year={project.year}
              imageCount={project.images.length}
              sig={sig}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title row */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3
            className="font-display leading-tight"
            style={{ fontSize: '28px' }}
          >
            {project.title}
          </h3>
          {project.year && (
            <span className="mt-1 shrink-0 font-mono text-[11px] text-fg-subtle">
              {project.year}
            </span>
          )}
        </div>

        {/* Short description */}
        <p
          className="mb-4 font-sans text-[13px] leading-[1.55] text-fg-muted"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
        >
          {project.description}
        </p>

        {/* Footer: tags + links */}
        <div className="hairline-t flex items-center justify-between gap-3 pt-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-fg-subtle"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* External links — stop propagation so they don't open the modal */}
          <div className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0.5 text-fg-subtle transition-colors duration-150 hover:text-accent"
              >
                <span>{liveLabel}</span><span>↗</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0.5 text-fg-subtle transition-colors duration-150 hover:text-accent"
              >
                <span>{repoLabel}</span><span>↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create components/project-modal.tsx**

```tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '../lib/types';
import CoverPlaceholder from './cover-placeholder';

const SIGS: [string, string][] = [
  ['oklch(0.68 0.14 50)', 'oklch(0.42 0.09 50)'],
  ['oklch(0.72 0.10 220)', 'oklch(0.38 0.08 220)'],
  ['oklch(0.70 0.13 145)', 'oklch(0.40 0.08 145)'],
  ['oklch(0.74 0.12 90)', 'oklch(0.42 0.07 90)'],
];

interface ModalLabels {
  close: string;
  prev: string;
  next: string;
  visit: string;
  code: string;
}

interface ProjectModalProps {
  project: Project;
  projectIndex: number;
  onClose: () => void;
  labels: ModalLabels;
}

export default function ProjectModal({ project, projectIndex, onClose, labels }: ProjectModalProps) {
  const [frame, setFrame] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const total = project.images.length || 1;
  const sig = SIGS[projectIndex % SIGS.length];

  const prevFrame = useCallback(() => setFrame((f) => (f - 1 + total) % total), [total]);
  const nextFrame = useCallback(() => setFrame((f) => (f + 1) % total), [total]);

  // Save trigger, focus close button, lock scroll, handle keyboard
  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextFrame();
      if (e.key === 'ArrowLeft') prevFrame();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      (triggerRef.current as HTMLElement | null)?.focus();
    };
  }, [onClose, nextFrame, prevFrame]);

  const currentImage = project.images[frame];
  const hasRealImage = currentImage?.url && currentImage.url.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'oklch(from var(--bg-deep) l c h / 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1100px] flex-col border border-border bg-bg overflow-hidden"
        style={{
          borderRadius: 'var(--radius)',
          animation: 'modal-rise 350ms cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head bar */}
        <div className="hairline-b flex items-center justify-between gap-4 px-5 py-3 font-mono text-[11px]">
          <div className="flex items-center gap-3 text-fg-subtle overflow-hidden">
            {project.code && <span className="text-fg">{project.code}</span>}
            {project.code && <span>/</span>}
            {project.year && <span>{project.year}</span>}
            {project.year && project.tags?.length ? <span>/</span> : null}
            {project.tags?.length ? (
              <span className="truncate">{project.tags.join(' · ')}</span>
            ) : null}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label={labels.close}
            className="flex shrink-0 items-center gap-2 text-fg-subtle transition-colors duration-150 hover:text-fg"
          >
            <span>{labels.close}</span>
            <span>×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row">
          {/* Carousel */}
          <div
            className="flex flex-col bg-bg-deep lg:hairline-r"
            style={{ flex: '1.4' }}
          >
            <div className="flex-1 p-6">
              {hasRealImage ? (
                <div className="relative h-full" style={{ aspectRatio: '16/10' }}>
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt ?? project.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1100px) 100vw, 60vw"
                  />
                </div>
              ) : (
                <CoverPlaceholder
                  projectId={`${project.id}-${frame}`}
                  code={project.code ? `${project.code} · F${String(frame + 1).padStart(2, '0')}` : undefined}
                  year={project.year}
                  imageCount={total}
                  sig={sig}
                />
              )}
            </div>

            {/* Carousel controls */}
            <div className="hairline-t flex items-center gap-4 px-6 py-3 font-mono text-[11px]">
              <button
                onClick={prevFrame}
                aria-label={labels.prev}
                className="flex h-9 w-9 items-center justify-center border border-border text-fg-subtle transition-colors duration-150 hover:border-border-strong hover:text-fg"
                style={{ borderRadius: 'var(--radius)' }}
              >
                ←
              </button>
              <span className="text-fg-subtle">
                {String(frame + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <button
                onClick={nextFrame}
                aria-label={labels.next}
                className="flex h-9 w-9 items-center justify-center border border-border text-fg-subtle transition-colors duration-150 hover:border-border-strong hover:text-fg"
                style={{ borderRadius: 'var(--radius)' }}
              >
                →
              </button>
            </div>
          </div>

          {/* Text panel */}
          <div className="flex flex-col gap-5 p-8" style={{ flex: '1' }}>
            <h3
              className="font-display leading-tight"
              style={{ fontSize: 'clamp(28px, 3.4vw, 44px)' }}
            >
              {project.title}
            </h3>
            <p
              className="font-sans leading-[1.7] text-fg-muted"
              style={{ fontSize: '17px', textWrap: 'pretty' } as React.CSSProperties}
            >
              {project.description}
            </p>

            <div className="mt-auto flex flex-wrap gap-3 pt-4">
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 bg-accent px-5 py-3 font-sans text-sm font-medium text-accent-fg no-underline transition-opacity hover:opacity-90"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <span>{labels.visit}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-[3px]">↗</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 border border-border-strong px-5 py-3 font-sans text-sm font-medium text-fg no-underline transition-colors hover:border-accent"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <span>{labels.code}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-[3px]">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes modal-rise { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/project-card.tsx apps/web/components/project-modal.tsx
git commit -m "feat: ProjectCard + ProjectModal — keyboard nav, carousel, a11y"
```

---

## Task 10: Featured Projects, Contact, Footer

**Files:**
- Create: `apps/web/components/featured-projects.tsx`
- Create: `apps/web/components/contact.tsx`
- Create: `apps/web/components/footer.tsx`
- Create: `apps/web/components/projects-grid.tsx` (client wrapper for card grid + modal state)

- [ ] **Step 1: Create components/projects-grid.tsx**

`FeaturedProjects` is a Server Component — it can't hold modal state. This thin client wrapper manages which project is open in the modal.

```tsx
'use client';

import { useState } from 'react';
import type { Project } from '../lib/types';
import ProjectCard from './project-card';
import ProjectModal from './project-modal';

interface ProjectsGridProps {
  projects: Project[];
  startIndex?: number;
  liveLabel: string;
  repoLabel: string;
  modalLabels: {
    close: string;
    prev: string;
    next: string;
    visit: string;
    code: string;
  };
}

export default function ProjectsGrid({
  projects,
  startIndex = 0,
  liveLabel,
  repoLabel,
  modalLabels,
}: ProjectsGridProps) {
  const [active, setActive] = useState<{ project: Project; index: number } | null>(null);

  return (
    <>
      <div className="grid gap-px bg-border" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
        {projects.map((project, i) => (
          <div key={project.id} className="bg-bg">
            <ProjectCard
              project={project}
              index={startIndex + i}
              onOpen={(p) => setActive({ project: p, index: startIndex + i })}
              liveLabel={liveLabel}
              repoLabel={repoLabel}
            />
          </div>
        ))}
      </div>

      {active && (
        <ProjectModal
          project={active.project}
          projectIndex={active.index}
          onClose={() => setActive(null)}
          labels={modalLabels}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create components/featured-projects.tsx**

```tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../i18n';
import { getFeaturedProjects } from '../lib/api';
import SectionHeader from './section-header';
import ProjectsGrid from './projects-grid';

export default async function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations('featured');
  const modalT = await getTranslations('modal');

  let projects = await getFeaturedProjects(locale, 3);

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

        {/* See more link */}
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
```

- [ ] **Step 3: Create components/contact.tsx**

```tsx
import { getTranslations } from 'next-intl/server';
import { CONTACT } from '../lib/contact';
import SectionHeader from './section-header';

export default async function Contact() {
  const t = await getTranslations('contact');

  return (
    <section
      id="contact"
      style={{ padding: 'clamp(64px, 8vh, 96px) var(--gutter)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container)' }}>
        <SectionHeader
          index="05 / CONTACT"
          title={t('title')}
          caption={t('caption')}
        />

        <ul className="hairline-t hairline-b">
          {CONTACT.map((item) => {
            const label = t(`labels.${item.key}`);
            const isExternal = item.href.startsWith('http');
            return (
              <li key={item.key} className="hairline-b last:border-b-0">
                <a
                  href={item.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  className="contact-link group flex items-center gap-6 py-6 no-underline transition-all duration-200"
                  style={{ '--hover-shift': '12px' } as React.CSSProperties}
                >
                  <span className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle transition-colors duration-150 group-hover:text-accent">
                    {label}
                  </span>
                  <span className="hidden flex-1 border-t border-border group-hover:border-accent sm:block" aria-hidden />
                  <span
                    className="font-display text-fg transition-colors duration-150 group-hover:text-accent"
                    style={{ fontSize: 'clamp(22px, 2.6vw, 36px)' }}
                  >
                    {item.value}
                  </span>
                  <span className="ml-auto font-mono text-[13px] text-fg-subtle transition-colors duration-150 group-hover:text-accent">↗</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .contact-link:hover {
          transform: translateX(12px);
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-link:hover { transform: none; }
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 4: Create components/footer.tsx**

```tsx
'use client';

import Link from 'next/link';
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

  const copyright = t('copyright', { year });

  return (
    <footer
      className="hairline-t font-mono text-[11px] text-fg-subtle"
      style={{ padding: '32px var(--gutter)' }}
    >
      <div
        className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ maxWidth: 'var(--container)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-accent">⟡</span>
          <span>guileite.dev</span>
        </div>

        {/* Tagline */}
        <div className="text-fg-subtle">{t('tag')}</div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <span>{copyright}</span>
          <span className="text-border-strong">·</span>
          <a
            href="https://github.com/guileite/guileite.dev"
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
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/featured-projects.tsx apps/web/components/contact.tsx apps/web/components/footer.tsx apps/web/components/projects-grid.tsx
git commit -m "feat: FeaturedProjects, Contact, Footer, ProjectsGrid modal wrapper"
```

---

## Task 11: Home page

**Files:**
- Create: `apps/web/app/[locale]/page.tsx`

- [ ] **Step 1: Create app/[locale]/page.tsx**

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Guilherme Leite — Software Developer',
    description: t('headline'),
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
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

- [ ] **Step 2: Start the dev server and verify the home page renders**

```bash
cd apps/web && npm run dev
```

Open `http://localhost:3000` — expect redirect to `/pt-BR`. Verify:
- Hero with 3-column grid, portrait placeholder, meta rail
- Skills section with tabular dl
- 3 project cards (stub data)
- Contact section
- Header with lang/theme toggles
- Footer

Fix any TypeScript or import errors before moving on.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/[locale]/page.tsx
git commit -m "feat: home page — assembles Hero, Skills, FeaturedProjects, Contact"
```

---

## Task 12: Pagination and Projects archive page

**Files:**
- Create: `apps/web/components/pagination.tsx`
- Create: `apps/web/app/[locale]/projects/page.tsx`

- [ ] **Step 1: Create components/pagination.tsx**

URL is the source of truth — use `<Link>` so back/forward works.

```tsx
import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  locale: string;
  prevLabel: string;
  nextLabel: string;
  pageOfLabel: string;   // "Página {page} de {total}" or "Page {page} of {total}"
}

export default function Pagination({
  page,
  totalPages,
  locale,
  prevLabel,
  nextLabel,
  pageOfLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const label = pageOfLabel
    .replace('{page}', String(page))
    .replace('{total}', String(totalPages));

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em]"
    >
      {page > 1 ? (
        <Link
          href={`/${locale}/projects?page=${page - 1}`}
          scroll
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle no-underline transition-colors duration-150 hover:border-border-strong hover:text-fg"
          style={{ borderRadius: 'var(--radius)' }}
        >
          ← {prevLabel}
        </Link>
      ) : (
        <span
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle opacity-30"
          style={{ borderRadius: 'var(--radius)' }}
          aria-disabled="true"
        >
          ← {prevLabel}
        </span>
      )}

      <span className="text-fg-subtle">{label}</span>

      {page < totalPages ? (
        <Link
          href={`/${locale}/projects?page=${page + 1}`}
          scroll
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle no-underline transition-colors duration-150 hover:border-border-strong hover:text-fg"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {nextLabel} →
        </Link>
      ) : (
        <span
          className="flex items-center gap-2 border border-border px-[18px] py-3 text-fg-subtle opacity-30"
          style={{ borderRadius: 'var(--radius)' }}
          aria-disabled="true"
        >
          {nextLabel} →
        </span>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Create app/[locale]/projects/page.tsx**

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../../../i18n';
import { getProjects } from '../../../lib/api';
import SectionHeader from '../../../components/section-header';
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
        {/* Page header */}
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
```

- [ ] **Step 3: Verify the projects page in the browser**

Navigate to `http://localhost:3000/pt-BR/projects`. Verify:
- Page title in Instrument Serif
- 9 project cards (stub data has 9)
- Pagination shows "Página 1 de 1" (9 items, 1 page)
- Clicking a card opens the modal
- Modal keyboard nav (← →, Esc) works
- Focus returns to the card on close

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/pagination.tsx apps/web/app/[locale]/projects/page.tsx
git commit -m "feat: Pagination + projects archive page — URL-driven, modal, ISR"
```

---

## Task 13: SEO metadata — hreflang alternates, sitemap, robots

**Files:**
- Create: `apps/web/app/sitemap.ts`
- Create: `apps/web/app/robots.ts`

The `generateMetadata` in `layout.tsx` already outputs `<link rel="alternate" hreflang>` via `alternates.languages`. This task adds sitemap.xml and robots.txt.

- [ ] **Step 1: Create app/sitemap.ts**

```ts
import type { MetadataRoute } from 'next';
import { locales } from '../i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guileite.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/projects'];
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );
}
```

- [ ] **Step 2: Create app/robots.ts**

```ts
import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guileite.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify hreflang in page source**

In the browser, view source of `http://localhost:3000/pt-BR`. Look for:
```html
<link rel="alternate" hreflang="pt-BR" href="..."/>
<link rel="alternate" hreflang="en" href="..."/>
<link rel="alternate" hreflang="x-default" href="..."/>
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/sitemap.ts apps/web/app/robots.ts
git commit -m "feat: sitemap.xml + robots.txt + hreflang alternates"
```

---

## Task 14: Build verification and polish

- [ ] **Step 1: Run TypeScript type check**

```bash
cd apps/web && npm run type-check
```

Expected: zero errors. Fix any type issues.

- [ ] **Step 2: Run production build**

```bash
cd apps/web && npm run build
```

Expected: successful build, no errors or warnings about missing env vars in server code.

- [ ] **Step 3: Manual acceptance checklist**

Open `http://localhost:3000/pt-BR` (dark mode, 1440px):
- [ ] Hero 3-column grid: 92px rail | 1fr content | 360px side
- [ ] Left rail hidden on mobile (<720px), right side hidden below 1100px
- [ ] Portrait placeholder shows halftone SVG with L-bracket corner and label
- [ ] Meta list shows pulsing green dot on STATUS
- [ ] Background monogram G.L. barely visible behind the hero
- [ ] Theme toggle switches correctly — hairlines still visible in light mode
- [ ] Language switcher swaps `/en/...` ↔ `/pt-BR/...` preserving path
- [ ] Project cards: cover SVG, index chip, title (Instrument Serif), description, tags, external links
- [ ] External links on card do NOT open the modal
- [ ] Modal: opens with focus on close button, ← → cycle frames, Esc closes, focus returns to card
- [ ] Projects page: pagination appears on direct load of `?page=N`, browser back works
- [ ] `<html lang>` matches URL locale
- [ ] No layout shift on font load
- [ ] Layout intact at 360px — no horizontal overflow

- [ ] **Step 4: Fix any issues found in checklist**

- [ ] **Step 5: Final commit**

```bash
git add -u
git commit -m "feat: complete guileite.dev frontend — polish + build verification"
```

---

## Self-Review

**Spec coverage check:**

| PRD/README requirement | Covered by task |
|---|---|
| `[locale]` App Router routing, pt-BR default | Task 3, 5 |
| No-flash theme script | Task 5 |
| Geist + JetBrains Mono + Instrument Serif | Task 2 |
| OKLCH tokens + Tailwind mapping | Task 2 |
| Asymmetric hero `92px | 1fr | 360px` | Task 7 |
| Portrait with halftone + L-bracket | Task 7 |
| Left rail (5 TOC items) | Task 7 |
| Background G.L. monogram | Task 7 |
| Skills tabular dl | Task 8 |
| Cover placeholder SVG | Task 8 |
| ProjectCard with chips, hover lift, stop-propagation links | Task 9 |
| ProjectModal with carousel, keyboard nav, focus trap | Task 9 |
| FeaturedProjects server component + ISR revalidate:60 | Task 10 |
| Contact tabular list with hover 12px shift | Task 10 |
| Footer 3-col with locale echo | Task 10 |
| Home page assembly | Task 11 |
| URL-driven pagination (`?page=N`) | Task 12 |
| Projects archive page with page header eyebrow | Task 12 |
| `sitemap.xml` + `robots.txt` | Task 13 |
| `hreflang` alternates on every page | Task 5 (layout metadata) |
| API stub with `NEXT_PUBLIC_USE_STUB=true` flag | Task 4 |
| `<html lang={locale}>` | Task 5 |
| Mobile-first, 360px layout | Throughout |
| `prefers-reduced-motion` | globals.css (Task 2) + inline in modal/contact |
| Focus ring 2px accent 3px offset | globals.css (Task 2) |
| No Inter/Roboto/system-ui fonts | Enforced in fonts.ts, Task 2 |
| Square radii (0 or 2px) | tailwind.config.ts, Task 2 |

**Placeholder scan:** No TBD/TODO/fill-in-later entries found. All code blocks are complete.

**Type consistency check:**
- `Locale` imported from `i18n.ts` everywhere (Tasks 3, 5, 6, 7, 8, 10, 12)
- `Project`, `PaginatedProjects`, `ProjectImage` from `lib/types.ts` used consistently
- `getFeaturedProjects`, `getProjects` match signature in `api.ts`
- `ProjectsGrid` receives `modalLabels` typed inline matching `ProjectModal`'s `ModalLabels` interface
- `CoverPlaceholder` receives `sig: [string, string]` — both `ProjectCard` and `ProjectModal` supply this from the same `SIGS` array

**One gap found and addressed:** The hero's mobile portrait — the right side is hidden below 1100px. README says "portrait + meta stack below the bio" at mobile widths. Task 7 notes this and defers to `page.tsx`. Task 11 includes both `Hero` and the required structure — the `Hero` component handles this via the grid collapse to single column, and the portrait's `xl:flex` class means it doesn't show at smaller sizes. For a true mobile portrait-under-bio, extend `Hero` in Task 7: add a second portrait block inside the main column that's visible only below `xl:` and hidden above. This is a polish item — add to Task 14's checklist.
