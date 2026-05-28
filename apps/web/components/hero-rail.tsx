'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { label: 'INDEX',   id: 'index'   },
  { label: 'ABOUT',   id: 'about'   },
  { label: 'STACK',   id: 'stack'   },
  { label: 'WORK',    id: 'work'    },
  { label: 'CONTACT', id: 'contact' },
];

export default function HeroRail() {
  const [activeId, setActiveId] = useState('index');

  useEffect(() => {
    // Persists across observer callbacks — tracks what's currently intersecting
    const activeSet = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeSet.add(entry.target.id);
          else activeSet.delete(entry.target.id);
        }
        // Deepest visible section (last in page order) wins
        const hit = [...SECTIONS].reverse().find((s) => activeSet.has(s.id));
        if (hit) setActiveId(hit.id);
      },
      // Trigger when element enters the top 40% of the viewport
      { rootMargin: '0px 0px -60% 0px', threshold: 0 },
    );

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    // The aside stretches to full page height (CSS grid default align-items: stretch).
    // The inner div is sticky inside it, so it tracks the user for the full scroll.
    <aside aria-hidden className="hero-rail font-mono">
      <div
        className="flex flex-col gap-3"
        style={{
          position: 'sticky',
          top: '96px',
          borderRight: '1px solid var(--border)',
          paddingRight: '20px',
        }}
      >
        {SECTIONS.map(({ label, id }, i) => {
          const isActive = activeId === id;
          return (
            <div
              key={label}
              className="flex items-center justify-end gap-3 text-[11px] uppercase tracking-[0.14em] transition-colors duration-150"
              style={{ color: isActive ? 'var(--fg)' : 'var(--fg-subtle)' }}
            >
              <span>{label}</span>
              <span className="flex w-5 items-center justify-center">
                {isActive ? (
                  <span className="text-accent" style={{ fontSize: '13px', lineHeight: 1 }}>⟡</span>
                ) : (
                  <span className="text-fg-subtle">{`0${i + 1}`}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
