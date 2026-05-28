import type { Project, PaginatedProjects, Locale } from './types';

// ─── Stub data (mirrors DESIGN_HANGOFF/prototype/site/data.jsx) ─────────────
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

function makeImages(n: number): Project['images'] {
  return Array.from({ length: n }, (_, i) => ({
    id: `img-${i}`,
    url: '',
    alt: '',
    order: i,
  }));
}

type StubRow = {
  id: string; code: string; year: number; sig: [string, string];
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
