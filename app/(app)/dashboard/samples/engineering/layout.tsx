import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Resume & Cover Letter Samples | Rezum AI',
  description: 'Technical engineering resume and cover letter templates for mechanical, electrical, civil, and software engineers. Professional engineering designs.',
  keywords: [
    'engineering resume templates',
    'engineer resume samples',
    'technical resume templates',
    'engineering cover letter examples',
    'mechanical engineer resume templates',
    'electrical engineer resume samples',
    'civil engineer templates',
    'engineering professional examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Engineering Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Technical engineering resume and cover letter templates for mechanical, electrical, civil, and software engineers. Professional engineering designs.',
    url: 'https://www.rezum-ai.com/dashboard/samples/engineering',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/engineering-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Engineering Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for engineers, technical professionals, and engineering specialists.',
    images: ['/images/engineering-resume-samples-og.jpg'],
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
    canonical: 'https://www.rezum-ai.com/dashboard/samples/engineering',
  },
};

export default function EngineeringSamplesLayout({
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
            name: 'Engineering Resume & Cover Letter Samples',
            description: 'Technical engineering resume and cover letter templates for mechanical, electrical, civil, and software engineers. Professional engineering designs.',
            url: 'https://www.rezum-ai.com/dashboard/samples/engineering',
            about: {
              '@type': 'Service',
              name: 'Engineering Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for engineers, technical professionals, and engineering specialists',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Engineering Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Engineering Resume Templates',
                  description: 'Professional resume templates designed for engineers, technical professionals, and engineering specialists',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Engineering Cover Letter Templates',
                  description: 'Professional cover letter templates for engineers, technical professionals, and engineering specialists',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Engineering Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Engineering Resume Templates',
                    description: 'ATS-optimized resume templates for engineers, technical professionals, and engineering specialists',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Engineering Cover Letter Templates',
                    description: 'Professional cover letter templates for engineers, technical professionals, and engineering specialists',
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