import React from 'react';
import Link from 'next/link';
import { Star, Calendar, User, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Header/Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Career Blog
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The Official
              <span className="text-blue-600 block">Rezum Blog</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Take your resume, job search, and career to new heights with our blog! 
              Expert career advice, resume tips, and job search strategies.
            </p>
            
            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <Link href="/blog" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                View all
              </Link>
              <Link href="/topics/resume" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                Resume
              </Link>
              <Link href="/topics/cover-letter" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                Cover Letter
              </Link>
              <Link href="/topics/career-advice" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                Career Advice
              </Link>
              <Link href="/topics/interview" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                Interview
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Trusted career advice from industry experts</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-lg font-bold text-gray-400">1M+ Readers</div>
                <div className="text-lg font-bold text-gray-400">Expert Writers</div>
                <div className="text-lg font-bold text-gray-400">Updated Weekly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Featured Article</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-8">Latest Insights</h2>
            
            {/* Featured Article Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-24 mx-auto mb-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-500">Featured Article</div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Resume Tips
                    </span>
                    <span className="text-gray-500 text-sm ml-4">July 15, 2025</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    15 Creative Resume Templates and Examples (Design & Format)
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    How to write a creative resume? Learn how to make your resume more fun and unique 
                    with a touch of creativity, while keeping it professional.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm text-gray-600 font-medium">LB</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Lauren Bedford</div>
                        <div className="text-sm text-gray-500">Rezum Content Team</div>
                      </div>
                    </div>
                    
                    <Link href="/posts/creative-resume" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Articles</h2>
            <p className="text-xl text-gray-600">Stay updated with the latest career advice and industry insights</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">ATS Guide</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Resume Tips
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/ats-resume-examples">
                    25 ATS Resume Examples: Free Templates & Tips
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Looking for ATS resume examples? Download our free templates and get expert tips 
                  to help your resume pass Applicant Tracking Systems.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Lauren Bedford</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jul 10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Career Story</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Career Change
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/career-story-from-teacher-to-content-writer">
                    Career Story from Teacher to Content Writer & Lessons Learned
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Learn how to transition from teaching to content writing with real-world advice, 
                  a personal career change story, and 15 actionable tips.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Sarah Coghlan</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jul 8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Career Quiz</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Career Advice
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/how-to-choose-a-career">
                    How to Choose a Career: 10 Things to Consider (Free Quiz)
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Not sure what to do with your life? Learn how to choose a career that aligns 
                  with your skills, interests, and lifestyle goals.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Lauren Bedford</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jul 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Post 4 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Workplace</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Workplace
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/signs-your-boss-wants-you-to-quit">
                    12 Signs Your Boss Wants You to Quit Your Job
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Is your manager setting you up to fail or picking on you? Uncover the key signs 
                  your boss wants you to quit and what you can do.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Lauren Bedford</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jul 3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Post 5 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Resignation</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Resignation
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/how-to-tell-your-boss-youre-quitting">
                    How to Tell Your Boss You&apos;re Quitting & What to Say
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Learn the professional way to resign from your job with scripts, timing tips, 
                  and best practices for maintaining good relationships.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Sarah Coghlan</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jul 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Post 6 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Career Change</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Career Change
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href="/posts/how-to-change-careers">
                    How to Change Careers: 10 Steps for Switching Jobs
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Discover how to change careers, covering everything from identifying your passion 
                  to building experience for a successful job switch.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>Lauren Bedford</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Jun 28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Career Tips
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get the latest career advice, resume tips, and job search strategies delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No spam. Unsubscribe at any time.
            </p>
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
            Apply what you&apos;ve learned from our blog and create a resume that gets results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-resume-builder" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Build Your Resume
            </Link>
            <Link href="/resume-examples" className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-blue-600 transition-colors">
              View Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}