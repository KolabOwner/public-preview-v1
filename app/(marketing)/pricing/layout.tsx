import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans - Professional Resume Builder & AI Tools | Kolab AI',
  description: 'Choose from Free, Pro, or Lifetime plans. Get unlimited AI-powered resume building, cover letter writing, and career tools. Start free or upgrade for advanced features.',
  keywords: [
    'resume builder pricing',
    'AI resume tools pricing',
    'professional resume builder cost',
    'cover letter generator pricing',
    'career tools subscription',
    'ATS resume builder plans',
    'resume writing software pricing',
    'AI career assistant cost',
    'resume templates pricing',
    'job application tools pricing',
    'kolab ai pricing'
  ],
  authors: [{ name: 'Kolab AI' }],
  creator: 'Kolab AI',
  publisher: 'Kolab AI',
  openGraph: {
    title: 'Affordable Resume Builder & AI Career Tools Pricing | Kolab AI',
    description: 'Start free or choose Pro/Lifetime plans for unlimited AI-powered resume building, cover letters, and career optimization tools.',
    url: 'https://yourdomain.com/pricing',
    siteName: 'Kolab AI',
    images: [
      {
        url: '/images/pricing-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Kolab AI Pricing Plans - Resume Builder & Career Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans - Kolab AI',
    description: 'Professional resume builder starting free. Upgrade for AI-powered career tools and unlimited features.',
    images: ['/images/pricing-og.jpg'],
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
    canonical: 'https://yourdomain.com/pricing',
  },
};

export default function PricingLayout({
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
            name: 'Pricing Plans',
            description: 'Affordable pricing for professional resume builder and AI career tools',
            url: 'https://yourdomain.com/pricing',
            about: {
              '@type': 'Service',
              name: 'Resume Builder & Career Tools',
              description: 'AI-powered resume building, cover letter generation, and career optimization tools',
            },
            provider: {
              '@type': 'Organization',
              name: 'Kolab AI',
              url: 'https://yourdomain.com',
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Pricing Plans',
              itemListElement: [
                {
                  '@type': 'Offer',
                  position: 1,
                  name: 'Free Plan',
                  description: 'Basic resume building with limited features',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Basic Resume Builder',
                    description: '1 resume limit, basic templates, PDF downloads',
                  },
                },
                {
                  '@type': 'Offer',
                  position: 2,
                  name: 'Pro Plan',
                  description: 'Full access to all AI tools and unlimited features',
                  price: '29',
                  priceCurrency: 'USD',
                  billingDuration: 'P1M',
                  availability: 'https://schema.org/InStock',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Professional Resume Builder',
                    description: 'Unlimited resumes, AI writing tools, expert reviews, all templates',
                  },
                },
                {
                  '@type': 'Offer',
                  position: 3,
                  name: 'Lifetime Plan',
                  description: 'One-time payment for lifetime access to all features',
                  price: '149',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Lifetime Resume Builder Access',
                    description: 'All Pro features with one-time payment, no recurring fees',
                  },
                },
              ],
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
                name: 'What are the main differences between Free, Pro, and Lifetime plans?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Free plan includes 1 resume limit and basic features. Pro plan offers unlimited resumes, AI tools, and expert reviews for $29/month. Lifetime plan provides all Pro features for a one-time payment of $149.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is there a free trial available?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, our Free plan allows you to create 1 resume and test our basic features. You can upgrade to Pro or Lifetime at any time for additional features.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is included in the Pro plan?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Pro plan includes unlimited resumes, AI writing tools, keyword optimization, expert reviews, all templates, unlimited downloads, and priority support.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I cancel my subscription anytime?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, you can cancel your Pro subscription at any time. We also offer a 100% refund guarantee if you\'re not satisfied with our service.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is the Lifetime plan really lifetime access?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, the Lifetime plan provides permanent access to all Pro features with no recurring fees. This is a one-time payment of $149.',
                },
              },
            ],
          }),
        }}
      />

      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kolab AI',
            url: 'https://yourdomain.com',
            sameAs: [
              'https://twitter.com/kolabai',
              'https://linkedin.com/company/kolab-ai',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              email: 'support@yourdomain.com',
            },
            offers: {
              '@type': 'AggregateOffer',
              lowPrice: '0',
              highPrice: '149',
              priceCurrency: 'USD',
              offerCount: '3',
            },
          }),
        }}
      />
      {children}
    </>
  );
}