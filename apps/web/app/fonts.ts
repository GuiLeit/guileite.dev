import localFont from 'next/font/local';
import { Instrument_Serif } from 'next/font/google';

// Geist fonts via next/font/local using the geist package files
export const sans = localFont({
  src: '../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-sans',
  display: 'swap',
});

export const mono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
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
