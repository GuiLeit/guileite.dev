'use client';

import { useState } from 'react';
import type { Project } from '../lib/types';
import ProjectCard from './project-card';
import ProjectModal from './project-modal';

interface ModalLabels {
  close: string;
  prev: string;
  next: string;
  visit: string;
  code: string;
}

interface ProjectsGridProps {
  projects: Project[];
  startIndex?: number;
  liveLabel: string;
  repoLabel: string;
  modalLabels: ModalLabels;
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
      <div
        className="grid gap-px bg-border"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}
      >
        {projects.map((project, i) => (
          <div key={project.id} className="h-full bg-bg">
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
