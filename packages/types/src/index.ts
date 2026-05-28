export type Locale = 'pt-BR' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['pt-BR', 'en'];
export const DEFAULT_LOCALE: Locale = 'pt-BR';

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
  projectUrl: string | null;
  githubUrl: string | null;
  orderIndex: number;
  resolvedLocale: string;
  requestedLocale: string;
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
