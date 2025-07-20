import React from 'react';
import { Star, CheckCircle, ArrowRight, Download, FileText, Zap, Users, Target, Mail, Edit, Award } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function CoverLetterTemplatesPage() {
  const templateCategories = [
    { name: 'Professional', count: 15, description: 'Formal and business-appropriate' },
    { name: 'Modern', count: 12, description: 'Contemporary and fresh designs' },
    { name: 'Creative', count: 8, description: 'Stand out with unique layouts' },
    { name: 'Entry-Level', count: 6, description: 'Perfect for new graduates' }
  ];

  const features = [
    {
      icon: Mail,
      title: 'ATS-Optimized',
      description: 'Formatted to work seamlessly with applicant tracking systems'
    },
    {
      icon: Edit,
      title: 'Easy Customization',
      description: 'Personalize every section to match your unique story'
    },
    {
      icon: Users,
      title: 'HR-Tested',
      description: 'Proven formats that hiring managers love to read'
    },
    {
      icon: Award,
      title: 'Industry-Specific',
      description: 'Templates designed for different career fields'
    }
  ];

  const industries = [
    { name: 'Technology', count: 8, icon: '💻' },
    { name: 'Healthcare', count: 6, icon: '🏥' },
    { name: 'Finance', count: 7, icon: '💰' },
    { name: 'Marketing', count: 5, icon: '📈' },
    { name: 'Education', count: 4, icon: '📚' },
    { name: 'Legal', count: 3, icon: '⚖️' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Cover Letter Templates
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Cover Letter
              <span className="text-purple-600 block">Templates That Get Results</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Make a powerful first impression with our collection of professionally designed cover letter templates.
              Tailored for every industry and career level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                Browse Templates
              </button>
              <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg border border-purple-600 hover:bg-purple-50 transition-colors">
                Create Cover Letter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">Template Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Choose Your Perfect
              <span className="text-purple-600 block">Cover Letter Style</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From traditional business formats to modern creative designs, find the template
              that matches your personality and industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {templateCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="text-sm text-purple-600 font-medium">{category.count} templates</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry-Specific Templates */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored cover letter templates designed for specific industries,
              with appropriate tone and formatting conventions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="text-3xl mb-4">{industry.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{industry.name}</h3>
                  <div className="text-sm text-purple-600 font-medium">{industry.count} templates</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Cover Letter Templates?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our templates are crafted by career experts and tested by hiring managers
              to ensure maximum impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI-Powered Writing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">
                  AI-Powered Writing Assistant
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Let AI help you write compelling cover letters
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our intelligent writing assistant analyzes job descriptions and suggests
                personalized content that highlights your most relevant qualifications and experiences.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart content suggestions</h4>
                    <p className="text-gray-600">AI-powered recommendations based on your experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Tone optimization</h4>
                    <p className="text-gray-600">Perfect balance of professionalism and personality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Keyword matching</h4>
                    <p className="text-gray-600">Align your letter with job requirements</p>
                  </div>
                </div>
              </div>
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                Try AI Writing Assistant
              </button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">AI Writing Assistant Interface</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gray-100 rounded-xl p-8 aspect-square flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <FileText className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg">Template Customization Preview</p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">
                  Complete Customization Control
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Make it uniquely yours
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Every template is fully customizable. Adjust fonts, colors, spacing, and layout to create
                a cover letter that perfectly represents your personal brand while maintaining professional standards.
              </p>
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                Start Customizing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Create Your Cover Letter
            </h2>
            <p className="text-xl text-gray-600">
              Follow these simple steps to create a compelling cover letter
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-purple-600">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Template</h3>
                <p className="text-gray-600">Choose from our professional collection based on your industry and personal style preferences.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-purple-600">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Input Job Details</h3>
                <p className="text-gray-600">Enter the company name, position, and job requirements to personalize your cover letter.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize Content</h3>
                <p className="text-gray-600">Use our AI assistant to craft compelling content that highlights your qualifications and enthusiasm.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-purple-600">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Download and Send</h3>
                <p className="text-gray-600">Export your polished cover letter and attach it to your job applications with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Perfect Cover Letter?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of job seekers who have impressed hiring managers with our templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              Start Writing Now
            </button>
            <button className="bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-800 transition-colors border border-purple-500">
              Browse All Templates
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}