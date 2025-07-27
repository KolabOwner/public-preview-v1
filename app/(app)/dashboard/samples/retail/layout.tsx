import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retail Resume & Cover Letter Samples | Kolab AI',
  description: 'Professional retail resume and cover letter templates for retail managers, sales associates, and retail professionals. Customer-focused designs.',
  keywords: [
    'retail resume templates',
    'retail management resume samples',
    'sales associate resume templates',
    'retail cover letter examples',
    'store manager resume templates',
    'retail professional resume samples',
    'customer service resume templates',
    'retail industry examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Retail Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Professional retail resume and cover letter templates for retail managers, sales associates, and retail professionals. Customer-focused designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/retail',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/retail-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Retail Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retail Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for retail professionals, store managers, sales associates, and customer service representatives.',
    images: ['/images/retail-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/retail',
  },
};

export default function RetailSamplesLayout({
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
            name: 'Retail Resume & Cover Letter Samples',
            description: 'Professional retail resume and cover letter templates for retail managers, sales associates, and retail professionals. Customer-focused designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/retail',
            about: {
              '@type': 'Service',
              name: 'Retail Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for retail professionals, store managers, sales associates, and customer service representatives',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Retail Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Retail Resume Templates',
                  description: 'Professional resume templates designed for retail professionals, store managers, sales associates, and customer service representatives',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Retail Cover Letter Templates',
                  description: 'Professional cover letter templates for retail professionals, store managers, sales associates, and customer service representatives',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Retail Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Retail Resume Templates',
                    description: 'ATS-optimized resume templates for retail professionals, store managers, sales associates, and customer service representatives',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Retail Cover Letter Templates',
                    description: 'Professional cover letter templates for retail professionals, store managers, sales associates, and customer service representatives',
                  },
                }
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}