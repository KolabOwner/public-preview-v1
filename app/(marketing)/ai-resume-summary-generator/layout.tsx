import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.summaryGenerator;

/*
Original metadata preserved as comment:
export const metadata: Metadata = {
  title: 'AI Resume Summary Generator - Rezum AI | Instantly Generate Professional Resume Summaries',
  description: 'Create compelling resume summaries instantly with AI. Generate professional, job-specific summaries that grab recruiters\' attention and pass ATS systems.',
  keywords: [
    'AI resume summary generator',
    'resume summary writer',
    'professional summary generator',
    'resume summary AI',
    'automatic resume summary',
    'resume profile generator',
    'career summary writer',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'AI Resume Summary Generator - Create Professional Summaries | Rezum AI',
    description: 'Generate professional resume summaries instantly with AI. Job-specific, ATS-optimized summaries that get you noticed.',
    url: 'https://www.rezum-ai.com/ai-resume-summary-generator',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/placeholder-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Summary Generator by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Summary Generator - Rezum AI',
    description: 'Generate professional resume summaries instantly with AI. Job-specific and ATS-optimized.',
    images: ['/images/ai-resume-summary-generator-og.jpg'],
    creator: '@kolabai',
  },
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
  alternates: {
    canonical: 'https://www.rezum-ai.com/ai-resume-summary-generator',
  },
};

export default function AIResumeSummaryGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Rezum AI Resume Summary Generator',
            description: 'AI-powered tool that generates professional resume summaries tailored to specific job positions',
            url: 'https://www.rezum-ai.com/ai-resume-summary-generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI resume summary generator with premium features',
            },
            author: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '850',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />
      {children}
    </>
  );
}