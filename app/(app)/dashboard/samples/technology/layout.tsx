import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technology Resume & Cover Letter Samples | Rezum AI',
  description: 'Modern technology resume and cover letter templates for IT professionals, tech managers, system administrators, and technology specialists. ATS-friendly designs.',
  keywords: [
    'technology resume templates',
    'IT resume samples',
    'tech professional resume templates',
    'technology cover letter examples',
    'IT manager resume templates',
    'system administrator resume samples',
    'tech industry templates',
    'technology specialist resumes',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Technology Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Modern technology resume and cover letter templates for IT professionals, tech managers, system administrators, and technology specialists. ATS-friendly designs.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/technology',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/technology-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Technology Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technology Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for technology professionals, IT specialists, system administrators, and tech managers.',
    images: ['/images/technology-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/technology',
  },
};

export default function TechnologySamplesLayout({
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
            name: 'Technology Resume & Cover Letter Samples',
            description: 'Modern technology resume and cover letter templates for IT professionals, tech managers, system administrators, and technology specialists. ATS-friendly designs.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/technology',
            about: {
              '@type': 'Service',
              name: 'Technology Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for technology professionals, IT specialists, system administrators, and tech managers',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Technology Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Technology Resume Templates',
                  description: 'Professional resume templates designed for technology professionals, IT specialists, system administrators, and tech managers',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Technology Cover Letter Templates',
                  description: 'Professional cover letter templates for technology professionals, IT specialists, system administrators, and tech managers',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Technology Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Technology Resume Templates',
                    description: 'ATS-optimized resume templates for technology professionals, IT specialists, system administrators, and tech managers',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Technology Cover Letter Templates',
                    description: 'Professional cover letter templates for technology professionals, IT specialists, system administrators, and tech managers',
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