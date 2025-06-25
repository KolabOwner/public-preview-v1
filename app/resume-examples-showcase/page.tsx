'use client';

import React, { useState } from 'react';
import { Search, Filter, ExternalLink } from 'lucide-react';

interface ResumeExample {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  yearsExperience: string;
  keywords: string[];
}

const resumeExamples: ResumeExample[] = [
  {
    id: '1',
    title: 'Senior Sales Manager',
    category: 'Sales',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/67403fa1dd6506bf322a9468_Screenshot%202024-11-22%20at%201.53.50%E2%80%AFPM.png',
    description: 'Results-driven sales leader with 10+ years of experience driving revenue growth',
    yearsExperience: '10+ years',
    keywords: ['Sales Leadership', 'Revenue Growth', 'Team Management', 'B2B Sales']
  },
  {
    id: '2',
    title: 'Editorial Director',
    category: 'Marketing',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/66dabae030f7dc52d844dbae_Screenshot%202024-09-06%20at%201.48.30%E2%80%AFPM.png',
    description: 'Creative editorial leader specializing in content strategy and brand storytelling',
    yearsExperience: '8+ years',
    keywords: ['Content Strategy', 'Editorial Management', 'Brand Voice', 'Publishing']
  },
  {
    id: '3',
    title: 'Finance Manager - Supply Chain',
    category: 'Accounting and Finance',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/6560a4d5e469a3bb6c5e7936_95567836-555f-42e5-8fbf-7564b985c3af.webp',
    description: 'Finance professional specializing in supply chain optimization and cost reduction',
    yearsExperience: '7+ years',
    keywords: ['Financial Analysis', 'Supply Chain', 'Cost Optimization', 'ERP Systems']
  },
  {
    id: '4',
    title: 'Call Center Manager',
    category: 'Customer Service',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/669a0b155692dd965d86f99a_Screenshot%202024-07-19%20at%2012.13.22%E2%80%AFPM.png',
    description: 'Customer service leader focused on operational excellence and team development',
    yearsExperience: '5+ years',
    keywords: ['Customer Service', 'Team Leadership', 'KPI Management', 'Process Improvement']
  },
  {
    id: '5',
    title: 'HVAC Technician',
    category: 'Construction',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/6699fa7a8928e8becdb9912a_Screenshot%202024-07-19%20at%2011.02.33%E2%80%AFAM.png',
    description: 'Certified HVAC technician with expertise in commercial and residential systems',
    yearsExperience: '6+ years',
    keywords: ['HVAC Installation', 'Troubleshooting', 'Preventive Maintenance', 'EPA Certified']
  },
  {
    id: '6',
    title: 'Visual Merchandiser',
    category: 'Sales',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/6715df87809c171b16f285d0_Screenshot%202024-10-21%20at%2010.28.40%E2%80%AFAM.png',
    description: 'Creative retail professional specializing in visual storytelling and sales optimization',
    yearsExperience: '4+ years',
    keywords: ['Visual Design', 'Retail Strategy', 'Brand Guidelines', 'Sales Analytics']
  },
  {
    id: '7',
    title: 'Branch Manager',
    category: 'Business',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/6698c8f569a54955377fbdc7_Screenshot%202024-07-18%20at%201.19.00%E2%80%AFPM.png',
    description: 'Operations leader with proven track record in branch performance and profitability',
    yearsExperience: '9+ years',
    keywords: ['Operations Management', 'P&L Responsibility', 'Business Development', 'Compliance']
  },
  {
    id: '8',
    title: 'Ceramic Engineer',
    category: 'Engineering',
    image: 'https://cdn.prod.website-files.com/62f3a8c764f6eb23f4252b13/66a3142d9217ff1b3757f6ac_Screenshot%202024-07-26%20at%208.42.03%E2%80%AFAM.png',
    description: 'Materials engineer specializing in ceramic manufacturing and quality control',
    yearsExperience: '5+ years',
    keywords: ['Materials Science', 'Quality Control', 'R&D', 'Manufacturing Processes']
  }
];

const categories = ['All', 'Sales', 'Marketing', 'Accounting and Finance', 'Customer Service', 'Construction', 'Business', 'Engineering', 'Operations'];

export default function ResumeExamplesShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExamples = resumeExamples.filter(example => {
    const matchesCategory = selectedCategory === 'All' || example.category === selectedCategory;
    const matchesSearch = example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary-600 font-semibold mb-2 block">Real-life successful resume examples</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse <span className="text-primary-600">837 Professional Resume Samples</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Learn what matters most in your industry & create a job-winning resume
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Examples Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                {/* Resume Preview Image */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600 font-semibold">{example.category}</span>
                    <span className="text-sm text-gray-500">{example.yearsExperience}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                    {example.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {example.description}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {example.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <a
                    href={`/resume-examples/${example.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center justify-center gap-2 w-full py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-600 hover:text-white transition-colors font-medium"
                  >
                    View Example
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Results count */}
          <div className="text-center mt-8 text-gray-600">
            Showing {filteredExamples.length} of {resumeExamples.length} resume examples
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Resume?</h3>
            <p className="text-gray-600 mb-6">Use these examples as inspiration to create your own ATS-optimized resume</p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://app.rezi.ai/signup"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Create Free Resume
              </a>
              <a
                href="/resume-templates"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Templates
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}