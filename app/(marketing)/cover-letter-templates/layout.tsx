import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cover Letter Templates - Professional Templates for All Industries | Kolab AI',
  description: 'Create compelling cover letters with our professional templates. ATS-optimized, industry-specific designs with AI-powered writing assistance. Land your dream job faster.',
  keywords: [
    'cover letter templates',
    'professional cover letter templates',
    'ATS-friendly cover letters',
    'cover letter examples',
    'job application letters',
    'cover letter formats',
    'industry-specific cover letters',
    'AI cover letter writer',
    'cover letter builder',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Professional Cover Letter Templates - Stand Out to Employers | Kolab AI',
    description: 'Create impressive cover letters with our collection of professional templates. AI-powered writing assistance and industry-specific designs.',
    url: 'https://yourdomain.com/cover-letter-templates',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/cover-letter-templates-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional Cover Letter Templates by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cover Letter Templates - Kolab AI',
    description: 'Professional cover letter templates with AI writing assistance. Create compelling letters that get results.',
    images: ['/images/cover-letter-templates-og.jpg'],
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
    canonical: 'https://yourdomain.com/cover-letter-templates',
  },
};

export default function CoverLetterTemplatesLayout({
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
            '@type': 'WebPage',
            name: 'Cover Letter Templates Collection',
            description: 'Professional cover letter templates with AI writing assistance for all industries',
            url: 'https://yourdomain.com/cover-letter-templates',
            about: {
              '@type': 'Service',
              name: 'Cover Letter Template Library',
              description: 'Collection of professional cover letter templates with AI-powered writing assistance',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://yourdomain.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Cover Letter Template Categories',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Professional Cover Letter Templates',
                  description: 'Formal and business-appropriate templates for traditional industries',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Modern Cover Letter Templates',
                  description: 'Contemporary designs for tech and progressive companies',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Creative Cover Letter Templates',
                  description: 'Unique layouts for creative professionals and designers',
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Entry-Level Cover Letter Templates',
                  description: 'Perfect templates for new graduates and career changers',
                },
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Industry-Specific Cover Letter Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Technology Cover Letter Templates',
                    description: 'Specialized templates for tech industry positions',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Healthcare Cover Letter Templates',
                    description: 'Professional templates for healthcare professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Finance Cover Letter Templates',
                    description: 'Templates designed for financial services roles',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Marketing Cover Letter Templates',
                    description: 'Creative templates for marketing professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Education Cover Letter Templates',
                    description: 'Templates for teachers and education professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Legal Cover Letter Templates',
                    description: 'Professional templates for legal professionals',
                  },
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}