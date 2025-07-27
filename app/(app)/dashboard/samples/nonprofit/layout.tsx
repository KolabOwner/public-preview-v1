import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nonprofit Resume & Cover Letter Samples | Kolab AI',
  description: 'Mission-driven nonprofit resume and cover letter templates for nonprofit workers, program managers, and social impact professionals. Purpose-focused designs.',
  keywords: [
    'nonprofit resume templates',
    'nonprofit professional resume samples',
    'social impact resume templates',
    'nonprofit cover letter examples',
    'program manager resume templates',
    'charity resume samples',
    'nonprofit sector templates',
    'social good resume examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Nonprofit Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Mission-driven nonprofit resume and cover letter templates for nonprofit workers, program managers, and social impact professionals. Purpose-focused designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/nonprofit',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/nonprofit-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Nonprofit Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nonprofit Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for nonprofit professionals, program managers, social workers, and community organizers.',
    images: ['/images/nonprofit-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/nonprofit',
  },
};

export default function NonprofitSamplesLayout({
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
            name: 'Nonprofit Resume & Cover Letter Samples',
            description: 'Mission-driven nonprofit resume and cover letter templates for nonprofit workers, program managers, and social impact professionals. Purpose-focused designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/nonprofit',
            about: {
              '@type': 'Service',
              name: 'Nonprofit Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for nonprofit professionals, program managers, social workers, and community organizers',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Nonprofit Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Nonprofit Resume Templates',
                  description: 'Professional resume templates designed for nonprofit professionals, program managers, social workers, and community organizers',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Nonprofit Cover Letter Templates',
                  description: 'Professional cover letter templates for nonprofit professionals, program managers, social workers, and community organizers',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Nonprofit Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Nonprofit Resume Templates',
                    description: 'ATS-optimized resume templates for nonprofit professionals, program managers, social workers, and community organizers',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Nonprofit Cover Letter Templates',
                    description: 'Professional cover letter templates for nonprofit professionals, program managers, social workers, and community organizers',
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