import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Resume & Cover Letter Samples | Rezum AI',
  description: 'Creative design resume and cover letter templates for graphic designers, UX/UI designers, web designers, and creative professionals. Visually striking designs.',
  keywords: [
    'design resume templates',
    'graphic designer resume samples',
    'creative resume templates',
    'design cover letter examples',
    'UX designer resume templates',
    'web designer resume samples',
    'creative professional templates',
    'design industry examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Design Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Creative design resume and cover letter templates for graphic designers, UX/UI designers, web designers, and creative professionals. Visually striking designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/design',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/design-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Design Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for designers, creative professionals, UX/UI designers, and visual artists.',
    images: ['/images/design-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/design',
  },
};

export default function DesignSamplesLayout({
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
            name: 'Design Resume & Cover Letter Samples',
            description: 'Creative design resume and cover letter templates for graphic designers, UX/UI designers, web designers, and creative professionals. Visually striking designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/design',
            about: {
              '@type': 'Service',
              name: 'Design Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for designers, creative professionals, UX/UI designers, and visual artists',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Design Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Design Resume Templates',
                  description: 'Professional resume templates designed for designers, creative professionals, UX/UI designers, and visual artists',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Design Cover Letter Templates',
                  description: 'Professional cover letter templates for designers, creative professionals, UX/UI designers, and visual artists',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Design Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Design Resume Templates',
                    description: 'ATS-optimized resume templates for designers, creative professionals, UX/UI designers, and visual artists',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Design Cover Letter Templates',
                    description: 'Professional cover letter templates for designers, creative professionals, UX/UI designers, and visual artists',
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