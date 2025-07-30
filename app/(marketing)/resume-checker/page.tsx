// app/resume-checker/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';

export default function ResumeCheckerPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Header Section */}
      <header className="bg-gray-50 min-h-screen flex items-center">
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
                <span className="text-gray-900">Resume Checker</span>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  ATS Resume Checker: Free & Instant
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Use this free ATS resume checker & scanner to see if your resume is compatible with today&apos;s ATS software. Make sure you&apos;re not sabotaging your chances with a poorly formatted resume and get tips on best practices you should follow.
                </p>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Image
                        src="/images/keyword-scanner/gauge.svg"
                        alt="Gauge Icon"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
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
                {/* Main Resume Document - Center */}
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <Image
                    src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                    alt="Resume Document"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Perfect Score Gauge Interface - Bottom Right */}
                <div className="absolute -bottom-4 -right-8 w-52 h-44 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                  <Image
                    src="/images/resume-checker/perfect-score-gauge-interface.png"
                    alt="Perfect Score Gauge Interface"
                    width={700}
                    height={612}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Expanded Feedback Interface - Left Side */}
                <div className="absolute top-4 -left-16 w-48 h-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/resume-checker/expanded-feedback-interface.png"
                    alt="Expanded Feedback Interface"
                    width={640}
                    height={904}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">
                Follow best practices to avoid being screened out
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Most Comprehensive Resume Checker Ever
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <div className="relative w-64 h-80">
                  {/* Main Resume Document */}
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <Image
                      src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Bullet Points Feedback Overlay */}
                  <div className="absolute top-8 -left-4 w-48 h-36 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/resume-checker/bullet-points-feedback-interface.png"
                      alt="Bullet Points Feedback Interface"
                      width={640}
                      height={492}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real-time content analysis
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Compare your resume&apos;s language to industry standards, highlighting missing skills, certifications, and power phrases employers demand. For a more detailed analysis, paste your target job description and check if your resume shows a strong fit.
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
                      src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Resume Checklist Overlay */}
                  <div className="absolute top-8 -left-4 w-36 h-60 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/resume-checker/resume-checklist-interface.png"
                      alt="Resume Checklist Interface"
                      width={700}
                      height={1194}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ATS-compatibility guardrails
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Detect hidden formatting issues—like improper fonts, tables, and headers—that can break ATS parsing. Fix them instantly with clear, automated recommendations.
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
                      src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Score Gauge Overlay */}
                  <div className="absolute top-8 -right-4 w-52 h-36 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <Image
                      src="/images/resume-checker/score-gauge-interface.png"
                      alt="Score Gauge Interface"
                      width={700}
                      height={484}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Easy, actionable tips
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Follow proven resume guidelines for section order, bullet style, and length. The resume checker flags mistakes and shows you how to better align with recruiter expectations. All suggestions you get are clearly explained and can be implemented in seconds.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="bg-navy-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-navy-800 transition-colors inline-block"
            >
              Check my resume for free
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
                <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Step-by-step walkthrough</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How the Free ATS Resume Checker Works
              </h2>
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
                    Upload or Paste Your Resume
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Drag & drop your existing document, paste plain text, or import from LinkedIn. Our checker reads every section—contact info, work history, education—so nothing slips through the cracks.
                  <br /><br />
                  Get detailed formatting and content insights instantly. No template? Build from scratch, then scan to ensure perfect structure.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Check my resume for free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 1: Upload Resume"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Upload Interface Overlay - Outside of overflow container */}
                    <div className="absolute top-0 left-0 -ml-8 -mt-8 w-4/5 h-2/5 z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                        <Image
                          src="/images/resume-checker/upload-interface.png"
                          alt="Upload Interface"
                          width={1200}
                          height={512}
                          className="w-full h-full object-contain"
                        />
                      </div>
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
                    Run the 23‑Point ATS Analysis
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  The tool evaluates your resume against 23 critical ATS checkpoints—from file type and font size to keyword density and section headers. Each criterion is scored so you know exactly where to improve.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Check my resume for free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 2: ATS Analysis"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Expanded Feedback Interface Overlay - Outside of overflow container */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-8 w-2/5 h-3/4 z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                        <Image
                          src="/images/resume-checker/expanded-feedback-interface.png"
                          alt="Expanded Feedback Interface"
                          width={640}
                          height={904}
                          className="w-full h-full object-contain"
                        />
                      </div>
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
                    Review & Apply Recommendations
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  View a clear report with prioritized fixes: high-impact alerts for urgent formatting and keyword errors are marked in red. Mid-impact content enhancements are shown in yellow. Click any suggestion to apply changes in seconds.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Check my resume for free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 3: Apply Recommendations"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Score Gauge Interface Overlay - Outside of overflow container */}
                    <div className="absolute top-0 left-0 -mt-32 -ml-16 w-4/5 h-2/5 z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                        <Image
                          src="/images/resume-checker/score-gauge-interface.png"
                          alt="Score Gauge Interface"
                          width={700}
                          height={484}
                          className="w-full h-full object-contain"
                          priority
                        />
                      </div>
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

      {/* Resume Templates Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Just Released</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  New resume templates
                </h2>
              </div>
              <Link 
                href="/sign-up" 
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
              >
                Create your resume now
              </Link>
            </div>
          </div>

          {/* Template Carousel */}
          <div className="relative">
            <div className="flex overflow-x-auto space-x-8 pb-4 scrollbar-hide">
              {/* Standard Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/StandardTemplate.png"
                        alt="Standard Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Ultimate readability and well-organized layout. Highlights what matters the most. A safe pick for all jobs across all industries.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Modern Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/ModernTemplate.png"
                        alt="Modern Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Clean contemporary design with subtle styling elements. Perfect for tech roles and forward-thinking companies.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Compact Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/CompactTemplate.png"
                        alt="Compact Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Compact</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Maximizes page space for dense information. Ideal for seasoned professionals with extensive experience to showcase.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bold Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/BoldTemplate.png"
                        alt="Bold Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Bold</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Stand out with strategic use of color and typography. Perfect for creative industries and design-focused roles.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <svg key={i + 3} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Alternative Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/AlternativeTemplate.png"
                        alt="Alternative Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Alternative</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Unique layout with distinctive section organization. Ideal for professionals seeking a memorable first impression.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section_faq1 enterprise py-20 bg-white">
        <div className="padding-global">
          <div className="container-small-3 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="padding-section-large-2">
              <div className="margin-bottom margin-medium text-center mb-16">
                <div className="text-align-center">
                  <div className="max-width-large">
                    <div className="margin-bottom margin-xsmall mb-2">
                      <div className="text-weight-semibold-6 text-color-primary600 text-amber-600 font-semibold text-sm uppercase tracking-wide">
                        Support
                      </div>
                    </div>
                    <div className="margin-bottom margin-small mb-4">
                      <h2 className="heading-style-h2 text-3xl md:text-4xl font-bold text-gray-900">
                        Frequently Asked Questions (Free ATS Resume Checker)
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-layout-grid faq4_list enterprise grid gap-8">
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        What sets this resume checker apart from basic keyword tools?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our comprehensive system evaluates both technical formatting (file structure, fonts, headers) and strategic content (skills alignment, power words, section organization) using 23 proven ATS criteria. This holistic approach ensures your resume is both technically scannable and strategically optimized.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How should I address formatting problems identified by the scanner?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Once you upload your document, any structural issues—like embedded graphics, complex tables, or incompatible fonts—are clearly marked. Each flagged item includes specific guidance and instant fixes to eliminate ATS parsing barriers.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How reliable are the content recommendations?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Extremely reliable. Our analysis engine compares your resume against current industry standards and real job postings to recommend specific skills, credentials, and professional terminology. Each suggestion is prioritized by potential impact on your application success.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Is the Kolab ATS Resume Checker completely free?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Absolutely. Access unlimited resume scans with complete coverage of all 23 assessment points and detailed improvement reports. No payment information or subscription required.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Which document types can I upload?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Submit resumes in DOCX, PDF, or text format. Our scanner intelligently processes each file type to deliver consistent, thorough analysis regardless of your original format.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Do I need any special knowledge to operate this checker?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      No expertise required. Simply upload or paste your resume, click &ldquo;Analyze,&ldquo; and receive your detailed report. Every recommendation includes clear, step-by-step implementation guidance.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How quickly will I receive my analysis?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Analysis completes instantly—usually within 3-5 seconds of submission. You&apos;ll receive an immediate detailed scorecard with prioritized recommendations for improvement.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Can I analyze different resume versions for various positions?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Definitely. Perform unlimited scans and maintain multiple analysis reports. Compare different versions or customize your resume for specific applications while ensuring consistent ATS compatibility and content optimization.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Does using this checker ensure I&apos;ll get interviews?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      While no service can guarantee interviews, following ATS optimization principles dramatically increases your resume&apos;s visibility to hiring managers. Users consistently report improved response rates after implementing our parsing and content recommendations.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How do you protect my personal information?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Your privacy is paramount. All document uploads use enterprise-grade encryption during transfer and storage, are processed on protected servers, and are never disclosed to external parties. You maintain complete ownership of your information.
                    </p>
                  </div>
                </div>
              </div>
            </header>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}