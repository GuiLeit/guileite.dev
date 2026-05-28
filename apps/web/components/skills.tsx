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
      id="stack"
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
