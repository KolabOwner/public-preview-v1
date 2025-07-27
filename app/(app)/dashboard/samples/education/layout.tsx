import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education Resume & Cover Letter Samples | Kolab AI',
  description: 'Professional education resume and cover letter templates for teachers, administrators, professors, and education professionals. Academic-focused designs.',
  keywords: [
    'education resume templates',
    'teacher resume samples',
    'academic resume templates',
    'education cover letter examples',
    'professor resume templates',
    'educational professional resume samples',
    'teaching resume templates',
    'academic professional examples',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Education Resume & Cover Letter Samples - Professional Templates | Kolab AI',
    description: 'Professional education resume and cover letter templates for teachers, administrators, professors, and education professionals. Academic-focused designs.',
    url: 'https://kolab-app.vercel.app/dashboard/samples/education',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/education-resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Education Resume & Cover Letter Samples by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education Resume & Cover Letter Samples - Kolab AI',
    description: 'Professional resume and cover letter templates for educators, teachers, professors, and academic professionals.',
    images: ['/images/education-resume-samples-og.jpg'],
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
    canonical: 'https://kolab-app.vercel.app/dashboard/samples/education',
  },
};

export default function EducationSamplesLayout({
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
            name: 'Education Resume & Cover Letter Samples',
            description: 'Professional education resume and cover letter templates for teachers, administrators, professors, and education professionals. Academic-focused designs.',
            url: 'https://kolab-app.vercel.app/dashboard/samples/education',
            about: {
              '@type': 'Service',
              name: 'Education Resume & Cover Letter Template Library',
              description: 'Professional resume and cover letter templates for educators, teachers, professors, and academic professionals',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://kolab-app.vercel.app',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Education Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Education Resume Templates',
                  description: 'Professional resume templates designed for educators, teachers, professors, and academic professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Education Cover Letter Templates',
                  description: 'Professional cover letter templates for educators, teachers, professors, and academic professionals',
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Education Professional Templates',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Education Resume Templates',
                    description: 'ATS-optimized resume templates for educators, teachers, professors, and academic professionals',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service', 
                    name: 'Education Cover Letter Templates',
                    description: 'Professional cover letter templates for educators, teachers, professors, and academic professionals',
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