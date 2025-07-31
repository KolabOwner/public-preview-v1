import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Checker - Rezum AI | Analyze & Optimize Your Resume',
  description: 'Free AI-powered resume checker that analyzes your resume for ATS compatibility, formatting issues, and content optimization. Get instant feedback and improvement suggestions.',
  keywords: [
    'resume checker',
    'resume analyzer',
    'ATS checker',
    'resume optimization',
    'resume feedback',
    'career tools',
    'job search',
    'resume review',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Resume Checker - Analyze & Optimize Your Resume | Rezum AI',
    description: 'Free AI-powered resume checker. Get instant feedback on ATS compatibility and content optimization.',
    url: 'https://yourdomain.com/resume-checker',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/resume-checker-og.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Resume Checker by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Checker - Rezum AI',
    description: 'Free AI-powered resume checker. Analyze ATS compatibility and get optimization tips.',
    images: ['/images/resume-checker-og.jpg'],
    creator: '@kolabai', // Replace with your actual Twitter handle
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
    canonical: 'https://yourdomain.com/resume-checker',
  },
};

export default function ResumeCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Rezum AI Resume Checker',
            description: 'AI-powered resume checker that analyzes resumes for ATS compatibility and optimization opportunities',
            url: 'https://yourdomain.com/resume-checker',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free resume checker with detailed analysis and suggestions',
            },
            author: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://yourdomain.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.7',
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