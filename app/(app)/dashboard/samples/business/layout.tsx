import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Resume & Cover Letter Samples | Rezum AI',
  description: 'Professional business resume and cover letter templates for executives, managers, consultants, and business professionals. ATS-optimized designs for corporate success.',
  keywords: [
    'business resume templates',
    'executive resume samples',
    'corporate resume templates',
    'business cover letter examples',
    'management resume templates',
    'consultant resume samples',
    'business professional templates',
    'corporate cover letters',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Business Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Professional business resume and cover letter templates for executives, managers, consultants, and business professionals. ATS-optimized designs for corporate success.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/business',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/business-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Business Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for business executives, managers, consultants, and corporate professionals.',
    images: ['/images/business-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/business',
  },
};

export default function BusinessSamplesLayout({
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
            name: 'Business Resume & Cover Letter Samples',
            description: 'Professional business resume and cover letter templates for executives, managers, consultants, and business professionals. ATS-optimized designs for corporate success.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/business',
            about: {
              '@type': 'Service',
              name: 'Business Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for business executives, managers, consultants, and corporate professionals',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Business Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Business Resume Templates',
                  description: 'Professional resume templates designed for business executives, managers, consultants, and corporate professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Business Cover Letter Templates',
                  description: 'Professional cover letter templates for business executives, managers, consultants, and corporate professionals',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Business Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Business Resume Templates',
                    description: 'ATS-optimized resume templates for business executives, managers, consultants, and corporate professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Business Cover Letter Templates',
                    description: 'Professional cover letter templates for business executives, managers, consultants, and corporate professionals',
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