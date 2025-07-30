// app/keyword-scanner/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Target, AlertCircle, TrendingUp, PlayCircle, Star, Zap, Shield, Sparkles } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';

export default function KeywordScannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Enhanced Hero Section */}
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
                <span className="text-gray-900">Resume Keyword Scanner</span>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  AI Keyword Scanner for Your Resume
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Scan your resume for relevant keywords based on the job you&apos;re applying for. Automatically add the right phrases to navigate ATS, impress recruiters, and land you more interviews.
                </p>
                <div className="pt-4">
                  <Link 
                    href="/sign-up" 
                    className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors inline-block"
                  >
                    Scan my resume
                  </Link>
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Image
                        src="/images/keyword-scanner/gauge.svg"
                        alt="Scanner Icon"
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
                {/* Keyword Tailoring Interface - Top Left */}
                <div className="absolute -top-4 -left-8 w-48 h-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/keyword-scanner/keyword-tailoring-interface.png"
                    alt="Keyword Tailoring Interface"
                    width={560}
                    height={566}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Main Charles Schwab Resume - Center */}
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <Image
                    src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                    alt="Charles Schwab Resume"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Keyword Targeting Interface - Bottom Right (Tall) */}
                <div className="absolute -bottom-8 -right-6 w-40 h-80 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20">
                  <Image
                    src="/images/keyword-scanner/keyword-targeting-interface.png"
                    alt="Keyword Targeting Interface"
                    width={560}
                    height={1170}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Strategic Keywords Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                <div className="text-center">
                  <div className="mb-2">
                    <div className="text-amber-500 font-semibold text-sm uppercase tracking-wide">
                      Right keywords = more job offers
                    </div>
                  </div>
                  <div className="mb-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                      Use Strategic Keywords for Every Single Resume
                    </h2>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-8">
                    <div className="relative mb-6 h-96">
                      <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                        {/* Main Resume Document */}
                        <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                          <Image
                            src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                            alt="Charles Schwab Resume"
                            width={400}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Target Job Posting Overlay */}
                        <div className="absolute top-8 -left-4 w-48 h-24 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                          <Image
                            src="/images/keyword-scanner/target-job-posting.svg"
                            alt="Target Job Posting"
                            width={180}
                            height={100}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        Contextual Keyword Matching
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Paste any job description and see what keywords your resume is missing. Add keywords strategically with a single click.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-8">
                    <div className="relative mb-6 h-96">
                      <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                        {/* Main Resume Document */}
                        <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                          <Image
                            src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                            alt="Charles Schwab Resume"
                            width={400}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Untailored Overlay - Top */}
                        <div className="absolute top-8 -left-4 w-32 h-20 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                          <Image
                            src="/images/keyword-scanner/untailored.svg"
                            alt="Untailored Resume"
                            width={120}
                            height={80}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {/* Tailored Overlay - Bottom Right */}
                        <div className="absolute bottom-4 -right-4 w-32 h-20 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                          <Image
                            src="/images/keyword-scanner/tailored.svg"
                            alt="Tailored Resume"
                            width={120}
                            height={80}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        Industry-Specific Language
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Score bonus points for using the exact phrases and wording employers across top companies want to see.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-8">
                    <div className="relative mb-6 h-96">
                      <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                        {/* Main Resume Document */}
                        <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                          <Image
                            src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                            alt="Charles Schwab Resume"
                            width={400}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* AI Keyword Tailoring Overlay - Top */}
                        <div className="absolute top-8 -left-4 w-40 h-24 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                          <Image
                            src="/images/keyword-scanner/ai-keyword-tailoring.svg"
                            alt="AI Keyword Tailoring"
                            width={160}
                            height={96}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {/* Score Overlay - Bottom Right */}
                        <div className="absolute bottom-4 -right-4 w-16 h-16 bg-white rounded-full shadow-xl border border-gray-200 p-2 z-10">
                          <Image
                            src="/images/keyword-scanner/score.svg"
                            alt="Score"
                            width={60}
                            height={60}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        Natural Integration into Content
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      The smart Rezi AI make sure your resume reads naturally. This isn&apos;t keyword stuffing, it&apos;s professional rephrasing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 text-center">
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors inline-block"
                >
                  Scan my resume for free
                </Link>
              </div>
            </div>
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
                <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">Step-by-step walkthrough</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Resume Keyword Scanner: How It Works
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
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                    Step 1
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    Upload your resume
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  If you have an existing resume, upload it to Rezi (as a bonus, we&apos;ll perfectly auto-format it). If you don&apos;t have one, with our builder you&apos;ll create a new resume in under 10 minutes.
                  <br /><br />
                  Alternatively, use the LinkedIn profile import feature to get a resume based on your LinkedIn with a single click.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-green-600 transition-colors inline-block">
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Resume */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Charles Schwab Resume"
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    {/* Upload Interface Overlay */}
                    <div className="absolute top-0 left-0 -ml-8 -mt-8 w-3/4 h-3/4 z-20">
                      <Image
                        src="/images/keyword-scanner/upload-interface.svg"
                        alt="Upload Interface"
                        width={300}
                        height={200}
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
                    Add your job description
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  You can either choose a job from the Rezi AI Job Search database or just paste the job ad from wherever you found it.
                  <br /><br />
                  The Keyword Scanner will analyze how well your resume matches the requirements of this particular job.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-green-600 transition-colors inline-block">
                    Try it free
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
                    {/* Background Resume */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Charles Schwab Resume"
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    {/* Target Job Posting Overlay */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-8 w-1/2 h-1/3 z-20">
                      <Image
                        src="/images/keyword-scanner/target-job-posting.svg"
                        alt="Target Job Posting"
                        width={200}
                        height={120}
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
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                    Step 3
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    Pick keywords to add to the resume
                  </h3>
                </div>
                <p className="text-base lg:text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                  We&apos;ll highlight the most impactful terms from the job description. Rezi uses this data to suggest missing keywords and can even generate new bullet points using AI.
                  <br /><br />
                  This helps you naturally incorporate those terms into your resume—ensuring a stronger match with the role you&apos;re targeting.
                </p>
                <div>
                  <Link href="/sign-up" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-green-600 transition-colors inline-block">
                    Try it free
                  </Link>
                </div>
              </div>
              <div className="relative bg-navy-900 p-6 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative max-w-lg">
                  {/* Floating UI Element */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Background Resume */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Image
                        src="/images/keyword-scanner/charles-schwab-resume-stacked.png"
                        alt="Charles Schwab Resume"
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    {/* Keyword Selection Overlay */}
                    <div className="absolute top-0 left-0 -mt-32 -ml-16 w-[110%] h-[110%] z-20">
                      <Image
                        src="/images/keyword-scanner/untailored.svg"
                        alt="Keyword Selection Interface"
                        width={400}
                        height={300}
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

      {/* Technical Deep Dive Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It *Actually* Works (For The Tech-Curious)
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Sidebar - Upload Component */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-full mb-4">
                      <Image
                        src="/images/keyword-scanner/resume-analyzer-interface.png"
                        alt="Resume Analyzer Interface"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Advanced Semantic Analysis Through Deep Learning Architecture
                </h2>
                <p className="mb-6">
                  Our keyword scanner employs cutting-edge natural language processing that goes beyond simple word matching. We&apos;ve built a comprehensive system that interprets job descriptions with the analytical depth of a seasoned hiring manager combined with the processing power of advanced AI, ensuring your resume aligns perfectly with employer expectations.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Our System Mimics Expert Talent Acquisition
                </h3>
                <p className="mb-6">
                  We utilize a comprehensive <strong>semantic understanding framework</strong>, where the analysis process unfolds through interconnected layers that operate simultaneously. Imagine how a top-tier talent acquisition specialist would dissect a job posting—but with the reliability and depth that only machine learning can deliver.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Four-Layer Analysis Framework
                </h3>

                <p className="mb-4">
                  <strong>Layer 1: Document Structure & Intent Recognition</strong><br />
                  Our AI begins by parsing the job description into distinct semantic blocks: organizational context, position requirements, desired qualifications, and procedural details. It also identifies posting patterns and industry-specific language conventions for enhanced accuracy across diverse sectors.
                </p>

                <p className="mb-4">
                  <strong>Layer 2: Concurrent Analysis - Term Extraction & Relevance Weighting</strong><br />
                  Through parallel computational processes, our system concurrently:<br />
                  - Identifies keyword-dense passages within position requirements<br />
                  - Calculates relevance weights for twelve distinct skill categories based on role context
                </p>

                <p className="mb-4">
                  <strong>Layer 3: Semantic Expansion & Disambiguation</strong><br />
                  This is where our system truly excels. When encountering complex phrases like &ldquo;financial modeling, forecasting and risk assessment,&ldquo; it intelligently separates them into distinct, actionable keywords: &ldquo;financial modeling,&ldquo; &ldquo;financial forecasting,&ldquo; and &ldquo;risk assessment.&ldquo; This prevents missed opportunities due to varied formatting approaches.
                </p>

                <p className="mb-6">
                  <strong>Layer 4: Hierarchical Classification with Impact Scoring</strong><br />
                  Each identified keyword receives classification into one of twelve strategic categories that we&apos;ve determined are essential for contemporary recruitment, with every keyword assigned an impact score from 1-4 where 4 represents critical requirements, 3 indicates strong preferences, 2 suggests moderate relevance, and 1 denotes supplementary qualifications.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Our Twelve Strategic Categories:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Technical Proficiencies</strong> - Programming languages, software platforms, and specialized technical tools</li>
                    <li><strong>Process Frameworks</strong> - Operational methodologies, project management approaches, and systematic workflows</li>
                    <li><strong>Educational Credentials</strong> - Degree requirements, academic specializations, and institutional qualifications</li>
                    <li><strong>Industry Certifications</strong> - Professional credentials, specialized training, and competency validations</li>
                    <li><strong>Leadership Capabilities</strong> - Team management, strategic oversight, and organizational influence</li>
                    <li><strong>Sector Expertise</strong> - Industry knowledge, market understanding, and domain specialization</li>
                    <li><strong>Core Competencies</strong> - Fundamental skills, adaptable abilities, and cross-functional strengths</li>
                    <li><strong>Seniority Indicators</strong> - Experience levels, career progression markers, and responsibility scope</li>
                    <li><strong>Compliance & Governance</strong> - Regulatory knowledge, legal requirements, and risk management</li>
                    <li><strong>Performance Orientation</strong> - Achievement metrics, outcome focus, and results-driven capabilities</li>
                    <li><strong>Communication Skills</strong> - Interpersonal abilities, presentation skills, and stakeholder engagement</li>
                    <li><strong>Innovation & Strategy</strong> - Creative thinking, strategic planning, and business development</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  The Science of Intelligent Prioritization
                </h2>
                <p className="mb-6">
                  What distinguishes our platform is our sophisticated prioritization methodology. We don&apos;t merely locate keywords—we comprehend their strategic significance through our advanced ranking algorithms:
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Dynamic Category Weighting
                </h3>
                <p className="mb-4">
                  Our AI calculates category importance scores specific to each position. For instance, &ldquo;Technical Proficiencies&ldquo; will score significantly higher for a Software Engineer role than &ldquo;Educational Credentials.&ldquo; This targeted approach ensures you optimize your resume where it will generate maximum impact for each unique opportunity.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Granular Impact Assessment
                </h3>
                <p className="mb-4">
                  Within each category, keywords receive detailed impact scores from 1-4:<br />
                  - <strong>Score 4</strong>: Mission-critical requirement - absolutely essential for consideration<br />
                  - <strong>Score 3</strong>: High-priority preference - significantly advantageous<br />
                  - <strong>Score 2</strong>: Moderate relevance - valuable addition<br />
                  - <strong>Score 1</strong>: Supplementary qualification - useful but not essential
                </p>

                <p className="mb-6">
                  For a data science position, &ldquo;Python&ldquo; might receive an impact score of 4 (mission-critical) while &ldquo;R&ldquo; receives a score of 2 (moderate relevance), despite both appearing in the job description. This detailed understanding enables strategic emphasis of the most impactful qualifications.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Practical Implementation
                </h3>
                <p className="mb-4">
                  Our keyword optimization engine delivers results ordered by category significance first, then by individual keyword impact scores within categories—both rankings are calculated dynamically for each specific job analysis. This ensures every recommendation is position-specific, not template-based.
                </p>

                <p>
                  The system processes all keywords through rigorous validation protocols, eliminating overly broad terms and ensuring each recommendation is precise and actionable. Keywords undergo automatic refinement to remove diluting modifiers, concentrating on the core terms that applicant tracking systems are most likely to recognize and weight favorably.
                </p>
              </div>
            </div>
          </div>
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
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
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
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
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
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
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
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <Star key={i + 3} className="w-4 h-4 text-gray-300" />
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
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-2">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Support</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions (AI Resume Keyword Scanner)
            </h2>
          </div>

          <div className="grid gap-8">
            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  What is an AI resume keyword scanner and how can it help my job search?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                An AI resume keyword scanner is a tool that analyzes a job posting and your resume, identifies the key terms and skills the employer is looking for, and shows you which of those keywords are missing. By suggesting relevant keywords to add, it helps ensure your resume is tailored to the job and passes Applicant Tracking Systems (ATS). Including the right keywords makes your resume more visible to recruiters, since ATS software typically auto-rejects resumes that don&apos;t match the job description.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  How do I use the resume keyword scanner to optimize my resume?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Simply upload your current resume (or paste it) and paste the job description for the position you&apos;re targeting. The tool will quickly compare the two and give you instant feedback. In a few seconds, you&apos;ll receive a detailed analysis that highlights which relevant keywords you already have and which important ones are missing. It will break down the suggestions (often as &ldquo;High Priority&ldquo; keywords vs. other keywords) so you can easily add them to your resume for that specific job.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Which keywords should I include in my resume?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Focus on concrete, job-specific terms from the job description. These often include the exact job title and required hard skills (like specific software, technical abilities, tools or certifications). For example, if a posting asks for &ldquo;Project Manager&ldquo; or skills like &ldquo;Python&ldquo; or &ldquo;CPA,&ldquo; those should appear on your resume. You should include the job title near the top of your resume (data shows candidates who do this are over ten times more likely to get an interview). Use the exact wording from the posting for software names or qualifications. Avoid vague buzzwords (e.g. &ldquo;hardworking&ldquo; or &ldquo;team player&ldquo;), as ATS filters ignore those.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Why are resume keywords so important, and how do they affect my chances of getting hired?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Keywords drive ATS filters: most companies use ATS to screen resumes, so if your resume lacks the right keywords, it may never be seen by a human recruiter. In fact, studies show about 88% of qualified candidates are filtered out by ATS if they don&apos;t precisely match the job description. One report found 99.7% of Fortune 500 recruiters use keyword filters in their ATS. Having an ATS-friendly resume with the right keywords ensures your resume doesn&apos;t get lost in the system. Tailoring keywords to the job therefore dramatically improves your chances of landing an interview.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Is the resume keyword scanner really free to use?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Yes, Kolab offers free keyword scanning capabilities to help job seekers optimize their resumes without any upfront cost.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Which industries or job roles can use the Kolab keyword scanner?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The tool works for <strong>any</strong> industry or job function. Although it&apos;s popular with tech, marketing, and customer-service applicants, it&apos;s designed to handle a wide range of fields. The AI identifies the key components that matter in your specific role, whether you&apos;re in engineering, finance, healthcare or any other sector. In short, any jobseeker can benefit from optimizing keywords for their particular position.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Do I need any special skills or knowledge to use the keyword scanner?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Not at all. The scanner is very user-friendly. You don&apos;t need any technical expertise. Simply provide your resume and a job description, the AI does the hard work. It will analyze your documents and give you clear, actionable feedback on which keywords to add. No coding or special resume-writing knowledge is required.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  How fast will I see results after scanning my resume?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Very quickly. The AI analysis is almost instant. You&apos;ll immediately see a report of missing keywords and suggestions, saving you from hours of manual searching and analysis.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Can I use the scanner multiple times for different jobs?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Yes. You can run as many scans as you need. It&apos;s especially useful to tailor your resume for each job application. For example, you might upload different versions of your resume or try different job descriptions. Resume scanning tools generally allow multiple uploads — you can test each resume version or job listing to see which keywords to emphasize. Using the scanner repeatedly (for each job you apply to) will help ensure every resume is as targeted as possible.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Will using this scanner really increase my chances of getting interviews?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. By adding the exact keywords that ATS and recruiters look for, you greatly improve the chance that your resume will be seen and shortlisted. Users report that aligning their resume to the job description leads to many more callbacks. For example, including a job&apos;s exact title in your resume can make you over 10 times more likely to get an interview. Resume scanners aim to make your resume <em>&ldquo;look like a match&ldquo;</em> to the employer — tools like this have helped jobseekers land more interviews and offers.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Is my resume data secure and private?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Yes. Resumes are scanned securely on our servers, not shared publicly, and are kept completely private to you. Kolab takes data security seriously and follows industry best practices to protect your information.
              </p>
            </div>

            <div className="faq-item">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Does it just stuff keywords into my resume? Will it still read naturally?
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                No — it doesn&apos;t blindly &ldquo;keyword-stuff.&ldquo; The AI is designed to integrate keywords in a natural, professional way. In fact, advice from ATS experts is to avoid obvious stuffing and focus on real skills and accomplishments. The keyword scanner suggests relevant terms and often provides context so you can weave them into your resume naturally. This way your resume remains easy to read for humans while still satisfying ATS filters.
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
