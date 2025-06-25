import React from 'react';
import { Star, CheckCircle, ArrowRight, FileText, Zap, Shield, Download, Mail, Target, Briefcase } from 'lucide-react';
import MainNavbar from '@/components/layout/main-navbar';

export default function AICoverLetterBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Cover Letter Builder
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The Most Powerful
              <span className="text-orange-600 block">AI Cover Letter Builder</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate a cover letter based on your resume. Simply enter a targeted job title and company 
              and watch your cover letter write itself in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors">
                Create your cover letter
              </button>
              <button className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg border border-orange-600 hover:bg-orange-50 transition-colors">
                View Examples
              </button>
            </div>
            
            {/* Hero Image Mockup */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-2xl p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Resume Input</div>
                    <div className="h-48 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Your Resume Data</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 mb-2">Generated Cover Letter</div>
                    <div className="h-48 bg-white rounded border border-orange-200 p-3 overflow-hidden">
                      <div className="space-y-2">
                        <div className="h-3 bg-orange-200 rounded w-3/4"></div>
                        <div className="h-3 bg-orange-100 rounded w-full"></div>
                        <div className="h-3 bg-orange-100 rounded w-5/6"></div>
                        <div className="h-3 bg-orange-100 rounded w-2/3"></div>
                        <div className="h-3 bg-orange-100 rounded w-4/5"></div>
                        <div className="h-3 bg-orange-100 rounded w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Here's how Hireable AI Cover Letter Writer works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Writing a tailored cover letter for each position is the biggest pain of the entire job searching process. 
              Hireable has now automated the process to just mere seconds.
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Job Description</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                The created cover letter will reference your resume experiences in how they tie to the specific job post.
              </p>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description Input
                </label>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 h-32">
                  <p className="text-sm text-gray-600">
                    "We are seeking a Senior Marketing Manager with experience in digital campaigns, 
                    analytics, and team leadership..."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 md:order-1 bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Keywords Extracted</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">Digital Marketing</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">Analytics</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">Team Leadership</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">Campaign Management</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Keywords</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                This will help the cover letter builder create an accurate letter with the information.
              </p>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Generate</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                The cover letter will generate in just a few seconds. You can edit after if you need.
              </p>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Generated Cover Letter</h4>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 h-40 overflow-hidden">
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/5"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Letter Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Cover Letter Templates & Samples</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Over 255 Cover Letter Samples
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get access to an extensive library of professional cover letter templates across various industries and roles.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Administrative Assistant', category: 'Admin' },
              { title: 'Machine Learning Engineer', category: 'Tech' },
              { title: 'Registered Nurse', category: 'Healthcare' },
              { title: 'Software Engineer', category: 'Tech' }
            ].map((template, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <Mail className="h-16 w-16 text-orange-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.category} Template</p>
                  <button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors flex items-center">
                    Use this sample <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            {/* Reviews & Human Review */}
            <div>
              <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Reviews, Reviews & Reviews</span>
              <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Ensure perfection with a human review
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Need another opinion? No problem. You have multiple options with Hireable to ensure you get 
                the review you need to build a cover letter that's top candidate material.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Integrated best-practice video guides</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Submit your document for a human review</span>
                </li>
              </ul>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Create your cover letter now
              </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="bg-orange-50 p-4 rounded mb-4">
                <div className="text-sm text-orange-600 mb-2">Review Status</div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700 font-medium">Ready for Review</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Grammar Check</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formatting</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Content Flow</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
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
                Your cover letter's design is automatically formatted into an optimized layout that meets industry standards.
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
            <p className="text-xl text-gray-600">We're pretty sure you'll love it too.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                "Hireable AI is an awesome AI-based cover letter builder that includes templates to help you design 
                a cover letter that is sure to check the boxes when it comes to applicant tracking systems."
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
                "For some reason, I struggled a lot with choosing a format for my cover letter. With Hireable, 
                I was able to simply input data, check out the preview, and know that it will be formatted correctly."
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Support</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about using Hireable's AI Writer.
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What Are AI Credits?
              </h3>
              <p className="text-gray-600">
                Hireable AI Writer is powered by advanced AI technology. AI credits are used to generate 
                high-quality cover letter content tailored to your specific needs.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How Does Our AI Work?
              </h3>
              <p className="text-gray-600">
                Hireable uses advanced neural networks trained on successful cover letters and best practices. 
                We've integrated this AI to transfer expert-quality cover letter writing at almost no cost.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How Do I Get AI Credits?
              </h3>
              <p className="text-gray-600">
                You can get credits by subscribing to Hireable Pro or purchasing AI Credits directly. 
                Pro subscribers get monthly credits included in their subscription.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to build your cover letter?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join over 3 million people who use Hireable to take control of their job search.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Create your cover letter
            </button>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-orange-600 transition-colors">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}