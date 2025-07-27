import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Resume & Cover Letter Samples | Kolab AI',
  description: 'Professional legal resume and cover letter templates for lawyers, attorneys, paralegals, and legal professionals. Conservative, professional designs.',
  keywords: [
    'legal resume templates',
    'lawyer resume samples',
    'attorney resume templates',
    'legal cover letter examples',
    'paralegal resume templates',
    'legal professional resume samples',
    'law firm resume templates',
    'legal industry examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Legal Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Professional legal resume and cover letter templates for lawyers, attorneys, paralegals, and legal professionals. Conservative, professional designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/legal',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/legal-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Legal Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for legal professionals, lawyers, attorneys, and paralegals.',
    images: ['/images/legal-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/legal',
  },
};

export default function LegalSamplesLayout({
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
            name: 'Legal Resume & Cover Letter Samples',
            description: 'Professional legal resume and cover letter templates for lawyers, attorneys, paralegals, and legal professionals. Conservative, professional designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/legal',
            about: {
              '@type': 'Service',
              name: 'Legal Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for legal professionals, lawyers, attorneys, and paralegals',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Legal Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Legal Resume Templates',
                  description: 'Professional resume templates designed for legal professionals, lawyers, attorneys, and paralegals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Legal Cover Letter Templates',
                  description: 'Professional cover letter templates for legal professionals, lawyers, attorneys, and paralegals',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Legal Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Legal Resume Templates',
                    description: 'ATS-optimized resume templates for legal professionals, lawyers, attorneys, and paralegals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Legal Cover Letter Templates',
                    description: 'Professional cover letter templates for legal professionals, lawyers, attorneys, and paralegals',
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