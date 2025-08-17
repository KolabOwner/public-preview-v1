'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { generateBreadcrumbSchema } from '@/lib/seo-utils';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.rezum-ai.com' },
    ...items,
  ];

  const schemaItems = breadcrumbItems
    .filter(item => item.url)
    .map(item => ({
      name: item.name,
      url: item.url!,
    }));

  const schema = generateBreadcrumbSchema(schemaItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-2 text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return (
              <li
                key={index}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" aria-hidden="true" />
                )}
                
                {item.url && !isLast ? (
                  <Link
                    href={item.url}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.name}</span>
                  </Link>
                ) : (
                  <span 
                    className="text-gray-900 dark:text-gray-100 font-medium"
                    itemProp="name"
                  >
                    {item.name}
                  </span>
                )}
                
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}