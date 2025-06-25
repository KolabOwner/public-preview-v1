import React from 'react';
import { Star, CheckCircle, ArrowRight, Users, Target, FileText, Zap, Shield, Download } from 'lucide-react';
import MainNavbar from '@/components/layout/main-navbar';

export default function AIResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      {/* Header/Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                AI Resume Builder
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional
              <span className="text-blue-600 block">AI Resume Builder</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create compelling resumes that get noticed. Our AI technology helps you craft professional resumes 
              that pass ATS systems and impress hiring managers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                Build Your Resume
              </button>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border border-blue-600 hover:bg-blue-50 transition-colors">
                View Examples
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Trusted by professionals at leading companies</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">Microsoft</div>
                <div className="text-2xl font-bold text-gray-400">Google</div>
                <div className="text-2xl font-bold text-gray-400">Apple</div>
                <div className="text-2xl font-bold text-gray-400">Amazon</div>
                <div className="text-2xl font-bold text-gray-400">Meta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Smart Resume Building
              <span className="text-blue-600 block">Powered by AI</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology streamlines the resume creation process, 
              helping you build professional documents efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Information</h3>
              <p className="text-gray-600 mb-6">
                Provide your work experience, skills, and career goals. Upload an existing resume 
                or start fresh with our guided process.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Get Started →
              </button>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Enhancement</h3>
              <p className="text-gray-600 mb-6">
                Our AI analyzes your information and suggests improvements, optimizes keywords, 
                and ensures your resume meets industry standards.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Learn More →
              </button>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Results</h3>
              <p className="text-gray-600 mb-6">
                Download your polished resume in multiple formats. Get detailed feedback 
                and suggestions for continuous improvement.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                View Samples →
              </button>
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
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">AI Keyword Optimization</span>
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
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Try Now
              </button>
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
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Content Analysis</span>
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
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Analyze My Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Resume Templates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Professional Templates
              <span className="text-blue-600 block">For Every Industry</span>
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
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
                    Use Template <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Writing</h3>
              <p className="text-gray-600">
                Generate compelling bullet points and summaries with our advanced AI technology.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ATS Optimization</h3>
              <p className="text-gray-600">
                Ensure your resume passes applicant tracking systems with proper formatting.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-600" />
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
                of updating my resume with Hireable AI.&#34;
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
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Professional Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have enhanced their careers with Hireable AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Building Now
            </button>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-blue-600 transition-colors">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}