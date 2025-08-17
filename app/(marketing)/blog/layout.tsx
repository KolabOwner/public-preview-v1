import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Official Rezum Blog | Career Advice, Resume Tips & Job Search Guidance',
  description: 'Take your resume, job search, and career to new heights with our blog! Expert career advice, resume tips, cover letter guidance, and job search strategies.',
  keywords: [
    'career advice',
    'resume tips', 
    'job search',
    'cover letter writing',
    'interview tips',
    'career guidance',
    'professional development',
    'resume examples',
    'job hunting',
    'rezum ai blog'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'The Official Rezum Blog | Career Advice & Resume Tips',
    description: 'Take your resume, job search, and career to new heights with our blog! Expert career advice and professional development tips.',
    url: 'https://www.rezum-ai.com/blog',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/blog-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Rezum AI Blog - Career Advice & Resume Tips',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Official Rezum Blog | Career Advice & Resume Tips',
    description: 'Take your resume, job search, and career to new heights with our blog!',
    images: ['/images/blog-og.jpg'],
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
    canonical: 'https://www.rezum-ai.com/blog',
  },
};

export default function BlogLayout({
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
            '@type': 'Blog',
            name: 'The Official Rezum Blog',
            description: 'Career advice, resume tips, and job search guidance from Rezum AI experts',
            url: 'https://www.rezum-ai.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.rezum-ai.com/images/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://www.rezum-ai.com/blog',
            },
            about: [
              {
                '@type': 'Thing',
                name: 'Career Development',
              },
              {
                '@type': 'Thing', 
                name: 'Resume Writing',
              },
              {
                '@type': 'Thing',
                name: 'Job Search',
              },
            ],
          }),
        }}
      />

      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Rezum AI',
            url: 'https://www.rezum-ai.com',
            sameAs: [
              'https://twitter.com/kolabai',
              'https://linkedin.com/company/rezum-ai',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              email: 'support@yourdomain.com',
            },
          }),
        }}
      />
      {children}
    </>
  );
}