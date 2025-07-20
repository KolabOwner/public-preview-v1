import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Official Kolab Blog | Career Advice, Resume Tips & Job Search Guidance',
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
    'kolab ai blog'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'The Official Kolab Blog | Career Advice & Resume Tips',
    description: 'Take your resume, job search, and career to new heights with our blog! Expert career advice and professional development tips.',
    url: 'https://yourdomain.com/blog',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/blog-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Kolab AI Blog - Career Advice & Resume Tips',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Official Kolab Blog | Career Advice & Resume Tips',
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
    canonical: 'https://yourdomain.com/blog',
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
            name: 'The Official Kolab Blog',
            description: 'Career advice, resume tips, and job search guidance from Kolab AI experts',
            url: 'https://yourdomain.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://yourdomain.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://yourdomain.com/images/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://yourdomain.com/blog',
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
            name: 'Kolab AI',
            url: 'https://yourdomain.com',
            sameAs: [
              'https://twitter.com/kolabai',
              'https://linkedin.com/company/kolab-ai',
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