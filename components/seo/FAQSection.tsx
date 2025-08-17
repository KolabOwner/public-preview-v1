'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { generateFAQSchema } from '@/lib/seo-utils';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions', className = '' }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const schema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className={`faq-section ${className}`} itemScope itemType="https://schema.org/FAQPage">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            
            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold" itemProp="name">
                    {faq.question}
                  </h3>
                  {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                  )}
                </button>
                
                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text" className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}