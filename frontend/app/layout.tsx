import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NeuroPidjar — Reclaiming Voice Through Thought',
  description:
    "Indonesia's first clinical-grade EEG speech brain-computer interface for stroke rehabilitation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} min-h-screen bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-200 font-sans antialiased transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
