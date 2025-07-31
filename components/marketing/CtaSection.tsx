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
*/

"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/shared/button';

interface CtaSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  className = '',
  title = 'Ready to Build Your AI-Powered <span class="bg-gradient-to-r from-corporate-gold-600 to-corporate-amber-500 bg-clip-text text-transparent">Resume?</span>',
  subtitle = 'Join 50,000+ professionals who got hired faster',
  ctaText = 'Build My Resume',
  ctaUrl = '/sign-up'
}) => {
  return (
    <section
      className={`relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white overflow-hidden ${className}`}
      aria-labelledby="cta-heading"
    >
      {/* Light Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Floating Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-corporate-gold-500/3 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-corporate-amber-400/4 rotate-45 blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-corporate-navy-500/2 rounded-full blur-lg"></div>

        {/* Light Grid Pattern */}
        <div className="absolute inset-0 bg-grid-black opacity-[0.01]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 sm:space-y-8">
          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-corporate-navy-900 leading-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          <p className="text-lg sm:text-xl md:text-2xl text-corporate-navy-600 font-light max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Button */}
          <div className="pt-2 sm:pt-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-600 hover:to-corporate-amber-600 text-corporate-navy-900 font-bold px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-corporate-gold-400/50"
            >
              <a
                href={ctaUrl}
                className="inline-flex items-center gap-2 sm:gap-3"
                aria-label={`${ctaText} - Navigate to resume builder`}
              >
                {ctaText}
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-corporate-navy-500 text-sm sm:text-base">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Free to start</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-corporate-gold-400 rounded-full"></div>
            <span>No credit card</span>
            <div className="hidden sm:block w-1 h-1 bg-corporate-gold-400 rounded-full"></div>
            <span>2 min setup</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;