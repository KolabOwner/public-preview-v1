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
    question: "How fast will I receive my professional review?",
    answer: "Your review turnaround depends on the option you select. Our fastest option delivers expert feedback in just 12 hours, while our most economical option takes 5 days. All reviews are completed by certified career experts with extensive recruiting experience across various industries."
  },
  {
    question: "What type of feedback will I receive?",
    answer: "Our expert reviewers provide comprehensive feedback covering content optimization, ATS compatibility, formatting improvements, keyword enhancement, and strategic positioning. You'll receive actionable recommendations with specific examples of how to strengthen your resume's impact and increase interview callbacks."
  },
  {
    question: "Is this service suitable for all career levels?",
    answer: "Absolutely! Our review service caters to professionals at every stage - from recent graduates entering the job market to senior executives seeking C-suite positions. Our expert reviewers specialize in different industries and career levels to provide targeted, relevant feedback."
  },
  {
    question: "What if my resume doesn't need many changes?",
    answer: "That's actually great news! If your resume is already strong, our reviewers will focus on fine-tuning and strategic enhancements. We believe in quality over quantity - we only suggest changes that genuinely improve your resume's effectiveness and don't create unnecessary modifications."
  },
  {
    question: "Can I submit the same resume multiple times?",
    answer: "While you can resubmit resumes, we recommend incorporating previous feedback before requesting another review. This ensures you receive fresh insights and maximize the value of each review session. Each submission is treated as a new review with our current expert pool."
  },
  {
    question: "Do you review resumes created with Rezum templates?",
    answer: "Yes! Our experts are familiar with Rezum's template library and can provide valuable feedback on resumes created with our platform. However, we don't review sample resumes from our template gallery - only personalized resumes with your actual experience and information."
  },
  {
    question: "What happens if I'm not satisfied with my review?",
    answer: "Your satisfaction is our priority. If you feel the review didn't meet your expectations, please contact our support team within 7 days. We'll work with you to address any concerns and ensure you receive the value you expect from our professional review service."
  },
  {
    question: "Is my resume information kept confidential?",
    answer: "Absolutely. We maintain strict confidentiality protocols. Your resume is only accessed by assigned expert reviewers who are bound by non-disclosure agreements. Your personal information and career details are never shared or used for any purpose beyond providing your review."
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
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Frequently Asked Questions (FAQs)
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about our professional resume review service
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {faqItems.map((item, index) => (
          <div key={index} className={`${index !== faqItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
            <button
              onClick={() => toggleItem(index)}
              className="w-full py-6 px-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.question}
              </span>
              <div className={`flex-shrink-0 transition-transform duration-200 ${expandedItems.includes(index) ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedItems.includes(index) 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className="px-6 pb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Still have questions? <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact our support team</a>
        </p>
      </div>
    </div>
  );
}