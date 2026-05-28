import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';

// Geist Sans via the official geist package font export
export const sans = GeistSans;

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const display = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});
