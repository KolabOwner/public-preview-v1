import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manufacturing Resume & Cover Letter Samples | Rezum AI',
  description: 'Industrial manufacturing resume and cover letter templates for production managers, quality control, and manufacturing professionals. Technical designs.',
  keywords: [
    'manufacturing resume templates',
    'production manager resume samples',
    'manufacturing professional resume templates',
    'manufacturing cover letter examples',
    'quality control resume templates',
    'industrial resume samples',
    'production resume templates',
    'manufacturing industry examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Manufacturing Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Industrial manufacturing resume and cover letter templates for production managers, quality control, and manufacturing professionals. Technical designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/manufacturing',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/manufacturing-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Manufacturing Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manufacturing Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for manufacturing professionals, production managers, quality control specialists, and industrial workers.',
    images: ['/images/manufacturing-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/manufacturing',
  },
};

export default function ManufacturingSamplesLayout({
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
            name: 'Manufacturing Resume & Cover Letter Samples',
            description: 'Industrial manufacturing resume and cover letter templates for production managers, quality control, and manufacturing professionals. Technical designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/manufacturing',
            about: {
              '@type': 'Service',
              name: 'Manufacturing Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for manufacturing professionals, production managers, quality control specialists, and industrial workers',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Manufacturing Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Manufacturing Resume Templates',
                  description: 'Professional resume templates designed for manufacturing professionals, production managers, quality control specialists, and industrial workers',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Manufacturing Cover Letter Templates',
                  description: 'Professional cover letter templates for manufacturing professionals, production managers, quality control specialists, and industrial workers',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Manufacturing Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Manufacturing Resume Templates',
                    description: 'ATS-optimized resume templates for manufacturing professionals, production managers, quality control specialists, and industrial workers',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Manufacturing Cover Letter Templates',
                    description: 'Professional cover letter templates for manufacturing professionals, production managers, quality control specialists, and industrial workers',
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