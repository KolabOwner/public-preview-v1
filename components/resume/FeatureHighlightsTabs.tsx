import React, { useState } from 'react';
import { CheckCircle, Target, BarChart3, Sparkles } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  benefits: string[];
  image: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

const features: Feature[] = [
  {
    id: 'ats-keyword',
    title: 'ATS Keyword Targeting',
    icon: <Target className="w-6 h-6" />,
    description: 'Instantly improve your chances of being selected for an interview by using the targeted keywords identified by Resume.',
    benefits: [
      'AI-powered keyword extraction from job descriptions',
      'Real-time keyword density analysis',
      'Industry-specific keyword suggestions',
      'Automatic keyword optimization'
    ],
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/6711b78b661d02328e5a5260_AI%20keyword%20targeting.webp',
    stats: [
      { label: 'Higher Interview Rate', value: '62%' },
      { label: 'Keywords Identified', value: '23+' }
    ]
  },
  {
    id: 'content-analysis',
    title: 'Real Time Content Analysis',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Resume instantly identifies common content errors such as missing bullet points, buzzwords, useful metrics, and more.',
    benefits: [
      'Instant feedback on resume content',
      'Grammar and spelling checks',
      'Action verb suggestions',
      'Quantifiable achievement recommendations'
    ],
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/65c8cdbd5f5bc757ca00e7d5_Type%3Dexpanded%20partially.svg',
    stats: [
      { label: 'Content Issues Found', value: 'Avg 15' },
      { label: 'Improvement Rate', value: '89%' }
    ]
  },
  {
    id: 'resume-score',
    title: 'The Resume Score',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'The Resume Score critiques how well you\'ve created your resume across 23 criteria points - translating the result into a score rated from 1 - 100.',
    benefits: [
      'Comprehensive 23-point evaluation',
      'Actionable improvement suggestions',
      'Industry benchmark comparisons',
      'Progress tracking over time'
    ],
    image: 'https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/656120966305b9b0023dfd47_6305cb9394cbfaaa1152ef0f_607d0b37e6616e3dff27c9c7_Screen%20Shot%202021-04-19%20at%201.46.32%20PM.webp',
    stats: [
      { label: 'Average Score Increase', value: '+35' },
      { label: 'Criteria Analyzed', value: '23' }
    ]
  }
];

export default function FeatureHighlightsTabs() {
  const [activeTab, setActiveTab] = useState('ats-keyword');
  const activeFeature = features.find(f => f.id === activeTab)!;

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold mb-2 block">Its never been easier to make your resume</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Content-focused</span> features
            <br />developed to get you hired
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our AI-powered tools analyze, optimize, and perfect your resume in real-time
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all text-left ${
                  activeTab === feature.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-md bg-slate-900/50 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    activeTab === feature.id ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-slate-800 text-gray-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{feature.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <h3 className="text-3xl font-bold mb-4 text-white">{activeFeature.title}</h3>
                <p className="text-gray-400 text-lg mb-6">{activeFeature.description}</p>

                {/* Benefits List */}
                <ul className="space-y-3 mb-8">
                  {activeFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Stats */}
                {activeFeature.stats && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {activeFeature.stats.map((stat, index) => (
                      <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <a
                  href="https://app.resume.ai/signup"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl"
                >
                  Try It Free
                </a>
              </div>

              {/* Image */}
              <div className="relative">
                <img
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  className="w-full rounded-lg shadow-2xl"
                />
                {/* Decorative Elements */}
                <div className="absolute -z-10 top-8 right-8 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -z-10 bottom-8 left-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}