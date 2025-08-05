'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Zap, Users, Target, Sparkles, Copy, RotateCcw } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';

export default function ResumeBulletPointGenerator() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle || !responsibility) return;

    setIsGenerating(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sampleBullets = [
      `Managed ${responsibility.toLowerCase()} initiatives resulting in improved team productivity and operational efficiency`,
      `Implemented strategic ${responsibility.toLowerCase()} processes that enhanced company-wide performance metrics`,
      `Led ${responsibility.toLowerCase()} projects contributing to organizational growth and stakeholder satisfaction`,
      `Developed and executed ${responsibility.toLowerCase()} strategies that delivered measurable business impact`
    ];

    setGeneratedBullets(sampleBullets);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
                <span className="text-gray-900">Resume Bullet Point Generator</span>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Free AI Resume Bullet Point Generator
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Instantly create impactful, professional bullet points tailored to your target role. Save time, impress recruiters, and showcase your proudest achievements with numbers.
                </p>
                <div className="pt-4">
                  <Link 
                    href="/sign-up" 
                    className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors inline-block"
                  >
                    Generate Bullet Points with AI
                  </Link>
                </div>
              </div>

              {/* Upload Area */}
              <div className="flex items-center space-x-3 bg-white rounded-lg px-5 py-3.5 border-2 border-dashed border-gray-300 hover:border-amber-400 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload your work experience</p>
                  <p className="text-xs text-gray-500">PDF, DOC or paste text</p>
                </div>
              </div>
            </div>

            {/* Right Images */}
            <div className="relative">
              <div className="relative max-w-lg mx-auto">
                {/* Results Dialog Interface - Top Left */}
                <div className="absolute top-24 -left-8 w-80 h-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                  <Image
                    src="/images/resume-bullet-point-generator/results-dialog-interface.png"
                    alt="Results Dialog Interface"
                    width={1000}
                    height={384}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Main Resume Document - Center */}
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <Image
                    src="/images/keyword-scanner/techvision-resume-stacked.png"
                    alt="Resume Document"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Compact Bullet Interface - Bottom Right */}
                <div className="absolute -bottom-4 -right-8 w-48 h-20 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                  <Image
                    src="/images/resume-bullet-point-generator/compact-bullet-interface.png"
                    alt="Compact Bullet Interface"
                    width={532}
                    height={194}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Generated Results */}
      {generatedBullets.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your AI-Generated Bullet Points
              </h2>
              <p className="text-lg text-gray-600">
                Click to copy any bullet point to your clipboard
              </p>
            </div>
            <div className="space-y-4">
              {generatedBullets.map((bullet, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => copyToClipboard(bullet)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-900 flex-1 text-lg">{bullet}</p>
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setGeneratedBullets([])}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Generate New Bullets
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">
                Strong bullet points = stronger resume
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Write Better Resume Bullet Points Faster with AI
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
                      src="/images/keyword-scanner/techvision-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Generate Bullet Interface Overlay */}
                  <div className="absolute top-8 -left-4 w-56 h-28 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                    <Image
                      src="/images/resume-bullet-point-generator/generate-bullet-interface.png"
                      alt="Generate Bullet Interface"
                      width={640}
                      height={308}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Bullet Points Focused on Tangible Results
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Achievements that emphasize results will set you apart as a candidate. Each bullet point uses proven resume writing techniques: action verbs, quantifiable impact, and clear structure.
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
                      src="/images/keyword-scanner/techvision-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Keyword Tailoring Interface Generating Overlay */}
                  <div className="absolute top-24 -left-4 w-64 h-30 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                    <Image
                      src="/images/resume-bullet-point-generator/keyword-tailoring-interface-generating.png"
                      alt="Keyword Tailoring Interface Generating"
                      width={800}
                      height={370}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Role‑Specific Bullet Suggestions
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Just enter your job title and company—Rezum AI will suggest bullet points that reflect your actual responsibilities and achievements.
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
                      src="/images/keyword-scanner/techvision-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Miniature Resume Overlay */}
                  <div className="absolute top-8 -right-4 w-32 h-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                    <Image
                      src="/images/keyword-scanner/techvision-resume-stacked.png"
                      alt="Miniature Resume"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  One‑Click Edits & Regenerations
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Don&apos;t like the result? Instantly re‑generate new versions or tweak suggestions manually until they fit your voice perfectly.
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
              Start writing for free
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
                <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Step‑by‑step walkthrough</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Resume Bullet Generator: How It Works
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
                    Enter Your Role and Company
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Tell the AI what position you held and where you worked. This helps generate bullet points with the right context and tone.
                  <br /><br />
                  The more specific your input (like &ldquo;Marketing Manager at Google&ldquo;), the smarter the AI&apos;s results will be. Use common job titles for best accuracy.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/techvision-resume-stacked.png"
                        alt="Step 1: Enter Role"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Upload Interface Overlay */}
                    <div className="absolute top-0 left-0 -ml-8 -mt-8 w-3/4 h-3/4 z-20">
                      <Image
                        src="/images/resume-bullet-point-generator/upload-interface.png"
                        alt="Upload Interface"
                        width={1200}
                        height={512}
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
                    Generate Your First Bullet Point
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Click the &ldquo;Generate Bullet&ldquo; button. The AI instantly writes a compelling bullet point tailored to your role—no need to write from scratch.
                  <br /><br />
                  You&apos;ll get a result that includes strong action verbs, measurable impact, and concise phrasing optimized for recruiters and ATS.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Image */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/techvision-resume-stacked.png"
                        alt="Step 2: Generate Bullet"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Generate Bullet Interface Overlay */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-8 w-1/2 h-1/3 z-20">
                      <Image
                        src="/images/resume-bullet-point-generator/generate-bullet-interface.png"
                        alt="Generate Bullet Interface"
                        width={640}
                        height={308}
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
                    Apply, Edit, or Re‑Generate
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Happy with your bullet? Click &ldquo;Apply Suggestion&ldquo; to save it to your resume. Need a different tone or phrasing? Regenerate a new option instantly.
                  <br /><br />
                  Edit any suggestion to fine‑tune the wording or align with your personal style.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors inline-block">
                    Try it free
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
                        src="/images/keyword-scanner/techvision-resume-stacked.png"
                        alt="Step 3: Apply or Edit"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Bullet Points Interface Overlay */}
                    <div className="absolute top-4 -right-8 w-4/5 h-2/3 z-20">
                      <Image
                        src="/images/resume-bullet-point-generator/bullet-points-interface.png"
                        alt="Bullet Points Interface"
                        width={1200}
                        height={432}
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
                        Frequently Asked Questions (FAQs)
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
                        What does the bullet point generator actually do?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      It uses AI to write professional bullet points for your resume based on your job title and company. These bullet points follow best practices for resume writing: they&apos;re concise, achievement‑focused, and tailored to your role.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How do I start generating bullet points?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Just enter your job title and company, then hit &ldquo;Generate Bullet.&ldquo; The tool will instantly return a suggested line. If you want something different, regenerate until it feels right. When you&apos;re satisfied, apply the suggestions.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Can I customize the bullet point after it&apos;s generated?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Yes. Every bullet is editable. You can reword any part, add data or accomplishments, or adjust the tone. You&apos;re in full control, and the tool helps you get 90% there instantly.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Will the bullet points sound generic or repetitive?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      No. Each output is tailored to your input, with unique phrasing and structure. The AI varies its sentence patterns and focuses on accomplishments relevant to your role and industry. For best results, be as specific about your current/past job as you can.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Do I need to write anything else to make it work?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Nope. Just job title and company. If you want to include specific tasks or achievements, you can, but it&apos;s not required (although recommended). The AI is designed to work with minimal input, but the more detailed your input, the better the output.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        How do I save the best version of a bullet point?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Once you find a version you like, click Apply Suggestion. This adds it to your resume so you can keep building without missing a beat.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Is the bullet generator free to use?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Yes, you can generate and re‑generate bullet points for free. There&apos;s no cost to use the core functionality.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Can I use this for any kind of job?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Yes, it works across all industries: tech, healthcare, education, retail, you name it. The AI adapts to different job types and tones depending on your input.
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