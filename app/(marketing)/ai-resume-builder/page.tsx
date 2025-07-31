import React from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, Target } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import FaqSection from '@/components/marketing/FaqSection';
import CtaSection from '@/components/marketing/CtaSection';
import Footer from '@/components/marketing/Footer';

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
      <section className="bg-gray-50">
        <div className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="mb-4">
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">How it works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                A new kind of <span className="text-amber-500">AI Resume Builder</span>
                <br />Powered by ChatGPT
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                You&apos;re great at your job. You don&apos;t need to be great at writing resumes. 
                That&apos;s what we&apos;re here for—with the most advanced resume-writing AI to do the heavy lifting for you.
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="pb-20 md:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 font-semibold text-sm mb-4">
                      Step 1
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Fill out Some Basic Info
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      Tell us your field of work and level of experience. If you&apos;re targeting a particular job, 
                      paste the description. This way, the AI Resume Builder will know what to highlight.
                    </p>
                    <a href="/sign-up" className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block hover:bg-amber-600 transition-colors">
                      Create your resume now
                    </a>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <div className="absolute -right-4 -bottom-4 w-full h-full bg-amber-100 rounded-2xl opacity-20"></div>
                    <Image
                      src="/images/ai-resume-builder/howitworks-1.png"
                      alt="Fill out Basic Information"
                      width={500}
                      height={357}
                      className="relative rounded-2xl shadow-2xl border border-gray-200"
                      style={{
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="pb-20 md:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2">
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 font-semibold text-sm mb-4">
                      Step 2
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Add Your Work History
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      Start with the job title and the company name. Writer&apos;s block? Easy. 
                      Our carefully trained AI model will suggest strong bullet points that match your career profile.
                    </p>
                    <a href="/sign-up" className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block hover:bg-amber-600 transition-colors">
                      Create your resume now
                    </a>
                  </div>
                </div>
                <div className="order-1">
                  <div className="relative">
                    <div className="absolute -left-4 -bottom-4 w-full h-full bg-blue-100 rounded-2xl opacity-20"></div>
                    <Image
                      src="/images/ai-resume-builder/howitworks-2.png"
                      alt="Add Work History with AI"
                      width={700}
                      height={500}
                      className="relative rounded-2xl shadow-2xl border border-gray-200"
                      style={{
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 font-semibold text-sm mb-4">
                      Step 3
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Get Detailed Feedback
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      The Rezum AI Resume Builder will tell you exactly what to improve to take your resume 
                      from solid to job-winning. You&apos;ll know what keywords to use and how to optimize 
                      your document for readability.
                    </p>
                    <a href="/sign-up" className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block hover:bg-amber-600 transition-colors">
                      Create your resume now
                    </a>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <div className="absolute -right-4 -bottom-4 w-full h-full bg-green-100 rounded-2xl opacity-20"></div>
                    <Image
                      src="/images/ai-resume-builder/howitworks-3.png"
                      alt="Get Detailed Feedback"
                      width={700}
                      height={500}
                      className="relative rounded-2xl shadow-2xl border border-gray-200"
                      style={{
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>
              </div>
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

      {/* Resume Examples Section */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="max-w-4xl">
              <div className="mb-4">
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">Resume Examples</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Over <span className="text-amber-500">900 Sample Resumes</span> You Can Start with
              </h2>
            </div>
          </div>

          <div className="mb-16 hidden md:block">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="relative">
                <Image
                  src="/images/samples/featured-sample.png"
                  alt="Modern Resume Template"
                  width={850}
                  height={1100}
                  className="rounded-lg border border-gray-700 shadow-xl"
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Need a reference point?</h3>
                <p className="text-lg text-gray-300 mb-8">
                  Browse our list of sample resumes for 350+ most popular roles. Find one that matches your desired job title, 
                  see how it&apos;s done, and steal some good ideas (we won&apos;t tell).
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold inline-block hover:bg-amber-600 transition-colors">
                    Create my resume
                  </a>
                  <a href="/resume-templates" className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold inline-flex items-center hover:bg-gray-800 transition-colors">
                    View more samples
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tech Resume 1 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <a href="/sign-up" className="block">
                <div className="relative h-64 bg-white border border-gray-700">
                  <Image
                    src="/images/samples/tech-1.png"
                    alt="Software Engineer Resume"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </a>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Software Engineer</h3>
                <a href="/sign-up" className="text-amber-500 font-semibold inline-flex items-center hover:text-amber-400">
                  Use this sample
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Business Resume 1 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <a href="/sign-up" className="block">
                <div className="relative h-64 bg-white border border-gray-700">
                  <Image
                    src="/images/samples/business-1.png"
                    alt="Business Analyst Resume"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </a>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Business Analyst</h3>
                <a href="/sign-up" className="text-amber-500 font-semibold inline-flex items-center hover:text-amber-400">
                  Use this sample
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Creative Resume 1 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <a href="/sign-up" className="block">
                <div className="relative h-64 bg-white border border-gray-700">
                  <Image
                    src="/images/samples/creative-1.png"
                    alt="Creative Director Resume"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </a>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Creative Director</h3>
                <a href="/sign-up" className="text-amber-500 font-semibold inline-flex items-center hover:text-amber-400">
                  Use this sample
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Tech Resume 2 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <a href="/sign-up" className="block">
                <div className="relative h-64 bg-white border border-gray-700">
                  <Image
                    src="/images/samples/tech-2.png"
                    alt="Data Scientist Resume"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </a>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Data Scientist</h3>
                <a href="/sign-up" className="text-amber-500 font-semibold inline-flex items-center hover:text-amber-400">
                  Use this sample
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}