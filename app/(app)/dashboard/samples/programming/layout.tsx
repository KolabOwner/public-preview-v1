import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programming Resume & Cover Letter Samples | Kolab AI',
  description: 'Developer-focused resume and cover letter templates for software engineers, full-stack developers, programmers, and coding professionals. Clean, technical designs.',
  keywords: [
    'programming resume templates',
    'software engineer resume samples',
    'developer resume templates',
    'programming cover letter examples',
    'full-stack developer resume templates',
    'software developer resume samples',
    'coding professional templates',
    'programmer resume examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Programming Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Developer-focused resume and cover letter templates for software engineers, full-stack developers, programmers, and coding professionals. Clean, technical designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/programming',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/programming-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Programming Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programming Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for programmers, software engineers, developers, and coding professionals.',
    images: ['/images/programming-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/programming',
  },
};

export default function ProgrammingSamplesLayout({
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
            name: 'Programming Resume & Cover Letter Samples',
            description: 'Developer-focused resume and cover letter templates for software engineers, full-stack developers, programmers, and coding professionals. Clean, technical designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/programming',
            about: {
              '@type': 'Service',
              name: 'Programming Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for programmers, software engineers, developers, and coding professionals',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Programming Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Programming Resume Templates',
                  description: 'Professional resume templates designed for programmers, software engineers, developers, and coding professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Programming Cover Letter Templates',
                  description: 'Professional cover letter templates for programmers, software engineers, developers, and coding professionals',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Programming Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Programming Resume Templates',
                    description: 'ATS-optimized resume templates for programmers, software engineers, developers, and coding professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Programming Cover Letter Templates',
                    description: 'Professional cover letter templates for programmers, software engineers, developers, and coding professionals',
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