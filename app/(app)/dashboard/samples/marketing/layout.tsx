import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing Resume & Cover Letter Samples | Rezum AI',
  description: 'Creative marketing resume and cover letter templates for digital marketers, brand managers, content creators, and marketing professionals. Stand out designs.',
  keywords: [
    'marketing resume templates',
    'digital marketing resume samples',
    'marketing cover letter examples',
    'brand manager resume templates',
    'content marketing resume samples',
    'social media manager templates',
    'marketing professional templates',
    'creative marketing resumes',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Marketing Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Creative marketing resume and cover letter templates for digital marketers, brand managers, content creators, and marketing professionals. Stand out designs.',
    url: 'https://www.rezum-ai.com/dashboard/samples/marketing',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/marketing-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Marketing Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for marketing professionals, digital marketers, brand managers, and content creators.',
    images: ['/images/marketing-resume-samples-og.jpg'],
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
    canonical: 'https://www.rezum-ai.com/dashboard/samples/marketing',
  },
};

export default function MarketingSamplesLayout({
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
            name: 'Marketing Resume & Cover Letter Samples',
            description: 'Creative marketing resume and cover letter templates for digital marketers, brand managers, content creators, and marketing professionals. Stand out designs.',
            url: 'https://www.rezum-ai.com/dashboard/samples/marketing',
            about: {
              '@type': 'Service',
              name: 'Marketing Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for marketing professionals, digital marketers, brand managers, and content creators',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Marketing Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Marketing Resume Templates',
                  description: 'Professional resume templates designed for marketing professionals, digital marketers, brand managers, and content creators',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Marketing Cover Letter Templates',
                  description: 'Professional cover letter templates for marketing professionals, digital marketers, brand managers, and content creators',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Marketing Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Marketing Resume Templates',
                    description: 'ATS-optimized resume templates for marketing professionals, digital marketers, brand managers, and content creators',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Marketing Cover Letter Templates',
                    description: 'Professional cover letter templates for marketing professionals, digital marketers, brand managers, and content creators',
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