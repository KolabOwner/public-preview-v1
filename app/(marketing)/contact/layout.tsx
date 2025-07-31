import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support - Rezum AI | Get Help & Technical Support',
  description: 'Need help with Rezum AI? Contact our support team for technical assistance, billing questions, or general inquiries. We respond within 24 hours.',
  keywords: [
    'contact support',
    'customer service',
    'technical support',
    'help desk',
    'rezum ai support',
    'contact us',
    'customer help',
    'support ticket',
    'billing support'
  ],
  authors: [{ name: 'Rezum AI' }],
  creator: 'Rezum AI',
  publisher: 'Rezum AI',
  openGraph: {
    title: 'Contact Support - Get Help with Rezum AI',
    description: 'Contact our support team for help with technical issues, billing, or general questions. 24-hour response time.',
    url: 'https://yourdomain.com/contact',
    siteName: 'Rezum AI',
    images: [
      {
        url: '/images/contact-support-og.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Contact Rezum AI Support',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Support - Rezum AI',
    description: 'Get help with technical issues, billing, or general questions. We respond within 24 hours.',
    images: ['/images/contact-support-og.jpg'],
    creator: '@kolabai', // Replace with your actual Twitter handle
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
    canonical: 'https://yourdomain.com/contact',
  },
};

export default function ContactLayout({
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
            '@type': 'ContactPage',
            name: 'Rezum AI Contact Support',
            description: 'Contact Rezum AI support team for help with technical issues, billing, and general inquiries',
            url: 'https://yourdomain.com/contact',
            mainEntity: {
              '@type': 'Organization',
              name: 'Rezum AI',
              url: 'https://yourdomain.com',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@rezum-ai.com',
                contactType: 'customer service',
                areaServed: 'Worldwide',
                availableLanguage: 'English',
                serviceType: 'Technical Support',
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1309 Coffeen Avenue STE',
                addressLocality: 'Sheridan',
                addressRegion: 'Wyoming',
                postalCode: '82801',
                addressCountry: 'US'
              }
            },
            potentialAction: {
              '@type': 'CommunicateAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://yourdomain.com/contact',
                actionPlatform: [
                  'http://schema.org/DesktopWebPlatform',
                  'http://schema.org/MobileWebPlatform'
                ]
              }
            }
          }),
        }}
      />
      {children}
    </>
  );
}