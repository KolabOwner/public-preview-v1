import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creative Resume & Cover Letter Samples | Rezum AI',
  description: 'Artistic creative resume and cover letter templates for artists, writers, content creators, and creative professionals. Unique, standout designs.',
  keywords: [
    'creative resume templates',
    'artist resume samples',
    'creative professional resume templates',
    'creative cover letter examples',
    'writer resume templates',
    'content creator resume samples',
    'artistic resume templates',
    'creative industry examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Creative Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Artistic creative resume and cover letter templates for artists, writers, content creators, and creative professionals. Unique, standout designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/creative',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/creative-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Creative Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creative Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for creative professionals, artists, writers, and content creators.',
    images: ['/images/creative-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/creative',
  },
};

export default function CreativeSamplesLayout({
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
            name: 'Creative Resume & Cover Letter Samples',
            description: 'Artistic creative resume and cover letter templates for artists, writers, content creators, and creative professionals. Unique, standout designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/creative',
            about: {
              '@type': 'Service',
              name: 'Creative Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for creative professionals, artists, writers, and content creators',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Creative Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Creative Resume Templates',
                  description: 'Professional resume templates designed for creative professionals, artists, writers, and content creators',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Creative Cover Letter Templates',
                  description: 'Professional cover letter templates for creative professionals, artists, writers, and content creators',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Creative Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Creative Resume Templates',
                    description: 'ATS-optimized resume templates for creative professionals, artists, writers, and content creators',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Creative Cover Letter Templates',
                    description: 'Professional cover letter templates for creative professionals, artists, writers, and content creators',
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