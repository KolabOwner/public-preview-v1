// app/keyword-scanner/page.tsx
import React from 'react';
import { Search, CheckCircle, Target, AlertCircle, TrendingUp, PlayCircle, Star, Zap, Shield } from 'lucide-react';
import MainNavbar from '@/components/layout/main-navbar';

export default function KeywordScannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      {/* Header/Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Free Resume Scanner
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Resume Keyword Scanner
              <span className="text-green-600 block">& ATS Optimizer</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Analyze your resume against job descriptions to identify missing keywords
              and optimize for Applicant Tracking Systems. Get hired faster with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                Scan Your Resume Free
              </button>
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg border border-green-600 hover:bg-green-50 transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Helping professionals land interviews at top companies</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">Salesforce</div>
                <div className="text-2xl font-bold text-gray-400">Netflix</div>
                <div className="text-2xl font-bold text-gray-400">Intel</div>
                <div className="text-2xl font-bold text-gray-400">Cisco</div>
                <div className="text-2xl font-bold text-gray-400">Uber</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-2xl p-8 shadow-xl">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">See How Keyword Scanning Works</p>
                <p className="text-sm text-gray-500 mt-2">2-minute demonstration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Optimize Your Resume in
              <span className="text-green-600 block">Two Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent scanner helps you align your resume with job requirements,
              ensuring you never miss important keywords.
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-green-600">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Input Job Description</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Paste the job posting you're targeting. Our AI analyzes the requirements,
                skills, and keywords that matter most to recruiters and ATS systems.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Automatic keyword extraction</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Industry-specific term identification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Skills and requirements mapping</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Description
                </label>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "We are seeking a Senior Product Manager with experience in agile methodologies,
                    data analytics, and stakeholder management. The ideal candidate will have 5+ years
                    of experience in SaaS products, strong SQL skills, and proven track record of
                    launching successful features..."
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Detected Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Product Manager</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Agile</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Data Analytics</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">SQL</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">SaaS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Keyword Match Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Overall Match Score</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600 mr-2">78%</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Agile methodologies</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data analytics</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SQL skills</span>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stakeholder management</span>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors text-sm">
                View Detailed Report
              </button>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Get Optimization Insights</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Receive a detailed analysis showing which keywords you're missing and where
                to add them. Our scanner provides actionable recommendations to improve your match rate.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Match score percentage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Missing keyword identification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Placement recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Features for
              <span className="text-green-600 block">Resume Optimization</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ATS Compatibility Check</h3>
              <p className="text-gray-600">
                Ensure your resume format and content are optimized for Applicant Tracking Systems
                used by 95% of large companies.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Scoring</h3>
              <p className="text-gray-600">
                Get instant feedback with our match percentage score that updates as you
                optimize your resume content.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry Best Practices</h3>
              <p className="text-gray-600">
                Recommendations based on successful resumes in your industry, ensuring
                you use the right terminology and focus areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Impact of Keyword Optimization
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Data shows that resumes optimized with the right keywords get significantly more attention
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">75%</div>
              <p className="text-green-100">of resumes never reach human eyes due to ATS filtering</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.2x</div>
              <p className="text-green-100">more likely to get interviews with optimized keywords</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">90%</div>
              <p className="text-green-100">of Fortune 500 companies use ATS systems</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">63%</div>
              <p className="text-green-100">increase in response rate with proper optimization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-12 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-center">
              <p className="text-2xl font-semibold text-gray-900 mb-8">
                "The keyword scanner was eye-opening. I realized I was missing critical terms
                that recruiters were looking for. After optimization, I went from zero responses
                to 5 interviews in two weeks."
              </p>
              <footer>
                <div className="font-semibold text-gray-900 mb-1">David Thompson</div>
                <div className="text-gray-600 mb-4">Data Analyst</div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">Now working at</span>
                  <span className="ml-2 font-semibold text-gray-700">Spotify</span>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How does the keyword scanner work?
              </h3>
              <p className="text-gray-600">
                Our scanner uses natural language processing to analyze job descriptions and extract
                relevant keywords, skills, and requirements. It then compares these against your resume
                to identify gaps and opportunities for optimization.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Is keyword stuffing a good strategy?
              </h3>
              <p className="text-gray-600">
                No. Our scanner helps you naturally incorporate relevant keywords into your existing
                content. We focus on meaningful integration that maintains readability while ensuring
                ATS compatibility.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How accurate is the matching algorithm?
              </h3>
              <p className="text-gray-600">
                Our algorithm is trained on millions of successful job applications and continuously
                updated. It considers synonyms, related terms, and industry-specific variations to
                provide comprehensive matching.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I scan multiple job descriptions?
              </h3>
              <p className="text-gray-600">
                Yes! You can scan unlimited job descriptions with a free account. This helps you
                tailor your resume for different positions and understand common requirements in
                your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop Getting Filtered Out by ATS Systems
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of job seekers who've improved their response rates with our scanner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Scan Resume Now - It's Free
            </button>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-green-600 transition-colors">
              Learn More
            </button>
          </div>
          <p className="mt-6 text-green-200">
            No sign-up required • Instant results • 100% free
          </p>
        </div>
      </section>
    </div>
  );
}
