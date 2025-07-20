import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Templates - Professional ATS-Friendly Templates | Kolab AI',
  description: 'Choose from our collection of ATS-friendly resume templates. Modern, simple, creative, and compact designs built for the modern job hunt. Get hired faster.',
  keywords: [
    'resume templates',
    'ATS-friendly templates',
    'professional resume templates',
    'modern resume templates',
    'creative resume templates',
    'simple resume templates',
    'compact resume templates',
    'resume formats',
    'job application templates',
    'kolab ai'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'ATS-Friendly Resume Templates - Professional Designs | Kolab AI',
    description: 'Browse our collection of professional resume templates designed to pass ATS scanners and impress hiring managers.',
    url: 'https://yourdomain.com/resume-templates',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/resume-templates-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional Resume Templates by Kolab AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Templates - Kolab AI',
    description: 'Professional, ATS-friendly resume templates designed for modern job seekers.',
    images: ['/images/resume-templates-og.jpg'],
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
    canonical: 'https://yourdomain.com/resume-templates',
  },
};

export default function ResumeTemplatesLayout({
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
            name: 'Resume Templates Collection',
            description: 'Professional ATS-friendly resume templates for modern job seekers',
            url: 'https://yourdomain.com/resume-templates',
            about: {
              '@type': 'Service',
              name: 'Resume Template Library',
              description: 'Collection of professional resume templates optimized for ATS systems',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://yourdomain.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Resume Template Categories',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Simple Resume Templates',
                  description: 'Clean, professional templates for all industries',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Modern Resume Templates',
                  description: 'Contemporary designs for tech and modern industries',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Creative Resume Templates',
                  description: 'Standout designs for creative professionals',
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Compact Resume Templates',
                  description: 'Space-efficient templates for experienced professionals',
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}