import React from 'react';
import Image from 'next/image';
import { Star, CheckCircle, ArrowRight, Target, FileText, Zap, Shield, Download } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function AIResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      {/* Header/Hero Section */}
      <section className="bg-navy-900 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white">
                AI Resume Builder
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              The Best Free
              <span className="text-amber-400 block">AI Resume Builder</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              You&apos;ll never stare at a blank screen again. Meet our new-gen AI Resume Builder that writes the perfect resume for you. The kind of resume recruiters actually read. The kind that gets you hired.
            </p>

            {/* Hero Image */}
            <div className="mb-12 flex justify-center">
              <Image
                src="/images/ai-resume-builder/heroimage.png"
                alt="AI Resume Builder Hero"
                width={1400}
                height={800}
                quality={95}
                priority
                className="rounded-lg shadow-2xl"
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <a href="/sign-up" className="bg-amber-500 text-white px-10 py-5 rounded-xl font-bold text-xl text-center inline-block">
                Create my free resume
              </a>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-400 mb-8 font-medium">Engineered to get you hired at top companies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">Facebook</span>
                </div>
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">Deloitte</span>
                </div>
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">Atlassian</span>
                </div>
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">LinkedIn</span>
                </div>
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">Microsoft</span>
                </div>
                <div className="h-8 flex items-center opacity-60">
                  <span className="text-2xl font-bold text-gray-300">HubSpot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Smart Resume Building
              <span className="text-amber-500 block">Powered by AI</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology streamlines the resume creation process, 
              helping you build professional documents efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-amber-500">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Information</h3>
              <p className="text-gray-600 mb-6">
                Provide your work experience, skills, and career goals. Upload an existing resume 
                or start fresh with our guided process.
              </p>
              <a href="/sign-up" className="text-amber-500 font-semibold">
                Get Started →
              </a>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-amber-500">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Enhancement</h3>
              <p className="text-gray-600 mb-6">
                Our AI analyzes your information and suggests improvements, optimizes keywords, 
                and ensures your resume meets industry standards.
              </p>
              <a href="/sign-up" className="text-amber-500 font-semibold">
                Learn More →
              </a>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-amber-500">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Results</h3>
              <p className="text-gray-600 mb-6">
                Download your polished resume in multiple formats. Get detailed feedback 
                and suggestions for continuous improvement.
              </p>
              <a href="/sign-up" className="text-amber-500 font-semibold">
                View Samples →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* AI Keyword Optimization */}
            <div>
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">AI Keyword Optimization</span>
              <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Optimize for Applicant Tracking Systems
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI ensures your resume includes relevant keywords and phrases that ATS systems 
                look for, increasing your chances of passing initial screenings.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Smart keyword suggestions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">ATS compatibility analysis</span>
                </li>
              </ul>
              <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold inline-block">
                Try Now
              </a>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="bg-gray-100 p-4 rounded mb-4">
                <div className="text-sm text-gray-600">AI Analysis</div>
                <div className="text-lg font-semibold text-gray-900">Keyword Match: 87%</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project Management</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Found</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leadership</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Found</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Analysis</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Suggested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Analysis Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">85</span>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">Resume Score</div>
                    <div className="text-sm text-gray-600">Based on 15 criteria</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Format & Structure</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Keyword Optimization</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Content Quality</span>
                    <Target className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">Content Analysis</span>
              <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Instant Feedback and Scoring
              </h3>
              <p className="text-gray-600 mb-6">
                Get real-time analysis of your resume with actionable feedback. Our AI evaluates 
                content quality, formatting, and optimization to help you improve.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Grammar and spelling checks</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Professional formatting standards</span>
                </li>
              </ul>
              <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold inline-block">
                Analyze My Resume
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">Resume Templates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Professional Templates
              <span className="text-amber-500 block">For Every Industry</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Template previews */}
            {[1, 2, 3].map((template) => (
              <div key={template} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Professional</h3>
                  <p className="text-gray-600 mb-4">Clean and contemporary design perfect for most industries.</p>
                  <a href="/sign-up" className="text-amber-500 font-semibold flex items-center">
                    Use Template <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Writing</h3>
              <p className="text-gray-600">
                Generate compelling bullet points and summaries with our advanced AI technology.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ATS Optimization</h3>
              <p className="text-gray-600">
                Ensure your resume passes applicant tracking systems with proper formatting.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Formats</h3>
              <p className="text-gray-600">
                Download your resume in PDF, Word, or other formats as needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <div className="flex justify-center items-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.8 out of 5 based on 1,200+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &#34;The AI suggestions were incredibly helpful. I landed three interviews within a week 
                of updating my resume with Kolab AI.&#34;
              </p>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-600">Software Engineer</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &#34;Simple to use and the results speak for themselves. My resume now passes ATS 
                systems and looks incredibly professional.&#34;
              </p>
              <div className="font-semibold text-gray-900">Michael Rodriguez</div>
              <div className="text-gray-600">Marketing Manager</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Professional Resume?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join thousands of professionals who have enhanced their careers with Kolab AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/sign-up" className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg text-center inline-block">
              Start Building Now
            </a>
            <a href="/sign-up" className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white text-center inline-block">
              View Examples
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}