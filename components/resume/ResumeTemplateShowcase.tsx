import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  downloadTypes: string[];
  isPopular?: boolean;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern Resume Template',
    description: 'Our newest resume template developed with attractive colors, clean lines, and high content density. Resume recommends this format for all users.',
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/671f1eafad9bda69665472e8_prod_modern_template_47.webp',
    downloadTypes: ['PDF'],
    isPopular: true
  },
  {
    id: 'standard',
    name: 'Standard Resume Template',
    description: 'Our classic resume template, trusted by over 100,000+ job seekers, is designed to get through ATS software and into the hands of real humans.',
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/671f1eb04c7bee9f8c60437f_standard_template-p-1080_1_85.webp',
    downloadTypes: ['PDF', 'Microsoft Word', 'Google Drive']
  },
  {
    id: 'compact',
    name: 'Compact Resume Template',
    description: 'Our clean resume template for experienced professionals is designed to fit 20% more content per page.',
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/671f1eb05a9dd4cdaa854891_compact_template-p-1080_2_54.webp',
    downloadTypes: ['PDF', 'Microsoft Word', 'Google Drive']
  },
  {
    id: 'bold',
    name: 'Bold Resume Template',
    description: 'Make a statement with our bold template featuring strong typography and modern design elements.',
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/6341feffe2412de685bfa2ed_bold.webp',
    downloadTypes: ['PDF']
  },
  {
    id: 'alternative',
    name: 'Alternative Resume Template',
    description: 'We\'ve created an alternative Resume format that is designed to be printed and viewed on paper. Well suited for when you need modern resume templates.',
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/634e80d1ba6592bf5aa00c69_63072ff7cfd3b09f19b7377b_alt.webp',
    downloadTypes: ['PDF']
  }
];

export default function ResumeTemplateShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTemplate = templates[currentIndex];

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold mb-2 block">Professional Templates</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Choose from Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">ATS-Optimized</span> Templates
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each template is carefully designed to pass ATS systems while maintaining a professional appearance
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-8">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 z-10 p-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-700/50 transition-all"
              aria-label="Previous template"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row items-center gap-12 px-16">
              {/* Template Image */}
              <div className="lg:w-1/2">
                <div className="relative">
                  {currentTemplate.isPopular && (
                    <span className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  )}
                  <img
                    src={currentTemplate.image}
                    alt={currentTemplate.name}
                    className="w-full rounded-lg shadow-2xl border border-slate-700"
                  />
                </div>
              </div>

              {/* Template Info */}
              <div className="lg:w-1/2">
                <h3 className="text-3xl font-bold mb-4 text-white">{currentTemplate.name}</h3>
                <p className="text-gray-400 mb-6 text-lg">{currentTemplate.description}</p>
                
                <div className="mb-8">
                  <h4 className="font-semibold text-white mb-3">Format Download Types</h4>
                  <div className="flex flex-wrap gap-3">
                    {currentTemplate.downloadTypes.map((type) => (
                      <span
                        key={type}
                        className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-gray-300 rounded-lg text-sm font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href="https://app.resume.ai/signup"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl"
                  >
                    Use This Template
                  </a>
                  <a
                    href="/resume-templates"
                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                  >
                    View All Templates
                  </a>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 z-10 p-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-700/50 transition-all"
              aria-label="Next template"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {templates.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to template ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}