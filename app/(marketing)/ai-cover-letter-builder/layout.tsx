import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.coverLetterBuilder;

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
            name: 'Rezum AI Cover Letter Builder',
            description: 'AI-powered cover letter builder that creates professional, tailored cover letters based on your resume and job descriptions',
            url: 'https://www.rezum-ai.com/ai-cover-letter-builder',
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
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
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
                url: 'https://www.rezum-ai.com/ai-cover-letter-builder#step1',
              },
              {
                '@type': 'HowToStep',
                name: 'Extract Keywords',
                text: 'AI analyzes and extracts relevant keywords from the job description',
                url: 'https://www.rezum-ai.com/ai-cover-letter-builder#step2',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate Cover Letter',
                text: 'AI creates a tailored cover letter based on your resume and the job requirements',
                url: 'https://www.rezum-ai.com/ai-cover-letter-builder#step3',
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
      {children}
    </>
  );
}