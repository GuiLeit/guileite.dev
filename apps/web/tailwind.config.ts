import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:              'var(--bg)',
        'bg-elevated':   'var(--bg-elevated)',
        'bg-deep':       'var(--bg-deep)',
        fg:              'var(--fg)',
        'fg-muted':      'var(--fg-muted)',
        'fg-subtle':     'var(--fg-subtle)',
        border:          'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent:          'var(--accent)',
        'accent-fg':     'var(--accent-fg)',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['var(--font-display)', 'serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '6px',
        none: '0',
      },
    },
  },
  plugins: [],
};

export default config;
