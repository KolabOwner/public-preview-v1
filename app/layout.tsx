// app/layout.tsx
import React from "react";
import './globals.css';
import '@/app/fontawesome.css';
import type { Metadata } from 'next';
import { Inter, Source_Sans_3, Merriweather } from 'next/font/google';
import { Providers } from './Providers';
import { ThemeScript } from '@/components/shared/theme-script';
import ThirdPartyScripts from '@/components/shared/third-party-scripts';
import AsyncCSS from '@/components/shared/async-css';
import { SpeedInsights } from "@vercel/speed-insights/next";

// Optimize font loading with Next.js font optimization
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: false,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
});

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-source-sans',
  preload: false,
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-merriweather',
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

export const metadata: Metadata = {
  title: 'Rezum AI - AI-Powered Resume Builder & ATS Optimization',
  description: 'Create ATS-optimized resumes with AI. Professional resume templates, keyword scanner, and cover letter builder. Land your dream job with Rezum AI.',
  keywords: 'AI resume builder, ATS resume, resume templates, cover letter templates, keyword scanner, resume optimization, job search tools, professional resume, CV builder, career tools',
  authors: [{ name: 'Rezum AI Team' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.rezum-ai.com',
    siteName: 'Rezum AI',
    title: 'Rezum AI - AI-Powered Resume Builder & ATS Optimization',
    description: 'Create ATS-optimized resumes with AI. Professional resume templates, keyword scanner, and cover letter builder.',
    images: [
      {
        url: 'https://www.rezum-ai.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rezum AI - Professional Resume Builder',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rezum AI - AI-Powered Resume Builder',
    description: 'Create ATS-optimized resumes with AI. Professional templates and keyword optimization.',
    creator: '@rezumai',
    images: ['https://www.rezum-ai.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.rezum-ai.com',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.rezum-ai.com'),
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    bing: 'bing-verification-code',
  },
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
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />

        {/* Font Awesome icons - preload critical font */}
        <link 
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* REMOVED: Duplicate @font-face declarations - CDN already provides these */}
      </head>
      <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
          <AsyncCSS />
          <ThirdPartyScripts 
            enableGTM={process.env.NODE_ENV === 'production'}
            enableGA={process.env.NODE_ENV === 'production'}
          />
          <SpeedInsights />
      </body>
    </html>
  );
}