import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Search - Find Real Open Jobs & Get Hired Fast | Rezum AI',
  description: 'Find over 1.3M real job opportunities sourced directly from company websites. Skip the resume black holes of traditional job boards. AI-powered matching, integrated resume builder, and application tracking.',
  keywords: [
    'job search',
    'real jobs',
    'company websites',
    'direct applications',
    'job opportunities',
    'job board alternative',
    'AI job matching',
    'resume builder',
    'application tracking',
    'job hunting',
    'career search',
    'employment opportunities',
    'job listings',
    'hiring',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Job Search - Find Real Open Jobs & Get Hired Fast | Rezum AI',
    description: 'Over 1.3M jobs sourced directly from company websites. Skip the resume black holes and find real opportunities with AI-powered matching.',
    url: 'https://yourdomain.com/job-search',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/job-search-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Rezum AI Job Search - Find Real Jobs from Company Websites',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Search - Find Real Open Jobs | Rezum AI',
    description: 'Over 1.3M real job opportunities sourced directly from company websites. Skip the job board noise.',
    images: ['/images/job-search-og.jpg'],
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
    canonical: 'https://yourdomain.com/job-search',
  },
};

export default function JobSearchLayout({
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
            name: 'Job Search Platform',
            description: 'Find real job opportunities sourced directly from company websites with AI-powered matching and integrated tools',
            url: 'https://yourdomain.com/job-search',
            about: {
              '@type': 'Service',
              name: 'Job Search Platform',
              description: 'Direct job search platform with over 1.3M opportunities from company websites',
              provider: {
                '@type': 'Organization',
                name: 'Rezum AI',
                url: 'https://yourdomain.com',
              },
            },
            mainEntity: {
              '@type': 'JobPosting',
              name: 'Job Search Service',
              description: 'Platform offering direct access to job opportunities from company websites',
              hiringOrganization: {
                '@type': 'Organization',
                name: 'Rezum AI',
                url: 'https://yourdomain.com',
              },
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'US',
                },
              },
              employmentType: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY'],
              industry: [
                'Technology',
                'Healthcare',
                'Finance',
                'Marketing',
                'Sales',
                'Education',
                'Engineering',
                'Design'
              ],
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://yourdomain.com/job-search?q={search_term_string}&location={location}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Additional structured data for job categories */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Job Categories',
            description: 'Available job categories with current openings',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Technology Jobs',
                description: '45,000+ technology job opportunities',
                url: 'https://yourdomain.com/job-search?category=technology',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Healthcare Jobs',
                description: '32,000+ healthcare job opportunities',
                url: 'https://yourdomain.com/job-search?category=healthcare',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Finance Jobs',
                description: '28,000+ finance job opportunities',
                url: 'https://yourdomain.com/job-search?category=finance',
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: 'Marketing Jobs',
                description: '25,000+ marketing job opportunities',
                url: 'https://yourdomain.com/job-search?category=marketing',
              },
              {
                '@type': 'ListItem',
                position: 5,
                name: 'Sales Jobs',
                description: '38,000+ sales job opportunities',
                url: 'https://yourdomain.com/job-search?category=sales',
              },
              {
                '@type': 'ListItem',
                position: 6,
                name: 'Education Jobs',
                description: '22,000+ education job opportunities',
                url: 'https://yourdomain.com/job-search?category=education',
              },
              {
                '@type': 'ListItem',
                position: 7,
                name: 'Engineering Jobs',
                description: '41,000+ engineering job opportunities',
                url: 'https://yourdomain.com/job-search?category=engineering',
              },
              {
                '@type': 'ListItem',
                position: 8,
                name: 'Design Jobs',
                description: '18,000+ design job opportunities',
                url: 'https://yourdomain.com/job-search?category=design',
              },
            ],
          }),
        }}
      />

      {/* Organization structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Rezum AI',
            url: 'https://yourdomain.com',
            description: 'Job search platform providing direct access to real opportunities from company websites',
            foundingDate: '2020',
            sameAs: [
              'https://twitter.com/kolabai',
              'https://linkedin.com/company/kolabai',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              url: 'https://yourdomain.com/contact',
            },
            service: {
              '@type': 'Service',
              name: 'Job Search Platform',
              description: 'Direct job search with AI-powered matching and integrated resume builder',
              serviceType: 'Job Search',
              provider: {
                '@type': 'Organization',
                name: 'Rezum AI',
              },
            },
          }),
        }}
      />

      {children}
    </>
  );
}