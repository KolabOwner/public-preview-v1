'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Target, Sparkles, Play } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import FaqSection from '@/components/marketing/FaqSection';
import CtaSection from '@/components/marketing/CtaSection';
import Footer from '@/components/marketing/Footer';

export default function AIResumeSummaryGeneratorPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Header Section */}
      <header className="bg-gray-50 h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-amber-600 transition-colors">
                  All Tools
                </Link>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5"></path>
                </svg>
                <span className="text-gray-900">Resume Summary Generator</span>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Resume Summary Generator
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  The AI Resume Summary Generator will write you tailored, position-specific summaries in a matter of seconds.
                </p>
                <div className="pt-4">
                  <Link 
                    href="/sign-up" 
                    className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors inline-block"
                  >
                    Generate Your Summary Now
                  </Link>
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
                        <path d="M12 2L13.09 8.26L19.74 7.26L14.14 12.86L16.86 17.74L12 15L7.14 17.74L9.86 12.86L4.26 7.26L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <strong>Click</strong> or <strong>drop</strong> your PDF or DOC file here to instantly score your resume.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Images */}
            <div className="relative">
              <div className="relative max-w-lg mx-auto">
                {/* Skills Section - Top Left */}
                <div className="absolute -top-4 -left-8 w-48 h-32 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                  <Image
                    src="/images/ai-resume-summary-generator/skills-section.png"
                    alt="Skills Section"
                    width={180}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Main Charles Schwab Resume - Center */}
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <Image
                    src="/images/ai-resume-summary-generator/charles-schwab-resume-stacked.png"
                    alt="Charles Schwab Resume"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Complete AI Writer Interface - Bottom Right */}
                <div className="absolute -bottom-4 -right-8 w-56 h-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                  <Image
                    src="/images/ai-resume-summary-generator/complete-ai-writer-interface.png"
                    alt="Complete AI Writer Interface"
                    width={220}
                    height={140}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* AI Resume Summary Generator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">Loved by millions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Generate Your Resume Summary with AI
            </h2>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <div className="relative w-64 h-80">
                  {/* Main Resume Document */}
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <Image
                      src="/images/ai-resume-summary-generator/charles-schwab-resume-stacked.png"
                      alt="Charles Schwab Resume"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay Image */}
                  <div className="absolute top-8 -left-4 w-48 h-24 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/ai-resume-summary-generator/job-position.png"
                      alt="Job Position"
                      width={180}
                      height={100}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI-Powered Resume Summaries that Showcase Your Achievements
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The AI Resume Summary Generator transforms your experience into powerful professional summaries. Using advanced AI technology, we analyze your accomplishments and skills to create impactful summaries that highlight your career wins.
                  <br /><br />
                  The generator identifies your most relevant achievements and presents them in a compelling, recruiter-friendly format.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <div className="relative w-64 h-80">
                  {/* Main Resume Document */}
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <Image
                      src="/images/ai-resume-summary-generator/charles-schwab-resume-stacked.png"
                      alt="Charles Schwab Resume"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay Image */}
                  <div className="absolute top-8 -left-4 w-56 h-28 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/ai-resume-summary-generator/skills-section.png"
                      alt="Skills Section"
                      width={220}
                      height={140}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Write Summaries that Immediately Capture Attention
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Take advantage of the most visible section on your resume to quickly make an impression.
                  <br /><br />
                  Our Resume Summary Generator will help you sharpen your opening in a way that entices hiring managers to read further.
                  <br /><br />
                  Learn more about the <Link href="/ai-resume-builder" className="text-amber-600 font-semibold hover:text-amber-700">AI resume features</Link>.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <div className="relative w-64 h-80">
                  {/* Main Resume Document */}
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <Image
                      src="/images/ai-resume-summary-generator/charles-schwab-resume-stacked.png"
                      alt="Charles Schwab Resume"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay Image */}
                  <div className="absolute top-8 -right-4 w-64 h-28 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/ai-resume-summary-generator/compact-summary.png"
                      alt="Compact Summary"
                      width={240}
                      height={120}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Start Tailoring Your Resume Summary to the Job
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Every facet of your resume should be tailored to the individual position you're applying for. That includes your resume summary.
                  <br /><br />
                  Simply match your resume to a specific job posting, then generate a summary to customize and align it with the needs of the role.
                  <br /><br />
                  Your goal: to show the upfront value you can bring to the job.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors inline-block"
            >
              Generate Your Summary In Seconds
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section - Sticky Accordion */}
      <section className="bg-gray-50">
        {/* Header */}
        <div className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="mb-4">
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">How it works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Here&apos;s how Rezi AI <br />Summary Generator works
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Including a resume summary allows you to showcase your strongest assets right away. 
                Now, you can generate a job-specific summary in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Accordion Container */}
        <div className="relative">
          
          {/* Step 1 - Base Layer */}
          <div className="sticky top-0 h-[80vh] bg-navy-900 shadow-2xl rounded-t-[2rem] z-10 overflow-visible max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
              <div className="p-6 lg:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-600 font-semibold text-sm">
                    Step 1
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    Create your experience
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  You have the option to highlight a professional experience which allows for a tailored summary that reflects your unique career journey.
                  <br /><br />
                  The more career details you provide, the better your summary insights will be.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Create your summary now
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/ai-resume-summary-generator/placeholder-step-1.png"
                        alt="Step 1: Create your experience"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Upload Interface Overlay - Outside of overflow container */}
                    <div className="absolute top-0 left-0 -ml-8 -mt-8 w-3/4 h-3/4 z-20">
                      <Image
                        src="/images/ai-resume-summary-generator/upload-interface.png"
                        alt="Upload Interface"
                        width={1360}
                        height={672}
                        className="w-full h-full object-contain drop-shadow-lg"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Slides over Step 1 */}
          <div className="sticky top-0 h-[80vh] bg-navy-900 shadow-2xl rounded-t-[2rem] z-20 overflow-visible max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
              <div className="p-6 lg:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    Step 2
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    Add position details
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Next, add the job description that you want to pair with your resume for the summary generation.
                  <br /><br />
                  This should be a position that you&apos;re looking to apply for. You can paste the job description or select from your saved jobs.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Create your summary now
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/ai-resume-summary-generator/placeholder-step-1.png"
                        alt="Step 2: Add position details"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* AI Summary Writer Interface Overlay - Outside of overflow container */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-8 w-1/2 h-1/2 z-20">
                      <Image
                        src="/images/ai-resume-summary-generator/ai-summary-writer-interface.png"
                        alt="AI Summary Writer Interface"
                        width={1360}
                        height={672}
                        className="w-full h-full object-contain drop-shadow-lg"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Slides over Step 2 */}
          <div className="sticky top-0 h-[80vh] bg-navy-900 shadow-2xl rounded-t-[2rem] z-30 overflow-visible max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
              <div className="p-6 lg:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                    Step 3
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    Click &quot;AI Writer Ready&quot;
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  In the summary section, you&apos;ll see your AI-generated professional summary that highlights your best accomplishments and skills.
                  <br /><br />
                  The summary will generate in just a few seconds and can be edited to add your personal touch.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Create your summary now
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/ai-resume-summary-generator/placeholder-step-1.png"
                        alt="Step 3: AI Writer Ready"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Summary Text Overlay - Outside of overflow container */}
                    <div className="absolute top-0 left-0 -mt-32 -ml-16 w-[110%] h-[110%] z-20">
                      <Image
                        src="/images/ai-resume-summary-generator/summary-text.png"
                        alt="Summary Text"
                        width={1360}
                        height={672}
                        className="w-full h-full object-contain drop-shadow-lg"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extra spacing to allow final card to be fully visible */}
          <div className="h-64"></div>
        </div>
      </section>

      {/* AI Credits Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              All accounts include <span className="text-amber-500">6K free AI Credits</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We&apos;ve partnered up with OpenAI to use their GPT-3 technology. Every time you generate content, 
              we&apos;re buying "AI power" from OpenAI. To cover our costs, we have to charge you per usage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 50K Credits */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-amber-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">50K AI Credits</h3>
                <div className="text-4xl font-bold text-gray-900">$10
                  <span className="text-lg font-normal text-gray-500"> single payment</span>
                </div>
              </div>
              <Link href="/sign-up" className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold text-center block hover:bg-gray-200 transition-colors">
                Create your Rezi account
              </Link>
            </div>

            {/* Unlimited Credits */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlimited Credits</h3>
                <div className="text-4xl font-bold text-gray-900">$29
                  <span className="text-lg font-normal text-gray-500"> per month</span>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">You also get access to all Rezi Pro features:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Resumes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited Cover Letters
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    AI Keyword Targeting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real Time Content Analysis
                  </li>
                </ul>
              </div>
              <Link href="/sign-up" className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold text-center block hover:bg-amber-600 transition-colors">
                Create your Rezi account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <CtaSection 
        title='Ready to Create Your Perfect <span class="bg-gradient-to-r from-corporate-gold-600 to-corporate-amber-500 bg-clip-text text-transparent">Resume Summary?</span>'
        subtitle="Join thousands of professionals who got hired faster with AI-powered summaries"
        ctaText="Generate My Summary"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}