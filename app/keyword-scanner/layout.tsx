// app/keyword-scanner/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Keyword Scanner - ATS Optimizer | Hireable AI',
  description: 'Free resume keyword scanner and ATS optimizer. Analyze your resume against job descriptions to identify missing keywords and improve your chances of getting interviews.',
  keywords: [
    'resume keyword scanner',
    'ATS scanner',
    'resume optimizer',
    'keyword analyzer',
    'ATS checker',
    'resume scanner free',
    'job description matcher',
    'applicant tracking system',
    'resume keywords',
    'hireable ai scanner'
  ],
  authors: [{ name: 'Hireable AI' }],
  creator: 'Hireable AI',
  publisher: 'Hireable AI',
  openGraph: {
    title: 'Free Resume Keyword Scanner & ATS Optimizer | Hireable AI',
    description: 'Scan your resume against job descriptions. Get instant keyword analysis and ATS optimization tips.',
    url: 'https://yourdomain.com/keyword-scanner',
    siteName: 'Hireable AI',
    images: [
      {
        url: '/images/keyword-scanner-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume Keyword Scanner by Hireable AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Keyword Scanner - Hireable AI',
    description: 'Free ATS scanner to optimize your resume with the right keywords. Improve your interview chances.',
    images: ['/images/keyword-scanner-og.jpg'],
    creator: '@hireableai',
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
    canonical: 'https://yourdomain.com/keyword-scanner',
  },
};

export default function KeywordScannerLayout({
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
            '@type': 'WebApplication',
            name: 'Hireable AI Resume Keyword Scanner',
            description: 'Free tool to scan resumes for keywords and optimize for ATS systems',
            url: 'https://yourdomain.com/keyword-scanner',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free resume keyword scanner with instant results',
            },
            featureList: [
              'ATS compatibility checking',
              'Keyword extraction and matching',
              'Real-time scoring',
              'Industry-specific recommendations',
              'Missing keyword identification',
              'Optimization suggestions',
            ],
            author: {
              '@type': 'Organization',
              name: 'Hireable AI',
              url: 'https://yourdomain.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.7',
              ratingCount: '3200',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />

      {/* How-to Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Use Resume Keyword Scanner',
            description: 'Optimize your resume with keyword scanning in 2 simple steps',
            step: [
              {
                '@type': 'HowToStep',
                name: 'Input Job Description',
                text: 'Paste the job posting you are targeting into the scanner',
                url: 'https://yourdomain.com/keyword-scanner#step1',
              },
              {
                '@type': 'HowToStep',
                name: 'Get Optimization Insights',
                text: 'Receive detailed analysis of missing keywords and placement recommendations',
                url: 'https://yourdomain.com/keyword-scanner#step2',
              },
            ],
            totalTime: 'PT2M',
            supply: {
              '@type': 'HowToSupply',
              name: 'Resume and job description',
            },
          }),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does the keyword scanner work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our scanner uses natural language processing to analyze job descriptions and extract relevant keywords, skills, and requirements. It then compares these against your resume to identify gaps and opportunities for optimization.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is keyword stuffing a good strategy?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. Our scanner helps you naturally incorporate relevant keywords into your existing content. We focus on meaningful integration that maintains readability while ensuring ATS compatibility.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is the matching algorithm?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our algorithm is trained on millions of successful job applications and continuously updated. It considers synonyms, related terms, and industry-specific variations to provide comprehensive matching.',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}