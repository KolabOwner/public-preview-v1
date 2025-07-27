import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Government Resume & Cover Letter Samples | Kolab AI',
  description: 'Professional government resume and cover letter templates for public servants, federal employees, and government workers. Formal, compliant designs.',
  keywords: [
    'government resume templates',
    'federal resume samples',
    'public service resume templates',
    'government cover letter examples',
    'civil service resume templates',
    'government professional resume samples',
    'federal employee templates',
    'public sector resume examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Government Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Professional government resume and cover letter templates for public servants, federal employees, and government workers. Formal, compliant designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/government',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/government-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Government Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Government Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for government employees, public servants, federal workers, and civil service professionals.',
    images: ['/images/government-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/government',
  },
};

export default function GovernmentSamplesLayout({
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
            name: 'Government Resume & Cover Letter Samples',
            description: 'Professional government resume and cover letter templates for public servants, federal employees, and government workers. Formal, compliant designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/government',
            about: {
              '@type': 'Service',
              name: 'Government Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for government employees, public servants, federal workers, and civil service professionals',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Government Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Government Resume Templates',
                  description: 'Professional resume templates designed for government employees, public servants, federal workers, and civil service professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Government Cover Letter Templates',
                  description: 'Professional cover letter templates for government employees, public servants, federal workers, and civil service professionals',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Government Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Government Resume Templates',
                    description: 'ATS-optimized resume templates for government employees, public servants, federal workers, and civil service professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Government Cover Letter Templates',
                    description: 'Professional cover letter templates for government employees, public servants, federal workers, and civil service professionals',
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