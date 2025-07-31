import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Resume & Cover Letter Samples | Rezum AI',
  description: 'Professional healthcare resume and cover letter templates for nurses, doctors, medical professionals, and healthcare workers. Industry-specific designs.',
  keywords: [
    'healthcare resume templates',
    'medical resume samples',
    'nursing resume templates',
    'healthcare cover letter examples',
    'doctor resume templates',
    'medical professional resume samples',
    'healthcare worker templates',
    'clinical resume examples',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Healthcare Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Professional healthcare resume and cover letter templates for nurses, doctors, medical professionals, and healthcare workers. Industry-specific designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/healthcare',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/healthcare-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Healthcare Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for healthcare professionals, medical workers, nurses, and clinical staff.',
    images: ['/images/healthcare-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/healthcare',
  },
};

export default function HealthcareSamplesLayout({
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
            name: 'Healthcare Resume & Cover Letter Samples',
            description: 'Professional healthcare resume and cover letter templates for nurses, doctors, medical professionals, and healthcare workers. Industry-specific designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/healthcare',
            about: {
              '@type': 'Service',
              name: 'Healthcare Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for healthcare professionals, medical workers, nurses, and clinical staff',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Healthcare Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Healthcare Resume Templates',
                  description: 'Professional resume templates designed for healthcare professionals, medical workers, nurses, and clinical staff',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Healthcare Cover Letter Templates',
                  description: 'Professional cover letter templates for healthcare professionals, medical workers, nurses, and clinical staff',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Healthcare Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Healthcare Resume Templates',
                    description: 'ATS-optimized resume templates for healthcare professionals, medical workers, nurses, and clinical staff',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Healthcare Cover Letter Templates',
                    description: 'Professional cover letter templates for healthcare professionals, medical workers, nurses, and clinical staff',
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