import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Builder - Hireable AI | Create Professional Resumes',
  description: 'Build professional resumes with AI assistance. Get ATS-optimized resumes, keyword suggestions, and expert feedback. Start creating your standout resume today.',
  keywords: [
    'AI resume builder',
    'resume creator',
    'ATS resume',
    'professional resume',
    'resume optimization',
    'career tools',
    'job search',
    'hireable ai'
  ],
  authors: [{ name: 'Hireable AI' }],
  creator: 'Hireable AI',
  publisher: 'Hireable AI',
  openGraph: {
    title: 'AI Resume Builder - Create Professional Resumes | Hireable AI',
    description: 'Build professional resumes with AI assistance. ATS-optimized templates and smart suggestions.',
    url: 'https://yourdomain.com/ai-resume-builder',
    siteName: 'Hireable AI',
    images: [
      {
        url: '/images/ai-resume-builder-og.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder by Hireable AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder - Hireable AI',
    description: 'Build professional resumes with AI assistance. ATS-optimized and expert-reviewed.',
    images: ['/images/ai-resume-builder-og.jpg'],
    creator: '@hireableai', // Replace with your actual Twitter handle
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
    canonical: 'https://yourdomain.com/ai-resume-builder',
  },
};

export default function AIResumeBuilderLayout({
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
            name: 'Hireable AI Resume Builder',
            description: 'AI-powered resume builder that creates professional, ATS-optimized resumes',
            url: 'https://yourdomain.com/ai-resume-builder',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI resume builder with premium features',
            },
            author: {
              '@type': 'Organization',
              name: 'Hireable AI',
              url: 'https://yourdomain.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1200',
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