import React from 'react';
import { Star, CheckCircle, ArrowRight, FileText, Download, Mail, Target, Briefcase, Sparkles } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';

export default function AICoverLetterBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero Section */}
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 pt-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="mb-4">
                    <span className="inline-block px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
                      Cover Letter Builder
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    The Most Powerful <span className="text-amber-400">AI Cover Letter Builder</span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Generate a cover letter based on your resume. Simply enter a targeted job title and company and watch your cover letter write itself in seconds.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors text-center">
                    Create your cover letter
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="relative">
                  {/* Main Interface Mockup */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-600 mb-2">Resume Upload</div>
                        <div className="h-24 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="text-xs text-amber-600 mb-2">Job Details</div>
                        <div className="space-y-2">
                          <div className="h-3 bg-amber-200 rounded w-full"></div>
                          <div className="h-3 bg-amber-100 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-xs text-green-600 mb-2">Generated Cover Letter Preview</div>
                      <div className="space-y-1">
                        <div className="h-2 bg-green-200 rounded w-full"></div>
                        <div className="h-2 bg-green-100 rounded w-5/6"></div>
                        <div className="h-2 bg-green-100 rounded w-4/5"></div>
                        <div className="h-2 bg-green-100 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Logos */}
            <div className="mt-20">
              <div className="text-center mb-8">
                <p className="text-gray-400 font-medium">Engineered to get you hired at top companies</p>
              </div>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-gray-500 font-semibold">Facebook</div>
                <div className="text-gray-500 font-semibold">Deloitte</div>
                <div className="text-gray-500 font-semibold">Atlassian</div>
                <div className="text-gray-500 font-semibold">LinkedIn</div>
                <div className="text-gray-500 font-semibold">Microsoft</div>
                <div className="text-gray-500 font-semibold">HubSpot</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="bg-gray-50">
        <div className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Here&apos;s how Rezum AI Cover Letter Writer works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Writing a tailored cover letter for each position is the biggest pain in the ass of the entire job searching process.
                Rezum has now automated the process to just mere seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1 */}
        <div className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
                    <span className="text-xl font-bold text-amber-600">Step 1</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl lg:text-4xl font-bold text-gray-900">
                    Job Description
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The created cover letter will reference your resume experiences in how they tie to the specific job post.
                  </p>
                </div>
                <div className="pt-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">
                    Create your cover letter now
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Job Description Input
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-48">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          &quot;We are seeking a Senior Marketing Manager with 5+ years of experience in digital campaigns,
                          data analytics, and team leadership. The ideal candidate will drive marketing strategy,
                          manage cross-functional teams, and deliver measurable results...&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">AI Keyword Targeting</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Digital Marketing</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Data Analytics</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Team Leadership</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Strategy</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Cross-functional</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">ROI</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <span className="text-xl font-bold text-blue-600">Step 2</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl lg:text-4xl font-bold text-gray-900">
                    Keywords
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    This will help the cover letter builder create an accurate letter with the information.
                  </p>
                </div>
                <div className="pt-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">
                    Create your cover letter now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <span className="text-xl font-bold text-green-600">Step 3</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl lg:text-4xl font-bold text-gray-900">
                    Generate
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The cover letter will generate in just a few seconds. You can edit after if you need.
                  </p>
                </div>
                <div className="pt-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">
                    Create your cover letter now
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">AI Cover Letter Writer</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-56 space-y-3">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Letter Templates Section */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Cover Letter Templates & Samples</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Over 255 Cover Letter Samples
                </h2>
              </div>
              <a
                href="/sign-up"
                className="bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-600 transition-colors"
              >
                Create your cover letter now
              </a>
            </div>
          </div>

          {/* Featured Sample */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                  <Mail className="h-24 w-24 text-amber-500" />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">
                  Pick your sample
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Get access to an extensive library of 255 professional cover letter templates across various industries and roles. This is a great starting point for creating a personalized cover letter.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors text-center">
                    Create cover letter now
                  </a>
                  <a href="/cover-letter-templates" className="bg-transparent text-white px-6 py-3 rounded-xl font-semibold border border-gray-600 hover:bg-gray-800 transition-colors text-center flex items-center justify-center">
                    View more samples
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Administrative Assistant', category: 'Admin', color: 'from-blue-100 to-blue-200', iconColor: 'text-blue-500' },
              { title: 'Machine Learning Engineer', category: 'Tech', color: 'from-green-100 to-green-200', iconColor: 'text-green-500' },
              { title: 'Registered Nurse', category: 'Healthcare', color: 'from-red-100 to-red-200', iconColor: 'text-red-500' },
              { title: 'Software Engineer', category: 'Tech', color: 'from-purple-100 to-purple-200', iconColor: 'text-purple-500' }
            ].map((template, index) => (
              <a href="/sign-up" key={index} className="block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className={`h-48 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                    <Mail className={`h-16 w-16 ${template.iconColor}`} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.category} Template</p>
                    <div className="text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center">
                      Use this sample <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Reviews, Reviews & Reviews</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Ensure perfection with a human review
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Need another opinion? No problem. You have multiple options with Rezum to ensure you get
                  the review you need to build a cover letter that&apos;s top candidate material.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-gray-700">Integrated best-practice video guides</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-gray-700">Submit your document for a human review</p>
                </div>
              </div>

              <div className="pt-4">
                <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors inline-block">
                  Create your cover letter now
                </a>
              </div>
            </div>

            <div className="relative">
              {/* Main Interface */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-semibold">Ready for Review</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Grammar Check</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Formatting</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Content Flow</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Format & Design */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Font Selection</span>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Professional Sans</option>
                    <option>Classic Serif</option>
                    <option>Modern Clean</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Accent Color</span>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-orange-600"></div>
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Format & Design</span>
              <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Generated professionally designed cover letters
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Create a job-winning cover letter online that reads well and looks beautifully simple.
                Your cover letter&apos;s design is automatically formatted into an optimized layout that meets industry standards.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Choose professional cover letter fonts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Add subtle color accents to match your resume</span>
                </li>
              </ul>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Download Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Download types</span>
              <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Download your cover letter any way you need it
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Get your cover letter in the format required. All it takes is a few clicks.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Download in a PDF file format</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Download in a Word DOCX file format</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Save to Google Drive</span>
                </li>
              </ul>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center">
                <Download className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Multiple Export Options</h4>
                <div className="space-y-2">
                  <button className="w-full bg-orange-100 text-orange-700 py-2 rounded font-medium">
                    Download PDF
                  </button>
                  <button className="w-full bg-blue-100 text-blue-700 py-2 rounded font-medium">
                    Download Word
                  </button>
                  <button className="w-full bg-green-100 text-green-700 py-2 rounded font-medium">
                    Save to Drive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Cover Letter Builder</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Job Seekers Love Using Our AI Cover Letter Builder
            </h2>
            <p className="text-xl text-gray-600">We&apos;re pretty sure you&apos;ll love it too.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                &quot;Rezum AI is an awesome AI-based cover letter builder that includes templates to help you design
                a cover letter that is sure to check the boxes when it comes to applicant tracking systems.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">AS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ashley Stahl</div>
                  <div className="text-gray-600">Career Contributor</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                &quot;For some reason, I struggled a lot with choosing a format for my cover letter. With Rezum,
                I was able to simply input data, check out the preview, and know that it will be formatted correctly.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">JM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Job Seeker</div>
                  <div className="text-gray-600">Verified User</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Support</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about using Rezum&apos;s AI Writer.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  What Are AI Credits?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Rezum AI Writer is powered by advanced AI technology from leading providers. AI credits are used to generate
                high-quality cover letter content tailored to your specific needs and job requirements.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  How Does Our AI Work?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Rezum partnered with leading AI providers to use advanced neural networks. These models are trained on successful cover letters and best practices from our experience and database of cover letter content. Integrating this AI into Rezum, we are able to transfer expert-quality cover letter writing at almost no cost.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  How Do I Get AI Credits?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                You can get credits in one of two ways: Subscribing to Rezum Pro: We&apos;ll give you 100,000 AI Credits to use for content each month. By purchasing more AI Credits: You can also buy AI Credit directly without subscribing.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Where Do I Use Rezum AI Writer?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                <a href="/sign-up" className="text-amber-600 hover:text-amber-700 font-medium">
                  https://app.rezum.ai
                </a> - First you&apos;ll need to create a free Rezum account. The Rezum AI Writer is integrated throughout the cover letter creation process, from initial drafting to final polish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}