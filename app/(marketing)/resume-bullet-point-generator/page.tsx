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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Marketing Manager"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g., Tech Corp"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe what you did
                    </label>
                    <textarea
                      value={responsibility}
                      onChange={(e) => setResponsibility(e.target.value)}
                      placeholder="e.g., I managed social media accounts and created content that increased engagement"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!jobTitle || !responsibility || isGenerating}
                    className="w-full bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Bullet Points
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Images */}
            <div className="relative">
              <div className="relative max-w-lg mx-auto">
                {/* AI Writer Interface - Top Left */}
                <div className="absolute -top-4 -left-8 w-48 h-32 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                  <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-medium text-amber-700">AI Writer</div>
                    </div>
                  </div>
                </div>

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

                {/* Bullet Points Interface - Bottom Right */}
                <div className="absolute -bottom-4 -right-8 w-56 h-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-medium text-green-700">Generated Bullets</div>
                    </div>
                  </div>
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
                      src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Results Overlay */}
                  <div className="absolute top-8 -left-4 w-48 h-32 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Results Focus</div>
                      <div className="text-xs text-gray-600">• Increased sales by 35%</div>
                      <div className="text-xs text-gray-600">• Managed team of 12</div>
                      <div className="text-xs text-gray-600">• Saved $50K annually</div>
                    </div>
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
                      src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                      alt="Resume Document"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Role Specific Overlay */}
                  <div className="absolute top-8 -left-4 w-56 h-28 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Role-Specific</div>
                      <div className="text-xs text-gray-600">Marketing Manager</div>
                      <div className="text-xs text-gray-600">@ Tech Corp</div>
                      <div className="w-8 h-1 bg-amber-500 rounded mx-auto mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Role‑Specific Bullet Suggestions
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Just enter your job title and company—Kolab AI will suggest bullet points that reflect your actual responsibilities and achievements.
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
                  {/* Edit Options Overlay */}
                  <div className="absolute top-8 -right-4 w-40 h-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Quick Edits</div>
                      <div className="space-y-2">
                        <div className="w-full h-6 bg-gray-100 rounded flex items-center px-2">
                          <RotateCcw className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 ml-1">Regenerate</span>
                        </div>
                        <div className="w-full h-6 bg-gray-100 rounded flex items-center px-2">
                          <Copy className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600 ml-1">Copy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  One‑Click Edits & Regenerations
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Don't like the result? Instantly re‑generate new versions or tweak suggestions manually until they fit your voice perfectly.
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
                  The more specific your input (like "Marketing Manager at Google"), the smarter the AI's results will be. Use common job titles for best accuracy.
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
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 1: Enter Role"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Role Input Overlay */}
                    <div className="absolute top-0 left-0 -ml-8 -mt-8 w-3/4 h-3/4 z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-sm font-medium text-gray-900 mb-3">Enter Your Details</div>
                          <div className="space-y-2">
                            <div className="w-full h-8 bg-gray-100 rounded flex items-center px-3 text-xs text-gray-600">
                              Marketing Manager
                            </div>
                            <div className="w-full h-8 bg-gray-100 rounded flex items-center px-3 text-xs text-gray-600">
                              Google Inc.
                            </div>
                          </div>
                        </div>
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
                    Generate Your First Bullet Point
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Click the "Generate Bullet" button. The AI instantly writes a compelling bullet point tailored to your role—no need to write from scratch.
                  <br /><br />
                  You'll get a result that includes strong action verbs, measurable impact, and concise phrasing optimized for recruiters and ATS.
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
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 2: Generate Bullet"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* AI Generation Overlay */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-8 w-1/2 h-1/2 z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">AI Generated</div>
                          <div className="text-xs text-gray-500 mt-1">Bullet Point Ready</div>
                        </div>
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
                    Apply, Edit, or Re‑Generate
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Happy with your bullet? Click "Apply Suggestion" to save it to your resume. Need a different tone or phrasing? Regenerate a new option instantly.
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
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Step 3: Apply or Edit"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* Action Options Overlay */}
                    <div className="absolute top-0 left-0 -mt-32 -ml-16 w-[110%] h-[110%] z-20">
                      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-sm font-medium text-gray-900 mb-4">Action Options</div>
                          <div className="space-y-3">
                            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Apply to Resume
                            </button>
                            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
                              <RotateCcw className="w-4 h-4" />
                              Regenerate
                            </button>
                          </div>
                        </div>
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
                      It uses AI to write professional bullet points for your resume based on your job title and company. These bullet points follow best practices for resume writing: they're concise, achievement‑focused, and tailored to your role.
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
                      Just enter your job title and company, then hit "Generate Bullet." The tool will instantly return a suggested line. If you want something different, regenerate until it feels right. When you're satisfied, apply the suggestions.
                    </p>
                  </div>
                </div>
                <div className="margin-top margin-small">
                  <div className="faq-item">
                    <div className="margin-bottom margin-xsmall mb-3">
                      <div className="text-size-medium-61 text-weight-semibold text-color-gray900 text-lg font-semibold text-gray-900">
                        Can I customize the bullet point after it's generated?
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Yes. Every bullet is editable. You can reword any part, add data or accomplishments, or adjust the tone. You're in full control, and the tool helps you get 90% there instantly.
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
                      Nope. Just job title and company. If you want to include specific tasks or achievements, you can, but it's not required (although recommended). The AI is designed to work with minimal input, but the more detailed your input, the better the output.
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
                      <Link href="/sign-up" className="text-amber-600 hover:text-amber-700">
                        Once you find a version you like, click Apply Suggestion. This adds it to your resume so you can keep building without missing a beat.
                      </Link>
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
                      <Link href="/sign-up" className="text-amber-600 hover:text-amber-700">
                        Yes, you can generate and re‑generate bullet points for free. There's no cost to use the core functionality.
                      </Link>
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
                      <Link href="/sign-up" className="text-amber-600 hover:text-amber-700">
                        Yes, it works across all industries: tech, healthcare, education, retail, you name it. The AI adapts to different job types and tones depending on your input.
                      </Link>
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