// app/ai-cover-letter-builder/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Cover Letter Builder - Generate Professional Cover Letters | Hireable AI',
  description: 'Create tailored cover letters in seconds with our AI-powered builder. Generate professional cover letters based on your resume and job descriptions. 255+ templates included.',
  keywords: [
    'AI cover letter builder',
    'cover letter generator',
    'cover letter writer',
    'professional cover letter',
    'cover letter templates',
    'job application letter',
    'cover letter examples',
    'automated cover letter',
    'resume cover letter',
    'hireable ai cover letter'
  ],
  authors: [{ name: 'Hireable AI' }],
  creator: 'Hireable AI',
  publisher: 'Hireable AI',
  openGraph: {
    title: 'AI Cover Letter Builder - Create Professional Cover Letters | Hireable AI',
    description: 'Generate tailored cover letters in seconds. AI-powered builder with 255+ templates and examples.',
    url: 'https://yourdomain.com/ai-cover-letter-builder',
    siteName: 'Hireable AI',
    images: [
      {
        url: '/images/ai-cover-letter-builder-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Cover Letter Builder by Hireable AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Cover Letter Builder - Hireable AI',
    description: 'Create professional cover letters in seconds with AI. Based on your resume and job descriptions.',
    images: ['/images/ai-cover-letter-builder-og.jpg'],
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
    canonical: 'https://yourdomain.com/ai-cover-letter-builder',
  },
};

export default function AICoverLetterBuilderLayout({
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
            '@type': 'SoftwareApplication',
            name: 'Hireable AI Cover Letter Builder',
            description: 'AI-powered cover letter builder that creates professional, tailored cover letters based on your resume and job descriptions',
            url: 'https://yourdomain.com/ai-cover-letter-builder',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI cover letter builder with premium features available',
            },
            featureList: [
              'AI-powered content generation',
              'Resume-based personalization',
              'Job description keyword matching',
              '255+ professional templates',
              'Multiple export formats (PDF, Word, Google Drive)',
              'Grammar and spell checking',
              'Professional formatting',
              'Human review option',
            ],
            author: {
              '@type': 'Organization',
              name: 'Hireable AI',
              url: 'https://yourdomain.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '3000',
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
            name: 'How to Create a Cover Letter with AI',
            description: 'Generate a professional cover letter in 3 simple steps using AI technology',
            step: [
              {
                '@type': 'HowToStep',
                name: 'Add Job Description',
                text: 'Input the job posting details and target company information',
                url: 'https://yourdomain.com/ai-cover-letter-builder#step1',
              },
              {
                '@type': 'HowToStep',
                name: 'Extract Keywords',
                text: 'AI analyzes and extracts relevant keywords from the job description',
                url: 'https://yourdomain.com/ai-cover-letter-builder#step2',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate Cover Letter',
                text: 'AI creates a tailored cover letter based on your resume and the job requirements',
                url: 'https://yourdomain.com/ai-cover-letter-builder#step3',
              },
            ],
            totalTime: 'PT1M',
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
                name: 'What Are AI Credits?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Hireable AI Writer is powered by advanced AI technology. AI credits are used to generate high-quality cover letter content tailored to your specific needs.',
                },
              },
              {
                '@type': 'Question',
                name: 'How Does Our AI Work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Hireable uses advanced neural networks trained on successful cover letters and best practices. We\'ve integrated this AI to transfer expert-quality cover letter writing at almost no cost.',
                },
              },
              {
                '@type': 'Question',
                name: 'How Do I Get AI Credits?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can get credits by subscribing to Hireable Pro or purchasing AI Credits directly. Pro subscribers get monthly credits included in their subscription.',
                },
              },
            ],
          }),
        }}
      />

      {/* Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'AI Cover Letter Builder',
            description: 'Professional cover letter builder powered by AI',
            brand: {
              '@type': 'Brand',
              name: 'Hireable AI',
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'USD',
              lowPrice: '0',
              highPrice: '29',
              offerCount: '2',
              offers: [
                {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  name: 'Free Plan',
                  description: 'Basic cover letter generation with limited features',
                },
                {
                  '@type': 'Offer',
                  price: '29',
                  priceCurrency: 'USD',
                  name: 'Pro Plan',
                  description: 'Unlimited cover letters with all premium features',
                },
              ],
            },
            review: [
              {
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
                author: {
                  '@type': 'Person',
                  name: 'Ashley Stahl',
                },
                reviewBody: 'Hireable AI is an awesome AI-based cover letter builder that includes templates to help you design a cover letter that is sure to check the boxes when it comes to applicant tracking systems.',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}