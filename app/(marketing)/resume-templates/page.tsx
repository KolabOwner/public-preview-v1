import React from 'react';
import { Star, CheckCircle, ArrowRight, Download, FileText, Zap, Users, Target } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function ResumeTemplatesPage() {
  const templateCategories = [
    { name: 'Simple', count: 12, description: 'Clean, professional designs' },
    { name: 'Modern', count: 8, description: 'Contemporary and stylish' },
    { name: 'Creative', count: 6, description: 'Unique and eye-catching' },
    { name: 'Compact', count: 4, description: 'Space-efficient layouts' }
  ];

  const features = [
    {
      icon: FileText,
      title: 'ATS-Friendly',
      description: 'All templates are optimized to pass Applicant Tracking Systems'
    },
    {
      icon: Zap,
      title: 'Quick Setup',
      description: 'Get started in minutes with our easy-to-use template system'
    },
    {
      icon: Users,
      title: 'HR Approved',
      description: 'Designed with input from hiring managers and recruiters'
    },
    {
      icon: Target,
      title: 'Industry Focused',
      description: 'Templates tailored for different industries and roles'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Resume Templates
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Resume
              <span className="text-blue-600 block">Templates Collection</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose from our collection of ATS-friendly resume templates. Modern, simple, creative, 
              and compact designs built for the modern job hunt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                Browse Templates
              </button>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border border-blue-600 hover:bg-blue-50 transition-colors">
                Create Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Template Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Find Your Perfect
              <span className="text-blue-600 block">Resume Style</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our carefully curated collection of resume templates, designed for different 
              industries and career levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {templateCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="text-sm text-blue-600 font-medium">{category.count} templates</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Templates?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our resume templates are designed with modern hiring practices in mind, 
              ensuring your application gets noticed.
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

      {/* Customization Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                  You do you, a template won't get in the way
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Infinite customization with intact design
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your resume should look and feel like <em>you</em>. That&apos;s why you can customize these resume templates as much as you please. Change fonts, colors, rearrange and rename sections, you name it. The design will always stay pitch-perfect.
              </p>
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                Create your resume now
              </button>
            </div>
            <div className="relative">
              <div className="bg-gray-100 rounded-xl p-8 aspect-square flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <FileText className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg">Template Customization Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Smart Template Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="aspect-[4/5] bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Just use this template</h3>
                  <p className="text-gray-600">Your application-ready resume will write itself in 5 minutes.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">Recommended:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Smart templates that adapt to you
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered templates automatically adjust to your experience level, industry, 
                and career goals. Get professional results without the guesswork.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Automatic formatting</h4>
                    <p className="text-gray-600">Perfect spacing and alignment every time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Industry optimization</h4>
                    <p className="text-gray-600">Templates tailored for your specific field</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">ATS compatibility</h4>
                    <p className="text-gray-600">Guaranteed to work with all major tracking systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Use Resume Templates
            </h2>
            <p className="text-xl text-gray-600">
              Follow these simple steps to create your professional resume
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Template</h3>
                <p className="text-gray-600">Browse our collection and select a template that matches your industry and personal style.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your Information</h3>
                <p className="text-gray-600">Fill in your personal details, work experience, education, and skills using our guided form.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize and Perfect</h3>
                <p className="text-gray-600">Adjust colors, fonts, and layout to match your preferences. Our AI will help optimize your content.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Download and Apply</h3>
                <p className="text-gray-600">Export your resume as PDF and start applying to your dream jobs with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Professional Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have landed their dream jobs with our templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              Get Started Free
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors border border-blue-500">
              View All Templates
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}