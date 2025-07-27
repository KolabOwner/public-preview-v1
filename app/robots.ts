import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://kolab-app.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/resume-templates',
          '/cover-letter-templates', 
          '/ai-resume-builder',
          '/ai-cover-letter-builder',
          '/resume-examples',
          '/keyword-scanner',
          '/resume-bullet-point-generator',
          '/job-search',
          '/blog',
          '/resume-docs',
          '/pricing',
          '/about',
          '/editorial-process',
          '/legal',
          '/dashboard/samples/',
          '/dashboard/samples/*',
          '/sign-in',
          '/sign-up',
          '/forgot-password'
        ],
        disallow: [
          '/dashboard/resumes/',
          '/dashboard/resumes/*',
          '/dashboard/cover-letters/',
          '/dashboard/cover-letters/*',
          '/dashboard/account',
          '/dashboard/ai-interview',
          '/dashboard/review',
          '/dashboard/job-search',
          '/verify-email',
          '/email-link-complete',
          '/sign-out',
          '/api/',
          '/_next/',
          '/scripts/',
          '/*.json'
        ],
        crawlDelay: 1,
      },
      // More restrictive rules for specific crawlers if needed
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}