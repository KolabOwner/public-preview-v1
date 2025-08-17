import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Resume & Cover Letter Samples | Rezum AI',
  description: 'Versatile professional resume and cover letter templates for various industries and career paths. Adaptable designs for any profession.',
  keywords: [
    'professional resume templates',
    'general resume samples',
    'versatile resume templates',
    'professional cover letter examples',
    'career change resume templates',
    'multi-industry resume samples',
    'adaptable resume templates',
    'professional examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Professional Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Versatile professional resume and cover letter templates for various industries and career paths. Adaptable designs for any profession.',
    url: 'https://www.rezum-ai.com/dashboard/samples/other',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/other-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for professionals across various industries and career paths.',
    images: ['/images/other-resume-samples-og.jpg'],
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
    canonical: 'https://www.rezum-ai.com/dashboard/samples/other',
  },
};

export default function OtherSamplesLayout({
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
            name: 'Professional Resume & Cover Letter Samples',
            description: 'Versatile professional resume and cover letter templates for various industries and career paths. Adaptable designs for any profession.',
            url: 'https://www.rezum-ai.com/dashboard/samples/other',
            about: {
              '@type': 'Service',
              name: 'Professional Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for professionals across various industries and career paths',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Professional Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Other Resume Templates',
                  description: 'Professional resume templates designed for professionals across various industries and career paths',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Other Cover Letter Templates',
                  description: 'Professional cover letter templates for professionals across various industries and career paths',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Other Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Other Resume Templates',
                    description: 'ATS-optimized resume templates for professionals across various industries and career paths',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Other Cover Letter Templates',
                    description: 'Professional cover letter templates for professionals across various industries and career paths',
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