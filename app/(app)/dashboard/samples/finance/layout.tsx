import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finance Resume & Cover Letter Samples | Kolab AI',
  description: 'Professional finance resume and cover letter templates for financial analysts, accountants, bankers, and finance professionals. Corporate-ready designs.',
  keywords: [
    'finance resume templates',
    'financial analyst resume samples',
    'accounting resume templates',
    'finance cover letter examples',
    'banking resume templates',
    'financial professional resume samples',
    'finance industry templates',
    'investment resume examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Finance Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Professional finance resume and cover letter templates for financial analysts, accountants, bankers, and finance professionals. Corporate-ready designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/finance',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/finance-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Finance Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for finance professionals, financial analysts, accountants, and banking specialists.',
    images: ['/images/finance-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/finance',
  },
};

export default function FinanceSamplesLayout({
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
            name: 'Finance Resume & Cover Letter Samples',
            description: 'Professional finance resume and cover letter templates for financial analysts, accountants, bankers, and finance professionals. Corporate-ready designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/finance',
            about: {
              '@type': 'Service',
              name: 'Finance Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for finance professionals, financial analysts, accountants, and banking specialists',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Finance Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Finance Resume Templates',
                  description: 'Professional resume templates designed for finance professionals, financial analysts, accountants, and banking specialists',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Finance Cover Letter Templates',
                  description: 'Professional cover letter templates for finance professionals, financial analysts, accountants, and banking specialists',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Finance Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Finance Resume Templates',
                    description: 'ATS-optimized resume templates for finance professionals, financial analysts, accountants, and banking specialists',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Finance Cover Letter Templates',
                    description: 'Professional cover letter templates for finance professionals, financial analysts, accountants, and banking specialists',
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