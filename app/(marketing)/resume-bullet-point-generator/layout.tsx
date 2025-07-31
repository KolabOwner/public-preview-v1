import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Resume Bullet Point Generator | Rezum AI',
  description: 'Transform your job responsibilities into compelling, ATS-friendly bullet points with our free AI-powered generator. Create professional resume bullet points in seconds.',
  keywords: [
    'resume bullet point generator',
    'AI resume writer',
    'bullet point generator',
    'resume bullet points',
    'ATS bullet points',
    'professional bullet points',
    'job description to bullet points',
    'resume writing tool',
    'AI resume assistant',
    'rezum ai'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Free AI Resume Bullet Point Generator | Rezum AI',
    description: 'Create compelling, ATS-friendly resume bullet points instantly with our AI-powered generator. Transform your experience into professional achievement statements.',
    url: 'https://yourdomain.com/resume-bullet-point-generator',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/bullet-point-generator-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Bullet Point Generator by Rezum AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Bullet Point Generator - Rezum AI',
    description: 'Create professional, ATS-friendly resume bullet points instantly with AI. Free tool for job seekers.',
    images: ['/images/bullet-point-generator-og.jpg'],
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
    canonical: 'https://yourdomain.com/resume-bullet-point-generator',
  },
};

export default function ResumeBulletPointGeneratorLayout({
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
            name: 'AI Resume Bullet Point Generator',
            description: 'Free AI-powered tool that transforms job responsibilities into compelling, ATS-friendly resume bullet points',
            url: 'https://yourdomain.com/resume-bullet-point-generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            provider: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://yourdomain.com',
            },
            featureList: [
              'AI-powered bullet point generation',
              'ATS-friendly formatting',
              'Industry-specific optimization',
              'Instant results',
              'Copy-to-clipboard functionality',
              'Multiple bullet point variations',
              'Professional achievement formatting',
              'Free to use'
            ],
            audience: {
              '@type': 'Audience',
              audienceType: 'Job Seekers',
              geographicArea: 'Global',
            },
            about: [
              {
                '@type': 'Thing',
                name: 'Resume Writing',
                description: 'Professional resume writing and optimization',
              },
              {
                '@type': 'Thing',
                name: 'Job Applications',
                description: 'Tools and resources for job application success',
              },
              {
                '@type': 'Thing',
                name: 'Career Development',
                description: 'Professional career advancement tools',
              },
            ],
            potentialAction: {
              '@type': 'UseAction',
              target: 'https://yourdomain.com/resume-bullet-point-generator',
              object: 'Resume Bullet Point Generator',
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
                name: 'How does the AI resume bullet point generator work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our AI analyzes your job title and responsibilities, then generates professional bullet points that highlight your achievements using action verbs, quantifiable results, and industry-appropriate language.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are the generated bullet points ATS-friendly?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, all generated bullet points are optimized for Applicant Tracking Systems (ATS) with proper formatting, relevant keywords, and professional language that hiring managers expect.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is the resume bullet point generator free to use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, our AI resume bullet point generator is completely free to use. You can generate unlimited bullet points without any cost or registration required.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I customize the generated bullet points?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, you can edit and customize any generated bullet point to better match your specific experience and achievements. Use them as a starting point and adjust as needed.',
                },
              },
              {
                '@type': 'Question',
                name: 'What information do I need to provide?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You only need to provide your job title and a description of your responsibilities or achievements. The AI will transform this into professional bullet points.',
                },
              },
            ],
          }),
        }}
      />

      {/* HowTo Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Create Professional Resume Bullet Points',
            description: 'Step-by-step guide to generating compelling resume bullet points using AI',
            image: 'https://yourdomain.com/images/bullet-point-generator-og.jpg',
            totalTime: 'PT5M',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'USD',
              value: '0',
            },
            supply: [
              {
                '@type': 'HowToSupply',
                name: 'Job Title',
              },
              {
                '@type': 'HowToSupply',
                name: 'Job Responsibilities Description',
              },
            ],
            tool: [
              {
                '@type': 'HowToTool',
                name: 'AI Resume Bullet Point Generator',
              },
            ],
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter Your Job Information',
                text: 'Provide your job title and optionally your company name for context.',
                image: 'https://yourdomain.com/images/step1-job-info.jpg',
              },
              {
                '@type': 'HowToStep',
                name: 'Describe Your Responsibilities',
                text: 'Write a description of what you did in your role, focusing on key tasks and achievements.',
                image: 'https://yourdomain.com/images/step2-responsibilities.jpg',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate Bullet Points',
                text: 'Click the generate button and let our AI create professional bullet points from your input.',
                image: 'https://yourdomain.com/images/step3-generate.jpg',
              },
              {
                '@type': 'HowToStep',
                name: 'Copy and Use',
                text: 'Select the best bullet points and copy them to your resume. Edit as needed to match your style.',
                image: 'https://yourdomain.com/images/step4-copy.jpg',
              },
            ],
          }),
        }}
      />

      {children}
    </>
  );
}