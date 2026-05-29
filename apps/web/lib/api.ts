import type { Project, PaginatedProjects, Locale } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<Project[]> {
  return apiFetch<Project[]>(`/projects/featured?limit=${limit}&locale=${locale}`);
}

export async function getProjects(
  locale: Locale,
  page = 1,
  limit = 9,
): Promise<PaginatedProjects> {
  return apiFetch<PaginatedProjects>(
    `/projects?page=${page}&limit=${limit}&locale=${locale}`,
    { next: { revalidate: 60 } },
  );
}

export async function getProject(id: string, locale: Locale): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}?locale=${locale}`, { next: { revalidate: 60 } });
}
