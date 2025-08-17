import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface RelatedPage {
  title: string;
  description: string;
  href: string;
  category?: string;
}

interface RelatedPagesProps {
  pages: RelatedPage[];
  title?: string;
  className?: string;
}

export default function RelatedPages({ 
  pages, 
  title = 'Related Resources',
  className = '' 
}: RelatedPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className={`related-pages ${className}`}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page, index) => (
          <Link
            key={index}
            href={page.href}
            className="group block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200"
          >
            {page.category && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {page.category}
              </span>
            )}
            
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {page.title}
            </h3>
            
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {page.description}
            </p>
            
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              Learn more
              <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Helper function to get related pages based on current page context
export function getRelatedPages(currentPath: string): RelatedPage[] {
  const allPages = {
    'resume-templates': [
      {
        title: 'AI Resume Builder',
        description: 'Create an ATS-optimized resume with AI assistance',
        href: '/ai-resume-builder',
        category: 'Tools',
      },
      {
        title: 'Resume Examples',
        description: 'Browse professional resume examples by industry',
        href: '/resume-examples',
        category: 'Examples',
      },
      {
        title: 'Keyword Scanner',
        description: 'Optimize your resume with the right keywords',
        href: '/keyword-scanner',
        category: 'Tools',
      },
    ],
    'cover-letter-templates': [
      {
        title: 'AI Cover Letter Builder',
        description: 'Generate personalized cover letters with AI',
        href: '/ai-cover-letter-builder',
        category: 'Tools',
      },
      {
        title: 'Resume Templates',
        description: 'Matching resume templates for your cover letter',
        href: '/resume-templates',
        category: 'Templates',
      },
      {
        title: 'Resume Examples',
        description: 'See how to pair resumes with cover letters',
        href: '/resume-examples',
        category: 'Examples',
      },
    ],
    'ai-resume-builder': [
      {
        title: 'Resume Templates',
        description: 'Professional templates to get started',
        href: '/resume-templates',
        category: 'Templates',
      },
      {
        title: 'Bullet Point Generator',
        description: 'Create impactful resume bullet points',
        href: '/resume-bullet-point-generator',
        category: 'Tools',
      },
      {
        title: 'Resume Checker',
        description: 'Check your resume for ATS compatibility',
        href: '/resume-checker',
        category: 'Tools',
      },
    ],
    'keyword-scanner': [
      {
        title: 'Resume Checker',
        description: 'Complete ATS compatibility analysis',
        href: '/resume-checker',
        category: 'Tools',
      },
      {
        title: 'AI Resume Builder',
        description: 'Build an optimized resume from scratch',
        href: '/ai-resume-builder',
        category: 'Tools',
      },
      {
        title: 'Resume Templates',
        description: 'ATS-friendly resume templates',
        href: '/resume-templates',
        category: 'Templates',
      },
    ],
    'resume-examples': [
      {
        title: 'Resume Templates',
        description: 'Turn examples into editable templates',
        href: '/resume-templates',
        category: 'Templates',
      },
      {
        title: 'AI Resume Builder',
        description: 'Create your own professional resume',
        href: '/ai-resume-builder',
        category: 'Tools',
      },
      {
        title: 'Cover Letter Templates',
        description: 'Matching cover letters for your resume',
        href: '/cover-letter-templates',
        category: 'Templates',
      },
    ],
    'pricing': [
      {
        title: 'AI Resume Builder',
        description: 'See what\'s included in each plan',
        href: '/ai-resume-builder',
        category: 'Features',
      },
      {
        title: 'Resume Templates',
        description: 'Browse templates available in your plan',
        href: '/resume-templates',
        category: 'Features',
      },
      {
        title: 'About Us',
        description: 'Learn more about our mission',
        href: '/about',
        category: 'Company',
      },
    ],
    default: [
      {
        title: 'AI Resume Builder',
        description: 'Create an ATS-optimized resume with AI',
        href: '/ai-resume-builder',
        category: 'Popular',
      },
      {
        title: 'Resume Templates',
        description: 'Professional resume templates',
        href: '/resume-templates',
        category: 'Popular',
      },
      {
        title: 'Keyword Scanner',
        description: 'Optimize your resume keywords',
        href: '/keyword-scanner',
        category: 'Popular',
      },
    ],
  };

  // Extract the page slug from the current path
  const pathSegments = currentPath.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || 'default';

  return allPages[currentPage as keyof typeof allPages] || allPages.default;
}