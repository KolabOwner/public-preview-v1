import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Summary Generator - Kolab AI | Instantly Generate Professional Resume Summaries',
  description: 'Create compelling resume summaries instantly with AI. Generate professional, job-specific summaries that grab recruiters\' attention and pass ATS systems.',
  keywords: [
    'AI resume summary generator',
    'resume summary writer',
    'professional summary generator',
    'resume summary AI',
    'automatic resume summary',
    'resume profile generator',
    'career summary writer',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'AI Resume Summary Generator - Create Professional Summaries | Kolab AI',
    description: 'Generate professional resume summaries instantly with AI. Job-specific, ATS-optimized summaries that get you noticed.',
    url: 'https://yourdomain.com/ai-resume-summary-generator',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/placeholder-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Summary Generator by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Summary Generator - Kolab AI',
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
    canonical: 'https://yourdomain.com/ai-resume-summary-generator',
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
            name: 'Kolab AI Resume Summary Generator',
            description: 'AI-powered tool that generates professional resume summaries tailored to specific job positions',
            url: 'https://yourdomain.com/ai-resume-summary-generator',
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
              name: 'Kolab AI',
              url: 'https://yourdomain.com',
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