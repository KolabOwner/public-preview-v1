// File: components/dashboard/review/faq-section.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Why can't I see any changes?",
    answer: "While some of the resume edits may not be immediately visible, rest assured that our focus is on enhancing the content to maximize its impact. Our expert reviewers will provide valuable comments on relevant sections, guiding you on how to improve your resume effectively."
  },
  {
    question: "Is an Expert Review the same as resume writing?",
    answer: "When you submit your resume for review, we understand that it's already a reflection of your hard work. Our goal is not to completely rewrite your resume but rather to enhance its grammar, formatting, and overall application readiness. Rest assured, if a complete rewrite is necessary, our review comments will provide clear instructions on how you can improve your resume."
  },
  {
    question: "Nothing changed in my resume. Why?",
    answer: "Our approach is simple: we only make necessary changes to your resume. We won't create problems where there aren't any just to provide a fix. Our users often create outstanding resumes using available tools, resulting in excellent outputs. So, if your resume receives fewer comments during the review process, it's a testament to your skills and the quality of your work."
  },
  {
    question: "What happens if I send my resume more than once?",
    answer: "If you send your resume more than once, we understand that the review notes may appear similar as we provide comments based on identified issues and potential improvements in your resume. To overcome this, we highly recommend using the latest reviewed resume as a foundation for future resumes instead of your original resume."
  },
  {
    question: "What happens if I send a Rezi example resume for review?",
    answer: "Please note that we do not provide reviews for sample resumes imported from the sample library. Our review services are designed specifically for resumes that you create and upload to our platform. However, feel free to utilize the sample resumes as a valuable resource and reference when crafting your own standout resume."
  }
];

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
        Frequently Asked Questions (FAQ)
      </h2>

      <div className="space-y-0">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleItem(index)}
              className="w-full py-4 px-0 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                {item.question}
              </span>
              {expandedItems.includes(index) ? (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedItems.includes(index) 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className="pb-4">
                <p className="text-base text-gray-700 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}