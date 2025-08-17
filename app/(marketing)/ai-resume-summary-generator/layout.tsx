import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.summaryGenerator;

export default function AIResumeSummaryGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Rezum AI Resume Summary Generator',
            description: 'AI-powered tool that generates professional resume summaries tailored to specific job positions',
            url: 'https://www.rezum-ai.com/ai-resume-summary-generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI resume summary generator with premium features',
            },
            author: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://www.rezum-ai.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '850',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />
      {children}
    </>
  );
}