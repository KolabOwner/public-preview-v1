import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kolab User Guides | Resume Builder Documentation & Tutorials',
  description: 'Comprehensive user guides for Kolab AI resume builder. Learn how to create professional resumes, use AI features, manage your account, and maximize your job search success.',
  keywords: [
    'resume builder tutorial',
    'kolab user guide',
    'AI resume help',
    'resume documentation',
    'how to create resume',
    'resume templates guide',
    'ATS optimization help',
    'resume writing tips',
    'job search guide',
    'kolab ai help'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Kolab User Guides | Resume Builder Documentation & Tutorials',
    description: 'Comprehensive user guides for Kolab AI resume builder. Learn how to create professional resumes and maximize your job search success.',
    url: 'https://yourdomain.com/resume-docs',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/docs-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Kolab AI User Guides - Resume Builder Documentation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kolab User Guides | Resume Builder Documentation',
    description: 'Comprehensive user guides for Kolab AI resume builder and career tools.',
    images: ['/images/docs-og.jpg'],
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
    canonical: 'https://yourdomain.com/resume-docs',
  },
};

export default function ResumeDocsLayout({
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
            '@type': 'WebSite',
            name: 'Kolab AI User Guides',
            description: 'Comprehensive documentation and tutorials for Kolab AI resume builder and career tools',
            url: 'https://yourdomain.com/resume-docs',
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
              '@id': 'https://yourdomain.com/resume-docs',
            },
            about: [
              {
                '@type': 'Thing',
                name: 'Resume Building',
              },
              {
                '@type': 'Thing', 
                name: 'Career Development',
              },
              {
                '@type': 'Thing',
                name: 'AI Tools Documentation',
              },
            ],
          }),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How do I create a resume with Kolab AI?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Use our AI Resume Builder to create professional resumes. Start by entering your information, choose a template, and let our AI optimize your content for ATS systems.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is the Kolab Score?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Kolab Score is our proprietary scoring system that evaluates your resume quality based on multiple factors including ATS compatibility, content quality, and formatting.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do AI Credits work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'AI Credits are consumed when you use our AI-powered features like content generation, optimization suggestions, and automated writing tools.',
                },
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