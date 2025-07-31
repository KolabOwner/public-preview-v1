import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hospitality Resume & Cover Letter Samples | Rezum AI',
  description: 'Professional hospitality resume and cover letter templates for hotel managers, restaurant professionals, and hospitality workers. Service-focused designs.',
  keywords: [
    'hospitality resume templates',
    'hotel management resume samples',
    'restaurant resume templates',
    'hospitality cover letter examples',
    'food service resume templates',
    'hospitality professional resume samples',
    'tourism resume templates',
    'hospitality industry examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Hospitality Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Professional hospitality resume and cover letter templates for hotel managers, restaurant professionals, and hospitality workers. Service-focused designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/hospitality',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/hospitality-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Hospitality Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hospitality Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for hospitality professionals, hotel managers, restaurant workers, and service staff.',
    images: ['/images/hospitality-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/hospitality',
  },
};

export default function HospitalitySamplesLayout({
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
            name: 'Hospitality Resume & Cover Letter Samples',
            description: 'Professional hospitality resume and cover letter templates for hotel managers, restaurant professionals, and hospitality workers. Service-focused designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/hospitality',
            about: {
              '@type': 'Service',
              name: 'Hospitality Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for hospitality professionals, hotel managers, restaurant workers, and service staff',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Hospitality Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Hospitality Resume Templates',
                  description: 'Professional resume templates designed for hospitality professionals, hotel managers, restaurant workers, and service staff',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Hospitality Cover Letter Templates',
                  description: 'Professional cover letter templates for hospitality professionals, hotel managers, restaurant workers, and service staff',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Hospitality Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Hospitality Resume Templates',
                    description: 'ATS-optimized resume templates for hospitality professionals, hotel managers, restaurant workers, and service staff',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Hospitality Cover Letter Templates',
                    description: 'Professional cover letter templates for hospitality professionals, hotel managers, restaurant workers, and service staff',
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