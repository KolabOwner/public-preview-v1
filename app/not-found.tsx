import Link from 'next/link';
import { Metadata } from 'next';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Rezum AI',
  description: 'The page you are looking for could not be found. Browse our resume templates, AI tools, and resources to find what you need.',
  robots: 'noindex, follow',
};

export default function NotFound() {
  const popularPages = [
    { title: 'AI Resume Builder', href: '/ai-resume-builder' },
    { title: 'Resume Templates', href: '/resume-templates' },
    { title: 'Cover Letter Templates', href: '/cover-letter-templates' },
    { title: 'Keyword Scanner', href: '/keyword-scanner' },
    { title: 'Resume Examples', href: '/resume-examples' },
    { title: 'Pricing', href: '/pricing' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-gray-900 dark:text-gray-100">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {popularPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}