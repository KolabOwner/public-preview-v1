// app/ai-resume-editor/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Editor - Enhance Your Resume Content | Hireable AI',
  description: 'Transform your resume with AI-powered editing. Get intelligent suggestions to improve bullet points, quantify achievements, and optimize for ATS. Start editing free.',
  keywords: [
    'AI resume editor',
    'resume enhancement',
    'resume rewriter',
    'bullet point generator',
    'resume improvement',
    'ATS optimization',
    'career tools',
    'resume editing software',
    'hireable ai editor'
  ],
  authors: [{ name: 'Hireable AI' }],
  creator: 'Hireable AI',
  publisher: 'Hireable AI',
  openGraph: {
    title: 'AI Resume Editor - Transform Your Resume Content | Hireable AI',
    description: 'Enhance your resume with AI-powered suggestions. Improve bullet points and optimize for ATS.',
    url: 'https://yourdomain.com/ai-resume-editor',
    siteName: 'Hireable AI',
    images: [
      {
        url: '/images/ai-resume-editor-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Editor by Hireable AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Editor - Hireable AI',
    description: 'Transform your resume with AI-powered editing. Intelligent suggestions for better content.',
    images: ['/images/ai-resume-editor-og.jpg'],
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
    canonical: 'https://yourdomain.com/ai-resume-editor',
  },
};

export default function AIResumeEditorLayout({
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
            name: 'Hireable AI Resume Editor',
            description: 'AI-powered resume editor that enhances your content with intelligent suggestions',
            url: 'https://yourdomain.com/ai-resume-editor',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI resume editor with 5,000 complimentary credits',
            },
            author: {
              '@type': 'Organization',
              name: 'Hireable AI',
              url: 'https://yourdomain.com',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '2100',
              bestRating: '5',
              worstRating: '1',
            },
            featureList: [
              'AI-powered content enhancement',
              'Real-time editing suggestions',
              'ATS optimization',
              'Industry-specific recommendations',
              'Multiple export formats',
              'Grammar and spell checking',
            ],
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
                name: 'How does the AI editor improve my resume?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our AI analyzes your content and suggests improvements based on best practices, industry standards, and successful resume patterns. It helps quantify achievements, use action verbs, and optimize for ATS systems.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my data secure?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely. We use enterprise-grade encryption and never share your personal information. Your resume data is only used to provide you with suggestions and is deleted from our servers after processing.',
                },
              },
              {
                '@type': 'Question',
                name: 'What are AI credits?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'AI credits are used each time you generate enhanced content. One enhancement typically uses 200-400 credits. With 50,000 credits, you can enhance approximately 150-250 bullet points.',
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