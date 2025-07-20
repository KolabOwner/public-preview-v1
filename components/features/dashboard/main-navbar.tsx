'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Zap, CheckCircle, Target, FileText, Mail, Search, Grid3X3 } from 'lucide-react';
import ResumeTargetingFlowchart from "@/components/shared/resume-targeting-flowchart";


const MainNavbar = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);


  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMouseEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Text */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Kolab
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* AI Resume Builder Direct Link */}
            <Link
              href="/ai-resume-builder"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/ai-resume-builder')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              AI Resume Builder
            </Link>

            {/* AI Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('ai-tools')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('ai-tools')}
              >
                AI Tools
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'ai-tools' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* AI Tools Dropdown Content */}
              {activeDropdown === 'ai-tools' && (
                <div className="absolute top-full left-0 w-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-transparent">
                  <div className="grid grid-cols-3 gap-6 p-6">
                    {/* Resume Tools Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Resume Tools</h4>
                      <div className="space-y-3">
                        <Link href="/ai-resume-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">AI Resume Builder</div>
                            <div className="text-sm text-gray-600">Smart resume creation</div>
                          </div>
                        </Link>

                        <Link href="/ai-resume-editor" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Checker</div>
                            <div className="text-sm text-gray-600">Get instant feedback</div>
                          </div>
                        </Link>

                        <Link href="/keyword-scanner" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Keyword Scanner</div>
                            <div className="text-sm text-gray-600">Target your application</div>
                          </div>
                        </Link>

                        <Link href="/resume-bullet-point-generator" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Bullet Point Writer</div>
                            <div className="text-sm text-gray-600">Stronger resume content</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Other Tools Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Other Tools</h4>
                      <div className="space-y-3">
                        <Link href="/ai-cover-letter-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Cover Letter Generator</div>
                            <div className="text-sm text-gray-600">Personalized cover letters</div>
                          </div>
                        </Link>

                        <Link href="/job-search" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Search className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Job Search</div>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">New!</span>
                            </div>
                            <div className="text-sm text-gray-600">Discover new opportunities</div>
                          </div>
                        </Link>

                        <Link href="/dashboard" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Grid3X3 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">View All Tools</div>
                            <div className="text-sm text-gray-600">Discover more tools</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* User Guides Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">User Guides</h4>
                      <div className="space-y-4">
                        <Link href="/docs/ai-keyword-targeting" className="block group">
                          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                            <ResumeTargetingFlowchart width={80} height={60} className="w-full h-full" />
                          </div>
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">How to Tailor a Resume to a Job Posting</div>
                          <div className="text-xs text-gray-600 mt-1">Tailor your resume by adding keywords from the job ad</div>
                        </Link>

                        <Link href="/resume-docs" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                          All user guides
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Examples & Templates Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('templates')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('templates')}
              >
                Examples & Templates
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'templates' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Templates Dropdown Content */}
              {activeDropdown === 'templates' && (
                <div className="absolute top-full left-0 w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-transparent">
                  <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Resume Examples Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Resume Examples</h4>
                      <div className="space-y-3">
                        <Link href="/resume-templates" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Templates/Formats</div>
                            <div className="text-sm text-gray-600">Explore Kolab&apos;s loved resume formats</div>
                          </div>
                        </Link>

                        <Link href="/resume-examples" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Grid3X3 className="w-4 h-4 text-pink-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Examples</div>
                            <div className="text-sm text-gray-600">Get inspired by excellent resumes</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Other Examples Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Other Examples</h4>
                      <div className="space-y-3">
                        <Link href="/cover-letter-templates" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 mt-0.5 mr-3 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Cover Letter Templates/Examples</div>
                            <div className="text-sm text-gray-600">Effective cover letter samples</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Bottom section with featured content */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded mr-3 flex items-center justify-center">
                          <FileText className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">The Best Resume Format</div>
                          <div className="text-xs text-gray-600">How to format a resume the right way!</div>
                        </div>
                      </div>
                      <Link href="/blog" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        All blog posts →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('pricing')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('pricing')}
              >
                Pricing
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'pricing' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Pricing Dropdown Content */}
              {activeDropdown === 'pricing' && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-transparent">
                  <div className="p-4 space-y-3">
                    <Link href="/pricing" className="group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Job Seekers</div>
                        <div className="text-sm text-gray-600">Free to get started, no card required.</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/ai-resume-builder"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Free Resume
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/ai-resume-builder" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                AI Resume Builder
              </Link>
              <Link href="/resume-templates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Templates
              </Link>
              <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Pricing
              </Link>
              <Link href="/sign-in" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Log in
              </Link>
              <Link href="/ai-resume-builder" className="block px-3 py-2 bg-blue-600 text-white rounded-md text-base font-medium text-center">
                Create Free Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;
