import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Resume & Cover Letter Samples | Rezum AI',
  description: 'Professional student resume and cover letter templates for college students, recent graduates, and entry-level job seekers. ATS-optimized designs for academic and career success.',
  keywords: [
    'student resume templates',
    'college student resume samples',
    'graduate resume templates',
    'entry level resume examples',
    'student cover letter templates',
    'internship resume samples',
    'recent graduate templates',
    'academic resume templates',
    'student job applications',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Student Resume & Cover Letter Samples - Professional Templates | Rezum AI',
    description: 'Professional student resume and cover letter templates for college students, recent graduates, and entry-level job seekers. ATS-optimized designs for academic and career success.',
    url: 'https://rezum-app.vercel.app/dashboard/samples/student',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/student-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Student Resume & Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional resume and cover letter templates for college students, recent graduates, and entry-level job seekers.',
    images: ['/images/student-resume-samples-og.jpg'],
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
    canonical: 'https://rezum-app.vercel.app/dashboard/samples/student',
  },
};

export default function StudentSamplesLayout({
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
            name: 'Student Resume & Cover Letter Samples',
            description: 'Professional student resume and cover letter templates for college students, recent graduates, and entry-level job seekers. ATS-optimized designs for academic and career success.',
            url: 'https://rezum-app.vercel.app/dashboard/samples/student',
            about: {
              '@type': 'Service',
              name: 'Student Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for college students, recent graduates, and entry-level job seekers',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://rezum-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Student Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Student Resume Templates',
                  description: 'Professional resume templates designed for college students, recent graduates, and entry-level professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Student Cover Letter Templates',
                  description: 'Professional cover letter templates for college students, internship applications, and entry-level job seekers',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Student Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Student Resume Templates',
                    description: 'ATS-optimized resume templates for college students, recent graduates, and entry-level job seekers',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Student Cover Letter Templates',
                    description: 'Professional cover letter templates for college students, internship applications, and entry-level positions',
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