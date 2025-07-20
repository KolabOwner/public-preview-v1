'use client';

import React, { useState } from 'react';
import { CheckCircle, Zap, Users, Target, Sparkles, Copy, RotateCcw } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function ResumeBulletPointGenerator() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const bulletExamples = [
    {
      category: "Sales & Marketing",
      bullets: [
        "Increased sales revenue by 35% through implementation of targeted lead generation campaigns",
        "Developed and executed social media strategy that grew follower engagement by 150%",
        "Managed client relationships resulting in 95% customer retention rate"
      ]
    },
    {
      category: "Project Management",
      bullets: [
        "Led cross-functional team of 8 members to deliver $2M project 2 weeks ahead of schedule",
        "Streamlined workflow processes reducing project completion time by 25%",
        "Coordinated with stakeholders to ensure 100% project deliverable acceptance"
      ]
    },
    {
      category: "Software Development",
      bullets: [
        "Developed React application serving 50,000+ daily active users",
        "Optimized database queries reducing page load time by 40%",
        "Implemented automated testing suite improving code coverage to 95%"
      ]
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates compelling bullet points tailored to your experience'
    },
    {
      icon: Target,
      title: 'ATS Optimized',
      description: 'Bullet points designed to pass applicant tracking systems'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Generate multiple variations in seconds'
    },
    {
      icon: Users,
      title: 'HR Approved',
      description: 'Formats and language that hiring managers love'
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Enter Your Role and Company",
      description: "Provide your job title and company name for context"
    },
    {
      step: 2,
      title: "Describe Your Responsibility",
      description: "Tell us what you did in your own words"
    },
    {
      step: 3,
      title: "Generate Bullet Points",
      description: "Our AI creates multiple professional bullet point options"
    },
    {
      step: 4,
      title: "Copy and Use",
      description: "Select the best bullets and add them to your resume"
    }
  ];

  const handleGenerate = async () => {
    if (!jobTitle || !responsibility) return;

    setIsGenerating(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sampleBullets = [
      `Managed ${responsibility.toLowerCase()} initiatives resulting in improved team productivity and operational efficiency`,
      `Implemented strategic ${responsibility.toLowerCase()} processes that enhanced company-wide performance metrics`,
      `Led ${responsibility.toLowerCase()} projects contributing to organizational growth and stakeholder satisfaction`,
      `Developed and executed ${responsibility.toLowerCase()} strategies that delivered measurable business impact`
    ];

    setGeneratedBullets(sampleBullets);
    setIsGenerating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                AI-Powered Tool
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Free AI Resume
              <span className="text-blue-600 block">Bullet Point Generator</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your job responsibilities into compelling, ATS-friendly bullet points that
              showcase your achievements and get you noticed by employers.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Marketing Manager"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Tech Corp"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe what you did
                  </label>
                  <textarea
                    value={responsibility}
                    onChange={(e) => setResponsibility(e.target.value)}
                    placeholder="e.g., I managed social media accounts and created content that increased engagement"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!jobTitle || !responsibility || isGenerating}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Bullet Points
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated Results */}
      {generatedBullets.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your AI-Generated Bullet Points
              </h2>
              <p className="text-lg text-gray-600">
                Click to copy any bullet point to your clipboard
              </p>
            </div>
            <div className="space-y-4">
              {generatedBullets.map((bullet, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => copyToClipboard(bullet)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-900 flex-1 text-lg">{bullet}</p>
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setGeneratedBullets([])}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Generate New Bullets
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Write Better Resume Bullet Points Faster with AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered generator helps you create compelling bullet points that showcase
              your achievements and get you noticed by hiring managers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bullet Point Examples by Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our AI transforms basic job descriptions into compelling achievement statements
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {bulletExamples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">{example.category}</h3>
                <div className="space-y-4">
                  {example.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resume Bullet Generator: How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Transform your experience into professional bullet points in 4 simple steps
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-blue-600">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tips for Better Bullet Points
            </h2>
            <p className="text-xl text-gray-600">
              Follow these best practices to create compelling resume bullet points
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Use action verbs</h4>
                  <p className="text-gray-600">Start with strong verbs like "managed," "developed," "increased"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Include numbers</h4>
                  <p className="text-gray-600">Quantify your achievements with percentages, dollars, or counts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Show impact</h4>
                  <p className="text-gray-600">Focus on results and outcomes, not just tasks</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Be specific</h4>
                  <p className="text-gray-600">Use concrete examples rather than vague statements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Match keywords</h4>
                  <p className="text-gray-600">Include relevant industry terms from job descriptions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Keep it concise</h4>
                  <p className="text-gray-600">Aim for 1-2 lines per bullet point</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Powerful Resume Bullet Points?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Use our AI-powered generator to transform your experience into compelling bullet points that get results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Generate Bullet Points
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors border border-blue-500">
              View Resume Templates
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}