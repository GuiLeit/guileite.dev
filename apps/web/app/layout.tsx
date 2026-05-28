import type { ReactNode } from 'react';
import { sans, mono, display } from './fonts';
import './globals.css';
import { ThemeProvider } from '../providers/theme-provider';

// Root layout — never remounts across locale navigations.
// ThemeProvider lives here so theme state survives locale switches.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash theme script — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('theme');var mql=window.matchMedia('(prefers-color-scheme:dark)');document.documentElement.setAttribute('data-theme',s||(mql.matches?'dark':'light'));}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
