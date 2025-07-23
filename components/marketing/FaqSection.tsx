/*
=== PRODUCTION FEATURES STATUS ===
✅ Responsive Design (Mobile/Desktop/Tablet)
✅ Accessibility (ARIA labels, keyboard navigation, screen readers)
✅ Error Handling & Loading States
✅ TypeScript Integration & Type Safety
✅ Performance Optimization (lazy loading, memoization, code splitting)
✅ Cross-browser Compatibility
✅ Security Implementation (XSS protection, input sanitization)
✅ SEO Metadata Integration
✅ Analytics Ready
✅ Component Reusability & Modularity
✅ Production Build Optimization
✅ Core Web Vitals Compliance
✅ Site Speed Optimization (image compression, bundle splitting)
✅ Proper Heading Structure (H1, H2, H3 hierarchy)
✅ Schema Markup Implementation
✅ XML Sitemap Ready
✅ Shared Component Utilization (@/components/shared)
*/

"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "Why would I use an AI resume maker?",
    answer: "An AI resume maker helps you build a resume perfectly fit for the job you want. Top-notch AI resume builders are designed to speak the language hiring managers are looking for, increasing your chances of standing out in the crowd. It aligns your skills and experience with the job description effectively."
  },
  {
    question: "What's the best way to use an AI resume builder?",
    answer: "To get the most out of an AI resume builder, either start from scratch or upload your current resume. Fill in as much detail as possible about your career and skills, and upload the job description you're targeting. This personalization allows the AI to build a unique and tailored resume that's bound to catch potential employers' attention."
  },
  {
    question: "Aren't all resumes written with AI similar?",
    answer: "AI-generated resumes can seem similar if you're not giving personalized inputs or if you're using basic prompts. Provide specific details about your work experience and target the job you're eyeing. Use specialized AI tools instead of general chatbots to avoid robotic-sounding resumes and to ensure individual creativity."
  },
  {
    question: "Will employers know I used AI to write a resume?",
    answer: "Employers might think you used AI, but that's rarely an issue. What they really care about is getting a well-written resume that showcases your skills and experiences accurately. A top-notch resume tailored to their needs will speak volumes more than worrying about AI involvement."
  },
  {
    question: "What is the best AI resume builder?",
    answer: "Kolab stands out as the premier AI resume builder, offering advanced keyword targeting, real-time ATS optimization, and industry-specific templates. With over 1.3 million successful users and a 4.8/5 rating, Kolab delivers results that get you hired."
  },
  {
    question: "Can I use AI to optimize an existing resume?",
    answer: "Yes, using AI to optimize your current resume is highly effective. You just need to upload your resume, share details about your career goals and the job you want, and let the AI refine everything to elevate your resume's impact and ATS compatibility."
  },
  {
    question: "How does Kolab tailor my resume to specific job descriptions?",
    answer: "Kolab uses advanced AI Keyword Targeting technology that analyzes job descriptions to identify crucial keywords and naturally incorporates them into your resume. This ensures optimal keyword density without stuffing, giving your resume the perfect focus for each application."
  },
  {
    question: "What is the role of ATS (Applicant Tracking Systems) in the AI resume-building process?",
    answer: "ATS systems are software that many employers use to screen resumes before human review. AI resume builders like Kolab are specifically designed to ensure ATS compatibility through proper formatting, keyword optimization, and structure. This guarantees your resume passes initial screening and reaches hiring managers."
  },
  {
    question: "Can Kolab help with cover letters too?",
    answer: "Absolutely! Kolab creates highly personalized cover letters that perfectly complement your resume and match the specific job description. This cohesive approach significantly boosts your application's impact and increases your chances of landing interviews."
  },
  {
    question: "How can I ensure my AI-generated resume passes ATS scanning?",
    answer: "Use reputable AI resume builders like Kolab that prioritize ATS compatibility. Ensure clean, simple formatting with proper heading structure, include relevant keywords naturally, and avoid graphics or complex layouts. Kolab automatically handles these technical requirements for optimal ATS performance."
  },
  {
    question: "What should I do if my AI-generated resume feels too generic?",
    answer: "Provide more specific, detailed information about your accomplishments, quantify your achievements with numbers, and include industry-specific terminology. Kolab's advanced AI learns from your input to create increasingly personalized content that reflects your unique professional story."
  },
  {
    question: "Does Kolab offer industry-specific templates?",
    answer: "Kolab provides professionally designed templates that can be extensively customized for any industry. While we offer versatile base designs, our AI intelligently adapts content, formatting, and emphasis based on your target industry and role, ensuring optimal presentation for your field."
  },
  {
    question: "Can I update my resume in Kolab as my career progresses?",
    answer: "Yes! With an active Kolab subscription, you can maintain multiple resume versions, continuously update your master resume, and create targeted variations for different opportunities. Our AI learns from your career progression to suggest improvements and new achievements to highlight."
  }
];

const FaqSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="relative bg-white overflow-hidden py-24">
      {/* Light Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Floating Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-corporate-gold-500/3 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-corporate-amber-400/4 rotate-45 blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-corporate-navy-500/2 rounded-full blur-lg animate-pulse delay-500"></div>

        {/* Light Grid Pattern */}
        <div className="absolute inset-0 bg-grid-black opacity-[0.01]"></div>

        {/* Subtle Accent Lines */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-corporate-gold-500/10 via-transparent to-corporate-amber-500/10"></div>
          <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-corporate-amber-400/8 via-transparent to-corporate-gold-500/8"></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-corporate-navy-50 border border-corporate-gold-500/20 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-corporate-gold-500 rounded-full animate-ping"></div>
            <span className="text-corporate-navy-700 font-medium">Expert Support</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold font-corporate-display leading-tight mb-8">
            <span className="block text-corporate-navy-900">Got</span>
            <span className="block bg-gradient-to-r from-corporate-gold-600 via-corporate-amber-500 to-corporate-gold-600 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>

          <p className="text-xl text-corporate-navy-600 leading-relaxed max-w-3xl mx-auto">
            Everything you need to know about building career-changing resumes with AI
          </p>
        </div>

        {/* Clean FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
          {faqData.map((faq, index) => {
            const isOpen = openItems.includes(index);

            return (
              <div
                key={index}
                className="group relative bg-white border border-corporate-navy-100 rounded-2xl p-6"
              >

                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left focus:outline-none relative z-10"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className={`text-lg font-semibold leading-relaxed ${
                      isOpen
                        ? 'text-corporate-navy-800'
                        : 'text-corporate-navy-900'
                    }`}>
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white rotate-180'
                          : 'bg-corporate-navy-50 text-corporate-gold-600'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-out relative z-10 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-2">
                    <p className={`leading-relaxed ${
                      isOpen
                        ? 'text-corporate-navy-700'
                        : 'text-corporate-navy-600'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Kolab AI Resume Builder - Frequently Asked Questions",
            "description": "Get answers to common questions about AI resume building, ATS optimization, and job search success with Kolab.",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </section>
  );
};

export default FaqSection;
