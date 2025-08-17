import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s Resume & Cover Letter Samples | Rezum AI',
    default: 'Resume & Cover Letter Samples - Professional Templates | Rezum AI'
  },
  description: 'Browse professional resume and cover letter samples across all industries. Expert-crafted templates for business, technology, medical, finance, and more. ATS-optimized designs.',
  keywords: [
    'resume samples',
    'cover letter samples',
    'professional resume templates',
    'career templates',
    'job application templates',
    'resume examples by industry',
    'cover letter examples',
    'ATS-friendly templates',
    'industry resume templates',
    'professional templates',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Professional Resume & Cover Letter Samples - All Industries | Rezum AI',
    description: 'Discover expert-crafted resume and cover letter samples for every industry and career level. ATS-optimized templates that get results.',
    url: 'https://www.rezum-ai.com/dashboard/samples',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/resume-samples-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional Resume and Cover Letter Samples by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume & Cover Letter Samples - Rezum AI',
    description: 'Professional templates and samples for every industry. ATS-optimized designs that get results.',
    images: ['/images/resume-samples-og.jpg'],
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
    canonical: 'https://www.rezum-ai.com/dashboard/samples',
  },
};

export default function SamplesLayout({
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
            name: 'Resume & Cover Letter Samples Library',
            description: 'Professional resume and cover letter samples across all industries with ATS-optimized designs',
            url: 'https://www.rezum-ai.com/dashboard/samples',
            about: {
              '@type': 'Service',
              name: 'Professional Template Sample Library',
              description: 'Comprehensive collection of resume and cover letter samples for all industries and career levels',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Industry Sample Categories',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Business Resume & Cover Letter Samples',
                  description: 'Professional templates for business professionals and executives',
                  url: 'https://www.rezum-ai.com/dashboard/samples/business'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Technology Resume & Cover Letter Samples',
                  description: 'Modern templates for tech professionals and engineers',
                  url: 'https://www.rezum-ai.com/dashboard/samples/technology'
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Healthcare Resume & Cover Letter Samples',
                  description: 'Professional templates for medical workers and medical professionals',
                  url: 'https://www.rezum-ai.com/dashboard/samples/healthcare'
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Finance Resume & Cover Letter Samples',
                  description: 'Professional templates for financial services and banking professionals',
                  url: 'https://www.rezum-ai.com/dashboard/samples/finance'
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  name: 'Marketing Resume & Cover Letter Samples',
                  description: 'Creative templates for marketing professionals and digital marketers',
                  url: 'https://www.rezum-ai.com/dashboard/samples/marketing'
                },
                {
                  '@type': 'ListItem',
                  position: 6,
                  name: 'Engineering Resume & Cover Letter Samples',
                  description: 'Technical templates for engineers and technical professionals',
                  url: 'https://www.rezum-ai.com/dashboard/samples/engineering'
                },
                {
                  '@type': 'ListItem',
                  position: 7,
                  name: 'Education Resume & Cover Letter Samples',
                  description: 'Professional templates for teachers and education professionals',
                  url: 'https://www.rezum-ai.com/dashboard/samples/education'
                },
                {
                  '@type': 'ListItem',
                  position: 8,
                  name: 'Legal Resume & Cover Letter Samples',
                  description: 'Professional templates for lawyers and legal professionals',
                  url: 'https://www.rezum-ai.com/dashboard/samples/legal'
                }
              ],
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Industry-Specific Resume & Cover Letter Samples',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Resume Templates by Industry',
                    description: 'Industry-specific resume templates optimized for ATS systems',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Cover Letter Templates by Industry',
                    description: 'Professional cover letter templates tailored to specific industries',
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