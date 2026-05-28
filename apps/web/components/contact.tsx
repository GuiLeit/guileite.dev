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
