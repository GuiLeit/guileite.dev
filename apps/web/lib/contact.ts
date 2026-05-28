export const CONTACT = [
  { key: 'email',    value: 'guiadse@gmail.com',         href: 'mailto:guiadse@gmail.com' },
  { key: 'linkedin', value: '/in/guilherme-leite-castro', href: 'https://www.linkedin.com/in/guilherme-leite-castro/' },
  { key: 'github',   value: '@guileite',                 href: 'https://github.com/GuiLeit' },
  { key: 'twitter',  value: '@guileite',                 href: 'https://x.com/guile1te' },
] as const;

export type ContactKey = typeof CONTACT[number]['key'];
