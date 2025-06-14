// app/layout.tsx
import './globals.css';
import '../styles/fontawesome.css';
import type { Metadata } from 'next';
import { Inter, Source_Sans_3, Merriweather } from 'next/font/google';
import { Providers } from './Providers';
import { ThemeScript } from '@/components/ui/theme-script';

// Optimize font loading with Next.js font optimization
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
});

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-source-sans',
  preload: true,
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-merriweather',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

export const metadata: Metadata = {
  title: 'Resume Analysis Service',
  description: 'Modern resume analysis and parsing service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceSansPro.variable} ${merriweather.variable}`}>
      <head>
        {/* Theme script - runs before page renders to prevent flash, must be first */}
        <ThemeScript defaultTheme="system" />

        {/* Preconnect to font sources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for other CDNs */}
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        {/* Add Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}