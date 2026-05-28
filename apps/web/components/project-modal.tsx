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
  const triggerRef = useRef<Element | null>(
    typeof document !== 'undefined' ? document.activeElement : null
  );
  const total = project.images.length || 1;
  const sig = SIGS[projectIndex % SIGS.length];

  const prevFrame = useCallback(() => setFrame((f) => (f - 1 + total) % total), [total]);
  const nextFrame = useCallback(() => setFrame((f) => (f + 1) % total), [total]);

  useEffect(() => {
    closeBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextFrame();
      if (e.key === 'ArrowLeft') prevFrame();
      if (e.key === 'Tab') {
        const modal = closeBtnRef.current?.closest('[role="dialog"]') as HTMLElement | null;
        if (!modal) return;
        const focusable = Array.from(
          modal.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
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
