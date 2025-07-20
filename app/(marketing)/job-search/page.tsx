'use client';

import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Building, Filter, Star, CheckCircle, ArrowRight, Users, Target, Zap, FileText, TrendingUp, Clock } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function JobSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const jobCategories = [
    { name: 'Technology', count: 45000, icon: '💻' },
    { name: 'Healthcare', count: 32000, icon: '🏥' },
    { name: 'Finance', count: 28000, icon: '💰' },
    { name: 'Marketing', count: 25000, icon: '📢' },
    { name: 'Sales', count: 38000, icon: '📈' },
    { name: 'Education', count: 22000, icon: '📚' },
    { name: 'Engineering', count: 41000, icon: '⚙️' },
    { name: 'Design', count: 18000, icon: '🎨' }
  ];

  const featuredJobs = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      posted: '2 days ago',
      logo: '🚀'
    },
    {
      title: 'Marketing Manager',
      company: 'GrowthCo',
      location: 'New York, NY',
      salary: '$80k - $110k',
      type: 'Full-time',
      posted: '1 day ago',
      logo: '📊'
    },
    {
      title: 'Product Designer',
      company: 'DesignHub',
      location: 'Los Angeles, CA',
      salary: '$90k - $130k',
      type: 'Full-time',
      posted: '3 days ago',
      logo: '🎯'
    },
    {
      title: 'Data Scientist',
      company: 'DataFlow',
      location: 'Seattle, WA',
      salary: '$110k - $150k',
      type: 'Full-time',
      posted: '1 day ago',
      logo: '📈'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'Real Job Opportunities',
      description: 'Over 1.3M jobs sourced directly from company websites—not resume black holes'
    },
    {
      icon: Zap,
      title: 'Smart Matching',
      description: 'AI-powered job recommendations based on your skills and experience'
    },
    {
      icon: FileText,
      title: 'Integrated Resume Builder',
      description: 'Create and tailor your resume for each application seamlessly'
    },
    {
      icon: TrendingUp,
      title: 'Application Tracking',
      description: 'Track your applications and follow up strategically'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Direct from Company Websites',
      description: 'Skip the middleman and apply directly to companies'
    },
    {
      icon: CheckCircle,
      title: 'Fresh Job Listings',
      description: 'Updated daily with the latest opportunities'
    },
    {
      icon: CheckCircle,
      title: 'No Fake Postings',
      description: 'Verified jobs from legitimate companies only'
    },
    {
      icon: CheckCircle,
      title: 'Higher Response Rates',
      description: 'Better visibility with direct company applications'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="mr-1">🆕</span>
                New!
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find <span className="text-blue-600">real</span> open jobs and
              <span className="text-blue-600 block">get hired fast</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Use Kolab's new job search tool. Find the right opportunity, create a perfect resume, track your application
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                Get Started—It's free
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Search Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center border-2 border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-l-8 border-r-0 border-b-8 border-l-white border-b-transparent border-t-8 border-t-transparent ml-1"></div>
              </div>
              <p className="text-gray-600 text-lg">Job Search Demo Video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Message Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              This is not a job board. We've got over{' '}
              <span className="text-blue-600">1.3M jobs</span> sourced directly from company websites—not those{' '}
              <span className="text-red-600">"resume black holes"</span> like LinkedIn or Indeed
            </h2>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Kolab Job Search is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've revolutionized job searching by connecting you directly with real opportunities from company websites.
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

      {/* Job Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Jobs by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse thousands of opportunities across different industries and find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-blue-600 font-medium">{category.count.toLocaleString()} jobs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Job Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover hand-picked opportunities from top companies hiring right now.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredJobs.map((job, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {job.posted}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    💰 {job.salary}
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border border-blue-600 hover:bg-blue-50 transition-colors">
              View All Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Skip the Job Board Noise
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get direct access to real opportunities without the competition and fake postings of traditional job boards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{benefit.title}</h3>
                  <p className="text-blue-100">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Land your dream job in four simple steps
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Real Jobs</h3>
                <p className="text-gray-600">Browse over 1.3M jobs sourced directly from company websites. No fake postings, no spam.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Perfect Resume</h3>
                <p className="text-gray-600">Use our AI resume builder to create a tailored resume for each application. Optimize for ATS and keywords.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Applications</h3>
                <p className="text-gray-600">Keep track of all your applications in one place. Never miss a follow-up or interview opportunity.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Hired</h3>
                <p className="text-gray-600">With better visibility and direct applications, you'll get more interviews and land your dream job faster.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have found better opportunities with Kolab's job search tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              Start Job Search
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors border border-blue-500">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}