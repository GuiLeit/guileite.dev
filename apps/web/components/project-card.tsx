'use client';

import Image from 'next/image';
import type { Project } from '../lib/types';
import CoverPlaceholder from './cover-placeholder';

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
              {(project.code || project.year) && (
                <div
                  className="absolute right-2 top-2 bg-bg-deep/80 px-2 py-0.5 font-mono text-[10px] tracking-widest text-fg-subtle backdrop-blur-sm"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {[project.code, project.year].filter(Boolean).join(' · ')}
                </div>
              )}
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
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display leading-tight" style={{ fontSize: '28px' }}>
            {project.title}
          </h3>
          {project.year && (
            <span className="mt-1 shrink-0 font-mono text-[11px] text-fg-subtle">{project.year}</span>
          )}
        </div>

        <p
          className="mb-4 font-sans text-[13px] leading-[1.55] text-fg-muted"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
        >
          {project.description}
        </p>

        <div className="hairline-t flex items-center justify-between gap-3 pt-3">
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
