export const CONTACT = [
  { key: 'email',    value: 'hello@guileite.dev',        href: 'mailto:hello@guileite.dev' },
  { key: 'linkedin', value: '/in/guileite',              href: 'https://linkedin.com/in/guileite' },
  { key: 'github',   value: '@guileite',                 href: 'https://github.com/guileite' },
  { key: 'twitter',  value: '@guileite',                 href: 'https://x.com/guileite' },
] as const;

export type ContactKey = typeof CONTACT[number]['key'];
